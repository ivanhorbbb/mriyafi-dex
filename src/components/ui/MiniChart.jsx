import { memo } from 'react';

const MiniChart = ({ color, id }) => (
    <svg viewBox="0 0 120 40" className="w-full h-full overflow-visible" shapeRendering="optimizeSpeed">
        <defs>
            <linearGradient id={`gradient-${id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} />
                <stop offset="100%" stopColor="transparent" />
            </linearGradient>
        </defs>
        <path d="M0 30 C 20 35, 30 15, 50 20 S 70 5, 90 15 S 110 0, 120 10" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M0 30 C 20 35, 30 15, 50 20 S 70 5, 90 15 S 110 0, 120 10 L 120 50 L 0 50 Z" fill={`url(#gradient-${id})`} opacity="0.25" stroke="none" />
    </svg>
);

export default memo(MiniChart);