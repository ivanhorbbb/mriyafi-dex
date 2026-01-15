import { memo } from 'react';
import { Search, Flame, ChevronRight } from 'lucide-react';

const PoolsHeader = ({ t }) => {
    return (
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
    );
};

export default memo(PoolsHeader);