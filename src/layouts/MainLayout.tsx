import { Outlet } from "react-router-dom";

export default function MainLayout() {
    return (<div className="min-h-screen w-full bg-[#f8fafc] flex items-center justify-center p-6 relative overflow-hidden font-sans">
        {/* Các thành phần trang trí nền (Blur Decor) để đẹp trên Laptop/TV */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-dark/5 blur-[120px] pointer-events-none"></div>

        {/* Nội dung chính */}
        <div className="relative z-10 w-full flex justify-center">
            <Outlet />
        </div>
    </div>)
}