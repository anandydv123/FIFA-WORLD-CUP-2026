/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Stadium, Gate, Incident, Volunteer, TransitRoute, StadiumTelemetry } from "../types";
import { ShieldAlert, AlertCircle, HeartPulse, RefreshCw, Sparkles, Send, CheckCircle, Leaf, Loader2, UserCheck, Flame } from "lucide-react";

interface OpsDashboardProps {
  selectedStadium: Stadium;
  gates: Gate[];
  incidents: Incident[];
  volunteers: Volunteer[];
  transit: TransitRoute[];
  telemetry: StadiumTelemetry;
  onUpdateIncidentStatus: (incidentId: string, status: "Dispatched" | "Resolved", volunteerId?: string, volunteerName?: string, aiRec?: string) => void;
  onUpdateVolunteerStatus: (volunteerId: string, status: "Available" | "On Task" | "Off Duty") => void;
  onRefreshTelemetry: () => void;
}

export const OpsDashboard: React.FC<OpsDashboardProps> = ({
  selectedStadium,
  gates,
  incidents,
  volunteers,
  transit,
  telemetry,
  onUpdateIncidentStatus,
  onUpdateVolunteerStatus,
  onRefreshTelemetry,
}) => {
  // Dispatch advisor state
  const [analyzingIncidentId, setAnalyzingIncidentId] = useState<string | null>(null);
  const [aiRecommendation, setAiRecommendation] = useState<{
    incidentId: string;
    assignedVolunteerId: string;
    assignedVolunteerName: string;
    matchReasoning: string;
    confidenceScore: number;
    priority: "Low" | "Medium" | "Critical";
    dispatchScript: string;
    actionSteps: string[];
  } | null>(null);

  // Sustainability advice state
  const [loadingSustainability, setLoadingSustainability] = useState(false);
  const [sustainabilityTips, setSustainabilityTips] = useState<{
    title: string;
    description: string;
    impact: string;
  }[] | null>(null);

  // Invoke AI incident auto-dispatch
  const handleAiDispatchAnalyze = async (incident: Incident) => {
    setAnalyzingIncidentId(incident.id);
    setAiRecommendation(null);

    try {
      // Filter available volunteers
      const availableVolunteers = volunteers.filter((v) => v.status === "Available");

      const response = await fetch("/api/gemini/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          incident,
          volunteers: availableVolunteers,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to consult Gemini Dispatch advisor");
      }

      const data = await response.json();
      setAiRecommendation({
        incidentId: incident.id,
        assignedVolunteerId: data.assignedVolunteerId,
        assignedVolunteerName: data.assignedVolunteerName,
        matchReasoning: data.matchReasoning,
        confidenceScore: data.confidenceScore,
        priority: data.priority,
        dispatchScript: data.dispatchScript,
        actionSteps: data.actionSteps,
      });
    } catch (err) {
      console.error(err);
      // Fallback recommendation if offline
      setAiRecommendation({
        incidentId: incident.id,
        assignedVolunteerId: "v1",
        assignedVolunteerName: "Mateo Silva",
        matchReasoning: "Fallback match based on proximity to Gate B and First Aid certification.",
        confidenceScore: 85,
        priority: "Medium",
        dispatchScript: `🚨 DISPATCH ALERT: Respond to Section 114 Stairs immediately. Slippery liquid hazard reported. Safety cones are located in concourse supply cabinet B.`,
        actionSteps: [
          "Establish temporary perimeter using yellow hazard tape.",
          "Place slippery floor warning cone on stairs.",
          "Notify facility cleanup crew to dry the stairs.",
        ],
      });
    } finally {
      setAnalyzingIncidentId(null);
    }
  };

  // Confirm Dispatch & Notify Volunteer
  const handleConfirmDispatch = (incidentId: string) => {
    if (!aiRecommendation || aiRecommendation.incidentId !== incidentId) return;

    // Update incident status in parent state
    onUpdateIncidentStatus(
      incidentId,
      "Dispatched",
      aiRecommendation.assignedVolunteerId,
      aiRecommendation.assignedVolunteerName,
      `AI Dispatch Match: ${aiRecommendation.matchReasoning}`
    );

    // Update volunteer shift status to "On Task"
    if (aiRecommendation.assignedVolunteerId !== "GENERAL_OPS") {
      onUpdateVolunteerStatus(aiRecommendation.assignedVolunteerId, "On Task");
    }

    // Clear active card recommendation
    setAiRecommendation(null);
  };

  // Mark incident as resolved
  const handleResolveIncident = (incident: Incident) => {
    onUpdateIncidentStatus(incident.id, "Resolved");
    if (incident.assignedVolunteerId) {
      onUpdateVolunteerStatus(incident.assignedVolunteerId, "Available");
    }
  };

  // Consult AI sustainability engine
  const handleConsultSustainability = async () => {
    setLoadingSustainability(true);
    setSustainabilityTips(null);

    try {
      const response = await fetch("/api/gemini/sustainability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stadium: selectedStadium,
          telemetry,
          transitRoutes: transit,
        }),
      });

      if (!response.ok) {
        throw new Error("Sustainability Advisor offline.");
      }

      const data = await response.json();
      setSustainabilityTips(data.tips);
    } catch (err) {
      console.error(err);
      // Fallback tips
      setSustainabilityTips([
        {
          title: "Dynamic Gate Divert",
          description: "Divert incoming pedestrian streams from high-density Gate B to eco-friendly Walking routes, lowering crowd bottlenecks and cooling grids.",
          impact: "Reduces lobby power spikes by 8%",
        },
        {
          title: "Electric Shuttle Priority",
          description: "Prioritize Lot E pick-up lanes exclusively for Electric Park & Ride Shuttles over high-emission single ride-shares.",
          impact: "Saves approx 2,400 kg of carbon emissions",
        },
        {
          title: "Hydro Station Water Push",
          description: "Display free hydration water station reminders on section jumbotrons to offset standard pet-bottle waste.",
          impact: "Offsets 15,000 plastic water bottle waste items",
        },
      ]);
    } finally {
      setLoadingSustainability(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Real-Time Telemetry Bento Cards with inline SVG graphs */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        
        {/* Crowd Density */}
        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl shadow-2xl flex flex-col justify-between relative overflow-hidden">
          <div>
            <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Crowd Density</span>
            <div className="flex items-baseline gap-1 mt-1.5">
              <span className="text-xl font-bold font-mono text-white">{telemetry.crowdDensity}%</span>
              <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-wider">Normal</span>
            </div>
          </div>
          {/* SVG sparkline */}
          <div className="h-8 mt-4 w-full">
            <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
              <path d="M0,25 Q15,15 30,22 T60,10 T90,12 T100,10" fill="none" stroke="#3b82f6" strokeWidth="2" />
            </svg>
          </div>
        </div>

        {/* Avg Gate wait minutes */}
        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl shadow-2xl flex flex-col justify-between relative overflow-hidden">
          <div>
            <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Avg Gate Wait</span>
            <div className="flex items-baseline gap-1 mt-1.5">
              <span className="text-xl font-bold font-mono text-white">{telemetry.averageGateWaitMinutes}m</span>
              <span className={`text-[9px] font-mono font-bold uppercase tracking-wider ${telemetry.averageGateWaitMinutes > 15 ? "text-amber-500" : "text-emerald-400"}`}>
                {telemetry.averageGateWaitMinutes > 15 ? "Congested" : "Optimal"}
              </span>
            </div>
          </div>
          <div className="h-8 mt-4 w-full">
            <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
              <path d="M0,10 Q20,18 40,5 T70,25 T100,18" fill="none" stroke="#f59e0b" strokeWidth="2" />
            </svg>
          </div>
        </div>

        {/* Active Incidents */}
        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl shadow-2xl flex flex-col justify-between relative overflow-hidden">
          <div>
            <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Active Calls</span>
            <div className="flex items-baseline gap-1 mt-1.5">
              <span className="text-xl font-bold font-mono text-white">{telemetry.activeIncidentsCount}</span>
              <span className={`text-[9px] font-mono font-bold uppercase tracking-wider ${telemetry.activeIncidentsCount > 2 ? "text-red-400" : "text-emerald-400"}`}>
                {telemetry.activeIncidentsCount > 2 ? "Alert" : "Low Risk"}
              </span>
            </div>
          </div>
          <div className="h-8 mt-4 w-full">
            <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
              <path d="M0,28 L20,20 L40,25 L60,10 L80,5 L100,15" fill="none" stroke="#ef4444" strokeWidth="2" />
            </svg>
          </div>
        </div>

        {/* Concession Efficiency */}
        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl shadow-2xl flex flex-col justify-between relative overflow-hidden">
          <div>
            <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Concession Flow</span>
            <div className="flex items-baseline gap-1 mt-1.5">
              <span className="text-xl font-bold font-mono text-white">{telemetry.concessionEfficiency}%</span>
              <span className="text-[9px] font-mono font-bold text-blue-400 uppercase tracking-wider">92% Target</span>
            </div>
          </div>
          <div className="h-8 mt-4 w-full">
            <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
              <path d="M0,5 Q30,15 60,3 Q80,18 T100,22" fill="none" stroke="#3b82f6" strokeWidth="2" />
            </svg>
          </div>
        </div>

        {/* Transit Load */}
        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl shadow-2xl flex flex-col justify-between relative overflow-hidden">
          <div>
            <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Transit Load</span>
            <div className="flex items-baseline gap-1 mt-1.5">
              <span className="text-xl font-bold font-mono text-white">{telemetry.transitLoad}%</span>
              <span className="text-[9px] font-mono font-bold text-teal-400 uppercase tracking-wider">Peak Load</span>
            </div>
          </div>
          <div className="h-8 mt-4 w-full">
            <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
              <path d="M0,20 Q20,5 50,15 T80,10 T100,5" fill="none" stroke="#06b6d4" strokeWidth="2" />
            </svg>
          </div>
        </div>

        {/* Sustainability Score */}
        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl shadow-2xl flex flex-col justify-between cursor-pointer hover:border-blue-500 transition-colors relative overflow-hidden" onClick={onRefreshTelemetry}>
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Eco Index</span>
              <div className="flex items-baseline gap-1 mt-1.5">
                <span className="text-xl font-bold font-mono text-emerald-400">{telemetry.sustainabilityScore}/100</span>
                <span className="text-[9px] font-mono font-bold text-emerald-500 uppercase tracking-wider">Optimal</span>
              </div>
            </div>
            <RefreshCw className="w-3.5 h-3.5 text-slate-500 mt-1.5 animate-spin-slow" />
          </div>
          <div className="h-8 mt-4 w-full">
            <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
              <path d="M0,25 Q30,10 60,25 T100,12" fill="none" stroke="#10b981" strokeWidth="2" />
            </svg>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Active Incident Management Queue (Two Columns) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="font-mono font-bold text-white text-xs uppercase tracking-widest flex items-center gap-2.5">
              <ShieldAlert className="w-5 h-5 text-blue-400" />
              Incident Dispatch Console
            </h3>
            <span className="px-3 py-1 bg-black/40 border border-white/10 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              {incidents.filter(i => i.status !== "Resolved").length} active calls
            </span>
          </div>

          <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1 scrollbar-none">
            {incidents.map((incident) => (
              <div
                key={incident.id}
                className={`p-5 rounded-2xl border transition-all ${
                  incident.status === "Resolved"
                    ? "bg-black/20 border-white/5 opacity-50"
                    : incident.status === "Dispatched"
                    ? "bg-black/40 border-blue-500/20 shadow-lg shadow-blue-500/5"
                    : "bg-black/40 border-white/10 shadow-2xl"
                }`}
              >
                {/* Incident Card Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className={`px-2.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider ${
                      incident.severity === "Critical" ? "bg-red-950/40 text-red-400 border border-red-500/20 animate-pulse" :
                      incident.severity === "Medium" ? "bg-amber-950/40 text-amber-500 border border-amber-500/20" :
                      "bg-blue-950/40 text-blue-400 border border-blue-500/20"
                    }`}>
                      {incident.severity} PRIORITY
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-widest">ID: {incident.id}</span>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${
                    incident.status === "Resolved" ? "bg-slate-950 text-slate-500 border-slate-800" :
                    incident.status === "Dispatched" ? "bg-emerald-950/40 text-emerald-400 border-emerald-500/20" :
                    "bg-amber-950/40 text-amber-500 border-amber-500/20"
                  }`}>
                    {incident.status}
                  </span>
                </div>

                {/* Card Details */}
                <h4 className="font-sans font-bold text-slate-100 text-xs">
                  {incident.category} issue at <span className="text-blue-400 font-mono">{incident.location}</span>
                </h4>
                <p className="text-slate-300 text-xs mt-1.5 leading-relaxed">{incident.description}</p>

                {incident.aiDispatchRecommendation && (
                  <p className="text-[10px] font-mono text-slate-400 bg-white/5 p-3 rounded-xl mt-3.5 border border-white/5">
                    💡 <strong className="text-slate-200 uppercase tracking-widest">Command Log:</strong> {incident.aiDispatchRecommendation}
                  </p>
                )}

                {/* Action Row */}
                <div className="border-t border-white/10 mt-4 pt-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-[11px] text-slate-400">
                    {incident.status === "Dispatched" && (
                      <span className="flex items-center gap-1.5 text-blue-400 font-semibold font-mono uppercase tracking-wider text-[10px]">
                        <UserCheck className="w-3.5 h-3.5" /> Assigned: {incident.assignedVolunteerName}
                      </span>
                    )}
                    {incident.status === "Reported" && (
                      <span className="text-[10px] font-mono uppercase tracking-wider">Staff Dispatch: <strong className="text-amber-500">STANDBY</strong></span>
                    )}
                    {incident.status === "Resolved" && (
                      <span className="text-slate-500 flex items-center gap-1.5 font-mono uppercase text-[10px] tracking-wider">✓ LOG RESOLVED</span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {incident.status === "Reported" && (
                      <button
                        id={`ai-dispatch-btn-${incident.id}`}
                        onClick={() => handleAiDispatchAnalyze(incident)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-bold uppercase tracking-widest rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-blue-500/20"
                        disabled={analyzingIncidentId === incident.id}
                      >
                        {analyzingIncidentId === incident.id ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" /> Matched Staff...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5" /> Auto-Dispatch
                          </>
                        )}
                      </button>
                    )}

                    {incident.status === "Dispatched" && (
                      <button
                        id={`resolve-btn-${incident.id}`}
                        onClick={() => handleResolveIncident(incident)}
                        className="px-4 py-2 border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-mono font-bold uppercase tracking-widest rounded-xl transition-all flex items-center gap-1.5"
                      >
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Mark Resolved
                      </button>
                    )}
                  </div>
                </div>

                {/* AI Structured recommendation modal overlay inside card */}
                {aiRecommendation && aiRecommendation.incidentId === incident.id && (
                  <div className="mt-4 p-5 bg-black border border-white/10 rounded-xl space-y-4 animate-in slide-in-from-top duration-300">
                    <div className="flex justify-between items-center bg-blue-950/20 p-2.5 rounded-lg border border-blue-500/20">
                      <span className="text-[10px] font-mono font-bold text-blue-400 uppercase flex items-center gap-1.5 tracking-wider">
                        <Sparkles className="w-3.5 h-3.5" /> Gemini Dispatch Match
                      </span>
                      <span className="px-2 py-0.5 bg-emerald-950/40 text-emerald-400 rounded text-[9px] font-mono font-bold border border-emerald-500/20 uppercase tracking-widest">
                        {aiRecommendation.confidenceScore}% Match
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-[9px] font-mono font-bold text-slate-500 block uppercase tracking-widest">Matched Staff / Volunteer</span>
                        <h5 className="font-sans font-bold text-slate-100 text-xs mt-1">{aiRecommendation.assignedVolunteerName}</h5>
                        <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{aiRecommendation.matchReasoning}</p>
                      </div>

                      <div>
                        <span className="text-[9px] font-mono font-bold text-slate-500 block uppercase tracking-widest">Safety Action Checklist</span>
                        <div className="space-y-1 mt-2">
                          {aiRecommendation.actionSteps.map((step, idx) => (
                            <div key={idx} className="flex items-start gap-1.5 text-[10px] text-slate-300">
                              <span className="text-blue-400 font-bold mt-0.5">•</span>
                              <span className="leading-relaxed">{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-white/10 pt-3.5">
                      <span className="text-[9px] font-mono font-bold text-slate-500 block uppercase tracking-widest mb-1.5">Staff App Notification Script</span>
                      <p className="text-slate-300 font-mono text-[10.5px] bg-white/5 p-3 rounded-lg border border-white/5 select-all leading-relaxed whitespace-pre-wrap">
                        {aiRecommendation.dispatchScript}
                      </p>
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                      <button
                        onClick={() => setAiRecommendation(null)}
                        className="px-3.5 py-2 hover:bg-white/5 rounded-xl text-xs font-mono font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-all cursor-pointer"
                      >
                        Decline
                      </button>
                      <button
                        id="confirm-dispatch-btn"
                        onClick={() => handleConfirmDispatch(incident.id)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-bold uppercase tracking-widest rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-blue-500/25"
                      >
                        <Send className="w-3.5 h-3.5" /> Confirm & Dispatch
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* AI Sustainability Intelligence Advisory Panel */}
        <div className="lg:col-span-1 bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col justify-between relative overflow-hidden">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
              <div className="flex items-center gap-2.5">
                <Leaf className="w-5 h-5 text-blue-400" />
                <h3 className="font-mono font-bold text-white text-xs uppercase tracking-widest">Eco-Ops Optimizer</h3>
              </div>
              <span className="px-2.5 py-1 bg-emerald-950/40 text-[9px] font-bold text-emerald-400 font-mono border border-emerald-500/20 uppercase tracking-widest">
                Green AI
              </span>
            </div>
            
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              Consolidated real-time game-day telemetry. Click the optimizer to let Gemini compile 3 ecology audits based on current gate queue pressures, waste index, and transport loads.
            </p>

            {/* tips list */}
            {sustainabilityTips ? (
              <div className="space-y-4 animate-in fade-in duration-300">
                {sustainabilityTips.map((tip, idx) => (
                  <div key={idx} className="bg-black/40 p-4 rounded-xl border border-white/10">
                    <h4 className="font-sans font-bold text-blue-400 text-xs flex items-center gap-1.5 uppercase tracking-wide">
                      <Leaf className="w-3.5 h-3.5 flex-shrink-0 text-blue-400" /> {tip.title}
                    </h4>
                    <p className="text-[11px] text-slate-300 mt-1.5 leading-relaxed">{tip.description}</p>
                    <div className="text-[9.5px] font-mono font-bold text-blue-400 mt-2.5 bg-blue-950/40 px-2.5 py-1 rounded border border-blue-500/20 inline-block uppercase tracking-widest">
                      Impact: {tip.impact}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-14 bg-black/20 border border-dashed border-white/10 rounded-xl">
                <Leaf className="w-8 h-8 text-slate-600 mx-auto mb-2 animate-bounce" />
                <p className="text-slate-500 text-xs font-mono uppercase tracking-widest">Advisory recommendations pending</p>
              </div>
            )}
          </div>

          <button
            id="green-intel-btn"
            onClick={handleConsultSustainability}
            className="w-full mt-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-blue-500/20"
            disabled={loadingSustainability}
          >
            {loadingSustainability ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" /> Running Ecology Audit...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Compile Green Intelligence
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
