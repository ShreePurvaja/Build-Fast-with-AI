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

interface UserState {
  name: string;
  email: string;
}

export default function Home() {
  // 1st screen by default is 'landing' (About Project & Features)
  const [activeTab, setActiveTab] = useState<'landing' | 'auth' | 'projects' | 'editor' | 'analytics' | 'executions' | 'escalations' | 'kb' | 'memory'>('landing');
  
  const [user, setUser] = useState<UserState | null>({
    name: 'Alex Morgan',
    email: 'demo@company.com'
  });

  // Projects State
  const [projects, setProjects] = useState([
    {
      id: 'proj_support_01',
      name: 'Customer Support & Refund Automation',
      vertical: 'D2C E-commerce',
      languages: ['ta', 'hi', 'en'],
      description: 'Automated order verification in MongoDB and refund processing with human approval gates.',
      active_workforces: 1,
      total_executions: 1428,
      success_rate: '99.8%',
      status: 'Active',
      updated_at: 'Just now'
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
      input: 'MongoDB Order #4821 Refund enquiry',
      output: 'Refund RF-2291 processed in MongoDB & emailed via Gmail'
    },
    {
      id: 'exec_158',
      time: '20:16:46',
      duration: '1.85s',
      status: 'Succeeded',
      input: 'Order #4819 Delivery SLA',
      output: 'Status: In Transit'
    },
    {
      id: 'exec_157',
      time: '20:02:08',
      duration: '3.12s',
      status: 'Error',
      input: 'Order #0000 Invalid',
      output: 'Error: Document not found'
    }
  ]);

  useEffect(() => {
    // Fetch initial projects from backend
    fetch('http://localhost:8000/api/projects')
      .then(res => res.json())
      .then(data => {
        if (data && data.projects && data.projects.length > 0) {
          setProjects(data.projects);
        }
      })
      .catch(() => {
        // Silent fallback to local initial state
      });
  }, []);

  const handleLoginSuccess = (userData: UserState) => {
    setUser(userData);
    setActiveTab('projects');
  };

  const handleCreateProject = (newProj: any) => {
    setProjects(prev => [newProj, ...prev]);
    setActiveTab('editor');
  };

  const handleRunFinished = (newRun: any) => {
    setExecutions(prev => [newRun, ...prev]);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col font-sans text-[#2B2826]">
      {/* Top Application Navbar is shown on all screens EXCEPT the 1st landing screen */}
      {activeTab !== 'landing' && (
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          user={user}
          onOpenCreateProject={() => setActiveTab('projects')}
          onLogout={() => setUser(null)}
        />
      )}

      {/* Main App View Routing */}
      <main className="flex-1 w-full">
        {/* 1st Screen: About Project Overview */}
        {activeTab === 'landing' && (
          <LandingPage 
            onStartBuilding={() => setActiveTab(user ? 'projects' : 'auth')}
            onExploreProjects={() => setActiveTab('editor')}
            onOpenAnalytics={() => setActiveTab('analytics')}
            onOpenMemory={() => setActiveTab('memory')}
          />
        )}

        {/* Auth Screen */}
        {activeTab === 'auth' && (
          <AuthScreen onLoginSuccess={handleLoginSuccess} />
        )}

        {/* Home Screen: User's Recent Projects */}
        {activeTab === 'projects' && (
          <ProjectsOverview 
            projects={projects}
            onOpenCanvas={(proj) => setActiveTab('editor')}
            onCreateProject={handleCreateProject}
          />
        )}

        {/* n8n Studio Workflow Canvas */}
        {activeTab === 'editor' && (
          <WorkflowCanvas 
            onRunFinished={handleRunFinished} 
            onBackToProjects={() => setActiveTab('projects')}
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

      {/* Global Footer */}
      {activeTab !== 'editor' && (
        <footer className="border-t border-[#E6E1D7] bg-white py-4 mt-8">
          <div className="max-w-7xl mx-auto px-4 text-center text-xs text-[#6E685E] space-y-1 font-medium">
            <p>
              <strong>AI Workforce Platform</strong> • Indic Voice & Multi-Agent Automation
            </p>
            <p className="text-[11px] text-[#9B9488]">
              Claude Light Design System • NVIDIA NIM GPU Acceleration • MongoDB Backend • FastAPI & Next.js
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}
