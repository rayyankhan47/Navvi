// Types for the monster analysis engine

export interface FileAnalysis {
  path: string;
  language: string;
  size: number;
  lines: number;
  functions: FunctionInfo[];
  classes: ClassInfo[];
  imports: ImportInfo[];
  exports: ExportInfo[];
  complexity: ComplexityMetrics;
  dependencies: string[];
}

export interface FunctionInfo {
  name: string;
  line: number;
  endLine: number;
  parameters: string[];
  returnType?: string;
  complexity: number;
  calls: string[];
  calledBy: string[];
}

export interface ClassInfo {
  name: string;
  line: number;
  endLine: number;
  methods: FunctionInfo[];
  properties: string[];
  extends?: string;
  implements?: string[];
  complexity: number;
}

export interface ImportInfo {
  module: string;
  imports: string[];
  line: number;
  isDefault: boolean;
}

export interface ExportInfo {
  name: string;
  line: number;
  type: 'function' | 'class' | 'variable' | 'default';
}

export interface ComplexityMetrics {
  cyclomatic: number;
  cognitive: number;
  maintainability: number;
}

export interface ComponentAnalysis {
  name: string;
  type: 'component' | 'service' | 'utility' | 'page' | 'api';
  files: string[];
  dependencies: string[];
  dependents: string[];
  complexity: number;
  description: string;
}

export interface ArchitectureAnalysis {
  components: ComponentAnalysis[];
  relationships: Relationship[];
}

export interface Relationship {
  from: string;
  to: string;
  type: 'imports' | 'extends' | 'calls';
  strength: number; // 0-1
}

export interface CriticalPath {
  name: string;
  files: string[];
  importance: number; // 0-100
  complexity: number;
  description: string;
}

export interface RepositoryAnalysis {
  repository: string;
  files: FileAnalysis[];
  architecture: ArchitectureAnalysis;
  criticalPaths: CriticalPath[];
  timestamp: Date;
}

export interface AnalysisConfig {
  languages: string[];
  maxFileSize: number;
  ignorePatterns: string[];
}

export interface AnalysisProgress {
  stage: 'cloning' | 'parsing' | 'analyzing' | 'complete';
  progress: number; // 0-100
  message: string;
  currentFile?: string;
} 