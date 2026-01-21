type FirestoreTimestamp = {
    seconds: number
    nanoseconds: number
}

interface DateOnlyProps {
    value: FirestoreTimestamp
}

export default function DateOnly({ value }: DateOnlyProps) {
    if (!value?.seconds) return <>-</>

    const date = new Date(value.seconds * 1000)

    const day = String(date.getDate()).padStart(2, "0")
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const year = date.getFullYear()

    return <>{`${day}/${month}/${year}`}</>
}
