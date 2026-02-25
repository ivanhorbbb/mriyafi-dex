import { useMemo, memo } from 'react';

const MiniChart = ({ poolId, width = 120, height = 40, color = "#00d4ff" }) => {
    
    const pathData = useMemo(() => {
        let hash = 0;
        const str = String(poolId);
        for (let i = 0; i < str.length; i++) {
            hash = Math.imul(31, hash) + str.charCodeAt(i) | 0;
        }
        
        let rnd = () => {
            hash = Math.imul(741103597, hash) + 1 | 0;
            return (hash >>> 0) / 4294967296;
        };

        let val = 50;
        let pts = [];
        for (let i = 0; i < 20; i++) {
            val += (rnd() - 0.5) * 20;
            pts.push(val);
        }
        
        const min = Math.min(...pts);
        const max = Math.max(...pts);
        const range = max - min || 1;

        const mapped = pts.map((v, i) => ({
            x: (i / 19) * width,
            y: height - ((v - min) / range) * (height * 0.8) - (height * 0.1)
        }));

        let d = `M ${mapped[0].x},${mapped[0].y}`;
        for (let i = 0; i < mapped.length - 1; i++) {
            const xc = (mapped[i].x + mapped[i + 1].x) / 2;
            const yc = (mapped[i].y + mapped[i + 1].y) / 2;
            d += ` Q ${mapped[i].x},${mapped[i].y} ${xc},${yc}`;
        }
        d += ` T ${mapped[mapped.length - 1].x},${mapped[mapped.length - 1].y}`;
        
        return d;
    }, [poolId, width, height]);

    const filterId = `glow-${poolId.replace(/[^a-zA-Z0-9]/g, '')}`;

    return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
            <defs>
                <filter id={filterId}>
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
            </defs>
            <path 
                d={pathData} 
                fill="none" 
                stroke={color} 
                strokeWidth="2.5" 
                strokeLinecap="round"
                filter={`url(#${filterId})`}
            />
        </svg>
    );
}

export default memo(MiniChart);