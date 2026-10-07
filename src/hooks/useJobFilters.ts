import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { JOB_STATUSES } from "../types";
import type { Job, JobFilters, StatusFilter } from "../types";

const DEFAULTS: JobFilters = { q: "", status: "all", sort: "date-desc" };

/**
 * Search / filter / sort state lives ONLY in the URL query string:
 *   /jobs?q=google&status=interviewed&sort=date-asc
 * Anything invalid or missing falls back to a default, so hand-edited URLs
 * always give a predictable result.
 */
export function useJobFilters() {
  const [params, setParams] = useSearchParams();

  const rawStatus = params.get("status");
  const filters: JobFilters = useMemo(
    () => ({
      q: (params.get("q") ?? "").trim(),
      status: (JOB_STATUSES as string[]).includes(rawStatus ?? "")
        ? (rawStatus as StatusFilter)
        : DEFAULTS.status,
      sort: params.get("sort") === "date-asc" ? "date-asc" : "date-desc",
    }),
    [params, rawStatus],
  );

  const update = useCallback(
    (changes: Partial<JobFilters>) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          (Object.keys(changes) as (keyof JobFilters)[]).forEach((key) => {
            const value = changes[key] ?? DEFAULTS[key];
            // Don't clutter the URL with default values.
            if (value === DEFAULTS[key] || value === "") next.delete(key);
            else next.set(key, value);
          });
          return next;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  const clear = useCallback(() => setParams({}, { replace: true }), [setParams]);

  const isFiltered = filters.q !== "" || filters.status !== "all";

  return { filters, update, clear, isFiltered };
}

/** Pure function: apply search, status filter and date sort to a list of jobs. */
export function applyView(jobs: Job[], { q, status, sort }: JobFilters): Job[] {
  const needle = q.toLowerCase();
  const direction = sort === "date-asc" ? 1 : -1;

  return jobs
    .filter((job) => status === "all" || job.status === status)
    .filter(
      (job) =>
        needle === "" ||
        job.company.toLowerCase().includes(needle) ||
        job.role.toLowerCase().includes(needle),
    )
    .sort((a, b) => {
      // ISO dates (YYYY-MM-DD) compare correctly as strings; id keeps the order stable.
      if (a.dateApplied !== b.dateApplied)
        return a.dateApplied < b.dateApplied ? -direction : direction;
      return (a.id - b.id) * direction;
    });
}
