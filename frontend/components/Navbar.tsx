'use client';

import React, { useState } from 'react';
import { 
  Bot, 
  Home, 
  FolderKanban, 
  Workflow, 
  LogIn, 
  User, 
  Sparkles,
  BarChart3,
  LogOut,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'landing' | 'auth' | 'projects' | 'editor' | 'workflow-dashboard' | 'analytics' | 'executions' | 'escalations' | 'kb' | 'memory';
  setActiveTab: (tab: any) => void;
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
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navItems = [
    { id: 'projects' as const, label: 'Recent Projects', icon: FolderKanban },
    { id: 'analytics' as const, label: 'Model Dashboard', icon: BarChart3 },
  ];

  const handleSelectTab = (tabId: typeof activeTab) => {
    setActiveTab(tabId);
    setDrawerOpen(false);
  };

  return (
    <>
      {/* TOP APPLICATION HEADER BAR (Full Width, Fixed at Top) */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E6E1D7] px-4 sm:px-6 py-3 flex items-center justify-between shadow-2xs font-sans text-[#2B2826]">
        
        {/* Left Section: Menu Toggle Button + Brand Title */}
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setDrawerOpen(true)}
            className="p-2 rounded-xl border border-[#E6E1D7] bg-[#FAF8F5] text-[#2B2826] hover:bg-[#F4F1EA] hover:border-[#D97757] transition-all flex items-center space-x-2 font-bold text-xs shadow-2xs"
            title="Open Platform Navigation Menu"
          >
            <Menu className="w-4 h-4 text-[#D97757]" />
            <span className="hidden sm:inline">Menu</span>
          </button>

          <button 
            onClick={() => handleSelectTab('projects')}
            className="flex items-center space-x-2.5 text-left hover:opacity-90 transition-opacity"
          >
            <div className="w-8 h-8 rounded-xl bg-[#D97757] text-white flex items-center justify-center font-extrabold text-sm shadow-xs">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-extrabold text-sm sm:text-base tracking-tight text-[#2B2826] flex items-center gap-2">
                <span>AI Workforce Platform</span>
                <span className="bg-[#FDF3E9] text-[#D97757] text-[10px] font-extrabold px-2 py-0.5 rounded border border-[#E6E1D7] hidden sm:inline-block">
                  INDIC VOICE • NVIDIA NIM
                </span>
              </div>
            </div>
          </button>
        </div>

        {/* Right Section: Sign In Pill & Profile Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">

          {/* User Status / Sign In Pill (Account button removed on top per user request) */}
          {!user && (
            <button 
              onClick={() => handleSelectTab('auth')}
              className="btn-claude-primary text-xs py-1.5 px-3.5 font-bold flex items-center space-x-1.5"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          )}
        </div>

      </header>

      {/* BACKDROP BLUR OVERLAY FOR DRAWER */}
      {drawerOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 animate-in fade-in duration-200"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* OVERLAY SLIDE-IN NAVIGATION DRAWER PANEL (Sits ABOVE UI without compressing width) */}
      <aside className={`
        fixed top-0 left-0 bottom-0 z-50
        w-80 bg-white border-r border-[#E6E1D7]
        flex flex-col justify-between p-6 shadow-2xl font-sans text-[#2B2826]
        transition-transform duration-300 ease-in-out
        ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        
        {/* Drawer Header & Close Button */}
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#E6E1D7]">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-[#D97757] text-white flex items-center justify-center font-extrabold text-base shadow-xs">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-extrabold text-base text-[#2B2826]">AI Workforce</div>
                <div className="text-[10.5px] text-[#6E685E]">Indic Voice & NVIDIA NIM</div>
              </div>
            </div>

            <button 
              onClick={() => setDrawerOpen(false)}
              className="p-1.5 text-[#9B9488] hover:text-[#2B2826] rounded-xl hover:bg-[#FAF8F5]"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* New Project CTA */}
          {onOpenCreateProject && (
            <button 
              onClick={() => { onOpenCreateProject(); setDrawerOpen(false); }}
              className="w-full btn-claude-primary text-xs py-3 px-4 font-bold flex items-center justify-center space-x-2 shadow-xs rounded-xl"
            >
              <Sparkles className="w-4 h-4" />
              <span>+ Create New Project</span>
            </button>
          )}

          {/* Navigation Items List */}
          <nav className="space-y-2">
            <div className="text-[10.5px] font-extrabold uppercase tracking-wider text-[#9B9488] px-3 py-1">
              Platform Navigation
            </div>

            {navItems.map(item => {
              const IconComp = item.icon;
              const isSelected = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-[#FDF3E9] text-[#D97757] border border-[#D97757]/30 shadow-2xs'
                      : 'text-[#6E685E] hover:bg-[#FAF8F5] hover:text-[#2B2826]'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <IconComp className={`w-4 h-4 ${isSelected ? 'text-[#D97757]' : 'text-[#9B9488]'}`} />
                    <span>{item.label}</span>
                  </div>

                  {isSelected && <ChevronRight className="w-4 h-4 text-[#D97757]" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Drawer Footer / User Profile */}
        <div className="pt-4 border-t border-[#E6E1D7] space-y-4">
          {user ? (
            <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E6E1D7] space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-[#FDF3E9] text-[#D97757] border border-[#E6E1D7] flex items-center justify-center font-bold text-xs">
                  <User className="w-4 h-4" />
                </div>
                <div className="overflow-hidden">
                  <div className="font-bold text-xs text-[#2B2826] truncate">{user.name}</div>
                  <div className="text-[11px] font-mono text-[#6E685E] truncate">{user.email}</div>
                </div>
              </div>

              {onLogout && (
                <button 
                  onClick={() => {
                    onLogout();
                    handleSelectTab('auth');
                  }} 
                  className="w-full text-left text-xs font-bold text-[#6E685E] hover:text-[#C93B2B] pt-2 border-t border-[#E6E1D7] flex items-center space-x-2 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              )}
            </div>
          ) : (
            <button 
              onClick={() => handleSelectTab('auth')}
              className="w-full btn-claude-secondary text-xs py-3 px-4 font-bold flex items-center justify-center space-x-2 rounded-xl"
            >
              <LogIn className="w-4 h-4 text-[#D97757]" />
              <span>Sign In / Register</span>
            </button>
          )}

          <div className="text-[11px] text-center text-[#9B9488] font-medium">
            AI Workforce v1.0 • Claude Light Design
          </div>
        </div>

      </aside>
    </>
  );
};
