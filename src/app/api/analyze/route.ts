import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";
import { AnalysisEngine } from "../../../lib/analysisEngine";

// Simple in-memory storage for analysis results (in production, use a database)
const analysisResults = new Map<string, any>();

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { repository, repoUrl } = await request.json();

    if (!repository || !repoUrl) {
      return NextResponse.json({ error: "Repository and repoUrl are required" }, { status: 400 });
    }

    console.log(`Starting analysis for repository: ${repository} at ${repoUrl}`);

    // Initialize the analysis engine with access token for private repositories
    const engine = new AnalysisEngine(undefined, session.accessToken as string);
    
    // Set up progress callback for real-time updates
    engine.setProgressCallback((progress) => {
      console.log(`Analysis progress: ${progress.stage} - ${progress.progress}% - ${progress.message}`);
    });

    // Analyze the actual repository
    const analysis = await engine.analyzeRepository(repoUrl);

    console.log("Analysis completed successfully");

    // Store the analysis results for later retrieval
    const safeRepoName = repository.replace(/\//g, '-');
    analysisResults.set(safeRepoName, analysis);

    return NextResponse.json({
      success: true,
      analysis,
      message: "Repository analysis completed successfully"
    });

  } catch (error: any) {
    console.error("Analysis error:", error);
    
    // Provide more specific error messages
    let errorMessage = "Failed to analyze repository";
    
    if (error.message.includes("Failed to clone repository")) {
      errorMessage = "Failed to clone repository. Please check if the repository is public or you have access to it.";
    } else if (error.message.includes("No supported files found")) {
      errorMessage = "Repository contains no supported file types (JavaScript, TypeScript, JSX, TSX).";
    } else if (error.message.includes("ENOENT")) {
      errorMessage = "Repository not found or access denied.";
    } else if (error.message.includes("authentication")) {
      errorMessage = "Authentication failed. Please check your GitHub access token.";
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// Export the analysis results map for use in other API routes
export { analysisResults }; 