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

  // Twilio Phone Test State
  const [testPin, setTestPin] = useState<string>('4821');
  const [userPhone, setUserPhone] = useState<string>('');
  const [pinLoading, setPinLoading] = useState(false);

  // Web Speech API Microphone State
  const [isListening, setIsListening] = useState(false);
  const [recognitionInstance, setRecognitionInstance] = useState<any>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const handleGenerateTwilioPin = async () => {
    setPinLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/twilio/pin/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workforce_id: spec.id || 'wf_support',
          caller_phone: userPhone || undefined
        })
      });
      const data = await res.json();
      if (data.pin) {
        setTestPin(data.pin);
      }
    } catch (err) {
      console.warn('Backend offline, generating client test PIN');
      setTestPin(String(Math.floor(1000 + Math.random() * 9000)));
    } finally {
      setPinLoading(false);
    }
  };

  const speakUtterance = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleToggleMicrophone = () => {
    if (typeof window === 'undefined') return;

    if (isListening && recognitionInstance) {
      recognitionInstance.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Browser Speech Recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setCustomInput(transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    setRecognitionInstance(recognition);
    recognition.start();
  };

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

    // Call Backend Voice Engine
    fetch(`${API_BASE_URL}/api/simulate/turn`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workforce_id: spec.id || 'wf_support',
        session_id: 'web_session_sim',
        user_input: userTurn.text,
        language: 'en'
      })
    })
      .then((res) => res.json())
      .then((data) => {
        const agentTurn: ChatTurn = {
          id: String(Date.now() + 1),
          speaker: data.speaker || 'Query Worker',
          workerId: data.worker_id || 'query_worker',
          text: data.text || 'Processing query...',
          isUser: false,
          toolUsed: data.tool_used,
          approvalRequired: data.approval_required,
          idempotencyKey: data.idempotency_key
        };
        setChatHistory((prev) => [...prev, agentTurn]);
        if (data.worker_id) setActiveWorkerId(data.worker_id);

        // Speak Voice Agent Response Out Loud
        speakUtterance(data.text);
      })
      .catch((err) => {
        const agentTurn: ChatTurn = {
          id: String(Date.now() + 1),
          speaker: 'Query Worker',
          workerId: 'query_worker',
          text: `Query received: "${userTurn.text}". Processed via Knowledge Base lookup.`,
          isUser: false,
          idempotencyKey: `IK-${Math.random().toString(36).substring(7).toUpperCase()}`
        };
        setChatHistory((prev) => [...prev, agentTurn]);
        speakUtterance(agentTurn.text);
      });
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

          {/* Live Voice Testing Modes: Web Microphone & Twilio Phone Call */}
          <div className="bg-gradient-to-r from-emerald-50 via-slate-50 to-amber-50 p-4 rounded-xl border border-emerald-200 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="badge-emerald text-xs font-bold">🎙️ Voice Agent Studio</span>
                <h4 className="font-bold text-slate-900 text-sm mt-0.5">Test Live Voice Agent</h4>
                <p className="text-xs text-slate-600">Test via live browser microphone or dial our dedicated Twilio phone number.</p>
              </div>

              {/* Twilio Call Info Card */}
              <div className="bg-white px-3 py-2 rounded-xl border border-emerald-300 shadow-2xs flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 uppercase font-mono font-bold">Twilio Dedicated Number</div>
                  <div className="text-xs font-bold text-slate-900 font-mono">+1 (737) 250-8034</div>
                </div>
                <div className="border-l border-slate-200 pl-3">
                  <div className="text-[10px] text-amber-700 font-bold uppercase font-mono">Test PIN</div>
                  <div className="text-sm font-extrabold text-amber-900 font-mono">{testPin || 'GEN-PIN'}</div>
                </div>
                <button
                  onClick={handleGenerateTwilioPin}
                  className="btn-emerald text-[11px] py-1 px-2.5"
                  title="Generate new PIN / Register Phone Number"
                >
                  {pinLoading ? '...' : 'Get PIN'}
                </button>
              </div>
            </div>

            {/* Phone Number Registration Row for Caller ID Auto-Connect */}
            <div className="flex items-center space-x-2 bg-white/80 p-2 rounded-lg border border-slate-200 text-xs">
              <span className="font-semibold text-slate-700">📱 Auto-Connect Caller ID:</span>
              <input
                type="text"
                value={userPhone}
                onChange={(e) => setUserPhone(e.target.value)}
                placeholder="Enter your phone (+91 98765 43210)..."
                className="flex-1 px-2 py-1 bg-slate-50 border border-slate-200 rounded font-mono text-xs focus:outline-none focus:border-[#0e6b6b]"
              />
              <button
                onClick={handleGenerateTwilioPin}
                className="bg-slate-800 text-white text-[11px] px-2.5 py-1 rounded font-bold hover:bg-slate-900"
              >
                Bind Caller ID
              </button>
            </div>
          </div>

          {/* User Input Bar with Live Web Microphone Button */}
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center space-x-2">
            <button
              onClick={handleToggleMicrophone}
              className={`p-2.5 rounded-xl text-xs border font-bold flex items-center gap-1.5 transition-all ${
                isListening
                  ? 'bg-red-500 text-white border-red-600 animate-pulse'
                  : 'bg-emerald-700 text-white border-emerald-800 hover:bg-emerald-800'
              }`}
              title="Toggle Browser Microphone"
            >
              <span>{isListening ? '🛑 Stop Listening' : '🎤 Speak (Mic)'}</span>
            </button>

            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendCustomMessage()}
              placeholder={isListening ? 'Listening to microphone speech...' : 'Type or speak custom query in Tamil/Hinglish/English...'}
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
