import React, { useState, useEffect, useRef, memo } from 'react';
import logoImg from '../assets/img/brand/logo.png'; 
import { Wallet, LogOut, ChevronDown } from 'lucide-react';

const formatAddress = (addr) => {
    return addr ? `${addr.substring(0, 6)}...${addr.substring(addr.length-4)}` : '';
}

const Header = ({ activeTab, setActiveTab, lang, toggleLang, t, account, connectWallet, disconnectWallet  }) => {
    const tabsRef = useRef({});
    const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, opacity: 0});

    useEffect(() => {
        const currentTab = tabsRef.current[activeTab];

        if (currentTab) {
            const newLeft = currentTab.offsetLeft + (currentTab.offsetWidth / 2) - 20;

            setIndicatorStyle(prev => {
                if (prev.left === newLeft && prev.opacity === 1) return prev;
                return { left: newLeft, opacity: 1 };
            });
        }
    }, [activeTab]);

    const getLinkClass = (tabName) => {
        const baseClass = "cursor-pointer transition-colors relative group py-2 text-lg ";
        if (activeTab === tabName) {
            return baseClass + "text-[#00d4ff] drop-shadow-[0_0_8px_rgba(0,212,255,0.6)] font-semibold";
        }
        return baseClass + "text-gray-400 hover:text-white font-medium";
    };

    return (
        <div className="w-full flex justify-center pt-8 px-6 relative z-[100]">
            <div className="
                relative w-full max-w-6xl 
                flex items-center justify-between 
                px-8 py-5
                rounded-[2rem] bg-[#0a0e17]/80 backdrop-blur-xl 
                border border-white/10 shadow-2xl
            ">
                {/* LOGO */}
                <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab('swap')}>
                    <img 
                        src={logoImg} 
                        alt="MriyaFi Logo" 
                        className="h-10 w-auto object-contain drop-shadow-[0_0_10px_rgba(0,212,255,0.3)] group-hover:drop-shadow-[0_0_15px_rgba(0,212,255,0.6)] transition-all"
                    />
                    <span className="text-2xl font-bold tracking-wide text-white select-none">
                        Mriya<span className="font-normal text-gray-400 group-hover:text-white transition-colors">Fi</span>
                    </span>
                </div>

                {/* NAVBAR */}
                <nav className="hidden md:flex items-center gap-10 select-none relative">
                    <div
                        className="absolute -bottom-4 h-1 w-10 bg-[#00d4ff] rounded-full shadow-[0_0_10px_#00d4ff] transition-all duration-300 ease-in-out pointer-events-none"
                        style={{
                            left: `${indicatorStyle.left}px`,
                            opacity: indicatorStyle.opacity,
                        }}
                    />
                    
                    {/* Tabs */}
                    {['swap', 'pools', 'earn'].map((tab) => (
                        <div 
                            key={tab}
                            ref={el => tabsRef.current[tab] = el}
                            onClick={() => setActiveTab(tab)} 
                            className={getLinkClass(tab)}
                        >
                            {t[tab] || tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </div>
                    ))}
                </nav>

                {/* RIGHT PART */}
                <div className="flex items-center gap-6 text-sm font-mono select-none">
                    
                    {/* LANGUAGE */}
                    <button 
                        onClick={toggleLang}
                        className="hidden sm:flex items-center gap-1 cursor-pointer hover:bg-white/5 px-3 py-1.5 rounded-lg border border-transparent hover:border-white/10 transition-all"
                    >
                        <span className="text-gray-600">[</span>
                        
                        <span className={`transition-all ${lang === 'en' ? 'text-[#00d4ff] font-bold shadow-cyan-500/50 drop-shadow-[0_0_5px_rgba(0,212,255,0.8)]' : 'text-gray-500 hover:text-gray-300'}`}>
                            EN
                        </span>

                        <span className="text-gray-600">/</span>

                        <span className={`transition-all ${lang === 'ua' ? 'text-[#00d4ff] font-bold shadow-cyan-500/50 drop-shadow-[0_0_5px_rgba(0,212,255,0.8)]' : 'text-gray-500 hover:text-gray-300'}`}>
                            UA
                        </span>

                        <span className="text-gray-600">]</span>
                    </button>

                    {/* CONNECT WALLET */}
                    <div>
                        {!account ? (
                            <button 
                                onClick={connectWallet}
                                className="
                                    group flex items-center gap-2 
                                    bg-gradient-to-r from-[#00d4ff] to-[#0066ff] 
                                    text-white font-bold py-2.5 px-6 rounded-xl 
                                    shadow-[0_0_20px_rgba(0,212,255,0.3)] 
                                    hover:shadow-[0_0_30px_rgba(0,212,255,0.5)] 
                                    hover:scale-105 active:scale-95 transition-all duration-300
                                "
                            >
                                <Wallet size={18} className="group-hover:-rotate-12 transition-transform duration-300" />
                                <span>{t.connect || "Connect"}</span>
                            </button>
                        ) : (
                            <div className="relative group">
                                <button 
                                    className="
                                        flex items-center gap-3 
                                        bg-[#1a2c38] border border-white/10 
                                        text-white font-mono font-bold py-2.5 px-5 rounded-xl 
                                        shadow-lg hover:border-[#00d4ff]/50 transition-all duration-300
                                    "
                                >
                                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 border border-white/20"></div>
                                    
                                    <span className="text-[#00d4ff]">
                                        {formatAddress(account)}
                                    </span>
                                    
                                    <ChevronDown size={16} className="text-gray-400 group-hover:rotate-180 transition-transform duration-300"/>
                                </button>

                                <div className="absolute right-0 top-full mt-2 w-48 py-2 bg-[#131823] border border-white/10 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right z-[200]">
                                    <div className="px-4 py-2 border-b border-white/5 mb-1">
                                        <p className="text-xs text-gray-500">MetaMask Connected</p>
                                    </div>
                                    <button 
                                        onClick={disconnectWallet}
                                        className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-white/5 flex items-center gap-2 transition-colors"
                                    >
                                        <LogOut size={16} />
                                        Disconnect
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
};

export default memo(Header);