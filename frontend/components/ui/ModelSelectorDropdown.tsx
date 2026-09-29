'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronDown, 
  Search, 
  Check, 
  Copy, 
  CheckCircle2, 
  Sparkles, 
  Cpu, 
  Zap, 
  Bot, 
  ShieldCheck, 
  Info 
} from 'lucide-react';

export interface ModelDetail {
  id: string;
  name: string;
  provider: 'NVIDIA NIM' | 'Anthropic' | 'Groq' | 'Sarvam AI';
  category: string;
  requests_per_min: string;
  requests_per_day: string;
  tokens_per_min: string;
  tokens_per_day: string;
  release_stage: 'Production' | 'Preview' | 'General Availability';
  release_date: string;
  description: string;
}

export const CATALOG_MODELS: ModelDetail[] = [
  // NVIDIA NIM Models
  {
    id: 'meta/llama-3.1-70b-instruct',
    name: 'NVIDIA Llama 3.1 70B Instruct',
    provider: 'NVIDIA NIM',
    category: 'NVIDIA NIM (GPU Accelerated)',
    requests_per_min: '30 / min',
    requests_per_day: '1,000 / day',
    tokens_per_min: '15.0K / min',
    tokens_per_day: '500K / day',
    release_stage: 'Production',
    release_date: 'July 23, 2024',
    description: 'High-speed 70B parameter reasoning model hosted on NVIDIA NIM microservices.'
  },
  {
    id: 'meta/llama-3.1-405b-instruct',
    name: 'NVIDIA Llama 3.1 405B Instruct',
    provider: 'NVIDIA NIM',
    category: 'NVIDIA NIM (GPU Accelerated)',
    requests_per_min: '10 / min',
    requests_per_day: '200 / day',
    tokens_per_min: '8.0K / min',
    tokens_per_day: '200K / day',
    release_stage: 'Production',
    release_date: 'July 23, 2024',
    description: 'Flagship 405B parameter model for multi-agent reasoning and complex instruction following.'
  },
  {
    id: 'mistralai/mixtral-8x22b-instruct',
    name: 'NVIDIA Mixtral 8x22B Instruct',
    provider: 'NVIDIA NIM',
    category: 'NVIDIA NIM (GPU Accelerated)',
    requests_per_min: '30 / min',
    requests_per_day: '1,000 / day',
    tokens_per_min: '20.0K / min',
    tokens_per_day: '600K / day',
    release_stage: 'Production',
    release_date: 'April 17, 2024',
    description: 'High throughput mixture-of-experts model for enterprise call routing.'
  },
  {
    id: 'deepseek-ai/deepseek-r1',
    name: 'NVIDIA DeepSeek R1 (Reasoning)',
    provider: 'NVIDIA NIM',
    category: 'NVIDIA NIM (GPU Accelerated)',
    requests_per_min: '15 / min',
    requests_per_day: '500 / day',
    tokens_per_min: '10.0K / min',
    tokens_per_day: '300K / day',
    release_stage: 'Preview',
    release_date: 'January 20, 2025',
    description: 'Chain-of-thought mathematical reasoning and logic verification model.'
  },

  // Anthropic Models
  {
    id: 'claude-3-7-sonnet',
    name: 'Claude 3.7 Sonnet',
    provider: 'Anthropic',
    category: 'Anthropic Claude',
    requests_per_min: '50 / min',
    requests_per_day: '2,000 / day',
    tokens_per_min: '40.0K / min',
    tokens_per_day: '1.2M / day',
    release_stage: 'General Availability',
    release_date: 'February 24, 2025',
    description: 'Anthropic flagship reasoning model with hybrid fast-and-deep thinking modes.'
  },
  {
    id: 'claude-3-5-haiku',
    name: 'Claude 3.5 Haiku',
    provider: 'Anthropic',
    category: 'Anthropic Claude',
    requests_per_min: '100 / min',
    requests_per_day: '5,000 / day',
    tokens_per_min: '50.0K / min',
    tokens_per_day: '2.0M / day',
    release_stage: 'General Availability',
    release_date: 'November 4, 2024',
    description: 'Ultra-fast lightweight reasoning model optimized for low latency agent turns.'
  },

  // Groq Models
  {
    id: 'groq/llama3-70b-8192',
    name: 'Groq Llama 3 70B (LPUs)',
    provider: 'Groq',
    category: 'Groq Fast Inference',
    requests_per_min: '30 / min',
    requests_per_day: '14.4K / day',
    tokens_per_min: '6.0K / min',
    tokens_per_day: '500K / day',
    release_stage: 'Production',
    release_date: 'April 18, 2024',
    description: 'Ultra-low latency LPU hardware inference delivering 300+ tokens/sec.'
  },
  {
    id: 'groq/mixtral-8x7b-32768',
    name: 'Groq Mixtral 8x7B',
    provider: 'Groq',
    category: 'Groq Fast Inference',
    requests_per_min: '30 / min',
    requests_per_day: '14.4K / day',
    tokens_per_min: '5.0K / min',
    tokens_per_day: '450K / day',
    release_stage: 'Production',
    release_date: 'December 11, 2023',
    description: 'Fast MoE architecture for concurrent intent classification.'
  },

  // Sarvam Indic Voice Models
  {
    id: 'sarvam-indic-stt-v2',
    name: 'Sarvam Indic Streaming STT',
    provider: 'Sarvam AI',
    category: 'Sarvam Indic Voice',
    requests_per_min: '60 / min',
    requests_per_day: '3,000 / day',
    tokens_per_min: '30.0K / min',
    tokens_per_day: '1.0M / day',
    release_stage: 'Production',
    release_date: 'August 15, 2024',
    description: 'Real-time Indic speech-to-text with automatic code-switching (Tamil, Hindi, English).'
  },
  {
    id: 'sarvam-indic-tts-v2',
    name: 'Sarvam Indic Voice TTS',
    provider: 'Sarvam AI',
    category: 'Sarvam Indic Voice',
    requests_per_min: '60 / min',
    requests_per_day: '3,000 / day',
    tokens_per_min: '30.0K / min',
    tokens_per_day: '1.0M / day',
    release_stage: 'Production',
    release_date: 'August 15, 2024',
    description: 'Streaming text-to-speech audio synthesis in regional Indian languages.'
  }
];

