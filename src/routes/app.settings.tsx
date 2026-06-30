import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Settings as SettingsIcon, Save } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { loadProfile, saveProfile, type UserProfile } from "@/lib/storage";
import { PageHeader } from "./app.email";
import { toast } from "sonner";
import { useTheme } from "@/components/theme-toggle";

export const Route = createFileRoute("/app/settings")({
  head: () => ({ meta: [{ title: "Settings — UVU AI" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const [p, setP] = useState<UserProfile>(() => loadProfile());
  const { theme, setTheme } = useTheme();

  useEffect(() => setP(loadProfile()), []);

  function update<K extends keyof UserProfile>(key: K, value: UserProfile[K]) {
    setP((prev) => ({ ...prev, [key]: value }));
  }

  function save() {
    saveProfile(p);
    toast.success("Settings saved");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={SettingsIcon}
        title="Settings"
        subtitle="Personalise your UVU AI Workplace Assistant."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/60 p-6 shadow-soft">
          <h2 className="font-semibold text-foreground">User profile</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Full name">
              <Input value={p.fullName} onChange={(e) => update("fullName", e.target.value)} />
            </Field>
            <Field label="Email">
              <Input value={p.email} onChange={(e) => update("email", e.target.value)} />
            </Field>
            <Field label="Role">
              <Input value={p.role} onChange={(e) => update("role", e.target.value)} placeholder="e.g. Operations Lead" />
            </Field>
            <Field label="Company">
              <Input value={p.company} onChange={(e) => update("company", e.target.value)} />
            </Field>
          </div>
        </Card>

        <Card className="border-border/60 p-6 shadow-soft">
          <h2 className="font-semibold text-foreground">Appearance & language</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Theme">
              <Select value={theme} onValueChange={(v) => setTheme(v as "light" | "dark" | "system")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Language">
              <Select value={p.language} onValueChange={(v) => update("language", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Afrikaans">Afrikaans</SelectItem>
                  <SelectItem value="isiXhosa">isiXhosa</SelectItem>
                  <SelectItem value="isiZulu">isiZulu</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
        </Card>

        <Card className="border-border/60 p-6 shadow-soft">
          <h2 className="font-semibold text-foreground">AI preferences</h2>
          <div className="mt-4 grid gap-4">
            <Field label="Default tone">
              <Select value={p.aiTone} onValueChange={(v) => update("aiTone", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Professional", "Formal", "Friendly", "Persuasive", "Empathetic", "Direct"].map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
        </Card>

        <Card className="border-border/60 p-6 shadow-soft">
          <h2 className="font-semibold text-foreground">Notifications & privacy</h2>
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <div className="text-sm font-medium text-foreground">In-app notifications</div>
                <div className="text-xs text-muted-foreground">Alerts when AI work completes.</div>
              </div>
              <Switch checked={p.notifications} onCheckedChange={(v) => update("notifications", v)} />
            </div>
            <div className="rounded-lg border border-border p-3 text-sm text-muted-foreground">
              Your data is stored only on this device (local storage). Clear your browser data to remove it.
            </div>
          </div>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={save} className="bg-gradient-brand text-primary-foreground shadow-glow">
          <Save className="mr-2 h-4 w-4" /> Save changes
        </Button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
