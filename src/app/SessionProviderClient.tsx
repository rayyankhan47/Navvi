"use client";
import { ReactNode } from "react";
import SessionProviderWrapper from "./SessionProviderWrapper";

export default function SessionProviderClient({ children }: { children: ReactNode }) {
  return <SessionProviderWrapper>{children}</SessionProviderWrapper>;
} 