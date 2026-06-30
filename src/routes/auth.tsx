import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { setAuthed, saveProfile, loadProfile } from "@/lib/storage";
import { BrandLockup } from "@/components/brand";
import hero from "@/assets/hero.jpg";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [{ title: "Sign in — UVU AI Workplace Assistant" }],
  }),
  component: AuthPage,
});

function AuthPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);

  function signIn(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter your email and password");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const existing = loadProfile();
      saveProfile({ ...existing, email, fullName: existing.fullName || email.split("@")[0] });
      setAuthed(true);
      toast.success("Welcome to UVU AI");
      nav({ to: "/app" });
    }, 600);
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <img
        src={hero}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover opacity-30 dark:opacity-20"
      />
      <div className="absolute inset-0 bg-gradient-hero" />
      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 py-10">
        <Card className="w-full max-w-md border-border/50 glass p-8 shadow-glow">
          <div className="mb-6 flex justify-center">
            <BrandLockup />
          </div>
          <h1 className="text-center text-2xl font-bold tracking-tight text-foreground">
            Welcome back
          </h1>
          <p className="mt-1 text-center text-sm text-muted-foreground">
            Sign in to your UVU AI Workplace Assistant
          </p>
          <form className="mt-6 space-y-4" onSubmit={signIn}>
            <div className="space-y-2">
              <Label htmlFor="email">Work email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@uvu.co.za"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <a href="#" className="text-xs text-primary hover:underline">
                  Forgot password?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <Checkbox
                checked={remember}
                onCheckedChange={(v) => setRemember(Boolean(v))}
              />
              Remember me on this device
            </label>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-brand text-primary-foreground shadow-glow"
            >
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
          <p className="mt-6 text-center text-xs text-muted-foreground">
            By signing in you agree to our{" "}
            <a href="#" className="text-primary hover:underline">Terms</a> &{" "}
            <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
          </p>
          <div className="mt-4 text-center">
            <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">
              ← Back to home
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
