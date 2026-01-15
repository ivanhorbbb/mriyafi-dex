import { memo } from 'react';
import { Settings, ChevronDown, ArrowUpDown, Info, Fuel } from 'lucide-react';
import { FocusGlowInput, AnimatedNumber, AnimatedIcon, AnimatedText, ShimmerButton } from '../Animations'; 

const SwapForm = ({
    t,
    themeStyles,
    onOpenSettings,
    payAmount,
    onPayInput,
    getTokenBalance,
    payToken,
    onOpenTokenModal,
    handleMaxClick,
    payUsdValue,
    handleSwapArrows,
    receiveAmount,
    onReceiveInput,
    receiveToken,
    receiveUsdValue,
    displayRate,
    gasPriceUsd,
    isSwapping,
    isInsufficientBalance,
    isEnterAmount,
    handleSwap
}) => {
    
    let buttonText = t.button;
    if (isSwapping) buttonText = "Swapping...";
    else if (isEnterAmount) buttonText = "Enter Amount";
    else if (isInsufficientBalance) buttonText = "Insufficient Balance";

    return (
        <div className="lg:col-span-1">
            <div className="
                relative w-full h-full min-h-[550px]
                backdrop-blur-2xl bg-[#131823]/80 border border-white/10 rounded-[3rem] 
                shadow-2xl p-6 sm:p-8 flex flex-col
            ">
                {/* Swap Header */}
                <div className="flex justify-between items-center mb-6 px-2">
                    <h2 className="text-2xl font-semibold text-white tracking-wide">{t.title}</h2>
                    <button 
                        onClick={onOpenSettings}
                        className="text-gray-400 hover:text-white transition-colors hover:rotate-90 duration-500 p-2 rounded-full hover:bg-white/5">
                        <Settings size={24} />
                    </button>
                </div>

                {/* PAY INPUT */}
                <FocusGlowInput>
                    <div className="flex justify-between mb-3">
                        <span className="text-gray-400 text-sm font-medium">{t.pay}</span>
                        <span className="text-gray-400 text-xs font-mono flex items-center gap-1">
                            {t.balance}: <AnimatedNumber value={getTokenBalance(payToken.symbol)} />
                        </span>
                    </div>
                    <div className="flex justify-between items-center gap-4">
                        <input
                            type="text"
                            value={payAmount}
                            onChange={onPayInput}
                            placeholder='0'
                            className="bg-transparent text-3xl font-bold text-white outline-none w-full placeholder-gray-600 font-sans"
                        />
                        <button onClick={() => onOpenTokenModal('pay')} className="group flex items-center gap-2 bg-[#1a2c38] hover:bg-[#233545] px-3 py-1.5 rounded-full transition-all border border-white/10 shrink-0 shadow-lg active:scale-95">
                            <AnimatedIcon src={payToken.img} alt={payToken.symbol} className="w-6 h-6" />
                            <span className="font-bold text-white">
                                <AnimatedText content={payToken.symbol} />
                            </span>
                            <ChevronDown size={16} className="text-gray-400 group-hover:text-white transition-colors"/>
                        </button>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-500 flex gap-1">
                            ≈ $<AnimatedNumber value={payUsdValue} />
                        </span>
                        <button onClick={handleMaxClick} className={`text-xs px-2 py-0.5 rounded transition font-bold ${themeStyles.maxButton}`}>Max</button>
                    </div>
                </FocusGlowInput>

                {/* SWITCH */}
                <div className="relative h-4 flex justify-center items-center my-2 z-10">
                    <button onClick={handleSwapArrows} className={`absolute bg-[#1a2c38] p-2 rounded-xl border-[4px] border-[#131823] hover:scale-110 hover:border-[#131823] transition-all duration-200 cursor-pointer shadow-xl hover:rotate-180 ${themeStyles.textAccent}`}>
                        <ArrowUpDown size={20} />
                    </button>
                </div>

                {/* RECEIVE INPUT */}
                <div className={`bg-[#0a0e17]/60 rounded-[2rem] p-5 border border-transparent transition-all duration-300 ${themeStyles.hoverBorder}`}>
                    <div className="flex justify-between mb-3">
                        <span className="text-gray-400 text-sm font-medium">{t.receive}</span>
                        <span className="text-gray-400 text-xs font-mono flex items-center gap-1">
                            {t.balance}: <AnimatedNumber value={getTokenBalance(receiveToken.symbol)} />
                        </span>
                    </div>
                    <div className="flex justify-between items-center gap-4">
                        <input 
                            type="text" 
                            value={receiveAmount}
                            onChange={onReceiveInput}
                            placeholder='0'
                            className="bg-transparent text-3xl font-bold text-[#f0dfae] outline-none w-full placeholder-gray-600"
                        />
                        <button onClick={() => onOpenTokenModal('receive')} className="group flex items-center gap-2 bg-[#1a2c38] hover:bg-[#233545] px-3 py-1.5 rounded-full transition-all border border-white/10 shrink-0 shadow-lg active:scale-95">
                            <AnimatedIcon src={receiveToken.img} alt={receiveToken.symbol} className="w-6 h-6" />
                            <span className="font-bold text-white">
                                <AnimatedText content={receiveToken.symbol} />
                            </span>
                            <ChevronDown size={16} className="text-gray-400 group-hover:text-white transition-colors"/>
                        </button>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-500 flex gap-1">
                            ≈ $<AnimatedNumber value={receiveUsdValue} />
                        </span>
                        <span className="text-xs text-green-400/90 font-mono flex gap-1">
                            ($<AnimatedNumber value="0.12" /> {t.cheaper})
                        </span>
                    </div>
                </div>

                {/* INFO & ROUTE */}
                <div className="mt-4 px-4 py-3 bg-[#0a0e17]/30 rounded-2xl border border-white/5 space-y-2">
                    <div className="flex justify-between text-sm text-gray-400">
                        <span className="flex items-center gap-2"><Info size={14}/> {t.rate}</span>
                        <span className="font-mono text-gray-300 flex items-center gap-1">
                            1 <AnimatedText content={payToken.symbol} /> = 
                            <AnimatedNumber value={displayRate} /> 
                            <AnimatedText content={receiveToken.symbol} />
                        </span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-400">
                        <span className="flex items-center gap-2"><Fuel size={14}/> {t.gas}</span>
                        <span className={`font-mono flex items-center ${themeStyles.textAccent}`}>
                            $<AnimatedNumber value={gasPriceUsd || "0.00"} />
                        </span>
                    </div>
                </div>

                {/* MAIN BUTTON */}
                <ShimmerButton 
                    onClick={handleSwap}
                    disabled={isInsufficientBalance || isEnterAmount || isSwapping}
                    className={`w-full mt-6 py-5 rounded-2xl font-bold text-xl tracking-wide shadow-lg transition-all flex items-center justify-center gap-3 ${isInsufficientBalance || isEnterAmount || isSwapping ? 'bg-[#1a2c38] text-gray-500 cursor-not-allowed border border-white/5' : `${themeStyles.buttonGradient} hover:scale-[1.01] active:scale-[0.98]`}`}
                    >
                    {buttonText}
                </ShimmerButton>
            </div>
        </div>
    );
};

export default memo(SwapForm);