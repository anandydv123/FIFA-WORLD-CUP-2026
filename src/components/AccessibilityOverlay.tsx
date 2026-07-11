/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Stadium, Incident } from "../types";
import {
  Accessibility,
  X,
  MapPin,
  Heart,
  Users,
  Sparkles,
  Send,
  Check,
  ChevronRight,
  Phone,
  Info,
  VolumeX,
  HelpCircle,
  AlertCircle,
  ArrowRight,
  Compass,
} from "lucide-react";

interface AccessibilityOverlayProps {
  selectedStadium: Stadium;
  onClose: () => void;
  onReportIncident: (newInc: {
    description: string;
    location: string;
    category: "Security" | "Medical" | "Facility" | "Crowd Control" | "Lost & Found" | "Accessibility Help";
    severity: "Low" | "Medium" | "Critical";
  }) => void;
}

// Rich structural accessibility data per stadium
const ACCESSIBILITY_DATA: Record<
  string,
  {
    routes: Array<{
      id: string;
      name: string;
      description: string;
      from: string;
      to: string;
      distance: string;
      type: "wheelchair" | "step-free" | "sensory-priority";
    }>;
    elevators: Array<{
      id: string;
      name: string;
      location: string;
      status: "Operational" | "Maintenance" | "Busy";
      floors: string;
      notes: string;
    }>;
    sensoryZones: Array<{
      id: string;
      name: string;
      location: string;
      amenities: string[];
      description: string;
      capacity: string;
    }>;
    contacts: {
      hotline: string;
      sms: string;
      deskLocation: string;
    };
  }
