import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars

const TICKER_TRANSITION = {
    duration: 0.5,
    type: "spring",
    stiffness: 100,
    damping: 15
};

const VARIANTS_SLIDE_UP = {
    initial: { y: "100%", opacity: 0 },
    animate: { y: "0%", opacity: 1 },
    exit:    { y: "-100%", opacity: 0 }
};

// 1. Animated Numbers 
export const AnimatedNumber = ({ value, prefix = "", suffix = "", className }) => {
    if (value === undefined || value === null) return <span>-</span>;

    return (
        <span className={`inline-flex overflow-hidden h-[1.2em] align-top relative ${className}`}>
            <AnimatePresence mode="popLayout">
                <motion.span
                    key={value}
                    variants={VARIANTS_SLIDE_UP}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={TICKER_TRANSITION}
                    className="inline-block whitespace-nowrap"
                >
                    {prefix}{value}{suffix}
                </motion.span>
            </AnimatePresence>
        </span>
    );
};

// 2. Shimmer Button
export const ShimmerButton = ({ children, className, disabled, ...props }) => {
    return (
        <button
            disabled={disabled}
            className={`relative overflow-hidden group ${className}`}
            {...props}
        >
            <span className="relative z-10">{children}</span>
            {!disabled && (
                <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-0" />
            )}
        </button>
    );
};

