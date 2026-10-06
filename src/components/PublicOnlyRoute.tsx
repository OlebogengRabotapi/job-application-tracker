import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader } from "./Loader";

/** Login / Register make no sense once signed in, so send those users to their jobs. */
export function PublicOnlyRoute() {
  const { user, loading } = useAuth();

  if (loading) return <Loader label="Checking your session…" />;
  if (user) return <Navigate to="/jobs" replace />;
  return <Outlet />;
}
