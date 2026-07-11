import { expect, test, describe, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { FanDashboard } from "./FanDashboard";
import { Gate, Concession, TransitRoute, Stadium } from "../types";

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

const mockConcessions: Concession[] = [
  { id: "c1", name: "Gridiron Grill", location: "Section 114, Level 1", category: "Food", waitMinutes: 10, congestion: "Medium", isAccessible: true, specialty: ["Burgers"] },
  { id: "c2", name: "Stadium Hot Dog", location: "Section 218, Level 2", category: "Food", waitMinutes: 15, congestion: "High", isAccessible: false, specialty: ["Hot Dogs"] },
  { id: "c3", name: "Hydration Oasis", location: "Section 122, Plaza", category: "Water Station", waitMinutes: 2, congestion: "Low", isAccessible: true, specialty: ["Cold Water"] },
];

const mockTransit: TransitRoute[] = [
  { id: "t1", name: "Meadowlands Rail Link", mode: "Train", frequencyMinutes: 10, status: "On Time", delayMinutes: 0, sustainabilityRating: "A" },
];

describe("FanDashboard Component Tests", () => {
  test("renders all main layout subcomponents", () => {
    const handleOpenAda = vi.fn();
    render(
      <FanDashboard
        selectedStadium={mockStadium}
        gates={mockGates}
        concessions={mockConcessions}
        transit={mockTransit}
        onOpenAccessibility={handleOpenAda}
      />
    );

    expect(screen.getByText("Match-Day Seat Routing")).toBeDefined();
    expect(screen.getByText("Translation Assist")).toBeDefined();
    expect(screen.getByText("Meadowlands Rail Link")).toBeDefined();
  });

  test("triggers onOpenAccessibility", () => {
    const handleOpenAda = vi.fn();
    const { container } = render(
      <FanDashboard
        selectedStadium={mockStadium}
        gates={mockGates}
        concessions={mockConcessions}
        transit={mockTransit}
        onOpenAccessibility={handleOpenAda}
      />
    );

    const adaBtn = container.querySelector("#fan-dashboard-ada-btn");
    expect(adaBtn).not.toBeNull();
    fireEvent.click(adaBtn!);
    expect(handleOpenAda).toHaveBeenCalled();
  });

  test("submitting seat locator form recommends gate and displays transit/concession tips", () => {
    const handleOpenAda = vi.fn();
    const { container } = render(
      <FanDashboard
        selectedStadium={mockStadium}
        gates={mockGates}
        concessions={mockConcessions}
        transit={mockTransit}
        onOpenAccessibility={handleOpenAda}
      />
    );

    const input = container.querySelector("#seat-section-input");
    expect(input).not.toBeNull();

    // Type section 110
    fireEvent.change(input!, { target: { value: "110" } });

    const form = container.querySelector("#seat-locator-form");
    expect(form).not.toBeNull();
    fireEvent.submit(form!);

    // Verify recommended gate appears
    expect(screen.getByText("Gate A (Bud Light Gate)")).toBeDefined();
    // Verify specific access tips for lower sections appear
    expect(screen.getByText(/Access Gate A for closest wheelchair ramps/i)).toBeDefined();
  });

  test("translating spectator phrase translates text instantly into multiple languages", () => {
    const handleOpenAda = vi.fn();
    const { container } = render(
      <FanDashboard
        selectedStadium={mockStadium}
        gates={mockGates}
        concessions={mockConcessions}
        transit={mockTransit}
        onOpenAccessibility={handleOpenAda}
      />
    );

    const input = container.querySelector("#translate-input");
    expect(input).not.toBeNull();

    fireEvent.change(input!, { target: { value: "bathroom" } });

    const translateBtn = container.querySelector("#translate-local-btn");
    expect(translateBtn).not.toBeNull();
    fireEvent.click(translateBtn!);

    // Should show translation results
    expect(screen.getByText(/¿Dónde están los sanitarios/i)).toBeDefined();
    expect(screen.getByText(/Où sont les toilettes/i)).toBeDefined();
  });

  test("filtering concessions by search query, category, and accessibility restriction", () => {
    const handleOpenAda = vi.fn();
    const { container } = render(
      <FanDashboard
        selectedStadium={mockStadium}
        gates={mockGates}
        concessions={mockConcessions}
        transit={mockTransit}
        onOpenAccessibility={handleOpenAda}
      />
    );

    // Default renders all
    expect(screen.getByText("Gridiron Grill")).toBeDefined();
    expect(screen.getByText("Stadium Hot Dog")).toBeDefined();
    expect(screen.getByText("Hydration Oasis")).toBeDefined();

    // Search query "oasis"
    const searchInput = container.querySelector("#concession-search-field");
    expect(searchInput).not.toBeNull();
    fireEvent.change(searchInput!, { target: { value: "oasis" } });

    expect(screen.getByText("Hydration Oasis")).toBeDefined();
    expect(screen.queryByText("Gridiron Grill")).toBeNull();

    // Reset search
    fireEvent.change(searchInput!, { target: { value: "" } });

    // Filter by "Water Station" category button (text is "WATER STATION" in uppercase)
    const waterBtn = screen.getByText("WATER STATION");
    fireEvent.click(waterBtn);
    expect(screen.getByText("Hydration Oasis")).toBeDefined();
    expect(screen.queryByText("Gridiron Grill")).toBeNull();

    // Toggle accessibility filter
    const checkbox = container.querySelector("#accessible-concessions-checkbox");
    expect(checkbox).not.toBeNull();
    
    // Switch category back to All (text is "ALL" in uppercase)
    const allBtn = screen.getByText("ALL");
    fireEvent.click(allBtn);

    // Gridiron Grill is accessible, Stadium Hot Dog is NOT accessible. Let's check checkbox.
    fireEvent.click(checkbox!);
    expect(screen.getByText("Gridiron Grill")).toBeDefined();
    expect(screen.queryByText("Stadium Hot Dog")).toBeNull();
  });
});
