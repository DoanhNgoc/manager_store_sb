import { useEffect, useState } from "react";

import { doc } from "firebase/firestore";
import { getAllUsers, updateUserRole } from "../backend/servers/UserService";
import { db } from "../backend/firebase/client/firebaseClient";
interface DeleteUserResponse {
    success: boolean;
    message?: string;
}

export function useUsers() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await getAllUsers();
            setUsers(data);
        } catch (err) {
            console.error(err);
            setError("Không tải được danh sách users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const changeRole = async (uid: string, roleKey: string) => {
        const roleRef = doc(db, "roles", roleKey);
        await updateUserRole(uid, roleRef);
        fetchUsers();
    };

    const deleteUser = async (uid: string) => {
        if (!confirm("Xoá user này?")) return;
        const res = await fetch("http://localhost:3001/api/delete-user", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ uid }),
        });
        if (!res.ok) {
            throw new Error("Xoá user thất bại");
        }

        const data: DeleteUserResponse = await res.json();

        if (!data.success) {
            throw new Error(data.message ?? "Unknown error");
        }

        fetchUsers();
    };

    return {
        users,
        loading,
        error,
        changeRole,
        deleteUser,
        reload: fetchUsers,
    };
}
