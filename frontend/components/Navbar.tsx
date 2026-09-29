'use client';

import React from 'react';
import { 
  Bot, 
  Home, 
  FolderKanban, 
  Workflow, 
  History, 
  AlertTriangle, 
  BookOpen, 
  LogIn, 
  User, 
  Sparkles,
  BarChart3,
  Layers,
  LogOut
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'landing' | 'auth' | 'projects' | 'editor' | 'analytics' | 'executions' | 'escalations' | 'kb' | 'memory';
  setActiveTab: (tab: 'landing' | 'auth' | 'projects' | 'editor' | 'analytics' | 'executions' | 'escalations' | 'kb' | 'memory') => void;
  user?: { name: string; email: string } | null;
  onOpenCreateProject?: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  activeTab, 
  setActiveTab, 
  user,
  onOpenCreateProject,
  onLogout 
}) => {
  return (
    <header className="bg-white border-b border-[#E6E1D7] sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-2">
        
        {/* Brand Logo & Title */}
        <div className="flex items-center space-x-3 shrink-0">
          <button 
            onClick={() => setActiveTab('landing')}
            className="flex items-center space-x-2 text-left hover:opacity-90 transition-opacity"
          >
            <div className="w-8 h-8 rounded-lg bg-[#D97757] text-white flex items-center justify-center font-extrabold text-base shadow-xs">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base tracking-tight text-[#2B2826]">AI Workforce Platform</span>
                <span className="bg-[#FDF3E9] text-[#D97757] text-[10px] font-extrabold px-2 py-0.5 rounded border border-[#E6E1D7]">
                  INDIC VOICE • NVIDIA NIM
                </span>
              </div>
            </div>
          </button>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 bg-[#F4F1EA] p-1 rounded-xl border border-[#E6E1D7] overflow-x-auto">
          <button
            onClick={() => setActiveTab('landing')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all shrink-0 ${
              activeTab === 'landing'
                ? 'bg-white text-[#D97757] shadow-xs'
                : 'text-[#6E685E] hover:text-[#2B2826]'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>About Project</span>
          </button>

          <button
            onClick={() => setActiveTab('projects')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all shrink-0 ${
              activeTab === 'projects'
                ? 'bg-white text-[#D97757] shadow-xs'
                : 'text-[#6E685E] hover:text-[#2B2826]'
            }`}
          >
            <FolderKanban className="w-3.5 h-3.5" />
            <span>Recent Projects</span>
          </button>

          <button
            onClick={() => setActiveTab('editor')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all shrink-0 ${
              activeTab === 'editor'
                ? 'bg-white text-[#D97757] shadow-xs'
                : 'text-[#6E685E] hover:text-[#2B2826]'
            }`}
          >
            <Workflow className="w-3.5 h-3.5" />
            <span>Workflow Studio</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all shrink-0 ${
              activeTab === 'analytics'
                ? 'bg-white text-[#D97757] shadow-xs'
                : 'text-[#6E685E] hover:text-[#2B2826]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Model Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('executions')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all shrink-0 ${
              activeTab === 'executions'
                ? 'bg-white text-[#D97757] shadow-xs'
                : 'text-[#6E685E] hover:text-[#2B2826]'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Executions</span>
          </button>

          <button
            onClick={() => setActiveTab('escalations')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all shrink-0 ${
              activeTab === 'escalations'
                ? 'bg-white text-[#D97757] shadow-xs'
                : 'text-[#6E685E] hover:text-[#2B2826]'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Handoffs</span>
          </button>

          <button
            onClick={() => setActiveTab('kb')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all shrink-0 ${
              activeTab === 'kb'
                ? 'bg-white text-[#D97757] shadow-xs'
                : 'text-[#6E685E] hover:text-[#2B2826]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>KB</span>
          </button>

          <button
            onClick={() => setActiveTab('memory')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all shrink-0 ${
              activeTab === 'memory'
                ? 'bg-white text-[#D97757] shadow-xs'
                : 'text-[#6E685E] hover:text-[#2B2826]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Memory Backlog</span>
          </button>
        </nav>

        {/* User Auth Section */}
        <div className="flex items-center space-x-2 shrink-0">
          {onOpenCreateProject && (
            <button 
              onClick={onOpenCreateProject}
              className="btn-claude-primary flex items-center space-x-1.5 text-xs py-1.5 px-3 font-bold"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>+ New Project</span>
            </button>
          )}

          {user ? (
            <div className="flex items-center space-x-2 text-xs font-semibold bg-[#F4F1EA] px-3 py-1.5 rounded-lg border border-[#E6E1D7]">
              <User className="w-3.5 h-3.5 text-[#D97757]" />
              <span className="font-bold text-[#2B2826]">{user.name}</span>
              {onLogout && (
                <button onClick={onLogout} className="text-[#6E685E] hover:text-[#C93B2B] ml-1 text-[11px] font-bold">
                  Logout
                </button>
              )}
            </div>
          ) : (
            <button 
              onClick={() => setActiveTab('auth')}
              className="btn-claude-secondary flex items-center space-x-1.5 text-xs py-1.5 px-3 font-bold"
            >
              <LogIn className="w-3.5 h-3.5 text-[#D97757]" />
              <span>Sign In / Register</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
