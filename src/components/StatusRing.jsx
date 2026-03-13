import React from 'react';

/**
 * StatusRing Component
 * A premium, circular progress/status indicator using SVG.
 * 
 * @param {number} percentage - 0 to 100
 * @param {string} color - Stroke color (e.g., #00D084, #FF9500, #FF3B30)
 * @param {number} size - Diameter in pixels
 * @param {number} strokeWidth - Width of the ring stroke
 * @param {React.ReactNode} children - Content to display in the center (icon or label)
 * @param {boolean} pulse - Whether to add a pulse animation to the ring
 */
const StatusRing = ({ 
  percentage = 100, 
  color = '#00D084', 
  size = 120, 
  strokeWidth = 8, 
  children,
  pulse = false
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-100 opacity-20"
        />
        
        {/* Progress Stroke */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={`transition-all duration-1000 ease-out ${pulse ? 'animate-pulse' : ''}`}
          style={{ filter: `drop-shadow(0 0 4px ${color}40)` }}
        />
      </svg>
      
      {/* Center Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
};

export default StatusRing;
