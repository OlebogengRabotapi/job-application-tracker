import type { JobStatus } from "../types";
import { STATUS_LABELS } from "../utils/format";

export function StatusBadge({ status }: { status: JobStatus }) {
  return (
    <span className={`badge badge--${status}`}>
      <span className="badge__dot" aria-hidden="true" />
      {STATUS_LABELS[status]}
    </span>
  );
}
