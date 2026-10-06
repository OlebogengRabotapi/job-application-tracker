import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { JobCard } from "../components/JobCard";
import { Loader } from "../components/Loader";
import { StatsBar } from "../components/StatsBar";
import { Toolbar } from "../components/Toolbar";
import { useAuth } from "../context/AuthContext";
import { applyView, useJobFilters } from "../hooks/useJobFilters";
import { useJobs } from "../hooks/useJobs";
import type { Job } from "../types";

/** Container component: owns data + URL state, hands plain props to presentational children. */
export function Home() {
  const { user } = useAuth();
  const { jobs, loading, error, reload, remove } = useJobs();
  const { filters, update, clear, isFiltered } = useJobFilters();

  const [pendingDelete, setPendingDelete] = useState<Job | null>(null);
  const [deleting, setDeleting] = useState(false);

  const visible = useMemo(() => applyView(jobs, filters), [jobs, filters]);

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await remove(pendingDelete.id);
      setPendingDelete(null);
    } catch {
      /* toast already shown; keep the dialog open so the user can retry or cancel */
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section className="container page">
      <header className="page__header">
        <div>
          <h1>My applications</h1>
          <p className="muted">Signed in as {user?.username}</p>
        </div>
        <Link to="/jobs/new" className="btn btn--primary">
          + Add job
        </Link>
      </header>

      {loading ? (
        <Loader label="Loading your applications…" />
      ) : error ? (
        <div className="card empty" role="alert">
          <h2>We couldn't load your applications</h2>
          <p className="muted">{error}</p>
          <button type="button" className="btn btn--primary" onClick={() => void reload()}>
            Try again
          </button>
        </div>
      ) : (
        <>
          <StatsBar jobs={jobs} />

          {jobs.length === 0 ? (
            <div className="card empty">
              <h2>No applications yet</h2>
              <p className="muted">Add the first job you've applied for and it will show up here.</p>
              <Link to="/jobs/new" className="btn btn--primary">
                Add your first job
              </Link>
            </div>
          ) : (
            <>
              <Toolbar
                filters={filters}
                resultCount={visible.length}
                isFiltered={isFiltered}
                onChange={update}
                onClear={clear}
              />

              {visible.length === 0 ? (
                <div className="card empty">
                  <h2>Nothing matches your search</h2>
                  <p className="muted">Try a different search or status filter.</p>
                  <button type="button" className="btn btn--ghost" onClick={clear}>
                    Clear filters
                  </button>
                </div>
              ) : (
                <div className="grid grid--jobs">
                  {visible.map((job) => (
                    <JobCard key={job.id} job={job} onDelete={setPendingDelete} />
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete this application?"
        message={
          pendingDelete
            ? `${pendingDelete.role} at ${pendingDelete.company} will be permanently removed.`
            : ""
        }
        confirmLabel="Delete"
        busy={deleting}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setPendingDelete(null)}
      />
    </section>
  );
}
