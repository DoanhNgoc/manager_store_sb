import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, where, Timestamp, getDoc } from "firebase/firestore";
import { db } from "../../firebase/client/firebaseClient";

// Tạo phiếu kiểm kê mới
export async function createInventoryCheck(userId: string, title?: string) {
    const checkCode = `KK${Date.now().toString().slice(-8)}`;
    const productsRef = collection(db, "products");
    const productsSnap = await getDocs(productsRef);
    
    const items = productsSnap.docs.map(doc => {
        const data = doc.data();
        return {
            product_id: doc.id,
            product_name: data.name || "Không có tên",
            system_quantity: data.quantity || 0,
            actual_quantity: null,
            difference: 0,
            note: "",
            reason: "",
            checked: false
        };
    });

    const inventoryRef = collection(db, "inventory_checks");
    const docRef = await addDoc(inventoryRef, {
        code: checkCode,
        title: title || `Kiểm kê ${new Date().toLocaleDateString('vi-VN')}`,
        note: "",
        created_by: userId,
        created_at: Timestamp.now(),
        updated_at: Timestamp.now(),
        status: "draft",
        total_products: items.length,
        checked_products: 0,
        matched: 0,
        over: 0,
        under: 0,
        items
    });

    return { id: docRef.id, code: checkCode, items, status: "draft", note: "" };
}

// Lấy phiếu kiểm kê theo ID
export async function getInventoryCheckById(checkId: string) {
    const docRef = doc(db, "inventory_checks", checkId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    
    const data = docSnap.data();
    // Get user info
    let createdByUser = null;
    if (data.created_by) {
        const userRef = doc(db, "users", data.created_by);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            createdByUser = { id: userSnap.id, ...userSnap.data() };
        }
    }
    
    return { id: docSnap.id, ...data, created_by_user: createdByUser };
}

// Lấy danh sách phiếu kiểm kê của user
export async function getInventoryChecksByUser(userId: string) {
    const inventoryRef = collection(db, "inventory_checks");
    const q = query(inventoryRef, where("created_by", "==", userId));
    const snap = await getDocs(q);
    
    const checks = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
    
    return checks.sort((a: any, b: any) => {
        const aTime = a.created_at?._seconds || 0;
        const bTime = b.created_at?._seconds || 0;
        return bTime - aTime;
    });
}

// Xóa phiếu kiểm kê (chỉ cho phép xóa phiếu draft)
export async function deleteInventoryCheck(checkId: string, userId: string) {
    const docRef = doc(db, "inventory_checks", checkId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
        throw new Error("Phiếu kiểm kê không tồn tại");
    }
    
    const data = docSnap.data();
    
    if (data.created_by !== userId) {
        throw new Error("Bạn không có quyền xóa phiếu này");
    }
    
    if (data.status !== "draft") {
        throw new Error("Chỉ có thể xóa phiếu nháp");
    }
    
    await deleteDoc(docRef);
    return { success: true };
}

// Lấy tất cả phiếu kiểm kê (cho Manager)
export async function getAllInventoryChecks() {
    const inventoryRef = collection(db, "inventory_checks");
    const snap = await getDocs(inventoryRef);
    
    const checks = await Promise.all(snap.docs.map(async (docSnap) => {
        const data = docSnap.data();
        let createdByUser = null;
        if (data.created_by) {
            const userRef = doc(db, "users", data.created_by);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                createdByUser = { id: userSnap.id, name: userSnap.data().name };
            }
        }
        return { id: docSnap.id, ...data, created_by_user: createdByUser };
    }));
    
    return checks.sort((a: any, b: any) => {
        const aTime = a.created_at?._seconds || 0;
        const bTime = b.created_at?._seconds || 0;
        return bTime - aTime;
    });
}

