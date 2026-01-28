import { Calendar, Star } from "lucide-react"
import InputField from "../../../../components/tools/InputField"
// import type { CreateReviewWeekPayload } from "../../../../hooks/useReviewWeek"
import type React from "react"
import { useState } from "react"
import LoadingState from "../../../../components/ErrorAndLoading/LoadingState"
import { useUsers } from "../../../../hooks/useUsers"
import { type CreateReviewWeekPayload } from "../../../../hooks/useReviewWeek"
import { getISOWeekInfo } from "../../../../Utils/getWeekInfo"
import { useAuth } from "../../../../context/AuthContext"
import DateOnly from "../../../../components/Fomat/Time_and_Duration/DateOnly"
interface FormAddReviewProps {
    setView: React.Dispatch<React.SetStateAction<boolean>>,
    createReviewWeek: (payload: CreateReviewWeekPayload) => Promise<void>,
    onSuccess: () => Promise<void>
}

const FormAddReview = ({ setView, createReviewWeek, onSuccess }: FormAddReviewProps) => {

    const today = new Date().toISOString().split("T")[0]
    const [reviewDate, setReviewDate] = useState<string>(today)

    const [weekSubmit, setWeekSubmit] = useState<number>(0)
    const numberWeek = getISOWeekInfo(today)
    //data
    const [data, setData] = useState<Partial<CreateReviewWeekPayload>>(
        {
            content: '', rating: 5, start_week: undefined, end_week: undefined, user_create: '', user_review: ''
        }
    )

    const { uidAuth } = useAuth()
    //user and all member 
    const { users, loading } = useUsers()

    if (loading) {
        return <LoadingState />
    }
    // //form
    const handlePreSave = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) return

        const payload: CreateReviewWeekPayload = {
            content: data.content!.trim(),
            rating: data.rating!,
            start_week: data.start_week || numberWeek!.start,
            end_week: data.end_week || numberWeek!.end,
            user_review: data.user_review!,
            user_create: uidAuth!.toString(),
        }

        try {
            await createReviewWeek(payload)
            onSuccess()
            setView(false)

        } catch (err) {
            console.error(err)
            alert("❌ Tạo đánh giá thất bại")
        }
    }

    //
    const handleChangeReviewDate = (date: string) => {
        setReviewDate(date)

        const week = getISOWeekInfo(date)
        if (!week) return
        setWeekSubmit(week?.weekNumber)
        setData(prev => ({
            ...prev,
            start_week: week.start,
            end_week: week.end,
        }))
    }

    const validateForm = () => {
        if (!data.user_review) {
            return false
        }



        if (!data.content || !data.content.trim()) {
            return false
        }

        return true
    }

    return <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden max-w-4xl mx-auto">
        <div className="bg-[#00928f] p-10 text-white flex items-center justify-between">
            <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                    <Star size={32} />
                </div>
                <div>
                    <h2 className="text-2xl font-black">Viết Đánh Giá Mới</h2>
                    <p className="text-teal-50/70 text-sm italic">Chọn ngày, hệ thống sẽ tự tính tuần.</p>
                </div>
            </div>
            {/* {currentWeekInfo && ( */}
            <div className="text-right hidden sm:block">
                <p className="text-[10px] uppercase font-black tracking-widest opacity-60">Tuần dự kiến</p>
                <p className="text-xl font-black italic">
                    Tuần {weekSubmit !== 0 ? weekSubmit : numberWeek?.weekNumber}
                </p>
            </div>
            {/* )} */}
        </div>

        <form className="p-12 space-y-10"
            onSubmit={handlePreSave}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1" >Chọn nhân viên</label>
                    <select
                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm font-medium focus:border-[#00928f]"
                        onChange={(e) => setData({ ...data, user_review: e.target.value })}
                        required
                    >
                        <option value="">-- Chọn nhân viên --</option>
                        {users.map((e: any) => (
                            <option key={e?.uid} value={e?.uid}>{e?.id_member} - {e?.first_name} {e?.last_name}</option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2">
                    <InputField
                        label="Ngày đánh giá"
                        icon={Calendar}
                        type="date"
                        value={reviewDate}
                        onChange={(e: any) => handleChangeReviewDate(e.target.value)}
                        required
                    />
                    <p className="text-[10px] text-[#00928f] font-bold ml-1 animate-pulse">
                        Ghi nhận cho tuần {weekSubmit !== 0 ? weekSubmit : numberWeek?.weekNumber} (<DateOnly value={data.start_week ? data.start_week : numberWeek?.start} /> → {" "} <DateOnly value={data.end_week ? data.end_week : numberWeek?.end} />)
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Chấm điểm sao</label>
                    <div className="flex gap-4 items-center bg-slate-50 p-2 rounded-2xl border border-slate-200">
                        {[1, 2, 3, 4, 5].map((s) => (
                            <button
                                key={s} type="button"
                                onClick={() => setData({ ...data, rating: s })}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${data.rating === s ? 'bg-yellow-400 text-white shadow-lg' : 'text-slate-300 hover:bg-slate-200'}`}
                            >
                                <Star size={20}
                                    className={data.rating === s ? 'fill-current' : ''}
                                />
                            </button>
                        ))}
                        <span className="text-xs font-black text-slate-400 ml-auto mr-4">
                            {data.rating}/5
                        </span>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Nội dung đánh giá chi tiết</label>
                <textarea
                    className="w-full p-6 bg-slate-50 border border-slate-200 rounded-[2rem] outline-none text-sm font-medium focus:border-[#00928f] min-h-[150px] resize-none"
                    placeholder="Nhập nhận xét về thái độ, năng suất và kỹ năng..."
                    value={data?.content}
                    onChange={(e) => setData({ ...data, content: e.target.value })}
                    required
                />
            </div>

            <div className="flex items-center justify-end gap-6 pt-6 border-t border-slate-50">
                <button type="button"
                    onClick={() => setView(false)}
                    className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Hủy bỏ</button>
                <button type="submit" className="px-12 py-4 bg-[#00928f] text-white rounded-2xl font-bold shadow-xl shadow-[#00928f]/20 hover:bg-[#007a78] active:scale-95 transition-all text-xs uppercase tracking-widest">
                    Lưu Đánh Giá
                </button>
            </div>
        </form>
    </div>
}
export default FormAddReview