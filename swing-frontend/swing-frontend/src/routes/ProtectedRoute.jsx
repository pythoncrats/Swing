import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const DASHBOARD_BY_ROLE = {
  trainee: "/trainee",
  trainer: "/trainer",
  admin: "/admin",
};

export default function ProtectedRoute({ allow, children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (allow && !allow.includes(user.role)) {
    // A user should only ever see the dashboard for the role they
    // registered as - redirect them to their own home instead of a
    // generic error, since that's where they actually need to be.
    return <Navigate to={DASHBOARD_BY_ROLE[user.role] || "/"} replace />;
  }

  return children;
}
