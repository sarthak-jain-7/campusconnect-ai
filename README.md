# CampusConnect AI — Intelligent College Helpdesk & Academic Assistant

[![Live Demo](https://img.shields.io/badge/Demo-Live%20on%20Render-4f46e5?style=for-the-badge&logo=render)](https://campusconnect-ai-xg56.onrender.com)
[![Groq LPU](https://img.shields.io/badge/Inference-Groq%20LPU%20Ultra--Fast-f97316?style=for-the-badge&logo=fastapi)](https://groq.com)
[![React 19](https://img.shields.io/badge/React-19.2-61dafb?style=for-the-badge&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Build-Vite%208-646cff?style=for-the-badge&logo=vite)](https://vitejs.dev)

**CampusConnect AI** is a production-grade, specialized college helpdesk and comprehensive academic assistant AI built for college students, faculty, staff, and visitors. Powered by Groq's ultra-fast LPU inference engine, it delivers sub-second answers across all academic subjects, course syllabi, university exam rules, and campus administrative procedures.

---

## ✨ Features

- **📚 Course Syllabus & Curriculum Roadmaps:** Semester-wise and unit-wise syllabus outlines, course outcomes, prerequisites, and recommended textbooks across engineering and university departments.
- **💡 Academic Doubt Solver & Subject Tutoring:** Step-by-step concept explanations (DBMS Normalization, OS Scheduling, Data Structures & Algorithms, Computer Networks) with exam-oriented answers and code.
- **📊 CGPA & Grading Schemes:** 10-point Choice-Based Credit System (CBCS) formulas, SGPA/CGPA calculations, and percentage conversion guides.
- **📝 Exam Preparation & Viva Practice:** Unit-wise high-weightage topics, revision roadmaps, practical lab viva-voce questions, and mini-project documentation tips.
- **🏛️ Campus Procedures & Administration:** Guidance on Bonafide certificates, transcripts, 75% attendance rule, tuition fee payment modes, and library borrowing rules.
- **🛡️ Built-in Security & Guardrails:** Anti-hallucination protocols, prompt injection resistance, and authority spoofing defenses.
- **⚡ Groq Cloud LPU Engine:** Ultra-low latency responses powered by `openai/gpt-oss-20b` and `openai/gpt-oss-120b` models.
- **🎨 Modern Dark UI:** Sleek glassmorphism design, interactive quick inquiry filter tabs, collapsible thought process traces, and local chat session persistence.

---

## 🛠️ Technology Stack

- **Frontend:** React 19 + TypeScript
- **Build Tool:** Vite 8 (Ultra-fast HMR)
- **Styling:** Tailwind CSS v4 + Custom Dark Theme
- **Icons:** Lucide React
- **AI Inference:** Groq OpenAI-compatible API (`https://api.groq.com/openai/v1/chat/completions`)
- **Hosting:** Render Static Site

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ or v20+ recommended)
- npm or pnpm
- Groq Cloud API Key ([Get free key here](https://console.groq.com/keys))

### Installation

```bash
# Clone the repository
git clone https://github.com/sarthak-jain-7/campusconnect-ai.git

# Navigate into project directory
cd campusconnect-ai

# Install dependencies
npm install

# Copy environment variable template
cp .env.example .env.local
```

Add your Groq API key to `.env.local`:
```env
VITE_GROQ_API_KEY=gsk_your_groq_api_key_here
```

### Run Locally

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🌐 Deploy to Render

This repository includes [`render.yaml`](./render.yaml) for 1-click Render Static Site hosting:

1. Link your GitHub repo to [Render](https://dashboard.render.com).
2. Create a new **Static Site**.
3. Set:
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
4. Add Environment Variable:
   - `VITE_GROQ_API_KEY` = `your_groq_api_key`
5. Click **Create Static Site** to deploy!
