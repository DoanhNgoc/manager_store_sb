import { collection, doc, getDoc, getDocs, addDoc, updateDoc, query, where, orderBy, Timestamp } from "firebase/firestore";
import { db } from "../../firebase/client/firebaseClient";

// Lấy lịch sử lương của nhân viên
export async function getSalaryByUserId(userId: string) {
    const salaryRef = collection(db, "salaries");
    const q = query(
        salaryRef,
        where("user_id", "==", userId)
    );
    const snap = await getDocs(q);
    // Sort by year and month descending in memory
    const data = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
    return data.sort((a: any, b: any) => {
        if (b.year !== a.year) return b.year - a.year;
        return b.month - a.month;
    });
}

// Lấy lương theo tháng cụ thể
export async function getSalaryByMonth(userId: string, month: number, year: number) {
    const salaryRef = collection(db, "salaries");
    const q = query(
        salaryRef,
        where("user_id", "==", userId),
        where("month", "==", month),
        where("year", "==", year)
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return {
        id: snap.docs[0].id,
        ...snap.docs[0].data()
    };
}

// Tạo bảng lương mới (dành cho manager)
export async function createSalary(data: {
    user_id: string;
    month: number;
    year: number;
    base_salary: number;
    work_days: number;
    total_days: number;
    overtime_hours: number;
    overtime_pay: number;
    bonus: number;
    deductions: number;
    total_salary: number;
}) {
    const salaryRef = collection(db, "salaries");
    const docRef = await addDoc(salaryRef, {
        ...data,
        status: "pending",
        created_at: Timestamp.now()
    });
    return { id: docRef.id, ...data };
}

// Cập nhật trạng thái lương (đã thanh toán)
export async function updateSalaryStatus(id: string, status: string, paidDate?: string) {
    const salaryRef = doc(db, "salaries", id);
    const updateData: any = {
        status,
        updated_at: Timestamp.now()
    };
    if (paidDate) {
        updateData.paid_date = paidDate;
    }
    await updateDoc(salaryRef, updateData);
}

// Tính lương tự động dựa trên chấm công
export async function calculateSalary(userId: string, month: number, year: number, baseSalary: number) {
    // Lấy dữ liệu chấm công
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month).padStart(2, '0')}-31`;

    const attendanceRef = collection(db, "attendance");
    const q = query(
        attendanceRef,
        where("user_id", "==", userId),
        where("date", ">=", startDate),
        where("date", "<=", endDate)
    );
    const snap = await getDocs(q);
    const records = snap.docs.map(doc => doc.data());

    // Tính toán
    const workDays = records.filter(r => r.check_in && r.check_out).length;
    const totalHours = records.reduce((acc, r) => acc + (r.work_hours || 0), 0);
    const standardHours = workDays * 8;
    const overtimeHours = Math.max(0, totalHours - standardHours);
    const overtimePay = overtimeHours * (baseSalary / 22 / 8) * 1.5; // 1.5x cho overtime

    // Số ngày làm việc chuẩn trong tháng (giả sử 22 ngày)
    const totalDays = 22;
    const dailyRate = baseSalary / totalDays;
    const actualSalary = dailyRate * workDays;

    return {
        user_id: userId,
        month,
        year,
        base_salary: baseSalary,
        work_days: workDays,
        total_days: totalDays,
        overtime_hours: Math.round(overtimeHours * 100) / 100,
        overtime_pay: Math.round(overtimePay),
        bonus: 0,
        deductions: 0,
        total_salary: Math.round(actualSalary + overtimePay)
    };
}

// Lấy tất cả bảng lương (dành cho manager)
export async function getAllSalaries() {
    const salaryRef = collection(db, "salaries");
    const snap = await getDocs(salaryRef);
    // Sort by year and month descending in memory
    const data = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
    return data.sort((a: any, b: any) => {
        if (b.year !== a.year) return b.year - a.year;
        return b.month - a.month;
    });
}
