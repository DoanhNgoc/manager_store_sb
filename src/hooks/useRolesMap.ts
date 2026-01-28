import { collection, getDocs } from "firebase/firestore"
import { useEffect, useState } from "react"
import { db } from "../backend/firebase/client/firebaseClient"

export function useRolesMap() {
    const [rolesMap, setRolesMap] = useState<Record<string, any>>({})

    useEffect(() => {
        const fetchRoles = async () => {
            const snap = await getDocs(collection(db, "roles"))
            const map: Record<string, any> = {}

            snap.forEach(doc => {
                const data = doc.data()
                if (data.key) {
                    map[data.key] = data
                }
            })

            setRolesMap(map)
        }

        fetchRoles()
    }, [])

    return rolesMap
}
