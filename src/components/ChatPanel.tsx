/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { UserRole, ChatMessage, Stadium, Gate, Concession, Volunteer, TransitRoute, Incident, StadiumTelemetry } from "../types";
import { Send, Sparkles, Languages, HelpCircle, AlertCircle, Loader2 } from "lucide-react";

interface ChatPanelProps {
  currentRole: UserRole;
  selectedStadium: Stadium;
  gates: Gate[];
  concessions: Concession[];
  volunteers: Volunteer[];
  transit: TransitRoute[];
  incidents: Incident[];
  telemetry: StadiumTelemetry;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  currentRole,
  selectedStadium,
  gates,
  concessions,
  volunteers,
  transit,
  incidents,
  telemetry,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load initial greeting message on role shift
  useEffect(() => {
    let welcomeText = "";
    if (currentRole === UserRole.FAN) {
      welcomeText = `Hola! Welcome to the **${selectedStadium.name}** GenAI Match-Day Companion! 🌟\n\nI can help you navigate the stadium, locate accessible concessions with low wait times, translate soccer terminology, and find sustainable transit home. What would you like to know?`;
    } else if (currentRole === UserRole.VOLUNTEER) {
      welcomeText = `Greetings Volunteer! 🦺 You are currently supporting operations at **${selectedStadium.name}**.\n\nI am your GenAI Assistant Coach. I can provide real-time translation help with fans, step-by-step facility emergency protocols, safety coordinates, or log-in lookup guidelines. Ask me any on-shift question.`;
    } else {
      welcomeText = `Command Center Intelligence Activated. 🖥️\n\nStanding by to provide stadium operations decision support for **${selectedStadium.name}**. I have analyzed the live telemetry, gate congestion levels, and incident queues. Ask me for crowd rerouting, emergency dispatch plans, or sustainability audits.`;
    }

    setMessages([
      {
        id: "welcome",
        sender: "assistant",
        text: welcomeText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  }, [currentRole, selectedStadium]);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Context-specific suggestion chips
  const getSuggestionChips = () => {
    if (currentRole === UserRole.FAN) {
      return [
        { label: "🍔 Find low-wait food (Vegan/Gluten-Free)", prompt: "Where is the nearest food stand with vegan or gluten free options and low wait times?" },
        { label: "🦽 Accessible exits & services", prompt: "I need accessibility assistance. Where is the accessibility hub and wheelchair rentals?" },
        { label: "🚇 Eco-friendly transit back to city", prompt: "How do I get home sustainably? What is the status of public transport compared to ride-sharing?" },
        { label: "🗣️ Translate 'Where is my gate?' into Spanish", prompt: "Help me translate: 'Excuse me, where is Gate B and can you help me find Section 114?' into Spanish, French, and Portuguese." },
      ];
    } else if (currentRole === UserRole.VOLUNTEER) {
      return [
        { label: "⚠️ Liquid spill protocol", prompt: "What are the exact step-by-step safety actions and protocols for a liquid spill on stairs?" },
        { label: "🗣️ Help translate seating directions", prompt: "Translate this to a Japanese spectator: 'Your seat is in Section 142, Row M. Please take the escalator to the first concourse level.'" },
        { label: "ℹ️ Lost passport procedure", prompt: "A fan lost their passport near the Fan Shop. What is our official lost-and-found checklist?" },
      ];
    } else {
      return [
        { label: "🚦 Crowd flow recommendations", prompt: "Gate wait times are high. What active crowd routing recommendations do you have to disperse Gate B bottlenecks?" },
        { label: "🌿 sustainability audit", prompt: "Analyze our current operations and recommend 3 ways to optimize our sustainability metrics today." },
        { label: "🔍 Incident risk assessment", prompt: "Analyze our current active incidents and volunteers. Provide a quick safety risk assessment and volunteer coordination plan." },
      ];
    }
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      // Package current telemetry/state for context embedding
      const contextData = {
        gates,
        concessions,
        volunteers,
        transit,
        incidents,
        telemetry,
      };

      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: currentRole,
          messageHistory: [...messages, userMsg].slice(-8), // Send last few turns for memory context
          currentStadium: selectedStadium,
          contextData,
        }),
      });

