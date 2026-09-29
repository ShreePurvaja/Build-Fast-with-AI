'use client';

import React, { useState } from 'react';
import { CheckCircle2, Clock, AlertTriangle, Layers, Search, Filter, Cpu, ShieldAlert, Sparkles } from 'lucide-react';

interface BacklogItem {
  id: string;
  category: string;
  feature: string;
  status: 'Implemented' | 'In Progress' | 'Pending MVP' | 'Post-MVP (Phase 2)';
  priority: 'High' | 'Medium' | 'Low';
  guard: string;
  section: string;
}

export const MemoryBacklogTable: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  const backlogData: BacklogItem[] = [
    {
      id: 'B01',
      category: 'Control Plane',
      feature: 'Requirement Intake & Editable Draft Generator',
      status: 'Implemented',
      priority: 'High',
      guard: 'LLM proposes spec, human reviews before publish',
      section: 'Sec 6, 8-wk Wk 6'
    },
    {
      id: 'B02',
      category: 'Workflow Canvas',
      feature: 'Visual n8n Drag & Drop Studio with JSON Import/Export',
      status: 'Implemented',
      priority: 'High',
      guard: 'Strict JSON schema validation on import',
      section: 'Sec 6, 7'
    },
    {
      id: 'B03',
      category: 'Model Provider Hub',
      feature: 'NVIDIA NIM API Key Loader & Llama 3.1 70B/405B Integration',
      status: 'Implemented',
      priority: 'High',
      guard: 'Encrypted key storage & fallback endpoints',
      section: 'Sec 10, 16'
    },
    {
      id: 'B04',
      category: 'Database Integration',
      feature: 'MongoDB Query & Insert Node Adapter',
      status: 'Implemented',
      priority: 'High',
      guard: 'Graceful in-memory fallback if DB offline',
      section: 'Sec 3, 6'
    },
    {
      id: 'B05',
      category: 'Sticky Notes',
      feature: 'Canvas Sticky Note Generator & Color Customizer',
      status: 'Implemented',
      priority: 'Medium',
      guard: 'Local canvas state persistence',
      section: 'Sec 2, UX'
    },
    {
      id: 'B06',
      category: 'Voice Pipeline',
      feature: 'Silero VAD + Indic Streaming STT & TTS Pipeline',
      status: 'In Progress',
      priority: 'High',
      guard: 'Barge-in interrupt cancels audio stream',
      section: 'Sec 6, 10'
    },
    {
      id: 'B07',
      category: 'Multi-Agent Hierarchy',
      feature: 'Manager Intent Router + Specialist Workers',
      status: 'Implemented',
      priority: 'High',
      guard: 'Max 4 hops guard, manager never calls tools directly',
      section: 'Sec 3, 20'
    },
    {
      id: 'B08',
      category: 'Security Gateway',
      feature: 'Tool Gateway with SSRF Block & Idempotency Keys',
      status: 'In Progress',
      priority: 'High',
      guard: 'Block private IP ranges & HMAC signature check',
      section: 'Sec 12'
    },
    {
      id: 'B09',
      category: 'Escalations',
      feature: 'Human Agent Queue & Full Context Handoff Payload',
      status: 'Implemented',
      priority: 'High',
      guard: 'Callback ticket created if no agent online',
      section: 'Sec 6, 9'
    },
    {
      id: 'B10',
      category: 'Knowledge Base',
      feature: 'pgvector RAG Chunking & Document Upload',
      status: 'Implemented',
      priority: 'Medium',
      guard: 'Retrieval scoped strictly to org_id',
      section: 'Sec 6, 8'
    },
    {
      id: 'B11',
      category: 'Testing & Harness',
      feature: 'Scripted Call Simulator & Mock Tool Adapter',
      status: 'Implemented',
      priority: 'Medium',
      guard: 'Forces mock mode during test runs',
      section: 'Sec 6, 14'
    },
    {
      id: 'B12',
      category: 'Multimodal',
      feature: 'Image Upload & Vision Model Inspection',
      status: 'Pending MVP',
      priority: 'Medium',
      guard: 'Image content treated as untrusted payload',
      section: 'Sec 6, 13'
    },
    {
      id: 'B13',
      category: 'Telephony',
      feature: 'Exotel/Twilio Phone Call Bridge & SIP Trunk',
      status: 'Post-MVP (Phase 2)',
      priority: 'Low',
      guard: 'Web voice link first; phone deferred',
      section: 'Sec 1, 13'
    },
    {
      id: 'B14',
      category: 'Enterprise Auth',
      feature: 'Postgres RLS Multi-Tenancy & SSO Auth',
      status: 'Pending MVP',
      priority: 'High',
      guard: 'org_id filter enforced on every row',
      section: 'Sec 12'
    },
    {
      id: 'B15',
      category: 'Observability',
      feature: 'Langfuse / OpenTelemetry Tracing Ingestion',
      status: 'In Progress',
      priority: 'Medium',
      guard: 'Automatic PII redaction before logging',
      section: 'Sec 10, 12'
    }
  ];

  const filteredItems = backlogData.filter(item => {
    const matchesSearch = item.feature.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.guard.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'All' || item.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-[#E6E1D7] shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-[#FDF3E9] text-[#D97757] text-[10.5px] font-extrabold px-2 py-0.5 rounded border border-[#E6E1D7]">
              AGENT_MEMORY.md AUDIT
            </span>
            <span className="text-xs text-[#6E685E]">Spec Version 1.0</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#2B2826] mt-1 flex items-center gap-2">
            <Layers className="w-6 h-6 text-[#D97757]" />
            <span>Platform Roadmap & Architectural Backlog</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#6E685E] mt-0.5">
            Full compliance audit against <code className="text-[#D97757] font-semibold">AGENT_MEMORY.md</code> specifications, MVP cut list, and security controls.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-[#F4F1EA] px-3 py-2 rounded-xl border border-[#E6E1D7] text-xs font-bold text-[#2B2826]">
          <span>{backlogData.filter(i => i.status === 'Implemented').length} / {backlogData.length} Implemented</span>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-white p-4 rounded-2xl border border-[#E6E1D7] shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#9B9488]" />
          <input 
            type="text"
            placeholder="Search backlog e.g. Voice, NVIDIA, MongoDB, Security..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-[#E6E1D7] rounded-xl text-xs bg-[#FAF8F5] focus:outline-none focus:border-[#D97757]"
          />
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-[#9B9488] shrink-0" />
          {['All', 'Implemented', 'In Progress', 'Pending MVP', 'Post-MVP (Phase 2)'].map(status => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all shrink-0 ${
                selectedStatus === status 
                  ? 'bg-[#D97757] text-white shadow-xs' 
                  : 'bg-[#F4F1EA] text-[#6E685E] hover:text-[#2B2826]'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Backlog Data Table */}
      <div className="bg-white border border-[#E6E1D7] rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F4F1EA] border-b border-[#E6E1D7] text-[11px] font-extrabold text-[#6E685E] uppercase tracking-wider">
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Feature / Specification</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Guard / Constraint</th>
                <th className="py-3 px-4">Memory Spec Ref</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E1D7] text-xs">
              {filteredItems.map(item => (
                <tr key={item.id} className="hover:bg-[#FAF8F5] transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#6E685E]">{item.id}</td>
                  <td className="py-3.5 px-4">
                    <span className="bg-[#FAF8F5] text-[#2B2826] font-bold px-2 py-0.5 rounded border border-[#E6E1D7] text-[11px]">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-[#2B2826]">{item.feature}</td>
                  <td className="py-3.5 px-4">
                    {item.status === 'Implemented' && (
                      <span className="badge-success inline-flex items-center gap-1 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Implemented
                      </span>
                    )}
                    {item.status === 'In Progress' && (
                      <span className="badge-warning inline-flex items-center gap-1 text-[11px]">
                        <Clock className="w-3.5 h-3.5" /> In Progress
                      </span>
                    )}
                    {item.status === 'Pending MVP' && (
                      <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full text-[11px] font-semibold inline-flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> Pending MVP
                      </span>
                    )}
                    {item.status === 'Post-MVP (Phase 2)' && (
                      <span className="bg-gray-100 text-gray-600 border border-gray-200 px-2 py-0.5 rounded-full text-[11px] font-semibold inline-flex items-center gap-1">
                        Deferred
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`font-bold text-[11px] ${
                      item.priority === 'High' ? 'text-[#C93B2B]' : item.priority === 'Medium' ? 'text-[#D97706]' : 'text-[#6E685E]'
                    }`}>
                      {item.priority}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-[#6E685E] font-medium text-[11.5px]">{item.guard}</td>
                  <td className="py-3.5 px-4 font-mono text-[10.5px] text-[#9B9488] font-bold">{item.section}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
