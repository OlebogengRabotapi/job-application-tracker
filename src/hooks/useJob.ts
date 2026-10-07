import { useEffect, useState } from "react";
import { ApiError } from "../api/http";
import { getJob } from "../api/jobs";
import { useAuth } from "../context/AuthContext";
import type { Job } from "../types";

type State =
  | { status: "loading" }
  | { status: "ready"; job: Job }
  | { status: "not-found" }
  | { status: "error"; message: string };

/**
 * Load one job from the :id URL parameter.
 * A job that doesn't exist OR belongs to someone else both resolve to "not-found",
 * so the app never reveals that another user's job exists.
 */
export function useJob(idParam: string | undefined): State {
  const { user } = useAuth();
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    const id = Number(idParam);

    if (!idParam || !Number.isInteger(id) || id <= 0) {
      setState({ status: "not-found" });
      return;
    }

    setState({ status: "loading" });
    getJob(id)
      .then((job) => {
        if (cancelled) return;
        setState(job.userId === user?.id ? { status: "ready", job } : { status: "not-found" });
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        if (e instanceof ApiError && e.status === 404) setState({ status: "not-found" });
        else setState({ status: "error", message: e instanceof Error ? e.message : "Something went wrong." });
      });

    return () => {
      cancelled = true;
    };
  }, [idParam, user?.id]);

  return state;
}
