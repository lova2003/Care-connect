import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { z } from "zod";
import { Star, Filter, Search } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { DoctorAvatar } from "@/components/DoctorAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useApp } from "@/lib/store";
import { SPECIALTIES, Specialty } from "@/lib/mockData";

const searchSchema = z.object({
  q: z.string().optional(),
});

export const Route = createFileRoute("/doctors")({
  component: DoctorsPage,
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Find a Doctor — MediBook" }] }),
});

function DoctorsPage() {
  const { doctors } = useApp();
  const { q } = Route.useSearch();
  const [query, setQuery] = useState(q ?? "");
  const [specs, setSpecs] = useState<Set<Specialty>>(new Set());
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [minRating, setMinRating] = useState(0);

  const filtered = useMemo(() => {
    return doctors.filter((d) => {
      if (specs.size > 0 && !specs.has(d.specialty)) return false;
      if (onlyAvailable && !d.available) return false;
      if (d.rating < minRating) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        if (
          !d.name.toLowerCase().includes(q) &&
          !d.specialty.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [doctors, specs, onlyAvailable, minRating, query]);

  const toggleSpec = (s: Specialty) => {
    setSpecs((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-10">
          <h1 className="font-serif text-4xl">Find a doctor</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {filtered.length} of {doctors.length} specialists match your filters.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          {/* Filters */}
          <aside className="card-soft h-fit p-6 lg:sticky lg:top-24">
            <div className="mb-5 flex items-center gap-2">
              <Filter className="h-4 w-4 text-primary" />
              <h2 className="font-serif text-lg">Filters</h2>
            </div>

            <div className="mb-6">
              <Label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">
                Search
              </Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Name or specialty"
                  className="pl-9"
                />
              </div>
            </div>

            <div className="mb-6">
              <Label className="mb-3 block text-xs uppercase tracking-wider text-muted-foreground">
                Specialty
              </Label>
              <div className="space-y-2.5">
                {SPECIALTIES.map((s) => (
                  <label
                    key={s}
                    className="flex cursor-pointer items-center gap-2.5 text-sm"
                  >
                    <Checkbox
                      checked={specs.has(s)}
                      onCheckedChange={() => toggleSpec(s)}
                    />
                    <span>{s}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <Label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">
                Availability
              </Label>
              <label className="flex cursor-pointer items-center gap-2.5 text-sm">
                <Checkbox
                  checked={onlyAvailable}
                  onCheckedChange={(v) => setOnlyAvailable(Boolean(v))}
                />
                <span>Available this week</span>
              </label>
            </div>

            <div>
              <Label className="mb-3 block text-xs uppercase tracking-wider text-muted-foreground">
                Minimum rating
              </Label>
              <div className="flex flex-wrap gap-2">
                {[0, 4.0, 4.5, 4.8].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setMinRating(r)}
                    className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                      minRating === r
                        ? "border-primary bg-primary-soft text-primary"
                        : "border-border text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    {r === 0 ? "Any" : `${r}+`}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Grid */}
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((d) => (
              <article
                key={d.id}
                className="card-soft card-soft-hover flex flex-col p-6"
              >
                <div className="flex items-start gap-4">
                  <DoctorAvatar name={d.name} size="lg" />
                  <div className="flex-1">
                    <h3 className="font-serif text-lg leading-tight">
                      {d.name}
                    </h3>
                    <p className="mt-0.5 text-sm text-primary">{d.specialty}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                        {d.rating}
                      </span>
                      <span>{d.experience} yrs</span>
                      <span
                        className={
                          d.available ? "text-success" : "text-muted-foreground"
                        }
                      >
                        {d.available ? "● Available" : "○ Booked up"}
                      </span>
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
                  <Button className="w-full" disabled={!d.available}>
                    {d.available ? "Book Appointment" : "Unavailable"}
                  </Button>
                </Link>
              </article>
            ))}

            {filtered.length === 0 && (
              <div className="card-soft col-span-full p-10 text-center text-muted-foreground">
                No doctors match these filters. Try clearing some.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
