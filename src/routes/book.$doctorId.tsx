import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { format, parse } from "date-fns";
import { ArrowLeft, Star, Award, Clock, CheckCircle2 } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { DoctorAvatar } from "@/components/DoctorAvatar";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useApp } from "@/lib/store";
import { TIME_SLOTS } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/book/$doctorId")({
  component: BookingPage,
  head: () => ({ meta: [{ title: "Book Appointment — MediBook" }] }),
});

function BookingPage() {
  const { doctorId } = Route.useParams();
  const { doctors, appointments, user, bookAppointment } = useApp();
  const navigate = useNavigate();
  const doctor = doctors.find((d) => d.id === doctorId);

  const [date, setDate] = useState<Date | undefined>(() => { const t = new Date(); t.setDate(t.getDate() + 1); return t; });
  const [time, setTime] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [booking, setBooking] = useState(false);

  const dateStr = date ? format(date, "yyyy-MM-dd") : "";

  const bookedTimes = useMemo(() => {
    return new Set(appointments.filter((a) => a.doctorId === doctorId && a.date === dateStr && a.status !== "cancelled").map((a) => a.time));
  }, [appointments, doctorId, dateStr]);

  if (!doctor) {
    return (<div className="min-h-screen bg-background"><SiteHeader /><div className="mx-auto max-w-2xl p-12 text-center"><h1 className="font-serif text-2xl">Doctor not found</h1><Link to="/doctors" className="mt-4 inline-block text-primary">← Back to doctors</Link></div></div>);
  }

  const handleConfirm = async () => {
    if (!user) { toast.error("Please log in to book an appointment."); navigate({ to: "/login" }); return; }
    if (!date || !time) return;
    setBooking(true);
    try {
      await bookAppointment({ doctorId: doctor.id, date: dateStr, time });
      setSuccess(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Booking failed");
    }
    setBooking(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-6 py-10">
        <Link to="/doctors" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />Back to doctors</Link>
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
          <div className="card-soft h-fit p-8">
            <div className="flex items-start gap-5">
              <DoctorAvatar name={doctor.name} size="xl" />
              <div>
                <h1 className="font-serif text-3xl leading-tight">{doctor.name}</h1>
                <p className="mt-1 text-primary">{doctor.specialty}</p>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-primary text-primary" />{doctor.rating}</span>
                  <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {doctor.experience} yrs</span>
                  <span>${doctor.fee} / visit</span>
                </div>
              </div>
            </div>
            <div className="mt-8"><h2 className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">About</h2><p className="text-sm leading-relaxed text-foreground/90">{doctor.bio}</p></div>
            <div className="mt-6"><h2 className="mb-3 text-xs uppercase tracking-wider text-muted-foreground">Qualifications</h2><ul className="space-y-2">{doctor.qualifications.map((q) => (<li key={q} className="flex items-center gap-2 text-sm"><Award className="h-4 w-4 text-primary" />{q}</li>))}</ul></div>
          </div>
          <div className="card-soft p-8">
            <h2 className="font-serif text-2xl">Pick a date & time</h2>
            <p className="mt-1 text-sm text-muted-foreground">Choose any open slot — confirmation is instant.</p>
            <div className="mt-6 grid gap-8 md:grid-cols-[auto_1fr]">
              <div className="rounded-xl border border-border bg-surface/60 p-2"><Calendar mode="single" selected={date} onSelect={setDate} disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))} initialFocus className={cn("p-3 pointer-events-auto")} /></div>
              <div>
                <div className="mb-3 text-sm text-muted-foreground">{date ? format(date, "EEEE, MMMM d") : "Select a date to see slots"}</div>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4">{TIME_SLOTS.map((t) => { const booked = bookedTimes.has(t); const selected = t === time; return (<button key={t} type="button" disabled={booked} onClick={() => setTime(t)} className={cn("rounded-full border px-2 py-2 text-xs sm:px-3 sm:text-sm transition-all whitespace-nowrap", booked ? "cursor-not-allowed border-border-soft bg-muted/40 text-muted-foreground/50 line-through" : selected ? "border-primary bg-primary text-primary-foreground shadow-soft" : "border-primary/40 text-primary hover:bg-primary-soft")}>{format(parse(t, "HH:mm", new Date()), "h:mm a")}</button>); })}</div>
                <Button className="mt-8 w-full" size="lg" disabled={!date || !time} onClick={() => setConfirmOpen(true)}>Continue</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Dialog open={confirmOpen} onOpenChange={(o) => { setConfirmOpen(o); if (!o) setSuccess(false); }}>
        <DialogContent>
          {!success ? (<>
            <DialogHeader><DialogTitle className="font-serif text-2xl">Confirm appointment</DialogTitle><DialogDescription>Please review the details below.</DialogDescription></DialogHeader>
            <div className="space-y-3 rounded-lg border border-border bg-surface/60 p-4 text-sm">
              <Row label="Doctor" value={doctor.name} /><Row label="Specialty" value={doctor.specialty} />
              <Row label="Date" value={date ? format(date, "EEEE, MMMM d, yyyy") : "—"} />
              <Row label="Time" value={time ? format(parse(time, "HH:mm", new Date()), "h:mm a") : "—"} />
              <Row label="Fee" value={`$${doctor.fee}`} />
            </div>
            <DialogFooter><Button variant="ghost" onClick={() => setConfirmOpen(false)}>Back</Button><Button onClick={handleConfirm} disabled={booking}>{booking ? "Booking..." : "Confirm booking"}</Button></DialogFooter>
          </>) : (
            <div className="py-6 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft"><CheckCircle2 className="h-8 w-8 text-primary" /></div>
              <h3 className="mt-4 font-serif text-2xl">You're booked.</h3>
              <p className="mt-2 text-sm text-muted-foreground">We've sent confirmation to {user?.email}.</p>
              <div className="mt-6 flex justify-center gap-3">
                <Button variant="ghost" onClick={() => { setConfirmOpen(false); setSuccess(false); }}>Book another</Button>
                <Button onClick={() => navigate({ to: "/dashboard" })}>View my appointments</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (<div className="flex items-center justify-between"><span className="text-muted-foreground">{label}</span><span className="font-medium">{value}</span></div>);
}
