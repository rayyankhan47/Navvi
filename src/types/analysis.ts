// Core analysis types for Navvi's code analysis engine

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
  commitCount?: number;
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
  methods: MethodInfo[];
  properties: PropertyInfo[];
  extends?: string;
  implements?: string[];
  complexity: number;
}

export interface MethodInfo {
  name: string;
  line: number;
  endLine: number;
  parameters: string[];
  returnType?: string;
  complexity: number;
  visibility: 'public' | 'private' | 'protected';
}

export interface PropertyInfo {
  name: string;
  line: number;
  type?: string;
  visibility: 'public' | 'private' | 'protected';
  isStatic: boolean;
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
  halstead: number;
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
  patterns: string[];
}

export interface ArchitectureAnalysis {
  components: ComponentAnalysis[];
  relationships: Relationship[];
  layers: Layer[];
  patterns: Pattern[];
  dataFlow: DataFlow[];
}

export interface Relationship {
  from: string;
  to: string;
  type: 'imports' | 'extends' | 'implements' | 'calls' | 'uses';
  strength: number; // 0-1
}

export interface Layer {
  name: string;
  components: string[];
  responsibility: string;
}

export interface Pattern {
  name: string;
  confidence: number; // 0-1
  files: string[];
  description: string;
}

export interface DataFlow {
  from: string;
  to: string;
  data: string[];
  type: 'api' | 'props' | 'state' | 'context';
}

export interface CriticalPath {
  name: string;
  description: string;
  files: string[];
  importance: number;
  complexity: number;
  businessLogic: string[];
}

export interface RepositoryAnalysis {
  repository: string;
  files: FileAnalysis[];
  architecture: ArchitectureAnalysis;
  metrics: RepositoryMetrics;
  insights: {
    architecturalStyle: string;
    codeQuality: string;
    complexityDistribution: string;
    potentialIssues: string[];
    recommendations: string[];
    learningPath: any;
    highComplexityFiles: { path: string, complexity: number }[];
    hotspots: { path: string, commitCount: number }[];
    entryPoints: { path: string, exports: string[] }[];
  };
  timestamp: Date;
}

export interface RepositoryMetrics {
  totalFiles: number;
  totalLines: number;
  languages: { [key: string]: number };
  averageComplexity: number;
  maxComplexity: number;
  maintainabilityIndex: number;
  technicalDebt: number;
}

export interface AnalysisInsights {
  architecturalStyle: string;
  codeQuality: string;
  complexityDistribution: string;
  potentialIssues: string[];
  recommendations: string[];
  learningPath: LearningPath;
}

export interface LearningPath {
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // in hours
  modules: LearningModule[];
  prerequisites: string[];
}

export interface LearningModule {
  title: string;
  description: string;
  files: string[];
  concepts: string[];
  exercises: Exercise[];
  estimatedTime: number; // in minutes
}

export interface Exercise {
  title: string;
  description: string;
  type: 'explore' | 'modify' | 'debug' | 'implement';
  files: string[];
  instructions: string[];
  hints: string[];
}

// Analysis engine configuration
export interface AnalysisConfig {
  languages: string[];
  maxFileSize: number;
  ignorePatterns: string[];
  complexityThreshold: number;
  includeTests: boolean;
  includeNodeModules: boolean;
}

// Real-time analysis progress
export interface AnalysisProgress {
  stage: 'cloning' | 'parsing' | 'analyzing' | 'generating' | 'complete';
  progress: number; // 0-100
  currentFile?: string;
  message: string;
} 