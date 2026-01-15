import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { createPortal } from 'react-dom';
import { ethers } from 'ethers';
import { AnimatePresence } from 'framer-motion';

import { TOKENS } from '../constants/tokens';
import { useSwap } from '../hooks/useSwap';
import { useDebounce } from '../hooks/useDebounce';

import Notification from './ui/Notification';
import ChartSection from './swap/ChartSection';
import SwapForm from './swap/SwapForm';
const SettingsModal = React.lazy(() => import('./swap/SettingsModal'));
const TokenSelectModal = React.lazy(() => import('./swap/TokenSelectModal'));

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
    const [activeInput, setActiveInput] = useState('pay');

    const debouncedPayAmount = useDebounce(payAmount, 600);
    const debouncedReceiveAmount = useDebounce(receiveAmount, 600);

    const [slippage, setSlippage] = useState(0.5);
    const [deadline, setDeadline] = useState(20);
    const [timeframe, setTimeframe] = useState('1D');
    const [gasPriceUsd, setGasPriceUsd] = useState('');

    const [marketRate, setMarketRate] = useState('0.00');
    const [priceChange, setPriceChange] = useState(0);

    const [notification, setNotification] = useState(null);

    const { getAmountsIn, getAmountsOut, swapTokens } = useSwap(provider, account);

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

    // QUOTE EFFECTS
    useEffect(() => {
        if (activeInput !== 'pay') return;
        if (!debouncedPayAmount || parseFloat(debouncedPayAmount) <= 0) {
            setReceiveAmount('');
            return;
        }


        const getQuote = async () => {
            const path = [payToken.address, receiveToken.address];
            try {
                const amountInWei = ethers.parseUnits(debouncedPayAmount, payToken.decimals);
                const amountOutWei = await getAmountsOut(amountInWei, path);

                if (amountOutWei && amountOutWei !== '0') {
                    const formattedOut = ethers.formatUnits(amountOutWei, receiveToken.decimals);
                    setReceiveAmount(parseFloat(formattedOut).toFixed(6));
                }
            } catch (error) {
                console.warn("Quote error:", error);
            }
        };

        getQuote();
        
    }, [debouncedPayAmount, payToken, receiveToken, getAmountsOut, activeInput]);

    useEffect(() => {
        if (activeInput !== 'receive') return; 
        
        if (!debouncedReceiveAmount || parseFloat(debouncedReceiveAmount) <= 0) {
            setPayAmount('');
            return;
        }

        const getQuote = async () => {
            const path = [payToken.address, receiveToken.address];
            try {
                const amountOutWei = ethers.parseUnits(debouncedReceiveAmount, receiveToken.decimals);
                const amountInWei = await getAmountsIn(amountOutWei, path);

                if (amountInWei && amountInWei.toString() !== '0') {
                    const formattedIn = ethers.formatUnits(amountInWei, payToken.decimals);
                    setPayAmount(parseFloat(formattedIn).toFixed(6));
                }
            } catch (error) {
                console.warn("Calculation failed:", error);
            }
        };

        getQuote();

    }, [debouncedReceiveAmount, payToken, receiveToken, getAmountsIn, activeInput]);
    
    // HANDLERS
    const handlePayInput = useCallback((e) => {
        const value = e.target.value;
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            setPayAmount(value);
            setActiveInput('pay');
        }
    }, []);

    const handleReceiveInput = useCallback((e) => {
        const value = e.target.value;
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            setReceiveAmount(value);
            setActiveInput('receive');
        }
    }, []);

    const handleMaxClick = useCallback(() => {
        const balance = getTokenBalance(payToken.symbol);
        const cleanBalance = balance.replace(/,/g, '');
        setPayAmount(cleanBalance);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [payToken, balances]);

    const handleSwapArrows = useCallback(() => {
        setPaySymbol(receiveSymbol);
        setReceiveSymbol(paySymbol);
        setPayAmount('');
        setReceiveAmount('');
    }, [paySymbol, receiveSymbol]);

    const showNotification = (type, title, message) => {
        setNotification({ type, title, message });
    };

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
            
            const slippageFactor = 10000n - BigInt(Math.floor(slippage * 100));
            const amountOutMin = (amountOutWei * slippageFactor) / 10000n;
            const deadlineInSeconds = Math.floor(Date.now() / 1000) + (deadline * 60);
            const path = [payToken.address, receiveToken.address];

            await swapTokens(amountInWei, amountOutMin, path, deadlineInSeconds);

            const successTitle = t.notifications?.successTitle || 'Success';
            const successMsg = `${t.notifications?.swapped || 'Swapped'} ${payAmount} ${payToken.symbol} to ${receiveAmount} ${receiveToken.symbol}`;
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

    const openTokenModal = (type) => {
        setTokenModalType(type);
        setIsTokenModalOpen(true);
    };

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

    const payUsdValue = ((parseFloat(payAmount) || 0) * payToken.price).toFixed(2);
    const receiveUsdValue = ((parseFloat(receiveAmount) || 0) * receiveToken.price).toFixed(2);
    const displayRate = parseFloat(receiveAmount) > 0 && parseFloat(payAmount) > 0
        ? (parseFloat(receiveAmount) / parseFloat(payAmount)).toFixed(6) 
        : marketRate;

    return(
        <div className="w-full flex justify-center p-4 animate-fade-in relative z-10">

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

                <SwapForm 
                    t={t}
                    themeStyles={themeStyles}
                    onOpenSettings={() => setIsSettingsOpen(true)}
                    payAmount={payAmount}
                    onPayInput={handlePayInput}
                    getTokenBalance={getTokenBalance}
                    payToken={payToken}
                    onOpenTokenModal={openTokenModal}
                    handleMaxClick={handleMaxClick}
                    payUsdValue={payUsdValue}
                    handleSwapArrows={handleSwapArrows}
                    receiveAmount={receiveAmount}
                    onReceiveInput={handleReceiveInput}
                    receiveToken={receiveToken}
                    receiveUsdValue={receiveUsdValue}
                    displayRate={displayRate}
                    gasPriceUsd={gasPriceUsd}
                    isSwapping={isSwapping}
                    isInsufficientBalance={isInsufficientBalance}
                    isEnterAmount={isEnterAmount}
                    handleSwap={handleSwap}
                />
            </div>

            <Suspense fallback={null}>
                {isTokenModalOpen && (
                    <TokenSelectModal 
                        isOpen={isTokenModalOpen}
                        onClose={() => setIsTokenModalOpen(false)}
                        t={t}
                        tokens={tokens}
                        onSelect={selectToken}
                        activeSymbol={tokenModalType === 'pay' ? paySymbol : receiveSymbol}
                        getTokenBalance={getTokenBalance}
                    />
                )}
            </Suspense>

            <Suspense fallback={null}>
                {isSettingsOpen && (
                    <SettingsModal 
                        isOpen={isSettingsOpen}
                        onClose={() => setIsSettingsOpen(false)}
                        t={t}
                        slippage={slippage}
                        setSlippage={setSlippage}
                        deadline={deadline}
                        setDeadline={setDeadline}
                    />
                )}
            </Suspense>
        </div>
    );
};

export default SwapCard;