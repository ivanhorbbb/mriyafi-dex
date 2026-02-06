import { memo } from 'react';
import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { AnimatedText, AnimatedNumber, AnimatedIcon, AnimatedChart } from '../Animations';

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
                <div className="w-full h-[250px] md:h-[450px] relative mt-2">
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

export default memo(ChartSection);