import { Timestamp } from "firebase/firestore"

interface AgeProps {
    dob?: Timestamp | null
}

export default function Age({ dob }: AgeProps) {
    if (!dob) return <span>-</span>

    const birthDate = dob.toDate()
    const today = new Date()

    let age = today.getFullYear() - birthDate.getFullYear()

    const hasHadBirthdayThisYear =
        today.getMonth() > birthDate.getMonth() ||
        (today.getMonth() === birthDate.getMonth() &&
            today.getDate() >= birthDate.getDate())

    if (!hasHadBirthdayThisYear) {
        age--
    }

    return <>{age}</>
}
