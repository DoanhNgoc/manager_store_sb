import { useEffect, useState } from "react";

/* ===== TYPES ===== */

export type Category = {
    id: string;
    code: string;
    name: string;
    created_at?: any;
};

export type CreateCategoryPayload = {
    code: string;
    name: string;
};

export type UpdateCategoryPayload = {
    code?: string;
    name?: string;
};

interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
}

/* ===== HOOK ===== */

export function useCategories() {
    const [categories, setCategories] = useState<Category[]>([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState<string | null>(null);

    /* ===== GET ALL ===== */
    const fetchCategories = async () => {
        try {
            setLoading(true);
            setError(null);

            const res = await fetch("http://localhost:3001/api/categories");
            const data: ApiResponse<Category[]> = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data.message ?? "Fetch categories failed");
            }

            setCategories(data.data ?? []);
        } catch (err) {
            console.error(err);
            setError("Không tải được danh sách category");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    /* ===== CREATE ===== */
    const createCategory = async (payload: CreateCategoryPayload) => {
        const res = await fetch("http://localhost:3001/api/categories", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        const data: ApiResponse = await res.json();

        if (!res.ok || !data.success) {
            throw new Error(data.message ?? "Create category failed");
        }

        fetchCategories();
    };

    /* ===== UPDATE ===== */
    const updateCategory = async (
        id: string,
        payload: UpdateCategoryPayload
    ) => {
        const res = await fetch(
            `http://localhost:3001/api/categories/${id}`,
            {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            }
        );

        const data: ApiResponse = await res.json();

        if (!res.ok || !data.success) {
            throw new Error(data.message ?? "Update category failed");
        }

        fetchCategories();
    };

    /* ===== DELETE ===== */
    const deleteCategory = async (id: string) => {
        if (!confirm("Xoá category này?")) return;

        const res = await fetch(
            `http://localhost:3001/api/categories/${id}`,
            { method: "DELETE" }
        );

        const data: ApiResponse = await res.json();

        if (!res.ok || !data.success) {
            throw new Error(data.message ?? "Delete category failed");
        }

        fetchCategories();
    };


    return {
        categories,
        loading,
        error,
        createCategory,
        updateCategory,
        deleteCategory,
        reload: fetchCategories,
    };
}
