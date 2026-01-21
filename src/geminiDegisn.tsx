import React, { useState, useEffect } from 'react';
import {
  Menu,
  X,
  LayoutDashboard,
  Settings,
  User,
  Bell,
  Search,
  ChevronRight,
  ChevronDown,
  Home,
  BarChart3,
  LogOut,
  Sparkles,
  Zap,
  RefreshCw,
  Users,
  Warehouse,
  Calendar,
  Contact2
} from 'lucide-react';

const apiKey = "";

// ==========================================
// 1. HEADER COMPONENT
// ==========================================
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
            G
          </div>
          <span className="font-bold text-xl hidden sm:block tracking-tight text-gray-800 font-sans">
            GeminiAdmin
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

        <div className="w-10 h-10 rounded-full bg-[#283342] flex items-center justify-center text-white ring-2 ring-white shadow-sm">
          <User size={20} />
        </div>
      </div>
    </header>
  );
};

// ==========================================
// 2. SIDEBAR (CONTROLLER) COMPONENT
// ==========================================
interface NavItem {
  icon: any;
  label: string;
  subItems?: { label: string }[];
}

const menuData: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard' },
  {
    icon: Users,
    label: 'Nhân sự',
    subItems: [{ label: 'Đánh giá nhân sự' }, { label: 'Lương' }]
  },
  {
    icon: Warehouse,
    label: 'Kho hàng',
    subItems: [{ label: 'Nhập kho' }, { label: 'Thống kê nhập hàng' }]
  },
  { icon: Contact2, label: 'Khách hàng' },
  {
    icon: Calendar,
    label: 'Lịch làm',
    subItems: [{ label: 'Lịch làm của tuần' }, { label: 'Lịch đăng ký' }]
  },
];

const SidebarItem = ({
  icon: Icon,
  label,
  subItems,
  collapsed,
  active
}: {
  icon: any,
  label: string,
  subItems?: any[],
  collapsed: boolean,
  active?: boolean
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
          ${active ? 'bg-[#009099] text-white' : 'text-gray-300 hover:bg-[#009099]/20 hover:text-white'}
        `}
      >
        <Icon size={20} className={active ? 'text-white' : 'text-gray-400 group-hover:text-white'} />
        {!collapsed && <span className="text-sm font-medium flex-1 text-left">{label}</span>}
        {!collapsed && subItems && (
          isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />
        )}
      </button>

      {!collapsed && subItems && isOpen && (
        <div className="ml-9 mt-1 space-y-1 border-l border-gray-600/50">
          {subItems.map((sub, i) => (
            <button
              key={i}
              className="w-full text-left px-4 py-2 text-xs text-gray-400 hover:text-[#009099] transition-colors relative before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-2 before:h-[1px] before:bg-gray-600"
            >
              {sub.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, isMobile }) => {
  const sidebarClasses = `
    fixed left-0 top-16 bottom-0 bg-[#283342] transition-all duration-300 z-40
    ${isOpen ? 'w-64 translate-x-0' : isMobile ? '-translate-x-full w-64' : 'w-20 translate-x-0'}
  `;

  return (
    <aside className={sidebarClasses}>
      <div className="flex flex-col h-full p-4 overflow-y-auto custom-scrollbar">
        <div className="space-y-1 flex-1">
          {menuData.map((item, idx) => (
            <SidebarItem
              key={idx}
              icon={item.icon}
              label={item.label}
              subItems={item.subItems}
              collapsed={!isOpen && !isMobile}
              active={idx === 0} // Ví dụ Dashboard active
            />
          ))}
        </div>

        <div className="pt-4 border-t border-gray-700 space-y-1">
          <SidebarItem icon={Settings} label="Cài đặt" collapsed={!isOpen && !isMobile} />
          <SidebarItem icon={LogOut} label="Đăng xuất" collapsed={!isOpen && !isMobile} />
        </div>
      </div>
    </aside>
  );
};

// ==========================================
// 3. MAIN APP COMPONENT
// ==========================================
export default function App() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

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

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <Header isSidebarOpen={isSidebarOpen} toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />

      <Sidebar isOpen={isSidebarOpen} isMobile={isMobile} />

      {isMobile && isSidebarOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30" onClick={() => setSidebarOpen(false)} />
      )}

      <main className={`pt-24 pb-12 px-4 sm:px-6 lg:px-8 transition-all duration-300 ${isMobile ? 'ml-0' : (isSidebarOpen ? 'ml-64' : 'ml-20')}`}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-gray-800">Bảng tin hệ thống</h1>
            <button className="flex items-center gap-2 bg-[#009099] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#007a82] transition-colors">
              <Sparkles size={16} /> AI Phân tích
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard title="Tổng doanh thu" value="45,280k" color="#009099" />
            <StatCard title="Nhân sự hiện tại" value="128" color="#283342" />
            <StatCard title="Đơn hàng kho" value="1,024" color="#009099" />
          </div>
        </div>
      </main>
    </div>
  );
}

const StatCard = ({ title, value, color }: { title: string, value: string, color: string }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 group hover:border-[#009099]/30 transition-all">
    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{title}</p>
    <p className="text-2xl font-bold mt-1" style={{ color: color }}>{value}</p>
    <div className="mt-4 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
      <div className="h-full bg-[#009099] w-2/3"></div>
    </div>
  </div>
);

interface SidebarProps {
  isOpen: boolean;
  isMobile: boolean;
}