import React from 'react';

interface BrandIconProps {
  name: string;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  xs: 'w-6 h-6 text-[9px] rounded-[5px]',
  sm: 'w-7 h-7 text-xs rounded-md',
  md: 'w-9 h-9 text-sm rounded-lg',
  lg: 'w-11 h-11 text-base rounded-xl',
  xl: 'w-14 h-14 text-lg rounded-2xl'
};

const svgSizes = {
  xs: 'w-3.5 h-3.5',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8'
};

export const BrandIcon: React.FC<BrandIconProps> = ({ name, className = '', size = 'md' }) => {
  const lower = (name || '').toLowerCase();
  const iconSize = svgSizes[size];

  // 1. Netflix (Crisp Red 'N' Vector Ribbon)
  if (lower.includes('netflix')) {
    return (
      <div
        className={`flex items-center justify-center bg-[#141414] shrink-0 border border-zinc-900 shadow-2xs select-none ${sizeClasses[size]} ${className}`}
        style={{ shapeRendering: 'geometricPrecision' }}
      >
        <svg viewBox="0 0 24 24" className={`${iconSize} fill-[#E50914]`} xmlns="http://www.w3.org/2000/svg">
          <path d="M4 0h3.5v24H4V0zm12.5 0H20v24h-3.5V0zM4 0l12.5 24h3.5L7.5 0H4z" />
        </svg>
      </div>
    );
  }

  // 2. Spotify (Vector Soundwaves)
  if (lower.includes('spotify')) {
    return (
      <div
        className={`flex items-center justify-center bg-[#1ED760] shrink-0 shadow-2xs select-none ${sizeClasses[size]} ${className}`}
        style={{ shapeRendering: 'geometricPrecision' }}
      >
        <svg viewBox="0 0 24 24" className={`${iconSize} fill-black`} xmlns="http://www.w3.org/2000/svg">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.502 17.308c-.218.358-.683.472-1.042.254-2.857-1.745-6.455-2.14-10.69-1.173-.41.094-.823-.162-.917-.573-.094-.41.162-.823.573-.917 4.638-1.059 8.618-.61 11.822 1.368.359.217.473.682.254 1.041zm1.468-3.262c-.274.447-.859.59-1.306.315-3.27-2.01-8.254-2.593-12.122-1.418-.501.152-1.033-.136-1.185-.637-.152-.501.136-1.033.637-1.185 4.417-1.341 9.91-.692 13.66 1.62.448.275.59.859.316 1.305zm.126-3.41c-3.922-2.329-10.383-2.544-14.124-1.408-.602.183-1.24-.163-1.423-.765-.183-.602.163-1.24.765-1.423 4.298-1.305 11.433-1.053 15.932 1.618.54.321.718 1.02.398 1.56-.32.54-1.019.718-1.548.418z" />
        </svg>
      </div>
    );
  }

  // 3. Adobe (Vector Flame / Creative Triangle)
  if (lower.includes('adobe')) {
    return (
      <div
        className={`flex items-center justify-center bg-[#FA0F00] text-white shrink-0 shadow-2xs select-none ${sizeClasses[size]} ${className}`}
        style={{ shapeRendering: 'geometricPrecision' }}
      >
        <svg viewBox="0 0 24 24" className={`${iconSize} fill-white`} xmlns="http://www.w3.org/2000/svg">
          <path d="M13.96 5.46L18.88 18h-3.08l-1.54-4.15h-4.52L13.96 5.46zM9.42 2h5.16L24 22H15.6l-2.45-6.17h-2.3L9.42 2zM0 22L8.58 2h4.52L4.52 22H0z" />
        </svg>
      </div>
    );
  }

  // 4. OpenAI ChatGPT Plus
  if (lower.includes('chatgpt') || lower.includes('openai')) {
    return (
      <div
        className={`flex items-center justify-center bg-[#10A37F] text-white shrink-0 shadow-2xs select-none ${sizeClasses[size]} ${className}`}
        style={{ shapeRendering: 'geometricPrecision' }}
      >
        <svg viewBox="0 0 24 24" className={`${iconSize} fill-white`} xmlns="http://www.w3.org/2000/svg">
          <path d="M22.28 9.87a6.22 6.22 0 0 0-.52-5.11 6.28 6.28 0 0 0-6.42-3.1 6.2 6.2 0 0 0-4.66-2.07 6.28 6.28 0 0 0-6 4.38 6.24 6.24 0 0 0-4.04 2.93 6.28 6.28 0 0 0 .81 7.15 6.22 6.22 0 0 0 .52 5.11 6.28 6.28 0 0 0 6.42 3.1 6.2 6.2 0 0 0 4.66 2.07 6.28 6.28 0 0 0 6-4.38 6.24 6.24 0 0 0 4.04-2.93 6.28 6.28 0 0 0-.81-7.15z" />
        </svg>
      </div>
    );
  }

  // 5. Amazon Prime (Vector Prime Smile Arrow)
  if (lower.includes('amazon') || lower.includes('prime')) {
    return (
      <div
        className={`flex items-center justify-center bg-[#00A8E1] text-white shrink-0 shadow-2xs select-none ${sizeClasses[size]} ${className}`}
        style={{ shapeRendering: 'geometricPrecision' }}
      >
        <svg viewBox="0 0 24 24" className={`${iconSize} fill-white`} xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5c-3.15 0-5.85-1.57-7-3.9.22-.1.45-.18.7-.22 1.05 1.9 3.2 3.12 5.3 3.12 2.35 0 4.45-1.42 5.4-3.55.22.08.45.18.65.3-1.12 2.5-3.55 4.25-6.05 4.25zm5.5-5.25c-.28 0-.5-.22-.5-.5v-3.5c0-.28.22-.5.5-.5s.5.22.5.5v3.5c0 .28-.22.5-.5.5z" />
        </svg>
      </div>
    );
  }

  // 6. Google One / Google Services
  if (lower.includes('google')) {
    return (
      <div
        className={`flex items-center justify-center bg-white border border-[#D8D5CA] shrink-0 shadow-2xs select-none ${sizeClasses[size]} ${className}`}
        style={{ shapeRendering: 'geometricPrecision' }}
      >
        <svg viewBox="0 0 24 24" className={iconSize} xmlns="http://www.w3.org/2000/svg">
          <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.9c2.28-2.1 3.6-5.2 3.6-9.14z" />
          <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.9-3.05c-1.08.72-2.45 1.16-4.03 1.16-3.1 0-5.72-2.1-6.66-4.92H1.3v3.13C3.33 21.43 7.37 24 12 24z" />
          <path fill="#FBBC05" d="M5.34 14.28c-.24-.72-.38-1.49-.38-2.28s.14-1.56.38-2.28V6.59H1.3A11.96 11.96 0 0 0 0 12c0 1.92.46 3.74 1.3 5.41l4.04-3.13z" />
          <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.33 2.57 1.3 6.59l4.04 3.13c.94-2.82 3.56-4.97 6.66-4.97z" />
        </svg>
      </div>
    );
  }

  // 7. YouTube Premium
  if (lower.includes('youtube')) {
    return (
      <div
        className={`flex items-center justify-center bg-[#FF0000] text-white shrink-0 shadow-2xs select-none ${sizeClasses[size]} ${className}`}
        style={{ shapeRendering: 'geometricPrecision' }}
      >
        <svg viewBox="0 0 24 24" className={`${iconSize} fill-white`} xmlns="http://www.w3.org/2000/svg">
          <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
        </svg>
      </div>
    );
  }

  // 8. Apple Music / Apple Services
  if (lower.includes('apple')) {
    return (
      <div
        className={`flex items-center justify-center bg-black text-white shrink-0 shadow-2xs select-none ${sizeClasses[size]} ${className}`}
        style={{ shapeRendering: 'geometricPrecision' }}
      >
        <svg viewBox="0 0 24 24" className={`${iconSize} fill-white`} xmlns="http://www.w3.org/2000/svg">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.84c.64-.78 1.08-1.87.96-2.96-.93.04-2.07.62-2.73 1.4-.58.68-1.09 1.77-.95 2.84 1.05.08 2.08-.5 2.72-1.28z" />
        </svg>
      </div>
    );
  }

  // 9. Canva Pro
  if (lower.includes('canva')) {
    return (
      <div
        className={`flex items-center justify-center bg-[#00C4CC] text-white shrink-0 shadow-2xs select-none ${sizeClasses[size]} ${className}`}
        style={{ shapeRendering: 'geometricPrecision' }}
      >
        <svg viewBox="0 0 24 24" className={`${iconSize} fill-white`} xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 16c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78l-1.41 1.41C14.12 8.48 13.11 8 12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4c1.86 0 3.41-1.28 3.86-3H12v-2h6c.09.47.14.96.14 1.46 0 3.61-2.69 5.54-6.14 5.54z" />
        </svg>
      </div>
    );
  }

  // 10. Cult.fit
  if (lower.includes('cult')) {
    return (
      <div
        className={`flex items-center justify-center bg-[#FF4500] text-white shrink-0 shadow-2xs select-none ${sizeClasses[size]} ${className}`}
        style={{ shapeRendering: 'geometricPrecision' }}
      >
        <svg viewBox="0 0 24 24" className={`${iconSize} fill-white`} xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    );
  }

  // 11. Swiggy
  if (lower.includes('swiggy')) {
    return (
      <div
        className={`flex items-center justify-center bg-[#FC8019] text-white shrink-0 shadow-2xs select-none ${sizeClasses[size]} ${className}`}
        style={{ shapeRendering: 'geometricPrecision' }}
      >
        <svg viewBox="0 0 24 24" className={`${iconSize} fill-white`} xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
        </svg>
      </div>
    );
  }

  // 12. JioCinema / Hotstar
  if (lower.includes('hotstar') || lower.includes('jio')) {
    return (
      <div
        className={`flex items-center justify-center bg-[#0C1B33] text-white shrink-0 shadow-2xs select-none ${sizeClasses[size]} ${className}`}
        style={{ shapeRendering: 'geometricPrecision' }}
      >
        <svg viewBox="0 0 24 24" className={`${iconSize} fill-[#00D2FF]`} xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      </div>
    );
  }

  // Default clean monogram with crisp typography
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase() || 'S';

  return (
    <div
      className={`flex items-center justify-center bg-[#092326] text-[#FBF9F3] font-serif font-bold shrink-0 border border-[#D8D5CA]/80 shadow-2xs select-none ${sizeClasses[size]} ${className}`}
    >
      <span>{initials}</span>
    </div>
  );
};
