import { AnalysisConfig, RepositoryAnalysis, AnalysisProgress, FileAnalysis, FunctionInfo, ClassInfo, ImportInfo, ExportInfo, ComplexityMetrics, CriticalPath } from './types';
import * as fs from 'fs';
import * as path from 'path';
import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';
import { analyzeDependencyGraph } from './modules/dependencyGraph';
import { analyzeComplexity } from './modules/complexity';

export class AnalysisEngine {
  private config: AnalysisConfig;
  private progressCallback?: (progress: AnalysisProgress) => void;

  constructor(config: AnalysisConfig) {
    this.config = config;
  }

  setProgressCallback(callback: (progress: AnalysisProgress) => void) {
    this.progressCallback = callback;
  }

  async analyzeRepository(repoPath: string): Promise<RepositoryAnalysis> {
    // 1. Scan files
    this.updateProgress('parsing', 10, 'Scanning files...');
    const files = await this.scanFiles(repoPath);

    // 2. Parse files
    this.updateProgress('parsing', 30, 'Parsing files...');
    const parsedFiles = await this.parseFiles(files);

    // 3. Analyze each file
    this.updateProgress('analyzing', 60, 'Analyzing files...');
    const fileAnalyses: FileAnalysis[] = [];
    for (const { path: filePath, ast } of parsedFiles) {
      try {
        fileAnalyses.push(this.analyzeAST(filePath, ast));
      } catch (e) {
        // Skip files that fail to analyze
        continue;
      }
    }

    // 4. Dependency graph/component analysis
    const { components, relationships } = analyzeDependencyGraph(fileAnalyses);

    // 5. Complexity analysis (repo-level)
    const repoComplexity = analyzeComplexity(fileAnalyses);

    // 6. Critical path detection: top 5 most complex files
    const sortedFiles = [...fileAnalyses].sort((a, b) => b.complexity.cyclomatic - a.complexity.cyclomatic);
    const criticalPaths: CriticalPath[] = sortedFiles.slice(0, 5).map(file => ({
      name: `High Complexity: ${path.basename(file.path)}`,
      files: [file.path],
      importance: Math.min(100, file.complexity.cyclomatic * 10),
      complexity: file.complexity.cyclomatic,
      description: `File with high cyclomatic complexity (${file.complexity.cyclomatic})`
    }));

    // 7. Aggregate results
    this.updateProgress('complete', 100, 'Analysis complete!');
    return {
      repository: repoPath,
      files: fileAnalyses,
      architecture: { components, relationships },
      criticalPaths,
      timestamp: new Date()
    };
  }

  private updateProgress(stage: AnalysisProgress['stage'], progress: number, message: string, currentFile?: string) {
    if (this.progressCallback) {
      this.progressCallback({ stage, progress, message, currentFile });
    }
  }

  // Recursively scan for source files, respecting ignorePatterns
  private async scanFiles(dir: string): Promise<string[]> {
    const results: string[] = [];
    const ignore = new Set(this.config.ignorePatterns);
    const exts = ['.js', '.jsx', '.ts', '.tsx'];
    const maxFileSize = this.config.maxFileSize || 1024 * 1024;
    async function walk(current: string) {
      const items = await fs.promises.readdir(current);
      for (const item of items) {
        const fullPath = path.join(current, item);
        const stat = await fs.promises.stat(fullPath);
        if (stat.isDirectory()) {
          if (ignore.has(item)) continue;
          await walk(fullPath);
        } else if (stat.isFile()) {
          if (exts.includes(path.extname(item)) && stat.size <= maxFileSize) {
            results.push(fullPath);
          }
        }
      }
    }
    await walk(dir);
    return results;
  }

  // Parse a single file to AST using Babel
  private async parseFile(filePath: string): Promise<{ path: string; ast: any }> {
    const content = await fs.promises.readFile(filePath, 'utf-8');
    const ast = parser.parse(content, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript']
    });
    return { path: filePath, ast };
  }

  // Parse all files to ASTs
  private async parseFiles(files: string[]): Promise<{ path: string; ast: any }[]> {
    const parsed: { path: string; ast: any }[] = [];
    for (const file of files) {
      try {
        parsed.push(await this.parseFile(file));
      } catch (e) {
        // Skip files that fail to parse
        continue;
      }
    }
    return parsed;
  }

  // Analyze a parsed AST and extract file-level info
  private analyzeAST(filePath: string, ast: any): FileAnalysis {
    const functions: FunctionInfo[] = [];
    const classes: ClassInfo[] = [];
    const imports: ImportInfo[] = [];
    const exports: ExportInfo[] = [];
    const dependencies: string[] = [];
    let lines = 0;
    let size = 0;
    // Calculate cyclomatic complexity for the file
    let cyclomatic = 1;
    traverse(ast, {
      IfStatement() { cyclomatic++; },
      ForStatement() { cyclomatic++; },
      WhileStatement() { cyclomatic++; },
      DoWhileStatement() { cyclomatic++; },
      SwitchCase() { cyclomatic++; },
      CatchClause() { cyclomatic++; },
      LogicalExpression(path) {
        if (path.node.operator === '&&' || path.node.operator === '||') cyclomatic++;
      },
      FunctionDeclaration(path) {
        functions.push({
          name: path.node.id ? path.node.id.name : 'anonymous',
          line: path.node.loc?.start.line || 0,
          endLine: path.node.loc?.end.line || 0,
          parameters: path.node.params.map((p: any) => p.name || 'param'),
          returnType: undefined,
          complexity: 1, // Could be improved per-function
          calls: [],
          calledBy: []
        });
      },
      ClassDeclaration(path) {
        classes.push({
          name: path.node.id ? path.node.id.name : 'anonymous',
          line: path.node.loc?.start.line || 0,
          endLine: path.node.loc?.end.line || 0,
          methods: [],
          properties: [],
          extends: (path.node.superClass && t.isIdentifier(path.node.superClass)) ? path.node.superClass.name : undefined,
          implements: [],
          complexity: 1
        });
      },
      ImportDeclaration(path) {
        imports.push({
          module: path.node.source.value,
          imports: path.node.specifiers.map(s => s.local.name),
          line: path.node.loc?.start.line || 0,
          isDefault: path.node.specifiers.some(s => t.isImportDefaultSpecifier(s))
        });
        dependencies.push(path.node.source.value);
      },
      ExportNamedDeclaration(path) {
        if (path.node.declaration && t.isFunctionDeclaration(path.node.declaration)) {
          exports.push({
            name: path.node.declaration.id ? path.node.declaration.id.name : 'anonymous',
            line: path.node.declaration.loc?.start.line || 0,
            type: 'function'
          });
        } else if (path.node.declaration && t.isClassDeclaration(path.node.declaration)) {
          exports.push({
            name: path.node.declaration.id ? path.node.declaration.id.name : 'anonymous',
            line: path.node.declaration.loc?.start.line || 0,
            type: 'class'
          });
        }
      },
      ExportDefaultDeclaration(path) {
        exports.push({
          name: 'default',
          line: path.node.loc?.start.line || 0,
          type: 'default'
        });
      }
    });

    // Estimate lines and size
    if (ast.loc) {
      lines = ast.loc.end.line;
    }
    // File size will be set to 0 for now (could be set from fs.stat if needed)

    return {
      path: filePath,
      language: path.extname(filePath).substring(1),
      size,
      lines,
      functions,
      classes,
      imports,
      exports,
      complexity: { cyclomatic, cognitive: cyclomatic, maintainability: Math.max(0, 100 - cyclomatic * 2) },
      dependencies
    };
  }
} 