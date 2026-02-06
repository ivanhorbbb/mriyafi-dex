import { memo, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Search } from 'lucide-react';

const TokenSelectModal = ({ isOpen, onClose, t, tokens, onSelect, activeSymbol, getTokenBalance, getTokenPrice }) => {
    const [searchQuery, setSearchQuery] = useState('');

    if (!isOpen) return null;

    const filteredTokens = tokens.filter((token) => 
        token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return createPortal(
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <div 
                onClick={(e) => e.stopPropagation()} 
                className="relative w-full max-w-md h-[80vh] bg-[#131823] rounded-[2.5rem] p-8 flex flex-col animate-fade-in border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
            >
                {/* TITLE*/}
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white">{t.selectToken}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X size={24} />    
                    </button>
                </div>

                {/* SEARCH*/}
                <div className="relative mb-4">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                    <input 
                        type="text" 
                        placeholder={t.searchPlaceholder}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#0a0e17] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#00d4ff]/50"
                    />
                </div>

                {/* TOKENS LIST*/}
                <div className="flex-1 overflow-y-auto space-y-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                    {filteredTokens.length > 0 ? (
                        filteredTokens.map((token) => {
                            const price = getTokenPrice ? getTokenPrice(token.symbol) : token.price;
                            const displayPrice = price ? parseFloat(price).toFixed(2) : '0.00';

                            return (
                                <div
                                    key={token.symbol}
                                    onClick={() => onSelect(token)}
                                    className={`
                                        flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all
                                        ${activeSymbol === token.symbol
                                            ? 'bg-[#00d4ff]/10 border border-[#00d4ff]/30'
                                            : 'hover:bg-white/5 border border-transparent'
                                        }    
                                    `}
                                >
                                    <div className="flex items-center gap-3">
                                        <img src={token.img} alt={token.symbol} className="w-9 h-9 rounded-full" />
                                        <div className="flex flex-col">
                                            <span className="text-white font-bold">{token.symbol}</span>
                                            <span className="text-gray-500 text-xs">{token.name}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-white font-mono text-sm">
                                            {getTokenBalance(token.symbol)}
                                        </div>
                                        <div className="text-gray-500 text-xs">${displayPrice}</div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center text-gray-500 py-4">
                            No tokens found
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default memo(TokenSelectModal);