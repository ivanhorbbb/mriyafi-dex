import { useState, useCallback, useEffect, useMemo, memo } from 'react';
import PoolDetail from './PoolDetail';

import PoolItem from './pool/PoolItem';
import PoolsHeader from './pool/PoolsHeader';
import CreatePoolModal from './pool/CreatePoolModal';

import { TOKENS } from '../constants/tokens';

import usdc from '../assets/img/tokens/usdc.png';
import wbtc from '../assets/img/tokens/wrapped-btc.png';
import mfi from '../assets/img/tokens/mfi.png';
import weth from '../assets/img/tokens/wrapped-eth.png';
import usdt from '../assets/img/tokens/usdt.png';

const parseAmount = (str) => {
    if (!str) return 0;
    const cleanStr = str.toString().replace(/[$,]/g, '');
    const val = parseFloat(cleanStr);
    
    if (str.toString().includes('M')) return val * 1000000;
    if (str.toString().includes('K')) return val * 1000;
    
    return val;
};

const parseApr = (str) => {
    if (!str) return 0;
    return parseFloat(str.toString().replace('%', ''));
};

const enrichPoolData = (pool) => {
    const apr = parseApr(pool.apr);
    const tvl = parseAmount(pool.tvl);
    
    const isHot = tvl > 50000 || apr > 20;

    return {
        ...pool,
        isHot: isHot,
        chartColor: isHot ? '#f0dfae' : '#00d4ff'
    };
};

const injectTokenData = (tokenPart) => {
    const foundToken = TOKENS.find(t => t.symbol === tokenPart.symbol);
    if (foundToken) {
        return { ...foundToken, ...tokenPart };
    }
    return tokenPart;
};

const RAW_POOLS_DATA = [
    {
        id: 1,
        token0: { symbol: 'MFI', logo: mfi },
        token1: { symbol: 'USDC', logo: usdc },
        version: 'V2',
        tvl: '$0',
        vol: '$0',
        apr: '0%'
    },
    {
        id: 2,
        token0: { symbol: 'MFI', logo: mfi },
        token1: { symbol: 'WETH', logo: weth },
        version: 'V2',
        tvl: '$0',
        vol: '$0',
        apr: '0%'
    },
    {
        id: 3,
        token0: { symbol: 'WETH', logo: weth },
        token1: { symbol: 'USDC', logo: usdc },
        version: 'V2',
        tvl: '$0',
        vol: '$0',
        apr: '0%'
    },
    {
        id: 4,
        token0: { symbol: 'WBTC', logo: wbtc },
        token1: { symbol: 'WETH', logo: weth },
        version: 'V2',
        tvl: '$0',
        vol: '$0',
        apr: '0%'
    },
    {
        id: 5,
        token0: { symbol: 'USDC', logo: usdc },
        token1: { symbol: 'USDT', logo: usdt },
        version: 'V2',
        tvl: '$0',
        vol: '$0',
        apr: '0%'
    },
    {
        id: 6,
        token0: { symbol: 'MFI', logo: mfi },
        token1: { symbol: 'WBTC', logo: wbtc },
        version: 'V2',
        tvl: '$0',
        vol: '$0',
        apr: '0%'
    },
];

