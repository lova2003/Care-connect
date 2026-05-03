import { Link, useNavigate } from "@tanstack/react-router";
import { Stethoscope, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const { user, logout } = useApp();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary">
            <Stethoscope className="h-5 w-5" />
          </span>
          <span className="font-serif text-xl font-semibold tracking-tight">
            MediBook
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <Link to="/" activeOptions={{ exact: true }} activeProps={{ className: "text-foreground" }} className="hover:text-foreground transition-colors">Home</Link>
          <Link to="/doctors" activeProps={{ className: "text-foreground" }} className="hover:text-foreground transition-colors">Find Doctors</Link>
          <Link to="/about" activeProps={{ className: "text-foreground" }} className="hover:text-foreground transition-colors">About</Link>
          <Link to="/contact" activeProps={{ className: "text-foreground" }} className="hover:text-foreground transition-colors">Contact</Link>
          {user?.role === "patient" && (
            <Link to="/dashboard" activeProps={{ className: "text-foreground" }} className="hover:text-foreground transition-colors">Dashboard</Link>
          )}
          {user?.role === "admin" && (
            <Link to="/admin" activeProps={{ className: "text-foreground" }} className="hover:text-foreground transition-colors">Admin</Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden text-sm text-muted-foreground sm:inline">
                {user.name.split(" ")[0]}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  logout();
                  navigate({ to: "/" });
                }}
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign out</span>
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">Log in</Button>
              </Link>
              <Link to="/signup">
                <Button size="sm">Sign up</Button>
              </Link>
            </>
          )}

          {/* Mobile menu toggle */}
          <button
            className="md:hidden rounded-lg p-2 text-muted-foreground hover:text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="border-t border-border bg-background px-6 py-4 md:hidden">
          <div className="flex flex-col gap-3 text-sm">
            <Link to="/" onClick={() => setMobileOpen(false)} className="text-muted-foreground hover:text-foreground py-1">Home</Link>
            <Link to="/doctors" onClick={() => setMobileOpen(false)} className="text-muted-foreground hover:text-foreground py-1">Find Doctors</Link>
            <Link to="/about" onClick={() => setMobileOpen(false)} className="text-muted-foreground hover:text-foreground py-1">About</Link>
            <Link to="/contact" onClick={() => setMobileOpen(false)} className="text-muted-foreground hover:text-foreground py-1">Contact</Link>
            {user?.role === "patient" && <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="text-muted-foreground hover:text-foreground py-1">Dashboard</Link>}
            {user?.role === "admin" && <Link to="/admin" onClick={() => setMobileOpen(false)} className="text-muted-foreground hover:text-foreground py-1">Admin</Link>}
          </div>
        </nav>
      )}
    </header>
  );
}
