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
  UserCheck,
  File,
  HardDrive,
  Copy,
  SlidersHorizontal,
  Table,
  Calendar,
  FileCode,
  Pencil,
  Mic,
  MicOff,
  Send,
  Rocket,
  AlertCircle,
  Unlink
} from 'lucide-react';
import { ModelSelectorDropdown } from './ui/ModelSelectorDropdown';

interface NodeData {
  id: string;
  name: string;
  type: 'ai' | 'db' | 'trigger' | 'tool' | 'logic' | 'knowledge';
  icon: string;
  subtitle: string;
  x: number;
  y: number;
  status?: 'idle' | 'running' | 'completed' | 'error';
  
  // n8n Specific Properties
  resource?: string;
  operation?: string;
  credentialId?: string;
  
  // AI Agent Sub-Modules
  model?: string;
  prompt?: string;
  attachedTools?: string[];
  memoryEngine?: string;

  // Database Connection Gateway
  dbEngine?: 'MongoDB' | 'PostgreSQL' | 'MySQL' | 'Redis';
  connectionUrl?: string;

  inputPayload?: any;
  outputPayload?: any;
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
  activeProject?: any;
}

export const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({ 
  onRunFinished, 
  onBackToProjects,
  activeProject
}) => {
  // Workflow Identity & Persistence State
  const [currentWorkflowId, setCurrentWorkflowId] = useState<string>(activeProject?.id || 'proj_support_01');
  const [workflowTitle, setWorkflowTitle] = useState(activeProject?.name || 'Customer Support & Refund Pipeline');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [showSavedBadge, setShowSavedBadge] = useState(false);
  
  // Unsaved Changes & Saving States (Fixes Item #3)
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);

  const markDirty = () => setIsDirty(true);

  // Fetch workflow from SQLite database on mount or activeProject change
  useEffect(() => {
    const wfId = activeProject?.id || 'proj_support_01';
    setCurrentWorkflowId(wfId);
    if (activeProject?.name) setWorkflowTitle(activeProject.name);

    fetch(`http://localhost:8000/api/workflows/${wfId}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.workflow) {
          const wf = data.workflow;
          if (wf.name) setWorkflowTitle(wf.name);
          if (wf.nodes && Array.isArray(wf.nodes) && wf.nodes.length > 0) {
            setNodes(wf.nodes);
          }
          if (wf.connections && Array.isArray(wf.connections) && wf.connections.length > 0) {
            setConnections(wf.connections);
          }
          if (wf.sticky_notes && Array.isArray(wf.sticky_notes) && wf.sticky_notes.length > 0) {
            setStickyNotes(wf.sticky_notes);
          }
          setIsDirty(false);
        }
      })
      .catch(err => console.error("Error fetching workflow from SQLite DB:", err));
  }, [activeProject]);

  // Save Canvas to SQLite Database (Fixes Item #3)
  const handleSaveWorkflowCanvas = (onSavedCallback?: () => void) => {
    setIsSaving(true);
    fetch(`http://localhost:8000/api/workflows/${currentWorkflowId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: workflowTitle,
        nodes: nodes,
        connections: connections,
        sticky_notes: stickyNotes,
        status: activeProject?.status || 'Active'
      })
    })
      .then(res => res.json())
      .then(data => {
        setIsSaving(false);
        setIsDirty(false);
        setShowSavedBadge(true);
        setTimeout(() => setShowSavedBadge(false), 2500);
        if (onSavedCallback) onSavedCallback();
      })
      .catch(err => {
        setIsSaving(false);
        console.error("Error saving workflow canvas to SQLite:", err);
      });
  };

  const handleBackClick = () => {
    if (isDirty) {
      setShowUnsavedModal(true);
    } else if (onBackToProjects) {
      onBackToProjects();
    }
  };

  const handleSaveTitle = () => {
    setIsEditingTitle(false);
    setShowSavedBadge(true);
    setTimeout(() => setShowSavedBadge(false), 2000);
  };

  // Floating Execution Data Drawer Panel
  const [showExecutionDataPanel, setShowExecutionDataPanel] = useState(false);

  // Canvas State: Nodes
  const [nodes, setNodes] = useState<NodeData[]>([
    { 
      id: 'node-1', 
      name: 'Web Voice Call Intake', 
      type: 'trigger', 
      icon: 'trig_voice', 
      subtitle: 'Sarvam Indic STT Stream', 
      resource: 'Voice Audio Stream',
      operation: 'Stream Indic Speech-to-Text (STT)',
      credentialId: 'cred_sarvam_key',
      x: 60, 
      y: 180,
      inputPayload: { caller_number: "+91 9876543210", language: "ta-IN", session_type: "voice_call" },
      outputPayload: { transcript: "வணக்கம், my order #4821 saree arrived damaged.", order_id: "4821", customer_name: "Alex Morgan" }
    },
    { 
      id: 'node-2', 
      name: 'Custom Database Gateway', 
      type: 'db', 
      icon: 'db_gateway', 
      subtitle: 'MongoDB / PostgreSQL DSN', 
      resource: 'Document / Record',
      operation: 'Execute Query / Find Record',
      dbEngine: 'MongoDB',
      connectionUrl: 'mongodb://localhost:27017/ai_workforce_db',
      credentialId: 'cred_mongo_prod',
      x: 420, 
      y: 180,
      inputPayload: { order_id: "4821" },
      outputPayload: { matched_document: true, order_id: "4821", customer: "Alex Morgan", item: "Kanjivaram Saree", amount: 1499, status: "Delivered" }
    },
    { 
      id: 'node-3', 
      name: 'AI Agent Worker', 
      type: 'ai', 
      icon: 'ai_agent_worker', 
      subtitle: 'NVIDIA Llama 3.1 + Tools', 
      resource: 'Agent Reasoning Turn',
      operation: 'Execute Multi-Step Reasoning Turn',
      credentialId: 'cred_nvidia_env',
      model: 'meta/llama-3.1-70b-instruct',
      attachedTools: ['Gmail Tool', 'Database Query Tool'],
      memoryEngine: 'Conversation Window Buffer',
      prompt: "You are a professional Client Success AI Worker.\n\nInspect incoming order {{ $json.order_id }} from DB. Verify damage status and initiate refund approval if amount <= 2000 INR. Otherwise escalate to supervisor.",
      x: 780, 
      y: 180,
      inputPayload: { order_id: "4821", amount: 1499, customer: "Alex Morgan" },
      outputPayload: { decision: "APPROVE_REFUND", refund_amount: 1499, reference: "RF-2291", gate_check: "PASSED (1499 <= 2000 INR)" }
    },
    { 
      id: 'node-4', 
      name: 'Gmail Integration', 
      type: 'tool', 
      icon: 'tool_gmail', 
      subtitle: 'Send Receipts & Updates', 
      resource: 'Email Message',
      operation: 'Send Email',
      credentialId: 'cred_google_oauth',
      x: 1140, 
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
      x: 420,
      y: 450,
      text: '📝 Approval Gate Constraint: Instant auto-refund cap is ₹2,000 INR. Anything higher escalates to supervisor inbox.',
      color: '#FEF3C7'
    }
  ]);

  // Modal & Picker States
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showNodeModal, setShowNodeModal] = useState(false);
  const [showNodePicker, setShowNodePicker] = useState(false);
  const [showWorkflowExecModal, setShowWorkflowExecModal] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isExecuting, setIsExecuting] = useState(false);
  const [nodeExecStatus, setNodeExecStatus] = useState<Record<string, 'idle' | 'running' | 'completed'>>({});
  const [zoomScale, setZoomScale] = useState<number>(100);

  // Live Toast & Interactive Deployed App UI States
  const [executionToast, setExecutionToast] = useState<{ message: string; type: 'info' | 'success' | 'warning' } | null>(null);
  const [showLiveAppModal, setShowLiveAppModal] = useState(false);
  const [connectingFromId, setConnectingFromId] = useState<string | null>(null);

  // Voice & Deployed Live App Form State
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('வணக்கம், my order #4821 saree arrived damaged. Please process refund.');
  const [appFormData, setAppFormData] = useState({
    customerName: 'Alex Morgan',
    orderId: '4821',
    customerEmail: 'alex@company.com',
    details: 'Kanjivaram Saree arrived with tear on seam.'
  });
  const [appProcessing, setAppProcessing] = useState(false);
  const [appStepLogs, setAppStepLogs] = useState<string[]>([]);

  // In-line Credential Auth Modal
  const [showAuthInlineModal, setShowAuthInlineModal] = useState(false);
  const [authProviderName, setAuthProviderName] = useState('Google Workspace OAuth');

  // Dragging State
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [draggingNoteId, setDraggingNoteId] = useState<string | null>(null);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Saved Credentials List
  const [savedCredentials, setSavedCredentials] = useState([
    { id: 'cred_google_oauth', name: 'Google OAuth (alex@company.com)', provider: 'Google', status: 'Connected' },
    { id: 'cred_nvidia_env', name: 'NVIDIA NIM Key (.env API)', provider: 'NVIDIA', status: 'Active' },
    { id: 'cred_sarvam_key', name: 'Sarvam Indic Speech API Key', provider: 'Sarvam AI', status: 'Active' },
    { id: 'cred_mongo_prod', name: 'MongoDB Local (mongodb://localhost:27017)', provider: 'MongoDB', status: 'Connected' },
    { id: 'cred_postgres_local', name: 'PostgreSQL DSN (localhost:5432)', provider: 'PostgreSQL', status: 'Connected' }
  ]);

  // Real NVIDIA Models
  const [nvidiaModels, setNvidiaModels] = useState<any[]>([
    { id: 'meta/llama-3.1-70b-instruct', name: 'NVIDIA Llama 3.1 70B Instruct', provider: 'NVIDIA NIM' },
    { id: 'meta/llama-3.1-405b-instruct', name: 'NVIDIA Llama 3.1 405B Instruct', provider: 'NVIDIA NIM' },
    { id: 'mistralai/mixtral-8x22b-instruct', name: 'NVIDIA Mixtral 8x22B Instruct', provider: 'NVIDIA NIM' },
    { id: 'deepseek-ai/deepseek-r1', name: 'NVIDIA DeepSeek R1 (Reasoning)', provider: 'NVIDIA NIM' }
  ]);

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

  // Node & Connection Deletion Handlers (Requirement 2)
  const handleDeleteNode = (nodeId: string) => {
    setNodes(prev => prev.filter(n => n.id !== nodeId));
    setConnections(prev => prev.filter(c => c.fromId !== nodeId && c.toId !== nodeId));
    if (selectedNodeId === nodeId) setSelectedNodeId(null);
    setExecutionToast({ message: "🗑️ Node and associated connections deleted.", type: 'warning' });
    setTimeout(() => setExecutionToast(null), 2500);
  };

  const handleDeleteConnection = (connId: string) => {
    setConnections(prev => prev.filter(c => c.id !== connId));
    setExecutionToast({ message: "✂️ Connection line removed.", type: 'warning' });
    setTimeout(() => setExecutionToast(null), 2500);
  };

  const handlePortClick = (nodeId: string, isOutputPort: boolean) => {
    if (isOutputPort) {
      setConnectingFromId(nodeId);
      setExecutionToast({ message: "🔗 Connection started. Click input port (left dot) on target node to connect.", type: 'info' });
    } else if (connectingFromId && connectingFromId !== nodeId) {
      const exists = connections.some(c => c.fromId === connectingFromId && c.toId === nodeId);
      if (!exists) {
        setConnections(prev => [...prev, { id: `c_${Date.now()}`, fromId: connectingFromId, toId: nodeId }]);
        setExecutionToast({ message: "✅ Nodes connected successfully!", type: 'success' });
      }
      setConnectingFromId(null);
      setTimeout(() => setExecutionToast(null), 2500);
    }
  };

  const handleZoomIn = () => setZoomScale(prev => Math.min(prev + 15, 160));
  const handleZoomOut = () => setZoomScale(prev => Math.max(prev - 15, 50));
  const handleResetZoom = () => setZoomScale(100);

  // 10+ Major Tools & Node Catalog with Specific Operations (Item 1 & 2)
  const segregatedCatalog = [
    // ⚡ Triggers & Intake
    { id: 'trig_voice', name: 'Web Voice Call Intake', type: 'trigger' as const, cat: 'Triggers & Intake', desc: 'Real-time Indic streaming STT voice link', color: '#3B82F6', icon: PhoneCall },
    { id: 'trig_webhook', name: 'Webhook POST Intake', type: 'trigger' as const, cat: 'Triggers & Intake', desc: 'Listen to incoming HTTP webhooks', color: '#3B82F6', icon: Webhook },
    { id: 'trig_sheet', name: 'Google Sheets Trigger', type: 'trigger' as const, cat: 'Triggers & Intake', desc: 'Fires when new row added to sheet', color: '#3B82F6', icon: Sheet },
    { id: 'trig_cron', name: 'Schedule Cron Timer', type: 'trigger' as const, cat: 'Triggers & Intake', desc: 'Recurring background schedule trigger', color: '#3B82F6', icon: Clock },

    // 🤖 AI Agents & Reasoning
    { id: 'ai_agent_worker', name: 'AI Agent Worker', type: 'ai' as const, cat: 'AI Agents & Reasoning', desc: 'Autonomous agent with Model + Tools + Memory', color: '#D97757', icon: Bot },
    { id: 'ai_deepseek_r1', name: 'Chain-of-Thought Reasoner', type: 'ai' as const, cat: 'AI Agents & Reasoning', desc: 'DeepSeek R1 mathematical logic solver', color: '#D97757', icon: Zap },

    // 💾 Databases & Storage
    { id: 'db_gateway', name: 'Custom Database Gateway', type: 'db' as const, cat: 'Databases & Storage', desc: 'Connect MongoDB, Postgres, MySQL or Redis', color: '#10B981', icon: Database },
    { id: 'kb_vector', name: 'Vector Knowledge Base RAG', type: 'knowledge' as const, cat: 'Databases & Storage', desc: 'Retrieve policy chunks via pgvector', color: '#10B981', icon: Server },

    // 🛠️ 10+ Google & Major Integration Tools (Item 1)
    { id: 'tool_gdrive', name: 'Google Drive Tools', type: 'tool' as const, cat: 'Apps & Integrations', desc: 'Upload, download, list, & delete files', color: '#8B5CF6', icon: HardDrive },
    { id: 'tool_gmail', name: 'Gmail Integration', type: 'tool' as const, cat: 'Apps & Integrations', desc: 'Send emails, read inbox, & draft messages', color: '#8B5CF6', icon: Mail },
    { id: 'tool_gsheets', name: 'Google Sheets Node', type: 'tool' as const, cat: 'Apps & Integrations', desc: 'Read, append, update, & clear rows', color: '#8B5CF6', icon: Sheet },
    { id: 'tool_gcal', name: 'Google Calendar Node', type: 'tool' as const, cat: 'Apps & Integrations', desc: 'Create, update, & list calendar events', color: '#8B5CF6', icon: Calendar },
    { id: 'tool_gdocs', name: 'Google Docs Node', type: 'tool' as const, cat: 'Apps & Integrations', desc: 'Create docs & append text blocks', color: '#8B5CF6', icon: FileText },
    { id: 'tool_whatsapp', name: 'WhatsApp Message API', type: 'tool' as const, cat: 'Apps & Integrations', desc: 'Send template WhatsApp notifications', color: '#8B5CF6', icon: MessageSquare },
    { id: 'tool_slack', name: 'Slack Channel Alert', type: 'tool' as const, cat: 'Apps & Integrations', desc: 'Post alerts to Slack team channels', color: '#8B5CF6', icon: MessageSquare },

    // 🔀 Logic & Flow
    { id: 'logic_if_else', name: 'If / Else Router', type: 'logic' as const, cat: 'Logic & Flow', desc: 'Branch workflow execution based on rules', color: '#F59E0B', icon: Layers },
    { id: 'logic_code', name: 'Custom JS / Python Code', type: 'logic' as const, cat: 'Logic & Flow', desc: 'Execute inline custom transformation code', color: '#F59E0B', icon: Code }
  ];

  // Specific Operations Mapping Logic for Each Tool (Item 1)
  const getNodeOperations = (node: NodeData) => {
    const icon = node.icon || '';
    const name = (node.name || '').toLowerCase();

    if (icon === 'tool_gdrive' || name.includes('drive')) {
      return {
        resources: ['File', 'Folder', 'Permission'],
        operations: ['Upload File', 'Download File', 'List / Search Files', 'Create Folder', 'Move / Delete File', 'Share Permissions']
      };
    }

    if (icon === 'tool_gmail' || name.includes('gmail')) {
      return {
        resources: ['Email Message', 'Draft', 'Label'],
        operations: ['Send Email', 'Read / Fetch Inbox Messages', 'Create Draft Email', 'Add Label to Email', 'Delete Email']
      };
    }

    if (icon === 'trig_sheet' || icon === 'tool_gsheets' || name.includes('sheet')) {
      return {
        resources: ['Row', 'Cell / Range', 'Spreadsheet'],
        operations: ['Read Row(s)', 'Append New Row', 'Update Cell / Row', 'Clear Sheet Data', 'Create Spreadsheet']
      };
    }

    if (icon === 'tool_gcal' || name.includes('calendar')) {
      return {
        resources: ['Event', 'Calendar'],
        operations: ['Create Calendar Event', 'List Upcoming Events', 'Update Event Details', 'Delete Event']
      };
    }

    if (icon === 'tool_gdocs' || name.includes('docs')) {
      return {
        resources: ['Document', 'Text Block'],
        operations: ['Create Document', 'Append Text to Doc', 'Read Document Content']
      };
    }

    if (node.type === 'db' || name.includes('database') || name.includes('mongo') || name.includes('postgres')) {
      return {
        resources: ['Document / Record', 'Table / Collection', 'Vector Embedding'],
        operations: ['Execute Query / Find Record', 'Insert Document / Row', 'Update Document / Row', 'Delete Record', 'Vector Similarity Search (pgvector)']
      };
    }

    if (icon === 'trig_voice' || name.includes('voice')) {
      return {
        resources: ['Voice Audio Stream', 'VAD Detector', 'Audio Speech'],
        operations: ['Stream Indic Speech-to-Text (STT)', 'Detect Barge-in VAD', 'Synthesize Speech Audio (TTS)']
      };
    }

    if (node.type === 'ai' || name.includes('agent')) {
      return {
        resources: ['Agent Reasoning Turn', 'Tool Chain Call', 'Memory Context'],
        operations: ['Execute Multi-Step Reasoning Turn', 'Run Attached Tool Chain', 'Query Vector Memory Context']
      };
    }

    if (name.includes('whatsapp')) {
      return {
        resources: ['Template Message', 'Media Attachment'],
        operations: ['Send Template Message', 'Send Media Attachment', 'Mark Message Read']
      };
    }

    if (name.includes('slack')) {
      return {
        resources: ['Channel Message', 'Direct Message'],
        operations: ['Post Channel Alert', 'Send Direct Message', 'Upload File to Slack']
      };
    }

    if (name.includes('webhook') || name.includes('http')) {
      return {
        resources: ['HTTP POST Payload', 'Webhook Endpoint'],
        operations: ['Listen to POST Webhook', 'Send HTTP GET Request', 'Send HTTP POST Request']
      };
    }

    if (name.includes('if') || name.includes('router') || node.type === 'logic') {
      return {
        resources: ['Branch Rule', 'Condition Set'],
        operations: ['Evaluate Condition Rules', 'Route to True / False Branch', 'Run Custom Script Code']
      };
    }

    return {
      resources: ['Data Item', 'Record'],
      operations: ['Execute Step Operation', 'Transform Data', 'Pass Payload']
    };
  };

  // Node-Specific Credential Filter Logic (Item 2)
  const getCredentialsForNode = (node: NodeData, allCredentials: any[]) => {
    const name = (node.name || '').toLowerCase();
    const icon = (node.icon || '').toLowerCase();
    const type = node.type;

    // Google Tools (Gmail, Drive, Sheets, Calendar, Docs) -> Show ONLY Google OAuth
    if (name.includes('google') || name.includes('gmail') || name.includes('drive') || name.includes('sheet') || name.includes('calendar') || name.includes('doc') || icon.includes('gmail') || icon.includes('gdrive') || icon.includes('sheet')) {
      const match = allCredentials.filter(c => c.provider === 'Google' || c.id.includes('google'));
      return match.length > 0 ? match : allCredentials;
    }

    // AI & Reasoning Nodes -> Show ONLY AI Provider Keys (NVIDIA / Anthropic)
    if (type === 'ai' || name.includes('nvidia') || name.includes('deepseek') || name.includes('claude')) {
      const match = allCredentials.filter(c => c.provider === 'NVIDIA' || c.provider === 'Anthropic' || c.id.includes('nvidia') || c.id.includes('api_key'));
      return match.length > 0 ? match : allCredentials;
    }

    // Database Nodes -> Show ONLY Database Connection Strings (MongoDB / Postgres / MySQL / Redis)
    if (type === 'db' || name.includes('database') || name.includes('mongo') || name.includes('postgres') || name.includes('mysql') || name.includes('redis')) {
      const match = allCredentials.filter(c => c.provider === 'MongoDB' || c.provider === 'PostgreSQL' || c.provider === 'MySQL' || c.provider === 'Redis' || c.id.includes('mongo') || c.id.includes('postgres'));
      return match.length > 0 ? match : allCredentials;
    }

    // Voice Intake Nodes -> Show ONLY Sarvam Indic API Key
    if (name.includes('voice') || name.includes('sarvam') || icon.includes('voice') || icon.includes('phone')) {
      const match = allCredentials.filter(c => c.provider === 'Sarvam AI' || c.id.includes('sarvam') || c.id.includes('voice'));
      return match.length > 0 ? match : allCredentials;
    }

    return allCredentials;
  };

  // Dragging Handlers
  const handleMouseDownNode = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setDraggingNodeId(nodeId);
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      dragOffsetRef.current = { x: e.clientX - node.x, y: e.clientY - node.y };
    }
  };

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
      setStickyNotes(prev => prev.map(n => n.id === draggingNoteId ? { ...n, text: n.text, x: newX, y: newY } : n));
    }
  };

  const handleMouseUp = () => {
    setDraggingNodeId(null);
    setDraggingNoteId(null);
  };

  const handleOpenNodeModal = (nodeId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedNodeId(nodeId);
    setShowNodeModal(true);
  };

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
              single_node_test: "SUCCESS (Passed n8n Execution Trace)"
            }
          };
        }
        return n;
      }));
    }, 800);
  };

  // Helper to get connected DAG execution path starting from Trigger node (Requirement 2)
  const getConnectedExecutionOrder = () => {
    const triggerNode = nodes.find(n => n.type === 'trigger') || nodes[0];
    if (!triggerNode) return nodes;

    const ordered: NodeData[] = [triggerNode];
    const visited = new Set<string>([triggerNode.id]);
    let currentId = triggerNode.id;

    while (currentId) {
      const nextConn = connections.find(c => c.fromId === currentId);
      if (nextConn && !visited.has(nextConn.toId)) {
        const nextNode = nodes.find(n => n.id === nextConn.toId);
        if (nextNode) {
          ordered.push(nextNode);
          visited.add(nextNode.id);
          currentId = nextNode.id;
        } else {
          break;
        }
      } else {
        break;
      }
    }
    return ordered;
  };

  const handleExecuteWholeWorkflow = () => {
    const connectedNodes = getConnectedExecutionOrder();
    if (connectedNodes.length === 0) {
      alert("No connected nodes to execute.");
      return;
    }

    setIsExecuting(true);
    setNodes(prev => prev.map(n => ({ ...n, status: 'idle' as const })));
    setExecutionToast({ message: `⚡ Starting Live Workflow Execution (${connectedNodes.length} Connected Nodes)...`, type: 'info' });

    connectedNodes.forEach((node, stepIdx) => {
      const startTime = (stepIdx + 1) * 850;
      
      // Highlight node as running on canvas
      setTimeout(() => {
        setNodes(prev => prev.map(n => n.id === node.id ? { ...n, status: 'running' } : n));
        setExecutionToast({ 
          message: `⚡ Step ${stepIdx + 1}/${connectedNodes.length}: Running [${node.name}]...`, 
          type: 'info' 
        });
      }, startTime - 450);

      // Highlight node as completed on canvas & show time toast
      setTimeout(() => {
        const duration = Math.floor(180 + Math.random() * 120);
        setNodes(prev => prev.map(n => n.id === node.id ? { 
          ...n, 
          status: 'completed',
          outputPayload: {
            ...n.outputPayload,
            executed_at: new Date().toLocaleTimeString(),
            execution_time_ms: `${duration}ms`
          }
        } : n));

        setExecutionToast({ 
          message: `✓ Executed Step ${stepIdx + 1}/${connectedNodes.length}: ${node.name} (${duration}ms)`, 
          type: 'success' 
        });
      }, startTime);
    });

    const totalDuration = (connectedNodes.length + 1) * 850;
    setTimeout(() => {
      setIsExecuting(false);
      setExecutionToast({ 
        message: `🎉 Workflow Execution Completed in 1.18s! Opening Deployed Agent App...`, 
        type: 'success' 
      });

      const newRun = {
        id: `exec_${Math.floor(160 + Math.random() * 800)}`,
        time: new Date().toLocaleTimeString(),
        duration: '1.18s',
        status: 'Succeeded',
        input: 'Voice Call Order #4821 Refund',
        output: 'Refund Approved & Receipt Emailed via Gmail'
      };
      onRunFinished(newRun);

      // Automatically launch the live deployed app UI modal!
      setTimeout(() => {
        setShowLiveAppModal(true);
        setExecutionToast(null);
      }, 1200);
    }, totalDuration);
  };

  const handleAddStickyNote = () => {
    const colors = ['#FEF3C7', '#DCFCE7', '#E0F2FE', '#FCE7F3', '#EDE9FE'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const newNote: StickyNoteData = {
      id: `sn-${Date.now()}`,
      x: 400 + stickyNotes.length * 25,
      y: 320 + stickyNotes.length * 25,
      text: '📌 Type workflow notes or approval criteria here...',
      color: randomColor
    };
    setStickyNotes([...stickyNotes, newNote]);
  };

  const handleExportJSON = () => {
    const exportData = {
      name: "Customer Support & Refund Pipeline",
      version: "2.0.0 (n8n Architecture)",
      created_at: new Date().toISOString(),
      nodes,
      connections,
      stickyNotes
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `n8n_workflow_${Date.now()}.json`;
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
          alert("n8n Workflow JSON imported successfully!");
        }
      } catch (err) {
        alert("Failed to parse JSON file.");
      }
    };
    reader.readAsText(file);
  };

  const handleAddNodeFromCatalog = (item: typeof segregatedCatalog[0]) => {
    // 🚫 Requirement 3: Enforce maximum 1 Trigger node per workflow
    if (item.type === 'trigger' && nodes.some(n => n.type === 'trigger')) {
      alert("🚫 Single Trigger Limit: A workflow can only have 1 Trigger node. Remove the existing trigger first to add a different trigger.");
      return;
    }

    const newNodeId = `node_${Date.now()}`;
    const lastNode = nodes[nodes.length - 1];
    const newX = lastNode ? lastNode.x + 360 : 200;
    const newY = lastNode ? lastNode.y : 180;

    const opConfig = getNodeOperations({ name: item.name, icon: item.id, type: item.type } as any);
    const availableCreds = getCredentialsForNode({ name: item.name, icon: item.id, type: item.type } as any, savedCredentials);

    const newNode: NodeData = {
      id: newNodeId,
      name: item.name,
      type: item.type,
      icon: item.id,
      subtitle: item.cat,
      resource: opConfig.resources[0],
      operation: opConfig.operations[0],
      credentialId: availableCreds[0]?.id || savedCredentials[0].id,
      x: newX,
      y: newY,
      model: 'meta/llama-3.1-70b-instruct',
      prompt: `System prompt for ${item.name}`,
      inputPayload: { sample_input: "Input data from previous node" },
      outputPayload: { sample_output: "Processed output result" }
    };

    setNodes([...nodes, newNode]);
    if (lastNode) {
      setConnections(prev => [...prev, { id: `c_${Date.now()}`, fromId: lastNode.id, toId: newNodeId }]);
    }
    setShowNodePicker(false);
  };

  const targetNode = nodes.find(n => n.id === selectedNodeId) || nodes[2];
  const targetOpConfig = getNodeOperations(targetNode);
  const targetNodeCredentials = getCredentialsForNode(targetNode, savedCredentials);

  const handleInsertVariable = (varName: string) => {
    if (!targetNode) return;
    const variableSyntax = `{{ $json.${varName} }}`;
    const updatedPrompt = `${targetNode.prompt || ''} ${variableSyntax}`.trim();
    setNodes(prev => prev.map(n => n.id === targetNode.id ? { ...n, prompt: updatedPrompt } : n));
  };

  return (
    <div 
      className="flex flex-col h-screen bg-[#FAF8F5] relative overflow-hidden select-none font-sans text-[#2B2826]"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      
      {/* CLEAN & COMPACT STUDIO HEADER BAR */}
      <header className="h-12 bg-white border-b border-[#E6E1D7] px-3.5 flex items-center justify-between z-30 shadow-2xs shrink-0">
        
        <div className="flex items-center space-x-2.5">
          {onBackToProjects && (
            <button 
              onClick={handleBackClick}
              className="btn-claude-secondary text-xs py-1 px-2.5 flex items-center space-x-1 font-bold hover:bg-[#FAF8F5]"
              title="Exit Canvas and return to Projects overview"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#D97757]" />
              <span>Back</span>
            </button>
          )}

          <div className="h-4 w-px bg-[#E6E1D7]" />

          <div className="flex items-center space-x-2">
            {isEditingTitle ? (
              <input
                type="text"
                value={workflowTitle}
                onChange={(e) => { setWorkflowTitle(e.target.value); markDirty(); }}
                onBlur={handleSaveTitle}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSaveTitle(); }}
                autoFocus
                className="px-2 py-0.5 bg-white border-2 border-[#D97757] rounded-lg text-xs font-extrabold text-[#2B2826] focus:outline-none shadow-xs"
              />
            ) : (
              <button 
                onClick={() => setIsEditingTitle(true)}
                className="group flex items-center space-x-1.5 px-2 py-0.5 rounded-lg hover:bg-[#FAF8F5] transition-all text-left"
                title="Click to edit workflow name"
              >
                <span className="font-extrabold text-xs sm:text-sm text-[#2B2826] group-hover:text-[#D97757] transition-colors">
                  {workflowTitle || 'Untitled Workflow'}
                </span>
                <Pencil className="w-3 h-3 text-[#9B9488] group-hover:text-[#D97757] transition-colors" />
              </button>
            )}

            {isDirty && (
              <span className="bg-[#FEF3C7] text-[#D97706] font-bold text-[9.5px] px-2 py-0.5 rounded-full border border-[#FDE68A] animate-pulse">
                ● Unsaved Changes
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Compact Save Changes Button */}
          <button
            onClick={() => handleSaveWorkflowCanvas()}
            disabled={isSaving}
            className={`text-xs py-1 px-3 rounded-lg font-bold flex items-center space-x-1.5 transition-all shadow-2xs ${
              isDirty 
                ? 'bg-[#D97757] text-white hover:bg-[#C96646]' 
                : 'bg-white border border-[#E6E1D7] text-[#2B2826] hover:border-[#D97757]'
            }`}
            title="Save Canvas modifications to database"
          >
            {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
          </button>

          <button 
            onClick={handleExportJSON}
            className="btn-claude-secondary text-xs py-1 px-2.5 flex items-center space-x-1 font-semibold"
          >
            <Download className="w-3.5 h-3.5 text-[#3B82F6]" />
            <span className="hidden sm:inline">Export</span>
          </button>

          <label className="btn-claude-secondary text-xs py-1 px-2.5 flex items-center space-x-1 font-semibold cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-[#10B981]" />
            <span className="hidden sm:inline">Import</span>
            <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
          </label>

          <button 
            onClick={handleExecuteWholeWorkflow}
            disabled={isExecuting}
            className="btn-claude-primary text-xs py-1 px-3 flex items-center space-x-1 font-bold shadow-2xs"
          >
            {isExecuting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            <span>Test Run</span>
          </button>
        </div>
      </header>

      {/* CANVAS VISUAL VIEWPORT WRAPPER (Pinned Toolbars) */}
      <div className="flex-1 relative overflow-hidden select-none">
        
        {/* LIVE EXECUTION TOAST BANNER (Requirement 1 & 2) */}
        {executionToast && (
          <div className={`fixed bottom-8 right-8 z-50 px-4 py-3 rounded-2xl shadow-2xl border flex items-center space-x-3 text-xs font-bold animate-in fade-in slide-in-from-bottom-4 duration-200 ${
            executionToast.type === 'success' ? 'bg-[#E6F4F1] text-[#0F766E] border-[#99F6E4]' : executionToast.type === 'warning' ? 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]' : 'bg-[#FAF8F5] text-[#2B2826] border-[#D97757]/40'
          }`}>
            {executionToast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-[#0F766E] shrink-0" />}
            {executionToast.type === 'warning' && <AlertCircle className="w-4 h-4 text-[#D97706] shrink-0" />}
            {executionToast.type === 'info' && <RefreshCw className="w-4 h-4 text-[#D97757] animate-spin shrink-0" />}
            <span>{executionToast.message}</span>
          </div>
        )}

        {/* N8N CANVAS FLOATING SIDE ACTION TOOLBAR (Pinned to Viewport Top-Right) */}
        <div className="absolute top-6 right-6 flex flex-col space-y-2 z-30 font-sans pointer-events-none">
          <div className="pointer-events-auto flex flex-col space-y-2">
            <button 
              onClick={() => setShowNodePicker(true)}
              title="Add Node (Open Catalog)"
              className="w-11 h-11 bg-[#2B2826] hover:bg-[#D97757] text-white rounded-2xl flex items-center justify-center shadow-lg transition-all"
            >
              <Plus className="w-6 h-6" />
            </button>

            <button 
              onClick={() => { setPickerSearch(''); setShowNodePicker(true); }}
              title="Search Nodes"
              className="w-11 h-11 bg-white hover:bg-[#FAF8F5] text-[#2B2826] border border-[#E6E1D7] rounded-2xl flex items-center justify-center shadow-md transition-all"
            >
              <Search className="w-5 h-5 text-[#6E685E]" />
            </button>

            <button 
              onClick={handleAddStickyNote}
              title="Add Sticky Note"
              className="w-11 h-11 bg-white hover:bg-[#FAF8F5] text-[#2B2826] border border-[#E6E1D7] rounded-2xl flex items-center justify-center shadow-md transition-all"
            >
              <StickyNote className="w-5 h-5 text-[#D97706]" />
            </button>

            <button 
              onClick={() => setShowExecutionDataPanel(!showExecutionDataPanel)}
              title="Toggle Execution JSON Inspector"
              className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-md transition-all border ${
                showExecutionDataPanel ? 'bg-[#FDF3E9] text-[#D97757] border-[#D97757]' : 'bg-white text-[#2B2826] border-[#E6E1D7]'
              }`}
            >
              <Code className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Floating Zoom Controls Toolbar (Pinned to Viewport Bottom-Left) */}
        <div className="absolute bottom-5 left-5 bg-white border border-[#E6E1D7] rounded-xl p-1.5 shadow-md flex items-center space-x-1 z-30">
          <button 
            onClick={handleZoomOut} 
            title="Zoom Out (-)"
            className="p-1.5 text-[#6E685E] hover:text-[#2B2826] hover:bg-[#FAF8F5] rounded-lg transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-[11px] font-mono font-bold text-[#2B2826] px-1.5 select-none">
            {zoomScale}%
          </span>
          <button 
            onClick={handleZoomIn} 
            title="Zoom In (+)"
            className="p-1.5 text-[#6E685E] hover:text-[#2B2826] hover:bg-[#FAF8F5] rounded-lg transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="h-4 w-px bg-[#E6E1D7] mx-0.5" />
          <button 
            onClick={handleResetZoom} 
            title="Reset Zoom (100%)"
            className="p-1.5 text-[#6E685E] hover:text-[#2B2826] hover:bg-[#FAF8F5] rounded-lg transition-colors"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* SCROLLABLE CANVAS GRID SURFACE */}
        <div 
          className="w-full h-full cursor-crosshair overflow-auto"
          style={{
            backgroundImage: 'radial-gradient(#D6CFBF 1.3px, transparent 1.3px)',
            backgroundSize: '24px 24px'
          }}
        >
          {/* Zoomable Canvas Surface */}
          <div 
            style={{ 
              transform: `scale(${zoomScale / 100})`, 
              transformOrigin: 'top left',
              transition: 'transform 0.1s ease-out',
              minWidth: '3000px',
              minHeight: '2000px'
            }} 
            className="relative"
          >
            {/* Curved Bezier Connection Lines with Deletion Midpoint Button */}
            <svg className="absolute inset-0 w-[3000px] h-[3000px] pointer-events-none z-10">
              {connections.map(conn => {
                const fromNode = nodes.find(n => n.id === conn.fromId);
                const toNode = nodes.find(n => n.id === conn.toId);
                if (!fromNode || !toNode) return null;
                const x1 = fromNode.x + 256;
                const y1 = fromNode.y + 45;
                const x2 = toNode.x;
                const y2 = toNode.y + 45;
                const dx = Math.abs(x2 - x1) * 0.5;
                const pathD = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
                const midX = (x1 + x2) / 2;
                const midY = (y1 + y2) / 2;

                return (
                  <g key={conn.id} className="group pointer-events-auto">
                    <path d={pathD} stroke="#D6CFBF" strokeWidth="3.5" fill="none" className="group-hover:stroke-[#D97757] transition-colors" />
                    <circle cx={x1} cy={y1} r="5" fill="#D97757" />
                    <circle cx={x2} cy={y2} r="5" fill="#10B981" />

                    {/* Interactive Connection Delete Pill on Midpoint Curve */}
                    <g 
                      transform={`translate(${midX - 10}, ${midY - 10})`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteConnection(conn.id);
                      }}
                      className="cursor-pointer opacity-70 group-hover:opacity-100 transition-all"
                    >
                      <circle cx="10" cy="10" r="9" fill="#EF4444" className="shadow-md" />
                      <text x="10" y="14" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">×</text>
                    </g>
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
                className="absolute w-60 p-4 rounded-2xl shadow-md border border-black/10 z-20 cursor-move"
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
                    setStickyNotes(prev => prev.map(sn => sn.id === note.id ? { ...sn, text: text, x: sn.x, y: sn.y } : sn));
                  }}
                  className="w-full bg-transparent border-none text-xs font-sans text-gray-800 focus:outline-none resize-none"
                  rows={3}
                />
              </div>
            ))}

            {/* Canvas Nodes with Node Deletion Button & Port Connect Handles */}
            {nodes.map(n => (
              <div
                key={n.id}
                onDoubleClick={(e) => handleOpenNodeModal(n.id, e)}
                onMouseDown={(e) => handleMouseDownNode(e, n.id)}
                style={{ left: `${n.x}px`, top: `${n.y}px` }}
                className={`absolute w-64 bg-white border-1.5 rounded-2xl shadow-md z-20 cursor-grab active:cursor-grabbing transition-shadow hover:shadow-lg ${
                  selectedNodeId === n.id ? 'border-[#D97757] ring-4 ring-[#FDF3E9]' : 'border-[#E6E1D7] hover:border-[#D6CFBF]'
                } ${
                  n.status === 'running' ? 'border-[#D97706] ring-4 ring-[#FEF3C7] animate-pulse' : ''
                } ${
                  n.status === 'completed' ? 'border-[#0F766E] ring-3 ring-[#E6F4F1]' : ''
                }`}
              >
                {/* Card Header with Delete Node Icon Button (Requirement 2) */}
                <div className="flex items-center justify-between p-3 border-b border-[#E6E1D7] bg-[#F4F1EA] rounded-t-2xl">
                  <div className="flex items-center space-x-2.5 overflow-hidden">
                    <div 
                      className="w-8 h-8 rounded-xl text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs"
                      style={{
                        backgroundColor: n.type === 'ai' ? '#D97757' : n.type === 'db' ? '#10B981' : n.type === 'trigger' ? '#3B82F6' : n.type === 'tool' ? '#8B5CF6' : '#F59E0B'
                      }}
                    >
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="overflow-hidden">
                      <div className="font-bold text-xs text-[#2B2826] truncate">{n.name}</div>
                      <div className="text-[10px] text-[#6E685E] truncate">{n.operation || n.subtitle}</div>
                    </div>
                  </div>

                  {/* Delete Node Icon Button */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNode(n.id);
                    }}
                    className="p-1 rounded-lg text-[#9B9488] hover:text-red-600 hover:bg-red-50 transition-colors ml-1"
                    title="Delete node & remove connections"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-3 text-[11px] text-[#6E685E] space-y-1 bg-white">
                  {n.resource && <div>Resource: <b className="text-[#2B2826] font-medium">{n.resource}</b></div>}
                  {n.operation && <div>Operation: <b className="text-[#0F766E] font-medium">{n.operation}</b></div>}
                  {n.model && <div>Model: <b className="text-[#D97757] font-mono text-[10.5px]">{n.model}</b></div>}
                </div>

                <div className="px-3 pb-2.5 flex justify-between items-center text-[10.5px] bg-white rounded-b-2xl">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleExecuteSingleNode(n.id); }}
                    className="text-[#0F766E] font-bold hover:underline flex items-center gap-1"
                  >
                    <Play className="w-3 h-3" /> Test Step
                  </button>
                  <span className="text-[#9B9488]">Double-click node</span>
                </div>

                {/* INPUT PORT HANDLE (LEFT DOT) */}
                <div 
                  onClick={(e) => { e.stopPropagation(); handlePortClick(n.id, false); }}
                  className={`w-4 h-4 bg-white border-2 rounded-full absolute -left-2 top-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-125 ${
                    connectingFromId && connectingFromId !== n.id ? 'border-[#10B981] ring-4 ring-[#DCFCE7] animate-ping' : 'border-[#D6CFBF] hover:border-[#10B981]'
                  }`}
                  title="Click to complete connection to this input port"
                />

                {/* OUTPUT PORT HANDLE (RIGHT DOT) */}
                <div 
                  onClick={(e) => { e.stopPropagation(); handlePortClick(n.id, true); }}
                  className={`w-4 h-4 bg-white border-2 rounded-full absolute -right-2 top-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-125 ${
                    connectingFromId === n.id ? 'border-[#D97757] bg-[#FDF3E9]' : 'border-[#D6CFBF] hover:border-[#D97757]'
                  }`}
                  title="Click to start connection from this output port"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FLOATING EXECUTION JSON DATA INSPECTOR SIDE PANEL */}
      {showExecutionDataPanel && (
        <div className="absolute top-14 right-0 bottom-0 w-96 bg-white border-l border-[#E6E1D7] shadow-2xl z-40 p-5 flex flex-col space-y-4 animate-in slide-in-from-right duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-[#E6E1D7]">
            <div className="flex items-center space-x-2">
              <Code className="w-5 h-5 text-[#D97757]" />
              <h3 className="font-extrabold text-sm text-[#2B2826]">Execution JSON Data Panel</h3>
            </div>
            <button onClick={() => setShowExecutionDataPanel(false)} className="text-[#9B9488] hover:text-[#2B2826]">
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs text-[#6E685E]">
            Live output payload trees propagated through connected n8n nodes.
          </p>

          <div className="flex-1 overflow-y-auto space-y-4">
            {nodes.map(n => (
              <div key={n.id} className="p-3.5 bg-[#FAF8F5] border border-[#E6E1D7] rounded-2xl text-xs font-mono space-y-2">
                <div className="flex justify-between items-center font-bold text-[#2B2826]">
                  <span>{n.name}</span>
                  <span className="text-[10px] text-[#0F766E] bg-[#E6F4F1] px-2 py-0.5 rounded border border-[#99F6E4] font-sans">
                    {n.operation || n.type}
                  </span>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-[#E6E1D7] overflow-x-auto text-[11px]">
                  <pre className="text-slate-800">
                    {JSON.stringify(n.outputPayload || n.inputPayload || {}, null, 2)}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* IN-LINE OAUTH / CREDENTIAL AUTHENTICATION MODAL */}
      {showAuthInlineModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E6E1D7] max-w-md w-full shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex justify-between items-center border-b border-[#E6E1D7] pb-3">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-[#0F766E]" />
                <h3 className="font-extrabold text-base text-[#2B2826]">In-Line Account Connection</h3>
              </div>
              <button onClick={() => setShowAuthInlineModal(false)} className="text-[#9B9488] hover:text-[#2B2826]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#6E685E]">
              Authorize <b>{authProviderName}</b> credentials directly inside this node step.
            </p>

            <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E6E1D7] space-y-3">
              <div>
                <label className="text-[11px] font-bold text-[#2B2826] block">Connection Title</label>
                <input 
                  type="text" 
                  defaultValue={`${authProviderName} Account (Demo)`}
                  className="w-full p-2 border border-[#E6E1D7] rounded-xl text-xs bg-white mt-1"
                />
              </div>

              <div className="pt-2">
                <button 
                  onClick={() => {
                    const newCred = {
                      id: `cred_${Date.now()}`,
                      name: `${authProviderName} Authorized`,
                      provider: authProviderName.includes('Google') ? 'Google' : authProviderName.includes('NVIDIA') ? 'NVIDIA' : authProviderName.includes('Mongo') ? 'MongoDB' : 'PostgreSQL',
                      status: 'Connected'
                    };
                    setSavedCredentials([newCred, ...savedCredentials]);
                    setShowAuthInlineModal(false);
                    alert(`${authProviderName} authenticated successfully!`);
                  }}
                  className="btn-claude-primary w-full text-xs py-2.5 font-bold flex items-center justify-center gap-2 rounded-xl"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Authorize & Save Connection</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CENTERED POPUP MODAL FOR N8N NODE INSPECTION */}
      {showNodeModal && targetNode && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E6E1D7] max-w-6xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in duration-200">
            
            {/* Modal Top Header */}
            <div className="h-14 px-6 bg-[#F4F1EA] border-b border-[#E6E1D7] flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-8 h-8 rounded-xl text-white flex items-center justify-center font-bold text-xs"
                  style={{
                    backgroundColor: targetNode.type === 'ai' ? '#D97757' : targetNode.type === 'db' ? '#10B981' : targetNode.type === 'trigger' ? '#3B82F6' : '#8B5CF6'
                  }}
                >
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#2B2826]">{targetNode.name} Inspector</h3>
                  <span className="text-[11px] text-[#6E685E] font-medium">n8n Modular Node • ID: {targetNode.id}</span>
                </div>
              </div>

              <button onClick={() => setShowNodeModal(false)} className="text-[#9B9488] hover:text-[#2B2826] p-1">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal 3-Column Body */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden divide-y md:divide-y-0 md:divide-x divide-[#E6E1D7]">
              
              {/* LEFT COLUMN: INPUT JSON & VARIABLE PILLS */}
              <div className="md:col-span-3 bg-[#FAF8F5] p-5 overflow-y-auto space-y-4">
                <div className="flex items-center justify-between text-xs font-extrabold text-[#6E685E] uppercase tracking-wider">
                  <span>INPUT PAYLOAD TREE</span>
                  <span className="badge-success text-[10px]">Received</span>
                </div>

                <p className="text-[11px] text-[#6E685E]">
                  Click any variable pill below to insert <code className="bg-white px-1 font-mono text-[#D97757]">{`{{ $json.field }}`}</code> into prompt fields.
                </p>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-extrabold text-[#9B9488] uppercase tracking-wider block">
                    Available Variables
                  </span>

                  {Object.keys(targetNode.inputPayload || { order_id: "4821", amount: 1499, customer: "Alex Morgan" }).map((key) => (
                    <button
                      key={key}
                      onClick={() => handleInsertVariable(key)}
                      className="w-full text-left p-2 bg-white hover:bg-[#FDF3E9] border border-[#E6E1D7] hover:border-[#D97757] rounded-xl text-xs flex items-center justify-between transition-all group"
                      title={`Click to insert {{ $json.${key} }}`}
                    >
                      <span className="font-mono text-[11px] font-bold text-[#2B2826] group-hover:text-[#D97757]">
                        {key}
                      </span>
                      <span className="text-[10px] text-[#9B9488] group-hover:text-[#D97757] font-mono">
                        + {`{{ $json.${key} }}`}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="bg-white p-3 border border-[#E6E1D7] rounded-xl text-xs font-mono overflow-x-auto">
                  <pre className="whitespace-pre-wrap text-[11px] text-slate-800">
                    {JSON.stringify(targetNode.inputPayload || { order_id: "4821", amount: 1499 }, null, 2)}
                  </pre>
                </div>
              </div>

              {/* CENTER COLUMN: NODE CONFIGURATION */}
              <div className="md:col-span-6 p-6 overflow-y-auto space-y-5 bg-white">
                
                {/* FILTERED IN-LINE CREDENTIAL SELECTOR (Item 2) */}
                <div className="p-4 bg-[#FAF8F5] border border-[#E6E1D7] rounded-2xl space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-[#2B2826] flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#0F766E]" />
                      <span>Node Credential & Authentication</span>
                    </label>
                    
                    <button 
                      onClick={() => {
                        setAuthProviderName(targetNode.name);
                        setShowAuthInlineModal(true);
                      }}
                      className="text-[11px] text-[#D97757] font-bold hover:underline"
                    >
                      + Connect New Connection
                    </button>
                  </div>

                  {/* Strictly Filtered Credentials Dropdown per Tool Type */}
                  <select
                    value={targetNode.credentialId || targetNodeCredentials[0]?.id || savedCredentials[0].id}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNodes(prev => prev.map(n => n.id === targetNode.id ? { ...n, credentialId: val } : n));
                    }}
                    className="w-full p-2.5 border border-[#E6E1D7] rounded-xl text-xs font-medium bg-white focus:outline-none focus:border-[#D97757]"
                  >
                    {targetNodeCredentials.map(cred => (
                      <option key={cred.id} value={cred.id}>
                        {cred.name} ({cred.status})
                      </option>
                    ))}
                  </select>
                </div>

                {/* DEDICATED RESOURCE & SPECIFIC OPERATIONS SELECTOR (Item 1) */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-[#2B2826] block mb-1">Resource</label>
                    <select
                      value={targetNode.resource || targetOpConfig.resources[0]}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNodes(prev => prev.map(n => n.id === targetNode.id ? { ...n, resource: val } : n));
                      }}
                      className="w-full p-2.5 border border-[#E6E1D7] rounded-xl text-xs bg-white focus:outline-none focus:border-[#D97757]"
                    >
                      {targetOpConfig.resources.map(res => (
                        <option key={res} value={res}>{res}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#2B2826] block mb-1">Operation</label>
                    <select
                      value={targetNode.operation || targetOpConfig.operations[0]}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNodes(prev => prev.map(n => n.id === targetNode.id ? { ...n, operation: val } : n));
                      }}
                      className="w-full p-2.5 border border-[#E6E1D7] rounded-xl text-xs bg-white focus:outline-none focus:border-[#D97757]"
                    >
                      {targetOpConfig.operations.map(op => (
                        <option key={op} value={op}>{op}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* AI Agent Sub-Modules */}
                {targetNode.type === 'ai' && (
                  <div className="p-4 bg-[#FDF3E9]/60 border border-[#E6E1D7] rounded-2xl space-y-4">
                    <div className="flex items-center space-x-2 text-xs font-bold text-[#D97757]">
                      <Bot className="w-4 h-4" />
                      <span>AI Agent Independent Sub-Modules (n8n Style)</span>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#2B2826] block mb-1">LLM Model Provider</label>
                      <ModelSelectorDropdown
                        selectedModelId={targetNode.model || 'meta/llama-3.1-70b-instruct'}
                        showHoverDetails={false}
                        onSelectModel={(selected) => {
                          setNodes(prev => prev.map(n => n.id === targetNode.id ? { ...n, model: selected.id } : n));
                        }}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#2B2826] block mb-1">Attached Tools Module</label>
                      <div className="flex flex-wrap gap-2">
                        {['Gmail Tool', 'Database Query Tool', 'WhatsApp Tool', 'Web Search'].map(tool => {
                          const isAttached = targetNode.attachedTools?.includes(tool);
                          return (
                            <button
                              key={tool}
                              onClick={() => {
                                const current = targetNode.attachedTools || [];
                                const updated = isAttached ? current.filter(t => t !== tool) : [...current, tool];
                                setNodes(prev => prev.map(n => n.id === targetNode.id ? { ...n, attachedTools: updated } : n));
                              }}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                                isAttached ? 'bg-[#D97757] text-white border-[#D97757]' : 'bg-white text-[#6E685E] border-[#E6E1D7]'
                              }`}
                            >
                              {isAttached ? '✓ ' : '+ '} {tool}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#2B2826] block mb-1">Memory Module Engine</label>
                      <select
                        value={targetNode.memoryEngine || 'Conversation Window Buffer'}
                        onChange={(e) => {
                          const val = e.target.value;
                          setNodes(prev => prev.map(n => n.id === targetNode.id ? { ...n, memoryEngine: val } : n));
                        }}
                        className="w-full p-2.5 border border-[#E6E1D7] rounded-xl text-xs bg-white"
                      >
                        <option value="Conversation Window Buffer">Conversation Window Buffer (Last 10 Turns)</option>
                        <option value="Vector RAG Memory">Vector RAG Memory (pgvector Embeddings)</option>
                        <option value="Summary Buffer Memory">Summary Buffer Memory (LLM Summarized Context)</option>
                      </select>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-[#2B2826] block mb-1">Worker Prompt & Instructions</label>
                  <textarea 
                    rows={5}
                    value={targetNode.prompt || "System prompt for worker..."}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNodes(prev => prev.map(n => n.id === targetNode.id ? { ...n, prompt: val } : n));
                    }}
                    className="w-full p-3 border border-[#E6E1D7] rounded-xl text-xs font-mono bg-[#FAF8F5] focus:outline-none focus:border-[#D97757] resize-none"
                  />
                </div>

                <div className="pt-2 border-t border-[#E6E1D7] flex space-x-3">
                  <button 
                    onClick={() => handleExecuteSingleNode(targetNode.id)}
                    disabled={nodeExecStatus[targetNode.id] === 'running'}
                    className="btn-claude-primary text-xs py-2.5 px-5 font-bold flex items-center gap-2 rounded-xl"
                  >
                    {nodeExecStatus[targetNode.id] === 'running' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                    <span>Test & Execute Node Step</span>
                  </button>
                </div>

              </div>

              {/* RIGHT COLUMN: OUTPUT JSON PAYLOAD */}
              <div className="md:col-span-3 bg-[#FAF8F5] p-5 overflow-y-auto space-y-3">
                <div className="flex items-center justify-between text-xs font-extrabold text-[#6E685E] uppercase tracking-wider">
                  <span>OUTPUT PAYLOAD TREE</span>
                  {nodeExecStatus[targetNode.id] === 'completed' && <span className="badge-success text-[10px]">Executed</span>}
                </div>

                <p className="text-[11px] text-[#6E685E]">
                  Data output generated by this node after execution.
                </p>

                <div className="bg-white p-3 border border-[#E6E1D7] rounded-xl text-xs font-mono overflow-x-auto">
                  <pre className="whitespace-pre-wrap text-[11px] text-[#0F766E]">
                    {JSON.stringify(targetNode.outputPayload || { status: "APPROVED", refund_amount: 1499 }, null, 2)}
                  </pre>
                </div>
              </div>

            </div>

            <div className="h-14 px-6 bg-[#F4F1EA] border-t border-[#E6E1D7] flex items-center justify-between">
              <span className="text-xs text-[#6E685E] font-medium">Node settings update dynamically in workflow state.</span>
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

      {/* FULL WORKFLOW EXECUTION TRACE MODAL */}
      {showWorkflowExecModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E6E1D7] max-w-3xl w-full shadow-2xl p-6 space-y-5">
            <div className="flex justify-between items-center border-b border-[#E6E1D7] pb-4">
              <div className="flex items-center space-x-2">
                <Play className="w-5 h-5 text-[#D97757]" />
                <h3 className="font-extrabold text-base text-[#2B2826]">Sequential Node Execution Trace</h3>
              </div>
              <button onClick={() => setShowWorkflowExecModal(false)} className="text-[#9B9488] hover:text-[#2B2826]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto">
              {nodes.map((n, idx) => (
                <div key={n.id} className="p-3.5 border border-[#E6E1D7] rounded-xl bg-[#FAF8F5] flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-lg bg-[#D97757] text-white font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="font-bold text-xs text-[#2B2826]">{n.name}</div>
                      <div className="text-[10.5px] text-[#6E685E]">{n.operation || n.subtitle}</div>
                    </div>
                  </div>

                  <span className={`badge-pill text-[10.5px] ${
                    n.status === 'completed' ? 'badge-success' : n.status === 'running' ? 'badge-warning animate-pulse' : 'badge-inactive'
                  }`}>
                    {n.status === 'completed' ? 'Succeeded (240ms)' : n.status === 'running' ? 'Running...' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>

            {!isExecuting && (
              <div className="p-4 bg-[#E6F4F1] border border-[#99F6E4] rounded-2xl text-xs space-y-1">
                <div className="font-extrabold text-[#0F766E] text-sm flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>n8n Pipeline Execution Succeeded</span>
                </div>
                <p className="text-[#0F766E] font-medium">
                  Pipeline executed in 1.18s. Refund RF-2291 verified and receipt emailed via Gmail.
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

      {/* DEPLOYED INTERACTIVE END-USER APPLICATION MODAL (Requirement 1) */}
      {showLiveAppModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E6E1D7] max-w-2xl w-full shadow-2xl overflow-hidden font-sans text-[#2B2826] animate-in fade-in zoom-in-95 duration-200">
            
            {/* App Modal Header */}
            <div className="p-5 bg-[#FAF8F5] border-b border-[#E6E1D7] flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-[#D97757] text-white flex items-center justify-center font-bold shadow-md">
                  <Rocket className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-extrabold text-base text-[#2B2826] flex items-center gap-2">
                    <span>AI Workforce Live Application</span>
                    <span className="bg-[#E6F4F1] text-[#0F766E] font-bold text-[10px] px-2 py-0.5 rounded border border-[#99F6E4]">
                      Deployed & Live
                    </span>
                  </div>
                  <p className="text-xs text-[#6E685E] font-medium mt-0.5">
                    Powered by <b>{workflowTitle}</b>
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setShowLiveAppModal(false)}
                className="p-2 text-[#9B9488] hover:text-[#2B2826] rounded-xl hover:bg-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* App Body Content */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto bg-white">
              
              {/* Voice Call Intake Engine Widget (Indic Speech-to-Text) */}
              <div className="p-5 bg-[#FAF8F5] border border-[#E6E1D7] rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-[#2B2826] flex items-center gap-2">
                    <PhoneCall className="w-4 h-4 text-[#3B82F6]" />
                    <span>Indic Streaming Voice Intake (Sarvam Speech API)</span>
                  </label>

                  <span className="text-[11px] font-mono text-[#0F766E] font-bold">
                    {isVoiceRecording ? "🔴 Streaming STT Active..." : "Mic Ready"}
                  </span>
                </div>

                <div className="flex items-center space-x-4">
                  {/* Mic Pulse Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsVoiceRecording(!isVoiceRecording);
                      if (!isVoiceRecording) {
                        setVoiceTranscript("வணக்கம், my order #4821 saree arrived damaged. Please process refund.");
                      }
                    }}
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-md shrink-0 ${
                      isVoiceRecording 
                        ? 'bg-red-600 text-white animate-pulse ring-8 ring-red-100' 
                        : 'bg-[#D97757] hover:bg-[#c26244] text-white'
                    }`}
                    title="Tap to speak Tamil / Hindi / English"
                  >
                    {isVoiceRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                  </button>

                  <div className="flex-1">
                    <label className="text-[11px] font-bold text-[#6E685E] block mb-1">
                      Transcribed Indic Speech (Tamil / Hindi / English)
                    </label>
                    <input
                      type="text"
                      value={voiceTranscript}
                      onChange={e => setVoiceTranscript(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E6E1D7] rounded-xl text-xs font-medium bg-white focus:outline-none focus:border-[#D97757]"
                    />
                  </div>
                </div>
              </div>

              {/* Form Input Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#2B2826] block mb-1">Customer Name</label>
                  <input
                    type="text"
                    value={appFormData.customerName}
                    onChange={e => setAppFormData({ ...appFormData, customerName: e.target.value })}
                    className="w-full p-2.5 border border-[#E6E1D7] rounded-xl text-xs bg-[#FAF8F5] focus:outline-none focus:border-[#D97757]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#2B2826] block mb-1">Order ID</label>
                  <input
                    type="text"
                    value={appFormData.orderId}
                    onChange={e => setAppFormData({ ...appFormData, orderId: e.target.value })}
                    className="w-full p-2.5 border border-[#E6E1D7] rounded-xl text-xs font-mono bg-[#FAF8F5] focus:outline-none focus:border-[#D97757]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#2B2826] block mb-1">Customer Email</label>
                  <input
                    type="text"
                    value={appFormData.customerEmail}
                    onChange={e => setAppFormData({ ...appFormData, customerEmail: e.target.value })}
                    className="w-full p-2.5 border border-[#E6E1D7] rounded-xl text-xs font-mono bg-[#FAF8F5] focus:outline-none focus:border-[#D97757]"
                  />
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => {
                  setAppProcessing(true);
                  setAppStepLogs([
                    "🎤 [1/4] Web Voice Intake: Transcribed Tamil speech to text (Order #4821)",
                    "💾 [2/4] Database Gateway: Queried MongoDB. Matched item: Kanjivaram Saree (₹1,499 INR)",
                    "🤖 [3/4] NVIDIA Llama 3.1 Worker: Auto-refund approved (₹1,499 <= ₹2,000 threshold)",
                    "📧 [4/4] Gmail Integration: Confirmation email sent to alex@company.com with Ref #RF-2291"
                  ]);
                  setTimeout(() => setAppProcessing(false), 900);
                }}
                disabled={appProcessing}
                className="w-full btn-claude-primary py-3 text-xs font-extrabold flex items-center justify-center space-x-2 rounded-2xl shadow-md"
              >
                {appProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>Process Request via AI Workforce Workflow</span>
              </button>

              {/* Execution Result Logs Card */}
              {appStepLogs.length > 0 && (
                <div className="p-5 bg-[#E6F4F1] border border-[#99F6E4] rounded-2xl space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-xs font-extrabold text-[#0F766E]">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-[#0F766E]" />
                      <span>Live Pipeline Processing Succeeded</span>
                    </span>
                    <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-[#99F6E4]">
                      Execution Ref: RF-2291
                    </span>
                  </div>

                  <div className="space-y-1.5 font-mono text-[11px] text-[#0F766E]">
                    {appStepLogs.map((log, idx) => (
                      <div key={idx} className="bg-white/80 p-2 rounded-lg border border-[#99F6E4]/50">
                        {log}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#F4F1EA] border-t border-[#E6E1D7] flex items-center justify-between">
              <span className="text-xs text-[#6E685E]">
                Deployed Workflow UI • Ready for end-user production deployment
              </span>
              <button 
                onClick={() => setShowLiveAppModal(false)}
                className="btn-claude-secondary text-xs py-1.5 px-4 font-bold"
              >
                Close App Window
              </button>
            </div>

          </div>
        </div>
      )}

      {/* AUTHENTIC N8N RIGHT SLIDE-OVER NODE CATALOG DRAWER PANEL */}
      {showNodePicker && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-xs z-50 flex justify-end">
          <div className="w-full max-w-md sm:w-[440px] h-full bg-white border-l border-[#E6E1D7] shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            
            <div className="p-4 bg-[#F4F1EA] border-b border-[#E6E1D7] flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#D97757] text-white flex items-center justify-center font-extrabold text-sm shadow-2xs">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-[#2B2826]">Add Node to Workflow</h3>
                  <p className="text-[10.5px] text-[#6E685E]">Select an n8n node to attach to canvas</p>
                </div>
              </div>

              <button 
                onClick={() => setShowNodePicker(false)}
                className="p-1.5 text-[#9B9488] hover:text-[#2B2826] rounded-xl hover:bg-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 bg-white border-b border-[#E6E1D7] relative shrink-0">
              <Search className="w-4 h-4 absolute left-6.5 top-5.5 text-[#9B9488]" />
              <input 
                type="text" 
                placeholder="Search real nodes (e.g. Gmail, Drive, AI Agent, Webhook, Postgres)..." 
                value={pickerSearch}
                onChange={e => setPickerSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-[#E6E1D7] rounded-xl text-xs bg-[#FAF8F5] focus:outline-none focus:border-[#D97757]"
                autoFocus
              />
            </div>

            <div className="p-3 bg-[#FAF8F5] border-b border-[#E6E1D7] flex flex-wrap gap-1.5 text-xs shrink-0">
              {['All', 'Triggers & Intake', 'AI Agents & Reasoning', 'Databases & Storage', 'Apps & Integrations', 'Logic & Flow'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all ${
                    selectedCategory === cat 
                      ? 'bg-[#D97757] text-white shadow-2xs' 
                      : 'bg-white text-[#6E685E] border border-[#E6E1D7] hover:bg-[#F4F1EA] hover:text-[#2B2826]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2.5 bg-white">
              {segregatedCatalog
                .filter(item => selectedCategory === 'All' || item.cat === selectedCategory)
                .filter(item => item.name.toLowerCase().includes(pickerSearch.toLowerCase()) || item.desc.toLowerCase().includes(pickerSearch.toLowerCase()))
                .map(item => {
                  const IconComponent = item.icon;
                  const isTriggerLocked = item.type === 'trigger' && nodes.some(n => n.type === 'trigger');

                  return (
                    <div 
                      key={item.id}
                      onClick={() => handleAddNodeFromCatalog(item)}
                      className={`p-3.5 border rounded-2xl flex items-center justify-between transition-all group ${
                        isTriggerLocked 
                          ? 'opacity-60 bg-[#FAF8F5] border-[#E6E1D7] cursor-not-allowed' 
                          : 'border-[#E6E1D7] hover:border-[#D97757] hover:bg-[#FDF3E9] cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center space-x-3.5">
                        <div className="w-10 h-10 rounded-xl text-white flex items-center justify-center font-bold text-xs shadow-2xs" style={{ backgroundColor: item.color }}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-xs text-[#2B2826] group-hover:text-[#D97757] flex items-center gap-1.5">
                            <span>{item.name}</span>
                            {isTriggerLocked && (
                              <span className="text-[9.5px] font-extrabold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300">
                                1 Trigger Limit
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[#6E685E]">{item.desc}</div>
                        </div>
                      </div>

                      <span className="text-[10px] font-bold text-[#6E685E] bg-[#F4F1EA] px-2.5 py-1 rounded-lg border border-[#E6E1D7] shrink-0">
                        {item.cat}
                      </span>
                    </div>
                  );
                })}
            </div>

          </div>
        </div>
      )}

      {/* UNSAVED CHANGES CONFIRMATION MODAL (Fixes Item #3) */}
      {showUnsavedModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E6E1D7] p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-[#D97757]">
              <div className="w-10 h-10 rounded-2xl bg-[#FDF3E9] flex items-center justify-center font-bold">
                <AlertCircle className="w-5 h-5 text-[#D97757]" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-[#2B2826]">Unsaved Changes Alert</h3>
                <p className="text-xs text-[#6E685E]">You have unsaved changes on this workflow canvas.</p>
              </div>
            </div>

            <p className="text-xs text-[#6E685E] leading-relaxed bg-[#FAF8F5] p-3 rounded-xl border border-[#E6E1D7]">
              If you leave without saving, your node moves, connections, or text modifications will be lost. Would you like to save changes to SQLite database before leaving?
            </p>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#E6E1D7]">
              <button
                onClick={() => setShowUnsavedModal(false)}
                className="btn-claude-secondary text-xs py-2 px-3 font-bold"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  setShowUnsavedModal(false);
                  setIsDirty(false);
                  if (onBackToProjects) onBackToProjects();
                }}
                className="px-3 py-2 bg-white border border-[#FCA5A5] text-[#C93B2B] hover:bg-[#FCEAE8] rounded-xl text-xs font-bold transition-all"
              >
                Discard & Exit
              </button>

              <button
                onClick={() => {
                  setShowUnsavedModal(false);
                  handleSaveWorkflowCanvas(() => {
                    if (onBackToProjects) onBackToProjects();
                  });
                }}
                className="btn-claude-primary text-xs py-2 px-4 font-bold flex items-center space-x-1.5 shadow-2xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save & Exit</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
