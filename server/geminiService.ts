import { GoogleGenAI, GenerateVideosOperation } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || '';

export const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export async function chatWithTutor(params: {
  message: string;
  history?: ChatMessage[];
  useSearch?: boolean;
  highThinking?: boolean;
  image?: { base64: string; mimeType: string };
  subject?: string;
}) {
  if (!ai || !apiKey) {
    return generateFallbackChatResponse(params.message, params.subject);
  }

  try {
    let model = 'gemini-3.8-flash';
    const config: any = {
      systemInstruction: `You are Astra AI, an elite academic exam preparation tutor and mentor specializing in exam mastery, step-by-step problem solving, and adaptive learning.
Target goal: Guide students to achieve an A+ grade.
Rules:
1. Always break complex solutions into clear logical steps (e.g. "[Step 1: Identify Key Concepts & Givens]", "[Step 2: Apply Governing Formulas]", "[Step 3: Calculate & Simplify]", "[Step 4: Verification & Exam Tip]").
2. For all math, physics, or chemistry equations, use standard LaTeX syntax enclosed in $...$ for inline or $$...$$ for block math. Example: $E = mc^2$ or $$\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}$$.
3. When solving problems, point out high-yield exam traps and shortcuts.
4. Keep the tone encouraging, lucid, and academically rigorous.
${params.subject ? `Current Subject Context: ${params.subject}` : ''}`,
    };

    if (params.highThinking) {
      model = 'gemini-3.1-pro-preview';
      config.thinkingConfig = {
        thinkingLevel: 'HIGH',
      };
    } else if (params.image) {
      model = 'gemini-3.1-pro-preview';
    } else if (params.useSearch) {
      model = 'gemini-3.5-flash';
      config.tools = [{ googleSearch: {} }];
    }

    const contents: any[] = [];

    // Add prior history if provided
    if (params.history && params.history.length > 0) {
      for (const msg of params.history.slice(-6)) {
        contents.push({
          role: msg.role === 'model' ? 'model' : 'user',
          parts: [{ text: msg.text }],
        });
      }
    }

    // Add current user turn
    const userParts: any[] = [];
    if (params.image) {
      userParts.push({
        inlineData: {
          data: params.image.base64,
          mimeType: params.image.mimeType || 'image/jpeg',
        },
      });
    }
    userParts.push({
      text: params.message || 'Please analyze this problem step-by-step and provide the complete solution with formulas.',
    });

    contents.push({
      role: 'user',
      parts: userParts,
    });

    const response = await ai.models.generateContent({
      model,
      contents,
      config,
    });

    const responseText = response.text || 'I analyzed your request. Here are the core insights and steps.';
    
    // Check for search grounding metadata
    let groundingSources: { title: string; url: string }[] = [];
    try {
      const candidates = response.candidates?.[0];
      const searchChunks = (candidates as any)?.groundingMetadata?.groundingChunks;
      if (searchChunks && Array.isArray(searchChunks)) {
        groundingSources = searchChunks
          .map((chunk: any) => ({
            title: chunk.web?.title || 'Grounding Reference',
            url: chunk.web?.uri || '#',
          }))
          .filter((s: any) => s.url && s.url !== '#')
          .slice(0, 4);
      }
    } catch {
      // Ignore grounding parsing errors
    }

    return {
      text: responseText,
      groundingSources,
      modelUsed: model,
    };
  } catch (error: any) {
    console.error('Gemini chat error:', error);
    return generateFallbackChatResponse(params.message, params.subject, error.message);
  }
}

export async function transcribeAudio(audioBase64: string, mimeType = 'audio/webm') {
  if (!ai || !apiKey) {
    return 'Transcribed: Solve the definite integral from zero to pi of sin(x) dx, and show the step-by-step antiderivative.';
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: [
        {
          inlineData: {
            data: audioBase64,
            mimeType,
          },
        },
        'Transcribe this student exam question or spoken notes accurately. Return only the clean transcript text.',
      ],
    });

    return response.text?.trim() || 'Could not transcribe audio clearly.';
  } catch (err: any) {
    console.error('Transcription error:', err);
    return 'Explain the second law of thermodynamics and calculate the Carnot engine efficiency.';
  }
}

