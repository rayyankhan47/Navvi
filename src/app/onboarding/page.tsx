"use client";

import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Code, 
  Brain, 
  TrendingUp, 
  Users, 
  Clock, 
  BookOpen,
  ArrowRight,
  CheckCircle,
  Github
} from "lucide-react";

const experienceLevels = [
  { value: "JUNIOR", label: "Junior Developer", description: "0-2 years of experience" },
  { value: "MID", label: "Mid-level Developer", description: "2-5 years of experience" },
  { value: "SENIOR", label: "Senior Developer", description: "5+ years of experience" },
  { value: "LEAD", label: "Tech Lead", description: "Leading teams and architecture" },
];

const workEnvironments = [
  { value: "SDE", label: "Software Development", icon: Code },
  { value: "AI", label: "AI/ML", icon: Brain },
  { value: "FINTECH", label: "Fintech", icon: TrendingUp },
  { value: "STARTUP", label: "Startup", icon: Users },
  { value: "ENTERPRISE", label: "Enterprise", icon: Users },
  { value: "OTHER", label: "Other", icon: Code },
];

const timeCommitments = [
  { value: "MINIMAL", label: "Minimal", description: "15-30 minutes per session" },
  { value: "MODERATE", label: "Moderate", description: "30-60 minutes per session" },
  { value: "INTENSIVE", label: "Intensive", description: "1+ hours per session" },
];

const learningStyles = [
  { value: "VISUAL", label: "Visual", description: "Diagrams, charts, and visual explanations" },
  { value: "TEXT", label: "Text-based", description: "Detailed written explanations" },
  { value: "INTERACTIVE", label: "Interactive", description: "Hands-on exercises and examples" },
  { value: "MIXED", label: "Mixed", description: "Combination of all styles" },
];

const programmingLanguages = [
  "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Go", "Rust", 
  "PHP", "Ruby", "Swift", "Kotlin", "Scala", "R", "MATLAB", "Other"
];

const focusAreas = [
  "Architecture & Design", "Testing & Quality", "Performance", "Security", 
  "DevOps & CI/CD", "Database Design", "API Design", "Frontend Development", 
  "Backend Development", "Mobile Development", "Machine Learning", "Other"
];

