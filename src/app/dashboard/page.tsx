"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Github, 
  Search, 
  Settings, 
  LogOut, 
  Plus,
  Clock,
  TrendingUp,
  Users,
  Code,
  ArrowRight
} from "lucide-react";
import AnalysisProgress from "../../components/AnalysisProgress";

interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  language: string | null;
  updated_at: string;
  private: boolean;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRepo, setSelectedRepo] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchRepositories();
    }
  }, [session]);

  const fetchRepositories = async () => {
    try {
      const response = await fetch("/api/repositories");
      if (response.ok) {
        const data = await response.json();
        setRepositories(data);
      } else {
        console.error("Failed to fetch repositories");
      }
    } catch (error) {
      console.error("Error fetching repositories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeRepository = async () => {
    if (!selectedRepo) return;
    
    // Find the selected repository object to get the full name and URL
    const selectedRepository = repositories.find(repo => repo.full_name === selectedRepo);
    if (!selectedRepository) {
      setAnalysisError("Repository not found");
      return;
    }
    
    setIsAnalyzing(true);
    setAnalysisError("");
    
    try {
      const repoUrl = `https://github.com/${selectedRepository.full_name}.git`;
      console.log('Selected repository:', selectedRepository);
      console.log('Repository URL being sent:', repoUrl);
      
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          repository: selectedRepo,
          repoUrl: repoUrl
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log("Analysis completed:", result);
        
        // Navigate to analysis results
        const safeRepoName = selectedRepo.replace(/\//g, '-');
        router.push(`/analysis/${safeRepoName}`);
      } else {
        const errorData = await response.json();
        console.error("Analysis failed:", errorData);
        setAnalysisError(errorData.error || "Failed to analyze repository");
        setIsAnalyzing(false);
      }
    } catch (error) {
      console.error("Network error:", error);
      setAnalysisError("Network error occurred");
      setIsAnalyzing(false);
    }
  };

  const handleAnalysisComplete = () => {
    setIsAnalyzing(false);
    // Navigation will be handled by the API response
  };

  const filteredRepositories = repositories.filter(repo =>
    repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    repo.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="spinner"></div>
          <span className="text-white">Loading your repositories...</span>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Analysis Progress Modal */}
      <AnalysisProgress 
        isAnalyzing={isAnalyzing} 
        onComplete={handleAnalysisComplete}
      />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-lime-500 to-green-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">N</span>
                </div>
                <span className="text-xl font-bold">Navvi</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <img
                  src={session.user?.image || ""}
                  alt="Profile"
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-white font-medium">
                  {session.user?.name}
                </span>
              </div>
              <button
                onClick={() => signOut()}
                className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-20 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div 
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl font-bold mb-4">
              Welcome back, {session.user?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-xl text-gray-400">
              Choose a repository to analyze and create an interactive onboarding experience.
            </p>
          </motion.div>

          {/* Quick Stats */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Github className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{repositories.length}</div>
                  <div className="text-sm text-gray-400">Repositories</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold">0</div>
                  <div className="text-sm text-gray-400">Analyses</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold">0</div>
                  <div className="text-sm text-gray-400">Learning Paths</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold">0</div>
                  <div className="text-sm text-gray-400">Team Members</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Repository Selection */}
          <motion.div 
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Choose a Repository</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search repositories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>
            </div>
            
            {repositories.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Github className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  No repositories found
                </h3>
                <p className="text-gray-400">
                  Make sure you have repositories in your GitHub account and have granted the necessary permissions.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredRepositories.map((repo) => (
                  <motion.div
                    key={repo.id}
                    className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-300 ${
                      selectedRepo === repo.full_name
                        ? "border-blue-500 bg-blue-500/10"
                        : "border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10"
                    }`}
                    onClick={() => setSelectedRepo(repo.full_name)}
                    whileHover={{ y: -2 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-semibold text-white">
                            {repo.name}
                          </h3>
                          {repo.private && (
                            <span className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded-full">
                              Private
                            </span>
                          )}
                        </div>
                        {repo.description && (
                          <p className="text-gray-400 text-sm mt-1">
                            {repo.description}
                          </p>
                        )}
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          {repo.language && (
                            <span className="flex items-center space-x-1">
                              <Code className="w-4 h-4" />
                              <span>{repo.language}</span>
                            </span>
                          )}
                          <span>
                            Updated {new Date(repo.updated_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="w-5 h-5 border-2 rounded-full flex items-center justify-center">
                        {selectedRepo === repo.full_name && (
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Action Button */}
          {selectedRepo && (
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <button
                onClick={handleAnalyzeRepository}
                disabled={isAnalyzing}
                className={selectedRepo 
                  ? "bg-gradient-to-r from-lime-500 to-green-600 hover:from-lime-600 hover:to-green-700 text-white transform hover:scale-105"
                  : "bg-gray-600 text-gray-400 cursor-not-allowed"
                }
              >
                {isAnalyzing ? (
                  <>
                    <div className="spinner"></div>
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <span>Analyze {selectedRepo.split('/')[1]}</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
              {analysisError && (
                <p className="text-red-400 text-sm mt-3">
                  {analysisError}
                </p>
              )}
              {!analysisError && (
                <p className="text-sm text-gray-400 mt-3">
                  This will create an interactive onboarding experience for your codebase
                </p>
              )}
            </motion.div>
          )}

          {/* Features Preview */}
          <motion.div 
            className="mt-16 grid md:grid-cols-3 gap-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                <Code className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Real Code Analysis</h3>
              <p className="text-gray-400 text-sm">
                AST parsing, dependency graphs, and complexity metrics - not just AI chat
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Interactive Visualizations</h3>
              <p className="text-gray-400 text-sm">
                Explore architecture maps and component relationships in real-time
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Personalized Learning</h3>
              <p className="text-gray-400 text-sm">
                Adaptive tutorials that match your experience level and role
              </p>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
} 