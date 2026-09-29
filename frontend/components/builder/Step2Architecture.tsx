'use client';

import React from 'react';
import { WorkforceSpec, WorkerSpec } from '../../types/workforce';

interface Step2ArchitectureProps {
  spec: WorkforceSpec;
  setSpec: (spec: WorkforceSpec) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step2Architecture: React.FC<Step2ArchitectureProps> = ({ spec, setSpec, onNext, onBack }) => {

  const handleUpdateWorker = (workerId: string, updatedInstructions: string) => {
    const updatedWorkers = spec.workers.map((w) =>
      w.id === workerId ? { ...w, instructions: updatedInstructions } : w
    );
    setSpec({ ...spec, workers: updatedWorkers });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Title Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="badge-emerald font-semibold">Generated Architecture</span>
            <span className="text-xs text-slate-500">Version {spec.version}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            {spec.workforce}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Manager routes customer intents. Narrow specialist workers possess specific prompts, tools, and approval permissions.
          </p>
        </div>
        
        <div className="flex space-x-2">
          <button onClick={onBack} className="btn-outline-emerald text-sm py-2 px-4">
            ← Back
          </button>
          <button onClick={onNext} className="btn-emerald text-sm py-2 px-4">
            Connect Tools →
          </button>
        </div>
      </div>

      {/* Workforce Hierarchy Tree Graph */}
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 text-center">
          Workforce Hierarchy Graph (Manager → Specialist Workers → Gated Tools)
        </h3>
        
        <div className="flex flex-col items-center space-y-3 font-sans text-sm">
          {/* Organization Node */}
          <div className="bg-white px-4 py-1.5 rounded-lg border border-slate-300 font-semibold text-slate-700 shadow-2xs">
            🏢 Organization (org_sme_001)
          </div>
          <div className="text-slate-400 font-bold text-xs">↓</div>

          {/* Manager Node */}
          <div className="bg-[#0e6b6b] text-white px-6 py-2.5 rounded-xl font-bold text-base shadow-sm flex items-center space-x-2">
            <span>🛡️</span>
            <span>{spec.manager.name}</span>
            <span className="text-xs font-normal opacity-85 bg-white/20 px-2 py-0.5 rounded-md">
              Router (Max Hops: {spec.manager.max_hops})
            </span>
          </div>
          <div className="text-slate-400 font-bold text-xs">↓</div>

          {/* Workers Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full">
            {spec.workers.map((worker) => (
              <div
                key={worker.id}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-[#0e6b6b] transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-900 text-sm">{worker.name}</span>
                  <span className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                    id: {worker.id}
                  </span>
                </div>
                
                {/* Instructions Input */}
                <label className="text-[11px] font-semibold text-slate-500 uppercase block mb-1">
                  Worker Instructions & Prompt:
                </label>
                <textarea
                  value={worker.instructions}
                  onChange={(e) => handleUpdateWorker(worker.id, e.target.value)}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0e6b6b] h-20 resize-none mb-2"
                />

                {/* Connected Tools & Permissions */}
                <div className="space-y-1.5 pt-1 border-t border-slate-100">
                  <div className="flex flex-wrap gap-1">
                    {worker.tools.length > 0 ? (
                      worker.tools.map((t) => (
                        <span key={t} className="badge-emerald text-[11px] py-0 px-2">
                          ⚙️ {t} API
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        📖 KB Lookup Only
                      </span>
                    )}
                  </div>

                  {worker.permissions && worker.permissions.create_refund && (
                    <div className="badge-amber text-[11px] py-0.5 px-2 flex items-center justify-between">
                      <span>Approval Mode: {worker.permissions.create_refund.approval}</span>
                      <span>Max: ₹{worker.permissions.create_refund.max_amount}</span>
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Escalate_If Rules */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 text-xs">
        <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5 text-sm">
          🚨 Human Escalation Trigger Conditions (escalate_if):
        </h4>
        <div className="flex flex-wrap gap-2">
          {spec.escalate_if.map((rule, idx) => (
            <span key={idx} className="bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1 rounded-lg font-mono">
              IF {rule} → Route to Human Queue
            </span>
          ))}
        </div>
      </div>

    </div>
  );
};
