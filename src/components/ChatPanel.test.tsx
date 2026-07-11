import { expect, test, describe, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ChatPanel } from "./ChatPanel";
import { UserRole } from "../types";

const mockStadium = {
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

const mockTelemetry = {
  crowdDensity: 78,
  activeIncidentsCount: 1,
  averageGateWaitMinutes: 11,
  concessionEfficiency: 88,
  transitLoad: 65,
  sustainabilityScore: 92,
};

describe("ChatPanel Component Tests", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    // Mock scrollIntoView
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("renders welcome message based on role", () => {
    render(
      <ChatPanel
        currentRole={UserRole.FAN}
        selectedStadium={mockStadium}
        gates={[]}
        concessions={[]}
        volunteers={[]}
        transit={[]}
        incidents={[]}
        telemetry={mockTelemetry}
      />
    );

    expect(screen.getByText(/MetLife Stadium/i)).toBeDefined();
    expect(screen.getByText(/GenAI Match-Day Companion/i)).toBeDefined();
  });

  test("renders suggestion chips and can click them to trigger message send", async () => {
    const fetchMock = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ text: "Here are some low-wait food options!" }),
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    render(
      <ChatPanel
        currentRole={UserRole.FAN}
        selectedStadium={mockStadium}
        gates={[]}
        concessions={[]}
        volunteers={[]}
        transit={[]}
        incidents={[]}
        telemetry={mockTelemetry}
      />
    );

    // Find a suggestion chip
    const chip = screen.getByText(/Accessible exits & services/i);
    expect(chip).toBeDefined();

    fireEvent.click(chip);

    // Verify it triggers a fetch
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });

    // Check that assistant reply is rendered
    await waitFor(() => {
      expect(screen.getByText(/Here are some low-wait food options!/i)).toBeDefined();
    });
  });

  test("can type a custom message and hit send button", async () => {
    const fetchMock = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ text: "AI Response to your question" }),
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    render(
      <ChatPanel
        currentRole={UserRole.FAN}
        selectedStadium={mockStadium}
        gates={[]}
        concessions={[]}
        volunteers={[]}
        transit={[]}
        incidents={[]}
        telemetry={mockTelemetry}
      />
    );

    const input = screen.getByPlaceholderText(/Query tactical assistant/i);
    fireEvent.change(input, { target: { value: "Hello, testing custom input" } });

    const sendButton = screen.getByRole("button", { name: /ASK AI/i });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText(/AI Response to your question/i)).toBeDefined();
    });
  });

  test("handles fetch network failure gracefully by showing offline message", async () => {
    const fetchMock = vi.fn().mockImplementation(() =>
      Promise.reject(new Error("Network Error"))
    );
    vi.stubGlobal("fetch", fetchMock);

    render(
      <ChatPanel
        currentRole={UserRole.FAN}
        selectedStadium={mockStadium}
        gates={[]}
        concessions={[]}
        volunteers={[]}
        transit={[]}
        incidents={[]}
        telemetry={mockTelemetry}
      />
    );

    const input = screen.getByPlaceholderText(/Query tactical assistant/i);
    fireEvent.change(input, { target: { value: "Hello" } });

    const sendButton = screen.getByRole("button", { name: /ASK AI/i });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText(/AI connection offline/i)).toBeDefined();
    });
  });
});
