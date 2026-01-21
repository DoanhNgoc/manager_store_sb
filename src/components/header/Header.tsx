import { Bell, Menu, Search, User, X } from "lucide-react";

interface HeaderProps {
    isSidebarOpen: boolean;
    toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ isSidebarOpen, toggleSidebar }) => {
    return (
        <header className="fixed top-0 right-0 left-0 h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 z-50 flex items-center justify-between px-4 lg:px-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={toggleSidebar}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                </button>

                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#009099] rounded-lg flex items-center justify-center text-white font-bold">
                        MS
                    </div>
                    <span className="font-bold text-xl hidden sm:block tracking-tight text-gray-800 font-sans">
                        Manager Store
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
                <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm..."
                        className="pl-10 pr-4 py-2 bg-gray-100 border-none rounded-full text-sm focus:ring-2 focus:ring-[#009099] w-64 transition-all"
                    />
                </div>

                <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full relative">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>

                <div className="flex items-center gap-3 pl-2 border-l border-gray-200">
                    <div className="hidden sm:block text-right">
                        <p className="text-xs font-bold text-slate-800 leading-none">Quản lý Admin</p>
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-1">Manager</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white ring-2 ring-white shadow-md cursor-pointer hover:scale-105 transition-transform">
                        <User size={20} />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header