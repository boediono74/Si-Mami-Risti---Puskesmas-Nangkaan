import React from 'react';

interface LogoSiMamiRistiProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const LogoSiMamiRisti: React.FC<LogoSiMamiRistiProps> = ({
  className = '',
  size = 48,
  showText = true
}) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div 
        style={{ width: size, height: size }} 
        className="shrink-0 rounded-full shadow-md overflow-hidden bg-white border border-emerald-200/80 flex items-center justify-center p-0.5 hover:scale-105 transition-transform"
      >
        <img 
          src="/logo-si-mami-risti.svg" 
          alt="Logo Si Mami Risti UPTD Puskesmas Nangkaan" 
          className="w-full h-full object-contain"
        />
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-black text-slate-900 tracking-tight text-lg leading-tight">
              <span className="text-emerald-800">Si Mami</span>{' '}
              <span className="text-pink-600">Risti</span>
            </span>
            <span className="bg-pink-100 text-pink-700 text-[10px] font-extrabold px-1.5 py-0.2 rounded-sm border border-pink-200 uppercase">
              Bumil
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-semibold leading-tight">
            UPTD Puskesmas Nangkaan Bondowoso
          </span>
        </div>
      )}
    </div>
  );
};
