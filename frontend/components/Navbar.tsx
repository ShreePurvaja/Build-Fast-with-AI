'use client';

import React, { useState } from 'react';
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
  LogOut,
  Menu,
  X,
  ChevronRight
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
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { id: 'landing' as const, label: 'About Project', icon: Home },
    { id: 'projects' as const, label: 'Recent Projects', icon: FolderKanban },
    { id: 'editor' as const, label: 'Workflow Studio', icon: Workflow },
    { id: 'analytics' as const, label: 'Model Dashboard', icon: BarChart3 },
    { id: 'executions' as const, label: 'Executions', icon: History },
    { id: 'escalations' as const, label: 'Handoffs Queue', icon: AlertTriangle },
    { id: 'kb' as const, label: 'Knowledge Base', icon: BookOpen },
    { id: 'memory' as const, label: 'Memory Backlog', icon: Layers },
  ];

  const handleSelectTab = (tabId: typeof activeTab) => {
    setActiveTab(tabId);
    setMobileOpen(false);
  };

  return (
    <>
      {/* MOBILE TOP HEADER BAR (Only visible on small mobile screens < 768px) */}
      <div className="md:hidden bg-white border-b border-[#E6E1D7] px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        <button 
          onClick={() => handleSelectTab('landing')}
          className="flex items-center space-x-2 text-left"
        >
          <div className="w-8 h-8 rounded-lg bg-[#D97757] text-white flex items-center justify-center font-extrabold text-sm shadow-xs">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-sm tracking-tight text-[#2B2826]">AI Workforce</span>
            <span className="ml-1.5 bg-[#FDF3E9] text-[#D97757] text-[9.5px] font-extrabold px-1.5 py-0.5 rounded border border-[#E6E1D7]">
              NVIDIA
            </span>
          </div>
        </button>

        <button 
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 rounded-xl border border-[#E6E1D7] bg-[#FAF8F5] text-[#2B2826] hover:border-[#D97757]"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* MOBILE BACKDROP DRAWER */}
      {mobileOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-xs z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* VERTICAL LEFT SIDEBAR (DESKTOP FIXED & MOBILE SLIDE-OVER DRAWER) */}
      <aside className={`
        fixed md:sticky top-0 left-0 z-50 md:z-30
        w-64 h-screen bg-white border-r border-[#E6E1D7]
        flex flex-col justify-between p-4 shadow-sm font-sans text-[#2B2826]
        transition-transform duration-300 ease-in-out shrink-0
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        
        {/* Top Header & Brand */}
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => handleSelectTab('landing')}
              className="flex items-center space-x-2.5 text-left hover:opacity-90 transition-opacity"
            >
              <div className="w-9 h-9 rounded-xl bg-[#D97757] text-white flex items-center justify-center font-extrabold text-base shadow-xs">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-extrabold text-base tracking-tight text-[#2B2826]">AI Workforce</div>
                <div className="text-[10px] text-[#6E685E] font-medium">Indic Voice & NVIDIA NIM</div>
              </div>
            </button>

            <button 
              onClick={() => setMobileOpen(false)}
              className="md:hidden text-[#9B9488] hover:text-[#2B2826]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* New Project CTA */}
          {onOpenCreateProject && (
            <button 
              onClick={() => { onOpenCreateProject(); setMobileOpen(false); }}
              className="w-full btn-claude-primary text-xs py-2.5 px-4 font-bold flex items-center justify-center space-x-2 shadow-xs"
            >
              <Sparkles className="w-4 h-4" />
              <span>+ Create New Project</span>
            </button>
          )}

          {/* Vertical Navigation Menu List */}
          <nav className="space-y-1">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#9B9488] px-3 py-1 mb-1">
              Platform Navigation
            </div>

            {navItems.map(item => {
              const IconComp = item.icon;
              const isSelected = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-[#FDF3E9] text-[#D97757] border border-[#D97757]/30 shadow-2xs'
                      : 'text-[#6E685E] hover:bg-[#FAF8F5] hover:text-[#2B2826]'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <IconComp className={`w-4 h-4 ${isSelected ? 'text-[#D97757]' : 'text-[#9B9488]'}`} />
                    <span>{item.label}</span>
                  </div>

                  {isSelected && <ChevronRight className="w-3.5 h-3.5 text-[#D97757]" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Profile Section */}
        <div className="pt-4 border-t border-[#E6E1D7] space-y-3">
          {user ? (
            <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E6E1D7] space-y-2">
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#FDF3E9] text-[#D97757] border border-[#E6E1D7] flex items-center justify-center font-bold text-xs">
                  <User className="w-4 h-4" />
                </div>
                <div className="overflow-hidden">
                  <div className="font-bold text-xs text-[#2B2826] truncate">{user.name}</div>
                  <div className="text-[10.5px] font-mono text-[#6E685E] truncate">{user.email}</div>
                </div>
              </div>

              {onLogout && (
                <button 
                  onClick={onLogout} 
                  className="w-full text-left text-xs font-bold text-[#6E685E] hover:text-[#C93B2B] pt-1 flex items-center space-x-1.5 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              )}
            </div>
          ) : (
            <button 
              onClick={() => handleSelectTab('auth')}
              className="w-full btn-claude-secondary text-xs py-2 px-3 font-bold flex items-center justify-center space-x-2"
            >
              <LogIn className="w-4 h-4 text-[#D97757]" />
              <span>Sign In / Register</span>
            </button>
          )}

          <div className="text-[10px] text-center text-[#9B9488] font-medium">
            AI Workforce v1.0 • Claude Light
          </div>
        </div>

      </aside>
    </>
  );
};
