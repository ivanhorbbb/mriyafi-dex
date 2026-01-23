import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronDown, ArrowLeft } from 'lucide-react';
import { TOKENS } from '../../constants/tokens';

const CreatePoolModal = ({ t, isOpen, onClose, onCreate }) => {
    const [token0, setToken0] = useState(TOKENS[0]);
    const [token1, setToken1] = useState(TOKENS[1]);
    const [selectingToken, setSelectingToken] = useState(null);

    if (!isOpen) return null;

    const handleTokenSelect = (token) => {
        if (selectingToken === 'token0') {
            if (token.symbol === token1.symbol) setToken1(token0);
            setToken0(token);
        } else {
            if (token.symbol === token0.symbol) setToken0(token1);
            setToken1(token);
        }
        setSelectingToken(null);
    };

    const handleCreateClick = () => {
        onCreate(token0, token1);
        onClose();
    };

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => !selectingToken && onClose()}>
            <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-2xl bg-[#131823] border border-white/10 rounded-[2.5rem] p-10 flex flex-col shadow-2xl animate-fade-in">

                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-white">{t.createPoolTitle}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24} /></button>
                </div>

                {/* Token Selectors */}
                {selectingToken ? (
                    <div className="flex-1 overflow-y-auto max-h-[500px] space-y-3 pr-2 custom-scrollbar">
                        <div className="mb-2 text-sm text-gray-400">{t.poolDetail.modal.input}</div>
                        {TOKENS.map((token) => (
                            <button
                                key={token.symbol}
                                onClick={() => handleTokenSelect(token)}
                                className="w-ful flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition-colors">
                                    <img src={token.img} alt={token.symbol} className="w-8 h-8 rounded-full" />
                                    <div className="text-left">
                                        <div className="text-white font-bold">{token.symbol}</div>
                                        <div className="text-xs text-gray-500">{token.name}</div>
                                    </div>
                                </button>
                            ))}
                            <button onClick={() => setSelectingToken(null)} className="w-full mt-4 py-2 text-gray-400 hover:text-white">Cancel</button>
                        </div>
                ) : (
                    <div className="space-y-4">
                        <div className="p-4 bg-[#0a0e17]/60 rounded-2xl border border-white/5 flex justify-between items-center cursor-pointer hover:border-[#00d4ff]/30 transition-colors" onClick={() => setSelectingToken('token0')}>
                            <div className="flex items-center gap-3">
                                <img src={token0.img} alt={token0.symbol} className="w-10 h-10 rounded-full" />
                                <span className="text-xl font-bold text-white">{token0.symbol}</span>
                            </div>
                            <ChevronDown className="text-gray-500" />
                        </div>

                        <div className="flex justify-center text-gray-500"><ArrowLeft size={24} /></div>

                        <div className="p-4 bg-[#0a0e17]/60 rounded-2xl border border-white/5 flex justify-between items-center cursor-pointer hover:border-[#00d4ff]/30 transition-colors" onClick={() => setSelectingToken('token1')}>
                            <div className="flex items-center gap-3">
                                <img src={token1.img} alt={token1.symbol} className="w-10 h-10 rounded-full" />
                                <span className="text-xl font-bold text-white">{token1.symbol}</span>
                            </div>
                            <ChevronDown className="text-gray-500" />
                        </div>

                        <button 
                            onClick={handleCreateClick}
                            className="w-full mt-6 py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-[#00d4ff] via-[#00aaff] to-[#0088ff] text-white hover:scale-[1.02] shadow-lg transition-all"
                        >
                            {t.initializePool}
                        </button>
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
};

export default CreatePoolModal;