import React, { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { ethers } from 'ethers';
import { AnimatedNumber, ShimmerButton, AnimatedChart, FocusGlowInput, AnimatedText, AnimatedIcon } from './Animations';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { Settings, ArrowUpDown, Info, Fuel, ChevronDown, X, Search, HelpCircle, CheckCircle, AlertTriangle, TrendingUp, RefreshCcw } from 'lucide-react';

import { TOKENS } from '../constants/tokens';
import { useSwap } from '../hooks/useSwap';

const Notification = ({ type, title, message, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const isSuccess = type === 'success';
    const borderColor = isSuccess ? 'border-green-500/50' : 'border-red-500/50';
    const glowColor = isSuccess ? 'shadow-[0_0_20px_rgba(34,197,94,0.3)]' : 'shadow-[0_0_20px_rgba(239,68,68,0.3)]';
    const iconColor = isSuccess ? 'text-green-400' : 'text-red-400';

    return (
        <motion.div
            initial={{ y: -100, opacity: 0, scale: 0.9 }}
            animate={{ y: 20, opacity: 1, scale: 1 }}
            exit={{ y: -100, opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`
                fixed top-0 left-0 right-0 mx-auto w-full max-w-md z-[9999]
                flex items-start gap-4 p-4 rounded-2xl
                bg-[#131823]/95 backdrop-blur-xl border ${borderColor} ${glowColor}
            `}
        >
            <div className={`p-2 rounded-full bg-[#1a2c38] ${iconColor} mt-1 shrink-0`}>
                {isSuccess ? <CheckCircle size={24} /> : <AlertTriangle size={24} />}
            </div>
            <div className="flex-1">
                <h4 className={`font-bold text-lg leading-tight mb-1 ${isSuccess ? 'text-green-400' : 'text-red-400'}`}>
                    {title}
                </h4>
                <p className="text-sm text-gray-300 leading-relaxed">
                    {message}
                </p>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors mt-1 shrink-0">
                <X size={20} />
            </button>
        </motion.div>
    );
};

const ChartSection = memo(({ timeframe, setTimeframe, payToken, receiveToken, displayRate, themeStyles, marketRate, onStatsUpdate, priceChange }) => {
    
    const chartPrice = parseFloat(displayRate) > 0 ? displayRate : marketRate;
    
    const isPositive = priceChange >= 0;
    const percentColor = isPositive ? '#22c55e' : '#ef4444';
    
    return (
        <div className="lg:col-span-2 flex flex-col">
            <div className="
            relative w-full h-full min-h-[550px] 
            rounded-[3rem] border border-white/10 
            bg-[#131823]/80 backdrop-blur-2xl shadow-2xl
            flex flex-col overflow-hidden transition-all duration-500
            ">
                {/* Header */}
                <div className="p-8 pb-0 flex flex-col z-10">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                        <div className="flex items-center gap-4">
                            <div className="flex -space-x-2">
                                <AnimatedIcon src={payToken.img} alt={payToken.symbol} className="w-10 h-10 border-2 border-[#131823] z-10 bg-[#131823]" />
                                <AnimatedIcon src={receiveToken.img} alt={receiveToken.symbol} className="w-10 h-10 border-2 border-[#131823] z-0 bg-[#131823]" />
                            </div>
                            <div>
                                <div className="flex items-baseline gap-3">
                                    <h2 className="text-2xl font-bold text-white">
                                        <AnimatedText content={`${payToken.symbol} / ${receiveToken.symbol}`} />
                                    </h2>
                                    
                                    <span className="text-lg font-mono font-bold flex items-center gap-1">
                                        <AnimatedNumber 
                                            value={priceChange ? Math.abs(priceChange).toFixed(2) : "0.00"} 
                                            prefix={isPositive ? "+" : "-"} 
                                            suffix="%" 
                                            color={percentColor}
                                        />
                                    </span>
                                </div>
                                <div className="text-gray-400 text-sm font-medium flex gap-1">
                                    <span>1 {payToken.symbol} = </span>
                                    <AnimatedNumber value={marketRate} suffix={` ${receiveToken.symbol}`} />
                                </div>
                            </div>
                        </div>

                        {/* Timeframe */}
                        <div className="flex bg-[#0a0e17]/50 p-1 rounded-xl border border-white/5">
                            {['1H', '1D', '1W', '1M', '1Y'].map((tf) => (
                                <button 
                                    key={tf}
                                    onClick={() => setTimeframe(tf)}
                                    className='relative px-4 py-1.5 rounded-lg text-sm font-bold outline-none'
                                >
                                    {timeframe === tf && (
                                        <motion.div
                                            layoutId='active-pill'
                                            className="absolute inset-0 bg-[#1a2c38] rounded-lg border border-white/10 shadow-[0_0_10px_rgba(0,0,0,0.5)]"
                                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                        />
                                    )}
                                    <span className={`relative z-10 transition-colors duration-200 ${timeframe === tf ? themeStyles.textAccent : 'text-gray-500 hover:text-gray-300'}`}>
                                        {tf}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Chart */}
                <div className="flex-grow relative w-full mt-auto">
                    <AnimatedChart 
                        timeframe={timeframe} 
                        color={themeStyles.isGold ? '#f0dfae' : '#00d4ff'} 
                        currentPrice={chartPrice}
                        onStatsUpdate={onStatsUpdate}
                        currencySymbol={receiveToken.symbol}
                    />
                </div>

                {/* Chart Glow */}
                <div className={`absolute top-0 right-0 w-[400px] h-[400px] rounded-full blur-[120px] opacity-10 pointer-events-none transition-colors duration-500 ${themeStyles.bgGlow}`}></div>
            </div>
        </div>
    );
});

const SwapCard = ({ t, account, balances, provider, connectWallet }) => {

    // STATES
    const [tokens] = useState(TOKENS);
    const [paySymbol, setPaySymbol] = useState('MFI');
    const [receiveSymbol, setReceiveSymbol] = useState('USDC');

    const payToken = tokens.find(t => t.symbol === paySymbol) || tokens[0];
    const receiveToken = tokens.find(t => t.symbol === receiveSymbol) || tokens[1];

    const [payAmount, setPayAmount] = useState('');
    const [receiveAmount, setReceiveAmount] = useState('');
    const [isSwapping, setIsSwapping] = useState(false);

    const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
    const [tokenModalType, setTokenModalType] = useState('pay');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const [slippage, setSlippage] = useState(0.5);
    const [deadline, setDeadline] = useState(20);
    const [timeframe, setTimeframe] = useState('1D');
    const [gasPriceUsd, setGasPriceUsd] = useState('');

    const [marketRate, setMarketRate] = useState('0.00');
    const [priceChange, setPriceChange] = useState(0);

    const [notification, setNotification] = useState(null);

    const { getAmountsOut, swapTokens } = useSwap(provider, account);

    const isGoldTheme = payToken.symbol === 'MFI' || receiveToken.symbol === 'MFI' || payToken.symbol === 'ETH';

    const themeStyles = useMemo(() => ({
        isGold: isGoldTheme,
        textAccent: isGoldTheme ? 'text-[#f0dfae]' : 'text-[#00d4ff]',
        bgGlow: isGoldTheme ? 'bg-[#f0dfae]' : 'bg-[#00d4ff]',
        inputText: isGoldTheme ? 'text-[#f0dfae]' : 'text-[#00d4ff]',
        maxButton: isGoldTheme ? 'text-[#f0dfae] bg-[#f0dfae]/10 hover:bg-[#f0dfae]/20' : 'text-[#00d4ff] bg-[#00d4ff]/10 hover:bg-[#00d4ff]/20',
        hoverBorder: isGoldTheme ? 'hover:border-[#f0dfae]/30' : 'hover:border-[#00d4ff]/30',
        buttonGradient: isGoldTheme ? 'bg-gradient-to-r from-[#ffeebb] via-[#f0dfae] to-[#d4c085] text-[#0a0e17] hover:shadow-[0_0_20px_rgba(240,223,174,0.3)]' : 'bg-gradient-to-r from-[#00d4ff] via-[#00aaff] to-[#0088ff] text-white hover:shadow-[0_0_20px_rgba(0,212,255,0.3)]',
        tokenSelectActive: isGoldTheme ? 'bg-[#f0dfae]/10 border border-[#f0dfae]/30' : 'bg-[#00d4ff]/10 border border-[#00d4ff]/30'
    }), [isGoldTheme]);

    const getTokenBalance = (symbol) => {
        if (!balances) return "0.0";
        return balances[symbol] || "0.0";
    };

    const filteredTokens = tokens.filter((token) => 
        token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // MARKET RATE EFFECT
    useEffect(() => {
        const fetchMarketRate = async () => {
            const path = [payToken.address, receiveToken.address];
            try {
                const oneUnit = ethers.parseUnits("1", payToken.decimals);
                const rateWei = await getAmountsOut(oneUnit, path);
                if (rateWei && rateWei !== '0') {
                    const rateFormatted = ethers.formatUnits(rateWei, receiveToken.decimals);
                    setMarketRate(parseFloat(rateFormatted).toFixed(6));
                }
            } catch (e) {
                console.warn("Market rate fetch error:", e);
            }
        };
        fetchMarketRate();
        const interval = setInterval(fetchMarketRate, 10000);
        return () => clearInterval(interval);
    }, [payToken, receiveToken, getAmountsOut]);

    // GAS EFFECT
    useEffect(() => {
        const fetchGas = async () => {
            if (!provider) return;
            try {
                const feeData = await provider.getFeeData();
                const gasPrice = feeData.gasPrice || 3000000000n;

                const estimatedGasLimit = 200000n;

                const totalCostWei = gasPrice * estimatedGasLimit;
                const totalCostEth = parseFloat(ethers.formatEther(totalCostWei));

                const ethPrice = tokens.find(t => t.symbol === 'ETH')?.price || 2000;
                const costUsd = (totalCostEth * ethPrice).toFixed(2);

                setGasPriceUsd(costUsd);
            } catch (e) {
                console.warn("Gas estimation failed", e);
                setGasPriceUsd("---");
            }
        };

        fetchGas();
        const interval = setInterval(fetchGas, 10000);
        return () => clearInterval(interval);
    }, [provider, tokens]);

    useEffect(() => {
        if (!payAmount || payAmount === '' || parseFloat(payAmount) <= 0) {
            setReceiveAmount('');
            return;
        }

        const timer = setTimeout(async () => {
            const path = [payToken.address, receiveToken.address];
            try {
                const amountInWei = ethers.parseUnits(payAmount, payToken.decimals);
                const amountOutWei = await getAmountsOut(amountInWei, path);

                if (amountOutWei && amountOutWei !== '0') {
                    const formattedOut = ethers.formatUnits(amountOutWei, receiveToken.decimals);
                    setReceiveAmount(parseFloat(formattedOut).toFixed(6));
                }
            } catch (error) {
                console.warn("Quote error:", error);
            }
        }, 600);

        return () => clearTimeout(timer);
    }, [payAmount, payToken, receiveToken, getAmountsOut]);

    
    // FUNCTIONS

    // 1. Pay Input
    const handlePayInput = useCallback((e) => {
        const value = e.target.value;
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            setPayAmount(value);
        }
    }, []);

    // 2. Receive Input
    const handleReceiveInput = useCallback((e) => {
        const value = e.target.value;
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            setReceiveAmount(value);
        }
    }, []);

    // 3. MAX Button
    const handleMaxClick = useCallback(() => {
        const balance = getTokenBalance(payToken.symbol);
        const cleanBalance = balance.replace(/,/g, '');
        setPayAmount(cleanBalance);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [payToken, balances]);

    // 4.Swap Tokens
    const handleSwapArrows = useCallback(() => {
        const currentPay = paySymbol;
        const currentReceive = receiveSymbol;

        setPaySymbol(currentReceive);
        setReceiveSymbol(currentPay);
        
        setPayAmount('');
        setReceiveAmount('');
    }, [paySymbol, receiveSymbol]);

    // 5. Notification Helper
    const showNotification = (type, title, message) => {
        setNotification({ type, title, message });
    };

    // 6. SWAP
    const handleSwap = async () => {
        if (!account) {
            connectWallet();
            return;
        }
        if (!payAmount) return;

        setIsSwapping(true);
        try {
            const amountInWei = ethers.parseUnits(payAmount, payToken.decimals);
            
            if (!receiveAmount) throw new Error("Price not updated yet");

            const amountOutWei = ethers.parseUnits(receiveAmount, receiveToken.decimals);

            // min value (Slippage)
            const slippageFactor = 10000n - BigInt(Math.floor(slippage * 100));
            const amountOutMin = (amountOutWei * slippageFactor) / 10000n;

            const deadlineInSeconds = Math.floor(Date.now() / 1000) + (deadline * 60);

            const path = [payToken.address, receiveToken.address];

            await swapTokens(amountInWei, amountOutMin, path, deadlineInSeconds);

            const successTitle = t.notifications?.successTitle || 'Success';
            const swappedText = t.notifications?.swapped || 'Successfully swapped';
            const toText = t.notifications?.to || 'to';
            const successMsg = `${swappedText} ${payAmount} ${payToken.symbol} ${toText} ${receiveAmount} ${receiveToken.symbol}`;

            showNotification('success', successTitle, successMsg);

            setPayAmount('');
            setReceiveAmount('')
        } catch (error) {
            console.error(error);
            const errorTitle = t.notifications?.errorTitle || 'Error';
            const errorMsg = t.notifications?.errorMsg || 'Swap failed! Check settings.';
            showNotification('error', errorTitle, errorMsg);
        } finally {
            setIsSwapping(false);
        }
    };

    // 7. Open Tokens List
    const openTokenModal = (type) => {
        setTokenModalType(type);
        setSearchQuery('');
        setIsTokenModalOpen(true);
    };

    // 8. Select Token
    const selectToken = (token) => {
        if (tokenModalType === 'pay') {
            if (token.symbol === receiveSymbol) setReceiveSymbol(paySymbol);
            setPaySymbol(token.symbol);
        } else {
            if (token.symbol === paySymbol) setPaySymbol(receiveSymbol);
            setReceiveSymbol(token.symbol);
        }
        setPayAmount('');
        setReceiveAmount('');
        setIsTokenModalOpen(false);
    };

    const currentBalance = parseFloat(getTokenBalance(payToken.symbol));
    const isInsufficientBalance = parseFloat(payAmount) > currentBalance;
    const isEnterAmount = !payAmount || parseFloat(payAmount) <= 0;

    let buttonText = t.button;
    if (isSwapping) buttonText = "Swapping...";
    else if (isEnterAmount) buttonText = "Enter Amount";
    else if (isInsufficientBalance) buttonText = "Insufficient Balance";

    const payUsdValue = ((parseFloat(payAmount) || 0) * payToken.price).toFixed(2);
    const receiveUsdValue = ((parseFloat(receiveAmount) || 0) * receiveToken.price).toFixed(2);
    const displayRate = parseFloat(receiveAmount) > 0 && parseFloat(payAmount) > 0
        ? (parseFloat(receiveAmount) / parseFloat(payAmount)).toFixed(6) 
        : marketRate;

    return(
        <div className="w-full flex justify-center p-4 animate-fade-in relative z-10">

            {/* Notification Portal */}
            {createPortal(
                <AnimatePresence>
                    {notification && (
                        <Notification 
                            key="notification"
                            type={notification.type}
                            title={notification.title}
                            message={notification.message} 
                            onClose={() => setNotification(null)} 
                        />
                    )}
                </AnimatePresence>,
                document.body
            )}
            
            <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                
                {/* LEFT COLUMN: CHART */}
                <ChartSection 
                    timeframe={timeframe} 
                    setTimeframe={setTimeframe} 
                    payToken={payToken} 
                    receiveToken={receiveToken} 
                    displayRate={displayRate} 
                    themeStyles={themeStyles} 
                    marketRate={marketRate}
                    onStatsUpdate={setPriceChange}
                    priceChange={priceChange}
                />

                {/* RIGHT COLUMN: SWAP */}
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
                                onClick={() => setIsSettingsOpen(true)}
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
                                    onChange={handlePayInput}
                                    placeholder='0'
                                    className="bg-transparent text-3xl font-bold text-white outline-none w-full placeholder-gray-600 font-sans"
                                />
                                <button onClick={() => openTokenModal('pay')} className="group flex items-center gap-2 bg-[#1a2c38] hover:bg-[#233545] px-3 py-1.5 rounded-full transition-all border border-white/10 shrink-0 shadow-lg active:scale-95">
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
                                    onChange={handleReceiveInput}
                                    placeholder='0'
                                    className="bg-transparent text-3xl font-bold text-[#f0dfae] outline-none w-full placeholder-gray-600"
                                />
                                <button onClick={() => openTokenModal('receive')} className="group flex items-center gap-2 bg-[#1a2c38] hover:bg-[#233545] px-3 py-1.5 rounded-full transition-all border border-white/10 shrink-0 shadow-lg active:scale-95">
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
            </div>

            {/* MODALS */}

            {/* TOKEN SELECT MODAL WINDOW*/}
            {isTokenModalOpen && createPortal (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={() => setIsTokenModalOpen(false)}
                >
                    
                    {/* MODAL WINDOW*/}
                    <div 
                        onClick={(e) => e.stopPropagation()} 
                        className="relative w-full max-w-md h-[80vh] bg-[#131823] rounded-[2.5rem] p-8 flex flex-col animate-fade-in border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
                    >
                        
                        {/* TITLE*/}
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white">{t.selectToken}</h3>
                            <button onClick={() => setIsTokenModalOpen(false)} className="text-gray-400 hover:text-white p-2 hover:bg-white/10 rounded-full transition-colors">
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
                                filteredTokens.map((token) => (
                                    <div
                                        key={token.symbol}
                                        onClick={() => selectToken(token)}
                                        className={`
                                            flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all
                                            ${(tokenModalType === 'pay' ? payToken.symbol : receiveToken.symbol) === token.symbol
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
                                            <div className="text-white font-mono text-sm">{getTokenBalance(token.symbol)}</div>
                                            <div className="text-gray-500 text-xs">${token.price}</div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-gray-500 py-4">
                                    No tokens found
                                </div>
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* SETTINGS MODAL */}
            {isSettingsOpen && createPortal (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={() => setIsSettingsOpen(false)}
                >

                    <div
                        onClick={(e) => e.stopPropagation()} 
                        className="relative w-full max-w-lg bg-[#131823]/95 backdrop-blur-xl rounded-[2.5rem] p-8 flex flex-col animate-fade-in border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
                    >

                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-bold text-white">{t.settings.title}</h3>
                            <button onClick={() => setIsSettingsOpen(false)} className="text-gray-400 hover:text-white p-2 bg-white/10 rounded-full transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Slippage */}
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-4 text-gray-400 text-sm font-medium">
                                {t.settings.slippage}
                                <div className="group relative flex items-center">
                                    <HelpCircle size={16} className="cursor-help text-gray-500 hover:text-white transition-colors" />
                                    <div className="absolute bottom-full left1/2 -translate-x-1/2 mb-2 w-56 p-3 bg-gray-900 text-xs text-gray-200 rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50 text-center shadow-xl border border-white/10">
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
                                        className={`px-5 py-3 rounded-2xl text-sm font-bold border transition-all ${slippage === val ? 'bg[#00d4ff]/20 border-[#00d4ff]' : 'bg-[#0a0e17] border-white/10 text-gray-300 hover:border-white/30'}`}
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
            )}
        </div>
    );
};

export default SwapCard;