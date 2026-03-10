import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Check, ExternalLink, ShieldCheck } from "lucide-react";
import MapboxPicker from "../Shared/MapboxPicker";

export default function AddressSelector({ onChange, requirePhone = false }) {
  const [phoneRaw, setPhoneRaw] = useState("");
  const [phoneError, setPhoneError] = useState(null);
  const [location, setLocation] = useState(null); // { lat, lng, formattedAddress, departement_label, ... }

  // BENIN phone validation
  const validatePhone = (input) => {
    const s = String(input).trim();
    const digits = s.replace(/[^\d]/g, "");
    if (digits.length >= 8 && digits.length <= 15) {
      setPhoneError(null);
      return true;
    }
    setPhoneError("Numéro de téléphone requis (ex: 61000000)");
    return false;
  };

  const handleLocationSelect = (loc) => {
    setLocation(loc);
  };

  const handleQuartierChange = (val) => {
    setLocation(prev => ({ ...prev, quartier_label: val }));
  };

  const handleCommuneChange = (val) => {
    setLocation(prev => ({ ...prev, commune_label: val }));
  };

  useEffect(() => {
    if (onChange) {
      const isValid = !!location && !!location.lat && !!location.lng && (requirePhone ? (phoneRaw.length >= 8) : true);

      onChange({
        ...location,
        phone: phoneRaw,
        is_valid: isValid,
        address_line: location?.formattedAddress || "",
      });
    }
  }, [location, phoneRaw, onChange, requirePhone]);

  return (
    <div className="space-y-8">
      {/* Map Section */}
      <div className="space-y-4">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
          <MapPin size={14} className="text-primary" /> Pointer mon lieu de livraison
        </label>
        <MapboxPicker
          onLocationSelect={handleLocationSelect}
          label="Cliquer pour définir ma position"
        />
      </div>

      {/* Confirmation Fields */}
      {location && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100"
        >
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Commune</label>
            <input
              type="text"
              value={location.commune_label || ""}
              onChange={(e) => handleCommuneChange(e.target.value)}
              placeholder="Ex: Cotonou"
              className="w-full h-14 bg-white border border-slate-200 rounded-2xl px-6 font-bold text-sm focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Quartier</label>
            <input
              type="text"
              value={location.quartier_label || ""}
              onChange={(e) => handleQuartierChange(e.target.value)}
              placeholder="Ex: Fidjrossè"
              className="w-full h-14 bg-white border border-slate-200 rounded-2xl px-6 font-bold text-sm focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Numéro de téléphone *</label>
            <div className="relative">
              <input
                type="tel"
                value={phoneRaw}
                onChange={(e) => setPhoneRaw(e.target.value)}
                placeholder="61 00 00 00"
                className={`w-full h-14 bg-white border rounded-2xl px-6 font-bold text-sm focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all ${phoneError ? 'border-rose-500' : 'border-slate-200'}`}
              />
              {phoneRaw.length >= 8 && !phoneError && <Check size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-emerald-500" />}
            </div>
            {phoneError && <p className="text-[10px] font-bold text-rose-500 ml-2">{phoneError}</p>}
          </div>
        </motion.div>
      )}

      {/* Footer Info */}
      {location && (
        <div className="p-6 bg-slate-900 rounded-[2rem] text-white flex items-center gap-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl"></div>
          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-primary shrink-0">
            <ShieldCheck size={24} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1">Précision Maximale</p>
            <p className="text-xs font-bold text-slate-400 truncate pr-4">{location.formattedAddress || 'Position enregistrée'}</p>
          </div>
          <a
            href={`https://www.google.com/maps?q=${location.lat},${location.lng}`}
            target="_blank"
            rel="noreferrer"
            className="ml-auto w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 hover:scale-105 transition-transform"
          >
            <ExternalLink size={16} />
          </a>
        </div>
      )}
    </div>
  );
}
