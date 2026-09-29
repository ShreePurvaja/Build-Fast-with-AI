'use client';

import React, { useState, useEffect } from 'react';
import { fetchEscalations } from '../../services/api';
import { EscalationItem } from '../../types/workforce';

export const EscalationInbox: React.FC = () => {
  const [escalations, setEscalations] = useState<EscalationItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<EscalationItem | null>(null);

  useEffect(() => {
    fetchEscalations().then((data) => {
      const list = Array.isArray(data) ? data : [];
      setEscalations(list);
      if (list.length > 0) setSelectedItem(list[0]);
    });
  }, []);

  const handleResolve = (id: string) => {
    setEscalations((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'resolved' } : item))
    );
    if (selectedItem && selectedItem.id === id) {
      setSelectedItem({ ...selectedItem, status: 'resolved' });
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex justify-between items-center">
        <div>
          <div className="flex items-center space-x-2">
            <span className="badge-amber font-semibold">Supervisor Inbox</span>
            <span className="text-xs text-slate-500">Human Escalation Queue</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            Human Handoff Queue
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Calls escalated due to policy limits, explicit user request, or high value deal thresholds. Full transcript, task state, and attachments preserved.
          </p>
        </div>
      </div>

      {/* Main Grid: Escalation Ticket List vs Detailed Handoff Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Ticket List (1 Column) */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Pending Escalations ({escalations.filter((e) => e.status === 'pending').length})
          </h3>

          {escalations.map((item) => {
            const isSelected = selectedItem?.id === item.id;
            const isResolved = item.status === 'resolved';

            return (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-white border-[#0e6b6b] shadow-xs active-worker-card'
                    : isResolved
                    ? 'bg-slate-50 border-slate-200 opacity-60'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-slate-900">{item.customer_name}</span>
                  <span className="text-[11px] font-mono text-slate-500">{item.id}</span>
                </div>
                
                <p className="text-xs text-amber-900 font-medium line-clamp-1">
                  ⚠️ {item.reason}
                </p>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px]">
                  <span className="text-slate-500">{item.language}</span>
                  {isResolved ? (
                    <span className="badge-emerald py-0 px-2 text-[10px]">Resolved</span>
                  ) : (
                    <span className="badge-amber py-0 px-2 text-[10px]">Action Needed</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Detailed Handoff Viewer (2 Columns) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          {selectedItem ? (
            <div className="space-y-5">
              
              {/* Ticket Top Info */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-lg text-slate-900">{selectedItem.customer_name}</span>
                    <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono">
                      {selectedItem.id}
                    </span>
                    <span className="badge-emerald text-xs">{selectedItem.language}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">Session ID: {selectedItem.session_id} • {selectedItem.timestamp}</p>
                </div>

                <div>
                  {selectedItem.status === 'pending' ? (
                    <button
                      onClick={() => handleResolve(selectedItem.id)}
                      className="btn-emerald text-xs py-2 px-4 shadow-2xs"
                    >
                      ✓ Approve Action & Mark Resolved
                    </button>
                  ) : (
                    <span className="badge-emerald text-xs py-1 px-3">Resolved by Supervisor</span>
                  )}
                </div>
              </div>

              {/* Escalation Reason & Suggested Next Action */}
              <div className="bg-[#fbf1dc] border border-[#f5d79e] p-4 rounded-xl text-xs text-slate-900 space-y-1">
                <div className="font-bold text-[#b7791f] text-sm">
                  ⚠️ Escalation Reason: {selectedItem.reason}
                </div>
                <div className="font-medium text-slate-800">
                  💡 Suggested Action: {selectedItem.suggested_action}
                </div>
              </div>

              {/* Multimodal Attachment & Task State */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Attached Media */}
                {selectedItem.image_attached && (
                  <div className="border border-slate-200 rounded-xl p-3 bg-slate-50">
                    <span className="text-xs font-bold text-slate-700 block mb-2">
                      📷 Attached Multimodal Media:
                    </span>
                    <img
                      src={selectedItem.image_attached}
                      alt="Damaged product"
                      className="w-full h-36 object-cover rounded-lg border border-slate-200"
                    />
                    <p className="text-[10px] text-slate-500 mt-1 text-center font-mono">
                      Verified by Vision Model: Fabric Tear Detected
                    </p>
                  </div>
                )}

                {/* Task State Snapshot */}
                <div className="border border-slate-200 rounded-xl p-3 bg-slate-50">
                  <span className="text-xs font-bold text-slate-700 block mb-2">
                    📋 Preserved Task State:
                  </span>
                  <pre className="text-[11px] font-mono bg-white p-2.5 rounded-lg border border-slate-200 text-slate-800 overflow-x-auto">
                    {JSON.stringify(selectedItem.task_state, null, 2)}
                  </pre>
                </div>

              </div>

              {/* Preserved Conversation Transcript */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Preserved Conversation Transcript ({selectedItem.transcript?.length || 0} turns)
                </h4>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 max-h-60 overflow-y-auto space-y-2 text-xs">
                  {selectedItem.transcript && selectedItem.transcript.length > 0 ? (
                    selectedItem.transcript.map((t, idx) => (
                      <div key={idx} className="p-2 bg-white rounded-lg border border-slate-200">
                        <strong className="text-[#0e6b6b]">{t.speaker}:</strong>{' '}
                        <span className="text-slate-800">{t.text}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-400 italic">No conversation transcript recorded for this handoff.</div>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              Select an escalation ticket from the queue to view full transcript state.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