> = {
  metlife: {
    routes: [
      {
        id: "ml-r1",
        name: "Gate A Primary Wheelchair Pathway",
        description: "A wide, low-incline paved route leading from ADA Parking Lot B directly through Gate A (Bud Light Gate) to the main level concourse. Equipped with automatic doors and tactile guiding strips.",
        from: "ADA Parking Lot B / MetLife Rail Station",
        to: "Sections 101 - 118 Concourse",
        distance: "180 meters",
        type: "wheelchair",
      },
      {
        id: "ml-r2",
        name: "Verizon Concourse Step-Free Loop",
        description: "Fully step-free continuous link wrapping around the 100-level concourse. Wide clearances, low-friction flooring, and clear overhead high-contrast digital wayfinding signs.",
        from: "Gate B (Verizon)",
        to: "All 100-Level Seating Blocks",
        distance: "Full Circular Loop",
        type: "step-free",
      },
      {
        id: "ml-r3",
        name: "Gate C Low-Stimulus Corridor",
        description: "An alternate entry lane specifically reserved for fans with sensory sensitivities. Avoids high-volume ticket turnstiles and loudspeaker sound-directors.",
        from: "Gate C South Plaza",
        to: "Section 128 Guest Services Hub",
        distance: "120 meters",
        type: "sensory-priority",
      },
    ],
    elevators: [
      {
        id: "ml-e1",
        name: "West Plaza Elevator (E1)",
        location: "Adjacent to Section 113 / Gate A",
        status: "Operational",
        floors: "Concourse Level 1, 2, 3 & Mezzanine Suites",
        notes: "Wheelchair-accessible width, tactile Braille buttons, and audible floor indicators. Priority queue control by ADA staff.",
      },
      {
        id: "ml-e2",
        name: "East Verizon Elevator (E2)",
        location: "Adjacent to Section 136 / Gate B",
        status: "Operational",
        floors: "Concourse Level 1, 2 & Upper Deck",
        notes: "Wide-clearance doors. Directly services wheelchair-accessible platforms in the 300-level.",
      },
      {
        id: "ml-e3",
        name: "Scotiabank Club Elevator (E3)",
        location: "Club Lounge Entrance (Section 104)",
        status: "Operational",
        floors: "Plaza Level & Club Level Suites",
        notes: "Mainly reserved for spectators with mobility passes and suite tier tickets.",
      },
    ],
    sensoryZones: [
      {
        id: "ml-sz1",
        name: "KultureCity Certified Sensory Room",
        location: "Guest Services Hub - Section 128 (Concourse Level 1)",
        amenities: [
          "Soundproof walls & acoustical clouds",
          "Dimmable soft LED wave projection lights",
          "Tactile activity panels & bubble wall tubes",
          "Comfortable weighted lap pads & bean bag pods",
          "Noise-reducing headphones & fidget checkouts",
        ],
        description: "A state-of-the-art quiet room designed to offer a calming retreat for fans of all ages with autism, sensory processing disorders, or PTSD. Fully staffed by certified sensory professionals.",
        capacity: "Up to 8 families",
      },
      {
        id: "ml-sz2",
        name: "Quiet Zone & Cooling Alcove",
        location: "Concourse Corridor 212 (Concourse Level 2 East)",
        amenities: [
          "Lowered sound volumes",
          "Privacy partition walls",
          "Ambient air conditioning & clean water taps",
        ],
        description: "A comfortable, semi-private rest space ideal for individuals seeking temporary escape from stadium noise, crowd congestion, or heat.",
        capacity: "Open seating alcove",
      },
    ],
    contacts: {
      hotline: "+1 (201) 555-0126",
      sms: "METADA to 78247",
      deskLocation: "Section 128 Main Concierge",
    },
  },
  azteca: {
    routes: [
      {
        id: "az-r1",
        name: "Rampa Norte Adaptada (North ADA Ramp)",
        description: "Amplio acceso de rampa con pendiente de inclinación del 6%, pasamanos dobles y piso antiderrapante. Facilita la entrada desde el Acceso Norte (Gate 2) hacia las plataformas de sillas de ruedas de la zona baja.",
        from: "Estacionamiento Preferencial Norte",
        to: "Plataformas de Sillas de Ruedas - Sección 100",
        distance: "140 metros",
        type: "wheelchair",
      },
      {
        id: "az-r2",
        name: "Conector Libre de Escalones Túnel 8",
        description: "Ruta completamente plana y pavimentada libre de obstáculos que conecta el acceso principal directamente a la zona de comida y sanitarios adaptados.",
        from: "Acceso Principal Oriente",
        to: "Plaza de Alimentos (Túnel 8)",
        distance: "210 metros",
        type: "step-free",
      },
    ],
    elevators: [
      {
        id: "az-e1",
        name: "Elevador Poniente (West Elevator)",
        location: "Pasillo Central - Sección 105",
        status: "Operational",
        floors: "Planta Baja, Nivel Palcos & Club Especial",
        notes: "Asistido por personal de atención inclusiva. Cuenta con mensajes por voz en español e inglés y señalética táctil.",
      },
      {
        id: "az-e2",
        name: "Elevador Oriente (East Elevator)",
        location: "Acceso Principal - Sección 120",
        status: "Operational",
        floors: "Plaza de Acceso & Nivel de Asientos Especiales",
        notes: "Acceso controlado prioritario para mujeres embarazadas, adultos mayores y personas en silla de ruedas.",
      },
    ],
    sensoryZones: [
      {
        id: "az-sz1",
        name: "Sala de Calma Inclusiva (Sensory Calm Room)",
        location: "Zona de Atención al Espectador - Sección 105",
        amenities: [
          "Aislamiento de ruido externo de hasta -35dB",
          "Iluminación cálida ajustable",
          "Colchonetas y cojines de espuma viscoelástica",
          "Kits sensoriales con audífonos de cancelación de ruido",
        ],
        description: "Espacio tranquilo especialmente diseñado para disminuir el estrés sensorial durante el partido. Disponible sin costo para espectadores con autismo o neurodivergencia.",
        capacity: "4 familias simultáneas",
      },
    ],
    contacts: {
      hotline: "+52 55 5555 2026",
      sms: "AYUDA al 55202",
      deskLocation: "Módulo de Hospitalidad - Sección 105",
    },
  },
  bcplace: {
    routes: [
      {
        id: "bc-r1",
        name: "Gate A Robson St Accessible Entry",
        description: "Dedicated wide ramp at Gate A with automated push-button double doors. Connects seamlessly with the TransLink accessible shuttle dropping off on Robson Street.",
        from: "Robson Street Plaza",
        to: "Level 2 Food & Seating Concourse",
        distance: "90 meters",
        type: "wheelchair",
      },
      {
        id: "bc-r2",
        name: "Tactile Guiding Loop (Level 2)",
        description: "Contoured safety guidance path embedded in the floor for visually impaired fans. Wraps around the main public concourse with direct audio-beacons.",
        from: "Gate C (Pacific Blvd)",
        to: "All Main Level Seat Intakes",
        distance: "350 meters loop",
        type: "step-free",
      },
    ],
    elevators: [
      {
        id: "bc-e1",
        name: "Terry Fox Plaza Lift (E1)",
        location: "Inside Gate H (Terry Fox Entrance)",
        status: "Operational",
        floors: "Level 1 Field, Level 2 Main Concourse & Level 4 Suites",
        notes: "High-capacity elevator. Connects directly to the BC Place wheelchair-accessible upper viewing decks.",
      },
      {
        id: "bc-e2",
        name: "Section 222 Lift",
        location: "Adjacent to Section 222 (Cascade Water Station)",
        status: "Operational",
        floors: "Level 2 Concourse to Level 3 Club Suites",
        notes: "Fully retrofitted with voice announcements and emergency call assist systems.",
      },
    ],
    sensoryZones: [
      {
        id: "bc-sz1",
        name: "BC Place Quiet Room & Sensory Lounge",
        location: "Guest Services Office near Section 218",
        amenities: [
          "Double-insulated sound dampening walls",
          "Interactive fluid bubble tubes",
          "Weighted lap blankets & sensory toys",
          "Noise-attenuating earmuffs for rent (refundable deposit)",
          "Dim, calm LED lights",
        ],
        description: "A peaceful sanctuary designed in collaboration with AutismBC to support spectators experiencing sensory overload during games. Clean, relaxing, and fully safe environment.",
        capacity: "6 individuals plus caregivers",
      },
    ],
    contacts: {
      hotline: "+1 (604) 555-2026",
      sms: "BCPADA to 60426",
      deskLocation: "Guest Services Desk near Gate H",
    },
  },
};

