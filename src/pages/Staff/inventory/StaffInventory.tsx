import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    Package, Search, AlertTriangle, CheckCircle, XCircle, RefreshCw,
    Plus, FileText, Clock, Send, Save, ChevronRight, ChevronLeft,
    BarChart3, TrendingUp, History, Filter, Download,
    Trash2, HelpCircle, Info, Lightbulb
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

interface InventoryItem {
    product_id: string;
    product_name: string;
    system_quantity: number;
    actual_quantity: number | null;
    difference: number;
    note: string;
    reason: string;
    checked: boolean;
}

interface InventoryCheck {
    id: string;
    code: string;
    title: string;
    status: "draft" | "submitted" | "approved" | "rejected";
    created_at: { _seconds: number };
    total_products: number;
    checked_products: number;
    matched: number;
    over: number;
    under: number;
    items: InventoryItem[];
    reject_reason?: string;
}

interface ProductTransaction {
    id: string;
    type: string;
    title: string;
    date: { _seconds: number };
    quantity_change: number;
    before: number;
    after: number;
}

interface Stats {
    totalChecks: number;
    draftChecks: number;
    submittedChecks: number;
    approvedChecks: number;
    avgAccuracy: number;
    topDiffProducts: { product_id: string; name: string; count: number }[];
    monthlyTrend: { month: string; checks: number; accuracy: number }[];
}

type ViewMode = "list" | "edit" | "stats";
type Step = 1 | 2 | 3;

