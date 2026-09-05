import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-lime-400 to-lime-500 text-primary-foreground shadow-lg shadow-lime-500/25",
        className,
      )}
    >
      <GraduationCap className="size-5" strokeWidth={2.2} />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.5),transparent_55%)]" />
    </div>
  );
}

export function Brand({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <BrandMark />
      {!compact && (
        <span dir="ltr" className="font-[family-name:var(--font-display)] text-lg font-bold tracking-tight text-foreground">
          Campus Control
        </span>
      )}
    </div>
  );
}
