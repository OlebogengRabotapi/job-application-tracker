import type { JobStatus } from "../types";

export const STATUS_LABELS: Record<JobStatus, string> = {
  applied: "Applied",
  interviewed: "Interviewed",
  rejected: "Rejected",
};

/** Today's date as YYYY-MM-DD in the user's local time zone. */
export function todayISO(): string {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

/** "2026-10-05" -> "5 Oct 2026". Falls back to the raw string if invalid. */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  const date = new Date(y, m - 1, d);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
