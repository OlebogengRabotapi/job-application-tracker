import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `nav__link${isActive ? " nav__link--active" : ""}`;

export function Navbar() {
  const { user, logout } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  // Close the mobile menu whenever the route changes.
  useEffect(() => setOpen(false), [location.pathname]);

  const handleLogout = () => {
    logout();
    notify("info", "You have been signed out.");
    navigate("/", { replace: true });
  };

  return (
    <header className="nav">
      <div className="container nav__inner">
        <Link to="/" className="nav__brand" aria-label="JobTrack home">
          <span className="nav__logo" aria-hidden="true">J</span>
          JobTrack
        </Link>

        <button
          type="button"
          className="nav__toggle"
          aria-expanded={open}
          aria-controls="primary-nav"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          <span aria-hidden="true">{open ? "✕" : "☰"}</span>
        </button>

        <nav id="primary-nav" className={`nav__menu${open ? " nav__menu--open" : ""}`} aria-label="Main">
          <NavLink to="/" end className={linkClass}>
            Home
          </NavLink>
          {user ? (
            <>
              <NavLink to="/jobs" end className={linkClass}>
                My jobs
              </NavLink>
              <NavLink to="/jobs/new" className={linkClass}>
                Add job
              </NavLink>
              <span className="nav__user" title="Signed in as">
                {user.username}
              </span>
              <button type="button" className="btn btn--ghost btn--sm" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={linkClass}>
                Log in
              </NavLink>
              <NavLink to="/register" className="btn btn--primary btn--sm">
                Sign up
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
