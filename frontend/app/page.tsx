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
  name: string;
  email: string;
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'landing' | 'auth' | 'projects' | 'editor' | 'workflow-dashboard' | 'analytics' | 'executions' | 'escalations' | 'kb' | 'memory'>('projects');
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const [user, setUser] = useState<UserState | null>({
    name: 'Alex Morgan',
    email: 'demo@company.com'
  });

  const [activeProject, setActiveProject] = useState<any>(null);

  // Projects State
  const [projects, setProjects] = useState([
    {
      id: 'proj_support_01',
      name: 'Omnichannel Customer Support Mega Voice Agent (20 Nodes)',
      vertical: 'D2C E-commerce & Retail',
      languages: ['ta', 'hi', 'en'],
      description: '20-node production support agent with VAD, Indic STT, Intent Router, Postgres Order DB, ChromaDB RAG, Llama 3.2 Vision, n8n Action Executor, ElevenLabs TTS, and Barge-In.',
      active_workforces: 1,
      total_executions: 1428,
      success_rate: '99.8%',
      status: 'Active',
      updated_at: 'Just now'
    },
    {
      "id": "proj_interviewer_02",
      "name": "AI Technical & HR Interviewer Voice Agent (23 Nodes)",
      "vertical": "HR Tech & Recruitment",
      "languages": ["en", "hi"],
      "description": "23-node voice interviewer with Resume PDF parsing, ATS match, Calendly invite, adaptive question loop, DeepSeek R1 scorecard, PDF report, and Greenhouse/Lever ATS sync.",
      "active_workforces": 1,
      "total_executions": 856,
      "success_rate": "99.1%",
      "status": "Active",
      "updated_at": "2 hours ago"
    },
    {
      id: 'proj_sales_02',
      name: 'Sales Lead Qualification & Booking',
      vertical: 'B2B SaaS / Services',
      languages: ['hi', 'en'],
      description: 'Qualifies budget & timeline, books calendar demos, and updates CRM.',
      active_workforces: 1,
      total_executions: 856,
      success_rate: '99.1%',
      status: 'Active',
      updated_at: '2 hours ago'
    },
    {
      id: 'proj_voice_03',
      name: 'Multilingual Technical Support Desk',
      vertical: 'Telecom / Enterprise IT',
      languages: ['hi', 'ta', 'te', 'en'],
      description: 'Voice call intake with Indic STT/TTS, ticket generation, and NVIDIA Llama-3 reasoning.',
      active_workforces: 2,
      total_executions: 2140,
      success_rate: '98.9%',
      status: 'Active',
      updated_at: '10 minutes ago'
    }
  ]);

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

  // Restore authenticated session using JWT access_token from localStorage
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      fetch('http://localhost:8000/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data && data.user) {
            setUser(data.user);
          }
        })
        .catch(() => {});
    }

    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    // Fetch initial projects from backend SQLite DB for current user
    fetch('http://localhost:8000/api/workflows', { headers })
      .then(res => res.json())
      .then(data => {
        if (data && (data.workflows || data.projects)) {
          setProjects(data.workflows || data.projects);
        }
      })
      .catch(() => {});
  }, []);

  const handleLoginSuccess = (userData: UserState) => {
    setUser(userData);
    setActiveTab('projects');
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
    setActiveTab('auth');
  };

  const handleOpenCanvas = (proj: any) => {
    setActiveProject(proj);
    setActiveTab('editor');
  };

  const handleOpenWorkflowDashboard = (proj: any) => {
    setActiveProject(proj);
    setActiveTab('workflow-dashboard');
  };

  const handleCreateProject = (newProj: any) => {
    setProjects(prev => [newProj, ...prev]);
    setActiveProject(newProj);
    setActiveTab('workflow-dashboard');
  };

  const handleRunFinished = (newRun: any) => {
    setExecutions(prev => [newRun, ...prev]);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] font-sans text-[#2B2826]" suppressHydrationWarning>
      {activeTab === 'landing' ? (
        /* 1st Screen: Landing Page Layout */
        <div className="flex flex-col min-h-screen w-full">
          <main className="flex-1 w-full">
            <LandingPage 
              onStartBuilding={() => setActiveTab(user ? 'projects' : 'auth')}
              onExploreProjects={() => setActiveTab('projects')}
              onOpenAnalytics={() => setActiveTab('analytics')}
              onOpenMemory={() => setActiveTab('projects')}
            />
          </main>
        </div>
      ) : (
        /* App Layout: Header & View Area */
        <div className="flex flex-col min-h-screen w-full">
          {/* Hide Navbar in editor view to eliminate double top headers */}
          {activeTab !== 'editor' && (
            <Navbar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              user={user}
              onOpenCreateProject={() => setActiveTab('projects')}
              onLogout={handleLogout}
            />
          )}

          <div className="flex-1 flex flex-col min-h-screen min-w-0 w-full">
            {/* Main App View Routing */}
            <main className={`flex-1 w-full overflow-y-auto ${
              activeTab === 'editor' || activeTab === 'analytics' ? 'p-0 max-w-full' : 'max-w-7xl mx-auto p-4 sm:p-6 lg:p-8'
            }`}>
              {/* Auth Screen */}
              {activeTab === 'auth' && (
                <div className="max-w-md mx-auto py-10">
                  <AuthScreen onLoginSuccess={handleLoginSuccess} />
                </div>
              )}

              {/* Home Screen: User's Recent Projects */}
              {activeTab === 'projects' && (
                <ProjectsOverview 
                  projects={projects}
                  onOpenCanvas={handleOpenCanvas}
                  onOpenWorkflowDashboard={handleOpenWorkflowDashboard}
                  onCreateProject={handleCreateProject}
                />
              )}

              {/* Dedicated Workflow Dashboard (Metrics, Model Costs, Runs) */}
              {activeTab === 'workflow-dashboard' && activeProject && (
                <WorkflowDashboard 
                  workflow={activeProject}
                  onOpenCanvas={handleOpenCanvas}
                  onBackToProjects={() => setActiveTab('projects')}
                />
              )}

              {/* n8n Studio Workflow Canvas */}
              {activeTab === 'editor' && (
                <WorkflowCanvas 
                  activeProject={activeProject}
                  onRunFinished={handleRunFinished} 
                  onBackToProjects={() => setActiveTab('workflow-dashboard')}
                />
              )}

              {/* Model Usage & NVIDIA Analytics Dashboard */}
              {activeTab === 'analytics' && (
                <div className="py-6 px-4">
                  <AnalyticsOverview />
                </div>
              )}

              {/* Executions History Runs */}
              {activeTab === 'executions' && (
                <ExecutionsView executions={executions} />
              )}

              {/* Escalations Inbox */}
              {activeTab === 'escalations' && (
                <div className="max-w-6xl mx-auto py-6 px-4">
                  <EscalationInbox />
                </div>
              )}

              {/* Knowledge Base Manager */}
              {activeTab === 'kb' && (
                <div className="max-w-6xl mx-auto py-6 px-4">
                  <KnowledgeBaseManager />
                </div>
              )}

              {/* AGENT_MEMORY.md Audit Backlog Table */}
              {activeTab === 'memory' && (
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
