import { useState, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { Loader } from "../components/Loader";
import { StatusBadge } from "../components/StatusBadge";
import { useJob } from "../hooks/useJob";
import { useJobs } from "../hooks/useJobs";
import { formatDate } from "../utils/format";
import { NotFound } from "./NotFound";

function Detail({ label, children }: { label: string; children?: ReactNode }) {
  if (children === undefined || children === null || children === "") return null;
  return (
    <div className="detail">
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

export function JobDetails() {
  const { id } = useParams(); // URL parameter: /jobs/:id
  const state = useJob(id);
  const { remove } = useJobs(false);
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (state.status === "loading") return <Loader label="Loading application…" />;
  if (state.status === "not-found")
    return <NotFound title="Job not found" message="That application doesn't exist or isn't yours." />;
  if (state.status === "error")
    return (
      <section className="container page">
        <div className="card empty" role="alert">
          <h2>Something went wrong</h2>
          <p className="muted">{state.message}</p>
          <Link to="/jobs" className="btn btn--ghost">Back to my jobs</Link>
        </div>
      </section>
    );

  const { job } = state;

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await remove(job.id);
      navigate("/jobs", { replace: true });
    } catch {
      setDeleting(false);
    }
  };

  return (
    <section className="container page">
      <Link to="/jobs" className="back-link">← Back to my jobs</Link>

      <header className="page__header">
        <div>
          <StatusBadge status={job.status} />
          <h1 className="details__title">{job.role}</h1>
          <p className="details__company">{job.company}</p>
        </div>
        <div className="page__actions">
          <Link to={`/jobs/${job.id}/edit`} className="btn btn--primary">Edit</Link>
          <button type="button" className="btn btn--danger-ghost" onClick={() => setConfirming(true)}>
            Delete
          </button>
        </div>
      </header>

      <div className="details">
        <div className="card">
          <h2>Overview</h2>
          <dl className="detail-list">
            <Detail label="Date applied">{formatDate(job.dateApplied)}</Detail>
            <Detail label="Salary / package">{job.salary}</Detail>
            <Detail label="Address">{job.address}</Detail>
            <Detail label="Website">
              {job.website ? (
                <a href={job.website} target="_blank" rel="noopener noreferrer">
                  {job.website}
                </a>
              ) : undefined}
            </Detail>
          </dl>

          <h2>Contact</h2>
          {job.contactName || job.contactEmail || job.contactPhone ? (
            <dl className="detail-list">
              <Detail label="Name">{job.contactName}</Detail>
              <Detail label="Email">
                {job.contactEmail ? <a href={`mailto:${job.contactEmail}`}>{job.contactEmail}</a> : undefined}
              </Detail>
              <Detail label="Phone">
                {job.contactPhone ? <a href={`tel:${job.contactPhone.replace(/\s/g, "")}`}>{job.contactPhone}</a> : undefined}
              </Detail>
            </dl>
          ) : (
            <p className="muted">No contact details saved.</p>
          )}
        </div>

        <div className="card">
          <h2>Duties</h2>
          <p className="prose">{job.duties}</p>

          <h2>Requirements</h2>
          {job.requirements ? <p className="prose">{job.requirements}</p> : <p className="muted">None added.</p>}

          <h2>Interview notes</h2>
          {job.notes ? <p className="prose">{job.notes}</p> : <p className="muted">None added.</p>}
        </div>
      </div>

      <ConfirmDialog
        open={confirming}
        title="Delete this application?"
        message={`${job.role} at ${job.company} will be permanently removed.`}
        confirmLabel="Delete"
        busy={deleting}
        onConfirm={() => void handleDelete()}
        onCancel={() => setConfirming(false)}
      />
    </section>
  );
}
