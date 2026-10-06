import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FormField } from "../components/FormField";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { validateLogin, type Errors, type LoginField } from "../utils/validation";

interface LocationState {
  from?: { pathname: string; search?: string };
}

export function Login() {
  const { login } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [values, setValues] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState<Errors<LoginField>>({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);

  const from = (location.state as LocationState | null)?.from;
  const destination = from ? `${from.pathname}${from.search ?? ""}` : "/jobs";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError("");
    const found = validateLogin(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setBusy(true);
    try {
      await login(values.username, values.password);
      notify("success", "Welcome back!");
      navigate(destination, { replace: true });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not sign you in.");
      setBusy(false);
    }
  };

  return (
    <section className="container auth">
      <div className="card auth__card">
        <h1>Log in</h1>
        <p className="muted">Welcome back. Sign in to see your applications.</p>

        {from ? (
          <p className="notice" role="status">
            Please log in to continue.
          </p>
        ) : null}

        <form onSubmit={handleSubmit} noValidate className="form">
          <FormField label="Username" required error={errors.username}>
            {(a) => (
              <input
                {...a}
                name="username"
                type="text"
                autoComplete="username"
                value={values.username}
                onChange={(e) => setValues((v) => ({ ...v, username: e.target.value }))}
              />
            )}
          </FormField>

          <FormField label="Password" required error={errors.password}>
            {(a) => (
              <input
                {...a}
                name="password"
                type="password"
                autoComplete="current-password"
                value={values.password}
                onChange={(e) => setValues((v) => ({ ...v, password: e.target.value }))}
              />
            )}
          </FormField>

          {formError ? (
            <p className="form__error" role="alert">
              {formError}
            </p>
          ) : null}

          <button type="submit" className="btn btn--primary btn--block" disabled={busy}>
            {busy ? (
              <>
                <span className="spinner spinner--small" aria-hidden="true" /> Signing in…
              </>
            ) : (
              "Log in"
            )}
          </button>
        </form>

        <p className="auth__switch">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </section>
  );
}