// 3. Animated Chart
export const AnimatedChart = ({ timeframe, basePrice = 2000 }) => {
    const [hoveredData, setHoveredData] = useState(null);
    const svgRef = useRef(null);
    
    const { pathData, points } = useMemo(() => {
        const width = 800;
        const height = 300;
        const totalPoints = 50;

        let currentY = height / 2;
        const pts = [];

        for (let i = 0; i <= totalPoints; i++) {
            const x = (i / totalPoints) * width;
            // eslint-disable-next-line
            const change = (Math.random() - 0.5) * 50;
            currentY += change;
            
            if (currentY < 20) currentY = 20;
            if (currentY > height - 20) currentY = height - 20;

            const priceVal = basePrice + ((height - currentY) / height) * (basePrice * 0.1);

            pts.push({ x, y: currentY, price: priceVal });
        }

        let d = `M ${pts[0].x} ${pts[0].y}`;
        for (let i = 1; i < pts.length; i++) {
             const prev = pts[i - 1];
             const curr = pts[i];
             const cp1x = prev.x + (curr.x - prev.x) / 2;
             const cp1y = prev.y;
             const cp2x = prev.x + (curr.x - prev.x) / 2;
             const cp2y = curr.y;
             d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
        }

        return { pathData: d, points: pts };
    }, [timeframe]); // eslint-disable-line no-unused-vars

    const handleMouseMove = (e) => {
        if (!svgRef.current) return;
        
        const rect = svgRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        
        const scaleX = 800 / rect.width;
        const svgX = mouseX * scaleX;

        const closestPoint = points.reduce((prev, curr) => {
            return (Math.abs(curr.x - svgX) < Math.abs(prev.x - svgX) ? curr : prev);
        });

        const adjustedPricePoint = {
             ...closestPoint,
             price: basePrice + ((300 - closestPoint.y) / 300) * (basePrice * 0.1)
        };

        setHoveredData(adjustedPricePoint);
    };

    const handleMouseLeave = () => {
        setHoveredData(null);
    };

    return (
        <div 
            className="w-full h-full relative" 
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            <svg 
                ref={svgRef}
                viewBox="0 0 800 300" 
                className="w-full h-full preserve-3d absolute bottom-0 cursor-crosshair" 
                preserveAspectRatio="none"
            >
                <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#00d4ff" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="cursorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#fff" stopOpacity="0" />
                        <stop offset="50%" stopColor="#fff" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#fff" stopOpacity="0" />
                    </linearGradient>
                </defs>

                <line x1="0" y1="50" x2="800" y2="50" stroke="white" strokeOpacity="0.03" strokeDasharray="4 4" />
                <line x1="0" y1="150" x2="800" y2="150" stroke="white" strokeOpacity="0.03" strokeDasharray="4 4" />
                <line x1="0" y1="250" x2="800" y2="250" stroke="white" strokeOpacity="0.03" strokeDasharray="4 4" />

                <path
                    d={pathData}
                    fill="none"
                    stroke="#00d4ff"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeOpacity="1" 
                    vectorEffect="non-scaling-stroke"
                />

                <motion.path
                    key={`${timeframe}-gradient`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    d={`${pathData} V 300 H 0 Z`}
                    fill="url(#chartGradient)"
                    stroke="none"
                />

                <AnimatePresence>
                    {hoveredData && (
                        <>
                        
                            <motion.line
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                x1={hoveredData.x} y1="0"
                                x2={hoveredData.x} y2="300"
                                stroke="url(#cursorGradient)"
                                strokeWidth="2"
                                strokeDasharray="4 4"
                            />

                            <g>
                                
                                <motion.circle
                                    cx={hoveredData.x}
                                    cy={hoveredData.y}
                                    r="4"
                                    fill="none"
                                    stroke="#00d4ff" 
                                    strokeWidth="2"
                                    initial={{ scale: 1, opacity: 0.8 }}
                                    animate={{ scale: 3, opacity: 0 }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                                />
                                
                                <motion.circle
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0 }}
                                    cx={hoveredData.x}
                                    cy={hoveredData.y}
                                    r="4" 
                                    fill="#00d4ff" 
                                    stroke="none"
                                />
                            </g>
                        </>
                    )}
                </AnimatePresence>

                {!hoveredData && points.length > 0 && (
                    <>
                        <motion.circle 
                            cx={points[points.length-1].x} cy={points[points.length-1].y} r="6" fill="#00d4ff"
                            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }}
                        />
                        <motion.circle 
                            cx={points[points.length-1].x} cy={points[points.length-1].y} r="15" fill="#00d4ff" opacity="0.5"
                            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                    </>
                )}
            </svg>

            <AnimatePresence>
                {hoveredData && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        className="absolute pointer-events-none bg-[#131823] border border-[#00d4ff]/30 p-2 rounded-xl shadow-xl z-50 flex flex-col items-center"
                        style={{
                            left: `${(hoveredData.x / 800) * 100}%`,
                            top: `${(hoveredData.y / 300) * 100}%`,
                            transform: 'translate(-50%, -120%)'
                        }}
                    >
                        <span className="text-[#00d4ff] font-bold font-mono text-sm">
                            ${hoveredData.price.toFixed(2)}
                        </span>
                        <span className="text-gray-500 text-[10px]">
                            {new Date().toLocaleTimeString()}
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// 4. Input wrapper
export const FocusGlowInput = ({ children }) => {
    return (
        <motion.div
            className="bg-[#0a0e17]/60 rounded-[2rem] p-5 border border-transparent transition-all duration-300 relative"
            whileFocusWithin={{
                borderColor: "rgba(0, 212, 255, 0.5)",
                boxShadow: "0 0 25px rgba(0, 212, 255, 0.15)"
            }}
        >
            {children}
        </motion.div>
    );
};

// 5. Animated Text
export const AnimatedText = ({ content, className }) => {
    return (
        <span className={`inline-flex items-center overflow-hidden h-[1.5rem] align-middle relative ${className}`}>
            <AnimatePresence mode="popLayout">
                <motion.span
                    key={content}
                    variants={VARIANTS_SLIDE_UP}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={TICKER_TRANSITION}
                    className="inline-block whitespace-nowrap leading-none pt-[0.1rem]"
                >
                    {content}
                </motion.span>
            </AnimatePresence>
        </span>
    )
}

// 6. Animated Icon
export const AnimatedIcon = ({ src, alt, className }) => {
    return (
        <div className={`relative ${className} overflow-hidden rounded-full`}>
            <AnimatePresence mode="popLayout">
                <motion.img
                    key={src}
                    src={src}
                    alt={alt}
                    variants={VARIANTS_SLIDE_UP}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={TICKER_TRANSITION}
                    className="w-full h-full object-cover absolute inset-0"
                />
            </AnimatePresence>
            <img src={src} alt={alt} className="invisible w-full h-full" />
        </div>
    );
};