'use client';

import React from 'react';
import { WorkforceSpec } from '../../types/workforce';

interface WorkforceCatalogProps {
  workforces: WorkforceSpec[];
  onSelectWorkforce: (wf: WorkforceSpec) => void;
}

export const WorkforceCatalog: React.FC<WorkforceCatalogProps> = ({ workforces, onSelectWorkforce }) => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Title Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="badge-emerald font-semibold">Release Catalog</span>
            <span className="text-xs text-slate-500">Immutable JSON Versioning</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            Active Workforce Releases
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Workforce releases are immutable JSON specifications. Production sessions run on fixed version tags.
          </p>
        </div>
      </div>

      {/* Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {workforces.map((wf) => (
          <div key={wf.id} className="card-theme p-5 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-slate-900 text-base">{wf.workforce}</h3>
                <span className="badge-emerald text-xs">v{wf.version}</span>
              </div>
              
              <div className="text-xs text-slate-600 mb-2">
                Manager: <strong>{wf.manager.name}</strong> • Max Hops: {wf.manager.max_hops}
              </div>

              {/* Workers Tags */}
              <div className="flex flex-wrap gap-1 mb-3">
                {wf.workers.map((w) => (
                  <span key={w.id} className="bg-slate-100 text-slate-700 text-[11px] px-2 py-0.5 rounded font-mono">
                    {w.name}
                  </span>
                ))}
              </div>

              {/* Indic Languages */}
              <div className="text-xs text-slate-500 flex items-center space-x-1">
                <span>🗣️ Indic Voice Support:</span>
                <span className="font-semibold text-slate-800">{wf.languages.join(', ').toUpperCase()}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400">id: {wf.id}</span>
              <button
                onClick={() => onSelectWorkforce(wf)}
                className="btn-emerald text-xs py-1.5 px-3"
              >
                Inspect Spec & Test →
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
