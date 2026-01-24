import { signInWithEmailAndPassword } from "firebase/auth";
import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ArrowRight, Loader2, Lock, Mail, Sparkles } from "lucide-react";
import { auth } from "../../backend/firebase/client/firebaseClient";

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const { user, roleKey } = useAuth();
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await signInWithEmailAndPassword(auth, email, password);
            console.log("✅ Firebase login OK:", res.user.uid);
        } catch (err: any) {
            console.error("❌ Login error:", err);

            switch (err.code) {
                case "auth/user-not-found":
                    alert("❌ Email không tồn tại");
                    break;
                case "auth/wrong-password":
                    alert("❌ Sai mật khẩu");
                    break;
                case "auth/invalid-email":
                    alert("❌ Email không hợp lệ");
                    break;
                default:
                    alert("❌ Đăng nhập thất bại");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user || !roleKey) return;

        if (roleKey === "manager") navigate("/dashboard", { replace: true });
        if (roleKey === "staff") navigate("/dashboard/staff", { replace: true });
    }, [user, roleKey, navigate]);
    return (<>

        {/* Header Login */}
        <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-[#009099] text-white shadow-2xl shadow-[#009099]/30 mb-6 transform hover:rotate-12 transition-all duration-500">
                <Sparkles size={40} fill="currentColor" />
            </div>
            <h1 className="text-4xl font-extrabold text-[#283342] tracking-tight mb-2 text-slate-800">Đăng nhập</h1>
            <p className="text-slate-500 font-medium">Truy cập vào hệ thống quản trị của bạn</p>
        </div>

        {/* Form Container */}
        <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-slate-200/60 p-8 md:p-10 border border-white">
            <form onSubmit={handleLogin} className="space-y-6">
                {/* Email Input */}
                <div className="space-y-2 group">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-[2px] ml-1">
                        Địa chỉ Email
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#009099] transition-colors" size={20} />
                        <input
                            type="email"
                            required
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@company.com"
                            className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl text-[15px] focus:bg-white focus:border-[#009099] focus:ring-4 focus:ring-[#009099]/5 outline-none transition-all placeholder:text-slate-300 shadow-sm"
                        />
                    </div>
                </div>

                {/* Password Input */}
                <div className="space-y-2 group">
                    <div className="flex justify-between items-center px-1">
                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-[2px]">
                            Mật khẩu
                        </label>
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#009099] transition-colors" size={20} />
                        <input
                            type="password"
                            required
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl text-[15px] focus:bg-white focus:border-[#009099] focus:ring-4 focus:ring-[#009099]/5 outline-none transition-all placeholder:text-slate-300 shadow-sm"
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between px-1">
                    <button
                        type="button"
                        onClick={() => navigate("/forgot-password")}
                        className="text-xs font-bold text-[#009099] hover:text-[#007a82] transition-colors uppercase tracking-wider"
                    >
                        Quên mật khẩu?
                    </button>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#009099] hover:bg-[#007a82] text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-[#009099]/30 transition-all hover:-translate-y-1 active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-3"
                >
                    {loading ? (
                        <Loader2 className="animate-spin" size={24} />
                    ) : (
                        <>
                            <span>Đăng nhập</span>
                            <ArrowRight size={20} />
                        </>
                    )}
                </button>
            </form>
        </div>
    </>
    );
}   