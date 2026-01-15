import { useState } from 'react';
import { createPortal } from 'react-dom';

const SimpleTooltip = ({ children, content }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0 });

    const handleMouseEnter = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setCoords({
            top: rect.top - 8,
            left: rect.left + rect.width / 2 
        });
        setIsVisible(true);
    };

    return (
        <>
            <div 
                onMouseEnter={handleMouseEnter} 
                onMouseLeave={() => setIsVisible(false)}
                className="w-full min-w-0 cursor-help" 
            >
                {children}
            </div>
            {isVisible && createPortal(
                <div 
                    className="fixed z-[9999] px-4 py-2.5 text-sm font-mono font-medium text-white bg-[#1a2c38] border border-white/20 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl pointer-events-none transform -translate-x-1/2 -translate-y-full animate-fade-in"
                    style={{ top: coords.top, left: coords.left }}
                >
                    {content}
                    <div className="absolute left-1/2 bottom-0 w-2.5 h-2.5 bg-[#1a2c38] border-r border-b border-white/20 transform -translate-x-1/2 translate-y-1/2 rotate-45"></div>
                </div>,
                document.body
            )}
        </>
    );
};

export default SimpleTooltip;