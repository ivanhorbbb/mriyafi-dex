import { useMemo, memo } from 'react';

const MiniChart = ({ poolId, width = 120, height = 40, color = "#00d4ff", withFill = false }) => {
    const { linePathData, fillPathData } = useMemo(() => {
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

        const paddingY = height * 0.1;
        const usableHeight = height - paddingY * 2;

        const mapped = pts.map((v, i) => ({
            x: (i / 19) * width,
            y: height - paddingY - ((v - min) / range) * usableHeight
        }));

        let d = `M ${mapped[0].x},${mapped[0].y}`;
        for (let i = 0; i < mapped.length - 1; i++) {
            const xc = (mapped[i].x + mapped[i + 1].x) / 2;
            const yc = (mapped[i].y + mapped[i + 1].y) / 2;
            d += ` Q ${mapped[i].x},${mapped[i].y} ${xc},${yc}`;
        }
        d += ` T ${mapped[mapped.length - 1].x},${mapped[mapped.length - 1].y}`;
        
        const linePathData = d;
        
        let fillPathData = null;
        if (withFill) {
            fillPathData = `${d} L ${width},${height} L 0,${height} Z`;
        }

        return { linePathData, fillPathData };
    }, [poolId, width, height, withFill]);

    const filterId = `glow-${poolId.replace(/[^a-zA-Z0-9]/g, '')}`;
    const gradientId = `grad-${poolId.replace(/[^a-zA-Z0-9]/g, '')}`;

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

                {withFill && (
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.4" />
                        <stop offset="100%" stopColor={color} stopOpacity="0" />
                    </linearGradient>
                )}
            </defs>
            
            {withFill && fillPathData && (
                <path 
                    d={fillPathData} 
                    fill={`url(#${gradientId})`} 
                    stroke="none"
                />
            )}

            <path 
                d={linePathData} 
                fill="none" 
                stroke={color} 
                strokeWidth="3" 
                strokeLinecap="round"
                filter={`url(#${filterId})`}
            />
        </svg>
    );
};

export default memo(MiniChart);