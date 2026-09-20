'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { formatRegisterDate, registerDateToIso } from '@/lib/exclusionRegister';

// Change the date a self-excluded patron's funds are released. Used from both
// the winner record and the blacklist record so the two behave identically.
export default function ReleaseDateModal({ entry, patronName, onSave, onClose }) {
  const currentIso = registerDateToIso(entry.expiresAt);
  const [newDate, setNewDate] = useState(currentIso);
  const [reason, setReason] = useState('');

  const canSave = newDate !== '' && newDate !== currentIso && reason.trim() !== '';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSave) return;
    onSave(newDate, reason);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[12px] border border-[#d9e2ec] max-w-md w-full p-6 shadow-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#edf1f4]">
          <div>
            <h3 className="text-[16px] font-bold text-[#102a43] m-0">Change funds release date</h3>
            <p className="text-[12px] text-[#64748b] mt-0.5 mb-0">Self-exclusion for {patronName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#64748b] hover:text-[#102a43] p-1 cursor-pointer bg-transparent border-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div className="space-y-1">
            <label className="text-[12px] font-bold text-[#64748b]">Current release date</label>
            <div className="font-mono text-[14px] font-bold text-[#102a43]">
              {entry.expiresAt ? formatRegisterDate(entry.expiresAt) : 'Not set'}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[12px] font-bold text-[#64748b]">
              New release date <span className="text-[#dc2626]">*</span>
            </label>
            <input
              type="date"
              required
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full h-9 px-3 border border-[#d9e2ec] rounded-md text-[13px] text-[#0f172a] outline-none focus:border-[#0d9488]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[12px] font-bold text-[#64748b]">
              Reason for change <span className="text-[#dc2626]">*</span>
            </label>
            <textarea
              rows={2}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Date corrected to match the state register"
              className="w-full p-2 border border-[#d9e2ec] rounded-md text-[13px] text-[#0f172a] outline-none focus:border-[#0d9488]"
            />
            <p className="text-[12px] text-[#64748b] m-0">
              Recorded with your name and the old and new dates.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2.5 border-t border-[#edf1f4]">
            <button
              type="button"
              onClick={onClose}
              className="h-[36px] px-3.5 rounded-md text-[13px] font-bold border border-[#d9e2ec] text-[#102a43] hover:bg-[#f4f7f9] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSave}
              className="h-[36px] px-4 rounded-md text-[13px] font-bold bg-[#0d9488] text-white hover:bg-[#0b7a6f] cursor-pointer border-none disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Save release date
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
