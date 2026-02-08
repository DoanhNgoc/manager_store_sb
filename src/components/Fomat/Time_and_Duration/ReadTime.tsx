import { useEffect, useState } from "react";

const ReadTime = () => {
    const [greeting, setGreeting] = useState("");

    useEffect(() => {
        const h = new Date().getHours();

        if (h >= 5 && h < 12) setGreeting("Good Morning");
        else if (h >= 12 && h < 18) setGreeting("Good Afternoon");
        else setGreeting("Good Evening");
    }, []);

    return <>{greeting}</>;
};

export default ReadTime;
