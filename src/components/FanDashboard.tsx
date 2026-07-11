/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Gate, Concession, TransitRoute, Stadium } from "../types";
import { Search, Train, Compass, Accessibility, Coffee, Languages, ShieldCheck, Heart, Sparkles, Footprints } from "lucide-react";

interface FanDashboardProps {
  selectedStadium: Stadium;
  gates: Gate[];
  concessions: Concession[];
  transit: TransitRoute[];
  onOpenAccessibility: () => void;
}

export const FanDashboard: React.FC<FanDashboardProps> = ({
  selectedStadium,
  gates,
  concessions,
  transit,
  onOpenAccessibility,
}) => {
  // Seating locator state
  const [seatSection, setSeatSection] = useState("");
  const [locatorResult, setLocatorResult] = useState<{
    gate: string;
    gateWait: number;
    nearbyConcessions: string[];
    tips: string;
  } | null>(null);

  // Concession filter state
  const [concessionCategory, setConcessionCategory] = useState<string>("All");
  const [concessionSearch, setConcessionSearch] = useState("");
  const [onlyAccessible, setOnlyAccessible] = useState(false);

  // Translator state
  const [transText, setTransText] = useState("");
  const [translatedPhrases, setTranslatedPhrases] = useState<{
    es: string;
    fr: string;
    pt: string;
  } | null>(null);

  // Seat locator trigger
  const handleLocateSeat = (e: React.FormEvent) => {
    e.preventDefault();
    const secNum = parseInt(seatSection.trim());
    if (isNaN(secNum) || secNum <= 0) {
      setLocatorResult(null);
      return;
    }

    // Gate routing logic based on section
    let recommendedGate = "";
    let recommendedGateWait = 0;
    
    if (selectedStadium.id === "metlife") {
      if (secNum < 115 || secNum > 340) {
        recommendedGate = "Gate A (Bud Light Gate)";
      } else if (secNum >= 115 && secNum <= 125) {
        recommendedGate = "Gate B (Verizon Gate)";
      } else if (secNum > 125 && secNum <= 135) {
        recommendedGate = "Gate C (Pepsi Gate)";
      } else {
        recommendedGate = "Gate D (HCL Tech Gate) [Currently Closed, Diverted to Gate A]";
      }
      const matchedGate = gates.find(g => g.name.includes(recommendedGate.split(" ")[0]));
      recommendedGateWait = matchedGate ? matchedGate.waitMinutes : 12;
    } else {
      recommendedGate = gates[secNum % gates.length]?.name || gates[0].name;
      recommendedGateWait = gates[secNum % gates.length]?.waitMinutes || gates[0].waitMinutes;
    }

    // Match nearby concessions from list
    const nearby = concessions
      .filter((c) => {
        // Simple mock matching by parsing Section number
        if (secNum >= 100 && secNum <= 150) {
          return c.location.includes("Level 1") || c.location.includes("Plaza") || c.location.includes("Túnel") || c.location.includes("105") || c.location.includes("120");
        }
        return c.location.includes("Level 2") || c.location.includes("200") || c.location.includes("218") || c.location.includes("222");
      })
      .map((c) => `${c.name} (${c.location})`)
      .slice(0, 2);

    setLocatorResult({
      gate: recommendedGate,
      gateWait: recommendedGateWait,
      nearbyConcessions: nearby.length > 0 ? nearby : ["Cascade Water Station (Section 222)", "First Aid (Section 128)"],
      tips: secNum < 120
        ? "Access Gate A for closest wheelchair ramps. Free water refill station is located near Section 118."
        : "Taking Meadowlands Express Rail is recommended. Follow Green Way trail guides to the Platform.",
    });
  };

  // Inline basic translator (instant bilingual tool helper)
  const handleLocalTranslate = () => {
    if (!transText.trim()) return;
    
    const text = transText.toLowerCase();
    let es = "Servicio no disponible - Use AI chat superior para traducción avanzada.";
    let fr = "Service non disponible - Utilisez le chat IA ci-dessus.";
    let pt = "Serviço indisponível - Use o chat de IA acima.";

    // Pre-program common helpful stadium spectator lookups
    if (text.includes("bathroom") || text.includes("restroom") || text.includes("toilet")) {
      es = "¿Dónde están los sanitarios / baños, por favor?";
      fr = "Où sont les toilettes, s'il vous plaît?";
      pt = "Onde ficam os banheiros, por favor?";
    } else if (text.includes("ticket") || text.includes("entry")) {
      es = "Tengo un problema con mi boleto de entrada.";
      fr = "J'ai un problème avec mon billet d'entrée.";
      pt = "Estou com um problema no meu ingresso de entrada.";
    } else if (text.includes("water") || text.includes("thirsty")) {
      es = "¿Dónde puedo conseguir agua potable gratis?";
      fr = "Où puis-je trouver de l'eau potable gratuite?";
      pt = "Onde posso conseguir água potável gratuita?";
    } else if (text.includes("wheelchair") || text.includes("handicap") || text.includes("disabled")) {
      es = "Necesito asistencia de accesibilidad / silla de ruedas.";
      fr = "J'ai besoin d'une assistance accessibilité / fauteuil roulant.";
      pt = "Preciso de assistência de acessibilidade / cadeira de rodas.";
    } else if (text.includes("lost") || text.includes("phone") || text.includes("wallet")) {
      es = "He perdido mi objeto personal, ¿dónde está objetos perdidos?";
      fr = "J'ai perdu un objet personnel, où se trouvent les objets trouvés?";
      pt = "Perdi um objeto pessoal, onde fica a seção de achados e perdidos?";
    } else {
      // General prompt instruction helper
      es = "Use el chat de IA para traducir frases completas.";
      fr = "Utilisez le chat IA pour des traductions de phrases complètes.";
      pt = "Use o chat de IA para traduções completas.";
    }

    setTranslatedPhrases({ es, fr, pt });
  };

  // Filter concessions list
  const filteredConcessions = concessions.filter((c) => {
    const matchesCategory = concessionCategory === "All" || c.category === concessionCategory;
    const matchesSearch =
      c.name.toLowerCase().includes(concessionSearch.toLowerCase()) ||
      c.specialty.some((s) => s.toLowerCase().includes(concessionSearch.toLowerCase()));
    const matchesAccessible = !onlyAccessible || c.isAccessible;

    return matchesCategory && matchesSearch && matchesAccessible;
  });

  return (
    <div className="space-y-6">
      {/* 2-Column top grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Dynamic Seating & Routing Tool */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col justify-between relative overflow-hidden">
          <div>
            <div className="flex items-center gap-2.5 mb-4 border-b border-white/5 pb-3">
              <Compass className="w-5 h-5 text-blue-400" />
              <h3 className="font-mono font-bold text-white text-xs uppercase tracking-widest">Match-Day Seat Routing</h3>
            </div>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              Input your World Cup seat section number. We'll analyze live stadium queues and route you to the best entrance gate and nearest food/first-aid.
            </p>

            <form id="seat-locator-form" onSubmit={handleLocateSeat} className="flex gap-2">
              <label htmlFor="seat-section-input" className="sr-only">Seat Section Number</label>
              <input
                id="seat-section-input"
                type="text"
                placeholder="e.g. 114, 142, 212"
                className="bg-black/40 border border-white/10 focus:border-blue-500 rounded-xl px-4 py-3 text-xs text-white focus:outline-none w-full outline-none"
                value={seatSection}
                onChange={(e) => setSeatSection(e.target.value)}
              />
              <button
                id="seat-locate-btn"
                type="submit"
                className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold font-mono uppercase tracking-wider rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" /> Guide Me
              </button>
            </form>

            {locatorResult && (
              <div className="mt-5 p-4 bg-black/40 rounded-xl border border-white/10 space-y-4 animate-in fade-in duration-200">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] font-mono font-semibold text-slate-500 uppercase tracking-widest">Recommended Gate</span>
                    <h4 className="text-xs font-bold text-blue-400 mt-1 font-mono">{locatorResult.gate}</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-mono font-semibold text-slate-500 uppercase tracking-widest">Est. Wait Line</span>
                    <h4 className={`text-xs font-bold font-mono mt-1 ${locatorResult.gateWait > 15 ? 'text-amber-500' : 'text-emerald-400'}`}>
                      {locatorResult.gateWait} mins
                    </h4>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-3">
                  <span className="text-[9px] font-mono font-semibold text-slate-500 uppercase tracking-widest block mb-2">Nearest Amenities</span>
                  <div className="flex flex-col gap-1.5">
                    {locatorResult.nearbyConcessions.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-slate-300 text-xs">
                        <Coffee className="w-3.5 h-3.5 text-blue-400" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-white/10 pt-3 text-[11px] text-slate-400 leading-relaxed flex items-start gap-2 bg-white/5 p-3 rounded-lg border border-white/5">
                  <ShieldCheck className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span><strong className="text-slate-200 font-mono text-[10px] uppercase tracking-wider">Spectator Advisory:</strong> {locatorResult.tips}</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-blue-950/25 border border-blue-500/20 p-4 rounded-xl mt-5">
            <div className="flex items-start gap-3">
              <Accessibility className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5 animate-pulse" />
              <div>
                <h4 className="text-xs font-bold text-white tracking-tight">Accessibility & Inclusion Hub</h4>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  Access real-time ADA compliant routing, quiet sensory rooms, wheelchair assistance, and elevator directories.
                </p>
              </div>
            </div>
            <button
              id="fan-dashboard-ada-btn"
              type="button"
              onClick={onOpenAccessibility}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-mono text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer whitespace-nowrap self-start sm:self-center"
            >
              Open ADA Guide
            </button>
          </div>
        </div>

        {/* Transit & Sustainability Tracker */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col justify-between relative overflow-hidden">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
              <div className="flex items-center gap-2.5">
                <Train className="w-5 h-5 text-blue-400" />
                <h3 className="font-mono font-bold text-white text-xs uppercase tracking-widest">Transit Tracker</h3>
              </div>
              <div className="flex items-center gap-1.5 bg-blue-600/15 px-2.5 py-1 rounded border border-blue-500/30 text-[9px] font-bold text-blue-400 font-mono uppercase tracking-widest">
                <Footprints className="w-3.5 h-3.5" /> Net-Zero Initiative
              </div>
            </div>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              Track carbon footprint ratings (A-D) and active dispatch delays for match-day transit routes. Choose low-carbon pathways!
            </p>

            <div className="space-y-3">
              {transit.map((t) => (
                <div
                  key={t.id}
                  className="bg-black/40 border border-white/10 p-3.5 rounded-xl flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`px-2 py-1.5 rounded-lg font-bold font-mono text-[9px] uppercase tracking-wider ${
                      t.sustainabilityRating === "A" ? "bg-emerald-950/40 text-emerald-400 border border-emerald-500/20" :
                      t.sustainabilityRating === "B" ? "bg-teal-950/40 text-teal-400 border border-teal-500/20" :
                      "bg-amber-950/40 text-amber-500 border border-amber-500/20"
                    }`}>
                      CO₂ {t.sustainabilityRating}
                    </div>
                    <div>
                      <h4 className="font-sans font-bold text-slate-100">{t.name}</h4>
                      <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                        Freq: every {t.frequencyMinutes}m
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`px-2.5 py-1 rounded font-mono text-[9px] font-bold uppercase tracking-wider ${
                      t.status === "On Time" ? "bg-emerald-950/40 text-emerald-400 border border-emerald-500/20" :
                      t.status === "Delayed" ? "bg-amber-950/40 text-amber-500 border border-amber-500/20" :
                      "bg-red-950/40 text-red-400 border border-red-500/20"
                    }`}>
                      {t.status} {t.delayMinutes > 0 && `(+${t.delayMinutes}m)`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-3.5 border-t border-white/10 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="font-sans">🌿 Public rail offsets 1.2kg carbon per mile</span>
            <button
              onClick={() => {
                const chatForm = document.getElementById("chat-input-field") as HTMLInputElement;
                if (chatForm) {
                  chatForm.value = "What transit option has the lowest wait times and is most environmentally sustainable?";
                  chatForm.focus();
                }
              }}
              className="text-blue-400 font-mono font-bold hover:underline cursor-pointer text-[10px] uppercase tracking-wider"
            >
              Ask AI for details →
            </button>
          </div>
        </div>
      </div>

      {/* 2-Column bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Multilingual Match Phrase Translator Helper */}
        <div className="lg:col-span-1 bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col justify-between relative overflow-hidden">
          <div>
            <div className="flex items-center gap-2.5 mb-4 border-b border-white/5 pb-3">
              <Languages className="w-5 h-5 text-blue-400" />
              <h3 className="font-mono font-bold text-white text-xs uppercase tracking-widest">Translation Assist</h3>
            </div>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              Instantly translate crucial spectator phrases into the official languages of the FIFA 2026 host countries.
            </p>

            <div className="space-y-4">
              <div className="flex gap-2">
                <label htmlFor="translate-input" className="sr-only">Spectator Phrase to Translate</label>
                <input
                  id="translate-input"
                  type="text"
                  placeholder="Type e.g., 'bathroom', 'water', 'lost wallet'"
                  className="bg-black/40 border border-white/10 focus:border-blue-500 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none w-full outline-none"
                  value={transText}
                  onChange={(e) => setTransText(e.target.value)}
                />
                <button
                  id="translate-local-btn"
                  onClick={handleLocalTranslate}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold font-mono uppercase tracking-wider rounded-xl transition-all cursor-pointer whitespace-nowrap"
                >
                  Translate
                </button>
              </div>

              {translatedPhrases && (
                <div className="bg-black/40 p-4 rounded-xl border border-white/10 space-y-3.5 text-xs animate-in fade-in duration-200">
                  <div>
                    <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest">🇲🇽 Spanish</span>
                    <p className="text-slate-200 mt-1 font-serif italic">{translatedPhrases.es}</p>
                  </div>
                  <div className="border-t border-white/10 pt-2.5">
                    <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest">🇨🇦 French</span>
                    <p className="text-slate-200 mt-1 font-serif italic">{translatedPhrases.fr}</p>
                  </div>
                  <div className="border-t border-white/10 pt-2.5">
                    <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest">🇧🇷 Portuguese</span>
                    <p className="text-slate-200 mt-1 font-serif italic">{translatedPhrases.pt}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <p className="text-[10px] font-mono text-slate-500 mt-5 leading-snug">
            💡 TAP SUGGESTIONS IN AI CHAT FOR ADVANCED CONVERSATIONAL STREAMS.
          </p>
        </div>

        {/* Concessions Directory & Menu Look-Up */}
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5 border-b border-white/5 pb-3">
            <div>
              <div className="flex items-center gap-2.5">
                <Coffee className="w-5 h-5 text-blue-400" />
                <h3 className="font-mono font-bold text-white text-xs uppercase tracking-widest">Concessions Directory</h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Verify gate wait lines and accessibility services before leaving your seat.
              </p>
            </div>

            {/* Accessible filter checkbox */}
            <label className="flex items-center gap-2 cursor-pointer bg-black/40 border border-white/10 px-3.5 py-2 rounded-lg">
              <input
                id="accessible-concessions-checkbox"
                type="checkbox"
                checked={onlyAccessible}
                onChange={(e) => setOnlyAccessible(e.target.checked)}
                className="w-3.5 h-3.5 accent-blue-500 rounded border-white/10 bg-black"
              />
              <span className="text-[9px] font-mono font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-widest">
                <Accessibility className="w-3 h-3 text-blue-400" /> ACCESSIBLE ONLY
              </span>
            </label>
          </div>

          {/* Search and Categories bar */}
          <div className="flex flex-col sm:flex-row gap-2.5 mb-5">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 w-3.5 h-3.5 text-slate-500" />
              <label htmlFor="concession-search-field" className="sr-only">Search Concessions</label>
              <input
                id="concession-search-field"
                type="text"
                placeholder="Search specialty e.g., 'vegan', 'burger', 'tacos'..."
                className="w-full bg-black/40 border border-white/10 focus:border-blue-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none outline-none"
                value={concessionSearch}
                onChange={(e) => setConcessionSearch(e.target.value)}
              />
            </div>

            <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
              {["All", "Food", "Water Station", "Merchandise", "First Aid"].map((cat) => (
                <button
                  key={cat}
                  id={`concession-cat-${cat.replace(/\s+/g, "-")}`}
                  onClick={() => setConcessionCategory(cat)}
                  className={`px-3.5 py-2 rounded-lg text-[10px] font-mono font-bold uppercase tracking-widest transition-all whitespace-nowrap cursor-pointer border ${
                    concessionCategory === cat
                      ? "bg-blue-600 border-blue-600 text-white font-bold"
                      : "bg-black/40 border-white/10 hover:border-white/20 text-slate-400"
                  }`}
                >
                  {cat.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Concessions Grid list */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[220px] overflow-y-auto pr-1 scrollbar-none">
            {filteredConcessions.length > 0 ? (
              filteredConcessions.map((c) => (
                <div
                  key={c.id}
                  className="bg-black/40 border border-white/10 p-4 rounded-xl flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] font-mono text-slate-500 uppercase font-bold tracking-wider">{c.category}</span>
                      {c.isAccessible && (
                        <span className="text-[9px] font-mono bg-blue-950/40 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded flex items-center gap-1 uppercase tracking-widest font-bold">
                          <Accessibility className="w-2.5 h-2.5" /> ACCESSIBLE
                        </span>
                      )}
                    </div>
                    <h4 className="font-sans font-bold text-slate-100 text-xs">{c.name}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">{c.location}</p>
                    
                    {/* Specialty tags */}
                    <div className="flex flex-wrap gap-1 mt-2.5">
                      {c.specialty.map((spec, i) => (
                        <span
                          key={i}
                          className="bg-white/5 border border-white/10 text-slate-300 px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-white/10 mt-3.5 pt-2.5 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Wait Line</span>
                    <span className={`text-xs font-mono font-bold ${
                      c.congestion === "High" ? "text-red-400" : c.congestion === "Medium" ? "text-amber-500" : "text-emerald-400"
                    }`}>
                      {c.waitMinutes} mins ({c.congestion})
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center py-10 bg-black/20 border border-dashed border-white/10 rounded-xl">
                <p className="text-slate-500 text-xs font-mono uppercase tracking-widest">No matching concessions found.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
