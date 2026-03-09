// AddressSelector - forced refresh
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Check, ChevronRight, Search, ExternalLink } from "lucide-react";
import territories from "../../data/decoupage-territorial-benin.json";
import MapboxPicker from "./MapboxPicker";

function guessLabel(obj) {
  if (!obj && obj !== 0) return "";
  if (typeof obj === "string") return obj;
  if (typeof obj === "number") return String(obj);

  const keysPriority = ["libelle", "lib_q", "lib_qte", "lib_qp", "lib_com", "lib_dep", "name", "nom", "label", "title", "lib"];
  for (const k of keysPriority) {
    if (obj[k] && (typeof obj[k] === "string" || typeof obj[k] === "number")) return String(obj[k]);
  }

  for (const k of Object.keys(obj || {})) {
    const v = obj[k];
    if (typeof v === "string" || typeof v === "number") return String(v);
  }

  try {
    const s = JSON.stringify(obj);
    return s.length > 0 ? (s.length > 50 ? s.slice(0, 47) + "..." : s) : "";
  } catch {
    return "";
  }
}

// --- replace extractQuartiers to handle arrondissements -> quartiers (lib_quart)
function extractQuartiersFromArrondissements(rawArrondissements, communeId) {
  if (!rawArrondissements) return [];
  if (!Array.isArray(rawArrondissements)) return [];

  const seen = new Set();
  const list = [];

  rawArrondissements.forEach((arr, ai) => {
    // arr may contain 'quartiers' array OR 'quartiers' objects directly
    const arrId = arr && (arr.id_arrond || arr.id || `arr_${ai}`);
    const rawQuartiers = arr.quartiers || arr.quartier || arr.localites || [];

    if (!Array.isArray(rawQuartiers)) return;

    rawQuartiers.forEach((q, qi) => {
      // prefer lib_quart key from your JSON
      const rawName = typeof q === "string" ? q : (q.lib_quart ?? q.lib_q ?? q.libelle ?? q.name ?? q.nom ?? guessLabel(q));
      const name = (rawName || "").toString().trim();
      if (!name) return;
      // create stable id combining commune / arrond / index
      const id = q && (q.id || q.code) ? String(q.id ?? q.code) : `${communeId}_arr${arrId}_q${qi + 1}`;
      if (seen.has(name)) return; // dedupe by label (keeps first occurrence)
      seen.add(name);
      list.push({ id: String(id), name });
    });
  });

  return list;
}

