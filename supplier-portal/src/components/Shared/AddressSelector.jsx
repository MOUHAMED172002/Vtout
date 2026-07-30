import React, { useEffect, useState, useMemo, useRef } from "react";
import { MapPin, Check, Search, ShieldCheck, Phone, X, Edit2, Loader2, AlertTriangle } from "lucide-react";
import { getHierarchy } from "../../services/locationService";

const removeAccents = (str) => {
  if (!str) return "";
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
};

export default function AddressSelector({
  onChange,
  requirePhone = false,
  requireQuartier = false,
  initial = null,
  onSave,
  onCancel
}) {
  const [phoneRaw, setPhoneRaw] = useState(initial?.phone || "");
  const [phoneError, setPhoneError] = useState(null);
  const [addressDetails, setAddressDetails] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [allLocations, setAllLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const wrapperRef = useRef(null);

  // Chargement des localités depuis la base de données (aucun fallback JSON local)
  useEffect(() => {
    let isMounted = true;

    async function loadLocations() {
      setLoading(true);
      setLoadError(null);
      try {
        const departments = await getHierarchy();

        const list = [];
        departments.forEach((dep) => {
          (dep.communes || []).forEach((com) => {
            (com.arrondissements || []).forEach((arr) => {
              (arr.quartiers || []).forEach((q) => {
                const formatted = `${q.name}, ${arr.name}, ${com.name}`;
                list.push({
                  departement_id: dep.id,
                  departement_label: dep.name,
                  commune_id: com.id,
                  commune_label: com.name,
                  arrondissement_id: arr.id,
                  arrondissement_label: arr.name,
                  quartier_id: q.id,
                  quartier_label: q.name,
                  formattedAddress: formatted,
                  searchStr: removeAccents(formatted)
                });
              });
            });
          });
        });

        if (isMounted) {
          setAllLocations(list);
        }
      } catch (err) {
        console.error("[AddressSelector] Échec du chargement des localités:", err);
        if (isMounted) {
          setLoadError("Impossible de charger la liste des localités. Vérifiez votre connexion.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadLocations();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (initial) {
      if (initial.quartier_label && initial.commune_label) {
        const formatted = `${initial.quartier_label}, ${initial.commune_label}, ${initial.departement_label || ''}`;
        setSelectedLocation({
          departement_id: initial.departement_id,
          departement_label: initial.departement_label,
          commune_id: initial.commune_id,
          commune_label: initial.commune_label,
          arrondissement_id: initial.arrondissement_id,
          arrondissement_label: initial.arrondissement_label,
          quartier_id: initial.quartier_id,
          quartier_label: initial.quartier_label,
          formattedAddress: formatted
        });
        setSearchQuery(formatted);
      }
      if (initial.address_line) {
        setAddressDetails(initial.address_line);
      }
      if (initial.phone) {
        setPhoneRaw(initial.phone);
      }
    }
  }, [initial]);

  const filteredLocations = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = removeAccents(searchQuery.trim());
    return allLocations.filter((loc) => loc.searchStr.includes(query)).slice(0, 50);
  }, [searchQuery, allLocations]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePhoneBlur = () => {
    const s = String(phoneRaw).trim();
    if (s.length === 0) {
      setPhoneError(null);
      return;
    }
    const digits = s.replace(/[^\d]/g, "");
    if (digits.length >= 8 && digits.length <= 15) {
      setPhoneError(null);
    } else {
      setPhoneError("Numéro invalide (ex: 61000000)");
    }
  };

  const handleReset = () => {
    setSelectedLocation(null);
    setSearchQuery("");
    setShowSuggestions(false);
  };

  const currentAddressLine = addressDetails || selectedLocation?.formattedAddress || "";
  const digitsOnly = phoneRaw.replace(/[^\d]/g, "");
  const isPhoneValid = digitsOnly.length >= 8 && digitsOnly.length <= 15;
  const isValidForSave = !!selectedLocation && (!requirePhone || isPhoneValid);

  useEffect(() => {
    if (onChange) {
      onChange({
        ...selectedLocation,
        address_line: currentAddressLine,
        phone: phoneRaw,
        is_valid: isValidForSave,
        label: initial?.label || "Adresse de livraison"
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLocation, addressDetails, phoneRaw, requirePhone, currentAddressLine, isValidForSave, initial?.label]);

  const handleManualSave = () => {
    if (onSave && isValidForSave) {
      onSave({
        id: initial?.id,
        ...selectedLocation,
        address_line: currentAddressLine,
        phone: phoneRaw,
        is_default: initial?.is_default || false,
        label: initial?.label || "Adresse"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 relative" ref={wrapperRef}>
        <label className="text-[10px] font-black uppercase tracking-widest text-base-content/50 ml-2 flex items-center gap-2">
          <MapPin size={14} className="text-primary" /> Localité (Rechercher votre quartier) *
        </label>

        {/* ── État sélectionné : adresse confirmée + bouton Modifier ── */}
        {selectedLocation ? (
          <div className="flex items-center gap-3 px-5 py-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
            <div className="w-8 h-8 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
              <Check className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-black text-sm text-base-content truncate">
                {selectedLocation.quartier_label}
              </p>
              <p className="text-xs text-base-content/50 font-medium truncate">
                {selectedLocation.arrondissement_label ? `${selectedLocation.arrondissement_label}, ` : ''}
                {selectedLocation.commune_label}
                {selectedLocation.departement_label ? ` · ${selectedLocation.departement_label}` : ''}
              </p>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-emerald-200 text-primary font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white hover:border-primary transition-all shrink-0"
            >
              <Edit2 size={11} /> Modifier
            </button>
          </div>
        ) : (
          /* ── État recherche ── */
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              {loading ? (
                <Loader2 className="h-5 w-5 text-base-content/30 animate-spin" />
              ) : (
                <Search className="h-5 w-5 text-base-content/30" />
              )}
            </div>
            <input
              type="text"
              disabled={loading || !!loadError}
              className="w-full h-14 bg-base-100 border border-base-300 rounded-2xl pl-12 pr-6 font-bold text-sm focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none text-base-content placeholder:font-medium placeholder:text-base-content/30 disabled:opacity-60"
              placeholder={loading ? "Chargement des localités..." : "Ex: Akassato, Godomey, Tokpota..."}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
            />

            {showSuggestions && searchQuery && filteredLocations.length > 0 && (
              <div className="absolute z-50 mt-1 w-full bg-base-100 rounded-2xl shadow-xl shadow-base-content/10 border border-base-200 max-h-64 overflow-y-auto">
                {filteredLocations.map((loc) => (
                  <div
                    key={loc.quartier_id}
                    onClick={() => {
                      setSelectedLocation(loc);
                      setSearchQuery(loc.formattedAddress);
                      setShowSuggestions(false);
                    }}
                    className="px-5 py-3 hover:bg-base-200 cursor-pointer border-b border-base-200 last:border-0 transition-colors"
                  >
                    <div className="font-bold text-sm text-base-content">{loc.quartier_label}</div>
                    <div className="text-xs text-base-content/50 font-medium">
                      {loc.arrondissement_label && `${loc.arrondissement_label}, `}{loc.commune_label} ({loc.departement_label})
                    </div>
                  </div>
                ))}
              </div>
            )}

            {showSuggestions && searchQuery && !loading && !loadError && filteredLocations.length === 0 && (
              <div className="absolute z-50 mt-1 w-full bg-base-100 rounded-2xl shadow-xl border border-base-200 p-4 text-center">
                <p className="text-sm font-bold text-base-content/50">Aucune localité trouvée.</p>
              </div>
            )}
          </div>
        )}

        {loadError && (
          <div className="flex items-center gap-2 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl">
            <AlertTriangle size={16} className="text-rose-500 shrink-0" />
            <p className="text-xs font-bold text-rose-600">{loadError}</p>
          </div>
        )}
      </div>

      {selectedLocation && (
        <div className="p-6 bg-base-200 rounded-[2rem] border border-base-300 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-base-content/50 ml-2">
              Détails (Rue, Maison, Repère) — Optionnel
            </label>
            <input
              type="text"
              value={addressDetails}
              onChange={(e) => setAddressDetails(e.target.value)}
              placeholder="Ex: Portail noir, près de la pharmacie..."
              className="w-full h-12 bg-base-100 border border-base-300 rounded-xl px-5 font-bold text-sm focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none text-base-content"
            />
          </div>

          {requirePhone && (
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-base-content/50 ml-2 flex items-center gap-2">
                <Phone size={14} className="text-primary" /> Numéro de téléphone *
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phoneRaw}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPhoneRaw(val);
                    const digits = val.replace(/[^\d]/g, "");
                    if (digits.length >= 8) setPhoneError(null);
                  }}
                  onBlur={handlePhoneBlur}
                  placeholder="Ex: 61000000 ou +229..."
                  className={`w-full h-14 bg-base-100 border rounded-2xl pr-6 font-bold text-sm focus:ring-4 outline-none transition-all text-base-content ${
                    phoneRaw.startsWith('+') ? 'pl-6' : 'pl-16'
                  } ${phoneError ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/10' : 'border-base-300 focus:border-primary focus:ring-primary/5'}`}
                />
                {!phoneRaw.startsWith('+') && (
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <span className="text-base-content/40 font-bold">+229</span>
                  </div>
                )}
                {isPhoneValid && !phoneError && <Check size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-emerald-500" />}
              </div>
              {phoneError && <p className="text-[10px] font-bold text-rose-500 ml-2">{phoneError}</p>}
              <p className="text-[9px] font-medium text-base-content/40 ml-2 italic">Ce numéro pourra être utilisé pour vous contacter lors de la livraison.</p>
            </div>
          )}
        </div>
      )}

      {/* Boutons Enregistrer / Annuler (mode Address Manager) */}
      {(onSave || onCancel) && (
        <div className="flex justify-end gap-3 pt-4 border-t border-base-200 mt-6 md:mt-2">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-6 py-3 rounded-2xl bg-base-100 border border-base-300 text-base-content/70 text-sm font-black uppercase tracking-widest hover:bg-base-200 hover:text-base-content flex items-center gap-2 transition-all outline-none"
            >
              <X size={16} /> Annuler
            </button>
          )}
          {onSave && (
            <button
              onClick={handleManualSave}
              disabled={!isValidForSave}
              className="px-6 py-3 rounded-2xl bg-primary text-primary-content text-sm font-black uppercase tracking-widest hover:brightness-110 flex items-center gap-2 transition-all outline-none disabled:opacity-50 disabled:grayscale shadow-lg shadow-primary/20"
            >
              <Check size={16} /> {initial?.quartier_label ? "Mettre à jour" : "Enregistrer"}
            </button>
          )}
        </div>
      )}

      {/* Badge garantie de livraison (mode inline uniquement) */}
      {selectedLocation && !onSave && (
        <div className="p-5 bg-neutral rounded-[1.5rem] text-neutral-content flex items-center gap-5 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-primary shrink-0 z-10">
            <ShieldCheck size={24} />
          </div>
          <div className="min-w-0 z-10">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-primary mb-1">Zone livrable</p>
            <p className="text-xs font-bold text-neutral-content/70 truncate">
              {selectedLocation.quartier_label}, {selectedLocation.commune_label}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}