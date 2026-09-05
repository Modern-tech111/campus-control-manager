import { motion } from "framer-motion";
import { GraduationCap, Loader2, Lock, Mail, UserRound } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Navigate, useSearchParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BrandMark } from "@/components/brand";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

export default function Auth() {
  const { isAuthenticated, signIn, signUp } = useAuth();
  const [params] = useSearchParams();
  const returnTo = params.get("returnTo") || "/dashboard";

  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to={returnTo} replace />;
  }

  const switchMode = (next: "login" | "register") => {
    setMode(next);
    setError(null);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === "login") {
        await signIn(email, password);
      } else {
        await signUp(name, email, password);
      }
      // AuthProvider updates state; the <Navigate> above takes us home.
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid opacity-60" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,rgba(158,240,26,0.16),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_100%,rgba(34,197,94,0.1),transparent_50%)]" />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-md"
      >
        {/* Brand */}
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <BrandMark className="size-12 rounded-2xl" />
          <div>
            <h1 dir="ltr" className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight text-foreground">
              Campus Control
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              School management dashboard
            </p>
          </div>
        </div>

        <Card className="glass-panel overflow-hidden rounded-2xl border-border/60">
          <Tabs value={mode} onValueChange={(v) => switchMode(v as "login" | "register")}>
            <TabsList className="grid w-full grid-cols-2 gap-1 rounded-none border-b border-border/60 bg-transparent p-1.5">
              <TabsTrigger value="login" className="rounded-lg py-2 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm">
                Sign in
              </TabsTrigger>
              <TabsTrigger value="register" className="rounded-lg py-2 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm">
                Create account
              </TabsTrigger>
            </TabsList>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6">
              <motion.div
                key={mode}
                initial={{ opacity: 0, x: mode === "login" ? -8 : 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col gap-4"
              >
                {mode === "register" && (
                  <div className="grid gap-2">
                    <Label htmlFor="auth-name">Full name</Label>
                    <div className="relative">
                      <UserRound className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="auth-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Alex Morgan"
                        autoComplete="name"
                        required
                        className="h-11 rounded-xl bg-background pl-9 shadow-none"
                      />
                    </div>
                  </div>
                )}

                <div className="grid gap-2">
                  <Label htmlFor="auth-email">Email</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="auth-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@campus.edu"
                      autoComplete="email"
                      required
                      className="h-11 rounded-xl bg-background pl-9 shadow-none"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="auth-password">Password</Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="auth-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={mode === "register" ? "At least 6 characters" : "••••••••"}
                      autoComplete={mode === "login" ? "current-password" : "new-password"}
                      required
                      minLength={6}
                      className="h-11 rounded-xl bg-background pl-9 shadow-none"
                    />
                  </div>
                </div>
              </motion.div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-rose-500/25 bg-rose-500/10 px-3 py-2.5 text-[13px] font-medium text-rose-600 dark:text-rose-400"
                >
                  {error}
                </motion.p>
              )}

              <Button
                type="submit"
                className="h-11 gap-2 rounded-xl text-sm"
                disabled={submitting}
              >
                {submitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <GraduationCap className="size-4" />
                )}
                {mode === "login" ? "Sign in to dashboard" : "Create account"}
              </Button>
            </form>
          </Tabs>
        </Card>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Default admin —{" "}
          <code dir="ltr" className={cn("rounded-md border border-border/60 bg-muted/50 px-1.5 py-0.5 font-mono text-[11px]")}>
            admin@campus.edu
          </code>{" "}
          /{" "}
          <code dir="ltr" className={cn("rounded-md border border-border/60 bg-muted/50 px-1.5 py-0.5 font-mono text-[11px]")}>
            admin123
          </code>
        </p>
      </motion.div>
    </div>
  );
}