// --- Simple SearchableSelect component ---
function SearchableSelect({ label, value, options, onChange, placeholder, disabled }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = React.useRef(null);

  const selectedOption = options.find(o => String(o.id) === String(value));
  const filteredOptions = options.filter(o =>
    o.name.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="space-y-2 relative" ref={containerRef}>
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">{label}</label>
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center px-6 cursor-pointer transition-all hover:border-primary/50 ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${isOpen ? 'border-primary ring-4 ring-primary/5' : ''}`}
      >
        <div className="flex-1 overflow-hidden">
          {selectedOption ? (
            <span className="text-sm font-bold text-slate-900 truncate">{selectedOption.name}</span>
          ) : (
            <span className="text-sm font-bold text-slate-300">{placeholder || "Choisir..."}</span>
          )}
        </div>
        <ChevronRight className={`transition-transform duration-300 text-slate-400 ${isOpen ? 'rotate-90 text-primary' : ''}`} size={16} />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute z-[100] top-[calc(100%+8px)] left-0 right-0 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-72"
          >
            <div className="p-3 border-b border-slate-50 bg-slate-50/50 flex items-center gap-3">
              <Search size={14} className="text-slate-400" />
              <input
                autoFocus
                type="text"
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent border-none text-sm font-bold text-slate-700 focus:ring-0 w-full p-0"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="overflow-y-auto custom-scrollbar flex-1">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt) => (
                  <div
                    key={opt.id}
                    className={`px-6 py-3 text-sm font-bold transition-colors cursor-pointer flex items-center justify-between hover:bg-slate-50 ${String(opt.id) === String(value) ? 'bg-primary/5 text-primary' : 'text-slate-600'}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange(opt.id);
                      setIsOpen(false);
                      setSearch("");
                    }}
                  >
                    {opt.name}
                    {String(opt.id) === String(value) && <Check size={14} />}
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-[10px] font-black uppercase text-slate-300 tracking-widest">
                  Aucun résultat
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AddressSelector({ onChange, requirePhone = false, requireQuartier = false }) {
  const [departements, setDepartements] = useState([]); // {id, name, communes: [{id,name,quartiers:[{id,name}]}]}
  const [selectedDeptId, setSelectedDeptId] = useState("");
  const [communes, setCommunes] = useState([]);
  const [selectedCommuneId, setSelectedCommuneId] = useState("");
  const [quartiers, setQuartiers] = useState([]);
  const [selectedQuartierId, setSelectedQuartierId] = useState("");
  // GPS coords from Google Maps picker
  const [gpsLocation, setGpsLocation] = useState(null); // { lat, lng, formattedAddress }

  // summary state shown under the form
  const [selected, setSelected] = useState({
    departement: null,
    commune: null,
    arrondissement: null,
    quartier: null,
  });

  // validation errors for the whole address form (array of messages)
  const [formErrors, setFormErrors] = useState([]);

  // phone state (Bénin) + validation
  const [phoneRaw, setPhoneRaw] = useState("");
  const [phoneError, setPhoneError] = useState(null);
  const [phoneNormalized, setPhoneNormalized] = useState(null);

  // Normalize phone for Benin — accept:
  // - 8 digits (ex: 61234567) -> +22961234567
  // - numbers prefixed with 229 or +229 -> +229...
  // - local format with leading zero (ex: 01xxxxxxxx) -> remove leading 0 and prefix +229
  // - if user enters an international number starting with + keep it if plausible
  function normalizeBeninPhone(input) {
    if (!input) return null;
    const s = String(input).trim();
    // keep + and digits only for analysis
    const hasPlus = s.startsWith("+");
    const digitsOnly = s.replace(/[^\d]/g, "");

    // if user provided an international value with + and reasonable length -> keep (+ + digits)
    if (hasPlus) {
      // simple sanity: + followed by 8..15 digits
      const onlyDigits = s.replace(/[^\d]/g, "");
      if (onlyDigits.length >= 8 && onlyDigits.length <= 15) {
        return "+" + onlyDigits;
      }
      return null;
    }

    // if starts with country code 229
    if (digitsOnly.startsWith("229") && digitsOnly.length >= 11) {
      return "+" + digitsOnly;
    }

    // if starts with 0 (local new format like 01XXXXXXXX (10 digits) or 0XXXXXXXX (9/10) )
    if (digitsOnly.startsWith("0") && digitsOnly.length >= 9 && digitsOnly.length <= 10) {
      // remove leading zero and prefix +229
      const stripped = digitsOnly.slice(1);
      return "+229" + stripped;
    }

    // classic 8-digit Benin numbers (no leading 0)
    if (digitsOnly.length === 8) {
      return "+229" + digitsOnly;
    }

    return null;
  }

  function validatePhone(input) {
    const normalized = normalizeBeninPhone(input);
    if (!normalized) {
      setPhoneError("Numéro invalide — formats acceptés: 61234567, 01xxxxxxxx, 22961234567 ou +22961234567");
      setPhoneNormalized(null);
      return false;
    }
    setPhoneError(null);
    setPhoneNormalized(normalized);
    return true;
  }

  // Normalize and load JSON into usable structure
  useEffect(() => {
    try {
      const depts = (territories || []).map((d, idx) => {
        const id = d.id_dep ?? d.id ?? String(idx + 1);
        const name = d.lib_dep || d.libelle || d.name || d.nom || `Département ${idx + 1}`;

        const rawCommunes =
          d.communes ||
          d.villes ||
          d.commune_list ||
          d.communes_list ||
          d.children ||
          d.commune ||
          d.commune_listes ||
          [];

        const communes = (rawCommunes || []).map((c, j) => {
          const cid = c && (c.id_com ?? c.id ?? c.code) ? (c.id_com ?? c.id ?? c.code) : `${id}_c_${j + 1}`;
          const cname = typeof c === "string" ? c : (c.lib_com || c.libelle || c.lib_com || c.lib_com || c.name || c.nom || guessLabel(c) || `Commune ${j + 1}`);

          // here we explicitly look for arrondissements (your JSON uses "arrondissements")
          const rawArrondissements = typeof c === "string"
            ? []
            : (c.arrondissements || c.arrond || c.sections || []);

          // extract quartiers from arrondissements (use lib_quart)
          const quartiersArr = extractQuartiersFromArrondissements(rawArrondissements, cid);

          return { id: String(cid), name: String(cname), quartiers: quartiersArr };
        });

        return { id: String(id), name: String(name), communes };
      });

      setDepartements(depts);
      // console.log(depts); // uncomment to debug structure in browser console
    } catch (e) {
      console.error("AddressSelector: erreur lecture JSON", e);
      setDepartements([]);
    }
  }, []);

  // when department changes -> populate communes
  useEffect(() => {
    if (!selectedDeptId) {
      setCommunes([]);
      setSelectedCommuneId("");
      setQuartiers([]);
      setSelectedQuartierId("");
      emitChange();
      return;
    }
    const dept = departements.find((d) => d.id === selectedDeptId);
    const comms = (dept?.communes || []).map((c) => ({ id: c.id, name: c.name }));
    setCommunes(comms);
    setSelectedCommuneId("");
    setQuartiers([]);
    setSelectedQuartierId("");
    emitChange();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDeptId, departements]);

  // when commune changes -> populate quartiers
  useEffect(() => {
    if (!selectedCommuneId) {
      setQuartiers([]);
      setSelectedQuartierId("");
      emitChange();
      return;
    }
    const dept = departements.find((d) => d.id === selectedDeptId);
    const communeObj = dept?.communes?.find((c) => c.id === selectedCommuneId);
    const qs = (communeObj?.quartiers || []).map((q) => ({ id: q.id, name: q.name }));
    setQuartiers(qs);
    setSelectedQuartierId("");
    emitChange();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCommuneId, departements, selectedDeptId]);

  // centralise l'émission du payload normalisé vers le parent
  function emitChange() {
    if (typeof onChange !== "function") return;
    const dept = departements.find((d) => d.id === selectedDeptId) || null;
    const comm = (dept?.communes || []).find((c) => c.id === selectedCommuneId) || null;
    const quart = (comm?.quartiers || []).find((q) => q.id === selectedQuartierId) || null;

    setSelected({
      departement: dept?.name || null,
      commune: comm?.name || null,
      arrondissement: null,
      quartier: quart?.name || null,
    });

    const payload = {
      // ids
      departement_id: dept?.id || null,
      commune_id: comm?.id || null,
      arrondissement_id: null,
      quartier_id: quart?.id || null,
      // labels
      departement_label: dept?.name || null,
      commune_label: comm?.name || null,
      arrondissement_label: null,
      quartier_label: quart?.name || null,
      // extra
      address_line: gpsLocation?.formattedAddress || null,
      label: null,
      phone: phoneNormalized || phoneRaw || null,
      lat: gpsLocation?.lat || null,
      lng: gpsLocation?.lng || null,
      is_valid: validateCurrent ? validateCurrent().isValid : true,
      errors: validateCurrent ? validateCurrent().errors : [],
    };
    onChange(payload);
  }

  // when phone or GPS changes -> emit
  useEffect(() => {
    const ok = validatePhone(phoneRaw);
    // update formErrors and emit full payload (so parent always reçoit les mêmes clefs)
    const { isValid, errors } = validateCurrent();
    setFormErrors(errors);
    emitChange();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phoneRaw, phoneNormalized, gpsLocation]);

  // call emitChange when selection changes (replace previous triggerChange calls)
  useEffect(() => {
    emitChange();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDeptId, selectedCommuneId, selectedQuartierId, departements, phoneNormalized, gpsLocation]);

  // Validate current form state -> return { isValid, errors: string[] }
  function validateCurrent() {
    const errors = [];
    let isValid = true;

    if (requirePhone && !phoneRaw) {
      isValid = false;
      errors.push("Le numéro de téléphone est requis.");
    } else if (phoneRaw && !validatePhone(phoneRaw)) {
      isValid = false;
      errors.push(phoneError || "Numéro de téléphone invalide.");
    }

    if (requireQuartier && !selectedQuartierId) {
      isValid = false;
      errors.push("Le quartier est requis.");
    }

    return { isValid, errors };
  }

  // ensure formErrors state synced
  useEffect(() => {
    const v = validateCurrent();
    setFormErrors(v.errors);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phoneRaw, selectedQuartierId, selectedCommuneId, selectedDeptId]);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SearchableSelect
          label="Département *"
          value={selectedDeptId}
          options={departements}
          onChange={setSelectedDeptId}
          placeholder="Choisir un département"
        />

        <SearchableSelect
          label="Commune *"
          value={selectedCommuneId}
          options={communes}
          onChange={setSelectedCommuneId}
          placeholder={communes.length ? "Choisir une commune" : "---"}
          disabled={communes.length === 0}
        />

        <SearchableSelect
          label="Quartier / Zone *"
          value={selectedQuartierId}
          options={quartiers}
          onChange={setSelectedQuartierId}
          placeholder={quartiers.length ? "Choisir un quartier" : "---"}
          disabled={quartiers.length === 0}
        />

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Téléphone *</label>
          <div className="relative">
            <input
              type="tel"
              inputMode="tel"
              placeholder="61 23 45 67"
              value={phoneRaw}
              onChange={(e) => setPhoneRaw(e.target.value)}
              onBlur={() => validatePhone(phoneRaw)}
              className={`input input-bordered w-full h-14 rounded-2xl bg-slate-50 font-bold text-sm transition-all focus:ring-4 focus:ring-primary/5 ${phoneError ? 'border-rose-500' : 'border-slate-100 focus:border-primary'}`}
            />
            {phoneNormalized && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500">
                <Check size={18} />
              </div>
            )}
          </div>
          {phoneError && <p className="text-[10px] font-bold text-rose-500 ml-2">{phoneError}</p>}
        </div>
      </div>

      {/* Mapbox picker */}
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
          📍 Pointer ma porte sur la carte (Précision maximale)
        </label>
        <MapboxPicker
          label="Ouvrir la carte de précision"
          onLocationSelect={(loc) => setGpsLocation(loc)}
          existingLat={gpsLocation?.lat}
          existingLng={gpsLocation?.lng}
          inline={true}
        />
      </div>

      {/* affichage des erreurs de validation */}
      {formErrors?.length > 0 && (
        <div className="mt-2 p-2 bg-error/5 text-error rounded">
          <ul className="text-sm list-disc ml-4">
            {formErrors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      {/* résumé de la localisation */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 p-6 bg-slate-900 text-white rounded-[2rem] shadow-xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl"></div>
        <h3 className="font-black mb-4 flex items-center gap-2 text-sm uppercase tracking-widest text-primary">
          <MapPin size={16} /> Adresse sélectionnée
        </h3>
        <div className="space-y-3 text-sm font-bold text-slate-300">
          <div className="flex justify-between border-b border-slate-800 pb-2">
            <span>Département</span>
            <span className="text-slate-900">{selected.departement || "-"}</span>
          </div>
          <div className="flex justify-between border-b border-slate-800 pb-2">
            <span>Commune</span>
            <span className="text-slate-900">{selected.commune || "-"}</span>
          </div>
          <div className="flex justify-between border-b border-slate-800 pb-2">
            <span>Quartier</span>
            <span className="text-slate-900">{selected.quartier || "-"}</span>
          </div>
          <div className="flex justify-between border-b border-slate-800 pb-2 pt-2">
            <span>Téléphone</span>
            <span className="text-primary">
              {phoneNormalized || phoneRaw || "-"}
            </span>
          </div>
          {gpsLocation && (
            <div className="flex justify-between items-start pt-2">
              <span>GPS</span>
              <a
                href={`https://www.google.com/maps?q=${gpsLocation.lat},${gpsLocation.lng}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 text-right max-w-[60%]"
              >
                <span className="text-xs truncate">{gpsLocation.formattedAddress || `${gpsLocation.lat.toFixed(4)}, ${gpsLocation.lng.toFixed(4)}`}</span>
                <ExternalLink size={12} className="shrink-0" />
              </a>
            </div>
          )}
        </div>
      </motion.div>

    </div>
  );
}
