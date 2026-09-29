'use client';

import React, { useState } from 'react';
import { 
  FolderKanban, 
  Sparkles, 
  Plus, 
  Search, 
  Play, 
  CheckCircle2, 
  Clock, 
  Layers, 
  ChevronRight, 
  Globe, 
  Database, 
  Zap,
  X
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
  onCreateProject: (newProj: any) => void;
}

export const ProjectsOverview: React.FC<ProjectsOverviewProps> = ({ 
  projects, 
  onOpenCanvas, 
  onCreateProject 
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form Fields for New Project
  const [projName, setProjName] = useState('');
  const [projVertical, setProjVertical] = useState('D2C E-commerce');
  const [projLanguages, setProjLanguages] = useState<string[]>(['ta', 'hi', 'en']);
  const [projPrompt, setProjPrompt] = useState('');

  const handleToggleLang = (langCode: string) => {
    if (projLanguages.includes(langCode)) {
      setProjLanguages(projLanguages.filter(l => l !== langCode));
    } else {
      setProjLanguages([...projLanguages, langCode]);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projName.trim()) return;

    const newProj = {
      id: `proj_${Date.now()}`,
      name: projName,
      vertical: projVertical,
      languages: projLanguages,
      description: projPrompt || 'Automated multi-agent workforce for business operations.',
      active_workforces: 1,
      total_executions: 0,
      success_rate: '100%',
      status: 'Active',
      updated_at: 'Just now'
    };

    onCreateProject(newProj);
    setShowCreateModal(false);
    setProjName('');
    setProjPrompt('');
  };

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.vertical.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-4">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-[#E6E1D7] shadow-2xs">
        <div>
          <h1 className="text-2xl font-extrabold text-[#2B2826]">Workspace Projects & Active Runs</h1>
          <p className="text-xs text-[#6E685E] mt-1">
            Manage your AI workforce automation projects, MongoDB node pipelines, and active sessions.
          </p>
        </div>

        <button 
          onClick={() => setShowCreateModal(true)}
          className="btn-claude-primary text-xs py-2.5 px-4 rounded-xl flex items-center space-x-2 font-bold shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Project</span>
        </button>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[#E6E1D7] shadow-2xs">
          <div className="text-xs font-bold text-[#6E685E]">Total Projects</div>
          <div className="text-2xl font-extrabold text-[#2B2826] mt-1">{projects.length}</div>
          <div className="text-[11px] text-[#0F766E] font-medium mt-1">3 Active Workforces</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E6E1D7] shadow-2xs">
          <div className="text-xs font-bold text-[#6E685E]">Prod Executions</div>
          <div className="text-2xl font-extrabold text-[#2B2826] mt-1">2,596</div>
          <div className="text-[11px] text-[#0F766E] font-medium mt-1">+18.4% last 7 days</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E6E1D7] shadow-2xs">
          <div className="text-xs font-bold text-[#6E685E]">Overall Success Rate</div>
          <div className="text-2xl font-extrabold text-[#0F766E] mt-1">99.6%</div>
          <div className="text-[11px] text-[#6E685E] font-medium mt-1">4 Escalations resolved</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E6E1D7] shadow-2xs">
          <div className="text-xs font-bold text-[#6E685E]">MongoDB Nodes Status</div>
          <div className="text-2xl font-extrabold text-[#D97757] mt-1">Connected</div>
          <div className="text-[11px] text-[#6E685E] font-medium mt-1">ai_workforce_db ready</div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E6E1D7] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#9B9488]" />
          <input 
            type="text" 
            placeholder="Search projects by name or vertical..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-[#E6E1D7] rounded-xl text-xs bg-[#FAF8F5] focus:outline-none focus:border-[#D97757]"
          />
        </div>

        <div className="flex items-center space-x-2 text-xs text-[#6E685E]">
          <span className="font-bold">Filter:</span>
          <span className="bg-[#FDF3E9] text-[#D97757] px-2.5 py-1 rounded-lg border border-[#E6E1D7] font-semibold">All Verticals</span>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredProjects.map(proj => (
          <div 
            key={proj.id}
            className="bg-white p-5 rounded-2xl border border-[#E6E1D7] hover:border-[#D97757] transition-all shadow-2xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-[#FDF3E9] text-[#D97757] flex items-center justify-center font-bold text-xs border border-[#E6E1D7]">
                    <FolderKanban className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-[#2B2826]">{proj.name}</h3>
                    <span className="text-[11px] font-semibold text-[#6E685E]">{proj.vertical}</span>
                  </div>
                </div>
                <span className={`badge-pill ${proj.status === 'Active' ? 'badge-success' : 'badge-inactive'}`}>
                  {proj.status}
                </span>
              </div>

              <p className="text-xs text-[#6E685E] mt-3 line-clamp-2 leading-relaxed">
                {proj.description}
              </p>

              {/* Language Tags */}
              <div className="flex items-center space-x-1.5 mt-3">
                <Globe className="w-3.5 h-3.5 text-[#9B9488]" />
                <div className="flex gap-1">
                  {proj.languages.map(lang => (
                    <span key={lang} className="bg-[#FAF8F5] text-[#2B2826] text-[10px] font-bold px-2 py-0.5 rounded border border-[#E6E1D7]">
                      {lang.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-[#E6E1D7] flex items-center justify-between">
              <div className="text-xs text-[#6E685E]">
                <span className="font-bold text-[#2B2826]">{proj.total_executions}</span> runs • Updated {proj.updated_at}
              </div>

              <button 
                onClick={() => onOpenCanvas(proj)}
                className="btn-claude-secondary text-xs py-1.5 px-3 flex items-center space-x-1 font-bold"
              >
                <span>Open Canvas</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#D97757]" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE NEW PROJECT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E6E1D7] p-6 max-w-lg w-full shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#E6E1D7]">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-[#D97757]" />
                <h3 className="font-extrabold text-base text-[#2B2826]">Create New AI Workforce Project</h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-[#9B9488] hover:text-[#2B2826]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 mt-4">
              <div>
                <label className="text-xs font-bold text-[#2B2826] block mb-1">Project Name</label>
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
                <label className="text-xs font-bold text-[#2B2826] block mb-1">Industry Vertical</label>
                <select 
                  value={projVertical}
                  onChange={e => setProjVertical(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E6E1D7] rounded-xl text-xs bg-[#FAF8F5] focus:outline-none focus:border-[#D97757]"
                >
                  <option>D2C E-commerce</option>
                  <option>Appointment Booking (Clinic/Salon)</option>
                  <option>Sales Lead Follow-up & Booking</option>
                  <option>Recruitment & HR Screening</option>
                  <option>Logistics & Delivery Tracking</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#2B2826] block mb-1">Target Languages (Indic Voice)</label>
                <div className="flex gap-2">
                  {[
                    { code: 'ta', label: 'Tamil (தமிழ்)' },
                    { code: 'hi', label: 'Hindi (हिंदी)' },
                    { code: 'en', label: 'English' },
                    { code: 'te', label: 'Telugu' }
                  ].map(item => (
                    <button
                      type="button"
                      key={item.code}
                      onClick={() => handleToggleLang(item.code)}
                      className={`text-xs px-2.5 py-1 rounded-lg border font-semibold ${
                        projLanguages.includes(item.code)
                          ? 'bg-[#FDF3E9] text-[#D97757] border-[#D97757]'
                          : 'bg-[#FAF8F5] text-[#6E685E] border-[#E6E1D7]'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#2B2826] block mb-1">Plain-Language Business Requirement</label>
                <textarea 
                  rows={3}
                  placeholder="Example: I need to handle customer refunds and order status questions in Tamil and English."
                  value={projPrompt}
                  onChange={e => setProjPrompt(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E6E1D7] rounded-xl text-xs bg-[#FAF8F5] focus:outline-none focus:border-[#D97757] resize-none"
                />
              </div>

              <div className="flex space-x-2 pt-3 border-t border-[#E6E1D7]">
                <button 
                  type="button" 
                  onClick={() => setShowCreateModal(false)}
                  className="btn-claude-secondary flex-1 text-xs py-2"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-claude-primary flex-1 text-xs py-2 font-bold"
                >
                  Generate Workforce & Open Canvas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
