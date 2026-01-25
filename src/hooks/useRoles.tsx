import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../backend/firebase/client/firebaseClient";

export const useRoles = () => {
    const [roles, setRoles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRoles = async () => {
            const snap = await getDocs(collection(db, "roles"));
            const newRoles = snap.docs.map(d => ({ id: d.id, ...d.data() }))
            setRoles(newRoles.filter(u => u?.id !== "admin"));

            setLoading(false);
        };

        fetchRoles();
    }, []);

    return { roles, loading };
};
