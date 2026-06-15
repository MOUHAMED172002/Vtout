// AddressSelectorPremium - Version avec Mapbox et Recherche de localité intégrée
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Check, ChevronRight, Search, ExternalLink, Phone } from "lucide-react";
import territories_fallback from "../../data/decoupage-territorial-benin.json";
import { getHierarchy } from "../../services/locationService";
import MapboxPicker from "./MapboxPickerPremium";

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

function extractQuartiersFromArrondissements(rawArrondissements, communeId) {
  if (!rawArrondissements) return [];
  if (!Array.isArray(rawArrondissements)) return [];

  const seen = new Set();
  const list = [];

  rawArrondissements.forEach((arr, ai) => {
    const arrId = arr && (arr.id_arrond || arr.id || `arr_${ai}`);
    const rawQuartiers = arr.quartiers || arr.quartier || arr.localites || [];

    if (!Array.isArray(rawQuartiers)) return;

    rawQuartiers.forEach((q, qi) => {
      const rawName = typeof q === "string" ? q : (q.lib_quart ?? q.lib_q ?? q.libelle ?? q.name ?? q.nom ?? guessLabel(q));
      const name = (rawName || "").toString().trim();
      if (!name) return;
      const id = q && (q.id || q.code) ? String(q.id ?? q.code) : `${communeId}_arr${arrId}_q${qi + 1}`;
      if (seen.has(name)) return;
      seen.add(name);
      list.push({ id: String(id), name });
    });
  });

  return list;
}

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
      <label className="text-[10px] font-black uppercase tracking-widest text-base-content/40 ml-2">{label}</label>
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full h-14 rounded-2xl bg-base-200 border border-base-200 flex items-center px-6 cursor-pointer transition-all hover:border-primary/50 ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${isOpen ? 'border-primary ring-4 ring-primary/5' : ''}`}
      >
        <div className="flex-1 overflow-hidden">
          {selectedOption ? (
            <span className="text-sm font-bold text-base-content truncate">{selectedOption.name}</span>
          ) : (
            <span className="text-sm font-bold text-base-content/30">{placeholder || "Choisir..."}</span>
          )}
        </div>
        <ChevronRight className={`transition-transform duration-300 text-base-content/40 ${isOpen ? 'rotate-90 text-primary' : ''}`} size={16} />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute z-[100] top-[calc(100%+8px)] left-0 right-0 bg-base-100 rounded-2xl shadow-2xl border border-base-200 overflow-hidden flex flex-col max-h-72"
          >
            <div className="p-3 border-b border-base-200 bg-base-200/50 flex items-center gap-3">
              <Search size={14} className="text-base-content/40" />
              <input
                autoFocus
                type="text"
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent border-none text-sm font-bold text-base-content/80 focus:ring-0 w-full p-0"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="overflow-y-auto custom-scrollbar flex-1">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt) => (
                  <div
                    key={opt.id}
                    className={`px-6 py-3 text-sm font-bold transition-colors cursor-pointer flex items-center justify-between hover:bg-base-200 ${String(opt.id) === String(value) ? 'bg-primary/5 text-primary' : 'text-base-content/70'}`}
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
                <div className="p-6 text-center text-[10px] font-black uppercase text-base-content/30 tracking-widest">
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

export default function AddressSelectorPremium({ onChange, requirePhone = false, requireQuartier = false, initial = null }) {
  const [departements, setDepartements] = useState([]);
  const [selectedDeptId, setSelectedDeptId] = useState("");
  const [communes, setCommunes] = useState([]);
  const [selectedCommuneId, setSelectedCommuneId] = useState("");
  const [quartiers, setQuartiers] = useState([]);
  const [selectedQuartierId, setSelectedQuartierId] = useState("");
  const [gpsLocation, setGpsLocation] = useState(null);

  const [selected, setSelected] = useState({
    departement: null,
    commune: null,
    quartier: null,
  });

  const [phoneRaw, setPhoneRaw] = useState("");
  const [phoneError, setPhoneError] = useState(null);
  const [phoneNormalized, setPhoneNormalized] = useState(null);

  function normalizeBeninPhone(input) {
    if (!input) return null;
    const digitsOnly = String(input).replace(/[^\d]/g, "");
    if (digitsOnly.length === 8) return "+229" + digitsOnly;
    if (digitsOnly.startsWith("229") && digitsOnly.length === 11) return "+" + digitsOnly;
    return null;
  }

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        let rawData;
        try {
          rawData = await getHierarchy();
          if (!rawData || rawData.length === 0) throw new Error("Empty hierarchy");
        } catch (err) {
          console.warn("[AddressSelector] Using fallback local data", err);
          rawData = territories_fallback;
        }

        const depts = (rawData || []).map((d, idx) => {
          const id = String(d.id || d.id_dep || idx + 1);
          const name = d.name || d.lib_dep || d.libelle || `Département ${idx + 1}`;
          const rawCommunes = d.communes || [];
          const communes = (rawCommunes || []).map((c, j) => {
            const cid = String(c.id || c.id_com || `${id}_c_${j + 1}`);
            const cname = c.name || c.lib_com || c.libelle || `Commune ${j + 1}`;
            const rawArrondissements = c.arrondissements || [];
            
            let qList = [];
            // If we have database model structure: arrondissements -> quartiers
            if (rawArrondissements.length > 0) {
              qList = extractQuartiersFromArrondissements(rawArrondissements, cid);
            } else if (c.quartiers) {
              // Flat direct quartiers fallback
              qList = c.quartiers.map(q => ({ id: String(q.id), name: q.name }));
            }
            
            return { id: cid, name: cname, quartiers: qList };
          });
          return { id, name, communes };
        });
        setDepartements(depts);
        
        // Handle initial values
        if (initial) {
          if (initial.phone) setPhoneRaw(String(initial.phone).replace('+229', ''));
          if (initial.lat && initial.lng) setGpsLocation({ lat: initial.lat, lng: initial.lng, formattedAddress: initial.address_line });
          
          const d = depts.find(x => x.id === String(initial.departement_id) || x.name === initial.departement_label);
          if (d) {
            setSelectedDeptId(d.id);
            const c = d.communes.find(x => x.id === String(initial.commune_id) || x.name === initial.commune_label);
            if (c) {
               setSelectedCommuneId(c.id);
               const q = c.quartiers.find(x => x.id === String(initial.quartier_id) || x.name === initial.quartier_label);
               if (q) setSelectedQuartierId(q.id);
            }
          }
        }
      } catch (e) {
        console.error("AddressSelectorPremium Load Error:", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [initial]);

  useEffect(() => {
    if (!selectedDeptId) {
      setCommunes([]);
      return;
    }
    const dept = departements.find(d => d.id === selectedDeptId);
    setCommunes(dept?.communes || []);
  }, [selectedDeptId, departements]);

  useEffect(() => {
    if (!selectedCommuneId) {
      setQuartiers([]);
      return;
    }
    const comm = communes.find(c => c.id === selectedCommuneId);
    setQuartiers(comm?.quartiers || []);
  }, [selectedCommuneId, communes]);

  useEffect(() => {
    const dept = departements.find(d => d.id === selectedDeptId);
    const comm = communes.find(c => c.id === selectedCommuneId);
    const quart = quartiers.find(q => q.id === selectedQuartierId);

    const labels = {
      departement: dept?.name || null,
      commune: comm?.name || null,
      quartier: quart?.name || null,
    };
    setSelected(labels);

    const normalizedPhone = normalizeBeninPhone(phoneRaw);
    setPhoneNormalized(normalizedPhone);

    if (onChange) {
      onChange({
        departement_id: dept?.id || null,
        departement_label: dept?.name || null,
        commune_id: comm?.id || null,
        commune_label: comm?.name || null,
        quartier_id: quart?.id || null,
        quartier_label: quart?.name || null,
        address_line: gpsLocation?.formattedAddress || null,
        phone: normalizedPhone || phoneRaw,
        lat: gpsLocation?.lat || null,
        lng: gpsLocation?.lng || null,
        is_valid: !!dept && !!comm && (!requireQuartier || !!quart) && (!requirePhone || !!normalizedPhone)
      });
    }
  }, [selectedDeptId, selectedCommuneId, selectedQuartierId, phoneRaw, gpsLocation]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SearchableSelect
          label="Département *"
          value={selectedDeptId}
          options={departements}
          onChange={setSelectedDeptId}
          placeholder="Choisir département"
        />
        <SearchableSelect
          label="Commune *"
          value={selectedCommuneId}
          options={communes}
          onChange={setSelectedCommuneId}
          placeholder="Choisir commune"
          disabled={!selectedDeptId}
        />
        <SearchableSelect
          label="Quartier *"
          value={selectedQuartierId}
          options={quartiers}
          onChange={setSelectedQuartierId}
          placeholder="Choisir quartier"
          disabled={!selectedCommuneId}
        />
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-base-content/40 ml-2 flex items-center gap-2">
             <Phone size={14} className="text-primary" /> Téléphone *
          </label>
          <div className="relative">
            <input
              type="tel"
              placeholder="61 00 00 00"
              value={phoneRaw}
              onChange={(e) => setPhoneRaw(e.target.value)}
              className="input input-bordered w-full h-14 rounded-2xl bg-base-200 font-bold text-sm border-base-200 focus:border-primary"
            />
            {phoneNormalized && <Check size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500" />}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-base-content/40 ml-2 flex items-center gap-2">
          <MapPin size={14} className="text-primary" /> Géolocalisation Précise (Mapbox)
        </label>
        <MapboxPicker
          onLocationSelect={(loc) => setGpsLocation(loc)}
          existingLat={gpsLocation?.lat}
          existingLng={gpsLocation?.lng}
          inline={true}
        />
      </div>

      <AnimatePresence>
        {(selected.quartier || gpsLocation) && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-neutral text-white rounded-[2rem] shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl"></div>
             <h3 className="font-black mb-4 flex items-center gap-2 text-sm uppercase tracking-widest text-primary">
                <MapPin size={16} /> RÉSUMÉ ADRESSE
             </h3>
             <div className="space-y-2 text-xs font-bold text-white/50">
                <p>Départment: <span className="text-white">{selected.departement || "-"}</span></p>
                <p>Commune: <span className="text-white">{selected.commune || "-"}</span></p>
                <p>Quartier: <span className="text-white">{selected.quartier || "-"}</span></p>
                <p>GPS: <span className="text-emerald-400">{gpsLocation ? `${gpsLocation.lat.toFixed(4)}, ${gpsLocation.lng.toFixed(4)}` : "Non pointé"}</span></p>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
