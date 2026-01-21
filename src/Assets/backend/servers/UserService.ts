import { collection, deleteDoc, doc, getDoc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../firebase/client/firebaseClient";

export async function getUserProfile(uid: string) {
  // users/{uid}
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    throw new Error("User chưa có document users");
  }

  const userData = userSnap.data();

  // role_id là reference → lấy ID cuối
  const roleRef = userData.role_id; // /roles/manager
  const roleId = roleRef.id; // manager

  return {
    ...userData,
    roleKey: roleId, // admin | manager | staff
  };
}
export async function getAllUsers() {
  const usersRef = collection(db, "users");
  const snap = await getDocs(usersRef);

  return snap.docs.map(doc => ({
    uid: doc.id,
    ...doc.data(),
    roleKey: doc.data().role_id?.id ?? null,
  }));
}

export async function updateUserRole(uid: string, roleRef: any) {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, {
    role_id: roleRef,
  });
}

export async function deleteUserDoc(uid: string) {
  const userRef = doc(db, "users", uid);
  await deleteDoc(userRef);
}