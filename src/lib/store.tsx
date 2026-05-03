import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import type { Appointment, Doctor } from "./mockData";

export type Role = "patient" | "admin";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
}

interface AppState {
  user: AuthUser | null;
  doctors: Doctor[];
  appointments: Appointment[];
  loading: boolean;
  signup: (data: {
    name: string;
    email: string;
    password: string;
    role: Role;
  }) => Promise<void>;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => void;
  updateProfile: (patch: Partial<AuthUser>) => Promise<void>;
  bookAppointment: (input: {
    doctorId: string;
    date: string;
    time: string;
  }) => Promise<Appointment>;
  cancelAppointment: (id: string) => Promise<void>;
  rescheduleAppointment: (id: string, date: string, time: string) => Promise<void>;
  addDoctor: (d: Omit<Doctor, "id">) => Promise<void>;
  updateDoctor: (id: string, patch: Partial<Doctor>) => Promise<void>;
  removeDoctor: (id: string) => Promise<void>;
  fetchDoctors: () => Promise<void>;
  fetchAppointments: () => Promise<void>;
}

const Ctx = createContext<AppState | null>(null);

const API = "http://localhost:5001/api";
const LS_TOKEN = "medibook_token";
const LS_USER = "medibook_user";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(LS_TOKEN);
}

function saveAuth(user: AuthUser, token: string) {
  localStorage.setItem(LS_TOKEN, token);
  localStorage.setItem(LS_USER, JSON.stringify(user));
}

function clearAuth() {
  localStorage.removeItem(LS_TOKEN);
  localStorage.removeItem(LS_USER);
}

async function apiFetch<T = unknown>(
  path: string,
  opts: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(opts.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API}${path}`, {
    ...opts,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data as T;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  // Hydrate from localStorage on mount, then verify with API
  useEffect(() => {
    const init = async () => {
      try {
        const savedUser = localStorage.getItem(LS_USER);
        const token = getToken();

        if (savedUser && token) {
          const parsed = JSON.parse(savedUser) as AuthUser;
          setUser(parsed);

          // Verify token is still valid
          try {
            const data = await apiFetch<{ user: AuthUser }>("/auth/me");
            setUser(data.user);
          } catch {
            // Token expired, clear auth
            clearAuth();
            setUser(null);
          }
        }
      } catch {
        clearAuth();
        setUser(null);
      }

      // Fetch doctors (public)
      try {
        const docs = await apiFetch<Doctor[]>("/doctors");
        setDoctors(docs);
      } catch {
        console.error("Failed to fetch doctors");
      }

      setLoading(false);
    };

    init();
  }, []);

  // Fetch appointments when user changes
  useEffect(() => {
    if (user) {
      fetchAppointments();
    } else {
      setAppointments([]);
    }
  }, [user?.id]);

  const fetchDoctors = useCallback(async () => {
    try {
      const docs = await apiFetch<Doctor[]>("/doctors");
      setDoctors(docs);
    } catch (err) {
      console.error("Failed to fetch doctors:", err);
    }
  }, []);

  const fetchAppointments = useCallback(async () => {
    if (!getToken()) return;
    try {
      const appts = await apiFetch<Appointment[]>("/appointments");
      setAppointments(appts);
    } catch (err) {
      console.error("Failed to fetch appointments:", err);
    }
  }, []);

  const signup: AppState["signup"] = async ({ name, email, password, role }) => {
    const data = await apiFetch<{ user: AuthUser; token: string }>("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, password, role }),
    });
    saveAuth(data.user, data.token);
    setUser(data.user);
  };

  const login: AppState["login"] = async (email, password) => {
    const data = await apiFetch<{ user: AuthUser; token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    saveAuth(data.user, data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    clearAuth();
    setUser(null);
    setAppointments([]);
  };

  const updateProfile: AppState["updateProfile"] = async (patch) => {
    const data = await apiFetch<{ user: AuthUser }>("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(patch),
    });
    setUser(data.user);
    localStorage.setItem(LS_USER, JSON.stringify(data.user));
  };

  const bookAppointment: AppState["bookAppointment"] = async ({ doctorId, date, time }) => {
    const appt = await apiFetch<Appointment>("/appointments", {
      method: "POST",
      body: JSON.stringify({ doctorId, date, time }),
    });
    setAppointments((prev) => [appt, ...prev]);
    return appt;
  };

  const cancelAppointment: AppState["cancelAppointment"] = async (id) => {
    const updated = await apiFetch<Appointment>(`/appointments/${id}`, {
      method: "PUT",
      body: JSON.stringify({ status: "cancelled" }),
    });
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? updated : a)),
    );
  };

  const rescheduleAppointment: AppState["rescheduleAppointment"] = async (id, date, time) => {
    const updated = await apiFetch<Appointment>(`/appointments/${id}`, {
      method: "PUT",
      body: JSON.stringify({ date, time, status: "confirmed" }),
    });
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? updated : a)),
    );
  };

  const addDoctor: AppState["addDoctor"] = async (d) => {
    const doc = await apiFetch<Doctor>("/doctors", {
      method: "POST",
      body: JSON.stringify(d),
    });
    setDoctors((prev) => [...prev, doc]);
  };

  const updateDoctor: AppState["updateDoctor"] = async (id, patch) => {
    const doc = await apiFetch<Doctor>(`/doctors/${id}`, {
      method: "PUT",
      body: JSON.stringify(patch),
    });
    setDoctors((prev) => prev.map((d) => (d.id === id ? doc : d)));
  };

  const removeDoctor: AppState["removeDoctor"] = async (id) => {
    await apiFetch(`/doctors/${id}`, { method: "DELETE" });
    setDoctors((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <Ctx.Provider
      value={{
        user,
        doctors,
        appointments,
        loading,
        signup,
        login,
        logout,
        updateProfile,
        bookAppointment,
        cancelAppointment,
        rescheduleAppointment,
        addDoctor,
        updateDoctor,
        removeDoctor,
        fetchDoctors,
        fetchAppointments,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
