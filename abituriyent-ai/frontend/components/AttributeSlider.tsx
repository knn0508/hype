import React from 'react';

interface AttributeSliderProps {
  attribute: string;
  value: number;
  onChange: (value: number) => void;
}

const formatAttributeName = (attr: string) => {
  return attr.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

export const AttributeSlider: React.FC<AttributeSliderProps> = ({ attribute, value, onChange }) => {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm font-bold text-white tracking-wide">{formatAttributeName(attribute)}</span>
        <div className="bg-navy-dark px-3 py-1 rounded-md border border-white/5 shadow-inner">
           <span className="text-gold font-bold">{value} <span className="text-text-muted text-xs font-normal">/ 5</span></span>
        </div>
      </div>
      
      <div className="relative pt-2 pb-6">
        <input
          type="range"
          min="1"
          max="5"
          step="1"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="custom-slider w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer"
        />
        
        <div className="flex justify-between absolute w-full top-8 px-1">
           {[1, 2, 3, 4, 5].map((num) => (
             <div key={num} className="flex flex-col items-center">
                 <span className={`text-[10px] font-bold ${value >= num ? 'text-gold' : 'text-white/30'}`}>
                    {num === 1 && "Zəif"}
                    {num === 3 && "Orta"}
                    {num === 5 && "Əla"}
                    {num !== 1 && num !== 3 && num !== 5 && num}
                 </span>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};
