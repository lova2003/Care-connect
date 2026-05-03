import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Stethoscope } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp, Role } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
  head: () => ({ meta: [{ title: "Create your account — MediBook" }] }),
});

const schema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
    email: z.string().trim().email("Enter a valid email").max(255),
    password: z.string().min(6, "Use at least 6 characters").max(100),
    confirm: z.string(),
    role: z.enum(["patient", "admin"]),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Passwords don't match",
    path: ["confirm"],
  });

type Errors = Partial<Record<keyof z.infer<typeof schema>, string>>;

function SignupPage() {
  const { signup } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
    role: "patient" as Role,
  });
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) {
        next[issue.path[0] as keyof Errors] = issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      await signup(parsed.data);
      toast.success("Welcome to MediBook!");
      navigate({ to: form.role === "admin" ? "/admin" : "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not sign up");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto flex max-w-md flex-col items-center px-6 py-16">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <Stethoscope className="h-6 w-6" />
          </span>
          <h1 className="mt-4 font-serif text-3xl">Create your account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Join MediBook to book appointments in seconds.
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="card-soft w-full space-y-5 p-8"
          noValidate
        >
          {/* Role toggle */}
          <div className="flex rounded-lg border border-border bg-surface p-1">
            {(["patient", "admin"] as Role[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setForm((f) => ({ ...f, role: r }))}
                className={`flex-1 rounded-md px-3 py-2 text-sm capitalize transition-colors ${
                  form.role === r
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <Field
            label="Full name"
            error={errors.name}
            input={
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Jane Doe"
                autoComplete="name"
              />
            }
          />
          <Field
            label="Email"
            error={errors.email}
            input={
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@email.com"
                autoComplete="email"
              />
            }
          />
          <Field
            label="Password"
            error={errors.password}
            input={
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                autoComplete="new-password"
              />
            }
          />
          <Field
            label="Confirm password"
            error={errors.confirm}
            input={
              <Input
                type="password"
                value={form.confirm}
                onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                placeholder="••••••••"
                autoComplete="new-password"
              />
            }
          />

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Creating account..." : "Create account"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  input,
}: {
  label: string;
  error?: string;
  input: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">{label}</Label>
      {input}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
