import { motion } from "framer-motion";
import { ArrowLeft, Compass } from "lucide-react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="bg-grid absolute inset-x-0 top-0 h-full opacity-70" />
        <div className="absolute top-1/3 left-1/2 h-80 w-[560px] -translate-x-1/2 rounded-full bg-gradient-to-r from-lime-400/15 via-emerald-300/10 to-transparent blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-md text-center"
      >
        <motion.div
          animate={{ rotate: [0, 8, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-lime-400 to-lime-500 text-primary-foreground shadow-xl shadow-lime-500/30"
        >
          <Compass className="size-8" />
        </motion.div>
        <p className="mt-8 text-sm font-semibold tracking-widest text-primary uppercase">
          Error 404
        </p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight">
          This page drifted off the map
        </h1>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back to familiar ground.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button asChild className="h-11 gap-2 px-6 text-sm shadow-lg shadow-lime-500/25">
            <Link to="/">
              <ArrowLeft className="size-4" /> Back to home
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-11 px-6 text-sm">
            <Link to="/dashboard">Go to dashboard</Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
