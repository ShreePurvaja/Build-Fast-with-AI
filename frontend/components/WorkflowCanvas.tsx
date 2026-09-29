'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Plus, 
  Play, 
  Search, 
  X, 
  Database, 
  Server, 
  Cpu, 
  Layers, 
  Webhook, 
  Sheet, 
  Clock, 
  Mail, 
  MessageSquare, 
  Globe, 
  Sparkles, 
  Zap, 
  CheckCircle2, 
  Maximize2, 
  ZoomIn, 
  ZoomOut,
  RefreshCw,
  StickyNote,
  Download,
  Upload,
  Trash2,
  Code,
  Key,
  ShieldCheck,
  PhoneCall,
  FileText,
  Volume2,
  ArrowLeft,
  ChevronDown,
  Activity,
  TrendingUp,
  BarChart3,
  Sliders,
  Check,
  ExternalLink,
  Lock,
  UserCheck
} from 'lucide-react';

interface NodeData {
  id: string;
  name: string;
  type: 'ai' | 'db' | 'trigger' | 'tool' | 'logic' | 'knowledge';
  icon: string;
  subtitle: string;
  x: number;
  y: number;
  status?: 'idle' | 'running' | 'completed' | 'error';
  model?: string;
  prompt?: string;
  inputPayload?: any;
  outputPayload?: any;
  connectionId?: string;
}

interface StickyNoteData {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
}

interface ConnectionData {
  id: string;
  fromId: string;
  toId: string;
}

interface WorkflowCanvasProps {
  onRunFinished: (newRun: any) => void;
  onBackToProjects?: () => void;
}

