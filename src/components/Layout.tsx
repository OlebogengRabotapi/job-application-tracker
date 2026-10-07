import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { ToastViewport } from "./ToastViewport";

export function Layout() {
  return (
    <div className="app">
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      <Navbar />
      <main id="main" className="main" tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="footer">
        <div className="container">
          <p>JobTrack · Task 3 · ReactTS Job Application Tracker</p>
        </div>
      </footer>
      <ToastViewport />
    </div>
  );
}
