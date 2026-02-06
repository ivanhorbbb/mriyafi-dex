import { memo } from 'react';
import { Search, Flame, ChevronRight, Plus } from 'lucide-react';

const PoolsHeader = ({ 
    t,
    searchQuery,
    setSearchQuery,
    isHotFilter,
    setIsHotFilter,
    onCreatePool
}) => {
    return (
        <div className="relative z-40 w-full px-4 pt-6 md:px-10 md:pt-10">
            <div className="relative">
                <div className="text-center mb-6 md:mb-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">
                        {t.title} <span className="text-gray-500 font-normal">/ {t.subtitle}</span>
                    </h2>
                </div>

                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    {/* SEARCH INPUT */}
                    <div className="relative w-full md:flex-grow">
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10">
                            <Search size={24} />
                        </div>
                        <input 
                            type="text" 
                            placeholder={t.searchPlaceholder}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="
                                w-full 
                                bg-[#0a0e17]/50 border border-white/10 
                                rounded-2xl py-3 pl-12 pr-4 
                                text-lg md:text-xl text-white placeholder-gray-500 
                                focus:outline-none focus:border-[#00d4ff]/40 focus:bg-[#0a0e17]/70 
                                backdrop-blur-md transition-colors shadow-lg
                            "
                        />
                    </div>

                    {/* HOT FILTER BUTTON */}
                    <div className="flex gap-3 w-full md:w-auto">
                        
                        {/* HOT FILTER */}
                        <button 
                            onClick={() => setIsHotFilter(!isHotFilter)}
                            className={`
                                flex-1 md:flex-none flex items-center justify-center gap-2 border rounded-2xl px-6 py-3 transition-colors backdrop-blur-md shadow-lg font-medium whitespace-nowrap
                                ${isHotFilter
                                    ? 'bg-[#f0dfae]/20 border-[#f0dfae] text-[#f0dfae]'
                                    : 'bg-[#0a0e17]/50 border-white/10 text-white hover:bg-white/5'
                                }
                            `}
                        >
                            {t.hot} <Flame size={22} className={isHotFilter ? "fill-[#f0dfae]" : "text-orange-500 fill-orange-500"} />
                            <ChevronRight size={20} className="text-gray-400 ml-1 hidden sm:block" />
                        </button>

                        {/* CREATE POOL BUTTON */}
                        <button 
                            onClick={onCreatePool}
                            className="
                                flex items-center justify-center 
                                bg-[#00d4ff] hover:bg-[#00b3d6] 
                                text-[#0a0e17] rounded-2xl px-5 py-3 
                                transition-colors shadow-lg shadow-[#00d4ff]/20 font-bold
                            "
                            title={t.createPool}
                        >
                            <Plus size={24} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default memo(PoolsHeader);