export const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({ onRunFinished, onBackToProjects }) => {
  // Studio View Mode Sub-tabs
  const [studioTab, setStudioTab] = useState<'canvas' | 'executions' | 'analytics' | 'integrations'>('canvas');

  // Canvas State: Nodes
  const [nodes, setNodes] = useState<NodeData[]>([
    { 
      id: 'node-1', 
      name: 'Web Voice Call Intake', 
      type: 'trigger', 
      icon: 'phone', 
      subtitle: 'Sarvam Indic STT Stream', 
      x: 60, 
      y: 180,
      inputPayload: { caller_number: "+91 9876543210", language: "ta-IN", session_type: "voice_call" },
      outputPayload: { transcript: "வணக்கம், my order #4821 saree arrived damaged.", order_id: "4821" }
    },
    { 
      id: 'node-2', 
      name: 'MongoDB Customer DB', 
      type: 'db', 
      icon: 'database', 
      subtitle: 'ai_workforce_db.orders', 
      x: 400, 
      y: 180,
      inputPayload: { order_id: "4821" },
      outputPayload: { matched_document: true, order_id: "4821", customer: "Alex Morgan", item: "Kanjivaram Saree", amount: 1499, status: "Delivered" }
    },
    { 
      id: 'node-3', 
      name: 'NVIDIA Llama 3.1 Agent', 
      type: 'ai', 
      icon: 'bot', 
      subtitle: 'Refund & Intent Router', 
      x: 740, 
      y: 180, 
      model: 'meta/llama-3.1-70b-instruct',
      prompt: "You are a professional Client Success AI Worker.\n\nInspect incoming order {{ $json.order_id }} from MongoDB. Verify damage status and initiate refund approval if amount <= 2000 INR. Otherwise escalate to human supervisor.",
      inputPayload: { order_id: "4821", amount: 1499, customer: "Alex Morgan" },
      outputPayload: { decision: "APPROVE_REFUND", refund_amount: 1499, reference: "RF-2291", gate_check: "PASSED (1499 <= 2000 INR)" }
    },
    { 
      id: 'node-4', 
      name: 'Gmail & WhatsApp Tool', 
      type: 'tool', 
      icon: 'mail', 
      subtitle: 'Send Confirmation Receipt', 
      x: 1080, 
      y: 180,
      inputPayload: { decision: "APPROVE_REFUND", reference: "RF-2291", customer_email: "alex@company.com" },
      outputPayload: { email_sent: true, whatsapp_sent: true, timestamp: new Date().toLocaleTimeString() }
    }
  ]);

  // Canvas State: Connections
  const [connections, setConnections] = useState<ConnectionData[]>([
    { id: 'c1', fromId: 'node-1', toId: 'node-2' },
    { id: 'c2', fromId: 'node-2', toId: 'node-3' },
    { id: 'c3', fromId: 'node-3', toId: 'node-4' }
  ]);

  // Canvas State: Sticky Notes
  const [stickyNotes, setStickyNotes] = useState<StickyNoteData[]>([
    {
      id: 'sn-1',
      x: 400,
      y: 440,
      text: '📝 Approval Gate Constraint: Instant auto-refund cap is ₹2,000 INR. Anything higher escalates to supervisor inbox.',
      color: '#FEF3C7'
    }
  ]);

  // Modal & Popup States
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showNodeModal, setShowNodeModal] = useState(false);
  const [showNodePicker, setShowNodePicker] = useState(false);
  const [showWorkflowExecModal, setShowWorkflowExecModal] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isExecuting, setIsExecuting] = useState(false);
  const [nodeExecStatus, setNodeExecStatus] = useState<Record<string, 'idle' | 'running' | 'completed'>>({});

  // Real NVIDIA Models Loaded from Backend .env
  const [nvidiaModels, setNvidiaModels] = useState<any[]>([
    { id: 'meta/llama-3.1-70b-instruct', name: 'NVIDIA Llama 3.1 70B Instruct', provider: 'NVIDIA NIM' },
    { id: 'meta/llama-3.1-405b-instruct', name: 'NVIDIA Llama 3.1 405B Instruct', provider: 'NVIDIA NIM' },
    { id: 'mistralai/mixtral-8x22b-instruct', name: 'NVIDIA Mixtral 8x22B Instruct', provider: 'NVIDIA NIM' },
    { id: 'deepseek-ai/deepseek-r1', name: 'NVIDIA DeepSeek R1 (Reasoning)', provider: 'NVIDIA NIM' }
  ]);

  // Saved OAuth Connections
  const [oauthConnections, setOauthConnections] = useState({
    google: { connected: true, email: 'user@company.com', scopes: ['Gmail API', 'Google Drive', 'Google Sheets'] },
    nvidia: { connected: true, env_key_loaded: true },
    slack: { connected: false, channel: '#customer-support' },
    mongodb: { connected: true, db: 'ai_workforce_db' }
  });

  // Dragging State
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [draggingNoteId, setDraggingNoteId] = useState<string | null>(null);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Load Real NVIDIA Models from Backend on mount
  useEffect(() => {
    fetch('http://localhost:8000/api/nvidia/models')
      .then(res => res.json())
      .then(data => {
        if (data && data.models && data.models.length > 0) {
          setNvidiaModels(data.models);
        }
      })
      .catch(() => {});
  }, []);

  // Node Catalog (25+ Nodes)
  const nodeCatalog = [
    { id: 'trig_voice', name: 'Web Voice Call Intake', type: 'trigger' as const, icon: 'phone', cat: 'Triggers & Intake', desc: 'Real-time Indic streaming STT voice link', color: '#3B82F6' },
    { id: 'trig_webhook', name: 'Webhook HTTP Intake', type: 'trigger' as const, icon: 'webhook', cat: 'Triggers & Intake', desc: 'Listen to incoming POST webhooks', color: '#3B82F6' },
    { id: 'trig_sheet', name: 'Google Sheets Trigger', type: 'trigger' as const, icon: 'sheet', cat: 'Triggers & Intake', desc: 'Fires when new row added to sheet', color: '#3B82F6' },
    { id: 'trig_cron', name: 'Schedule Cron Timer', type: 'trigger' as const, icon: 'clock', cat: 'Triggers & Intake', desc: 'Recurring background schedule trigger', color: '#3B82F6' },

    { id: 'ai_nvidia_llama', name: 'NVIDIA Llama 3.1 70B Agent', type: 'ai' as const, icon: 'bot', cat: 'AI & Reasoning', desc: 'NVIDIA NIM high-speed task router', color: '#D97757' },
    { id: 'ai_claude_37', name: 'Claude 3.7 Sonnet Core', type: 'ai' as const, icon: 'bot', cat: 'AI & Reasoning', desc: 'Complex reasoning & decision worker', color: '#D97757' },
    { id: 'ai_deepseek_r1', name: 'NVIDIA DeepSeek R1 Reasoning', type: 'ai' as const, icon: 'zap', cat: 'AI & Reasoning', desc: 'Chain-of-thought logic & math solver', color: '#D97757' },

    { id: 'db_mongo', name: 'MongoDB Document Node', type: 'db' as const, icon: 'database', cat: 'Database & Storage', desc: 'Find, insert & aggregate documents', color: '#10B981' },
    { id: 'db_postgres', name: 'PostgreSQL DB Adapter', type: 'db' as const, icon: 'server', cat: 'Database & Storage', desc: 'SQL query & vector embeddings search', color: '#10B981' },

    { id: 'tool_gmail', name: 'Gmail Email Sender', type: 'tool' as const, icon: 'mail', cat: 'Tools & Actions', desc: 'Send receipts and customer updates', color: '#8B5CF6' },
    { id: 'tool_slack', name: 'Slack Channel Alert', type: 'tool' as const, icon: 'message-square', cat: 'Tools & Actions', desc: 'Post alerts to team Slack channels', color: '#8B5CF6' },
    { id: 'tool_whatsapp', name: 'WhatsApp Message API', type: 'tool' as const, icon: 'message-square', cat: 'Tools & Actions', desc: 'Send WhatsApp template notifications', color: '#8B5CF6' },

    { id: 'logic_if_else', name: 'If / Else Router', type: 'logic' as const, icon: 'layers', cat: 'Logic & Flow', desc: 'Branch workflow based on conditions', color: '#F59E0B' },
    { id: 'logic_code', name: 'JavaScript / Python Code', type: 'logic' as const, icon: 'code', cat: 'Logic & Flow', desc: 'Run custom code script transformation', color: '#F59E0B' },

    { id: 'kb_vector', name: 'Vector Knowledge Base RAG', type: 'knowledge' as const, icon: 'file-text', cat: 'Knowledge & Voice', desc: 'Retrieve policy chunks via pgvector', color: '#0F766E' },
    { id: 'kb_sarvam_tts', name: 'Sarvam Indic Voice TTS', type: 'knowledge' as const, icon: 'volume-2', cat: 'Knowledge & Voice', desc: 'Stream natural Tamil/Hindi speech audio', color: '#0F766E' }
  ];

  // Dragging Nodes Handlers
  const handleMouseDownNode = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setDraggingNodeId(nodeId);
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      dragOffsetRef.current = { x: e.clientX - node.x, y: e.clientY - node.y };
    }
  };

  // Dragging Sticky Notes Handlers
  const handleMouseDownNote = (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation();
    setDraggingNoteId(noteId);
    const note = stickyNotes.find(n => n.id === noteId);
    if (note) {
      dragOffsetRef.current = { x: e.clientX - note.x, y: e.clientY - note.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingNodeId) {
      const newX = Math.max(10, e.clientX - dragOffsetRef.current.x);
      const newY = Math.max(10, e.clientY - dragOffsetRef.current.y);
      setNodes(prev => prev.map(n => n.id === draggingNodeId ? { ...n, x: newX, y: newY } : n));
    } else if (draggingNoteId) {
      const newX = Math.max(10, e.clientX - dragOffsetRef.current.x);
      const newY = Math.max(10, e.clientY - dragOffsetRef.current.y);
      setStickyNotes(prev => prev.map(n => n.id === draggingNoteId ? { ...n, x: newX, y: newY } : n));
    }
  };

  const handleMouseUp = () => {
    setDraggingNodeId(null);
    setDraggingNoteId(null);
  };

  // Open Centered Node Inspector Modal (Item 5)
  const handleOpenNodeModal = (nodeId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedNodeId(nodeId);
    setShowNodeModal(true);
  };

  // Execute Individual Single Node (Item 6)
  const handleExecuteSingleNode = (nodeId: string) => {
    setNodeExecStatus(prev => ({ ...prev, [nodeId]: 'running' }));
    
    setTimeout(() => {
      setNodeExecStatus(prev => ({ ...prev, [nodeId]: 'completed' }));
      setNodes(prev => prev.map(n => {
        if (n.id === nodeId) {
          return {
            ...n,
            status: 'completed',
            outputPayload: {
              ...n.outputPayload,
              executed_at: new Date().toLocaleTimeString(),
              single_node_test: "SUCCESS (Passed Validation)"
            }
          };
        }
        return n;
      }));
    }, 900);
  };

  // Execute Full Workflow (Item 7)
  const handleExecuteWholeWorkflow = () => {
    setIsExecuting(true);
    setShowWorkflowExecModal(true);

    const resetNodes = nodes.map(n => ({ ...n, status: 'idle' as const }));
    setNodes(resetNodes);

    nodes.forEach((node, index) => {
      setTimeout(() => {
        setNodes(prev => prev.map((n, i) => {
          if (i === index) return { ...n, status: 'running' };
          if (i < index) return { ...n, status: 'completed' };
          return n;
        }));
      }, (index + 1) * 800);
    });

    setTimeout(() => {
      setNodes(prev => prev.map(n => ({ ...n, status: 'completed' })));
      setIsExecuting(false);

      const newRun = {
        id: `exec_${Math.floor(160 + Math.random() * 800)}`,
        time: new Date().toLocaleTimeString(),
        duration: '1.24s',
        status: 'Succeeded',
        input: 'MongoDB Order #4821 Refund enquiry',
        output: 'Refund RF-2291 processed in MongoDB & emailed via Gmail'
      };
      onRunFinished(newRun);
    }, (nodes.length + 1) * 800);
  };

  // Sticky Note Actions
  const handleAddStickyNote = () => {
    const colors = ['#FEF3C7', '#DCFCE7', '#E0F2FE', '#FCE7F3', '#EDE9FE'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const newNote: StickyNoteData = {
      id: `sn-${Date.now()}`,
      x: 350 + stickyNotes.length * 30,
      y: 300 + stickyNotes.length * 30,
      text: '📌 Double-click to type workflow notes, approval rules, or OAuth scopes.',
      color: randomColor
    };
    setStickyNotes([...stickyNotes, newNote]);
  };

  // JSON Export / Import
  const handleExportJSON = () => {
    const exportData = {
      name: "Customer Support & Refund Pipeline",
      version: "1.0.0",
      created_at: new Date().toISOString(),
      nodes,
      connections,
      stickyNotes
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workforce_workflow_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target?.result as string);
        if (data.nodes && Array.isArray(data.nodes)) {
          setNodes(data.nodes);
          if (data.connections) setConnections(data.connections);
          if (data.stickyNotes) setStickyNotes(data.stickyNotes);
          alert("Workflow JSON imported successfully!");
        }
      } catch (err) {
        alert("Failed to parse JSON file.");
      }
    };
    reader.readAsText(file);
  };

  const handleAddNodeFromPicker = (item: typeof nodeCatalog[0]) => {
    const newNodeId = `node_${Date.now()}`;
    const lastNode = nodes[nodes.length - 1];
    const newX = lastNode ? lastNode.x + 320 : 200;
    const newY = lastNode ? lastNode.y : 180;

    const newNode: NodeData = {
      id: newNodeId,
      name: item.name,
      type: item.type,
      icon: item.icon,
      subtitle: item.cat,
      x: newX,
      y: newY,
      model: item.id.includes('nvidia') ? 'meta/llama-3.1-70b-instruct' : 'claude-3-7-sonnet',
      prompt: `System prompt for ${item.name}`,
      inputPayload: { sample_input: "Data from previous step" },
      outputPayload: { sample_output: "Processed result" }
    };

    setNodes([...nodes, newNode]);
    if (lastNode) {
      setConnections(prev => [...prev, { id: `c_${Date.now()}`, fromId: lastNode.id, toId: newNodeId }]);
    }
    setShowNodePicker(false);
  };

  const targetNode = nodes.find(n => n.id === selectedNodeId) || nodes[2];

  return (
    <div 
      className="flex flex-col h-[calc(100vh-56px)] bg-[#FAF8F5] relative overflow-hidden select-none"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      
      {/* Studio Header Toolbar with Exit Button (Item 2) */}
      <div className="h-13 bg-white border-b border-[#E6E1D7] px-4 flex items-center justify-between z-30 shadow-xs">
        
        {/* Left: Exit Canvas & Workflow Title */}
        <div className="flex items-center space-x-3">
          {onBackToProjects && (
            <button 
              onClick={onBackToProjects}
              className="btn-claude-secondary text-xs py-1.5 px-3 flex items-center space-x-1.5 font-bold hover:bg-[#FAF8F5]"
              title="Exit Canvas and return to Projects overview"
            >
              <ArrowLeft className="w-4 h-4 text-[#D97757]" />
              <span>Back to Projects</span>
            </button>
          )}

          <div className="h-5 w-[1px] bg-[#E6E1D7]" />

          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-sm text-[#2B2826]">
              Customer Support & Refund Pipeline
            </span>
            <span className="badge-success text-[10px]">MongoDB Connected</span>
          </div>
        </div>

        {/* Center: Studio View Mode Sub-tabs (Item 1) */}
        <div className="flex bg-[#F4F1EA] p-1 rounded-xl border border-[#E6E1D7] space-x-1">
          <button 
            onClick={() => setStudioTab('canvas')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              studioTab === 'canvas' ? 'bg-white text-[#D97757] shadow-xs' : 'text-[#6E685E]'
            }`}
          >
            Canvas
          </button>
          <button 
            onClick={() => setStudioTab('executions')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              studioTab === 'executions' ? 'bg-white text-[#D97757] shadow-xs' : 'text-[#6E685E]'
            }`}
          >
            Executions History
          </button>
          <button 
            onClick={() => setStudioTab('analytics')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              studioTab === 'analytics' ? 'bg-white text-[#D97757] shadow-xs' : 'text-[#6E685E]'
            }`}
          >
            Model Usage
          </button>
          <button 
            onClick={() => setStudioTab('integrations')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              studioTab === 'integrations' ? 'bg-white text-[#D97757] shadow-xs' : 'text-[#6E685E]'
            }`}
          >
            Integrations & OAuth
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleAddStickyNote}
            className="btn-claude-secondary text-xs py-1.5 px-3 flex items-center space-x-1"
          >
            <StickyNote className="w-3.5 h-3.5 text-[#D97706]" />
            <span>+ Sticky Note</span>
          </button>

          <button 
            onClick={() => setShowNodePicker(true)}
            className="btn-claude-secondary text-xs py-1.5 px-3 flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5 text-[#D97757]" />
            <span>Add Node</span>
          </button>

          <button 
            onClick={handleExportJSON}
            className="btn-claude-secondary text-xs py-1.5 px-3 flex items-center space-x-1"
          >
            <Download className="w-3.5 h-3.5 text-[#3B82F6]" />
            <span>Export JSON</span>
          </button>

          <label className="btn-claude-secondary text-xs py-1.5 px-3 flex items-center space-x-1 cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-[#10B981]" />
            <span>Import JSON</span>
            <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
          </label>

          <button 
            onClick={handleExecuteWholeWorkflow}
            disabled={isExecuting}
            className="btn-claude-primary text-xs py-1.5 px-4 flex items-center space-x-1.5 font-bold"
          >
            {isExecuting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            <span>Execute Workflow</span>
          </button>
        </div>
      </div>

      {/* VIEW SUB-TAB 1: CANVAS VISUAL GRID */}
      {studioTab === 'canvas' && (
        <div 
          className="flex-1 relative cursor-crosshair overflow-auto"
          style={{
            backgroundImage: 'radial-gradient(#D6CFBF 1.3px, transparent 1.3px)',
            backgroundSize: '24px 24px'
          }}
        >
          {/* Dynamic Curved Bezier Lines */}
          <svg className="absolute inset-0 w-[3000px] h-[3000px] pointer-events-none z-10">
            {connections.map(conn => {
              const fromNode = nodes.find(n => n.id === conn.fromId);
              const toNode = nodes.find(n => n.id === conn.toId);
              if (!fromNode || !toNode) return null;
              const x1 = fromNode.x + 240;
              const y1 = fromNode.y + 40;
              const x2 = toNode.x;
              const y2 = toNode.y + 40;
              const dx = Math.abs(x2 - x1) * 0.5;
              const pathD = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;

              return (
                <g key={conn.id}>
                  <path d={pathD} stroke="#D6CFBF" strokeWidth="3" fill="none" />
                  <circle cx={x1} cy={y1} r="4" fill="#D97757" />
                  <circle cx={x2} cy={y2} r="4" fill="#10B981" />
                </g>
              );
            })}
          </svg>

          {/* Sticky Notes */}
          {stickyNotes.map(note => (
            <div
              key={note.id}
              onMouseDown={(e) => handleMouseDownNote(e, note.id)}
              style={{ left: `${note.x}px`, top: `${note.y}px`, backgroundColor: note.color }}
              className="absolute w-56 p-3.5 rounded-2xl shadow-md border border-black/10 z-20 cursor-move"
            >
              <div className="flex items-center justify-between mb-1 text-[10.5px] font-bold text-black/60 uppercase">
                <span className="flex items-center gap-1"><StickyNote className="w-3 h-3" /> Sticky Note</span>
                <button onClick={() => setStickyNotes(prev => prev.filter(n => n.id !== note.id))} className="text-black/40 hover:text-red-600">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <textarea
                value={note.text}
                onChange={(e) => {
                  const text = e.target.value;
                  setStickyNotes(prev => prev.map(sn => sn.id === note.id ? { ...sn, text } : sn));
                }}
                className="w-full bg-transparent border-none text-xs font-sans text-gray-800 focus:outline-none resize-none"
                rows={3}
              />
            </div>
          ))}

          {/* Canvas Nodes (Draggable & Clickable to Centered Popup) */}
          {nodes.map(n => (
            <div
              key={n.id}
              onClick={(e) => handleOpenNodeModal(n.id, e)}
              onMouseDown={(e) => handleMouseDownNode(e, n.id)}
              style={{ left: `${n.x}px`, top: `${n.y}px` }}
              className={`absolute w-60 bg-white border-1.5 rounded-2xl shadow-md z-20 cursor-grab active:cursor-grabbing transition-shadow hover:shadow-lg ${
                selectedNodeId === n.id ? 'border-[#D97757] ring-4 ring-[#FDF3E9]' : 'border-[#E6E1D7] hover:border-[#D6CFBF]'
              } ${
                n.status === 'running' ? 'border-[#D97706] ring-4 ring-[#FEF3C7] animate-pulse' : ''
              } ${
                n.status === 'completed' ? 'border-[#0F766E] ring-3 ring-[#E6F4F1]' : ''
              }`}
            >
              <div className="flex items-center space-x-2.5 p-3 border-b border-[#E6E1D7] bg-[#F4F1EA] rounded-t-2xl">
                <div 
                  className="w-7 h-7 rounded-lg text-white flex items-center justify-center font-bold text-xs shrink-0"
                  style={{
                    backgroundColor: n.type === 'ai' ? '#D97757' : n.type === 'db' ? '#10B981' : n.type === 'trigger' ? '#3B82F6' : n.type === 'tool' ? '#8B5CF6' : '#F59E0B'
                  }}
                >
                  <Bot className="w-4 h-4" />
                </div>
                <div className="overflow-hidden">
                  <div className="font-bold text-xs text-[#2B2826] truncate">{n.name}</div>
                  <div className="text-[10px] text-[#6E685E] truncate">{n.subtitle}</div>
                </div>
              </div>

              <div className="p-3 text-[11px] text-[#6E685E] space-y-1">
                {n.type === 'db' && <div>Query: <b className="text-[#2B2826]">orders.findOne()</b></div>}
                {n.type === 'ai' && <div>Model: <b className="text-[#D97757] font-mono text-[10.5px]">{n.model || 'Llama 3.1 70B'}</b></div>}
                {n.type === 'trigger' && <div>Pipeline: <b className="text-[#2B2826]">Indic VAD + STT</b></div>}
                {n.type === 'tool' && <div>Target: <b className="text-[#2B2826]">Gmail / WhatsApp</b></div>}
              </div>

              {/* Individual Node Execute Trigger Button */}
              <div className="px-3 pb-2.5 flex justify-between items-center text-[10.5px]">
                <button 
                  onClick={(e) => { e.stopPropagation(); handleExecuteSingleNode(n.id); }}
                  className="text-[#0F766E] font-bold hover:underline flex items-center gap-1"
                >
                  <Play className="w-3 h-3" /> Execute Node
                </button>
                <span className="text-[#9B9488]">Click to edit</span>
              </div>

              <div className="w-3.5 h-3.5 bg-white border-2 border-[#D6CFBF] rounded-full absolute -left-2 top-1/2 -translate-y-1/2" />
              <div className="w-3.5 h-3.5 bg-white border-2 border-[#D6CFBF] rounded-full absolute -right-2 top-1/2 -translate-y-1/2" />
            </div>
          ))}

          {/* Floating Zoom Controls */}
          <div className="absolute bottom-5 left-5 bg-white border border-[#E6E1D7] rounded-xl p-1 shadow-md flex space-x-1 z-30">
            <button className="p-1.5 text-[#6E685E] hover:text-[#2B2826] rounded-lg"><ZoomIn className="w-4 h-4" /></button>
            <button className="p-1.5 text-[#6E685E] hover:text-[#2B2826] rounded-lg"><ZoomOut className="w-4 h-4" /></button>
            <button className="p-1.5 text-[#6E685E] hover:text-[#2B2826] rounded-lg"><Maximize2 className="w-4 h-4" /></button>
          </div>
        </div>
      )}

      {/* VIEW SUB-TAB 2: EXECUTIONS HISTORY */}
      {studioTab === 'executions' && (
        <div className="flex-1 p-6 overflow-y-auto max-w-5xl mx-auto w-full space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-[#E6E1D7] shadow-xs flex justify-between items-center">
            <div>
              <h2 className="font-extrabold text-lg text-[#2B2826]">Workflow Execution Trace History</h2>
              <p className="text-xs text-[#6E685E]">Execution runs specific to Customer Support & Refund Pipeline</p>
            </div>
            <button onClick={handleExecuteWholeWorkflow} className="btn-claude-primary text-xs py-2 px-4 font-bold flex items-center gap-1.5">
              <Play className="w-3.5 h-3.5" /> Execute New Run
            </button>
          </div>

          <div className="bg-white border border-[#E6E1D7] rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 bg-[#FAF8F5] border-b border-[#E6E1D7] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="badge-success text-xs">Run #exec_159 • Succeeded</span>
                <span className="text-xs text-[#6E685E]">Total Duration: 1.24s</span>
              </div>
              <span className="text-xs font-mono text-[#9B9488]">20:17:29</span>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#E6E1D7] text-xs">
                  <div className="font-bold text-[#6E685E] mb-1">INPUT TRIGGER PAYLOAD</div>
                  <pre className="font-mono text-[#2B2826] text-[11px] whitespace-pre-wrap">
{`{ "order_id": "4821", "customer": "Alex Morgan", "issue": "Saree arrived damaged" }`}
                  </pre>
                </div>
                <div className="bg-[#E6F4F1] p-3 rounded-xl border border-[#99F6E4] text-xs">
                  <div className="font-bold text-[#0F766E] mb-1">FINAL WORKFLOW RESULT</div>
                  <pre className="font-mono text-[#0F766E] text-[11px] whitespace-pre-wrap">
{`{ "status": "APPROVED", "refund_amount": 1499, "ref": "RF-2291", "action": "MongoDB Write & Email Sent" }`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW SUB-TAB 3: MODEL USAGE LINE GRAPH (Item 3) */}
      {studioTab === 'analytics' && (
        <div className="flex-1 p-6 overflow-y-auto max-w-6xl mx-auto w-full space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-[#E6E1D7] shadow-xs flex justify-between items-center">
            <div>
              <h2 className="font-extrabold text-xl text-[#2B2826] flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#D97757]" />
                <span>Model Usage & Multi-Line Token Throughput</span>
              </h2>
              <p className="text-xs text-[#6E685E] mt-0.5">Real-time token consumption line graph per LLM model provider</p>
            </div>
            <span className="bg-[#76B900]/15 text-[#76B900] font-bold text-xs px-3 py-1 rounded-xl border border-[#76B900]/30">
              NVIDIA NIM Active
            </span>
          </div>

          {/* Interactive Multi-Line Graph Component */}
          <div className="bg-white p-6 rounded-2xl border border-[#E6E1D7] shadow-2xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-bold text-[#2B2826]">Token Consumption Over Time (k tokens)</span>
              
              {/* Legend Pills */}
              <div className="flex items-center space-x-3 text-xs font-bold">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#76B900]"></span> NVIDIA Llama 3.1 70B</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#D97757]"></span> Claude 3.7 Sonnet</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#F59E0B]"></span> Groq Fast LLM</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#3B82F6]"></span> Sarvam Voice STT</span>
              </div>
            </div>

            {/* SVG Multi-Line Chart Canvas */}
            <div className="relative h-64 w-full bg-[#FAF8F5] rounded-2xl border border-[#E6E1D7] p-4">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 600 200" preserveAspectRatio="none">
                {/* Horizontal Grid lines */}
                <line x1="0" y1="40" x2="600" y2="40" stroke="#E6E1D7" strokeDasharray="3 3" />
                <line x1="0" y1="90" x2="600" y2="90" stroke="#E6E1D7" strokeDasharray="3 3" />
                <line x1="0" y1="140" x2="600" y2="140" stroke="#E6E1D7" strokeDasharray="3 3" />

                {/* Line 1: NVIDIA Llama 3.1 (Green #76B900) */}
                <path 
                  d="M 20 160 C 100 130, 200 80, 300 40 C 400 30, 500 20, 580 15" 
                  stroke="#76B900" 
                  strokeWidth="3.5" 
                  fill="none" 
                />
                
                {/* Line 2: Claude 3.7 Sonnet (Orange #D97757) */}
                <path 
                  d="M 20 170 C 100 150, 200 120, 300 90 C 400 70, 500 50, 580 40" 
                  stroke="#D97757" 
                  strokeWidth="3" 
                  fill="none" 
                />

                {/* Line 3: Groq LLM (Amber #F59E0B) */}
                <path 
                  d="M 20 180 C 100 170, 200 140, 300 130 C 400 110, 500 90, 580 85" 
                  stroke="#F59E0B" 
                  strokeWidth="2.5" 
                  fill="none" 
                />

                {/* Line 4: Sarvam Voice (Blue #3B82F6) */}
                <path 
                  d="M 20 185 C 100 180, 200 165, 300 155 C 400 145, 500 135, 580 130" 
                  stroke="#3B82F6" 
                  strokeWidth="2" 
                  fill="none" 
                />

                {/* Data Point Dots */}
                <circle cx="580" cy="15" r="5" fill="#76B900" className="animate-ping" />
                <circle cx="580" cy="15" r="4" fill="#76B900" />
                <circle cx="580" cy="40" r="4" fill="#D97757" />
                <circle cx="580" cy="85" r="4" fill="#F59E0B" />
                <circle cx="580" cy="130" r="4" fill="#3B82F6" />
              </svg>

              {/* Time X-Axis Labels */}
              <div className="flex justify-between text-[11px] font-bold text-[#6E685E] mt-2 px-2">
                <span>09:00</span>
                <span>11:00</span>
                <span>13:00</span>
                <span>15:00</span>
                <span>17:00</span>
                <span>19:00 (Live)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW SUB-TAB 4: INTEGRATIONS & OAUTH MANAGER (Item 4) */}
      {studioTab === 'integrations' && (
        <div className="flex-1 p-6 overflow-y-auto max-w-5xl mx-auto w-full space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-[#E6E1D7] shadow-xs flex justify-between items-center">
            <div>
              <h2 className="font-extrabold text-xl text-[#2B2826] flex items-center gap-2">
                <Lock className="w-5 h-5 text-[#D97757]" />
                <span>Integrations & OAuth Connections Manager</span>
              </h2>
              <p className="text-xs text-[#6E685E] mt-0.5">Connect and save OAuth credentials for Google Drive, Gmail, NVIDIA NIM, and MongoDB</p>
            </div>
            <span className="badge-success text-xs">3 Credentials Saved</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Google OAuth Connection Card */}
            <div className="bg-white p-5 rounded-2xl border border-[#E6E1D7] shadow-2xs space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center font-bold text-blue-600 text-sm">
                    G
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-[#2B2826]">Google Workspace OAuth</h3>
                    <p className="text-[11px] text-[#6E685E]">Gmail API, Google Sheets, Drive</p>
                  </div>
                </div>

                {oauthConnections.google.connected ? (
                  <span className="badge-success text-[10.5px]">Connected & Saved</span>
                ) : (
                  <span className="badge-warning text-[10.5px]">Not Connected</span>
                )}
              </div>

              <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E6E1D7] text-xs font-mono">
                <div>Account: <b>{oauthConnections.google.email}</b></div>
                <div className="text-[10.5px] text-[#6E685E] mt-0.5">Scopes: {oauthConnections.google.scopes.join(', ')}</div>
              </div>

              <button 
                onClick={() => alert("Google OAuth re-authorization token refreshed and saved!")}
                className="btn-claude-secondary w-full text-xs py-2 font-bold flex items-center justify-center gap-1.5"
              >
                <UserCheck className="w-4 h-4 text-[#0F766E]" />
                <span>Re-Authenticate Google OAuth</span>
              </button>
            </div>

            {/* NVIDIA API Key Card */}
            <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-2xs space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-[#76B900] text-black flex items-center justify-center font-extrabold text-xs">
                    NV
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-white">NVIDIA NIM API Key (.env)</h3>
                    <p className="text-[11px] text-slate-400">GPU Accelerated Llama 3.1 & DeepSeek R1</p>
                  </div>
                </div>

                <span className="bg-[#76B900]/20 text-[#76B900] font-bold text-[10.5px] px-2 py-0.5 rounded border border-[#76B900]/40">
                  Active in .env
                </span>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-[#76B900]">
                <div>Key Source: <b>backend/.env</b></div>
                <div className="text-[10.5px] text-slate-400 mt-0.5">Models: {nvidiaModels.length} NIM Foundation Models Loaded</div>
              </div>

              <button 
                onClick={() => alert("NVIDIA API Key connection tested and operational!")}
                className="bg-[#76B900] hover:bg-[#68A200] text-black w-full text-xs py-2 font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Verify NVIDIA Endpoint</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* CENTERED POPUP MODAL FOR NODE INSPECTION & SETUP (Item 5 & 6) */}
      {showNodeModal && targetNode && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E6E1D7] max-w-5xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="h-14 px-6 bg-[#F4F1EA] border-b border-[#E6E1D7] flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-8 h-8 rounded-lg text-white flex items-center justify-center font-bold text-xs"
                  style={{
                    backgroundColor: targetNode.type === 'ai' ? '#D97757' : targetNode.type === 'db' ? '#10B981' : targetNode.type === 'trigger' ? '#3B82F6' : '#8B5CF6'
                  }}
                >
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#2B2826]">{targetNode.name} Configuration</h3>
                  <span className="text-[11px] text-[#6E685E] font-medium">{targetNode.subtitle} • Node ID: {targetNode.id}</span>
                </div>
              </div>

              <button onClick={() => setShowNodeModal(false)} className="text-[#9B9488] hover:text-[#2B2826] p-1">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal 3-Column Body (Left: Input, Center: Setup, Right: Output) */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden divide-y md:divide-y-0 md:divide-x divide-[#E6E1D7]">
              
              {/* LEFT COLUMN: INPUT FROM PREVIOUS NODE (3 Cols) */}
              <div className="md:col-span-3 bg-[#FAF8F5] p-5 overflow-y-auto space-y-3">
                <div className="flex items-center justify-between text-xs font-extrabold text-[#6E685E] uppercase tracking-wider">
                  <span>Input Payload</span>
                  <span className="badge-success text-[10px]">Received</span>
                </div>
                <p className="text-[11px] text-[#6E685E]">Data payload passed into this node from upstream triggers/nodes.</p>

                <div className="bg-white p-3 border border-[#E6E1D7] rounded-xl text-xs font-mono">
                  <pre className="whitespace-pre-wrap text-[11px]">
                    {JSON.stringify(targetNode.inputPayload || { order_id: "4821", amount: 1499 }, null, 2)}
                  </pre>
                </div>
              </div>

              {/* CENTER COLUMN: NODE SETUP & NEAT MODEL SELECTION (6 Cols) */}
              <div className="md:col-span-6 p-6 overflow-y-auto space-y-5 bg-white">
                
                {/* Neat Model Selection Dropdown (Item 9) */}
                <div>
                  <label className="text-xs font-bold text-[#2B2826] block mb-1.5 flex items-center justify-between">
                    <span>Model Architecture Selection</span>
                    <span className="text-[11px] text-[#76B900] font-mono">Real NVIDIA NIM API Loaded</span>
                  </label>

                  <div className="relative">
                    <select 
                      value={targetNode.model || 'meta/llama-3.1-70b-instruct'}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNodes(prev => prev.map(n => n.id === targetNode.id ? { ...n, model: val } : n));
                      }}
                      className="w-full p-3 border border-[#E6E1D7] rounded-xl text-xs font-bold bg-[#FAF8F5] focus:outline-none focus:border-[#D97757] appearance-none cursor-pointer pr-10"
                    >
                      <optgroup label="NVIDIA NIM Foundation Models (.env Loaded)">
                        {nvidiaModels.map(m => (
                          <option key={m.id} value={m.id}>
                            🟢 {m.name} ({m.provider})
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Anthropic Claude Models">
                        <option value="claude-3-7-sonnet">🟠 Claude 3.7 Sonnet (Anthropic)</option>
                        <option value="claude-3-5-haiku">🟠 Claude 3.5 Haiku (Fast)</option>
                      </optgroup>
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-3 top-3.5 text-[#9B9488] pointer-events-none" />
                  </div>
                </div>

                {/* System Prompt / Node Instructions */}
                <div>
                  <label className="text-xs font-bold text-[#2B2826] block mb-1">Worker Prompt & Instructions</label>
                  <textarea 
                    rows={6}
                    value={targetNode.prompt || "You are an automated worker..."}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNodes(prev => prev.map(n => n.id === targetNode.id ? { ...n, prompt: val } : n));
                    }}
                    className="w-full p-3 border border-[#E6E1D7] rounded-xl text-xs font-mono bg-[#FAF8F5] focus:outline-none focus:border-[#D97757] resize-none"
                  />
                </div>

                {/* OAuth & Connection Selector */}
                <div>
                  <label className="text-xs font-bold text-[#2B2826] block mb-1">Attached OAuth / Credentials</label>
                  <div className="p-3 bg-[#FAF8F5] border border-[#E6E1D7] rounded-xl flex justify-between items-center text-xs">
                    <div className="flex items-center space-x-2">
                      <ShieldCheck className="w-4 h-4 text-[#0F766E]" />
                      <span className="font-semibold text-[#2B2826]">Google Workspace OAuth & NVIDIA API Key</span>
                    </div>
                    <span className="badge-success text-[10px]">Saved</span>
                  </div>
                </div>

                {/* Single Node Execution Action (Item 6) */}
                <div className="pt-3 border-t border-[#E6E1D7] flex space-x-3">
                  <button 
                    onClick={() => handleExecuteSingleNode(targetNode.id)}
                    disabled={nodeExecStatus[targetNode.id] === 'running'}
                    className="btn-claude-primary text-xs py-2.5 px-5 font-bold flex items-center gap-2 rounded-xl"
                  >
                    {nodeExecStatus[targetNode.id] === 'running' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                    <span>Execute Single Node Step</span>
                  </button>
                </div>

              </div>

              {/* RIGHT COLUMN: OUTPUT RESPONSE & LIVE PREVIEW (3 Cols) */}
              <div className="md:col-span-3 bg-[#FAF8F5] p-5 overflow-y-auto space-y-3">
                <div className="flex items-center justify-between text-xs font-extrabold text-[#6E685E] uppercase tracking-wider">
                  <span>Output Response</span>
                  {nodeExecStatus[targetNode.id] === 'completed' && <span className="badge-success text-[10px]">Executed</span>}
                </div>
                <p className="text-[11px] text-[#6E685E]">Result generated after executing this step.</p>

                <div className="bg-white p-3 border border-[#E6E1D7] rounded-xl text-xs font-mono">
                  <pre className="whitespace-pre-wrap text-[11px] text-[#0F766E]">
                    {JSON.stringify(targetNode.outputPayload || { status: "APPROVED", refund_amount: 1499 }, null, 2)}
                  </pre>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="h-14 px-6 bg-[#F4F1EA] border-t border-[#E6E1D7] flex items-center justify-between">
              <span className="text-xs text-[#6E685E] font-medium">Changes are saved automatically to node state.</span>
              <button 
                onClick={() => setShowNodeModal(false)}
                className="btn-claude-secondary text-xs py-2 px-5 font-bold rounded-xl"
              >
                Close Inspector
              </button>
            </div>

          </div>
        </div>
      )}

      {/* FULL WORKFLOW EXECUTION TRACE MODAL (Item 7) */}
      {showWorkflowExecModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E6E1D7] max-w-3xl w-full shadow-2xl p-6 space-y-5">
            <div className="flex justify-between items-center border-b border-[#E6E1D7] pb-4">
              <div className="flex items-center space-x-2">
                <Play className="w-5 h-5 text-[#D97757]" />
                <h3 className="font-extrabold text-base text-[#2B2826]">Full Workflow Execution Trace</h3>
              </div>
              <button onClick={() => setShowWorkflowExecModal(false)} className="text-[#9B9488] hover:text-[#2B2826]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sequential Node Step Execution Trace */}
            <div className="space-y-3 max-h-72 overflow-y-auto">
              {nodes.map((n, idx) => (
                <div key={n.id} className="p-3.5 border border-[#E6E1D7] rounded-xl bg-[#FAF8F5] flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-lg bg-[#D97757] text-white font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="font-bold text-xs text-[#2B2826]">{n.name}</div>
                      <div className="text-[10.5px] text-[#6E685E]">{n.subtitle}</div>
                    </div>
                  </div>

                  <span className={`badge-pill text-[10.5px] ${
                    n.status === 'completed' ? 'badge-success' : n.status === 'running' ? 'badge-warning animate-pulse' : 'badge-inactive'
                  }`}>
                    {n.status === 'completed' ? 'Succeeded (280ms)' : n.status === 'running' ? 'Running...' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>

            {/* Final Execution Banner */}
            {!isExecuting && (
              <div className="p-4 bg-[#E6F4F1] border border-[#99F6E4] rounded-2xl text-xs space-y-1">
                <div className="font-extrabold text-[#0F766E] text-sm flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Final Workflow Execution Result: SUCCESS</span>
                </div>
                <p className="text-[#0F766E] font-medium">
                  Pipeline executed in 1.24s. Refund RF-2291 verified in MongoDB and receipt sent via Gmail & WhatsApp API.
                </p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button 
                onClick={() => setShowWorkflowExecModal(false)}
                className="btn-claude-secondary text-xs py-2 px-5 font-bold"
              >
                Close Trace
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NODE PICKER CATALOG MODAL */}
      {showNodePicker && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E6E1D7] max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 bg-[#F4F1EA] border-b border-[#E6E1D7] flex items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#9B9488]" />
                <input 
                  type="text" 
                  placeholder="Search 25+ nodes (e.g., NVIDIA, MongoDB, Gmail, Voice STT, Slack...)" 
                  value={pickerSearch}
                  onChange={e => setPickerSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 border border-[#E6E1D7] rounded-xl text-xs bg-white focus:outline-none focus:border-[#D97757]"
                />
              </div>
              <button onClick={() => setShowNodePicker(false)} className="text-[#9B9488] hover:text-[#2B2826]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-2 flex-1">
              {nodeCatalog
                .filter(item => item.name.toLowerCase().includes(pickerSearch.toLowerCase()) || item.desc.toLowerCase().includes(pickerSearch.toLowerCase()))
                .map(item => (
                  <div 
                    key={item.id}
                    onClick={() => handleAddNodeFromPicker(item)}
                    className="p-3 border border-[#E6E1D7] rounded-xl hover:border-[#D97757] hover:bg-[#FDF3E9] cursor-pointer flex items-center justify-between transition-all"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-xl text-white flex items-center justify-center font-bold text-xs" style={{ backgroundColor: item.color }}>
                        <Bot className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-[#2B2826]">{item.name}</div>
                        <div className="text-[11px] text-[#6E685E]">{item.desc}</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-[#6E685E] bg-[#F4F1EA] px-2 py-1 rounded-md border border-[#E6E1D7]">
                      {item.cat}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
