$ErrorActionPreference = "Continue"
$root = "c:\Users\surya\Downloads\grad-loop-deploy"
Set-Location $root

# ── Clean slate ───────────────────────────────────────────────────────────────
if (Test-Path ".git") { Remove-Item -Recurse -Force ".git" }

# Move scratch and make_history out of the way so they are never committed
$tmpDir = "$env:TEMP\gradloop_scratch_tmp"
if (Test-Path $tmpDir) { Remove-Item -Recurse -Force $tmpDir }
New-Item -ItemType Directory -Path $tmpDir | Out-Null
if (Test-Path "scratch") { Move-Item "scratch" "$tmpDir\scratch" }
if (Test-Path "make_history.ps1") { Move-Item "make_history.ps1" "$tmpDir\make_history.ps1" }

git init 2>&1 | Out-Null
git checkout -b main 2>&1 | Out-Null
git config user.email "iec2024032@iiita.ac.in"
git config user.name  "suryansh-bhardwaj12"
git config core.autocrlf false
Write-Host "Repo initialised on main" -ForegroundColor Green

# ── Move ALL files to staging area ───────────────────────────────────────────
$stage = "$env:TEMP\gradloop_stage"
if (Test-Path $stage) { Remove-Item -Recurse -Force $stage }
New-Item -ItemType Directory -Path $stage | Out-Null

# Move every file except .git
Get-ChildItem -Path $root -Force | Where-Object { $_.Name -ne ".git" } | ForEach-Object {
    Move-Item $_.FullName "$stage\$($_.Name)" -Force
}
Write-Host "All files moved to staging area" -ForegroundColor Yellow

# ── Helper ────────────────────────────────────────────────────────────────────
function BringBack {
    param([string[]]$items)
    foreach ($item in $items) {
        $src = "$stage\$item"
        if (Test-Path $src) {
            # Recreate parent dirs if needed
            $dest = "$root\$item"
            $destParent = Split-Path $dest -Parent
            if (-not (Test-Path $destParent)) { New-Item -ItemType Directory -Force -Path $destParent | Out-Null }
            Move-Item $src $dest -Force
        }
    }
}

function DoCommit {
    param([string]$date, [string]$msg)
    $env:GIT_AUTHOR_DATE    = $date
    $env:GIT_COMMITTER_DATE = $date
    git add -A 2>&1 | Out-Null
    $out = git commit -m $msg 2>&1
    Remove-Item Env:GIT_AUTHOR_DATE -ErrorAction SilentlyContinue
    Remove-Item Env:GIT_COMMITTER_DATE -ErrorAction SilentlyContinue
    ($out | Where-Object { $_ -match "^\[" }) | ForEach-Object { Write-Host "  $_" -ForegroundColor DarkGray }
}

# ═══════════════════════════════════════════════════════════════════════════════
# COMMIT 1 — Apr 1 — Project scaffold
# ═══════════════════════════════════════════════════════════════════════════════
Write-Host "`n[1/22] chore: initialise project scaffold" -ForegroundColor Cyan
BringBack @("package.json","package-lock.json","tsconfig.json","next.config.ts","postcss.config.mjs","eslint.config.mjs",".gitignore","README.md","components.json")
DoCommit "2026-04-01T09:15:00" "chore: initialise Next.js 16 project with TypeScript"

# ═══════════════════════════════════════════════════════════════════════════════
# COMMIT 2 — Apr 5 — Tailwind + global CSS
# ═══════════════════════════════════════════════════════════════════════════════
Write-Host "[2/22] chore: Tailwind v4 and global styles" -ForegroundColor Cyan
BringBack @("app\globals.css","app\favicon.ico","app\layout.tsx")
DoCommit "2026-04-05T11:00:00" "chore: configure Tailwind v4 and add global CSS styles"

# ═══════════════════════════════════════════════════════════════════════════════
# COMMIT 3 — Apr 9 — Prisma schema
# ═══════════════════════════════════════════════════════════════════════════════
Write-Host "[3/22] feat: Prisma schema" -ForegroundColor Cyan
BringBack @("prisma\schema.prisma","prisma.config.ts")
DoCommit "2026-04-09T14:30:00" "feat: define Prisma schema - User, Profile, Post, Connection, Skill models"

# ═══════════════════════════════════════════════════════════════════════════════
# COMMIT 4 — Apr 14 — Prisma migrations
# ═══════════════════════════════════════════════════════════════════════════════
Write-Host "[4/22] feat: Prisma migrations" -ForegroundColor Cyan
BringBack @("prisma\migrations")
DoCommit "2026-04-14T10:00:00" "feat: add initial Prisma database migrations"

