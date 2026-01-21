import { Outlet } from "react-router-dom";
import { useRequireAuth } from "../hooks/useRequireAuth";

export default function ProtectedRoute({ role }: { role?: string }) {
    const { allow, element } = useRequireAuth(role);

    if (!allow) return element;

    return <Outlet />;
}