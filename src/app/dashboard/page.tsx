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
  ArrowRight,
  GitFork
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
  fork: boolean;
  owner: {
    login: string;
  };
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [ownedRepositories, setOwnedRepositories] = useState<Repository[]>([]);
  const [collaborativeRepositories, setCollaborativeRepositories] = useState<Repository[]>([]);
  const [forkedRepositories, setForkedRepositories] = useState<Repository[]>([]);
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
        const data: Repository[] = await response.json();
        const userName = session?.user?.username;

        setOwnedRepositories(data.filter(repo => !repo.fork && repo.owner.login === userName));
        setCollaborativeRepositories(data.filter(repo => !repo.fork && repo.owner.login !== userName));
        setForkedRepositories(data.filter(repo => repo.fork));
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
    
    // Combine all repo lists to find the selected one
    const allRepos = [...ownedRepositories, ...collaborativeRepositories, ...forkedRepositories];
    const selectedRepository = allRepos.find(repo => repo.full_name === selectedRepo);
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

  const filteredOwnedRepositories = ownedRepositories.filter(repo =>
    repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    repo.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCollaborativeRepositories = collaborativeRepositories.filter(repo =>
    repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    repo.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredForkedRepositories = forkedRepositories.filter(repo =>
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
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
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
                  <div className="text-2xl font-bold">{ownedRepositories.length}</div>
                  <div className="text-sm text-gray-400">Your Repositories</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{collaborativeRepositories.length}</div>
                  <div className="text-sm text-gray-400">Collaborations</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-lime-500/20 rounded-lg flex items-center justify-center">
                  <GitFork className="w-5 h-5 text-lime-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{forkedRepositories.length}</div>
                  <div className="text-sm text-gray-400">Forked Repositories</div>
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
          </motion.div>

          {/* Repository Selection */}
          <motion.div
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="flex flex-col md:flex-row md:items-center md:space-x-6">
              <div className="flex-grow mb-4 md:mb-0">
                <h2 className="text-2xl font-semibold mb-2">Select a Repository</h2>
                <p className="text-gray-400">
                  Pick from your repositories below or search to find a specific one.
                </p>
              </div>
              <button
                onClick={handleAnalyzeRepository}
                disabled={!selectedRepo || isAnalyzing}
                className="w-full md:w-auto bg-white/10 border border-white/20 backdrop-blur-sm text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-white/20 transition-colors disabled:bg-gray-600/50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <TrendingUp className="w-5 h-5" />
                <span>Analyze</span>
              </button>
            </div>
            
            {analysisError && (
              <div className="mt-4 text-red-500 bg-red-500/10 p-3 rounded-lg">
                {analysisError}
              </div>
            )}

            <div className="mt-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search repositories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-lg pl-12 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="mt-8 space-y-8">
              {/* Owned Repositories */}
              {filteredOwnedRepositories.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Github className="w-5 h-5 mr-2" />
                    Your Repositories
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredOwnedRepositories.map(repo => (
                      <RepoCard 
                        key={repo.id}
                        repo={repo}
                        isSelected={selectedRepo === repo.full_name}
                        onSelect={() => setSelectedRepo(repo.full_name)}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Collaborative Repositories */}
              {filteredCollaborativeRepositories.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Collaborations
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCollaborativeRepositories.map(repo => (
                      <RepoCard 
                        key={repo.id}
                        repo={repo}
                        isSelected={selectedRepo === repo.full_name}
                        onSelect={() => setSelectedRepo(repo.full_name)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Forked Repositories */}
              {filteredForkedRepositories.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <GitFork className="w-5 h-5 mr-2" />
                    Forks
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredForkedRepositories.map(repo => (
                      <RepoCard 
                        key={repo.id}
                        repo={repo}
                        isSelected={selectedRepo === repo.full_name}
                        onSelect={() => setSelectedRepo(repo.full_name)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>

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

// Repository Card Component
const RepoCard = ({ 
  repo, 
  isSelected,
  onSelect
}: { 
  repo: Repository;
  isSelected: boolean;
  onSelect: () => void;
}) => {
  return (
    <motion.div
      onClick={onSelect}
      className={`p-4 rounded-lg cursor-pointer transition-all duration-300 ${
        isSelected
          ? 'bg-blue-500/30 ring-2 ring-blue-400'
          : 'bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/20'
      }`}
      whileHover={{ y: -5 }}
    >
      <div className="flex items-center space-x-3 mb-2">
        <div className="w-8 h-8 flex-shrink-0 bg-black/20 rounded-md flex items-center justify-center">
          <Code className="w-5 h-5 text-gray-400" />
        </div>
        <h4 className="font-semibold truncate flex-1">{repo.name}</h4>
        {repo.private && <span className="text-xs bg-gray-600 px-2 py-1 rounded">Private</span>}
      </div>
      <p className="text-sm text-gray-400 line-clamp-2 h-10">
        {repo.description || 'No description'}
      </p>
      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
        <span>{repo.language || 'N/A'}</span>
        <span>Updated {new Date(repo.updated_at).toLocaleDateString()}</span>
      </div>
    </motion.div>
  );
}; 