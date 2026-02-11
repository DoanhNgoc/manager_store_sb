import { useState, useEffect } from "react";
import { Package, ArrowUpFromLine, Search, Plus, Minus, CheckCircle, AlertTriangle, Calendar, FileText, Tag } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

interface Product {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    price: number;
}

interface ExportItem {
    product_id: string;
    product_name: string;
    quantity: number;
    available_quantity: number;
    unit: string;
}

type ExportType = "SALE" | "INTERNAL" | "DAMAGED";

const EXPORT_TYPES = {
    SALE: { label: "Bán hàng", color: "blue", icon: "💰" },
    INTERNAL: { label: "Nội bộ", color: "purple", icon: "🔄" },
    DAMAGED: { label: "Hủy hàng", color: "red", icon: "🗑️" }
};

export default function StaffExport() {
    const authContext = useAuth();
    const userId = authContext?.uidAuth;
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);
    const [error, setError] = useState("");

    // Form fields
    const [exportType, setExportType] = useState<ExportType>("SALE");
    const [exportDate, setExportDate] = useState(new Date().toISOString().split('T')[0]);
    const [note, setNote] = useState("");
    const [selectedItems, setSelectedItems] = useState<ExportItem[]>([]);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await fetch("http://localhost:3001/api/products");
            const json = await res.json();
            if (json.success && Array.isArray(json.data)) {
                setProducts(json.data.map((p: any) => ({
                    id: p.id,
                    name: p.name || "Không có tên",
                    quantity: p.quantity || 0,
                    unit: p.unit || "cái",
                    price: p.price || 0
                })));
            }
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) && p.quantity > 0
    );

    const addItem = (product: Product) => {
        const existing = selectedItems.find(i => i.product_id === product.id);
        if (existing) return;

        if (product.quantity <= 0) {
            setError(`Sản phẩm "${product.name}" đã hết hàng`);
            setTimeout(() => setError(""), 3000);
            return;
        }

        setSelectedItems([...selectedItems, {
            product_id: product.id,
            product_name: product.name,
            quantity: 1,
            available_quantity: product.quantity,
            unit: product.unit
        }]);
    };

    const removeItem = (productId: string) => {
        setSelectedItems(selectedItems.filter(i => i.product_id !== productId));
    };

    const updateQuantity = (productId: string, quantity: number) => {
        setSelectedItems(selectedItems.map(item => {
            if (item.product_id === productId) {
                // Không cho xuất quá số lượng tồn
                const validQuantity = Math.min(Math.max(1, quantity), item.available_quantity);
                return { ...item, quantity: validQuantity };
            }
            return item;
        }));
    };

    const getTotalQuantity = () => {
        return selectedItems.reduce((acc, item) => acc + item.quantity, 0);
    };

    const hasInvalidItems = () => {
        return selectedItems.some(item => item.quantity > item.available_quantity);
    };

    const handleSubmit = async () => {
        if (!userId || selectedItems.length === 0) {
            alert("Vui lòng chọn ít nhất 1 sản phẩm");
            return;
        }

        // Kiểm tra số lượng xuất
        const invalidItem = selectedItems.find(item => item.quantity > item.available_quantity);
        if (invalidItem) {
            setError(`Số lượng xuất "${invalidItem.product_name}" vượt quá tồn kho (${invalidItem.available_quantity})`);
            return;
        }

        setSubmitting(true);
        try {
            const typeLabel = EXPORT_TYPES[exportType].label;
            const res = await fetch("http://localhost:3001/api/warehouse-transactions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: `Xuất kho - ${typeLabel}`,
                    type: "EXPORT",
                    note: note || `Loại xuất: ${typeLabel}. Ngày xuất: ${exportDate}`,
                    created_by: userId,
                    items: selectedItems.map(item => ({
                        product_id: item.product_id,
                        quantity_change: -item.quantity // Số âm = xuất kho
                    }))
                })
            });
            const json = await res.json();
            if (json.success) {
                setShowSuccess(true);
                // Reset form
                setNote("");
                setSelectedItems([]);
                setExportDate(new Date().toISOString().split('T')[0]);
                fetchProducts();
                setTimeout(() => setShowSuccess(false), 3000);
            } else {
                alert(json.message || "Có lỗi xảy ra");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Có lỗi xảy ra khi tạo phiếu xuất kho");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                    <ArrowUpFromLine size={24} className="text-red-600" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Tạo phiếu xuất kho</h1>
                    <p className="text-slate-500">Ghi nhận hàng xuất ra khỏi kho</p>
                </div>
            </div>

            {/* Success Message */}
            {showSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                    <CheckCircle className="text-green-500" size={20} />
                    <span className="text-green-700 font-medium">Tạo phiếu xuất kho thành công! Số lượng tồn kho đã được cập nhật.</span>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                    <AlertTriangle className="text-red-500" size={20} />
                    <span className="text-red-700 font-medium">{error}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Export Info */}
                <div className="lg:col-span-1 space-y-4">
                    {/* Export Type */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                        <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <Tag size={18} className="text-slate-500" />
                            Loại xuất kho
                        </h3>
                        <div className="space-y-2">
                            {(Object.keys(EXPORT_TYPES) as ExportType[]).map(type => (
                                <button
                                    key={type}
                                    onClick={() => setExportType(type)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${
                                        exportType === type
                                            ? 'border-red-500 bg-red-50'
                                            : 'border-slate-200 hover:border-slate-300'
                                    }`}
                                >
                                    <span className="text-xl">{EXPORT_TYPES[type].icon}</span>
                                    <span className={`font-medium ${exportType === type ? 'text-red-700' : 'text-slate-700'}`}>
                                        {EXPORT_TYPES[type].label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Date & Note */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                                    <Calendar size={14} />
                                    Ngày xuất
                                </label>
                                <input
                                    type="date"
                                    value={exportDate}
                                    onChange={(e) => setExportDate(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                                    <FileText size={14} />
                                    Ghi chú
                                </label>
                                <textarea
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="VD: Xuất cho đơn hàng #123..."
                                    rows={3}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="bg-red-50 rounded-2xl border border-red-200 p-5">
                        <h3 className="font-semibold text-red-800 mb-3">Tổng kết phiếu xuất</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-red-700">Loại xuất:</span>
                                <span className="font-semibold text-red-800">{EXPORT_TYPES[exportType].label}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-red-700">Số loại sản phẩm:</span>
                                <span className="font-semibold text-red-800">{selectedItems.length}</span>
                            </div>
                            <div className="flex justify-between text-sm pt-2 border-t border-red-200">
                                <span className="text-red-700">Tổng số lượng xuất:</span>
                                <span className="font-bold text-red-800">{getTotalQuantity()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || selectedItems.length === 0 || hasInvalidItems()}
                        className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                            <>
                                <CheckCircle size={18} />
                                Xác nhận xuất kho
                            </>
                        )}
                    </button>
                </div>

                {/* Middle: Product Selection */}
                <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-200">
                        <h3 className="font-semibold text-slate-800">Chọn sản phẩm</h3>
                        <p className="text-xs text-slate-500 mt-1">Chỉ hiển thị sản phẩm còn hàng</p>
                    </div>

                    {/* Search */}
                    <div className="p-4 border-b border-slate-100">
                        <div className="relative">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Tìm sản phẩm..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                            />
                        </div>
                    </div>

                    {/* Product List */}
                    <div className="max-h-[450px] overflow-y-auto">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="text-center py-12 text-slate-500">
                                <Package size={40} className="mx-auto text-slate-300 mb-3" />
                                <p>Không có sản phẩm còn hàng</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {filteredProducts.map(product => {
                                    const isSelected = selectedItems.some(i => i.product_id === product.id);
                                    const isLowStock = product.quantity <= 10;
                                    return (
                                        <div
                                            key={product.id}
                                            className={`px-5 py-3 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors ${isSelected ? 'bg-red-50' : ''}`}
                                            onClick={() => !isSelected && addItem(product)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isSelected ? 'bg-red-100' : 'bg-slate-100'}`}>
                                                    <Package size={18} className={isSelected ? 'text-red-600' : 'text-slate-500'} />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-800">{product.name}</p>
                                                    <p className={`text-xs ${isLowStock ? 'text-yellow-600' : 'text-slate-500'}`}>
                                                        Tồn: {product.quantity} {product.unit}
                                                        {isLowStock && " ⚠️"}
                                                    </p>
                                                </div>
                                            </div>
                                            {isSelected ? (
                                                <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-1 rounded-full">Đã chọn</span>
                                            ) : (
                                                <Plus size={18} className="text-slate-400" />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Selected Items */}
                <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-200">
                        <h3 className="font-semibold text-slate-800">
                            Sản phẩm xuất ({selectedItems.length})
                        </h3>
                    </div>

                    {selectedItems.length === 0 ? (
                        <div className="text-center py-12">
                            <Package size={40} className="mx-auto text-slate-300 mb-3" />
                            <p className="text-slate-500">Chưa chọn sản phẩm nào</p>
                            <p className="text-sm text-slate-400">Click vào sản phẩm bên trái để thêm</p>
                        </div>
                    ) : (
                        <div className="max-h-[500px] overflow-y-auto divide-y divide-slate-100">
                            {selectedItems.map(item => {
                                const isOverLimit = item.quantity > item.available_quantity;
                                return (
                                    <div key={item.product_id} className={`p-4 ${isOverLimit ? 'bg-red-50' : ''}`}>
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <p className="font-medium text-slate-800">{item.product_name}</p>
                                                <p className="text-xs text-slate-500">Tồn kho: {item.available_quantity} {item.unit}</p>
                                            </div>
                                            <button
                                                onClick={() => removeItem(item.product_id)}
                                                className="p-1 text-red-500 hover:bg-red-50 rounded-lg"
                                            >
                                                <Minus size={16} />
                                            </button>
                                        </div>
                                        <div>
                                            <label className="block text-xs text-slate-500 mb-1">Số lượng xuất</label>
                                            <input
                                                type="number"
                                                min="1"
                                                max={item.available_quantity}
                                                value={item.quantity}
                                                onChange={(e) => updateQuantity(item.product_id, parseInt(e.target.value) || 1)}
                                                className={`w-full px-3 py-2 border rounded-lg text-center focus:outline-none focus:ring-2 ${
                                                    isOverLimit 
                                                        ? 'border-red-500 focus:ring-red-500/20' 
                                                        : 'border-slate-200 focus:ring-red-500/20'
                                                }`}
                                            />
                                            {isOverLimit && (
                                                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                                    <AlertTriangle size={12} />
                                                    Vượt quá số lượng tồn kho!
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
