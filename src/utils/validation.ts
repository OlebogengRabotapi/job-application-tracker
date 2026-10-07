import { JOB_STATUSES } from "../types";
import type { JobFormValues } from "../types";
import { todayISO } from "./format";

export type Errors<T extends string = string> = Partial<Record<T, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[0-9+\-()\s]{7,20}$/;
const USERNAME_RE = /^[A-Za-z0-9_.]+$/;

export function validateUsername(username: string): string | undefined {
  const value = username.trim();
  if (!value) return "Username is required.";
  if (value.length < 3) return "Username must be at least 3 characters.";
  if (value.length > 20) return "Username must be 20 characters or fewer.";
  if (!USERNAME_RE.test(value))
    return "Use only letters, numbers, underscores and dots.";
  return undefined;
}

export function validatePassword(password: string): string | undefined {
  if (!password) return "Password is required.";
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password))
    return "Password must contain at least one letter and one number.";
  return undefined;
}

export type RegisterField = "username" | "password" | "confirm";

export function validateRegister(values: {
  username: string;
  password: string;
  confirm: string;
}): Errors<RegisterField> {
  const errors: Errors<RegisterField> = {};
  const u = validateUsername(values.username);
  if (u) errors.username = u;
  const p = validatePassword(values.password);
  if (p) errors.password = p;
  if (!values.confirm) errors.confirm = "Please confirm your password.";
  else if (values.confirm !== values.password)
    errors.confirm = "Passwords do not match.";
  return errors;
}

export type LoginField = "username" | "password";

export function validateLogin(values: {
  username: string;
  password: string;
}): Errors<LoginField> {
  const errors: Errors<LoginField> = {};
  if (!values.username.trim()) errors.username = "Username is required.";
  if (!values.password) errors.password = "Password is required.";
  return errors;
}

export type JobField = keyof JobFormValues;

function isValidISODate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return (
    date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d
  );
}

export function validateJob(values: JobFormValues): Errors<JobField> {
  const errors: Errors<JobField> = {};

  const company = values.company.trim();
  if (!company) errors.company = "Company name is required.";
  else if (company.length > 80)
    errors.company = "Company name must be 80 characters or fewer.";

  const role = values.role.trim();
  if (!role) errors.role = "Role is required.";
  else if (role.length > 80) errors.role = "Role must be 80 characters or fewer.";

  if (!JOB_STATUSES.includes(values.status))
    errors.status = "Choose Applied, Interviewed or Rejected.";

  if (!values.dateApplied) errors.dateApplied = "Date applied is required.";
  else if (!isValidISODate(values.dateApplied))
    errors.dateApplied = "Enter a valid date.";
  else if (values.dateApplied > todayISO())
    errors.dateApplied = "Date applied cannot be in the future.";

  const duties = values.duties.trim();
  if (!duties) errors.duties = "Job duties are required.";
  else if (duties.length < 10)
    errors.duties = "Please describe the duties in at least 10 characters.";

  if (values.contactEmail.trim() && !EMAIL_RE.test(values.contactEmail.trim()))
    errors.contactEmail = "Enter a valid email address.";

  if (values.contactPhone.trim() && !PHONE_RE.test(values.contactPhone.trim()))
    errors.contactPhone = "Enter a valid phone number.";

  if (values.website.trim()) {
    try {
      const url = new URL(values.website.trim());
      if (url.protocol !== "http:" && url.protocol !== "https:")
        errors.website = "Website must start with http:// or https://";
    } catch {
      errors.website = "Enter a full website address, e.g. https://example.com";
    }
  }

  return errors;
}
