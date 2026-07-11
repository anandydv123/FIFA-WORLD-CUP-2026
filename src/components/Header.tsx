/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { UserRole, Stadium } from "../types";
import { Award, ShieldAlert, Users, Compass, Globe, Sparkles, Accessibility } from "lucide-react";

interface HeaderProps {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  selectedStadium: Stadium;
  setSelectedStadium: (stadium: Stadium) => void;
  stadiums: Stadium[];
  onResetSim: () => void;
  onOpenAccessibility: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  setCurrentRole,
  selectedStadium,
  setSelectedStadium,
  stadiums,
  onResetSim,
  onOpenAccessibility,
}) => {
  return (
    <header className="border-b border-white/10 bg-black/40 backdrop-blur-md text-slate-100 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-900 rounded-lg flex items-center justify-center font-bold text-xl border border-white/20 shadow-md shadow-blue-900/30">
            26
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[9px] tracking-widest text-blue-400 font-semibold uppercase">
                FIFA WORLD CUP 2026
              </span>
              <span className="flex items-center gap-1 font-mono text-[9px] text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/40">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
                LIVE
              </span>
            </div>
            <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-2 mt-0.5">
              ArenaShield <span className="text-xs text-slate-400 font-normal">| Operations & Fan Hub</span>
            </h1>
          </div>
        </div>

        {/* Venue Selector */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5">
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[10px] font-mono font-semibold tracking-wider text-slate-400 uppercase">VENUE:</span>
            <select
              id="stadium-selector"
              className="bg-transparent border-none rounded-lg text-xs text-slate-200 font-bold focus:outline-none cursor-pointer pr-1"
              value={selectedStadium.id}
              onChange={(e) => {
                const selected = stadiums.find((s) => s.id === e.target.value);
                if (selected) setSelectedStadium(selected);
              }}
            >
              {stadiums.map((stadium) => (
                <option key={stadium.id} value={stadium.id} className="bg-slate-950 text-slate-200">
                  {stadium.name} ({stadium.city})
                </option>
              ))}
            </select>
          </div>

          <button
            id="accessibility-guide-btn"
            onClick={onOpenAccessibility}
            className="px-3 py-2 border border-blue-500/30 hover:border-blue-500/50 bg-blue-500/10 hover:bg-blue-500/20 text-[10px] text-blue-400 font-mono tracking-wider font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1"
          >
            <Accessibility className="w-3.5 h-3.5" /> ADA GUIDE
          </button>

          <button
            id="reset-simulation-btn"
            onClick={onResetSim}
            className="px-3 py-2 border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-[10px] text-slate-300 font-mono tracking-wider hover:text-white rounded-xl transition-all cursor-pointer"
          >
            RESET SIM
          </button>
        </div>
      </div>

      {/* Role Selection Tabs */}
      <div className="bg-black/20 border-t border-white/10 px-6">
        <div className="max-w-7xl mx-auto flex gap-1.5 py-1.5 overflow-x-auto scrollbar-none">
          <button
            id="role-btn-fan"
            onClick={() => setCurrentRole(UserRole.FAN)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 whitespace-nowrap cursor-pointer ${
              currentRole === UserRole.FAN
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20 font-bold border border-white/15"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            <Compass className="w-4 h-4" />
            Spectator Portal
          </button>

          <button
            id="role-btn-volunteer"
            onClick={() => setCurrentRole(UserRole.VOLUNTEER)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 whitespace-nowrap cursor-pointer ${
              currentRole === UserRole.VOLUNTEER
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20 font-bold border border-white/15"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            <Users className="w-4 h-4" />
            Volunteer Helper
          </button>

          <button
            id="role-btn-operations"
            onClick={() => setCurrentRole(UserRole.OPERATIONS)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 whitespace-nowrap cursor-pointer ${
              currentRole === UserRole.OPERATIONS
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20 font-bold border border-white/15"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            Command Ops Hub
          </button>
        </div>
      </div>
    </header>
  );
};