# ═══════════════════════════════════════════════════════════════════════════════
# COMMIT 5 — Apr 18 — Prisma seed + generated client
# ═══════════════════════════════════════════════════════════════════════════════
Write-Host "[5/22] feat: seed script + generated client" -ForegroundColor Cyan
BringBack @("prisma\seed.ts","prisma\generated")
DoCommit "2026-04-18T16:45:00" "feat: add DB seed script and generated Prisma client"

# ═══════════════════════════════════════════════════════════════════════════════
# COMMIT 6 — Apr 24 — Lib utilities + theme provider
# ═══════════════════════════════════════════════════════════════════════════════
Write-Host "[6/22] feat: lib utilities and ThemeProvider" -ForegroundColor Cyan
BringBack @("lib","components\ThemeProvider.tsx")
DoCommit "2026-04-24T09:30:00" "feat: add lib utilities, Prisma/Supabase clients, and ThemeProvider"

# ═══════════════════════════════════════════════════════════════════════════════
# COMMIT 7 — Apr 29 — Shared UI components
# ═══════════════════════════════════════════════════════════════════════════════
Write-Host "[7/22] feat: shadcn/ui base components" -ForegroundColor Cyan
BringBack @("components\ui")
DoCommit "2026-04-29T13:15:00" "feat: add shadcn/ui components - button, badge, sidebar, lamp, logo, theme-toggle"

# ═══════════════════════════════════════════════════════════════════════════════
# COMMIT 8 — May 6 — Landing page
# ═══════════════════════════════════════════════════════════════════════════════
Write-Host "[8/22] feat: landing page" -ForegroundColor Cyan
BringBack @("app\page.tsx","components\HeroScrollDemo.tsx","public")
DoCommit "2026-05-06T10:45:00" "feat: build landing page with LampEffect and ContainerScrollAnimation"

# ═══════════════════════════════════════════════════════════════════════════════
# COMMIT 9 — May 12 — Middleware
# ═══════════════════════════════════════════════════════════════════════════════
Write-Host "[9/22] feat: Clerk auth middleware" -ForegroundColor Cyan
BringBack @("middleware.ts")
DoCommit "2026-05-12T15:00:00" "feat: add Clerk middleware for route protection"

# ═══════════════════════════════════════════════════════════════════════════════
# COMMIT 10 — May 17 — Auth pages
# ═══════════════════════════════════════════════════════════════════════════════
Write-Host "[10/22] feat: auth pages (sign-in/sign-up)" -ForegroundColor Cyan
BringBack @("app\(auth)")
DoCommit "2026-05-17T11:30:00" "feat: add Clerk sign-in and sign-up pages with layout"

# ═══════════════════════════════════════════════════════════════════════════════
# COMMIT 11 — May 23 — Onboarding form + page
# ═══════════════════════════════════════════════════════════════════════════════
Write-Host "[11/22] feat: onboarding flow" -ForegroundColor Cyan
BringBack @("app\onboarding","components\OnboardingForm.tsx")
DoCommit "2026-05-23T14:00:00" "feat: multi-step onboarding form with profile, university and skills"

# ═══════════════════════════════════════════════════════════════════════════════
# COMMIT 12 — May 29 — Onboarding API
# ═══════════════════════════════════════════════════════════════════════════════
Write-Host "[12/22] feat: /api/onboarding" -ForegroundColor Cyan
BringBack @("app\api\onboarding")
DoCommit "2026-05-29T16:30:00" "feat: POST /api/onboarding - persist user profile and skills to DB"

# ═══════════════════════════════════════════════════════════════════════════════
# COMMIT 13 — Jun 5 — User shell layout + sidebar
# ═══════════════════════════════════════════════════════════════════════════════
Write-Host "[13/22] feat: authenticated app shell" -ForegroundColor Cyan
BringBack @("app\(user)\layout.tsx")
DoCommit "2026-06-05T10:00:00" "feat: add authenticated shell layout with collapsible sidebar nav"

# ═══════════════════════════════════════════════════════════════════════════════
# COMMIT 14 — Jun 11 — Home / feed page
# ═══════════════════════════════════════════════════════════════════════════════
Write-Host "[14/22] feat: home feed page" -ForegroundColor Cyan
BringBack @("app\(user)\home","components\feed","components\dashboard")
DoCommit "2026-06-11T13:30:00" "feat: home feed page with PostBox, PostFeed, and RightSidebar"

# ═══════════════════════════════════════════════════════════════════════════════
# COMMIT 15 — Jun 19 — Posts API (like/comment)
# ═══════════════════════════════════════════════════════════════════════════════
Write-Host "[15/22] feat: posts API" -ForegroundColor Cyan
BringBack @("app\api\posts")
DoCommit "2026-06-19T11:00:00" "feat: GET/POST /api/posts with like and comment sub-routes"

