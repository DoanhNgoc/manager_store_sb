import { AlertCircle } from "lucide-react";

const InputField = ({ label, icon: Icon, error, ...props }: any) => (
    <div className="space-y-2">
        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">{label}</label>
        <div className="relative group">
            {Icon && <Icon size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${error ? 'text-red-400' : 'text-slate-300 group-focus-within:text-[#00928f]'}`} />}
            <input
                {...props}
                className={`w-full px-4 py-3.5 ${Icon ? 'pl-11' : ''} bg-slate-50 border rounded-2xl outline-none transition-all placeholder:text-slate-300 text-sm font-medium ${error
                    ? 'border-red-200 focus:border-red-400 focus:ring-4 focus:ring-red-400/10 text-red-900 bg-red-50/30'
                    : 'border-slate-200 focus:border-[#00928f] focus:bg-white focus:ring-4 focus:ring-[#00928f]/10 text-slate-700'
                    }`}
            />
        </div>
        {error && (
            <p className="flex items-center gap-1 text-[10px] text-red-500 font-bold mt-1 ml-1 animate-in slide-in-from-left-2 duration-200">
                <AlertCircle size={12} />
                {error}
            </p>
        )}
    </div>
);
export default InputField