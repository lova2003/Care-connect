import { createFileRoute } from "@tanstack/react-router";
import { Heart, Shield, Clock, Users, CheckCircle2, Stethoscope } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({ meta: [{ title: "About Us — MediBook" }] }),
});

function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="hero-gradient">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center md:py-28">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted-foreground">
            <Heart className="h-3.5 w-3.5 text-primary" />
            Our Mission
          </span>
          <h1 className="mt-6 font-serif text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
            Healthcare access,
            <br />
            <span className="text-primary">simplified for everyone.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            MediBook was founded on a simple belief: booking a doctor appointment
            should be as easy as booking a restaurant. We connect patients with
            trusted healthcare professionals in seconds, not hours.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-12 text-center">
          <h2 className="font-serif text-3xl md:text-4xl">Why MediBook?</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Built around the principles that matter most in healthcare.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Shield, title: "100% Verified Doctors", desc: "Every physician on MediBook is credential-verified and licensed. We partner only with accredited medical professionals." },
            { icon: Clock, title: "Instant Booking", desc: "No phone tag, no waiting on hold. See real-time availability and confirm your appointment in under 60 seconds." },
            { icon: Users, title: "Patient-First Design", desc: "Our interface was designed with patients in mind — clear information, easy navigation, and zero confusion." },
            { icon: Heart, title: "Compassionate Care", desc: "We believe healthcare should feel human. Our platform emphasises empathy and trust at every touchpoint." },
            { icon: CheckCircle2, title: "Secure & Private", desc: "Your health data stays yours. We use industry-standard encryption and never share personal information." },
            { icon: Stethoscope, title: "Multiple Specialties", desc: "From cardiology to pediatrics, find specialists across six major medical departments, all in one place." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card-soft card-soft-hover p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-serif text-xl">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <div className="mb-12 text-center">
            <h2 className="font-serif text-3xl md:text-4xl">How it Works</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Three simple steps to quality healthcare.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { step: "01", title: "Search & Filter", desc: "Browse our curated directory of verified doctors. Filter by specialty, rating, availability, or search by name." },
              { step: "02", title: "Pick Your Slot", desc: "Choose a date and time that works for you. See real-time availability and select an open slot instantly." },
              { step: "03", title: "Confirm & Visit", desc: "Review your appointment details and confirm with one click. Show up at your scheduled time — no queue." },
            ].map(({ step, title, desc }) => (
              <div key={step} className="relative text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-serif text-2xl font-semibold">
                  {step}
                </div>
                <h3 className="mt-5 font-serif text-xl">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-t border-border bg-surface/50">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {[
              { value: "12,000+", label: "Patients served" },
              { value: "150+", label: "Verified doctors" },
              { value: "47 sec", label: "Avg booking time" },
              { value: "4.8/5", label: "Patient rating" },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="font-serif text-3xl text-primary md:text-4xl">{value}</div>
                <div className="mt-1 text-xs text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border/60">
        <div className="mx-auto max-w-7xl px-6 py-10 text-sm text-muted-foreground">
          © {new Date().getFullYear()} MediBook. Designed for calm, modern care.
        </div>
      </footer>
    </div>
  );
}
