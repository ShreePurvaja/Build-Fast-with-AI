'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  FolderKanban, 
  Sparkles, 
  Plus, 
  Search, 
  ChevronRight, 
  Globe, 
  X,
  Workflow,
  User,
  SlidersHorizontal,
  RefreshCw,
  Mic,
  MicOff,
  Square,
  CheckCircle2,
  Volume2,
  AlertCircle
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  vertical: string;
  languages: string[];
  description: string;
  active_workforces: number;
  total_executions: number;
  success_rate: string;
  status: string;
  updated_at: string;
  nodes?: any[];
  connections?: any[];
  sticky_notes?: any[];
  vector_id?: string;
  vector_status?: string;
  retrieval_metadata?: {
    matched: boolean;
    scenario?: string;
    similarity_score: number;
    threshold: number;
    action: string;
    source: string;
  };
}

interface ProjectsOverviewProps {
  projects: Project[];
  onOpenCanvas: (proj: Project) => void;
  onOpenWorkflowDashboard?: (proj: Project) => void;
  onCreateProject: (newProj: any) => void;
}

export const ProjectsOverview: React.FC<ProjectsOverviewProps> = ({ 
  projects, 
  onOpenCanvas, 
  onOpenWorkflowDashboard,
  onCreateProject 
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [projectList, setProjectList] = useState<Project[]>(projects);
  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortBy] = useState<'updated' | 'name' | 'created'>('updated');

  // Form Fields for New Project
  const [projName, setProjName] = useState('');
  const [projVertical, setProjVertical] = useState('D2C E-commerce');
  const [projLanguages, setProjLanguages] = useState<string[]>(['ta', 'hi', 'en']);
  const [projPrompt, setProjPrompt] = useState('');

  // Sarvam AI Voice Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [voiceLanguage, setVoiceLanguage] = useState('unknown');
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [voiceSuccess, setVoiceSuccess] = useState<string | null>(null);

  // Workflow Retrieval Knowledge Base Preview State
  const [retrievalPreview, setRetrievalPreview] = useState<{
    matched: boolean;
    scenario: string | null;
    similarity_score: number;
    threshold: number;
    action: string;
  } | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);

  // Clean up recording timer on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  // Debounced Knowledge Base Vector Retrieval Preview (Step 13)
  useEffect(() => {
    const combinedReq = `${projName} ${projPrompt}`.trim();
    if (combinedReq.length < 5) {
      setRetrievalPreview(null);
      return;
    }
    const timer = setTimeout(() => {
      fetch(`${API_BASE_URL}/api/workflow/retrieve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requirement: combinedReq })
      })
        .then(res => res.json())
        .then(data => {
          if (data && typeof data.matched === 'boolean') {
            setRetrievalPreview(data);
          }
        })
        .catch(() => {});
    }, 350);
    return () => clearTimeout(timer);
  }, [projPrompt, projName]);

  const startVoiceRecording = async () => {
    setVoiceError(null);
    setVoiceSuccess(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') 
        ? 'audio/webm' 
        : MediaRecorder.isTypeSupported('audio/mp4') 
        ? 'audio/mp4' 
        : '';
        
      const mediaRecorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Stop audio hardware tracks
        stream.getTracks().forEach(track => track.stop());
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        setRecordingSeconds(0);
        setIsRecording(false);

        const rawMime = (mediaRecorder.mimeType || 'audio/webm').split(';')[0].trim() || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: rawMime });

        if (audioBlob.size < 500) {
          setVoiceError("Audio was too short. Please speak clearly into your microphone.");
          return;
        }

        setIsTranscribing(true);
        const formData = new FormData();
        formData.append('file', audioBlob, 'speech_input.webm');
        if (voiceLanguage && voiceLanguage !== 'unknown') {
          formData.append('language_code', voiceLanguage);
        }

        try {
          const res = await fetch(`${API_BASE_URL}/api/sarvam/transcribe`, {
            method: 'POST',
            body: formData
          });
          const data = await res.json();
          setIsTranscribing(false);

          if (data.success && data.transcript) {
            const newTranscript = data.transcript.trim();
            setProjPrompt(prev => prev ? `${prev} ${newTranscript}` : newTranscript);
            setVoiceSuccess(`Transcribed via Sarvam AI (${data.language_code || 'Indic'})`);

            // Auto-fill workflow name if currently blank
            if (!projName.trim()) {
              const words = newTranscript.split(' ').slice(0, 5).join(' ');
              setProjName(words.charAt(0).toUpperCase() + words.slice(1));
            }

            // If Tamil or Hindi detected, ensure it's prioritized in languages
            if (data.language_code === 'ta-IN' && !projLanguages.includes('ta')) {
              setProjLanguages(prev => ['ta', ...prev]);
            } else if (data.language_code === 'hi-IN' && !projLanguages.includes('hi')) {
              setProjLanguages(prev => ['hi', ...prev]);
            }
          } else {
            setVoiceError(data.detail || "Could not recognize speech. Please try speaking again.");
          }
        } catch (err: any) {
          setIsTranscribing(false);
          setVoiceError("Failed to communicate with Sarvam AI transcription service.");
        }
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      setRecordingSeconds(0);
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);

    } catch (err: any) {
      setVoiceError("Microphone access denied. Please allow microphone permissions in your browser.");
      setIsRecording(false);
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const cancelVoiceRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
    }
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setIsRecording(false);
    setRecordingSeconds(0);
  };

  // Fetch workflows from SQLite Backend for the currently logged in user!
  const fetchWorkflowsFromDB = () => {
    setIsLoading(true);
    const token = localStorage.getItem('access_token');
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    fetch(`${API_BASE_URL}/api/workflows`, { headers })
      .then(res => res.json())
      .then(data => {
        setIsLoading(false);
        if (data && (data.workflows || data.projects)) {
          setProjectList(data.workflows || data.projects);
        }
      })
      .catch(err => {
        setIsLoading(false);
        console.error("Failed to fetch workflows from SQLite DB:", err);
      });
  };

  useEffect(() => {
    fetchWorkflowsFromDB();
  }, []);

  // PERSIST ACTIVE/INACTIVE STATUS TO SQLITE DB
  const handleToggleStatus = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const targetProj = projectList.find(p => p.id === id);
    if (!targetProj) return;

    const newStatus = targetProj.status === 'Active' ? 'Inactive' : 'Active';

    setProjectList(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, status: newStatus };
      }
      return p;
    }));

    const token = localStorage.getItem('access_token');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    fetch(`${API_BASE_URL}/api/workflows/${id}/status`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ status: newStatus })
    }).catch(err => console.error("Error updating workflow status in SQLite:", err));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projName.trim()) return;

    const token = localStorage.getItem('access_token');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const newProj: Project = {
      id: `proj_${Date.now()}`,
      name: projName,
      vertical: projVertical,
      languages: projLanguages,
      description: projPrompt || 'Automated multi-agent workforce pipeline for business tasks.',
      active_workforces: 1,
      total_executions: 0,
      success_rate: '100%',
      status: 'Active',
      updated_at: 'Just now'
    };

    fetch(`${API_BASE_URL}/api/workflows`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: projName,
        vertical: projVertical,
        description: projPrompt,
        status: 'Active',
        nodes: [],
        connections: [],
        sticky_notes: []
      })
    })
      .then(res => res.json())
      .then(data => {
        const createdWf: Project = data.workflow 
          ? { ...data.workflow } 
          : { ...newProj, id: data.workflow_id || newProj.id };
        onCreateProject(createdWf);
        setProjectList(prev => [createdWf, ...prev.filter(p => p.id !== createdWf.id)]);
        setShowCreateModal(false);
        setProjName('');
        setProjPrompt('');
      })
      .catch(() => {
        onCreateProject(newProj);
        setProjectList(prev => [newProj, ...prev]);
        setShowCreateModal(false);
        setProjName('');
        setProjPrompt('');
      });
  };

  const getUpdateWeight = (val?: string) => {
    if (!val) return 999999;
    const str = val.toLowerCase();
    if (str.includes('just now') || str.includes('second')) return 0;
    const matchMin = str.match(/(\d+)\s*min/);
    if (matchMin) return parseInt(matchMin[1], 10);
    const matchHr = str.match(/(\d+)\s*hour/);
    if (matchHr) return parseInt(matchHr[1], 10) * 60;
    const matchDay = str.match(/(\d+)\s*day/);
    if (matchDay) return parseInt(matchDay[1], 10) * 1440;
    const parsed = Date.parse(val);
    if (!isNaN(parsed)) return -parsed;
    return 999999;
  };

  const filteredProjects = [...projectList]
    .filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.vertical.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a: any, b: any) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
      }
      if (sortBy === 'created') {
        const timeA = typeof a.created_at === 'number' ? a.created_at : (Date.parse(a.created_at || '0') || 0);
        const timeB = typeof b.created_at === 'number' ? b.created_at : (Date.parse(b.created_at || '0') || 0);
        return timeB - timeA;
      }
      // 'updated' default: most recent first
      const weightA = getUpdateWeight(a.updated_at);
      const weightB = getUpdateWeight(b.updated_at);
      if (weightA !== weightB) return weightA - weightB;
      const timeA = typeof a.created_at === 'number' ? a.created_at : 0;
      const timeB = typeof b.created_at === 'number' ? b.created_at : 0;
      return timeB - timeA;
    });

  return (
    <div className="space-y-6 w-full max-w-full font-sans text-[#2B2826] pb-10">
      
      {/* 1. HEADER & PRIMARY WORKFLOW ACTION BUTTON (n8n Dashboard Layout) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E6E1D7] pb-5">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#2B2826]">Overview</h1>
          <p className="text-xs text-[#6E685E] mt-1 font-medium">
            Active multi-agent voice workflows and AI reasoning pipelines for Gowtham D
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button 
            onClick={fetchWorkflowsFromDB}
            className="p-2.5 bg-white border border-[#E6E1D7] hover:border-[#D97757] rounded-xl text-xs font-bold text-[#6E685E] transition-all shadow-2xs"
            title="Refresh workflows from database"
          >
            <RefreshCw className={`w-4 h-4 text-[#D97757] ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button 
            onClick={() => setShowCreateModal(true)}
            className="btn-claude-primary text-xs py-2.5 px-4.5 rounded-xl flex items-center space-x-2 font-extrabold shrink-0 shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>Create Workflow</span>
          </button>
        </div>
      </div>

      {/* 2. STAT METRIC CARDS ROW (5 Stat Cards in 1 Row) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 bg-white p-4 rounded-2xl border border-[#E6E1D7] shadow-2xs">
        <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E6E1D7]/70">
          <div className="text-[11px] font-bold text-[#6E685E]">Prod. executions</div>
          <div className="text-[10px] text-[#9B9488]">Last 7 days</div>
          <div className="text-2xl font-extrabold text-[#2B2826] mt-2">1,428</div>
        </div>

        <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E6E1D7]/70">
          <div className="text-[11px] font-bold text-[#6E685E]">Failed prod. executions</div>
          <div className="text-[10px] text-[#9B9488]">Last 7 days</div>
          <div className="text-2xl font-extrabold text-[#2B2826] mt-2">3</div>
        </div>

        <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E6E1D7]/70">
          <div className="text-[11px] font-bold text-[#6E685E]">Failure rate</div>
          <div className="text-[10px] text-[#9B9488]">Last 7 days</div>
          <div className="text-2xl font-extrabold text-[#0F766E] mt-2">0.2%</div>
        </div>

        <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E6E1D7]/70">
          <div className="text-[11px] font-bold text-[#6E685E]">Time saved</div>
          <div className="text-[10px] text-[#9B9488]">Last 7 days</div>
          <div className="text-2xl font-extrabold text-[#D97757] mt-2">14.2 hrs</div>
        </div>

        <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E6E1D7]/70">
          <div className="text-[11px] font-bold text-[#6E685E]">Run time (avg.)</div>
          <div className="text-[10px] text-[#9B9488]">Last 7 days</div>
          <div className="text-2xl font-extrabold text-[#2B2826] mt-2">1.18s</div>
        </div>
      </div>

      {/* 3. SUB-TABS NAVIGATION & SEARCH CONTROLS BAR */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-[#E6E1D7] pb-3">
        {/* Left Workflow Count Indicator */}
        <div className="flex items-center space-x-2 text-xs font-bold">
          <span className="text-[#2B2826] font-extrabold text-sm">Workflows</span>
          <span className="bg-[#FDF3E9] text-[#D97757] text-[11px] font-extrabold px-2 py-0.5 rounded-lg border border-[#E6E1D7]">
            {filteredProjects.length} total
          </span>
        </div>

        {/* Right Search & Filter Controls */}
        <div className="flex items-center space-x-2.5">
          <div className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#9B9488]" />
            <input 
              type="text" 
              placeholder="Search workflows..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-[#E6E1D7] rounded-xl text-xs bg-white focus:outline-none focus:border-[#D97757]"
            />
          </div>

          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'updated' | 'name' | 'created')}
            className="bg-white border border-[#E6E1D7] rounded-xl px-3 py-1.5 text-xs font-semibold text-[#6E685E] focus:outline-none focus:border-[#D97757] cursor-pointer shadow-2xs"
          >
            <option value="updated">Sort by last updated</option>
            <option value="name">Sort by name</option>
            <option value="created">Sort by created date</option>
          </select>
        </div>
      </div>

      {/* 4. WORKFLOW ITEM LIST */}
      <div className="space-y-3">
        {filteredProjects.map((proj, idx) => (
          <div 
            key={`${proj.id}-${idx}`}
            onClick={() => onOpenCanvas(proj)}
            className="bg-white p-4 rounded-2xl border border-[#E6E1D7] hover:border-[#D97757] transition-all shadow-2xs cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
            title="Open workflow in Canvas Studio"
          >
            {/* Left Side Workflow Info */}
            <div className="flex items-center space-x-3.5 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-[#FDF3E9] text-[#D97757] flex items-center justify-center font-bold text-xs border border-[#E6E1D7] shrink-0 group-hover:scale-105 transition-transform">
                <Workflow className="w-4.5 h-4.5" />
              </div>

              <div className="overflow-hidden">
                <h3 className="font-extrabold text-sm text-[#2B2826] group-hover:text-[#D97757] transition-colors truncate">
                  {proj.name}
                </h3>
                <div className="text-[11px] text-[#6E685E] mt-0.5 font-medium truncate flex items-center gap-1.5">
                  <span>Updated {proj.updated_at}</span>
                  <span className="text-[#9B9488]">•</span>
                  <span className="truncate">{proj.description}</span>
                </div>
              </div>
            </div>

            {/* Right Side Actions & Persistent Active Toggle Switch */}
            <div className="flex items-center space-x-2.5 shrink-0 self-end sm:self-center">
              {/* Retrieval Layer Status Badge */}
              {proj.retrieval_metadata?.matched ? (
                <span className="bg-[#ECFDF5] text-[#059669] text-[10px] font-bold px-2 py-0.5 rounded-md border border-[#A7F3D0] hidden lg:flex items-center gap-1 shadow-2xs" title={`Matched KB Scenario: ${proj.retrieval_metadata.scenario} (Score: ${proj.retrieval_metadata.similarity_score})`}>
                  <Sparkles className="w-2.5 h-2.5 text-[#059669]" />
                  <span>Reused: {proj.retrieval_metadata.scenario}</span>
                </span>
              ) : proj.retrieval_metadata ? (
                <span className="bg-[#FEF3C7] text-[#B45309] text-[10px] font-bold px-2 py-0.5 rounded-md border border-[#FDE68A] hidden lg:flex items-center gap-1 shadow-2xs" title={`Existing Workflow Generator (Score: ${proj.retrieval_metadata.similarity_score} < ${proj.retrieval_metadata.threshold})`}>
                  <span>Generator</span>
                </span>
              ) : null}

              <span className="bg-[#EEF2FF] text-[#4F46E5] text-[10px] font-bold px-2 py-0.5 rounded-md border border-[#C7D2FE] hidden sm:flex items-center gap-1 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4F46E5] animate-pulse" />
                <span>Vector Synced</span>
              </span>

              <span className="bg-[#FAF8F5] text-[#6E685E] text-[10.5px] font-bold px-2.5 py-1 rounded-lg border border-[#E6E1D7] flex items-center gap-1">
                <User className="w-3 h-3 text-[#9B9488]" />
                <span>{proj.vertical}</span>
              </span>

              <span className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold border flex items-center gap-1.5 ${
                proj.status === 'Active' ? 'bg-[#E6F4F1] text-[#0F766E] border-[#99F6E4]' : 'bg-[#FAF8F5] text-[#9B9488] border-[#E6E1D7]'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${proj.status === 'Active' ? 'bg-[#0F766E]' : 'bg-[#9B9488]'}`} />
                <span>{proj.status}</span>
              </span>

              {/* Persistent Toggle Switch linked to MongoDB Atlas */}
              <button 
                onClick={(e) => handleToggleStatus(proj.id, e)}
                className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                  proj.status === 'Active' ? 'bg-[#10B981]' : 'bg-[#D6CFBF]'
                }`}
                title="Toggle Workflow Active Status in MongoDB Atlas"
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform shadow-xs ${
                  proj.status === 'Active' ? 'translate-x-4' : 'translate-x-0'
                }`} />
              </button>

              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenCanvas(proj);
                }}
                className="px-2.5 py-1 text-xs font-bold text-[#6E685E] hover:text-[#D97757] rounded-lg hover:bg-[#FAF8F5] border border-transparent hover:border-[#E6E1D7] transition-all flex items-center gap-1"
                title="Open directly in Canvas Studio"
              >
                <span>Canvas</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 5. FOOTER PAGINATION BAR */}
      <div className="flex items-center justify-between pt-4 border-t border-[#E6E1D7] text-xs text-[#6E685E] font-medium">
        <div>
          Total <span className="font-bold text-[#2B2826]">{filteredProjects.length}</span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="w-7 h-7 bg-white border border-[#D97757] text-[#D97757] font-bold rounded-lg flex items-center justify-center text-xs shadow-2xs">
            1
          </span>
          <select className="bg-white border border-[#E6E1D7] rounded-lg px-2 py-1 text-xs text-[#6E685E] focus:outline-none">
            <option>50/page</option>
            <option>20/page</option>
          </select>
        </div>
      </div>

      {/* CREATE NEW WORKFLOW MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E6E1D7] p-6 max-w-lg w-full shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#E6E1D7]">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-[#D97757]" />
                <h3 className="font-extrabold text-base text-[#2B2826]">Create New Workflow</h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-[#9B9488] hover:text-[#2B2826]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 mt-4">
              <div>
                <label className="text-xs font-bold text-[#2B2826] block mb-1">Workflow Name</label>
                <input 
                  type="text"
                  placeholder="e.g. Customer Support & Refund Automation"
                  value={projName}
                  onChange={e => setProjName(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E6E1D7] rounded-xl text-xs bg-[#FAF8F5] focus:outline-none focus:border-[#D97757]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#2B2826] block mb-1">Vertical / Tag</label>
                <select 
                  value={projVertical}
                  onChange={e => setProjVertical(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E6E1D7] rounded-xl text-xs bg-[#FAF8F5] focus:outline-none focus:border-[#D97757]"
                >
                  <option>D2C E-commerce</option>
                  <option>Appointment Booking</option>
                  <option>Sales Lead Follow-up</option>
                  <option>Recruitment & HR</option>
                </select>
              </div>

              {/* SARVAM AI INDIC VOICE INTAKE COMPONENT */}
              <div className="bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#E6E1D7] space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-[#2B2826] flex items-center gap-1.5">
                    <span className="text-base">🇮🇳</span>
                    <span>Speak Requirement (Sarvam Indic Voice)</span>
                  </span>
                  <span className="text-[10px] font-bold text-[#0F766E] bg-[#E6F4F1] px-2 py-0.5 rounded-md border border-[#99F6E4] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E] animate-pulse" />
                    <span>Sarvam saaras:v2</span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={voiceLanguage}
                    onChange={e => setVoiceLanguage(e.target.value)}
                    disabled={isRecording || isTranscribing}
                    className="bg-white border border-[#E6E1D7] rounded-xl px-2.5 py-1.5 text-[11px] font-semibold text-[#6E685E] focus:outline-none focus:border-[#D97757]"
                  >
                    <option value="unknown">Auto-Detect Indic (Code-Switch)</option>
                    <option value="ta-IN">Tamil (தமிழ்)</option>
                    <option value="hi-IN">Hindi (हिन्दी)</option>
                    <option value="te-IN">Telugu (తెలుగు)</option>
                    <option value="kn-IN">Kannada (ಕನ್ನಡ)</option>
                    <option value="en-IN">Indian English</option>
                  </select>

                  {!isRecording ? (
                    <button
                      type="button"
                      onClick={startVoiceRecording}
                      disabled={isTranscribing}
                      className="flex-1 bg-white hover:bg-[#FDF3E9] text-[#2B2826] hover:text-[#D97757] border border-[#E6E1D7] hover:border-[#D97757] px-3 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs"
                    >
                      {isTranscribing ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#D97757]" />
                          <span>Transcribing with Sarvam...</span>
                        </>
                      ) : (
                        <>
                          <Mic className="w-3.5 h-3.5 text-[#D97757]" />
                          <span>Click to Speak</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopVoiceRecording}
                      className="flex-1 bg-[#EF4444] hover:bg-[#DC2626] text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all animate-pulse shadow-sm"
                    >
                      <Square className="w-3 h-3 fill-current" />
                      <span>Stop & Transcribe ({String(Math.floor(recordingSeconds / 60)).padStart(2, '0')}:{String(recordingSeconds % 60).padStart(2, '0')})</span>
                    </button>
                  )}
                </div>

                {isRecording && (
                  <div className="flex items-center justify-between text-[11px] text-[#DC2626] px-1 font-semibold">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#DC2626] animate-ping" />
                      <span>Listening... Speak in Tamil, Hindi, or English</span>
                    </span>
                    <button 
                      type="button" 
                      onClick={cancelVoiceRecording} 
                      className="text-[#9B9488] hover:text-[#2B2826] underline text-[10px]"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {voiceSuccess && (
                  <div className="text-[11px] text-[#0F766E] font-semibold bg-[#E6F4F1] px-2.5 py-1 rounded-lg border border-[#99F6E4] flex items-center gap-1.5 animate-fadeIn">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>{voiceSuccess}</span>
                  </div>
                )}

                {voiceError && (
                  <div className="text-[11px] text-[#DC2626] font-semibold bg-[#FEE2E2] px-2.5 py-1 rounded-lg border border-[#FCA5A5] flex items-center gap-1.5 animate-fadeIn">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{voiceError}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-[#2B2826] block mb-1">Description (Voice or Text)</label>
                <textarea 
                  placeholder="Describe your workflow or speak into the microphone above (e.g. Verify orders from database and process customer refunds up to 2000 INR)..."
                  value={projPrompt}
                  onChange={e => setProjPrompt(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E6E1D7] rounded-xl text-xs bg-[#FAF8F5] focus:outline-none focus:border-[#D97757] resize-none"
                  rows={3}
                />
              </div>

              {/* Step 13: Live Workflow Vector Retrieval Preview Box */}
              {(projPrompt.trim().length > 4 || projName.trim().length > 4) && (
                <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E6E1D7] text-xs space-y-2 animate-fadeIn">
                  <div className="flex items-center justify-between font-extrabold text-[11px] text-[#2B2826]">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#D97757]" />
                      <span>Workflow Vector Retrieval Layer</span>
                    </span>
                    {retrievalPreview && (
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                        retrievalPreview.matched 
                          ? 'bg-[#E6F4F1] text-[#0F766E] border-[#99F6E4]' 
                          : 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]'
                      }`}>
                        {retrievalPreview.matched ? 'MATCH: Reusing Existing' : 'NO MATCH: Workflow Generator'}
                      </span>
                    )}
                  </div>
                  {retrievalPreview ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                      <div className="bg-white p-2 rounded-lg border border-[#E6E1D7]/70">
                        <div className="text-[10px] text-[#9B9488]">Matched Scenario</div>
                        <div className="font-bold text-[#2B2826] truncate">{retrievalPreview.scenario || 'None'}</div>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-[#E6E1D7]/70">
                        <div className="text-[10px] text-[#9B9488]">Similarity Score</div>
                        <div className="font-extrabold text-[#D97757]">{retrievalPreview.similarity_score}</div>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-[#E6E1D7]/70">
                        <div className="text-[10px] text-[#9B9488]">Threshold</div>
                        <div className="font-bold text-[#6E685E]">{retrievalPreview.threshold}</div>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-[#E6E1D7]/70">
                        <div className="text-[10px] text-[#9B9488]">Decision / Status</div>
                        <div className="font-bold text-[#2B2826] truncate">
                          {retrievalPreview.matched ? 'Existing Workflow Reused' : 'New Workflow Generated'}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-[11px] text-[#9B9488] italic flex items-center gap-1.5 py-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D97757] animate-ping" />
                      <span>Checking Knowledge Base vector similarity...</span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-2 border-t border-[#E6E1D7]">
                <button 
                  type="button" 
                  onClick={() => setShowCreateModal(false)}
                  className="btn-claude-secondary text-xs py-2 px-4 font-bold"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-claude-primary text-xs py-2 px-5 font-bold"
                >
                  Create & Launch Studio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
