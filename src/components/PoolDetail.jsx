import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, Sparkles, ArrowRightLeft, Wallet, X, Plus, Loader2, ArrowDown, ExternalLink } from 'lucide-react';
import { ethers } from 'ethers';

import { CONTRACTS, ERC20_ABI, ROUTER_ABI, PAIR_ABI } from '../constants/contracts';
import { usePoolData } from '../hooks/usePoolData';

const PoolDetail = ({ pool, onBack, t }) => {

    const token0 = pool?.token0 || {};
    const token1 = pool?.token1 || {};
    const symbolA_Name = token0.symbol || '';
    const symbolB_Name = token1.symbol || '';

    const getAddress = (sym) => {
        if (!sym) return null;
        if (sym === 'ETH') return CONTRACTS.TOKENS['WETH']; 
        return CONTRACTS.TOKENS[sym];
    };

    const addressA = getAddress(symbolA_Name);
    const addressB = getAddress(symbolB_Name);

    const { reserves, price, loading } = usePoolData(addressA, addressB);

    const [balanceA, setBalanceA] = useState(0); 
    const [balanceB, setBalanceB] = useState(0); 
    const [lpBalance, setLpBalance] = useState(0);
    const [totalSupply, setTotalSupply] = useState(0);

    const [transactions, setTransactions] = useState([]);
    const [loadingTx, setLoadingTx] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState('add');

    const [amountA, setAmountA] = useState('');
    const [amountB, setAmountB] = useState('');
    const [removeAmount, setRemoveAmount] = useState(''); 

    const [isTransacting, setIsTransacting] = useState(false);
    const [statusMsg, setStatusMsg] = useState('');

    const isPoolEmpty = parseFloat(reserves.reserveA) < 1.0 || parseFloat(reserves.reserveB) < 1.0;

    const fetchBalances = useCallback(async () => {
        if (window.ethereum && addressA && addressB) {
            try {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const signer = await provider.getSigner();
                const userAddress = await signer.getAddress();

                console.log("--- Fetching Balances ---");
                console.log("User:", userAddress);

                const tokenAContract = new ethers.Contract(addressA, ERC20_ABI, provider);
                const tokenBContract = new ethers.Contract(addressB, ERC20_ABI, provider);
                
                const [balA, balB, decA, decB] = await Promise.all([
                    tokenAContract.balanceOf(userAddress),
                    tokenBContract.balanceOf(userAddress),
                    tokenAContract.decimals(),
                    tokenBContract.decimals()
                ]);
                
                setBalanceA(parseFloat(ethers.formatUnits(balA, decA)));
                setBalanceB(parseFloat(ethers.formatUnits(balB, decB)));

                const factoryAbi = ["function getPair(address, address) view returns (address)"];
                const factory = new ethers.Contract(CONTRACTS.FACTORY_ADDRESS, factoryAbi, provider);
                const pairAddr = await factory.getPair(addressA, addressB);
                
                console.log("Pair Address found:", pairAddr);

                if (pairAddr && pairAddr !== ethers.ZeroAddress) {
                    const pairContract = new ethers.Contract(pairAddr, PAIR_ABI, provider);
                    const lpBal = await pairContract.balanceOf(userAddress);
                    const totalSup = await pairContract.totalSupply();

                    setLpBalance(parseFloat(ethers.formatUnits(lpBal, 18))); 
                    setTotalSupply(parseFloat(ethers.formatUnits(totalSup, 18)));
                } else {
                    setLpBalance(0);
                    setTotalSupply(0);
                }
            } catch (error) {
                console.error("Error fetching balances:", error);
            }
        }
    }, [addressA, addressB]);

    const fetchTransactions = useCallback(async () => {
        if (!window.ethereum || !addressA || !addressB) return;
        
        setLoadingTx(true);
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const factoryAbi = ["function getPair(address, address) view returns (address)"];
            const factory = new ethers.Contract(CONTRACTS.FACTORY_ADDRESS, factoryAbi, provider);
            const pairAddr = await factory.getPair(addressA, addressB);

            if (!pairAddr || pairAddr === ethers.ZeroAddress) {
                setLoadingTx(false);
                return;
            }

            const pairContract = new ethers.Contract(pairAddr, PAIR_ABI, provider);
            
            let token0Addr;
            try {
                token0Addr = await pairContract.token0();
            } catch (e) {
                console.warn("Could not fetch token0, using default order", e);
                token0Addr = addressA;
            }

            const isTokenA0 = addressA.toLowerCase() === token0Addr.toLowerCase();

            const decA = 18;
            const decB = 6;

            const dec0 = isTokenA0 ? decA : decB;
            const dec1 = isTokenA0 ? decB : decA;

            const currentBlock = await provider.getBlockNumber();
            const fromBlock = Math.max(0, currentBlock - 2000);

            const filterMint = pairContract.filters.Mint();
            const filterBurn = pairContract.filters.Burn();
            const filterSwap = pairContract.filters.Swap();

            const [mints, burns, swaps] = await Promise.all([
                pairContract.queryFilter(filterMint, fromBlock),
                pairContract.queryFilter(filterBurn, fromBlock),
                pairContract.queryFilter(filterSwap, fromBlock)
            ]);

            const formatTx = async (tx, type) => {
                const block = await tx.getBlock();
                
                let rawAmount0, rawAmount1;

                if (type === 'Swap') {
                    const amount0In = BigInt(tx.args[1]);
                    const amount1In = BigInt(tx.args[2]);
                    const amount0Out = BigInt(tx.args[3]);
                    const amount1Out = BigInt(tx.args[4]);

                    if (amount0In > 0) {
                        rawAmount0 = amount0In;
                        rawAmount1 = amount1Out;
                        type = isTokenA0 ? `Swap ${symbolA_Name} -> ${symbolB_Name}` : `Swap ${symbolB_Name} -> ${symbolA_Name}`;
                    } else {
                        rawAmount0 = amount0Out;
                        rawAmount1 = amount1In;
                        type = isTokenA0 ? `Swap ${symbolB_Name} -> ${symbolA_Name}` : `Swap ${symbolA_Name} -> ${symbolB_Name}`;
                    }
                } else {
                    rawAmount0 = tx.args[1];
                    rawAmount1 = tx.args[2];
                }

                const val0 = parseFloat(ethers.formatUnits(rawAmount0, dec0));
                const val1 = parseFloat(ethers.formatUnits(rawAmount1, dec1));

                const amountA_UI = isTokenA0 ? val0 : val1;
                const amountB_UI = isTokenA0 ? val1 : val0;

                return {
                    hash: tx.transactionHash,
                    type: type,
                    amount0: amountA_UI,
                    amount1: amountB_UI,
                    timestamp: block.timestamp,
                    sender: tx.args[0] 
                };
            };

            const allTx = [
                ...await Promise.all(mints.map(tx => formatTx(tx, 'Add Liquidity'))),
                ...await Promise.all(burns.map(tx => formatTx(tx, 'Remove Liquidity'))),
                ...await Promise.all(swaps.map(tx => formatTx(tx, 'Swap')))
            ];

            allTx.sort((a, b) => b.timestamp - a.timestamp);
            setTransactions(allTx.slice(0, 10)); 

        } catch (e) {
            console.error("Error fetching transactions:", e);
        } finally {
            setLoadingTx(false);
        }
    }, [addressA, addressB, symbolA_Name, symbolB_Name]);

    useEffect(() => {
        fetchBalances();
        fetchTransactions();
    }, [fetchBalances, fetchTransactions]);

    if (!pool || !pool.token0 || !pool.token1) {
        return null; 
    }

    const safeT = t || {
        back: 'Back', tvl: 'TVL', vol: 'Volume', fees: 'Fees', apr: 'APR',
        position: 'My Position', liquidity: 'Liquidity', feesEarned: 'Fees Earned',
        add: 'Add Liquidity', remove: 'Remove', transactions: 'Recent Transactions',
        colDate: 'Time', colPrice: 'Value', colLiq: 'Amount',
        modal: {
            addLiquidity: 'Add Liquidity', removeLiquidity: 'Remove Liquidity',
            input: 'Input', balance: 'Balance', rate: 'Rate', shareOfPool: 'Share of Pool',
            yourLiquidity: 'Your LP Tokens', amountToRemove: 'LP Amount to Remove',
            removeInfo1: 'You will receive', removeInfo2: 'and earned fees',
            supply: 'Supply', remove: 'Remove'
        }
    };

    const primaryColor = pool.isHot ? '#f0dfae' : '#00d4ff';
    const primaryClass = pool.isHot ? 'text-[#f0dfae]' : 'text-[#00d4ff]';
    const borderClass = pool.isHot ? 'border-[#f0dfae]/30' : 'border-[#00d4ff]/30';

    const poolShare = totalSupply > 0 ? (lpBalance / totalSupply) * 100 : 0;
    const isOwnerOfPool = poolShare > 99.9;

    // --- HELPER FUNCTIONS ---
    const formatTokenAmount = (val) => val.toLocaleString('en-US', {maximumFractionDigits: 6});
    const formatTime = (ts) => {
        const date = new Date(ts * 1000);
        return date.toLocaleDateString([], { hour: '2-digit', minute: '2-digit' });
    };

    const truncateToDecimals = (val, decimals) => {
        if (!val) return "0";
        if (!val.includes('.')) return val;
        const [integer, fraction] = val.split('.');
        if (fraction.length <= decimals) return val;
        return `${integer}.${fraction.slice(0, decimals)}`;
    };

    const handleOpenModal = (type) => {
        setModalType(type);
        setAmountA('');
        setAmountB('');
        setRemoveAmount('');
        setStatusMsg('');
        setIsModalOpen(true);
        fetchBalances(); 
    };

    const handleAmountAChange = (e) => {
        const val = e.target.value;
        if (val === '' || /^\d*\.?\d*$/.test(val)) {
            setAmountA(val);
            if (!isPoolEmpty && val && !isNaN(parseFloat(val)) && price > 0) {
                const calculated = parseFloat(val) * price;
                setAmountB(parseFloat(calculated.toFixed(10)).toString());
            } 
        }
    };

    const handleAmountBChange = (e) => {
        const val = e.target.value;
        if (val === '' || /^\d*\.?\d*$/.test(val)) {
            setAmountB(val);
            if (!isPoolEmpty && val && !isNaN(parseFloat(val)) && price > 0) {
                const calculated = parseFloat(val) / price;
                setAmountA(parseFloat(calculated.toFixed(10)).toString());
            }
        }
    };

    const executeAddLiquidity = async () => {
        if (!amountA || !amountB) return;
        try {
            setIsTransacting(true);
            setStatusMsg('Connecting Wallet...');
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const router = new ethers.Contract(CONTRACTS.ROUTER_ADDRESS, ROUTER_ABI, signer);
            
            const tokenAContract = new ethers.Contract(addressA, ERC20_ABI, signer);
            const tokenBContract = new ethers.Contract(addressB, ERC20_ABI, signer);
            
            const decA = await tokenAContract.decimals();
            const decB = await tokenBContract.decimals();

            const cleanAmountA = truncateToDecimals(amountA, Number(decA));
            const cleanAmountB = truncateToDecimals(amountB, Number(decB));

            const amountAMin = ethers.parseUnits(cleanAmountA, decA);
            const amountBMin = ethers.parseUnits(cleanAmountB, decB);

            setStatusMsg(`Checking allowance ${symbolA_Name}...`);
            const allA = await tokenAContract.allowance(await signer.getAddress(), CONTRACTS.ROUTER_ADDRESS);
            if (allA < amountAMin) {
                setStatusMsg(`Approving ${symbolA_Name}...`);
                await (await tokenAContract.approve(CONTRACTS.ROUTER_ADDRESS, ethers.MaxUint256)).wait();
            }

            setStatusMsg(`Checking allowance ${symbolB_Name}...`);
            const allB = await tokenBContract.allowance(await signer.getAddress(), CONTRACTS.ROUTER_ADDRESS);
            if (allB < amountBMin) {
                setStatusMsg(`Approving ${symbolB_Name}...`);
                await (await tokenBContract.approve(CONTRACTS.ROUTER_ADDRESS, ethers.MaxUint256)).wait();
            }

            setStatusMsg('Adding Liquidity...');
            const tx = await router.addLiquidity(
                addressA, addressB, amountAMin, amountBMin, 0, 0, 
                await signer.getAddress(), Math.floor(Date.now()/1000)+1200, 
                { gasLimit: 5000000 }
            );
            await tx.wait();
            setStatusMsg('Success! 🎉');
            await fetchBalances();
            await fetchTransactions();
            setTimeout(() => { setIsModalOpen(false); setIsTransacting(false); }, 2000);
        } catch (e) {
            console.error(e);
            setStatusMsg('Error: ' + (e.reason || e.message));
            setTimeout(() => setIsTransacting(false), 3000);
        }
    };

    const executeRemoveLiquidity = async () => {
        if (!removeAmount || parseFloat(removeAmount) <= 0) return;
        try {
            setIsTransacting(true);
            setStatusMsg('Connecting Wallet...');
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const userAddress = await signer.getAddress();
            const router = new ethers.Contract(CONTRACTS.ROUTER_ADDRESS, ROUTER_ABI, signer);
            
            const factoryAbi = ["function getPair(address, address) view returns (address)"];
            const factory = new ethers.Contract(CONTRACTS.FACTORY_ADDRESS, factoryAbi, signer);
            const currentPairAddress = await factory.getPair(addressA, addressB);

            if (!currentPairAddress || currentPairAddress === ethers.ZeroAddress) {
                throw new Error("Pair not found");
            }
            
            const pairContract = new ethers.Contract(currentPairAddress, PAIR_ABI, signer);

            const inputAmountBig = ethers.parseUnits(removeAmount, 18);
            const realLpBalance = await pairContract.balanceOf(userAddress);
            
            let liquidityAmount = inputAmountBig;

            if (inputAmountBig > realLpBalance) {
                const diff = inputAmountBig - realLpBalance;
                if (diff > ethers.parseUnits("0.001", 18)) {
                    setStatusMsg('Error: Insufficient LP Balance');
                    setTimeout(() => setIsTransacting(false), 3000);
                    return; 
                } else {
                    liquidityAmount = realLpBalance;
                }
            }

            setStatusMsg('Checking LP Allowance...');
            const allowance = await pairContract.allowance(userAddress, CONTRACTS.ROUTER_ADDRESS);
            
            if (allowance < liquidityAmount) {
                setStatusMsg('Approving LP Tokens...');
                const txApprove = await pairContract.approve(CONTRACTS.ROUTER_ADDRESS, ethers.MaxUint256);
                await txApprove.wait();
            }

            setStatusMsg('Removing Liquidity...');
            const tx = await router.removeLiquidity(
                addressA,
                addressB,
                liquidityAmount,
                0, 0, 
                userAddress,
                Math.floor(Date.now()/1000)+1200,
                { gasLimit: 6000000 } 
            );
            await tx.wait();
            
            setStatusMsg('Success! Liquidity Removed 💸');
            await fetchBalances();
            await fetchTransactions();
            setTimeout(() => { setIsModalOpen(false); setIsTransacting(false); }, 2000);

        } catch (e) {
            console.error(e);
            let errMsg = e.reason || e.message || "Unknown error";
            if (e.data && e.data.message) errMsg = e.data.message; 
            setStatusMsg('Error: ' + errMsg);
            setTimeout(() => setIsTransacting(false), 3000);
        }
    };

    return (
        <div className="w-full max-w-6xl p-4 animate-fade-in relative z-10">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
                <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors bg-[#131823]/50 px-5 py-2.5 rounded-full border border-white/5 hover:border-white/20 text-sm font-medium backdrop-blur-md">
                    <ArrowLeft size={18} /><span>{safeT.back}</span>
                </button>
                <div className="flex items-center gap-4">
                    <div className="flex -space-x-4">
                        <img src={token0.logo} alt={token0.symbol} className="w-12 h-12 rounded-full border-4 border-[#050b14] shadow-lg z-10 bg-black" />
                        <img src={token1.logo} alt={token1.symbol} className="w-12 h-12 rounded-full border-4 border-[#050b14] shadow-lg bg-black" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">{symbolA_Name} / {symbolB_Name}</h2>
                        <span className="text-gray-500 font-bold text-xl">{pool.version}</span>
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className={`rounded-[3rem] border backdrop-blur-xl bg-[#131823]/80 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-3 ${borderClass} mb-8`}>
                
                {/* LEFT: STATS */}
                <div className="lg:col-span-2 p-8 relative flex flex-col justify-between min-h-[450px] border-b lg:border-b-0 lg:border-r border-white/10">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 relative z-10">
                        <div>
                            <div className="text-gray-400 text-sm mb-1 font-medium">Reserves {symbolA_Name}</div>
                            <div className="text-white text-2xl font-bold tracking-tight">{loading ? <Loader2 className="animate-spin h-6 w-6"/> : formatTokenAmount(reserves.reserveA)}</div>
                        </div>
                        <div>
                            <div className="text-gray-400 text-sm mb-1 font-medium">Reserves {symbolB_Name}</div>
                            <div className="text-white text-2xl font-bold tracking-tight">{loading ? <Loader2 className="animate-spin h-6 w-6"/> : formatTokenAmount(reserves.reserveB)}</div>
                        </div>
                        <div>
                            <div className="text-gray-400 text-sm mb-1 font-medium">{safeT.fees}</div>
                            <div className="text-white text-2xl font-bold tracking-tight">$375K</div>
                        </div>
                        <div className="text-left md:text-right">
                            <div className="text-gray-400 text-sm mb-1 font-medium">{safeT.apr}</div>
                            <div className={`text-2xl font-bold flex items-center md:justify-end gap-2 ${primaryClass}`}>{pool.apr} <Sparkles size={18} /></div>
                        </div>
                    </div>
                    <div className="flex-grow w-full relative mt-4">
                        <svg viewBox="0 0 500 150" className="w-full h-full absolute inset-0 bottom-0" preserveAspectRatio="none">
                             <defs>
                                <linearGradient id="chartGradientDetail" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={primaryColor} stopOpacity="0.5" />
                                    <stop offset="100%" stopColor={primaryColor} stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            <path d="M0 100 C 50 120, 100 60, 150 80 S 250 40, 300 60 S 400 20, 450 40 S 480 30, 500 35" fill="none" stroke={primaryColor} strokeWidth="4" strokeLinecap="round"/>
                            <path d="M0 100 C 50 120, 100 60, 150 80 S 250 40, 300 60 S 400 20, 450 40 S 480 30, 500 35 L 500 150 L 0 150 Z" fill="url(#chartGradientDetail)" stroke="none"/>
                        </svg>
                    </div>
                </div>

                {/* RIGHT: POSITION */}
                <div className="lg:col-span-1 p-8 flex flex-col h-full bg-[#0a0e17]/30 relative">
                    <div className="flex items-center gap-3 mb-8">
                        <Wallet className="text-gray-400" size={24}/>
                        <h3 className="text-2xl font-bold text-white">{safeT.position}</h3>
                    </div>
                    <div className="space-y-6 mb-8 flex-grow">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400 text-base">{safeT.modal.yourLiquidity}</span>
                            <span className={`font-mono text-xl font bold ${lpBalance > 0 ? 'text-white' : 'text-gray-500'}`}>
                                {lpBalance > 0 ? lpBalance.toFixed(6) : '0.00'} LP
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400 text-base">Share of Pool</span>
                            <span className={`font-mono text-xl font-bold ${isOwnerOfPool ? 'text-yellow-400' : 'text-white'}`}>
                                {poolShare.toFixed(2)}%
                            </span>
                        </div>
                        <div className="w-full h-px bg-white/5"></div>
                        {lpBalance > 0 && (
                            <div className="text-sm text-gray-500 space-y-1">
                                <div className="flex justify-between">
                                    <span>Pooled {symbolA_Name}:</span>
                                    <span className="text-white font-mono">{formatTokenAmount(parseFloat(reserves.reserveA) * (poolShare / 100))}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Pooled {symbolB_Name}:</span>
                                    <span className="text-white font-mono">{formatTokenAmount(parseFloat(reserves.reserveB) * (poolShare / 100))}</span>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="grid gap-4 mt-auto relative z-10">
                        <button onClick={() => handleOpenModal('add')} className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#ffeebb] via-[#f0dfae] to-[#d4c085] text-[#0a0e17] font-bold text-lg shadow-[0_0_20px_rgba(240,223,174,0.2)] hover:scale-[1.02] transition-all">{safeT.add}</button>
                        <button onClick={() => handleOpenModal('remove')} className="w-full py-4 rounded-2xl bg-[#1a2c38]/40 border border-[#00d4ff]/30 text-white font-bold text-lg hover:border-[#00d4ff] hover:bg-[#00d4ff]/10 transition-all">{safeT.remove}</button>
                    </div>
                </div>
            </div>

            {/* BLOCK 3: TRANSACTIONS TABLE */}
            <div className="rounded-[3rem] p-8 border border-white/10 bg-[#131823]/60 backdrop-blur-xl shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                    <ArrowRightLeft className="text-gray-400" size={24}/>
                    <h3 className="text-2xl font-bold text-white">{safeT.transactions}</h3>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-gray-500 border-b border-white/5">
                                <th className="pb-4 pl-2 font-medium">{safeT.colDate || 'Action'}</th>
                                <th className="pb-4 font-medium">{safeT.colLiq || 'Token Amount'}</th>
                                <th className="pb-4 font-medium">{safeT.colPrice || 'Token Amount'}</th>
                                <th className="pb-4 font-medium text-right">{safeT.colDate || 'Time'}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loadingTx ? (
                                <tr>
                                    <td colSpan="4" className="py-8 text-center text-gray-500">
                                        <div className="flex items-center justify-center gap-2"><Loader2 className="animate-spin h-4 w-4"/> Loading transactions...</div>
                                    </td>
                                </tr>
                            ) : transactions.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="py-8 text-center text-gray-500">No transactions found recently</td>
                                </tr>
                            ) : (
                                transactions.map((tx) => (
                                    <tr key={tx.hash} className="group hover:bg-white/5 transition-colors">
                                        <td className="py-4 pl-2">
                                            <a href={`https://etherscan.io/tx/${tx.hash}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[#00d4ff] hover:text-white font-medium">
                                                {tx.type} <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </a>
                                        </td>
                                        <td className="py-4 text-white font-mono">
                                            {formatTokenAmount(tx.amount0)} {symbolA_Name}
                                        </td>
                                        <td className="py-4 text-white font-mono">
                                            {formatTokenAmount(tx.amount1)} {symbolB_Name}
                                        </td>
                                        <td className="py-4 text-right text-gray-400">
                                            {formatTime(tx.timestamp)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL */}
            {isModalOpen && createPortal (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => !isTransacting && setIsModalOpen(false)}>
                    <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-lg bg-[#131823] border border-white/10 rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.6)] p-8 flex flex-col overflow-hidden animate-fade-in">
                        
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-white">{modalType === 'add' ? safeT.modal.addLiquidity : safeT.modal.removeLiquidity}</h3>
                            {!isTransacting && <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24} /></button>}
                        </div>

                        {/* STATUS MESSAGE OVERLAY */}
                        {isTransacting ? (
                            <div className="flex flex-col items-center justify-center py-10 space-y-4">
                                <Loader2 className="animate-spin text-[#f0dfae] w-16 h-16" />
                                <span className="text-xl font-bold text-white text-center">{statusMsg}</span>
                            </div>
                        ) : (
                            <>
                                {modalType === 'add' ? (
                                    <div className="space-y-4">
                                        <div className="bg-[#0a0e17]/60 p-4 rounded-2xl border border-white/5 hover:border-[#00d4ff]/30 transition-colors">
                                            <div className="flex justify-between text-sm text-gray-400 mb-2">
                                                <span>{safeT.modal.input}</span>
                                                <span>{safeT.modal.balance}: {formatTokenAmount(balanceA)}</span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <input type="text" value={amountA} onChange={handleAmountAChange} placeholder="0.0" className="w-full bg-transparent text-3xl font-bold text-white outline-none placeholder-gray-600"/>
                                                <div className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-full border border-white/10 shrink-0">
                                                    <img src={token0.logo} alt="" className="w-7 h-7 rounded-full" />
                                                    <span className="font-bold text-white text-lg">{symbolA_Name}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-center -my-2 relative z-10">
                                            <div className="bg-[#1a2c38] p-2 rounded-xl border-4 border-[#131823]"><Plus size={20} className="text-gray-400" /></div>
                                        </div>

                                        <div className="bg-[#0a0e17]/60 p-4 rounded-2xl border border-white/5 hover:border-[#00d4ff]/30 transition-colors">
                                            <div className="flex justify-between text-sm text-gray-400 mb-2">
                                                <span>{safeT.modal.input}</span>
                                                <span>{safeT.modal.balance}: {formatTokenAmount(balanceB)}</span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <input type="text" value={amountB} onChange={handleAmountBChange} placeholder="0.0" className="w-full bg-transparent text-3xl font-bold text-white outline-none placeholder-gray-600"/>
                                                <div className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-full border border-white/10 shrink-0">
                                                    <img src={token1.logo} alt="" className="w-7 h-7 rounded-full" />
                                                    <span className="font-bold text-white text-lg">{symbolB_Name}</span>
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
                                            <span className="text-gray-400 text-sm block mb-1">{safeT.modal.yourLiquidity}</span>
                                            <span className="text-3xl font-bold text-white">{lpBalance.toFixed(6)} LP</span>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm text-gray-400">
                                                <span>{safeT.modal.amountToRemove}</span>
                                                <span className="text-[#00d4ff] cursor-pointer hover:text-white" onClick={() => setRemoveAmount(lpBalance.toString())}>Max</span>
                                            </div>
                                            <input 
                                                type="number" 
                                                value={removeAmount} 
                                                onChange={(e) => setRemoveAmount(e.target.value)}
                                                placeholder="0.00" 
                                                className="w-full bg-[#0a0e17]/60 border border-white/10 rounded-2xl py-4 px-4 text-2xl text-white font-mono placeholder-gray-600 focus:outline-none focus:border-[#00d4ff]"
                                            />
                                        </div>
                                        <div className="flex justify-center">
                                            <ArrowDown size={24} className="text-gray-500" />
                                        </div>
                                        <div className="text-xs text-gray-500 text-center">
                                            Receiving: ~{symbolA_Name} + {symbolB_Name} based on pool share
                                        </div>
                                    </div>
                                )}

                                <button 
                                    onClick={modalType === 'add' ? executeAddLiquidity : executeRemoveLiquidity} 
                                    disabled={modalType === 'add' ? (!amountA || !amountB) : (!removeAmount)}
                                    className={`w-full mt-8 py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-[#ffeebb] via-[#f0dfae] to-[#d4c085] text-[#0a0e17] hover:scale-[1.02] shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    {modalType === 'add' ? safeT.modal.supply : safeT.modal.remove}
                                </button>
                            </>
                        )}
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default PoolDetail;