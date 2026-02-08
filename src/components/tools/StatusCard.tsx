import type { ReactNode } from "react";

interface StatusCardProps {
    icon: ReactNode,
    label: string,
    count: number,
    color: string
}
const StatusCard = ({ icon, label, count, color }: StatusCardProps) => (
    <div className={`${color} p-8 rounded-[2.5rem] border border-white flex items-center gap-6 shadow-sm`}>
        <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-sm text-2xl">{icon}</div>
        <div>
            <p className="text-3xl font-black text-slate-800 leading-none">{count}</p>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-2">{label}</p>
        </div>
    </div>
);
export default StatusCard