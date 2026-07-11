/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum UserRole {
  FAN = "FAN",
  VOLUNTEER = "VOLUNTEER",
  OPERATIONS = "OPERATIONS",
}

export interface Stadium {
  id: string;
  name: string;
  city: string;
  country: string;
  capacity: number;
  featuredMatch: {
    home: string;
    away: string;
    time: string;
    stage: string;
  };
}

export interface Gate {
  name: string;
  status: "Open" | "Slow" | "Closed";
  waitMinutes: number;
  congestion: "Low" | "Medium" | "High";
}

export interface Concession {
  id: string;
  name: string;
  location: string;
  category: "Food" | "Beverages" | "Merchandise" | "First Aid" | "Water Station";
  specialty: string[];
  isAccessible: boolean;
  waitMinutes: number;
  congestion: "Low" | "Medium" | "High";
}

export interface Incident {
  id: string;
  description: string;
  location: string;
  category: "Security" | "Medical" | "Facility" | "Crowd Control" | "Lost & Found" | "Accessibility Help";
  severity: "Low" | "Medium" | "Critical";
  reportedAt: string;
  status: "Reported" | "Dispatched" | "Resolved";
  assignedVolunteerId?: string;
  assignedVolunteerName?: string;
  aiDispatchRecommendation?: string;
}

export interface Volunteer {
  id: string;
  name: string;
  status: "Available" | "On Task" | "Off Duty";
  location: string;
  languages: string[];
  skills: string[];
}

export interface TransitRoute {
  id: string;
  mode: "Train" | "Shuttle" | "Ride Share" | "Walking";
  name: string;
  frequencyMinutes: number;
  status: "On Time" | "Delayed" | "Crowded" | "Suspended";
  delayMinutes: number;
  sustainabilityRating: "A" | "B" | "C" | "D"; // Low footprint
}

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant" | "system";
  text: string;
  timestamp: string;
  language?: string;
  suggestedActions?: { label: string; action: string }[];
}

export interface StadiumTelemetry {
  crowdDensity: number; // 0 to 100
  activeIncidentsCount: number;
  averageGateWaitMinutes: number;
  concessionEfficiency: number; // 0 to 100
  transitLoad: number; // 0 to 100
  sustainabilityScore: number; // carbon offset rating or environmental health
}
