import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";
import { db, auth } from "../../firebase/client/firebaseClient";

// Đổi mật khẩu
export async function changePassword(oldPassword: string, newPassword: string) {
    const user = auth.currentUser;
    if (!user || !user.email) {
        throw new Error("Chưa đăng nhập");
    }

    // Xác thực lại với mật khẩu cũ
    const credential = EmailAuthProvider.credential(user.email, oldPassword);
    await reauthenticateWithCredential(user, credential);

    // Đổi mật khẩu mới
    await updatePassword(user, newPassword);
    return { success: true };
}

// Lấy cài đặt thông báo
export async function getNotificationSettings(uid: string) {
    const settingsRef = doc(db, "user_settings", uid);
    const settingsSnap = await getDoc(settingsRef);

    if (!settingsSnap.exists()) {
        // Trả về default settings
        return {
            emailSchedule: true,
            emailSalary: true,
        };
    }

    const data = settingsSnap.data();
    return {
        emailSchedule: data.emailSchedule ?? true,
        emailSalary: data.emailSalary ?? true,
    };
}

// Cập nhật cài đặt thông báo
export async function updateNotificationSettings(uid: string, settings: {
    emailSchedule?: boolean;
    emailSalary?: boolean;
}) {
    const settingsRef = doc(db, "user_settings", uid);
    const settingsSnap = await getDoc(settingsRef);

    if (!settingsSnap.exists()) {
        await setDoc(settingsRef, {
            ...settings,
            created_at: new Date(),
        });
    } else {
        await updateDoc(settingsRef, {
            ...settings,
            updated_at: new Date(),
        });
    }

    return { success: true };
}
