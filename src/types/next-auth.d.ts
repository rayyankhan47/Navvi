import "next-auth";
import { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user?: {
      username?: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    username?: string;
  }

  interface Profile {
    id?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    accessToken?: string;
    username?: string;
  }
} 