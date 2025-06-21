import { FileAnalysis, ComplexityMetrics } from '../types';
import traverse from '@babel/traverse';
import * as t from '@babel/types';

export function analyzeComplexity(files: FileAnalysis[]): ComplexityMetrics {
  let cyclomatic = 0;
  let cognitive = 0;
  let maintainability = 100;
  let fileCount = 0;

  for (const file of files) {
    let fileComplexity = 1;
    // For each function, count branches
    for (const fn of file.functions) {
      fileComplexity += fn.complexity;
    }
    // For the file as a whole, count branches in the AST
    // (Assume file has an 'ast' property for this example, or skip if not)
    // If you want to analyze the AST here, you can pass it in FileAnalysis
    cyclomatic += fileComplexity;
    fileCount++;
  }

  if (fileCount > 0) {
    cyclomatic = Math.round(cyclomatic / fileCount);
    cognitive = cyclomatic; // For now, use cyclomatic as a proxy
    maintainability = Math.max(0, 100 - cyclomatic * 2);
  }

  return { cyclomatic, cognitive, maintainability };
} 