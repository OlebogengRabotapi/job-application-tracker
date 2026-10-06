import { Link } from "react-router-dom";

interface NotFoundProps {
  title?: string;
  message?: string;
}

export function NotFound({
  title = "Page not found",
  message = "The page you're looking for doesn't exist or has been moved.",
}: NotFoundProps) {
  return (
    <section className="container notfound">
      <p className="notfound__code" aria-hidden="true">404</p>
      <h1>{title}</h1>
      <p className="muted">{message}</p>
      <div className="notfound__actions">
        <Link to="/" className="btn btn--primary">
          Back to home
        </Link>
        <Link to="/jobs" className="btn btn--ghost">
          My jobs
        </Link>
      </div>
    </section>
  );
}