interface ModelSelectorDropdownProps {
  selectedModelId: string;
  onSelectModel: (model: ModelDetail) => void;
  customModels?: ModelDetail[];
}

export const ModelSelectorDropdown: React.FC<ModelSelectorDropdownProps> = ({
  selectedModelId,
  onSelectModel,
  customModels
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredModel, setHoveredModel] = useState<ModelDetail | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const modelsList = customModels && customModels.length > 0 ? customModels : CATALOG_MODELS;
  const currentModel = modelsList.find(m => m.id === selectedModelId) || modelsList[0];

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopyId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 1500);
  };

  // Group models by Category
  const categories = Array.from(new Set(modelsList.map(m => m.category)));
  const filteredModels = modelsList.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.provider.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative font-sans text-xs" ref={dropdownRef}>
      
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border border-[#E6E1D7] hover:border-[#D97757] rounded-xl px-3.5 py-2 flex items-center justify-between text-left shadow-2xs transition-all"
      >
        <div className="flex items-center space-x-2.5 overflow-hidden">
          <div 
            className="w-6 h-6 rounded-lg text-white flex items-center justify-center font-bold text-[10px] shrink-0"
            style={{
              backgroundColor: currentModel.provider === 'NVIDIA NIM' ? '#76B900' : currentModel.provider === 'Anthropic' ? '#D97757' : currentModel.provider === 'Groq' ? '#F59E0B' : '#3B82F6'
            }}
          >
            {currentModel.provider === 'NVIDIA NIM' ? 'NV' : currentModel.provider === 'Anthropic' ? 'AI' : 'GQ'}
          </div>
          <div className="overflow-hidden">
            <div className="font-bold text-[#2B2826] text-xs truncate">{currentModel.name}</div>
            <div className="text-[10.5px] font-mono text-[#9B9488] truncate">{currentModel.id}</div>
          </div>
        </div>
        
        <ChevronDown className={`w-4 h-4 text-[#9B9488] transition-transform ${isOpen ? 'rotate-180 text-[#D97757]' : ''}`} />
      </button>

      {/* DROPDOWN & HOVER POPOVER CARD CONTAINER */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 flex items-start space-x-2 animate-in fade-in zoom-in-95 duration-150">
          
          {/* Main List Panel */}
          <div className="w-80 bg-white border border-[#E6E1D7] rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[460px]">
            
            {/* Search Bar */}
            <div className="p-3 bg-[#F4F1EA] border-b border-[#E6E1D7] relative">
              <Search className="w-4 h-4 absolute left-5 top-4.5 text-[#9B9488]" />
              <input
                type="text"
                placeholder="Search Models..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 border border-[#E6E1D7] rounded-xl text-xs bg-white focus:outline-none focus:border-[#D97757]"
                autoFocus
              />
            </div>

            {/* Categorized Model List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-3">
              {categories.map(cat => {
                const catModels = filteredModels.filter(m => m.category === cat);
                if (catModels.length === 0) return null;

                return (
                  <div key={cat} className="space-y-1">
                    <div className="px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#9B9488] flex items-center justify-between border-b border-[#E6E1D7]/60 pb-1">
                      <span>{cat}</span>
                    </div>

                    <div className="space-y-0.5">
                      {catModels.map(m => {
                        const isSelected = m.id === selectedModelId;
                        return (
                          <div
                            key={m.id}
                            onMouseEnter={() => setHoveredModel(m)}
                            onClick={() => {
                              onSelectModel(m);
                              setIsOpen(false);
                            }}
                            className={`p-2 rounded-xl cursor-pointer flex items-center justify-between transition-all ${
                              isSelected 
                                ? 'bg-[#FDF3E9] text-[#D97757] font-bold border border-[#D97757]/30' 
                                : 'hover:bg-[#FAF8F5] text-[#2B2826]'
                            }`}
                          >
                            <div className="overflow-hidden pr-2">
                              <div className="text-xs font-bold truncate">{m.name}</div>
                              <div className="text-[10px] font-mono text-[#9B9488] truncate">{m.id}</div>
                            </div>

                            {isSelected && <Check className="w-4 h-4 text-[#D97757] shrink-0" />}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* HOVER POPOVER CARD (GROQ STYLE - SCREENSHOT 3) */}
          {hoveredModel && (
            <div className="w-80 bg-[#1A1A1A] text-white border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4 animate-in fade-in slide-in-from-left-2 duration-150">
              
              {/* Model Header */}
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#76B900] bg-[#76B900]/15 px-2 py-0.5 rounded border border-[#76B900]/30">
                    {hoveredModel.provider}
                  </span>
                  <button 
                    onClick={(e) => handleCopyId(hoveredModel.id, e)}
                    className="text-slate-400 hover:text-white transition-colors"
                    title="Copy Model ID"
                  >
                    {copiedId ? <CheckCircle2 className="w-4 h-4 text-[#76B900]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <h4 className="font-extrabold text-sm text-white mt-2 leading-tight">
                  {hoveredModel.name}
                </h4>
                <div className="text-[10.5px] font-mono text-slate-400 truncate mt-0.5">
                  {hoveredModel.id}
                </div>
              </div>

              {/* LIMITS Section */}
              <div className="border-t border-slate-800 pt-3">
                <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-2">
                  LIMITS & RATE QUOTAS
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Requests</span>
                    <span className="font-bold text-white block mt-0.5">{hoveredModel.requests_per_min}</span>
                    <span className="text-[10px] text-slate-500">{hoveredModel.requests_per_day}</span>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 block">Tokens</span>
                    <span className="font-bold text-white block mt-0.5">{hoveredModel.tokens_per_min}</span>
                    <span className="text-[10px] text-slate-500">{hoveredModel.tokens_per_day}</span>
                  </div>
                </div>
              </div>

              {/* RELEASE STAGE Section */}
              <div className="border-t border-slate-800 pt-3 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                    RELEASE STAGE
                  </span>
                  <span className="font-semibold text-slate-200 block mt-1">
                    {hoveredModel.release_stage}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                    RELEASED
                  </span>
                  <span className="font-semibold text-slate-300 block mt-1">
                    {hoveredModel.release_date}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="border-t border-slate-800 pt-3 text-[11px] text-slate-400 leading-relaxed">
                {hoveredModel.description}
              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
};
