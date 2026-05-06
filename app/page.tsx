"use client"
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { 
  ArrowRight, 
  Users, 
  Briefcase, 
  GraduationCap, 
  MessageSquare, 
  Globe, 
  Zap,
  Menu,
  X
} from 'lucide-react'
import { useAuth, UserButton } from "@clerk/nextjs"
import { Logo } from "@/components/ui/logo"
import { ThemeToggle } from "@/components/ui/theme-toggle"

export default function Home() {
  const { userId, isLoaded } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80; // Account for fixed navbar
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    setIsMenuOpen(false);
  };

  const features = [
    {
      icon: <Users className="w-6 h-6 text-primary" />,
      title: "Alumni Directory",
      description: "Connect with graduates from your college across the globe and expand your professional network."
    },
    {
      icon: <Briefcase className="w-6 h-6 text-orange-500" />,
      title: "Career Opportunities",
      description: "Access exclusive job postings, internships, and mentorship programs shared by your alumni community."
    },
    {
      icon: <MessageSquare className="w-6 h-6 text-emerald-500" />,
      title: "Direct Messaging",
      description: "Reach out to seniors and peers directly for advice, referrals, or collaboration."
    },
    {
      icon: <Globe className="w-6 h-6 text-purple-500" />,
      title: "Global Community",
      description: "Be part of a thriving ecosystem that transcends borders and disciplines."
    }
  ]

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 animate-spin rounded-full border-b-2 border-primary" />
          <p className="text-slate-500 font-medium animate-pulse">Loading Grad Loop...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#020617] font-sans text-slate-900 dark:text-slate-100 selection:bg-primary/20 dark:selection:bg-primary/30">
      {/* Dark mode mesh background */}
      <div className="fixed inset-0 -z-50 hidden dark:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,#1e293b,transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,#0f172a,transparent)]" />
      </div>
      {/* Floating Navbar — grid [1fr auto 1fr] guarantees center pill is always truly centered */}
      <nav className="fixed top-4 left-4 right-4 z-50 grid grid-cols-[1fr_auto_1fr] items-center gap-3">

        {/* Left cell — Logo + Name */}
        <div className="flex justify-start">
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-full bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/10 shadow-sm shadow-black/5 dark:shadow-black/30 backdrop-blur-md">
            <Logo className="w-7 h-7 flex-shrink-0" />
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap"
            >
              Grad Loop
            </motion.span>
          </div>
        </div>

        {/* Center cell — Nav Links (desktop only) */}
        <div className="hidden md:flex justify-center">
          <div className="flex items-center gap-1 px-2 py-2 rounded-full bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/10 shadow-sm shadow-black/5 dark:shadow-black/30 backdrop-blur-md">
            <button
              onClick={() => scrollToSection('about')}
              className="px-4 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all duration-200 cursor-pointer"
            >
              About
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="px-4 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all duration-200 cursor-pointer"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('community')}
              className="px-4 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all duration-200 cursor-pointer"
            >
              Community
            </button>
          </div>
        </div>

        {/* Right cell — Actions */}
        <div className="flex justify-end">
          <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/10 shadow-sm shadow-black/5 dark:shadow-black/30 backdrop-blur-md">
            <ThemeToggle />
            {userId ? (
              <UserButton appearance={{ elements: { userButtonAvatarBox: "size-7 border border-slate-200 dark:border-slate-700" } }} />
            ) : (
              <>
                <Button asChild variant="ghost" className="hidden md:inline-flex rounded-full h-8 px-4 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800">
                  <Link href="/sign-in">Log in</Link>
                </Button>
                <Button asChild className="rounded-full h-8 px-4 text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/25">
                  <Link href="/sign-up">Sign up</Link>
                </Button>
              </>
            )}
            {/* Mobile hamburger */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
            >
              {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown — spans full width */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="absolute top-14 left-0 right-0 col-span-3 md:hidden bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-2xl shadow-black/10 dark:shadow-black/50 border border-slate-200 dark:border-white/10 backdrop-blur-md"
          >
            <div className="flex flex-col gap-1">
              <button onClick={() => scrollToSection('about')} className="text-base font-medium text-left px-4 py-3 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">About</button>
              <button onClick={() => scrollToSection('features')} className="text-base font-medium text-left px-4 py-3 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">Features</button>
              <button onClick={() => scrollToSection('community')} className="text-base font-medium text-left px-4 py-3 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">Community</button>
              <hr className="my-1 border-slate-100 dark:border-slate-800" />
              {userId ? (
                <div className="flex justify-center py-3">
                  <UserButton appearance={{ elements: { userButtonAvatarBox: "size-10" } }} />
                </div>
              ) : (
                <div className="flex flex-col gap-2 pt-1">
                  <Button asChild className="w-full rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/20">
                    <Link href="/sign-up" onClick={() => setIsMenuOpen(false)}>Sign up</Link>
                  </Button>
                  <Button asChild variant="ghost" className="w-full rounded-xl font-medium text-slate-600 dark:text-slate-400">
                    <Link href="/sign-in" onClick={() => setIsMenuOpen(false)}>Log in</Link>
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </nav>

      <main>
        {/* Hero Section */}
        <section id="about" className="relative pt-36 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
          {/* Background Elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 dark:bg-primary/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-orange-100/50 dark:bg-orange-900/10 rounded-full blur-[120px]" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-b from-slate-900 to-slate-600 dark:from-white dark:to-slate-400"
            >
              Connect with your <br className="hidden md:block" />
              <span className="text-primary">Alumni Legacy</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="max-w-2xl mx-auto text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 leading-relaxed"
            >
              The ultimate platform for graduates to stay connected, share opportunities, and grow together. Join Grad Loop today and unlock the power of your community.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
            >
              <Button asChild size="lg" className="rounded-full px-8 py-7 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/25 transition-all hover:scale-105">
                <Link href="/home">
                  Go to Home <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button onClick={() => scrollToSection('features')} variant="outline" size="lg" className="rounded-full px-8 py-7 text-lg font-semibold border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all cursor-pointer">
                Explore Features
              </Button>
            </motion.div>

            {/* Mockup Section */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative max-w-5xl mx-auto"
            >
              <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-2xl bg-white dark:bg-slate-900/50 backdrop-blur-sm p-2 md:p-4 group">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-inner">
                  <Image 
                    src="/dashboard-hero.png" 
                    alt="Grad Loop Dashboard" 
                    width={1200} 
                    height={800} 
                    className="w-full h-auto object-cover"
                    priority
                  />
                </div>
                {/* Hero Glow in Dark Mode */}
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200 hidden dark:block -z-10"></div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-orange-500/10 blur-3xl rounded-full -z-10" />
              <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-primary/10 blur-3xl rounded-full -z-10" />
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-white dark:bg-slate-950 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-24">
              <h2 className="text-4xl md:text-6xl font-bold mb-6">Everything you need to thrive</h2>
              <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-lg">
                Grad Loop provides powerful tools to keep your alumni community engaged and productive.
              </p>
            </div>

            <div className="space-y-32 md:space-y-48">
              {/* Alumni Directory */}
              <div className="flex flex-col md:flex-row items-stretch justify-center gap-12 lg:gap-20">
                <motion.div 
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  className="w-full md:w-1/2 max-w-md relative flex"
                >
                  <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full -z-10" />
                  <div className="rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl w-full flex">
                    <Image 
                      src="/mentor.png" 
                      alt="Alumni Directory" 
                      width={600} 
                      height={800} 
                      className="w-full h-auto object-contain bg-slate-50 dark:bg-slate-900" 
                    />
                  </div>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  className="w-full md:w-1/2 max-w-xl space-y-6 flex flex-col justify-center"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-3xl md:text-5xl font-bold">Alumni Directory</h3>
                  <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
                    Connect with graduates from your college across the globe. Expand your professional network with people who share your academic background.
                  </p>
                  <Button asChild variant="outline" className="rounded-full px-8 py-6 text-lg font-medium border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all w-fit">
                    <Link href={userId ? "/home" : "/sign-in"}>Explore Directory</Link>
                  </Button>
                </motion.div>
              </div>

              {/* Career Opportunities */}
              <div className="flex flex-col md:flex-row-reverse items-stretch justify-center gap-12 lg:gap-20">
                <motion.div 
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  className="w-full md:w-1/2 max-w-lg relative flex"
                >
                  <div className="absolute inset-0 bg-orange-500/10 blur-3xl rounded-full -z-10" />
                  <div className="rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl w-full flex">
                    <Image src="/opportunity.png" alt="Career Opportunities" width={800} height={600} className="w-full h-auto object-contain bg-slate-50 dark:bg-slate-900" />
                  </div>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  className="w-full md:w-1/2 max-w-xl space-y-6 flex flex-col justify-center"
                >
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="text-3xl md:text-5xl font-bold">Career Opportunities</h3>
                  <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
                    Access exclusive job postings, internships, and mentorship programs shared directly by your alumni community. Your next career move starts here.
                  </p>
                  <Button asChild variant="outline" className="rounded-full px-8 py-6 text-lg font-medium border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all w-fit">
                    <Link href={userId ? "/opportunities" : "/sign-in"}>View Jobs</Link>
                  </Button>
                </motion.div>
              </div>

              {/* Direct Messaging */}
              <div className="flex flex-col md:flex-row items-stretch justify-center gap-12 lg:gap-20">
                <motion.div 
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  className="w-full md:w-1/2 max-w-lg relative flex"
                >
                  <div className="absolute inset-0 bg-emerald-500/10 blur-3xl rounded-full -z-10" />
                  <div className="rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl w-full flex">
                    <Image src="/chat.png" alt="Direct Messaging" width={800} height={600} className="w-full h-auto object-contain bg-slate-50 dark:bg-slate-900" />
                  </div>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  className="w-full md:w-1/2 max-w-xl space-y-6 flex flex-col justify-center"
                >
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h3 className="text-3xl md:text-5xl font-bold">Direct Messaging</h3>
                  <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
                    Reach out to seniors and peers directly. Get advice, referrals, or collaborate on projects with a built-in real-time chat system designed for professionals.
                  </p>
                  <Button asChild variant="outline" className="rounded-full px-8 py-6 text-lg font-medium border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all w-fit">
                    <Link href={userId ? "/chats" : "/sign-in"}>Start Chatting</Link>
                  </Button>
                </motion.div>
              </div>

              {/* Resume Studio */}
              <div className="flex flex-col md:flex-row-reverse items-stretch justify-center gap-12 lg:gap-20">
                <motion.div 
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  className="w-full md:w-1/2 max-w-lg relative flex"
                >
                  <div className="absolute inset-0 bg-purple-500/10 blur-3xl rounded-full -z-10" />
                  <div className="rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl w-full flex">
                    <Image src="/resume.png" alt="Resume Studio" width={800} height={600} className="w-full h-auto object-contain bg-slate-50 dark:bg-slate-900" />
                  </div>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  className="w-full md:w-1/2 max-w-xl space-y-6 flex flex-col justify-center"
                >
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                    <Zap className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="text-3xl md:text-5xl font-bold">Resume Studio</h3>
                  <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
                    Create and analyze your resume with AI-powered tools. Get instant feedback on how to improve your CV to stand out in a competitive job market.
                  </p>
                  <Button asChild variant="outline" className="rounded-full px-8 py-6 text-lg font-medium border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all w-fit">
                    <Link href={userId ? "/resume" : "/sign-in"}>Build My Resume</Link>
                  </Button>
                </motion.div>
              </div>

              {/* Global Community */}
              <div className="flex flex-col md:flex-row items-stretch justify-center gap-12 lg:gap-20">
                <motion.div 
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  className="w-full md:w-1/2 max-w-lg relative flex"
                >
                  <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full -z-10" />
                  <div className="rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl w-full flex">
                    <Image src="/community.png" alt="Global Community" width={800} height={600} className="w-full h-auto object-contain bg-slate-50 dark:bg-slate-900" />
                  </div>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  className="w-full md:w-1/2 max-w-xl space-y-6 flex flex-col justify-center"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Globe className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-3xl md:text-5xl font-bold">Global Community</h3>
                  <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
                    Be part of a thriving ecosystem that transcends borders. Join interest groups, attend virtual meetups, and stay connected with the global alumni network.
                  </p>
                  <Button asChild variant="outline" className="rounded-full px-8 py-6 text-lg font-medium border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all w-fit">
                    <Link href={userId ? "/home" : "/sign-in"}>Join Community</Link>
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section id="community" className="py-24 bg-slate-50/50 dark:bg-slate-900/20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden bg-primary rounded-[2.5rem] p-8 md:p-16 text-center text-primary-foreground shadow-2xl shadow-primary/20">
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-primary-foreground/20 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-96 h-96 bg-black/20 rounded-full blur-3xl" />
              
              <h2 className="text-3xl md:text-5xl font-bold mb-6 relative z-10">Ready to join your community?</h2>
              <p className="text-primary-foreground/80 mb-10 text-lg max-w-xl mx-auto relative z-10">
                Join thousands of alumni already connecting and growing on Grad Loop. Your next opportunity is just a click away.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 relative z-10">
                <Button asChild size="lg" className="rounded-full px-10 py-7 text-lg font-bold bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-xl transition-all hover:scale-105">
                  <Link href="/sign-up">Create Account</Link>
                </Button>
                <Link href="/sign-in" className="text-primary-foreground font-medium hover:underline underline-offset-4 decoration-white/30 hover:decoration-white transition-all">
                  Already have an account? Log in
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-100 dark:border-white/10 bg-white dark:bg-[#020617]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-8">
            <div className="flex items-center gap-2">
              <Logo className="w-8 h-8" />
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Grad Loop</span>
            </div>
            
            <div className="flex gap-8 text-sm text-slate-500 dark:text-slate-400">
              <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link>
              <Link href="#" className="hover:text-primary transition-colors">Contact Us</Link>
            </div>
          </div>
          
          <div className="text-center md:text-left text-sm text-slate-400 dark:text-slate-600 border-t border-slate-100 dark:border-slate-900 pt-8">
            © {new Date().getFullYear()} Grad Loop. All rights reserved. Built for the community.
          </div>
        </div>
      </footer>
    </div>
  )
}
