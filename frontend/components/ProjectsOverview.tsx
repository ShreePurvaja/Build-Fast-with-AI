'use client';

import React, { useState, useEffect } from 'react';
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
  RefreshCw
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

  // Form Fields for New Project
  const [projName, setProjName] = useState('');
  const [projVertical, setProjVertical] = useState('D2C E-commerce');
  const [projLanguages, setProjLanguages] = useState<string[]>(['ta', 'hi', 'en']);
  const [projPrompt, setProjPrompt] = useState('');

  // Fetch workflows from SQLite Backend for the currently logged in user!
  const fetchWorkflowsFromDB = () => {
    setIsLoading(true);
    const token = localStorage.getItem('access_token');
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    fetch('http://localhost:8000/api/workflows', { headers })
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

    fetch(`http://localhost:8000/api/workflows/${id}/status`, {
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

    fetch('http://localhost:8000/api/workflows', {
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
        if (data.workflow_id) {
          newProj.id = data.workflow_id;
        }
        onCreateProject(newProj);
        setProjectList(prev => [newProj, ...prev]);
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

  const filteredProjects = projectList.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.vertical.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 w-full max-w-full font-sans text-[#2B2826] pb-10">
      
      {/* 1. HEADER & PRIMARY WORKFLOW ACTION BUTTON (n8n Dashboard Layout) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E6E1D7] pb-5">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#2B2826]">Overview</h1>
          <p className="text-xs text-[#6E685E] mt-1 font-medium">
            All the workflows, credentials and data tables stored securely in SQLite database
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button 
            onClick={fetchWorkflowsFromDB}
            className="p-2.5 bg-white border border-[#E6E1D7] hover:border-[#D97757] rounded-xl text-xs font-bold text-[#6E685E] transition-all shadow-2xs"
            title="Refresh workflows from SQLite DB"
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

          <select className="bg-white border border-[#E6E1D7] rounded-xl px-3 py-1.5 text-xs font-semibold text-[#6E685E] focus:outline-none focus:border-[#D97757]">
            <option>Sort by last updated</option>
            <option>Sort by name</option>
            <option>Sort by created date</option>
          </select>
        </div>
      </div>

      {/* 4. WORKFLOW ITEM LIST */}
      <div className="space-y-3">
        {filteredProjects.map(proj => (
          <div 
            key={proj.id}
            onClick={() => onOpenWorkflowDashboard ? onOpenWorkflowDashboard(proj) : onOpenCanvas(proj)}
            className="bg-white p-4 rounded-2xl border border-[#E6E1D7] hover:border-[#D97757] transition-all shadow-2xs cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
            title="Click to view dedicated workflow metrics and model costs"
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
            <div className="flex items-center space-x-3 shrink-0 self-end sm:self-center">
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

              <div>
                <label className="text-xs font-bold text-[#2B2826] block mb-1">Description</label>
                <textarea 
                  placeholder="Describe what this workflow automated step does..."
                  value={projPrompt}
                  onChange={e => setProjPrompt(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E6E1D7] rounded-xl text-xs bg-[#FAF8F5] focus:outline-none focus:border-[#D97757] resize-none"
                  rows={3}
                />
              </div>

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
