type FirestoreTimestamp = {
    seconds?: number
    nanoseconds?: number
    _seconds?: number
    _nanoseconds?: number
}
export const getISOWeekInfo = (
    dateInput: string | Date | FirestoreTimestamp
) => {
    let date: Date

    if (typeof dateInput === "string" || dateInput instanceof Date) {
        date = new Date(dateInput)
    } else {
        const seconds = dateInput.seconds ?? dateInput._seconds
        if (!seconds) return null
        date = new Date(seconds * 1000)
    }

    if (isNaN(date.getTime())) return null

    // ===== ISO WEEK =====
    const d = new Date(Date.UTC(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
    ))

    const dayNum = d.getUTCDay() || 7
    d.setUTCDate(d.getUTCDate() + 4 - dayNum)

    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
    const weekNumber = Math.ceil(
        (((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7
    )

    // ===== START / END WEEK =====
    const weekStart = new Date(d)
    weekStart.setUTCDate(d.getUTCDate() - 3)

    const weekEnd = new Date(weekStart)
    weekEnd.setUTCDate(weekStart.getUTCDate() + 6)

    const toISODate = (date: Date) =>
        date.toISOString().split("T")[0]

    return {
        year: d.getUTCFullYear(),
        weekNumber,
        start: toISODate(weekStart),
        end: toISODate(weekEnd),
    }
}
