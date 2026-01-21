type FirestoreTimestamp = {
    seconds: number
    nanoseconds: number
}

interface ExperienceDurationProps {
    value: FirestoreTimestamp
}

export default function ExperienceDuration({
    value,
}: ExperienceDurationProps) {
    if (!value?.seconds) return <span>-</span>

    const startDate = new Date(value.seconds * 1000)
    const now = new Date()

    let years = now.getFullYear() - startDate.getFullYear()
    let months = now.getMonth() - startDate.getMonth()

    if (months < 0) {
        years--
        months += 12
    }

    // làm tròn tháng (>= 15 ngày thì +1 tháng)
    if (now.getDate() - startDate.getDate() >= 15) {
        months++
        if (months === 12) {
            years++
            months = 0
        }
    }

    let result = ""
    if (years <= 0) {
        result = `${months} tháng`
    } else if (months === 0) {
        result = `${years} năm`
    } else {
        result = `${years} năm ${months} tháng`
    }

    return <>{result}</>
}
