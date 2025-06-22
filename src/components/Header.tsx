"use client";

import Link from "next/link";
import { NavAuth } from "./NavAuth";

export default function Header() {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="w-8 h-8 border border-white/20 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-lg">N</span>
                        </div>
                        <span className="text-xl font-bold text-white">Navvi</span>
                    </Link>
                    <NavAuth />
                </div>
            </div>
        </header>
    );
} 