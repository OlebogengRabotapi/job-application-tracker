import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const FEATURES = [
  {
    title: "Everything in one place",
    text: "Keep every application in a single list.",
  },
  {
    title: "See your progress",
    text: "Colour-coded statuses show at a glance how many applications are pending, successful or rejected.",
  },
  {
    title: "Find things fast",
    text: "Search by company or role, filter by status and sort by date. Every view has its own shareable link.",
  },
  {
    title: "Interview ready",
    text: "Store the company address, contacts, requirements and your own notes so you walk into every interview prepared.",
  },
];

const STEPS = [
  { n: "1", title: "Create an account", text: "Sign up with a username and password. It takes less than a minute." },
  { n: "2", title: "Add your applications", text: "Record each job as you apply and update the status as you hear back." },
  { n: "3", title: "Track the outcome", text: "Use the summary and filters to see where you stand and what needs follow-up." },
];

export function Landing() {
  const { user } = useAuth();

  return (
    <>
      <section className="hero">
        <div className="container hero__inner">
          <p className="eyebrow">Job Application Tracker</p>
          <h1>Know exactly where every job application stands.</h1>
          <p className="hero__lead">
            JobTrack helps job seekers keep track of the roles they've applied for, so you can see
            how many are pending, how many led to interviews, and how many were turned down.
          </p>
          <div className="hero__actions">
            {user ? (
              <Link to="/jobs" className="btn btn--primary btn--lg">
                Go to my jobs
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn--primary btn--lg">
                  Get started
                </Link>
                <Link to="/login" className="btn btn--ghost btn--lg">
                  I already have an account
                </Link>
              </>
            )}
          </div>
          <ul className="legend" aria-label="Status colours">
            <li><span className="badge badge--applied"><span className="badge__dot" aria-hidden="true" />Applied</span></li>
            <li><span className="badge badge--interviewed"><span className="badge__dot" aria-hidden="true" />Interviewed</span></li>
            <li><span className="badge badge--rejected"><span className="badge__dot" aria-hidden="true" />Rejected</span></li>
          </ul>
        </div>
      </section>

      <section className="container section" aria-labelledby="features-title">
        <h2 id="features-title">Why use JobTrack?</h2>
        <div className="grid grid--features">
          {FEATURES.map((f) => (
            <article key={f.title} className="card">
              <h3>{f.title}</h3>
              <p className="muted">{f.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="container section" aria-labelledby="how-title">
        <h2 id="how-title">How it works</h2>
        <ol className="steps">
          {STEPS.map((s) => (
            <li key={s.n} className="card step">
              <span className="step__num" aria-hidden="true">{s.n}</span>
              <div>
                <h3>{s.title}</h3>
                <p className="muted">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
