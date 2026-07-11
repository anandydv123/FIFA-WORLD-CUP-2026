/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-loaded Gemini AI client to prevent startup failures if API key is missing
let aiInstance: GoogleGenAI | null = null;

function getAI(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required. Configure this in Settings > Secrets.");
    }
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

/**
 * Health check endpoint
 */
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

/**
 * Endpoint for General Chat (Fan, Volunteer, Ops Coordinator)
 * Powered by gemini-3.5-flash
 */
app.post("/api/gemini/chat", async (req, res) => {
  try {
    const { role, messageHistory, currentStadium, contextData } = req.body;
    const ai = getAI();

    // Determine specialized system instructions based on selected role
    let systemInstruction = "";
    if (role === "FAN") {
      systemInstruction = `
You are the official bilingual Match-Day Companion for the FIFA World Cup 2026.
Your goal is to assist spectators/fans with stadium operations, navigation, accessibility (ADA compliance), concessions, and transportation.

ACCESSIBILITY & INCLUSION DIRECTORY FOR THIS VENUE:
- ADA-Compliant Routes:
  * MetLife Stadium: "Gate A Primary Wheelchair Pathway" (level low-slope ramp from Parking Lot B) and "Verizon Step-Free loop" (continuous 100-level loop).
  * Estadio Azteca: "Rampa Norte Adaptada" (6% incline ramp with double handrails from Gate 2 to Section 100).
  * BC Place: "Gate A Robson St Entry" (accessible automated entry ramp) and "Tactile Guiding Loop" (embedded guidance floor strips).
- Priority Elevators:
  * MetLife Stadium: West Plaza Elevator (E1) near Sec 113, East Verizon Elevator (E2) near Sec 136, Scotiabank Club Elevator (E3) near Sec 104. All operational with Braille buttons.
  * Estadio Azteca: Elevador Poniente near Sec 105, Elevador Oriente near Sec 120.
  * BC Place: Terry Fox Plaza Lift (E1) near Gate H, Section 222 Lift near Cascade Water Station.
- Sensory-Friendly Zones:
  * MetLife Stadium: KultureCity Sensory Room at Sec 128 (with soundproof walls, wave projectors, quiet pods, and weighted mats) and Quiet Nook at Sec 212.
  * Estadio Azteca: Sala de Calma Inclusiva at Sec 105 (-35dB quiet zone with foam beds and sensory earmuff checkouts).
  * BC Place: BC Place Sensory Lounge near Sec 218 (insulated walls, bubble tubes, weighted blankets) and Quiet Zone near Sec 208.

STADIUM CONTEXT:
- Current Venue: ${currentStadium.name} in ${currentStadium.city}, ${currentStadium.country} (Capacity: ${currentStadium.capacity})
- Featured Match today: ${currentStadium.featuredMatch.home} vs ${currentStadium.featuredMatch.away} (${currentStadium.featuredMatch.stage}) at ${currentStadium.featuredMatch.time}
- Gate Statuses: ${JSON.stringify(contextData.gates)}
- Concession Stands: ${JSON.stringify(contextData.concessions)}
- Transportation and transit options: ${JSON.stringify(contextData.transit)}

RULES:
1. Provide extremely helpful, warm, and reassuring guidance to all fans, placing priority on accessibility and inclusion.
2. If a fan asks about accessibility, ADA routes, elevators, or sensory-friendly zones, give them exact stadium details (like Sec 128 or specific gates) based on the current venue.
3. Inform fans that they can open the interactive "ADA Guide" overlay button on their Spectator Portal to view a detailed map, see elevator status, or request a Live Volunteer Escort right to their seat!
4. If a fan asks about food/drinks, recommend specific stands, mention specialty options (e.g., halal, vegan, gluten-free), and check their wait times and congestion level.
5. For transportation, recommend sustainable options (like Trains or Shuttles) and warn them about congestion or delays in low-sustainability options like Ride Share (Lot E).
6. If they want to translate something (e.g. 'where is the bathroom' or 'I need water'), provide immediate translations in Spanish, French, and Portuguese.
7. Keep your answers concise, highly scannable, and formatted beautifully in markdown with bullet points and bold headers.
`;
    } else if (role === "VOLUNTEER") {
      systemInstruction = `
You are the Volunteer Dispatch & Operations Coordinator Coach for the FIFA World Cup 2026.
Your job is to provide direct, professional instructions to volunteers inside the stadium on how to perform tasks, handle emergencies, translate for fans, and follow tournament rules.
VOLUNTEER CONTEXT:
- Active Volunteer Profiles: ${JSON.stringify(contextData.volunteers)}
- Current Stadium: ${currentStadium.name}
- Ongoing Stadium Incidents: ${JSON.stringify(contextData.incidents)}

RULES:
1. Speak in a helpful, direct, and authoritative coaching tone.
2. Give clear, step-by-step instructions for tasks (e.g. handling a liquid spill, assisting a lost child, escorts for disabled fans, or crowd redirection).
3. Always emphasize safety first (e.g. placing warning signs, contacting medical, or securing the area before treating).
4. Support multilingual interpretation: help the volunteer translate instructions to spectators in English, Spanish, French, Portuguese, or Japanese.
5. Keep instructions structured, clear, and bulleted for rapid reading during an active shift.
`;
    } else {
      // OPERATIONS COORDINATOR
      systemInstruction = `
You are the Chief Stadium Operations Decision Support Engine for the FIFA World Cup 2026 Command Center.
Your job is to provide real-time strategic intelligence, safety analysis, crowd routing recommendations, and sustainability tracking support for Venue Staff.
OPERATIONS CONTEXT:
- Live Venue Telemetry: ${JSON.stringify(contextData.telemetry)}
- Gate Queues: ${JSON.stringify(contextData.gates)}
- Active Incident Queue: ${JSON.stringify(contextData.incidents)}
- Volunteer Force Availability: ${JSON.stringify(contextData.volunteers)}

RULES:
1. Provide highly analytical, executive-level, and actionable operational insights.
2. Recommend crowd management protocols if gate wait times exceed 20 minutes (e.g. diverting new arrivals from Gate B to Gate A).
3. Coordinate incident response by analyzing which volunteers have the exact skills/languages needed to resolve the incidents.
4. Suggest energy, water, or waste mitigation steps to maintain the high tournament sustainability score.
5. Provide concise reports, emphasizing metrics, risk levels, and dispatch logic. Use precise stadium operations terminology.
`;
    }

    // Map message history to Gemini SDK format
    // GoogleGenAI SDK generateContent expect contents parameter.
    // Let's format the chat properly.
    const contents = messageHistory.map((m: any) => ({
      role: m.sender === "user" ? "user" : "model",
      parts: [{ text: m.text }],
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ text: response.text || "I was unable to process that. Please try again." });
  } catch (error: any) {
    console.error("Gemini Chat API Error:", error);
    res.status(500).json({ error: error.message || "Internal Server Error in Gemini integration" });
  }
});

/**
 * Endpoint for AI Incident Dispatch and Routing Analysis
 * Uses Structured Outputs (JSON Schema) to recommend the optimal volunteer and plan
 */
app.post("/api/gemini/dispatch", async (req, res) => {
  try {
    const { incident, volunteers } = req.body;
    const ai = getAI();

    const systemInstruction = `
You are the AI Dispatch Coordinator for stadium safety.
Analyze the reported incident and match it against the available volunteers' locations, languages, and skills.
Recommend the single best available volunteer to handle the incident, outline step-by-step safety actions, and compose an official SMS/dispatch alert to send to the volunteer.
`;

    const prompt = `
INCIDENT TO RESOLVE:
- Description: ${incident.description}
- Location: ${incident.location}
- Category: ${incident.category}
- Severity: ${incident.severity}

ACTIVE VOLUNTEER LIST:
${JSON.stringify(volunteers)}

Generate a structured dispatch recommendation. Choose the best volunteer based on matching skills, languages, and proximity if possible.
If no volunteer is available or suitable, explain why and recommend general operations dispatch.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            assignedVolunteerId: {
              type: Type.STRING,
              description: "The ID of the volunteer being assigned, or 'GENERAL_OPS' if none.",
            },
            assignedVolunteerName: {
              type: Type.STRING,
              description: "Name of the volunteer, or 'General Stadium Staff' if none.",
            },
            matchReasoning: {
              type: Type.STRING,
              description: "Why this volunteer was matched (e.g., proximity, language, skills matching the incident).",
            },
            confidenceScore: {
              type: Type.NUMBER,
              description: "Matching confidence level from 0 to 100 based on fit.",
            },
            priority: {
              type: Type.STRING,
              description: "Safety priority: Low, Medium, or Critical.",
            },
            dispatchScript: {
              type: Type.STRING,
              description: "Exact text message to send to the volunteer's mobile app with location and duties.",
            },
            actionSteps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Immediate safety/facility protocol steps for the responder.",
            },
          },
          required: [
            "assignedVolunteerId",
            "assignedVolunteerName",
            "matchReasoning",
            "confidenceScore",
            "priority",
            "dispatchScript",
            "actionSteps",
          ],
        },
      },
    });

    const recommendation = JSON.parse(response.text || "{}");
    res.json(recommendation);
  } catch (error: any) {
    console.error("Gemini Dispatch API Error:", error);
    res.status(500).json({ error: error.message || "Failed to analyze dispatch options" });
  }
});

/**
 * Endpoint for Stadium Sustainability Optimization Advice
 */
app.post("/api/gemini/sustainability", async (req, res) => {
  try {
    const { stadium, telemetry, transitRoutes } = req.body;
    const ai = getAI();

    const prompt = `
Analyze the World Cup Stadium environmental stats and generate exactly 3 concrete, stadium-specific sustainability tips to reduce carbon footprint, optimize waste streams, and incentivize green transport.

STADIUM STATS:
- Stadium: ${stadium.name}
- Capacity: ${stadium.capacity}
- Telemetry: ${JSON.stringify(telemetry)}
- Transit routes: ${JSON.stringify(transitRoutes)}

Generate a JSON object containing an array of 3 tips. Each tip should contain:
1. title (concise bold header)
2. description (practical stadium action)
3. impact (estimated environmental/resource savings, e.g. "Saves 4,500 kg CO2" or "Reduces landfill waste by 12%")
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tips: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  impact: { type: Type.STRING },
                },
                required: ["title", "description", "impact"],
              },
            },
          },
          required: ["tips"],
        },
      },
    });

    const data = JSON.parse(response.text || '{"tips": []}');
    res.json(data);
  } catch (error: any) {
    console.error("Gemini Sustainability API Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate sustainability advice" });
  }
});

// ----------------------------------------------------
// VITE OR STATIC FILE MIDDLEWARE
// ----------------------------------------------------

async function setupFrontend() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in development mode with Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in production mode with static file serving...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`FIFA 2026 Stadium Server is live on http://0.0.0.0:${PORT}`);
  });
}

setupFrontend().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
