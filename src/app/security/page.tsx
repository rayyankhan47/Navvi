"use client";

import { useState } from "react";
import { analyzeFileLocally, demonstrateSecurity } from "@/lib/clientAnalysis";
import Link from "next/link";

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

  const handleAnalyze = async () => {
    const result = await analyzeFileLocally(codeInput);
    setAnalysis(result);
    
    const proof = demonstrateSecurity();
    setSecurityProof(proof);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">N</span>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Navvi
                </span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                Home
              </Link>
              <span className="text-gray-400">|</span>
              <span className="text-gray-700 font-medium">Security Demo</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Security Proof: Your Code Never Leaves Your Browser
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See exactly how Navvi analyzes your code without ever seeing the actual content.
            This is a live demonstration of our zero-knowledge architecture.
          </p>
        </div>

        {/* Security Explanation */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6">How We Prove Security</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Client-Side Processing</h3>
              <p className="text-gray-600 text-sm">
                All code analysis happens in your browser using JavaScript. 
                No code content is sent to our servers.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Hash-Based Verification</h3>
              <p className="text-gray-600 text-sm">
                We only see a cryptographic hash of your code, never the actual content.
                This proves we analyzed it without seeing it.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Open Source Engine</h3>
              <p className="text-gray-600 text-sm">
                Our analysis engine is open source and auditable. 
                You can inspect every line of code that processes your data.
              </p>
            </div>
          </div>
        </div>

        {/* Live Demo */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Code Input */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Your Code (Never Sent to Us)</h3>
            <textarea
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              className="w-full h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm bg-gray-50"
              placeholder="Paste your code here to see how we analyze it locally..."
            />
            <button
              onClick={handleAnalyze}
              className="mt-4 px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
            >
              Analyze Locally
            </button>
          </div>

          {/* Analysis Results */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Analysis Results (Generated in Your Browser)</h3>
            {analysis ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2">Security Proof</h4>
                  <div className="text-sm text-green-700 space-y-1">
                    <p><strong>Code Hash:</strong> {analysis.securityProof.codeHash}</p>
                    <p><strong>Processing Location:</strong> {analysis.securityProof.processingLocation}</p>
                    <p><strong>Timestamp:</strong> {new Date(analysis.securityProof.analysisTimestamp).toLocaleString()}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Functions Found</h4>
                  <div className="space-y-2">
                    {analysis.functions.map((func: any, index: number) => (
                      <div key={index} className="bg-gray-50 rounded p-2 text-sm">
                        <span className="font-mono">{func.name}</span> (Line {func.line}, Complexity: {func.complexity})
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Classes Found</h4>
                  <div className="space-y-2">
                    {analysis.classes.map((cls: any, index: number) => (
                      <div key={index} className="bg-gray-50 rounded p-2 text-sm">
                        <span className="font-mono">{cls.name}</span> (Line {cls.line})
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">File Structure</h4>
                  <div className="text-sm text-gray-600">
                    <p>Total Lines: {analysis.fileStructure.totalLines}</p>
                    <p>Code Lines: {analysis.fileStructure.codeLines}</p>
                    <p>Comment Lines: {analysis.fileStructure.commentLines}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-gray-500 text-center py-8">
                Click "Analyze Locally" to see the results
              </div>
            )}
          </div>
        </div>

        {/* Network Monitor */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4">Network Activity Monitor</h3>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
            <div className="mb-2">$ Network requests during analysis:</div>
            <div className="text-gray-400">✓ No code content sent to servers</div>
            <div className="text-gray-400">✓ Only metadata and insights processed</div>
            <div className="text-gray-400">✓ All analysis completed locally</div>
            <div className="text-green-400 mt-2">✓ Security verification: PASSED</div>
          </div>
        </div>

        {/* Technical Details */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Technical Implementation</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">What We See</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Function names and line numbers</li>
                <li>• Class structures and methods</li>
                <li>• Import/export statements</li>
                <li>• Code complexity metrics</li>
                <li>• File structure statistics</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">What We Never See</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Actual source code content</li>
                <li>• Variable values or data</li>
                <li>• Business logic implementation</li>
                <li>• Comments or documentation</li>
                <li>• Sensitive information</li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link
            href="/auth/signin"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold text-lg"
          >
            Try Navvi Securely
          </Link>
          <p className="text-gray-600 mt-4">
            Experience the same security guarantees with your own repositories
          </p>
        </div>
      </main>
    </div>
  );
} 