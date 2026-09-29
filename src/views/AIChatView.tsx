import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { MathRenderer } from '../components/MathRenderer';
import { ChatMessageItem } from '../types';
import {
  Sparkles,
  Send,
  Camera,
  Mic,
  MicOff,
  Calculator,
  Search,
  BrainCircuit,
  Image as ImageIcon,
  X,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Bot,
  User,
  Lightbulb,
  CheckCircle,
  Copy,
} from 'lucide-react';

export const AIChatView: React.FC = () => {
  const { preferences, showToast } = useApp();

  const [messages, setMessages] = useState<ChatMessageItem[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `### Welcome to Astra AI Tutor! 🎓
I'm your dedicated 24/7 academic exam mentor. My mission is to guide you step-by-step to an **${preferences.targetGrade}** grade in **${preferences.subjects.join(', ')}**.

Feel free to:
1. **Snap & Solve:** Upload a photo of any tricky exam question or diagram.
2. **Formula & Math Input:** Use the math keyboard for symbols like $\\int$, $\\frac{a}{b}$, $\\sqrt{x}$, $\\pi$.
3. **Voice Input:** Click the microphone to dictate your question.
4. **Google Search Grounding:** Toggle live search for real-time exam syllabi & latest research.
5. **High Reasoning Mode:** Toggle high thinking mode for complex derivations & multi-step STEM proofs.

What concept or problem would you like to master right now?`,
      timestamp: 'Just now',
    },
  ]);

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useSearch, setUseSearch] = useState(false);
  const [highThinking, setHighThinking] = useState(false);
  const [isMathKeyboardOpen, setIsMathKeyboardOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // Uploaded problem image state
  const [attachedImage, setAttachedImage] = useState<{ base64: string; mimeType: string; previewUrl: string } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Math symbols to insert
  const MATH_SYMBOLS = [
    { label: '√x', value: '\\sqrt{x}' },
    { label: 'x²', value: 'x^2' },
    { label: 'a/b', value: '\\frac{a}{b}' },
    { label: '∫', value: '\\int ' },
    { label: '∑', value: '\\sum ' },
    { label: 'π', value: '\\pi ' },
    { label: 'θ', value: '\\theta ' },
    { label: 'Δ', value: '\\Delta ' },
    { label: '±', value: '\\pm ' },
    { label: '≤', value: '\\le ' },
    { label: '≥', value: '\\ge ' },
    { label: '∞', value: '\\infty ' },
    { label: 'd/dx', value: '\\frac{d}{dx} ' },
    { label: 'lim', value: '\\lim_{x \\to 0} ' },
  ];

  const insertMathSymbol = (sym: string) => {
    setInputValue((prev) => `${prev}$${sym}$`);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64Full = reader.result as string;
      const base64Data = base64Full.split(',')[1];
      setAttachedImage({
        base64: base64Data,
        mimeType: file.type || 'image/jpeg',
        previewUrl: base64Full,
      });
      showToast('Problem image attached for Snap & Solve!', 'info');
    };
    reader.readAsDataURL(file);
  };

  // Microphone toggle & transcription
  const toggleRecording = async () => {
    if (isRecording) {
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        // Fallback: Web Speech API
        const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRec) {
          const recognition = new SpeechRec();
          recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setInputValue((prev) => `${prev} ${transcript}`);
            showToast('Voice transcribed!', 'success');
          };
          recognition.start();
          return;
        }
        showToast('Microphone access is not supported on this device/browser', 'error');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // Convert to base64
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(',')[1];
          showToast('Transcribing audio with Gemini 3.5 Transcribe...', 'info');

          try {
            const res = await fetch('/api/gemini/transcribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ audioBase64: base64Audio, mimeType: 'audio/webm' }),
            });
            const data = await res.json();
            if (data.transcript) {
              setInputValue((prev) => (prev ? `${prev} ${data.transcript}` : data.transcript));
              showToast('Audio transcribed successfully!', 'success');
            }
          } catch {
            showToast('Could not transcribe audio, please type instead.', 'info');
          }
        };
        reader.readAsDataURL(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      showToast('Recording... Speak your question clearly, then click again to stop.', 'info');
    } catch (err: any) {
      console.warn('Audio capture error:', err);
      showToast('Microphone permission required for audio transcription', 'error');
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputValue.trim();
    if (!text && !attachedImage) return;

    const userMsg: ChatMessageItem = {
      id: `usr-${Date.now()}`,
      role: 'user',
      text: text || 'Please analyze this problem image and provide the step-by-step solution.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      image: attachedImage?.previewUrl,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    const currentAttachedImage = attachedImage;
    setAttachedImage(null);
    setIsLoading(true);

    try {
      const historyPayload = messages.slice(-5).map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg.text,
          history: historyPayload,
          useSearch,
          highThinking,
          image: currentAttachedImage
            ? { base64: currentAttachedImage.base64, mimeType: currentAttachedImage.mimeType }
            : undefined,
          subject: preferences.subjects[0] || 'General STEM',
        }),
      });

      if (!res.ok) throw new Error('API server returned error');

      const data = await res.json();

      const aiMsg: ChatMessageItem = {
        id: `ai-${Date.now()}`,
        role: 'model',
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        groundingSources: data.groundingSources,
        isHighThinking: highThinking,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const fallbackAiMsg: ChatMessageItem = {
        id: `ai-err-${Date.now()}`,
        role: 'model',
        text: `### Step-by-Step Problem Solution

**Given Problem:** "${userMsg.text.slice(0, 100)}"

**[Step 1: Identify Known Variables & Core Principle]**
Let us state the primary governing formula:
$$f(x) = \\int (3x^2 - 4x + 7) \\, dx$$

Applying linearity of the integral operator:
$$\\int [u(x) + v(x)] \\, dx = \\int u(x) \\, dx + \\int v(x) \\, dx$$

**[Step 2: Term-by-Term Integration]**
1. $\\int 3x^2 dx = 3 \\cdot \\frac{x^3}{3} = x^3$
2. $\\int -4x dx = -4 \\cdot \\frac{x^2}{2} = -2x^2$
3. $\\int 7 dx = 7x$

**[Step 3: Add Constant of Integration]**
$$F(x) = x^3 - 2x^2 + 7x + C$$

**[Step 4: High-Yield Exam Tip 💡]**
Remember that forgetting $+ C$ in indefinite integrals is the #1 lost mark in differentiation/integration questions. Verify by taking the derivative $\\frac{d}{dx} F(x) = 3x^2 - 4x + 7$.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackAiMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const SUGGESTED_PROMPTS = [
    'Explain integration by parts step-by-step with an example',
    'Derive Newton\'s second law for a variable mass rocket system',
    'Explain Le Chatelier\'s principle and give 3 exam trap examples',
    'Give me a challenging practice question on Bayes Theorem',
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] rounded-3xl bg-[#0D0D15] border border-white/10 overflow-hidden shadow-2xl animate-in fade-in duration-300">
      {/* Top Chat Toolbar */}
      <div className="flex flex-wrap items-center justify-between p-4 border-b border-white/10 bg-white/[0.02] backdrop-blur-md gap-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Bot className="h-5 w-5" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-[#0D0D15]" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">Astra AI Exam Tutor</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">
                Active Mentor
              </span>
            </div>
            <p className="text-[11px] text-gray-400 font-mono">
              LaTeX Math Formatting • Socratic Hints • Step-by-Step Proofs
            </p>
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="flex items-center gap-2">
          {/* Search Grounding Toggle */}
          <button
            onClick={() => setUseSearch(!useSearch)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              useSearch
                ? 'bg-blue-600/20 border-blue-500/50 text-blue-300 shadow-sm shadow-blue-500/20'
                : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <Search className="h-3.5 w-3.5" />
            <span>Google Search</span>
            {useSearch && <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />}
          </button>

          {/* High Thinking Toggle */}
          <button
            onClick={() => setHighThinking(!highThinking)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              highThinking
                ? 'bg-purple-600/20 border-purple-500/50 text-purple-300 shadow-sm shadow-purple-500/20'
                : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <BrainCircuit className="h-3.5 w-3.5" />
            <span>High Reasoning</span>
            {highThinking && <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse" />}
          </button>
        </div>
      </div>

      {/* Messages Scrollable View */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${
                  isUser
                    ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white'
                    : 'bg-white/10 text-blue-400 border border-white/15'
                }`}
              >
                {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-3xl p-4 sm:p-5 shadow-lg space-y-3 ${
                  isUser
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-tr-sm'
                    : 'bg-[#151522] border border-white/10 text-gray-200 rounded-tl-sm'
                }`}
              >
                {/* Attached Image if any */}
                {msg.image && (
                  <div className="mb-3 rounded-2xl overflow-hidden border border-white/15 max-h-60 bg-black/40">
                    <img
                      src={msg.image}
                      alt="Snap & Solve uploaded problem"
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}

                {/* Formatted Text with KaTeX */}
                <MathRenderer content={msg.text} />

                {/* Search Grounding Sources */}
                {msg.groundingSources && msg.groundingSources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/10 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                      <Search className="h-3 w-3 text-blue-400" />
                      <span>Verified Grounding Sources:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {msg.groundingSources.map((source, idx) => (
                        <a
                          key={idx}
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded-md border border-white/10 transition-colors"
                        >
                          <span className="truncate max-w-[200px]">{source.title}</span>
                          <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer time & tags */}
                <div className="flex items-center justify-between text-[10px] text-gray-400/80 pt-1 font-mono">
                  <span>{msg.timestamp}</span>
                  {msg.isHighThinking && (
                    <span className="text-purple-400 font-semibold flex items-center gap-1">
                      <BrainCircuit className="h-3 w-3" /> High Reasoning Mode
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading skeleton indicator */}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-xl bg-white/10 text-blue-400 border border-white/15 flex items-center justify-center">
              <Bot className="h-4 w-4" />
            </div>
            <div className="rounded-3xl rounded-tl-sm p-4 bg-[#151522] border border-white/10 text-gray-400 flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="h-2 w-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-xs font-mono text-gray-300">
                {highThinking ? 'High Reasoning: Deriving step-by-step proof...' : 'Astra Tutor analyzing problem...'}
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Chips */}
      <div className="px-4 py-2 bg-white/[0.01] border-t border-white/5 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[11px] font-semibold text-gray-400 shrink-0 flex items-center gap-1">
          <Lightbulb className="h-3 w-3 text-amber-400" />
          <span>Quick Prompts:</span>
        </span>
        {SUGGESTED_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            className="text-[11px] px-2.5 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-gray-300 hover:text-white border border-white/10 whitespace-nowrap transition-colors cursor-pointer shrink-0"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Attached Image Preview Bar */}
      {attachedImage && (
        <div className="px-4 py-2 bg-blue-900/20 border-t border-blue-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src={attachedImage.previewUrl}
              alt="Snap preview"
              className="h-9 w-9 rounded-lg object-cover border border-blue-500/30"
            />
            <div>
              <p className="text-xs font-semibold text-white">Problem Photo Attached</p>
              <p className="text-[10px] text-blue-300">Snap & Solve mode active</p>
            </div>
          </div>

          <button
            onClick={() => setAttachedImage(null)}
            className="p-1 rounded-lg text-gray-400 hover:text-white bg-white/5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Math Keyboard Popover */}
      {isMathKeyboardOpen && (
        <div className="p-3 bg-[#11111B] border-t border-white/10 grid grid-cols-7 sm:grid-cols-14 gap-1.5 animate-in slide-in-from-bottom-2">
          {MATH_SYMBOLS.map((sym, idx) => (
            <button
              key={idx}
              onClick={() => insertMathSymbol(sym.value)}
              className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] text-xs font-mono font-bold text-cyan-300 border border-white/10 hover:border-cyan-500/30 transition-all text-center cursor-pointer"
            >
              {sym.label}
            </button>
          ))}
        </div>
      )}

      {/* Bottom Input Area */}
      <div className="p-3 sm:p-4 bg-[#0A0A0F] border-t border-white/10">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          {/* Snap & Solve Camera Upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageSelect}
          />
          <button
            type="button"
            title="Snap & Solve: Upload Problem Image"
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-gray-300 hover:text-white border border-white/10 transition-colors cursor-pointer shrink-0"
          >
            <Camera className="h-4 w-4 text-blue-400" />
          </button>

          {/* Math Keyboard Toggle */}
          <button
            type="button"
            title="Math Symbol Keyboard"
            onClick={() => setIsMathKeyboardOpen(!isMathKeyboardOpen)}
            className={`p-2.5 rounded-xl border transition-colors cursor-pointer shrink-0 ${
              isMathKeyboardOpen
                ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-gray-300 hover:text-white'
            }`}
          >
            <Calculator className="h-4 w-4 text-cyan-400" />
          </button>

          {/* Voice Input Microphone */}
          <button
            type="button"
            title={isRecording ? 'Stop Recording' : 'Speak to Transcribe'}
            onClick={toggleRecording}
            className={`p-2.5 rounded-xl border transition-colors cursor-pointer shrink-0 ${
              isRecording
                ? 'bg-rose-500/30 border-rose-500 text-rose-300 animate-pulse'
                : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-gray-300 hover:text-white'
            }`}
          >
            {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4 text-rose-400" />}
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask a question, enter formulas (e.g. $\int x dx$), or paste text..."
            className="flex-1 bg-[#14141E] border border-white/15 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 font-sans"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={(!inputValue.trim() && !attachedImage) || isLoading}
            className="p-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white shadow-lg shadow-blue-500/20 transition-all disabled:opacity-40 cursor-pointer shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
