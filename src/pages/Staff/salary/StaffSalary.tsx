import { useState, useEffect } from "react";
import { Wallet, TrendingUp, Clock, ChevronDown, Calendar, DollarSign, Minus, Plus } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

interface SalaryRecord {
    id: string;
    month: number;
    year: number;
    base_salary: number;
    work_days: number;
    total_days: number;
    overtime_hours: number;
    overtime_pay: number;
    bonus: number;
    deductions: number;
    total_salary: number;
    status: "paid" | "pending" | "processing";
    paid_date?: string;
}

interface SalaryDetail {
    label: string;
    amount: number;
    type: "add" | "subtract";
}

export default function StaffSalary() {
    const authContext = useAuth();
    const userId = authContext?.uidAuth;
    const [salaryHistory, setSalaryHistory] = useState<SalaryRecord[]>([]);
    const [selectedMonth, setSelectedMonth] = useState<SalaryRecord | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userId) {
            fetchSalaryHistory();
        }
    }, [userId]);

    const fetchSalaryHistory = async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:3001/api/salaries/${userId}`);
            const json = await res.json();
            if (json.success && Array.isArray(json.data)) {
                setSalaryHistory(json.data);
                if (json.data.length > 0) {
                    setSelectedMonth(json.data[0]);
                }
            } else {
                setSalaryHistory([]);
            }
        } catch (error) {
            console.error("Error fetching salary:", error);
            setSalaryHistory([]);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
    };

    const getMonthName = (month: number) => {
        return `Tháng ${month}`;
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "paid":
                return <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">Đã thanh toán</span>;
            case "pending":
                return <span className="px-3 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">Chờ thanh toán</span>;
            case "processing":
                return <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">Đang xử lý</span>;
            default:
                return null;
        }
    };

    const getSalaryDetails = (salary: SalaryRecord): SalaryDetail[] => {
        return [
            { label: "Lương cơ bản", amount: salary.base_salary || 0, type: "add" },
            { label: `Lương tăng ca (${salary.overtime_hours || 0}h)`, amount: salary.overtime_pay || 0, type: "add" },
            { label: "Thưởng", amount: salary.bonus || 0, type: "add" },
            { label: "Khấu trừ", amount: salary.deductions || 0, type: "subtract" },
        ];
    };

    // Stats
    const currentMonthSalary = salaryHistory[0]?.total_salary || 0;
    const lastMonthSalary = salaryHistory[1]?.total_salary || 0;
    const salaryChange = lastMonthSalary > 0 ? ((currentMonthSalary - lastMonthSalary) / lastMonthSalary * 100) : 0;
    const totalEarned = salaryHistory.filter(s => s.status === "paid").reduce((acc, s) => acc + (s.total_salary || 0), 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Bảng lương</h1>
                    <p className="text-slate-500 mt-1">Xem chi tiết lương hàng tháng</p>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#009099]"></div>
                </div>
            ) : salaryHistory.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
                    <Wallet size={48} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500">Chưa có dữ liệu bảng lương</p>
                    <p className="text-sm text-slate-400 mt-1">Bảng lương sẽ được cập nhật vào cuối tháng</p>
                </div>
            ) : (
                <>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-[#009099] to-[#007a82] rounded-2xl p-5 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-white/70 text-sm">Lương tháng này</p>
                                    <p className="text-2xl font-bold mt-1">{formatCurrency(currentMonthSalary)}</p>
                                    {salaryChange !== 0 && (
                                        <p className={`text-sm mt-2 flex items-center gap-1 ${salaryChange > 0 ? 'text-green-300' : 'text-red-300'}`}>
                                            <TrendingUp size={14} className={salaryChange < 0 ? 'rotate-180' : ''} />
                                            {salaryChange > 0 ? '+' : ''}{salaryChange.toFixed(1)}% so với tháng trước
                                        </p>
                                    )}
                                </div>
                                <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                                    <Wallet size={28} />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                                    <Clock size={24} className="text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Giờ tăng ca</p>
                                    <p className="text-2xl font-bold text-slate-800">{selectedMonth?.overtime_hours || 0}h</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                                    <DollarSign size={24} className="text-green-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Tổng đã nhận</p>
                                    <p className="text-2xl font-bold text-slate-800">{formatCurrency(totalEarned)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Salary Detail */}
                        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                                <h3 className="font-semibold text-slate-800">Chi tiết lương</h3>
                                {/* Month Selector */}
                                <div className="relative">
                                    <select
                                        value={selectedMonth?.id || ""}
                                        onChange={(e) => {
                                            const selected = salaryHistory.find(s => s.id === e.target.value);
                                            setSelectedMonth(selected || null);
                                        }}
                                        className="pl-4 pr-10 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#009099]/20 focus:border-[#009099] appearance-none bg-white text-sm font-medium"
                                    >
                                        {salaryHistory.map((salary) => (
                                            <option key={salary.id} value={salary.id}>
                                                {getMonthName(salary.month)} {salary.year}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                </div>
                            </div>

                            {selectedMonth && (
                                <div className="p-6">
                                    {/* Work Summary */}
                                    <div className="flex items-center gap-4 mb-6 p-4 bg-slate-50 rounded-xl">
                                        <Calendar size={20} className="text-slate-400" />
                                        <div>
                                            <p className="text-sm text-slate-500">Ngày công</p>
                                            <p className="font-semibold text-slate-800">
                                                {selectedMonth.work_days || 0} / {selectedMonth.total_days || 22} ngày
                                            </p>
                                        </div>
                                    </div>

                                    {/* Salary Breakdown */}
                                    <div className="space-y-4">
                                        {getSalaryDetails(selectedMonth).map((detail, idx) => (
                                            <div key={idx} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${detail.type === 'add' ? 'bg-green-50' : 'bg-red-50'}`}>
                                                        {detail.type === 'add' ? (
                                                            <Plus size={16} className="text-green-500" />
                                                        ) : (
                                                            <Minus size={16} className="text-red-500" />
                                                        )}
                                                    </div>
                                                    <span className="text-slate-600">{detail.label}</span>
                                                </div>
                                                <span className={`font-semibold ${detail.type === 'add' ? 'text-green-600' : 'text-red-500'}`}>
                                                    {detail.type === 'add' ? '+' : '-'}{formatCurrency(detail.amount)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Total */}
                                    <div className="mt-6 pt-4 border-t-2 border-slate-200">
                                        <div className="flex items-center justify-between">
                                            <span className="text-lg font-semibold text-slate-800">Tổng lương</span>
                                            <span className="text-2xl font-bold text-[#009099]">{formatCurrency(selectedMonth.total_salary)}</span>
                                        </div>
                                        <div className="mt-3 flex items-center justify-between">
                                            <span className="text-slate-500">Trạng thái</span>
                                            {getStatusBadge(selectedMonth.status)}
                                        </div>
                                        {selectedMonth.paid_date && (
                                            <p className="text-sm text-slate-400 mt-2">
                                                Thanh toán ngày: {new Date(selectedMonth.paid_date).toLocaleDateString('vi-VN')}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Salary History */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-200">
                                <h3 className="font-semibold text-slate-800">Lịch sử lương</h3>
                            </div>
                            <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
                                {salaryHistory.map((salary) => (
                                    <button
                                        key={salary.id}
                                        onClick={() => setSelectedMonth(salary)}
                                        className={`w-full px-6 py-4 text-left hover:bg-slate-50 transition-colors ${selectedMonth?.id === salary.id ? 'bg-[#009099]/5 border-l-4 border-[#009099]' : ''}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-slate-800">{getMonthName(salary.month)} {salary.year}</p>
                                                <p className="text-sm text-slate-500">{salary.work_days || 0} ngày công</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-slate-800">{formatCurrency(salary.total_salary)}</p>
                                                <div className="mt-1">{getStatusBadge(salary.status)}</div>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
