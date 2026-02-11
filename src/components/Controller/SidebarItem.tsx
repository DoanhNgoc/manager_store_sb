import { ChevronDown } from "lucide-react";
import { useState } from "react";

const SidebarItem = ({ item, collapsed, setActivePage }: { item: any, collapsed: boolean, setActivePage: (page: string) => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const hasSubItems = item.item && item.item.length > 0;

    return (
        <div className="mb-1">
            <button
                onClick={() => {
                    hasSubItems ? setIsOpen(!isOpen) : null
                    setActivePage(item.pages)
                }}
                className={`
          w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group
          ${isOpen && hasSubItems ? 'bg-slate-700/50 text-white' : 'text-slate-400 hover:bg-slate-700/30 hover:text-white'}
        `}
            >
                <span className="text-slate-400 group-hover:text-[#009099] transition-colors">
                    {item.icon}
                </span>
                {!collapsed && (
                    <>
                        <span className="text-sm font-semibold flex-1 text-left">{item.textHtml}</span>
                        {hasSubItems && (
                            <span className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                                <ChevronDown size={14} />
                            </span>
                        )}
                    </>
                )}
            </button>

            {/* Sub Items */}
            {!collapsed && hasSubItems && isOpen && (
                <div className="ml-6 mt-1 space-y-1 border-l border-slate-700/50">
                    {item.item.map((sub: any, i: number) => (
                        <button
                            key={i}
                            onClick={() => setActivePage(sub.pages)}
                            className="w-full text-left px-6 py-2 text-xs font-medium text-slate-400 hover:text-[#009099] hover:bg-slate-700/20 rounded-r-lg transition-all flex items-center gap-3"
                        >
                            {sub.icon}
                            {sub.textHtml}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
export default SidebarItem