import { useMemo, memo } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import SimpleTooltip from '../ui/SimpleTooltip';
import MiniChart from '../ui/MiniChart';

const PoolStats = ({ reserves, loading, symbols, t, pool, formatTokenAmount, formatTooltip }) => {
    const { symbolA, symbolB } = symbols;
    const primaryColor = pool.isHot ? '#f0dfae' : '#00d4ff';
    const primaryClass = pool.isHot ? 'text-[#f0dfae]' : 'text-[#00d4ff]';
    const safeT = t;

    const formattedFees = useMemo(() => {
        if (!pool || !pool.tvl || !pool.apr) return '$0.00';

        const parseAmount = (str) => {
            const clean = str.toString().replace(/[$,%]/g, '');
            let val = parseFloat(clean);
            if (str.toString().includes('M')) return val * 1000000;
            if (str.toString().includes('K')) return val * 1000;
            return val || 0;
        }

        const tvl = parseAmount(pool.tvl);
        const apr = parseAmount(pool.apr);

        const dailyFees = (apr / 100) * tvl / 365;

        if (dailyFees === 0) return '$0.00';
        if (dailyFees < 0.01) return '< $0.01';
        if (dailyFees >= 1000) return `$${(dailyFees / 1000).toFixed(2)}K`;
        return `$${dailyFees.toFixed(2)}`;
    }, [pool]);

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
                    <div className="text-white text-2xl font-bold tracking-tight truncate">{formattedFees}</div>
                </div>
                
                <div className="text-left md:text-right min-w-0">
                    <div className="text-gray-400 text-sm mb-1 font-medium truncate">{t.apr}</div>
                    <div className={`text-2xl font-bold flex items-center md:justify-end gap-2 ${primaryClass} truncate`}>
                        {pool.apr} <Sparkles size={18} className="shrink-0"/>
                    </div>
                </div>
            </div>
            
            {/* Chart SVG Placeholder */}
            <div className="flex-grow w-full relative mt-4 overflow-hidden rounded-xl flex items-end">
                
                <div className="w-full h-[200px] opacity-100 relative z-10 flex items-end">
                    <MiniChart 
                        poolId={`${symbolA}-${symbolB}`} 
                        color={primaryColor} 
                        width={800} 
                        height={200}
                        withFill={true}
                        className="w-full h-full"
                    />
                </div>
            </div>
        </div>
    );
};

export default memo(PoolStats);