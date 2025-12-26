import React from 'react';
import { Settings, ArrowUpDown, Info, Fuel, ChevronDown } from 'lucide-react';

import eth from '../assets/tokens/eth.png';
import usdc from '../assets/tokens/usdc.png';

const SwapCard = ({ t }) => {
    return(
        <div className="w-full max-w-[580px] p-4 relative animate-fade-in">

            <div className="backdrop-blur-2xl bg-[#131823]/80 border border-white/10 rounded-[3rem] shadow-2xl p-6 sm:p-8">

                {/* HEADER */}
                <div className="flex justify-between items-center mb-8 px-2">
                    <h2 className="text-2xl font-semibold text-white tracking-wide">{t.title}</h2>
                    <button className="text-gray-400 hover:text-white transition-colors hover:rotate-90 duration-500 p-2 rounded-full hover:bg-white/5">
                        <Settings size={24} />
                    </button>
                </div>

                {/* PAY BLOCK */}
                <div className="relative group z-10">
                    <div className="bg-[#0a0e17]/60 rounded-[2rem] p-6 border border-transparent group-hover:border-[#00d4ff]/30 transition-all duration-300 shadow-none group-hover:shadow-[0_0_40px_rgba(0,212,255,0.08)]">
                    
                        <div className="flex justify-between mb-4">
                            <span className="text-gray-400 text-base font-medium">{t.pay}</span>
                            <span className="text-xs text-[#00d4ff] bg-[#00d4ff]/10 px-3 py-1 rounded-lg cursor-pointer hover:bg-[#00d4ff]/20 transition">Max</span>
                        </div>

                        <div className="flex justify-between items-center mb-2">
                            <button className="flex items-center gap-3 bg-black/30 hover:bg-black/50 px-4 py-2 rounded-full transition-all border border-transparent hover:border-white/10 shrink-0">
                                <img src={eth} alt="ETH" className="w-8 h-8 rounded-full shadow-lg object-contain" />
                                <span className="text-2xl font-bold text-white">ETH</span>
                                <ChevronDown size={20} className="text-gray-400"/>
                            </button>

                            <input
                                type="text"
                                defaultValue="1.5"
                                className="bg-transparent text-right text-5xl font-bold text-white outline-none w-full placeholder-gray-600 font-sans"
                            />
                        </div>

                        <div className="flex justify-end text-xs text-gray-400 font-mono tracking-tight mt-2">
                            {t.balance}: 2.5 = $3,675.00
                        </div>
                    </div>
                </div>

                {/* SWITCH BUTTON */}
                <div className="relative h-4 z-20">
                    <div className="absolute left-1/2 -translate-x-1/2 -top-6">
                        <button className="bg-[#1a2c38] p-3 rounded-2xl border-[6px] border-[#131823] hover:scale-110 hover:border-[#131823] transition-transform duration-200 cursor-pointer group shadow-xl">
                            <ArrowUpDown size={22} className="text-[#00d4ff] group-hover:text-white transition-colors" />
                        </button>
                    </div>
                </div>

                {/* RECEIVE BLOCK */}
                <div className="relative group z-0">
                    <div className="bg-[#0a0e17]/60 rounded-[2rem] p-6 border border-transparent group-hover:border-[#f0dfae]/30 transition-all duration-300 shadow-none group-hover:shadow-[0_0_40px_rgba(240,233,174,0.08)] pt-8">
                        <div className="flex justify-between mb-4">
                            <span className="text-gray-400 text-base font-medium">{t.receive}<span className="text-xs opacity-50">({t.estimated})</span></span>
                        </div>

                        <div className="flex justify-between items-center mb-2">
                            <button className="flex items-center gap-3 bg-black/30 hover:bg-black/50 px-4 py-2 rounded-full transition-all border border-transparent hover:border-white/10 shrink-0">
                                <img src={usdc} alt="USDC" className="w-8 h-8 rounded-full shadow-lg object-contain" />
                                <span className="text-2xl font-bold text-white">USDC</span>
                                <ChevronDown size={20} className="text-gray-400"/>
                            </button>

                            <input 
                                type="text"
                                defaultValue="3672.10"
                                readOnly
                                className="bg-transparent text-right text-5xl font-bold text-[#f0dfae] outline-none w-full"
                                />
                        </div>

                        <div className="flex justify-end text-xs text-green-400/90 font-mono mt-2">
                            ($0.12 {t.cheaper})
                        </div>
                    </div>
                </div>

                {/* INFO */}
                <div className="mt-6 bg-[#0a0e17]/30 rounded-2xl p-5 border border-white/5 space-y-4">
                    <div className="flex justify-between text-sm font-medium text-gray-400">
                        <span className="flex items-center gap-2 cursor-help hover:text-white transition-colors"><Info size={16}/> {t.rate}</span>
                        <span className="font-mono text-gray-200 text-base">1 ETH = 2448.10 USDC</span>
                    </div>
                    <div className="flex justify-between text-sm font-medium text-gray-400">
                        <span className="flex items-center gap-2 cursor-help hover:text-white transition-colors"><Info size={16}/> {t.gas}</span>
                        <span className="font-mono text-[#f0dfae] flex items-center gap-2 text-base">
                            $4.50 <span className="bg-green-500/10 text-green-400 px-2 py-0.5 rounded text-xs font-bold">FAST</span>
                        </span>
                    </div>
                </div>

                {/* MAIN BUTTON */}
                <button className="w-full mt-6 py-5 rounded-2xl bg-gradient-to-r from-[#ffeebb] via-[#f0dfae] to-[#d4c085] text-[#0a0e17] font-bold text-lg tracking-wide hover:shadow-[0_0_35px_rgba(240,223,174,0.3)] hover:scale-[1.01] transition-all active:scale-[0.98] active:opacity-90">
                    {t.button}
                </button>
            </div>
        </div>
    );
};

export default SwapCard;