import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Settings, ArrowUpDown, Info, Fuel, ChevronDown, X, Search, HelpCircle, TrendingUp, RefreshCcw } from 'lucide-react';

import eth from '../assets/img/tokens/eth.png';
import usdc from '../assets/img/tokens/usdc.png';
import usdt from '../assets/img/tokens/usdt.png';
import wbtc from '../assets/img/tokens/wrapped-btc.png';
import weth from '../assets/img/tokens/wrapped-eth.png';
import mfi from '../assets/img/tokens/mfi.png';

const SwapCard = ({ t }) => {

    const tokensList = [
        { symbol: 'ETH', name: 'Ethereum', img: eth, balance: '2.5', price: 2450.50 },
        { symbol: 'USDC', name: 'USD Coin', img: usdc, balance: '4500', price: 1.00 },
        { symbol: 'USDT', name: 'Tether', img: usdt, balance: '3,500.25', price: 1.00 },
        { symbol: 'WBTC', name: 'Wrapped Bitcoin', img: wbtc, balance: '0.05', price: 98500.00 },
        { symbol: 'WETH', name: 'Wrapped Ethereum', img: weth, balance: '2.1', price: 2450.50 },
        { symbol: 'MFI', name: 'Mriya Finance', img: mfi, balance: '10,000', price: 0.05 }
    ];

    // STATES
    const [payToken, setPayToken] = useState(tokensList[0]);
    const [receiveToken, setReceiveToken] = useState(tokensList[1]);
    const [payAmount, setPayAmount] = useState('1.5');
    const [receiveAmount, setReceiveAmount] = useState('');

    const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
    const [tokenModalType, setTokenModalType] = useState('pay');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [slippage, setSlippage] = useState(0.5);
    const [deadline, setDeadline] = useState(20);

    const [timeframe, setTimeframe] = useState('1D');

    const exchangeRate = payToken.price / receiveToken.price;

    const filteredTokens = tokensList.filter((token) => 
        token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        if (payAmount) {
            const val = parseFloat(payAmount);
            if (!isNaN(val)) {
                const calculated = (val * exchangeRate).toFixed(6);
                setReceiveAmount(parseFloat(calculated).toString());
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [payToken, receiveToken]);

    // FUNCTIONS

    // 1. Pay Input
    const handlePayInput = (e) => {
        const value = e.target.value;
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            setPayAmount(value);
            if (value && !isNaN(value)) {
                const result = (parseFloat(value) * exchangeRate).toFixed(6);
                setReceiveAmount(parseFloat(result).toString());
            } else {
                setReceiveAmount('');
            }
        }
    }

    // 2. Receive Input
    const handleReceiveInput = (e) => {
        const value = e.target.value;
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            setReceiveAmount(value);
            if (value && !isNaN(value)) {
                const result = (parseFloat(value) / exchangeRate).toFixed(6);
                setPayAmount(parseFloat(result).toString());
            } else {
                setPayAmount('');
            }
        }
    }

    // 3. MAX Button
    const handleMaxClick = () => {
        const cleanBalance = payToken.balance.replace(/,/g, '');
        setPayAmount(cleanBalance);
        if (cleanBalance && !isNaN(cleanBalance)) {
            const result = (parseFloat(cleanBalance) * exchangeRate).toFixed(6);
            setReceiveAmount(parseFloat(result).toString());
        }
    };

    // 4.Swap Tokens
    const handleSwapArrows = () => {
        const temp = payToken;
        setPayToken(receiveToken);
        setReceiveToken(temp);
        const tempAmount = payAmount; 
        if (tempAmount && !isNaN(tempAmount)) {
             const result = (parseFloat(tempAmount) * (receiveToken.price / payToken.price)).toFixed(6);
             setReceiveAmount(parseFloat(result).toString());
        }
    };

    // 5. Open Tokens List
    const openTokenModal = (type) => {
        setTokenModalType(type);
        setSearchQuery('');
        setIsTokenModalOpen(true);
    };

    // 6. Select Token
    const selectToken = (token) => {
        if (tokenModalType === 'pay') {
            if (token.symbol === receiveToken.symbol) setReceiveToken(payToken);
            setPayToken(token);
            setPayAmount('');
            setReceiveAmount('');
        } else {
            if (token.symbol === payToken.symbol) setPayToken(receiveToken);
            setReceiveToken(token);
        }
        setIsTokenModalOpen(false);
    };

    return(
        <div className="w-full flex justify-center p-4 animate-fade-in relative z-10">
            
            <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                
                {/* LEFT COLUMN: CHART */}
                <div className="lg:col-span-2 flex flex-col">
                    <div className="
                        relative w-full h-full min-h-[550px] 
                        rounded-[3rem] border border-white/10 
                        bg-[#131823]/80 backdrop-blur-2xl shadow-2xl
                        p-8 flex flex-col overflow-hidden
                    ">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="flex -space-x-2">
                                    <img src={payToken.img} alt="" className="w-10 h-10 rounded-full border-2 border-[#131823]" />
                                    <img src={receiveToken.img} alt="" className="w-10 h-10 rounded-full border-2 border-[#131823]" />
                                </div>
                                <div>
                                    <div className="flex items-baseline gap-3">
                                        <h2 className="text-2xl font-bold text-white">{payToken.symbol} / {receiveToken.symbol}</h2>
                                        <span className="text-lg font-mono font-bold text-[#00d4ff]">+5.24%</span>
                                    </div>
                                    <div className="text-gray-400 text-sm font-medium">
                                        1 {payToken.symbol} = {exchangeRate.toFixed(4)} {receiveToken.symbol}
                                    </div>
                                </div>
                            </div>

                            {/* Timeframe */}
                            <div className="flex bg-[#0a0e17]/50 p-1 rounded-xl border border-white/5">
                                {['1H', '1D', '1W', '1M', '1Y'].map((tf) => (
                                    <button 
                                        key={tf}
                                        onClick={() => setTimeframe(tf)}
                                        className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${timeframe === tf ? 'bg-[#1a2c38] text-[#00d4ff] shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                                    >
                                        {tf}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* SVG Chart Mock */}
                        <div className="flex-grow relative w-full min-h-[300px]">
                            <svg viewBox="0 0 800 300" className="w-full h-full preserve-3d" preserveAspectRatio="none">
                                <defs>
                                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.3" />
                                        <stop offset="100%" stopColor="#00d4ff" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                                {/* Grid */}
                                <line x1="0" y1="50" x2="800" y2="50" stroke="white" strokeOpacity="0.05" strokeDasharray="4 4" />
                                <line x1="0" y1="150" x2="800" y2="150" stroke="white" strokeOpacity="0.05" strokeDasharray="4 4" />
                                <line x1="0" y1="250" x2="800" y2="250" stroke="white" strokeOpacity="0.05" strokeDasharray="4 4" />
                                {/* Path */}
                                <path d="M0 200 C 100 200, 150 100, 250 150 S 350 250, 450 180 S 550 50, 650 100 S 750 20, 800 60" fill="none" stroke="#00d4ff" strokeWidth="3" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                                <path d="M0 200 C 100 200, 150 100, 250 150 S 350 250, 450 180 S 550 50, 650 100 S 750 20, 800 60 V 300 H 0 Z" fill="url(#chartGradient)" stroke="none" />
                            </svg>
                        </div>
                        
                        {/* Chart Glow */}
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#00d4ff] rounded-full blur-[120px] opacity-10 pointer-events-none"></div>
                    </div>
                </div>

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
                        <div className="bg-[#0a0e17]/60 rounded-[2rem] p-5 border border-transparent hover:border-[#00d4ff]/30 transition-all duration-300 group">
                            <div className="flex justify-between mb-3">
                                <span className="text-gray-400 text-sm font-medium">{t.pay}</span>
                                <span className="text-gray-400 text-xs font-mono">
                                    {t.balance}: {payToken.balance}
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
                                <button onClick={() => openTokenModal('pay')} className="flex items-center gap-2 bg-[#1a2c38] hover:bg-[#233545] px-3 py-1.5 rounded-full transition-all border border-white/10 shrink-0 shadow-lg">
                                    <img src={payToken.img} alt={payToken.symbol} className="w-6 h-6 rounded-full" />
                                    <span className="font-bold text-white">{payToken.symbol}</span>
                                    <ChevronDown size={16} className="text-gray-400"/>
                                </button>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                                <span className="text-xs text-gray-500">≈ ${((parseFloat(payAmount) || 0) * payToken.price).toFixed(2)}</span>
                                <button onClick={handleMaxClick} className="text-xs text-[#00d4ff] bg-[#00d4ff]/10 px-2 py-0.5 rounded hover:bg-[#00d4ff]/20 transition font-bold">Max</button>
                            </div>
                        </div>

                        {/* SWITCH */}
                        <div className="relative h-4 flex justify-center items-center my-2 z-10">
                            <button onClick={handleSwapArrows} className="absolute bg-[#1a2c38] p-2 rounded-xl border-[4px] border-[#131823] hover:scale-110 hover:border-[#131823] transition-all duration-200 cursor-pointer shadow-xl hover:rotate-180">
                                <ArrowUpDown size={20} className="text-[#00d4ff]" />
                            </button>
                        </div>

                        {/* RECEIVE INPUT */}
                        <div className="bg-[#0a0e17]/60 rounded-[2rem] p-5 border border-transparent hover:border-[#f0dfae]/30 transition-all duration-300">
                            <div className="flex justify-between mb-3">
                                <span className="text-gray-400 text-sm font-medium">{t.receive}</span>
                                <span className="text-gray-400 text-xs font-mono">{t.balance}: {receiveToken.balance}</span>
                            </div>
                            <div className="flex justify-between items-center gap-4">
                                <input 
                                    type="text" 
                                    value={receiveAmount}
                                    onChange={handleReceiveInput}
                                    placeholder='0'
                                    className="bg-transparent text-3xl font-bold text-[#f0dfae] outline-none w-full placeholder-gray-600"
                                />
                                <button onClick={() => openTokenModal('receive')} className="flex items-center gap-2 bg-[#1a2c38] hover:bg-[#233545] px-3 py-1.5 rounded-full transition-all border border-white/10 shrink-0 shadow-lg">
                                    <img src={receiveToken.img} alt={receiveToken.symbol} className="w-6 h-6 rounded-full" />
                                    <span className="font-bold text-white">{receiveToken.symbol}</span>
                                    <ChevronDown size={16} className="text-gray-400"/>
                                </button>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                                <span className="text-xs text-gray-500">≈ ${((parseFloat(receiveAmount) || 0) * receiveToken.price).toFixed(2)}</span>
                                <span className="text-xs text-green-400/90 font-mono">($0.12 {t.cheaper})</span>
                            </div>
                        </div>

                        {/* INFO & ROUTE */}
                        <div className="mt-4 px-4 py-3 bg-[#0a0e17]/30 rounded-2xl border border-white/5 space-y-2">
                            <div className="flex justify-between text-sm text-gray-400">
                                <span className="flex items-center gap-2"><Info size={14}/> {t.rate}</span>
                                <span className="font-mono text-gray-300">1 {payToken.symbol} = {exchangeRate.toFixed(4)} {receiveToken.symbol}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-400">
                                <span className="flex items-center gap-2"><Fuel size={14}/> {t.gas}</span>
                                <span className="font-mono text-[#00d4ff]">$4.50</span>
                            </div>
                        </div>

                        {/* MAIN BUTTON */}
                        <button className="w-full mt-6 py-5 rounded-2xl bg-gradient-to-r from-[#ffeebb] via-[#f0dfae] to-[#d4c085] text-[#0a0e17] font-bold text-xl tracking-wide shadow-[0_0_20px_rgba(240,223,174,0.3)] hover:shadow-[0_0_30px_rgba(240,223,174,0.5)] hover:scale-[1.01] transition-all active:scale-[0.98]">
                            {t.button}
                        </button>
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
                        <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
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
                                            <div className="text-white font-mono text-sm">{token.balance}</div>
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