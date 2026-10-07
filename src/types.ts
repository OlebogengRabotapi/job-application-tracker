export type JobStatus = "applied" | "interviewed" | "rejected";
export type StatusFilter = JobStatus | "all";
export type SortOrder = "date-desc" | "date-asc";

export const JOB_STATUSES: JobStatus[] = ["applied", "interviewed", "rejected"];

export interface User {
  id: number;
  username: string;
  passwordHash: string;
  createdAt: string;
}

export interface Job {
  id: number;
  userId: number;
  company: string;
  role: string;
  status: JobStatus;
  dateApplied: string; // YYYY-MM-DD
  duties: string;
  address?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  requirements?: string;
  salary?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/** The fields a user fills in on the form (everything stored as strings). */
export interface JobFormValues {
  company: string;
  role: string;
  status: JobStatus;
  dateApplied: string;
  duties: string;
  address: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  website: string;
  requirements: string;
  salary: string;
  notes: string;
}

export interface JobFilters {
  q: string;
  status: StatusFilter;
  sort: SortOrder;
}

export interface PublicUser {
  id: number;
  username: string;
}
