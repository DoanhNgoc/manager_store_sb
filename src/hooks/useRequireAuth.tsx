import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingState from "../components/ErrorAndLoading/LoadingState";

export function useRequireAuth(requiredRole?: string) {
  const { user, roleKey, loading } = useAuth();

  if (loading) {
    return { allow: false, element: <LoadingState /> };
  }

  if (!user) {
    return { allow: false, element: <Navigate to="/" replace /> };
  }

  if (requiredRole && roleKey !== requiredRole) {
    return { allow: false, element: <Navigate to="/403" replace /> };
  }

  return { allow: true, element: null };
}
