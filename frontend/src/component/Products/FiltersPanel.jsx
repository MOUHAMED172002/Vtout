// FiltersPanel.jsx (version finale - recherche multi-niveaux)
import { getCategories, getAttributes } from "../../services/productService";
import { getHierarchy } from "../../services/locationService";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { ChevronDown, RotateCcw, Box, Plus, Tag, DollarSign, LayoutGrid, ChevronRight, Sparkles, Search, Truck, Check, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CategorySearchModal from "../Shared/CategorySearchModal";

// ---------- Hooks personnalisés ----------

// Gestion des catégories
function useCategories() {
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    (async () => {
      try {
        const data = await getCategories();
        setCategories(data || []);
      } catch (err) {
        console.error("Erreur chargement catégories :", err);
      }
    })();
  }, []);
  return categories;
}

// Gestion des attributs (globaux)
function useAttributes(categoryId) {
  const [attributes, setAttributes] = useState([]);
  useEffect(() => {
    (async () => {
      try {
        const allAttrs = await getAttributes();
        setAttributes(allAttrs.slice(0, 15));
      } catch (err) {
        console.error("Erreur chargement attributs :", err);
        setAttributes([]);
      }
    })();
  }, [categoryId]);
  return attributes;
}

// Gestion des zones de livraison gratuite (recherche multi-niveaux)
function useFreeDeliveryZone() {
  const [allLocations, setAllLocations] = useState([]);
  const [locationsLoading, setLocationsLoading] = useState(true);
  const [zoneQuery, setZoneQuery] = useState("");
  const [selectedZone, setSelectedZone] = useState(null);
  const [showZoneSuggestions, setShowZoneSuggestions] = useState(false);
  const wrapperRef = useRef(null);

  // Chargement de la hiérarchie complète
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setLocationsLoading(true);
        const departments = await getHierarchy();
        const list = [];

        departments.forEach((dep) => {
          // Niveau département
          list.push({
            commune_label: null,
            arrondissement_label: null,
            quartier_label: null,
            formattedAddress: dep.name,
            searchStr: removeAccents(dep.name),
            type: "département",
            displayName: dep.name,
            parentInfo: null,
          });

          (dep.communes || []).forEach((com) => {
            // Niveau commune
            list.push({
              commune_label: com.name,
              arrondissement_label: null,
              quartier_label: null,
              formattedAddress: com.name,
              searchStr: removeAccents(com.name),
              type: "commune",
              displayName: com.name,
              parentInfo: dep.name,
            });

            (com.arrondissements || []).forEach((arr) => {
              // Niveau arrondissement
              list.push({
                commune_label: com.name,
                arrondissement_label: arr.name,
                quartier_label: null,
                formattedAddress: `${arr.name} (${com.name})`,
                searchStr: removeAccents(`${arr.name} ${com.name}`),
                type: "arrondissement",
                displayName: arr.name,
                parentInfo: `${com.name}, ${dep.name}`,
              });

              (arr.quartiers || []).forEach((q) => {
                // Niveau quartier
                list.push({
                  commune_label: com.name,
                  arrondissement_label: arr.name,
                  quartier_label: q.name,
                  formattedAddress: `${q.name} (${arr.name}, ${com.name})`,
                  searchStr: removeAccents(`${q.name} ${arr.name} ${com.name}`),
                  type: "quartier",
                  displayName: q.name,
                  parentInfo: `${arr.name}, ${com.name}`,
                });
              });
            });
          });
        });

        if (isMounted) setAllLocations(list);
      } catch (err) {
        console.error("Échec chargement zones :", err);
      } finally {
        if (isMounted) setLocationsLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  const filteredZones = useMemo(() => {
    if (!zoneQuery.trim()) return [];
    const q = removeAccents(zoneQuery.trim());
    return allLocations
      .filter((loc) => loc.searchStr.includes(q))
      .slice(0, 30);
  }, [zoneQuery, allLocations]);

  // Gestion du clic à l'extérieur
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowZoneSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectZone = (loc) => {
    setSelectedZone(loc);
    setZoneQuery(loc.formattedAddress);
    setShowZoneSuggestions(false);
    return loc.commune_label || "";
  };

  const clearZone = () => {
    setSelectedZone(null);
    setZoneQuery("");
    return "";
  };

  return {
    locationsLoading,
    zoneQuery,
    setZoneQuery,
    selectedZone,
    showZoneSuggestions,
    setShowZoneSuggestions,
    filteredZones,
    wrapperRef,
    selectZone,
    clearZone,
  };
}

