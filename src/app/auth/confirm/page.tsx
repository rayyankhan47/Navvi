"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { LogIn, LogOut } from "lucide-react";
import { useEffect } from "react";

export default function ConfirmPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/onboarding");
    }
  }, [status, router]);

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-t-blue-500 border-gray-800 rounded-full animate-spin"></div>
          <span>Loading session...</span>
        </div>
      </div>
    );
  }

  const handleSignOutAndSignIn = async () => {
    await signOut({ redirect: false });
    signIn("github");
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md text-center bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-2xl p-8"
      >
        {session?.user?.image && (
          <Image
            src={session.user.image}
            alt={session.user.name ?? "User Avatar"}
            width={80}
            height={80}
            className="rounded-full mx-auto mb-6 border-4 border-blue-500/50"
          />
        )}
        <h1 className="text-2xl font-bold mb-2">
          Signed in as {session?.user?.name}
        </h1>
        <p className="text-gray-400 mb-8">
          Continue to your dashboard or use a different account.
        </p>
        <div className="flex flex-col space-y-4">
           <button
            onClick={() => router.push("/dashboard")}
            className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center space-x-2 hover:bg-blue-500 transition-all duration-300"
          >
            <LogIn className="w-5 h-5" />
            <span>Continue as {session?.user?.name}</span>
          </button>
          <button
            onClick={handleSignOutAndSignIn}
            className="w-full bg-white/10 border border-white/20 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center space-x-2 hover:bg-white/20 transition-all duration-300"
          >
            <LogOut className="w-5 h-5" />
            <span>Use another account</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
} 