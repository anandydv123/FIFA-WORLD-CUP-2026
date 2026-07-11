/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo, useCallback } from "react";
import { UserRole, Stadium, Gate, Concession, Volunteer, TransitRoute, Incident, StadiumTelemetry } from "./types";
import {
  STADIUMS,
  INITIAL_GATES,
  INITIAL_CONCESSIONS,
  INITIAL_VOLUNTEERS,
  INITIAL_TRANSIT,
  INITIAL_INCIDENTS,
} from "./data";
import { Header } from "./components/Header";
import { StadiumMap } from "./components/StadiumMap";
import { ChatPanel } from "./components/ChatPanel";
import { FanDashboard } from "./components/FanDashboard";
import { VolunteerDashboard } from "./components/VolunteerDashboard";
import { OpsDashboard } from "./components/OpsDashboard";
import { AccessibilityOverlay } from "./components/AccessibilityOverlay";
import { Trophy, HelpCircle, Footprints, Shield } from "lucide-react";

export default function App() {
  // ----------------------------------------------------
  // CORE STATES
  // ----------------------------------------------------
  const [currentRole, setCurrentRole] = useState<UserRole>(UserRole.FAN);
  const [selectedStadium, setSelectedStadium] = useState<Stadium>(STADIUMS[0]);
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState(false);

  // Stadium collections (stateful copy of static data to allow simulation edits)
  const [gates, setGates] = useState<Record<string, Gate[]>>({ ...INITIAL_GATES });
  const [concessions, setConcessions] = useState<Record<string, Concession[]>>({ ...INITIAL_CONCESSIONS });
  const [volunteers, setVolunteers] = useState<Volunteer[]>([...INITIAL_VOLUNTEERS]);
  const [transit, setTransit] = useState<TransitRoute[]>([...INITIAL_TRANSIT]);
  const [incidents, setIncidents] = useState<Incident[]>([...INITIAL_INCIDENTS]);

  // Keep separate simple states for dynamic telemetry fields
  const [sustainabilityScore, setSustainabilityScore] = useState(92);
  const [concessionEfficiency, setConcessionEfficiency] = useState(88);

  // Calculate dynamic telemetry values on rendering to avoid double render state update lag
  const telemetry = useMemo<StadiumTelemetry>(() => {
    const activeGates = gates[selectedStadium.id] || [];
    const openGates = activeGates.filter((g) => g.status !== "Closed");
    const avgWait = openGates.length > 0
      ? Math.round(openGates.reduce((acc, curr) => acc + curr.waitMinutes, 0) / openGates.length)
      : 0;

    const activeIncs = incidents.filter((i) => i.status !== "Resolved").length;

    return {
      crowdDensity: Math.min(95, Math.max(40, 70 + avgWait / 2 + activeIncs * 3)),
      activeIncidentsCount: activeIncs,
      averageGateWaitMinutes: avgWait,
      concessionEfficiency,
      transitLoad: Math.min(95, Math.max(30, 60 + avgWait)),
      sustainabilityScore,
    };
  }, [gates, incidents, selectedStadium, sustainabilityScore, concessionEfficiency]);

  // ----------------------------------------------------
  // EVENT HANDLERS / MUTATORS
  // ----------------------------------------------------

  // Reset simulator
  const handleResetSim = useCallback(() => {
    setGates({ ...INITIAL_GATES });
    setConcessions({ ...INITIAL_CONCESSIONS });
    setVolunteers([...INITIAL_VOLUNTEERS]);
    setTransit([...INITIAL_TRANSIT]);
    setIncidents([...INITIAL_INCIDENTS]);
    setSustainabilityScore(92);
    setConcessionEfficiency(88);
  }, []);

  // Submit Incident Report (from Volunteer shift console or generic spectators)
  const handleReportIncident = useCallback((
    newInc: Omit<Incident, "id" | "reportedAt" | "status" | "aiDispatchRecommendation">
  ) => {
    const freshIncident: Incident = {
      ...newInc,
      id: `inc-${Date.now().toString().slice(-3)}`,
      reportedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "Reported",
      aiDispatchRecommendation: "Analytic: Pending Command center auto-dispatch routing.",
    };

    setIncidents((prev) => [freshIncident, ...prev]);
  }, []);

  // Update Incident Status (Dispatch/Resolve)
  const handleUpdateIncidentStatus = useCallback((
    incidentId: string,
    status: "Dispatched" | "Resolved",
    volunteerId?: string,
    volunteerName?: string,
    aiRec?: string
  ) => {
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id === incidentId) {
          return {
            ...inc,
            status,
            assignedVolunteerId: volunteerId || inc.assignedVolunteerId,
            assignedVolunteerName: volunteerName || inc.assignedVolunteerName,
            aiDispatchRecommendation: aiRec || inc.aiDispatchRecommendation,
          };
        }
        return inc;
      })
    );
  }, []);

  // Update Volunteer Shift Status
  const handleUpdateVolunteerStatus = useCallback((volunteerId: string, status: Volunteer["status"]) => {
    setVolunteers((prev) =>
      prev.map((vol) => (vol.id === volunteerId ? { ...vol, status } : vol))
    );
  }, []);

  // Refresh Telemetry Sensors (Slight randomizers to represent dynamic streams)
  const handleRefreshTelemetry = useCallback(() => {
    setSustainabilityScore((prev) => Math.min(100, Math.max(60, prev + (Math.random() > 0.5 ? 2 : -2))));
    setConcessionEfficiency((prev) => Math.min(100, Math.max(70, prev + (Math.random() > 0.5 ? 3 : -3))));

    // Randomize some gate wait times slightly to demonstrate reactivity
    setGates((prev) => {
      const currentStadiumId = selectedStadium.id;
      const gatesToUpdate = prev[currentStadiumId] || [];
      const updatedGates = gatesToUpdate.map((g) => {
        if (g.status === "Closed") return g;
        const diff = Math.random() > 0.5 ? 2 : -2;
        return {
          ...g,
          waitMinutes: Math.max(2, g.waitMinutes + diff),
        };
      });
      return {
        ...prev,
        [currentStadiumId]: updatedGates,
      };
    });
  }, [selectedStadium]);

  // Quick action triggers from clicking Map items
  const handleMapGateClick = useCallback((gateName: string) => {
    const chatInput = document.getElementById("chat-input-field") as HTMLInputElement;
    if (chatInput) {
      chatInput.value = `Tell me about the wait times and access routes near ${gateName}`;
      chatInput.focus();
    }
  }, []);

  const handleMapConcessionClick = useCallback((id: string) => {
    const conc = (concessions[selectedStadium.id] || []).find((c) => c.id === id);
    if (!conc) return;
    const chatInput = document.getElementById("chat-input-field") as HTMLInputElement;
    if (chatInput) {
      chatInput.value = `Is there low congestion at ${conc.name} located at ${conc.location}? What specialty food do they have?`;
      chatInput.focus();
    }
  }, [concessions, selectedStadium]);

  const handleMapIncidentClick = useCallback((id: string) => {
    const inc = incidents.find((i) => i.id === id);
    if (!inc) return;
    // Highlight or ask in chat
    const chatInput = document.getElementById("chat-input-field") as HTMLInputElement;
    if (chatInput) {
      chatInput.value = `Can you analyze stadium incident ${inc.id} (${inc.category}) at ${inc.location}? Provide safety action guidelines.`;
      chatInput.focus();
    }
  }, [incidents]);

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 flex flex-col justify-between">
      
      {/* Shared Header Controls */}
      <Header
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        selectedStadium={selectedStadium}
        setSelectedStadium={setSelectedStadium}
        stadiums={STADIUMS}
        onResetSim={handleResetSim}
        onOpenAccessibility={() => setIsAccessibilityOpen(true)}
      />

      {/* Main Grid Content Area */}
      <main className="max-w-7xl w-full mx-auto px-4 py-6 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Role Specific Main Dashboard - Spans 7 cols */}
        <section className="lg:col-span-7 space-y-6">
          
          {/* Welcome Match Jumbotron Card */}
          <div className="bg-gradient-to-r from-emerald-950/80 to-slate-900 border border-emerald-800/40 p-5 rounded-2xl shadow-xl flex items-center justify-between overflow-hidden relative">
            <div className="space-y-1 z-10">
              <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider block">
                {selectedStadium.featuredMatch.stage}
              </span>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500 flex-shrink-0" />
                {selectedStadium.featuredMatch.home} <span className="text-slate-400 font-normal">vs</span> {selectedStadium.featuredMatch.away}
              </h2>
              <p className="text-xs text-slate-400">
                Kickoff scheduled for: <strong>{selectedStadium.featuredMatch.time}</strong>
              </p>
            </div>
            {/* Visual stadium accent background graphics */}
            <div className="absolute right-0 top-0 bottom-0 opacity-10 flex items-center pr-4">
              <Trophy className="w-48 h-48 stroke-[1]" />
            </div>
          </div>

          {/* Render Specialized Role Dashboard */}
          {currentRole === UserRole.FAN && (
            <FanDashboard
              selectedStadium={selectedStadium}
              gates={gates[selectedStadium.id] || []}
              concessions={concessions[selectedStadium.id] || []}
              transit={transit}
              onOpenAccessibility={() => setIsAccessibilityOpen(true)}
            />
          )}

          {currentRole === UserRole.VOLUNTEER && (
            <VolunteerDashboard
              volunteers={volunteers}
              incidents={incidents}
              onReportIncident={handleReportIncident}
            />
          )}

          {currentRole === UserRole.OPERATIONS && (
            <OpsDashboard
              selectedStadium={selectedStadium}
              gates={gates[selectedStadium.id] || []}
              incidents={incidents}
              volunteers={volunteers}
              transit={transit}
              telemetry={telemetry}
              onUpdateIncidentStatus={handleUpdateIncidentStatus}
              onUpdateVolunteerStatus={handleUpdateVolunteerStatus}
              onRefreshTelemetry={handleRefreshTelemetry}
            />
          )}
        </section>

        {/* Right Side: Copilot Companion & Live Map Overlays - Spans 5 cols */}
        <section className="lg:col-span-5 space-y-6 lg:sticky lg:top-[120px]">
          
          {/* 1. Interactive Stadium Map Overlays */}
          <StadiumMap
            gates={gates[selectedStadium.id] || []}
            concessions={concessions[selectedStadium.id] || []}
            incidents={incidents}
            onSelectGate={handleMapGateClick}
            onSelectConcession={handleMapConcessionClick}
            onSelectIncident={handleMapIncidentClick}
          />

          {/* 2. Statefully Connected Conversational AI Copilot Chat */}
          <ChatPanel
            currentRole={currentRole}
            selectedStadium={selectedStadium}
            gates={gates[selectedStadium.id] || []}
            concessions={concessions[selectedStadium.id] || []}
            volunteers={volunteers}
            transit={transit}
            incidents={incidents}
            telemetry={telemetry}
          />
        </section>
      </main>

      {/* Footer credits and guidelines */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 mt-12 text-center text-slate-500 text-[10px] font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>FIFA 2026 ArenaShield Security & Operations Engine</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><Footprints className="w-3 h-3" /> Net-Zero Carbon World Cup</span>
            <span className="flex items-center gap-1"><HelpCircle className="w-3 h-3" /> Helpdesk: Ext 2026</span>
          </div>
        </div>
      </footer>

      {isAccessibilityOpen && (
        <AccessibilityOverlay
          selectedStadium={selectedStadium}
          onClose={() => setIsAccessibilityOpen(false)}
          onReportIncident={handleReportIncident}
        />
      )}
    </div>
  );
}
