import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, Sparkles, ArrowRightLeft, Wallet, X, Plus, Info } from 'lucide-react';

import { TOKENS } from '../constants/tokens';

const PoolDetail = ({ pool, onBack, t }) => {

    const symbols = pool.pair.split(' / ');
    const symbolA_Name = symbols[0]?.trim();
    const symbolB_Name = symbols[1]?.trim();

    const tokenA = TOKENS.find(t => t.symbol === symbolA_Name) || { balance: '0', price: 0};
    const tokenB = TOKENS.find(t => t.symbol === symbolB_Name) || { balance: '0', price: 0};

    const parseBalanceStr = (str) => parseFloat(String(str).replace(/,/g, ''));

    /// STATES
    const [balanceA, setBalanceA] = useState(parseBalanceStr(tokenA.balance));
    const [balanceB, setBalanceB] = useState(parseBalanceStr(tokenB.balance));

    useEffect(() => {
        setBalanceA(parseBalanceStr(tokenA.balance));
        setBalanceB(parseBalanceStr(tokenB.balance));
        /// eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pool, tokenA.balance, tokenB.balance]);

    const [userLiquidity, setUserLiquidity] = useState(0.00);
    const [userFees, setUserFees] = useState(12.45);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState('add');

    const [amountA, setAmountA] = useState('');
    const [amountB, setAmountB] = useState('');
    const [removeAmount, setRemoveAmount] = useState('');

    const priceRatio = tokenB.price !== 0 ? (tokenA.price / tokenB.price) : 0;

    const primaryColor = pool.isHot ? '#f0dfae' : '#00d4ff';
    const primaryClass = pool.isHot ? 'text-[#f0dfae]' : 'text-[#00d4ff]';
    const borderClass = pool.isHot ? 'border-[#f0dfae]/30' : 'border-[#00d4ff]/30';

    const transactions = [
        { time: '1 min ago', price: '$125.2M', amount: '$672.20', type: 'buy'},
        { time: '5 min ago', price: '125.4M', amount: '$12.35', type: 'sell'},
        { time: '12 min ago', price: '$0.9M', amount: '$40.00', type: 'buy'},
        { time: '22 min ago', price: '$1.2M', amount: '$150.00', type: 'buy'},
        { time: '35 min ago', price: '$45.1M', amount: '$890.50', type: 'sell'}
    ];

    /// FUNCTIONS
    const formatCurrency = (val) => {
        return '$' + val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2});
    };

    const formatTokenAmount = (val) => {
        return val.toLocaleString('en-US', {maximumFractionDigits: 6});
    };

    const handleOpenModal = (type) => {
        setModalType(type);
        setAmountA('');
        setAmountB('');
        setRemoveAmount('');
        setIsModalOpen(true);
    };

    const handleAmountAChange = (e) => {
        const val = e.target.value;
        if (val === '' || /^\d*\.?\d*$/.test(val)) {
            setAmountA(val);
            if (val && !isNaN(parseFloat(val))) {
                setAmountB((parseFloat(val) * priceRatio).toFixed(2));
            } else {
                setAmountB('');
            }
        }
    };

    const handleAmountBChange = (e) => {
        const val = e.target.value;
        if (val === '' || /^\d*\.?\d*$/.test(val)) {
            setAmountB(val);
            if (val && !isNaN(parseFloat(val))) {
                setAmountA((parseFloat(val) * priceRatio).toFixed(2));
            } else {
                setAmountA('');
            }
        }
    };

    const handleConfirmTransaction = () => {
        
        if (modalType === 'add') {
            const valA = parseFloat(amountA);
            const valB = parseFloat(amountB);

            if (!valA || !valB) return;

            if (valA > balanceA || valB > balanceB) {
                alert(`Insufficient wallet balance! You have ${formatTokenAmount(balanceA)} ${symbolA_Name} and ${formatTokenAmount(balanceB)} ${symbolB_Name}`);
                return;
            }

            setBalanceA(prev => prev - valA);
            setBalanceB(prev => prev - valB);

            const addedLiquidityValue = (valB * tokenB.price) * 2;
            setUserLiquidity(prev => prev + addedLiquidityValue);

        } else {

            const valToRemove = parseFloat(removeAmount);
            if (!valToRemove || valToRemove <= 0 || valToRemove > userLiquidity) {
                alert("Invalid amount or insufficient liquidity");
                return;
            }

            setUserLiquidity(prev => prev - valToRemove);

            const valuePerSide = valToRemove / 2;
            const tokensB_Returned = valuePerSide / (tokenB.price || 1);
            const tokensA_Returned = valuePerSide / (tokenA.price || 1);

            setBalanceA(prev => prev + tokensA_Returned);
            setBalanceB(prev => prev + tokensB_Returned);

            setUserFees(0.00);
        }
        setIsModalOpen(false);
    }

    return (
        <div className="w-full max-w-6xl p-4 animate-fade-in relative z-10">
            
            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
                <button 
                    onClick={onBack}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors bg-[#131823]/50 px-5 py-2.5 rounded-full border border-white/5 hover:border-white/20 text-sm font-medium backdrop-blur-md"
                >
                    <ArrowLeft size={18} />
                    <span>{t.back}</span>
                </button>

                <div className="flex items-center gap-4">
                    <div className="flex -space-x-4">
                        <img src={pool.imgs[0]} alt="" className="w-12 h-12 rounded-full border-4 border-[#050b14] shadow-lg z-10" />
                        <img src={pool.imgs[1]} alt="" className="w-12 h-12 rounded-full border-4 border-[#050b14] shadow-lg" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">{pool.pair}</h2>
                        <span className="text-gray-500 font-bold text-xl">{pool.version}</span>
                    </div>
                </div>
            </div>

            {/* WRAPPER*/}
            <div className={`
                rounded-[3rem] border backdrop-blur-xl bg-[#131823]/80 shadow-2xl overflow-hidden
                grid grid-cols-1 lg:grid-cols-3
                ${borderClass} mb-8
            `}>
                
                {/* LEFT SIDE: STATISTICS AND CHART */}
                <div className="lg:col-span-2 p-8 relative flex flex-col justify-between min-h-[450px] border-b lg:border-b-0 lg:border-r border-white/10">
                    
                    {/* STATISTIC BOX */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 relative z-10">
                        <div>
                            <div className="text-gray-400 text-sm mb-1 font-medium">{t.tvl}</div>
                            <div className="text-white text-2xl font-bold tracking-tight">{pool.tvl}</div>
                        </div>
                        <div>
                            <div className="text-gray-400 text-sm mb-1 font-medium">{t.vol}</div>
                            <div className="text-white text-2xl font-bold tracking-tight">{pool.vol}</div>
                        </div>
                        <div>
                            <div className="text-gray-400 text-sm mb-1 font-medium">{t.fees}</div>
                            <div className="text-white text-2xl font-bold tracking-tight">$375K</div>
                        </div>
                        <div className="text-left md:text-right">
                            <div className="text-gray-400 text-sm mb-1 font-medium">{t.apr}</div>
                            <div className={`text-2xl font-bold flex items-center md:justify-end gap-2 ${primaryClass}`}>
                                {pool.apr} <Sparkles size={18} />
                            </div>
                        </div>
                    </div>

                    {/* CHART */}
                    <div className="flex-grow w-full relative mt-4">
                        <svg viewBox="0 0 500 150" className="w-full h-full absolute inset-0 bottom-0" preserveAspectRatio="none">
                            <defs>
                                <linearGradient id="chartGradientDetail" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={primaryColor} stopOpacity="0.5" />
                                    <stop offset="100%" stopColor={primaryColor} stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            {/* Line */}
                            <path 
                                d="M0 100 C 50 120, 100 60, 150 80 S 250 40, 300 60 S 400 20, 450 40 S 480 30, 500 35" 
                                fill="none" 
                                stroke={primaryColor} 
                                strokeWidth="4"
                                strokeLinecap="round"
                            />
                            {/* Fill */}
                            <path 
                                d="M0 100 C 50 120, 100 60, 150 80 S 250 40, 300 60 S 400 20, 450 40 S 480 30, 500 35 L 500 150 L 0 150 Z" 
                                fill="url(#chartGradientDetail)" 
                                stroke="none"
                            />
                        </svg>
                    </div>

                    {/* Glow */}
                    <div className={`absolute top-0 right-0 w-80 h-80 rounded-full blur-[100px] opacity-10 pointer-events-none ${pool.isHot ? 'bg-[#f0dfae]' : 'bg-[#00d4ff]'}`} />
                </div>

                {/* RIDE SIDE: POSITION */}
                <div className="lg:col-span-1 p-8 flex flex-col h-full bg-[#0a0e17]/30 relative">
                    
                    <div className="flex items-center gap-3 mb-8">
                        <Wallet className="text-gray-400" size={24}/>
                        <h3 className="text-2xl font-bold text-white">{t.position}</h3>
                    </div>
                    
                    <div className="space-y-6 mb-8 flex-grow">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400 text-base">{t.liquidity}</span>
                            <span className={`font-mono text-xl font bold ${userLiquidity > 0 ? 'text-white' : 'text-gray-500'}`}>
                                {formatCurrency(userLiquidity)}
                            </span>
                        </div>
                        <div className="w-full h-px bg-white/5"></div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400 text-base">{t.feesEarned}</span>
                            <span className="text-[#00d4ff] font-mono text-xl font-bold">
                                {formatCurrency(userLiquidity > 0 ? userFees : 0)}
                            </span>
                        </div>
                    </div>

                    {/* BUTTONS */}
                    <div className="grid gap-4 mt-auto relative z-10">
                        {/* Add Button */}
                        <button 
                            onClick={() => handleOpenModal('add')}
                            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#ffeebb] via-[#f0dfae] to-[#d4c085] text-[#0a0e17] font-bold text-lg shadow-[0_0_20px_rgba(240,223,174,0.2)] hover:shadow-[0_0_30px_rgba(240,223,174,0.4)] hover:scale-[1.02] transition-all"
                        >
                            {t.add}
                        </button>
                        {/* Remove Button */}
                        <button 
                            onClick={() => handleOpenModal('remove')}
                            className="w-full py-4 rounded-2xl bg-[#1a2c38]/40 border border-[#00d4ff]/30 text-white font-bold text-lg hover:bg-[#00d4ff]/10 hover:border-[#00d4ff] hover:shadow-[0_0_20px_rgba(0,212,255,0.2)] transition-all"
                        >
                            {t.remove}
                        </button>
                    </div>
                </div>
            </div>

            {/* BLOCK 3: TRANSACTIONS */}
            <div className="rounded-[3rem] p-8 border border-white/10 bg-[#131823]/60 backdrop-blur-xl shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                    <ArrowRightLeft className="text-gray-400" size={24}/>
                    <h3 className="text-2xl font-bold text-white">{t.transactions}</h3>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-base">
                        <thead>
                            <tr className="text-gray-500 border-b border-white/5 text-sm uppercase tracking-wider">
                                <th className="pb-4 text-left font-medium pl-4">{t.colDate}</th>
                                <th className="pb-4 text-right font-medium">{t.colPrice}</th>
                                <th className="pb-4 text-right font-medium pr-4">{t.colLiq}</th>
                            </tr>
                        </thead>
                        <tbody className="font-mono text-lg">
                            {transactions.map((tx, i) => (
                                <tr key={i} className="hover:bg-white/5 transition-colors group">
                                    <td className="py-4 pl-4 text-gray-400 group-hover:text-white transition-colors">{tx.time}</td>
                                    <td className="py-4 text-right text-white">{tx.price}</td>
                                    <td className={`py-4 pr-4 text-right font-bold ${tx.type === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
                                        {tx.amount}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL FOR LIQUIDITY */}
            {isModalOpen && createPortal (

                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={() => setIsModalOpen(false)}
                >
                    {/* MODAL WINDOW */}
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="relative w-full max-w-lg bg-[#131823] border border-white/10 rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.6)] p-8 flex flex-col overflow-hidden animate-fade-in"
                    >
                        {/* HEADER */}
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-white">
                                {modalType === 'add' ? t.modal.addLiquidity : t.modal.removeLiquidity}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white p-2 hover:bg-white/10 rounded-ful transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        {/* ADD LIQUIDITY */}
                        {modalType === 'add' ? (
                            <div className="space-y-4">
                                {/* Token A */}
                                <div className="bg-[#0a0e17]/60 p-4 rounded-2xl border border-white/5 hover:border-[#00d4ff]/30 transition-colors">
                                    <div className="flex justify-between text-sm text-gray-400 mb-2">
                                        <span>{t.modal.input}</span>
                                        <span>{t.modal.balance}: {formatTokenAmount(balanceA)}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <input 
                                            type="text"
                                            value={amountA}
                                            onChange={handleAmountAChange}
                                            placeholder="0.0"
                                            className="w-full bg-transparent text-3xl font-bold text-white outline-none placeholder-gray-600"
                                        />
                                        <div className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-full border border-white/10 shrink-0">
                                            <img src={pool.imgs[0]} alt="" className="w-7 h-7 rounded-full" />
                                            <span className="font-bold text-white text-lg">{symbolA_Name}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Plus Icon */}
                                <div className="flex justify-center -my-2 relative z-10">
                                    <div className="bg-[#1a2c38] p-2 rounded-xl border-4 border-[#131823]">
                                        <Plus size={20} className="text-gray-400" />
                                    </div>
                                </div>

                                {/* Token B */}
                                <div className="bg-[#0a0e17]/60 p-4 rounded-2xl border border-white/5 hover:border-[#00d4ff]/30 transition-colors">
                                    <div className="flex justify-between text-sm text-gray-400 mb-2">
                                        <span>{t.modal.input}</span>
                                        <span>{t.modal.balance}: {formatTokenAmount(balanceB)}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <input 
                                            type="text"
                                            value={amountB}
                                            onChange={handleAmountBChange}
                                            placeholder="0.0"
                                            className="w-full bg-transparent text-3xl font-bold text-white outline-none placeholder-gray-600"
                                        />
                                        <div className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-full border border-white/10 shrink-0">
                                            <img src={pool.imgs[1]} alt="" className="w-7 h-7 rounded-full" />
                                            <span className="font-bold text-white text-lg">{symbolB_Name}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Summary */}
                                <div className="mt-4 p-4 bg-white/5 rounded-2xl text-sm space-y-2">
                                    <div className="flex justify-between text-gray-400">
                                        <span>{t.modal.rate}</span>
                                        <span className="text-white font-mono">1 {symbolA_Name} = {priceRatio.toLocaleString()} {symbolB_Name}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-400">
                                        <span>{t.modal.shareOfPool}</span>
                                        <span className="text-[#00d4ff] font-bold">&lt; 0.01%</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="p-4 bg-white/5 rounded-2xl text-center">
                                    <span className="text-gray-400 text-sm block mb-1">{t.modal.yourLiquidity}</span>
                                    <span className="text-3xl font-bold text-white">{formatCurrency(userLiquidity)}</span>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm text-gray-400">
                                        <span>{t.modal.amountToRemove}</span>
                                        <span className="text-[#00d4ff] cursor-pointer" onClick={() => setRemoveAmount(userLiquidity.toString())}>Max</span>
                                    </div>
                                    <input 
                                        type="number"
                                        value={removeAmount}
                                        onChange={(e) => setRemoveAmount(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full bg-[#0a0e17]/60 border border-white/10 rounded-2xl py-4 px-4 text-2xl text-white font-mono placeholder-gray-600 focus:outline-none focus:border-[#00d4ff]"
                                    />
                                </div>
                                <div className="text-xs text-gray-500 text-center">
                                    {t.modal.removeInfo1} {symbolA_Name} + {symbolB_Name} {t.modal.removeInfo2}.
                                </div>
                            </div>
                        )}

                        {/* ACTION BUTTON */}
                        <button
                            onClick={handleConfirmTransaction}
                            className={`
                                w-full mt-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg
                                ${modalType === 'add'
                                    ? 'bg-gradient-to-r from-[#ffeebb] via-[#f0dfae] to-[#d4c085] text-[#0a0e17] hover:scale-[1.02] shadow-[0_0_20px_rgba(240,223,174,0.2)]'
                                    : 'bg-[#1a2c38] text-white border border-[#00d4ff]/30 hover:border-[#00d4ff] hover:bg-[#00d4ff]/10 hover:shadow-[0_0_20px_rgba(0,212,255,0.2)]'
                                }
                            `}
                        >
                            {modalType === 'add' ? t.modal.supply : t.modal.remove}
                        </button>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default PoolDetail;