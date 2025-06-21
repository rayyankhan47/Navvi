// Core analysis engine for Navvi
// This is the foundation that makes Navvi NOT a GPT wrapper

import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';
import fs from 'fs';
import path from 'path';
import { simpleGit, SimpleGit } from 'simple-git';
import os from 'os';
import {
  FileAnalysis,
  FunctionInfo,
  ClassInfo,
  MethodInfo,
  PropertyInfo,
  ImportInfo,
  ExportInfo,
  ComplexityMetrics,
  ComponentAnalysis,
  ArchitectureAnalysis,
  Relationship,
  CriticalPath,
  RepositoryAnalysis,
  RepositoryMetrics,
  AnalysisConfig,
  AnalysisProgress
} from '../types/analysis';

export class AnalysisEngine {
  private config: AnalysisConfig;
  private progressCallback?: (progress: AnalysisProgress) => void;
  private git: SimpleGit;
  private tempDir: string;
  private accessToken?: string;
  private repoRoot: string = '';

  constructor(config: AnalysisConfig = {
    languages: ['javascript', 'typescript', 'jsx', 'tsx'],
    maxFileSize: 1024 * 1024, // 1MB
    ignorePatterns: ['node_modules', '.git', 'dist', 'build'],
    complexityThreshold: 10,
    includeTests: false,
    includeNodeModules: false
  }, accessToken?: string) {
    this.config = config;
    this.git = simpleGit();
    this.tempDir = path.join(os.tmpdir(), 'navvi-analysis');
    this.accessToken = accessToken;
  }

  setProgressCallback(callback: (progress: AnalysisProgress) => void) {
    this.progressCallback = callback;
  }

  private updateProgress(stage: AnalysisProgress['stage'], progress: number, message: string, currentFile?: string) {
    if (this.progressCallback) {
      this.progressCallback({
        stage,
        progress,
        message,
        currentFile
      });
    }
  }

