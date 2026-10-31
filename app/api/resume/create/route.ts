import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { prisma } from "@/lib/prisma";

const LATEX_TEMPLATE = String.raw`
\documentclass[letterpaper,11pt]{article}

\usepackage[empty]{fullpage}
\usepackage{titlesec}
\usepackage{enumitem}
\usepackage{hyperref}
\usepackage{fontawesome5}
\usepackage[T1]{fontenc}
\usepackage{lmodern}

\pagestyle{empty}
\raggedright
\setlength{\tabcolsep}{0in}

\addtolength{\oddsidemargin}{-0.4in}
\addtolength{\evensidemargin}{-0.4in}
\addtolength{\textwidth}{0.8in}
\addtolength{\topmargin}{-0.6in}
\addtolength{\textheight}{1.2in}

\titleformat{\section}{
  \vspace{-6pt}\large\bfseries\uppercase
}{}{0em}{}[\titlerule \vspace{-6pt}]

\newcommand{\resumeSubheading}[4]{
  \vspace{-2pt}
  \begin{tabular*}{\textwidth}{l@{\extracolsep{\fill}}r}
    \textbf{#1} & #2 \\
    \textit{\small#3} & \textit{\small#4} \\
  \end{tabular*}\vspace{-6pt}
}

\newcommand{\resumeItem}[1]{
  \item \small{#1 \vspace{-3pt}}
}

\newcommand{\resumeListStart}{\begin{itemize}[leftmargin=*,itemsep=2pt]}
\newcommand{\resumeListEnd}{\end{itemize}\vspace{-6pt}}

\begin{document}

% ---------- HEADER ----------
\begin{center}
  {\Large \textbf{FULL NAME}} \\[4pt]
  \faEnvelope\ email \quad
  \faGithub\ github \quad
  \faGlobe\ website/LinkedIn
\end{center}

% ---------- EDUCATION ----------
\section{Education}
% entries here

% ---------- EXPERIENCE ----------
\section{Experience}
% entries here

% ---------- PROJECTS ----------
\section{Projects}
% entries here

% ---------- SKILLS ----------
\section{Skills}
\small{
\textbf{Languages:} ... \\
\textbf{Frameworks:} ... \\
\textbf{Tools:} ...
}

\end{document}
`;

const SYSTEM_PROMPT = `You are an expert resume writer and LaTeX typographer.

GOAL: Generate a dense, ATS-friendly, ONE-PAGE LaTeX resume that fully utilizes space.

STRICT RULES:
1. Use EXACTLY the provided template (no package or macro changes).
2. Include ALL user-provided data. NEVER omit, compress away, or ignore any detail.
3. If data is large, expand bullets intelligently so everything fits naturally.
4. Write strong, achievement-focused bullets:
   - Start with action verbs
   - Include metrics, scale, or impact wherever possible
5. Ensure the resume visually fills ONLY ONE PAGE, not more than that (avoid underflow).
6. Do NOT invent data. You may rephrase, structure, and expand wording only.
7. If a section has zero data, omit that section entirely.
8. Use 3-6 bullets per entry when enough data exists.
9. Keep bullets concise but information-dense.
10. Do not change the education of the user, keep it same as in the prompt or data given.

OUTPUT:
- Return ONLY raw LaTeX starting from \\documentclass.
- No markdown, no explanations.

TEMPLATE:
${LATEX_TEMPLATE}
`;

export async function POST(req: NextRequest) {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });

    try {
        const formData = await req.formData();
        const file = formData.get("resume") as File | null;

        const user = await prisma.user.findUnique({ where: { clerkId: userId } });
        if (!user) return NextResponse.json({ error: "User profile not found" }, { status: 404 });

        const userContext = [
            `Name: ${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
            user.email ? `Email: ${user.email}` : null,
            user.role ? `Role: ${user.role}` : null,
            user.graduationYear ? `Graduation Year: ${user.graduationYear}` : null,
            user.domain ? `Primary Domain: ${user.domain}` : null,
            user.company ? `Current Company: ${user.company}` : null,
            user.roleTitle ? `Current Title: ${user.roleTitle}` : null,
            user.skills?.length ? `Skills: ${user.skills.join(", ")}` : null,
        ].filter(Boolean).join("\n");

        const genai = new GoogleGenAI({ apiKey });

        // Build the prompt parts
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const parts: any[] = [];

        if (file) {
            const allowed = [
                "application/pdf",
                "application/msword",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ];
            if (!allowed.includes(file.type)) {
                return NextResponse.json({ error: "Only PDF or DOCX resumes are supported" }, { status: 400 });
            }
            if (file.size > 5 * 1024 * 1024) {
                return NextResponse.json({ error: "File must be under 5MB" }, { status: 400 });
            }

            // Pass the file inline as base64 — no upload/signing needed
            const arrayBuffer = await file.arrayBuffer();
            const base64 = Buffer.from(arrayBuffer).toString("base64");
            parts.push({
                inlineData: {
                    mimeType: file.type,
                    data: base64,
                },
            });
        }

        parts.push({
            text: [
                SYSTEM_PROMPT,
                "",
                "Generate a complete LaTeX resume for the following person.",
                "",
                "=== PROFILE DATA ===",
                userContext,
                file
                    ? "\n=== EXISTING RESUME ===\nSee the attached document above — use it for experience, projects, and additional details."
                    : "\n(No existing resume provided — use only profile data above.)",
                "",
                "Return ONLY the LaTeX source code, nothing else.",
            ].join("\n"),
        });

        const response = await genai.models.generateContent({
            model: "gemini-3.5-flash-lite",
            contents: [{ role: "user", parts }],
            config: {
                temperature: 0.3,
            },
        });

        let latex = response.text ?? "";
        latex = latex
            .replace(/^```latex\s*/i, "")
            .replace(/^```\s*/i, "")
            .replace(/```\s*$/i, "")
            .trim();

        if (!latex.startsWith("\\documentclass")) {
            return NextResponse.json({ error: "LLM returned invalid LaTeX" }, { status: 500 });
        }

        return NextResponse.json({ success: true, latex });
    } catch (error) {
        console.error("Resume create error:", error);
        return NextResponse.json({ error: "Failed to generate resume. Please try again." }, { status: 500 });
    }
}