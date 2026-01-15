import { memo } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import SimpleTooltip from '../ui/SimpleTooltip';

const PoolStats = ({ reserves, loading, symbols, t, pool, formatTokenAmount, formatTooltip }) => {
    const { symbolA, symbolB } = symbols;
    const primaryColor = pool.isHot ? '#f0dfae' : '#00d4ff';
    const primaryClass = pool.isHot ? 'text-[#f0dfae]' : 'text-[#00d4ff]';
    const safeT = t;

    return (
        <div className="lg:col-span-2 p-8 relative flex flex-col justify-between min-h-[450px] border-b lg:border-b-0 lg:border-r border-white/10">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-y-8 gap-x-8 mb-8 relative z-10">
                
                <SimpleTooltip content={formatTooltip(reserves.reserveA)}>
                    <div className="text-gray-400 text-sm mb-1 font-medium truncate">{safeT.reserves} {symbolA}</div>
                    <div className="text-white text-2xl font-bold tracking-tight truncate cursor-help">
                        {loading ? <Loader2 className="animate-spin h-6 w-6"/> : formatTokenAmount(reserves.reserveA)}
                    </div>
                </SimpleTooltip>

                <SimpleTooltip content={formatTooltip(reserves.reserveB)}>
                    <div className="text-gray-400 text-sm mb-1 font-medium truncate">{safeT.reserves} {symbolB}</div>
                    <div className="text-white text-2xl font-bold tracking-tight truncate cursor-help">
                        {loading ? <Loader2 className="animate-spin h-6 w-6"/> : formatTokenAmount(reserves.reserveB)}
                    </div>
                </SimpleTooltip>

                <div className="min-w-0">
                    <div className="text-gray-400 text-sm mb-1 font-medium truncate">{t.fees}</div>
                    <div className="text-white text-2xl font-bold tracking-tight truncate">$375K</div>
                </div>
                
                <div className="text-left md:text-right min-w-0">
                    <div className="text-gray-400 text-sm mb-1 font-medium truncate">{t.apr}</div>
                    <div className={`text-2xl font-bold flex items-center md:justify-end gap-2 ${primaryClass} truncate`}>
                        {pool.apr} <Sparkles size={18} className="shrink-0"/>
                    </div>
                </div>
            </div>
            
            {/* Chart SVG Placeholder */}
            <div className="flex-grow w-full relative mt-4">
                <svg viewBox="0 0 500 150" className="w-full h-full absolute inset-0 bottom-0" preserveAspectRatio="none">
                        <defs>
                        <linearGradient id="chartGradientDetail" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={primaryColor} stopOpacity="0.5" />
                            <stop offset="100%" stopColor={primaryColor} stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    <path d="M0 100 C 50 120, 100 60, 150 80 S 250 40, 300 60 S 400 20, 450 40 S 480 30, 500 35" fill="none" stroke={primaryColor} strokeWidth="4" strokeLinecap="round"/>
                    <path d="M0 100 C 50 120, 100 60, 150 80 S 250 40, 300 60 S 400 20, 450 40 S 480 30, 500 35 L 500 150 L 0 150 Z" fill="url(#chartGradientDetail)" stroke="none"/>
                </svg>
            </div>
        </div>
    );
};

export default memo(PoolStats);