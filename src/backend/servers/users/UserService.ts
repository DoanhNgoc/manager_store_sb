import { collection, deleteDoc, doc, getDoc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/client/firebaseClient";

export async function getUserProfile(uid: string) {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    throw new Error("User chưa có document users");
  }

  const userData = userSnap.data();

  const roleRef = userData.role_id;
  const roleKey = roleRef?.id ?? null;

  const fullName: string = userData?.first_name + " " + userData?.last_name;
  const lastName = userData?.last_name ?? "";

  return {
    ...userData,
    roleKey,
    lastName,
    fullName
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