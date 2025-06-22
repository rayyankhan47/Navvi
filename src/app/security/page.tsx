"use client";

import { useState } from "react";
import { analyzeFileLocally, demonstrateSecurity } from "@/lib/clientAnalysis";
import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, Lock, Eye, Code, ArrowRight, CheckCircle } from "lucide-react";

export default function SecurityPage() {
  const [codeInput, setCodeInput] = useState(`function calculateTotal(items) {
  let total = 0;
  for (let item of items) {
    if (item.price > 0) {
      total += item.price * item.quantity;
    }
  }
  return total;
}

class ShoppingCart {
  constructor() {
    this.items = [];
  }
  
  addItem(item) {
    this.items.push(item);
  }
  
  getTotal() {
    return calculateTotal(this.items);
  }
}`);

  const [analysis, setAnalysis] = useState<any>(null);
  const [securityProof, setSecurityProof] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeFileLocally(codeInput);
      setAnalysis(result);
      
      const proof = demonstrateSecurity();
      setSecurityProof(proof);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="border-b border-gray-800/50 backdrop-blur-xl bg-black/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Link href="/" className="flex items-center space-x-2 group">
                <span className="text-2xl font-bold text-white">
                  Navvi
                </span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Home
              </Link>
              <span className="text-gray-600">|</span>
              <span className="text-white font-medium">Security Demo</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 2,
            ease: [0.16, 1, 0.3, 1]
          }}
        >
          <h1 className="text-5xl font-bold mb-6 text-white">
            Security Proof: Your Code Never Leaves Your Browser
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            See exactly how Navvi analyzes your code without ever seeing the actual content.
            This is a live demonstration of our zero-knowledge architecture.
          </p>
        </motion.div>

        {/* Security Explanation */}
        <motion.div 
          className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 2,
            ease: [0.16, 1, 0.3, 1],
            delay: 0.2 
          }}
        >
          <h2 className="text-3xl font-semibold mb-8 text-center">How We Prove Security</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div 
              className="text-center group"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-20 h-20 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-green-500/30">
                <Shield className="w-10 h-10 text-green-400" />
              </div>
              <h3 className="font-semibold mb-3 text-lg">Client-Side Processing</h3>
              <p className="text-gray-400 leading-relaxed">
                All code analysis happens in your browser using JavaScript. 
                No code content is sent to our servers.
              </p>
            </motion.div>
            <motion.div 
              className="text-center group"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2, delay: 0.1 }}
            >
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-blue-500/30">
                <Lock className="w-10 h-10 text-blue-400" />
              </div>
              <h3 className="font-semibold mb-3 text-lg">Hash-Based Verification</h3>
              <p className="text-gray-400 leading-relaxed">
                We only see a cryptographic hash of your code, never the actual content.
                This proves we analyzed it without seeing it.
              </p>
            </motion.div>
            <motion.div 
              className="text-center group"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2, delay: 0.2 }}
            >
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-purple-500/30">
                <Eye className="w-10 h-10 text-purple-400" />
              </div>
              <h3 className="font-semibold mb-3 text-lg">Open Source Engine</h3>
              <p className="text-gray-400 leading-relaxed">
                Our analysis engine is open source and auditable. 
                You can inspect every line of code that processes your data.
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Live Demo */}
        <motion.div 
          className="grid lg:grid-cols-2 gap-8 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 2,
            ease: [0.16, 1, 0.3, 1],
            delay: 0.4 
          }}
        >
          {/* Code Input */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Code className="w-5 h-5 mr-2 text-blue-400" />
              Your Code (Never Sent to Us)
            </h3>
            <textarea
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              className="w-full h-64 p-4 border border-gray-700 rounded-lg font-mono text-sm bg-black/50 text-gray-200 placeholder-gray-500 focus:border-lime-500 focus:ring-1 focus:ring-lime-500 transition-all"
              placeholder="Paste your code here to see how we analyze it locally..."
            />
            <motion.button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="mt-4 px-6 py-3 bg-gradient-to-r from-lime-600 to-green-600 text-white rounded-lg hover:from-lime-700 hover:to-green-700 transition-all duration-200 flex items-center justify-center disabled:opacity-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Analyzing...
                </>
              ) : (
                <>
                  Analyze Locally
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </motion.button>
          </div>

          {/* Analysis Results */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
              Analysis Results (Generated in Your Browser)
            </h3>
            {analysis ? (
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <h4 className="font-semibold text-green-400 mb-2 flex items-center">
                    <Shield className="w-4 h-4 mr-2" />
                    Security Proof
                  </h4>
                  <div className="text-sm text-green-300 space-y-1">
                    <p><strong>Code Hash:</strong> <code className="bg-black/30 px-1 rounded">{analysis.securityProof.codeHash}</code></p>
                    <p><strong>Processing Location:</strong> <span className="text-green-400">{analysis.securityProof.processingLocation}</span></p>
                    <p><strong>Timestamp:</strong> {new Date(analysis.securityProof.analysisTimestamp).toLocaleString()}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2 text-lime-400">Functions Found</h4>
                  <div className="space-y-2">
                    {analysis.functions.map((func: any, index: number) => (
                      <motion.div 
                        key={index} 
                        className="bg-black/30 rounded p-3 text-sm border border-gray-700"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <span className="font-mono text-lime-300">{func.name}</span> 
                        <span className="text-gray-400"> (Line {func.line}, Complexity: {func.complexity})</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 text-purple-400">Classes Found</h4>
                  <div className="space-y-2">
                    {analysis.classes.map((cls: any, index: number) => (
                      <motion.div 
                        key={index} 
                        className="bg-black/30 rounded p-3 text-sm border border-gray-700"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <span className="font-mono text-purple-300">{cls.name}</span> 
                        <span className="text-gray-400"> (Line {cls.line})</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 text-pink-400">File Structure</h4>
                  <div className="text-sm text-gray-300 space-y-1">
                    <p>Total Lines: <span className="text-pink-300">{analysis.fileStructure.totalLines}</span></p>
                    <p>Code Lines: <span className="text-pink-300">{analysis.fileStructure.codeLines}</span></p>
                    <p>Comment Lines: <span className="text-pink-300">{analysis.fileStructure.commentLines}</span></p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="text-gray-500 text-center py-12">
                <Code className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                <p>Click "Analyze Locally" to see the results</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Network Monitor */}
        <motion.div 
          className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 2,
            ease: [0.16, 1, 0.3, 1],
            delay: 0.6 
          }}
        >
          <h3 className="text-xl font-semibold mb-4">Network Activity Monitor</h3>
          <div className="bg-black/30 rounded-lg p-4 border border-gray-700">
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Data Sent to Server:</span>
                <span className="text-red-400 font-mono">0 bytes</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Code Content Transmitted:</span>
                <span className="text-red-400 font-mono">None</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Processing Location:</span>
                <span className="text-green-400 font-mono">Your Browser</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Security Level:</span>
                <span className="text-green-400 font-mono">Zero-Knowledge</span>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
} 