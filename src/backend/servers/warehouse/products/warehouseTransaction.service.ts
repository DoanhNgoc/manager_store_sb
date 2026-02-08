import admin from "firebase-admin";
import { adminDb } from "../../../firebase/admin/firebaseAdmin";

export async function createWarehouseTransaction(data: {
    title: string;
    type: "IMPORT" | "EXPORT" | "ADJUST";
    note?: string;
    created_by: string; // userId
    items: {
        product_id: string; // docId of products
        quantity_change: number; // + nhập, - xuất
    }[];
}) {
    if (!data.title || !data.type || !data.created_by) {
        throw new Error("Missing required fields");
    }

    if (!data.items || data.items.length === 0) {
        throw new Error("Items is required");
    }

    const userRef = adminDb.doc(`users/${data.created_by}`);

    // status ref
    const fineStatusRef = adminDb.doc("status/fine");
    const lowStatusRef = adminDb.doc("status/low");
    const outStatusRef = adminDb.doc("status/out");

    const transactionRef = await adminDb.collection("warehouse_transactions").add({
        title: data.title,
        type: data.type,
        note: data.note ?? "",
        created_by: userRef,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    // xử lý từng item
    const batch = adminDb.batch();

    for (const item of data.items) {
        const productRef = adminDb.doc(`products/${item.product_id}`);
        const productSnap = await productRef.get();

        if (!productSnap.exists) {
            throw new Error(`Product not found: ${item.product_id}`);
        }

        const productData = productSnap.data() as any;

        const before_quantity = Number(productData.quantity ?? 0);
        const alert_threshold = Number(productData.alert_threshold ?? 0);

        const change = Number(item.quantity_change);
        const after_quantity = before_quantity + change;

        // status update logic
        let newStatusRef = fineStatusRef;

        if (after_quantity <= 0) {
            newStatusRef = outStatusRef;
        } else if (after_quantity <= alert_threshold) {
            newStatusRef = lowStatusRef;
        } else {
            newStatusRef = fineStatusRef;
        }

        // update product
        batch.update(productRef, {
            quantity: after_quantity,
            status_id: newStatusRef,
        });

        // add item vào subcollection items
        const itemRef = transactionRef.collection("items").doc();
        batch.set(itemRef, {
            id_product: productRef,
            before_quantity,
            after_quantity,
            quantity_change: change,
        });
    }

    await batch.commit();

    return {
        id: transactionRef.id,
        success: true,
    };
}
/* ================= GET ALL TRANSACTIONS ================= */
export async function getAllWarehouseTransactions() {
    const snap = await adminDb
        .collection("warehouse_transactions")
        .orderBy("created_at", "desc")
        .get();

    const transactions = await Promise.all(
        snap.docs.map(async (doc) => {
            const data = doc.data();

            // populate created_by
            let createdBy = null;
            if (data.created_by) {
                const userSnap = await data.created_by.get();
                if (userSnap.exists) {
                    createdBy = {
                        id: userSnap.id,
                        ...userSnap.data(),
                    };
                }
            }

            // get items
            const itemsSnap = await adminDb
                .collection("warehouse_transactions")
                .doc(doc.id)
                .collection("items")
                .get();

            const items = await Promise.all(
                itemsSnap.docs.map(async (itemDoc) => {
                    const itemData = itemDoc.data();

                    // populate product
                    let product = null;
                    if (itemData.id_product) {
                        const productSnap = await itemData.id_product.get();
                        if (productSnap.exists) {
                            product = {
                                id: productSnap.id,
                                ...productSnap.data(),
                            };
                        }
                    }

                    return {
                        id: itemDoc.id,
                        ...itemData,
                        product,
                    };
                })
            );

            return {
                id: doc.id,
                ...data,
                created_by: createdBy,
                items,
            };
        })
    );

    return transactions;
}
