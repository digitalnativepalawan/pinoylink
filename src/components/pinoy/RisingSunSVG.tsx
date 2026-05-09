export default function RisingSunSVG({ className = "", opacity = 0.15 }: { className?: string; opacity?: number }) {
  return (
    <svg 
      className={`absolute pointer-events-none ${className}`} 
      viewBox="0 0 200 200" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ opacity }}
    >
      <g transform="translate(100, 100)">
        {/* Central core circle */}
        <circle r="32" fill="#FCD116" />
        
        {/* 8 Primary dramatic rays with dynamic width and sharp abstract angles */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, idx) => (
          <g key={idx} transform={`rotate(${angle})`}>
            {/* Main beam */}
            <path 
              d="M 36 -4 L 95 -1 L 95 1 L 36 4 Z" 
              fill="#FCD116" 
            />
            {/* Secondary flanking split rays representative of the 3-spoke Philippine ray design */}
            <path 
              d="M 38 -8 L 82 -12 L 80 -10 L 38 -5 Z" 
              fill="#FCD116" 
              opacity="0.8"
            />
            <path 
              d="M 38 8 L 82 12 L 80 10 L 38 5 Z" 
              fill="#FCD116" 
              opacity="0.8"
            />
          </g>
        ))}
      </g>
    </svg>
  );
}
