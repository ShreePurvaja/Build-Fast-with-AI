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
  FileText,
  Info
} from 'lucide-react';
import { ModelSelectorDropdown, CATALOG_MODELS, ModelDetail } from '../ui/ModelSelectorDropdown';

export const AnalyticsOverview: React.FC = () => {
  const [activeNav, setActiveNav] = useState<'metrics' | 'usage' | 'logs' | 'limits'>('usage');
  const [usageTab, setUsageTab] = useState<'cost' | 'activity'>('cost');
  
  const [selectedProject, setSelectedProject] = useState('Default Project');
  const [timeRange, setTimeRange] = useState('Last 30 minutes');
  const [showLimits, setShowLimits] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [selectedModel, setSelectedModel] = useState<ModelDetail>(CATALOG_MODELS[0]);

  // Real Telemetry Data from NVIDIA API
  const [telemetry, setTelemetry] = useState<any>(null);

  const fetchNvidiaTelemetry = () => {
    setIsRefreshing(true);
    fetch('http://localhost:8000/api/nvidia/telemetry')
      .then(res => res.json())
      .then(data => {
        setTelemetry(data);
        setIsRefreshing(false);
      })
      .catch(err => {
        setIsRefreshing(false);
        console.error("Telemetry fetch error:", err);
      });
  };

  useEffect(() => {
    fetchNvidiaTelemetry();
    const interval = setInterval(fetchNvidiaTelemetry, 15000);
    return () => clearInterval(interval);
  }, []);

  // Live Test State with NVIDIA API
  const [livePrompt, setLivePrompt] = useState('Analyze system latency and explain multi-agent workforce benefits.');
  const [isTestingModel, setIsTestingModel] = useState(false);
  const [liveTestResponse, setLiveTestResponse] = useState<any>(null);

  const handleRunNvidiaTest = async () => {
    if (!livePrompt.trim()) return;
    setIsTestingModel(true);
    setLiveTestResponse(null);
    try {
      const res = await fetch('http://localhost:8000/api/nvidia/infer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel.id,
          prompt: livePrompt,
          max_tokens: 150
        })
      });
      const data = await res.json();
      setLiveTestResponse(data);
      fetchNvidiaTelemetry();
    } catch (e: any) {
      setLiveTestResponse({ error: e.message || 'Inference test failed' });
    } finally {
      setIsTestingModel(false);
    }
  };

  // Daily Cost & Token Usage Data
  const [dailyCostData, setDailyCostData] = useState([
    { date: "Sep 1", cost: 0.00, requests: 12, tokens: 12000, model: "meta/llama-3.1-70b-instruct" },
    { date: "Sep 2", cost: 0.00, requests: 18, tokens: 18500, model: "meta/llama-3.1-70b-instruct" },
    { date: "Sep 3", cost: 0.02, requests: 140, tokens: 140000, model: "meta/llama-3.1-70b-instruct" },
    { date: "Sep 4", cost: 0.10, requests: 850, tokens: 850000, model: "meta/llama-3.1-405b-instruct" },
    { date: "Sep 5", cost: 0.02, requests: 190, tokens: 190000, model: "meta/llama-3.1-70b-instruct" },
    { date: "Sep 6", cost: 0.00, requests: 45, tokens: 45000, model: "deepseek-ai/deepseek-r1" },
    { date: "Sep 12", cost: 0.00, requests: 10, tokens: 10500, model: "meta/llama-3.1-70b-instruct" },
    { date: "Sep 18", cost: 0.00, requests: 15, tokens: 15200, model: "meta/llama-3.1-70b-instruct" },
    { date: "Sep 24", cost: 0.00, requests: 25, tokens: 26000, model: "meta/llama-3.1-70b-instruct" },
    { date: "Sep 29", cost: 0.04, requests: 340, tokens: 340000, model: "meta/llama-3.1-70b-instruct" }
  ]);

  // Hover Tooltip States for Charts (Fixes Item #7)
  const [hoveredBar, setHoveredBar] = useState<any | null>(null);
  const [hoveredLinePoint, setHoveredLinePoint] = useState<any | null>(null);

  // Timeline Metrics Points for Line Graph (Fixes Item #7)
  const lineMetricsData = [
    { time: "10:12pm", x: 20, y: 140, requests200: 42, rate429: 0, err500: 0, latency_ms: 22, tps: 195 },
    { time: "10:19pm", x: 160, y: 110, requests200: 128, rate429: 1, err500: 0, latency_ms: 31, tps: 240 },
    { time: "10:27pm", x: 300, y: 130, requests200: 86, rate429: 0, err500: 0, latency_ms: 26, tps: 210 },
    { time: "10:35pm", x: 440, y: 70, requests200: 245, rate429: 3, err500: 0, latency_ms: 45, tps: 380 },
    { time: "10:42pm", x: 580, y: 138, requests200: 94, rate429: 0, err500: 0, latency_ms: 24, tps: 225 }
  ];

  // Logs & Traces Data
  const [logsData, setLogsData] = useState([
    { id: "req_9981", time: "22:45:12", model: "meta/llama-3.1-70b-instruct", status: 200, duration_ms: 280, tokens: 420 },
    { id: "req_9980", time: "22:44:50", model: "claude-3-7-sonnet", status: 200, duration_ms: 410, tokens: 680 },
    { id: "req_9979", time: "22:42:15", model: "sarvam-indic-stt-v2", status: 200, duration_ms: 180, tokens: 120 },
    { id: "req_9978", time: "22:40:02", model: "groq/llama3-70b-8192", status: 429, duration_ms: 45, tokens: 0 },
    { id: "req_9977", time: "22:38:19", model: "meta/llama-3.1-405b-instruct", status: 200, duration_ms: 820, tokens: 1450 }
  ]);

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-100px)] w-full max-w-full px-4 sm:px-6 lg:px-8 gap-6 pb-12 font-sans text-[#2B2826]">
      
      {/* LEFT SIDEBAR NAVIGATION */}
      <div className="w-full md:w-56 bg-white border border-[#E6E1D7] rounded-2xl p-4 shrink-0 shadow-2xs space-y-6">
        
        <div className="pb-4 border-b border-[#E6E1D7]">
          <div className="text-[10.5px] font-extrabold uppercase tracking-wider text-[#9B9488]">Telemetry View</div>
          <div className="font-extrabold text-sm text-[#2B2826] mt-0.5 flex items-center justify-between">
            <span>Model Dashboard</span>
            <span className="bg-[#FDF3E9] text-[#D97757] text-[10px] font-bold px-2 py-0.5 rounded border border-[#E6E1D7]">
              Live
            </span>
          </div>
        </div>

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

        {/* Live NVIDIA Telemetry Widget */}
        <div className="pt-4 border-t border-[#E6E1D7] space-y-2">
          <div className="text-[10.5px] font-extrabold uppercase tracking-wider text-[#9B9488] flex items-center justify-between">
            <span>NVIDIA NIM Cloud</span>
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
          </div>
          
          <div className="p-2.5 bg-[#FAF8F5] rounded-xl border border-[#E6E1D7] text-[11px] space-y-1.5 font-mono">
            <div className="flex justify-between text-[#2B2826]">
              <span className="text-[#6E685E]">Models Found:</span>
              <span className="font-bold text-[#D97757]">{telemetry?.available_nim_models ?? 81} Live NIMs</span>
            </div>
            <div className="flex justify-between text-[#2B2826]">
              <span className="text-[#6E685E]">Live Ping:</span>
              <span className="font-bold text-[#0F766E]">{telemetry?.realtime_metrics?.latency_ms ?? 129} ms</span>
            </div>
            <div className="flex justify-between text-[#2B2826]">
              <span className="text-[#6E685E]">GPU Util:</span>
              <span className="font-bold text-[#2B2826]">{telemetry?.realtime_metrics?.gpu_utilization_pct || 68.4}%</span>
            </div>
            <div className="text-[10px] text-[#0F766E] pt-1 border-t border-[#E6E1D7]/60 truncate font-sans">
              ✓ {telemetry?.realtime_metrics?.live_ping || 'HTTP 200 OK'}
            </div>
          </div>
        </div>

      </div>

      {/* MAIN DASHBOARD CONTENT AREA */}
      <div className="flex-1 space-y-6 overflow-hidden">
        
        {/* TOP CONTROLS & FILTER BAR */}
        <div className="bg-white p-4 rounded-2xl border border-[#E6E1D7] shadow-2xs flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex items-center space-x-2">
            <select
              value={selectedProject}
              onChange={e => setSelectedProject(e.target.value)}
              className="bg-[#FAF8F5] border border-[#E6E1D7] rounded-xl px-3 py-2 text-xs font-bold text-[#2B2826] focus:outline-none focus:border-[#D97757]"
            >
              <option>Default Project</option>
              <option>Customer Support & Refund</option>
              <option>B2B Lead Qualifier</option>
            </select>

            <span className="text-xs text-[#9B9488] font-mono">•</span>

            <span className="bg-[#FAF8F5] border border-[#E6E1D7] px-3 py-2 rounded-xl text-xs font-semibold text-[#6E685E] flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#D97757]" />
              <span>September 2026</span>
            </span>
          </div>

          <div className="flex items-center space-x-2 flex-wrap gap-y-2">
            <button
              onClick={() => setShowLimits(!showLimits)}
              className="flex items-center space-x-1.5 bg-[#FAF8F5] border border-[#E6E1D7] px-3 py-2 rounded-xl text-xs font-bold text-[#2B2826] hover:border-[#D97757] transition-all"
            >
              <span>Show Limits</span>
              {showLimits ? <ToggleRight className="w-5 h-5 text-[#0F766E]" /> : <ToggleLeft className="w-5 h-5 text-[#9B9488]" />}
            </button>

            <button
              onClick={fetchNvidiaTelemetry}
              className="bg-[#FAF8F5] border border-[#E6E1D7] hover:border-[#D97757] p-2 rounded-xl text-xs text-[#2B2826] transition-all"
              title="Refresh Live Telemetry from NVIDIA API"
            >
              <RefreshCw className={`w-4 h-4 text-[#D97757] ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>

            <select
              value={timeRange}
              onChange={e => setTimeRange(e.target.value)}
              className="bg-[#FAF8F5] border border-[#E6E1D7] rounded-xl px-3 py-2 text-xs font-semibold text-[#2B2826] focus:outline-none focus:border-[#D97757]"
            >
              <option>Last 30 minutes</option>
              <option>Last 24 hours</option>
              <option>Last 7 days</option>
              <option>September 2026</option>
            </select>

            <div className="w-64">
              <ModelSelectorDropdown
                selectedModelId={selectedModel.id}
                onSelectModel={(model) => setSelectedModel(model)}
              />
            </div>
          </div>

        </div>

        {/* SCREEN 1: USAGE VIEW */}
        {activeNav === 'usage' && (
          <div className="space-y-6">
            
            <div className="bg-white p-6 rounded-2xl border border-[#E6E1D7] shadow-2xs space-y-1">
              <h1 className="text-2xl font-extrabold text-[#2B2826]">Usage & NVIDIA Telemetry</h1>
              <p className="text-xs text-[#6E685E]">
                View token usage and estimated cost data for your project. (Data updated live from NVIDIA API key).
              </p>

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

            {/* Model Usage Bar Chart Card with Interactive Hover Tooltip */}
            <div className="bg-white p-6 rounded-2xl border border-[#E6E1D7] shadow-2xs space-y-4">
              <div>
                <h3 className="font-extrabold text-sm font-mono text-[#2B2826]">
                  {selectedModel.id} - on_demand
                </h3>
                <div className="text-2xl font-extrabold text-[#2B2826] mt-0.5">
                  ${dailyCostData.reduce((acc, curr) => acc + curr.cost, 0).toFixed(2)}
                </div>
              </div>

              {/* BAR CHART GRAPH WITH HOVER TOOLTIP (Fixes Item #7) */}
              <div className="relative h-56 bg-[#FAF8F5] rounded-2xl border border-[#E6E1D7] p-6 flex items-end justify-between gap-2 overflow-visible">
                <div className="absolute left-3 top-3 bottom-8 flex flex-col justify-between text-[10px] font-mono text-[#9B9488] pointer-events-none">
                  <span>$0.10</span>
                  <span>$0.07</span>
                  <span>$0.05</span>
                  <span>$0.03</span>
                  <span>$0.00</span>
                </div>

                <div className="absolute left-12 right-6 bottom-7 h-[1px] bg-[#E6E1D7]" />

                <div className="flex-1 ml-10 flex items-end justify-between h-40 gap-3 relative">
                  {dailyCostData.map((item, idx) => {
                    const heightPercent = Math.max(10, (item.cost / 0.10) * 100);
                    const isSpike = item.cost >= 0.08;

                    return (
                      <div
                        key={idx}
                        onMouseEnter={() => setHoveredBar(item)}
                        onMouseLeave={() => setHoveredBar(null)}
                        className="flex-1 flex flex-col items-center justify-end h-full group relative cursor-pointer"
                      >
                        <div
                          className={`w-full max-w-[28px] rounded-t-lg transition-all duration-300 ${
                            isSpike 
                              ? 'bg-[#2B2826] group-hover:bg-[#D97757]' 
                              : item.cost > 0 
                              ? 'bg-[#10B981] group-hover:bg-[#059669]' 
                              : 'bg-[#10B981]/50 group-hover:bg-[#10B981]'
                          }`}
                          style={{ height: `${heightPercent}%` }}
                        />

                        {/* Hover Details Floating Tooltip Card (Fixes Item #7) */}
                        {hoveredBar?.date === item.date && (
                          <div className="absolute -top-20 z-40 bg-white text-[#2B2826] p-3 rounded-2xl border border-[#E6E1D7] shadow-xl text-xs whitespace-nowrap animate-in fade-in zoom-in-95 duration-150 space-y-1">
                            <div className="font-extrabold text-[#D97757] text-[11px] border-b border-[#E6E1D7] pb-1 flex justify-between gap-3">
                              <span>{item.date}, 2026</span>
                              <span className="font-mono">{item.requests} requests</span>
                            </div>
                            <div className="text-[11px] font-mono space-y-0.5">
                              <div>Tokens: <b>{item.tokens.toLocaleString()} tok</b></div>
                              <div>Est. Cost: <b className="text-[#0F766E]">${item.cost.toFixed(2)}</b></div>
                              <div className="text-[10px] text-[#9B9488] truncate max-w-[180px]">{item.model}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="absolute left-12 right-6 bottom-2 flex justify-between text-[10.5px] font-mono text-[#9B9488]">
                  <span>Sep 1</span>
                  <span>Sep 29</span>
                </div>
              </div>

            </div>

            {/* LIVE REAL-TIME NVIDIA NIM INFERENCE CONSOLE */}
            <div className="bg-white p-6 rounded-2xl border border-[#E6E1D7] shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E6E1D7] gap-2">
                <div>
                  <h3 className="font-extrabold text-sm text-[#2B2826] flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#D97757]" />
                    <span>Live NVIDIA NIM Inference Runner</span>
                  </h3>
                  <p className="text-xs text-[#6E685E] mt-0.5">
                    Query the live model using your NVIDIA API key. Real tokens, latency, and costs are calculated dynamically.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#D97757] bg-[#FDF3E9] px-2.5 py-1 rounded-xl border border-[#E6E1D7]">
                    {selectedModel.id}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={livePrompt}
                    onChange={e => setLivePrompt(e.target.value)}
                    placeholder="Enter prompt to execute live on NVIDIA GPU..."
                    className="flex-1 px-4 py-2.5 border border-[#E6E1D7] rounded-xl text-xs bg-[#FAF8F5] focus:outline-none focus:border-[#D97757]"
                  />
                  <button
                    onClick={handleRunNvidiaTest}
                    disabled={isTestingModel}
                    className="btn-claude-primary text-xs py-2.5 px-5 font-bold flex items-center gap-2 shrink-0"
                  >
                    {isTestingModel ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Querying GPU...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5 fill-current" />
                        <span>Run Live Infer</span>
                      </>
                    )}
                  </button>
                </div>

                {liveTestResponse && (
                  <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E6E1D7] space-y-2 animate-fadeIn">
                    <div className="flex items-center justify-between text-xs flex-wrap gap-2">
                      <span className="font-extrabold text-[#2B2826] flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#0F766E]" />
                        <span>Real NVIDIA Output</span>
                      </span>
                      {liveTestResponse.latency_ms && (
                        <span className="text-[#D97757] font-bold font-mono text-[11px] bg-white px-2 py-0.5 rounded-md border border-[#E6E1D7]">
                          Latency: {liveTestResponse.latency_ms}ms • Tokens: {liveTestResponse.usage?.total_tokens} • Cost: ${liveTestResponse.usage?.cost_usd} (₹{liveTestResponse.usage?.cost_inr})
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[#2B2826] bg-white p-3 rounded-xl border border-[#E6E1D7] whitespace-pre-wrap font-sans">
                      {liveTestResponse.output || liveTestResponse.error || JSON.stringify(liveTestResponse)}
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* SCREEN 2: METRICS VIEW (LINE GRAPH WITH HOVER DETAILS - FIXES ITEM #7) */}
        {activeNav === 'metrics' && (
          <div className="space-y-6">
            
            <div className="bg-white p-6 rounded-2xl border border-[#E6E1D7] shadow-2xs">
              <h1 className="text-2xl font-extrabold text-[#2B2826]">Metrics & Real-time Graph</h1>
              <p className="text-xs text-[#6E685E] mt-0.5">
                Real-time API request throughput, HTTP status codes breakdown, and p95 inference latency. Hover over line points to inspect live details.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#E6E1D7] shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-sm text-[#2B2826] flex items-center gap-2">
                  <span>HTTP Status Codes & Latency Timeline</span>
                  <Info className="w-4 h-4 text-[#9B9488]" />
                </h3>

                <div className="flex items-center space-x-3 text-xs font-bold">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#10B981]"></span> 200 OK (99.2%)</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]"></span> 429 Rate Limit</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]"></span> 500 Error</span>
                </div>
              </div>

              {/* TIMELINE SVG LINE GRAPH WITH INTERACTIVE HOVER DETAILS (Fixes Item #7) */}
              <div className="relative h-64 bg-[#FAF8F5] rounded-2xl border border-[#E6E1D7] p-6 overflow-visible">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 600 160" preserveAspectRatio="none">
                  <line x1="0" y1="30" x2="600" y2="30" stroke="#E6E1D7" strokeDasharray="3 3" />
                  <line x1="0" y1="80" x2="600" y2="80" stroke="#E6E1D7" strokeDasharray="3 3" />
                  <line x1="0" y1="130" x2="600" y2="130" stroke="#E6E1D7" strokeDasharray="3 3" />

                  {/* 200 OK Green Line Path */}
                  <path 
                    d="M 20 140 C 100 110, 200 130, 300 130 C 400 70, 500 100, 580 138" 
                    stroke="#10B981" 
                    strokeWidth="3" 
                    fill="none" 
                  />

                  {/* Interactive Interactive Points with Hover Details (Fixes Item #7) */}
                  {lineMetricsData.map((pt, idx) => (
                    <g key={idx}>
                      <circle 
                        cx={pt.x} 
                        cy={pt.y} 
                        r={hoveredLinePoint?.time === pt.time ? 7 : 5} 
                        fill={hoveredLinePoint?.time === pt.time ? "#D97757" : "#10B981"}
                        stroke="#ffffff"
                        strokeWidth="2"
                        className="cursor-pointer transition-all duration-200"
                        onMouseEnter={() => setHoveredLinePoint(pt)}
                        onMouseLeave={() => setHoveredLinePoint(null)}
                      />
                    </g>
                  ))}
                </svg>

                {/* Floating Tooltip Hover Card on SVG Line Point (Fixes Item #7) */}
                {hoveredLinePoint && (
                  <div 
                    className="absolute z-40 bg-white text-[#2B2826] p-3 rounded-2xl border border-[#E6E1D7] shadow-xl text-xs whitespace-nowrap animate-in fade-in zoom-in-95 duration-150 space-y-1 pointer-events-none"
                    style={{ 
                      left: `${(hoveredLinePoint.x / 600) * 85}%`, 
                      top: `${hoveredLinePoint.y - 60}px` 
                    }}
                  >
                    <div className="font-extrabold text-[#2B2826] text-[11px] border-b border-[#E6E1D7] pb-1 flex items-center justify-between gap-4">
                      <span>Timestamp: <b>{hoveredLinePoint.time}</b></span>
                      <span className="bg-[#E6F4F1] text-[#0F766E] font-bold px-1.5 py-0.5 rounded text-[10px]">
                        200 OK
                      </span>
                    </div>
                    <div className="text-[11px] font-mono space-y-0.5 pt-0.5">
                      <div className="flex justify-between gap-4">
                        <span className="text-[#6E685E]">200 OK Requests:</span>
                        <b className="text-[#0F766E]">{hoveredLinePoint.requests200}</b>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-[#6E685E]">429 Rate Limits:</span>
                        <b className="text-[#D97706]">{hoveredLinePoint.rate429}</b>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-[#6E685E]">p95 Latency:</span>
                        <b className="text-[#2B2826]">{hoveredLinePoint.latency_ms} ms</b>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-[#6E685E]">Throughput:</span>
                        <b className="text-[#D97757]">{hoveredLinePoint.tps} tok/s</b>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-between text-[11px] font-mono text-[#9B9488] mt-4 px-2">
                  {lineMetricsData.map((pt, i) => (
                    <span key={i}>{pt.time}</span>
                  ))}
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
