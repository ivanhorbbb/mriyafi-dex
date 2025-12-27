import React from 'react';
import logoImg from '../assets/img/brand/logo.png'; 

const Header = ({ activeTab, setActiveTab, lang, toggleLang, t }) => {

    const getLinkClass = (tabName) => {
        const baseClass = "cursor-pointer transition-colors relative group py-2 text-lg "; // Збільшив шрифт (text-lg)
        if (activeTab === tabName) {
            return baseClass + "text-[#00d4ff] drop-shadow-[0_0_8px_rgba(0,212,255,0.6)] font-semibold";
        }
        return baseClass + "text-gray-400 hover:text-white font-medium";
    };

    return (
        <div className="w-full flex justify-center pt-8 px-6 z-50">
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
                <nav className="hidden md:flex items-center gap-10 select-none">
                    <div onClick={() => setActiveTab('swap')} className={getLinkClass('swap')}>
                        {t.swap}
                        {activeTab === 'swap' && (
                            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-10 h-1 bg-[#00d4ff] rounded-full shadow-[0_0_10px_#00d4ff]" />
                        )}
                    </div>
                    <div onClick={() => setActiveTab('pools')} className={getLinkClass('pools')}>
                        {t.pools}
                        {activeTab === 'pools' && (
                            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-10 h-1 bg-[#00d4ff] rounded-full shadow-[0_0_10px_#00d4ff]" />
                        )}
                    </div>
                    <div onClick={() => setActiveTab('earn')} className={getLinkClass('earn')}>
                        {t.earn}
                        {activeTab === 'earn' && (
                            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-10 h-1 bg-[#00d4ff] rounded-full shadow-[0_0_10px_#00d4ff]" />
                        )}
                    </div>
                </nav>

                {/* RIGHT PART */}
                <div className="flex items-center gap-6 text-sm font-mono select-none">
                    
                    {/* LANGUAGE */}
                    <button 
                        onClick={toggleLang}
                        className="hidden sm:block text-gray-400 hover:text-white hover:bg-white/10 px-3 py-1 rounded-lg transition-all border border-transparent hover:border-white/10"
                    >
                        [{lang === 'en' ? 'EN' : 'UA'}]
                    </button>

                    <div className="text-gray-200 bg-white/5 px-5 py-2.5 rounded-xl border border-white/5 hover:border-white/20 hover:bg-white/10 cursor-pointer transition-all flex items-center gap-3 shadow-lg">
                        <span className="text-[#00d4ff] font-bold text-base">0.05 ETH</span>
                        <span className="text-gray-600">|</span>
                        <span className="opacity-70">0xab4...8c</span>
                    </div>
                </div>
            </div>
        </div>
    )
};

export default Header;