// Cập nhật item trong phiếu kiểm kê
export async function updateInventoryItem(checkId: string, productId: string, data: {
    actual_quantity: number;
    note?: string;
    reason?: string;
}) {
    const docRef = doc(db, "inventory_checks", checkId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) throw new Error("Phiếu kiểm kê không tồn tại");
    
    const checkData = docSnap.data();
    if (checkData.status !== "draft") {
        throw new Error("Không thể chỉnh sửa phiếu đã gửi");
    }
    
    const items = checkData.items.map((item: any) => {
        if (item.product_id === productId) {
            const diff = data.actual_quantity - item.system_quantity;
            return {
                ...item,
                actual_quantity: data.actual_quantity,
                difference: diff,
                note: data.note || item.note,
                reason: data.reason || item.reason,
                checked: true
            };
        }
        return item;
    });
    
    // Recalculate stats
    const checkedItems = items.filter((i: any) => i.checked);
    const matched = checkedItems.filter((i: any) => i.difference === 0).length;
    const over = checkedItems.filter((i: any) => i.difference > 0).length;
    const under = checkedItems.filter((i: any) => i.difference < 0).length;
    
    await updateDoc(docRef, {
        items,
        checked_products: checkedItems.length,
        matched,
        over,
        under,
        updated_at: Timestamp.now()
    });
    
    return { success: true, checked_products: checkedItems.length };
}

// Lưu nháp phiếu kiểm kê
export async function saveDraft(checkId: string, items: any[], checkNote?: string) {
    const docRef = doc(db, "inventory_checks", checkId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) throw new Error("Phiếu kiểm kê không tồn tại");
    
    const checkData = docSnap.data();
    if (checkData.status !== "draft") {
        throw new Error("Không thể chỉnh sửa phiếu đã gửi");
    }
    
    const checkedItems = items.filter((i: any) => i.checked);
    const matched = checkedItems.filter((i: any) => i.difference === 0).length;
    const over = checkedItems.filter((i: any) => i.difference > 0).length;
    const under = checkedItems.filter((i: any) => i.difference < 0).length;
    
    const updateData: any = {
        items,
        checked_products: checkedItems.length,
        matched, over, under,
        updated_at: Timestamp.now()
    };
    
    if (checkNote !== undefined) {
        updateData.note = checkNote;
    }
    
    await updateDoc(docRef, updateData);
    
    return { success: true };
}

// Gửi phiếu kiểm kê cho Manager duyệt
export async function submitInventoryCheck(checkId: string) {
    const docRef = doc(db, "inventory_checks", checkId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) throw new Error("Phiếu kiểm kê không tồn tại");
    
    const checkData = docSnap.data();
    if (checkData.status !== "draft") {
        throw new Error("Phiếu đã được gửi trước đó");
    }
    
    // Validate: all items with difference must have reason
    const itemsWithDiff = checkData.items.filter((i: any) => i.checked && i.difference !== 0);
    const missingReason = itemsWithDiff.filter((i: any) => !i.reason);
    if (missingReason.length > 0) {
        throw new Error(`Còn ${missingReason.length} sản phẩm chênh lệch chưa có lý do`);
    }
    
    await updateDoc(docRef, {
        status: "submitted",
        submitted_at: Timestamp.now(),
        updated_at: Timestamp.now()
    });
    
    return { success: true };
}

// Manager duyệt phiếu kiểm kê
export async function approveInventoryCheck(checkId: string, managerId: string) {
    const docRef = doc(db, "inventory_checks", checkId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) throw new Error("Phiếu kiểm kê không tồn tại");
    
    const checkData = docSnap.data();
    if (checkData.status !== "submitted") {
        throw new Error("Phiếu chưa được gửi hoặc đã duyệt");
    }
    
    // Điều chỉnh tồn kho
    const itemsToAdjust = checkData.items.filter((i: any) => i.checked && i.difference !== 0);
    
    for (const item of itemsToAdjust) {
        const productRef = doc(db, "products", item.product_id);
        await updateDoc(productRef, {
            quantity: item.actual_quantity
        });
    }
    
    await updateDoc(docRef, {
        status: "approved",
        approved_by: managerId,
        approved_at: Timestamp.now(),
        updated_at: Timestamp.now()
    });
    
    return { success: true, adjusted_products: itemsToAdjust.length };
}

// Từ chối phiếu kiểm kê
export async function rejectInventoryCheck(checkId: string, managerId: string, reason: string) {
    const docRef = doc(db, "inventory_checks", checkId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) throw new Error("Phiếu kiểm kê không tồn tại");
    
    await updateDoc(docRef, {
        status: "rejected",
        rejected_by: managerId,
        rejected_at: Timestamp.now(),
        reject_reason: reason,
        updated_at: Timestamp.now()
    });
    
    return { success: true };
}

