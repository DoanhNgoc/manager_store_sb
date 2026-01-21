import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
interface props {
    notification: any
}
export default function ItemNotification({ notification }: props) {
    const [isOpen, setIsOpen] = useState(false);
    return <div className="background border m-1 border-dark" onClick={() => setIsOpen(!isOpen)} >
        {/* Phần tiêu đề */}
        <div className={isOpen ? "d-flex  p-1 px-2 align-items-center justify-content-between border-bottom border-dark" : "d-flex  p-1 px-2 align-items-center justify-content-between "}>
            {/* title */}
            <div>
                <p className="my-1">{notification.title}</p>
            </div>
            {/* date */}
            <div>
                <small>time create</small>
            </div>
        </div>
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                >
                    <div className="p-1 px-2">
                        {notification.content}
                    </div>
                </motion.div>)}
        </AnimatePresence>
    </div>
}