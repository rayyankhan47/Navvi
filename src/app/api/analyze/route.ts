import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";
import { AnalysisEngine } from "../../../lib/analysisEngine";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { repository } = await request.json();

    if (!repository) {
      return NextResponse.json({ error: "Repository is required" }, { status: 400 });
    }

    console.log(`Starting analysis for repository: ${repository}`);

    // Initialize the analysis engine
    const engine = new AnalysisEngine();
    
    // Set up progress callback for real-time updates
    engine.setProgressCallback((progress) => {
      console.log(`Analysis progress: ${progress.stage} - ${progress.progress}% - ${progress.message}`);
    });

    // For now, we'll analyze the current project directory as a test
    // In production, this would clone the actual repository
    const analysis = await engine.analyzeRepository(process.cwd());

    console.log("Analysis completed successfully");

    return NextResponse.json({
      success: true,
      analysis,
      message: "Repository analysis completed successfully"
    });

  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze repository" },
      { status: 500 }
    );
  }
} 