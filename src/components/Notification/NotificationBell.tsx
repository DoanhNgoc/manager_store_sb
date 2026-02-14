import { useState, useEffect, useRef } from "react";
import { Bell, X, Check, Calendar, Clock, CheckCheck, FileText } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

interface Notification {
    id: string;
    type: "schedule_reminder" | "schedule_published" | "schedule_request" | "general";
    title: string;
    message: string;
    week_start?: string;
    week_end?: string;
    created_at: any;
    read_by: string[];
}

export default function NotificationBell() {
    const { uidAuth, roleKey } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const fetchNotifications = async () => {
        if (!uidAuth || !roleKey) return;
        try {
            const res = await fetch(`http://localhost:3001/api/notifications/${uidAuth}?role=${roleKey}`);
            const json = await res.json();
            if (json.success) {
                setNotifications(json.data || []);
                const unread = (json.data || []).filter((n: Notification) => !n.read_by?.includes(uidAuth)).length;
                setUnreadCount(unread);
            }
        } catch (err) {
            console.error("Error fetching notifications:", err);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [uidAuth, roleKey]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const markAsRead = async (notificationId: string) => {
        if (!uidAuth) return;
        try {
            await fetch(`http://localhost:3001/api/notifications/${notificationId}/read`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: uidAuth }),
            });
            fetchNotifications();
        } catch (err) {
            console.error("Error marking as read:", err);
        }
    };

    const markAllAsRead = async () => {
        if (!uidAuth || !roleKey) return;
        setLoading(true);
        try {
            await fetch(`http://localhost:3001/api/notifications/mark-all-read`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: uidAuth, role: roleKey }),
            });
            fetchNotifications();
        } catch (err) {
            console.error("Error marking all as read:", err);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (timestamp: any) => {
        if (!timestamp) return "";
        const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return "Vừa xong";
        if (minutes < 60) return `${minutes} phút trước`;
        if (hours < 24) return `${hours} giờ trước`;
        if (days < 7) return `${days} ngày trước`;
        return date.toLocaleDateString("vi-VN");
    };

    const getIcon = (type: string) => {
        switch (type) {
            case "schedule_reminder":
                return <Clock size={18} className="text-amber-500" />;
            case "schedule_published":
                return <Calendar size={18} className="text-green-500" />;
            case "schedule_request":
                return <FileText size={18} className="text-blue-500" />;
            default:
                return <Bell size={18} className="text-blue-500" />;
        }
    };

    const getBgColor = (type: string, isRead: boolean) => {
        if (isRead) return "bg-white";
        switch (type) {
            case "schedule_reminder":
                return "bg-amber-50";
            case "schedule_published":
                return "bg-green-50";
            case "schedule_request":
                return "bg-blue-50";
            default:
                return "bg-slate-50";
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors"
            >
                <Bell size={22} className="text-slate-600" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                        <div className="flex items-center gap-2">
                            <Bell size={18} className="text-[#009099]" />
                            <span className="font-semibold text-slate-800">Thông báo</span>
                            {unreadCount > 0 && (
                                <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-bold rounded-full">
                                    {unreadCount} mới
                                </span>
                            )}
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                disabled={loading}
                                className="text-xs text-[#009099] hover:underline flex items-center gap-1"
                            >
                                <CheckCheck size={14} />
                                Đọc tất cả
                            </button>
                        )}
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center">
                                <Bell size={40} className="mx-auto text-slate-300 mb-3" />
                                <p className="text-slate-500">Chưa có thông báo nào</p>
                            </div>
                        ) : (
                            notifications.map((n) => {
                                const isRead = n.read_by?.includes(uidAuth || "");
                                return (
                                    <div
                                        key={n.id}
                                        onClick={() => !isRead && markAsRead(n.id)}
                                        className={`px-4 py-3 border-b border-slate-100 last:border-b-0 cursor-pointer hover:bg-slate-50 transition-colors ${getBgColor(n.type, isRead)}`}
                                    >
                                        <div className="flex gap-3">
                                            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center">
                                                {getIcon(n.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className={`text-sm ${isRead ? "text-slate-600" : "text-slate-800 font-semibold"}`}>
                                                        {n.title}
                                                    </p>
                                                    {!isRead && (
                                                        <span className="w-2 h-2 bg-[#009099] rounded-full flex-shrink-0 mt-1.5"></span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{n.message}</p>
                                                <p className="text-[10px] text-slate-400 mt-1">{formatTime(n.created_at)}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
