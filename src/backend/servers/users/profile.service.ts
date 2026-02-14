import { doc, getDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../firebase/client/firebaseClient";

// Lấy thông tin profile đầy đủ
export async function getFullProfile(uid: string) {
    try {
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            console.error("User document không tồn tại:", uid);
            return null;
        }

        const userData = userSnap.data();
        const roleRef = userData.role_id;
        let roleName = "Nhân viên";
        
        if (roleRef) {
            try {
                const roleSnap = await getDoc(roleRef);
                if (roleSnap.exists()) {
                    const roleData = roleSnap.data() as { name?: string };
                    roleName = roleData.name || "Nhân viên";
                }
            } catch (e) {
                console.error("Error fetching role:", e);
            }
        }

        return {
            uid,
            id_member: userData.id_member || "",
            first_name: userData.first_name || "",
            last_name: userData.last_name || "",
            email: userData.email || "",
            phone: userData.phone || "",
            avatar: userData.avatar || "",
            dob: userData.dob?.toDate?.() || userData.dob || null,
            experience: userData.experience?.toDate?.() || userData.experience || null,
            salary: userData.salary || 0,
            role_name: roleName,
            create_at: userData.create_at?.toDate?.() || userData.create_at || null,
        };
    } catch (error) {
        console.error("getFullProfile error:", error);
        return null;
    }
}

// Cập nhật thông tin cơ bản (phone)
export async function updateBasicInfo(uid: string, data: { phone?: string }) {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
        ...data,
        updated_at: new Date(),
    });
    return { success: true };
}

// Upload avatar
export async function uploadAvatar(uid: string, file: File): Promise<string> {
    const storageRef = ref(storage, `avatars/${uid}/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    
    // Cập nhật avatar URL vào user document
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
        avatar: downloadURL,
        updated_at: new Date(),
    });
    
    return downloadURL;
}

// Lấy thống kê cá nhân
export async function getPersonalStats(uid: string) {
    try {
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();
        const startDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
        const endDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-31`;
        
        const userRef = doc(db, "users", uid);

        // Lấy attendance tháng này
        let totalDays = 0;
        let lateDays = 0;
        let totalHours = 0;

        try {
            const attendanceRef = collection(db, "attendance");
            const attendanceQuery = query(
                attendanceRef,
                where("user_id", "==", userRef),
                where("date", ">=", startDate),
                where("date", "<=", endDate)
            );
            const attendanceSnap = await getDocs(attendanceQuery);
            const attendanceRecords = attendanceSnap.docs.map(d => d.data());

            totalDays = attendanceRecords.length;
            lateDays = attendanceRecords.filter(r => r.status === "late").length;
            totalHours = attendanceRecords.reduce((acc, r) => acc + (r.work_hours || 0), 0);
        } catch (e) {
            console.error("Error fetching attendance:", e);
        }

        // Lấy review của user
        let avgRating = 0;
        let totalReviews = 0;

        try {
            const reviewRef = collection(db, "review_week");
            const reviewQuery = query(reviewRef, where("user_review", "==", userRef));
            const reviewSnap = await getDocs(reviewQuery);
            const reviews = reviewSnap.docs.map(d => d.data());
            
            totalReviews = reviews.length;
            avgRating = reviews.length > 0 
                ? reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length 
                : 0;
        } catch (e) {
            console.error("Error fetching reviews:", e);
        }

        return {
            totalDaysThisMonth: totalDays,
            lateDaysThisMonth: lateDays,
            totalHoursThisMonth: Math.round(totalHours * 10) / 10,
            avgRating: Math.round(avgRating * 10) / 10,
            totalReviews: totalReviews,
        };
    } catch (error) {
        console.error("getPersonalStats error:", error);
        return {
            totalDaysThisMonth: 0,
            lateDaysThisMonth: 0,
            totalHoursThisMonth: 0,
            avgRating: 0,
            totalReviews: 0,
        };
    }
}