      if (!response.ok) {
        throw new Error("Chat server returned an error.");
      }

      const data = await response.json();
      
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: "assistant",
          text: data.text,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: "system",
          text: `⚠️ **AI connection offline**: Make sure your GEMINI_API_KEY is configured in **Settings > Secrets**. Details: ${err.message || "Failed request"}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[520px] bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative">
      {/* Header Info */}
      <div className="bg-black/40 px-5 py-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="p-1.5 bg-blue-600/10 border border-blue-500/30 text-blue-400 rounded-lg shadow-inner">
            <Sparkles className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <span className="text-xs font-bold tracking-wide text-white flex items-center gap-1.5 uppercase font-mono">
              GenAI Tactical Assistant
            </span>
            <span className="text-[10px] font-mono text-slate-400 font-semibold tracking-widest uppercase">
              {currentRole === UserRole.FAN ? "Spectator Guide Engine" : currentRole === UserRole.VOLUNTEER ? "Volunteer Coach Hub" : "Ops Decision Co-Pilot"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[9px] font-mono font-bold tracking-widest text-emerald-500 uppercase">SYS_ACTIVE</span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-black/25 scrollbar-none">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col max-w-[85%] ${
              m.sender === "user"
                ? "ml-auto items-end"
                : m.sender === "system"
                ? "mx-auto w-full max-w-full items-center text-center"
                : "mr-auto items-start"
            }`}
          >
            {/* Bubble wrapper */}
            <div
              className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                m.sender === "user"
                  ? "bg-gradient-to-br from-blue-600 to-indigo-900 text-white font-medium rounded-tr-none shadow-md shadow-blue-500/10 border border-white/10"
                  : m.sender === "system"
                  ? "bg-red-950/20 border border-red-500/20 text-red-300 rounded-xl font-mono text-[11px]"
                  : "bg-white/5 border border-white/10 text-slate-100 rounded-tl-none shadow-sm font-serif italic"
              }`}
            >
              {/* Process Markdown-like strings */}
              <p className="whitespace-pre-line text-[12px] tracking-wide leading-relaxed">
                {m.text}
              </p>
            </div>
            {/* Timestamp */}
            <span className="text-[9px] font-mono text-slate-500 mt-1.5 px-1.5 uppercase tracking-wider">{m.timestamp}</span>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-3.5 mr-auto bg-white/5 border border-white/10 p-4 rounded-2xl rounded-tl-none text-xs text-slate-400 animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
            <span className="font-mono text-[11px] uppercase tracking-wider">Compiling tactical recommendations...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips */}
      <div className="bg-black/40 p-2 border-t border-white/10 overflow-x-auto whitespace-nowrap flex gap-2 scrollbar-none">
        {getSuggestionChips().map((chip, index) => (
          <button
            key={index}
            id={`chat-chip-${index}`}
            onClick={() => handleSendMessage(chip.prompt)}
            className="px-3.5 py-2 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-[10px] font-bold uppercase tracking-wider rounded-full border border-white/10 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5"
          >
            {chip.label.includes("🍔") || chip.label.includes("🚨") || chip.label.includes("🚦") ? (
              <span>{chip.label}</span>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>{chip.label}</span>
              </>
            )}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        id="chat-input-form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(input);
        }}
        className="p-3 bg-black/40 border-t border-white/10 flex gap-2 items-center relative"
      >
        <input
          id="chat-input-field"
          type="text"
          className="flex-grow bg-black/40 border border-white/10 rounded-xl py-3 px-4 pr-24 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 outline-none"
          placeholder={
            currentRole === UserRole.FAN
              ? "Query tactical assistant..."
              : currentRole === UserRole.VOLUNTEER
              ? "Query tactical assistant..."
              : "Query tactical assistant..."
          }
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          id="chat-submit-btn"
          type="submit"
          className="absolute right-5 top-5 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer shadow-md shadow-blue-500/25"
          disabled={!input.trim() || isLoading}
        >
          ASK AI
        </button>
      </form>
    </div>
  );
};
