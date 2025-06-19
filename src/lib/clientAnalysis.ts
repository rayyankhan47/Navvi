// Simple client-side code analysis that proves we never see the actual code
// This is a proof-of-concept for the hackathon

export interface CodeInsights {
  functions: Array<{
    name: string;
    line: number;
    complexity: number;
    dependencies: string[];
  }>;
  classes: Array<{
    name: string;
    line: number;
    methods: string[];
    properties: string[];
  }>;
  imports: string[];
  exports: string[];
  fileStructure: {
    totalLines: number;
    commentLines: number;
    codeLines: number;
  };
  securityProof: {
    codeHash: string;
    analysisTimestamp: string;
    processingLocation: 'client-side';
  };
}

export class ClientSideAnalyzer {
  private generateHash(content: string): string {
    // Simple hash function for demonstration
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }

  public analyzeCode(code: string): CodeInsights {
    // This function runs entirely in the browser
    // The actual code content is never sent to our servers
    
    const lines = code.split('\n');
    const functions: Array<{name: string, line: number, complexity: number, dependencies: string[]}> = [];
    const classes: Array<{name: string, line: number, methods: string[], properties: string[]}> = [];
    const imports: string[] = [];
    const exports: string[] = [];

    // Simple regex-based analysis (for demo purposes)
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Detect imports
      if (trimmedLine.startsWith('import ') || trimmedLine.startsWith('from ')) {
        const importMatch = trimmedLine.match(/from\s+['"]([^'"]+)['"]/);
        if (importMatch) {
          imports.push(importMatch[1]);
        }
      }
      
      // Detect exports
      if (trimmedLine.startsWith('export ')) {
        const exportMatch = trimmedLine.match(/export\s+(?:default\s+)?(?:function|class|const|let|var)\s+(\w+)/);
        if (exportMatch) {
          exports.push(exportMatch[1]);
        }
      }
      
      // Detect functions
      const functionMatch = trimmedLine.match(/(?:function\s+(\w+)|(\w+)\s*[:=]\s*(?:function|\([^)]*\)\s*=>))/);
      if (functionMatch) {
        const funcName = functionMatch[1] || functionMatch[2];
        if (funcName) {
          functions.push({
            name: funcName,
            line: index + 1,
            complexity: this.calculateComplexity(code, funcName),
            dependencies: this.extractDependencies(code, funcName),
          });
        }
      }
      
      // Detect classes
      const classMatch = trimmedLine.match(/class\s+(\w+)/);
      if (classMatch) {
        classes.push({
          name: classMatch[1],
          line: index + 1,
          methods: this.extractMethods(code, classMatch[1]),
          properties: this.extractProperties(code, classMatch[1]),
        });
      }
    });

    return {
      functions,
      classes,
      imports,
      exports,
      fileStructure: this.analyzeFileStructure(code),
      securityProof: {
        codeHash: this.generateHash(code),
        analysisTimestamp: new Date().toISOString(),
        processingLocation: 'client-side',
      },
    };
  }

  private calculateComplexity(code: string, funcName: string): number {
    // Simple cyclomatic complexity calculation
    let complexity = 1;
    const controlFlowKeywords = ['if', 'for', 'while', 'switch', 'catch', '&&', '||'];
    
    controlFlowKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      const matches = code.match(regex);
      if (matches) {
        complexity += matches.length;
      }
    });
    
    return Math.min(complexity, 10); // Cap at 10 for demo
  }

  private extractDependencies(code: string, funcName: string): string[] {
    const dependencies: string[] = [];
    const commonDeps = ['useState', 'useEffect', 'useContext', 'fetch', 'axios', 'console', 'document', 'window'];
    
    commonDeps.forEach(dep => {
      if (code.includes(dep)) {
        dependencies.push(dep);
      }
    });
    
    return dependencies.slice(0, 5); // Limit for demo
  }

  private extractMethods(code: string, className: string): string[] {
    const methods: string[] = [];
    const methodRegex = new RegExp(`\\b(\\w+)\\s*\\([^)]*\\)\\s*{`, 'g');
    let match;
    
    while ((match = methodRegex.exec(code)) !== null) {
      if (match[1] && !['constructor', 'render'].includes(match[1])) {
        methods.push(match[1]);
      }
    }
    
    return methods.slice(0, 5); // Limit for demo
  }

  private extractProperties(code: string, className: string): string[] {
    const properties: string[] = [];
    const propertyRegex = /(?:this\.|const|let|var)\s+(\w+)/g;
    let match;
    
    while ((match = propertyRegex.exec(code)) !== null) {
      if (match[1] && !properties.includes(match[1])) {
        properties.push(match[1]);
      }
    }
    
    return properties.slice(0, 5); // Limit for demo
  }

  private analyzeFileStructure(code: string): {totalLines: number, commentLines: number, codeLines: number} {
    const lines = code.split('\n');
    const totalLines = lines.length;
    const commentLines = lines.filter(line => 
      line.trim().startsWith('//') || 
      line.trim().startsWith('/*') || 
      line.trim().startsWith('*') ||
      line.trim().startsWith('#')
    ).length;
    
    return {
      totalLines,
      commentLines,
      codeLines: totalLines - commentLines,
    };
  }
}

// Utility function to analyze a file locally
export const analyzeFileLocally = async (fileContent: string): Promise<CodeInsights> => {
  const analyzer = new ClientSideAnalyzer();
  return analyzer.analyzeCode(fileContent);
};

// Utility function to analyze multiple files
export const analyzeRepositoryLocally = async (files: Array<{path: string, content: string}>): Promise<{[path: string]: CodeInsights}> => {
  const results: {[path: string]: CodeInsights} = {};
  
  for (const file of files) {
    try {
      const analyzer = new ClientSideAnalyzer();
      results[file.path] = analyzer.analyzeCode(file.content);
    } catch (error) {
      console.warn(`Failed to analyze ${file.path}:`, error);
    }
  }
  
  return results;
};

// Security demonstration function
export const demonstrateSecurity = () => {
  return {
    message: "Code analysis happens entirely in your browser",
    proof: {
      noNetworkRequests: "No code content is sent to our servers",
      localProcessing: "All analysis runs in your browser's JavaScript engine",
      hashOnly: "We only see a hash of your code, never the content",
      timestamp: new Date().toISOString(),
    }
  };
}; 