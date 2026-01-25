import { useRoles } from "../../../hooks/useRoles"
import LoadingState from "../../ErrorAndLoading/LoadingState"
import * as Icons from "lucide-react";


interface RoleSelectProps {
    value: string | undefined;
    onChange: (roleId: string) => void;
}
const CheckRoleMember: React.FC<RoleSelectProps> = ({ value, onChange }) => {
    const { roles, loading } = useRoles()
    if (loading) {
        return <LoadingState />
    }


    return (<div className="mt-10 space-y-4">
        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">
            Chức vụ & Phân quyền
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {roles.map(role => {
                // 🔥 AUTO: string → component
                const Icon = (Icons as any)[role.icon];
                const selected = value === `roles/${role.id}`;

                return (
                    <div
                        key={role.id}
                        onClick={() => onChange(role.id)}
                        className={`relative p-6 rounded-[2rem] border-2 cursor-pointer transition-all duration-300 group
                                ${selected
                                ? "border-[#00928f] bg-teal-50/50 shadow-lg shadow-teal-500/5"
                                : "border-slate-100 bg-white hover:border-slate-200"
                            }`}
                    >
                        <div className="flex items-start gap-4">
                            {/* ICON */}
                            <div
                                className={`w-12 h-12 rounded-2xl flex items-center justify-center
                                        ${selected
                                        ? "bg-[#00928f] text-white"
                                        : "bg-slate-100 text-slate-400"
                                    }`}
                            >
                                {Icon && <Icon size={24} />}
                            </div>

                            {/* CONTENT */}
                            <div className="flex-1">
                                <p className="font-bold text-sm">
                                    {role.name} ({role.key})
                                </p>
                                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                                    {role.describe}
                                </p>
                            </div>

                            {/* CHECK */}
                            <div
                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center
                                        ${selected
                                        ? "border-[#00928f] bg-[#00928f]"
                                        : "border-slate-200"
                                    }`}
                            >
                                {selected && <Icons.Check size={14} className="text-white" />}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    </div>)
}
export default CheckRoleMember