import { useState, useCallback, memo } from 'react';
import PoolDetail from './PoolDetail';

import PoolItem from './pool/PoolItem';
import PoolsHeader from './pool/PoolsHeader';

import usdc from '../assets/img/tokens/usdc.png';
import wbtc from '../assets/img/tokens/wrapped-btc.png';
import mfi from '../assets/img/tokens/mfi.png';
import weth from '../assets/img/tokens/wrapped-eth.png';
import usdt from '../assets/img/tokens/usdt.png';

const POOLS_DATA = [
    {
        id: 1,
        token0: { symbol: 'MFI', logo: mfi },
        token1: { symbol: 'USDC', logo: usdc },
        version: 'V2',
        tvl: '$1.2M',
        vol: '$450K',
        apr: '124.5%',
        isHot: true,
        chartColor: '#f0dfae'
    },
    {
        id: 2,
        token0: { symbol: 'MFI', logo: mfi },
        token1: { symbol: 'WETH', logo: weth },
        version: 'V2',
        tvl: '$850K',
        vol: '$320K',
        apr: '98.2%',
        isHot: true,
        chartColor: '#f0dfae'
    },
    {
        id: 3,
        token0: { symbol: 'WETH', logo: weth },
        token1: { symbol: 'USDC', logo: usdc },
        version: 'V2',
        tvl: '$45M',
        vol: '$12M',
        apr: '18.5%',
        isHot: false,
        chartColor: '#00d4ff'
    },
    {
        id: 4,
        token0: { symbol: 'WBTC', logo: wbtc },
        token1: { symbol: 'WETH', logo: weth },
        version: 'V2',
        tvl: '$21M',
        vol: '$8M',
        apr: '5.2%',
        isHot: false,
        chartColor: '#00d4ff'
    },
    {
        id: 5,
        token0: { symbol: 'USDC', logo: usdc },
        token1: { symbol: 'USDT', logo: usdt },
        version: 'V2',
        tvl: '$105M',
        vol: '$50M',
        apr: '2.1%',
        isHot: false,
        chartColor: '#00d4ff'
    },
    {
        id: 6,
        token0: { symbol: 'MFI', logo: mfi },
        token1: { symbol: 'WBTC', logo: wbtc },
        version: 'V2',
        tvl: '$600K',
        vol: '$150K',
        apr: '85.4%',
        isHot: false,
        chartColor: '#f0dfae'
    },
];

const PoolsCard = ({ t }) => {
    const [selectedPool, setSelectedPool] = useState(null);

    const handleSelectPool = useCallback((pool) => {
        setSelectedPool(pool);
    }, []);

    const handleBack = useCallback(() => {
        setSelectedPool(null);
    }, []);

    const safeT = t || {
        title: 'Liquidity Pools',
        subtitle: 'Earn Fees',
        searchPlaceholder: 'Search pools...',
        hot: 'Hot Pools',
        tvl: 'TVL',
        vol: 'Vol',
        apr: 'APR',
        deposit: 'Deposit',
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
                    add: 'Add', remove: 'Remove', transactions: 'Transactions'
                }}
            />
        );
    }

    return (
        <div className="w-full flex justify-center p-4 animate-fade-in relative z-10">
            {/* Main Wrapper */}
            <div className="
                relative w-full max-w-5xl h-[800px] 
                rounded-[3rem] 
                shadow-2xl 
                bg-[#131823]/95 backdrop-blur-md 
                overflow-hidden isolate
            ">
                <div className="absolute inset-0 rounded-[3rem] border border-white/10 pointer-events-none z-50"></div>
                
                {/* Header Component */}
                <PoolsHeader t={safeT} />

                {/* List Section */}
                <div className="h-full overflow-y-auto overflow-x-hidden px-8 sm:px-10 pt-[220px] pb-10 space-y-12 custom-scrollbar relative z-10">
                    {POOLS_DATA.map((pool) => (
                        <PoolItem key={pool.id} pool={pool} t={safeT} onSelect={handleSelectPool} />
                    ))}
                </div>
            </div>

            <style jsx>{`
                .custom-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                .custom-scrollbar::-webkit-scrollbar { display: none; }
            `}</style>
        </div>
    );
};

export default memo(PoolsCard);