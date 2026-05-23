"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { X, Check, ArrowRight, ArrowLeft, User, Briefcase, GraduationCap, Globe, Layers, Building } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ROLE_OPTIONS = ["STUDENT", "ALUMNI"] as const;
const DOMAIN_OPTIONS = ["Web", "App", "AI/ML", "CP", "Cybersecurity", "Cloud", "Data"] as const;

type Role = (typeof ROLE_OPTIONS)[number];
type University = { id: number; name: string; domain: string };

export default function OnboardingForm() {
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState<Role>("STUDENT");
  const [graduationYear, setGraduationYear] = useState("");
  const [domain, setDomain] = useState("");
  const [universityId, setUniversityId] = useState<number | "">("");
  const [universities, setUniversities] = useState<University[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [skillSuggestions, setSkillSuggestions] = useState<string[]>([]);
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [company, setCompany] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [openToConnect, setOpenToConnect] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSkillDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetch("/api/universities")
      .then((r) => r.json())
      .then((data) => setUniversities(Array.isArray(data) ? data : []))
      .catch((e) => console.error("Failed to load universities", e));
  }, []);

  const addSkill = (value: string) => {
    const normalized = value.trim();
    if (!normalized) return;

    const exists = skills.some((item) => item.toLowerCase() === normalized.toLowerCase());
    if (exists) {
      setSkillInput("");
      setShowSkillDropdown(false);
      return;
    }

    setSkills([...skills, normalized]);
    setSkillInput("");
    setShowSkillDropdown(false);
  };

  const removeSkill = (value: string) => {
    setSkills(skills.filter((item) => item !== value));
  };

  useEffect(() => {
    const query = skillInput.trim();
    if (query.length < 1) {
      setSkillSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/skills?q=${encodeURIComponent(query)}`, { cache: "no-store" });
        if (!res.ok) {
           setSkillSuggestions([]);
           return;
        }

        const data = (await res.json()) as { skills?: string[] };
        const next = (data.skills ?? []).filter(
          (item) => !skills.some((selected) => selected.toLowerCase() === item.toLowerCase()),
        );
        setSkillSuggestions(next);
      } catch {
        setSkillSuggestions([]);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [skillInput, skills]);

  const validateStep1 = () => {
    if (!firstName.trim() || !lastName.trim() || !graduationYear || !domain || universityId === "") {
      setError("Please fill all required fields in this section.");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (step === 1) {
      if (validateStep1()) setStep(2);
      return;
    }

    setError("");

    if (skills.length === 0) {
      setError("Please select at least one skill.");
      return;
    }

    setIsSubmitting(true);

    const res = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName,
        lastName,
        role,
        graduationYear: Number(graduationYear),
        domain,
        universityId: Number(universityId),
        skills,
        company: company.trim() || null,
        roleTitle: roleTitle.trim() || null,
        openToConnect,
      }),
    });

    setIsSubmitting(false);

    if (!res.ok) {
      setError("Could not save onboarding details. Please try again.");
      return;
    }

    router.push("/home");
  };

  const inputClasses = "flex h-12 w-full rounded-xl border border-input bg-background/40 backdrop-blur-sm px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary transition-all duration-300";

  const labelClasses = "flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 mb-1.5 ml-1";

  const variants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <div className="w-full">
      <div className="mb-10 text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="bg-linear-to-br from-primary to-primary/60 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent sm:text-5xl">
              {step === 1 ? "Complete your profile" : "Professional details"}
            </h1>
            <p className="mt-3 text-muted-foreground text-base">
              {step === 1 
                ? "Tell us a bit about yourself to personalize your experience." 
                : "Highlight your expertise to stand out in the community."}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress Bar */}
      <div className="relative mb-10 h-1.5 w-full overflow-hidden rounded-full bg-muted/20">
        <motion.div
          initial={{ width: "50%" }}
          animate={{ width: step === 1 ? "50%" : "100%" }}
          transition={{ type: "spring", stiffness: 40, damping: 15 }}
          className="absolute h-full bg-linear-to-r from-primary via-primary/80 to-primary/60 shadow-lg shadow-primary/40"
        />
        <div className="absolute top-0 flex w-full justify-around px-1 h-full pointer-events-none">
          <div className="h-full w-px bg-foreground/5" />
          <div className="h-full w-px bg-foreground/5" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              variants={variants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className={labelClasses}><User className="size-3" /> First Name</label>
                  <input className={inputClasses} placeholder="John" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                </div>
                <div className="space-y-1">
                  <label className={labelClasses}><User className="size-3" /> Last Name</label>
                  <input className={inputClasses} placeholder="Doe" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className={labelClasses}><Briefcase className="size-3" /> Role</label>
                  <div className="relative">
                    <select className={`${inputClasses} appearance-none`} value={role} onChange={(e) => setRole(e.target.value as Role)}>
                      {ROLE_OPTIONS.map((option) => (
                        <option key={option} value={option}>{option.charAt(0) + option.slice(1).toLowerCase()}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <Layers className="size-4" />
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className={labelClasses}><GraduationCap className="size-3" /> Graduation Year</label>
                  <input className={inputClasses} placeholder="2026" type="number" min={1990} max={2100} value={graduationYear} onChange={(e) => setGraduationYear(e.target.value)} required />
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className={labelClasses}><Globe className="size-3" /> Primary Domain</label>
                  <select className={inputClasses} value={domain} onChange={(e) => setDomain(e.target.value)} required>
                    <option value="" disabled>Select area of expertise</option>
                    {DOMAIN_OPTIONS.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className={labelClasses}><Building className="size-3" /> University</label>
                  <select className={inputClasses} value={universityId} onChange={(e) => setUniversityId(Number(e.target.value))} required>
                    <option value="" disabled>Select your university</option>
                    {universities.map((uni) => (
                      <option key={uni.id} value={uni.id}>{uni.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              variants={variants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="space-y-3">
                <label className={labelClasses}><Layers className="size-3" /> Skills</label>
                <div className="relative" ref={dropdownRef}>
                  <input
                    className={inputClasses}
                    placeholder="Type a skill (e.g. Next.js, Python) and press Enter"
                    value={skillInput}
                    onFocus={() => setShowSkillDropdown(true)}
                    onChange={(e) => {
                      setSkillInput(e.target.value);
                      setShowSkillDropdown(true);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === ",") {
                        e.preventDefault();
                        addSkill(skillInput);
                      }
                    }}
                  />

                  {showSkillDropdown && skillInput.trim() && (
                    <div className="absolute top-[calc(100%+8px)] z-50 w-full overflow-hidden rounded-xl border bg-popover/90 backdrop-blur-xl text-popover-foreground shadow-2xl animate-in fade-in zoom-in-95">
                      <div className="max-h-[200px] overflow-auto p-2">
                        {skillSuggestions.length > 0 ? (
                          skillSuggestions.map((option) => (
                            <button
                              key={option}
                              type="button"
                              className="relative flex w-full cursor-pointer select-none items-center rounded-lg px-3 py-2 text-sm outline-none transition-colors hover:bg-primary/10 hover:text-primary"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => addSkill(option)}
                            >
                              {option}
                            </button>
                          ))
                        ) : (
                          <button
                            type="button"
                            className="relative flex w-full cursor-pointer select-none items-center rounded-lg px-3 py-2 text-sm outline-none transition-colors hover:bg-primary/10 hover:text-primary"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => addSkill(skillInput)}
                          >
                            Add "{skillInput.trim()}"
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {skills.map((skill) => (
                      <motion.span
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        key={skill}
                        className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-all hover:bg-primary/20 hover:border-primary/40"
                      >
                        {skill}
                        <button type="button" className="rounded-full outline-none focus:ring-2 focus:ring-primary/50" onClick={() => removeSkill(skill)}>
                          <X className="size-3.5 text-primary/60 hover:text-primary transition-colors" />
                        </button>
                      </motion.span>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className={labelClasses}><Building className="size-3" /> Company <span className="text-muted-foreground/50 lowercase font-normal">(Optional)</span></label>
                  <input className={inputClasses} placeholder="Google" value={company} onChange={(e) => setCompany(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className={labelClasses}><Briefcase className="size-3" /> Role/Title <span className="text-muted-foreground/50 lowercase font-normal">(Optional)</span></label>
                  <input className={inputClasses} placeholder="Software Engineer" value={roleTitle} onChange={(e) => setRoleTitle(e.target.value)} />
                </div>
              </div>

              <div 
                className={`flex items-center space-x-4 rounded-2xl border p-5 transition-all duration-300 cursor-pointer ${openToConnect ? 'border-primary/50 bg-primary/5 ring-1 ring-primary/20' : 'border-border bg-background/40'}`}
                onClick={() => setOpenToConnect(!openToConnect)}
              >
                <div className={`flex size-6 shrink-0 items-center justify-center rounded-lg border transition-all duration-300 ${openToConnect ? 'bg-primary border-primary text-primary-foreground scale-110 shadow-lg shadow-primary/20' : 'border-muted-foreground/30'}`}>
                  {openToConnect && <Check className="size-4 stroke-[3]" />}
                </div>
                <div className="grid gap-1 leading-none">
                  <label className="text-sm font-bold tracking-tight">
                    Open to connect
                  </label>
                  <p className="text-xs text-muted-foreground/80">
                    Allow other members to find you and send messages
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm font-semibold text-destructive/90 flex items-center gap-2"
          >
            <span className="size-1.5 rounded-full bg-destructive" />
            {error}
          </motion.p>
        )}

        <div className="flex gap-4 pt-4">
          {step === 2 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(1)}
              className="h-12 w-24 rounded-xl border-2 font-bold hover:bg-muted/50 transition-all duration-300"
            >
              <ArrowLeft className="mr-2 size-4" /> Back
            </Button>
          )}
          <Button 
            type="submit" 
            className={`h-12 flex-1 rounded-xl text-sm font-bold tracking-wide shadow-xl transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] ${isSubmitting ? 'opacity-80' : ''}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="size-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                />
                Processing...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                {step === 1 ? (
                  <>Continue <ArrowRight className="size-4" /></>
                ) : (
                  <>Complete Profile <Check className="size-4" /></>
                )}
              </span>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}