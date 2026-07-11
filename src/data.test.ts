import { expect, test, describe } from "vitest";
import { STADIUMS, INITIAL_GATES, INITIAL_CONCESSIONS, INITIAL_VOLUNTEERS } from "./data";

describe("Stadium Static Data & Setup Validation", () => {
  test("contains exactly the correct three venues for 2026 World Cup", () => {
    expect(STADIUMS).toBeDefined();
    expect(STADIUMS.length).toBe(3);
    
    const metlife = STADIUMS.find(s => s.id === "metlife");
    expect(metlife).toBeDefined();
    expect(metlife?.city).toBe("East Rutherford");
    
    const azteca = STADIUMS.find(s => s.id === "azteca");
    expect(azteca).toBeDefined();
    expect(azteca?.city).toBe("Mexico City");
    
    const bcplace = STADIUMS.find(s => s.id === "bcplace");
    expect(bcplace).toBeDefined();
    expect(bcplace?.city).toBe("Vancouver");
  });

  test("contains valid initial gates configuration for MetLife", () => {
    expect(INITIAL_GATES).toBeDefined();
    const metlifeGates = INITIAL_GATES["metlife"];
    expect(metlifeGates).toBeDefined();
    expect(metlifeGates.length).toBeGreaterThan(0);
    
    // Check fields are populated properly
    const firstGate = metlifeGates[0];
    expect(firstGate).toHaveProperty("name");
    expect(firstGate).toHaveProperty("status");
    expect(firstGate).toHaveProperty("waitMinutes");
    expect(firstGate).toHaveProperty("congestion");
  });

  test("contains valid initial concessions configuration for all stadiums", () => {
    expect(INITIAL_CONCESSIONS).toBeDefined();
    expect(INITIAL_CONCESSIONS["metlife"]).toBeDefined();
    expect(INITIAL_CONCESSIONS["azteca"]).toBeDefined();
    expect(INITIAL_CONCESSIONS["bcplace"]).toBeDefined();

    const metlifeConcessions = INITIAL_CONCESSIONS["metlife"];
    expect(metlifeConcessions.length).toBeGreaterThan(0);
    const firstConcession = metlifeConcessions[0];
    expect(firstConcession).toHaveProperty("id");
    expect(firstConcession).toHaveProperty("name");
    expect(firstConcession).toHaveProperty("location");
    expect(firstConcession).toHaveProperty("category");
    expect(firstConcession).toHaveProperty("isAccessible");
    expect(firstConcession).toHaveProperty("waitMinutes");
    expect(firstConcession).toHaveProperty("congestion");
  });

  test("has correctly formatted initial volunteers array", () => {
    expect(INITIAL_VOLUNTEERS).toBeDefined();
    expect(INITIAL_VOLUNTEERS.length).toBeGreaterThan(0);
    
    const firstVolunteer = INITIAL_VOLUNTEERS[0];
    expect(firstVolunteer).toHaveProperty("id");
    expect(firstVolunteer).toHaveProperty("name");
    expect(firstVolunteer).toHaveProperty("status");
    expect(firstVolunteer).toHaveProperty("location");
    expect(firstVolunteer).toHaveProperty("languages");
    expect(firstVolunteer).toHaveProperty("skills");
  });
});
