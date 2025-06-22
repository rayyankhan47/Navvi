"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { 
  Github, 
  Zap, 
  Code, 
  Brain, 
  TrendingUp, 
  Users, 
  ArrowRight,
  Star,
  CheckCircle,
  Play
} from "lucide-react";

// Floating Code Particle Component
const CodeParticle = ({ delay = 0 }: { delay?: number }) => {
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [color, setColor] = useState('');
  
  useEffect(() => {
    setMounted(true);
    const colors = [
      'text-green-500/50',
      'text-blue-500/50',
      'text-red-500/50',
      'text-yellow-500/50'
    ];
    setColor(colors[Math.floor(Math.random() * colors.length)]);

    const animate = () => {
      setPosition({
        x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
        y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800)
      });
    };
    
    const interval = setInterval(animate, 3000 + delay * 1000);
    return () => clearInterval(interval);
  }, [delay]);

  const codeSnippets = [
    "function analyze() {",
    "const complexity = calculate();",
    "return insights;",
    "}",
    "class AnalysisEngine {",
    "async parse() {",
    "// Real AST parsing",
    "}",
    "}"
  ];

  if (!mounted) return null;

  return (
    <motion.div
      className={`absolute text-xs font-mono pointer-events-none ${color}`}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: [0, 1, 0], 
        scale: [0, 1, 0],
        x: position.x,
        y: position.y
      }}
      transition={{ 
        duration: 4, 
        repeat: Infinity, 
        delay,
        ease: "easeInOut"
      }}
    >
      {codeSnippets[Math.floor(Math.random() * codeSnippets.length)]}
    </motion.div>
  );
};

// Real-time Analysis Demo Component
const AnalysisDemo = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [mounted, setMounted] = useState(false);
  const steps = [
    "🔍 Scanning repository...",
    "📊 Parsing AST...",
    "🧠 Analyzing complexity...",
    "🏗️ Building architecture...",
    "✨ Generating insights...",
    "✅ Analysis complete!"
  ];

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) {
    return (
      <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl p-6 font-mono">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-green-400 text-sm">navvi-analysis</span>
        </div>
        <div className="space-y-2">
          <div className="text-sm text-gray-500">🔍 Scanning repository...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl p-6 font-mono">
      <div className="flex items-center space-x-2 mb-4">
        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
        <span className="text-green-400 text-sm">navvi-analysis</span>
      </div>
      <div className="space-y-2">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            className={`text-sm transition-colors ${
              index === currentStep ? 'text-lime-400' : 'text-gray-500'
            }`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ 
              opacity: index === currentStep ? 1 : 0.5,
              x: index === currentStep ? 0 : -20
            }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {step}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Feature Card Component
const FeatureCard = ({ 
  icon: Icon, 
  title, 
  description, 
  gradient 
}: { 
  icon: any; 
  title: string; 
  description: string; 
  gradient: string;
}) => (
  <motion.div
    className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300"
    whileHover={{ y: -8, scale: 1.02 }}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, ease: "easeInOut" }}
  >
    <div className={`w-12 h-12 ${gradient} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
    <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
  </motion.div>
);

// Testimonial Component
const Testimonial = ({ 
  name, 
  role, 
  company, 
  content, 
  avatar 
}: { 
  name: string; 
  role: string; 
  company: string; 
  content: string; 
  avatar: string;
}) => (
  <motion.div
    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, ease: "easeInOut" }}
  >
    <div className="flex items-start space-x-4">
      <img src={avatar} alt={name} className="w-12 h-12 rounded-full" />
      <div className="flex-1">
        <p className="text-gray-300 text-sm leading-relaxed mb-4">"{content}"</p>
        <div>
          <div className="font-semibold text-white">{name}</div>
          <div className="text-gray-400 text-sm">{role} at {company}</div>
        </div>
      </div>
    </div>
  </motion.div>
);

export default function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div ref={containerRef} className="min-h-screen bg-black text-white overflow-hidden">
      {/* Floating Code Particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <CodeParticle key={i} delay={i * 0.2} />
      ))}

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 border border-white/20 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">N</span>
              </div>
              <span className="text-xl font-bold">Navvi</span>
            </div>
            <div className="flex items-center space-x-6">
              <Link href="/security" className="text-gray-300 hover:text-white transition-colors">
                Security
              </Link>
              <Link href="/auth/signin" className="text-gray-300 hover:text-white transition-colors">
                Sign In
              </Link>
              <Link 
                href="/auth/signin"
                className="bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <motion.section 
        style={{ y, opacity }}
        className="relative min-h-screen flex items-center justify-center text-center px-6"
      >
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeInOut", delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400 pb-4"
          >
            Developer Onboarding, Automated.
          </motion.div>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeInOut", delay: 0.4 }}
            className="mt-6 text-lg text-gray-400 max-w-2xl mx-auto"
          >
            Navvi is an AI-powered assistant that accelerates developer onboarding by creating interactive, context-aware roadmaps for any codebase.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeInOut", delay: 0.6 }}
            className="mt-10 flex justify-center items-center space-x-4"
          >
            <Link 
              href="/auth/signin"
              className="bg-white/10 border border-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-lg font-semibold text-lg hover:bg-white/20 transition-colors flex items-center space-x-2"
            >
              <Zap className="w-5 h-5" />
              <span>Analyze a Repo</span>
            </Link>
            <button className="group flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
              <Play className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
              <span>Watch Demo</span>
            </button>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Not Another GPT Wrapper
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              We actually parse your code, analyze complexity, and build interactive learning experiences.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={Code}
              title="Real AST Parsing"
              description="Actual code structure analysis using Babel and Tree-sitter. We read your code, not just chat about it."
              gradient="bg-gradient-to-r from-blue-500 to-blue-600"
            />
            <FeatureCard
              icon={Brain}
              title="Complexity Analysis"
              description="Cyclomatic, cognitive, and halstead complexity metrics. Understand what makes code hard to maintain."
              gradient="bg-gradient-to-r from-purple-500 to-purple-600"
            />
            <FeatureCard
              icon={Zap}
              title="Interactive Visualizations"
              description="3D architecture maps, dependency graphs, and real-time code flow visualization."
              gradient="bg-gradient-to-r from-green-500 to-green-600"
            />
            <FeatureCard
              icon={TrendingUp}
              title="Personalized Learning"
              description="Adaptive tutorials that match your experience level and role. Learn what matters to you."
              gradient="bg-gradient-to-r from-orange-500 to-orange-600"
            />
            <FeatureCard
              icon={Users}
              title="Team Onboarding"
              description="Get new developers productive in days, not months. Share knowledge and reduce ramp-up time."
              gradient="bg-gradient-to-r from-pink-500 to-pink-600"
            />
            <FeatureCard
              icon={Star}
              title="Open Source"
              description="Built with transparency and privacy in mind. Your code stays on your infrastructure."
              gradient="bg-gradient-to-r from-indigo-500 to-indigo-600"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Dive In?
          </h2>
          <p className="text-xl text-gray-400 mb-10">
            Start analyzing your first repository for free. No credit card required.
          </p>
          <Link
            href="/auth/signin"
            className="bg-white/10 border border-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/20 transition-colors inline-flex items-center space-x-2"
          >
            <Zap className="w-6 h-6" />
            <span>Get Started Free</span>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-black border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-center md:text-left">
          <div className="mb-6 md:mb-0">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 border border-white/20 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">N</span>
              </div>
              <span className="text-xl font-bold">Navvi</span>
            </div>
          </div>
          <div className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Navvi. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
