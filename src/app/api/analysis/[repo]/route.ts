import { NextResponse } from "next/server";
import analysisResults from "../../../../lib/analysisStore";

// In a real application, you'd store analysis results in a database
// For now, we'll return a placeholder response
export async function GET(
  { params }: { params: Promise<{ repo: string }> }
) {
  const { repo } = await params;
  const repoName = repo;

  if (analysisResults.has(repoName)) {
    const analysis = analysisResults.get(repoName);
    return NextResponse.json(analysis);
  } else {
    return NextResponse.json(
      { error: "Analysis not found or expired. Please try analyzing again." },
      { status: 404 }
    );
  }
} 