import { adminAuth, adminDb } from "../../firebase/admin/firebaseAdmin";
import nodemailer from "nodemailer";
import { getAllUsers } from "./UserService";

/* ========== helper ========== */
async function generateMemberId() {
    const snapshot = await adminDb
        .collection("users")
        .orderBy("id_member", "desc")
        .limit(1)
        .get();

    if (snapshot.empty) return "NTH001";

    const lastId = snapshot.docs[0].data().id_member;
    const number = parseInt(lastId.replace("NTH", ""), 10) + 1;
    return `NTH${number.toString().padStart(3, "0")}`;
}

function generatePassword() {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
}

/* ========== mail ========== */
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
});

async function sendAccountMail(
    email: string,
    password: string,
    idMember: string,
    fullName: string
) {
    await transporter.sendMail({
        from: `"Sunday Basic Nguyễn Thượng Hiền" <${process.env.MAIL_USER}>`,
        to: email,
        subject: "Tài khoản đăng nhập hệ thống",
        html: `
            <h3>Chào mừng ${fullName}</h3>
            <p>Mã nhân viên: <b>${idMember}</b></p>
            <p>Password: ${password}</p>
            <p>Vui lòng đăng nhập và đổi mật khẩu sau lần đăng nhập đầu tiên.</p>
        `,
    });
}

/* ========== main ========== */
export async function createUserByAdmin(data: {
    email: string;
    first_name: string;
    last_name: string;
    phone: string;
    dob: string;         // yyyy-mm-dd
    experience: string; // yyyy-mm-dd (ngày bắt đầu làm việc)
    salary: number;
    role_id: string;
}) {
    const password = generatePassword();
    const id_member = await generateMemberId();

    /* 1. tạo auth */
    const user = await adminAuth.createUser({
        email: data.email,
        password,
    });

    /* 2. convert date */
    const dobDate = new Date(data.dob);
    const experienceDate = new Date(data.experience);

    if (isNaN(dobDate.getTime()) || isNaN(experienceDate.getTime())) {
        throw new Error("Invalid date format");
    }

    /* 3. tạo firestore */
    await adminDb.collection("users").doc(user.uid).set({
        avatar: "",
        create_at: new Date(),
        dob: dobDate,                 // 🔥 ngày sinh
        experience: experienceDate,   // 🔥 ngày bắt đầu làm
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone,
        salary: data.salary,
        id_member,
        role_id: adminDb.doc(data.role_id),
    });

    /* 4. gửi mail */
    await sendAccountMail(
        data.email,
        password,
        id_member,
        `${data.first_name} ${data.last_name}`
    );
    getAllUsers()
    return {
        uid: user.uid,
        id_member,
    };
}
