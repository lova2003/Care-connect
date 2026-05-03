import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Stethoscope } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Log in — MediBook" }] }),
});

function LoginPage() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const u = await login(email, password);
      toast.success(`Welcome back, ${u.name.split(" ")[0]}`);
      navigate({ to: u.role === "admin" ? "/admin" : "/dashboard" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
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
          <h1 className="mt-4 font-serif text-3xl">Welcome back</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Log in to manage your appointments.
          </p>
        </div>

        <form onSubmit={onSubmit} className="card-soft w-full space-y-5 p-8">
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label>Password</Label>
              <button
                type="button"
                onClick={() =>
                  toast.info("Password reset coming soon.")
                }
                className="text-xs text-muted-foreground hover:text-primary"
              >
                Forgot password?
              </button>
            </div>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Logging in..." : "Log in"}
          </Button>

          <div className="rounded-lg border border-border-soft bg-surface/60 p-3 text-xs text-muted-foreground">
            <div className="mb-1 font-medium text-foreground">Demo accounts</div>
            <div>Patient — patient@demo.com / password</div>
            <div>Admin — admin@demo.com / password</div>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            New to MediBook?{" "}
            <Link to="/signup" className="text-primary hover:underline">
              Create account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
