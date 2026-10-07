import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PublicOnlyRoute } from "./components/PublicOnlyRoute";
import { Home } from "./pages/Home";
import { JobDetails } from "./pages/JobDetails";
import { JobEditor } from "./pages/JobEditor";
import { Landing } from "./pages/Landing";
import { Login } from "./pages/Login";
import { NotFound } from "./pages/NotFound";
import { Register } from "./pages/Register";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Landing />} />

        <Route element={<PublicOnlyRoute />}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="jobs" element={<Home />} />
          <Route path="jobs/new" element={<JobEditor />} />
          <Route path="jobs/:id" element={<JobDetails />} />
          <Route path="jobs/:id/edit" element={<JobEditor />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
