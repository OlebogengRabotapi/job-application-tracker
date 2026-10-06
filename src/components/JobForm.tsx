import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { JOB_STATUSES } from "../types";
import type { JobFormValues } from "../types";
import { STATUS_LABELS, todayISO } from "../utils/format";
import { validateJob, type Errors, type JobField } from "../utils/validation";
import { FormField } from "./FormField";

export function emptyJob(): JobFormValues {
  return {
    company: "",
    role: "",
    status: "applied",
    dateApplied: todayISO(),
    duties: "",
    address: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    website: "",
    requirements: "",
    salary: "",
    notes: "",
  };
}

interface JobFormProps {
  initialValues: JobFormValues;
  submitLabel: string;
  cancelTo: string;
  onSubmit: (values: JobFormValues) => Promise<void>;
}

export function JobForm({ initialValues, submitLabel, cancelTo, onSubmit }: JobFormProps) {
  const [values, setValues] = useState<JobFormValues>(initialValues);
  const [errors, setErrors] = useState<Errors<JobField>>({});
  const [busy, setBusy] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const set =
    (field: JobField) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setValues((v) => ({ ...v, [field]: e.target.value }));
      // Clear the message as soon as the user starts fixing the field.
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const found = validateJob(values);
    setErrors(found);
    const firstInvalid = (Object.keys(found) as JobField[]).find((k) => found[k]);
    if (firstInvalid) {
      formRef.current
        ?.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)
        ?.focus();
      return;
    }
    setBusy(true);
    try {
      await onSubmit(values);
    } catch {
      // The caller already showed an error toast; keep the form open so nothing is lost.
      setBusy(false);
    }
  };

  return (
    <form ref={formRef} className="form card" onSubmit={handleSubmit} noValidate>
      <fieldset className="form__section" disabled={busy}>
        <legend>Application details</legend>

        <div className="form__grid">
          <FormField label="Company name" required error={errors.company}>
            {(a) => (
              <input {...a} name="company" type="text" value={values.company} onChange={set("company")} maxLength={80} autoComplete="organization" />
            )}
          </FormField>

          <FormField label="Role" required error={errors.role}>
            {(a) => (
              <input {...a} name="role" type="text" value={values.role} onChange={set("role")} maxLength={80} autoComplete="organization-title" />
            )}
          </FormField>

          <FormField label="Status" required error={errors.status}>
            {(a) => (
              <select {...a} name="status" value={values.status} onChange={set("status")}>
                {JOB_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            )}
          </FormField>

          <FormField label="Date applied" required error={errors.dateApplied}>
            {(a) => (
              <input {...a} name="dateApplied" type="date" value={values.dateApplied} onChange={set("dateApplied")} max={todayISO()} />
            )}
          </FormField>
        </div>

        <FormField label="Job duties" required error={errors.duties} hint="What will you be doing day to day?">
          {(a) => <textarea {...a} name="duties" rows={4} value={values.duties} onChange={set("duties")} />}
        </FormField>
      </fieldset>

      <fieldset className="form__section" disabled={busy}>
        <legend>More details (optional)</legend>
        <p className="form__note">Useful to have on hand for interview preparation.</p>

        <div className="form__grid">
          <FormField label="Company address" error={errors.address}>
            {(a) => <input {...a} name="address" type="text" value={values.address} onChange={set("address")} autoComplete="street-address" />}
          </FormField>

          <FormField label="Company website" error={errors.website} hint="Include https://">
            {(a) => <input {...a} name="website" type="url" value={values.website} onChange={set("website")} placeholder="https://example.com" />}
          </FormField>

          <FormField label="Contact person" error={errors.contactName}>
            {(a) => <input {...a} name="contactName" type="text" value={values.contactName} onChange={set("contactName")} />}
          </FormField>

          <FormField label="Contact email" error={errors.contactEmail}>
            {(a) => <input {...a} name="contactEmail" type="email" value={values.contactEmail} onChange={set("contactEmail")} />}
          </FormField>

          <FormField label="Contact phone" error={errors.contactPhone}>
            {(a) => <input {...a} name="contactPhone" type="tel" value={values.contactPhone} onChange={set("contactPhone")} />}
          </FormField>

          <FormField label="Salary / package" error={errors.salary}>
            {(a) => <input {...a} name="salary" type="text" value={values.salary} onChange={set("salary")} placeholder="e.g. R25 000 per month" />}
          </FormField>
        </div>

        <FormField label="Requirements" error={errors.requirements}>
          {(a) => <textarea {...a} name="requirements" rows={3} value={values.requirements} onChange={set("requirements")} />}
        </FormField>

        <FormField label="Interview notes" error={errors.notes} hint="Questions to ask, things to research, who you spoke to.">
          {(a) => <textarea {...a} name="notes" rows={3} value={values.notes} onChange={set("notes")} />}
        </FormField>
      </fieldset>

      <div className="form__actions">
        <Link to={cancelTo} className="btn btn--ghost" aria-disabled={busy}>
          Cancel
        </Link>
        <button type="submit" className="btn btn--primary" disabled={busy}>
          {busy ? (
            <>
              <span className="spinner spinner--small" aria-hidden="true" /> Saving…
            </>
          ) : (
            submitLabel
          )}
        </button>
      </div>
    </form>
  );
}
