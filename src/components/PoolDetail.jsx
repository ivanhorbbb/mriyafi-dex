import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft } from 'lucide-react';
import { ethers } from 'ethers';

import { CONTRACTS, ERC20_ABI, ROUTER_ABI, PAIR_ABI } from '../constants/contracts';
import { usePoolData } from '../hooks/usePoolData';

import PoolStats from './pool/PoolStats';
import UserPosition from './pool/UserPosition';
import TransactionsTable from './pool/TransactionsTable';
import LiquidityModal from './pool/LiquidityModal';

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

    // --- HELPER FUNCTIONS ---
    const formatTokenAmount = (val) => val.toLocaleString('en-US', {maximumFractionDigits: 6});
    const formatTime = (ts) => {
        const date = new Date(ts * 1000);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };
    
    const formatTooltip = (val) => {
        if (!val) return '0';
        const num = parseFloat(val);
        if (isNaN(num)) return val;
        return num.toLocaleString('en-US', { maximumFractionDigits: 18 });
    };

    const truncateToDecimals = (val, decimals) => {
        if (!val) return "0";
        if (!val.includes('.')) return val;
        const [integer, fraction] = val.split('.');
        if (fraction.length <= decimals) return val;
        return `${integer}.${fraction.slice(0, decimals)}`;
    };

    const fetchBalances = useCallback(async () => {
        if (window.ethereum && addressA && addressB) {
            try {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const signer = await provider.getSigner();
                const userAddress = await signer.getAddress();

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
                console.error(e);
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
                let rawAmount0 = BigInt(0);
                let rawAmount1 = BigInt(0);

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

                return {
                    hash: tx.transactionHash,
                    type: type,
                    amount0: isTokenA0 ? val0 : val1,
                    amount1: isTokenA0 ? val1 : val0,
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
    }, []); 

    // --- HANDLERS FOR MODAL ---
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

    // --- EXECUTE TRANSACTIONS ---
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

    if (!pool || !pool.token0 || !pool.token1) return null; 

    const safeT = t;
    const borderClass = pool.isHot ? 'border-[#f0dfae]/30' : 'border-[#00d4ff]/30';
    const poolShare = totalSupply > 0 ? (lpBalance / totalSupply) * 100 : 0;
    const isOwnerOfPool = poolShare > 99.9;

    const symbols = { symbolA: symbolA_Name, symbolB: symbolB_Name };

    return (
        <div className="w-full max-w-6xl p-4 animate-fade-in relative z-10">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
                <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors bg-[#131823]/50 px-5 py-2.5 rounded-full border border-white/5 hover:border-white/20 text-sm font-medium backdrop-blur-md">
                    <ArrowLeft size={18} /><span>{safeT.back || "Back"}</span>
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

            {/* MAIN CONTENT GRID */}
            <div className={`rounded-[3rem] border backdrop-blur-xl bg-[#131823]/80 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-3 ${borderClass} mb-8`}>
                <PoolStats 
                    reserves={reserves} 
                    loading={loading} 
                    symbols={symbols} 
                    t={safeT} 
                    pool={pool} 
                    formatTokenAmount={formatTokenAmount}
                    formatTooltip={formatTooltip} 
                />
                
                <UserPosition 
                    lpBalance={lpBalance}
                    poolShare={poolShare}
                    isOwnerOfPool={isOwnerOfPool}
                    reserves={reserves}
                    symbols={symbols}
                    t={safeT}
                    onOpenModal={handleOpenModal}
                    formatTokenAmount={formatTokenAmount}
                />
            </div>

            {/* TRANSACTIONS TABLE */}
            <TransactionsTable 
                transactions={transactions}
                loading={loadingTx}
                symbols={symbols}
                t={safeT}
                formatTokenAmount={formatTokenAmount}
                formatTime={formatTime}
            />

            {/* MODAL */}
            <LiquidityModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                modalType={modalType}
                isTransacting={isTransacting}
                statusMsg={statusMsg}
                isPoolEmpty={isPoolEmpty}
                t={safeT}
                formatTokenAmount={formatTokenAmount}
                symbols={symbols}
                tokens={{ token0, token1 }}
                data={{
                    amountA, amountB, removeAmount, balanceA, balanceB, lpBalance
                }}
                handlers={{
                    onAmountAChange: handleAmountAChange,
                    onAmountBChange: handleAmountBChange,
                    onRemoveAmountChange: (e) => setRemoveAmount(e.target.value),
                    setRemoveMax: () => setRemoveAmount(lpBalance.toString()),
                    onAdd: executeAddLiquidity,
                    onRemove: executeRemoveLiquidity
                }}
            />
        </div>
    );
};

export default PoolDetail;