import React from 'react';
import { BookHeart, ArrowRight } from 'lucide-react';

/**
 * VibeJournal — Displays CBT reframes from the current session.
 */
export default function VibeJournal({ entries }) {
  if (!entries || entries.length === 0) {
    return null; // Hide if no entries
  }

  // Only show entries that have a reframe
  const reframedEntries = entries.filter(e => e.reframe);

  if (reframedEntries.length === 0) return null;

  return (
    <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-5 backdrop-blur-md mt-4 flex-1 overflow-y-auto max-h-[300px]">
      <h3 className="text-label text-text-muted mb-4 uppercase tracking-wider flex items-center gap-2">
        <BookHeart size={14} />
        <span>Vibe Shift Journal</span>
      </h3>
      
      <div className="space-y-4">
        {reframedEntries.map(entry => (
          <div key={entry.id} className="p-3 bg-white/[0.02] rounded-xl border border-white/[0.03]">
            <div className="text-xs text-text-muted/60 mb-1">{entry.technique}</div>
            
            <div className="flex gap-2 items-start mt-2">
              <div className="text-body-sm text-text-muted italic flex-1 border-l-2 border-rose/30 pl-2">
                "{entry.transcript}"
              </div>
            </div>
            
            <div className="flex justify-center my-2 text-text-muted/30">
              <ArrowRight size={14} />
            </div>
            
            <div className="text-body-sm text-sage flex-1 border-l-2 border-sage/50 pl-2">
              {entry.reframe}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
