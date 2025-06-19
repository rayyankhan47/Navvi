import "./globals.css";
import type { Metadata } from "next";
import SessionProviderClient from "./SessionProviderClient";

export const metadata: Metadata = {
  title: "Navvi - AI-Powered Onboarding Buddy",
  description: "AI-powered onboarding for developers. Analyze codebases, generate learning paths, and onboard faster.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionProviderClient>
          {children}
        </SessionProviderClient>
      </body>
    </html>
  );
}
