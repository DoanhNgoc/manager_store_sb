import type { RouteObject } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import Login from "../pages/authentication/Login";
import ForgotPassword from "../pages/authentication/ForgotPassword";
import MainLayout from "../layouts/MainLayout";
import ResetPassword from "../pages/authentication/ResetPassword";
import LayoutStaff from "../layouts/Main/LayoutStaff";
import LayoutManager from "../layouts/Main/LayoutManager";
import ProtectedRoute from "./ProtectedRoute";

const routes: RouteObject[] = [
    {
        path: "/",
        element: <AuthLayout />,
        children: [
            { index: true, element: <Login /> },
            { path: "forgot-password", element: <ForgotPassword /> },
            { path: "reset-password", element: <ResetPassword /> },
        ],
    },

    // ✅ CHỈ KIỂM TRA LOGIN
    {
        element: <ProtectedRoute />,
        children: [
            {
                path: "dashboard",
                element: <MainLayout />,
                children: [
                    // ✅ MANAGER
                    {
                        element: <ProtectedRoute role="manager" />,
                        children: [
                            { index: true, element: <LayoutManager /> },
                        ],
                    },

                    // ✅ STAFF - với các route con
                    {
                        path: "staff",
                        element: <ProtectedRoute role="staff" />,
                        children: [
                            { index: true, element: <LayoutStaff /> },
                            { path: "products", element: <LayoutStaff /> },
                            { path: "import", element: <LayoutStaff /> },
                            { path: "export", element: <LayoutStaff /> },
                            { path: "history", element: <LayoutStaff /> },
                            { path: "inventory", element: <LayoutStaff /> },
                            { path: "schedule", element: <LayoutStaff /> },
                            { path: "attendance", element: <LayoutStaff /> },
                            { path: "salary", element: <LayoutStaff /> },
                            { path: "review", element: <LayoutStaff /> },
                        ],
                    },
                ],
            },
        ],
    },
];

export default routes;
