import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../backend/firebase/client/firebaseClient";

export function useUsersMap() {
    const [userMap, setUserMap] = useState<Record<string, any>>({});

    useEffect(() => {
        const fetchUsers = async () => {
            const snap = await getDocs(collection(db, "users"));
            const map: Record<string, any> = {};

            snap.forEach(doc => {
                map[doc.id] = doc.data();
            });

            setUserMap(map);
        };

        fetchUsers();
    }, []);

    return userMap;
}
