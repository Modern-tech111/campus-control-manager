import { motion } from "framer-motion";
import { Bell, KeyRound, Monitor, Moon, Palette, Save, Sun, UserRound } from "lucide-react";
import { useState } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/layout/page-header";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const themeOptions = [
  { value: "light", label: "Light", icon: Sun, preview: "bg-gradient-to-br from-white to-slate-100" },
  { value: "dark", label: "Dark", icon: Moon, preview: "bg-gradient-to-br from-slate-800 to-slate-950" },
  { value: "system", label: "System", icon: Monitor, preview: "bg-gradient-to-br from-white via-slate-200 to-slate-800" },
] as const;

function ToggleRow({
  title,
  description,
  defaultChecked = false,
}: {
  title: string;
  description: string;
  defaultChecked?: boolean;
}) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <div className="flex items-center justify-between gap-4 py-3.5">
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={setChecked} />
    </div>
  );
}

export default function Settings() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");

  const saveProfile = (event: React.FormEvent) => {
    event.preventDefault();
    toast.success("Profile saved");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="mx-auto flex w-full max-w-[1000px] flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8"
    >
      <PageHeader
        title="Settings"
        description="Manage your account, appearance and workspace preferences."
      />

      <Tabs defaultValue="profile" className="flex flex-col gap-5 lg:flex-row lg:items-start">
        <TabsList className="h-auto w-full flex-row justify-start overflow-x-auto rounded-xl bg-muted/70 p-1.5 lg:w-52 lg:flex-col lg:rounded-2xl">
          {[
            { value: "profile", label: "Profile", icon: UserRound },
            { value: "appearance", label: "Appearance", icon: Palette },
            { value: "notifications", label: "Notifications", icon: Bell },
            { value: "security", label: "Security", icon: KeyRound },
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="justify-start gap-2.5 rounded-lg px-3 py-2 text-[13px] data-[state=active]:bg-background data-[state=active]:shadow-sm lg:w-full"
            >
              <tab.icon className="size-4" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="min-w-0 flex-1">
          {/* Profile */}
          <TabsContent value="profile" className="mt-0 space-y-4">
            <Card className="rounded-2xl border-border/60 shadow-[0_1px_2px_rgb(0_0_0/0.03),0_16px_40px_-24px_rgb(0_0_0/0.14)]">
              <CardHeader>
                <CardTitle className="text-base">Personal information</CardTitle>
                <CardDescription>Update your display name and contact email.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={saveProfile} className="flex flex-col gap-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Full name</Label>
                      <Input id="name" value={name} onChange={(event) => setName(event.target.value)} className="h-10" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="h-10" />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      rows={3}
                      placeholder="A short bio about you or your role…"
                      className="resize-none"
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" className="gap-1.5">
                      <Save className="size-4" /> Save changes
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance */}
          <TabsContent value="appearance" className="mt-0 space-y-4">
            <Card className="rounded-2xl border-border/60 shadow-[0_1px_2px_rgb(0_0_0/0.03),0_16px_40px_-24px_rgb(0_0_0/0.14)]">
              <CardHeader>
                <CardTitle className="text-base">Theme</CardTitle>
                <CardDescription>Choose how Campus Control looks for you. Changes apply instantly.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {themeOptions.map((option) => {
                    const active = theme === option.value;
                    return (
                      <button
                        key={option.value}
                        onClick={() => setTheme(option.value)}
                        className={cn(
                          "group rounded-2xl border p-3 text-left transition-all duration-200",
                          active
                            ? "border-primary/50 bg-primary/[0.04] ring-2 ring-primary/20"
                            : "border-border/60 hover:border-border",
                        )}
                      >
                        <div className={cn("relative mb-3 h-20 overflow-hidden rounded-xl border border-border/60", option.preview)}>
                          <div className="absolute top-2 left-2 h-2 w-10 rounded-sm bg-black/15" />
                          <div className="absolute top-5 left-2 h-1.5 w-7 rounded-sm bg-black/10" />
                          <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-lime-400" />
                        </div>
                        <div className="flex items-center gap-2">
                          <option.icon className="size-4 text-muted-foreground" />
                          <span className="text-[13px] font-medium text-foreground capitalize">{option.label}</span>
                          {active && <span className="ml-auto size-2 rounded-full bg-primary" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="mt-0 space-y-4">
            <Card className="rounded-2xl border-border/60 shadow-[0_1px_2px_rgb(0_0_0/0.03),0_16px_40px_-24px_rgb(0_0_0/0.14)]">
              <CardHeader>
                <CardTitle className="text-base">Notification preferences</CardTitle>
                <CardDescription>Choose what lands in your inbox and notification center.</CardDescription>
              </CardHeader>
              <CardContent className="divide-y">
                <ToggleRow title="New enrollments" description="Get notified when a student enrolls in a class." defaultChecked />
                <ToggleRow title="Weekly digest" description="A summary of school activity every Monday." defaultChecked />
                <ToggleRow title="Absence alerts" description="Warn me when attendance drops below the threshold." defaultChecked />
                <ToggleRow title="Product updates" description="News about new features and improvements." />
                <ToggleRow title="Marketing emails" description="Tips, guides and occasional announcements." />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security */}
          <TabsContent value="security" className="mt-0 space-y-4">
            <Card className="rounded-2xl border-border/60 shadow-[0_1px_2px_rgb(0_0_0/0.03),0_16px_40px_-24px_rgb(0_0_0/0.14)]">
              <CardHeader>
                <CardTitle className="text-base">Sign-in & security</CardTitle>
                <CardDescription>Campus Control uses passwordless email codes for secure access.</CardDescription>
              </CardHeader>
              <CardContent className="divide-y">
                <ToggleRow title="Two-factor authentication" description="Require a verification code on every sign-in." defaultChecked />
                <ToggleRow title="Login notifications" description="Email me when a new device signs in." defaultChecked />
                <div className="flex items-center justify-between gap-4 py-3.5">
                  <div>
                    <p className="text-sm font-medium text-foreground">Active sessions</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">Chrome · San Francisco, CA — this device</p>
                  </div>
                  <Button variant="outline" size="sm" className="text-xs">Manage sessions</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </motion.div>
  );
}
