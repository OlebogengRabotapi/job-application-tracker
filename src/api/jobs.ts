import { http } from "./http";
import type { Job, JobFormValues } from "../types";

export type JobInput = JobFormValues;

/** Optional text fields are stored only when the user actually filled them in. */
function clean(values: JobFormValues) {
  const trimmed = Object.fromEntries(
    Object.entries(values).map(([k, v]) => [k, typeof v === "string" ? v.trim() : v]),
  ) as unknown as JobFormValues;
  return trimmed;
}

export function listJobs(userId: number): Promise<Job[]> {
  return http<Job[]>(`/jobs?userId=${userId}`);
}

export function getJob(id: number): Promise<Job> {
  return http<Job>(`/jobs/${id}`);
}

export function createJob(userId: number, values: JobInput): Promise<Job> {
  const now = new Date().toISOString();
  return http<Job>("/jobs", {
    method: "POST",
    body: JSON.stringify({ ...clean(values), userId, createdAt: now, updatedAt: now }),
  });
}

export async function updateJob(
  userId: number,
  id: number,
  values: JobInput,
): Promise<Job> {
  await assertOwner(userId, id);
  return http<Job>(`/jobs/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ ...clean(values), updatedAt: new Date().toISOString() }),
  });
}

export async function deleteJob(userId: number, id: number): Promise<void> {
  await assertOwner(userId, id);
  await http<unknown>(`/jobs/${id}`, { method: "DELETE" });
}

/** Authorization: a user may only change their own jobs. */
async function assertOwner(userId: number, id: number): Promise<void> {
  const job = await getJob(id);
  if (job.userId !== userId) throw new Error("You are not allowed to change this job.");
}
