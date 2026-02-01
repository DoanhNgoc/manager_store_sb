import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, ArrowLeft, Loader2, CheckCircle2, Sparkles } from "lucide-react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../backend/firebase/client/firebaseClient";

/**
 * Component ForgotPassword đồng bộ với phong cách thiết kế Login.
 * Đã sửa lỗi useNavigate() bằng cách bọc HashRouter và cấu trúc lại Entry Point.
 */


export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const navigate = useNavigate();
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        try {
            await sendPasswordResetEmail(auth, email);
            setSent(true); // 👉 bật UI "Kiểm tra hộp thư"
        } catch (err: any) {
            console.error("❌ Forgot password error:", err);

            switch (err.code) {
                case "auth/user-not-found":
                    alert("❌ Email không tồn tại trong hệ thống");
                    break;
                case "auth/invalid-email":
                    alert("❌ Email không hợp lệ");
                    break;
                default:
                    alert("❌ Gửi email thất bại, thử lại sau");
            }
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-[#009099] text-white shadow-2xl shadow-[#009099]/30 mb-6 transform hover:-rotate-12 transition-all duration-500">
                        <Sparkles size={40} fill="currentColor" />
                    </div>
                    <h1 className="text-4xl font-extrabold text-[#283342] tracking-tight mb-2">Quên mật khẩu</h1>
                    <p className="text-slate-500 font-medium">Nhập email để nhận liên kết khôi phục</p>
                </div>

                {/* Form Container */}
                <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-slate-200/60 p-8 md:p-10 border border-white">
                    {!sent ? (
                        <form className="space-y-6"
                            onSubmit={handleSubmit}
                        >
                            <div className="space-y-2 group">
                                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-[2px] ml-1">
                                    Địa chỉ Email
                                </label>
                                <div className="relative">
                                    <Mail
                                        className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#009099] transition-colors"
                                        size={20}
                                    />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="name@company.com"
                                        className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl text-[15px] focus:bg-white focus:border-[#009099] focus:ring-4 focus:ring-[#009099]/5 outline-none transition-all placeholder:text-slate-300 shadow-sm"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !email}
                                className="w-full bg-[#009099] hover:bg-[#007a82] text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-[#009099]/30 transition-all hover:-translate-y-1 active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-3"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin" size={24} />
                                ) : (
                                    <>
                                        <span>Gửi yêu cầu</span>
                                        <ArrowLeft size={20} className="rotate-180" />
                                    </>
                                )}
                            </button>

                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={() => navigate("/")}
                                    className="text-xs font-bold text-[#009099] hover:text-[#007a82] transition-colors uppercase tracking-wider inline-flex items-center gap-2"
                                >
                                    <ArrowLeft size={14} />
                                    Quay lại đăng nhập
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="text-center py-4 animate-in fade-in zoom-in duration-500">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-50 rounded-full mb-6">
                                <CheckCircle2 className="w-10 h-10 text-green-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800 mb-3">Kiểm tra hộp thư!</h3>
                            <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                                Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến <br />
                                <span className="font-bold text-slate-700">{email}</span>
                            </p>
                            <button
                                onClick={() => navigate("/")}
                                className="w-full bg-slate-800 hover:bg-slate-900 text-white py-4 rounded-2xl font-bold transition-all hover:-translate-y-1"
                            >
                                Quay về trang chủ
                            </button>
                            <p className="text-xs text-slate-400 mt-6">
                                Không nhận được email?{" "}
                                <button
                                    className="text-[#009099] font-bold hover:underline"
                                    onClick={() => setSent(false)}
                                >
                                    Thử lại
                                </button>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
        // <div className="bg-light roude rounded shadow shadow-lg">
        //     <div className="text-center ">
        //         <p className="fs-1 fw-bold m-1 text-info">Forgot Password</p>
        //     </div>
        //     <div>
        //         <Form>
        //             {/* text email */}
        //             <FloatingLabel
        //                 controlId="floatingInput"
        //                 label="Email"
        //                 style={{ minWidth: 500 }}
        //                 className="m-3 mb-1"

        //             >
        //                 <Form.Control type="email" placeholder="abc123@gmail.com" value={email}
        //                     onChange={(e) => setEmail(e.target.value)} />
        //             </FloatingLabel>
        //             {sent && (
        //                 <p className="text-success m-3 mb-1">
        //                     Vui lòng kiểm tra email để đặt lại mật khẩu
        //                 </p>
        //             )}
        //             <div className="d-flex justify-content-end m-3">
        //                 <Button onClick={() => navigate("/")} variant="info" className="me-1 text-light">Login</Button>
        //                 <Button >
        //                     Send reset email
        //                 </Button>

        //             </div>
        //         </Form>

        //     </div>
        // </div>
    );
}