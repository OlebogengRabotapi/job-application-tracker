interface LoaderProps {
  label?: string;
}

export function Loader({ label = "Loading…" }: LoaderProps) {
  return (
    <div className="loader" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
