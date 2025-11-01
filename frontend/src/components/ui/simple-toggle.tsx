import React from 'react';

interface SimpleToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export function SimpleToggle({ checked, onChange, disabled = false, className = '', id }: SimpleToggleProps) {
  return (
    <label 
      className={`inline-flex items-center cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      htmlFor={id}
    >
      <input
        id={id}
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
      />
      <div className={`
        relative w-12 h-6 rounded-full transition-colors duration-200 ease-in-out
        ${checked ? 'bg-orange-500' : 'bg-gray-300'}
        ${disabled ? '' : 'hover:shadow-md'}
      `}>
        <div className={`
          absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md
          transform transition-transform duration-200 ease-in-out
          ${checked ? 'translate-x-6' : 'translate-x-0'}
        `} />
      </div>
    </label>
  );
}

// Compact Mini Toggle for Admin Panels (smaller size)
interface CompactToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  id?: string;
  size?: 'sm' | 'xs';
}

export function CompactToggle({ checked, onChange, disabled = false, className = '', id, size = 'sm' }: CompactToggleProps) {
  const isExtraSmall = size === 'xs';
  
  return (
    <label 
      className={`inline-flex items-center cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      htmlFor={id}
    >
      <input
        id={id}
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
      />
      <div className={`
        relative rounded-full transition-all duration-200 ease-in-out
        ${isExtraSmall ? 'w-8 h-4' : 'w-10 h-5'}
        ${checked 
          ? 'bg-gradient-to-r from-orange-500 to-orange-600 shadow-sm' 
          : 'bg-gray-300 hover:bg-gray-350'
        }
        ${disabled ? '' : 'hover:shadow-md active:scale-95'}
        border border-white/20
      `}>
        <div className={`
          absolute bg-white rounded-full shadow-md
          transform transition-all duration-200 ease-in-out
          ${isExtraSmall 
            ? `top-0.5 w-3 h-3 ${checked ? 'translate-x-4 left-0.5' : 'translate-x-0 left-0.5'}` 
            : `top-0.5 w-4 h-4 ${checked ? 'translate-x-5 left-0.5' : 'translate-x-0 left-0.5'}`
          }
          ${checked ? 'shadow-orange-200' : 'shadow-gray-200'}
        `}>
          {/* Optional indicator dot */}
          <div className={`
            absolute inset-0 rounded-full transition-opacity duration-200
            ${checked ? 'bg-orange-500/20' : 'bg-gray-400/20'}
            ${isExtraSmall ? 'opacity-40' : 'opacity-30'}
          `} />
        </div>
      </div>
    </label>
  );
}

// Simple checkbox alternative (square style)
interface SimpleCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  id?: string;
  label?: string;
}

export function SimpleCheckbox({ checked, onChange, disabled = false, className = '', id, label }: SimpleCheckboxProps) {
  return (
    <label 
      className={`inline-flex items-center cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      htmlFor={id}
    >
      <input
        id={id}
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
      />
      <div className={`
        w-4 h-4 border-2 rounded transition-all duration-200 ease-in-out mr-2
        ${checked 
          ? 'bg-orange-500 border-orange-500' 
          : 'bg-white border-gray-300 hover:border-gray-400'
        }
        ${disabled ? '' : 'hover:shadow-sm'}
        relative
      `}>
        {checked && (
          <svg 
            className="w-3 h-3 text-white absolute top-0 left-0" 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path 
              fillRule="evenodd" 
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
              clipRule="evenodd" 
            />
          </svg>
        )}
      </div>
      {label && <span className="text-sm text-gray-700">{label}</span>}
    </label>
  );
}
