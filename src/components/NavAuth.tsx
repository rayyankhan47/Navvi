"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import Image from "next/image";

export const NavAuth = () => {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center space-x-6">
        <div className="h-6 w-16 bg-gray-800 rounded-md animate-pulse"></div>
        <div className="h-10 w-24 bg-gray-700 rounded-lg animate-pulse"></div>
      </div>
    );
  }

  if (status === "authenticated") {
    return (
      <div className="flex items-center space-x-4">
         <Link href="/security" className="text-gray-300 hover:text-white transition-colors">
          Security
        </Link>
        <Link href="/dashboard" className="flex items-center space-x-3 group">
          <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
            {session.user?.name?.split(' ')[0]}
          </span>
          {session.user?.image && (
            <Image
              src={session.user.image}
              alt={session.user.name ?? "User"}
              width={32}
              height={32}
              className="rounded-full border-2 border-white/20 group-hover:border-white/50 transition-all"
            />
          )}
        </Link>
      </div>
    );
  }

  return (
     <div className="flex items-center space-x-6">
      <Link href="/security" className="text-gray-300 hover:text-white transition-colors">
        Security
      </Link>
      <Link href="/auth/confirm" className="text-gray-300 hover:text-white transition-colors">
        Sign In
      </Link>
      <Link
        href="/onboarding"
        className="bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
      >
        Get Started
      </Link>
    </div>
  )
} 