import { Loader2, RotateCw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

/** Centered spinner while the API loads (per project convention: no skeletons). */
export function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Loader2 className="size-7 animate-spin text-muted-foreground" />
    </div>
  );
}

/** Friendly error card with a retry button when the API is unreachable. */
export function PageError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="mx-auto flex w-full max-w-md px-4 py-16">
      <Card className="flex w-full flex-col items-center gap-3 rounded-2xl border-border/60 p-8 text-center">
        <span className="flex size-11 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500">
          <TriangleAlert className="size-5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-foreground">Couldn't load data</p>
          <p className="mt-1 text-xs text-muted-foreground">{message}</p>
        </div>
        {onRetry && (
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={onRetry}>
            <RotateCw className="size-3.5" /> Try again
          </Button>
        )}
      </Card>
    </div>
  );
}