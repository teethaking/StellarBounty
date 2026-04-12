import React from 'react';

export function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-lg">{children}</div>
  );
}
