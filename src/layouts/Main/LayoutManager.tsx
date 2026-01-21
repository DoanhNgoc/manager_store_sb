import ControllerManager from "../../components/Controller/ControllerManager"
import { useEffect, useState } from "react";
import HomeManager from "../../pages/Manager/dashboard/HomeManager";
import HumanResources from "../../pages/Manager/personal/HumanResources";
import HomeSalary from "../../pages/Manager/personal/salary/HomeSalary";
import HomeCustomerServices from "../../pages/Manager/customer_service/HomeCustomerServices";
import IntoWarehouse from "../../pages/Manager/warehouses/IntoWarehouse";
import Header from "../../components/header/Header";
import PersonnelEvaluation from "../../pages/Manager/personal/review/PersonnelEvaluation";
import Inventory from "../../pages/Manager/warehouses/Inventory";
import StockAlert from "../../pages/Manager/warehouses/StockAlert";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import LogoutModal from "../../components/Controller/LogoutModal";
export default function LayoutManager() {
    const [isSidebarOpen, setSidebarOpen] = useState(true);

    const [activePage, setActivePage] = useState<string>("dashboard");

    const [isMobile, setIsMobile] = useState(false);

    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const navigate = useNavigate();
    const { logout } = useAuth();
    //logout

    const handleConfirmLogout = async () => {
        try {
            await logout();     // 🔥 gọi Firebase signOut
            // đóng modal
            // nếu có router thì navigate("/login") ở đây
            navigate("/login")
        } catch (err) {
            console.error("Logout error:", err);
        }
    };


    // Xử lý Responsive
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            if (mobile) setSidebarOpen(false);
            else setSidebarOpen(true);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    //render content 
    const renderContent = () => {
        switch (activePage) {
            case "dashboard":
                return <HomeManager />

            case "HumanResources":
                return <HumanResources />

            case "PersonnelEvaluation":
                return <PersonnelEvaluation />

            case "HomeSalary":
                return <HomeSalary />



            case "HomeWarehouse":
                return <HomeCustomerServices />

            case "Inventory":
                return <Inventory />

            case "IntoWarehouse":
                return <IntoWarehouse />

            case "StockAlert":
                return <StockAlert />

            case "StockAlert":
                return <StockAlert />

        }
    }
    return <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-[#009099]/30">
        <Header isSidebarOpen={isSidebarOpen} toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />
        <ControllerManager
            isOpen={isSidebarOpen}
            isMobile={isMobile}
            onLogoutClick={() => setShowLogoutModal(true)}
            setActivePage={setActivePage} />
        {/* Modal Đăng xuất */}
        <LogoutModal
            show={showLogoutModal}
            onClose={() => setShowLogoutModal(false)}
            onConfirm={handleConfirmLogout}
        />

        {/* Mobile Overlay */}
        {isMobile && isSidebarOpen && (
            <div
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-30 transition-opacity"
                onClick={() => setSidebarOpen(false)}
            />
        )}
        {/* Main Content Area */}
        <main className={`pt-24 pb-12 px-4 sm:px-6 lg:px-8 transition-all duration-300 ${isMobile ? 'ml-0' : (isSidebarOpen ? 'ml-64' : 'ml-20')}`}>
            <div className="max-w-7xl mx-auto">
                {renderContent()}
            </div>
        </main>

    </div>
}