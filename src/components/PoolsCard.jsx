import React from 'react';
import { Search, Flame, Sparkles, ChevronRight } from 'lucide-react';

import eth from '../assets/img/tokens/eth.png';
import usdc from '../assets/img/tokens/usdc.png';
import wbtc from '../assets/img/tokens/wrapped-btc.png';
import mfi from '../assets/img/tokens/mfi.png';


const PoolsCard = ({ t }) => {
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

    return (
        <div className="w-full max-w-6xl p-4 animate-fade-in relative z-10">

            {/* TITLE */}
            <div className="text-center mb-10">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
                    {t.title} <span className="text-gray-500 font-normal">/ {t.subtitle}</span>
                </h2>
            </div>

            {/* SEARCH AND FILTER */}
            <div className="flex gap-6 mb-10">
                {/* SEARCH */}
                <div className="relative flex-grow">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-white transition-colors pointer-events-none z-10">
                        <Search size={24} />
                    </div>

                    <input 
                        type="text" 
                        placeholder={t.searchPlaceholder} 
                        className="w-full bg-[#0a0e17]/50 border border-white/10 rounded-3xl py-5 pl-16 pr-6 text-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00d4ff]/40 focus:bg-[#0a0e17]/70 backdrop-blur-md transition-all shadow-lg relative z-0"
                    />
                </div>

                {/* HOT BUTTON */}
                <button className="flex items-center gap-3 bg-[#0a0e17]/50 border border-white/10 rounded-3xl px-8 py-5 text-white hover:bg-white/5 transition-all backdrop-blur-md shadow-lg font-medium">
                    {t.hot} <Flame size={22} className="text-orange-500 fill-orange-500" />
                    <ChevronRight size={20} className="text-gray-400 ml-1" />
                </button>
            </div>

            {/* CARD LIST */}
            <div className="space-y-6">
                {poolsData.map((pool) => (
                    <div
                        key={pool.id}
                        className={`
                            relative group rounded-[2.5rem] p-8 md:p-10 border transition-all duration-300
                            backdrop-blur-xl bg-[#131823]/70 overflow-hidden
                            ${pool.isHot
                                ? 'border-[#f0dfae]/30 hover:border-[#f0dfae]/60 hover:shadow-[0_0_40px_rgba(240,223,174.0.15)]'
                                : 'border-[#00d4ff]/20 hover:border-[#00d4ff]/50 hover:shadow-[0_0_40px_rgba(0,212,255,0.15)]'
                            }
                        `}
                    >
                        <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
                            
                            {/* LEFT PART: Info about pair */}
                            <div className="flex flex-col gap-4 w-full md:w-auto">
                                <div className="flex items-center gap-4">

                                    {/* ICONS */}
                                    <div className="flex -space-x-4">
                                        <img src={pool.imgs[0]} alt="coin1" className="w-14 h-14 rounded-full border-4 border-[#131823] shadow-lg z-10" />
                                        <img src={pool.imgs[1]} alt="coin2" className="w-14 h-14 rounded-full border-4 border-[#131823] shadow-lg" />
                                    </div>

                                    {/* NAME */}
                                    <div className="flex items-baseline gap-3">
                                        <span className="text-3xl md:text-4xl font-bold text-white tracking-tight">{pool.pair}</span>
                                        <span className="text-lg font-bold text-gray-500">{pool.version}</span>
                                    </div>
                                </div>

                                {/* STATISTICS */}
                                <div className="flex items-center gap-4 text-sm md:text-base text-gray-400 font-mono mt-1">
                                    <span>{t.tvl}: <span className="text-white font-semibold">{pool.tvl}</span></span>
                                    <span className="text-gray-600">|</span>
                                    <span>{t.vol}: <span className="text-white font-semibold">{pool.vol}</span></span>
                                    <span className="text-gray-600">|</span>
                                    <span className={pool.isHot ? "text-[#f0dfae] font-bold flex items-center gap-1.5 text-lg" : "text-[#00d4ff] font-bold text-lg"}>
                                        {t.apr}: {pool.apr}
                                        {pool.isHot && <Sparkles size={14} />}
                                    </span>
                                </div>
                            </div>

                            {/* RIGHT PART: Graphic and Button*/}
                            <div className="flex flex-col items-end gap-6 w-full md:w-auto min-w-[200px]">

                                {/* GRAPHIC */}
                                <div className="w-full md:w-64 h-24 opacity-80 relative">
                                    <svg viewBox="0 0 120 40" className="w-full h-full drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] overflow-visible">
                                        {/* LINE */}
                                        <path 
                                            d="M0 30 C 20 35, 30 15, 50 20 S 70 5, 90 15 S 110 0, 120 10" 
                                            fill="none" 
                                            stroke={pool.chartColor} 
                                            strokeWidth="3"
                                            strokeLinecap="round"
                                            vectorEffect="non-scaling-stroke"
                                        />
                                        {/* FILLING */}
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
                                <button className={`
                                    w-full md:w-auto px-8 py-3 rounded-2xl text-base font-bold transition-all border tracking-wide shadow-lg
                                    ${pool.isHot
                                        ? 'bg-[#f0dfae]/10 text-[#f0dfae] border-[#f0dfae]/30 hover:bg-[#f0dfae]/20 hover:scale-105'
                                        : 'bg-[#00d4ff]/10 text-[#00d4ff] border-[#00d4ff]/30 hover:bg-[#00d4ff]/20 hover:scale-105'
                                    }
                                `}>
                                    {t.deposit}
                                </button>
                            </div>
                        </div>

                        {/* DECORATIVE GLOW*/}
                        <div className={`absolute -right-20 -top-20 w-96 h-96 rounded-full blur-[100px] pointer-events-none opacity-20 ${pool.isHot ? 'bg-[#f0dfae]' : 'bg-[#00d4ff]'} `} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PoolsCard;