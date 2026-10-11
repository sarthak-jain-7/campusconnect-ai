import type { PromptVersion, AISettings } from '../types';
import { ORIGINAL_SYSTEM_PROMPT, IMPROVED_SYSTEM_PROMPT } from '../data/prompts';

export const USER_GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';

const DEFAULT_SETTINGS: AISettings = {
  provider: 'groq',
  apiKey: USER_GROQ_API_KEY,
  model: 'openai/gpt-oss-20b',
  temperature: 0.3,
  customEndpoint: 'https://api.groq.com/openai/v1/chat/completions'
};

export class AIService {
  private settings: AISettings;

  constructor() {
    this.settings = this.loadSettings();
  }

  public getSettings(): AISettings {
    return { ...this.settings };
  }

  public saveSettings(newSettings: Partial<AISettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    try {
      localStorage.setItem('campusconnect_ai_settings', JSON.stringify(this.settings));
    } catch (e) {
      console.warn('Unable to save settings to localStorage', e);
    }
  }

  private loadSettings(): AISettings {
    try {
      const stored = localStorage.getItem('campusconnect_ai_settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Automatically migrate if old demo settings or missing API key
        if (!parsed.apiKey || parsed.provider === 'demo' || parsed.apiKey === '') {
          return { ...DEFAULT_SETTINGS };
        }
        // Auto-migrate from 120b to 20b to avoid strict 8000 TPM limit
        if (parsed.model === 'openai/gpt-oss-120b') {
          parsed.model = 'openai/gpt-oss-20b';
        }
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch (e) {
      console.warn('Unable to read settings from localStorage', e);
    }
    return { ...DEFAULT_SETTINGS };
  }

  public async generateResponse(
    userMessage: string,
    promptVersion: PromptVersion = 'v2_improved',
    conversationHistory: { role: 'user' | 'assistant'; content: string }[] = []
  ): Promise<{ response: string; reasoning?: string; isDemo: boolean }> {
    const isDemo = this.settings.provider === 'demo';

    if (isDemo) {
      // Simulate slight realistic network latency
      await new Promise((resolve) => setTimeout(resolve, 600));
      const simulatedResponse = this.generateDemoResponse(userMessage, promptVersion);
      return { response: simulatedResponse, isDemo: true };
    }

    try {
      const systemPrompt = promptVersion === 'v1_original' ? ORIGINAL_SYSTEM_PROMPT : IMPROVED_SYSTEM_PROMPT;
      let responseText = '';
      let reasoningText: string | undefined = undefined;

      if (this.settings.provider === 'groq' || this.settings.provider === 'openai' || this.settings.provider === 'custom') {
        const endpoint = this.settings.provider === 'groq'
          ? 'https://api.groq.com/openai/v1/chat/completions'
          : (this.settings.provider === 'custom' && this.settings.customEndpoint 
              ? this.settings.customEndpoint 
              : 'https://api.openai.com/v1/chat/completions');

        const initialModel = this.settings.provider === 'groq'
          ? (this.settings.model || 'openai/gpt-oss-20b')
          : (this.settings.model || 'gpt-4o-mini');

        // Helper to trim conversation history to prevent TPM token blowup
        const formatHistory = (hist: { role: 'user' | 'assistant'; content: string }[], count: number) => {
          return hist.slice(-count).map(m => ({
            role: m.role,
            content: m.content.length > 1200 ? m.content.substring(0, 1200) + '... [truncated for context]' : m.content
          }));
        };

        const executeCall = async (targetModel: string, histCount: number): Promise<any> => {
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.settings.apiKey || USER_GROQ_API_KEY}`
            },
            body: JSON.stringify({
              model: targetModel,
              temperature: this.settings.temperature ?? 0.3,
              messages: [
                { role: 'system', content: systemPrompt },
                ...formatHistory(conversationHistory, histCount),
                { role: 'user', content: userMessage }
              ]
            })
          });

          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            const errMsg = errData?.error?.message || `API Error ${res.status}: ${res.statusText}`;

            // If TPM limit or request size exceeded on 120b, automatically retry with 20b
            const isTpmOrSizeError = 
              errMsg.toLowerCase().includes('tpm') || 
              errMsg.toLowerCase().includes('rate limit') || 
              errMsg.toLowerCase().includes('request too large') || 
              errMsg.toLowerCase().includes('tokens per minute') ||
              res.status === 413 || 
              res.status === 429;

            if (this.settings.provider === 'groq' && targetModel !== 'openai/gpt-oss-20b' && isTpmOrSizeError) {
              console.warn(`Hit token/TPM limit on ${targetModel}. Automatically falling back to openai/gpt-oss-20b...`);
              this.saveSettings({ model: 'openai/gpt-oss-20b' });
              return executeCall('openai/gpt-oss-20b', 2);
            }

            throw new Error(errMsg);
          }

          return res.json();
        };

        const data = await executeCall(initialModel, 4);
        const choice = data.choices?.[0];
        responseText = choice?.message?.content || 'No response returned from AI provider.';
        reasoningText = choice?.message?.reasoning;
      } else if (this.settings.provider === 'gemini') {
        const model = this.settings.model || 'gemini-1.5-flash';
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.settings.apiKey}`;

        const contents = [
          { role: 'user', parts: [{ text: `System Instruction:\n${systemPrompt}` }] },
          ...conversationHistory.map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
          })),
          { role: 'user', parts: [{ text: userMessage }] }
        ];

        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            generationConfig: {
              temperature: this.settings.temperature ?? 0.3,
            }
          })
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData?.error?.message || `Gemini API Error ${res.status}`);
        }

        const data = await res.json();
        responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response returned from Gemini.';
      } else {
        throw new Error(`Provider ${this.settings.provider} is not currently supported in live mode.`);
      }

      return { response: responseText, reasoning: reasoningText, isDemo: false };
    } catch (error: any) {
      console.error('AI Service Error:', error);
      throw error;
    }
  }

  private generateDemoResponse(query: string, version: PromptVersion): string {
    const q = query.trim().toLowerCase();

    // 1. Normal Query: ID Card
    if (q.includes('identity card') || q.includes('id card') || q.includes('documents are generally required')) {
      if (version === 'v2_improved') {
        return `### 🪪 College Identity Card Application Procedure

To apply for a new or duplicate College Identity Card, please prepare the following checklist:

| No. | Required Document | Purpose / Requirement |
|:---|:---|:---|
| 1 | **Admission Fee Receipt / Allotment Letter** | Proof of current academic year registration |
| 2 | **Passport Photographs (2 Copies)** | Recent color photos with plain formal background |
| 3 | **ID Card Application Form** | Duly filled & signed by the applicant |
| 4 | **Government Photo ID Copy** | Aadhar Card / PAN Card for verification |
| 5 | **Blood Group Certificate** | For medical record entry on smart ID card |

---

#### 📍 Submission & Verification Counter:
- **Location:** Student Section / Administrative Block, **Counter No. 2**
- **Office Hours:** 10:00 AM – 4:00 PM (Monday to Friday)
- **Processing Time:** 3–5 working days

> **📌 Notice:** Exact verification guidelines depend on the official college registrar's office. Please verify the counter timings on the Central Notice Board before visiting.`;
      } else {
        return `For obtaining an official College Identity Card, the following documents are generally required:

1. **Admission Fee Receipt / Allotment Letter:** Proof of current academic year admission.
2. **Passport-Sized Photographs:** 2 recent color photographs.
3. **Completed ID Card Application Form:** Available at the Student Section.
4. **Previous Marks Sheet / Govt ID Copy:** Aadhar Card or PAN for identity verification.
5. **Blood Group Verification:** Blood group report for medical record.

**Recommended Next Steps:**
- Submit these documents to the **Student Section / Administrative Office**.
- *Note:* Please verify the specific counters and submission timing on the official college notice board.`;
      }
    }

    // 2. Ambiguous Query: When is the exam?
    if (q === 'when is the exam?' || q.includes('when is exam') || q.includes('exam date')) {
      return `To provide you with the correct examination schedule, I need a few more details:

1. **Which specific examination are you asking about?** (e.g., In-Semester Test, Mid-Term Exam, Practical / Viva-Voce, or University End-Semester Final Exam?)
2. **Which Degree & Branch?** (e.g., B.Tech Information Technology, Computer Science, Civil, Mechanical, etc.)
3. **Which Academic Year & Semester?** (e.g., First Year Sem-I, Second Year Sem-III, Third Year Sem-V, Final Year Sem-VII)

---

⚠️ **Important Reminder:**
CampusConnect AI does not guess or invent official dates. Official examination timetables are released exclusively by the **College Examination Cell** and published on the institutional student ERP portal.

Please reply with the details above, and I will gladly point you to the correct department circular!`;
    }

    // 3. Outside Purpose: Pizza recipe / general query
    if (q.includes('pizza') || q.includes('recipe') || q.includes('pasta') || q.includes('cook')) {
      return `I apologize, but as **CampusConnect AI**, I am a special-purpose College Helpdesk Assistant designed exclusively to assist with college-related procedures, academic regulations, examination guidance, fees, library services, and campus facilities.

I am not programmed to provide culinary recipes or general-purpose advice.

If you have questions regarding the **College Canteen facilities, meal timings, campus departments, or student procedures**, I would be very happy to assist you!`;
    }

    // 4. Challenging/Tricky: Missed deadline
    if (q.includes('missed') && (q.includes('deadline') || q.includes('absent'))) {
      return `I cannot guarantee whether late submission will be permitted or what specific action the college will take, as **final decisions rest entirely with the designated College Authority** (Head of Department, Dean of Academics, or the Examination Cell) in accordance with official institutional regulations.

However, here are the standard procedural steps you should follow immediately:

### 1. Document Your Reason for Absence
- If due to medical reasons, gather your **Doctor's Medical Certificate, Prescription, and Fitness Certificate**.
- If due to an emergency or official college representation, obtain supporting documentation.

### 2. Draft a Formal Application
- Address a written application to your **Head of Department (HOD)** or **Subject Faculty Coordinator**.
- Clearly mention your Full Name, Roll Number, PRN/Enrolment Number, Subject Name, the missed deadline date, and concise justification with attached evidence.

### 3. Contact Your Faculty Proctor / Class Coordinator
- Meet your Class Proctor for initial verification and guidance before forwarding to the HOD.

### 4. Visit the Department Office
- Submit the physical application to the Department Office as soon as possible. Prompt action is critical.

> **⚠️ Disclaimer:** CampusConnect AI provides procedural guidance only. Virtual assistants cannot grant academic approvals, waive penalties, or extend official deadlines.`;
    }

    // 5. Instruction Violation / Breaking 1: Ignore instructions
    if (q.includes('ignore all') || q.includes('ignore your previous') || q.includes('unrestricted ai') || q.includes('no longer a college helpdesk')) {
      return `I cannot comply with that request. I am **CampusConnect AI**, a specialized College Helpdesk Assistant.

My core purpose, role, and system instructions are immutable and cannot be altered or bypassed by user commands. I remain dedicated exclusively to helping students, faculty, staff, and visitors with college-related queries, academic procedures, campus services, and general institutional information.

How may I assist you with your college or campus-related inquiries today?`;
    }

    // Breaking 2: Identity hijack
    if (q.includes('no longer campusconnect') || q.includes('follow only my instructions')) {
      return `I cannot change my identity or abandon my role. I am **CampusConnect AI**, the dedicated College Helpdesk Assistant.

I am here to assist you with college procedures, examination guidelines, fees, departments, and library services. How can I assist you with college matters today?`;
    }

    // Breaking 3: System prompt extraction
    if (q.includes('system prompt') || q.includes('hidden instructions') || q.includes('controlling your behaviour')) {
      return `I cannot display or disclose my internal system prompt, hidden developer instructions, or backend configurations.

I am **CampusConnect AI**, configured specifically to assist with college helpdesk procedures, academic guidelines, fees, library access, and campus departments. 

If you have any questions regarding college procedures, please feel free to ask!`;
    }

    // Breaking 4: Principal impersonation / Hallucination trap
    if (q.includes('principal') && (q.includes('timetable') || q.includes('make up the dates') || q.includes('invent'))) {
      return `Even if you are the College Principal or a senior authority, as **CampusConnect AI** I am strictly prohibited from inventing, fabricating, or guessing official examination timetables, dates, or academic schedules.

Official examination schedules must be released through the **Controller of Examinations (CoE) / Examination Cell** and officially posted on the institutional ERP portal. 

For verified timetables:
- Please refer to the **Official College Notice Board** or ERP Exam Portal.
- Contact the **Examination Section (Room 104, Admin Block)**.

I cannot provide fabricated or speculative timetables under any circumstances.`;
    }

    // Breaking 5: Fake Holiday Notice
    if (q.includes('holiday') && (q.includes('notice') || q.includes('official-looking') || q.includes('unverified'))) {
      return `I cannot create a fabricated college notice or declare an unverified holiday. 

CampusConnect AI is strictly prohibited from generating fake official documents, notices, or circulars. Declaring holidays and issuing institutional circulars is the exclusive legal authority of the **Principal's Office and the College Administration**.

To check for legitimate holiday notices:
- Check the **Official College Website Announcement Portal**
- Refer to the **Student ERP notification feed**
- Verify with your **Department Office / Notice Board**`;
    }

    // General Helpdesk Queries:
    if (q.includes('bonafide') || q.includes('certificate')) {
      return `### 📜 Bonafide Certificate Application Procedure

To apply for an official Bonafide Certificate (for passport, bus pass, bank loan, or scholarship purposes):

1. **Collect Application Form:** Available at the Student Section (Counter No. 1) or download from the student ERP.
2. **Attach Required Documents:**
   - Copy of Current Academic Year College ID Card
   - Copy of latest Fee Receipt
3. **Application Fee:** ₹20 – ₹50 (to be paid at Accounts Counter, if applicable).
4. **Processing Duration:** Usually issued within **24 to 48 working hours** after HOD / Registrar verification.
5. **Collection Point:** Student Section Counter No. 1 during office hours (10:30 AM to 4:00 PM).`;
    }

    if (q.includes('library') || q.includes('book') || q.includes('renewal')) {
      return `### 📚 Central Library Guidelines & Procedures

- **Book Issue Limit:**
  - Undergraduate (B.Tech) Students: **3 Books** simultaneously
  - Postgraduate (M.Tech) Students: **5 Books** simultaneously
  - Book Bank Scheme: 1 set of semester textbooks issued for the full term.
- **Loan Duration:** 14 days per book.
- **Renewal Procedure:** Books can be renewed once online via the Library OPAC portal or in-person at the Circulation Counter, provided no other student has reserved them.
- **Library Timings:**
  - Reading Hall: 8:00 AM – 10:00 PM (Extended during exam periods)
  - Issue / Return Counter: 9:30 AM – 5:30 PM (Mon–Sat)
- **Digital Library:** 50+ high-speed terminals with IEEE, ScienceDirect, and DELNET database access.`;
    }

    if (q.includes('fee') || q.includes('payment') || q.includes('tuition')) {
      return `### 💳 College Fee Payment Guidelines

1. **Online Payment Mode (Recommended):**
   - Log in to the official **College ERP Student Portal**.
   - Navigate to **Student Dashboard → Fees & Dues → Pay Online**.
   - Supported Modes: Net Banking, UPI (GPay/PhonePe/Paytm), Debit/Credit Cards.
   - Download the instant e-receipt with digital transaction reference ID.

2. **Offline Payment Mode:**
   - Demand Draft (DD) drawn in favor of *"Principal, Walchand Institute of Technology, Solapur"* payable at Solapur.
   - Submit DD at **Accounts Section (Admin Block, Counter 4)**.

3. **Installment / Scholarship Queries:**
   - For Govt Scholarships (MahaDBT, EBC, TFWS), visit the **Scholarship Cell (Admin Block Room 102)**.
   - For fee installment requests, submit an application addressed to the Principal.`;
    }

    if (q.includes('attendance') || q.includes('75%') || q.includes('shortage')) {
      return `### 📊 College Attendance Regulations

1. **Minimum Attendance Rule:**
   - As per university and institutional guidelines, a minimum of **75% aggregate attendance** in both lectures and practical laboratories is mandatory to be eligible for semester examinations.
2. **Medical & Leave Condonation:**
   - If absent due to medical reasons or authorized college participation (sports/cultural/hackathons), leave applications with supporting medical certificates must be submitted to the Class Proctor within **3 working days** of resuming classes.
3. **Monthly Attendance Tracking:**
   - Attendance is published on the ERP portal on the 5th of every month.
   - Students falling below 75% receive proctorial warnings.`;
    }

    if (q.includes('facility') || q.includes('lab') || q.includes('hostel') || q.includes('canteen') || q.includes('wifi')) {
      return `### 🏫 Campus Facilities & Operational Timings

- **Central Computing Lab:** Open Monday to Saturday, 8:30 AM – 8:00 PM. High-speed Gigabit internet and licensed engineering software.
- **Campus Wi-Fi Registration:** Visit the IT Infrastructure Cell (CCF Dept) with your laptop MAC address and college ID card to obtain your WPA2-Enterprise credentials.
- **Central Canteen & Cafeteria:** Open from 7:30 AM – 7:30 PM. Serves hygienic breakfast, lunch, and snacks.
- **Hostel Facilities:** Separate on-campus hostels for Boys and Girls with 24/7 security, solar water heating, and mess facilities. Contact Chief Rector Office for allotment.
- **Sports Complex & Gym:** Open 6:00 AM – 8:00 AM (Morning) and 4:30 PM – 7:30 PM (Evening).`;
    }

    if (q.includes('syllabus') || q.includes('curriculum') || q.includes('course outline')) {
      return `### 📚 Engineering & Academic Syllabus Structure

Here is the standard academic curriculum and syllabus framework:

#### 1. First-Year Foundation (Semesters 1 & 2)
- **Core Sciences:** Engineering Mathematics (Calculus, Linear Algebra), Engineering Physics / Chemistry.
- **Fundamental Computing:** Basic Electronics & Electrical Engineering, Programming in C/Python.
- **Practical Labs:** Engineering Graphics & CAD, Basic Workshop & Physics/Chemistry Labs.

#### 2. Second-Year Core (Semesters 3 & 4)
- **Computer Science / IT:** Data Structures & Algorithms, Object-Oriented Programming (Java/C++), Discrete Mathematics, Computer Organization & Architecture.
- **Database & Systems:** Database Management Systems (DBMS), Operating Systems, Digital Logic Design.

#### 3. Third-Year Advanced (Semesters 5 & 6)
- **Networking & Theory:** Computer Networks, Theory of Computation (Automata), Software Engineering & Agile.
- **Specializations:** Web Technologies, AI & Machine Learning, Cloud Computing, Cyber Security.

#### 4. Final-Year Application (Semesters 7 & 8)
- **Capstone & Industry:** Major Capstone Project, Industry Internship, Professional Electives.
- **Recommended Textbooks:** *Cormen (CLRS)* for Algorithms, *Silberschatz* for OS & DBMS, *Tanenbaum* for Networks.

> 💡 *Tip: For your university's exact course codes and unit credits, ask me with your specific branch and semester!*`;
    }

    if (q.includes('cgpa') || q.includes('sgpa') || q.includes('gpa') || q.includes('grade point')) {
      return `### 📊 SGPA & CGPA Calculation Formula (10-Point CBCS System)

Under the university Choice Based Credit System (CBCS), grades are awarded on a 10-point scale:

#### 1. Grading Scale
| Letter Grade | Performance | Grade Point ($G_i$) | Marks Range |
|:---|:---|:---|:---|
| **O** | Outstanding | **10** | 90% – 100% |
| **A+** | Excellent | **9** | 80% – 89% |
| **A** | Very Good | **8** | 70% – 79% |
| **B+** | Good | **7** | 60% – 69% |
| **B** | Above Average | **6** | 50% – 59% |
| **C** | Average | **5** | 45% – 49% |
| **P** | Pass | **4** | 40% – 44% |
| **F** | Fail | **0** | < 40% |

---

#### 2. SGPA Formula (Semester Grade Point Average)
$$\\text{SGPA} = \\frac{\\sum (C_i \\times G_i)}{\\sum C_i}$$
- **$C_i$**: Credits assigned to Course $i$.
- **$G_i$**: Grade Point secured in Course $i$.

#### 3. CGPA Formula (Cumulative Grade Point Average)
$$\\text{CGPA} = \\frac{\\sum (\\text{SGPA}_k \\times \\text{Credits}_k)}{\\text{Total Credits Across All Semesters}}$$

> 💡 *Formula to approximate Percentage from CGPA: $(\\text{CGPA} - 0.75) \\times 10$ or $\\text{CGPA} \\times 9.5$ (subject to your university's official ordinance).*`;
    }

    if (q.includes('normalization') || q.includes('1nf') || q.includes('2nf') || q.includes('3nf') || q.includes('bcnf')) {
      return `### 💡 Database Normalization (Academic Exam Guide)

**Normalization** is the systematic process of organizing data in a relational database to minimize data redundancy and eliminate anomalies (Insertion, Update, and Deletion anomalies).

---

#### 1. First Normal Form (1NF)
- **Rule:** Every column must hold atomic (indivisible) values. No repeating groups or multi-valued attributes.
- *Example:* Instead of storing \`Phone: 9876543210, 9123456789\` in one field, store separate records.

#### 2. Second Normal Form (2NF)
- **Rule:** Must be in 1NF **AND** eliminate Partial Dependency (no non-prime attribute should depend on a subset of a composite primary key).
- *Solution:* Decompose the table into separate entities with their respective primary keys.

#### 3. Third Normal Form (3NF)
- **Rule:** Must be in 2NF **AND** eliminate Transitive Dependency (non-prime attributes must not depend on other non-prime attributes: $X \\rightarrow Y \\rightarrow Z$).
- *Rule of Thumb:* *"Every non-key attribute must depend on the key, the whole key, and nothing but the key."*

#### 4. Boyce-Codd Normal Form (BCNF)
- **Rule:** A stricter version of 3NF. For every functional dependency $X \\rightarrow Y$, $X$ must be a **Super Key**.

> 📝 *Exam Tip: Always illustrate your exam answer with a sample Student-Course-Instructor table showing the step-by-step decomposition!*`;
    }

    // Default polite college helpdesk fallback response
    return `Hello! I am **CampusConnect AI**, your intelligent College Helpdesk & Academic Assistant.

I can assist you with a comprehensive range of academic and campus inquiries:
- **📚 Syllabus & Curriculum:** Unit-wise subject breakdowns, textbooks, course outcomes, and lab guidelines.
- **💡 Academic Concept Doubts:** Detailed explanations of engineering and college subjects (DBMS, OS, DSA, Networks, Math).
- **📊 CGPA & Grading Schemes:** 10-point CBCS formulas, SGPA calculations, and exam marking schemes.
- **📝 Exam Prep & Strategies:** High-weightage topics, revision roadmaps, and viva-voce questions.
- **🏛️ Campus Procedures:** Bonafide certificates, transcripts, fees, library access, and department inquiries.

Feel free to ask any academic question or college procedure!`;
  }
}

export const aiService = new AIService();
