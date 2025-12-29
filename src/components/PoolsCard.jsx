import React, { useState } from 'react';
import { Search, Flame, Sparkles, ChevronRight } from 'lucide-react';
import PoolDetail from './PoolDetail';

import eth from '../assets/img/tokens/eth.png';
import usdc from '../assets/img/tokens/usdc.png';
import wbtc from '../assets/img/tokens/wrapped-btc.png';
import mfi from '../assets/img/tokens/mfi.png';


const PoolsCard = ({ t }) => {
    const [selectedPool, setSelectedPool] = useState(null);

    const poolsData = [
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
            pair: 'MriyaFi / ETH',
            version: 'V3',
            imgs: [mfi, eth],
            tvl: '$55M',
            vol: '$12M',
            apr: '124.2%',
            isHot: false,
            chartColor: '#00d4ff'
        }
    ];

    if (selectedPool) {
        return (
            <PoolDetail
                pool={selectedPool}
                onBack={() => setSelectedPool(null)}
                t={t.poolDetail || {
                    back: 'Back', tvl: 'TVL', vol: 'Vol', fees: 'Fees', apr: 'APR',
                    position: 'Position', liquidity: 'Liquidity', feesEarned: 'Earned',
                    add: 'Add', remove: 'Remove', transactions: 'Transactions'
                }}
            />
        );
    }

    return (
        <div className="w-full max-w-5xl p-4 animate-fade-in relative z-10">

            {/* TITLE */}
            <div className="text-center mb-8">
                <h2 className="text-4xl font-bold text-white mb-2 tracking-tight">
                    {t.title} <span className="text-gray-500 font-normal">/ {t.subtitle}</span>
                </h2>
            </div>

            {/* SEARCH AND FILTER */}
            <div className="flex gap-4 mb-8">
                {/* SEARCH */}
                <div className="relative flex-grow">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-white transition-colors pointer-events-none z-10">
                        <Search size={24} />
                    </div>

                    <input 
                        type="text" 
                        placeholder={t.searchPlaceholder} 
                        className="w-full bg-[#0a0e17]/50 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00d4ff]/40 focus:bg-[#0a0e17]/70 backdrop-blur-md transition-all shadow-lg relative z-0"
                    />
                </div>

                {/* HOT BUTTON */}
                <button className="flex items-center gap-2 bg-[#0a0e17]/50 border border-white/10 rounded-2xl px-6 py-3 text-white hover:bg-white/5 transition-all backdrop-blur-md shadow-lg font-medium">
                    {t.hot} <Flame size={22} className="text-orange-500 fill-orange-500" />
                    <ChevronRight size={20} className="text-gray-400 ml-1" />
                </button>
            </div>

            {/* CARD LIST */}
            <div className="space-y-12">
                {poolsData.map((pool) => (
                    
                    <div key={pool.id} className="relative group cursor-pointer isolate" onClick={() => setSelectedPool(pool)}>

                        {/* LAYER 3 */}
                        <div className={`
                            absolute -bottom-6 left-8 right-8 h-full rounded-[2.5rem] border z-[-20]
                            transition-all duration-500 scale-95
                            
                            ${pool.isHot ? 'border-[#f0dfae]/40 bg-[#f0dfae]/10' : 'border-[#00d4ff]/40 bg-[#00d4ff]/10'}
                        `}></div>
                        
                        {/* LAYER 2 */}
                        <div className={`
                            absolute -bottom-3 left-4 right-4 h-full rounded-[2.5rem] border z-[-10]
                            transition-all duration-300 scale-[0.98] shadow-2xl
                            backdrop-blur-xl bg-[#1a2c38]/50
                            ${pool.isHot ? 'border-[#f0dfae]/60' : 'border-[#00d4ff]/60'}
                        `}></div>

                        {/* MAIN LAYER */}
                        <div className={`
                            relative z-10 rounded-[2.5rem] p-6 border transition-all duration-300
                            backdrop-blur-xl bg-[#131823]/80 overflow-hidden
                            ${pool.isHot 
                                ? 'border-[#f0dfae]/80 shadow-[0_0_30px_rgba(240,223,174,0.15)] group-hover:shadow-[0_0_50px_rgba(240,223,174,0.3)]'
                                : 'border-[#00d4ff]/70 shadow-[0_0_30px_rgba(0,212,255,0.15)] group-hover:shadow-[0_0_50px_rgba(0,212,255,0.3)]'
                            }
                        `}>

                            <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
                                
                                {/* LEFT PART: Info about pair */}
                                <div className="flex flex-col gap-3 w-full md:w-auto">
                                    <div className="flex items-center gap-4">

                                        {/* ICONS */}
                                        <div className="flex -space-x-3">
                                            <img src={pool.imgs[0]} alt="coin1" className="w-10 h-10 rounded-full border-2 border-[#131823] shadow-lg" />
                                            <img src={pool.imgs[1]} alt="coin2" className="w-10 h-10 rounded-full border-2 border-[#131823] shadow-lg" />
                                        </div>

                                        {/* NAME */}
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-2xl font-bold text-white tracking-tight">{pool.pair}</span>
                                            <span className="text-sm font-bold text-gray-500">{pool.version}</span>
                                        </div>
                                    </div>

                                    {/* STATISTICS */}
                                    <div className="flex items-center gap-3 text-xs md:text-sm text-gray-400 font-mono mt-1">
                                        <span>{t.tvl}: <span className="text-white font-semibold">{pool.tvl}</span></span>
                                        <span className="text-gray-600">|</span>
                                        <span>{t.vol}: <span className="text-white font-semibold">{pool.vol}</span></span>
                                        <span className="text-gray-600">|</span>
                                        <span className={pool.isHot ? "text-[#f0dfae] font-bold flex items-center gap-1" : "text-[#00d4ff] font-bold"}>
                                            {t.apr}: {pool.apr}
                                            {pool.isHot && <Sparkles size={12} />}
                                        </span>
                                    </div>
                                </div>

                                {/* RIGHT PART: Graphic and Button*/}
                                <div className="flex flex-col items-end gap-4 w-full md:w-auto min-w-[180px]">

                                    {/* GRAPHIC */}
                                    <div className="w-full md:w-48 h-16 opacity-80 relative">
                                        <svg viewBox="0 0 120 40" className="w-full h-full drop-shadow-[0_0_10px_rgba(255,255,255,0.1)] overflow-visible">
                                            <path 
                                                d="M0 30 C 20 35, 30 15, 50 20 S 70 5, 90 15 S 110 0, 120 10" 
                                                fill="none" 
                                                stroke={pool.chartColor} 
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                vectorEffect="non-scaling-stroke"
                                            />
                                            <path 
                                                d="M0 30 C 20 35, 30 15, 50 20 S 70 5, 90 15 S 110 0, 120 10 L 120 50 L 0 50 Z" 
                                                fill={`url(#gradient-${pool.id})`} 
                                                opacity="0.25"
                                                stroke="none"
                                            />
                                            <defs>
                                                <linearGradient id={`gradient-${pool.id}`} x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor={pool.chartColor} />
                                                    <stop offset="100%" stopColor="transparent" />
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                    </div>

                                    {/* DEPOSIT BUTTON */}
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedPool(pool);
                                        }}
                                        className={`
                                        w-full md:w-auto px-6 py-2 rounded-xl text-sm font-bold transition-all border tracking-wide shadow-lg
                                        ${pool.isHot
                                            ? 'bg-[#f0dfae]/10 text-[#f0dfae] border-[#f0dfae]/30 hover:bg-[#f0dfae]/20'
                                            : 'bg-[#00d4ff]/10 text-[#00d4ff] border-[#00d4ff]/30 hover:bg-[#00d4ff]/20'
                                        }
                                    `}>
                                        {t.deposit}
                                    </button>
                                </div>
                            </div>
                        </div>
                            {/* DECORATIVE GLOW*/}
                        <div className={`absolute -right-10 -top-10 w-64 h-64 rounded-full blur-[80px] pointer-events-none opacity-15 ${pool.isHot ? 'bg-[#f0dfae]' : 'bg-[#00d4ff]'} `} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PoolsCard;