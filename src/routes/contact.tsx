import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Send, Mail, Phone, MapPin } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({ meta: [{ title: "Contact Us — MediBook" }] }),
});

const schema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  email: z.string().trim().email("Enter a valid email"),
  subject: z.string().trim().min(2, "Subject is required"),
  message: z.string().trim().min(10, "Message must be at least 10 characters"),
});

type Errors = Partial<Record<keyof z.infer<typeof schema>, string>>;

function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
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
      const res = await fetch("http://localhost:5001/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success("Message sent! We'll get back to you soon.");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send message");
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="hero-gradient">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center md:py-28">
          <h1 className="font-serif text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
            Get in <span className="text-primary">Touch</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground md:text-lg">
            Have a question, feedback, or need support? We'd love to hear from you.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <h2 className="font-serif text-2xl">Contact Information</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Reach out through any of these channels and we'll respond within 24 hours.
              </p>
            </div>

            <div className="space-y-5">
              {[
                { icon: Mail, label: "Email", value: "support@medibook.com", href: "mailto:support@medibook.com" },
                { icon: Phone, label: "Phone", value: "+1 (555) 123-4567", href: "tel:+15551234567" },
                { icon: MapPin, label: "Address", value: "123 Healthcare Avenue\nMedical District, NY 10001" },
              ].map(({ icon: Icon, label, value, href }) => (
                <div key={label} className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
                    {href ? (
                      <a href={href} className="mt-0.5 text-sm font-medium text-foreground hover:text-primary transition-colors">
                        {value}
                      </a>
                    ) : (
                      <div className="mt-0.5 whitespace-pre-line text-sm font-medium text-foreground">{value}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="card-soft p-5">
              <h3 className="font-serif text-lg">Office Hours</h3>
              <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                <div className="flex justify-between"><span>Monday – Friday</span><span className="font-medium text-foreground">9:00 AM – 6:00 PM</span></div>
                <div className="flex justify-between"><span>Saturday</span><span className="font-medium text-foreground">10:00 AM – 2:00 PM</span></div>
                <div className="flex justify-between"><span>Sunday</span><span className="font-medium text-foreground">Closed</span></div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <form onSubmit={onSubmit} className="card-soft space-y-5 p-8" noValidate>
            <h2 className="font-serif text-2xl">Send us a message</h2>

            <Field label="Your name" error={errors.name}
              input={<Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="John Doe" />}
            />
            <Field label="Email address" error={errors.email}
              input={<Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@email.com" />}
            />
            <Field label="Subject" error={errors.subject}
              input={<Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="How can we help?" />}
            />
            <Field label="Message" error={errors.message}
              input={<Textarea rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Tell us more about your inquiry..." />}
            />

            <Button type="submit" className="w-full" disabled={submitting}>
              <Send className="h-4 w-4" />
              {submitting ? "Sending..." : "Send Message"}
            </Button>
          </form>
        </div>
      </div>

      <footer className="border-t border-border/60">
        <div className="mx-auto max-w-7xl px-6 py-10 text-sm text-muted-foreground">
          © {new Date().getFullYear()} MediBook. Designed for calm, modern care.
        </div>
      </footer>
    </div>
  );
}

function Field({ label, error, input }: { label: string; error?: string; input: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">{label}</Label>
      {input}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
