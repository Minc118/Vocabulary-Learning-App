import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  comingSoon?: boolean;
}

interface SelectFieldProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  label?: string;
  className?: string;
  variant?: 'default' | 'compact' | 'inline-filter';
}

export function SelectField({ 
  value, 
  onChange, 
  options, 
  label, 
  className = '', 
  variant = 'default' 
}: SelectFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  const handleSelect = (option: SelectOption) => {
    if (option.disabled) return;
    onChange(option.value);
    setIsOpen(false);
  };

  const isDefault = variant === 'default';
  const isCompact = variant === 'compact';
  const isInline = variant === 'inline-filter';

  // Stacking context wrapper
  const hasWidth = className.split(' ').some(c => c.startsWith('w-'));
  const wrapperClass = isInline ? 'relative inline-block' : `relative ${hasWidth ? '' : 'w-full'}`;
  const zIndexClass = isOpen ? 'z-[9999]' : 'z-10';

  // Trigger Button Styles
  let triggerClass = '';
  let chevronClass = '';

  if (isDefault) {
    triggerClass = "w-full h-10 px-3.5 bg-[#f2f4f5] border border-transparent hover:border-[#c2c7cc]/50 focus:border-[#002434]/30 rounded-xl text-[13.5px] font-semibold text-[#191c1d] flex items-center justify-between cursor-pointer transition-all duration-200 select-none text-left focus:outline-none focus:bg-white";
    chevronClass = "w-4 h-4 text-[#42474b]";
  } else if (isCompact) {
    triggerClass = "w-full h-8 px-2.5 bg-[#f2f4f5] border border-transparent hover:border-[#c2c7cc]/40 focus:border-[#002434]/20 rounded-lg text-[12.5px] font-bold text-[#191c1d] flex items-center justify-between cursor-pointer transition-all duration-200 select-none text-left focus:outline-none focus:bg-white";
    chevronClass = "w-3.5 h-3.5 text-[#42474b]";
  } else {
    // inline-filter
    triggerClass = "h-auto py-0.5 pl-1 pr-1 bg-transparent border-none outline-none font-bold text-[#002434] text-[13px] flex items-center gap-1 cursor-pointer select-none text-left hover:text-[#002434]/80 transition-colors";
    chevronClass = "w-3.5 h-3.5 text-[#002434]";
  }

  // Options Panel Overlay Styles
  let panelClass = '';
  let optionClass = '';

  if (isDefault) {
    panelClass = "absolute left-0 right-0 top-full mt-2 w-full bg-white border border-[#c2c7cc]/70 rounded-xl shadow-md z-[10000] py-1 overflow-y-auto max-h-60";
    optionClass = "w-full px-3.5 py-2.5 text-left text-[13.5px] font-semibold transition-colors duration-150 flex items-center justify-between cursor-pointer disabled:cursor-not-allowed select-none";
  } else if (isCompact) {
    panelClass = "absolute left-0 right-0 top-full mt-1.5 w-full bg-white border border-[#c2c7cc]/70 rounded-xl shadow-md z-[10000] py-1 overflow-y-auto max-h-60";
    optionClass = "w-full px-2.5 py-2 text-left text-[12.5px] font-bold transition-colors duration-150 flex items-center justify-between cursor-pointer disabled:cursor-not-allowed select-none";
  } else {
    // inline-filter
    panelClass = "absolute left-0 top-full mt-1.5 min-w-[130px] bg-white border border-[#c2c7cc]/70 rounded-xl shadow-md z-[10000] py-1 overflow-y-auto max-h-60";
    optionClass = "w-full px-3 py-2 text-left text-[13px] font-bold transition-colors duration-150 flex items-center justify-between cursor-pointer disabled:cursor-not-allowed select-none";
  }

  return (
    <div ref={containerRef} className={`${wrapperClass} ${zIndexClass} ${className}`}>
      {label && isDefault && (
        <label className="block text-[11.5px] font-bold text-[#42474b] uppercase tracking-wider mb-2 select-none">
          {label}
        </label>
      )}
      
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={triggerClass}
      >
        <span className="truncate">{selectedOption ? selectedOption.label : 'Select option...'}</span>
        <ChevronDown 
          className={`${chevronClass} transition-transform duration-200 flex-shrink-0 ml-1 ${
            isOpen ? 'rotate-180' : 'rotate-0'
          }`} 
          strokeWidth={1.8} 
        />
      </button>

      {/* Options Panel Overlay */}
      {isOpen && (
        <div className={panelClass}>
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                disabled={option.disabled}
                onClick={() => handleSelect(option)}
                className={`${optionClass} ${
                  isSelected 
                    ? 'text-[#002434] bg-[#002434]/5' 
                    : 'text-[#191c1d] hover:bg-[#f2f4f5]'
                } ${
                  option.disabled ? 'opacity-40 hover:bg-transparent text-muted-foreground' : ''
                }`}
              >
                <span className="truncate">{option.label}</span>
                {option.comingSoon && (
                  <span className="text-[9px] bg-slate-200/80 text-[#42474b] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider ml-2 flex-shrink-0">
                    Coming soon
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

