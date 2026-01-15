import React, { useEffect } from 'react';
import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { X, CheckCircle, AlertTriangle } from 'lucide-react';

const Notification = ({ type, title, message, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const isSuccess = type === 'success';
    const borderColor = isSuccess ? 'border-green-500/50' : 'border-red-500/50';
    const glowColor = isSuccess ? 'shadow-[0_0_20px_rgba(34,197,94,0.3)]' : 'shadow-[0_0_20px_rgba(239,68,68,0.3)]';
    const iconColor = isSuccess ? 'text-green-400' : 'text-red-400';

    return (
        <motion.div
            initial={{ y: -100, opacity: 0, scale: 0.9 }}
            animate={{ y: 20, opacity: 1, scale: 1 }}
            exit={{ y: -100, opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`
                fixed top-0 left-0 right-0 mx-auto w-full max-w-md z-[9999]
                flex items-start gap-4 p-4 rounded-2xl
                bg-[#131823]/95 backdrop-blur-xl border ${borderColor} ${glowColor}
            `}
        >
            <div className={`p-2 rounded-full bg-[#1a2c38] ${iconColor} mt-1 shrink-0`}>
                {isSuccess ? <CheckCircle size={24} /> : <AlertTriangle size={24} />}
            </div>
            <div className="flex-1">
                <h4 className={`font-bold text-lg leading-tight mb-1 ${isSuccess ? 'text-green-400' : 'text-red-400'}`}>
                    {title}
                </h4>
                <p className="text-sm text-gray-300 leading-relaxed">
                    {message}
                </p>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors mt-1 shrink-0">
                <X size={20} />
            </button>
        </motion.div>
    );
};

export default Notification;