import { memo } from 'react';
import { createPortal } from 'react-dom';
import { X, HelpCircle } from 'lucide-react';

const SettingsModal = ({ isOpen, onClose, t, slippage, setSlippage, deadline, setDeadline }) => {
    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()} 
                className="relative w-full max-w-lg bg-[#131823]/95 backdrop-blur-xl rounded-[2.5rem] p-8 flex flex-col animate-fade-in border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
            >
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-bold text-white">{t.settings.title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white p-2 bg-white/10 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Slippage */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-4 text-gray-400 text-sm font-medium">
                        {t.settings.slippage}
                        <div className="group relative flex items-center">
                            <HelpCircle size={16} className="cursor-help text-gray-500 hover:text-white transition-colors" />
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-3 bg-gray-900 text-xs text-gray-200 rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50 text-center shadow-xl border border-white/10">
                                {t.settings.slippageInfo}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900" />
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        {[0.1, 0.5, 1.0].map((val) => (
                            <button
                                key={val}
                                onClick={() => setSlippage(val)}
                                className={`px-5 py-3 rounded-2xl text-sm font-bold border transition-all ${slippage === val ? 'bg-[#00d4ff]/20 border-[#00d4ff]' : 'bg-[#0a0e17] border-white/10 text-gray-300 hover:border-white/30'}`}
                            >
                                {val}%
                            </button>
                        ))}
                        <div className={`flex items-center px-4 rounded-2xl border ${![0.1, 0.5, 1.0].includes(slippage) ? 'border-[#00d4ff]' : 'border-white/10'} bg-[#0a0e17] flex-1`}>
                            <input 
                                type="number"
                                placeholder="Custom"
                                value={slippage}
                                onChange={(e) => setSlippage(parseFloat(e.target.value))} 
                                className="w-full bg-transparent text-white text-right outline-none font-bold" 
                            />
                            <span className="text-gray-500 ml-1">%</span>
                        </div>
                    </div>
                </div>

                {/* Deadline */}
                <div>
                    <div className="flex items-center gap-2 mb-4 text-gray-400 text-sm font-medium">
                        {t.settings.deadline} 
                        <div className="group relative flex items-center">
                            <HelpCircle size={16} className="cursor-help text-gray-500 hover:text-[#00d4ff] transition-colors" />
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-3 bg-gray-900 text-xs text-gray-200 rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50 text-center shadow-xl border border-white/10">
                                {t.settings.deadlineInfo}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900" />
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-32 bg-[#0a0e17] border border-white/10 rounded-2xl px-4 flex items-center">
                            <input 
                                type="number" 
                                value={deadline}
                                onChange={(e) => setDeadline(e.target.value)}
                                className="w-full bg-transparent text-white text-right outline-none font-bold py-3" 
                            />
                        </div>
                        <span className="text-gray-400 text-sm font-medium">{t.settings.minutes}</span>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default memo(SettingsModal);