// Gestion globale des filtres
function useFilters(initialFilters = {}) {
  const [filters, setFilters] = useState({
    category_id: "",
    minPrice: 0,
    maxPrice: 500000,
    attributes: {},
    sort: "recent",
    isPromo: "",
    isFlashSale: "",
    isKit: "",
    hasVolumePricing: "",
    isAnyPromo: "",
    freeDeliveryCommune: "",
    ...initialFilters,
  });

  const updateFilters = useCallback((patch) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      category_id: "",
      minPrice: 0,
      maxPrice: 500000,
      attributes: {},
      sort: "recent",
      isPromo: "",
      isFlashSale: "",
      isKit: "",
      hasVolumePricing: "",
      isAnyPromo: "",
      freeDeliveryCommune: "",
    });
  }, []);

  return { filters, updateFilters, resetFilters };
}

// Gestion des sections ouvertes/fermées
function useSections(initialOpen = {}) {
  const [openSections, setOpenSections] = useState({
    category: true,
    price: true,
    attributes: true,
    sort: true,
    promo: true,
    zone: true,
    ...initialOpen,
  });
  const toggleSection = useCallback((key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);
  return { openSections, toggleSection };
}

// Composant SectionHeader
const SectionHeader = ({ title, sectionKey, icon: Icon, toggleSection, openSections }) => (
  <button
    onClick={() => toggleSection(sectionKey)}
    className="w-full flex items-center justify-between py-4 group"
  >
    <div className="flex items-center gap-3">
      <Icon size={16} className="text-base-content/40 group-hover:text-primary transition-colors" />
      <span className="text-xs font-black uppercase tracking-[0.2em] text-base-content/90">{title}</span>
    </div>
    {openSections[sectionKey] ? <ChevronDown size={14} className="text-base-content/30" /> : <Plus size={14} className="text-base-content/30" />}
  </button>
);

// ---------- Composant principal ----------
export default function FiltersPanel({ onFilterChange = () => {} }) {
  const location = useLocation();

  // Hooks
  const categories = useCategories();
  const { filters, updateFilters, resetFilters } = useFilters();
  const { openSections, toggleSection } = useSections();
  const attributes = useAttributes(filters.category_id);

  const [selectedAttrId, setSelectedAttrId] = useState("");
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const {
    locationsLoading,
    zoneQuery,
    setZoneQuery,
    selectedZone,
    showZoneSuggestions,
    setShowZoneSuggestions,
    filteredZones,
    wrapperRef,
    selectZone,
    clearZone,
  } = useFreeDeliveryZone();

  // Récupération du paramètre category_id depuis l'URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryId = params.get("category_id");
    if (categoryId) updateFilters({ category_id: categoryId });
  }, [location.search, updateFilters]);

  // Appel du parent quand les filtres changent
  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const selectedCategory = useMemo(
    () => categories.find((c) => String(c.id) === String(filters.category_id)),
    [categories, filters.category_id]
  );

  // Gestion des presets de prix
  const handlePricePreset = (preset) => {
    switch (preset) {
      case "low":
        updateFilters({ minPrice: 0, maxPrice: 10000 });
        break;
      case "mid":
        updateFilters({ minPrice: 10000, maxPrice: 50000 });
        break;
      case "high":
        updateFilters({ minPrice: 50000, maxPrice: 500000 });
        break;
      default:
        updateFilters({ minPrice: 0, maxPrice: 500000 });
    }
  };

  // Toggle d'une valeur d'attribut
  const toggleAttributeValue = (attrId, val) => {
    setFilters((prev) => {
      const cur = new Set(prev.attributes[attrId] || []);
      if (cur.has(val)) cur.delete(val);
      else cur.add(val);
      const nextAttrs = { ...prev.attributes, [attrId]: Array.from(cur) };
      if (!nextAttrs[attrId] || nextAttrs[attrId].length === 0) delete nextAttrs[attrId];
      return { ...prev, attributes: nextAttrs };
    });
  };

  // Gestion sélection de zone
  const handleSelectZone = (loc) => {
    const commune = selectZone(loc);
    // Si l'utilisateur a sélectionné un département, commune est vide : on ignore.
    if (commune) {
      updateFilters({ freeDeliveryCommune: commune });
    } else {
      // Optionnel : on peut afficher un message "Veuillez choisir une commune"
      // Pour l'instant, on ne fait rien
      setZoneQuery(loc.displayName);
      setSelectedZone(null);
      setShowZoneSuggestions(false);
    }
  };

  const handleClearZone = () => {
    clearZone();
    updateFilters({ freeDeliveryCommune: "" });
  };

  return (
    <div className="space-y-4 relative z-50">
      {/* En-tête reset */}
      <div className="flex items-center justify-between mb-8">
        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-base-content/40">Configuration</h4>
        <button onClick={resetFilters} className="flex items-center gap-1.5 text-xs font-black text-primary hover:underline">
          <RotateCcw size={12} /> Reset
        </button>
      </div>

      {/* Section Zone */}
      <div className="border-b border-base-200">
        <SectionHeader
          title="Livraison gratuite"
          sectionKey="zone"
          icon={Truck}
          toggleSection={toggleSection}
          openSections={openSections}
        />
        <AnimatePresence>
          {openSections.zone && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="pb-6 overflow-hidden"
            >
              <div className="space-y-2 relative" ref={wrapperRef}>
                <p className="text-[10px] font-medium text-base-content/40 px-1 mb-1">
                  Cherchez un département, une commune, un arrondissement ou un quartier.
                  La livraison gratuite sera appliquée si le vendeur est dans la même commune.
                </p>

                {selectedZone ? (
                  <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-2xl">
                    <div className="w-7 h-7 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0">
                      <Check className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-xs text-base-content truncate">{selectedZone.displayName}</p>
                      {selectedZone.parentInfo && (
                        <p className="text-[10px] text-base-content/50 font-medium truncate">
                          {selectedZone.parentInfo}
                        </p>
                      )}
                      {selectedZone.commune_label && (
                        <p className="text-[10px] text-primary font-bold mt-0.5">
                          Commune : {selectedZone.commune_label}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleClearZone}
                      className="w-7 h-7 shrink-0 flex items-center justify-center rounded-lg bg-white border border-emerald-200 text-emerald-600 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200 transition-all"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      {locationsLoading ? (
                        <Loader2 className="h-4 w-4 text-base-content/30 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4 text-base-content/30" />
                      )}
                    </div>
                    <input
                      type="text"
                      disabled={locationsLoading}
                      value={zoneQuery}
                      onChange={(e) => {
                        setZoneQuery(e.target.value);
                        setShowZoneSuggestions(true);
                      }}
                      onFocus={() => setShowZoneSuggestions(true)}
                      placeholder={locationsLoading ? "Chargement..." : "Ex: Cotonou, Akassato, Abomey..."}
                      className="w-full h-11 bg-base-200 border border-transparent rounded-xl pl-10 pr-4 text-xs font-bold text-base-content placeholder:font-medium placeholder:text-base-content/30 focus:bg-base-100 focus:border-primary/20 focus:ring-4 focus:ring-primary/5 outline-none transition-all disabled:opacity-60"
                    />

                    {showZoneSuggestions && zoneQuery && filteredZones.length > 0 && (
                      <div className="absolute z-50 mt-1 w-full bg-base-100 rounded-2xl shadow-xl shadow-base-content/10 border border-base-200 max-h-56 overflow-y-auto">
                        {filteredZones.map((loc) => (
                          <div
                            key={loc.formattedAddress}
                            onClick={() => handleSelectZone(loc)}
                            className="px-4 py-2.5 hover:bg-base-200 cursor-pointer border-b border-base-200 last:border-0 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-bold text-xs text-base-content">{loc.displayName}</div>
                                {loc.parentInfo && (
                                  <div className="text-[10px] text-base-content/50 font-medium">
                                    {loc.parentInfo}
                                  </div>
                                )}
                              </div>
                              <div className="text-[9px] font-black uppercase text-primary/60 bg-primary/10 px-2 py-0.5 rounded-full">
                                {loc.type}
                              </div>
                            </div>
                            {loc.commune_label && (
                              <div className="text-[9px] text-base-content/40 mt-0.5">
                                Commune : {loc.commune_label}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {showZoneSuggestions && zoneQuery && !locationsLoading && filteredZones.length === 0 && (
                      <div className="absolute z-50 mt-1 w-full bg-base-100 rounded-2xl shadow-xl border border-base-200 p-3 text-center">
                        <p className="text-xs font-bold text-base-content/50">Aucun résultat trouvé.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Section Promotions */}
      <div className="border-b border-base-200">
        <SectionHeader
          title="Promotions & Offres"
          sectionKey="promo"
          icon={Sparkles}
          toggleSection={toggleSection}
          openSections={openSections}
        />
        <AnimatePresence>
          {openSections.promo && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="pb-6 overflow-hidden"
            >
              <div className="space-y-2">
                {[
                  { id: "all_promos", label: "Toutes les promotions" },
                  { id: "isPromo", label: "Réductions Directes" },
                  { id: "isFlashSale", label: "Ventes Flash" },
                  { id: "hasVolumePricing", label: "Prix Dégressifs" },
                  { id: "isKit", label: "Packs & Kits" },
                  { id: "none", label: "Aucune (Normal)" },
                ].map((p) => {
                  const handleSelect = () => {
                    if (p.id === "all_promos") {
                      updateFilters({
                        isPromo: "",
                        isFlashSale: "",
                        isKit: "",
                        hasVolumePricing: "",
                        isAnyPromo: "true",
                      });
                    } else if (p.id === "none") {
                      updateFilters({
                        isPromo: "",
                        isFlashSale: "",
                        isKit: "",
                        hasVolumePricing: "",
                        isAnyPromo: "",
                      });
                    } else {
                      updateFilters({
                        isPromo: p.id === "isPromo" ? "true" : "",
                        isFlashSale: p.id === "isFlashSale" ? "true" : "",
                        isKit: p.id === "isKit" ? "true" : "",
                        hasVolumePricing: p.id === "hasVolumePricing" ? "true" : "",
                        isAnyPromo: "",
                      });
                    }
                  };

                  const isCurrentlyActive =
                    p.id === "all_promos"
                      ? filters.isAnyPromo === "true"
                      : p.id === "none"
                      ? !filters.isPromo &&
                        !filters.isFlashSale &&
                        !filters.isKit &&
                        !filters.hasVolumePricing &&
                        !filters.isAnyPromo
                      : filters[p.id] === "true";

                  return (
                    <button
                      key={p.id}
                      onClick={handleSelect}
                      className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                        isCurrentlyActive
                          ? "bg-neutral text-white shadow-lg"
                          : "text-base-content/50 hover:bg-base-200"
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Section Tri */}
      <div className="border-b border-base-200">
        <SectionHeader
          title="Tri"
          sectionKey="sort"
          icon={LayoutGrid}
          toggleSection={toggleSection}
          openSections={openSections}
        />
        <AnimatePresence>
          {openSections.sort && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="pb-6 overflow-hidden"
            >
              <div className="space-y-2">
                {["recent", "price_asc", "price_desc"].map((s) => (
                  <button
                    key={s}
                    onClick={() => updateFilters({ sort: s })}
                    className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                      filters.sort === s ? "bg-neutral text-white shadow-lg" : "text-base-content/50 hover:bg-base-200"
                    }`}
                  >
                    {s === "recent" ? "Plus récents" : s === "price_asc" ? "Prix croissant" : "Prix décroissant"}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Section Catégorie */}
      <div className="border-b border-base-200">
        <SectionHeader
          title="Catégorie"
          sectionKey="category"
          icon={Tag}
          toggleSection={toggleSection}
          openSections={openSections}
        />
        <AnimatePresence>
          {openSections.category && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="pb-6 overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setShowCategoryModal(true)}
                className="w-full bg-base-200 border border-base-200 rounded-2xl px-5 py-4 text-left flex items-center justify-between group hover:border-primary/20 transition-all shadow-sm"
              >
                <div className="flex flex-col">
                  <span
                    className={`text-xs font-bold ${
                      selectedCategory ? "text-base-content" : "text-base-content/40"
                    }`}
                  >
                    {selectedCategory ? selectedCategory.name : "Toutes les catégories"}
                  </span>
                  {selectedCategory && (
                    <span className="text-[9px] font-black text-primary uppercase tracking-widest mt-0.5 flex items-center gap-1">
                      <Sparkles size={8} /> Sélectionnée
                    </span>
                  )}
                </div>
                <ChevronRight size={16} className="text-base-content/30 group-hover:text-primary transition-colors" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Section Prix */}
      <div className="border-b border-base-200">
        <SectionHeader
          title="Bilan Prix"
          sectionKey="price"
          icon={DollarSign}
          toggleSection={toggleSection}
          openSections={openSections}
        />
        <AnimatePresence>
          {openSections.price && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="pb-8 overflow-hidden space-y-6"
            >
              <div className="flex flex-wrap gap-2">
                {[
                  ["< 10k", "low"],
                  ["10k-50k", "mid"],
                  ["> 50k", "high"],
                ].map(([label, val]) => (
                  <button
                    key={val}
                    onClick={() => handlePricePreset(val)}
                    className="px-4 py-2 bg-base-200 rounded-full text-[10px] font-black uppercase text-base-content/50 hover:bg-primary/10 hover:text-primary transition-all border border-base-200"
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="space-y-6 px-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-base-content/40 ml-2 tracking-widest">
                      Min (FCFA)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/30 text-xs text-bold">
                        CFA
                      </span>
                      <input
                        type="number"
                        value={filters.minPrice}
                        onChange={(e) =>
                          updateFilters({ minPrice: Math.max(0, Number(e.target.value)) })
                        }
                        className="w-full bg-base-200 border-2 border-transparent rounded-2xl pl-12 pr-4 py-3 text-sm font-bold text-base-content focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-base-content/40 ml-2 tracking-widest">
                      Max (FCFA)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/30 text-xs text-bold">
                        CFA
                      </span>
                      <input
                        type="number"
                        value={filters.maxPrice}
                        onChange={(e) =>
                          updateFilters({ maxPrice: Math.max(0, Number(e.target.value)) })
                        }
                        className="w-full bg-base-200 border-2 border-transparent rounded-2xl pl-12 pr-4 py-3 text-sm font-bold text-base-content focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="relative h-6 flex items-center">
                  <div className="absolute w-full h-1.5 bg-base-200 rounded-full">
                    <div
                      className="absolute h-full bg-orange-400 rounded-full"
                      style={{
                        left: `${(filters.minPrice / 500000) * 100}%`,
                        right: `${100 - (filters.maxPrice / 500000) * 100}%`,
                      }}
                    />
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={500000}
                    step={1000}
                    value={filters.minPrice}
                    onChange={(e) =>
                      updateFilters({
                        minPrice: Math.min(Number(e.target.value), filters.maxPrice - 1000),
                      })
                    }
                    className="absolute w-full h-1.5 appearance-none bg-transparent pointer-events-none cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-base-100 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-orange-500 [&::-webkit-slider-thumb]:shadow-md"
                  />
                  <input
                    type="range"
                    min={0}
                    max={500000}
                    step={1000}
                    value={filters.maxPrice}
                    onChange={(e) =>
                      updateFilters({
                        maxPrice: Math.max(Number(e.target.value), filters.minPrice + 1000),
                      })
                    }
                    className="absolute w-full h-1.5 appearance-none bg-transparent pointer-events-none cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-base-100 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-orange-500 [&::-webkit-slider-thumb]:shadow-md"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Section Attributs */}
      <div className="border-b border-base-200">
        <SectionHeader
          title="Propriétés"
          sectionKey="attributes"
          icon={Box}
          toggleSection={toggleSection}
          openSections={openSections}
        />
        <AnimatePresence>
          {openSections.attributes && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="pb-6 overflow-hidden space-y-4"
            >
              <select
                className="w-full h-12 px-4 bg-base-100 border border-base-300 rounded-xl text-xs font-black text-base-content shadow-sm focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                value={selectedAttrId}
                onChange={(e) => setSelectedAttrId(e.target.value)}
              >
                <option value="">Sélectionner un attribut...</option>
                {attributes.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>

              {selectedAttrId && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                  <div className="text-[10px] font-black uppercase tracking-widest text-base-content/40">
                    Valeurs disponibles
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {attributes
                      .find((a) => String(a.id) === String(selectedAttrId))
                      ?.values?.map((v) => {
                        const isSelected = (filters.attributes[selectedAttrId] || []).includes(v.value);
                        return (
                          <button
                            key={v.id}
                            onClick={() => toggleAttributeValue(selectedAttrId, v.value)}
                            className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                              isSelected
                                ? "bg-primary text-white shadow-lg shadow-primary/20"
                                : "bg-base-200 text-base-content/50 border border-base-200 hover:border-primary/30"
                            }`}
                          >
                            {v.value}
                          </button>
                        );
                      })}
                  </div>
                </motion.div>
              )}

              {Object.entries(filters.attributes).length > 0 && (
                <div className="pt-4 border-t border-base-200 space-y-2">
                  {Object.entries(filters.attributes).map(([attrId, vals]) => {
                    const attrName =
                      attributes.find((a) => String(a.id) === String(attrId))?.name || "Attribut";
                    return (
                      <div key={attrId} className="bg-base-200 p-3 rounded-xl border border-base-200 relative group">
                        <p className="text-[10px] font-black uppercase tracking-widest text-base-content/40">
                          {attrName}
                        </p>
                        <p className="text-xs font-bold text-base-content/80 truncate pr-6">{vals.join(", ")}</p>
                        <button
                          onClick={() => {
                            const nextAttrs = { ...filters.attributes };
                            delete nextAttrs[attrId];
                            updateFilters({ attributes: nextAttrs });
                          }}
                          className="absolute top-1/2 -translate-y-1/2 right-3 w-6 h-6 flex items-center justify-center bg-base-100 border border-base-200 rounded-full text-base-content/30 hover:text-red-400 transition-all"
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal Catégorie */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-[999999] pointer-events-auto">
          <CategorySearchModal
            categories={categories}
            onClose={() => setShowCategoryModal(false)}
            onSelect={(cat) => {
              updateFilters({ category_id: String(cat.id) });
              setShowCategoryModal(false);
            }}
          />
        </div>
      )}
    </div>
  );
}

// Fonction utilitaire pour enlever les accents
const removeAccents = (str) => {
  if (!str) return "";
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
};