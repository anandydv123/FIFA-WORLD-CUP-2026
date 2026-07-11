import { expect, test, describe, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { OpsDashboard } from "./OpsDashboard";
import { Stadium, Gate, Incident, Volunteer, TransitRoute, StadiumTelemetry } from "../types";

const mockStadium: Stadium = {
  id: "metlife",
  name: "MetLife Stadium",
  city: "East Rutherford",
  country: "USA",
  capacity: 82500,
  featuredMatch: {
    home: "Argentina",
    away: "France",
    time: "19:00",
    stage: "Final",
  },
};

const mockGates: Gate[] = [
  { name: "Gate A Primary", status: "Open", waitMinutes: 5, congestion: "Low" },
];

const mockIncidents: Incident[] = [
  { id: "inc1", category: "Medical", severity: "Critical", location: "Section 114", description: "Heat exhaustion", reportedAt: "12:00", status: "Reported", aiDispatchRecommendation: "Dispatch medic" },
];

const mockVolunteers: Volunteer[] = [
  { id: "v1", name: "Mateo Silva", location: "Section 114", status: "Available", languages: ["English"], skills: ["Medical Aid", "Emergency Dispatch"] },
];

const mockTransit: TransitRoute[] = [
  { id: "t1", name: "Meadowlands Rail Link", mode: "Train", frequencyMinutes: 10, status: "On Time", delayMinutes: 0, sustainabilityRating: "A" },
];

const mockTelemetry: StadiumTelemetry = {
  crowdDensity: 78,
  activeIncidentsCount: 1,
  averageGateWaitMinutes: 5,
  concessionEfficiency: 88,
  transitLoad: 65,
  sustainabilityScore: 92,
};

describe("OpsDashboard Component Tests", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("renders telemetry metrics and active incidents list", () => {
    const handleUpdateIncident = vi.fn();
    const handleUpdateVolunteer = vi.fn();
    const handleRefreshTelemetry = vi.fn();

    render(
      <OpsDashboard
        selectedStadium={mockStadium}
        gates={mockGates}
        incidents={mockIncidents}
        volunteers={mockVolunteers}
        transit={mockTransit}
        telemetry={mockTelemetry}
        onUpdateIncidentStatus={handleUpdateIncident}
        onUpdateVolunteerStatus={handleUpdateVolunteer}
        onRefreshTelemetry={handleRefreshTelemetry}
      />
    );

    expect(screen.getByText("Crowd Density")).toBeDefined();
    expect(screen.getByText("Active Calls")).toBeDefined();
    expect(screen.getByText("Concession Flow")).toBeDefined();
    expect(screen.getByText("Heat exhaustion")).toBeDefined();
  });

  test("clicking refresh telemetry triggers callback", () => {
    const handleUpdateIncident = vi.fn();
    const handleUpdateVolunteer = vi.fn();
    const handleRefreshTelemetry = vi.fn();

    render(
      <OpsDashboard
        selectedStadium={mockStadium}
        gates={mockGates}
        incidents={mockIncidents}
        volunteers={mockVolunteers}
        transit={mockTransit}
        telemetry={mockTelemetry}
        onUpdateIncidentStatus={handleUpdateIncident}
        onUpdateVolunteerStatus={handleUpdateVolunteer}
        onRefreshTelemetry={handleRefreshTelemetry}
      />
    );

    const ecoCard = screen.getByText("Eco Index");
    expect(ecoCard).toBeDefined();
    fireEvent.click(ecoCard);
    expect(handleRefreshTelemetry).toHaveBeenCalled();
  });

  test("AI Dispatch recommendation consults Gemini and handles fallback", async () => {
    const handleUpdateIncident = vi.fn();
    const handleUpdateVolunteer = vi.fn();
    const handleRefreshTelemetry = vi.fn();

    const fetchMock = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            assignedVolunteerId: "v1",
            assignedVolunteerName: "Mateo Silva",
            matchReasoning: "Best choice based on proximity",
            confidenceScore: 94,
            priority: "Critical",
            dispatchScript: "Please go to Section 114",
            actionSteps: ["Secure site", "Apply cold compress"],
          }),
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    render(
      <OpsDashboard
        selectedStadium={mockStadium}
        gates={mockGates}
        incidents={mockIncidents}
        volunteers={mockVolunteers}
        transit={mockTransit}
        telemetry={mockTelemetry}
        onUpdateIncidentStatus={handleUpdateIncident}
        onUpdateVolunteerStatus={handleUpdateVolunteer}
        onRefreshTelemetry={handleRefreshTelemetry}
      />
    );

    const analyzeBtn = screen.getByRole("button", { name: /Auto-Dispatch/i });
    expect(analyzeBtn).toBeDefined();
    fireEvent.click(analyzeBtn);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText(/Best choice based on proximity/i)).toBeDefined();
    });

    const confirmBtn = screen.getByRole("button", { name: /Confirm & Dispatch/i });
    expect(confirmBtn).toBeDefined();
    fireEvent.click(confirmBtn);

    expect(handleUpdateIncident).toHaveBeenCalledWith(
      "inc1",
      "Dispatched",
      "v1",
      "Mateo Silva",
      "AI Dispatch Match: Best choice based on proximity"
    );
    expect(handleUpdateVolunteer).toHaveBeenCalledWith("v1", "On Task");
  });

  test("handles Gemini Sustainability consultation and displays optimization recommendations", async () => {
    const handleUpdateIncident = vi.fn();
    const handleUpdateVolunteer = vi.fn();
    const handleRefreshTelemetry = vi.fn();

    const fetchMock = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            tips: [
              {
                title: "Custom Green Power Mode",
                description: "Reduce light panel luminance in unoccupied sections.",
                impact: "15% carbon savings",
              },
            ],
          }),
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    const { container } = render(
      <OpsDashboard
        selectedStadium={mockStadium}
        gates={mockGates}
        incidents={mockIncidents}
        volunteers={mockVolunteers}
        transit={mockTransit}
        telemetry={mockTelemetry}
        onUpdateIncidentStatus={handleUpdateIncident}
        onUpdateVolunteerStatus={handleUpdateVolunteer}
        onRefreshTelemetry={handleRefreshTelemetry}
      />
    );

    const consultBtn = container.querySelector("#green-intel-btn");
    expect(consultBtn).not.toBeNull();
    fireEvent.click(consultBtn!);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText("Custom Green Power Mode")).toBeDefined();
      expect(screen.getByText("Reduce light panel luminance in unoccupied sections.")).toBeDefined();
    });
  });

  test("marking active incident as resolved", () => {
    const handleUpdateIncident = vi.fn();
    const handleUpdateVolunteer = vi.fn();
    const handleRefreshTelemetry = vi.fn();

    // Set status to Dispatched to show Resolve button
    const dispatchedIncidents: Incident[] = [
      { id: "inc1", category: "Medical", severity: "Critical", location: "Section 114", description: "Heat exhaustion", reportedAt: "12:00", status: "Dispatched", assignedVolunteerId: "v1" },
    ];

    const { container } = render(
      <OpsDashboard
        selectedStadium={mockStadium}
        gates={mockGates}
        incidents={dispatchedIncidents}
        volunteers={mockVolunteers}
        transit={mockTransit}
        telemetry={mockTelemetry}
        onUpdateIncidentStatus={handleUpdateIncident}
        onUpdateVolunteerStatus={handleUpdateVolunteer}
        onRefreshTelemetry={handleRefreshTelemetry}
      />
    );

    const resolveBtn = container.querySelector("#resolve-btn-inc1");
    expect(resolveBtn).not.toBeNull();
    fireEvent.click(resolveBtn!);

    expect(handleUpdateIncident).toHaveBeenCalledWith("inc1", "Resolved");
    expect(handleUpdateVolunteer).toHaveBeenCalledWith("v1", "Available");
  });
});
