import { memo } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Loader2, ArrowDown } from 'lucide-react';

const LiquidityModal = ({ 
    isOpen, 
    onClose, 
    modalType, 
    isTransacting, 
    statusMsg, 
    data,
    handlers,
    symbols, 
    tokens,
    isPoolEmpty,
    t,
    formatTokenAmount 
}) => {
    if (!isOpen) return null;

    const { symbolA, symbolB } = symbols;
    const { amountA, amountB, removeAmount, balanceA, balanceB, lpBalance } = data;
    const { onAmountAChange, onAmountBChange, onRemoveAmountChange, setRemoveMax, onAdd, onRemove } = handlers;

    const modalContent = (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => !isTransacting && onClose()}>
            <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-lg bg-[#131823] border border-white/10 rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.6)] p-8 flex flex-col overflow-hidden animate-fade-in">
                
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-white">{modalType === 'add' ? t.modal.addLiquidity : t.modal.removeLiquidity}</h3>
                    {!isTransacting && <button onClick={onClose} className="text-gray-400 hover:text-white p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24} /></button>}
                </div>

                {isTransacting ? (
                    <div className="flex flex-col items-center justify-center py-10 space-y-4">
                        <Loader2 className="animate-spin text-[#f0dfae] w-16 h-16" />
                        <span className="text-xl font-bold text-white text-center">{statusMsg}</span>
                    </div>
                ) : (
                    <>
                        {modalType === 'add' ? (
                            <div className="space-y-4">
                                {/* Input A */}
                                <div className="bg-[#0a0e17]/60 p-4 rounded-2xl border border-white/5 hover:border-[#00d4ff]/30 transition-colors">
                                    <div className="flex justify-between text-sm text-gray-400 mb-2">
                                        <span>{t.modal.input}</span>
                                        <span>{t.modal.balance}: {formatTokenAmount(balanceA)}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <input type="text" value={amountA} onChange={onAmountAChange} placeholder="0.0" className="w-full bg-transparent text-3xl font-bold text-white outline-none placeholder-gray-600"/>
                                        <div className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-full border border-white/10 shrink-0">
                                            <img src={tokens.token0.logo} alt="" className="w-7 h-7 rounded-full" />
                                            <span className="font-bold text-white text-lg">{symbolA}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-center -my-2 relative z-10">
                                    <div className="bg-[#1a2c38] p-2 rounded-xl border-4 border-[#131823]"><Plus size={20} className="text-gray-400" /></div>
                                </div>

                                {/* Input B */}
                                <div className="bg-[#0a0e17]/60 p-4 rounded-2xl border border-white/5 hover:border-[#00d4ff]/30 transition-colors">
                                    <div className="flex justify-between text-sm text-gray-400 mb-2">
                                        <span>{t.modal.input}</span>
                                        <span>{t.modal.balance}: {formatTokenAmount(balanceB)}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <input type="text" value={amountB} onChange={onAmountBChange} placeholder="0.0" className="w-full bg-transparent text-3xl font-bold text-white outline-none placeholder-gray-600"/>
                                        <div className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-full border border-white/10 shrink-0">
                                            <img src={tokens.token1.logo} alt="" className="w-7 h-7 rounded-full" />
                                            <span className="font-bold text-white text-lg">{symbolB}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                {isPoolEmpty && (
                                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-yellow-200 text-sm text-center">
                                        Pool liquidity is very low. You are setting the initial price.<br/>
                                        <strong>Input amounts for BOTH tokens manually.</strong>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="p-4 bg-white/5 rounded-2xl text-center">
                                    <span className="text-gray-400 text-sm block mb-1">{t.modal.yourLiquidity}</span>
                                    <span className="text-3xl font-bold text-white">{lpBalance.toFixed(6)} LP</span>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm text-gray-400">
                                        <span>{t.modal.amountToRemove}</span>
                                        <span className="text-[#00d4ff] cursor-pointer hover:text-white" onClick={setRemoveMax}>Max</span>
                                    </div>
                                    <input 
                                        type="number" 
                                        value={removeAmount} 
                                        onChange={onRemoveAmountChange}
                                        placeholder="0.00" 
                                        className="w-full bg-[#0a0e17]/60 border border-white/10 rounded-2xl py-4 px-4 text-2xl text-white font-mono placeholder-gray-600 focus:outline-none focus:border-[#00d4ff]"
                                    />
                                </div>
                                <div className="flex justify-center">
                                    <ArrowDown size={24} className="text-gray-500" />
                                </div>
                                <div className="text-xs text-gray-500 text-center">
                                    Receiving: ~{symbolA} + {symbolB} based on pool share
                                </div>
                            </div>
                        )}

                        <button 
                            onClick={modalType === 'add' ? onAdd : onRemove} 
                            disabled={modalType === 'add' ? (!amountA || !amountB) : (!removeAmount)}
                            className={`w-full mt-8 py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-[#ffeebb] via-[#f0dfae] to-[#d4c085] text-[#0a0e17] hover:scale-[1.02] shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {modalType === 'add' ? t.modal.supply : t.modal.remove}
                        </button>
                    </>
                )}
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};

export default memo(LiquidityModal);