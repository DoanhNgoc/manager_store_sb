import { useEffect, useState } from "react";
import { getRoleLabel, type LangCode } from "../../../hooks/getRoleLabel";

interface RoleLabelProps {
    role: string;
    lang?: LangCode;
}

export const RoleLabel = ({
    role,
    lang = "vn",
}: RoleLabelProps) => {
    const [label, setLabel] = useState("");

    useEffect(() => {
        if (!role) return;

        getRoleLabel(role, lang).then(setLabel);
    }, [role, lang]);

    return <>{label}</>;
};
