'use client';

import React, { useState } from 'react';
import { History, CheckCircle2, AlertCircle, RefreshCw, Clock, ArrowRight, Play, Database } from 'lucide-react';

interface ExecutionRun {
  id: string;
  time: string;
  duration: string;
  status: string;
  input: string;
  output: string;
}

interface ExecutionsViewProps {
  executions: ExecutionRun[];
}

export const ExecutionsView: React.FC<ExecutionsViewProps> = ({ executions }) => {
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const selected = executions[selectedIdx] || executions[0];

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-56px)] max-w-7xl mx-auto py-4 px-4 gap-4">
      
      {/* Left List Panel */}
      <div className="w-full md:w-80 bg-white border border-[#E6E1D7] rounded-2xl overflow-hidden flex flex-col shadow-2xs">
        <div className="p-3.5 bg-[#F4F1EA] border-b border-[#E6E1D7] flex items-center justify-between">
          <span className="font-extrabold text-xs text-[#2B2826]">Execution Runs History</span>
          <span className="text-[11px] text-[#6E685E] font-semibold">{executions.length} runs</span>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-[#E6E1D7]">
          {executions.map((item, idx) => (
            <div 
              key={item.id}
              onClick={() => setSelectedIdx(idx)}
              className={`p-3.5 cursor-pointer transition-all ${
                selectedIdx === idx ? 'bg-[#FDF3E9] border-l-4 border-[#D97757]' : 'hover:bg-[#FAF8F5]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-[#2B2826]">{item.time}</span>
                <span className={`badge-pill ${item.status === 'Succeeded' ? 'badge-success' : 'badge-error'}`}>
                  {item.status}
                </span>
              </div>

              <div className="text-[11px] text-[#6E685E] mt-1 flex items-center space-x-2">
                <span>{item.duration}</span>
                <span>•</span>
                <span>{item.id}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Details Panel */}
      <div className="flex-1 bg-white border border-[#E6E1D7] rounded-2xl p-6 shadow-2xs overflow-y-auto">
        {selected ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#E6E1D7]">
              <div>
                <h2 className="text-xl font-extrabold text-[#2B2826]">Execution Session {selected.id}</h2>
                <p className="text-xs text-[#6E685E] mt-1">
                  Executed at {selected.time} • Total Duration: {selected.duration}
                </p>
              </div>

              <span className={`badge-pill text-xs px-3 py-1 ${selected.status === 'Succeeded' ? 'badge-success' : 'badge-error'}`}>
                {selected.status}
              </span>
            </div>

            {/* Input / Output Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-[#FAF8F5] border border-[#E6E1D7] rounded-xl">
                <div className="text-xs font-bold text-[#6E685E] mb-1">TRIGGER INPUT</div>
                <div className="text-xs text-[#2B2826] font-semibold">{selected.input}</div>
              </div>

              <div className="p-4 bg-[#FAF8F5] border border-[#E6E1D7] rounded-xl">
                <div className="text-xs font-bold text-[#6E685E] mb-1">PIPELINE RESULT</div>
                <div className="text-xs text-[#0F766E] font-semibold">{selected.output}</div>
              </div>
            </div>

            {/* Step Trace Timeline */}
            <div>
              <h3 className="font-extrabold text-sm text-[#2B2826] mb-3">Step-by-Step Node Execution Trace</h3>
              
              <div className="space-y-3">
                <div className="p-4 border border-[#E6E1D7] rounded-xl bg-[#FAF8F5]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-[#2B2826]">1. Form Submission Trigger (Google Sheets)</span>
                    <span className="badge-success">Completed (14ms)</span>
                  </div>
                  <pre className="bg-white p-2.5 border border-[#E6E1D7] rounded-lg text-xs font-mono">
{`{ "order_id": "4821", "customer": "Alex Morgan", "issue": "Saree arrived damaged" }`}
                  </pre>
                </div>

                <div className="p-4 border border-[#E6E1D7] rounded-xl bg-[#FAF8F5]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-[#2B2826]">2. MongoDB Document Query (ai_workforce_db.orders)</span>
                    <span className="badge-success">Completed (120ms)</span>
                  </div>
                  <pre className="bg-white p-2.5 border border-[#E6E1D7] rounded-lg text-xs font-mono">
{`{ "matched_document": true, "order_status": "Delivered", "price": 1499 }`}
                  </pre>
                </div>

                <div className="p-4 border border-[#E6E1D7] rounded-xl bg-[#FAF8F5]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-[#2B2826]">3. AI Support Agent Core (Claude 3.7 Sonnet)</span>
                    <span className="badge-success">Completed (820ms)</span>
                  </div>
                  <pre className="bg-white p-2.5 border border-[#E6E1D7] rounded-lg text-xs font-mono">
{`{ "intent": "refund", "decision": "APPROVE", "amount": 1499, "ref": "RF-2291" }`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-xs text-[#6E685E]">Select an execution run from the left list.</p>
        )}
      </div>

    </div>
  );
};
