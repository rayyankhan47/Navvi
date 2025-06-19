// Core analysis engine for Navvi
// This is the foundation that makes Navvi NOT a GPT wrapper

import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';
import fs from 'fs';
import path from 'path';
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

  constructor(config: AnalysisConfig = {
    languages: ['javascript', 'typescript', 'jsx', 'tsx'],
    maxFileSize: 1024 * 1024, // 1MB
    ignorePatterns: ['node_modules', '.git', 'dist', 'build'],
    complexityThreshold: 10,
    includeTests: false,
    includeNodeModules: false
  }) {
    this.config = config;
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

  async analyzeRepository(repoPath: string): Promise<RepositoryAnalysis> {
    this.updateProgress('parsing', 0, 'Starting repository analysis...');
    
    // TODO: Implement real analysis
    // For now, return mock data to test the flow
    
    this.updateProgress('complete', 100, 'Analysis complete!');
    
    return {
      repository: 'test-repo',
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
        complexityDistribution: 'Unknown',
        potentialIssues: [],
        recommendations: [],
        learningPath: {
          difficulty: 'beginner',
          estimatedTime: 2,
          modules: [],
          prerequisites: []
        }
      },
      timestamp: new Date()
    };
  }

  private async scanFiles(dir: string): Promise<string[]> {
    const files: string[] = [];
    
    const scanDirectory = async (currentDir: string) => {
      const items = await fs.promises.readdir(currentDir);
      
      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = await fs.promises.stat(fullPath);
        
        if (stat.isDirectory()) {
          const shouldIgnore = this.config.ignorePatterns.some(pattern => 
            item.includes(pattern) || fullPath.includes(pattern)
          );
          
          if (!shouldIgnore) {
            await scanDirectory(fullPath);
          }
        } else if (stat.isFile()) {
          const ext = path.extname(item).toLowerCase();
          const isSupported = this.isSupportedFile(ext);
          
          if (isSupported && stat.size <= this.config.maxFileSize) {
            files.push(fullPath);
          }
        }
      }
    };

    await scanDirectory(dir);
    return files;
  }

  private isSupportedFile(ext: string): boolean {
    const supportedExtensions = ['.js', '.ts', '.jsx', '.tsx'];
    return supportedExtensions.includes(ext);
  }

  private async analyzeFile(filePath: string): Promise<FileAnalysis | null> {
    try {
      const content = await fs.promises.readFile(filePath, 'utf-8');
      const ext = path.extname(filePath).toLowerCase();
      
      if (ext === '.js' || ext === '.jsx') {
        return this.analyzeJavaScriptFile(filePath, content);
      } else if (ext === '.ts' || ext === '.tsx') {
        return this.analyzeTypeScriptFile(filePath, content);
      }
      
      return null;
    } catch (error) {
      console.warn(`Failed to read file ${filePath}:`, error);
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
        if (t.isVariableDeclarator(path.parent) && t.isIdentifier(path.parent.id)) {
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

      ArrowFunctionExpression(path) {
        const func = path.node;
        if (t.isVariableDeclarator(path.parent) && t.isIdentifier(path.parent.id)) {
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
        const classNode = path.node;
        const methods: MethodInfo[] = [];
        const properties: PropertyInfo[] = [];

        classNode.body.body.forEach(member => {
          if (t.isClassMethod(member)) {
            methods.push({
              name: (member.key as any).name,
              line: member.loc?.start.line || 0,
              endLine: member.loc?.end.line || 0,
              parameters: member.params.map(p => (p as any).name || 'param'),
              returnType: undefined,
              complexity: calculateFunctionComplexity(member),
              visibility: member.kind as any
            });
          } else if (t.isClassProperty(member)) {
            properties.push({
              name: (member.key as any).name,
              line: member.loc?.start.line || 0,
              type: undefined,
              visibility: 'public',
              isStatic: member.static || false
            });
          }
        });

        classes.push({
          name: classNode.id?.name || 'anonymous',
          line: classNode.loc?.start.line || 0,
          endLine: classNode.loc?.end.line || 0,
          methods,
          properties,
          extends: (classNode.superClass as any)?.name,
          implements: [],
          complexity: methods.reduce((sum, m) => sum + m.complexity, 0)
        });
      },

      ImportDeclaration(path) {
        const importNode = path.node;
        const moduleName = importNode.source.value;
        dependencies.push(moduleName);

        const imports: string[] = [];
        importNode.specifiers.forEach(specifier => {
          if (t.isImportSpecifier(specifier)) {
            imports.push(specifier.local.name);
          } else if (t.isImportDefaultSpecifier(specifier)) {
            imports.push(specifier.local.name);
          }
        });

        imports.push({
          module: moduleName,
          imports,
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
      lines: content.split('\n').length,
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

    // Group files by directory structure
    const fileGroups = new Map<string, string[]>();
    
    files.forEach(file => {
      const dir = path.dirname(file.path);
      const group = fileGroups.get(dir) || [];
      group.push(file.path);
      fileGroups.set(dir, group);
    });

    fileGroups.forEach((filePaths, dir) => {
      const dirName = path.basename(dir);
      const componentFiles = files.filter(f => filePaths.includes(f.path));
      
      const type = this.determineComponentType(dirName, componentFiles);
      const dependencies = this.extractDependencies(componentFiles);
      const complexity = componentFiles.reduce((sum, f) => sum + f.complexity.cyclomatic, 0);
      
      components.push({
        name: dirName,
        type,
        files: filePaths,
        dependencies,
        dependents: [],
        complexity,
        description: this.generateComponentDescription(dirName, componentFiles),
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

    // Build import relationships
    files.forEach(file => {
      file.imports.forEach(imp => {
        relationships.push({
          from: file.path,
          to: imp.module,
          type: 'imports',
          strength: 0.8
        });
      });
    });

    // Build inheritance relationships
    files.forEach(file => {
      file.classes.forEach(cls => {
        if (cls.extends) {
          relationships.push({
            from: file.path,
            to: cls.extends,
            type: 'extends',
            strength: 0.9
          });
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
  
  traverse(node, {
    IfStatement() { complexity++; },
    SwitchCase() { complexity++; },
    ForStatement() { complexity++; },
    ForInStatement() { complexity++; },
    ForOfStatement() { complexity++; },
    WhileStatement() { complexity++; },
    DoWhileStatement() { complexity++; },
    CatchClause() { complexity++; },
    ConditionalExpression() { complexity++; },
    LogicalExpression(path) {
      if (path.node.operator === '&&' || path.node.operator === '||') {
        complexity++;
      }
    }
  });
  
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