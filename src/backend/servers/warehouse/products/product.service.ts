import admin from "firebase-admin";
import { adminDb } from "../../../firebase/admin/firebaseAdmin";

/* ================= GET ALL ================= */
export async function getAllProducts() {
    const snap = await adminDb
        .collection("products")
        .orderBy("created_at", "desc")
        .get();

    const products = await Promise.all(
        snap.docs.map(async (doc) => {
            const data = doc.data();

            // populate category
            let category = null;
            if (data.category_id) {
                const cateSnap = await data.category_id.get();
                if (cateSnap.exists) {
                    category = {
                        id: cateSnap.id,
                        ...cateSnap.data()
                    };
                }
            }

            // populate status
            let status = null;
            if (data.status_id) {
                const statusSnap = await data.status_id.get();
                if (statusSnap.exists) {
                    status = {
                        id: statusSnap.id,
                        ...statusSnap.data()
                    };
                }
            }

            return {
                id: doc.id,
                ...data,
                category,
                status
            };
        })
    );

    return products;
}

/* ================= CREATE ================= */
export async function createProduct(data: {
    name: string;
    quantity: number;
    variant: string;
    alert_threshold: number;
    category_id: string;
    status_id: string;
}) {
    const cateRef = adminDb.doc(`categories/${data.category_id}`);
    const statusRef = adminDb.doc(`status/${data.status_id}`);

    const cateSnap = await cateRef.get();
    if (!cateSnap.exists) throw new Error("Category not found");

    const { code } = cateSnap.data() as { code: string };

    // 🔥 lấy product mới nhất, KHÔNG where
    const snap = await adminDb
        .collection("products")
        .orderBy("id_product", "desc")
        .limit(10)
        .get();

    const lastCode = snap.docs
        .map(d => d.data().id_product)
        .find((id: string) => id?.startsWith(code));

    const id_product = nextProductCode(code, lastCode);

    const ref = await adminDb.collection("products").add({
        id_product,
        name: data.name.trim(),
        quantity: Number(data.quantity),
        variant: data.variant,
        alert_threshold: Number(data.alert_threshold),
        category_id: cateRef,
        status_id: statusRef,
        created_at: admin.firestore.FieldValue.serverTimestamp()
    });

    return {
        id: ref.id,
        id_product
    };
}

/* ================= UPDATE ================= */
export async function updateProduct(id: string, data: {
    name?: string;
    quantity?: number;
    variant?: string;
    alert_threshold?: number;
    category_id?: string;
    status_id?: string;
}) {
    const payload: any = {};

    if (data.name !== undefined) payload.name = data.name.trim();
    if (data.quantity !== undefined) payload.quantity = Number(data.quantity);
    if (data.variant !== undefined) payload.variant = data.variant;
    if (data.alert_threshold !== undefined)
        payload.alert_threshold = Number(data.alert_threshold);

    if (data.category_id) {
        payload.category_id = adminDb.doc(`categories/${data.category_id}`);
    }

    if (data.status_id) {
        payload.status_id = adminDb.doc(`status/${data.status_id}`);
    }

    await adminDb.collection("products").doc(id).update(payload);
    return { success: true };
}

/* ================= DELETE ================= */
export async function deleteProduct(id: string) {
    await adminDb.collection("products").doc(id).delete();
    return { success: true };
}

/* ================= Utils ================= */
function nextProductCode(prefix: string, lastCode?: string) {
    if (!lastCode) return `${prefix}001`;
    const num = parseInt(lastCode.slice(prefix.length)) + 1;
    return `${prefix}${num.toString().padStart(3, "0")}`;
}
