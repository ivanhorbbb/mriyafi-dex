import React, { useState, useMemo, useRef, memo, useEffect } from 'react';
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

const generateChartData = (width, height, totalPoints, currentPrice) => {
    const base = currentPrice && parseFloat(currentPrice) > 0 ? parseFloat(currentPrice) : 1;
    
    const prices = [];
    let tempPrice = base;
    
    prices.push(base);

    for (let i = 0; i < totalPoints; i++) {
        const volatility = base * 0.02;
        const change = (Math.random() - 0.5) * volatility; 
        tempPrice = tempPrice - change;
        if (tempPrice < 0) tempPrice = base * 0.01;
        prices.unshift(tempPrice);
    }

    const firstPrice = prices[0];
    const lastPrice = prices[prices.length - 1];
    const percentChange = ((lastPrice - firstPrice) / firstPrice) * 100;

    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 1;

    const pts = prices.map((p, i) => {
        const x = (i / totalPoints) * width;
        const normalizedY = (p - minPrice) / priceRange;
        const y = height - 20 - (normalizedY * (height - 40)); 
        return { x, y, price: p };
    });

    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
        const prev = pts[i - 1];
        const curr = pts[i];
        const cp1x = prev.x + (curr.x - prev.x) / 2;
        const cp2x = prev.x + (curr.x - prev.x) / 2;
        d += ` C ${cp1x} ${prev.y}, ${cp2x} ${curr.y}, ${curr.x} ${curr.y}`;
    }

    return { pathData: d, points: pts, percentChange };
};

// 3. Animated Chart
const AnimatedChartBase = ({ timeframe, currentPrice = 0, color = "#00d4ff", onStatsUpdate, currencySymbol = "" }) => {
    const [hoveredData, setHoveredData] = useState(null);
    const svgRef = useRef(null);

    const { pathData, points, percentChange } = useMemo(() => {
        return generateChartData(800, 300, 50, currentPrice);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeframe, currentPrice]);

    useEffect(() => {
        if (onStatsUpdate) {
            onStatsUpdate(percentChange);
        }
    }, [percentChange, onStatsUpdate]);

    const handleMouseMove = (e) => {
        if (!svgRef.current) return;
        const rect = svgRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const scaleX = 800 / rect.width;
        const svgX = x * scaleX;
        
        const closestPoint = points.reduce((prev, curr) => 
            Math.abs(curr.x - svgX) < Math.abs(prev.x - svgX) ? curr : prev
        );
        if (closestPoint) setHoveredData(closestPoint);
    };

    return (
        <div className="w-full h-full relative" onMouseMove={handleMouseMove} onMouseLeave={() => setHoveredData(null)}>
            <svg ref={svgRef} viewBox="0 0 800 300" className="w-full h-full preserve-3d absolute bottom-0 cursor-crosshair" preserveAspectRatio="none">
                <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                        <stop offset="100%" stopColor={color} stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="cursorGradient" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="0%" stopColor="#fff" stopOpacity="0" />
                         <stop offset="50%" stopColor="#fff" stopOpacity="0.5" />
                         <stop offset="100%" stopColor="#fff" stopOpacity="0" />
                    </linearGradient>
                </defs>

                <path d={pathData} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                <path d={`${pathData} V 300 H 0 Z`} fill="url(#chartGradient)" stroke="none" style={{ opacity: 0.5 }} />

                <AnimatePresence>
                    {hoveredData && (
                        <>
                           <line x1={hoveredData.x} y1="0" x2={hoveredData.x} y2="300" stroke="url(#cursorGradient)" strokeDasharray="4 4" strokeWidth="2" />
                           <circle cx={hoveredData.x} cy={hoveredData.y} r="6" fill={color} stroke="white" strokeWidth="2" />
                        </>
                    )}
                </AnimatePresence>
            </svg>
            
            <AnimatePresence>
                {hoveredData && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="absolute pointer-events-none bg-[#131823] border p-2 rounded-xl shadow-xl z-50"
                        style={{ 
                            left: `${(hoveredData.x / 800) * 100}%`, 
                            top: `${(hoveredData.y / 300) * 100}%`, 
                            transform: 'translate(-50%, -120%)',
                            borderColor: color 
                        }}
                    >
                        <span className="font-bold font-mono text-sm" style={{ color: color }}>
                            {hoveredData.price < 1 
                                ? hoveredData.price.toFixed(6) 
                                : hoveredData.price.toFixed(2)
                            } <span className="text-xs ml-0.5 opacity-80">{currencySymbol}</span>
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export const AnimatedChart = memo(AnimatedChartBase);

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