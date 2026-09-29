'use client';

import React from 'react';
import { 
  Bot, 
  Sparkles, 
  Mic, 
  Workflow, 
  ShieldCheck, 
  Database, 
  ArrowRight, 
  Play, 
  CheckCircle2, 
  Layers,
  Zap,
  FolderKanban,
  BarChart3,
  Cpu,
  LogIn
} from 'lucide-react';

interface LandingPageProps {
  onStartBuilding: () => void;
  onExploreProjects: () => void;
  onOpenAnalytics?: () => void;
  onOpenMemory?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ 
  onStartBuilding, 
  onExploreProjects,
  onOpenAnalytics,
  onOpenMemory 
}) => {
  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col font-sans text-[#2B2826]">
      
      {/* 1st Screen Sleek Hero Navbar (Replaces standard app navbar on 1st screen) */}
      <header className="bg-white/80 backdrop-blur-md border-b border-[#E6E1D7] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#D97757] text-white flex items-center justify-center font-extrabold text-base shadow-sm">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-[#2B2826]">AI Workforce Platform</span>
              <span className="ml-2 bg-[#FDF3E9] text-[#D97757] text-[10.5px] font-extrabold px-2 py-0.5 rounded border border-[#E6E1D7]">
                INDIC VOICE • NVIDIA NIM
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button 
              onClick={onExploreProjects}
              className="btn-claude-secondary text-xs py-2 px-4 font-bold flex items-center space-x-1.5"
            >
              <FolderKanban className="w-4 h-4 text-[#D97757]" />
              <span>Recent Projects</span>
            </button>

            <button 
              onClick={onStartBuilding}
              className="btn-claude-primary text-xs py-2 px-4 font-bold flex items-center space-x-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch Platform</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Hero Content */}
      <div className="flex-1 space-y-12 py-10 max-w-6xl mx-auto px-4">
        
        {/* HERO SECTION */}
        <section className="bg-white rounded-3xl border border-[#E6E1D7] p-8 sm:p-14 shadow-sm text-center relative overflow-hidden">
          <div className="inline-flex items-center space-x-2 bg-[#FDF3E9] border border-[#E6E1D7] px-4 py-1.5 rounded-full text-xs font-bold text-[#D97757] mb-6">
            <Sparkles className="w-4 h-4" />
            <span>Multi-Agent AI Workforce Platform for SMEs & Enterprises</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#2B2826] tracking-tight max-w-4xl mx-auto leading-tight">
            Turn Plain-Language Needs into an <span className="text-[#D97757]">AI Workforce</span> of Narrow Specialist Workers
          </h1>

          <p className="text-base sm:text-lg text-[#6E685E] max-w-2xl mx-auto mt-4 leading-relaxed font-medium">
            Automate D2C customer support, sales lead booking, and technical helpdesks. Speaks Indian languages by voice, executes gated MongoDB/CRM tools, and escalates to humans with full context. Powered by NVIDIA NIM GPU inference.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <button 
              onClick={onExploreProjects}
              className="btn-claude-primary text-sm py-3 px-6 rounded-xl flex items-center space-x-2 text-white font-bold"
            >
              <span>Explore Recent Projects & Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            
            <button 
              onClick={onStartBuilding}
              className="btn-claude-secondary text-sm py-3 px-6 rounded-xl flex items-center space-x-2 font-bold"
            >
              <Workflow className="w-4 h-4 text-[#D97757]" />
              <span>Open Visual n8n Studio</span>
            </button>
          </div>

          {/* Feature Highlight Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12 pt-8 border-t border-[#E6E1D7] text-left">
            <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E6E1D7]">
              <div className="flex items-center space-x-2 text-xs font-bold text-[#2B2826]">
                <Mic className="w-4 h-4 text-[#D97757]" />
                <span>Indic Voice Code-Switch</span>
              </div>
              <p className="text-[11px] text-[#6E685E] mt-1">Tamil, Hindi & English voice recognition with VAD barge-in.</p>
            </div>

            <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E6E1D7]">
              <div className="flex items-center space-x-2 text-xs font-bold text-[#2B2826]">
                <Cpu className="w-4 h-4 text-[#76B900]" />
                <span>NVIDIA NIM Models</span>
              </div>
              <p className="text-[11px] text-[#6E685E] mt-1">Stream Llama 3.1 70B/405B & Mixtral with API key loader.</p>
            </div>

            <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E6E1D7]">
              <div className="flex items-center space-x-2 text-xs font-bold text-[#2B2826]">
                <Database className="w-4 h-4 text-[#10B981]" />
                <span>MongoDB Connected DB</span>
              </div>
              <p className="text-[11px] text-[#6E685E] mt-1">Direct document query & insert with graceful offline fallback.</p>
            </div>

            <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E6E1D7]">
              <div className="flex items-center space-x-2 text-xs font-bold text-[#2B2826]">
                <Layers className="w-4 h-4 text-[#8B5CF6]" />
                <span>n8n Visual Workflow</span>
              </div>
              <p className="text-[11px] text-[#6E685E] mt-1">Draggable canvas nodes, sticky notes, & JSON import/export.</p>
            </div>
          </div>
        </section>

        {/* PRODUCT FLOW ARCHITECTURE DIAGRAM */}
        <section className="bg-white p-8 rounded-3xl border border-[#E6E1D7] shadow-xs">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h2 className="text-2xl font-extrabold text-[#2B2826]">End-to-End Product Architecture</h2>
            <p className="text-xs text-[#6E685E] mt-1">From owner requirement to live customer voice call and human handoff</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#E6E1D7] relative">
              <div className="w-8 h-8 rounded-xl bg-[#FDF3E9] text-[#D97757] flex items-center justify-center font-extrabold text-sm mb-3">1</div>
              <h3 className="font-extrabold text-sm text-[#2B2826]">Requirement Intake</h3>
              <p className="text-xs text-[#6E685E] mt-1">Owner types or speaks requirement. Generator LLM outputs strict JSON workforce spec.</p>
            </div>

            <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#E6E1D7] relative">
              <div className="w-8 h-8 rounded-xl bg-[#FDF3E9] text-[#D97757] flex items-center justify-center font-extrabold text-sm mb-3">2</div>
              <h3 className="font-extrabold text-sm text-[#2B2826]">Manager & Workers</h3>
              <p className="text-xs text-[#6E685E] mt-1">Manager routes intents. Specialist workers own prompt, MongoDB tools, and approval limits.</p>
            </div>

            <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#E6E1D7] relative">
              <div className="w-8 h-8 rounded-xl bg-[#FDF3E9] text-[#D97757] flex items-center justify-center font-extrabold text-sm mb-3">3</div>
              <h3 className="font-extrabold text-sm text-[#2B2826]">n8n Canvas & NVIDIA NIM</h3>
              <p className="text-xs text-[#6E685E] mt-1">Connect 25+ nodes, drag nodes freely, position sticky notes, and load NVIDIA models.</p>
            </div>

            <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#E6E1D7] relative">
              <div className="w-8 h-8 rounded-xl bg-[#FDF3E9] text-[#D97757] flex items-center justify-center font-extrabold text-sm mb-3">4</div>
              <h3 className="font-extrabold text-sm text-[#2B2826]">Human Handoff</h3>
              <p className="text-xs text-[#6E685E] mt-1">Policy limits trigger seamless supervisor takeover with full transcript and task state.</p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};
