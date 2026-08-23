import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check, Globe } from 'lucide-react';

export interface CountryData {
  name: string;
  code: string; // ISO 2-letter
  dialCode: string; // e.g. "+234"
  flag: string;
  placeholder: string;
  maxLength: number;
  minLength: number;
}

export const COUNTRIES: CountryData[] = [
  { name: 'Nigeria', code: 'NG', dialCode: '+234', flag: '🇳🇬', placeholder: '808 123 4567', maxLength: 11, minLength: 9 },
  { name: 'Ghana', code: 'GH', dialCode: '+233', flag: '🇬🇭', placeholder: '24 123 4567', maxLength: 10, minLength: 9 },
  { name: 'Kenya', code: 'KE', dialCode: '+254', flag: '🇰🇪', placeholder: '712 345 678', maxLength: 10, minLength: 9 },
  { name: 'United Kingdom', code: 'GB', dialCode: '+44', flag: '🇬🇧', placeholder: '7911 123456', maxLength: 11, minLength: 10 },
  { name: 'United States', code: 'US', dialCode: '+1', flag: '🇺🇸', placeholder: '202 555 0123', maxLength: 10, minLength: 10 },
  { name: 'Canada', code: 'CA', dialCode: '+1', flag: '🇨🇦', placeholder: '416 555 0199', maxLength: 10, minLength: 10 },
  { name: 'South Africa', code: 'ZA', dialCode: '+27', flag: '🇿🇦', placeholder: '71 234 5678', maxLength: 10, minLength: 9 },
  { name: 'Rwanda', code: 'RW', dialCode: '+250', flag: '🇷🇼', placeholder: '788 123 456', maxLength: 9, minLength: 9 },
  { name: 'Egypt', code: 'EG', dialCode: '+20', flag: '🇪🇬', placeholder: '100 123 4567', maxLength: 11, minLength: 10 },
  { name: 'United Arab Emirates', code: 'AE', dialCode: '+971', flag: '🇦🇪', placeholder: '50 123 4567', maxLength: 9, minLength: 9 },
  { name: 'Germany', code: 'DE', dialCode: '+49', flag: '🇩🇪', placeholder: '151 12345678', maxLength: 11, minLength: 10 },
  { name: 'France', code: 'FR', dialCode: '+33', flag: '🇫🇷', placeholder: '6 12 34 56 78', maxLength: 10, minLength: 9 },
  { name: 'India', code: 'IN', dialCode: '+91', flag: '🇮🇳', placeholder: '98765 43210', maxLength: 10, minLength: 10 },
  { name: 'China', code: 'CN', dialCode: '+86', flag: '🇨🇳', placeholder: '138 0013 8000', maxLength: 11, minLength: 11 },
];

interface CountryPhoneInputProps {
  value: string; // The national/raw phone number input
  selectedCountry: CountryData;
  onChangeCountry: (country: CountryData) => void;
  onChangeNumber: (rawNumber: string, fullInternationalNumber: string) => void;
  id?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

// Utility to format international phone number: {countryCode}{phoneNumber without leading 0}
export const formatFullInternationalNumber = (dialCode: string, rawPhone: string): string => {
  const digitsOnly = rawPhone.replace(/\D/g, '');
  if (!digitsOnly) return '';
  // Strip leading zero if user typed e.g. 0241234567 or 08081234567
  const normalizedDigits = digitsOnly.startsWith('0') ? digitsOnly.slice(1) : digitsOnly;
  return `${dialCode}${normalizedDigits}`;
};

export const CountryPhoneInput: React.FC<CountryPhoneInputProps> = ({
  value,
  selectedCountry,
  onChangeCountry,
  onChangeNumber,
  id,
  required = true,
  disabled = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Auto focus search box
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const filteredCountries = COUNTRIES.filter((c) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      c.name.toLowerCase().includes(query) ||
      c.dialCode.includes(query) ||
      c.code.toLowerCase().includes(query)
    );
  });

  const handleSelectCountry = (country: CountryData) => {
    onChangeCountry(country);
    setIsOpen(false);
    setSearchQuery('');
    const fullNumber = formatFullInternationalNumber(country.dialCode, value);
    onChangeNumber(value, fullNumber);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    // Allow digits and spaces
    const sanitized = rawVal.replace(/[^\d\s]/g, '');
    const fullNumber = formatFullInternationalNumber(selectedCountry.dialCode, sanitized);
    onChangeNumber(sanitized, fullNumber);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="flex items-stretch rounded-xl bg-slate-950 border border-slate-800 focus-within:border-teal-400 focus-within:ring-1 focus-within:ring-teal-400/30 transition shadow-inner">
        {/* Dropdown Button with Flag + Country Code + Arrow ↓ */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          disabled={disabled}
          className="flex items-center gap-1.5 px-3 py-2.5 bg-slate-900/90 hover:bg-slate-850 border-r border-slate-800 text-xs sm:text-sm text-white font-semibold rounded-l-xl transition cursor-pointer select-none shrink-0"
          title={`Selected: ${selectedCountry.name} (${selectedCountry.dialCode})`}
        >
          <span className="text-base leading-none" role="img" aria-label={selectedCountry.name}>
            {selectedCountry.flag}
          </span>
          <span className="font-mono text-xs sm:text-sm text-teal-300 font-bold">
            {selectedCountry.dialCode}
          </span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-teal-400' : ''
            }`}
          />
        </button>

        {/* Right side: Normal phone number input with dynamic max length & placeholder */}
        <input
          id={id}
          type="tel"
          required={required}
          disabled={disabled}
          value={value}
          onChange={handleInputChange}
          maxLength={selectedCountry.maxLength + 2} // extra space for formatting
          placeholder={selectedCountry.placeholder}
          className="flex-1 bg-transparent px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none font-mono tracking-wider"
        />
      </div>

      {/* Floating Dropdown List of Countries */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 w-72 sm:w-80 max-h-72 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Search Header */}
          <div className="p-2.5 border-b border-slate-800 bg-slate-950/60 sticky top-0 z-10 flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search country or code (e.g. Ghana, +233)..."
              className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

          {/* Scrollable list */}
          <div className="overflow-y-auto divide-y divide-slate-800/40 p-1">
            {filteredCountries.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500">
                No matching countries found
              </div>
            ) : (
              filteredCountries.map((c) => {
                const isSelected = c.code === selectedCountry.code && c.dialCode === selectedCountry.dialCode;
                return (
                  <button
                    key={`${c.code}-${c.dialCode}`}
                    type="button"
                    onClick={() => handleSelectCountry(c)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs transition cursor-pointer ${
                      isSelected
                        ? 'bg-teal-500/20 text-teal-300 font-bold border border-teal-500/30'
                        : 'hover:bg-slate-800/80 text-slate-200 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="text-lg leading-none shrink-0" role="img" aria-label={c.name}>
                        {c.flag}
                      </span>
                      <span className="truncate">{c.name}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className="font-mono text-[11px] text-teal-400 font-bold">
                        {c.dialCode}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-teal-400 shrink-0" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
