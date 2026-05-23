"use client";

import OnboardingForm from "@/components/OnboardingForm";

export default function OnboardingPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-6 sm:p-12 overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.2),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />
      
      <div className="z-10 w-full max-w-2xl rounded-[32px] border border-white/10 bg-card/50 backdrop-blur-2xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)] sm:p-12 transition-all duration-500 animate-in fade-in slide-in-from-bottom-8">
        <OnboardingForm />
      </div>
    </main>
  );
}