export const AccessibilityOverlay: React.FC<AccessibilityOverlayProps> = ({
  selectedStadium,
  onClose,
  onReportIncident,
}) => {
  const stadiumId = selectedStadium.id;
  const data = ACCESSIBILITY_DATA[stadiumId] || ACCESSIBILITY_DATA.metlife;

  const [activeTab, setActiveTab] = useState<"routes" | "elevators" | "sensory" | "request">("routes");
  
  // Interactive mini map hover states
  const [hoveredFeature, setHoveredFeature] = useState<{
    id: string;
    label: string;
    description: string;
    status?: string;
  } | null>(null);

  // Form states for Assistance Request
  const [reqName, setReqName] = useState("");
  const [reqSection, setReqSection] = useState("");
  const [reqSeat, setReqSeat] = useState("");
  const [reqType, setReqType] = useState("Wheelchair Escort");
  const [reqNotes, setReqNotes] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [generatedId, setGeneratedId] = useState("");

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqSection.trim()) return;

    const ticketId = `ADA-${Math.floor(100 + Math.random() * 900)}`;
    const fullDescription = `[ADA ASSISTANCE PASS] Spec: ${reqType}. Fan: ${
      reqName || "Spectator"
    }. Seat: Sec ${reqSection}, Row ${reqSeat || "N/A"}. Needs immediate support. Note: ${
      reqNotes || "None provided"
    }.`;

    // Report incident as "Accessibility Help" category
    onReportIncident({
      description: fullDescription,
      location: `Section ${reqSection} ${reqSeat ? `, Row/Seat ${reqSeat}` : ""}`,
      category: "Accessibility Help",
      severity: "Medium",
    });

    setGeneratedId(ticketId);
    setIsSubmitted(true);
  };

  const resetForm = () => {
    setReqName("");
    setReqSection("");
    setReqSeat("");
    setReqType("Wheelchair Escort");
    setReqNotes("");
    setIsSubmitted(false);
  };

  // Interactive Coordinates for accessibility features on our schematic map
  const accessibilityFeatures = [
    // ADA Routes
    { id: "route-primary", x: 120, y: 150, type: "route", icon: "♿", label: "ADA Entry Route", desc: "Level pathway from Main Parking Lot through ADA Gate.", color: "#10b981" },
    { id: "route-secondary", x: 380, y: 250, type: "route", icon: "🚶", label: "Step-Free Concourse", desc: "Circular flat connector for easy seat access.", color: "#3b82f6" },
    // Elevators
    { id: "elev-west", x: 210, y: 110, type: "elevator", icon: "🛗", label: "Elevator West (E1)", desc: "Priority lift beside Section 112. Operational.", color: "#8b5cf6" },
    { id: "elev-east", x: 290, y: 290, type: "elevator", icon: "🛗", label: "Elevator East (E2)", desc: "Priority lift beside Section 136. Operational.", color: "#8b5cf6" },
    // Sensory Zones
    { id: "sensory-hub", x: 250, y: 80, type: "sensory", icon: "🌸", label: "Sensory Calm Room", desc: "Located at Section 128 (Medical Hub). Double sound-insulated quiet space.", color: "#ec4899" },
    // Restrooms
    { id: "restroom-ada", x: 160, y: 280, type: "restroom", icon: "🚻", label: "Accessible Restroom", desc: "Section 114 Corridor. Large layout, support rails, adult change counters.", color: "#eab308" },
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div
        id="ada-modal-panel"
        className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] animate-in zoom-in-95 duration-200"
      >
        {/* Left Side: Visual Accessibility Map Layer & Quick Help Contacts (Spans 5/12 of widths on desktop) */}
        <div className="md:w-5/12 bg-slate-950/50 p-6 border-b md:border-b-0 md:border-r border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="p-1.5 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400">
                <Accessibility className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">Interactive ADA Access Map</h3>
                <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mt-0.5">
                  {selectedStadium.name}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Tap any highlighted feature icon (♿, 🛗, 🌸, 🚻) below to locate level entrance routes, dedicated lifts, quiet zones, and accessible restrooms.
            </p>

            {/* Accessibility Vector SVG Stadium Overlay Map */}
            <div className="relative bg-slate-950 border border-white/5 rounded-2xl p-4 flex items-center justify-center overflow-hidden mb-4">
              <svg viewBox="0 0 500 400" className="w-full max-w-[320px] h-auto drop-shadow-md">
                {/* Stadium Outlines */}
                <circle cx="250" cy="200" r="170" fill="none" stroke="#1e293b" strokeWidth="2" strokeDasharray="3 3" />
                <circle cx="250" cy="200" r="150" fill="#111827" stroke="#334155" strokeWidth="18" opacity="0.8" />
                <circle cx="250" cy="200" r="120" fill="none" stroke="#1f2937" strokeWidth="6" />
                <rect x="180" y="150" width="140" height="100" rx="3" fill="#047857" stroke="#059669" strokeWidth="2" opacity="0.6" />
                
                {/* Visual ADA Compliant Paths */}
                {/* Path A */}
                <path d="M 80 150 Q 150 150 150 200" fill="none" stroke="#10b981" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
                {/* Path B Loop */}
                <circle cx="250" cy="200" r="135" fill="none" stroke="#3b82f6" strokeWidth="3" strokeDasharray="6 4" opacity="0.5" />

                {/* SVG Feature Markers */}
                {accessibilityFeatures.map((feat) => (
                  <g
                    key={feat.id}
                    className="cursor-pointer group"
                    onMouseEnter={() => setHoveredFeature(feat)}
                    onMouseLeave={() => setHoveredFeature(null)}
                    onClick={() => {
                      // Anchor and swap tabs depending on type
                      if (feat.type === "route") setActiveTab("routes");
                      else if (feat.type === "elevator") setActiveTab("elevators");
                      else if (feat.type === "sensory") setActiveTab("sensory");
                    }}
                  >
                    <circle
                      cx={feat.x}
                      cy={feat.y}
                      r="12"
                      fill={feat.color}
                      stroke="#0f172a"
                      strokeWidth="2"
                      className="transition-all duration-200 group-hover:scale-125 group-hover:stroke-white"
                    />
                    <text
                      x={feat.x}
                      y={feat.y + 3}
                      textAnchor="middle"
                      fill="#fff"
                      fontSize="9"
                      fontWeight="bold"
                    >
                      {feat.icon}
                    </text>
                  </g>
                ))}
              </svg>

              {/* Map Marker Tooltip inside map container */}
              {hoveredFeature ? (
                <div className="absolute bottom-3 left-3 right-3 bg-black/90 border border-white/10 p-2.5 rounded-xl text-xs backdrop-blur-sm animate-in fade-in duration-150">
                  <div className="flex items-center gap-1.5 font-bold text-white mb-0.5">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: hoveredFeature.color }}></span>
                    {hoveredFeature.label}
                  </div>
                  <p className="text-[10px] text-slate-300 font-sans leading-snug">{hoveredFeature.description}</p>
                </div>
              ) : (
                <div className="absolute bottom-3 text-[9px] font-mono text-slate-500 uppercase tracking-widest bg-black/60 px-2 py-1 rounded">
                  Hover markers for details
                </div>
              )}
            </div>
          </div>

          {/* Quick Help Contacts Section */}
          <div className="bg-blue-950/20 border border-blue-900/30 p-4 rounded-2xl space-y-3">
            <h4 className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" /> ADA Assist Contacts
            </h4>
            
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-black/30 p-2 rounded-lg border border-white/5">
                <span className="text-[9px] font-mono text-slate-500 block">Accessibility Hotline</span>
                <span className="font-bold text-slate-200 font-mono mt-0.5 block">{data.contacts.hotline}</span>
              </div>
              <div className="bg-black/30 p-2 rounded-lg border border-white/5">
                <span className="text-[9px] font-mono text-slate-500 block">Direct ADA Text SMS</span>
                <span className="font-bold text-slate-200 font-mono mt-0.5 block">{data.contacts.sms}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-400 bg-black/20 p-2.5 rounded-lg border border-white/5">
              <Info className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
              <span>
                Visit the **{data.contacts.deskLocation}** for complimentary noise-canceling headphones, sensory bags, or manual wheelchair rentals.
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Tabbed Directories & Interactive Assistance Request Form */}
        <div className="md:w-7/12 flex flex-col justify-between max-h-[90vh]">
          {/* Header Actions */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <Accessibility className="w-5 h-5 text-blue-400" />
                Accessibility & Inclusion Hub
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Providing standard ADA routing, quiet sensory lounges, and personal volunteer guides.
              </p>
            </div>
            <button
              id="ada-close-btn"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer border border-white/5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Tabs for Categories */}
          <div className="border-b border-white/10 bg-slate-950/45 px-6 flex gap-1.5 overflow-x-auto scrollbar-none">
            <button
              id="ada-tab-routes"
              onClick={() => setActiveTab("routes")}
              className={`py-3.5 px-3 border-b-2 text-xs font-semibold font-mono uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "routes"
                  ? "border-blue-500 text-blue-400 font-bold"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              ♿ ADA Routes
            </button>
            <button
              id="ada-tab-elevators"
              onClick={() => setActiveTab("elevators")}
              className={`py-3.5 px-3 border-b-2 text-xs font-semibold font-mono uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "elevators"
                  ? "border-blue-500 text-blue-400 font-bold"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              🛗 Elevators
            </button>
            <button
              id="ada-tab-sensory"
              onClick={() => setActiveTab("sensory")}
              className={`py-3.5 px-3 border-b-2 text-xs font-semibold font-mono uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "sensory"
                  ? "border-blue-500 text-blue-400 font-bold"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              🌸 Sensory Zones
            </button>
            <button
              id="ada-tab-request"
              onClick={() => setActiveTab("request")}
              className={`py-3.5 px-3 border-b-2 text-xs font-semibold font-mono uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                activeTab === "request"
                  ? "border-blue-500 text-blue-400 font-bold"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Users className="w-3.5 h-3.5" /> Request Escort
            </button>
          </div>

          {/* Main Tab Contents Panel (Scrollable) */}
          <div className="p-6 overflow-y-auto flex-1 space-y-4 max-h-[50vh] md:max-h-none">
            {/* 1. ADA Routes Tab */}
            {activeTab === "routes" && (
              <div className="space-y-4">
                {data.routes.map((route) => (
                  <div
                    key={route.id}
                    className="bg-black/40 border border-white/10 p-4 rounded-2xl space-y-3 hover:border-blue-500/30 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${
                          route.type === "wheelchair" ? "bg-emerald-400" :
                          route.type === "step-free" ? "bg-blue-400" : "bg-pink-400"
                        }`}></span>
                        <h4 className="font-sans font-bold text-white text-xs">{route.name}</h4>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-semibold bg-white/5 px-2.5 py-0.5 rounded-md border border-white/5">
                        {route.distance}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed font-sans">{route.description}</p>

                    <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-white/5 text-[10px] font-mono text-slate-400 uppercase tracking-wide">
                      <div className="flex items-center gap-1.5 flex-1">
                        <span className="text-slate-600 font-bold">Start:</span>
                        <span className="text-slate-200 truncate">{route.from}</span>
                      </div>
                      <div className="hidden sm:block text-slate-600">→</div>
                      <div className="flex items-center gap-1.5 flex-1">
                        <span className="text-slate-600 font-bold">Finish:</span>
                        <span className="text-slate-200 truncate">{route.to}</span>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="p-4 bg-emerald-950/10 border border-emerald-500/20 text-xs text-emerald-400 rounded-2xl flex gap-3 leading-relaxed">
                  <Accessibility className="w-5 h-5 flex-shrink-0" />
                  <div>
                    <strong>Ramp Wayfinding Guarantee:</strong> All recommended paths are marked with green physical wayfinding placards and tactile guide strips on stadium floors. Contact any volunteer helper if you spot obstacles or require a manual push escort.
                  </div>
                </div>
              </div>
            )}

            {/* 2. Elevators Tab */}
            {activeTab === "elevators" && (
              <div className="space-y-4">
                {data.elevators.map((elev) => (
                  <div
                    key={elev.id}
                    className="bg-black/40 border border-white/10 p-4 rounded-2xl space-y-3 hover:border-blue-500/30 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">🛗</span>
                        <div>
                          <h4 className="font-sans font-bold text-white text-xs">{elev.name}</h4>
                          <span className="text-[10px] font-mono text-slate-400 block mt-0.5">{elev.location}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1.5 bg-emerald-600/15 border border-emerald-500/30 px-2.5 py-1 rounded-lg text-[9px] font-bold font-mono text-emerald-400 uppercase tracking-widest">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        {elev.status}
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed font-sans">{elev.notes}</p>

                    <div className="border-t border-white/5 pt-2 text-[10px] font-mono text-slate-400 flex items-center gap-2.5 bg-white/5 p-2 rounded-lg border border-white/5">
                      <span className="text-slate-600 font-bold uppercase tracking-widest">Servicing Floors:</span>
                      <span className="text-slate-200">{elev.floors}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 3. Sensory Zones Tab */}
            {activeTab === "sensory" && (
              <div className="space-y-4">
                {data.sensoryZones.map((zone) => (
                  <div
                    key={zone.id}
                    className="bg-black/40 border border-white/10 p-4 rounded-2xl space-y-3.5 hover:border-blue-500/30 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <VolumeX className="w-5 h-5 text-pink-400" />
                        <div>
                          <h4 className="font-sans font-bold text-white text-xs">{zone.name}</h4>
                          <p className="text-[10px] font-mono text-slate-400 mt-0.5">{zone.location}</p>
                        </div>
                      </div>

                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest bg-white/5 px-2.5 py-0.5 rounded-md border border-white/5 font-semibold">
                        Cap: {zone.capacity}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed font-sans">{zone.description}</p>

                    <div className="border-t border-white/5 pt-3 space-y-2">
                      <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest block">Available Amenities</span>
                      <div className="flex flex-wrap gap-1.5">
                        {zone.amenities.map((item, idx) => (
                          <span
                            key={idx}
                            className="bg-pink-950/20 border border-pink-500/10 text-pink-300 px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider"
                          >
                            ✓ {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 4. Request Escort Tab */}
            {activeTab === "request" && (
              <div className="space-y-4">
                {!isSubmitted ? (
                  <form id="ada-assistance-form" onSubmit={handleRequestSubmit} className="space-y-4">
                    <div className="bg-blue-950/20 border border-blue-500/20 p-4 rounded-2xl space-y-2">
                      <h4 className="text-xs font-bold text-blue-400 flex items-center gap-1.5 font-mono uppercase tracking-widest">
                        <Users className="w-4 h-4" /> Live Mobile Assistance Program
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Need physical guidance, a wheelchair escort to/from your seat, or help locating an elevator? Complete this form. We will dispatch the closest available trained World Cup Volunteer directly to your seat.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                          Your Name (Optional)
                        </label>
                        <input
                          id="ada-req-name"
                          type="text"
                          placeholder="e.g. John Doe"
                          className="w-full bg-black/40 border border-white/10 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none outline-none"
                          value={reqName}
                          onChange={(e) => setReqName(e.target.value)}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                          Assistance Type
                        </label>
                        <select
                          id="ada-req-type"
                          className="w-full bg-slate-950 border border-white/10 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none outline-none cursor-pointer"
                          value={reqType}
                          onChange={(e) => setReqType(e.target.value)}
                        >
                          <option value="Wheelchair Escort">Wheelchair Escort & Transfer</option>
                          <option value="Sighted Guide">Sighted Guide (Vision Assistance)</option>
                          <option value="Sensory Bag Request">Sensory Bag Checkout Request</option>
                          <option value="Elevator Boarding Help">Elevator Boarding Support</option>
                          <option value="General ADA Guide">General ADA Guide Escort</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                          Current Stadium Section <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="ada-req-section"
                          type="text"
                          required
                          placeholder="e.g. 114"
                          className="w-full bg-black/40 border border-white/10 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none outline-none"
                          value={reqSection}
                          onChange={(e) => setReqSection(e.target.value)}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                          Row / Seat Number
                        </label>
                        <input
                          id="ada-req-seat"
                          type="text"
                          placeholder="e.g. Row M, Seat 14"
                          className="w-full bg-black/40 border border-white/10 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none outline-none"
                          value={reqSeat}
                          onChange={(e) => setReqSeat(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                        Additional details or special requirements
                      </label>
                      <textarea
                        id="ada-req-notes"
                        rows={2}
                        placeholder="e.g. Need assistance transferring from wheelchair to stadium seating..."
                        className="w-full bg-black/40 border border-white/10 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none outline-none resize-none"
                        value={reqNotes}
                        onChange={(e) => setReqNotes(e.target.value)}
                      ></textarea>
                    </div>

                    <button
                      id="ada-submit-btn"
                      type="submit"
                      className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold font-mono uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Send className="w-3.5 h-3.5" /> Send Request to Command Center
                    </button>
                  </form>
                ) : (
                  <div className="text-center py-12 px-6 bg-emerald-950/15 border border-emerald-500/20 rounded-3xl space-y-5 animate-in zoom-in-95 duration-200">
                    <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
                      <Check className="w-6 h-6" />
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-bold text-white tracking-tight">Request Successfully Dispatched!</h4>
                      <p className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto">
                        Your ADA Assistance Ticket **{generatedId}** has been lodged with the ArenaShield Command Ops center. A certified Volunteer Coordinator has been notified.
                      </p>
                    </div>

                    <div className="p-4 bg-black/40 rounded-2xl max-w-sm mx-auto border border-white/5 text-xs space-y-2 text-left">
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-mono text-[10px] uppercase">Ticket ID</span>
                        <span className="text-blue-400 font-mono font-bold">{generatedId}</span>
                      </div>
                      <div className="flex justify-between border-t border-white/5 pt-1.5">
                        <span className="text-slate-500 font-mono text-[10px] uppercase">Service Type</span>
                        <span className="text-slate-200 font-sans font-bold">{reqType}</span>
                      </div>
                      <div className="flex justify-between border-t border-white/5 pt-1.5">
                        <span className="text-slate-500 font-mono text-[10px] uppercase">Location</span>
                        <span className="text-slate-200 font-mono">Sec {reqSection}, Row/Seat {reqSeat || "N/A"}</span>
                      </div>
                      <div className="flex justify-between border-t border-white/5 pt-1.5">
                        <span className="text-slate-500 font-mono text-[10px] uppercase">Est. Response Time</span>
                        <span className="text-emerald-400 font-mono font-bold">5 - 8 mins</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400">
                      Our volunteer Mateo Silva is currently active near Gate B and has been allocated to your zone.
                    </p>

                    <button
                      id="ada-request-new-btn"
                      onClick={resetForm}
                      className="px-4 py-2 border border-white/10 hover:border-white/20 hover:bg-white/5 rounded-xl text-slate-300 hover:text-white font-mono text-[10px] uppercase tracking-wider transition-all cursor-pointer"
                    >
                      File Another Request
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Guidelines Summary Info */}
          <div className="p-6 border-t border-white/10 bg-slate-950/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-[10px] font-mono text-slate-500">
            <span>♿ Compliant with FIFA 2026 Accessibility Stadium Codes.</span>
            <span>All sensory items KultureCity Certified.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
