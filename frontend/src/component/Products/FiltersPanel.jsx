// FiltersPanel.jsx (avec modal de recherche de zone — rendu en portail, groupé par type)
import { getCategories, getAttributes } from "../../services/productService";
import { getHierarchy } from "../../services/locationService";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
import { ChevronDown, RotateCcw, Box, Plus, Tag, DollarSign, LayoutGrid, ChevronRight, Sparkles, Search, Truck, Check, X, Loader2, MapPin, Building, Globe, BadgeCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CategorySearchModal from "../Shared/CategorySearchModal";

// Fonction utilitaire pour enlever les accents
const removeAccents = (str) => {
  if (!str) return "";
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
};

const TYPE_LABELS = {
  "département": { plural: "Départements", icon: Building },
  "commune": { plural: "Communes", icon: MapPin },
  "arrondissement": { plural: "Arrondissements", icon: Globe },
  "quartier": { plural: "Quartiers", icon: MapPin },
};
const TYPE_ORDER = ["quartier", "commune", "arrondissement", "département"];

// ---------- Composant Modal de recherche de zone (rendu via portail) ----------
function LocationSearchModal({ isOpen, onClose, onSelect, locationsLoading, allLocations }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Empêche le scroll de la page tant que le modal est ouvert
  useEffect(() => {
    if (isOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = original; };
    }
  }, [isOpen]);

  // Filtrer les suggestions en fonction de la requête
  const filteredFlat = useMemo(() => {
    if (!query.trim()) return [];
    const q = removeAccents(query.trim());
    return allLocations.filter((loc) => loc.searchStr.includes(q)).slice(0, 60);
  }, [query, allLocations]);

  // Regroupement par type, avec priorité aux résultats les plus précis (quartier en premier)
  const groupedResults = useMemo(() => {
    const groups = {};
    filteredFlat.forEach((loc) => {
      if (!groups[loc.type]) groups[loc.type] = [];
      groups[loc.type].push(loc);
    });
    return TYPE_ORDER
      .filter((type) => groups[type]?.length)
      .map((type) => ({ type, items: groups[type].slice(0, 8) }));
  }, [filteredFlat]);

  // Liste plate ordonnée (pour la navigation clavier), alignée sur l'affichage groupé
  const flatOrdered = useMemo(
    () => groupedResults.flatMap((g) => g.items),
    [groupedResults]
  );

  useEffect(() => {
    setSelectedIndex(-1);
  }, [query]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < flatOrdered.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      const loc = flatOrdered[selectedIndex];
      if (loc) handleSelect(loc);
    }
  };

  const handleSelect = (loc) => {
    onSelect(loc);
    setQuery("");
    onClose();
  };

  const renderSuggestion = (loc, flatIndex) => {
    const isSelected = flatIndex === selectedIndex;
    const parts = query ? loc.displayName.split(new RegExp(`(${query})`, "gi")) : [loc.displayName];
    const highlight = parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() && query ? (
        <span key={i} className="bg-primary/20 text-primary font-black rounded px-0.5">{part}</span>
      ) : (
        <span key={i}>{part}</span>
      )
    );

    return (
      <button
        key={loc.formattedAddress}
        type="button"
        onClick={() => handleSelect(loc)}
        onMouseEnter={() => setSelectedIndex(flatIndex)}
        className={`w-full text-left px-4 py-3 rounded-2xl flex items-center justify-between gap-3 transition-colors ${
          isSelected ? "bg-primary/10" : "hover:bg-base-200"
        }`}
      >
        <div className="min-w-0">
          <div className="font-bold text-xs text-base-content truncate">{highlight}</div>
          {loc.parentInfo && (
            <div className="text-[10px] text-base-content/50 font-medium truncate">{loc.parentInfo}</div>
          )}
        </div>
        {loc.commune_label && (
          <span className="shrink-0 text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-full uppercase tracking-widest">
            {loc.commune_label}
          </span>
        )}
      </button>
    );
  };

  if (!isOpen) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] pointer-events-auto">
          {/* Arrière-plan flou — couvre tout le viewport, indépendamment de tout ancêtre animé */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-neutral/70 backdrop-blur-md"
            onClick={onClose}
          />

          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            className="absolute bottom-0 left-0 right-0 sm:inset-x-0 sm:top-1/2 sm:bottom-auto sm:-translate-y-1/2 sm:max-w-lg sm:mx-auto bg-base-100 rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl max-h-[85vh] sm:max-h-[80vh] flex flex-col overflow-hidden"
          >
            {/* Handle (mobile uniquement) */}
            <div className="w-16 h-1.5 bg-base-300 rounded-full mx-auto mt-3 shrink-0 sm:hidden" />

            {/* Header */}
            <div className="px-5 py-4 flex items-center justify-between shrink-0 border-b border-base-200">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
                  <MapPin size={20} />
                </div>
                <div className="min-w-0">
                  <h2 className="text-base font-black text-base-content tracking-tight truncate">Choisir une zone</h2>
                  <p className="text-[9px] font-black uppercase tracking-widest text-primary truncate">
                    Département · Commune · Arrondissement · Quartier
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="w-10 h-10 shrink-0 bg-base-200 text-base-content/40 rounded-xl flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all"
                onClick={onClose}
              >
                <X size={18} />
              </button>
            </div>

            {/* Barre de recherche */}
            <div className="px-5 py-4 border-b border-base-200 shrink-0">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  {locationsLoading ? (
                    <Loader2 className="h-4 w-4 text-base-content/30 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4 text-base-content/30" />
                  )}
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  disabled={locationsLoading}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={locationsLoading ? "Chargement des localités..." : "Ex: Cotonou, Akassato, Abomey..."}
                  className="w-full h-12 bg-base-200 border-2 border-transparent rounded-xl pl-10 pr-9 text-sm font-bold text-base-content placeholder:font-medium placeholder:text-base-content/30 focus:bg-base-100 focus:border-primary/20 focus:ring-4 focus:ring-primary/5 outline-none transition-all disabled:opacity-60"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-base-content/30 hover:text-base-content/60"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Liste des résultats, groupée par type */}
            <div className="flex-1 overflow-y-auto px-3 py-3">
              {query.trim() === "" && (
                <div className="text-center py-10 px-6">
                  <div className="w-12 h-12 mx-auto mb-3 bg-base-200 rounded-2xl flex items-center justify-center text-base-content/30">
                    <Search size={20} />
                  </div>
                  <p className="text-sm font-bold text-base-content/40">Commencez à taper pour chercher</p>
                  <p className="text-[10px] text-base-content/30 mt-1">Ex: Cotonou, Akassato, Abomey...</p>
                </div>
              )}

              {query.trim() !== "" && !locationsLoading && groupedResults.length === 0 && (
                <div className="text-center py-10 px-6">
                  <p className="text-sm font-bold text-base-content/40">Aucun résultat trouvé</p>
                  <p className="text-[10px] text-base-content/30 mt-1">Essayez avec un autre terme</p>
                </div>
              )}

              {(() => {
                let runningIndex = 0;
                return groupedResults.map((group) => {
                  const { icon: Icon, plural } = TYPE_LABELS[group.type];
                  const items = group.items.map((loc) => {
                    const el = renderSuggestion(loc, runningIndex);
                    runningIndex += 1;
                    return el;
                  });
                  return (
                    <div key={group.type} className="mb-3 last:mb-0">
                      <div className="flex items-center gap-2 px-2 py-2 sticky top-0 bg-base-100/95 backdrop-blur-sm z-10">
                        <Icon size={12} className="text-base-content/30" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-base-content/40">
                          {plural}
                        </span>
                      </div>
                      <div className="space-y-0.5">{items}</div>
                    </div>
                  );
                });
              })()}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  // Portail : on sort du flux du composant parent pour éviter tout piège de
  // stacking context (ex: ancêtre animé par Framer Motion dans le tiroir
  // mobile), garantissant un overlay plein écran et un flou correctement appliqué.
  return createPortal(modalContent, document.body);
}

