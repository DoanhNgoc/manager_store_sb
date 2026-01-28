type FirestoreTimestamp = {
    seconds?: number
    _seconds?: number
    nanoseconds?: number
    _nanoseconds?: number
}

type DateValue = FirestoreTimestamp | string | Date | null | undefined

interface DateOnlyProps {
    value?: DateValue
}

const DateOnly: React.FC<DateOnlyProps> = ({ value }) => {
    if (!value) return <>-</>

    let date: Date | null = null

    // Firestore Timestamp
    if (
        typeof value === "object" &&
        value !== null &&
        typeof (value as FirestoreTimestamp)._seconds === "number"
    ) {
        date = new Date((value as FirestoreTimestamp)._seconds! * 1000)
    }
    // string yyyy-mm-dd / ISO
    else if (typeof value === "string") {
        date = new Date(value)
    }
    // Date object
    else if (value instanceof Date) {
        date = value
    }

    if (!date || isNaN(date.getTime())) return <>-</>

    const day = String(date.getDate()).padStart(2, "0")
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const year = date.getFullYear()

    return <>{`${day}-${month}-${year}`}</>
}

export default DateOnly
