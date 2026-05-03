import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Search, Calendar, ShieldCheck, Clock, Star } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { DoctorAvatar } from "@/components/DoctorAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApp } from "@/lib/store";
import { SPECIALTIES } from "@/lib/mockData";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { doctors } = useApp();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const featured = useMemo(() => doctors.slice(0, 6), [doctors]);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/doctors", search: { q: query } as never });
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="hero-gradient">
        <div className="mx-auto max-w-5xl px-6 py-24 text-center md:py-32">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            Trusted by 12,000+ patients
          </span>
          <h1 className="mt-6 font-serif text-5xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
            Book Your Doctor,
            <br />
            <span className="text-primary">Skip the Queue.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Find specialists, see real availability, and confirm your visit in
            under a minute. No phone calls, no waiting rooms.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/doctors">
              <Button size="lg" className="min-w-44">
                <Calendar className="h-4 w-4" />
                Book Appointment
              </Button>
            </Link>
            <Link to="/signup">
              <Button size="lg" variant="ghost" className="min-w-44">
                Create account
              </Button>
            </Link>
          </div>

          {/* Search */}
          <form
            onSubmit={onSearch}
            className="mx-auto mt-12 flex max-w-xl items-center gap-2 rounded-2xl border border-border bg-surface p-2 shadow-soft"
          >
            <Search className="ml-3 h-5 w-5 shrink-0 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by specialty — e.g. Cardiology"
              className="flex-1 border-0 bg-transparent text-base shadow-none focus-visible:ring-0"
              list="specialty-list"
            />
            <datalist id="specialty-list">
              {SPECIALTIES.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
            <Button type="submit">Search</Button>
          </form>

          <div className="mt-10 grid grid-cols-2 gap-6 text-left sm:grid-cols-3">
            {[
              { icon: Clock, label: "Avg. booking", value: "47 sec" },
              { icon: ShieldCheck, label: "Verified doctors", value: "100%" },
              { icon: Star, label: "Patient rating", value: "4.8 / 5" },
            ].map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-xl border border-border-soft bg-surface/50 p-4"
              >
                <Icon className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-serif text-lg">{value}</div>
                  <div className="text-xs text-muted-foreground">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured doctors */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-3xl md:text-4xl">Featured doctors</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Hand-picked specialists available this week.
            </p>
          </div>
          <Link
            to="/doctors"
            className="text-sm text-primary hover:underline underline-offset-4"
          >
            View all →
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((d) => (
            <article
              key={d.id}
              className="card-soft card-soft-hover flex flex-col p-6"
            >
              <div className="flex items-start gap-4">
                <DoctorAvatar name={d.name} size="lg" />
                <div className="flex-1">
                  <h3 className="font-serif text-xl">{d.name}</h3>
                  <p className="mt-1 text-sm text-primary">{d.specialty}</p>
                  <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                      {d.rating}
                    </span>
                    <span>•</span>
                    <span>{d.experience} yrs exp</span>
                  </div>
                </div>
              </div>
              <p className="mt-4 line-clamp-2 text-sm text-muted-foreground">
                {d.bio}
              </p>
              <Link
                to="/book/$doctorId"
                params={{ doctorId: d.id }}
                className="mt-6"
              >
                <Button className="w-full" variant="secondary">
                  Book Now
                </Button>
              </Link>
            </article>
          ))}
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
