import "./globals.css";
import type { Metadata } from "next";
import SessionProviderClient from "./SessionProviderClient";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Navvi - AI-Powered Onboarding Buddy",
  description: "AI-powered onboarding for developers. Analyze codebases, generate learning paths, and onboard faster.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black">
        <SessionProviderClient>
          <Header />
          <main className="pt-20">
          {children}
          </main>
        </SessionProviderClient>
      </body>
    </html>
  );
}
