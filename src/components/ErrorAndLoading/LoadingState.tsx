
const LoadingState = () => (
    <div className="animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="space-y-2">
                <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse"></div>
                <div className="h-4 w-64 bg-slate-100 rounded-lg animate-pulse"></div>
            </div>
            <div className="h-12 w-40 bg-slate-200 rounded-2xl animate-pulse"></div>
        </div>
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-4 py-3 border-b border-slate-50 last:border-0">
                        <div className="w-10 h-10 rounded-2xl bg-slate-100 animate-pulse"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-4 w-1/4 bg-slate-100 rounded animate-pulse"></div>
                            <div className="h-3 w-1/3 bg-slate-50 rounded animate-pulse"></div>
                        </div>
                        <div className="h-8 w-20 bg-slate-50 rounded-xl animate-pulse"></div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export default LoadingState