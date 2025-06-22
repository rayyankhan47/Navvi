"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, use } from "react";
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
import DependencyGraph from "../../../components/DependencyGraph";
import { RepositoryAnalysis } from '../../../types/analysis';
import AnalysisProgress from '../../../components/AnalysisProgress';

type AnalysisPageProps = {
  params: Promise<{ repo: string }>;
};

export default function AnalysisPage({ params }: AnalysisPageProps) {
  const { repo } = use(params);
  const decodedRepo = decodeURIComponent(repo);
  const [analysis, setAnalysis] = useState<RepositoryAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchAnalysis = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/analysis/${repo}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const results: RepositoryAnalysis = await response.json();
        setAnalysis(results);
      } catch (err) {
        console.error('Failed to fetch analysis results:', err);
        setError('Failed to fetch analysis results. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalysis();
    
  }, [repo]);
  
  const handleReanalyze = () => {
    const fetchAnalysis = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/analysis/${repo}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const results: RepositoryAnalysis = await response.json();
        setAnalysis(results);
      } catch (err) {
        console.error('Failed to re-fetch analysis results:', err);
        setError('Failed to re-fetch analysis results. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalysis();
  };

  if (isLoading) {
    return <AnalysisProgress isAnalyzing={isLoading} />;
  }
  
  if (error) {
    return <div className="text-red-500 text-center mt-20">{error}</div>;
  }
  
  if (!analysis) {
    // This case should ideally be handled by the loading state
    return <div className="text-center mt-20">No analysis data available.</div>;
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

  const handleComponentSelect = (componentName: string) => {
    // Implementation of handleComponentSelect
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
                / {decodedRepo.replace(/-/g, '/')}
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
              {decodedRepo}
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
                      onClick={() => {}}
                      className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 ${
                        'overview' === tab.id
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
              {/* Overview Tab */}
              <div className="space-y-8">
                {/* Repository Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-8 h-8 text-blue-400" />
                      <div>
                        <p className="text-sm text-gray-400">Total Files</p>
                        <p className="text-2xl font-bold">{analysis.metrics.totalFiles}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex items-center space-x-3">
                      <BarChart3 className="w-8 h-8 text-green-400" />
                      <div>
                        <p className="text-sm text-gray-400">Lines of Code</p>
                        <p className="text-2xl font-bold">{analysis.metrics.totalLines}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex items-center space-x-3">
                      <Layers className="w-8 h-8 text-purple-400" />
                      <div>
                        <p className="text-sm text-gray-400">Components</p>
                        <p className="text-2xl font-bold">{analysis.architecture.components.length}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex items-center space-x-3">
                      <TrendingUp className="w-8 h-8 text-yellow-400" />
                      <div>
                        <p className="text-sm text-gray-400">Dependencies</p>
                        <p className="text-2xl font-bold">{analysis.architecture.relationships.length}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dependency Graph */}
                <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                  <h3 className="text-xl font-bold mb-4">Dependency Graph</h3>
                  <DependencyGraph 
                    components={analysis.architecture.components}
                    relationships={analysis.architecture.relationships}
                  />
                </div>

                {/* Analysis Insights */}
                <div>
                  <h3 className="text-xl font-bold mb-6">Analysis Insights</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {analysis.insights.hotspots && analysis.insights.hotspots.length > 0 && (
                      <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                        <h4 className="font-bold text-lg text-white mb-3 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.5-7C13.5 1 15 2.5 15 5c2 0 4.5 2.5 4.5 2.5a8 8 0 01-1.843 11.157z" /></svg>
                          Hotspots
                        </h4>
                        <ul className="space-y-2">
                          {analysis.insights.hotspots.map((file) => (
                            <li key={file.path} className="text-sm text-gray-400 bg-black/20 p-3 rounded-md">
                              <span className="font-mono block truncate">{file.path}</span>
                              <span className="text-xs text-gray-500">{file.commitCount} commits</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {analysis.insights.highComplexityFiles && analysis.insights.highComplexityFiles.length > 0 && (
                      <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                        <h4 className="font-bold text-lg text-white mb-3 flex items-center">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707.707M12 21v-1" /></svg>
                          High Complexity
                        </h4>
                        <ul className="space-y-2">
                          {analysis.insights.highComplexityFiles.map((file) => (
                            <li key={file.path} className="text-sm text-gray-400 bg-black/20 p-3 rounded-md">
                              <span className="font-mono block truncate">{file.path}</span>
                              <span className="text-xs text-gray-500">Complexity: {file.complexity}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                     {analysis.insights.entryPoints && analysis.insights.entryPoints.length > 0 && (
                      <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                        <h4 className="font-bold text-lg text-white mb-3 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
                          Entry Points
                        </h4>
                         <ul className="space-y-2">
                          {analysis.insights.entryPoints.slice(0, 5).map((file) => (
                            <li key={file.path} className="text-sm text-gray-400 bg-black/20 p-3 rounded-md">
                              <span className="font-mono block truncate">{file.path}</span>
                               <span className="text-xs text-gray-500">{file.exports.slice(0, 3).join(', ')}{file.exports.length > 3 ? '...' : ''}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Architecture Tab */}
              {/* ... existing code ... */}

              {/* Complexity Tab */}
              {/* ... existing code ... */}

              {/* Learning Tab */}
              {/* ... existing code ... */}

              {/* Files Tab */}
              {/* ... existing code ... */}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
} 