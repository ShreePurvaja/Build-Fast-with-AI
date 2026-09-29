'use client';

import React, { useState } from 'react';
import { WorkforceSpec } from '../../types/workforce';

interface Step5DeployProps {
  spec: WorkforceSpec;
  onReset: () => void;
  onViewDashboard: () => void;
}

export const Step5Deploy: React.FC<Step5DeployProps> = ({ spec, onReset, onViewDashboard }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);

  const voiceUrl = spec.voice_link || `https://workforce.app/talk/${spec.id}`;
  const embedSnippet = `<script src="https://workforce.app/embed.js" data-team="${spec.id}" data-theme="light"></script>`;

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(voiceUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleCopyEmbed = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(embedSnippet);
      setCopiedEmbed(true);
      setTimeout(() => setCopiedEmbed(false), 2000);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Release Published Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs text-center">
        <div className="w-14 h-14 bg-[#e3f2f1] text-[#0e6b6b] rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 font-bold shadow-xs">
          🚀
        </div>
        <span className="badge-emerald font-bold text-xs uppercase tracking-wider mb-2 inline-block">
          Immutable Release Published (v{spec.version})
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Your AI Workforce is Live & Ready
        </h1>
        <p className="text-slate-600 text-sm max-w-lg mx-auto mt-2">
          Share the Indic voice link directly with your customers or embed the web widget on your storefront.
        </p>

        {/* Action Options */}
        <div className="flex flex-wrap justify-center gap-3 mt-6">
          <button onClick={onViewDashboard} className="btn-emerald text-sm py-2.5 px-5">
            📊 Open Control Center Dashboard
          </button>
          <button onClick={onReset} className="btn-outline-emerald text-sm py-2.5 px-5">
            ➕ Create Another Workforce
          </button>
        </div>
      </div>

      {/* Access Channels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Channel 1: Web Voice Link */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center space-x-2">
            <span className="text-xl">🎙️</span>
            <h3 className="font-bold text-slate-900 text-base">Public Indic Voice Link</h3>
          </div>
          <p className="text-xs text-slate-500">
            Direct mobile-friendly web voice link supporting streaming Tamil, Hindi, Telugu, and English.
          </p>

          <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
            <input
              type="text"
              readOnly
              value={voiceUrl}
              className="flex-1 bg-transparent text-xs font-mono text-slate-800 focus:outline-none"
            />
            <button
              onClick={handleCopyLink}
              className="btn-emerald text-xs py-1.5 px-3 whitespace-nowrap"
            >
              {copiedLink ? 'Copied ✓' : 'Copy Link'}
            </button>
          </div>
        </div>

        {/* Channel 2: Web Embed Widget */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center space-x-2">
            <span className="text-xl">💻</span>
            <h3 className="font-bold text-slate-900 text-base">Embed Widget Script</h3>
          </div>
          <p className="text-xs text-slate-500">
            Paste this single-line HTML script snippet before the closing &lt;/body&gt; tag of your website.
          </p>

          <div className="bg-slate-900 text-slate-100 p-3 rounded-xl font-mono text-[11px] overflow-x-auto relative">
            <code>{embedSnippet}</code>
            <button
              onClick={handleCopyEmbed}
              className="absolute top-2 right-2 bg-slate-700 hover:bg-slate-600 text-white text-[10px] py-1 px-2 rounded"
            >
              {copiedEmbed ? 'Copied ✓' : 'Copy Code'}
            </button>
          </div>
        </div>

      </div>

      {/* Control Center Live Telemetry Summary */}
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
        <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center justify-between">
          <span>📈 Control Center Live Telemetry Preview</span>
          <span className="text-xs text-emerald-700 font-medium">Real-time OpenTelemetry</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500 font-medium block">Conversations Today</span>
            <span className="text-2xl font-bold text-slate-900">48</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500 font-medium block">Completed Tasks</span>
            <span className="text-2xl font-bold text-emerald-700">41</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500 font-medium block">Human Escalations</span>
            <span className="text-2xl font-bold text-amber-700">5</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500 font-medium block">Avg Latency (p95)</span>
            <span className="text-2xl font-bold text-slate-900">135ms</span>
          </div>
        </div>
      </div>

    </div>
  );
};
