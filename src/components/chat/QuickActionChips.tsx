import React, { useState } from 'react';
import { 
  GraduationCap, 
  FileText, 
  BookOpen, 
  CreditCard, 
  Users, 
  Calculator,
  Binary,
  Layers,
  Sparkles,
  Award
} from 'lucide-react';

interface QuickActionChipsProps {
  onSelectPrompt: (promptText: string) => void;
  disabled?: boolean;
}

interface QuickAction {
  id: string;
  label: string;
  category: 'syllabus' | 'academic' | 'exams' | 'campus';
  categoryLabel: string;
  icon: React.ReactNode;
  prompt: string;
}

const CATEGORIES = [
  { id: 'all', label: 'All Topics' },
  { id: 'syllabus', label: '📚 Syllabus' },
  { id: 'academic', label: '💡 Academic Doubts' },
  { id: 'exams', label: '📊 CGPA & Exams' },
  { id: 'campus', label: '🏛️ Campus Admin' },
] as const;

const QUICK_ACTIONS: QuickAction[] = [
  // Syllabus & Curriculum
  {
    id: 'syl-1',
    label: 'CS / IT Core Syllabus',
    category: 'syllabus',
    categoryLabel: 'Syllabus',
    icon: <Binary className="w-3.5 h-3.5 text-blue-400" />,
    prompt: 'Provide a comprehensive semester-wise syllabus breakdown for Computer Science & Engineering (from Data Structures, DBMS, OS, Networks to AI/ML) including recommended textbooks.'
  },
  {
    id: 'syl-2',
    label: 'First-Year Common Syllabus',
    category: 'syllabus',
    categoryLabel: 'Curriculum',
    icon: <Layers className="w-3.5 h-3.5 text-cyan-400" />,
    prompt: 'What subjects and laboratory courses are typically included in the First-Year Engineering curriculum across Semester 1 and Semester 2?'
  },
  {
    id: 'syl-3',
    label: 'AI & Data Science Syllabus',
    category: 'syllabus',
    categoryLabel: 'Syllabus',
    icon: <Sparkles className="w-3.5 h-3.5 text-indigo-400" />,
    prompt: 'What is the syllabus structure and key subject domains for Artificial Intelligence & Data Science specialization?'
  },

  // Academic Doubts & Concept Explanations
  {
    id: 'acad-1',
    label: 'Explain DBMS Normalization',
    category: 'academic',
    categoryLabel: 'Academic Doubt',
    icon: <BookOpen className="w-3.5 h-3.5 text-emerald-400" />,
    prompt: 'Explain Database Normalization (1NF, 2NF, 3NF, BCNF) with clear definitions, examples, and college exam-ready answers.'
  },
  {
    id: 'acad-2',
    label: 'Data Structures & Algorithms',
    category: 'academic',
    categoryLabel: 'Academic Doubt',
    icon: <Binary className="w-3.5 h-3.5 text-teal-400" />,
    prompt: 'Explain the working of BFS and DFS graph traversals with comparison, time complexities, and pseudo-code.'
  },
  {
    id: 'acad-3',
    label: 'OS Process Scheduling',
    category: 'academic',
    categoryLabel: 'Subject Tutoring',
    icon: <GraduationCap className="w-3.5 h-3.5 text-amber-400" />,
    prompt: 'Explain CPU scheduling algorithms in Operating Systems (FCFS, SJF, Round Robin, Priority) with Gantt chart examples.'
  },

  // CGPA, Exams & Prep
  {
    id: 'exam-1',
    label: 'CGPA & SGPA Calculation',
    category: 'exams',
    categoryLabel: 'Grading Formula',
    icon: <Calculator className="w-3.5 h-3.5 text-purple-400" />,
    prompt: 'How is SGPA and CGPA calculated under the 10-point Credit-Based Choice System (CBCS)? Show the step-by-step formula and an example.'
  },
  {
    id: 'exam-2',
    label: 'Semester Exam Prep Strategy',
    category: 'exams',
    categoryLabel: 'Exam Prep',
    icon: <Award className="w-3.5 h-3.5 text-yellow-400" />,
    prompt: 'What is the best study roadmap and revision strategy to prepare for university semester end-exams and score above 8.5 CGPA?'
  },
  {
    id: 'exam-3',
    label: 'Lab Viva & Mini Project Guide',
    category: 'exams',
    categoryLabel: 'Practicals',
    icon: <FileText className="w-3.5 h-3.5 text-rose-400" />,
    prompt: 'What are the top viva-voce questions asked in practical lab examinations and what are the best practices for engineering mini-project documentation?'
  },

  // Campus Admin & Helpdesk
  {
    id: 'camp-1',
    label: 'Bonafide & Transcripts',
    category: 'campus',
    categoryLabel: 'Admin Helpdesk',
    icon: <Users className="w-3.5 h-3.5 text-cyan-400" />,
    prompt: 'What is the procedure and document checklist to apply for a Bonafide Certificate and Official Transcripts from the college registrar?'
  },
  {
    id: 'camp-2',
    label: 'Library & Book Lending Rules',
    category: 'campus',
    categoryLabel: 'Library',
    icon: <BookOpen className="w-3.5 h-3.5 text-emerald-400" />,
    prompt: 'How many books can an undergraduate student borrow at once, how does the book renewal process work, and what is the Book Bank scheme?'
  },
  {
    id: 'camp-3',
    label: 'Fees & Payment Counters',
    category: 'campus',
    categoryLabel: 'Accounts',
    icon: <CreditCard className="w-3.5 h-3.5 text-purple-400" />,
    prompt: 'What are the accepted payment modes for semester tuition fees and where is the accounts section counter located?'
  }
];

export const QuickActionChips: React.FC<QuickActionChipsProps> = ({ onSelectPrompt, disabled }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filteredActions = activeCategory === 'all'
    ? QUICK_ACTIONS
    : QUICK_ACTIONS.filter(a => a.category === activeCategory);

  return (
    <div className="w-full space-y-3">
      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.id)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-150 ${
              activeCategory === cat.id
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid of Action Chips */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-2.5">
        {filteredActions.map((action) => (
          <button
            key={action.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelectPrompt(action.prompt)}
            className="flex flex-col items-start p-2.5 sm:p-3 rounded-xl bg-slate-900/60 hover:bg-slate-850 border border-slate-800/80 hover:border-indigo-500/50 text-left transition-all duration-200 group hover:scale-[1.01] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center justify-between w-full mb-1.5">
              <div className="p-1.5 rounded-lg bg-slate-800/80 group-hover:bg-slate-700/80 transition-colors">
                {action.icon}
              </div>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-500 group-hover:text-indigo-400 transition-colors">
                {action.categoryLabel}
              </span>
            </div>
            <span className="text-xs sm:text-sm font-medium text-slate-200 group-hover:text-white transition-colors line-clamp-1">
              {action.label}
            </span>
            <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-snug">
              {action.prompt}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};
