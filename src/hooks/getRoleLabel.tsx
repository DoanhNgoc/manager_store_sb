import { doc, getDoc } from "firebase/firestore";
import { db } from "../backend/firebase/client/firebaseClient";

export type LangCode = "vn" | "en";

export const getRoleLabel = async (
    role: string,
    lang: LangCode
): Promise<string> => {
    const ref = doc(db, "roles", role);
    const snap = await getDoc(ref);

    if (!snap.exists()) return "";

    const data = snap.data();

    return lang === "vn" ? data.name : data.key;
};
