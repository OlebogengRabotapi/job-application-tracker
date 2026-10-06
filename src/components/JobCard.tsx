import { Link } from "react-router-dom";
import type { Job } from "../types";
import { formatDate } from "../utils/format";
import { StatusBadge } from "./StatusBadge";

interface JobCardProps {
  job: Job;
  onDelete: (job: Job) => void;
}

export function JobCard({ job, onDelete }: JobCardProps) {
  return (
    <article className={`card job-card job-card--${job.status}`}>
      <div className="job-card__top">
        <StatusBadge status={job.status} />
        <time className="job-card__date" dateTime={job.dateApplied}>
          {formatDate(job.dateApplied)}
        </time>
      </div>

      <h3 className="job-card__title">
        <Link to={`/jobs/${job.id}`} className="job-card__link">
          {job.role}
        </Link>
      </h3>
      <p className="job-card__company">{job.company}</p>
      <p className="job-card__duties">{job.duties}</p>

      <div className="job-card__actions">
        <Link to={`/jobs/${job.id}`} className="btn btn--ghost btn--sm">
          View<span className="sr-only"> {job.role} at {job.company}</span>
        </Link>
        <Link to={`/jobs/${job.id}/edit`} className="btn btn--ghost btn--sm">
          Edit<span className="sr-only"> {job.role} at {job.company}</span>
        </Link>
        <button type="button" className="btn btn--danger-ghost btn--sm" onClick={() => onDelete(job)}>
          Delete<span className="sr-only"> {job.role} at {job.company}</span>
        </button>
      </div>
    </article>
  );
}
