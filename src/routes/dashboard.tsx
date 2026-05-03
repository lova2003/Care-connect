import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { format, parse } from "date-fns";
import { CalendarDays, History, User as UserIcon, X, RefreshCw } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { DoctorAvatar } from "@/components/DoctorAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useApp } from "@/lib/store";
import { TIME_SLOTS } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
  head: () => ({ meta: [{ title: "My Dashboard — MediBook" }] }),
});

function DashboardPage() {
  const { user, doctors, appointments, cancelAppointment, rescheduleAppointment, updateProfile, fetchAppointments } = useApp();
  const navigate = useNavigate();
  const [section, setSection] = useState<"appts" | "profile">("appts");
  const [reschedule, setReschedule] = useState<string | null>(null);
  const [rDate, setRDate] = useState<Date | undefined>();
  const [rTime, setRTime] = useState<string | null>(null);

  useEffect(() => {
    if (!user) navigate({ to: "/login" });
    else if (user.role === "admin") navigate({ to: "/admin" });
  }, [user, navigate]);

  useEffect(() => { if (user) fetchAppointments(); }, [user]);

  const myAppts = useMemo(() => appointments.filter((a) => a.patientEmail === user?.email), [appointments, user]);
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = myAppts.filter((a) => a.date >= today && a.status !== "cancelled").sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const past = myAppts.filter((a) => a.date < today || a.status === "cancelled").sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      
      <main className="mx-auto max-w-5xl px-6 py-10">
        <header className="mb-8">
          <h1 className="font-serif text-3xl">My Dashboard</h1>
          <p className="mt-2 text-muted-foreground">Manage your appointments and profile.</p>
        </header>

        <div className="mb-8 flex gap-4 border-b border-border">
          <button onClick={() => setSection("appts")} className={cn("flex items-center gap-2 border-b-2 px-1 py-3 text-sm font-medium transition-colors", section === "appts" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>
            <CalendarDays className="h-4 w-4" /> Appointments
          </button>
          <button onClick={() => setSection("profile")} className={cn("flex items-center gap-2 border-b-2 px-1 py-3 text-sm font-medium transition-colors", section === "profile" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>
            <UserIcon className="h-4 w-4" /> Profile
          </button>
        </div>

        {section === "appts" ? (
          <div className="grid gap-10 md:grid-cols-2 lg:gap-16">
            <section>
              <h2 className="mb-4 font-serif text-xl">Upcoming</h2>
              {upcoming.length === 0 ? (<div className="card-soft flex flex-col items-center gap-4 p-10 text-center"><p className="text-sm text-muted-foreground">No upcoming appointments</p><Button onClick={() => navigate({ to: "/doctors" })}>Book your first visit</Button></div>) : (
                <div className="grid gap-4">{upcoming.map((a) => { const d = doctors.find((x) => x.id === a.doctorId); return (
                  <article key={a.id} className="card-soft flex flex-col items-start gap-4 p-5 sm:flex-row sm:items-center">
                    <DoctorAvatar name={d?.name ?? "Doctor"} size="md" />
                    <div className="flex-1"><div className="font-serif text-lg">{d?.name ?? "Doctor"}</div><div className="text-xs text-primary">{d?.specialty}</div><div className="mt-1 text-sm text-muted-foreground">{format(new Date(a.date), "EEE, MMM d")} • {format(parse(a.time, "HH:mm", new Date()), "h:mm a")}</div></div>
                    <StatusBadge status={a.status} />
                    <div className="flex flex-col gap-2 border-l border-border pl-4">
                      <Button variant="ghost" size="sm" onClick={() => { setReschedule(a.id); setRDate(new Date(a.date)); setRTime(a.time); }} className="justify-start"><RefreshCw className="h-4 w-4" />Reschedule</Button>
                      <Button variant="ghost" size="sm" onClick={async () => { await cancelAppointment(a.id); toast.success("Appointment cancelled"); }} className="justify-start text-warning hover:bg-warning/10 hover:text-warning"><X className="h-4 w-4" />Cancel</Button>
                    </div>
                  </article>); })}</div>)}
            </section>
            
            <section>
              <h2 className="mb-4 flex items-center gap-2 font-serif text-xl"><History className="h-4 w-4 text-muted-foreground" />Past</h2>
              {past.length === 0 ? (<div className="card-soft flex flex-col items-center gap-4 p-10 text-center"><p className="text-sm text-muted-foreground">No past appointments yet</p></div>) : (
                <div className="grid gap-3">{past.map((a) => { const d = doctors.find((x) => x.id === a.doctorId); return (
                  <div key={a.id} className="flex items-center gap-4 rounded-xl border border-border-soft bg-surface/40 p-4">
                    <DoctorAvatar name={d?.name ?? "Doctor"} size="sm" />
                    <div className="flex-1 text-sm"><div className="font-medium">{d?.name}</div><div className="text-xs text-muted-foreground">{format(new Date(a.date), "MMM d, yyyy")} · {format(parse(a.time, "HH:mm", new Date()), "h:mm a")}</div></div>
                    <StatusBadge status={a.status} />
                  </div>); })}</div>)}
            </section>
          </div>
        ) : (
          <ProfileSection user={user} onSave={async (patch) => { await updateProfile(patch); toast.success("Profile updated"); }} />
        )}
      </main>

      <Dialog open={!!reschedule} onOpenChange={(o) => !o && setReschedule(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-serif text-2xl">Reschedule</DialogTitle></DialogHeader>
          <div className="grid gap-6 md:grid-cols-[auto_1fr]">
            <div className="rounded-xl border border-border bg-surface/60 p-2"><Calendar mode="single" selected={rDate} onSelect={setRDate} disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))} className={cn("p-3 pointer-events-auto")} /></div>
            <div className="grid grid-cols-3 gap-2 self-start sm:grid-cols-4">{TIME_SLOTS.map((t) => (<button key={t} type="button" onClick={() => setRTime(t)} className={cn("rounded-full border px-2 py-2 text-xs sm:px-3 sm:text-sm transition-all whitespace-nowrap", rTime === t ? "border-primary bg-primary text-primary-foreground" : "border-primary/40 text-primary hover:bg-primary-soft")}>{format(parse(t, "HH:mm", new Date()), "h:mm a")}</button>))}</div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setReschedule(null)}>Cancel</Button>
            <Button disabled={!rDate || !rTime} onClick={async () => { if (!reschedule || !rDate || !rTime) return; await rescheduleAppointment(reschedule, format(rDate, "yyyy-MM-dd"), rTime); toast.success("Appointment rescheduled"); setReschedule(null); }}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatusBadge({ status }: { status: "pending" | "confirmed" | "cancelled" }) {
  const map = { confirmed: "border-primary/40 bg-primary-soft text-primary", pending: "border-warning/40 bg-warning/10 text-warning", cancelled: "border-border bg-muted/40 text-muted-foreground" };
  return <span className={cn("rounded-full border px-2.5 py-0.5 text-xs capitalize", map[status])}>{status}</span>;
}

function ProfileSection({ user, onSave }: { user: { name: string; email: string; phone?: string }; onSave: (patch: { name: string; phone?: string }) => Promise<void> }) {
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone ?? "");
  const [saving, setSaving] = useState(false);
  return (
    <div className="max-w-xl"><div className="card-soft p-8">
      <div className="mb-6 flex items-center gap-4"><DoctorAvatar name={user.name} size="lg" /><div><div className="font-serif text-xl">{user.name}</div><div className="text-sm text-muted-foreground">{user.email}</div></div></div>
      <div className="space-y-4">
        <div className="space-y-1.5"><Label>Full name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div className="space-y-1.5"><Label>Email</Label><Input value={user.email} disabled /></div>
        <div className="space-y-1.5"><Label>Phone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" /></div>
        <Button onClick={async () => { setSaving(true); await onSave({ name, phone }); setSaving(false); }} className="w-full" disabled={saving}>{saving ? "Saving..." : "Save changes"}</Button>
      </div>
    </div></div>
  );
}
