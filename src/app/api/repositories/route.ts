import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    console.log("Session:", {
      hasSession: !!session,
      hasAccessToken: !!session?.accessToken,
      accessTokenLength: session?.accessToken?.length,
      user: session?.user
    });
    
    if (!session?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user's repositories from GitHub
    const response = await fetch("https://api.github.com/user/repos?sort=updated&per_page=100", {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        "User-Agent": "Navvi-App",
      },
    });

    console.log("GitHub API response:", {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("GitHub API error response:", errorText);
      throw new Error(`GitHub API error: ${response.status} - ${errorText}`);
    }

    const repositories = await response.json();

    // Filter and format repositories
    const formattedRepos = repositories
      .map((repo: any) => ({
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description,
        language: repo.language,
        updated_at: repo.updated_at,
        private: repo.private,
        fork: repo.fork,
        owner: { login: repo.owner.login },
        html_url: repo.html_url,
        clone_url: repo.clone_url,
      }));

    return NextResponse.json(formattedRepos);
  } catch (error) {
    console.error("Error fetching repositories:", error);
    return NextResponse.json(
      { error: "Failed to fetch repositories" },
      { status: 500 }
    );
  }
} 