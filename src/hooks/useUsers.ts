import { useEffect, useState } from "react";

import { doc } from "firebase/firestore";
import { db } from "../Assets/backend/firebase/client/firebaseClient";
import { deleteUserDoc, getAllUsers, updateUserRole } from "../Assets/backend/servers/UserService";

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
        await deleteUserDoc(uid);
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
