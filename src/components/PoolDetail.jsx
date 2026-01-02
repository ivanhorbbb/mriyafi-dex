import React, { useState } from 'react';
import { ArrowLeft, Sparkles, ArrowRightLeft, Wallet, X } from 'lucide-react';

const PoolDetail = ({ pool, onBack, t }) => {

    /// STATES
    const [userLiquidity, setUserLiquidity] = useState(0.00);
    const [userFees, setUserFees] = useState(12.45);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState('add');
    const [amountInput, setAmountInput] = useState('');

    const transactions = [
        { time: '1 min ago', price: '$125.2M', amount: '$672.20', type: 'buy'},
        { time: '5 min ago', price: '125.4M', amount: '$12.35', type: 'sell'},
        { time: '12 min ago', price: '$0.9M', amount: '$40.00', type: 'buy'},
        { time: '22 min ago', price: '$1.2M', amount: '$150.00', type: 'buy'},
        { time: '35 min ago', price: '$45.1M', amount: '$890.50', type: 'sell'}
    ];

    const primaryColor = pool.isHot ? '#f0dfae' : '#00d4ff';
    const primaryClass = pool.isHot ? 'text-[#f0dfae]' : 'text-[#00d4ff]';
    const borderClass = pool.isHot ? 'border-[#f0dfae]/30' : 'border-[#00d4ff]/30';

    /// FUNCTIONS
    const formatCurrency = (val) => {
        return '$' + val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2});
    };

    const handleOpenModal = (type) => {
        setModalType(type);
        setAmountInput('');
        setIsModalOpen(true);
    };

    const handleConfirmTransaction = () => {
        const val = parseFloat(amountInput);
        if (isNaN(val) || val <= 0) return;

        if (modalType === 'add') {
            setUserLiquidity(prev => prev + val);
        } else {
            if (val > userLiquidity) {
                alert("Insufficient liquidity balance");
                return;
            }
            setUserLiquidity(prev => prev - val);
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
            {isModalOpen && (
                <div className="absolute inset-0 z-50 flex items-center justify-center p-4">

                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                        onClick={() => setIsModalOpen(false)}
                    />

                    {/* Modal Window */}
                    <div className="relative z-50 w-full max-w-md bg-[#131823] rounded-[2.5rem] p-8 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-fade-in">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-bold text-white">
                                {modalType === 'add' ? t.add : t.remove}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
                            >
                                <X size={24}/>
                            </button>
                        </div>

                        <div className="mb-8">
                            <div className="flex justify-between text-sm text-gray-400 mb-2">
                                <span>Amount</span>
                                <span>Balance: {formatCurrency(modalType === 'add' ? 25000 : userLiquidity)}</span>
                            </div>
                            <div className="relative">
                                <input 
                                    type="number" 
                                    placeholder='0.00'
                                    autoFocus
                                    value={amountInput}
                                    onChange={(e) => setAmountInput(e.target.value)}
                                    className="w-full bg-[#0a0e17] border border-white/10 rounded-2xl py-4 pl-4 pr-16 text-2xl text-white font-mono placeholder-gray-600 focus:outline-none focus:border-[#00d4ff]"
                                />
                                <span className="absolute right-4 top-1/2 -translate-1/2 text-gray-500 font-bold">USD</span>
                            </div>
                        </div>

                        <button
                            onClick={handleConfirmTransaction}
                            className={`
                                w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg
                                ${modalType == 'add'
                                    ? 'bg-gradient-to-r from-[#ffeebb] via-[#f0dfae] to-[#d4c085] text-[#0a0e17] hover:scale-[1.02]'
                                    : 'bg-[#1a2c38] text-white border border-[#00d4ff]/30 hover:border-[#00d4ff] hover:bg-[#00d4ff]/10'
                                }
                            `}
                        >
                            Confirm {modalType === 'add' ? 'Deposit' : 'Withdrawal'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PoolDetail;