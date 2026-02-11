import { useEffect, useState } from "react";

/* ===== TYPES ===== */

export type WarehouseTransactionItem = {
    product_id: string; // id doc product
    before_quantity: number;
    after_quantity: number;
};

export type WarehouseTransaction = {
    id: string;
    type: "import" | "check"; // nhập kho | kiểm kho
    note?: string;
    created_at?: any;
    products: WarehouseTransactionItem[];

    // optional (nếu m có lưu user_id)
    user_id?: string;
};

export type CreateWarehouseTransactionPayload = {
    type: "import" | "check";
    note?: string;
    user_id?: string;
    products: WarehouseTransactionItem[];
};

interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
}

/* ===== HOOK ===== */

export function useWarehouseTransactions() {
    const [transactions, setTransactions] = useState<WarehouseTransaction[]>([]);

    const [loading, setLoading] = useState(true);
    const [loadingTransactions, setLoadingTransactions] = useState(false);
    const [loadingCreate, setLoadingCreate] = useState(false);

    const [error, setError] = useState<string | null>(null);
    const [errorTransactions, setErrorTransactions] = useState<string | null>(null);
    const [errorCreate, setErrorCreate] = useState<string | null>(null);

    /* ===== GET ALL ===== */
    const fetchTransactions = async () => {
        try {
            setLoadingTransactions(true);
            setErrorTransactions(null);

            const res = await fetch("http://localhost:3001/api/warehouse-transactions");
            const data: ApiResponse<WarehouseTransaction[]> = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data.message ?? "Fetch warehouse transactions failed");
            }

            setTransactions(data.data ?? []);
        } catch (err) {
            console.error(err);
            setErrorTransactions("Không tải được lịch sử kho");
        } finally {
            setLoadingTransactions(false);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    /* ===== CREATE ===== */
    const createWarehouseTransaction = async (
        payload: CreateWarehouseTransactionPayload
    ) => {
        try {
            setLoadingCreate(true);
            setErrorCreate(null);

            const res = await fetch("http://localhost:3001/api/warehouse-transactions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data: ApiResponse = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data.message ?? "Create warehouse transaction failed");
            }

            await fetchTransactions();
            return data.data;
        } catch (err: any) {
            console.error(err);
            setErrorCreate("Không tạo được lịch sử kho");
            throw err;
        } finally {
            setLoadingCreate(false);
        }
    };

    return {
        transactions,

        loading,
        error,

        loadingTransactions,
        errorTransactions,

        loadingCreate,
        errorCreate,

        fetchTransactions,
        reload: fetchTransactions,

        createWarehouseTransaction,
    };
}
