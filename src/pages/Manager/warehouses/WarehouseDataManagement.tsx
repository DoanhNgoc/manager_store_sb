import { Edit3, Filter, Loader2, Plus, Trash2 } from "lucide-react";
import { useCategories } from "../../../hooks/useCategories";
import { useEffect, useState } from "react";
import ErrorState from "../../../components/ErrorAndLoading/ErrorState";
import { useProducts } from "../../../hooks/userProducts";
import ProductBylistProducts from "../../../components/List/ProductByCategory";
import AddProductModal from "../../../components/Modal/product_and_categories/AddProductModal";

function WarehouseDataManagement() {

    const [selectedMgmtCat, setSelectedMgmtCat] = useState<any | null>(null)
    const [selectedProducts, setSelectProducts] = useState<any | null>(null)
    const [showProductModal, setShowProductModal] = useState<boolean>(false)
    const { categories, error } = useCategories()
    const { products, loadingProducts, fetchProducts, createProduct, updateProduct, deleteProduct } = useProducts()
    useEffect(() => {
        if (!products) return;

        if (selectedMgmtCat === null) {

            setSelectProducts(products);
        } else {
            const filtered = products.filter((p: any) => p?.category?.id === selectedMgmtCat.id);


            setSelectProducts(filtered);
        }
    }, [products, selectedMgmtCat]);

    return <>
        <div className="h-full flex flex-col animate-in slide-in-from-right-4 duration-300">
            <div className="px-6 md:px-10 py-6 border-b border-slate-100 bg-white flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-black text-slate-800">Quản lý kho số lượng lớn</h2>
                </div>
                <div className="flex gap-2">
                    {/* add category */}
                    <button
                        //   onClick={() => {setEditingCategory(null); setShowCategoryModal(true);}} 
                        className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-50"><Plus size={16} /> Danh mục</button>
                    {/* add product */}
                    <button
                        onClick={() => { setShowProductModal(true); }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-blue-700 shadow-md shadow-blue-100"><Plus size={16} /> Sản phẩm</button>
                </div>
            </div>
            {loadingProducts ? <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50/50 backdrop-blur-[1px] z-10 rounded-xl">
                <div className="relative">
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                    <div className="absolute inset-0 w-12 h-12 border-4 border-blue-500/20 rounded-full"></div>
                </div>
                <p className="mt-4 text-slate-500 font-medium animate-pulse">Đang lọc kết quả...</p>
            </div> :
                <div className="flex flex-1 flex-col md:flex-row overflow-hidden">

                    <div className="w-full md:w-72 border-b md:border-b-0 md:border-r border-slate-100 bg-slate-50/30 overflow-y-auto p-4 space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase px-2 mb-4 tracking-widest flex items-center gap-2">
                            <Filter size={12} /> Phân loại mặt hàng
                        </p>

                        {/* filter all products */}
                        <button
                            onClick={() => setSelectedMgmtCat(null)}
                            className={`w-full text-left p-4 rounded-2xl flex items-center justify-between transition-all ${selectedMgmtCat === null ? 'bg-white shadow-md border-l-4 border-blue-600' : 'hover:bg-white/50 text-slate-500'}`}
                        >
                            <span className="font-bold text-sm">Tất cả sản phẩm</span>
                            <span className="text-[10px] font-black bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">{products.length}</span>
                        </button>

                        {categories.map((cat: any) => {
                            // const count = products.filter(p => p.categoryId === cat.id).length;
                            return (
                                <div key={cat.id} className="relative group">
                                    <button
                                        onClick={() => {
                                            setSelectedMgmtCat(cat)
                                        }}
                                        className={`w-full text-left p-4 rounded-2xl flex items-center justify-between transition-all ${selectedMgmtCat?.id === cat.id ? 'bg-white shadow-md border-l-4 border-blue-600' : 'hover:bg-white/50 text-slate-500'}`}>
                                        <span className="font-bold text-sm truncate pr-2">{cat.name}</span>
                                        {/* <span className="text-[10px] font-black bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full">{count}</span> */}
                                    </button>
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white pl-2">
                                        <button
                                            //   onClick={() => {setEditingCategory(cat); setShowCategoryModal(true);}} 
                                            className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit3 size={14} /></button>
                                        <button
                                            //   onClick={() => requestDeleteCategory(cat)} 
                                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex-1 bg-white overflow-y-auto">
                        {error && <div className="m-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold border border-red-100"><ErrorState message={error} /></div>}

                        {/* list product */}
                        <ProductBylistProducts
                            nameCategory={selectedMgmtCat === null ? null : selectedMgmtCat?.name}
                            listProducts={selectedProducts}
                            categories={categories}
                            fetchProducts={fetchProducts}
                            updateProduct={updateProduct}
                            deleteProduct={deleteProduct}
                        />

                    </div>
                </div>}
            {

                showProductModal && <AddProductModal categories={categories} setShowProductModal={setShowProductModal} fetchProducts={fetchProducts} createProduct={createProduct} />
            }
        </div></>
}
export default WarehouseDataManagement