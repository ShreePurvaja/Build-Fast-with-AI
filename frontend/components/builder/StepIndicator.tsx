'use client';

import React from 'react';

interface StepIndicatorProps {
  currentStep: number;
  setStep: (step: number) => void;
}

const STEPS = [
  { id: 0, label: '1. Describe', desc: 'Plain-language intake' },
  { id: 1, label: '2. Your Team', desc: 'Manager & Workers' },
  { id: 2, label: '3. Connect Tools', desc: 'APIs & Gateways' },
  { id: 3, label: '4. Test & Sim', desc: 'Interactive voice run' },
  { id: 4, label: '5. Deploy', desc: 'Voice link & release' }
];

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, setStep }) => {
  return (
    <div className="w-full mb-8">
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        {STEPS.map((step) => {
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;

          return (
            <button
              key={step.id}
              onClick={() => setStep(step.id)}
              className={`flex-1 min-w-[140px] px-3 py-2.5 rounded-xl border text-left transition-all ${
                isActive
                  ? 'bg-[#e3f2f1] border-[#0e6b6b] text-[#0e6b6b] font-bold shadow-xs'
                  : isCompleted
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-medium'
                  : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider mb-0.5">
                <span>{step.label}</span>
                {isCompleted && <span className="text-emerald-700">✓</span>}
              </div>
              <p className="text-xs truncate opacity-90 font-normal">{step.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
