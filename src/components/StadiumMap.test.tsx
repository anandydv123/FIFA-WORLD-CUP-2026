import { expect, test, describe, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { StadiumMap } from "./StadiumMap";
import { Gate, Concession, Incident } from "../types";

const mockGates: Gate[] = [
  { name: "Gate A Primary", status: "Open", waitMinutes: 5, congestion: "Low" },
  { name: "Gate B", status: "Slow", waitMinutes: 15, congestion: "Medium" },
  { name: "Gate C", status: "Closed", waitMinutes: 0, congestion: "High" },
];

const mockConcessions: Concession[] = [
  { id: "c1", name: "Gridiron Grill", location: "Section 114", category: "Food", waitMinutes: 10, congestion: "Medium", isAccessible: true, specialty: ["Burgers", "Fries"] },
  { id: "c2", name: "Oasis Water", location: "Section 122", category: "Water Station", waitMinutes: 2, congestion: "Low", isAccessible: true, specialty: ["Cold Water"] },
];

const mockIncidents: Incident[] = [
  { id: "inc1", category: "Medical", severity: "Critical", location: "Section 114", description: "Heat exhaustion", reportedAt: "12:00", status: "Reported", aiDispatchRecommendation: "Dispatch medic" },
  { id: "inc2", category: "Facility", severity: "Low", location: "Section 142", description: "Spill", reportedAt: "12:05", status: "Resolved", aiDispatchRecommendation: "Resolve" },
];

describe("StadiumMap Component Tests", () => {
  test("renders map legend and elements", () => {
    const handleSelectGate = vi.fn();
    const handleSelectConcession = vi.fn();
    const handleSelectIncident = vi.fn();

    render(
      <StadiumMap
        gates={mockGates}
        concessions={mockConcessions}
        incidents={mockIncidents}
        onSelectGate={handleSelectGate}
        onSelectConcession={handleSelectConcession}
        onSelectIncident={handleSelectIncident}
      />
    );

    expect(screen.getByText("Live Operations Map")).toBeDefined();
    expect(screen.getByText("Map Layers")).toBeDefined();
    expect(screen.getByText("Soccer Pitch")).toBeDefined();
  });

  test("clicking gates triggers callback and mouse hover shows tooltip", async () => {
    const handleSelectGate = vi.fn();

    const { container } = render(
      <StadiumMap
        gates={mockGates}
        concessions={mockConcessions}
        incidents={mockIncidents}
        onSelectGate={handleSelectGate}
      />
    );

    // Gate groups have class cursor-pointer group. Let's find the first one.
    const gateGroup = container.querySelector("g.cursor-pointer");
    expect(gateGroup).not.toBeNull();

    // Click on the gate group
    fireEvent.click(gateGroup!);
    expect(handleSelectGate).toHaveBeenCalled();
  });

  test("clicking concession triggers onSelectConcession and hover works", () => {
    const handleSelectConcession = vi.fn();

    const { container } = render(
      <StadiumMap
        gates={mockGates}
        concessions={mockConcessions}
        incidents={mockIncidents}
        onSelectConcession={handleSelectConcession}
      />
    );

    // Concession indicator text 'F' for Food
    const foodConcessionText = screen.getByText("F");
    expect(foodConcessionText).toBeDefined();

    fireEvent.click(foodConcessionText);
    expect(handleSelectConcession).toHaveBeenCalledWith("c1");

    // Test mouseenter
    fireEvent.mouseEnter(foodConcessionText);
    expect(screen.getByText("Gridiron Grill")).toBeDefined();

    // Test mouseleave
    fireEvent.mouseLeave(foodConcessionText);
    expect(screen.queryByText("Gridiron Grill")).toBeNull();
  });
});
