import { expect, test, describe, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { AccessibilityOverlay } from "./AccessibilityOverlay";

const mockStadium = {
  id: "metlife",
  name: "MetLife Stadium",
  city: "East Rutherford",
  country: "USA",
  capacity: 82500,
  featuredMatch: {
    home: "USA",
    away: "Italy",
    time: "20:00",
    stage: "Quarter-Final",
  },
};

describe("AccessibilityOverlay Component Tests", () => {
  test("renders the header and static text correctly", () => {
    const handleClose = vi.fn();
    const handleReportIncident = vi.fn();

    render(
      <AccessibilityOverlay
        selectedStadium={mockStadium}
        onClose={handleClose}
        onReportIncident={handleReportIncident}
      />
    );

    // Verify header text is visible
    expect(screen.getByText("Accessibility & Inclusion Hub")).toBeDefined();
    expect(screen.getByText("MetLife Stadium")).toBeDefined();
  });

  test("can switch to other tabs", () => {
    const handleClose = vi.fn();
    const handleReportIncident = vi.fn();

    render(
      <AccessibilityOverlay
        selectedStadium={mockStadium}
        onClose={handleClose}
        onReportIncident={handleReportIncident}
      />
    );

    // Default tab is routes, check for routes text
    expect(screen.getByText("Gate A Primary Wheelchair Pathway")).toBeDefined();

    // Click on Elevators tab
    const elevatorsTab = screen.getByText("🛗 Elevators");
    fireEvent.click(elevatorsTab);

    // Check elevator content is displayed
    expect(screen.getByText("West Plaza Elevator (E1)")).toBeDefined();

    // Click on Sensory Zones tab
    const sensoryTab = screen.getByText("🌸 Sensory Zones");
    fireEvent.click(sensoryTab);

    // Check sensory content is displayed
    expect(screen.getByText("KultureCity Certified Sensory Room")).toBeDefined();
  });

  test("can click close button", () => {
    const handleClose = vi.fn();
    const handleReportIncident = vi.fn();

    const { container } = render(
      <AccessibilityOverlay
        selectedStadium={mockStadium}
        onClose={handleClose}
        onReportIncident={handleReportIncident}
      />
    );

    const closeBtn = container.querySelector("#ada-close-btn");
    expect(closeBtn).not.toBeNull();
    fireEvent.click(closeBtn!);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
