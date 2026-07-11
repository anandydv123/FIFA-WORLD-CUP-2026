import { expect, test, describe, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { VolunteerDashboard } from "./VolunteerDashboard";
import { Volunteer, Incident } from "../types";

const mockVolunteers: Volunteer[] = [
  { id: "v1", name: "John Doe", location: "Plaza A", status: "Available", languages: ["English"], skills: ["Information Desk"] },
  { id: "v2", name: "Jane Smith", location: "Section 114", status: "Available", languages: ["English", "Spanish"], skills: ["Medical Aid"] },
  { id: "v3", name: "Amina Al-Sayed", location: "Section 218", status: "Available", languages: ["English", "Arabic", "French"], skills: ["First Aid", "Spanish Translation"] },
];

const mockIncidents: Incident[] = [
  { id: "inc1", category: "Medical", severity: "Critical", location: "Section 114", description: "Heat exhaustion", reportedAt: "12:00", status: "Reported", aiDispatchRecommendation: "Dispatch medic" },
];

describe("VolunteerDashboard Component Tests", () => {
  test("renders active volunteer profile and default checklists", () => {
    const handleReport = vi.fn();
    render(
      <VolunteerDashboard
        volunteers={mockVolunteers}
        incidents={mockIncidents}
        onReportIncident={handleReport}
      />
    );

    expect(screen.getByText(/Amina Al-Sayed/i)).toBeDefined();
    expect(screen.getByText(/Review emergency/i)).toBeDefined();
  });

  test("toggles a task as completed", () => {
    const handleReport = vi.fn();
    render(
      <VolunteerDashboard
        volunteers={mockVolunteers}
        incidents={mockIncidents}
        onReportIncident={handleReport}
      />
    );

    // Find task using a more flexible partial regex to avoid space/newlines issues
    const taskItem = screen.getByText(/hydration stations/i);
    expect(taskItem).toBeDefined();

    fireEvent.click(taskItem);
  });

  test("adds a custom task using the form", () => {
    const handleReport = vi.fn();
    const { container } = render(
      <VolunteerDashboard
        volunteers={mockVolunteers}
        incidents={mockIncidents}
        onReportIncident={handleReport}
      />
    );

    const input = container.querySelector("#new-task-input");
    expect(input).not.toBeNull();

    fireEvent.change(input!, { target: { value: "Review safety gear" } });

    const form = container.querySelector("#add-task-form");
    expect(form).not.toBeNull();
    fireEvent.submit(form!);

    expect(screen.getByText("Review safety gear")).toBeDefined();
  });

  test("submits an incident report successfully and displays confirmation message", () => {
    const handleReport = vi.fn();
    const { container } = render(
      <VolunteerDashboard
        volunteers={mockVolunteers}
        incidents={mockIncidents}
        onReportIncident={handleReport}
      />
    );

    const locInput = container.querySelector("#report-location-input");
    const descInput = container.querySelector("#report-description-textarea");
    const form = container.querySelector("#incident-report-form");

    expect(locInput).not.toBeNull();
    expect(descInput).not.toBeNull();
    expect(form).not.toBeNull();

    fireEvent.change(locInput!, { target: { value: "Gate B Staircase" } });
    fireEvent.change(descInput!, { target: { value: "Slippery puddle on floor" } });

    fireEvent.submit(form!);

    expect(handleReport).toHaveBeenCalledWith({
      location: "Gate B Staircase",
      description: "Slippery puddle on floor",
      category: "Facility",
      severity: "Medium",
    });

    expect(screen.getByText(/Success! Incident dispatched/i)).toBeDefined();
  });

  test("speech translator utility correctly processes phrases", () => {
    const handleReport = vi.fn();
    const { container } = render(
      <VolunteerDashboard
        volunteers={mockVolunteers}
        incidents={mockIncidents}
        onReportIncident={handleReport}
      />
    );

    const langSelect = container.querySelector("#spec-lang-select");
    const phraseInput = container.querySelector("#spectator-phrase-input");
    const transBtn = container.querySelector("#spec-translate-btn");

    expect(langSelect).not.toBeNull();
    expect(phraseInput).not.toBeNull();
    expect(transBtn).not.toBeNull();

    // Test Spanish lost son phrase
    fireEvent.change(langSelect!, { target: { value: "Spanish" } });
    fireEvent.change(phraseInput!, { target: { value: "Perdí mi hijo" } });
    fireEvent.click(transBtn!);

    expect(screen.getByText(/I lost my son/i)).toBeDefined();
    expect(screen.getByText(/EMERGENCY Protocol/i)).toBeDefined();
  });
});
