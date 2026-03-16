import React, { useState, useEffect } from 'react';

const ScoreRing = ({ value, infectedFiles = 0 }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const stroke = Math.round((value / 100) * 220);

  // Check for dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    return () => observer.disconnect();
  }, []);

  const bgCircleColor = isDarkMode ? '#475569' : '#eef2ff';
  const progressCircleColor = isDarkMode ? '#818cf8' : '#6366f1';
  const textColor = isDarkMode ? '#f3f4f6' : '#111827';

  return (
    <div className="h-full flex flex-col items-center justify-center">
      <div className="w-32 h-32 grid place-items-center">
        <svg viewBox="0 0 120 120" className="w-32 h-32">
          <circle cx="60" cy="60" r="36" strokeWidth="12" stroke={bgCircleColor} fill="none" />
          <circle
            cx="60"
            cy="60"
            r="36"
            strokeWidth="12"
            stroke={progressCircleColor}
            strokeLinecap="round"
            strokeDasharray={`${stroke} 220`}
            transform="rotate(-90 60 60)"
            fill="none"
          />
          <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" fontSize="20" fill={textColor} fontWeight="600">
            {value}%
          </text>
        </svg>
      </div>
      <div className="text-center">
        <div className="text-base font-bold text-gray-900 dark:text-gray-100">Overall security</div>
        <div className="text-sm font-normal text-slate-500 dark:text-slate-400 mt-1">
          {infectedFiles === 0 
            ? 'No threats detected' 
            : `${infectedFiles} ${infectedFiles === 1 ? 'threat' : 'threats'} found`}
        </div>
      </div>
    </div>
  );
};

export default ScoreRing;