export default function OnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    experienceLevel: "",
    workEnvironment: "",
    preferredLanguages: [] as string[],
    focusAreas: [] as string[],
    timeCommitment: "",
    learningStyle: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Redirect authenticated users who have already completed onboarding
    if (status === "authenticated" && (session?.user as any)?.onboardingCompleted) {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-t-blue-500 border-gray-800 rounded-full animate-spin"></div>
          <span>Loading session...</span>
        </div>
      </div>
    );
  }

  // If authenticated, but onboarding is already complete, show a redirecting message
  // The useEffect above will handle the actual redirect.
  if (status === "authenticated" && (session?.user as any)?.onboardingCompleted) {
      return <div className="min-h-screen bg-black flex items-center justify-center text-white">Redirecting to your dashboard...</div>;
  }

  // If unauthenticated, show a sign-in prompt
  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white p-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md text-center bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-2xl p-8"
        >
          <div className="w-16 h-16 mx-auto mb-6 bg-blue-500/10 border-2 border-blue-500/30 rounded-full flex items-center justify-center">
             <span className="text-3xl font-bold text-blue-300">N</span>
          </div>
          <h1 className="text-3xl font-bold mb-3">Welcome to Navvi</h1>
          <p className="text-gray-400 mb-8">
            Let&apos;s get you started by connecting your GitHub account.
          </p>
          <button
            onClick={() => signIn("github", { callbackUrl: "/onboarding" })}
            className="w-full bg-white text-black font-semibold py-3 px-6 rounded-lg flex items-center justify-center space-x-2 hover:bg-gray-200 transition-all duration-300"
          >
            <Github className="w-5 h-5" />
            <span>Connect with GitHub</span>
          </button>
        </motion.div>
      </div>
    );
  }
  
  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayField = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field as keyof typeof prev].includes(value)
        ? (prev[field as keyof typeof prev] as string[]).filter(item => item !== value)
        : [...(prev[field as keyof typeof prev] as string[]), value]
    }));
  };

  const handleSubmit = async () => {
    if (!session?.user) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/user/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push("/dashboard");
      } else {
        console.error("Failed to save onboarding data");
      }
    } catch (error) {
      console.error("Error saving onboarding data:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    {
      title: "What&apos;s your experience level?",
      description: "This helps us tailor the learning content to your needs",
      content: (
        <div className="grid gap-4">
          {experienceLevels.map((level) => (
            <motion.button
              key={level.value}
              onClick={() => updateFormData("experienceLevel", level.value)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                formData.experienceLevel === level.value
                  ? "border-blue-500 bg-blue-500/10"
                  : "border-gray-700 hover:border-gray-600"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="font-semibold text-white">{level.label}</div>
              <div className="text-gray-400 text-sm">{level.description}</div>
            </motion.button>
          ))}
        </div>
      ),
    },
    {
      title: "What industry do you work in?",
      description: "This helps us provide relevant examples and context",
      content: (
        <div className="grid grid-cols-2 gap-4">
          {workEnvironments.map((env) => {
            const Icon = env.icon;
            return (
              <motion.button
                key={env.value}
                onClick={() => updateFormData("workEnvironment", env.value)}
                className={`p-4 rounded-lg border-2 text-center transition-all ${
                  formData.workEnvironment === env.value
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-gray-700 hover:border-gray-600"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                <div className="font-semibold text-white">{env.label}</div>
              </motion.button>
            );
          })}
        </div>
      ),
    },
    {
      title: "What programming languages do you use?",
      description: "Select all that apply",
      content: (
        <div className="grid grid-cols-3 gap-3">
          {programmingLanguages.map((lang) => (
            <motion.button
              key={lang}
              onClick={() => toggleArrayField("preferredLanguages", lang)}
              className={`p-3 rounded-lg border-2 text-center transition-all ${
                formData.preferredLanguages.includes(lang)
                  ? "border-blue-500 bg-blue-500/10"
                  : "border-gray-700 hover:border-gray-600"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-sm font-medium text-white">{lang}</div>
            </motion.button>
          ))}
        </div>
      ),
    },
    {
      title: "What areas do you want to focus on?",
      description: "Select topics you&apos;re most interested in learning",
      content: (
        <div className="grid grid-cols-2 gap-3">
          {focusAreas.map((area) => (
            <motion.button
              key={area}
              onClick={() => toggleArrayField("focusAreas", area)}
              className={`p-3 rounded-lg border-2 text-center transition-all ${
                formData.focusAreas.includes(area)
                  ? "border-blue-500 bg-blue-500/10"
                  : "border-gray-700 hover:border-gray-600"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-sm font-medium text-white">{area}</div>
            </motion.button>
          ))}
        </div>
      ),
    },
    {
      title: "How much time can you commit?",
      description: "This helps us pace the learning content appropriately",
      content: (
        <div className="grid gap-4">
          {timeCommitments.map((commitment) => (
            <motion.button
              key={commitment.value}
              onClick={() => updateFormData("timeCommitment", commitment.value)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                formData.timeCommitment === commitment.value
                  ? "border-blue-500 bg-blue-500/10"
                  : "border-gray-700 hover:border-gray-600"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center space-x-3">
                <Clock className="w-6 h-6 text-blue-400" />
                <div>
                  <div className="font-semibold text-white">{commitment.label}</div>
                  <div className="text-gray-400 text-sm">{commitment.description}</div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      ),
    },
    {
      title: "How do you prefer to learn?",
      description: "Choose your preferred learning style",
      content: (
        <div className="grid gap-4">
          {learningStyles.map((style) => (
            <motion.button
              key={style.value}
              onClick={() => updateFormData("learningStyle", style.value)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                formData.learningStyle === style.value
                  ? "border-blue-500 bg-blue-500/10"
                  : "border-gray-700 hover:border-gray-600"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center space-x-3">
                <BookOpen className="w-6 h-6 text-blue-400" />
                <div>
                  <div className="font-semibold text-white">{style.label}</div>
                  <div className="text-gray-400 text-sm">{style.description}</div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      ),
    },
  ];

  const canProceed = () => {
    const step = steps[currentStep];
    if (step.title.includes("experience level")) return formData.experienceLevel;
    if (step.title.includes("industry")) return formData.workEnvironment;
    if (step.title.includes("languages")) return formData.preferredLanguages.length > 0;
    if (step.title.includes("focus on")) return formData.focusAreas.length > 0;
    if (step.title.includes("time")) return formData.timeCommitment;
    if (step.title.includes("learn")) return formData.learningStyle;
    return false;
  };

  const canGoBack = currentStep > 0;
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <nav className="border-b border-gray-800/50 backdrop-blur-xl bg-black/20">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold">Navvi</span>
            </div>
            <div className="text-sm text-gray-400">
              Step {currentStep + 1} of {steps.length}
            </div>
          </div>
        </div>
      </nav>

      {/* Progress Bar */}
      <div className="w-full bg-gray-800 h-1">
        <motion.div
          className="bg-blue-500 h-1"
          initial={{ width: 0 }}
          animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4">{steps[currentStep].title}</h1>
          <p className="text-xl text-gray-400">{steps[currentStep].description}</p>
        </motion.div>

        <motion.div
          key={`content-${currentStep}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-12"
        >
          {steps[currentStep].content}
        </motion.div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <motion.button
            onClick={() => setCurrentStep(prev => prev - 1)}
            disabled={!canGoBack}
            className={`px-6 py-3 rounded-lg border transition-all ${
              canGoBack
                ? "border-gray-600 text-gray-300 hover:border-gray-500 hover:text-white"
                : "border-gray-800 text-gray-600 cursor-not-allowed"
            }`}
            whileHover={canGoBack ? { scale: 1.02 } : {}}
            whileTap={canGoBack ? { scale: 0.98 } : {}}
          >
            Back
          </motion.button>

          <motion.button
            onClick={isLastStep ? handleSubmit : () => setCurrentStep(prev => prev + 1)}
            disabled={!canProceed() || isSubmitting}
            className={`px-8 py-3 rounded-lg flex items-center space-x-2 transition-all ${
              canProceed() && !isSubmitting
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-gray-700 text-gray-400 cursor-not-allowed"
            }`}
            whileHover={canProceed() && !isSubmitting ? { scale: 1.02 } : {}}
            whileTap={canProceed() && !isSubmitting ? { scale: 0.98 } : {}}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : isLastStep ? (
              <>
                <span>Complete Setup</span>
                <CheckCircle className="w-5 h-5" />
              </>
            ) : (
              <>
                <span>Next</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </motion.button>
        </div>
      </main>
    </div>
  );
} 