  async analyzeRepository(repoUrl: string): Promise<RepositoryAnalysis> {
    this.updateProgress('cloning', 0, 'Cloning repository...');
    
    try {
      // Create temp directory if it doesn't exist
      if (!fs.existsSync(this.tempDir)) {
        fs.mkdirSync(this.tempDir, { recursive: true });
      }

      // Generate unique directory name for this analysis
      const repoName = this.extractRepoName(repoUrl);
      const analysisDir = path.join(this.tempDir, `${repoName}-${Date.now()}`);
      this.repoRoot = analysisDir;
      
      this.updateProgress('cloning', 20, `Cloning ${repoName}...`);
      
      console.log(`Attempting to clone repository: ${repoUrl} to ${analysisDir}`);
      
      // Clone the repository
      try {
        if (this.accessToken) {
          // For private repositories, use the access token
          const authUrl = repoUrl.replace('https://github.com/', `https://${this.accessToken}@github.com/`);
          console.log('Using authenticated URL for private repository');
          await this.git.clone(authUrl, analysisDir);
        } else {
          // For public repositories, use the regular URL
          await this.git.clone(repoUrl, analysisDir);
        }
        console.log(`Successfully cloned repository to: ${analysisDir}`);
      } catch (cloneError) {
        console.error('Git clone failed:', cloneError);
        throw new Error(`Failed to clone repository: ${cloneError}`);
      }
      
      this.updateProgress('parsing', 40, 'Scanning files...');
      
      // Scan for files to analyze
      const files = await this.scanFiles(analysisDir);
      console.log(`[scanFiles] Found ${files.length} files to analyze:`);
      files.forEach(f => console.log('  -', this.toRepoPath(f)));
      
      if (files.length === 0) {
        console.warn('No supported files found in repository');
        // Return empty analysis instead of failing
        return {
          repository: repoName,
          files: [],
          architecture: {
            components: [],
            relationships: [],
            layers: [],
            patterns: [],
            dataFlow: []
          },
          criticalPaths: [],
          metrics: {
            totalFiles: 0,
            totalLines: 0,
            languages: {},
            averageComplexity: 0,
            maxComplexity: 0,
            maintainabilityIndex: 100,
            technicalDebt: 0
          },
          insights: {
            architecturalStyle: 'Unknown',
            codeQuality: 'Unknown',
            complexityDistribution: 'No supported files found',
            potentialIssues: ['Repository contains no supported file types'],
            recommendations: ['Add JavaScript, TypeScript, JSX, or TSX files'],
            learningPath: {
              difficulty: 'beginner',
              estimatedTime: 0,
              modules: [],
              prerequisites: []
            }
          },
          timestamp: new Date()
        };
      }
      
      this.updateProgress('analyzing', 60, `Analyzing ${files.length} files...`);
      
      // Analyze each file
      const fileAnalyses: FileAnalysis[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        this.updateProgress('analyzing', 60 + (i / files.length) * 20, `Analyzing ${path.basename(file)}...`, file);
        
        try {
          const analysis = await this.analyzeFile(file);
          if (analysis) {
            // Normalize file path to repo-relative immediately
            analysis.path = this.toRepoPath(analysis.path);
            fileAnalyses.push(analysis);
          }
        } catch (fileError) {
          console.warn(`[AST] Failed to analyze file ${this.toRepoPath(file)}:`, fileError);
          // Continue with other files instead of failing completely
        }
      }
      
      console.log(`Successfully analyzed ${fileAnalyses.length} out of ${files.length} files`);
      
      this.updateProgress('generating', 80, 'Generating architecture analysis...');
      
      // Generate architecture analysis
      const architecture = this.buildArchitecture(fileAnalyses);
      
      // Identify critical paths
      const criticalPaths = this.identifyCriticalPaths(fileAnalyses, architecture);
      
      // Calculate metrics
      const metrics = this.calculateMetrics(fileAnalyses);
      
      // Generate insights
      const insights = this.generateInsights(fileAnalyses, architecture, metrics);
      
      this.updateProgress('complete', 100, 'Analysis complete!');
      
      // Clean up temp directory
      this.cleanupTempDir(analysisDir);
      
      return {
        repository: repoName,
        files: fileAnalyses,
        architecture,
        criticalPaths,
        metrics,
        insights,
        timestamp: new Date()
      };
      
    } catch (error) {
      console.error('Repository analysis failed:', error);
      // Clean up temp directory on error
      try {
        if (fs.existsSync(this.tempDir)) {
          fs.rmSync(this.tempDir, { recursive: true, force: true });
        }
      } catch (cleanupError) {
        console.warn('Failed to cleanup temp directory:', cleanupError);
      }
      throw new Error(`Failed to analyze repository: ${error}`);
    }
  }

  private extractRepoName(repoUrl: string): string {
    // Extract repo name from various URL formats
    const match = repoUrl.match(/([^\/]+)\.git$|([^\/]+)$/);
    return match ? match[1] || match[2] : 'unknown-repo';
  }

