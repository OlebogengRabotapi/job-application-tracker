import { useCallback, useEffect, useState } from "react";
import { createJob, deleteJob, listJobs, updateJob, type JobInput } from "../api/jobs";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import type { Job } from "../types";

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong.";
}

/** Container hook: loads the signed-in user's jobs and exposes CRUD actions. */
export function useJobs(autoLoad = true) {
  const { user } = useAuth();
  const { notify } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(autoLoad);
  const [error, setError] = useState<string | null>(null);

  const userId = user?.id;

  const load = useCallback(async () => {
    if (userId === undefined) return;
    setLoading(true);
    setError(null);
    try {
      setJobs(await listJobs(userId));
    } catch (e) {
      const message = messageOf(e);
      setError(message);
      notify("error", message);
    } finally {
      setLoading(false);
    }
  }, [userId, notify]);

  useEffect(() => {
    if (autoLoad) void load();
  }, [autoLoad, load]);

  const add = useCallback(
    async (values: JobInput) => {
      if (userId === undefined) throw new Error("You must be signed in.");
      try {
        const created = await createJob(userId, values);
        setJobs((current) => [...current, created]);
        notify("success", `Added ${created.role} at ${created.company}.`);
        return created;
      } catch (e) {
        notify("error", messageOf(e));
        throw e;
      }
    },
    [userId, notify],
  );

  const update = useCallback(
    async (id: number, values: JobInput) => {
      if (userId === undefined) throw new Error("You must be signed in.");
      try {
        const saved = await updateJob(userId, id, values);
        setJobs((current) => current.map((j) => (j.id === id ? saved : j)));
        notify("success", "Changes saved.");
        return saved;
      } catch (e) {
        notify("error", messageOf(e));
        throw e;
      }
    },
    [userId, notify],
  );

  const remove = useCallback(
    async (id: number) => {
      if (userId === undefined) throw new Error("You must be signed in.");
      try {
        await deleteJob(userId, id);
        setJobs((current) => current.filter((j) => j.id !== id));
        notify("success", "Application deleted.");
      } catch (e) {
        notify("error", messageOf(e));
        throw e;
      }
    },
    [userId, notify],
  );

  return { jobs, loading, error, reload: load, add, update, remove };
}
