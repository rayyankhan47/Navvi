"use client";

import { useState, useEffect } from "react";

interface AnalysisProgressProps {
  isAnalyzing: boolean;
  onComplete?: () => void;
}

interface ProgressData {
  stage: 'cloning' | 'parsing' | 'analyzing' | 'generating' | 'complete';
  progress: number;
  message: string;
  currentFile?: string;
}

export default function AnalysisProgress({ isAnalyzing, onComplete }: AnalysisProgressProps) {
  const [progress, setProgress] = useState<ProgressData>({
    stage: 'parsing',
    progress: 0,
    message: 'Starting analysis...'
  });

  useEffect(() => {
    if (!isAnalyzing) return;

    // Simulate progress updates (in real implementation, this would come from WebSocket or Server-Sent Events)
    const stages = [
      { stage: 'parsing' as const, message: 'Scanning repository files...', duration: 2000 },
      { stage: 'analyzing' as const, message: 'Analyzing code structure...', duration: 3000 },
      { stage: 'generating' as const, message: 'Generating insights...', duration: 2000 },
      { stage: 'complete' as const, message: 'Analysis complete!', duration: 500 }
    ];

    let currentStage = 0;
    const interval = setInterval(() => {
      if (currentStage < stages.length) {
        const stage = stages[currentStage];
        const progressPercent = ((currentStage + 1) / stages.length) * 100;
        
        setProgress({
          stage: stage.stage,
          progress: progressPercent,
          message: stage.message
        });

        if (stage.stage === 'complete') {
          setTimeout(() => {
            onComplete?.();
          }, stage.duration);
        }

        currentStage++;
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isAnalyzing, onComplete]);

  if (!isAnalyzing) return null;

  const getStageIcon = (stage: ProgressData['stage']) => {
    switch (stage) {
      case 'parsing':
        return (
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'analyzing':
        return (
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        );
      case 'generating':
        return (
          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'complete':
        return (
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getStageColor = (stage: ProgressData['stage']) => {
    switch (stage) {
      case 'parsing': return 'text-blue-600';
      case 'analyzing': return 'text-green-600';
      case 'generating': return 'text-purple-600';
      case 'complete': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="text-center">
          {/* Progress Icon */}
          <div className="flex justify-center mb-6">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
              progress.stage === 'complete' ? 'bg-green-100' : 'bg-blue-100'
            }`}>
              {getStageIcon(progress.stage)}
            </div>
          </div>

          {/* Progress Title */}
          <h3 className="text-xl font-semibold text-black mb-2">
            {progress.stage === 'complete' ? 'Analysis Complete!' : 'Analyzing Repository'}
          </h3>

          {/* Progress Message */}
          <p className="text-black mb-6">
            {progress.message}
          </p>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div 
              className="bg-gradient-to-r from-blue-600 to-indigo-600 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress.progress}%` }}
            ></div>
          </div>

          {/* Progress Percentage */}
          <p className="text-sm text-black mb-4">
            {Math.round(progress.progress)}% complete
          </p>

          {/* Current File (if available) */}
          {progress.currentFile && (
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="text-xs text-black font-mono">
                Processing: {progress.currentFile}
              </p>
            </div>
          )}

          {/* Stage Indicator */}
          <div className="flex justify-center space-x-2">
            {['parsing', 'analyzing', 'generating', 'complete'].map((stage, index) => (
              <div
                key={stage}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  progress.stage === stage 
                    ? 'bg-blue-600 scale-125' 
                    : index < ['parsing', 'analyzing', 'generating', 'complete'].indexOf(progress.stage)
                    ? 'bg-green-500'
                    : 'bg-gray-300'
                }`}
              ></div>
            ))}
          </div>

          {/* Cancel Button (only show if not complete) */}
          {progress.stage !== 'complete' && (
            <button 
              className="mt-6 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              onClick={() => onComplete?.()}
            >
              Cancel Analysis
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 