import { useToast } from "../context/ToastContext";

export function ToastViewport() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="toasts" aria-live="polite" aria-atomic="false">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast--${t.kind}`} role={t.kind === "error" ? "alert" : "status"}>
          <span>{t.message}</span>
          <button
            type="button"
            className="toast__close"
            onClick={() => dismiss(t.id)}
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
