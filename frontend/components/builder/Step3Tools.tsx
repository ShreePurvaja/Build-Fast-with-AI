'use client';

import React, { useState } from 'react';
import { WorkforceSpec } from '../../types/workforce';

interface Step3ToolsProps {
  spec: WorkforceSpec;
  onNext: () => void;
  onBack: () => void;
}

interface ToolMeta {
  id: string;
  name: string;
  category: string;
  hint: string;
  icon: string;
}

const TOOL_CATALOG: Record<string, ToolMeta> = {
  orders: {
    id: 'orders',
    name: 'Order Database API',
    category: 'E-commerce Store Admin',
    hint: 'Store admin panel under Settings → API or Developer Access.',
    icon: '📦'
  },
  pay: {
    id: 'pay',
    name: 'Payment Gateway (UPI / Gateway)',
    category: 'Payment API',
    hint: 'Payment provider dashboard API keys section. Sandbox test mode enabled by default.',
    icon: '💳'
  },
  helpdesk: {
    id: 'helpdesk',
    name: 'Helpdesk Ticketing System',
    category: 'Support Handoff',
    hint: 'Helpdesk admin settings under API Tokens.',
    icon: '🎫'
  },
  crm: {
    id: 'crm',
    name: 'CRM System (Lead & Customer Data)',
    category: 'Sales CRM',
    hint: 'CRM settings under Integrations or API access.',
    icon: '📊'
  },
  cal: {
    id: 'cal',
    name: 'Calendar & Slot Scheduler',
    category: 'Scheduling',
    hint: 'Google Calendar / Outlook API OAuth access key.',
    icon: '📅'
  },
  wa: {
    id: 'wa',
    name: 'WhatsApp Business / SMS Gateway',
    category: 'Messaging',
    hint: 'WhatsApp Business Cloud API access token.',
    icon: '💬'
  },
  ats: {
    id: 'ats',
    name: 'Candidate Tracking System (ATS)',
    category: 'Recruitment',
    hint: 'Hiring platform integration API key.',
    icon: '👥'
  }
};

export const Step3Tools: React.FC<Step3ToolsProps> = ({ spec, onNext, onBack }) => {
  const [useDemo, setUseDemo] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<Record<string, 'connected' | 'testing' | 'idle'>>({
    orders: 'connected',
    pay: 'connected',
    helpdesk: 'connected',
    crm: 'connected',
    cal: 'connected',
    wa: 'connected',
    ats: 'connected'
  });

  const neededTools = Array.from(new Set(spec.workers.flatMap((w) => w.tools)));

  const handleTestConnection = (toolId: string) => {
    setConnectionStatus((prev) => ({ ...prev, [toolId]: 'testing' }));
    setTimeout(() => {
      setConnectionStatus((prev) => ({ ...prev, [toolId]: 'connected' }));
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Title Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Connect Tool Integrations & Gateway
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Your workers access these real systems via the Tool Gateway (SSRF protection, approval gates & idempotency keys enforced).
          </p>
        </div>
        
        <div className="flex space-x-2">
          <button onClick={onBack} className="btn-outline-emerald text-sm py-2 px-4">
            ← Back
          </button>
          <button onClick={onNext} className="btn-emerald text-sm py-2 px-4">
            Continue to Interactive Test →
          </button>
        </div>
      </div>

      {/* Demo Data Sandbox Banner */}
      <div className="bg-[#fbf1dc] border border-[#f5d79e] p-4 rounded-xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-xl">🧪</span>
          <div>
            <h4 className="font-bold text-[#b7791f] text-sm">Demo Data & Sandbox Mode Enabled</h4>
            <p className="text-xs text-slate-700">Pre-configured mock store data, test payment keys, and simulated helpdesk tickets.</p>
          </div>
        </div>
        <label className="flex items-center space-x-2 text-xs font-bold text-slate-800 cursor-pointer">
          <input
            type="checkbox"
            checked={useDemo}
            onChange={(e) => setUseDemo(e.target.checked)}
            className="w-4 h-4 text-[#0e6b6b] accent-[#0e6b6b] rounded"
          />
          <span>Use Demo Data</span>
        </label>
      </div>

      {/* Needed Tools Grid */}
      <div className="space-y-4">
        {neededTools.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500">
            This workforce relies solely on knowledge base retrieval and requires no external system write tools.
          </div>
        ) : (
          neededTools.map((toolId) => {
            const meta = TOOL_CATALOG[toolId] || {
              id: toolId,
              name: `${toolId.toUpperCase()} System`,
              category: 'Integration',
              hint: 'Integration endpoint settings.',
              icon: '⚙️'
            };
            const status = connectionStatus[toolId] || 'idle';

            return (
              <div key={toolId} className="card-theme p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl p-2 bg-[#e3f2f1] rounded-xl">{meta.icon}</div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-bold text-slate-900 text-base">{meta.name}</h3>
                      <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                        {meta.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{meta.hint}</p>
                    
                    {!useDemo && (
                      <input
                        type="password"
                        placeholder={`Paste API key for ${meta.name}`}
                        className="mt-2 text-xs p-2 border border-slate-200 rounded-lg w-full sm:w-72 focus:outline-none focus:border-[#0e6b6b]"
                      />
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                  {status === 'connected' ? (
                    <span className="badge-emerald flex items-center space-x-1">
                      <span>✓</span>
                      <span>Connected {useDemo && '(Demo Sandbox)'}</span>
                    </span>
                  ) : status === 'testing' ? (
                    <span className="badge-amber animate-pulse">Testing ping...</span>
                  ) : (
                    <span className="text-xs text-slate-400">Not verified</span>
                  )}

                  <button
                    onClick={() => handleTestConnection(toolId)}
                    disabled={status === 'testing'}
                    className="btn-outline-emerald text-xs py-1.5 px-3"
                  >
                    Test Health
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
