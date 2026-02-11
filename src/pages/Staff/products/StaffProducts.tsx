import { useState, useEffect } from "react";
import { Search, Package, Filter, Eye } from "lucide-react";

interface Product {
    id: string;
    name: string;
    category: string;
    price: number;
    stock: number;
    unit: string;
    status: "in_stock" | "low_stock" | "out_of_stock";
}

export default function StaffProducts() {
    const [products, setProducts] = useState<Product[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState("all");
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await fetch("http://localhost:3001/api/products");
            const json = await res.json();
            if (json.success && Array.isArray(json.data)) {
                // Map data với status dựa trên stock
                const mappedProducts = json.data.map((p: any) => {
                    // Xử lý category - có thể là object hoặc string
                    let categoryName = "Chưa phân loại";
                    if (p.category) {
                        if (typeof p.category === 'object' && p.category.name) {
                            categoryName = p.category.name;
                        } else if (typeof p.category === 'string') {
                            categoryName = p.category;
                        }
                    } else if (p.categoryName) {
                        categoryName = p.categoryName;
                    }

                    const stock = p.stock ?? p.quantity ?? 0;

                    return {
                        id: p.id || p.productId || Math.random().toString(),
                        name: p.name || p.productName || "Không có tên",
                        category: categoryName,
                        price: p.price || p.sellingPrice || 0,
                        stock: stock,
                        unit: p.unit || "cái",
                        status: stock === 0 ? "out_of_stock" : stock < 10 ? "low_stock" : "in_stock"
                    };
                });
                setProducts(mappedProducts);
            } else {
                setProducts([]);
            }
        } catch (error) {
            console.error("Error fetching products:", error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = products.filter(product => {
        const matchSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchCategory = filterCategory === "all" || product.category === filterCategory;
        return matchSearch && matchCategory;
    });

    const categories = [...new Set(products.map(p => p.category).filter(c => typeof c === 'string' && c !== ''))];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "in_stock":
                return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">Còn hàng</span>;
            case "low_stock":
                return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">Sắp hết</span>;
            case "out_of_stock":
                return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">Hết hàng</span>;
            default:
                return null;
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Tra cứu sản phẩm</h1>
                    <p className="text-slate-500 mt-1">Xem thông tin sản phẩm, giá và tồn kho</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-[#009099]/10 rounded-xl">
                    <Package size={20} className="text-[#009099]" />
                    <span className="font-semibold text-[#009099]">{products.length} sản phẩm</span>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm sản phẩm..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#009099]/20 focus:border-[#009099] transition-all"
                        />
                    </div>
                    {/* Filter */}
                    <div className="relative">
                        <Filter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="pl-10 pr-8 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#009099]/20 focus:border-[#009099] transition-all appearance-none bg-white min-w-[180px]"
                        >
                            <option value="all">Tất cả danh mục</option>
                            {categories.map((cat, idx) => (
                                <option key={idx} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#009099]"></div>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-12">
                        <Package size={48} className="mx-auto text-slate-300 mb-4" />
                        <p className="text-slate-500">Không tìm thấy sản phẩm nào</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Sản phẩm</th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Danh mục</th>
                                    <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Giá bán</th>
                                    <th className="text-center px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tồn kho</th>
                                    <th className="text-center px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                                    <th className="text-center px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Chi tiết</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredProducts.map((product) => (
                                    <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-[#009099]/10 flex items-center justify-center">
                                                    <Package size={20} className="text-[#009099]" />
                                                </div>
                                                <span className="font-medium text-slate-800">{product.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">{product.category}</td>
                                        <td className="px-6 py-4 text-right font-semibold text-slate-800">{formatCurrency(product.price)}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="font-medium text-slate-800">{product.stock}</span>
                                            <span className="text-slate-400 ml-1">{product.unit || 'cái'}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">{getStatusBadge(product.status)}</td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => setSelectedProduct(product)}
                                                className="p-2 hover:bg-[#009099]/10 rounded-lg transition-colors group"
                                            >
                                                <Eye size={18} className="text-slate-400 group-hover:text-[#009099]" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Product Detail Modal */}
            {selectedProduct && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedProduct(null)}>
                    <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 rounded-xl bg-[#009099]/10 flex items-center justify-center">
                                <Package size={32} className="text-[#009099]" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">{selectedProduct.name}</h3>
                                <p className="text-slate-500">{selectedProduct.category}</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between py-3 border-b border-slate-100">
                                <span className="text-slate-500">Giá bán</span>
                                <span className="font-semibold text-slate-800">{formatCurrency(selectedProduct.price)}</span>
                            </div>
                            <div className="flex justify-between py-3 border-b border-slate-100">
                                <span className="text-slate-500">Tồn kho</span>
                                <span className="font-semibold text-slate-800">{selectedProduct.stock} {selectedProduct.unit || 'cái'}</span>
                            </div>
                            <div className="flex justify-between py-3">
                                <span className="text-slate-500">Trạng thái</span>
                                {getStatusBadge(selectedProduct.status)}
                            </div>
                        </div>
                        <button
                            onClick={() => setSelectedProduct(null)}
                            className="w-full mt-6 py-3 bg-[#009099] text-white rounded-xl font-semibold hover:bg-[#007a82] transition-colors"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
