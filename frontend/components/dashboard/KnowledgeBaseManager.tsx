'use client';

import React, { useState } from 'react';

export const KnowledgeBaseManager: React.FC = () => {
  const [docs, setDocs] = useState([
    { id: 'kb_1', name: 'shipping_policy.pdf', size: '142 KB', chunks: 18, status: 'Indexed (pgvector)', org: 'org_sme_001' },
    { id: 'kb_2', name: 'return_refund_sop_v2.docx', size: '89 KB', chunks: 12, status: 'Indexed (pgvector)', org: 'org_sme_001' },
    { id: 'kb_3', name: 'product_catalog_2026.csv', size: '512 KB', chunks: 45, status: 'Indexed (pgvector)', org: 'org_sme_001' }
  ]);

  const [newDocName, setNewDocName] = useState('');

  const handleUpload = () => {
    if (!newDocName.trim()) return;
    const newDoc = {
      id: `kb_${Date.now()}`,
      name: newDocName.endsWith('.pdf') ? newDocName : `${newDocName}.pdf`,
      size: '210 KB',
      chunks: 24,
      status: 'Indexed (pgvector)',
      org: 'org_sme_001'
    };
    setDocs([...docs, newDoc]);
    setNewDocName('');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Title Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="badge-emerald font-semibold">Vector Store</span>
            <span className="text-xs text-slate-500">pgvector RLS Scoped</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            Knowledge Base Documents
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Upload policies, product specifications, and SOPs. Top-K semantic retrieval is scoped strictly to org_id with prompt injection screening.
          </p>
        </div>
      </div>

      {/* Document Upload Input */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center">
        <input
          type="text"
          value={newDocName}
          onChange={(e) => setNewDocName(e.target.value)}
          placeholder="Enter document filename (e.g. warranty_terms.pdf)..."
          className="flex-1 text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0e6b6b] w-full"
        />
        <button onClick={handleUpload} className="btn-emerald text-xs py-2.5 px-5 w-full sm:w-auto">
          + Upload & Embed Document
        </button>
      </div>

      {/* Docs List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px]">
              <th className="p-3.5">Document Name</th>
              <th className="p-3.5">File Size</th>
              <th className="p-3.5">Embed Chunks</th>
              <th className="p-3.5">Vector Status</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-800">
            {docs.map((d) => (
              <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="p-3.5 font-semibold text-slate-900 flex items-center space-x-2">
                  <span>📄</span>
                  <span>{d.name}</span>
                </td>
                <td className="p-3.5 text-slate-500 font-mono">{d.size}</td>
                <td className="p-3.5 font-mono">{d.chunks} chunks</td>
                <td className="p-3.5">
                  <span className="badge-emerald text-[11px]">{d.status}</span>
                </td>
                <td className="p-3.5 text-right">
                  <button className="text-slate-400 hover:text-red-600 font-medium">Re-index</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Security Guardrail Card */}
      <div className="bg-[#e3f2f1] border border-[#b0dedb] p-4 rounded-xl text-xs text-[#0e6b6b]">
        <h4 className="font-bold text-sm mb-1">🛡️ Knowledge Base Injection Screening active</h4>
        <p>Retrieved document chunks pass through untrusted-data framing before injection into worker prompt context to prevent jailbreak commands.</p>
      </div>

    </div>
  );
};
