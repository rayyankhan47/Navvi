"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Github } from "lucide-react";

export default function SignIn() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (session) {
      router.push("/dashboard");
    }
  }, [session, router]);

  const handleGitHubSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn("github", { callbackUrl: "/dashboard" });
    } catch (error) {
      console.error("Sign in error:", error);
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="w-8 h-8 border border-white/20 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-lg">N</span>
                        </div>
                        <span className="text-xl font-bold">Navvi</span>
                    </Link>
                </div>
            </div>
        </nav>

        {/* Sign In Section */}
        <section className="relative min-h-screen flex items-center justify-center px-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeInOut" }}
                className="relative z-10 max-w-md w-full"
            >
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl shadow-lg p-8">
                    <div className="text-center mb-6">
                        <h1 className="text-3xl font-bold text-white mb-2">
                            Connect to Get Started
                        </h1>
                        <p className="text-gray-400">
                            Sign in with GitHub to analyze your first repository.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <button
                            onClick={handleGitHubSignIn}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center space-x-3 bg-white/10 border border-white/20 backdrop-blur-sm text-white rounded-xl py-3 px-6 hover:bg-white/20 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <Github className="w-5 h-5" />
                            )}
                            <span>
                                {isLoading ? "Connecting..." : "Continue with GitHub"}
                            </span>
                        </button>

                        <div className="text-center">
                            <p className="text-xs text-gray-500">
                                By signing in, you agree to our Terms and Privacy Policy.
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </section>
    </div>
  );
} 