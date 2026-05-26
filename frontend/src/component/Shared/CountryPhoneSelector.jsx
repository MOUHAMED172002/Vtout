import React, { useState, useMemo, useEffect } from 'react';
import { ChevronDown, Phone } from 'lucide-react';

// Indicatifs téléphoniques West African + France + autres
const COUNTRIES = [
  { code: 'BJ', name: 'Bénin', indicatif: '+229', flag: '🇧🇯' },
  { code: 'CI', name: 'Côte d\'Ivoire', indicatif: '+225', flag: '🇨🇮' },
  { code: 'SN', name: 'Sénégal', indicatif: '+221', flag: '🇸🇳' },
  { code: 'TG', name: 'Togo', indicatif: '+228', flag: '🇹🇬' },
  { code: 'BF', name: 'Burkina Faso', indicatif: '+226', flag: '🇧🇫' },
  { code: 'ML', name: 'Mali', indicatif: '+223', flag: '🇲🇱' },
  { code: 'NE', name: 'Niger', indicatif: '+227', flag: '🇳🇪' },
  { code: 'GH', name: 'Ghana', indicatif: '+233', flag: '🇬🇭' },
  { code: 'NG', name: 'Nigéria', indicatif: '+234', flag: '🇳🇬' },
  { code: 'CM', name: 'Cameroun', indicatif: '+237', flag: '🇨🇲' },
  { code: 'CD', name: 'R.D.Congo', indicatif: '+243', flag: '🇨🇩' },
  { code: 'FR', name: 'France', indicatif: '+33', flag: '🇫🇷' },
  { code: 'GB', name: 'Royaume-Uni', indicatif: '+44', flag: '🇬🇧' },
  { code: 'US', name: 'États-Unis', indicatif: '+1', flag: '🇺🇸' },
];

export default function CountryPhoneSelector({ value, onChange, label, error, required }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Extract country from current value (if it starts with +)
  const extractCountry = (val) => {
    if (!val) return null;
    const indicatif = val.match(/^\+\d+/)?.[0];
    return COUNTRIES.find(c => c.indicatif === indicatif) || COUNTRIES[0]; // Default to Benin
  };

  const selectedCountry = useMemo(() => extractCountry(value), [value]);

  useEffect(() => {
    if (!value || !selectedCountry) {
      setPhoneNumber('');
      return;
    }

    const indicatifDigits = selectedCountry.indicatif.replace('+', '');
    const raw = value.replace(/\D/g, '');
    const phoneOnly = raw.startsWith(indicatifDigits) ? raw.substring(indicatifDigits.length) : raw;
    setPhoneNumber(phoneOnly);
  }, [value, selectedCountry]);

  const filteredCountries = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.indicatif.includes(searchTerm) ||
    c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCountrySelect = (country) => {
    setIsOpen(false);
    setSearchTerm('');
    // Update the outer value with new country code
    const newValue = `${country.indicatif}${phoneNumber.replace(/\D/g, '').slice(country.indicatif.replace('+', '').length)}`;
    onChange(newValue);
  };

  const handlePhoneChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '');
    setPhoneNumber(raw);
    if (selectedCountry) {
      const indicatifDigits = selectedCountry.indicatif.replace('+', '');
      // Ensure we don't duplicate the country code
      const cleanPhone = raw.startsWith(indicatifDigits) 
        ? raw.substring(indicatifDigits.length)
        : raw;
      onChange(`${selectedCountry.indicatif}${cleanPhone}`);
    }
  };

  // Extract just the phone part (without country code) for display
  const displayPhone = useMemo(() => {
    if (!value || !selectedCountry) return '';
    const indicatifDigits = selectedCountry.indicatif.replace('+', '');
    const phoneOnly = value.replace(/\D/g, '').substring(indicatifDigits.length);
    return phoneOnly;
  }, [value, selectedCountry]);

  return (
    <div className="space-y-2 w-full">
      {label && (
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-4 flex items-center gap-1">
          <Phone size={12} /> {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      
      <div className={`flex gap-2 rounded-3xl border-2 overflow-hidden bg-slate-50 ${error ? 'border-rose-400' : 'border-transparent'}`}>
        
        {/* Country Selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="px-4 py-3.5 font-black text-sm min-w-fit hover:bg-slate-100 transition-colors flex items-center gap-2 group"
          >
            {selectedCountry && (
              <>
                <span className="text-lg">{selectedCountry.flag}</span>
                <span className="text-slate-600 font-black text-xs uppercase tracking-widest hidden sm:inline">
                  {selectedCountry.indicatif}
                </span>
              </>
            )}
            <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown */}
          {isOpen && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 max-h-96 overflow-hidden flex flex-col">
              <input
                type="text"
                placeholder="Rechercher un pays..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2.5 border-b border-slate-100 focus:outline-none bg-slate-50 font-bold text-sm"
              />
              
              <div className="overflow-y-auto flex-1">
                {filteredCountries.length === 0 ? (
                  <div className="p-4 text-center text-slate-400 text-sm font-bold">
                    Aucun pays trouvé
                  </div>
                ) : (
                  filteredCountries.map((country) => (
                    <button
                      key={country.code}
                      type="button"
                      onClick={() => handleCountrySelect(country)}
                      className={`w-full px-4 py-2.5 text-left text-sm font-bold hover:bg-primary/10 transition-colors flex items-center gap-3 border-b border-slate-50 ${
                        selectedCountry?.code === country.code ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                      }`}
                    >
                      <span className="text-lg">{country.flag}</span>
                      <span className="flex-1">{country.name}</span>
                      <span className="text-primary font-black">{country.indicatif}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Phone Input */}
        <div className="flex-1">
          <input
            type="tel"
            value={displayPhone}
            onChange={handlePhoneChange}
            placeholder="00 00 00 00"
            className="w-full outline-none bg-transparent font-black text-sm py-3.5 px-2 placeholder-slate-300 focus:ring-0"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="text-rose-500 text-[11px] font-bold px-4">{error}</p>
      )}
      
      {/* Helper */}
      {selectedCountry && (
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4">
          Format: {selectedCountry.indicatif} + numéro local
        </p>
      )}
    </div>
  );
}