  private async cleanupTempDir(dir: string) {
    try {
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
      }
    } catch (error) {
      console.warn('Failed to cleanup temp directory:', error);
    }
  }

  private toRepoPath(absPath: string): string {
    if (!this.repoRoot) return absPath;
    return absPath.replace(this.repoRoot + path.sep, '').replace(/\\/g, '/');
  }

  private async scanFiles(dir: string): Promise<string[]> {
    const files: string[] = [];
    const ignoredDirs: string[] = [];
    
    const scanDirectory = async (currentDir: string) => {
      const items = await fs.promises.readdir(currentDir);
      
      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = await fs.promises.stat(fullPath);
        
        if (stat.isDirectory()) {
          const shouldIgnore = this.config.ignorePatterns.some(pattern => 
            item === pattern || fullPath.includes(pattern)
          );
          if (shouldIgnore) {
            ignoredDirs.push(fullPath);
            console.log(`[scanFiles] Ignoring directory: ${fullPath}`);
          }
          if (!shouldIgnore) {
            await scanDirectory(fullPath);
          }
        } else if (stat.isFile()) {
          const ext = path.extname(item).toLowerCase();
          const isSupported = this.isSupportedFile(ext);
          if (isSupported && stat.size <= this.config.maxFileSize) {
            files.push(fullPath);
          } else if (!isSupported) {
            // Log skipped file extensions for debugging
            // console.log(`[scanFiles] Skipping unsupported file: ${fullPath}`);
          }
        }
      }
    };

    await scanDirectory(dir);
    return files;
  }

  private isSupportedFile(ext: string): boolean {
    // Add more extensions if needed
    const supportedExtensions = ['.js', '.ts', '.jsx', '.tsx', '.cjs', '.mjs'];
    return supportedExtensions.includes(ext);
  }

  private async analyzeFile(filePath: string): Promise<FileAnalysis | null> {
    try {
      const content = await fs.promises.readFile(filePath, 'utf-8');
      const ext = path.extname(filePath).toLowerCase();
      
      if (ext === '.js' || ext === '.jsx' || ext === '.mjs' || ext === '.cjs') {
        try {
          return this.analyzeJavaScriptFile(filePath, content);
        } catch (err) {
          console.warn(`[AST] Failed to parse JS file ${this.toRepoPath(filePath)}:`, err);
          return null;
        }
      } else if (ext === '.ts' || ext === '.tsx') {
        try {
          return this.analyzeTypeScriptFile(filePath, content);
        } catch (err) {
          console.warn(`[AST] Failed to parse TS file ${this.toRepoPath(filePath)}:`, err);
          return null;
        }
      }
      return null;
    } catch (error) {
      console.warn(`[IO] Failed to read file ${this.toRepoPath(filePath)}:`, error);
      return null;
    }
  }

  private async analyzeJavaScriptFile(filePath: string, content: string): Promise<FileAnalysis> {
    const ast = parser.parse(content, {
      sourceType: 'module',
      plugins: ['jsx']
    });

    return this.analyzeAST(filePath, content, ast);
  }

  private async analyzeTypeScriptFile(filePath: string, content: string): Promise<FileAnalysis> {
    const ast = parser.parse(content, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript']
    });

    return this.analyzeAST(filePath, content, ast);
  }

  private analyzeAST(filePath: string, content: string, ast: any): FileAnalysis {
    const functions: FunctionInfo[] = [];
    const classes: ClassInfo[] = [];
    const imports: ImportInfo[] = [];
    const exports: ExportInfo[] = [];
    const dependencies: string[] = [];

    traverse(ast, {
      FunctionDeclaration(path) {
        const func = path.node;
        functions.push({
          name: func.id?.name || 'anonymous',
          line: func.loc?.start.line || 0,
          endLine: func.loc?.end.line || 0,
          parameters: func.params.map(p => (p as any).name || 'param'),
          returnType: undefined,
          complexity: calculateFunctionComplexity(func),
          calls: [],
          calledBy: []
        });
      },

      FunctionExpression(path) {
        const func = path.node;
        if (func.id) {
          functions.push({
            name: func.id.name,
            line: func.loc?.start.line || 0,
            endLine: func.loc?.end.line || 0,
            parameters: func.params.map(p => (p as any).name || 'param'),
            returnType: undefined,
            complexity: calculateFunctionComplexity(func),
            calls: [],
            calledBy: []
          });
        }
      },

      ArrowFunctionExpression(path) {
        const func = path.node;
        // Only track named arrow functions
        if (path.parent && t.isVariableDeclarator(path.parent) && t.isIdentifier(path.parent.id)) {
          functions.push({
            name: path.parent.id.name,
            line: func.loc?.start.line || 0,
            endLine: func.loc?.end.line || 0,
            parameters: func.params.map(p => (p as any).name || 'param'),
            returnType: undefined,
            complexity: calculateFunctionComplexity(func),
            calls: [],
            calledBy: []
          });
        }
      },

      ClassDeclaration(path) {
        const cls = path.node;
        const methods: MethodInfo[] = [];
        const properties: PropertyInfo[] = [];

        cls.body.body.forEach(member => {
          if (t.isClassMethod(member)) {
            methods.push({
              name: (member.key as any).name || 'anonymous',
              line: member.loc?.start.line || 0,
              endLine: member.loc?.end.line || 0,
              parameters: member.params.map(p => (p as any).name || 'param'),
              returnType: undefined,
              complexity: calculateFunctionComplexity(member),
              visibility: member.kind === 'get' || member.kind === 'set' ? 'public' : 
                        (member as any).accessibility || 'public'
            });
          } else if (t.isClassProperty(member)) {
            properties.push({
              name: (member.key as any).name || 'anonymous',
              line: member.loc?.start.line || 0,
              type: undefined,
              visibility: (member as any).accessibility || 'public',
              isStatic: (member as any).static || false
            });
          }
        });

        classes.push({
          name: cls.id?.name || 'anonymous',
          line: cls.loc?.start.line || 0,
          endLine: cls.loc?.end.line || 0,
          methods,
          properties,
          extends: cls.superClass ? (cls.superClass as any).name : undefined,
          implements: cls.implements?.map(impl => (impl as any).name) || [],
          complexity: methods.reduce((sum, m) => sum + m.complexity, 0)
        });
      },

      ImportDeclaration(path) {
        const importNode = path.node;
        const moduleName = importNode.source.value;
        dependencies.push(moduleName);

        const importNames: string[] = [];
        importNode.specifiers.forEach(specifier => {
          if (t.isImportSpecifier(specifier)) {
            importNames.push(specifier.local.name);
          } else if (t.isImportDefaultSpecifier(specifier)) {
            importNames.push(specifier.local.name);
          }
        });

        imports.push({
          module: moduleName,
          imports: importNames,
          line: importNode.loc?.start.line || 0,
          isDefault: importNode.specifiers.some(s => t.isImportDefaultSpecifier(s))
        });
      },

      ExportNamedDeclaration(path) {
        const exportNode = path.node;
        if (exportNode.declaration) {
          if (t.isFunctionDeclaration(exportNode.declaration)) {
            exports.push({
              name: exportNode.declaration.id?.name || 'anonymous',
              line: exportNode.declaration.loc?.start.line || 0,
              type: 'function'
            });
          } else if (t.isClassDeclaration(exportNode.declaration)) {
            exports.push({
              name: exportNode.declaration.id?.name || 'anonymous',
              line: exportNode.declaration.loc?.start.line || 0,
              type: 'class'
            });
          }
        }
      },

      ExportDefaultDeclaration(path) {
        const exportNode = path.node;
        if (t.isIdentifier(exportNode.declaration)) {
          exports.push({
            name: exportNode.declaration.name,
            line: exportNode.declaration.loc?.start.line || 0,
            type: 'default'
          });
        }
      }
    });

    const complexity = calculateFileComplexity(ast, functions, classes);

    return {
      path: filePath,
      language: path.extname(filePath).substring(1),
      size: content.length,
      lines: ast.program.loc?.end.line || 0,
      functions,
      classes,
      imports,
      exports,
      complexity,
      dependencies
    };
  }

  private buildArchitecture(files: FileAnalysis[]): ArchitectureAnalysis {
    const components = this.identifyComponents(files);
    const relationships = this.buildRelationships(files, components);
    const layers = this.identifyLayers(components);
    const patterns = this.detectPatterns(files, components);
    const dataFlow = this.analyzeDataFlow(files, relationships);

    return {
      components,
      relationships,
      layers,
      patterns,
      dataFlow
    };
  }

  private identifyComponents(files: FileAnalysis[]): ComponentAnalysis[] {
    const components: ComponentAnalysis[] = [];

    // Group files by top-level folder (e.g., app, components, lib, types)
    const fileGroups = new Map<string, string[]>();
    files.forEach(file => {
      const relPath = file.path;
      const topLevel = relPath.split('/')[0];
      const group = fileGroups.get(topLevel) || [];
      group.push(relPath);
      fileGroups.set(topLevel, group);
    });

    fileGroups.forEach((filePaths, topLevel) => {
      const componentFiles = files.filter(f => filePaths.includes(f.path));
      const type = this.determineComponentType(topLevel, componentFiles);
      const dependencies = this.extractDependencies(componentFiles);
      const complexity = componentFiles.reduce((sum, f) => sum + f.complexity.cyclomatic, 0);
      components.push({
        name: topLevel,
        type,
        files: filePaths,
        dependencies,
        dependents: [],
        complexity,
        description: this.generateComponentDescription(topLevel, componentFiles),
        patterns: this.detectComponentPatterns(componentFiles)
      });
    });

    return components;
  }

  private determineComponentType(dirName: string, files: FileAnalysis[]): ComponentAnalysis['type'] {
    const hasApiFiles = files.some(f => f.path.includes('api') || f.path.includes('route'));
    const hasPageFiles = files.some(f => f.path.includes('page') || f.path.includes('component'));
    const hasServiceFiles = files.some(f => f.path.includes('service') || f.path.includes('util'));

    if (hasApiFiles) return 'api';
    if (hasPageFiles) return 'page';
    if (hasServiceFiles) return 'service';
    return 'component';
  }

  private extractDependencies(files: FileAnalysis[]): string[] {
    const deps = new Set<string>();
    files.forEach(file => {
      file.dependencies.forEach(dep => deps.add(dep));
    });
    return Array.from(deps);
  }

  private generateComponentDescription(name: string, files: FileAnalysis[]): string {
    const fileCount = files.length;
    const totalLines = files.reduce((sum, f) => sum + f.lines, 0);
    const functions = files.reduce((sum, f) => sum + f.functions.length, 0);
    const classes = files.reduce((sum, f) => sum + f.classes.length, 0);

    return `${name} component with ${fileCount} files, ${totalLines} lines, ${functions} functions, and ${classes} classes`;
  }

  private detectComponentPatterns(files: FileAnalysis[]): string[] {
    const patterns: string[] = [];
    
    const hasHooks = files.some(f => f.functions.some(func => func.name.startsWith('use')));
    const hasContext = files.some(f => f.classes.some(c => c.name.includes('Context')));
    const hasProvider = files.some(f => f.classes.some(c => c.name.includes('Provider')));
    
    if (hasHooks) patterns.push('React Hooks');
    if (hasContext) patterns.push('Context Pattern');
    if (hasProvider) patterns.push('Provider Pattern');
    
    return patterns;
  }

  private buildRelationships(files: FileAnalysis[], components: ComponentAnalysis[]): Relationship[] {
    const relationships: Relationship[] = [];

    // Map file path to component name (top-level folder)
    const fileToComponent = new Map<string, string>();
    components.forEach(comp => {
      comp.files.forEach(f => fileToComponent.set(f, comp.name));
    });

    // Only consider repo-internal imports (not node_modules or external packages)
    const isInternalImport = (module: string) =>
      module.startsWith('.') || module.startsWith('/') || files.some(f => f.path.endsWith(module) || f.path.includes(module));

    // Build import relationships between components
    files.forEach(file => {
      const fromComponent = fileToComponent.get(file.path);
      file.imports.forEach(imp => {
        if (typeof imp.module !== 'string') return;
        if (!isInternalImport(imp.module)) return; // skip external deps
        // Try to resolve import to a file in the repo
        const importedFile = files.find(f => {
          if (typeof f.path !== 'string') return false;
          if (typeof imp.module !== 'string') return false;
          return (
            f.path === imp.module ||
            f.path.endsWith(imp.module) ||
            f.path.includes(imp.module) ||
            (f.path.split('/').pop() === imp.module.split('/').pop())
          );
        });
        const toComponent = importedFile ? fileToComponent.get(importedFile.path) : undefined;
        if (typeof fromComponent === 'string' && typeof toComponent === 'string' && fromComponent !== toComponent) {
          relationships.push({
            from: fromComponent,
            to: toComponent,
            type: 'imports',
            strength: 0.8
          });
          console.log(`[relationships] ${fromComponent} imports ${toComponent}`);
        }
      });
    });

    // Build inheritance relationships between components (internal only)
    files.forEach(file => {
      const fromComponent = fileToComponent.get(file.path);
      file.classes.forEach(cls => {
        if (typeof cls.extends !== 'string') return;
        // Only consider internal extends
        const extendedFile = files.find(f => {
          if (typeof f.path !== 'string') return false;
          if (typeof cls.extends !== 'string') return false;
          return (
            f.path === cls.extends ||
            f.path.endsWith(cls.extends) ||
            f.path.includes(cls.extends) ||
            (f.path.split('/').pop() === cls.extends.split('/').pop())
          );
        });
        const toComponent = extendedFile ? fileToComponent.get(extendedFile.path) : undefined;
        if (typeof fromComponent === 'string' && typeof toComponent === 'string' && fromComponent !== toComponent) {
          relationships.push({
            from: fromComponent,
            to: toComponent,
            type: 'extends',
            strength: 0.9
          });
          console.log(`[relationships] ${fromComponent} extends ${toComponent}`);
        }
      });
    });

    return relationships;
  }

  private identifyLayers(components: ComponentAnalysis[]): any[] {
    const layers = [
      { name: 'Presentation', components: components.filter(c => c.type === 'page' || c.type === 'component') },
      { name: 'Business Logic', components: components.filter(c => c.type === 'service') },
      { name: 'Data Access', components: components.filter(c => c.type === 'api') }
    ];

    return layers.filter(layer => layer.components.length > 0);
  }

  private detectPatterns(files: FileAnalysis[], components: ComponentAnalysis[]): any[] {
    const patterns: any[] = [];

    // Detect common patterns
    const hasHooks = files.some(f => f.functions.some(func => func.name.startsWith('use')));
    const hasContext = files.some(f => f.classes.some(c => c.name.includes('Context')));
    const hasProvider = files.some(f => f.classes.some(c => c.name.includes('Provider')));

    if (hasHooks) {
      patterns.push({
        name: 'React Hooks Pattern',
        confidence: 0.9,
        files: files.filter(f => f.functions.some(func => func.name.startsWith('use'))).map(f => f.path),
        description: 'Uses React Hooks for state management and side effects'
      });
    }

    if (hasContext && hasProvider) {
      patterns.push({
        name: 'Context Provider Pattern',
        confidence: 0.8,
        files: files.filter(f => f.classes.some(c => c.name.includes('Context') || c.name.includes('Provider'))).map(f => f.path),
        description: 'Uses React Context for global state management'
      });
    }

    return patterns;
  }

  private analyzeDataFlow(files: FileAnalysis[], relationships: Relationship[]): any[] {
    // Simplified data flow analysis
    return [];
  }

  private identifyCriticalPaths(files: FileAnalysis[], architecture: ArchitectureAnalysis): CriticalPath[] {
    const criticalPaths: CriticalPath[] = [];

    // Identify files with high complexity
    const highComplexityFiles = files.filter(f => f.complexity.cyclomatic > this.config.complexityThreshold);
    
    highComplexityFiles.forEach(file => {
      criticalPaths.push({
        name: `High Complexity: ${path.basename(file.path)}`,
        files: [file.path],
        importance: Math.min(100, file.complexity.cyclomatic * 10),
        complexity: file.complexity.cyclomatic,
        description: `File with high cyclomatic complexity (${file.complexity.cyclomatic})`,
        businessLogic: this.extractBusinessLogic(file)
      });
    });

    // Identify entry points
    const entryPoints = files.filter(f => f.exports.length > 0);
    if (entryPoints.length > 0) {
      criticalPaths.push({
        name: 'Application Entry Points',
        files: entryPoints.map(f => f.path),
        importance: 95,
        complexity: entryPoints.reduce((sum, f) => sum + f.complexity.cyclomatic, 0),
        description: 'Main entry points and exported modules',
        businessLogic: ['Application initialization', 'Module exports', 'Public API']
      });
    }

    return criticalPaths;
  }

  private extractBusinessLogic(file: FileAnalysis): string[] {
    const logic: string[] = [];
    
    file.functions.forEach(func => {
      if (func.complexity > 5) {
        logic.push(`Complex function: ${func.name}`);
      }
    });

    file.classes.forEach(cls => {
      if (cls.methods.length > 5) {
        logic.push(`Complex class: ${cls.name}`);
      }
    });

    return logic;
  }

  private calculateMetrics(files: FileAnalysis[]): RepositoryMetrics {
    const totalFiles = files.length;
    const totalLines = files.reduce((sum, f) => sum + f.lines, 0);
    const languages: { [key: string]: number } = {};
    const complexities = files.map(f => f.complexity.cyclomatic);

    files.forEach(file => {
      languages[file.language] = (languages[file.language] || 0) + 1;
    });

    const averageComplexity = complexities.length > 0 ? complexities.reduce((sum, c) => sum + c, 0) / complexities.length : 0;
    const maxComplexity = Math.max(...complexities, 0);
    const maintainabilityIndex = this.calculateMaintainabilityIndex(files);
    const technicalDebt = this.calculateTechnicalDebt(files);

    return {
      totalFiles,
      totalLines,
      languages,
      averageComplexity,
      maxComplexity,
      maintainabilityIndex,
      technicalDebt
    };
  }

  private calculateMaintainabilityIndex(files: FileAnalysis[]): number {
    // Simplified maintainability index calculation
    const totalComplexity = files.reduce((sum, f) => sum + f.complexity.cyclomatic, 0);
    const totalLines = files.reduce((sum, f) => sum + f.lines, 0);
    
    if (totalLines === 0) return 100;
    
    const volume = totalLines * Math.log2(totalComplexity || 1);
    const maintainability = 171 - 5.2 * Math.log(volume) - 0.23 * totalComplexity - 16.2 * Math.log(totalLines);
    
    return Math.max(0, Math.min(100, maintainability));
  }

  private calculateTechnicalDebt(files: FileAnalysis[]): number {
    let debt = 0;
    
    files.forEach(file => {
      if (file.complexity.cyclomatic > this.config.complexityThreshold) {
        debt += (file.complexity.cyclomatic - this.config.complexityThreshold) * 0.5;
      }
    });
    
    return debt;
  }

  private generateInsights(files: FileAnalysis[], architecture: ArchitectureAnalysis, metrics: RepositoryMetrics): any {
    return {
      architecturalStyle: this.determineArchitecturalStyle(architecture),
      codeQuality: this.assessCodeQuality(metrics),
      complexityDistribution: this.analyzeComplexityDistribution(files),
      potentialIssues: this.identifyPotentialIssues(files, metrics),
      recommendations: this.generateRecommendations(files, metrics),
      learningPath: this.generateLearningPath(files, architecture)
    };
  }

  private determineArchitecturalStyle(architecture: ArchitectureAnalysis): string {
    const componentTypes = architecture.components.map(c => c.type);
    const hasPages = componentTypes.includes('page');
    const hasApis = componentTypes.includes('api');
    const hasServices = componentTypes.includes('service');

    if (hasPages && hasApis && hasServices) return 'Full-Stack Application';
    if (hasPages && !hasApis) return 'Frontend Application';
    if (hasApis && !hasPages) return 'Backend API';
    return 'Component Library';
  }

  private assessCodeQuality(metrics: RepositoryMetrics): string {
    if (metrics.maintainabilityIndex > 80) return 'Excellent';
    if (metrics.maintainabilityIndex > 60) return 'Good';
    if (metrics.maintainabilityIndex > 40) return 'Fair';
    return 'Needs Improvement';
  }

  private analyzeComplexityDistribution(files: FileAnalysis[]): string {
    const complexities = files.map(f => f.complexity.cyclomatic);
    const avg = complexities.reduce((sum, c) => sum + c, 0) / complexities.length;
    
    if (avg < 5) return 'Low complexity, easy to maintain';
    if (avg < 10) return 'Moderate complexity, manageable';
    return 'High complexity, consider refactoring';
  }

  private identifyPotentialIssues(files: FileAnalysis[], metrics: RepositoryMetrics): string[] {
    const issues: string[] = [];
    
    if (metrics.averageComplexity > 10) {
      issues.push('High average complexity - consider breaking down complex functions');
    }
    
    if (metrics.maxComplexity > 20) {
      issues.push('Very high complexity in some files - immediate refactoring needed');
    }
    
    if (metrics.maintainabilityIndex < 50) {
      issues.push('Low maintainability index - code quality improvements recommended');
    }
    
    return issues;
  }

  private generateRecommendations(files: FileAnalysis[], metrics: RepositoryMetrics): string[] {
    const recommendations: string[] = [];
    
    if (metrics.averageComplexity > 10) {
      recommendations.push('Break down complex functions into smaller, more manageable pieces');
    }
    
    if (metrics.maintainabilityIndex < 60) {
      recommendations.push('Add more comprehensive documentation and comments');
      recommendations.push('Consider implementing unit tests for critical functions');
    }
    
    return recommendations;
  }

  private generateLearningPath(files: FileAnalysis[], architecture: ArchitectureAnalysis): any {
    const totalComplexity = files.reduce((sum, f) => sum + f.complexity.cyclomatic, 0);
    const totalLines = files.reduce((sum, f) => sum + f.lines, 0);
    
    let difficulty: 'beginner' | 'intermediate' | 'advanced' = 'beginner';
    let estimatedTime = 2; // hours
    
    if (totalComplexity > 100 || totalLines > 5000) {
      difficulty = 'advanced';
      estimatedTime = 8;
    } else if (totalComplexity > 50 || totalLines > 2000) {
      difficulty = 'intermediate';
      estimatedTime = 4;
    }
    
    return {
      difficulty,
      estimatedTime,
      modules: this.generateLearningModules(files, architecture),
      prerequisites: ['Basic JavaScript/TypeScript knowledge', 'Understanding of React concepts']
    };
  }

  private generateLearningModules(files: FileAnalysis[], architecture: ArchitectureAnalysis): any[] {
    const modules = [];
    
    // Architecture overview module
    modules.push({
      title: 'Architecture Overview',
      description: 'Understand the overall structure and organization of the codebase',
      files: architecture.components.map(c => c.files[0]).filter(Boolean),
      concepts: ['Component organization', 'Dependency management', 'File structure'],
      exercises: [],
      estimatedTime: 30
    });
    
    // Core functionality module
    const coreFiles = files.filter(f => f.complexity.cyclomatic > 5).map(f => f.path);
    if (coreFiles.length > 0) {
      modules.push({
        title: 'Core Functionality',
        description: 'Learn about the main business logic and key functions',
        files: coreFiles.slice(0, 5),
        concepts: ['Business logic', 'Function complexity', 'Code patterns'],
        exercises: [],
        estimatedTime: 45
      });
    }
    
    return modules;
  }
}

