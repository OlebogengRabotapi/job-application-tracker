import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FormField } from "../components/FormField";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { validateRegister, type Errors, type RegisterField } from "../utils/validation";

export function Register() {
  const { register } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();

  const [values, setValues] = useState({ username: "", password: "", confirm: "" });
  const [errors, setErrors] = useState<Errors<RegisterField>>({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);

  const bind = (field: RegisterField) => ({
    name: field,
    value: values[field],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      setValues((v) => ({ ...v, [field]: e.target.value }));
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    },
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError("");
    const found = validateRegister(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setBusy(true);
    try {
      await register(values.username, values.password);
      notify("success", "Account created. Welcome to JobTrack!");
      navigate("/jobs", { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not create your account.";
      if (message.toLowerCase().includes("username")) setErrors({ username: message });
      else setFormError(message);
      setBusy(false);
    }
  };

  return (
    <section className="container auth">
      <div className="card auth__card">
        <h1>Create your account</h1>
        <p className="muted">Start tracking your job applications in minutes.</p>

        <form onSubmit={handleSubmit} noValidate className="form">
          <FormField label="Username" required error={errors.username} hint="3–20 characters: letters, numbers, _ or .">
            {(a) => <input {...a} {...bind("username")} type="text" autoComplete="username" />}
          </FormField>

          <FormField label="Password" required error={errors.password} hint="At least 8 characters, with a letter and a number.">
            {(a) => <input {...a} {...bind("password")} type="password" autoComplete="new-password" />}
          </FormField>

          <FormField label="Confirm password" required error={errors.confirm}>
            {(a) => <input {...a} {...bind("confirm")} type="password" autoComplete="new-password" />}
          </FormField>

          {formError ? (
            <p className="form__error" role="alert">
              {formError}
            </p>
          ) : null}

          <button type="submit" className="btn btn--primary btn--block" disabled={busy}>
            {busy ? (
              <>
                <span className="spinner spinner--small" aria-hidden="true" /> Creating account…
              </>
            ) : (
              "Create account"
            )}
          </button>
        </form>

        <p className="auth__switch">
          Already registered? <Link to="/login">Log in</Link>
        </p>
      </div>
    </section>
  );
}