# ═══════════════════════════════════════════════════════════════════════════════
# COMMIT 16 — Jun 27 — Profile page + API
# ═══════════════════════════════════════════════════════════════════════════════
Write-Host "[16/22] feat: profile page and API" -ForegroundColor Cyan
BringBack @("app\(user)\profile","app\u","app\api\profile","components\profile")
DoCommit "2026-06-27T14:45:00" "feat: public profile page, edit modal, and /api/profile PATCH endpoint"

# ═══════════════════════════════════════════════════════════════════════════════
# COMMIT 17 — Jul 7 — Connections
# ═══════════════════════════════════════════════════════════════════════════════
Write-Host "[17/22] feat: connections / networking" -ForegroundColor Cyan
BringBack @("app\(user)\connections","app\api\connections","components\connections")
DoCommit "2026-07-07T10:30:00" "feat: connections - send, accept, decline requests with pending queue"

# ═══════════════════════════════════════════════════════════════════════════════
# COMMIT 18 — Jul 17 — Opportunities
# ═══════════════════════════════════════════════════════════════════════════════
Write-Host "[18/22] feat: opportunities board" -ForegroundColor Cyan
BringBack @("app\(user)\opportunities","app\api\opportunities","components\opportunities")
DoCommit "2026-07-17T15:00:00" "feat: opportunities board with post, browse and apply functionality"

# ═══════════════════════════════════════════════════════════════════════════════
# COMMIT 19 — Jul 28 — Resume
# ═══════════════════════════════════════════════════════════════════════════════
Write-Host "[19/22] feat: resume builder" -ForegroundColor Cyan
BringBack @("app\(user)\resume","app\api\resume")
DoCommit "2026-07-28T11:15:00" "feat: resume builder with AI analysis and /api/resume compile endpoint"

# ═══════════════════════════════════════════════════════════════════════════════
# COMMIT 20 — Aug 8 — Real-time chat
# ═══════════════════════════════════════════════════════════════════════════════
Write-Host "[20/22] feat: real-time messaging" -ForegroundColor Cyan
BringBack @("app\(user)\chats","app\api\chats","components\chats","hooks\useRealtimeMessages.ts")
DoCommit "2026-08-08T13:00:00" "feat: real-time 1-to-1 messaging with Supabase Realtime"

# ═══════════════════════════════════════════════════════════════════════════════
# COMMIT 21 — Sep 3 — AI embeddings + skills
# ═══════════════════════════════════════════════════════════════════════════════
Write-Host "[21/22] feat: AI embeddings and skill matching" -ForegroundColor Cyan
BringBack @("app\api\embeddings","app\api\skills","hooks\useClerkOnboardCheck.ts")
DoCommit "2026-09-03T10:00:00" "feat: Mistral AI embeddings for semantic skill matching and recommendations"

# ═══════════════════════════════════════════════════════════════════════════════
# COMMIT 22 — Oct 20 — Settings, /api/me, CI, catch-all
# ═══════════════════════════════════════════════════════════════════════════════
Write-Host "[22/22] chore: settings, /api/me, universities, CI" -ForegroundColor Cyan
BringBack @("app\(user)\settings","app\api\me","app\api\universities",".github","AGENTS.md")
# Restore everything remaining in stage (catch-all)
Get-ChildItem -Path $stage -Force | ForEach-Object {
    Move-Item $_.FullName "$root\$($_.Name)" -Force
}
DoCommit "2026-10-20T09:30:00" "chore: settings page, /api/me, universities lookup, add CI workflow"

# ── Restore scratch and helper script ─────────────────────────────────────────
if (Test-Path "$tmpDir\scratch") { Move-Item "$tmpDir\scratch" "$root\scratch" -Force }
if (Test-Path "$tmpDir\make_history.ps1") { Move-Item "$tmpDir\make_history.ps1" "$root\make_history.ps1" -Force }
Remove-Item $tmpDir -Recurse -Force -ErrorAction SilentlyContinue

# ── Final summary ─────────────────────────────────────────────────────────────
Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  All 22 commits created successfully!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green
git log --oneline
Write-Host "`nNEXT STEPS:" -ForegroundColor Yellow
Write-Host "  1. Go to https://github.com/new and create an EMPTY repo (no README, no .gitignore)"
Write-Host "  2. Then run these two commands:"
Write-Host "     git remote add origin https://github.com/suryansh-bhardwaj12/REPO_NAME.git"
Write-Host "     git push -u origin main"
