import { useEffect, useState } from "react";

import { doc } from "firebase/firestore";
import { getAllUsers, updateUserRole } from "../backend/servers/users/UserService";
import { db } from "../backend/firebase/client/firebaseClient";
//delete user
interface DeleteUserResponse {
    success: boolean;
    message?: string;
}
//create user
export type CreateUserPayload = {
    email: string;
    first_name: string;
    last_name: string;
    phone: string;
    dob: string;         // yyyy-mm-dd
    experience: string; // yyyy-mm-dd (ngày bắt đầu làm)
    salary: number;
    role_id: string;    // roles/manager
};
type CreateUserResponse = {
    success: boolean;
    data?: {
        uid: string;
        id_member: string;
    };
    message?: string;
};
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

    //create users
    const createUser = async (payload: CreateUserPayload) => {
        const res = await fetch("http://localhost:3001/api/create-user", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            throw new Error("Tạo nhân sự thất bại");
        }

        const data: CreateUserResponse = await res.json();

        if (!data.success) {
            throw new Error(data.message ?? "Unknown error");
        }

        fetchUsers();
        return data.data; // { uid, id_member }
    };
    return {
        users,
        loading,
        error,
        changeRole,
        deleteUser,
        createUser,
        reload: fetchUsers,
    };
}
