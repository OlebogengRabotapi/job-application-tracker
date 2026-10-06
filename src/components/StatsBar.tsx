import type { Job } from "../types";

export function StatsBar({ jobs }: { jobs: Job[] }) {
  const count = (status: Job["status"]) => jobs.filter((j) => j.status === status).length;

  const items = [
    { label: "Total", value: jobs.length, tone: "total" },
    { label: "Applied (pending)", value: count("applied"), tone: "applied" },
    { label: "Interviewed", value: count("interviewed"), tone: "interviewed" },
    { label: "Rejected", value: count("rejected"), tone: "rejected" },
  ];

  return (
    <dl className="stats" aria-label="Application summary">
      {items.map((item) => (
        <div key={item.label} className={`stat stat--${item.tone}`}>
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
