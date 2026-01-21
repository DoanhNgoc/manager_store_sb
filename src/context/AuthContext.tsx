import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { auth } from "../Assets/backend/firebase/client/firebaseClient";
import { getUserProfile } from "../Assets/backend/servers/UserService";

type AuthContextType = {
    user: User | null;
    roleKey: string | null;
    loading: boolean;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [roleKey, setRoleKey] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
            try {
                if (firebaseUser) {
                    setUser(firebaseUser);

                    const profile = await getUserProfile(firebaseUser.uid);
                    setRoleKey(profile?.roleKey ?? null);
                } else {
                    setUser(null);
                    setRoleKey(null);
                }
            } catch (err) {
                console.error("Auth load profile error:", err);
                setUser(null);
                setRoleKey(null);
            } finally {
                setLoading(false);
            }
        });

        return () => unsub();
    }, []);

    const logout = async () => {
        await signOut(auth);
    };

    return (
        <AuthContext.Provider value={{ user, roleKey, loading, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
    return ctx;
};
