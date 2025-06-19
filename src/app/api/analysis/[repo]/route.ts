import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";
import { analysisResults } from "../../analyze/route";

// In a real application, you'd store analysis results in a database
// For now, we'll return a placeholder response
export async function GET(
  request: NextRequest,
  { params }: { params: { repo: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const repoName = params.repo.replace(/-/g, '/');
    
    console.log(`Fetching analysis results for repository: ${repoName}`);

    // Check if we have analysis results for this repository
    const storedAnalysis = analysisResults.get(params.repo);
    
    if (storedAnalysis) {
      console.log(`Found stored analysis results for ${params.repo}`);
      return NextResponse.json(storedAnalysis);
    }

    // If no analysis results found, return a message to run analysis first
    const noAnalysisData = {
      repository: repoName,
      files: [],
      architecture: {
        components: [],
        relationships: [],
        layers: [],
        patterns: [],
        dataFlow: []
      },
      criticalPaths: [],
      metrics: {
        totalFiles: 0,
        totalLines: 0,
        languages: {},
        averageComplexity: 0,
        maxComplexity: 0,
        maintainabilityIndex: 100,
        technicalDebt: 0
      },
      insights: {
        architecturalStyle: 'Unknown',
        codeQuality: 'Unknown',
        complexityDistribution: 'Analysis not yet completed',
        potentialIssues: ['Analysis results not available'],
        recommendations: ['Run analysis from dashboard to see results'],
        learningPath: {
          difficulty: 'beginner',
          estimatedTime: 0,
          modules: [],
          prerequisites: []
        }
      },
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(noAnalysisData);

  } catch (error) {
    console.error("Error fetching analysis results:", error);
    return NextResponse.json(
      { error: "Failed to fetch analysis results" },
      { status: 500 }
    );
  }
} 