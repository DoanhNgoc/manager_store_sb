import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Header from "../../components/header/Header";
import ControllerStaff from "../../components/Controller/ControllerStaff";
import LogoutModal from "../../components/Controller/LogoutModal";
import StaffProducts from "../../pages/Staff/products/StaffProducts";
import StaffSchedule from "../../pages/Staff/schedule/StaffSchedule";
import StaffAttendance from "../../pages/Staff/attendance/StaffAttendance";
import StaffSalary from "../../pages/Staff/salary/StaffSalary";
import StaffImport from "../../pages/Staff/warehouse/StaffImport";
import StaffExport from "../../pages/Staff/warehouse/StaffExport";
import StaffHistory from "../../pages/Staff/warehouse/StaffHistory";
import StaffInventory from "../../pages/Staff/inventory/StaffInventory";
import StaffReview from "../../pages/Staff/review/StaffReview";

// Page titles mapping
const PAGE_TITLES: Record<string, string> = {
    products: "Sản phẩm",
    import: "Nhập kho",
    export: "Xuất kho",
    history: "Lịch sử kho",
    inventory: "Kiểm kê tồn kho",
    schedule: "Lịch làm việc",
    attendance: "Chấm công",
    salary: "Bảng lương",
    review: "Đánh giá tuần"
};

export default function LayoutStaff() {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    
    const navigate = useNavigate();
    const location = useLocation();
    const authContext = useAuth();

    // Get active page from URL
    const getActivePageFromUrl = () => {
        const path = location.pathname;
        const segments = path.split('/');
        const lastSegment = segments[segments.length - 1];
        
        // If URL is /dashboard/staff or /dashboard/staff/, default to products
        if (lastSegment === 'staff' || lastSegment === '') {
            return 'products';
        }
        return lastSegment;
    };

    const activePage = getActivePageFromUrl();

    // Navigate to page using URL
    const navigateToPage = (page: string) => {
        navigate(`/dashboard/staff/${page}`);
    };

    // Logout handler
    const handleConfirmLogout = async () => {
        try {
            if (authContext?.logout) {
                await authContext.logout();
            }
            navigate("/");
        } catch (err) {
            console.error("Logout error:", err);
        }
    };

    // Responsive handler
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

    // Render content based on active page
    const renderContent = () => {
        switch (activePage) {
            case "products":
                return <StaffProducts />;
            case "import":
                return <StaffImport />;
            case "export":
                return <StaffExport />;
            case "history":
                return <StaffHistory />;
            case "inventory":
                return <StaffInventory />;
            case "schedule":
                return <StaffSchedule />;
            case "attendance":
                return <StaffAttendance />;
            case "salary":
                return <StaffSalary />;
            case "review":
                return <StaffReview />;
            default:
                return <StaffProducts />;
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-[#009099]/30">
            {/* Header */}
            <Header 
                isSidebarOpen={isSidebarOpen} 
                toggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
                currentPageTitle={PAGE_TITLES[activePage]}
            />

            {/* Sidebar */}
            <ControllerStaff
                isOpen={isSidebarOpen}
                isMobile={isMobile}
                onLogoutClick={() => setShowLogoutModal(true)}
                setActivePage={navigateToPage}
                activePage={activePage}
            />

            {/* Logout Modal */}
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
    );
}
