import { formatDistanceToNow, format } from "date-fns";

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const usdCompact = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

const num = new Intl.NumberFormat("en-US");

const numCompact = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

/** $12,480 */
export function currency(value: number): string {
  return usd.format(value);
}

/** $12.4K */
export function currencyCompact(value: number): string {
  return usdCompact.format(value);
}

/** 12,480 */
export function number(value: number): string {
  return num.format(value);
}

/** 12.4K */
export function compact(value: number): string {
  return numCompact.format(value);
}

/** 3.6% */
export function percent(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`;
}

/** +12.4% / -0.4% */
export function signedPercent(value: number, digits = 1): string {
  return `${value > 0 ? "+" : ""}${value.toFixed(digits)}%`;
}

/** "Aug 2" */
export function shortDate(value: string | number | Date): string {
  return format(new Date(value), "MMM d");
}

/** "Aug 2, 2026" */
export function fullDate(value: string | number | Date): string {
  return format(new Date(value), "MMM d, yyyy");
}

/** "2:14 PM" */
export function time(value: string | number | Date): string {
  return format(new Date(value), "h:mm a");
}

/** "5 minutes ago" */
export function timeAgo(value: string | number | Date): string {
  return formatDistanceToNow(new Date(value), { addSuffix: true });
}
