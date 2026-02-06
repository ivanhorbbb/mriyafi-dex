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
            onClick={handleClick}
            className={`
                group relative cursor-pointer isolate 
                w-full
                bg-[#131823]/80 backdrop-blur-xl 
                border hover:border-opacity-100 transition-all duration-300
                rounded-3xl p-5 md:p-6
                hover:-translate-y-1 hover:shadow-xl
                flex flex-col md:flex-row md:items-center justify-between gap-6
                ${isHot 
                    ? 'border-[#f0dfae]/30 shadow-[0_10px_30px_-10px_rgba(240,223,174,0.1)]' 
                    : 'border-white/5 hover:border-[#00d4ff]/30 hover:shadow-[0_10px_30px_-10px_rgba(0,212,255,0.1)]'
                }
            `}
        >
            {/* GLOW EFFECT (Background) */}
            <div 
                className="absolute -right-10 -top-10 w-40 h-40 rounded-full pointer-events-none opacity-20 blur-3xl transition-opacity group-hover:opacity-30"
                style={{ background: chartColor }}
            />
                    
                    {/* LEFT PART: Tokens & Stats */}
            <div className="flex flex-col gap-4 z-10 w-full md:w-auto">
                
                {/* Header: Icons + Name */}
                <div className="flex items-center gap-4">
                    <div className="flex -space-x-3 shrink-0">
                        <img src={pool.token0.logo} alt={pool.token0.symbol} className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-[#131823] bg-black" />
                        <img src={pool.token1.logo} alt={pool.token1.symbol} className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-[#131823] bg-black" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-xl md:text-2xl font-bold text-white leading-none group-hover:text-[#00d4ff] transition-colors">
                                {pool.token0.symbol} / {pool.token1.symbol}
                            </h3>
                            {isHot && <Sparkles size={16} className="text-[#f0dfae] animate-pulse" />}
                        </div>
                        <span className="text-xs font-mono text-gray-500 bg-white/5 px-2 py-0.5 rounded border border-white/5 inline-block mt-1">
                            {pool.version}
                        </span>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="flex items-center gap-3 text-xs md:text-sm text-gray-400 font-mono">
                    <div className="flex flex-col">
                        <span className="uppercase text-[10px] tracking-wider opacity-60">{t.tvl}</span>
                        <span className="text-white font-semibold">{displayTVL}</span>
                    </div>
                    <div className="w-px h-6 bg-white/10 mx-1"></div>
                    <div className="flex flex-col">
                        <span className="uppercase text-[10px] tracking-wider opacity-60">{t.vol}</span>
                        <span className="text-white font-semibold">{displayVOL}</span>
                    </div>
                    <div className="w-px h-6 bg-white/10 mx-1"></div>
                    <div className="flex flex-col">
                        <span className="uppercase text-[10px] tracking-wider opacity-60">{t.apr}</span>
                        <span className={`${textColor} font-bold`}>{displayAPR}</span>
                    </div>
                </div>
            </div>

                    {/* RIGHT PART: Chart & Button */}
            <div className="flex flex-col md:flex-row items-end md:items-center gap-4 w-full md:w-auto z-10">
                
                {/* Mini Chart (Full width on mobile, fixed on desktop) */}
                <div className="w-full md:w-32 h-12 relative opacity-80 group-hover:opacity-100 transition-opacity">
                    <MiniChart color={chartColor} id={pool.id} />
                </div>

                {/* Deposit Button */}
                <button 
                    className={`
                        w-full md:w-auto px-6 py-3 rounded-xl 
                        text-sm font-bold transition-all border tracking-wide shadow-lg
                        flex items-center justify-center gap-2
                        ${isHot 
                            ? 'bg-[#f0dfae]/10 text-[#f0dfae] border-[#f0dfae]/30 hover:bg-[#f0dfae] hover:text-[#0a0e17]' 
                            : 'bg-[#1a2c38] text-[#00d4ff] border-[#00d4ff]/30 hover:bg-[#00d4ff] hover:text-[#0a0e17]'
                        }
                    `}
                >
                    {t.deposit}
                    <ArrowUpRight size={16} />
                </button>
            </div>
        </div>
    );
};

export default memo(PoolItem);