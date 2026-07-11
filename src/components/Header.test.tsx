import { expect, test, describe, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Header } from "./Header";
import { UserRole } from "../types";

const mockStadiums = [
  {
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
  },
  {
    id: "azteca",
    name: "Estadio Azteca",
    city: "Mexico City",
    country: "Mexico",
    capacity: 87523,
    featuredMatch: {
      home: "Mexico",
      away: "Italy",
      time: "18:00",
      stage: "Opening",
    },
  },
];

describe("Header Component Tests", () => {
  test("renders brand logo, title, and venue select options", () => {
    const handleSetRole = vi.fn();
    const handleSetStadium = vi.fn();
    const handleResetSim = vi.fn();
    const handleOpenAccessibility = vi.fn();

    render(
      <Header
        currentRole={UserRole.FAN}
        setCurrentRole={handleSetRole}
        selectedStadium={mockStadiums[0]}
        setSelectedStadium={handleSetStadium}
        stadiums={mockStadiums}
        onResetSim={handleResetSim}
        onOpenAccessibility={handleOpenAccessibility}
      />
    );

    expect(screen.getByText("ArenaShield")).toBeDefined();
    expect(screen.getByRole("combobox", { name: /Choose stadium venue/i })).toBeDefined();
    expect(screen.getByText("MetLife Stadium (East Rutherford)")).toBeDefined();
    expect(screen.getByText("Estadio Azteca (Mexico City)")).toBeDefined();
  });

  test("clicking accessibility guide button triggers onOpenAccessibility callback", () => {
    const handleSetRole = vi.fn();
    const handleSetStadium = vi.fn();
    const handleResetSim = vi.fn();
    const handleOpenAccessibility = vi.fn();

    const { container } = render(
      <Header
        currentRole={UserRole.FAN}
        setCurrentRole={handleSetRole}
        selectedStadium={mockStadiums[0]}
        setSelectedStadium={handleSetStadium}
        stadiums={mockStadiums}
        onResetSim={handleResetSim}
        onOpenAccessibility={handleOpenAccessibility}
      />
    );

    const adaBtn = container.querySelector("#accessibility-guide-btn");
    expect(adaBtn).not.toBeNull();
    fireEvent.click(adaBtn!);
    expect(handleOpenAccessibility).toHaveBeenCalledTimes(1);
  });

  test("clicking reset sim button triggers onResetSim callback", () => {
    const handleSetRole = vi.fn();
    const handleSetStadium = vi.fn();
    const handleResetSim = vi.fn();
    const handleOpenAccessibility = vi.fn();

    const { container } = render(
      <Header
        currentRole={UserRole.FAN}
        setCurrentRole={handleSetRole}
        selectedStadium={mockStadiums[0]}
        setSelectedStadium={handleSetStadium}
        stadiums={mockStadiums}
        onResetSim={handleResetSim}
        onOpenAccessibility={handleOpenAccessibility}
      />
    );

    const resetBtn = container.querySelector("#reset-simulation-btn");
    expect(resetBtn).not.toBeNull();
    fireEvent.click(resetBtn!);
    expect(handleResetSim).toHaveBeenCalledTimes(1);
  });

  test("changing role tabs triggers setCurrentRole callback", () => {
    const handleSetRole = vi.fn();
    const handleSetStadium = vi.fn();
    const handleResetSim = vi.fn();
    const handleOpenAccessibility = vi.fn();

    const { container } = render(
      <Header
        currentRole={UserRole.FAN}
        setCurrentRole={handleSetRole}
        selectedStadium={mockStadiums[0]}
        setSelectedStadium={handleSetStadium}
        stadiums={mockStadiums}
        onResetSim={handleResetSim}
        onOpenAccessibility={handleOpenAccessibility}
      />
    );

    const volunteerBtn = container.querySelector("#role-btn-volunteer");
    expect(volunteerBtn).not.toBeNull();
    fireEvent.click(volunteerBtn!);
    expect(handleSetRole).toHaveBeenCalledWith(UserRole.VOLUNTEER);

    const opsBtn = container.querySelector("#role-btn-operations");
    expect(opsBtn).not.toBeNull();
    fireEvent.click(opsBtn!);
    expect(handleSetRole).toHaveBeenCalledWith(UserRole.OPERATIONS);
  });

  test("changing the stadium dropdown value triggers setSelectedStadium callback", () => {
    const handleSetRole = vi.fn();
    const handleSetStadium = vi.fn();
    const handleResetSim = vi.fn();
    const handleOpenAccessibility = vi.fn();

    render(
      <Header
        currentRole={UserRole.FAN}
        setCurrentRole={handleSetRole}
        selectedStadium={mockStadiums[0]}
        setSelectedStadium={handleSetStadium}
        stadiums={mockStadiums}
        onResetSim={handleResetSim}
        onOpenAccessibility={handleOpenAccessibility}
      />
    );

    const select = screen.getByRole("combobox", { name: /Choose stadium venue/i });
    fireEvent.change(select, { target: { value: "azteca" } });
    expect(handleSetStadium).toHaveBeenCalledWith(mockStadiums[1]);
  });
});
