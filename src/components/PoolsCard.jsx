import React, { useState, useCallback, memo } from 'react';
import { Search, Flame, Sparkles, ChevronRight } from 'lucide-react';
import PoolDetail from './PoolDetail';

import eth from '../assets/img/tokens/eth.png';
import usdc from '../assets/img/tokens/usdc.png';
import wbtc from '../assets/img/tokens/wrapped-btc.png';
import mfi from '../assets/img/tokens/mfi.png';
import weth from '../assets/img/tokens/wrapped-eth.png';

const POOLS_DATA = [
        {
            id: 1,
            pair: 'ETH / USDC',
            version: 'V3',
            imgs: [eth, usdc],
            tvl: '$450M',
            vol: '$120M',
            apr: '18.5%',
            isHot: true,
            chartColor: '#f0dfae'
        },
        {
            id: 2,
            pair: 'WBTC / ETH',
            version: 'V3',
            imgs: [wbtc, eth],
            tvl: '$210M',
            vol: '$80M',
            apr: '4.2%',
            isHot: false,
            chartColor: '#00d4ff'
        },
        {
            id: 3,
            pair: 'MFI / ETH',
            version: 'V3',
            imgs: [mfi, eth],
            tvl: '$55M',
            vol: '$12M',
            apr: '124.2%',
            isHot: false,
            chartColor: '#00d4ff'
        },
        {
            id: 4,
            pair: 'ETH / WETH',
            version: 'V3',
            imgs: [eth, weth],
            tvl: '$50M',
            vol: '$10M',
            apr: '35.45%',
            isHot: true,
            chartColor: '#f0dfae'
        },
        { 
            id: 5, 
            pair: 'USDC / USDT', 
            version: 'V3', 
            imgs: [usdc, usdc], 
            tvl: '$900M', 
            vol: '$450M', 
            apr: '2.1%', 
            isHot: false, 
            chartColor: '#00d4ff' 
        }
    ];

    const MiniChart = memo(({ color, id }) => (
        <svg viewBox="0 0 120 40" className="w-full h-full overflow-visible" shapeRendering="optimizeSpeed">
            <defs>
                <linearGradient id={`gradient-${id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} />
                    <stop offset="100%" stopColor="transparent" />
                </linearGradient>
            </defs>
            <path d="M0 30 C 20 35, 30 15, 50 20 S 70 5, 90 15 S 110 0, 120 10" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <path d="M0 30 C 20 35, 30 15, 50 20 S 70 5, 90 15 S 110 0, 120 10 L 120 50 L 0 50 Z" fill={`url(#gradient-${id})`} opacity="0.25" stroke="none" />
        </svg>
    ));

    const PoolItem = memo(({ pool, t, onSelect }) => {
    const handleClick = useCallback(() => {
        onSelect(pool);
    }, [onSelect, pool]);

    const borderColor = pool.isHot ? 'border-[#f0dfae]' : 'border-[#00d4ff]';
    const bgColor = pool.isHot ? 'bg-[#f0dfae]' : 'bg-[#00d4ff]';
    const textColor = pool.isHot ? 'text-[#f0dfae]' : 'text-[#00d4ff]';

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
                ${borderColor}/20 ${bgColor}/5
            `}></div>
            
            {/* LAYER 2 Shadow */}
            <div className={`
                absolute -bottom-3 left-4 right-4 h-full rounded-[2.5rem] border z-[-10]
                transition-transform duration-300 scale-[0.98] shadow-lg bg-[#131823]
                ${borderColor}/40
            `}></div>

            {/* MAIN LAYER */}
            <div className={`
                relative z-10 rounded-[2.5rem] p-6 border transition-all duration-300
                bg-[#131823] overflow-hidden
                ${pool.isHot 
                    ? `border-[#f0dfae]/80 shadow-[0_0_20px_rgba(240,223,174,0.1)] group-hover:shadow-[0_0_30px_rgba(240,223,174,0.2)]`
                    : `border-[#00d4ff]/70 shadow-[0_0_20px_rgba(0,212,255,0.1)] group-hover:shadow-[0_0_30px_rgba(0,212,255,0.2)]`
                }
            `}>
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
                    
                    {/* LEFT PART */}
                    <div className="flex flex-col gap-3 w-full md:w-auto">
                        <div className="flex items-center gap-4">
                            <div className="flex -space-x-3">
                                <img src={pool.imgs[0]} alt="c1" className="w-10 h-10 rounded-full border-2 border-[#131823] shadow-md" loading="lazy" />
                                <img src={pool.imgs[1]} alt="c2" className="w-10 h-10 rounded-full border-2 border-[#131823] shadow-md" loading="lazy" />
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold text-white tracking-tight">{pool.pair}</span>
                                <span className="text-sm font-bold text-gray-500">{pool.version}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 text-xs md:text-sm text-gray-400 font-mono mt-1">
                            <span>{t.tvl}: <span className="text-white font-semibold">{pool.tvl}</span></span>
                            <span className="text-gray-600">|</span>
                            <span>{t.vol}: <span className="text-white font-semibold">{pool.vol}</span></span>
                            <span className="text-gray-600">|</span>
                            <span className={`${textColor} font-bold flex items-center gap-1`}>
                                {t.apr}: {pool.apr}
                                {pool.isHot && <Sparkles size={12} />}
                            </span>
                        </div>
                    </div>

                    {/* RIGHT PART */}
                    <div className="flex flex-col items-end gap-4 w-full md:w-auto min-w-[180px]">
                        <div className="w-full md:w-48 h-16 opacity-90 relative">
                           <MiniChart color={pool.chartColor} id={pool.id} />
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
                        background: `radial-gradient(circle, ${pool.isHot ? '#f0dfae' : '#00d4ff'} 0%, transparent 70%)`,
                        transform: 'translateZ(0)'
                    }}
                />
            </div>
        </div>
    );
});

const PoolsCard = ({ t }) => {
    const [selectedPool, setSelectedPool] = useState(null);

    const handleSelectPool = useCallback((pool) => {
        setSelectedPool(pool);
    }, []);

    const handleBack = useCallback(() => {
        setSelectedPool(null);
    }, []);

    if (selectedPool) {
        return (
            <PoolDetail
                pool={selectedPool}
                onBack={handleBack}
                t={t.poolDetail || {
                    back: 'Back', tvl: 'TVL', vol: 'Vol', fees: 'Fees', apr: 'APR',
                    position: 'Position', liquidity: 'Liquidity', feesEarned: 'Earned',
                    add: 'Add', remove: 'Remove', transactions: 'Transactions'
                }}
            />
        );
    }

    return (
        <div className="w-full flex justify-center p-4 animate-fade-in relative z-10">
            {/* Main Wrapper */}
            <div className="
                relative w-full max-w-5xl h-[800px] 
                rounded-[3rem] 
                shadow-2xl 
                bg-[#131823]/95 backdrop-blur-md 
                overflow-hidden isolate
            ">
                <div className="absolute inset-0 rounded-[3rem] border border-white/10 pointer-events-none z-50"></div>
                
                {/* Header Section */}
                <div className="absolute top-0 left-0 right-0 z-40 h-[280px] w-full bg-gradient-to-b from-[#131823] from-40% via-[#131823]/95 via-70% to-transparent pointer-events-none px-8 pt-10 sm:px-10">
                    <div className="pointer-events-auto relative">
                        <div className="text-center mb-8">
                            <h2 className="text-4xl font-bold text-white mb-2 tracking-tight">
                                {t.title} <span className="text-gray-500 font-normal">/ {t.subtitle}</span>
                            </h2>
                        </div>

                        <div className="flex gap-4">
                            <div className="relative flex-grow">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10">
                                    <Search size={24} />
                                </div>
                                <input 
                                    type="text" 
                                    placeholder={t.searchPlaceholder} 
                                    className="w-full bg-[#0a0e17]/50 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00d4ff]/40 focus:bg-[#0a0e17]/70 backdrop-blur-md transition-colors shadow-lg"
                                />
                            </div>
                            <button className="flex items-center gap-2 bg-[#0a0e17]/50 border border-white/10 rounded-2xl px-6 py-3 text-white hover:bg-white/5 transition-colors backdrop-blur-md shadow-lg font-medium whitespace-nowrap">
                                {t.hot} <Flame size={22} className="text-orange-500 fill-orange-500" />
                                <ChevronRight size={20} className="text-gray-400 ml-1" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* List Section */}
                <div className="h-full overflow-y-auto overflow-x-hidden px-8 sm:px-10 pt-[220px] pb-10 space-y-12 custom-scrollbar relative z-10">
                    {POOLS_DATA.map((pool) => (
                        <PoolItem key={pool.id} pool={pool} t={t} onSelect={handleSelectPool} />
                    ))}
                </div>
            </div>

            <style jsx>{`
                .custom-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                .custom-scrollbar::-webkit-scrollbar { display: none; }
            `}</style>
        </div>
    );
};

export default memo(PoolsCard);