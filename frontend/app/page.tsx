'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { LandingPage } from '../components/LandingPage';
import { AuthScreen } from '../components/AuthScreen';
import { ProjectsOverview } from '../components/ProjectsOverview';
import { WorkflowCanvas } from '../components/WorkflowCanvas';
import { ExecutionsView } from '../components/ExecutionsView';
import { EscalationInbox } from '../components/dashboard/EscalationInbox';
import { KnowledgeBaseManager } from '../components/dashboard/KnowledgeBaseManager';
import { AnalyticsOverview } from '../components/dashboard/AnalyticsOverview';
import { MemoryBacklogTable } from '../components/MemoryBacklogTable';
import { WorkflowDashboard } from '../components/WorkflowDashboard';

interface UserState {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  org_name?: string;
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'landing' | 'auth' | 'projects' | 'editor' | 'workflow-dashboard' | 'analytics' | 'executions' | 'escalations' | 'kb' | 'memory'>('auth');
  
  // Real authenticated user state (starts as null to prevent accidental demo user leaks)
  const [user, setUser] = useState<UserState | null>(null);
  const [activeProject, setActiveProject] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);

  // Executions History State
  const [executions, setExecutions] = useState([
    {
      id: 'exec_159',
      time: '20:17:29',
      duration: '1.24s',
      status: 'Succeeded',
      input: 'SQLite Order #4821 Refund enquiry',
      output: 'Refund RF-2291 processed in SQLite DB & emailed via Gmail'
    }
  ]);

  // Tab switcher wrapper that also persists active tab
  const changeTab = (tab: 'landing' | 'auth' | 'projects' | 'editor' | 'workflow-dashboard' | 'analytics' | 'executions' | 'escalations' | 'kb' | 'memory') => {
    setActiveTab(tab);
    if (typeof window !== 'undefined' && tab !== 'auth') {
      localStorage.setItem('active_tab', tab);
    }
  };

  // Check authenticated session strictly on client mount & restore cached session
  useEffect(() => {
    setMounted(true);
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    const cachedUserStr = typeof window !== 'undefined' ? localStorage.getItem('user_info') : null;
    const savedTab = typeof window !== 'undefined' ? (localStorage.getItem('active_tab') as any) : null;

    let restoredUser: UserState | null = null;
    if (cachedUserStr) {
      try {
        restoredUser = JSON.parse(cachedUserStr);
      } catch (e) {}
    }

    if (restoredUser) {
      setUser(restoredUser);
      if (savedTab && savedTab !== 'auth') {
        setActiveTab(savedTab);
      } else {
        setActiveTab('projects');
      }
    } else if (!token) {
      setUser(null);
      setActiveTab('auth');
      setProjects([]);
      return;
    }

    // Verify session token with backend (syncs latest user profile & workflows)
    if (token) {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => {
          if (res.status === 401) {
            throw new Error('UNAUTHORIZED');
          }
          if (!res.ok) throw new Error('SERVER_NOTICE');
          return res.json();
        })
        .then(data => {
          if (data && data.user) {
            setUser(data.user);
            if (typeof window !== 'undefined') {
              localStorage.setItem('user_info', JSON.stringify(data.user));
            }
            if (!restoredUser && (!savedTab || savedTab === 'auth')) {
              setActiveTab('projects');
            }

            // Fetch only this user's authenticated workflows
            fetch(`${API_BASE_URL}/api/workflows`, {
              headers: { 'Authorization': `Bearer ${token}` }
            })
              .then(res => res.json())
              .then(wData => {
                if (wData && (wData.workflows || wData.projects)) {
                  setProjects(wData.workflows || wData.projects);
                }
              })
              .catch(() => {});
          }
        })
        .catch(err => {
          // Only clear session if explicitly 401 Unauthorized from backend
          if (err.message === 'UNAUTHORIZED') {
            if (typeof window !== 'undefined') {
              localStorage.removeItem('access_token');
              localStorage.removeItem('user_info');
              localStorage.removeItem('active_tab');
            }
            setUser(null);
            setActiveTab('auth');
            setProjects([]);
          }
        });
    }
  }, []);

  const handleLoginSuccess = (userData: UserState) => {
    setUser(userData);
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_info', JSON.stringify(userData));
      localStorage.setItem('active_tab', 'projects');
    }
    setActiveTab('projects');

    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    fetch(`${API_BASE_URL}/api/workflows`, { headers })
      .then(res => res.json())
      .then(data => {
        if (data && (data.workflows || data.projects)) {
          setProjects(data.workflows || data.projects);
        }
      })
      .catch(() => {});
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_info');
      localStorage.removeItem('active_tab');
    }
    setUser(null);
    setActiveProject(null);
    setProjects([]);
    setActiveTab('auth');
  };

  const handleOpenCanvas = (proj: any) => {
    setActiveProject(proj);
    changeTab('editor');
  };

  const handleOpenWorkflowDashboard = (proj: any) => {
    setActiveProject(proj);
    changeTab('workflow-dashboard');
  };

  const handleCreateProject = (newProj: any) => {
    setProjects(prev => [newProj, ...prev]);
    setActiveProject(newProj);
    changeTab('workflow-dashboard');
  };

  const handleRunFinished = (newRun: any) => {
    setExecutions(prev => [newRun, ...prev]);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center" suppressHydrationWarning>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#D97757] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-[#8C827A] font-medium tracking-wide">Loading workspace...</p>
        </div>
      </div>
    );
  }

  // Strict route protection: If user is not authenticated and tab is not landing, force 'auth'
  const currentTab = !user && activeTab !== 'landing' ? 'auth' : activeTab;

  return (
    <div className="min-h-screen bg-[#FAF8F5] font-sans text-[#2B2826]" suppressHydrationWarning>
      {currentTab === 'landing' ? (
        /* 1st Screen: Landing Page Layout */
        <div className="flex flex-col min-h-screen w-full">
          <main className="flex-1 w-full">
            <LandingPage 
              onStartBuilding={() => changeTab(user ? 'projects' : 'auth')}
              onExploreProjects={() => changeTab(user ? 'projects' : 'auth')}
              onOpenAnalytics={() => changeTab(user ? 'analytics' : 'auth')}
              onOpenMemory={() => changeTab(user ? 'projects' : 'auth')}
            />
          </main>
        </div>
      ) : (
        /* App Layout: Header & View Area */
        <div className="flex flex-col min-h-screen w-full">
          {/* Hide Navbar in editor view or when on auth screen */}
          {currentTab !== 'editor' && (
            <Navbar
              activeTab={currentTab}
              setActiveTab={(tab) => {
                if (!user && tab !== 'landing') {
                  changeTab('auth');
                } else {
                  changeTab(tab);
                }
              }}
              user={user}
              onOpenCreateProject={() => changeTab('projects')}
              onLogout={handleLogout}
            />
          )}

          <div className="flex-1 flex flex-col min-h-screen min-w-0 w-full">
            {/* Main App View Routing */}
            <main className={`flex-1 w-full overflow-y-auto ${
              currentTab === 'editor' || currentTab === 'analytics' ? 'p-0 max-w-full' : 'max-w-7xl mx-auto p-4 sm:p-6 lg:p-8'
            }`}>
              {/* Auth Screen (Strictly shown whenever unauthenticated) */}
              {currentTab === 'auth' && (
                <div className="max-w-md mx-auto py-10">
                  <AuthScreen onLoginSuccess={handleLoginSuccess} />
                </div>
              )}

              {/* Home Screen: User's Recent Projects (Protected) */}
              {currentTab === 'projects' && user && (
                <ProjectsOverview 
                  projects={projects}
                  onOpenCanvas={handleOpenCanvas}
                  onOpenWorkflowDashboard={handleOpenWorkflowDashboard}
                  onCreateProject={handleCreateProject}
                />
              )}

              {/* Dedicated Workflow Dashboard (Protected) */}
              {currentTab === 'workflow-dashboard' && user && activeProject && (
                <WorkflowDashboard 
                  workflow={activeProject}
                  onOpenCanvas={handleOpenCanvas}
                  onBackToProjects={() => setActiveTab('editor')}
                />
              )}

              {/* n8n Studio Workflow Canvas (Protected) */}
              {currentTab === 'editor' && user && (
                <WorkflowCanvas 
                  activeProject={activeProject}
                  onRunFinished={handleRunFinished} 
                  onBackToProjects={() => setActiveTab('projects')}
                  onOpenDashboard={(proj) => {
                    if (proj) setActiveProject(proj);
                    setActiveTab('workflow-dashboard');
                  }}
                />
              )}

              {/* Model Usage & NVIDIA Analytics Dashboard (Protected) */}
              {currentTab === 'analytics' && user && (
                <div className="py-6 px-4">
                  <AnalyticsOverview />
                </div>
              )}

              {/* Executions History Runs (Protected) */}
              {currentTab === 'executions' && user && (
                <ExecutionsView executions={executions} />
              )}

              {/* Escalations Inbox (Protected) */}
              {currentTab === 'escalations' && user && (
                <div className="max-w-6xl mx-auto py-6 px-4">
                  <EscalationInbox />
                </div>
              )}

              {/* Knowledge Base Manager (Protected) */}
              {currentTab === 'kb' && user && (
                <div className="max-w-6xl mx-auto py-6 px-4">
                  <KnowledgeBaseManager />
                </div>
              )}

              {/* AGENT_MEMORY.md Audit Backlog Table (Protected) */}
              {currentTab === 'memory' && user && (
                <div className="py-6 px-4">
                  <MemoryBacklogTable />
                </div>
              )}
            </main>
          </div>
        </div>
      )}
    </div>
  );
}
