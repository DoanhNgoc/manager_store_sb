import { useState, useEffect } from "react";
import { History, Package, ArrowDownToLine, ArrowUpFromLine, Search, Calendar, Filter, Eye } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

interface TransactionItem {
    id: string;
    product: {
        id: string;
        name: string;
    } | null;
    before_quantity: number;
    after_quantity: number;
    quantity_change: number;
}

interface Transaction {
    id: string;
    title: string;
    type: "IMPORT" | "EXPORT" | "ADJUST";
    note: string;
    created_at: { _seconds: number } | null;
    created_by: {
        id: string;
        name: string;
    } | null;
    items: TransactionItem[];
}

export default function StaffHistory() {
    const authContext = useAuth();
    const userId = authContext?.uidAuth;
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState<"ALL" | "IMPORT" | "EXPORT">("ALL");
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

    useEffect(() => {
        fetchTransactions();
    }, [userId]);

    const fetchTransactions = async () => {
        try {
            const res = await fetch("http://localhost:3001/api/warehouse-transactions");
            const json = await res.json();
            if (json.success && Array.isArray(json.data)) {
                // Lọc chỉ lấy giao dịch của user hiện tại
                const myTransactions = json.data.filter(
                    (t: Transaction) => t.created_by?.id === userId
                );
                setTransactions(myTransactions);
            }
        } catch (error) {
            console.error("Error fetching transactions:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredTransactions = transactions.filter(t => {
        const matchSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.note?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchType = filterType === "ALL" || t.type === filterType;
        return matchSearch && matchType;
    });

    const formatDate = (timestamp: { _seconds: number } | null) => {
        if (!timestamp) return "N/A";
        return new Date(timestamp._seconds * 1000).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTypeInfo = (type: string) => {
        switch (type) {
            case "IMPORT":
                return { label: "Nhập kho", color: "green", icon: ArrowDownToLine };
            case "EXPORT":
                return { label: "Xuất kho", color: "red", icon: ArrowUpFromLine };
            default:
                return { label: "Điều chỉnh", color: "blue", icon: Package };
        }
    };

    const getTotalQuantityChange = (items: TransactionItem[]) => {
        return items.reduce((acc, item) => acc + Math.abs(item.quantity_change), 0);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                    <History size={24} className="text-purple-600" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Lịch sử giao dịch kho</h1>
                    <p className="text-slate-500">Xem lại các phiếu nhập/xuất kho của bạn</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Tìm theo tiêu đề, ghi chú..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                        />
                    </div>

                    {/* Type Filter */}
                    <div className="flex items-center gap-2">
                        <Filter size={18} className="text-slate-400" />
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value as any)}
                            className="px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-white"
                        >
                            <option value="ALL">Tất cả</option>
                            <option value="IMPORT">Nhập kho</option>
                            <option value="EXPORT">Xuất kho</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                            <History size={20} className="text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Tổng giao dịch</p>
                            <p className="text-2xl font-bold text-slate-800">{transactions.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                            <ArrowDownToLine size={20} className="text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Phiếu nhập</p>
                            <p className="text-2xl font-bold text-green-600">
                                {transactions.filter(t => t.type === "IMPORT").length}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                            <ArrowUpFromLine size={20} className="text-red-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Phiếu xuất</p>
                            <p className="text-2xl font-bold text-red-600">
                                {transactions.filter(t => t.type === "EXPORT").length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Transaction List */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-200">
                    <h3 className="font-semibold text-slate-800">
                        Danh sách giao dịch ({filteredTransactions.length})
                    </h3>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                    </div>
                ) : filteredTransactions.length === 0 ? (
                    <div className="text-center py-12">
                        <History size={48} className="mx-auto text-slate-300 mb-3" />
                        <p className="text-slate-500">Chưa có giao dịch nào</p>
                        <p className="text-sm text-slate-400">Các phiếu nhập/xuất kho sẽ hiển thị ở đây</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {filteredTransactions.map(transaction => {
                            const typeInfo = getTypeInfo(transaction.type);
                            const TypeIcon = typeInfo.icon;
                            return (
                                <div
                                    key={transaction.id}
                                    className="px-5 py-4 hover:bg-slate-50 transition-colors"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-4">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                                typeInfo.color === 'green' ? 'bg-green-100' :
                                                typeInfo.color === 'red' ? 'bg-red-100' : 'bg-blue-100'
                                            }`}>
                                                <TypeIcon size={20} className={
                                                    typeInfo.color === 'green' ? 'text-green-600' :
                                                    typeInfo.color === 'red' ? 'text-red-600' : 'text-blue-600'
                                                } />
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-800">{transaction.title}</p>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                                        typeInfo.color === 'green' ? 'bg-green-100 text-green-700' :
                                                        typeInfo.color === 'red' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                        {typeInfo.label}
                                                    </span>
                                                    <span className="text-xs text-slate-500 flex items-center gap-1">
                                                        <Calendar size={12} />
                                                        {formatDate(transaction.created_at)}
                                                    </span>
                                                </div>
                                                {transaction.note && (
                                                    <p className="text-sm text-slate-500 mt-2">{transaction.note}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="text-right">
                                                <p className="text-sm text-slate-500">Số lượng</p>
                                                <p className={`font-bold ${
                                                    transaction.type === 'IMPORT' ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                    {transaction.type === 'IMPORT' ? '+' : '-'}
                                                    {getTotalQuantityChange(transaction.items)}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => setSelectedTransaction(transaction)}
                                                className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                            >
                                                <Eye size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {selectedTransaction && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                            <h3 className="font-semibold text-slate-800">Chi tiết giao dịch</h3>
                            <button
                                onClick={() => setSelectedTransaction(null)}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-[60vh]">
                            {/* Transaction Info */}
                            <div className="space-y-4 mb-6">
                                <div>
                                    <p className="text-sm text-slate-500">Tiêu đề</p>
                                    <p className="font-medium text-slate-800">{selectedTransaction.title}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-slate-500">Loại</p>
                                        <span className={`inline-block text-sm font-medium px-2 py-0.5 rounded-full ${
                                            selectedTransaction.type === 'IMPORT' 
                                                ? 'bg-green-100 text-green-700' 
                                                : 'bg-red-100 text-red-700'
                                        }`}>
                                            {getTypeInfo(selectedTransaction.type).label}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500">Thời gian</p>
                                        <p className="font-medium text-slate-800">
                                            {formatDate(selectedTransaction.created_at)}
                                        </p>
                                    </div>
                                </div>
                                {selectedTransaction.note && (
                                    <div>
                                        <p className="text-sm text-slate-500">Ghi chú</p>
                                        <p className="text-slate-700">{selectedTransaction.note}</p>
                                    </div>
                                )}
                            </div>

                            {/* Items */}
                            <div>
                                <p className="text-sm font-medium text-slate-700 mb-3">
                                    Sản phẩm ({selectedTransaction.items.length})
                                </p>
                                <div className="space-y-2">
                                    {selectedTransaction.items.map(item => (
                                        <div
                                            key={item.id}
                                            className="flex items-center justify-between p-3 bg-slate-50 rounded-xl"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center">
                                                    <Package size={16} className="text-slate-500" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-800 text-sm">
                                                        {item.product?.name || "Sản phẩm không xác định"}
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        {item.before_quantity} → {item.after_quantity}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className={`font-bold ${
                                                item.quantity_change > 0 ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                                {item.quantity_change > 0 ? '+' : ''}{item.quantity_change}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
