import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy, Timestamp, limit } from "firebase/firestore";
import { db } from "../../firebase/client/firebaseClient";

export interface Notification {
    id: string;
    type: "schedule_reminder" | "schedule_published" | "schedule_request" | "general";
    title: string;
    message: string;
    target_role: "staff" | "manager" | "all"; // Thông báo cho role nào
    target_users?: string[]; // Hoặc specific user IDs
    week_start?: string;
    week_end?: string;
    created_by: string;
    created_at: any;
    read_by: string[]; // user IDs đã đọc
}

// Tạo thông báo mới
export async function createNotification(data: {
    type: Notification["type"];
    title: string;
    message: string;
    target_role: "staff" | "manager" | "all";
    target_users?: string[];
    week_start?: string;
    week_end?: string;
    created_by: string;
}) {
    const ref = collection(db, "notifications");
    const docRef = await addDoc(ref, {
        ...data,
        created_at: Timestamp.now(),
        read_by: [],
    });
    return { id: docRef.id, ...data };
}

// Lấy thông báo cho user dựa trên role
export async function getNotificationsForUser(userId: string, userRole: string) {
    const ref = collection(db, "notifications");
    const snap = await getDocs(ref);
    
    // Filter notifications cho user này dựa trên role
    const notifications = snap.docs
        .map(d => ({ id: d.id, ...d.data() } as Notification))
        .filter(n => {
            // Nếu target_role là "all"
            if (n.target_role === "all") return true;
            // Nếu target_role khớp với role của user
            if (n.target_role === userRole) return true;
            // Nếu có target_users và chứa userId
            if (n.target_users && n.target_users.includes(userId)) return true;
            return false;
        })
        .sort((a, b) => {
            const aTime = a.created_at?.seconds || 0;
            const bTime = b.created_at?.seconds || 0;
            return bTime - aTime; // Mới nhất trước
        })
        .slice(0, 20); // Giới hạn 20 thông báo gần nhất

    return notifications;
}

// Lấy số thông báo chưa đọc
export async function getUnreadCount(userId: string, userRole: string) {
    const notifications = await getNotificationsForUser(userId, userRole);
    return notifications.filter(n => !n.read_by?.includes(userId)).length;
}

// Đánh dấu đã đọc
export async function markAsRead(notificationId: string, userId: string) {
    const ref = doc(db, "notifications", notificationId);
    const snap = await getDocs(query(collection(db, "notifications"), where("__name__", "==", notificationId)));
    if (snap.empty) return;
    
    const data = snap.docs[0].data();
    const readBy = data.read_by || [];
    if (!readBy.includes(userId)) {
        await updateDoc(ref, { read_by: [...readBy, userId] });
    }
}

// Đánh dấu tất cả đã đọc
export async function markAllAsRead(userId: string, userRole: string) {
    const notifications = await getNotificationsForUser(userId, userRole);
    for (const n of notifications) {
        if (!n.read_by?.includes(userId)) {
            await markAsRead(n.id, userId);
        }
    }
}

// Xóa thông báo (admin only)
export async function deleteNotification(notificationId: string) {
    const ref = doc(db, "notifications", notificationId);
    await deleteDoc(ref);
}

// Lấy tất cả thông báo (admin)
export async function getAllNotifications() {
    const ref = collection(db, "notifications");
    const snap = await getDocs(ref);
    return snap.docs
        .map(d => ({ id: d.id, ...d.data() } as Notification))
        .sort((a, b) => {
            const aTime = a.created_at?.seconds || 0;
            const bTime = b.created_at?.seconds || 0;
            return bTime - aTime;
        });
}

// ===== MANAGER -> STAFF NOTIFICATIONS =====

// Gửi nhắc nhở đăng ký ca (Manager -> Staff)
export async function sendScheduleReminder(weekStart: string, weekEnd: string, createdBy: string) {
    return createNotification({
        type: "schedule_reminder",
        title: "🔔 Nhắc nhở đăng ký ca làm",
        message: `Vui lòng đăng ký ca làm việc cho tuần ${weekStart} - ${weekEnd}. Hạn đăng ký: Chủ nhật tuần này.`,
        target_role: "staff",
        week_start: weekStart,
        week_end: weekEnd,
        created_by: createdBy,
    });
}

// Gửi thông báo lịch làm đã được xếp (Manager -> Staff)
export async function sendSchedulePublished(weekStart: string, weekEnd: string, createdBy: string) {
    return createNotification({
        type: "schedule_published",
        title: "📅 Lịch làm việc tuần mới",
        message: `Lịch làm việc tuần ${weekStart} - ${weekEnd} đã được cập nhật. Vui lòng kiểm tra lịch của bạn.`,
        target_role: "staff",
        week_start: weekStart,
        week_end: weekEnd,
        created_by: createdBy,
    });
}

// ===== STAFF -> MANAGER NOTIFICATIONS =====

// Thông báo khi nhân viên đăng ký ca (Staff -> Manager)
export async function notifyScheduleRequest(staffName: string, weekStart: string, weekEnd: string, slotCount: number) {
    return createNotification({
        type: "schedule_request",
        title: "📝 Đăng ký ca làm mới",
        message: `${staffName} đã đăng ký ${slotCount} ca làm cho tuần ${weekStart} - ${weekEnd}. Vui lòng duyệt.`,
        target_role: "manager",
        week_start: weekStart,
        week_end: weekEnd,
        created_by: "system",
    });
}

// Thông báo khi nhân viên gửi bảng kiểm kê (Staff -> Manager)
export async function notifyInventorySubmit(staffName: string, checkCode: string, totalProducts: number, diffCount: number) {
    return createNotification({
        type: "general",
        title: "📦 Phiếu kiểm kê mới",
        message: `${staffName} đã gửi phiếu kiểm kê ${checkCode} (${totalProducts} sản phẩm, ${diffCount} chênh lệch). Vui lòng duyệt.`,
        target_role: "manager",
        created_by: "system",
    });
}
