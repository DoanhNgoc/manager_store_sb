import { useState, useEffect } from "react";
import { Package, ArrowDownToLine, Search, Plus, Minus, CheckCircle, Truck, Calendar, FileText } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

interface Product {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    price: number;
}

interface ImportItem {
    product_id: string;
    product_name: string;
    quantity: number;
    import_price: number;
    unit: string;
}

export default function StaffImport() {
    const authContext = useAuth();
    const userId = authContext?.uidAuth;
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);

    // Form fields
    const [supplier, setSupplier] = useState("");
    const [importDate, setImportDate] = useState(new Date().toISOString().split('T')[0]);
    const [note, setNote] = useState("");
    const [selectedItems, setSelectedItems] = useState<ImportItem[]>([]);

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
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const addItem = (product: Product) => {
        const existing = selectedItems.find(i => i.product_id === product.id);
        if (existing) return;

        setSelectedItems([...selectedItems, {
            product_id: product.id,
            product_name: product.name,
            quantity: 1,
            import_price: product.price,
            unit: product.unit
        }]);
    };

    const removeItem = (productId: string) => {
        setSelectedItems(selectedItems.filter(i => i.product_id !== productId));
    };

    const updateItem = (productId: string, field: 'quantity' | 'import_price', value: number) => {
        setSelectedItems(selectedItems.map(item =>
            item.product_id === productId
                ? { ...item, [field]: value }
                : item
        ));
    };

    const getTotalAmount = () => {
        return selectedItems.reduce((acc, item) => acc + (item.quantity * item.import_price), 0);
    };

    const getTotalQuantity = () => {
        return selectedItems.reduce((acc, item) => acc + item.quantity, 0);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const handleSubmit = async () => {
        if (!userId || selectedItems.length === 0) {
            alert("Vui lòng chọn ít nhất 1 sản phẩm");
            return;
        }

        if (!supplier.trim()) {
            alert("Vui lòng nhập tên nhà cung cấp");
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch("http://localhost:3001/api/warehouse-transactions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: `Nhập hàng từ ${supplier}`,
                    type: "IMPORT",
                    note: note || `Ngày nhập: ${importDate}. Nhà cung cấp: ${supplier}`,
                    created_by: userId,
                    items: selectedItems.map(item => ({
                        product_id: item.product_id,
                        quantity_change: item.quantity // Số dương = nhập kho
                    }))
                })
            });
            const json = await res.json();
            if (json.success) {
                setShowSuccess(true);
                // Reset form
                setSupplier("");
                setNote("");
                setSelectedItems([]);
                setImportDate(new Date().toISOString().split('T')[0]);
                fetchProducts();
                setTimeout(() => setShowSuccess(false), 3000);
            } else {
                alert(json.message || "Có lỗi xảy ra");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Có lỗi xảy ra khi tạo phiếu nhập kho");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                    <ArrowDownToLine size={24} className="text-green-600" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Tạo phiếu nhập kho</h1>
                    <p className="text-slate-500">Ghi nhận hàng nhập từ nhà cung cấp</p>
                </div>
            </div>

            {/* Success Message */}
            {showSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                    <CheckCircle className="text-green-500" size={20} />
                    <span className="text-green-700 font-medium">Tạo phiếu nhập kho thành công! Số lượng tồn kho đã được cập nhật.</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Left: Import Info */}
                <div className="lg:col-span-1 space-y-4 order-2 lg:order-1">
                    {/* Supplier Info */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                        <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <Truck size={18} className="text-slate-500" />
                            Thông tin nhà cung cấp
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Nhà cung cấp <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={supplier}
                                    onChange={(e) => setSupplier(e.target.value)}
                                    placeholder="VD: Công ty ABC"
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                                    <Calendar size={14} />
                                    Ngày nhập
                                </label>
                                <input
                                    type="date"
                                    value={importDate}
                                    onChange={(e) => setImportDate(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
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
                                    placeholder="Ghi chú thêm..."
                                    rows={3}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="bg-green-50 rounded-2xl border border-green-200 p-5">
                        <h3 className="font-semibold text-green-800 mb-3">Tổng kết phiếu nhập</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-green-700">Số loại sản phẩm:</span>
                                <span className="font-semibold text-green-800">{selectedItems.length}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-green-700">Tổng số lượng:</span>
                                <span className="font-semibold text-green-800">{getTotalQuantity()}</span>
                            </div>
                            <div className="flex justify-between text-sm pt-2 border-t border-green-200">
                                <span className="text-green-700">Tổng giá trị:</span>
                                <span className="font-bold text-green-800">{formatCurrency(getTotalAmount())}</span>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || selectedItems.length === 0 || !supplier.trim()}
                        className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                            <>
                                <CheckCircle size={18} />
                                Xác nhận nhập kho
                            </>
                        )}
                    </button>
                </div>

                {/* Middle: Product Selection */}
                <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden order-1 lg:order-2">
                    <div className="px-5 py-4 border-b border-slate-200">
                        <h3 className="font-semibold text-slate-800">Chọn sản phẩm</h3>
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
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                            />
                        </div>
                    </div>

                    {/* Product List */}
                    <div className="max-h-[450px] overflow-y-auto">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="text-center py-12 text-slate-500">
                                Không tìm thấy sản phẩm
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {filteredProducts.map(product => {
                                    const isSelected = selectedItems.some(i => i.product_id === product.id);
                                    return (
                                        <div
                                            key={product.id}
                                            className={`px-5 py-3 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors ${isSelected ? 'bg-green-50' : ''}`}
                                            onClick={() => !isSelected && addItem(product)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isSelected ? 'bg-green-100' : 'bg-slate-100'}`}>
                                                    <Package size={18} className={isSelected ? 'text-green-600' : 'text-slate-500'} />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-800">{product.name}</p>
                                                    <p className="text-xs text-slate-500">Tồn: {product.quantity} {product.unit}</p>
                                                </div>
                                            </div>
                                            {isSelected ? (
                                                <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">Đã chọn</span>
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
                <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden order-3">
                    <div className="px-5 py-4 border-b border-slate-200">
                        <h3 className="font-semibold text-slate-800">
                            Sản phẩm nhập ({selectedItems.length})
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
                            {selectedItems.map(item => (
                                <div key={item.product_id} className="p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <p className="font-medium text-slate-800 flex-1">{item.product_name}</p>
                                        <button
                                            onClick={() => removeItem(item.product_id)}
                                            className="p-1 text-red-500 hover:bg-red-50 rounded-lg"
                                        >
                                            <Minus size={16} />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs text-slate-500 mb-1">Số lượng</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) => updateItem(item.product_id, 'quantity', parseInt(e.target.value) || 1)}
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-green-500/20"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-slate-500 mb-1">Giá nhập</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={item.import_price}
                                                onChange={(e) => updateItem(item.product_id, 'import_price', parseInt(e.target.value) || 0)}
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-green-500/20"
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-2 text-right text-sm">
                                        <span className="text-slate-500">Thành tiền: </span>
                                        <span className="font-semibold text-green-600">{formatCurrency(item.quantity * item.import_price)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
