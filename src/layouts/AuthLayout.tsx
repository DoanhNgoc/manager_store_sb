import { Outlet } from "react-router-dom";

export default function AuthLayout() {

    return <div className="w-full max-w-md mx-auto p-4s">
        <Outlet />
    </div>
}