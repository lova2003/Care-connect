export type Specialty =
  | "Cardiology"
  | "Dermatology"
  | "Neurology"
  | "Pediatrics"
  | "Orthopedics"
  | "General Medicine";

export const SPECIALTIES: Specialty[] = [
  "Cardiology",
  "Dermatology",
  "Neurology",
  "Pediatrics",
  "Orthopedics",
  "General Medicine",
];

export interface Doctor {
  id: string;
  _id?: string;
  name: string;
  specialty: Specialty;
  experience: number;
  rating: number;
  bio: string;
  qualifications: string[];
  available: boolean;
  fee: number;
}

export interface Appointment {
  id: string;
  _id?: string;
  doctorId: string;
  patientId?: string;
  patientName: string;
  patientEmail: string;
  date: string; // ISO yyyy-mm-dd
  time: string; // "09:30"
  status: "pending" | "confirmed" | "cancelled";
  createdAt: string;
}

export const TIME_SLOTS = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
];

export function getInitials(name: string) {
  return name
    .replace(/^Dr\.?\s+/i, "")
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
