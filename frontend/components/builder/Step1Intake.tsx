'use client';

import React, { useState } from 'react';
import { submitIntakePrompt } from '../../services/api';
import { WorkforceSpec } from '../../types/workforce';

interface Step1IntakeProps {
  onWorkforceGenerated: (spec: WorkforceSpec, promptText: string) => void;
}

const PROMPT_CHIPS = [
  "Handle customer refunds and order delivery status questions",
  "Follow up sales leads and schedule product demo slots",
  "Book clinic doctor appointments and dispatch WhatsApp reminders",
  "Screen candidate resumes and schedule engineering tech interviews"
];

export const Step1Intake: React.FC<Step1IntakeProps> = ({ onWorkforceGenerated }) => {
  const [prompt, setPrompt] = useState("Handle customer refunds and order delivery status questions");
  const [loading, setLoading] = useState(false);
  const [clarifyingQs, setClarifyingQs] = useState<string[]>([]);
  const [assumptions, setAssumptions] = useState<string[]>([]);

  const handleBuildTeam = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    
    try {
      const res = await submitIntakePrompt(prompt);
      setClarifyingQs(res.clarifying_questions);
      setAssumptions(res.assumptions);
      onWorkforceGenerated(res.generated_spec, prompt);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2">
          What should your AI workforce do?
        </h1>
        <p className="text-slate-600 text-base">
          Describe your business need in plain language (English, Hindi, Tamil, or Hinglish). The platform will intake the requirement and generate a coordinated team of AI workers.
        </p>
      </div>

      {/* Main Textarea */}
      <div className="mb-6">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Example: I need to handle customer complaints, check order delivery, and initiate refunds for damaged items..."
          className="w-full min-h-[140px] p-4 text-slate-900 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-[#0e6b6b] focus:bg-white text-lg transition-all"
        />
      </div>

      {/* Quick Prompt Chips */}
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase text-slate-500 mb-2 tracking-wider">
          Or pick a sample SME scenario:
        </p>
        <div className="flex flex-wrap gap-2">
          {PROMPT_CHIPS.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => setPrompt(chip)}
              className="text-xs font-medium bg-slate-100 text-slate-700 hover:bg-[#e3f2f1] hover:text-[#0e6b6b] border border-slate-200 rounded-full px-3 py-1.5 transition-colors text-left"
            >
              💡 {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Assumptions & Clarification Guardrails */}
      {clarifyingQs.length > 0 && (
        <div className="mb-6 bg-[#fbf1dc] border-l-4 border-[#b7791f] p-4 rounded-r-xl text-sm">
          <h4 className="font-bold text-[#b7791f] mb-1 flex items-center gap-1.5">
            🛡️ Stated Assumptions & Guardrails (≤3 Clarifying Qs):
          </h4>
          <ul className="list-disc pl-5 space-y-1 text-slate-800 text-xs">
            {clarifyingQs.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Build Team Action Button */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <div className="text-xs text-slate-500">
          * Control Plane validates spec schema & applies strict organization multi-tenancy.
        </div>
        <button
          onClick={handleBuildTeam}
          disabled={loading || !prompt.trim()}
          className="btn-emerald flex items-center space-x-2 text-base shadow-sm"
        >
          {loading ? (
            <span>Generating Team Architecture...</span>
          ) : (
            <>
              <span>Build My AI Workforce</span>
              <span>→</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
