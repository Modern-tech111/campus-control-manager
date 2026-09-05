/* Glassmorphic tooltip shared by every recharts chart. */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function GlassTooltip(props: any) {
  const { active, payload, label, formatter, labelFormatter } = props;

  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-border/60 bg-popover/95 px-3 py-2.5 shadow-xl shadow-black/5 backdrop-blur-xl">
      {label && (
        <p className="mb-1.5 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
          {labelFormatter ? labelFormatter(label) : label}
        </p>
      )}
      <div className="space-y-1">
        {payload.map((item: { dataKey?: string; name?: string; value?: number; color?: string; payload?: { fill?: string } }, index: number) => (
          <div key={`${item.dataKey ?? item.name ?? index}`} className="flex items-center gap-2 text-xs">
            <span
              className="size-2 shrink-0 rounded-full"
              style={{ background: item.color || item.payload?.fill }}
            />
            <span className="text-muted-foreground">{item.name}</span>
            <span className="ml-auto font-semibold text-foreground tabular-nums">
              {formatter ? formatter(item.value) : item.value?.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
