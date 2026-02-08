import { useEffect, useState } from "react";

/* ===== TYPES ===== */

export type Product = {
    id: string;
    id_product: string;
    name: string;
    quantity: number;
    variant: string;
    alert_threshold: number;
    category: {
        id: string;
        name: string;
        code?: string;
    } | null;
    status: {
        id: string;
        name: string;
    } | null;
    created_at?: any;
};

export type CreateProductPayload = {
    name: string;
    quantity: number;
    variant: string;
    alert_threshold: number;
    category_id: string;
    status_id: string;
};

export type UpdateProductPayload = Partial<CreateProductPayload>;

interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
}

/* ===== HOOK ===== */

export function useProducts() {
    const [products, setProducts] = useState<Product[]>([]);

    const [loading, setLoading] = useState(true);
    const [loadingProducts, setLoadingProducts] = useState(false);

    const [error, setError] = useState<string | null>(null);
    const [errorProducts, setErrorProducts] = useState<string | null>(null);


    /* ===== GET ALL ===== */
    const fetchProducts = async () => {
        try {
            setLoadingProducts(true);
            const res = await fetch("http://localhost:3001/api/products");
            const data: ApiResponse<Product[]> = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data.message ?? "Fetch products failed");
            }

            setProducts(data.data ?? []);
        } catch (err) {
            console.error(err);
            setError("Không tải được danh sách sản phẩm");
        } finally {
            setLoadingProducts(false)
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    /* ===== CREATE ===== */
    const createProduct = async (payload: CreateProductPayload) => {
        const res = await fetch("http://localhost:3001/api/products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        const data: ApiResponse = await res.json();

        if (!res.ok || !data.success) {
            throw new Error(data.message ?? "Create product failed");
        }

        fetchProducts();
    };

    /* ===== UPDATE ===== */
    const updateProduct = async (id: string, payload: UpdateProductPayload) => {
        const res = await fetch(`http://localhost:3001/api/products/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        const data: ApiResponse = await res.json();

        if (!res.ok || !data.success) {
            throw new Error(data.message ?? "Update product failed");
        }

        fetchProducts();
    };

    /* ===== DELETE ===== */
    const deleteProduct = async (id: string) => {
        if (!confirm("Xoá sản phẩm này?")) return;

        const res = await fetch(
            `http://localhost:3001/api/products/${id}`,
            { method: "DELETE" }
        );

        const data: ApiResponse = await res.json();

        if (!res.ok || !data.success) {
            throw new Error(data.message ?? "Delete product failed");
        }

        fetchProducts();
    };
    /* ===== GET PRODUCTS BY CATEGORY ===== */
    const productsByCategory = async (categoryId: string) => {
        try {
            setLoadingProducts(true);
            setErrorProducts(null);

            const res = await fetch(
                `http://localhost:3001/api/categories/${categoryId}/products`
            );

            const data: ApiResponse<Product[]> = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data.message ?? "Fetch products by category failed");
            }

            setProducts(data.data ?? []);
            return data.data ?? [];
        } catch (err) {
            console.error(err);
            setErrorProducts("Không tải được sản phẩm theo category");
            setProducts([]);
            return [];
        } finally {
            setLoadingProducts(false);
        }
    };
    return {
        products,
        loading,
        error,
        createProduct,
        updateProduct,
        deleteProduct,

        loadingProducts,
        errorProducts,
        productsByCategory,
        fetchProducts,
        reload: fetchProducts,
    };
}
