"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  BarChart3, 
  GitBranch, 
  Layers, 
  TrendingUp, 
  BookOpen,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react";

interface AnalysisData {
  repository: string;
  files: any[];
  architecture: {
    components: any[];
    relationships: any[];
    layers: any[];
    patterns: any[];
    dataFlow: any[];
  };
  criticalPaths: any[];
  metrics: {
    totalFiles: number;
    totalLines: number;
    languages: { [key: string]: number };
    averageComplexity: number;
    maxComplexity: number;
    maintainabilityIndex: number;
    technicalDebt: number;
  };
  insights: {
    architecturalStyle: string;
    codeQuality: string;
    complexityDistribution: string;
    potentialIssues: string[];
    recommendations: string[];
    learningPath: {
      difficulty: 'beginner' | 'intermediate' | 'advanced';
      estimatedTime: number;
      modules: any[];
      prerequisites: string[];
    };
  };
  timestamp: string;
}

export default function AnalysisPage() {
  const params = useParams();
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);

  useEffect(() => {
    // For now, we'll use mock data since we haven't implemented the full analysis yet
    // In production, this would fetch from the API
    const mockAnalysis: AnalysisData = {
      repository: params.repo as string,
      files: [
        {
          path: "src/app/page.tsx",
          language: "tsx",
          size: 2048,
          lines: 45,
          functions: [
            { name: "HomePage", complexity: 3, line: 10 }
          ],
          classes: [],
          complexity: { cyclomatic: 3, cognitive: 2, halstead: 6, maintainability: 85 }
        },
        {
          path: "src/lib/analysisEngine.ts",
          language: "ts",
          size: 8192,
          lines: 120,
          functions: [
            { name: "analyzeRepository", complexity: 8, line: 25 },
            { name: "buildArchitecture", complexity: 6, line: 45 }
          ],
          classes: [
            { name: "AnalysisEngine", complexity: 12, line: 15 }
          ],
          complexity: { cyclomatic: 26, cognitive: 18, halstead: 52, maintainability: 65 }
        }
      ],
      architecture: {
        components: [
          {
            name: "app",
            type: "page",
            files: ["src/app/page.tsx", "src/app/layout.tsx"],
            dependencies: ["react", "next"],
            complexity: 5,
            description: "Main application pages and layout",
            patterns: ["Next.js App Router"]
          },
          {
            name: "lib",
            type: "service",
            files: ["src/lib/analysisEngine.ts"],
            dependencies: ["@babel/parser", "@babel/traverse"],
            complexity: 26,
            description: "Core analysis engine and utilities",
            patterns: ["AST Parsing", "Complexity Analysis"]
          }
        ],
        relationships: [
          { from: "src/app/page.tsx", to: "src/lib/analysisEngine.ts", type: "imports", strength: 0.8 }
        ],
        layers: [
          { name: "Presentation", components: ["app"], responsibility: "UI and user interaction" },
          { name: "Business Logic", components: ["lib"], responsibility: "Core analysis functionality" }
        ],
        patterns: [
          {
            name: "Next.js App Router",
            confidence: 0.9,
            files: ["src/app/page.tsx", "src/app/layout.tsx"],
            description: "Uses Next.js 13+ App Router for file-based routing"
          }
        ],
        dataFlow: []
      },
      criticalPaths: [
        {
          name: "Analysis Engine",
          files: ["src/lib/analysisEngine.ts"],
          importance: 95,
          complexity: 26,
          description: "Core analysis functionality with high complexity",
          businessLogic: ["AST parsing", "Complexity calculation", "Architecture analysis"]
        }
      ],
      metrics: {
        totalFiles: 2,
        totalLines: 165,
        languages: { "tsx": 1, "ts": 1 },
        averageComplexity: 14.5,
        maxComplexity: 26,
        maintainabilityIndex: 75,
        technicalDebt: 8
      },
      insights: {
        architecturalStyle: "Full-Stack Application",
        codeQuality: "Good",
        complexityDistribution: "Moderate complexity, manageable",
        potentialIssues: [
          "High complexity in analysis engine - consider breaking down functions"
        ],
        recommendations: [
          "Add unit tests for critical analysis functions",
          "Consider splitting AnalysisEngine into smaller modules"
        ],
        learningPath: {
          difficulty: "intermediate",
          estimatedTime: 4,
          modules: [
            {
              title: "Architecture Overview",
              description: "Understand the overall structure",
              files: ["src/app/page.tsx"],
              concepts: ["Next.js App Router", "Component organization"],
              estimatedTime: 30
            },
            {
              title: "Core Analysis Engine",
              description: "Learn about the analysis functionality",
              files: ["src/lib/analysisEngine.ts"],
              concepts: ["AST parsing", "Complexity metrics", "Code analysis"],
              estimatedTime: 45
            }
          ],
          prerequisites: ["Basic TypeScript knowledge", "Understanding of React"]
        }
      },
      timestamp: new Date().toISOString()
    };

    setAnalysis(mockAnalysis);
    setLoading(false);
  }, [params.repo]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="spinner"></div>
          <span className="text-white">Loading analysis results...</span>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Analysis not found</h1>
          <Link href="/dashboard" className="text-blue-400 hover:underline">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'architecture', name: 'Architecture', icon: GitBranch },
    { id: 'complexity', name: 'Complexity', icon: TrendingUp },
    { id: 'learning', name: 'Learning Path', icon: BookOpen },
    { id: 'files', name: 'Files', icon: FileText }
  ];

  const getQualityColor = (quality: string) => {
    switch (quality.toLowerCase()) {
      case 'excellent': return 'text-green-400';
      case 'good': return 'text-blue-400';
      case 'fair': return 'text-yellow-400';
      case 'needs improvement': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getComplexityColor = (complexity: number) => {
    if (complexity > 20) return 'text-red-400';
    if (complexity > 10) return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-lime-500 to-green-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">N</span>
                </div>
                <span className="text-xl font-bold">Navvi</span>
              </Link>
              <div className="text-gray-400 font-medium">
                / {analysis.repository.replace(/-/g, '/')}
              </div>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <Clock className="w-4 h-4" />
              <span>Analyzed {new Date(analysis.timestamp).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-20 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center space-x-4 mb-4">
              <Link 
                href="/dashboard"
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </Link>
            </div>
            <h1 className="text-3xl font-bold mb-2">
              {analysis.repository.replace(/-/g, '/')}
            </h1>
            <p className="text-gray-400">
              {analysis.insights.architecturalStyle} • 
              <span className={getQualityColor(analysis.insights.codeQuality)}> {analysis.insights.codeQuality}</span> Quality
            </p>
          </motion.div>

          {/* Tabs */}
          <motion.div 
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="border-b border-white/10">
              <nav className="flex space-x-8 px-6">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-400'
                          : 'border-transparent text-gray-400 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'overview' && (
                <motion.div 
                  className="space-y-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-blue-400">{analysis.metrics.totalFiles}</div>
                      <div className="text-sm text-gray-400">Files</div>
                    </div>
                    <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-400">{analysis.metrics.totalLines}</div>
                      <div className="text-sm text-gray-400">Lines of Code</div>
                    </div>
                    <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-purple-400">{analysis.metrics.averageComplexity.toFixed(1)}</div>
                      <div className="text-sm text-gray-400">Avg Complexity</div>
                    </div>
                    <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-orange-400">{analysis.metrics.maintainabilityIndex}</div>
                      <div className="text-sm text-gray-400">Maintainability</div>
                    </div>
                  </div>

                  {/* Languages */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Languages</h3>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(analysis.metrics.languages).map(([lang, count]) => (
                        <span key={lang} className="px-3 py-1 bg-white/10 text-white rounded-full text-sm">
                          {lang} ({count})
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Critical Paths */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Critical Paths</h3>
                    <div className="space-y-3">
                      {analysis.criticalPaths.map((path, index) => (
                        <div key={index} className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg">
                          <h4 className="font-semibold text-white">{path.name}</h4>
                          <p className="text-sm text-gray-300 mt-1">{path.description}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm">
                            <span className="text-red-400">Complexity: {path.complexity}</span>
                            <span className="text-red-400">Importance: {path.importance}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'architecture' && (
                <motion.div 
                  className="space-y-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  {/* Components */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Components</h3>
                    <div className="grid gap-4">
                      {analysis.architecture.components.map((component, index) => (
                        <motion.div
                          key={index}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            selectedComponent === component.name
                              ? 'border-blue-500 bg-blue-500/10'
                              : 'border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10'
                          }`}
                          onClick={() => setSelectedComponent(component.name)}
                          whileHover={{ y: -2 }}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold text-white">{component.name}</h4>
                              <p className="text-sm text-gray-400 mt-1">{component.description}</p>
                              <div className="flex items-center space-x-4 mt-2 text-sm">
                                <span className="text-gray-500">{component.type}</span>
                                <span className={getComplexityColor(component.complexity)}>
                                  Complexity: {component.complexity}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-400">{component.files.length} files</div>
                              <div className="text-sm text-gray-400">{component.dependencies.length} deps</div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Patterns */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Detected Patterns</h3>
                    <div className="grid gap-3">
                      {analysis.architecture.patterns.map((pattern, index) => (
                        <div key={index} className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg">
                          <h4 className="font-semibold text-white">{pattern.name}</h4>
                          <p className="text-sm text-gray-300 mt-1">{pattern.description}</p>
                          <div className="text-sm text-green-400 mt-2">
                            Confidence: {Math.round(pattern.confidence * 100)}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'complexity' && (
                <motion.div 
                  className="space-y-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  {/* Complexity Distribution */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Complexity Analysis</h3>
                    <div className="bg-white/5 p-4 rounded-lg">
                      <p className="text-gray-300">{analysis.insights.complexityDistribution}</p>
                    </div>
                  </div>

                  {/* Files by Complexity */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Files by Complexity</h3>
                    <div className="space-y-3">
                      {analysis.files
                        .sort((a, b) => b.complexity.cyclomatic - a.complexity.cyclomatic)
                        .map((file, index) => (
                          <div key={index} className="bg-white/5 p-4 rounded-lg border border-white/10">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-semibold text-white">{file.path}</h4>
                                <div className="flex items-center space-x-4 mt-1 text-sm text-gray-400">
                                  <span>{file.language}</span>
                                  <span>{file.lines} lines</span>
                                  <span>{file.functions.length} functions</span>
                                  <span>{file.classes.length} classes</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className={`text-lg font-bold ${getComplexityColor(file.complexity.cyclomatic)}`}>
                                  {file.complexity.cyclomatic}
                                </div>
                                <div className="text-sm text-gray-400">Complexity</div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'learning' && (
                <motion.div 
                  className="space-y-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  {/* Learning Path Overview */}
                  <div className="bg-blue-500/10 border border-blue-500/20 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Learning Path</h3>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="px-2 py-1 bg-blue-500/20 rounded-full text-blue-400">
                        {analysis.insights.learningPath.difficulty}
                      </span>
                      <span className="text-gray-300">Estimated time: {analysis.insights.learningPath.estimatedTime} hours</span>
                    </div>
                  </div>

                  {/* Prerequisites */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Prerequisites</h3>
                    <div className="flex flex-wrap gap-2">
                      {analysis.insights.learningPath.prerequisites.map((prereq, index) => (
                        <span key={index} className="px-3 py-1 bg-white/10 text-white rounded-full text-sm">
                          {prereq}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Modules */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Learning Modules</h3>
                    <div className="space-y-4">
                      {analysis.insights.learningPath.modules.map((module, index) => (
                        <div key={index} className="bg-white/5 p-4 rounded-lg border border-white/10">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-white">{module.title}</h4>
                            <span className="text-sm text-gray-400">{module.estimatedTime} min</span>
                          </div>
                          <p className="text-sm text-gray-300 mb-3">{module.description}</p>
                          <div className="flex flex-wrap gap-2">
                            {module.concepts.map((concept: string, conceptIndex: number) => (
                              <span key={conceptIndex} className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                                {concept}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'files' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <h3 className="text-lg font-semibold mb-4">All Files</h3>
                  <div className="space-y-3">
                    {analysis.files.map((file, index) => (
                      <div key={index} className="bg-white/5 p-4 rounded-lg border border-white/10">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-white">{file.path}</h4>
                            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-400">
                              <span>{file.language}</span>
                              <span>{file.lines} lines</span>
                              <span>{file.size} bytes</span>
                            </div>
                          </div>
                          <div className="text-right text-sm text-gray-400">
                            <div>Functions: {file.functions.length}</div>
                            <div>Classes: {file.classes.length}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
} 