// Lấy thống kê kiểm kê
export async function getInventoryStats(userId?: string) {
    const inventoryRef = collection(db, "inventory_checks");
    let q = userId 
        ? query(inventoryRef, where("created_by", "==", userId))
        : inventoryRef;
    const snap = await getDocs(q);
    
    const checks = snap.docs.map(doc => doc.data());
    const approvedChecks = checks.filter(c => c.status === "approved");
    
    // Tính tỷ lệ chính xác trung bình
    let totalAccuracy = 0;
    approvedChecks.forEach(check => {
        const checkedItems = check.items?.filter((i: any) => i.checked) || [];
        if (checkedItems.length > 0) {
            const accuracy = (check.matched / checkedItems.length) * 100;
            totalAccuracy += accuracy;
        }
    });
    const avgAccuracy = approvedChecks.length > 0 ? totalAccuracy / approvedChecks.length : 0;
    
    // Top sản phẩm hay chênh lệch
    const productDiffs: Record<string, { name: string; count: number; totalDiff: number }> = {};
    approvedChecks.forEach(check => {
        check.items?.forEach((item: any) => {
            if (item.checked && item.difference !== 0) {
                if (!productDiffs[item.product_id]) {
                    productDiffs[item.product_id] = { name: item.product_name, count: 0, totalDiff: 0 };
                }
                productDiffs[item.product_id].count++;
                productDiffs[item.product_id].totalDiff += Math.abs(item.difference);
            }
        });
    });
    
    const topDiffProducts = Object.entries(productDiffs)
        .map(([id, data]) => ({ product_id: id, ...data }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
    
    // Xu hướng theo tháng (6 tháng gần nhất)
    const monthlyTrend: { month: string; checks: number; accuracy: number }[] = [];
    for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthStr = `${date.getMonth() + 1}/${date.getFullYear()}`;
        const monthChecks = approvedChecks.filter(c => {
            const checkDate = new Date(c.created_at?._seconds * 1000);
            return checkDate.getMonth() === date.getMonth() && checkDate.getFullYear() === date.getFullYear();
        });
        
        let monthAccuracy = 0;
        monthChecks.forEach(check => {
            const checkedItems = check.items?.filter((i: any) => i.checked) || [];
            if (checkedItems.length > 0) {
                monthAccuracy += (check.matched / checkedItems.length) * 100;
            }
        });
        
        monthlyTrend.push({
            month: monthStr,
            checks: monthChecks.length,
            accuracy: monthChecks.length > 0 ? monthAccuracy / monthChecks.length : 0
        });
    }
    
    return {
        totalChecks: checks.length,
        draftChecks: checks.filter(c => c.status === "draft").length,
        submittedChecks: checks.filter(c => c.status === "submitted").length,
        approvedChecks: approvedChecks.length,
        rejectedChecks: checks.filter(c => c.status === "rejected").length,
        avgAccuracy: Math.round(avgAccuracy * 10) / 10,
        topDiffProducts,
        monthlyTrend
    };
}

// Lấy lịch sử nhập/xuất của sản phẩm
export async function getProductTransactionHistory(productId: string, limit: number = 10) {
    const transactionsRef = collection(db, "warehouse_transactions");
    const snap = await getDocs(transactionsRef);
    
    const transactions: any[] = [];
    
    for (const docSnap of snap.docs) {
        const data = docSnap.data();
        const itemsRef = collection(db, "warehouse_transactions", docSnap.id, "items");
        const itemsSnap = await getDocs(itemsRef);
        
        for (const itemDoc of itemsSnap.docs) {
            const itemData = itemDoc.data();
            // Check if this item references our product
            if (itemData.id_product) {
                const productRef = itemData.id_product;
                if (productRef.id === productId || productRef.path?.includes(productId)) {
                    transactions.push({
                        id: docSnap.id,
                        type: data.type,
                        title: data.title,
                        date: data.created_at,
                        quantity_change: itemData.quantity_change,
                        before: itemData.before_quantity,
                        after: itemData.after_quantity
                    });
                }
            }
        }
    }
    
    return transactions
        .sort((a, b) => (b.date?._seconds || 0) - (a.date?._seconds || 0))
        .slice(0, limit);
}