export default function StaffInventory() {
    const authContext = useAuth();
    const userId = authContext?.uidAuth;
    const navigate = useNavigate();
    const location = useLocation();

    const getViewFromHash = (): { view: ViewMode; checkId?: string } => {
        const hash = location.hash;
        if (hash === "#stats") return { view: "stats" };
        if (hash.startsWith("#edit/")) return { view: "edit", checkId: hash.replace("#edit/", "") };
        return { view: "list" };
    };

    const { view: viewMode, checkId: urlCheckId } = getViewFromHash();

    const [currentStep, setCurrentStep] = useState<Step>(1);
    const [checks, setChecks] = useState<InventoryCheck[]>([]);
    const [currentCheck, setCurrentCheck] = useState<InventoryCheck | null>(null);
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [originalItems, setOriginalItems] = useState<InventoryItem[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterMode, setFilterMode] = useState<"all" | "unchecked" | "diff">("all");
    const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
    const [productHistory, setProductHistory] = useState<ProductTransaction[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [notification, setNotification] = useState<{ type: string; message: string } | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
    const [showHelp, setShowHelp] = useState(false);

    // Check if there are unsaved changes
    const hasChanges = JSON.stringify(items) !== JSON.stringify(originalItems);

    const goToList = async () => {
        // Auto-save draft if there are unsaved changes
        if (currentCheck && currentCheck.status === "draft" && hasChanges) {
            await autoSaveDraft();
        }
        navigate(location.pathname, { replace: false });
        setCurrentCheck(null);
    };

    const goToStats = () => {
        navigate(`${location.pathname}#stats`, { replace: false });
    };

    const goToEdit = (checkId: string) => {
        navigate(`${location.pathname}#edit/${checkId}`, { replace: false });
    };

    const fetchChecks = useCallback(async () => {
        if (!userId) return;
        try {
            const res = await fetch(`http://localhost:3001/api/inventory-checks/user/${userId}`);
            const json = await res.json();
            if (json.success) setChecks(json.data || []);
        } catch (error) {
            console.error("Error fetching checks:", error);
        }
    }, [userId]);

    const fetchStats = useCallback(async () => {
        if (!userId) return;
        try {
            const res = await fetch(`http://localhost:3001/api/inventory-stats?userId=${userId}`);
            const json = await res.json();
            if (json.success) setStats(json.data);
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    }, [userId]);

    useEffect(() => {
        if (viewMode === "edit" && urlCheckId && urlCheckId !== currentCheck?.id) {
            loadCheck(urlCheckId);
        }
    }, [viewMode, urlCheckId]);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([fetchChecks(), fetchStats()]);
            setLoading(false);
        };
        loadData();
    }, [fetchChecks, fetchStats]);

    // Auto-save on unmount or when leaving edit view
    useEffect(() => {
        return () => {
            // Cleanup: auto-save if there are unsaved changes
            if (currentCheck && currentCheck.status === "draft" && hasChanges) {
                autoSaveDraft();
            }
        };
    }, [currentCheck, hasChanges]);

    const createNewCheck = async () => {
        if (!userId) return;
        setSaving(true);
        try {
            const res = await fetch("http://localhost:3001/api/inventory-checks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId }),
            });
            const json = await res.json();
            if (json.success) {
                setCurrentCheck({ ...json.data, status: "draft" } as InventoryCheck);
                setItems(json.data.items);
                setOriginalItems(json.data.items);
                setCurrentStep(2);
                goToEdit(json.data.id);
                showNotification("success", "Đã tạo phiếu kiểm kê mới! Hãy bắt đầu nhập số lượng thực tế.");
            }
        } catch (error) {
            showNotification("error", "Không thể tạo phiếu kiểm kê");
        } finally {
            setSaving(false);
        }
    };

    const loadCheck = async (checkId: string) => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:3001/api/inventory-checks/${checkId}`);
            const json = await res.json();
            if (json.success) {
                setCurrentCheck(json.data);
                setItems(json.data.items || []);
                setOriginalItems(json.data.items || []);
                setCurrentStep(json.data.status === "draft" ? 2 : 3);
            }
        } catch (error) {
            showNotification("error", "Không thể tải phiếu kiểm kê");
            goToList();
        } finally {
            setLoading(false);
        }
    };

    const deleteCheck = async (checkId: string) => {
        if (!userId) return;
        try {
            const res = await fetch(`http://localhost:3001/api/inventory-checks/${checkId}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId }),
            });
            const json = await res.json();
            if (json.success) {
                showNotification("success", "Đã xóa phiếu kiểm kê");
                fetchChecks();
                fetchStats();
                setShowDeleteConfirm(null);
            } else {
                showNotification("error", json.message);
            }
        } catch (error) {
            showNotification("error", "Không thể xóa phiếu kiểm kê");
        }
    };

    const updateItem = (productId: string, field: string, value: any) => {
        setItems((prev) =>
            prev.map((item) => {
                if (item.product_id === productId) {
                    const updated = { ...item, [field]: value };
                    if (field === "actual_quantity") {
                        updated.difference = (value ?? 0) - item.system_quantity;
                        updated.checked = value !== null && value !== "";
                    }
                    return updated;
                }
                return item;
            })
        );
    };

    const saveDraft = async () => {
        if (!currentCheck || !hasChanges) return;
        setSaving(true);
        try {
            const res = await fetch(`http://localhost:3001/api/inventory-checks/${currentCheck.id}/draft`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ items }),
            });
            const json = await res.json();
            if (json.success) {
                setOriginalItems([...items]);
                showNotification("success", "Đã lưu nháp thành công!");
                fetchChecks();
            }
        } catch (error) {
            showNotification("error", "Không thể lưu nháp");
        } finally {
            setSaving(false);
        }
    };

    const autoSaveDraft = async () => {
        if (!currentCheck || !hasChanges) return;
        try {
            await fetch(`http://localhost:3001/api/inventory-checks/${currentCheck.id}/draft`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ items }),
            });
            setOriginalItems([...items]);
        } catch (error) {
            console.error("Auto-save failed:", error);
        }
    };

    const submitCheck = async () => {
        if (!currentCheck) return;

        setSaving(true);
        try {
            if (hasChanges) {
                await fetch(`http://localhost:3001/api/inventory-checks/${currentCheck.id}/draft`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ items }),
                });
            }

            const res = await fetch(`http://localhost:3001/api/inventory-checks/${currentCheck.id}/submit`, {
                method: "POST",
            });
            const json = await res.json();
            if (json.success) {
                showNotification("success", "🎉 Đã gửi phiếu kiểm kê! Manager sẽ xem xét và duyệt.");
                setCurrentCheck({ ...currentCheck, status: "submitted" });
                setOriginalItems([...items]);
                setCurrentStep(3);
                fetchChecks();
            } else {
                showNotification("error", json.message);
            }
        } catch (error) {
            showNotification("error", "Không thể gửi phiếu kiểm kê");
        } finally {
            setSaving(false);
        }
    };

    const fetchProductHistory = async (productId: string) => {
        setSelectedProduct(productId);
        setHistoryLoading(true);
        try {
            const res = await fetch(`http://localhost:3001/api/products/${productId}/transactions?limit=5`);
            const json = await res.json();
            if (json.success) setProductHistory(json.data || []);
        } catch (error) {
            console.error("Error fetching history:", error);
        } finally {
            setHistoryLoading(false);
        }
    };

    const showNotification = (type: string, message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 5000);
    };

    const exportToCSV = () => {
        if (!items.length) return;
        const headers = ["Sản phẩm", "SL Hệ thống", "SL Thực tế", "Chênh lệch", "Ghi chú"];
        const rows = items
            .filter((i) => i.checked)
            .map((i) => [i.product_name, i.system_quantity, i.actual_quantity, i.difference, i.note]);
        const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
        const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `kiem-ke-${currentCheck?.code || "export"}.csv`;
        a.click();
    };

    const filteredItems = items.filter((item) => {
        const matchSearch = item.product_name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchFilter =
            filterMode === "all" ||
            (filterMode === "unchecked" && !item.checked) ||
            (filterMode === "diff" && item.checked && item.difference !== 0);
        return matchSearch && matchFilter;
    });

    const progress = items.length > 0 ? (items.filter((i) => i.checked).length / items.length) * 100 : 0;
    const checkedCount = items.filter((i) => i.checked).length;
    const matchedCount = items.filter((i) => i.checked && i.difference === 0).length;
    const overCount = items.filter((i) => i.checked && i.difference > 0).length;
    const underCount = items.filter((i) => i.checked && i.difference < 0).length;

    const formatDate = (timestamp: { _seconds: number }) => {
        return new Date(timestamp._seconds * 1000).toLocaleDateString("vi-VN", {
            day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "draft": return <span className="px-2 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-600">📝 Nháp</span>;
            case "submitted": return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">⏳ Chờ duyệt</span>;
            case "approved": return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">✅ Đã duyệt</span>;
            case "rejected": return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">❌ Từ chối</span>;
            default: return null;
        }
    };

    if (loading && viewMode === "list") {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#009099] mx-auto mb-4"></div>
                    <p className="text-slate-500">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    // Stats View
    if (viewMode === "stats") {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <button onClick={goToList} className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-[#009099] hover:bg-[#009099]/10 rounded-xl transition-colors">
                        <ChevronLeft size={20} /><span className="font-medium">Quay lại</span>
                    </button>
                    <div className="border-l border-slate-200 pl-3">
                        <h1 className="text-2xl font-bold text-slate-800">📊 Thống kê kiểm kê</h1>
                        <p className="text-slate-500">Phân tích xu hướng và độ chính xác kho hàng</p>
                    </div>
                </div>

                {stats && (
                    <>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-[#009099]/10 flex items-center justify-center"><FileText size={20} className="text-[#009099]" /></div>
                                    <div><p className="text-xs text-slate-500">Tổng phiếu</p><p className="text-xl font-bold text-slate-800">{stats.totalChecks}</p></div>
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center"><CheckCircle size={20} className="text-green-500" /></div>
                                    <div><p className="text-xs text-slate-500">Đã duyệt</p><p className="text-xl font-bold text-slate-800">{stats.approvedChecks}</p></div>
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center"><Clock size={20} className="text-blue-500" /></div>
                                    <div><p className="text-xs text-slate-500">Chờ duyệt</p><p className="text-xl font-bold text-slate-800">{stats.submittedChecks}</p></div>
                                </div>
                            </div>
                            <div className="bg-gradient-to-br from-[#009099] to-[#00b8c4] rounded-2xl shadow-sm p-5 text-white">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center"><TrendingUp size={20} /></div>
                                    <div><p className="text-xs text-white/80">Độ chính xác TB</p><p className="text-xl font-bold">{stats.avgAccuracy}%</p></div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2"><BarChart3 size={20} className="text-[#009099]" />Xu hướng độ chính xác</h3>
                                <div className="flex items-end justify-between gap-2 h-40">
                                    {stats.monthlyTrend.map((m, idx) => (
                                        <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                                            <div className="w-full bg-slate-100 rounded-t-lg relative" style={{ height: "120px" }}>
                                                <div className="absolute bottom-0 w-full bg-gradient-to-t from-[#009099] to-[#00b8c4] rounded-t-lg transition-all" style={{ height: `${m.accuracy}%` }} />
                                                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-[#009099]">{m.accuracy.toFixed(0)}%</span>
                                            </div>
                                            <span className="text-xs text-slate-500">{m.month}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2"><AlertTriangle size={20} className="text-yellow-500" />Sản phẩm hay chênh lệch</h3>
                                <div className="space-y-3">
                                    {stats.topDiffProducts.length > 0 ? stats.topDiffProducts.map((p, idx) => (
                                        <div key={p.product_id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${idx === 0 ? "bg-red-100 text-red-600" : idx === 1 ? "bg-orange-100 text-orange-600" : "bg-yellow-100 text-yellow-600"}`}>{idx + 1}</div>
                                            <div className="flex-1"><p className="font-medium text-slate-800">{p.name}</p><p className="text-xs text-slate-500">{p.count} lần chênh lệch</p></div>
                                        </div>
                                    )) : <p className="text-center text-slate-500 py-4">Chưa có dữ liệu</p>}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        );
    }

    // Edit View
    if (viewMode === "edit" && currentCheck) {
        return (
            <div className="space-y-6">
                {notification && (
                    <div className={`rounded-xl p-4 flex items-center gap-3 ${notification.type === "error" ? "bg-red-50 border border-red-200" : "bg-green-50 border border-green-200"}`}>
                        {notification.type === "success" ? <CheckCircle size={20} className="text-green-500" /> : <XCircle size={20} className="text-red-500" />}
                        <span className={notification.type === "error" ? "text-red-700" : "text-green-700"}>{notification.message}</span>
                        <button onClick={() => setNotification(null)} className="ml-auto text-slate-400 hover:text-slate-600">✕</button>
                    </div>
                )}

                {/* Header with back button */}
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                        <button onClick={goToList} className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-[#009099] hover:bg-[#009099]/10 rounded-xl transition-colors">
                            <ChevronLeft size={20} /><span className="font-medium">Quay lại</span>
                        </button>
                        <div className="border-l border-slate-200 pl-3">
                            <h1 className="text-xl font-bold text-slate-800">{currentCheck.title}</h1>
                            <p className="text-slate-500 text-sm">Mã: {currentCheck.code} • {getStatusBadge(currentCheck.status)}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setShowHelp(true)} className="p-2 text-slate-400 hover:text-[#009099] hover:bg-[#009099]/10 rounded-lg" title="Hướng dẫn">
                            <HelpCircle size={20} />
                        </button>
                        {currentCheck.status === "draft" && (
                            <>
                                {hasChanges && (
                                    <button onClick={saveDraft} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 disabled:opacity-50">
                                        <Save size={18} /> Lưu nháp
                                    </button>
                                )}
                                <button onClick={exportToCSV} className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50">
                                    <Download size={18} /> Xuất CSV
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Unsaved changes warning */}
                {hasChanges && currentCheck.status === "draft" && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-3">
                        <Info size={18} className="text-amber-500" />
                        <span className="text-amber-700 text-sm">Bạn có thay đổi chưa lưu. Nhấn "Lưu nháp" để không mất dữ liệu.</span>
                    </div>
                )}

                {/* Steps indicator */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
                    <div className="flex items-center justify-between overflow-x-auto">
                        {[
                            { step: 1, label: "Tạo phiếu", icon: Plus, desc: "Bắt đầu kiểm kê" },
                            { step: 2, label: "Nhập số lượng", icon: Package, desc: "Đếm & ghi chú" },
                            { step: 3, label: "Hoàn thành", icon: Send, desc: "Gửi Manager duyệt" },
                        ].map((s, idx) => (
                            <div key={s.step} className="flex items-center">
                                <div className={`flex flex-col items-center min-w-[80px] ${currentStep >= s.step ? "text-[#009099]" : "text-slate-400"}`}>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${currentStep >= s.step ? "bg-[#009099] text-white" : "bg-slate-100"}`}>
                                        <s.icon size={18} />
                                    </div>
                                    <span className="text-xs font-medium">{s.label}</span>
                                    <span className="text-[10px] text-slate-400 hidden sm:block">{s.desc}</span>
                                </div>
                                {idx < 2 && <ChevronRight size={20} className="mx-1 text-slate-300 flex-shrink-0" />}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Progress */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700">📦 Tiến độ kiểm kê</span>
                        <span className="text-sm text-slate-500">{checkedCount}/{items.length} sản phẩm ({progress.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3">
                        <div className="bg-gradient-to-r from-[#009099] to-[#00b8c4] h-3 rounded-full transition-all" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="flex items-center gap-4 mt-3 flex-wrap">
                        <span className="text-sm text-green-600 flex items-center gap-1"><CheckCircle size={14} /> Khớp: {matchedCount}</span>
                        <span className="text-sm text-blue-600 flex items-center gap-1"><TrendingUp size={14} /> Thừa: {overCount}</span>
                        <span className="text-sm text-red-600 flex items-center gap-1"><AlertTriangle size={14} /> Thiếu: {underCount}</span>
                    </div>
                </div>

                {/* Tips for new users */}
                {currentStep === 2 && checkedCount === 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                        <Lightbulb size={20} className="text-blue-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium text-blue-800">💡 Mẹo kiểm kê</p>
                            <p className="text-sm text-blue-700 mt-1">Đếm số lượng thực tế và nhập vào cột "SL Thực tế". Thêm ghi chú nếu cần.</p>
                        </div>
                    </div>
                )}

                {/* Filter & Search */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input type="text" placeholder="🔍 Tìm sản phẩm..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#009099]/20" />
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter size={18} className="text-slate-400" />
                            <select value={filterMode} onChange={(e) => setFilterMode(e.target.value as any)}
                                className="px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#009099]/20 bg-white">
                                <option value="all">Tất cả ({items.length})</option>
                                <option value="unchecked">⏳ Chưa kiểm ({items.filter((i) => !i.checked).length})</option>
                                <option value="diff">⚠️ Có chênh lệch ({items.filter((i) => i.checked && i.difference !== 0).length})</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Items Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Sản phẩm</th>
                                    <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase w-28">SL Hệ thống</th>
                                    <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase w-32">SL Thực tế</th>
                                    <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase w-24">Chênh lệch</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Ghi chú</th>
                                    <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase w-16"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredItems.map((item) => {
                                    const hasBigDiff = item.checked && Math.abs(item.difference) > item.system_quantity * 0.1;
                                    return (
                                        <tr key={item.product_id} className={`hover:bg-slate-50 transition-colors ${hasBigDiff ? "bg-red-50" : ""}`}>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.checked ? (item.difference === 0 ? "bg-green-100" : item.difference > 0 ? "bg-blue-100" : "bg-red-100") : "bg-slate-100"}`}>
                                                        <Package size={16} className={item.checked ? (item.difference === 0 ? "text-green-600" : item.difference > 0 ? "text-blue-600" : "text-red-600") : "text-slate-400"} />
                                                    </div>
                                                    <span className="font-medium text-slate-800">{item.product_name}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center font-medium text-slate-600">{item.system_quantity}</td>
                                            <td className="px-4 py-3 text-center">
                                                {currentCheck.status === "draft" ? (
                                                    <input type="number" min="0" value={item.actual_quantity ?? ""} onChange={(e) => updateItem(item.product_id, "actual_quantity", e.target.value === "" ? null : parseInt(e.target.value))}
                                                        placeholder="Nhập SL" className="w-24 px-2 py-1.5 border border-slate-200 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-[#009099]/20 focus:border-[#009099]" />
                                                ) : (
                                                    <span className="font-medium">{item.actual_quantity ?? "--"}</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {item.checked && (
                                                    <span className={`font-bold px-2 py-1 rounded-lg ${item.difference === 0 ? "text-green-600 bg-green-50" : item.difference > 0 ? "text-blue-600 bg-blue-50" : "text-red-600 bg-red-50"}`}>
                                                        {item.difference > 0 ? "+" : ""}{item.difference}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {currentCheck.status === "draft" ? (
                                                    <input type="text" value={item.note} onChange={(e) => updateItem(item.product_id, "note", e.target.value)} placeholder="Ghi chú..."
                                                        className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#009099]/20" />
                                                ) : (
                                                    <span className="text-sm text-slate-600">{item.note || "-"}</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <button onClick={() => fetchProductHistory(item.product_id)} className="p-1.5 text-slate-400 hover:text-[#009099] hover:bg-[#009099]/10 rounded-lg transition-colors" title="Xem lịch sử nhập/xuất">
                                                    <History size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Action Buttons */}
                {currentCheck.status === "draft" && (
                    <div className="flex items-center justify-end bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
                        <button onClick={submitCheck} disabled={saving || checkedCount === 0}
                            className="flex items-center gap-2 px-6 py-2.5 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed">
                            {saving ? <RefreshCw size={18} className="animate-spin" /> : <Send size={18} />}
                            Gửi duyệt
                        </button>
                    </div>
                )}

                {currentCheck.status === "rejected" && currentCheck.reject_reason && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                        <p className="font-medium text-red-700">❌ Phiếu bị từ chối</p>
                        <p className="text-red-600 mt-1">Lý do: {currentCheck.reject_reason}</p>
                    </div>
                )}

                {currentCheck.status === "submitted" && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                        <p className="font-medium text-blue-700">⏳ Phiếu đang chờ Manager duyệt</p>
                        <p className="text-blue-600 text-sm mt-1">Bạn sẽ được thông báo khi có kết quả.</p>
                    </div>
                )}

                {currentCheck.status === "approved" && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                        <p className="font-medium text-green-700">✅ Phiếu đã được duyệt</p>
                        <p className="text-green-600 text-sm mt-1">Số lượng tồn kho đã được cập nhật theo kết quả kiểm kê.</p>
                    </div>
                )}

                {/* Help Modal */}
                {showHelp && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full">
                            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                                <h3 className="font-semibold text-slate-800">📖 Hướng dẫn kiểm kê</h3>
                                <button onClick={() => setShowHelp(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="flex gap-3"><span className="text-2xl">1️⃣</span><div><p className="font-medium">Nhập số lượng thực tế</p><p className="text-sm text-slate-500">Đếm hàng trong kho và nhập vào cột "SL Thực tế"</p></div></div>
                                <div className="flex gap-3"><span className="text-2xl">2️⃣</span><div><p className="font-medium">Kiểm tra chênh lệch</p><p className="text-sm text-slate-500">Hệ thống tự tính: Xanh = khớp, Đỏ = thiếu, Xanh dương = thừa</p></div></div>
                                <div className="flex gap-3"><span className="text-2xl">3️⃣</span><div><p className="font-medium">Thêm ghi chú</p><p className="text-sm text-slate-500">Ghi chú bổ sung cho sản phẩm nếu cần</p></div></div>
                                <div className="flex gap-3"><span className="text-2xl">4️⃣</span><div><p className="font-medium">Gửi duyệt</p><p className="text-sm text-slate-500">Manager sẽ xem xét và duyệt phiếu của bạn</p></div></div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Product History Modal */}
                {selectedProduct && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
                            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                                <h3 className="font-semibold text-slate-800">📜 Lịch sử nhập/xuất</h3>
                                <button onClick={() => setSelectedProduct(null)} className="text-slate-400 hover:text-slate-600">✕</button>
                            </div>
                            <div className="p-6 max-h-[400px] overflow-y-auto">
                                {historyLoading ? (
                                    <div className="flex justify-center py-8"><RefreshCw size={24} className="animate-spin text-[#009099]" /></div>
                                ) : productHistory.length === 0 ? (
                                    <p className="text-center text-slate-500 py-8">Chưa có lịch sử giao dịch</p>
                                ) : (
                                    <div className="space-y-3">
                                        {productHistory.map((t) => (
                                            <div key={t.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${t.type === "IMPORT" ? "bg-green-100" : "bg-red-100"}`}>
                                                    {t.type === "IMPORT" ? <TrendingUp size={16} className="text-green-600" /> : <AlertTriangle size={16} className="text-red-600" />}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-slate-800">{t.title}</p>
                                                    <p className="text-xs text-slate-500">{t.date ? formatDate(t.date) : "-"}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`font-bold ${t.quantity_change > 0 ? "text-green-600" : "text-red-600"}`}>{t.quantity_change > 0 ? "+" : ""}{t.quantity_change}</p>
                                                    <p className="text-xs text-slate-500">{t.before} → {t.after}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // List View (default)
    return (
        <div className="space-y-6">
            {notification && (
                <div className={`rounded-xl p-4 flex items-center gap-3 ${notification.type === "error" ? "bg-red-50 border border-red-200" : "bg-green-50 border border-green-200"}`}>
                    {notification.type === "success" ? <CheckCircle size={20} className="text-green-500" /> : <AlertTriangle size={20} className="text-red-500" />}
                    <span className={notification.type === "error" ? "text-red-700" : "text-green-700"}>{notification.message}</span>
                    <button onClick={() => setNotification(null)} className="ml-auto text-slate-400 hover:text-slate-600">✕</button>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">📋 Kiểm kê tồn kho</h1>
                    <p className="text-slate-500 mt-1">Đối chiếu số lượng thực tế với hệ thống</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={goToStats} className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50">
                        <BarChart3 size={18} /> Thống kê
                    </button>
                    <button onClick={createNewCheck} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-[#009099] text-white rounded-xl font-medium hover:bg-[#007a82] disabled:opacity-50">
                        {saving ? <RefreshCw size={18} className="animate-spin" /> : <Plus size={18} />}
                        Tạo phiếu mới
                    </button>
                </div>
            </div>

            {/* Quick guide for new users */}
            {checks.length === 0 && (
                <div className="bg-gradient-to-r from-[#009099]/10 to-[#00b8c4]/10 border border-[#009099]/20 rounded-2xl p-6">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#009099] flex items-center justify-center text-white flex-shrink-0">
                            <Lightbulb size={24} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-800 mb-2">👋 Chào mừng đến với Kiểm kê tồn kho!</h3>
                            <p className="text-slate-600 text-sm mb-3">Kiểm kê giúp bạn đối chiếu số lượng hàng thực tế trong kho với số liệu trên hệ thống.</p>
                            <div className="flex flex-wrap gap-4 text-sm">
                                <div className="flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-[#009099] text-white flex items-center justify-center text-xs">1</span> Tạo phiếu mới</div>
                                <div className="flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-[#009099] text-white flex items-center justify-center text-xs">2</span> Đếm & nhập số lượng</div>
                                <div className="flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-[#009099] text-white flex items-center justify-center text-xs">3</span> Gửi Manager duyệt</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Cards */}
            {stats && checks.length > 0 && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center"><FileText size={20} className="text-slate-500" /></div>
                            <div><p className="text-xs text-slate-500">Phiếu nháp</p><p className="text-xl font-bold text-slate-800">{stats.draftChecks}</p></div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center"><Clock size={20} className="text-blue-500" /></div>
                            <div><p className="text-xs text-slate-500">Chờ duyệt</p><p className="text-xl font-bold text-slate-800">{stats.submittedChecks}</p></div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center"><CheckCircle size={20} className="text-green-500" /></div>
                            <div><p className="text-xs text-slate-500">Đã duyệt</p><p className="text-xl font-bold text-slate-800">{stats.approvedChecks}</p></div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-[#009099] to-[#00b8c4] rounded-2xl shadow-sm p-5 text-white">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center"><TrendingUp size={20} /></div>
                            <div><p className="text-xs text-white/80">Độ chính xác</p><p className="text-xl font-bold">{stats.avgAccuracy}%</p></div>
                        </div>
                    </div>
                </div>
            )}

            {/* Checks List */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                    <h3 className="font-semibold text-slate-800">📄 Danh sách phiếu kiểm kê</h3>
                    {checks.length > 0 && <span className="text-sm text-slate-500">{checks.length} phiếu</span>}
                </div>

                {checks.length === 0 ? (
                    <div className="text-center py-12">
                        <Package size={48} className="mx-auto text-slate-300 mb-4" />
                        <p className="text-slate-500">Chưa có phiếu kiểm kê nào</p>
                        <p className="text-sm text-slate-400 mt-1">Bấm "Tạo phiếu mới" để bắt đầu kiểm kê</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {checks.map((check) => (
                            <div key={check.id} className="px-6 py-4 hover:bg-slate-50 transition-colors group">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 cursor-pointer flex-1" onClick={() => goToEdit(check.id)}>
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                            check.status === "approved" ? "bg-green-100" : check.status === "submitted" ? "bg-blue-100" : check.status === "rejected" ? "bg-red-100" : "bg-slate-100"
                                        }`}>
                                            <FileText size={24} className={
                                                check.status === "approved" ? "text-green-600" : check.status === "submitted" ? "text-blue-600" : check.status === "rejected" ? "text-red-600" : "text-slate-500"
                                            } />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-semibold text-slate-800">{check.title}</p>
                                                {getStatusBadge(check.status)}
                                            </div>
                                            <p className="text-sm text-slate-500">Mã: {check.code} • {formatDate(check.created_at)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right hidden sm:block">
                                            <p className="text-sm text-slate-500">Tiến độ</p>
                                            <p className="font-medium text-slate-800">{check.checked_products}/{check.total_products}</p>
                                        </div>
                                        <div className="text-right hidden sm:block">
                                            <p className="text-sm text-slate-500">Kết quả</p>
                                            <div className="flex items-center gap-2">
                                                <span className="text-green-600 text-sm">{check.matched}✓</span>
                                                <span className="text-blue-600 text-sm">{check.over}↑</span>
                                                <span className="text-red-600 text-sm">{check.under}↓</span>
                                            </div>
                                        </div>
                                        {check.status === "draft" && (
                                            <button onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(check.id); }}
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all" title="Xóa phiếu">
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                        <ChevronRight size={20} className="text-slate-400 cursor-pointer" onClick={() => goToEdit(check.id)} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                                <Trash2 size={32} className="text-red-500" />
                            </div>
                            <h3 className="font-semibold text-slate-800 text-lg mb-2">Xóa phiếu kiểm kê?</h3>
                            <p className="text-slate-500 text-sm mb-6">Hành động này không thể hoàn tác. Phiếu sẽ bị xóa vĩnh viễn.</p>
                            <div className="flex gap-3">
                                <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50">
                                    Hủy
                                </button>
                                <button onClick={() => deleteCheck(showDeleteConfirm)} className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600">
                                    Xóa
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
