import { useState } from "react";
import { useCategories } from "../../hooks/useCategories"
import LoadingState from "../ErrorAndLoading/LoadingState"
import ErrorState from "../ErrorAndLoading/ErrorState";

interface FilterCategoryProps {
    setIdCategory: React.Dispatch<React.SetStateAction<string>>
}
const FilterCategory = ({ setIdCategory }: FilterCategoryProps) => {
    const [selectedCategory, setSelectedCategory] = useState("Tất cả");
    const { categories, loading, error } = useCategories();
    if (loading) {
        return <LoadingState />
    }
    if (error) {
        return <ErrorState message={error} />
    }
    const onlick = (name: string) => {
        setSelectedCategory(name)
    }
    return <>
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar">
            <FilterTab
                label="Tất cả"
                active={selectedCategory === "Tất cả"}
                onClick={() => {
                    setIdCategory("");
                    setSelectedCategory("Tất cả")
                }}
            />

            {categories.map((c: any) => (
                <FilterTab
                    key={c?.id}
                    label={c?.name}
                    active={selectedCategory === c.name}
                    onClick={() => {
                        setIdCategory(c?.id);
                        setSelectedCategory(c?.name)
                    }}
                />
            ))}
        </div></>
}

interface FilterTabProps {
    label: string;
    active: boolean;
    onClick: () => void;
}

const FilterTab = ({ label, active, onClick }: FilterTabProps) => (
    <button
        onClick={onClick}
        className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${active
            ? "bg-[#1E293B] text-white border-transparent shadow-xl"
            : "bg-white text-slate-400 border-slate-100 hover:border-[#7ED9D9] hover:text-[#7ED9D9]"
            }`}
    >
        {label}
    </button>
);


export default FilterCategory