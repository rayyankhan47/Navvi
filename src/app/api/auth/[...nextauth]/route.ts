import NextAuth, { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import type { JWT } from "next-auth/jwt";
import type { Session, User } from "next-auth";
import type { Account, Profile } from "next-auth";

// GitHub profile type
interface GitHubProfile extends Profile {
  id: string;
  login: string;
  avatar_url: string;
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'read:user repo'
        }
      }
    }),
  ],
  callbacks: {
    async signIn({ user, profile }) {
      if (profile) {
        const githubProfile = profile as GitHubProfile;
        try {
          await prisma.user.update({
            where: { id: user.id },
            data: { githubUsername: githubProfile.login },
          });
        } catch (error) {
          console.error("Failed to add github username:", error);
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      if (user) {
        token.id = user.id;
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { githubUsername: true, onboardingCompleted: true },
        });
        if (dbUser) {
          token.username = dbUser.githubUsername || undefined;
          token.onboardingCompleted = dbUser.onboardingCompleted;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.onboardingCompleted = token.onboardingCompleted as boolean;
      }
      session.accessToken = token.accessToken as string;
      return session;
    },
  },
  session: {
    strategy: 'jwt'
  },
  secret: process.env.NEXTAUTH_SECRET
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 