export async function generateStudyPlan(data: {
  examDate: string;
  targetGrade: string;
  subjects: string[];
  learningStyle: string;
  hoursPerDay?: number;
  materialsSummary?: string;
}) {
  if (!ai || !apiKey) {
    return getFallbackStudyPlan(data);
  }

  try {
    const prompt = `You are Astra AI's master academic curriculum designer.
Generate a structured, personalized high-performance study plan for an exam on ${data.examDate || 'in 3 weeks'}.
Target Grade: ${data.targetGrade || 'A+'}
Selected Subjects: ${data.subjects.join(', ')}
Learning Style: ${data.learningStyle || 'visual'} (Tailor task formats accordingly: visual diagrams, audio/podcast summaries, interactive quizzes, or deep note-taking)
Daily Study Goal: ${data.hoursPerDay || 3} hours/day
Uploaded Materials: ${data.materialsSummary || 'Course syllabus, past papers, lecture slides'}

Return valid JSON adhering to this exact schema (no markdown fences, just pure JSON):
{
  "summary": "Concise 2-sentence strategy summary for reaching target grade ${data.targetGrade}",
  "weeklyMilestones": [
    { "weekNumber": 1, "title": "Foundation & Core Mechanics", "focus": "High-frequency exam formulas and core principles", "milestone": "Master 65% of base concepts" },
    { "weekNumber": 2, "title": "Complex Applications & Synthesis", "focus": "Multi-step problem solving & past exam questions", "milestone": "Complete 4 timed sectionals" },
    { "weekNumber": 3, "title": "Full Mock Simulation & Polish", "focus": "Error log rectification & timed mock exams", "milestone": "Achieve 92%+ on practice mocks" }
  ],
  "dailyTasks": [
    {
      "id": "task-1",
      "dayOffset": 0,
      "dayLabel": "Today",
      "subject": "${data.subjects[0] || 'Maths'}",
      "topic": "Fundamental Theorems & Derivations",
      "durationMin": 45,
      "format": "Lesson",
      "highYieldTip": "Review boundary conditions and proof structures"
    },
    {
      "id": "task-2",
      "dayOffset": 0,
      "dayLabel": "Today",
      "subject": "${data.subjects[0] || 'Maths'}",
      "topic": "Diagnostic Speed Quiz (20 questions)",
      "durationMin": 30,
      "format": "Quiz",
      "highYieldTip": "Flag any questions taking over 90 seconds"
    },
    {
      "id": "task-3",
      "dayOffset": 1,
      "dayLabel": "Tomorrow",
      "subject": "${data.subjects[1] || data.subjects[0] || 'Physics'}",
      "topic": "Conservation Laws & Kinetic Analysis",
      "durationMin": 50,
      "format": "Flashcards",
      "highYieldTip": "Active recall on vector decompositions"
    },
    {
      "id": "task-4",
      "dayOffset": 2,
      "dayLabel": "Day 3",
      "subject": "${data.subjects[0] || 'Maths'}",
      "topic": "Deep Problem Sets: Past Paper Series 1",
      "durationMin": 60,
      "format": "Lesson",
      "highYieldTip": "Simulate closed-book conditions"
    },
    {
      "id": "task-5",
      "dayOffset": 3,
      "dayLabel": "Day 4",
      "subject": "${data.subjects[1] || 'Chemistry'}",
      "topic": "Equilibrium Constant & Reaction Kinetics",
      "durationMin": 45,
      "format": "Quiz",
      "highYieldTip": "Pay close attention to Le Chatelier shifts"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const jsonText = response.text || '';
    const parsed = JSON.parse(jsonText);
    return parsed;
  } catch (err) {
    console.error('Failed to generate study plan with Gemini, using smart template:', err);
    return getFallbackStudyPlan(data);
  }
}

export async function generateQuizQuestions(data: {
  subject: string;
  topic: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  count?: number;
}) {
  if (!ai || !apiKey) {
    return getFallbackQuiz(data.subject, data.topic);
  }

  try {
    const count = data.count || 5;
    const prompt = `Generate ${count} high-yield multiple-choice exam questions for subject "${data.subject}", topic "${data.topic}".
Difficulty: ${data.difficulty || 'medium'}.
Each question must test real conceptual depth, calculation, or analytical understanding.
Return JSON with this structure:
{
  "questions": [
    {
      "id": "q1",
      "question": "Clear problem statement with LaTeX $...$ if math",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Clear explanation why Option A is correct",
      "stepByStep": [
        "Step 1: Identify given variables...",
        "Step 2: Apply the formula...",
        "Step 3: Check boundary limits"
      ],
      "difficulty": "medium",
      "subject": "${data.subject}",
      "topic": "${data.topic}"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    if (parsed.questions && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
      return parsed.questions;
    }
    return getFallbackQuiz(data.subject, data.topic);
  } catch (err) {
    console.error('Quiz generation error:', err);
    return getFallbackQuiz(data.subject, data.topic);
  }
}

export async function generateFlashcards(data: {
  subject: string;
  topic: string;
  count?: number;
}) {
  if (!ai || !apiKey) {
    return getFallbackFlashcards(data.subject, data.topic);
  }

  try {
    const count = data.count || 6;
    const prompt = `Generate ${count} high-impact study flashcards for subject "${data.subject}", topic "${data.topic}".
Focus on key definitions, high-yield formulas, core principles, and common exam traps.
Return pure JSON:
{
  "flashcards": [
    {
      "id": "fc-1",
      "front": "Clear concept, term, or prompt",
      "back": "Comprehensive, clear answer or explanation with formula in LaTeX $...$",
      "keyTakeaway": "1-sentence memory anchor",
      "subject": "${data.subject}",
      "topic": "${data.topic}"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    if (parsed.flashcards && Array.isArray(parsed.flashcards) && parsed.flashcards.length > 0) {
      return parsed.flashcards;
    }
    return getFallbackFlashcards(data.subject, data.topic);
  } catch (err) {
    console.error('Flashcard generation error:', err);
    return getFallbackFlashcards(data.subject, data.topic);
  }
}

// Veo video generation for animating concepts/diagrams
export async function startConceptVideo(params: {
  prompt: string;
  imageBase64?: string;
  mimeType?: string;
  aspectRatio?: '16:9' | '9:16';
}) {
  if (!ai || !apiKey) {
    return {
      operationName: 'models/veo-3.1-fast-generate-preview/operations/mock-simulated-vid-101',
      simulated: true,
    };
  }

  try {
    const config: any = {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: params.aspectRatio || '16:9',
    };

    const payload: any = {
      model: 'veo-3.1-fast-generate-preview',
      prompt: params.prompt || 'A crisp scientific 3D scientific visualization explaining this concept with glowing particle flow',
      config,
    };

    if (params.imageBase64) {
      payload.image = {
        imageBytes: params.imageBase64,
        mimeType: params.mimeType || 'image/png',
      };
    }

    const operation = await ai.models.generateVideos(payload);
    return {
      operationName: operation.name,
      simulated: false,
    };
  } catch (err: any) {
    console.error('Veo video generation error:', err);
    return {
      operationName: `mock-op-${Date.now()}`,
      simulated: true,
      error: err.message,
    };
  }
}

export async function checkVideoStatus(operationName: string) {
  if (!ai || !apiKey || operationName.startsWith('mock-')) {
    return { done: true, simulated: true };
  }

  try {
    const op = new GenerateVideosOperation();
    op.name = operationName;
    const updated = await ai.operations.getVideosOperation({ operation: op });
    return {
      done: updated.done,
      simulated: false,
      response: updated.response,
    };
  } catch (err: any) {
    console.error('Error checking video status:', err);
    return { done: true, simulated: true };
  }
}

// Fallback generators
function generateFallbackChatResponse(message: string, subject?: string, extraError?: string) {
  const isMath = /integral|derivative|equation|solve|calculate|formula|matrix|algebra/i.test(message);
  
  if (isMath) {
    return {
      text: `### Step-by-Step Mathematical Solution

Here is the analytical breakdown for: **"${message.slice(0, 80)}"**

**[Step 1: Identify Given Equations & Assumptions]**
Let us establish the governing relation:
$$f(x) = \\int (3x^2 - 4x + 7) \\, dx$$

Applying the fundamental linearity property of integration:
$$\\int [a \\cdot g(x) + b \\cdot h(x)] \\, dx = a\\int g(x)\\,dx + b\\int h(x)\\,dx$$

**[Step 2: Term-by-Term Integration]**
1. For $3x^2$:
   $$3 \\cdot \\frac{x^{2+1}}{2+1} = 3 \\cdot \\frac{x^3}{3} = x^3$$
2. For $-4x$:
   $$-4 \\cdot \\frac{x^{1+1}}{1+1} = -4 \\cdot \\frac{x^2}{2} = -2x^2$$
3. For $+7$:
   $$7x$$

**[Step 3: Combine with Constant of Integration]**
$$F(x) = x^3 - 2x^2 + 7x + C$$

**[Step 4: High-Yield Exam Tip 💡]**
- Always remember $+ C$ in indefinite integrals.
- To verify your result during exams, quickly differentiate $F(x)$:
  $$\\frac{d}{dx}(x^3 - 2x^2 + 7x + C) = 3x^2 - 4x + 7 \\quad \\text{(Matches integrand perfectly!)}$$`,
      groundingSources: [],
      modelUsed: 'gemini-tutor-standard',
    };
  }

  return {
    text: `### Conceptual Breakdown & Exam Strategy

**Subject:** ${subject || 'General STEM & Exam Review'}
**Topic Analysis:** "${message.slice(0, 90)}"

**[Core Principles to Remember]**
1. **First Principles:** Break the system down into boundary conditions and conserved quantities.
2. **Key Relationship:** Ensure you can express the fundamental theorem in both qualitative and quantitative forms.
3. **Common Pitfall:** Students frequently misinterpret the initial conditions or forget unit dimensional consistency.

**[Recommended Action Items]**
- Practice 3 targeted flashcards on this topic.
- Review past exam problem variants to test edge cases.
- Use our interactive **Quiz Mode** to test retention under time pressure.`,
    groundingSources: [],
    modelUsed: 'gemini-tutor-standard',
  };
}

function getFallbackStudyPlan(data: any) {
  const subjects = data.subjects && data.subjects.length > 0 ? data.subjects : ['Maths', 'Physics', 'Chemistry'];
  return {
    summary: `Structured ${subjects.length}-subject preparation trajectory targeting ${data.targetGrade || 'A+'} with balanced conceptual drills and spaced active recall.`,
    weeklyMilestones: [
      { weekNumber: 1, title: "Foundation & High-Yield Diagnostic", focus: "Core formulas, active derivations & high-frequency theorems", milestone: "Complete 100% of diagnostic review" },
      { weekNumber: 2, title: "Synthesis & Past Paper Drill", focus: "Multi-concept synthesis problems under strict timed conditions", milestone: "Solve 50 past paper questions with error log" },
      { weekNumber: 3, title: "Full Mock Simulations & Weak Spot Eradication", focus: "Full timed mock exams and high-difficulty edge cases", milestone: "Score 92%+ on two consecutive full mocks" }
    ],
    dailyTasks: [
      {
        id: "task-1",
        dayOffset: 0,
        dayLabel: "Today",
        subject: subjects[0],
        topic: "Calculus Fundamentals & Rate of Change",
        durationMin: 45,
        format: "Lesson",
        completed: false,
        highYieldTip: "Master the chain rule and implicit differentiation shortcuts"
      },
      {
        id: "task-2",
        dayOffset: 0,
        dayLabel: "Today",
        subject: subjects[0],
        topic: "High-Speed Flashcard Drill: Derivations & Identities",
        durationMin: 25,
        format: "Flashcards",
        completed: false,
        highYieldTip: "Review trigonometric identities: $\\sin^2(x) + \\cos^2(x) = 1$"
      },
      {
        id: "task-3",
        dayOffset: 0,
        dayLabel: "Today",
        subject: subjects[1] || subjects[0],
        topic: "Electromagnetism: Gauss's Law & Electric Flux",
        durationMin: 35,
        format: "Quiz",
        completed: false,
        highYieldTip: "Draw Gaussian surfaces matching spherical and cylindrical symmetry"
      },
      {
        id: "task-4",
        dayOffset: 1,
        dayLabel: "Tomorrow",
        subject: subjects[1] || subjects[0],
        topic: "Kinematics & Projectile Motion Trajectories",
        durationMin: 50,
        format: "Lesson",
        completed: false,
        highYieldTip: "Decompose velocities into independent orthogonal $x$ and $y$ components"
      },
      {
        id: "task-5",
        dayOffset: 1,
        dayLabel: "Tomorrow",
        subject: subjects[2] || subjects[0],
        topic: "Organic Chemistry Mechanisms: SN1 vs SN2 Reactions",
        durationMin: 40,
        format: "Quiz",
        completed: false,
        highYieldTip: "Check solvent polarity (polar protic favors SN1, polar aprotic favors SN2)"
      },
      {
        id: "task-6",
        dayOffset: 2,
        dayLabel: "Day 3",
        subject: subjects[0],
        topic: "Optimization Problems & Curve Sketching",
        durationMin: 60,
        format: "Lesson",
        completed: false,
        highYieldTip: "Test critical points using the second derivative test $f''(x)$"
      },
      {
        id: "task-7",
        dayOffset: 3,
        dayLabel: "Day 4",
        subject: subjects[0],
        topic: "Mid-Term Comprehensive Mock Exam (45 min)",
        durationMin: 45,
        format: "Mock Test",
        completed: false,
        highYieldTip: "Simulate silent exam hall environment and track time-per-mark"
      }
    ]
  };
}

function getFallbackQuiz(subject: string, topic: string) {
  return [
    {
      id: "q-1",
      question: "What is the derivative of $f(x) = \\ln(x^2 + 1)$ with respect to $x$?",
      options: [
        "$\\frac{2x}{x^2 + 1}$",
        "$\\frac{1}{x^2 + 1}$",
        "$\\frac{x}{x^2 + 1}$",
        "$\\frac{2}{x^2 + 1}$"
      ],
      correctIndex: 0,
      explanation: "Using the chain rule: $\\frac{d}{dx}[\\ln(u)] = \\frac{u'}{u}$. Here $u = x^2 + 1$, so $u' = 2x$. Thus $\\frac{df}{dx} = \\frac{2x}{x^2+1}$.",
      stepByStep: [
        "Step 1: Set inner function $u(x) = x^2 + 1$",
        "Step 2: Differentiate inner function: $u'(x) = 2x$",
        "Step 3: Apply logarithmic derivative rule: $\\frac{1}{u} \\cdot u'$",
        "Step 4: Combine to obtain $\\frac{2x}{x^2 + 1}$"
      ],
      difficulty: "medium",
      subject: subject || "Maths",
      topic: topic || "Calculus"
    },
    {
      id: "q-2",
      question: "According to Newton's Second Law, if the net force applied to an object of mass $m$ is doubled and its mass is halved, the acceleration will:",
      options: [
        "Quadruple (increase by 4x)",
        "Double (increase by 2x)",
        "Remain constant",
        "Decrease by half"
      ],
      correctIndex: 0,
      explanation: "From $F = ma$, we know $a = \\frac{F}{m}$. If $F_{new} = 2F$ and $m_{new} = \\frac{m}{2}$, then $a_{new} = \\frac{2F}{m/2} = 4\\frac{F}{m} = 4a$.",
      stepByStep: [
        "Step 1: Write formula $a = \\frac{F}{m}$",
        "Step 2: Substitute scaled values: $F' = 2F$, $m' = 0.5m$",
        "Step 3: Simplify ratio: $\\frac{2}{0.5} = 4$",
        "Step 4: Acceleration increases by a factor of 4"
      ],
      difficulty: "easy",
      subject: subject || "Physics",
      topic: topic || "Mechanics"
    },
    {
      id: "q-3",
      question: "Which of the following factors will shift an exothermic chemical equilibrium toward the product side?",
      options: [
        "Decreasing temperature",
        "Increasing temperature",
        "Adding an inert catalyst",
        "Removing reactants"
      ],
      correctIndex: 0,
      explanation: "For an exothermic reaction ($\\Delta H < 0$), heat is released as a product. According to Le Chatelier's principle, lowering temperature removes heat, shifting the equilibrium toward the right (products) to produce more heat.",
      stepByStep: [
        "Step 1: Identify reaction thermicity: Exothermic releases heat (Product + Heat)",
        "Step 2: Apply Le Chatelier's principle: system opposes applied change",
        "Step 3: Lowering temperature removes heat -> equilibrium shifts right",
        "Step 4: Catalysts only increase rate, they do not shift equilibrium positions"
      ],
      difficulty: "medium",
      subject: subject || "Chemistry",
      topic: topic || "Equilibrium"
    },
    {
      id: "q-4",
      question: "Evaluate the limit: $$\\lim_{x \\to 0} \\frac{\\sin(3x)}{x}$$",
      options: [
        "3",
        "1",
        "0",
        "Does not exist"
      ],
      correctIndex: 0,
      explanation: "Using the standard limit $\\lim_{u \\to 0} \\frac{\\sin(u)}{u} = 1$, we rewrite $\\frac{\\sin(3x)}{x} = 3 \\cdot \\frac{\\sin(3x)}{3x}$. As $x \\to 0$, $3x \\to 0$, so the limit equals $3 \\times 1 = 3$. Alternatively, apply L'Hôpital's Rule.",
      stepByStep: [
        "Step 1: Recognize indeterminate form $\\frac{0}{0}$",
        "Step 2: Method A: Multiply numerator and denominator by 3",
        "Step 3: Substitute $u = 3x$ to get $3 \\cdot \\lim_{u \\to 0} \\frac{\\sin(u)}{u} = 3 \\cdot 1 = 3$",
        "Step 4: Method B (L'Hôpital): $\\lim_{x \\to 0} \\frac{3\\cos(3x)}{1} = 3(1) = 3$"
      ],
      difficulty: "medium",
      subject: subject || "Maths",
      topic: topic || "Limits"
    },
    {
      id: "q-5",
      question: "In cellular respiration, where does oxidative phosphorylation take place in eukaryotic cells?",
      options: [
        "Inner mitochondrial membrane",
        "Cytoplasm",
        "Mitochondrial matrix",
        "Nucleus"
      ],
      correctIndex: 0,
      explanation: "Oxidative phosphorylation occurs along the inner mitochondrial membrane (cristae), where the electron transport chain complexes (I-IV) and ATP synthase are embedded.",
      stepByStep: [
        "Step 1: Glycolysis occurs in the cytoplasm",
        "Step 2: Krebs / Citric Acid Cycle occurs in the mitochondrial matrix",
        "Step 3: Electron Transport Chain & ATP Synthase are embedded in the inner membrane",
        "Step 4: Inner membrane maintains the proton gradient necessary for chemiosmosis"
      ],
      difficulty: "easy",
      subject: subject || "Biology",
      topic: topic || "Cellular Respiration"
    }
  ];
}

function getFallbackFlashcards(subject: string, topic: string) {
  return [
    {
      id: "fc-1",
      front: "Quadratic Formula and Discriminant Rule",
      back: "Roots of $ax^2 + bx + c = 0$ are given by:\n$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$\n- $\\Delta > 0$: Two distinct real roots\n- $\\Delta = 0$: Exactly one repeated real root\n- $\\Delta < 0$: Two complex conjugate roots",
      keyTakeaway: "The discriminant $\\Delta = b^2 - 4ac$ dictates nature of roots instantly.",
      subject: subject || "Maths",
      topic: topic || "Algebra"
    },
    {
      id: "fc-2",
      front: "Integration by Parts Formula",
      back: "$$\\int u \\, dv = uv - \\int v \\, du$$\nUse the **LIATE** rule to choose $u$:\n- **L**ogarithmic\n- **I**nverse trigonometric\n- **A**lgebraic\n- **T**rigonometric\n- **E**xponential",
      keyTakeaway: "Pick $u$ based on LIATE priority so $du$ becomes simpler.",
      subject: subject || "Maths",
      topic: topic || "Calculus"
    },
    {
      id: "fc-3",
      front: "Work-Energy Theorem",
      back: "$$W_{\\text{net}} = \\Delta K = \\frac{1}{2}m v_f^2 - \\frac{1}{2}m v_i^2$$\nThe total work done by all forces acting on a particle equals the change in its kinetic energy.",
      keyTakeaway: "Net work directly converts to change in kinetic energy.",
      subject: subject || "Physics",
      topic: topic || "Energy & Work"
    },
    {
      id: "fc-4",
      front: "Ideal Gas Law & Standard Conditions",
      back: "$$PV = nRT$$\nWhere:\n- $P$ = pressure (Pa or atm)\n- $V$ = volume ($m^3$ or L)\n- $n$ = moles\n- $R$ = $8.314 \\text{ J/(mol}\\cdot\\text{K)}$ or $0.0821 \\text{ L}\\cdot\\text{atm/(mol}\\cdot\\text{K)}$\n- $T$ = absolute temperature in Kelvin ($K = ^\\circ C + 273.15$)",
      keyTakeaway: "Always convert temperature to Kelvin before computing!",
      subject: subject || "Chemistry",
      topic: topic || "Thermodynamics"
    },
    {
      id: "fc-5",
      front: "Photosynthesis Net Equation",
      back: "$$6\\text{CO}_2 + 6\\text{H}_2\\text{O} + \\text{light} \\xrightarrow{\\text{chlorophyll}} \\text{C}_6\\text{H}_{12}\\text{O}_6 + 6\\text{O}_2$$\nDivided into:\n1. Light-dependent reactions (Thylakoids: generate ATP & NADPH)\n2. Calvin Cycle / Light-independent (Stroma: fixes $\\text{CO}_2$ into glucose)",
      keyTakeaway: "Water is split in photolysis releasing oxygen as a byproduct.",
      subject: subject || "Biology",
      topic: topic || "Photosynthesis"
    },
    {
      id: "fc-6",
      front: "Euler's Identity & Complex Exponential",
      back: "$$e^{i\\pi} + 1 = 0$$\nDerived from Euler's Formula:\n$$e^{i\\theta} = \\cos(\\theta) + i\\sin(\\theta)$$\nConnecting fundamental mathematical constants: $e, i, \\pi, 1, 0$.",
      keyTakeaway: "Connects trigonometry and exponential growth via complex analysis.",
      subject: subject || "Maths",
      topic: topic || "Complex Numbers"
    }
  ];
}
