type FirestoreTimestamp = {
    _seconds: number;
    _nanoseconds: number;
};

type DateTimeProps = {
    value: FirestoreTimestamp;
};

const DateTime: React.FC<DateTimeProps> = ({ value }) => {
    if (!value?._seconds) return null;

    const date = new Date(value._seconds * 1000);

    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");

    return <>{`${yyyy}-${mm}-${dd} ${hh}:${min}`}</>;
};

export default DateTime;