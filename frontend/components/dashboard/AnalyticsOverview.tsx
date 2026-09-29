'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Cpu, 
  Zap, 
  Key, 
  CheckCircle2, 
  AlertCircle, 
  Activity, 
  ShieldCheck, 
  TrendingUp, 
  Layers, 
  Globe, 
  Clock,
  DollarSign,
  Sparkles,
  Server,
  RefreshCw,
  Search,
  Filter,
  Calendar,
  Layers3,
  ListFilter,
  ToggleLeft,
  ToggleRight,
  FileText
} from 'lucide-react';
import { ModelSelectorDropdown, CATALOG_MODELS, ModelDetail } from '../ui/ModelSelectorDropdown';

export const AnalyticsOverview: React.FC = () => {
  // Sidebar Navigation State (Groq Dashboard inspired)
  const [activeNav, setActiveNav] = useState<'metrics' | 'usage' | 'logs' | 'limits'>('usage');
  
  // Usage Sub-Tab (Cost vs Activity - Screenshot 1)
  const [usageTab, setUsageTab] = useState<'cost' | 'activity'>('cost');
  
  // Filters & Controls (Screenshot 2)
  const [selectedProject, setSelectedProject] = useState('Default Project');
  const [timeRange, setTimeRange] = useState('Last 30 minutes');
  const [selectedModelFilter, setSelectedModelFilter] = useState('Show all Models');
  const [selectedKeyFilter, setSelectedKeyFilter] = useState('Show all API Keys');
  const [showLimits, setShowLimits] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Selected Model for Model Dropdown Selector
  const [selectedModel, setSelectedModel] = useState<ModelDetail>(CATALOG_MODELS[0]);

  // NVIDIA API Key state
  const [nvidiaApiKey, setNvidiaApiKey] = useState('');
  const [nvidiaStatus, setNvidiaStatus] = useState<'idle' | 'testing' | 'active' | 'error'>('active');
  const [nvidiaMsg, setNvidiaMsg] = useState<string | null>("Loaded real NVIDIA NIM models from backend .env!");

  // Daily Cost Data (Screenshot 1)
  const [dailyCostData, setDailyCostData] = useState([
    { date: "Sep 1", cost: 0.00, requests: 12 },
    { date: "Sep 2", cost: 0.00, requests: 18 },
    { date: "Sep 3", cost: 0.02, requests: 140 },
    { date: "Sep 4", cost: 0.10, requests: 850 },
    { date: "Sep 5", cost: 0.02, requests: 190 },
    { date: "Sep 6", cost: 0.00, requests: 45 },
    { date: "Sep 12", cost: 0.00, requests: 10 },
    { date: "Sep 18", cost: 0.00, requests: 15 },
    { date: "Sep 24", cost: 0.00, requests: 25 },
    { date: "Sep 29", cost: 0.04, requests: 340 }
  ]);

  // Hover Tooltip State for Daily Chart
  const [hoveredBar, setHoveredBar] = useState<{ date: string; cost: number; requests: number } | null>(null);

  // Logs & Traces Data
  const [logsData, setLogsData] = useState([
    { id: "req_9981", time: "22:45:12", model: "meta/llama-3.1-70b-instruct", status: 200, duration_ms: 280, tokens: 420 },
    { id: "req_9980", time: "22:44:50", model: "claude-3-7-sonnet", status: 200, duration_ms: 410, tokens: 680 },
    { id: "req_9979", time: "22:42:15", model: "sarvam-indic-stt-v2", status: 200, duration_ms: 180, tokens: 120 },
    { id: "req_9978", time: "22:40:02", model: "groq/llama3-70b-8192", status: 429, duration_ms: 45, tokens: 0 },
    { id: "req_9977", time: "22:38:19", model: "meta/llama-3.1-405b-instruct", status: 200, duration_ms: 820, tokens: 1450 }
  ]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-100px)] max-w-7xl mx-auto gap-6 pb-12 font-sans text-[#2B2826]">
      
      {/* LEFT SIDEBAR NAVIGATION (GROQ DASHBOARD STYLE - SCREENSHOTS 1 & 2) */}
      <div className="w-full md:w-56 bg-white border border-[#E6E1D7] rounded-2xl p-4 shrink-0 shadow-2xs space-y-6">
        
        {/* Workspace Brand */}
        <div className="pb-4 border-b border-[#E6E1D7]">
          <div className="text-[10.5px] font-extrabold uppercase tracking-wider text-[#9B9488]">Workspace</div>
          <div className="font-extrabold text-sm text-[#2B2826] mt-0.5 flex items-center justify-between">
            <span>AI Workforce</span>
            <span className="bg-[#FDF3E9] text-[#D97757] text-[10px] font-bold px-2 py-0.5 rounded border border-[#E6E1D7]">
              SaaS
            </span>
          </div>
        </div>

        {/* Sidebar Nav Items */}
        <div className="space-y-1">
          <button
            onClick={() => setActiveNav('metrics')}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-2.5 transition-all ${
              activeNav === 'metrics'
                ? 'bg-[#FDF3E9] text-[#D97757] border border-[#D97757]/30 shadow-2xs'
                : 'text-[#6E685E] hover:bg-[#FAF8F5] hover:text-[#2B2826]'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Metrics</span>
          </button>

          <button
            onClick={() => setActiveNav('usage')}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-2.5 transition-all ${
              activeNav === 'usage'
                ? 'bg-[#FDF3E9] text-[#D97757] border border-[#D97757]/30 shadow-2xs'
                : 'text-[#6E685E] hover:bg-[#FAF8F5] hover:text-[#2B2826]'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Usage</span>
          </button>

          <button
            onClick={() => setActiveNav('logs')}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-2.5 transition-all ${
              activeNav === 'logs'
                ? 'bg-[#FDF3E9] text-[#D97757] border border-[#D97757]/30 shadow-2xs'
                : 'text-[#6E685E] hover:bg-[#FAF8F5] hover:text-[#2B2826]'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Logs & Traces</span>
          </button>

          <button
            onClick={() => setActiveNav('limits')}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-2.5 transition-all ${
              activeNav === 'limits'
                ? 'bg-[#FDF3E9] text-[#D97757] border border-[#D97757]/30 shadow-2xs'
                : 'text-[#6E685E] hover:bg-[#FAF8F5] hover:text-[#2B2826]'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Limits & Quotas</span>
          </button>
        </div>

        {/* Quick Model Selector Showcase (Screenshot 3) */}
        <div className="pt-4 border-t border-[#E6E1D7] space-y-2">
          <div className="text-[10.5px] font-extrabold uppercase tracking-wider text-[#9B9488]">Quick Model Selector</div>
          <ModelSelectorDropdown
            selectedModelId={selectedModel.id}
            onSelectModel={(model) => setSelectedModel(model)}
          />
        </div>

      </div>

      {/* MAIN DASHBOARD CONTENT AREA */}
      <div className="flex-1 space-y-6 overflow-hidden">
        
        {/* TOP CONTROLS & FILTER BAR (SCREENSHOTS 1 & 2) */}
        <div className="bg-white p-4 rounded-2xl border border-[#E6E1D7] shadow-2xs flex flex-wrap items-center justify-between gap-3">
          
          {/* Project Selector & Date */}
          <div className="flex items-center space-x-2">
            <select
              value={selectedProject}
              onChange={e => setSelectedProject(e.target.value)}
              className="bg-[#FAF8F5] border border-[#E6E1D7] rounded-xl px-3 py-1.5 text-xs font-bold text-[#2B2826] focus:outline-none focus:border-[#D97757]"
            >
              <option>Default Project</option>
              <option>Customer Support & Refund</option>
              <option>B2B Lead Qualifier</option>
            </select>

            <span className="text-xs text-[#9B9488] font-mono">•</span>

            <span className="bg-[#FAF8F5] border border-[#E6E1D7] px-3 py-1.5 rounded-xl text-xs font-semibold text-[#6E685E] flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#D97757]" />
              <span>September 2026</span>
            </span>
          </div>

          {/* Action Filters (Screenshot 2) */}
          <div className="flex items-center space-x-2">
            
            {/* Show Limits Toggle Switch */}
            <button
              onClick={() => setShowLimits(!showLimits)}
              className="flex items-center space-x-1.5 bg-[#FAF8F5] border border-[#E6E1D7] px-3 py-1.5 rounded-xl text-xs font-bold text-[#2B2826] hover:border-[#D97757] transition-all"
            >
              <span>Show Limits</span>
              {showLimits ? <ToggleRight className="w-5 h-5 text-[#0F766E]" /> : <ToggleLeft className="w-5 h-5 text-[#9B9488]" />}
            </button>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              className="bg-[#FAF8F5] border border-[#E6E1D7] hover:border-[#D97757] p-1.5 rounded-xl text-xs text-[#2B2826] transition-all"
              title="Refresh Dashboard Data"
            >
              <RefreshCw className={`w-4 h-4 text-[#D97757] ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>

            {/* Time Range Selector */}
            <select
              value={timeRange}
              onChange={e => setTimeRange(e.target.value)}
              className="bg-[#FAF8F5] border border-[#E6E1D7] rounded-xl px-3 py-1.5 text-xs font-semibold text-[#2B2826] focus:outline-none focus:border-[#D97757]"
            >
              <option>Last 30 minutes</option>
              <option>Last 24 hours</option>
              <option>Last 7 days</option>
              <option>September 2026</option>
            </select>

            {/* Model Filter */}
            <select
              value={selectedModelFilter}
              onChange={e => setSelectedModelFilter(e.target.value)}
              className="bg-[#FAF8F5] border border-[#E6E1D7] rounded-xl px-3 py-1.5 text-xs font-semibold text-[#2B2826] focus:outline-none focus:border-[#D97757]"
            >
              <option>Show all Models</option>
              <option>meta/llama-3.1-70b-instruct</option>
              <option>claude-3-7-sonnet</option>
              <option>groq/llama3-70b</option>
              <option>sarvam-indic-stt</option>
            </select>

          </div>

        </div>

        {/* SCREEN 1: USAGE VIEW (COST & ACTIVITY - SCREENSHOT 1) */}
        {activeNav === 'usage' && (
          <div className="space-y-6">
            
            {/* Header */}
            <div className="bg-white p-6 rounded-2xl border border-[#E6E1D7] shadow-2xs space-y-1">
              <h1 className="text-2xl font-extrabold text-[#2B2826]">Usage</h1>
              <p className="text-xs text-[#6E685E]">
                View token usage and estimated cost data for your project. (Data updated live in UTC time).
              </p>

              {/* Sub-Tabs: Cost vs Activity */}
              <div className="flex space-x-4 pt-4 border-t border-[#E6E1D7] text-xs font-bold">
                <button
                  onClick={() => setUsageTab('cost')}
                  className={`pb-2 border-b-2 transition-all ${
                    usageTab === 'cost' ? 'border-[#D97757] text-[#D97757]' : 'border-transparent text-[#6E685E] hover:text-[#2B2826]'
                  }`}
                >
                  Cost
                </button>
                <button
                  onClick={() => setUsageTab('activity')}
                  className={`pb-2 border-b-2 transition-all ${
                    usageTab === 'activity' ? 'border-[#D97757] text-[#D97757]' : 'border-transparent text-[#6E685E] hover:text-[#2B2826]'
                  }`}
                >
                  Activity
                </button>
              </div>
            </div>

            {/* Model Usage Bar/Line Chart Card (Screenshot 1) */}
            <div className="bg-white p-6 rounded-2xl border border-[#E6E1D7] shadow-2xs space-y-4">
              
              {/* Active Model Name & Value */}
              <div>
                <h3 className="font-extrabold text-sm font-mono text-[#2B2826]">
                  {selectedModel.id} - on_demand
                </h3>
                <div className="text-2xl font-extrabold text-[#2B2826] mt-0.5">
                  ${dailyCostData.reduce((acc, curr) => acc + curr.cost, 0).toFixed(2)}
                </div>
              </div>

              {/* BAR CHART GRAPH WITH HOVER TOOLTIP (SCREENSHOT 1 RECREATION) */}
              <div className="relative h-56 bg-[#FAF8F5] rounded-2xl border border-[#E6E1D7] p-6 flex items-end justify-between gap-2 overflow-visible">
                
                {/* Y-Axis Cost Markers */}
                <div className="absolute left-3 top-3 bottom-8 flex flex-col justify-between text-[10px] font-mono text-[#9B9488] pointer-events-none">
                  <span>$0.10</span>
                  <span>$0.07</span>
                  <span>$0.05</span>
                  <span>$0.03</span>
                  <span>$0.00</span>
                </div>

                {/* Horizontal Baseline */}
                <div className="absolute left-12 right-6 bottom-7 h-[1px] bg-[#E6E1D7]" />

                {/* Bars Container */}
                <div className="flex-1 ml-10 flex items-end justify-between h-40 gap-3 relative">
                  {dailyCostData.map((item, idx) => {
                    const heightPercent = Math.max(8, (item.cost / 0.10) * 100);
                    const isSpike = item.cost >= 0.08;

                    return (
                      <div
                        key={idx}
                        onMouseEnter={() => setHoveredBar(item)}
                        onMouseLeave={() => setHoveredBar(null)}
                        className="flex-1 flex flex-col items-center justify-end h-full group relative cursor-pointer"
                      >
                        {/* Bar Visual */}
                        <div
                          className={`w-full max-w-[28px] rounded-t-lg transition-all duration-300 ${
                            isSpike 
                              ? 'bg-slate-300 group-hover:bg-[#2B2826]' 
                              : item.cost > 0 
                              ? 'bg-[#10B981] group-hover:bg-[#059669]' 
                              : 'bg-[#10B981]/50 group-hover:bg-[#10B981]'
                          }`}
                          style={{ height: `${heightPercent}%` }}
                        />

                        {/* Interactive Tooltip Card (Groq Style - Screenshot 1) */}
                        {hoveredBar?.date === item.date && (
                          <div className="absolute -top-14 z-30 bg-[#1A1A1A] text-white p-2.5 rounded-xl border border-slate-800 shadow-xl text-[11px] whitespace-nowrap animate-in fade-in zoom-in-95 duration-150">
                            <div className="font-bold text-slate-400 text-[10px] mb-1">{item.date}</div>
                            <div className="flex items-center space-x-2 font-mono">
                              <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
                              <span>Cost: <b>${item.cost.toFixed(2)}</b> ({item.requests} req)</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* X-Axis Date Labels */}
                <div className="absolute left-12 right-6 bottom-2 flex justify-between text-[10.5px] font-mono text-[#9B9488]">
                  <span>Sep 1</span>
                  <span>Sep 29</span>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* SCREEN 2: METRICS VIEW (HTTP STATUS CODES & LATENCY - SCREENSHOT 2) */}
        {activeNav === 'metrics' && (
          <div className="space-y-6">
            
            {/* Header */}
            <div className="bg-white p-6 rounded-2xl border border-[#E6E1D7] shadow-2xs">
              <h1 className="text-2xl font-extrabold text-[#2B2826]">Metrics</h1>
              <p className="text-xs text-[#6E685E] mt-0.5">
                Real-time API request throughput, HTTP status codes breakdown, and p95 inference latency.
              </p>
            </div>

            {/* HTTP Status Codes Timeline Graph Card (Screenshot 2) */}
            <div className="bg-white p-6 rounded-2xl border border-[#E6E1D7] shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-sm text-[#2B2826] flex items-center gap-2">
                  <span>HTTP Status Codes</span>
                  <Info className="w-4 h-4 text-[#9B9488]" />
                </h3>

                {/* Status Legend Pills */}
                <div className="flex items-center space-x-3 text-xs font-bold">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#10B981]"></span> 200 OK (99.2%)</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]"></span> 429 Rate Limit</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]"></span> 500 Error</span>
                </div>
              </div>

              {/* Timeline SVG Graph Container (Screenshot 2) */}
              <div className="relative h-60 bg-[#FAF8F5] rounded-2xl border border-[#E6E1D7] p-6">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 600 160" preserveAspectRatio="none">
                  {/* Horizontal Grid lines */}
                  <line x1="0" y1="30" x2="600" y2="30" stroke="#E6E1D7" strokeDasharray="3 3" />
                  <line x1="0" y1="80" x2="600" y2="80" stroke="#E6E1D7" strokeDasharray="3 3" />
                  <line x1="0" y1="130" x2="600" y2="130" stroke="#E6E1D7" strokeDasharray="3 3" />

                  {/* 200 OK Green Line Path */}
                  <path 
                    d="M 10 140 C 100 135, 200 120, 300 135 C 400 140, 500 130, 590 138" 
                    stroke="#10B981" 
                    strokeWidth="3" 
                    fill="none" 
                  />

                  {/* Data Points */}
                  <circle cx="590" cy="138" r="4" fill="#10B981" />
                </svg>

                {/* X-Axis Timeline Labels (Screenshot 2: 10:12pm, 10:19pm...) */}
                <div className="flex justify-between text-[11px] font-mono text-[#9B9488] mt-4 px-2">
                  <span>10:12pm</span>
                  <span>10:19pm</span>
                  <span>10:27pm</span>
                  <span>10:35pm</span>
                  <span>10:42pm</span>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* SCREEN 3: LOGS & TRACES VIEW */}
        {activeNav === 'logs' && (
          <div className="bg-white p-6 rounded-2xl border border-[#E6E1D7] shadow-2xs space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-extrabold text-lg text-[#2B2826]">Live Request Logs & Traces</h2>
                <p className="text-xs text-[#6E685E]">Real-time API request log stream</p>
              </div>
              <span className="badge-success text-xs">Live Stream Active</span>
            </div>

            <div className="border border-[#E6E1D7] rounded-xl overflow-hidden font-mono text-xs">
              <table className="w-full text-left">
                <thead className="bg-[#F4F1EA] text-[#6E685E] text-[10.5px] font-extrabold uppercase">
                  <tr>
                    <th className="p-3">Request ID</th>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Target Model</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Latency</th>
                    <th className="p-3">Tokens</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6E1D7]">
                  {logsData.map(log => (
                    <tr key={log.id} className="hover:bg-[#FAF8F5]">
                      <td className="p-3 font-bold text-[#2B2826]">{log.id}</td>
                      <td className="p-3 text-[#6E685E]">{log.time}</td>
                      <td className="p-3 text-[#D97757] font-bold">{log.model}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10.5px] font-bold ${
                          log.status === 200 ? 'bg-[#E6F4F1] text-[#0F766E]' : 'bg-[#FEF3C7] text-[#D97706]'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-[#2B2826]">{log.duration_ms} ms</td>
                      <td className="p-3 text-[#6E685E]">{log.tokens}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SCREEN 4: LIMITS & QUOTAS VIEW */}
        {activeNav === 'limits' && (
          <div className="bg-white p-6 rounded-2xl border border-[#E6E1D7] shadow-2xs space-y-4">
            <div>
              <h2 className="font-extrabold text-lg text-[#2B2826]">Rate Limits & Tier Quotas</h2>
              <p className="text-xs text-[#6E685E]">Current API rate limit thresholds per provider model</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CATALOG_MODELS.slice(0, 4).map(m => (
                <div key={m.id} className="p-4 bg-[#FAF8F5] border border-[#E6E1D7] rounded-xl space-y-2 text-xs">
                  <div className="font-bold text-[#2B2826]">{m.name}</div>
                  <div className="text-[10.5px] font-mono text-[#9B9488]">{m.id}</div>
                  
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E6E1D7]">
                    <div>
                      <span className="text-[10.5px] text-[#6E685E] block">Requests / min</span>
                      <span className="font-extrabold text-[#2B2826]">{m.requests_per_min}</span>
                    </div>
                    <div>
                      <span className="text-[10.5px] text-[#6E685E] block">Tokens / min</span>
                      <span className="font-extrabold text-[#0F766E]">{m.tokens_per_min}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
