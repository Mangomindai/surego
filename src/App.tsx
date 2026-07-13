import React, { useState } from 'react';
import MobileApp from './components/MobileApp';
import ArchitectDocs from './components/ArchitectDocs';
import { Compass, Sparkles, MapPin, CheckCircle, Database, HelpCircle } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
      
      {/* GLOBAL HUB HEADER */}
      <header className="bg-white border-b border-slate-200 py-6 px-4 sm:px-6 lg:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center bg-blue-600 text-white p-1.5 rounded-xl">
                <Compass className="w-5 h-5 animate-spin-slow" />
              </span>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                SureGo <span className="text-xs bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full font-mono font-semibold">MVP BUILD</span>
              </h1>
            </div>
            <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
              Google Maps tells people <strong>where</strong> a place is. Reviews tell them <strong>how it was</strong>. 
              <span className="text-blue-600 font-semibold ml-1">SureGo tells people what is happening there right now.</span>
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-[11px] font-mono">
            <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 flex items-center gap-1.5 text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Live Sandbox Active
            </div>
            <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 flex items-center gap-1.5 text-slate-600">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Framework: React + Vite + TS
            </div>
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        
        {/* CONCEPT EXPLANATION CALLOUT CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex gap-3">
            <div className="text-2xl mt-0.5 shrink-0">📍</div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">GPS verification</h4>
              <p className="text-xs text-slate-500 leading-normal">
                Prevents remote report spam. Users can only update a place when simulated GPS distance is within the 100m geofence radius.
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex gap-3">
            <div className="text-2xl mt-0.5 shrink-0">🛡️</div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">Decaying Trust Engine</h4>
              <p className="text-xs text-slate-500 leading-normal">
                Visitor reports carry 60% confidence which decay by age. Employee (90%) and Owner (100%) entries establish instant ground truth.
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex gap-3">
            <div className="text-2xl mt-0.5 shrink-0">⚡</div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">Offline-First Sync</h4>
              <p className="text-xs text-slate-500 leading-normal">
                Toggling offline mode queues status submissions locally. Reconnecting seamlessly syncs queued actions to database endpoints.
              </p>
            </div>
          </div>
        </div>

        {/* COMPANION INTERACTIVE SECTION */}
        <section id="app-sandbox" className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-xs font-bold font-mono tracking-widest text-blue-600 uppercase">
              Interactive MVP Simulator
            </h2>
            <p className="text-xs text-slate-500">
              Select user roles or slide simulated distance to test the Live Status Engine
            </p>
          </div>
          
          <MobileApp />
        </section>

        {/* SCHEMAS, RULES AND CODE REPOSITORY SEGMENT */}
        <section>
          <ArchitectDocs />
        </section>

      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-6 px-4 text-center text-xs text-slate-500 font-mono shadow-xs">
        <p>© 2026 SureGo Solutions. All rights reserved. Designed to answer one simple question: "Should I go?"</p>
      </footer>

    </div>
  );
}
