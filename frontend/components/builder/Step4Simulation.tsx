'use client';

import React, { useState } from 'react';
import { WorkforceSpec } from '../../types/workforce';

interface Step4SimulationProps {
  spec: WorkforceSpec;
  onNext: () => void;
  onBack: () => void;
}

interface ChatTurn {
  id: string;
  speaker: string;
  workerId?: string;
  text: string;
  isUser: boolean;
  toolUsed?: string;
  approvalRequired?: boolean;
  idempotencyKey?: string;
  imageAttached?: string;
}

export const Step4Simulation: React.FC<Step4SimulationProps> = ({ spec, onNext, onBack }) => {
  const [chatHistory, setChatHistory] = useState<ChatTurn[]>([
    {
      id: '1',
      speaker: 'Customer (Tamil / Hinglish Voice)',
      text: 'En saree torn aagi vandhuchu, order 4821.',
      isUser: true
    },
    {
      id: '2',
      speaker: 'Order Verification Worker',
      workerId: 'order_check',
      text: 'Order #4821 verified in Order DB: Kanjivaram Silk Saree delivered 2 days ago via Express Courier.',
      isUser: false,
      toolUsed: 'orders',
      idempotencyKey: 'IK-A89F120B'
    }
  ]);

  const [activeWorkerId, setActiveWorkerId] = useState<string | null>('order_check');
  const [customInput, setCustomInput] = useState('');
  const [runningSim, setRunningSim] = useState(false);
  const [photoAttached, setPhotoAttached] = useState<string | null>(null);

  const handleRunPresetSimulation = () => {
    setRunningSim(true);
    setChatHistory([]);
    setActiveWorkerId(null);

    const script: Array<Partial<ChatTurn>> = [
      { speaker: 'Customer (Tamil / Voice)', text: 'En saree torn aagi vandhuchu, order 4821.', isUser: true },
      { speaker: 'Order Verification Worker', workerId: 'order_check', text: 'Order #4821 found. Kanjivaram Silk Saree delivered 2 days ago.', isUser: false, toolUsed: 'orders', idempotencyKey: 'IK-781A09' },
      { speaker: 'Customer (Tamil / Voice)', text: 'Photo upload panni irukken. Refund ₹1,499 venum.', isUser: true, imageAttached: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400' },
      { speaker: 'Refund Worker', workerId: 'refund', text: 'Damage verified from saree photo (torn hem line). Refund ₹1,499 requires your confirmation. Confirm?', isUser: false, toolUsed: 'pay', approvalRequired: true, idempotencyKey: 'IK-55F99B' },
      { speaker: 'Customer (Tamil / Voice)', text: 'Aama, confirm.', isUser: true },
      { speaker: 'Refund Worker', workerId: 'refund', text: 'Refund executed via Payment API. Ref RF-2291. Money arrives in 3-5 days in your bank account.', isUser: false, toolUsed: 'pay', idempotencyKey: 'IK-[#EXEC-2291]' }
    ];

    script.forEach((item, index) => {
      setTimeout(() => {
        setChatHistory((prev) => [
          ...prev,
          {
            id: String(Date.now() + index),
            speaker: item.speaker || 'System',
            workerId: item.workerId,
            text: item.text || '',
            isUser: !!item.isUser,
            toolUsed: item.toolUsed,
            approvalRequired: item.approvalRequired,
            idempotencyKey: item.idempotencyKey,
            imageAttached: item.imageAttached
          }
        ]);
        if (item.workerId) setActiveWorkerId(item.workerId);
        if (index === script.length - 1) setRunningSim(false);
      }, index * 1200);
    });
  };

  const handleSendCustomMessage = () => {
    if (!customInput.trim()) return;
    const userTurn: ChatTurn = {
      id: String(Date.now()),
      speaker: 'Customer (Voice Input)',
      text: customInput,
      isUser: true,
      imageAttached: photoAttached || undefined
    };

    setChatHistory((prev) => [...prev, userTurn]);
    setCustomInput('');
    setPhotoAttached(null);
    setActiveWorkerId('query_worker');

    setTimeout(() => {
      const agentTurn: ChatTurn = {
        id: String(Date.now() + 1),
        speaker: 'Query Worker',
        workerId: 'query_worker',
        text: `Query received: "${userTurn.text}". Processed via Knowledge Base pgvector lookup.`,
        isUser: false,
        idempotencyKey: `IK-${Math.random().toString(36).substring(7).toUpperCase()}`
      };
      setChatHistory((prev) => [...prev, agentTurn]);
    }, 800);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Title Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="badge-emerald font-semibold">Test Harness</span>
            <span className="text-xs text-slate-500">Indic Voice & Multi-Agent Replay</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            Test Your AI Workforce ({spec.workforce})
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Observe intent classification by {spec.manager.name}, narrow worker execution, tool gateway calls, and approval thresholds in real time.
          </p>
        </div>
        
        <div className="flex space-x-2">
          <button onClick={onBack} className="btn-outline-emerald text-sm py-2 px-4">
            ← Back
          </button>
          <button onClick={onNext} className="btn-emerald text-sm py-2 px-4">
            Proceed to Deploy →
          </button>
        </div>
      </div>

      {/* Main Grid: Chat Stream vs Active Worker Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chat Stream (2 Columns) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 flex flex-col h-[520px] shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="font-bold text-slate-800 text-sm">Live Voice Call Session</span>
              <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-mono">
                sess_9821
              </span>
            </div>
            
            <button
              onClick={handleRunPresetSimulation}
              disabled={runningSim}
              className="btn-emerald text-xs py-1.5 px-3"
            >
              {runningSim ? 'Running Script...' : '▶ Replay Scripted Tamil Call'}
            </button>
          </div>

          {/* Transcript Scroll Area */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {chatHistory.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.isUser ? 'items-end' : 'items-start'}`}
              >
                <div className="text-[11px] text-slate-500 font-semibold mb-1 flex items-center gap-1.5">
                  <span>{msg.speaker}</span>
                  {msg.toolUsed && (
                    <span className="badge-emerald text-[10px] py-0 px-1.5">
                      ⚙️ {msg.toolUsed}
                    </span>
                  )}
                  {msg.idempotencyKey && (
                    <span className="font-mono text-[10px] bg-slate-100 px-1 rounded text-slate-600">
                      {msg.idempotencyKey}
                    </span>
                  )}
                </div>

                <div
                  className={`max-w-[85%] text-sm ${
                    msg.isUser
                      ? 'chat-bubble-user font-medium'
                      : 'chat-bubble-agent'
                  }`}
                >
                  <p>{msg.text}</p>
                  
                  {msg.imageAttached && (
                    <div className="mt-2 border border-slate-200 rounded-lg overflow-hidden max-w-[200px]">
                      <img src={msg.imageAttached} alt="Uploaded damage" className="w-full h-28 object-cover" />
                      <div className="bg-slate-100 p-1 text-[10px] text-slate-600 font-mono text-center">
                        📷 Side-Channel Multimodal Photo
                      </div>
                    </div>
                  )}

                  {msg.approvalRequired && (
                    <div className="mt-2 pt-2 border-t border-amber-200/60 bg-amber-50 p-2 rounded-lg text-xs">
                      <p className="font-bold text-amber-900 mb-1">🔐 Approval Required Gate</p>
                      <button
                        onClick={() => {
                          setChatHistory((prev) => [
                            ...prev,
                            {
                              id: String(Date.now()),
                              speaker: 'Customer (Voice Approval)',
                              text: 'Aama, confirm.',
                              isUser: true
                            },
                            {
                              id: String(Date.now() + 1),
                              speaker: 'Refund Worker',
                              workerId: 'refund',
                              text: 'Refund started via Payment Gateway API. Ref RF-2291. Money arrives in 3-5 days.',
                              isUser: false,
                              toolUsed: 'pay',
                              idempotencyKey: 'IK-CONFIRMED-2291'
                            }
                          ]);
                        }}
                        className="bg-[#b7791f] text-white px-3 py-1 rounded font-bold hover:bg-amber-800 transition-colors"
                      >
                        Confirm ₹1,499 Refund Action →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* User Input Bar */}
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center space-x-2">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendCustomMessage()}
              placeholder="Type or speak custom customer query in any Indic language..."
              className="flex-1 text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0e6b6b]"
            />
            
            <button
              onClick={() => setPhotoAttached('https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400')}
              className={`p-2 rounded-xl text-xs border ${photoAttached ? 'bg-amber-100 border-amber-400 text-amber-900' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              title="Attach damaged item photo side-channel"
            >
              📷 {photoAttached ? 'Photo Attached' : 'Attach Photo'}
            </button>

            <button onClick={handleSendCustomMessage} className="btn-emerald text-xs py-2 px-4">
              Send
            </button>
          </div>
        </div>

        {/* Manager & Active Worker Monitor (1 Column) */}
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 flex flex-col space-y-3">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
            <span>🧠</span>
            <span>Manager & Worker Routing Monitor</span>
          </h3>

          {/* Manager Node */}
          <div className="bg-[#0e6b6b] text-white p-3 rounded-xl shadow-2xs">
            <h4 className="font-bold text-sm">{spec.manager.name}</h4>
            <p className="text-xs opacity-90 mt-0.5">
              Intent Routing Engine • Max Hops: {spec.manager.max_hops}
            </p>
            <div className="mt-2 pt-2 border-t border-white/20 text-[11px]">
              Active Delegate: <strong className="underline">{activeWorkerId || 'Idle'}</strong>
            </div>
          </div>

          {/* Worker Cards Status List */}
          <div className="space-y-2 flex-1 overflow-y-auto">
            {spec.workers.map((w) => {
              const isActive = activeWorkerId === w.id;
              return (
                <div
                  key={w.id}
                  className={`p-3 rounded-xl border transition-all ${
                    isActive
                      ? 'bg-white border-[#0e6b6b] shadow-xs active-worker-card'
                      : 'bg-white/60 border-slate-200 opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">{w.name}</span>
                    {isActive && (
                      <span className="badge-emerald text-[10px] animate-pulse py-0 px-1.5">
                        ACTIVE DELEGATE
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{w.instructions}</p>
                </div>
              );
            })}
          </div>

        </div>

      </div>

    </div>
  );
};
