
import { AlertTriangle, Box, ClipboardCheck, History, Layers, LayoutDashboard, LogOut, Settings, UserCircle, Users, Wallet, Warehouse } from "lucide-react";
import SidebarItem from "./SidebarItem";
interface SidebarProps {
    isOpen: boolean;
    isMobile: boolean;
    onLogoutClick: () => void;
    setActivePage: React.Dispatch<React.SetStateAction<string>>
}
const managerController = [
    {
        icon: <LayoutDashboard size={20} />,
        pages: "dashboard",
        textHtml: "Dashboard",
        item: null,
        onclick: true
    },
    {
        icon: <Users size={20} />,
        pages: "HumanResources",
        textHtml: "Nhân sự",
        onclick: false,
        item: [
            {
                icon: <ClipboardCheck size={18} />,
                pages: "PersonnelEvaluation",
                textHtml: "Đánh giá",
                onclick: false
            },
            {
                icon: <Wallet size={18} />,
                pages: "HomeSalary",
                textHtml: "Lương",
                onclick: false
            }
        ]
    },
    {
        icon: <Warehouse size={20} />,
        pages: "HomeWarehouse",
        textHtml: "Kho hàng",
        onclick: false,
        item: [
            {
                icon: <Box size={18} />,
                pages: "IntoWarehouse",
                textHtml: "Nhập kho",
                onclick: false,
            },
            {
                // className="text-yellow-500"
                icon: <Layers size={18} />,
                pages: "StockAlert",
                textHtml: "Cảnh báo tồn kho",
                onclick: false,
            },
            {
                icon: <History size={18} />,
                pages: "HistoryWarehouse",
                textHtml: "Lịch sử kho",
                onclick: false
            }
        ]
    }
];
const ControllerManager: React.FC<SidebarProps> = ({ isOpen, isMobile, onLogoutClick, setActivePage }) => {

    const sidebarClasses = `
    fixed left-0 top-16 bottom-0 bg-[#1e293b] transition-all duration-300 z-40
    ${isOpen ? 'w-64 translate-x-0' : isMobile ? '-translate-x-full w-64' : 'w-20 translate-x-0'}
  `;
    return (
        <aside className={sidebarClasses}>
            <div className="flex flex-col h-full p-3 overflow-y-auto custom-scrollbar">
                {/* Navigation Section */}
                <div className="space-y-1 flex-1">
                    <p className={`text-[10px] font-bold text-slate-500 uppercase tracking-[2px] mb-4 px-3 ${(!isOpen && !isMobile) ? 'opacity-0' : 'opacity-100'}`}>
                        Danh mục
                    </p>
                    {managerController.map((item, idx) => (
                        <SidebarItem
                            key={idx}
                            item={item}
                            collapsed={!isOpen && !isMobile}
                            setActivePage={setActivePage}
                        />
                    ))}
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
        // <div className="min-vh-100 fs-5 pt-5">
        //     <div className="profile mx-3 d-flex align-items-center">
        //         <div className="d-flex align-items-center">
        //             <Image src="src/Assets/default_user_avatar.jpg" className="w-25 rounded-3 m-0 p-0" />

        //             <div className="ms-2 m-0 p-0">
        //                 <p className="fw-bold fs-4 m-0 mb-1">Ngọc Doanh</p>
        //                 <p className="text-warning m-0 mt-1">managers</p>
        //             </div>
        //         </div>
        //         <Dropdown align="end">
        //             <Dropdown.Toggle as="span" className="three-dots-toggle">
        //                 <i className="bi bi-three-dots-vertical fs-3"></i>
        //             </Dropdown.Toggle>

        //             <Dropdown.Menu className="m-0 p-0">
        //                 <Dropdown.Item className=" btn btn-light m-0 p-2 rounded-top-3" ><i className="bi bi-person-circle"></i> My profile</Dropdown.Item>
        //                 <Dropdown.Divider className="m-0 p-0" />
        //                 <Dropdown.Item className="text-danger btn btn-light m-0 p-2 rounded-bottom-3" onClick={handleShow}><i className="bi bi-box-arrow-right" ></i> Logout</Dropdown.Item>
        //             </Dropdown.Menu>
        //         </Dropdown>

        //     </div>

        //     {
        //         managerController.map((item: any, key: number) => item.item === null ? <div key={key} className={item.onclick ? "p-3 m-0 bg-onclick" : "p-3 m-0"} onClick={() => { setActivePage(item.pages) }}>
        //             <i className={item.icon}></i> <span>{item.textHtml}</span>
        //         </div> : <AnimatePresenceController key={key} itemController={item} setActivePage={setActivePage} />)
        //     }




        // </div>
    )
}
export default ControllerManager