/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Volunteer, Incident } from "../types";
import { Users, CheckSquare, Plus, AlertTriangle, ShieldCheck, Languages, Sparkles, BookOpen } from "lucide-react";

interface VolunteerDashboardProps {
  volunteers: Volunteer[];
  incidents: Incident[];
  onReportIncident: (newIncident: Omit<Incident, "id" | "reportedAt" | "status" | "aiDispatchRecommendation">) => void;
}

export const VolunteerDashboard: React.FC<VolunteerDashboardProps> = ({
  volunteers,
  incidents,
  onReportIncident,
}) => {
  // Use Amina Al-Sayed as the primary active volunteer profile for the dashboard
  const activeVolunteer = volunteers.find((v) => v.id === "v3") || volunteers[0];

  // Simulated Volunteer task checklist
  const [tasks, setTasks] = useState([
    { id: "t-1", title: "Review emergency stadium exit coordinates", completed: true },
    { id: "t-2", title: "Conduct check of hydration stations near Plaza Level", completed: false },
    { id: "t-3", title: "Monitor Section 114 stairs for liquid hazard warning taping", completed: false },
  ]);

  // Handle task completion
  const handleToggleTask = (id: string) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  // Create custom task
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    setTasks([
      ...tasks,
      { id: `t-${Date.now()}`, title: newTaskTitle, completed: false },
    ]);
    setNewTaskTitle("");
  };

  // Incident reporting state
  const [reportLoc, setReportLoc] = useState("");
  const [reportCat, setReportCat] = useState<Incident["category"]>("Facility");
  const [reportSev, setReportSev] = useState<Incident["severity"]>("Medium");
  const [reportDesc, setReportDesc] = useState("");
  const [reportFeedback, setReportFeedback] = useState("");

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportLoc.trim() || !reportDesc.trim()) return;

    onReportIncident({
      description: reportDesc,
      location: reportLoc,
      category: reportCat,
      severity: reportSev,
    });

    setReportFeedback(`🚨 Success! Incident dispatched to Stadium Ops Command Center. Check Command tab to review.`);
    setReportLoc("");
    setReportDesc("");
    
    setTimeout(() => {
      setReportFeedback("");
    }, 4500);
  };

  // Multilingual Speech translator helper
  const [specLang, setSpecLang] = useState("Japanese");
  const [specText, setSpecText] = useState("");
  const [translateResult, setTranslateResult] = useState<{
    english: string;
    actionGuide: string;
  } | null>(null);

  const handleTranslateSpec = () => {
    if (!specText.trim()) return;

    const query = specText.toLowerCase();
    let english = "Unable to translate instantly. Use AI chat above for full-stream translation.";
    let actionGuide = "Guide spectator to the nearest information desk or ask supervisor.";

    if (specLang === "Japanese") {
      if (query.includes("パスポート") || query.includes("pasupoto") || query.includes("lost")) {
        english = "I lost my passport near the stadium entrance.";
        actionGuide = "Official lost passport protocol: Direct guest to Plaza Level Fan Shop Lost & Found hub. Ask if they need a volunteer to escort them.";
      } else if (query.includes("トイレ") || query.includes("toire") || query.includes("bathroom")) {
        english = "Where is the restroom?";
        actionGuide = "Direct guest to Concourse Section 118 or Section 128 bathrooms. All bathrooms are wheelchair-accessible.";
      }
    } else if (specLang === "Spanish") {
      if (query.includes("perdí") || query.includes("hijo") || query.includes("niño")) {
        english = "I lost my son, I can't find him.";
        actionGuide = "EMERGENCY Protocol: Stay with parent. Ask for child's name, age, clothing colors, and seat number. Message Stadium Ops Command instantly via the Incident tool.";
      }
    } else if (specLang === "Arabic") {
      if (query.includes("طبيب") || query.includes("medical") || query.includes("doctor")) {
        english = "I need a doctor, my husband feels dizzy.";
        actionGuide = "CRITICAL MEDICAL Protocol: Stay with guest, keep them seated. Call nearest medical volunteer Mateo Silva (Section 128 Hub). Keep area clear.";
      }
    }

    setTranslateResult({ english, actionGuide });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Volunteer profile header info */}
      <div className="bg-white/5 border border-white/10 p-5 rounded-2xl shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 bg-blue-600/15 border border-blue-500/30 rounded-2xl flex items-center justify-center text-slate-100 font-sans font-bold shadow-inner">
            🦺
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-sans font-bold text-white text-base">{activeVolunteer.name}</h3>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/40 border border-emerald-500/20 text-[9px] font-mono font-bold tracking-wider text-emerald-400 uppercase">
                {activeVolunteer.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Duty Station: <strong className="text-slate-200 font-mono">{activeVolunteer.location}</strong> | Languages: {activeVolunteer.languages.join(", ")}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {activeVolunteer.skills.map((skill, idx) => (
            <span key={idx} className="bg-black/40 border border-white/10 px-2.5 py-1 rounded-lg text-[9px] font-mono font-bold uppercase tracking-wider text-slate-300">
              ✓ {skill}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Task Checklist Panel */}
        <div className="lg:col-span-1 bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col justify-between relative overflow-hidden">
          <div>
            <div className="flex items-center gap-2.5 mb-4 border-b border-white/5 pb-3">
              <CheckSquare className="w-5 h-5 text-blue-400" />
              <h3 className="font-mono font-bold text-white text-xs uppercase tracking-widest">Shift Task Board</h3>
            </div>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              Complete on-duty tasks. Tap to check off list or add quick notes.
            </p>

            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => handleToggleTask(task.id)}
                  className={`p-3.5 rounded-xl border flex items-start gap-3.5 cursor-pointer transition-all ${
                    task.completed
                      ? "bg-black/20 border-white/5 text-slate-500 line-through"
                      : "bg-black/40 border border-white/10 hover:border-white/20 text-slate-200"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => {}} // handled by click
                    className="mt-0.5 w-4 h-4 accent-blue-500 rounded border-white/10 bg-black"
                  />
                  <span className="text-xs font-sans leading-relaxed">{task.title}</span>
                </div>
              ))}
            </div>
          </div>

          <form id="add-task-form" onSubmit={handleAddTask} className="flex gap-2 mt-6">
            <input
              id="new-task-input"
              type="text"
              placeholder="Add personal shift task..."
              className="bg-black/40 border border-white/10 focus:border-blue-500 rounded-xl px-4 py-3 text-xs text-white focus:outline-none w-full outline-none"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
            />
            <button
              id="add-task-btn"
              type="submit"
              className="p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all cursor-pointer flex-shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>
        </div>

        {/* Volunteer-Spectator Multilingual Helper & Protocol Dictionary */}
        <div className="lg:col-span-1 bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col justify-between relative overflow-hidden">
          <div>
            <div className="flex items-center gap-2.5 mb-4 border-b border-white/5 pb-3">
              <Languages className="w-5 h-5 text-blue-400" />
              <h3 className="font-mono font-bold text-white text-xs uppercase tracking-widest">Fan Phrase Decoder</h3>
            </div>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              When a spectator speaks, write what they are saying in phonetic text or keywords. Get immediate translations and standard operations guidelines.
            </p>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest block mb-1.5">Language</label>
                  <select
                    id="spec-lang-select"
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-slate-300 focus:border-blue-500 outline-none"
                    value={specLang}
                    onChange={(e) => setSpecLang(e.target.value)}
                  >
                    <option value="Japanese">Japanese 🇯🇵</option>
                    <option value="Spanish">Spanish 🇲🇽</option>
                    <option value="Arabic">Arabic 🇸🇦</option>
                  </select>
                </div>
                <div>
                  <label className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest block mb-1.5">Keywords</label>
                  <span className="text-[10px] font-mono text-slate-400 bg-black/40 p-2.5 rounded-xl block border border-white/10 text-center truncate font-bold">
                    {specLang === "Japanese" ? "pasupoto / lost" : specLang === "Spanish" ? "niño / lost son" : "medical / doctor"}
                  </span>
                </div>
              </div>

              <input
                id="spectator-phrase-input"
                type="text"
                placeholder={specLang === "Japanese" ? "e.g. 'toire' or 'pasupoto'" : "e.g. 'perdi mi hijo'"}
                className="w-full bg-black/40 border border-white/10 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none outline-none"
                value={specText}
                onChange={(e) => setSpecText(e.target.value)}
              />

              <button
                id="spec-translate-btn"
                onClick={handleTranslateSpec}
                className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-bold font-mono uppercase tracking-widest rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5 text-blue-400" /> Decode Spectator Need
              </button>

              {translateResult && (
                <div className="bg-black/40 p-4 rounded-xl border border-white/10 space-y-3 text-xs animate-in fade-in duration-200">
                  <div>
                    <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest">English Translation</span>
                    <p className="text-slate-200 font-medium mt-1">"{translateResult.english}"</p>
                  </div>
                  <div className="border-t border-white/10 pt-2.5 flex gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest">Recommended Protocol</span>
                      <p className="text-slate-300 text-[11px] mt-1 leading-relaxed">{translateResult.actionGuide}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <p className="text-[10px] text-slate-500 leading-relaxed mt-5 bg-black/20 p-3 rounded-xl border border-white/5 font-mono uppercase tracking-wider">
            🔊 ASK THE GEMINI COACH IN THE CHAT PANEL TO TRANSLATE SPEECH PHRASES FOR CUSTOMIZED ASSISTANCE.
          </p>
        </div>

        {/* Live Incident Reporter Console */}
        <div className="lg:col-span-1 bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
          <div className="flex items-center gap-2.5 mb-4 border-b border-white/5 pb-3">
            <AlertTriangle className="w-5 h-5 text-blue-400" />
            <h3 className="font-mono font-bold text-white text-xs uppercase tracking-widest">Report Incident</h3>
          </div>
          <p className="text-xs text-slate-400 mb-5 leading-relaxed">
            Spotted a physical hazard, medical emergency, or facility bottleneck? Submitting goes straight to Command Staff and triggers AI Auto-Dispatch routing.
          </p>

          <form id="incident-report-form" onSubmit={handleReportSubmit} className="space-y-4">
            <div>
              <label className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest block mb-1.5">Specific Location</label>
              <input
                id="report-location-input"
                type="text"
                placeholder="e.g. Section 112 Stairs, Gate B Entry..."
                className="w-full bg-black/40 border border-white/10 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none outline-none"
                value={reportLoc}
                onChange={(e) => setReportLoc(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest block mb-1.5">Category</label>
                <select
                  id="report-category-select"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-2 py-2.5 text-xs text-slate-300 focus:border-blue-500 outline-none"
                  value={reportCat}
                  onChange={(e) => setReportCat(e.target.value as Incident["category"])}
                >
                  <option value="Facility">Facility/Spill</option>
                  <option value="Medical">Medical Urgent</option>
                  <option value="Security">Security Issue</option>
                  <option value="Lost & Found">Lost & Found</option>
                  <option value="Accessibility Help">Accessibility Help</option>
                </select>
              </div>

              <div>
                <label className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest block mb-1.5">Severity</label>
                <select
                  id="report-severity-select"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-2 py-2.5 text-xs text-slate-300 focus:border-blue-500 outline-none"
                  value={reportSev}
                  onChange={(e) => setReportSev(e.target.value as Incident["severity"])}
                >
                  <option value="Low">Low (Minor)</option>
                  <option value="Medium">Medium</option>
                  <option value="Critical">Critical (Immediate)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest block mb-1.5">Issue Details</label>
              <textarea
                id="report-description-textarea"
                placeholder="Describe what you see clearly (materials, fan state)..."
                rows={3}
                className="w-full bg-black/40 border border-white/10 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none resize-none outline-none"
                value={reportDesc}
                onChange={(e) => setReportDesc(e.target.value)}
                required
              />
            </div>

            <button
              id="report-submit-btn"
              type="submit"
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold font-mono uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-blue-500/20"
            >
              <Sparkles className="w-4 h-4" /> Dispatch Alert
            </button>

            {reportFeedback && (
              <div className="p-3.5 bg-emerald-950/20 border border-emerald-500/20 text-emerald-400 text-[11px] rounded-xl flex items-start gap-2 animate-in fade-in duration-200">
                <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-400" />
                <span className="leading-relaxed">{reportFeedback}</span>
              </div>
            )}
          </form>
        </div>

      </div>
    </div>
  );
};
