import { memo, useCallback, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import MiniChart from '../ui/MiniChart';
import { usePoolData } from '../../hooks/usePoolData';

const PoolItem = ({ pool, t, onSelect, onPoolDataUpdate }) => {
    const { tvl, vol, apr, isHot: isRealHot, loading, reserves } = usePoolData(pool.token0, pool.token1);
    
    const displayTVL = loading ? '...' : tvl;
    const displayVOL = loading ? '...' : vol;
    const displayAPR = loading ? '...' : apr;

    const isHot = loading ? false : isRealHot;

    const handleClick = useCallback(() => {
        onSelect({ ...pool, tvl, vol, apr, isHot, reserves });
    }, [onSelect, pool, tvl, vol, apr, isHot, reserves]);

    useEffect(() => {
        if (!loading && onPoolDataUpdate) {
            onPoolDataUpdate(pool.id, {
                tvl: displayTVL,
                vol: displayVOL,
                apr: displayAPR,
                isHot: isHot,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading, displayTVL, displayVOL, displayAPR, isHot]);

    const chartColor = isHot ? '#f0dfae' : '#00d4ff';
    const borderColor = isHot ? 'border-[#f0dfae]' : 'border-[#00d4ff]';
    const bgColor = isHot ? 'bg-[#f0dfae]' : 'bg-[#00d4ff]';
    const textColor = isHot ? 'text-[#f0dfae]' : 'text-[#00d4ff]';
    const glowColor = isHot ? '#f0dfae' : '#00d4ff';

    return (
        <div 
            className="relative group cursor-pointer isolate min-h-[140px] will-change-transform" 
            onClick={handleClick}
            style={{ contain: 'layout style' }}
        >
            {/* LAYER 3 Decoration */}
            <div className={`
                absolute -bottom-6 left-8 right-8 h-full rounded-[2.5rem] border z-[-20]
                transition-transform duration-500 scale-95 opacity-40
                ${isHot ? 'border-[#f0dfae]/20 bg-[#f0dfae]/5' : 'border-[#00d4ff]/20 bg-[#00d4ff]/5'}
            `}></div>
            
            {/* LAYER 2 Shadow */}
            <div className={`
                absolute -bottom-3 left-4 right-4 h-full rounded-[2.5rem] border z-[-10]
                transition-transform duration-300 scale-[0.98] shadow-lg bg-[#131823]
                ${isHot ? 'border-[#f0dfae]/40' : 'border-[#00d4ff]/40'}
            `}></div>

            {/* MAIN LAYER */}
            <div className={`
                relative z-10 rounded-[2.5rem] p-6 border transition-all duration-300
                bg-[#131823] overflow-hidden
                ${isHot 
                    ? `border-[#f0dfae]/80 shadow-[0_0_20px_rgba(240,223,174,0.1)] group-hover:shadow-[0_0_30px_rgba(240,223,174,0.2)]`
                    : `border-[#00d4ff]/70 shadow-[0_0_20px_rgba(0,212,255,0.1)] group-hover:shadow-[0_0_30px_rgba(0,212,255,0.2)]`
                }
            `}>
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
                    
                    {/* LEFT PART */}
                    <div className="flex flex-col gap-3 w-full md:w-auto">
                        <div className="flex items-center gap-4">
                            <div className="flex -space-x-3">
                                <img src={pool.token0.logo} alt={pool.token0.symbol} className="w-10 h-10 rounded-full border-2 border-[#131823] shadow-md bg-black" loading="lazy" />
                                <img src={pool.token1.logo} alt={pool.token1.symbol} className="w-10 h-10 rounded-full border-2 border-[#131823] shadow-md bg-black" loading="lazy" />
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold text-white tracking-tight">{pool.token0.symbol} / {pool.token1.symbol}</span>
                                <span className="text-m font-bold text-gray-500">{pool.version}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 text-xs md:text-sm text-gray-400 font-mono mt-1">
                            <span>{t.tvl}: <span className="text-white font-semibold">{displayTVL}</span></span>
                            <span className="text-gray-600">|</span>
                            <span>{t.vol}: <span className="text-white font-semibold">{displayVOL}</span></span>
                            <span className="text-gray-600">|</span>
                            <span className={`${textColor} font-bold flex items-center gap-1`}>
                                {t.apr}: {displayAPR}
                                {isHot && <Sparkles size={12} />}
                            </span>
                        </div>
                    </div>

                    {/* RIGHT PART */}
                    <div className="flex flex-col items-end gap-4 w-full md:w-auto min-w-[180px]">
                        <div className="w-full md:w-48 h-16 opacity-90 relative">
                           <MiniChart color={chartColor} id={pool.id} />
                        </div>

                        <button 
                            className={`
                            w-full md:w-auto px-6 py-2 rounded-xl text-sm font-bold transition-colors border tracking-wide shadow-md
                            ${bgColor}/10 ${textColor} ${borderColor}/30 hover:${bgColor}/20
                        `}>
                            {t.deposit}
                        </button>
                    </div>
                </div>

                {/* GLOW EFFECT */}
                <div 
                    className="absolute -right-10 -top-10 w-64 h-64 rounded-full pointer-events-none opacity-15"
                    style={{
                        background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
                        transform: 'translateZ(0)'
                    }}
                />
            </div>
        </div>
    );
};

export default memo(PoolItem);