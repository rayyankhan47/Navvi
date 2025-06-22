import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      experienceLevel,
      workEnvironment,
      preferredLanguages,
      focusAreas,
      timeCommitment,
      learningStyle,
    } = body;

    // Get the user from our database
    const user = await prisma.user.findFirst({
      where: {
        githubUsername: (session.user as any).username,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update user with onboarding data
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        experienceLevel,
        workEnvironment,
        preferredLanguages,
        focusAreas,
        timeCommitment,
        learningStyle,
        onboardingCompleted: true,
      },
    });

    // Create user preferences
    await prisma.userPreferences.upsert({
      where: { userId: user.id },
      update: {
        preferredComplexity: "INTERMEDIATE", // Default value
        theme: "dark",
      },
      create: {
        userId: user.id,
        preferredComplexity: "INTERMEDIATE",
        theme: "dark",
      },
    });

    return NextResponse.json({ 
      success: true, 
      user: updatedUser 
    });

  } catch (error) {
    console.error("Error saving onboarding data:", error);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
} 