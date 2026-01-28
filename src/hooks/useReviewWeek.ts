import { useEffect, useState } from "react";

/* ===== TYPES ===== */

export type ReviewWeek = {
    id: string;
    content: string;
    rating: number;
    start_week: string;
    end_week: string;
    user_create: string;
    user_review: string;
    created_at: string;
};

export type CreateReviewWeekPayload = {
    content: string;
    rating: number;
    start_week: string;   // yyyy-mm-dd
    end_week: string;     // yyyy-mm-dd
    user_create: string;  // users/{uid}
    user_review: string;  // users/{uid}
};

interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
}

/* ===== HOOK ===== */

export function useReviewWeek() {
    const [reviews, setReviews] = useState<ReviewWeek[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    /* ===== GET ALL ===== */
    const fetchReviewWeeks = async () => {
        try {
            setLoading(true);
            const res = await fetch("http://localhost:3001/api/review-week");

            const data: ApiResponse<ReviewWeek[]> = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data.message ?? "Fetch failed");
            }

            setReviews(data.data ?? []);
        } catch (err) {
            console.error(err);
            setError("Không tải được review week");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviewWeeks();
    }, []);

    /* ===== CREATE ===== */
    const createReviewWeek = async (payload: CreateReviewWeekPayload) => {
        const res = await fetch("http://localhost:3001/api/review-week", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        const data: ApiResponse = await res.json();

        if (!res.ok || !data.success) {
            throw new Error(data.message ?? "Create failed");
        }

        fetchReviewWeeks();
    };

    /* ===== DELETE ===== */
    const deleteReviewWeek = async (id: string) => {
        if (!confirm("Xoá review tuần này?")) return;

        const res = await fetch(
            `http://localhost:3001/api/review-week/${id}`,
            { method: "DELETE" }
        );

        const data: ApiResponse = await res.json();

        if (!res.ok || !data.success) {
            throw new Error(data.message ?? "Delete failed");
        }

        fetchReviewWeeks();
    };

    return {
        reviews,
        loading,
        error,
        createReviewWeek,
        deleteReviewWeek,
        reload: fetchReviewWeeks,
    };
}
