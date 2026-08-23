import React from 'react';

interface AgoLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | number;
  variant?: 'full' | 'icon' | 'stacked' | 'badge';
  theme?: 'dark' | 'light' | 'auto';
  className?: string;
  showSubtitle?: boolean;
}

export const AgoIcon: React.FC<{
  size?: number | string;
  className?: string;
}> = ({ size = 36, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 drop-shadow-sm select-none ${className}`}
    >
      <defs>
        {/* Main Frame Outer Gradient */}
        <linearGradient id="agoFrameGrad" x1="20" y1="20" x2="180" y2="180" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" />     {/* Cyan / Sky */}
          <stop offset="35%" stopColor="#2DD4BF" />    {/* Teal */}
          <stop offset="70%" stopColor="#818CF8" />    {/* Indigo / Soft Purple */}
          <stop offset="100%" stopColor="#C084FC" />   {/* Lilac / Violet */}
        </linearGradient>

        {/* Stem / Circuit Line Gradient */}
        <linearGradient id="agoStemGrad" x1="70" y1="60" x2="140" y2="150" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0D9488" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>

        {/* Left Avatar Head Violet Gradient */}
        <linearGradient id="agoHead1Grad" x1="90" y1="40" x2="110" y2="70" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#7E22CE" />
        </linearGradient>

        {/* Right Avatar Head Purple Gradient */}
        <linearGradient id="agoHead2Grad" x1="120" y1="65" x2="145" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#C084FC" />
          <stop offset="100%" stopColor="#9333EA" />
        </linearGradient>

        {/* Soft 3D Glow Filter */}
        <filter id="agoSoftShadow" x="-10%" y="-10%" width="130%" height="130%" filterUnits="userSpaceOnUse">
          <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#0F172A" floodOpacity="0.3" />
        </filter>
      </defs>

      <g filter="url(#agoSoftShadow)">
        {/* Outer Rounded Speech Bubble Outline */}
        {/* Top-left (35, 30), Top-right (165, 30), Bottom-right (165, 140), Bottom-left (35, 140) with Callout Tail */}
        <path
          d="M 65 30 
             L 135 30 
             C 155 30, 168 43, 168 63 
             L 168 115 
             C 168 135, 155 145, 135 145 
             L 135 145
             L 142 165 
             L 125 152
             L 115 145
             L 65 145 
             C 45 145, 32 135, 32 115 
             L 32 63 
             C 32 43, 45 30, 65 30 Z"
          fill="none"
          stroke="url(#agoFrameGrad)"
          strokeWidth="11"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* LEFT FIGURE: Head (Violet Circle) */}
        <circle cx="102" cy="56" r="14" fill="url(#agoHead1Grad)" />

        {/* LEFT FIGURE: Circuit Node Trunk & Left Horizontal Arm */}
        {/* Horizontal Arm */}
        <path
          d="M 60 76 L 98 76"
          stroke="url(#agoStemGrad)"
          strokeWidth="9"
          strokeLinecap="round"
        />
        {/* Vertical Trunk to base */}
        <path
          d="M 98 76 L 98 145"
          stroke="url(#agoStemGrad)"
          strokeWidth="9"
          strokeLinecap="round"
        />
        {/* Central Left Node Joint */}
        <circle cx="98" cy="76" r="10.5" fill="#0D9488" />

        {/* RIGHT FIGURE: Head (Purple Circle) */}
        <circle cx="138" cy="73" r="12" fill="url(#agoHead2Grad)" />

        {/* RIGHT FIGURE: Stem & Circular Node */}
        <path
          d="M 138 90 L 138 145"
          stroke="url(#agoStemGrad)"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <circle cx="138" cy="95" r="9" fill="#0D9488" />
      </g>
    </svg>
  );
};

export const AgoLogo: React.FC<AgoLogoProps> = ({
  size = 'md',
  variant = 'full',
  theme = 'dark',
  className = '',
  showSubtitle = true,
}) => {
  // Dimension Mapping
  let iconPx = 36;
  let textClass = 'text-lg';
  let liteClass = 'text-lg';
  let subClass = 'text-[10px]';

  if (typeof size === 'number') {
    iconPx = size;
  } else {
    switch (size) {
      case 'xs':
        iconPx = 22;
        textClass = 'text-xs';
        liteClass = 'text-xs';
        subClass = 'text-[8px]';
        break;
      case 'sm':
        iconPx = 28;
        textClass = 'text-sm';
        liteClass = 'text-sm';
        subClass = 'text-[9px]';
        break;
      case 'md':
        iconPx = 40;
        textClass = 'text-xl font-black';
        liteClass = 'text-xl font-black';
        subClass = 'text-[11px]';
        break;
      case 'lg':
        iconPx = 48;
        textClass = 'text-2xl sm:text-3xl font-black';
        liteClass = 'text-2xl sm:text-3xl font-black';
        subClass = 'text-xs';
        break;
      case 'xl':
        iconPx = 64;
        textClass = 'text-3xl';
        liteClass = 'text-3xl';
        subClass = 'text-sm';
        break;
      case '2xl':
        iconPx = 92;
        textClass = 'text-4xl';
        liteClass = 'text-4xl';
        subClass = 'text-base';
        break;
    }
  }

  const isDark = theme === 'dark' || theme === 'auto';

  if (variant === 'icon') {
    return <AgoIcon size={iconPx} className={className} />;
  }

  if (variant === 'badge') {
    return (
      <div
        className={`inline-flex items-center gap-2 p-1.5 pr-3 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md ${className}`}
      >
        <AgoIcon size={iconPx} />
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1 font-black leading-none">
            <span className={isDark ? 'text-white' : 'text-slate-900'}>Ago</span>
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Lite
            </span>
          </div>
          {showSubtitle && (
            <span className={`${subClass} text-slate-400 font-medium leading-tight mt-0.5`}>
              AI Super App 🇳🇬
            </span>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'stacked') {
    return (
      <div className={`flex flex-col items-center justify-center text-center select-none ${className}`}>
        <AgoIcon size={iconPx} className="mb-2" />
        <div className="flex items-center justify-center gap-1.5 font-black tracking-tight leading-none">
          <span className={`${textClass} ${isDark ? 'text-white' : 'text-slate-900'}`}>Ago</span>
          <span
            className={`${liteClass} bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent`}
          >
            Lite
          </span>
        </div>
        {showSubtitle && (
          <p className={`${subClass} text-slate-400 font-medium tracking-wide mt-1.5`}>
            AI Shopping & Escrow Marketplace
          </p>
        )}
      </div>
    );
  }

  // Default: Horizontal 'full'
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <AgoIcon size={iconPx} />
      <div className="flex flex-col text-left">
        <div className="flex items-center gap-1 font-black tracking-tight leading-none">
          <span className={`${textClass} ${isDark ? 'text-white' : 'text-slate-900'}`}>Ago</span>
          <span
            className={`${liteClass} bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent`}
          >
            Lite
          </span>
        </div>
        {showSubtitle && (
          <span className={`${subClass} text-slate-400 font-medium leading-none mt-1`}>
            Africa's AI Marketplace
          </span>
        )}
      </div>
    </div>
  );
};
