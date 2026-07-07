import React, { useState, useEffect, useRef } from 'react';

const COUNTRIES = [
  { code: '+33', name: 'France', flag: '🇫🇷' },
  { code: '+32', name: 'Belgique', flag: '🇧🇪' },
  { code: '+41', name: 'Suisse', flag: '🇨🇭' },
  { code: '+1', name: 'Canada', flag: '🇨🇦' },
  { code: '+352', name: 'Luxembourg', flag: '🇱🇺' },
  { code: '+225', name: 'Côte d’Ivoire', flag: '🇨🇮' },
  { code: '+221', name: 'Sénégal', flag: '🇸🇳' },
  { code: '+237', name: 'Cameroun', flag: '🇨🇲' },
  { code: '+212', name: 'Maroc', flag: '🇲🇦' },
  { code: '+213', name: 'Algérie', flag: '🇩🇿' },
  { code: '+216', name: 'Tunisie', flag: '🇹🇳' },
  { code: '+590', name: 'Guadeloupe', flag: '🇬🇵' },
  { code: '+596', name: 'Martinique', flag: '🇲🇶' },
  { code: '+262', name: 'Réunion', flag: '🇷🇪' },
  { code: '+594', name: 'Guyane', flag: '🇬🇫' },
  { code: '+262', name: 'Mayotte', flag: '🇾🇹' }
];

export default function PhoneInput({ value, onChange, placeholder = '6 12 34 56 78', id, required }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [nationalNumber, setNationalNumber] = useState('');
  const dropdownRef = useRef(null);

  // Parse incoming value (e.g., "+33612345678")
  useEffect(() => {
    if (value && value.startsWith('+')) {
      const sortedCountries = [...COUNTRIES].sort((a, b) => b.code.length - a.code.length);
      const match = sortedCountries.find(c => value.startsWith(c.code));
      if (match) {
        setSelectedCountry(match);
        setNationalNumber(value.slice(match.code.length));
        return;
      }
    }
    setNationalNumber(value || '');
  }, [value]);

  // Handle outside clicks to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setIsOpen(false);
    onChange(country.code + nationalNumber);
  };

  const handleNumberChange = (e) => {
    const rawVal = e.target.value.replace(/[^0-9]/g, ''); // Keep only numbers
    setNationalNumber(rawVal);
    onChange(selectedCountry.code + rawVal);
  };

  return (
    <div style={{ display: 'flex', gap: '0.5rem', position: 'relative', width: '100%' }}>
      {/* Country Selector Trigger */}
      <div ref={dropdownRef} style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            height: '42px',
            padding: '0 0.75rem',
            border: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            fontSize: '0.9rem',
            fontWeight: '600',
            borderRadius: '6px',
            cursor: 'pointer',
            minWidth: '95px',
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}
        >
          <span style={{ fontSize: '1.2rem', lineHeight: '1' }}>{selectedCountry.flag}</span>
          <span>{selectedCountry.code}</span>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div
            style={{
              position: 'absolute',
              top: '48px',
              left: 0,
              zIndex: 200,
              width: '260px',
              maxHeight: '220px',
              overflowY: 'auto',
              backgroundColor: 'var(--bg-glass)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
              padding: '0.5rem 0'
            }}
          >
            {COUNTRIES.map((country) => (
              <button
                key={country.code + country.name}
                type="button"
                onClick={() => handleCountrySelect(country)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.8rem',
                  width: '100%',
                  padding: '0.6rem 1rem',
                  background: 'none',
                  border: 'none',
                  textAlign: 'left',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--border-color)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <span style={{ fontSize: '1.2rem' }}>{country.flag}</span>
                <span style={{ fontWeight: '600', width: '45px' }}>{country.code}</span>
                <span style={{ color: 'var(--text-secondary)' }}>{country.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Phone Number Input Field */}
      <input
        className="form-input"
        type="tel"
        id={id}
        required={required}
        value={nationalNumber}
        onChange={handleNumberChange}
        placeholder={placeholder}
        style={{ flexGrow: 1, margin: 0, height: '42px' }}
      />
    </div>
  );
}
