import React, { useState, useEffect } from 'react';
import { Settings, ArrowUpDown, Info, Fuel, ChevronDown, X, Search, HelpCircle } from 'lucide-react';

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

    const [searchQuery, setSearchQuery] = useState('');

    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [slippage, setSlippage] = useState(0.5);
    const [deadline, setDeadline] = useState(20);

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
        <div className="w-full max-w-[580px] p-4 relative animate-fade-in">

            <div className="backdrop-blur-2xl bg-[#131823]/80 border border-white/10 rounded-[3rem] shadow-2xl p-6 sm:p-8">

                {/* HEADER */}
                <div className="flex justify-between items-center mb-8 px-2">
                    <h2 className="text-2xl font-semibold text-white tracking-wide">{t.title}</h2>
                    <button 
                        onClick={() => setIsSettingsOpen(true)}
                        className="text-gray-400 hover:text-white transition-colors hover:rotate-90 duration-500 p-2 rounded-full hover:bg-white/5">
                        <Settings size={24} />
                    </button>
                </div>

                {/* PAY BLOCK */}
                <div className="relative group z-10">
                    <div className="bg-[#0a0e17]/60 rounded-[2rem] p-6 border border-transparent group-hover:border-[#00d4ff]/30 transition-all duration-300 shadow-none group-hover:shadow-[0_0_40px_rgba(0,212,255,0.08)]">
                    
                        <div className="flex justify-between mb-4">
                            <span className="text-gray-400 text-base font-medium">{t.pay}</span>
                            <button 
                                onClick={handleMaxClick}
                                className="text-xs text-[#00d4ff] bg-[#00d4ff]/10 px-3 py-1 rounded-lg cursor-pointer hover:bg-[#00d4ff]/20 transition font-bold"
                            >
                                Max
                            </button>
                        </div>

                        <div className="flex justify-between items-center mb-2">

                            <button 
                                onClick={() => openTokenModal('pay')}
                                className="flex items-center gap-3 bg-black/30 hover:bg-black/50 px-4 py-2 rounded-full transition-all border border-transparent hover:border-white/10 shrink-0"
                            >
                                <img src={payToken.img} alt={payToken.symbol} className="w-8 h-8 rounded-full shadow-lg object-contain" />
                                <span className="text-2xl font-bold text-white">{payToken.symbol}</span>
                                <ChevronDown size={20} className="text-gray-400"/>
                            </button>

                            <input
                                type="text"
                                value={payAmount}
                                onChange={handlePayInput}
                                placeholder='0'
                                className="bg-transparent text-right text-5xl font-bold text-white outline-none w-full placeholder-gray-600 font-sans"
                            />
                        </div>

                        <div className="flex justify-end text-xs text-gray-400 font-mono tracking-tight mt-2">
                            {t.balance}: {payToken.balance}
                        </div>
                    </div>
                </div>

                {/* SWITCH BUTTON */}
                <div className="relative h-4 z-20">
                    <div className="absolute left-1/2 -translate-x-1/2 -top-6">
                        <button 
                            onClick={handleSwapArrows}
                            className="bg-[#1a2c38] p-3 rounded-2xl border-[6px] border-[#131823] hover:scale-110 hover:border-[#131823] transition-transform duration-200 cursor-pointer group shadow-xl hover:rotate-180"
                        >
                            <ArrowUpDown size={22} className="text-[#00d4ff] group-hover:text-white transition-colors" />
                        </button>
                    </div>
                </div>

                {/* RECEIVE BLOCK */}
                <div className="relative group z-0">
                    <div className="bg-[#0a0e17]/60 rounded-[2rem] p-6 border border-transparent group-hover:border-[#f0dfae]/30 transition-all duration-300 shadow-none group-hover:shadow-[0_0_40px_rgba(240,233,174,0.08)] pt-8">
                        <div className="flex justify-between mb-4">
                            <span className="text-gray-400 text-base font-medium">{t.receive} <span className="text-xs opacity-50">({t.estimated})</span></span>
                        </div>

                        <div className="flex justify-between items-center mb-2">
                            <button 
                                onClick={() => openTokenModal('receive')}
                                className="flex items-center gap-3 bg-black/30 hover:bg-black/50 px-4 py-2 rounded-full transition-all border border-transparent hover:border-white/10 shrink-0"
                                >
                                <img src={receiveToken.img} alt={receiveToken.symbol} className="w-8 h-8 rounded-full shadow-lg object-contain" />
                                <span className="text-2xl font-bold text-white">{receiveToken.symbol}</span>
                                <ChevronDown size={20} className="text-gray-400"/>
                            </button>

                            <input 
                                type="text" 
                                value={receiveAmount}
                                onChange={handleReceiveInput}
                                placeholder='0'
                                className="bg-transparent text-right text-5xl font-bold text-[#f0dfae] outline-none w-full placeholder-gray-600"
                                />
                        </div>

                        <div className="flex justify-end text-xs text-green-400/90 font-mono mt-2">
                            ($0.12 {t.cheaper})
                        </div>
                    </div>
                </div>

                {/* INFO */}
                <div className="mt-6 bg-[#0a0e17]/30 rounded-2xl p-5 border border-white/5 space-y-4">
                    <div className="flex justify-between text-sm font-medium text-gray-400">
                        <span className="flex items-center gap-2 cursor-help hover:text-white transition-colors"><Info size={16}/> {t.rate}</span>
                        <span className="font-mono text-gray-200 text-base">
                            1 {payToken.symbol} = {exchangeRate.toFixed(4)} {receiveToken.symbol}
                        </span>
                    </div>
                    <div className="flex justify-between text-sm font-medium text-gray-400">
                        <span className="flex items-center gap-2 cursor-help hover:text-white transition-colors"><Fuel size={16}/> {t.gas}</span>
                        <span className="font-mono text-[#f0dfae] flex items-center gap-2 text-base">
                            $4.50 <span className="bg-green-500/10 text-green-400 px-2 py-0.5 rounded text-xs font-bold">FAST</span>
                        </span>
                    </div>
                </div>

                {/* MAIN BUTTON */}
                <button className="w-full mt-6 py-5 rounded-2xl bg-gradient-to-r from-[#ffeebb] via-[#f0dfae] to-[#d4c085] text-[#0a0e17] font-bold text-lg tracking-wide hover:shadow-[0_0_35px_rgba(240,223,174,0.3)] hover:scale-[1.01] transition-all active:scale-[0.98] active:opacity-90">
                    {t.button}
                </button>
            </div>

            {/* TOKEN SELECT MODAL WINDOW*/}
            {isTokenModalOpen && (
                <div 
                    className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm rounded-[3rem]"
                    onClick={() => setIsTokenModalOpen(false)}
                >
                    
                    {/* MODAL WINDOW*/}
                    <div 
                        onClick={(e) => e.stopPropagation()} 
                        className="relative w-full h-full bg-[#131823] rounded-[2.5rem] p-6 flex flex-col animate-fade-in border border-white/10 shadow-2xl"
                    >
                        
                        {/* TITLE*/}
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white">{t.selectToken}</h3>
                            <button onClick={() => setIsTokenModalOpen(false)} className="text-gray-400 hover:text-white p-1 hover:bg-white/10 rounded-full">
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
                        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
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
                </div>
            )}

            {/* SETTINGS MODAL */}
            {isSettingsOpen && (
                <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm rounded-[3rem]"
                    onClick={() => setIsSettingsOpen(false)}
                >

                    <div
                        onClick={(e) => e.stopPropagation()} 
                        className="relative w-full max-h-[500px] bg-[#131823]/90 backdrop-blur-xl rounded-[3rem] p-8 flex flex-col animate-fade-in border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
                    >

                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-bold text-white">{t.settings.title}</h3>
                            <button onClick={() => setIsSettingsOpen(false)} className="text-gray-400 hover:text-white p-1 bg-white/10 rounded-full">
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
                </div>
            )}
        </div>
    );
};

export default SwapCard;