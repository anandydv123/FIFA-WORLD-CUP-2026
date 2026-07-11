/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Gate, Concession, Incident } from "../types";
import { Compass, AlertTriangle, Coffee, MapPin, Eye, CheckCircle2 } from "lucide-react";

interface StadiumMapProps {
  gates: Gate[];
  concessions: Concession[];
  incidents: Incident[];
  onSelectGate?: (gateName: string) => void;
  onSelectConcession?: (concessionId: string) => void;
  onSelectIncident?: (incidentId: string) => void;
}

export const StadiumMap: React.FC<StadiumMapProps> = ({
  gates,
  concessions,
  incidents,
  onSelectGate,
  onSelectConcession,
  onSelectIncident,
}) => {
  const [hoveredItem, setHoveredItem] = useState<{
    type: "gate" | "concession" | "incident";
    name: string;
    details: string;
  } | null>(null);

  // Helper color map for congestion
  const getCongestionColor = (congestion: "Low" | "Medium" | "High") => {
    if (congestion === "High") return "#ef4444"; // red
    if (congestion === "Medium") return "#f59e0b"; // amber
    return "#10b981"; // emerald
  };

  // Helper color map for gate statuses
  const getGateColor = (status: "Open" | "Slow" | "Closed") => {
    if (status === "Closed") return "#64748b"; // slate
    if (status === "Slow") return "#f59e0b"; // amber
    return "#10b981"; // emerald
  };

  return (
    <div className="relative bg-white/5 border border-white/10 rounded-2xl p-5 shadow-2xl">
      <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
        <h3 className="text-xs font-bold uppercase tracking-widest text-blue-400 flex items-center gap-2 font-mono">
          <Compass className="w-4 h-4 text-blue-400 animate-spin" />
          Live Operations Map
        </h3>
        <span className="text-[10px] font-mono font-semibold tracking-widest text-slate-400 uppercase flex items-center gap-1">
          <Eye className="w-3 h-3 text-blue-500" /> GRID SCALE 1:500
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        {/* Map Legend */}
        <div className="md:col-span-1 space-y-3 bg-black/40 p-4 rounded-xl border border-white/10 text-xs">
          <h4 className="font-mono text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Map Layers</h4>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full border border-slate-700 bg-[#0f766e]"></span>
              <span className="text-slate-300 font-medium">Soccer Pitch</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-[#1e293b] border border-slate-600"></span>
              <span className="text-slate-300">Concourse Seating</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded bg-emerald-600/20 border border-emerald-500 flex items-center justify-center text-[8px] text-emerald-400 font-bold">G</span>
              <span className="text-slate-300">Gates (Flow Queues)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-blue-600 flex items-center justify-center text-white">
                <Coffee className="w-2 h-2" />
              </span>
              <span className="text-slate-300 font-sans">Concessions / WC</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-red-600 flex items-center justify-center text-white animate-pulse">
                <AlertTriangle className="w-2 h-2" />
              </span>
              <span className="text-slate-300">Active Incidents</span>
            </div>
          </div>

          <div className="pt-2.5 border-t border-slate-800 text-[10px] text-slate-500 font-mono space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Flow Optimal (&lt; 10 min)
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span> Medium Wait (10-25 min)
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500"></span> Bottleneck (&gt; 25 min)
            </div>
          </div>
        </div>

        {/* Dynamic Vector SVG Stadium Map */}
        <div className="md:col-span-3 flex justify-center relative bg-slate-950/80 p-2 rounded-xl">
          <svg
            id="interactive-stadium-svg"
            viewBox="0 0 500 400"
            className="w-full max-w-[420px] h-auto drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
          >
            {/* Outer Ring / Boundary */}
            <circle
              cx="250"
              cy="200"
              r="185"
              fill="none"
              stroke="#334155"
              strokeWidth="2"
              strokeDasharray="4 4"
            />

            {/* Seating Tier - Outer Ring */}
            <circle
              cx="250"
              cy="200"
              r="165"
              fill="#1e293b"
              stroke="#475569"
              strokeWidth="24"
              opacity="0.85"
            />

            {/* Inner Ring (Access Concourse) */}
            <circle
              cx="250"
              cy="200"
              r="140"
              fill="none"
              stroke="#0f172a"
              strokeWidth="10"
            />

            {/* Seating Tier - Inner Ring */}
            <circle
              cx="250"
              cy="200"
              r="115"
              fill="#334155"
              stroke="#475569"
              strokeWidth="18"
              opacity="0.9"
            />

            {/* Stadium Pitch / Field */}
            <rect
              x="170"
              y="140"
              width="160"
              height="120"
              rx="4"
              fill="#065f46"
              stroke="#047857"
              strokeWidth="2"
            />
            {/* Field Markings */}
            <rect
              x="175"
              y="145"
              width="150"
              height="110"
              fill="none"
              stroke="rgba(255,255,255,0.25)"
              strokeWidth="1.5"
            />
            {/* Midfield Line */}
            <line
              x1="250"
              y1="145"
              x2="250"
              y2="255"
              stroke="rgba(255,255,255,0.25)"
              strokeWidth="1.5"
            />
            {/* Center Circle */}
            <circle
              cx="250"
              cy="200"
              r="22"
              fill="none"
              stroke="rgba(255,255,255,0.25)"
              strokeWidth="1.5"
            />
            {/* Penalty Boxes */}
            <rect
              x="175"
              y="180"
              width="25"
              height="40"
              fill="none"
              stroke="rgba(255,255,255,0.25)"
              strokeWidth="1.5"
            />
            <rect
              x="300"
              y="180"
              width="25"
              height="40"
              fill="none"
              stroke="rgba(255,255,255,0.25)"
              strokeWidth="1.5"
            />

            {/* GATE HOTSPOTS - North, East, South, West perimeters */}
            {gates.map((g, idx) => {
              // Position gates evenly
              const coords = [
                { x: 250, y: 15, label: "N" }, // North
                { x: 435, y: 200, label: "E" }, // East
                { x: 250, y: 385, label: "S" }, // South
                { x: 65, y: 200, label: "W" }, // West
              ][idx % 4];

              return (
                <g
                  key={g.name}
                  className="cursor-pointer group"
                  onClick={() => onSelectGate?.(g.name)}
                  onMouseEnter={() =>
                    setHoveredItem({
                      type: "gate",
                      name: g.name,
                      details: `Status: ${g.status} | Wait: ${g.waitMinutes} mins | Congestion: ${g.congestion}`,
                    })
                  }
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <circle
                    cx={coords.x}
                    cy={coords.y}
                    r="15"
                    fill={getGateColor(g.status)}
                    stroke="#1e293b"
                    strokeWidth="2.5"
                    className="transition-all duration-300 group-hover:scale-110 group-hover:stroke-white"
                  />
                  <text
                    x={coords.x}
                    y={coords.y + 4}
                    textAnchor="middle"
                    fill="#000"
                    fontSize="10"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    G
                  </text>
                  {/* Gate Label tag */}
                  <text
                    x={coords.x}
                    y={coords.y < 50 ? coords.y + 26 : coords.y - 20}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="9"
                    fontWeight="600"
                  >
                    {g.name.split(" ")[0]}
                  </text>
                </g>
              );
            })}

            {/* CONCESSION HOTSPOTS - Scattered around the concourse level circle ring */}
            {concessions.map((c, idx) => {
              // Calculate angles for concourse placement
              const angle = (idx * (360 / concessions.length) * Math.PI) / 180;
              const r = 135; // Ring radius
              const cx = 250 + r * Math.cos(angle);
              const cy = 200 + r * Math.sin(angle);

              return (
                <g
                  key={c.id}
                  className="cursor-pointer group"
                  onClick={() => onSelectConcession?.(c.id)}
                  onMouseEnter={() =>
                    setHoveredItem({
                      type: "concession",
                      name: c.name,
                      details: `Type: ${c.category} | ${c.location} | Wait Line: ${c.waitMinutes} mins`,
                    })
                  }
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <circle
                    cx={cx}
                    cy={cy}
                    r="10"
                    fill={getCongestionColor(c.congestion)}
                    stroke="#0f172a"
                    strokeWidth="1.5"
                    className="transition-all duration-300 group-hover:scale-125"
                  />
                  {/* Category Indicator Icon/Character */}
                  <text
                    x={cx}
                    y={cy + 3}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="8"
                    fontWeight="bold"
                  >
                    {c.category === "Food" ? "F" : c.category === "Water Station" ? "W" : "M"}
                  </text>
                </g>
              );
            })}

            {/* INCIDENTS OVERLAY HOTSPOTS - Pulsing circles placed on incident locations */}
            {incidents.map((inc, idx) => {
              // Let's place incidents at specific seating sections (e.g., Section 114, 142)
              // Section 114 (Concourse Level 1) -> angle around 45deg
              // Section 142 -> angle around 210deg
              // Fallback placement:
              let angle = 45;
              if (inc.location.includes("142")) angle = 210;
              else if (inc.location.includes("Shop")) angle = 315;
              else angle = 120 + idx * 35;

              const r = inc.status === "Resolved" ? 115 : 125; // placed near concourse
              const rad = (angle * Math.PI) / 180;
              const cx = 250 + r * Math.cos(rad);
              const cy = 200 + r * Math.sin(rad);

              if (inc.status === "Resolved") {
                return (
                  <g
                    key={inc.id}
                    className="cursor-pointer"
                    onClick={() => onSelectIncident?.(inc.id)}
                    onMouseEnter={() =>
                      setHoveredItem({
                        type: "incident",
                        name: `Incident RESOLVED: ${inc.id}`,
                        details: inc.description,
                      })
                    }
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <circle cx={cx} cy={cy} r="7" fill="#10b981" stroke="#fff" strokeWidth="1" />
                    <circle cx={cx} cy={cy} r="3" fill="#ffffff" />
                  </g>
                );
              }

              return (
                <g
                  key={inc.id}
                  className="cursor-pointer group"
                  onClick={() => onSelectIncident?.(inc.id)}
                  onMouseEnter={() =>
                    setHoveredItem({
                      type: "incident",
                      name: `🚨 ${inc.category} Incident (${inc.severity})`,
                      details: `${inc.location}: ${inc.description}`,
                    })
                  }
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <circle
                    cx={cx}
                    cy={cy}
                    r="12"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="1.5"
                    className="animate-ping"
                  />
                  <circle
                    cx={cx}
                    cy={cy}
                    r="8"
                    fill="#ef4444"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    className="transition-all duration-300 group-hover:scale-125"
                  />
                  <path
                    d={`M ${cx} ${cy - 3} L ${cx} ${cy + 1} M ${cx} ${cy + 3} L ${cx} ${cy + 3.5}`}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </g>
              );
            })}
          </svg>

          {/* Hover Tooltip Overlay */}
          {hoveredItem && (
            <div className="absolute bottom-4 left-4 right-4 bg-black/85 border border-white/10 p-3 rounded-xl text-xs shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="flex items-center gap-1.5 mb-1">
                {hoveredItem.type === "gate" && <span className="w-2 h-2 rounded-full bg-emerald-500"></span>}
                {hoveredItem.type === "concession" && <span className="w-2 h-2 rounded-full bg-blue-500"></span>}
                {hoveredItem.type === "incident" && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>}
                <span className="font-mono text-[11px] font-bold text-slate-100 uppercase tracking-wide">{hoveredItem.name}</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed font-sans">{hoveredItem.details}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