const PoolsCard = ({ t }) => {
    const [allPools, setAllPools] = useState(() => {
        const savedPools = localStorage.getItem('userPools');
        
        let baseData;
        if (savedPools) {
            baseData = JSON.parse(savedPools);
        } else {
            baseData = RAW_POOLS_DATA;
        }
        
        return baseData.map(pool => {
            const poolWithAddresses = {
                ...pool,
                token0: injectTokenData(pool.token0),
                token1: injectTokenData(pool.token1)
            };
            return enrichPoolData(poolWithAddresses);
        });
    });

    const handlePoolDataUpdate = useCallback((poolId, realStats) => {
        setAllPools(prevPools => {
            return prevPools.map(pool => {
                if (pool.id === poolId) {
                    if (pool.tvl === realStats.tvl && pool.isHot === realStats.isHot) {
                        return pool;
                    }
                    return { ...pool, ...realStats };
                }
                return pool;
            });
        });
    }, []);

    const [selectedPool, setSelectedPool] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isHotFilter, setIsHotFilter] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    useEffect(() => {
        localStorage.setItem('userPools', JSON.stringify(allPools));
    }, [allPools]);

    const handleSelectPool = useCallback((pool) => {
        setSelectedPool(pool);
    }, []);

    const handleBack = useCallback(() => {
        setSelectedPool(null);
    }, []);

    const handleCreatePool = (tokenA, tokenB) => {
        const exists = allPools.find(p => 
            (p.token0.symbol === tokenA.symbol && p.token1.symbol === tokenB.symbol) ||
            (p.token0.symbol === tokenB.symbol && p.token1.symbol === tokenA.symbol)
        );

        if (exists) {
            setSelectedPool(exists);
            return;
        }

        const enrichedToken0 = injectTokenData({ symbol: tokenA.symbol, logo: tokenA.img, ...tokenA });
        const enrichedToken1 = injectTokenData({ symbol: tokenB.symbol, logo: tokenB.img, ...tokenB });
        
        let newPool = {
            id: Date.now(),
            token0: enrichedToken0,
            token1: enrichedToken1,
            version: 'V2',
            tvl: '$0',
            vol: '$0',
            apr: '0%'
        };
        newPool = enrichPoolData(newPool);

        setAllPools(prevPools => [newPool, ...prevPools]);
        setSelectedPool(newPool);
        setIsCreateModalOpen(false);
    };

    const filteredPools = useMemo(() => {
        if (!allPools) return [];

        return allPools.filter(pool => {
            const symbol0 = pool.token0?.symbol || '';
            const symbol1 = pool.token1?.symbol || '';
            
            const query = searchQuery.toLowerCase().trim();

            const matchesSearch = 
                symbol0.toLowerCase().includes(query) ||
                symbol1.toLowerCase().includes(query);
            
            const matchesHot = isHotFilter ? pool.isHot : true;

            return matchesSearch && matchesHot;
        });
    }, [searchQuery, isHotFilter, allPools]);

    const safeT = t || {
        title: 'Liquidity Pools',
        subtitle: 'Earn Fees',
        searchPlaceholder: 'Search pools...',
        hot: 'Hot Pools',
        tvl: 'TVL',
        vol: 'Vol',
        apr: 'APR',
        deposit: 'Deposit',
        createPool: 'Create Pool',
        createPoolTitle: 'Create a new liquidity pool',
        initializePool: 'Initialize Pool',
        noPoolsFound: 'No pools found.',
        tryAdjustingFilters: 'Create new one?',
        poolDetail: {}
    };

    if (selectedPool) {
        return (
            <PoolDetail
                pool={selectedPool}
                onBack={handleBack}
                t={safeT.poolDetail || {
                    back: 'Back', tvl: 'TVL', vol: 'Vol', fees: 'Fees', apr: 'APR',
                    position: 'Position', liquidity: 'Liquidity', feesEarned: 'Earned',
                    add: 'Add', remove: 'Remove', transactions: 'Transactions',
                    modal: { 
                        addLiquidity: 'Add Liquidity', removeLiquidity: 'Remove Liquidity',
                        input: 'Input', balance: 'Balance', yourLiquidity: 'Your LP', 
                        shareOfPool: 'Share', supply: 'Supply', remove: 'Remove',
                        amountToRemove: 'Amount to Remove'
                    }
                }}
            />
        );
    }

    return (
        <div className="w-full flex justify-center p-2 md:p-4 animate-fade-in relative z-10 pb-20">
            {/* Main Wrapper */}
            <div className="
                relative w-full max-w-5xl
                h-auto md:h-[800px]
                rounded-[3rem] 
                shadow-2xl 
                bg-[#131823]/95 backdrop-blur-md 
                border border-white/10
                flex flex-col
                overflow-hidden isolate
            ">
                <div className="absolute inset-0 rounded-[3rem] border border-white/10 pointer-events-none z-50"></div>
                
                {/* Header Component */}
                <div className="flex-shrink-0 z-30 bg-[#131823] relative rounded-t-[3rem]">
                    <PoolsHeader 
                        t={safeT} 
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        isHotFilter={isHotFilter}
                        setIsHotFilter={setIsHotFilter}
                        onCreatePool={() => setIsCreateModalOpen(true)}
                    />
                    <div className="absolute bottom-0 left-0 w-full h-6 bg-gradient-to-b from-[#131823] to-transparent pointer-events-none translate-y-full z-20"></div>
                </div>

                {/* List Section */}
                <div className="h-full overflow-y-auto overflow-x-hidden px-4 md:px-10 pt-[360px] md:pt-[220px] pb-10 space-y-12 custom-scrollbar relative z-10">
                    {filteredPools && filteredPools.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4 pb-4">
                            {filteredPools.map((pool) => (
                                <PoolItem
                                    key={pool.id}
                                    pool={pool}
                                    t={safeT}
                                    onSelect={handleSelectPool}
                                    onPoolDataUpdate={handlePoolDataUpdate}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-40 md:h-full text-gray-500 text-xl text-center">
                            <p>{safeT.noPoolsFound || "No pools found."}</p>
                            <span 
                                className="text-[#00d4ff] cursor-pointer hover:underline mt-2"
                                onClick={() => setIsCreateModalOpen(true)}
                            >
                                {safeT.tryAdjustingFilters || "Create new one?"}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <CreatePoolModal 
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreate={handleCreatePool}
                t={safeT}
            />
        </div>
    );
};

export default memo(PoolsCard);