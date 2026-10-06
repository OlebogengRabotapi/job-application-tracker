import { JOB_STATUSES } from "../types";
import type { JobFilters, SortOrder, StatusFilter } from "../types";
import { STATUS_LABELS } from "../utils/format";

interface ToolbarProps {
  filters: JobFilters;
  resultCount: number;
  isFiltered: boolean;
  onChange: (changes: Partial<JobFilters>) => void;
  onClear: () => void;
}

/** Presentational: shows what the URL says and reports changes upward. */
export function Toolbar({ filters, resultCount, isFiltered, onChange, onClear }: ToolbarProps) {
  return (
    <form className="toolbar" role="search" aria-label="Search and filter jobs" onSubmit={(e) => e.preventDefault()}>
      <div className="toolbar__item toolbar__item--grow">
        <label htmlFor="search">Search company or role</label>
        <input
          id="search"
          type="search"
          placeholder="e.g. Google or Developer"
          value={filters.q}
          onChange={(e) => onChange({ q: e.target.value })}
          autoComplete="off"
        />
      </div>

      <div className="toolbar__item">
        <label htmlFor="status">Status</label>
        <select
          id="status"
          value={filters.status}
          onChange={(e) => onChange({ status: e.target.value as StatusFilter })}
        >
          <option value="all">All statuses</option>
          {JOB_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      <div className="toolbar__item">
        <label htmlFor="sort">Sort by date</label>
        <select
          id="sort"
          value={filters.sort}
          onChange={(e) => onChange({ sort: e.target.value as SortOrder })}
        >
          <option value="date-desc">Newest first</option>
          <option value="date-asc">Oldest first</option>
        </select>
      </div>

      <div className="toolbar__meta" aria-live="polite">
        <span>
          {resultCount} {resultCount === 1 ? "result" : "results"}
        </span>
        {isFiltered ? (
          <button type="button" className="link-btn" onClick={onClear}>
            Clear filters
          </button>
        ) : null}
      </div>
    </form>
  );
}
