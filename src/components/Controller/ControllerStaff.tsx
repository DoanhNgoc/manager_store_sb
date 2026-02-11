import { useState, useEffect } from "react";
import {
    Box,
    Calendar,
    Clock,
    LogOut,
    Settings,
    UserCircle,
    Wallet,
    ArrowDownToLine,
    ArrowUpFromLine,
    History,
    ClipboardList,
    Star,
    ChevronDown,
    ChevronRight,
    Warehouse,
} from "lucide-react";

interface SidebarProps {
    isOpen: boolean;
    isMobile: boolean;
    onLogoutClick: () => void;
    setActivePage: (page: string) => void;
    activePage: string;
}

interface MenuItem {
    icon: React.ReactNode;
    pages: string;
    textHtml: string;
}

const staffController: MenuItem[] = [
    { icon: <Box size={20} />, pages: "products", textHtml: "Sản phẩm" },
    { icon: <ClipboardList size={20} />, pages: "inventory", textHtml: "Kiểm kê tồn kho" },
    { icon: <Calendar size={20} />, pages: "schedule", textHtml: "Lịch làm việc" },
    { icon: <Clock size={20} />, pages: "attendance", textHtml: "Chấm công" },
    { icon: <Wallet size={20} />, pages: "salary", textHtml: "Bảng lương" },
    { icon: <Star size={20} />, pages: "review", textHtml: "Đánh giá tuần" },
];

const warehouseSubItems: MenuItem[] = [
    { icon: <ArrowDownToLine size={18} />, pages: "import", textHtml: "Nhập kho" },
    { icon: <ArrowUpFromLine size={18} />, pages: "export", textHtml: "Xuất kho" },
    { icon: <History size={18} />, pages: "history", textHtml: "Lịch sử" },
];

const ControllerStaff: React.FC<SidebarProps> = ({
    isOpen,
    isMobile,
    onLogoutClick,
    setActivePage,
    activePage,
}) => {
    const [warehouseOpen, setWarehouseOpen] = useState(false);

    // Auto open warehouse submenu if active page is warehouse related
    useEffect(() => {
        if (["import", "export", "history"].includes(activePage)) {
            setWarehouseOpen(true);
        }
    }, [activePage]);

    const sidebarClasses = `
        fixed left-0 top-16 bottom-0 bg-[#1e293b] transition-all duration-300 z-40
        ${isOpen ? "w-64 translate-x-0" : isMobile ? "-translate-x-full w-64" : "w-20 translate-x-0"}
    `;

    const isWarehousePage = ["import", "export", "history"].includes(activePage);

    const renderMenuItem = (item: MenuItem) => {
        const isActive = activePage === item.pages;
        return (
            <button
                key={item.pages}
                onClick={() => setActivePage(item.pages)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all group ${
                    isActive
                        ? "bg-[#009099]/20 text-white"
                        : "text-slate-400 hover:bg-slate-700/30 hover:text-white"
                }`}
            >
                <span className={isActive ? "text-[#009099]" : "text-slate-400 group-hover:text-[#009099]"}>
                    {item.icon}
                </span>
                {(isOpen || isMobile) && (
                    <span className="text-sm font-semibold">{item.textHtml}</span>
                )}
            </button>
        );
    };

    return (
        <aside className={sidebarClasses}>
            <div className="flex flex-col h-full p-3 overflow-y-auto custom-scrollbar">
                {/* Navigation Section */}
                <div className="space-y-1 flex-1">
                    <p
                        className={`text-[10px] font-bold text-slate-500 uppercase tracking-[2px] mb-4 px-3 ${
                            !isOpen && !isMobile ? "opacity-0" : "opacity-100"
                        }`}
                    >
                        Danh mục
                    </p>

                    {/* Products */}
                    {renderMenuItem(staffController[0])}

                    {/* Warehouse Submenu */}
                    <div>
                        <button
                            onClick={() => setWarehouseOpen(!warehouseOpen)}
                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-slate-400 hover:bg-slate-700/30 hover:text-white transition-all group ${
                                isWarehousePage ? "bg-slate-700/50 text-white" : ""
                            }`}
                        >
                            <Warehouse
                                size={20}
                                className={`text-slate-400 group-hover:text-[#009099] ${
                                    isWarehousePage ? "text-[#009099]" : ""
                                }`}
                            />
                            {(isOpen || isMobile) && (
                                <>
                                    <span className="text-sm font-semibold flex-1 text-left">Kho hàng</span>
                                    {warehouseOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                </>
                            )}
                        </button>

                        {/* Submenu Items */}
                        {warehouseOpen && (isOpen || isMobile) && (
                            <div className="ml-4 mt-1 space-y-1">
                                {warehouseSubItems.map((subItem) => {
                                    const isActive = activePage === subItem.pages;
                                    return (
                                        <button
                                            key={subItem.pages}
                                            onClick={() => setActivePage(subItem.pages)}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                                                isActive
                                                    ? "bg-[#009099]/20 text-[#009099]"
                                                    : "text-slate-400 hover:bg-slate-700/30 hover:text-white"
                                            }`}
                                        >
                                            <span className={isActive ? "text-[#009099]" : "text-slate-400"}>
                                                {subItem.icon}
                                            </span>
                                            <span className="text-sm font-medium">{subItem.textHtml}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Other menu items */}
                    {staffController.slice(1).map((item) => renderMenuItem(item))}
                </div>

                {/* Bottom Section */}
                <div className="pt-4 border-t border-slate-700 space-y-1">
                    <button className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-slate-400 hover:bg-slate-700/30 hover:text-white transition-all group">
                        <UserCircle size={20} className="text-slate-400 group-hover:text-[#009099]" />
                        {(isOpen || isMobile) && <span className="text-sm font-semibold">Cá nhân</span>}
                    </button>

                    <button className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-slate-400 hover:bg-slate-700/30 hover:text-white transition-all group">
                        <Settings size={20} className="text-slate-400 group-hover:text-[#009099]" />
                        {(isOpen || isMobile) && <span className="text-sm font-semibold">Cài đặt</span>}
                    </button>

                    <button
                        onClick={onLogoutClick}
                        className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all mt-2 group"
                    >
                        <LogOut size={20} className="text-slate-400 group-hover:text-red-400" />
                        {(isOpen || isMobile) && <span className="text-sm font-semibold">Đăng xuất</span>}
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default ControllerStaff;
