import React from 'react';

interface XLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showSlogan?: boolean;
  textColor?: string;
  className?: string;
  variant?: 'full' | 'icon-only';
}

export const XLogo: React.FC<XLogoProps> = ({
  size = 'md',
  showSlogan = true,
  textColor = 'text-slate-900',
  className = '',
  variant = 'full',
}) => {
  const iconDimensions = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  }[size];

  const brandTextSizes = {
    xs: 'text-sm tracking-wider',
    sm: 'text-base tracking-wider',
    md: 'text-xl tracking-wider',
    lg: 'text-2xl tracking-widest',
    xl: 'text-4xl tracking-widest',
  }[size];

  const sloganSizes = {
    xs: 'text-[9px] tracking-[0.2em]',
    sm: 'text-[10px] tracking-[0.25em]',
    md: 'text-xs tracking-[0.3em]',
    lg: 'text-sm tracking-[0.35em]',
    xl: 'text-base tracking-[0.4em]',
  }[size];

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`} id="brand-logo-container">
      {/* Faceted Multi-colored Origami X Vector based on the official reference image */}
      <div className={`relative flex-shrink-0 ${iconDimensions} transition-transform hover:scale-105 duration-200`}>
        <svg
          viewBox="0 0 500 500"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-sm"
          id="x-crispin-symbol"
        >
          {/* Top-Left Wing (Greens) */}
          {/* Facet 1: Outer lime top tip */}
          <polygon points="28,68 180,68 96,188 28,188" fill="#52C41A" />
          {/* Facet 2: Bright mid green */}
          <polygon points="96,188 180,68 250,158 148,220" fill="#237804" />
          {/* Facet 3: Dark forest green inner facet */}
          <polygon points="148,220 250,158 250,278 190,265" fill="#094A23" />
          {/* Facet 4: Center left connector */}
          <polygon points="28,188 96,188 190,265 100,265" fill="#135200" />

          {/* Top-Right Wing (Blues & Cyan) */}
          {/* Facet 5: Top-right sky blue wing tip */}
          <polygon points="472,68 320,68 404,188 472,188" fill="#096DD9" />
          {/* Facet 6: Deep cobalt blue */}
          <polygon points="404,188 320,68 250,158 352,220" fill="#003EB3" />
          {/* Facet 7: Center cyan turquoise facet */}
          <polygon points="250,158 352,220 310,265 250,278" fill="#00D4F8" />
          {/* Facet 8: Mid royal blue connector */}
          <polygon points="472,188 404,188 310,265 400,265" fill="#0050B3" />

          {/* Bottom-Left Wing (Yellow & Warm Orange) */}
          {/* Facet 9: Sunny yellow bottom tip */}
          <polygon points="28,432 180,432 148,280 28,312" fill="#FADB14" />
          {/* Facet 10: Deep Amber/Orange facet */}
          <polygon points="180,432 148,280 250,278 200,380" fill="#FA8C16" />
          {/* Facet 11: Vibrant Gold mid */}
          <polygon points="28,312 148,280 250,278 120,380" fill="#FFC53D" />

          {/* Bottom-Right Wing (Deep Magenta & Neon Pink/Crimson) */}
          {/* Facet 12: Inner deep burgundy / wine facet */}
          <polygon points="250,278 352,280 300,380 250,432" fill="#8C073F" />
          {/* Facet 13: Mid Magenta */}
          <polygon points="352,280 472,312 400,380 300,380" fill="#C41D7F" />
          {/* Facet 14: Hot Pink / Crimson bottom right tip */}
          <polygon points="472,432 320,432 400,380 472,312" fill="#F70258" />

          {/* Overlay shine gradient for futuristic depth */}
          <circle cx="250" cy="270" r="40" fill="url(#coreGlow)" opacity="0.15" />
          <defs>
            <radialGradient id="coreGlow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(250 270) rotate(90) scale(40)">
              <stop stopColor="#ffffff" />
              <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>
      </div>

      {variant === 'full' && (
        <div className="flex flex-col justify-center">
          <span className={`font-display font-black leading-none ${brandTextSizes} ${textColor}`}>
            X-CRISPIN
          </span>
          {showSlogan && (
            <span className={`font-semibold uppercase text-cyan-600 font-mono tracking-widest mt-0.5 ${sloganSizes}`}>
              SHOP THE X
            </span>
          )}
        </div>
      )}
    </div>
  );
};