// Helper functions for complexity calculation
function calculateFunctionComplexity(node: any): number {
  let complexity = 1; // Base complexity

  function walk(n: any) {
    if (!n || typeof n !== 'object') return;
    switch (n.type) {
      case 'IfStatement':
      case 'ForStatement':
      case 'ForInStatement':
      case 'ForOfStatement':
      case 'WhileStatement':
      case 'DoWhileStatement':
      case 'SwitchCase':
      case 'CatchClause':
      case 'ConditionalExpression':
        complexity++;
        break;
      case 'LogicalExpression':
        if (n.operator === '&&' || n.operator === '||') complexity++;
        break;
    }
    // Recursively walk all child nodes
    for (const key in n) {
      if (n.hasOwnProperty(key)) {
        const child = n[key];
        if (Array.isArray(child)) {
          child.forEach(walk);
        } else if (typeof child === 'object' && child !== null && child.type) {
          walk(child);
        }
      }
    }
  }

  // Walk the function body
  if (node.body) {
    walk(node.body);
  }
  return complexity;
}

function calculateFileComplexity(ast: any, functions: FunctionInfo[], classes: ClassInfo[]): ComplexityMetrics {
  const cyclomatic = functions.reduce((sum, f) => sum + f.complexity, 0) + 
                    classes.reduce((sum, c) => sum + c.complexity, 0);
  
  const cognitive = functions.reduce((sum, f) => sum + f.complexity, 0);
  
  // Simplified Halstead metrics
  const halstead = cyclomatic * 2; // Simplified calculation
  
  const maintainability = Math.max(0, 171 - 5.2 * Math.log(cyclomatic) - 0.23 * cyclomatic);
  
  return {
    cyclomatic,
    cognitive,
    halstead,
    maintainability
  };
} 