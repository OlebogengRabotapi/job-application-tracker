import { Link, useNavigate, useParams } from "react-router-dom";
import { JobForm, emptyJob } from "../components/JobForm";
import { Loader } from "../components/Loader";
import { useJob } from "../hooks/useJob";
import { useJobs } from "../hooks/useJobs";
import type { Job, JobFormValues } from "../types";
import { NotFound } from "./NotFound";

function toFormValues(job: Job): JobFormValues {
  return {
    company: job.company,
    role: job.role,
    status: job.status,
    dateApplied: job.dateApplied,
    duties: job.duties,
    address: job.address ?? "",
    contactName: job.contactName ?? "",
    contactEmail: job.contactEmail ?? "",
    contactPhone: job.contactPhone ?? "",
    website: job.website ?? "",
    requirements: job.requirements ?? "",
    salary: job.salary ?? "",
    notes: job.notes ?? "",
  };
}

/** Routes: /jobs/new (create) and /jobs/:id/edit (update). */
export function JobEditor() {
  const { id } = useParams();
  return id ? <EditJob id={id} /> : <CreateJob />;
}

function CreateJob() {
  const { add } = useJobs(false);
  const navigate = useNavigate();

  return (
    <section className="container page page--narrow">
      <Link to="/jobs" className="back-link">← Back to my jobs</Link>
      <h1>Add a job application</h1>
      <JobForm
        initialValues={emptyJob()}
        submitLabel="Add application"
        cancelTo="/jobs"
        onSubmit={async (values) => {
          await add(values);
          navigate("/jobs");
        }}
      />
    </section>
  );
}

function EditJob({ id }: { id: string }) {
  const state = useJob(id);
  const { update } = useJobs(false);
  const navigate = useNavigate();

  if (state.status === "loading") return <Loader label="Loading application…" />;
  if (state.status === "not-found")
    return <NotFound title="Job not found" message="That application doesn't exist or isn't yours." />;
  if (state.status === "error")
    return (
      <section className="container page">
        <div className="card empty" role="alert">
          <h2>Something went wrong</h2>
          <p className="muted">{state.message}</p>
        </div>
      </section>
    );

  const { job } = state;
  return (
    <section className="container page page--narrow">
      <Link to={`/jobs/${job.id}`} className="back-link">← Back to details</Link>
      <h1>Edit application</h1>
      <JobForm
        initialValues={toFormValues(job)}
        submitLabel="Save changes"
        cancelTo={`/jobs/${job.id}`}
        onSubmit={async (values) => {
          await update(job.id, values);
          navigate(`/jobs/${job.id}`);
        }}
      />
    </section>
  );
}