// ---------- Hooks personnalisés ----------

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

function useFreeDeliveryZone() {
  const [allLocations, setAllLocations] = useState([]);
  const [locationsLoading, setLocationsLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setLocationsLoading(true);
        const departments = await getHierarchy();
        const list = [];

        departments.forEach((dep) => {
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

  const selectZone = (loc) => {
    setSelectedZone(loc);
    return loc.commune_label || "";
  };

  const clearZone = () => {
    setSelectedZone(null);
    return "";
  };

  return {
    locationsLoading,
    allLocations,
    selectedZone,
    isModalOpen,
    setIsModalOpen,
    selectZone,
    clearZone,
  };
}

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
    isCertified: "",
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
      isCertified: "",
    });
  }, []);

  return { filters, setFilters, updateFilters, resetFilters };
}

function useSections(initialOpen = {}) {
  const [openSections, setOpenSections] = useState({
    category: true,
    price: true,
    attributes: true,
    sort: true,
    promo: true,
    zone: true,
    seller: true,
    ...initialOpen,
  });
  const toggleSection = useCallback((key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);
  return { openSections, toggleSection };
}

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

  const categories = useCategories();
  const { filters, setFilters, updateFilters, resetFilters } = useFilters();
  const { openSections, toggleSection } = useSections();
  const attributes = useAttributes(filters.category_id);

  const [selectedAttrId, setSelectedAttrId] = useState("");
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const {
    locationsLoading,
    allLocations,
    selectedZone,
    isModalOpen,
    setIsModalOpen,
    selectZone,
    clearZone,
  } = useFreeDeliveryZone();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryId = params.get("category_id");
    if (categoryId) updateFilters({ category_id: categoryId });
  }, [location.search, updateFilters]);

  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const selectedCategory = useMemo(
    () => categories.find((c) => String(c.id) === String(filters.category_id)),
    [categories, filters.category_id]
  );

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

  const handleSelectZone = (loc) => {
    const commune = selectZone(loc);
    if (commune) {
      updateFilters({ freeDeliveryCommune: commune });
    } else {
      setIsModalOpen(false);
    }
  };

  const handleClearZone = () => {
    clearZone();
    updateFilters({ freeDeliveryCommune: "" });
  };

  const openZoneModal = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="space-y-4">
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
                <div className="space-y-2">
                  <p className="text-[10px] font-medium text-base-content/40 px-1 mb-1">
                    Sélectionnez un département, une commune, un arrondissement ou un quartier.
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
                    <button
                      type="button"
                      onClick={openZoneModal}
                      className="w-full bg-base-200 border border-base-200 rounded-2xl px-5 py-4 text-left flex items-center justify-between group hover:border-primary/20 transition-all shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-base-100 rounded-lg flex items-center justify-center text-base-content/40">
                          <MapPin size={18} />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-base-content/40">
                            Choisir une zone
                          </span>
                          <p className="text-[9px] font-black text-primary uppercase tracking-widest mt-0.5">
                            Cliquez pour rechercher
                          </p>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-base-content/30 group-hover:text-primary transition-colors" />
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Section Vendeur certifié */}
        <div className="border-b border-base-200">
          <SectionHeader
            title="Vendeur"
            sectionKey="seller"
            icon={BadgeCheck}
            toggleSection={toggleSection}
            openSections={openSections}
          />
          <AnimatePresence>
            {openSections.seller && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="pb-6 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() =>
                    updateFilters({ isCertified: filters.isCertified === "true" ? "" : "true" })
                  }
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 transition-all ${
                    filters.isCertified === "true"
                      ? "border-blue-500 bg-blue-500/10 text-blue-600"
                      : "border-base-200 text-base-content/50 hover:border-blue-500/30"
                  }`}
                >
                  <BadgeCheck size={18} className="shrink-0" />
                  <span className="text-xs font-black uppercase tracking-widest flex-1 text-left">
                    Vendeurs certifiés uniquement
                  </span>
                  {filters.isCertified === "true" && <Check size={16} className="shrink-0" />}
                </button>
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

      {/* Modal de recherche de zone — rendu dans document.body via portail */}
      <LocationSearchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleSelectZone}
        locationsLoading={locationsLoading}
        allLocations={allLocations}
      />
    </>
  );
}