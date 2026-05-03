import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { format, parse } from "date-fns";
import { LayoutDashboard, UserPlus, CalendarRange, Users as UsersIcon, Plus, Pencil, Trash2, Star } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { DoctorAvatar } from "@/components/DoctorAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useApp } from "@/lib/store";
import { Doctor, SPECIALTIES, Specialty } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({ meta: [{ title: "Admin Panel — MediBook" }] }),
});

type Section = "overview" | "doctors" | "appointments" | "patients";

function AdminPage() {
  const { user, doctors, appointments, addDoctor, updateDoctor, removeDoctor, fetchDoctors, fetchAppointments } = useApp();
  const navigate = useNavigate();
  const [section, setSection] = useState<Section>("overview");

  useEffect(() => {
    if (!user) navigate({ to: "/login" });
    else if (user.role !== "admin") navigate({ to: "/dashboard" });
  }, [user, navigate]);

  useEffect(() => { if (user?.role === "admin") { fetchDoctors(); fetchAppointments(); } }, [user]);

  if (!user || user.role !== "admin") return null;

  const today = new Date().toISOString().slice(0, 10);
  const todays = appointments.filter((a) => a.date === today);
  const patients = (() => {
    const map = new Map<string, { name: string; email: string; total: number; lastVisit: string }>();
    appointments.forEach((a) => {
      const existing = map.get(a.patientEmail);
      if (existing) { existing.total += 1; if (a.date > existing.lastVisit) existing.lastVisit = a.date; }
      else { map.set(a.patientEmail, { name: a.patientName, email: a.patientEmail, total: 1, lastVisit: a.date }); }
    });
    return Array.from(map.values());
  })();

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      
      <main className="mx-auto max-w-6xl px-6 py-10">
        <header className="mb-8">
          <h1 className="font-serif text-3xl">Admin Dashboard</h1>
          <p className="mt-2 text-muted-foreground">Manage doctors, appointments, and system overview.</p>
        </header>

        <div className="mb-8 flex flex-wrap gap-2 border-b border-border">
          {(["overview", "doctors", "appointments", "patients"] as Section[]).map((k) => (
            <button key={k} onClick={() => setSection(k)} className={cn("border-b-2 px-4 py-3 text-sm font-medium capitalize transition-colors", section === k ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>{k}</button>
          ))}
        </div>

        {section === "overview" && (
          <div className="space-y-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Stat label="Total Doctors" value={doctors.length} />
              <Stat label="Total Appointments" value={appointments.length} />
              <Stat label="Today's Bookings" value={todays.length} />
              <Stat label="Confirmed" value={appointments.filter((a) => a.status === "confirmed").length} />
            </div>
            <div className="card-soft p-6">
              <h2 className="mb-4 font-serif text-lg">Today's schedule</h2>
              {todays.length === 0 ? (<p className="text-sm text-muted-foreground">Nothing on the books for today.</p>) : (
                <ul className="space-y-2">{todays.map((a) => { const d = doctors.find((x) => x.id === a.doctorId); return (
                  <li key={a.id} className="flex items-center gap-4 rounded-lg border border-border-soft bg-surface/40 p-3 text-sm">
                    <span className="font-mono text-primary">{format(parse(a.time, "HH:mm", new Date()), "h:mm a")}</span>
                    <span className="flex-1">{a.patientName} · {d?.name}</span>
                    <span className="text-xs text-muted-foreground">{a.status}</span>
                  </li>); })}</ul>
              )}
            </div>
          </div>
        )}

        {section === "doctors" && <DoctorsAdmin doctors={doctors} onAdd={addDoctor} onUpdate={updateDoctor} onRemove={removeDoctor} />}
        {section === "appointments" && <AppointmentsTable doctors={doctors} appointments={appointments} />}
        {section === "patients" && (
          <div className="card-soft overflow-hidden"><Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Total visits</TableHead><TableHead>Last visit</TableHead></TableRow></TableHeader><TableBody>
            {patients.map((p) => (<TableRow key={p.email}><TableCell className="font-medium">{p.name}</TableCell><TableCell className="text-muted-foreground">{p.email}</TableCell><TableCell>{p.total}</TableCell><TableCell>{format(new Date(p.lastVisit), "MMM d, yyyy")}</TableCell></TableRow>))}
            {patients.length === 0 && (<TableRow><TableCell colSpan={4} className="py-10 text-center text-muted-foreground">No patients yet.</TableCell></TableRow>)}
          </TableBody></Table></div>
        )}
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (<div className="card-soft p-6"><div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div><div className="mt-2 font-serif text-4xl">{value}</div></div>);
}

interface DoctorFormState { name: string; specialty: Specialty; experience: number; rating: number; bio: string; qualifications: string; available: boolean; fee: number; }
const emptyDoctor: DoctorFormState = { name: "", specialty: "General Medicine", experience: 1, rating: 4.5, bio: "", qualifications: "", available: true, fee: 50 };

function DoctorsAdmin({ doctors, onAdd, onUpdate, onRemove }: { doctors: Doctor[]; onAdd: (d: Omit<Doctor, "id">) => Promise<void>; onUpdate: (id: string, patch: Partial<Doctor>) => Promise<void>; onRemove: (id: string) => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Doctor | null>(null);
  const [form, setForm] = useState<DoctorFormState>(emptyDoctor);
  const [saving, setSaving] = useState(false);

  const startNew = () => { setEditing(null); setForm(emptyDoctor); setOpen(true); };
  const startEdit = (d: Doctor) => { setEditing(d); setForm({ name: d.name, specialty: d.specialty, experience: d.experience, rating: d.rating, bio: d.bio, qualifications: d.qualifications.join(", "), available: d.available, fee: d.fee }); setOpen(true); };

  const submit = async () => {
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    setSaving(true);
    const payload = { name: form.name.trim(), specialty: form.specialty, experience: Number(form.experience) || 0, rating: Math.min(5, Math.max(0, Number(form.rating) || 0)), bio: form.bio.trim(), qualifications: form.qualifications.split(",").map((s) => s.trim()).filter(Boolean), available: form.available, fee: Number(form.fee) || 0 };
    try {
      if (editing) { await onUpdate(editing.id, payload); toast.success("Doctor updated"); }
      else { await onAdd(payload); toast.success("Doctor added"); }
      setOpen(false);
    } catch (err) { toast.error(err instanceof Error ? err.message : "Failed"); }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><p className="text-sm text-muted-foreground">{doctors.length} doctors in the directory</p><Button onClick={startNew}><Plus className="h-4 w-4" />Add doctor</Button></div>
      <div className="card-soft overflow-hidden"><Table><TableHeader><TableRow><TableHead>Doctor</TableHead><TableHead>Specialty</TableHead><TableHead>Exp</TableHead><TableHead>Rating</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>
        {doctors.map((d) => (<TableRow key={d.id}><TableCell><div className="flex items-center gap-3"><DoctorAvatar name={d.name} size="sm" /><span className="font-medium">{d.name}</span></div></TableCell><TableCell>{d.specialty}</TableCell><TableCell>{d.experience} yrs</TableCell><TableCell><span className="inline-flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-primary text-primary" />{d.rating}</span></TableCell><TableCell><span className={d.available ? "text-success" : "text-muted-foreground"}>{d.available ? "Available" : "Off"}</span></TableCell><TableCell className="text-right"><div className="inline-flex gap-1"><Button variant="ghost" size="sm" onClick={() => startEdit(d)}><Pencil className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="sm" onClick={async () => { await onRemove(d.id); toast.success("Doctor removed"); }}><Trash2 className="h-3.5 w-3.5" /></Button></div></TableCell></TableRow>))}
      </TableBody></Table></div>
      <Dialog open={open} onOpenChange={setOpen}><DialogContent className="max-w-lg"><DialogHeader><DialogTitle className="font-serif text-2xl">{editing ? "Edit doctor" : "Add doctor"}</DialogTitle></DialogHeader>
        <div className="grid gap-4">
          <div className="space-y-1.5"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Dr. Jane Doe" /></div>
          <div className="grid grid-cols-2 gap-4"><div className="space-y-1.5"><Label>Specialty</Label><Select value={form.specialty} onValueChange={(v) => setForm({ ...form, specialty: v as Specialty })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{SPECIALTIES.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}</SelectContent></Select></div><div className="space-y-1.5"><Label>Fee ($)</Label><Input type="number" value={form.fee} onChange={(e) => setForm({ ...form, fee: Number(e.target.value) })} /></div></div>
          <div className="grid grid-cols-2 gap-4"><div className="space-y-1.5"><Label>Experience (yrs)</Label><Input type="number" value={form.experience} onChange={(e) => setForm({ ...form, experience: Number(e.target.value) })} /></div><div className="space-y-1.5"><Label>Rating (0-5)</Label><Input type="number" step="0.1" value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} /></div></div>
          <div className="space-y-1.5"><Label>Bio</Label><Textarea rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>Qualifications (comma separated)</Label><Input value={form.qualifications} onChange={(e) => setForm({ ...form, qualifications: e.target.value })} placeholder="MBBS, MD Cardiology" /></div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.available} onChange={(e) => setForm({ ...form, available: e.target.checked })} className="h-4 w-4 accent-[var(--color-primary)]" />Available for appointments</label>
        </div>
        <DialogFooter><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={submit} disabled={saving}>{saving ? "Saving..." : editing ? "Save changes" : "Add doctor"}</Button></DialogFooter>
      </DialogContent></Dialog>
    </div>
  );
}

function AppointmentsTable({ doctors, appointments }: { doctors: Doctor[]; appointments: ReturnType<typeof useApp>["appointments"] }) {
  const [status, setStatus] = useState<string>("all");
  const [docFilter, setDocFilter] = useState<string>("all");
  const filtered = appointments.filter((a) => { if (status !== "all" && a.status !== status) return false; if (docFilter !== "all" && a.doctorId !== docFilter) return false; return true; });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <div className="w-44"><Select value={status} onValueChange={setStatus}><SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">All statuses</SelectItem><SelectItem value="confirmed">Confirmed</SelectItem><SelectItem value="pending">Pending</SelectItem><SelectItem value="cancelled">Cancelled</SelectItem></SelectContent></Select></div>
        <div className="w-56"><Select value={docFilter} onValueChange={setDocFilter}><SelectTrigger><SelectValue placeholder="Doctor" /></SelectTrigger><SelectContent><SelectItem value="all">All doctors</SelectItem>{doctors.map((d) => (<SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>))}</SelectContent></Select></div>
      </div>
      <div className="card-soft overflow-hidden"><Table><TableHeader><TableRow><TableHead>Patient</TableHead><TableHead>Doctor</TableHead><TableHead>Date</TableHead><TableHead>Time</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>
        {filtered.sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time)).map((a) => { const d = doctors.find((x) => x.id === a.doctorId); return (
          <TableRow key={a.id}><TableCell className="font-medium">{a.patientName}</TableCell><TableCell>{d?.name}</TableCell><TableCell>{format(new Date(a.date), "MMM d, yyyy")}</TableCell><TableCell>{format(parse(a.time, "HH:mm", new Date()), "h:mm a")}</TableCell><TableCell><span className={cn("rounded-full border px-2.5 py-0.5 text-xs capitalize", a.status === "confirmed" && "border-primary/40 bg-primary-soft text-primary", a.status === "pending" && "border-warning/40 bg-warning/10 text-warning", a.status === "cancelled" && "border-border bg-muted/40 text-muted-foreground")}>{a.status}</span></TableCell></TableRow>); })}
        {filtered.length === 0 && (<TableRow><TableCell colSpan={5} className="py-10 text-center text-muted-foreground">No appointments match these filters.</TableCell></TableRow>)}
      </TableBody></Table></div>
    </div>
  );
}
