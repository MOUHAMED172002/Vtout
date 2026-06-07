import { getCategories, getAttributesByCategory, getAttributes } from "../../services/productService";
import { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { ChevronDown, Zap, RotateCcw, Box, Plus, Tag, DollarSign, LayoutGrid, ChevronRight, Sparkles, Search, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CategorySearchModal from "../Shared/CategorySearchModal";

export default function FiltersPanel({ onFilterChange = () => { } }) {
  const [categories, setCategories] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [openSections, setOpenSections] = useState({
    category: true,
    price: true,
    attributes: true,
    sort: true,
    promo: true,
    commune: false,
  });

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
    commune: "",
  });

  const [selectedAttrId, setSelectedAttrId] = useState("");
  const location = useLocation();

  const selectedCategory = useMemo(() => {
    return categories.find(c => String(c.id) === String(filters.category_id));
  }, [categories, filters.category_id]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryId = params.get("category_id");
    if (categoryId) setFilters((prev) => ({ ...prev, category_id: categoryId }));
  }, [location.search]);

  useEffect(() => {
    (async () => {
      try {
        const catData = await getCategories();
        setCategories(catData || []);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  useEffect(() => {
    const loadAttrs = async () => {
      try {
        // Fetch all global attributes as per the "global" system request
        const allAttrs = await getAttributes();

        // If a category is selected, we could theoretically filter, 
        // but for a truly global system, we show what's available.
        // We take the top 15 to keep the UI clean.
        setAttributes(allAttrs.slice(0, 15));
        setSelectedAttrId("");
      } catch (err) {
        console.error(err);
        setAttributes([]);
      }
    };
    loadAttrs();
  }, [filters.category_id]);

  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const toggleSection = (key) => setOpenSections((p) => ({ ...p, [key]: !p[key] }));
  const updateFilters = (patch) => setFilters((prev) => ({ ...prev, ...patch }));

  const handlePricePreset = (preset) => {
    switch (preset) {
      case "low": updateFilters({ minPrice: 0, maxPrice: 10000 }); break;
      case "mid": updateFilters({ minPrice: 10000, maxPrice: 50000 }); break;
      case "high": updateFilters({ minPrice: 50000, maxPrice: 500000 }); break;
      default: updateFilters({ minPrice: 0, maxPrice: 500000 });
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

  const clearFilters = () => {
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
      commune: "",
    });
    setSelectedAttrId("");
  };

  const SectionHeader = ({ title, sectionKey, icon: Icon }) => (
    <button
      onClick={() => toggleSection(sectionKey)}
      className="w-full flex items-center justify-between py-4 group"
    >
      <div className="flex items-center gap-3">
        <Icon size={16} className="text-slate-400 group-hover:text-primary transition-colors" />
        <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-800">{title}</span>
      </div>
      {openSections[sectionKey] ? <ChevronDown size={14} className="text-slate-300" /> : <Plus size={14} className="text-slate-300" />}
    </button>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-8">
        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Configuration</h4>
        <button onClick={clearFilters} className="flex items-center gap-1.5 text-xs font-black text-primary hover:underline">
          <RotateCcw size={12} /> Reset
        </button>
      </div>



      {/* Promotion Types */}
      <div className="border-b border-slate-50">
        <SectionHeader title="Promotions & Offres" sectionKey="promo" icon={Sparkles} />
        <AnimatePresence>
          {openSections.promo && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="pb-6 overflow-hidden">
              <div className="space-y-2">
                {[
                  { id: "all_promos", label: "Toutes les promotions" },
                  { id: "isPromo", label: "Réductions Directes" },
                  { id: "isFlashSale", label: "Ventes Flash" },
                  { id: "hasVolumePricing", label: "Prix Dégressifs" },
                  { id: "isKit", label: "Packs & Kits" },
                  { id: "none", label: "Aucune (Normal)" }
                ].map((p) => {
                  const handleSelect = () => {
                    if (p.id === "all_promos") {
                      updateFilters({
                        isPromo: "",
                        isFlashSale: "",
                        isKit: "",
                        hasVolumePricing: "",
                        isAnyPromo: "true"
                      });
                    } else if (p.id === "none") {
                      updateFilters({
                        isPromo: "",
                        isFlashSale: "",
                        isKit: "",
                        hasVolumePricing: "",
                        isAnyPromo: ""
                      });
                    } else {
                      updateFilters({
                        isPromo: p.id === "isPromo" ? "true" : "",
                        isFlashSale: p.id === "isFlashSale" ? "true" : "",
                        isKit: p.id === "isKit" ? "true" : "",
                        hasVolumePricing: p.id === "hasVolumePricing" ? "true" : "",
                        isAnyPromo: ""
                      });
                    }
                  };

                  const isCurrentlyActive = 
                    p.id === "all_promos" ? filters.isAnyPromo === "true" :
                    p.id === "none" ? (!filters.isPromo && !filters.isFlashSale && !filters.isKit && !filters.hasVolumePricing && !filters.isAnyPromo) :
                    filters[p.id] === "true";

                  return (
                    <button
                      key={p.id}
                      onClick={handleSelect}
                      className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all ${isCurrentlyActive ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
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

      {/* Sorting */}
      <div className="border-b border-slate-50">
        <SectionHeader title="Tri" sectionKey="sort" icon={LayoutGrid} />
        <AnimatePresence>
          {openSections.sort && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="pb-6 overflow-hidden">
              <div className="space-y-2">
                {["recent", "price_asc", "price_desc"].map((s) => (
                  <button
                    key={s}
                    onClick={() => updateFilters({ sort: s })}
                    className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all ${filters.sort === s ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
                  >
                    {s === "recent" ? "Plus récents" : s === "price_asc" ? "Prix croissant" : "Prix décroissant"}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Category Selection (New Premium Style) */}
      <div className="border-b border-slate-50">
        <SectionHeader title="Catégorie" sectionKey="category" icon={Tag} />
        <AnimatePresence>
          {openSections.category && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="pb-6 overflow-hidden">
              <button
                type="button"
                onClick={() => setShowCategoryModal(true)}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-left flex items-center justify-between group hover:border-primary/20 transition-all shadow-sm"
              >
                <div className="flex flex-col">
                  <span className={`text-xs font-bold ${selectedCategory ? 'text-slate-900' : 'text-slate-400'}`}>
                    {selectedCategory ? selectedCategory.name : "Toutes les catégories"}
                  </span>
                  {selectedCategory && (
                    <span className="text-[9px] font-black text-primary uppercase tracking-widest mt-0.5 flex items-center gap-1">
                      <Sparkles size={8} /> Sélectionnée
                    </span>
                  )}
                </div>
                <ChevronRight size={16} className="text-slate-300 group-hover:text-primary transition-colors" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Price */}
      <div className="border-b border-slate-50">
        <SectionHeader title="Bilan Prix" sectionKey="price" icon={DollarSign} />
        <AnimatePresence>
          {openSections.price && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="pb-8 overflow-hidden space-y-6">
              <div className="flex flex-wrap gap-2">
                {[["< 10k", "low"], ["10k-50k", "mid"], ["> 50k", "high"]].map(([label, val]) => (
                  <button key={val} onClick={() => handlePricePreset(val)} className="px-4 py-2 bg-slate-50 rounded-full text-[10px] font-black uppercase text-slate-500 hover:bg-primary/10 hover:text-primary transition-all border border-slate-100">{label}</button>
                ))}
              </div>

              <div className="space-y-6 px-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Min (FCFA)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-xs text-bold">CFA</span>
                      <input 
                        type="number" 
                        value={filters.minPrice} 
                        onChange={(e) => updateFilters({ minPrice: Math.max(0, Number(e.target.value)) })}
                        className="w-full bg-slate-50 border-2 border-transparent rounded-2xl pl-12 pr-4 py-3 text-sm font-bold text-slate-900 focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Max (FCFA)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-xs text-bold">CFA</span>
                      <input 
                        type="number" 
                        value={filters.maxPrice} 
                        onChange={(e) => updateFilters({ maxPrice: Math.max(0, Number(e.target.value)) })}
                        className="w-full bg-slate-50 border-2 border-transparent rounded-2xl pl-12 pr-4 py-3 text-sm font-bold text-slate-900 focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="relative h-6 flex items-center">
                  <div className="absolute w-full h-1.5 bg-slate-100 rounded-full">
                    <div 
                      className="absolute h-full bg-orange-400 rounded-full" 
                      style={{ 
                        left: `${(filters.minPrice / 500000) * 100}%`, 
                        right: `${100 - (filters.maxPrice / 500000) * 100}%` 
                      }} 
                    />
                  </div>
                  <input 
                    type="range" 
                    min={0} 
                    max={500000} 
                    step={1000} 
                    value={filters.minPrice} 
                    onChange={(e) => updateFilters({ minPrice: Math.min(Number(e.target.value), filters.maxPrice - 1000) })} 
                    className="absolute w-full h-1.5 appearance-none bg-transparent pointer-events-none cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-orange-500 [&::-webkit-slider-thumb]:shadow-md" 
                  />
                  <input 
                    type="range" 
                    min={0} 
                    max={500000} 
                    step={1000} 
                    value={filters.maxPrice} 
                    onChange={(e) => updateFilters({ maxPrice: Math.max(Number(e.target.value), filters.minPrice + 1000) })} 
                    className="absolute w-full h-1.5 appearance-none bg-transparent pointer-events-none cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-orange-500 [&::-webkit-slider-thumb]:shadow-md" 
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Commune / Ville */}
      <div className="border-b border-slate-50">
        <SectionHeader title="Ville du vendeur" sectionKey="commune" icon={MapPin} />
        <AnimatePresence>
          {openSections.commune && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="pb-6 overflow-hidden">
              <div className="relative">
                <MapPin size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                <input
                  type="text"
                  placeholder="Ex: Cotonou, Abomey..."
                  value={filters.commune}
                  onChange={e => updateFilters({ commune: e.target.value })}
                  className="w-full bg-slate-50 border-2 border-transparent rounded-2xl pl-10 pr-4 py-3 text-xs font-bold text-slate-900 placeholder:text-slate-300 focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                />
                {filters.commune && (
                  <button onClick={() => updateFilters({ commune: "" })} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-red-400 transition-colors text-lg leading-none">×</button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Attributes */}
      <div className="border-b border-slate-50">
        <SectionHeader title="Propriétés" sectionKey="attributes" icon={Box} />
        <AnimatePresence>
          {openSections.attributes && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="pb-6 overflow-hidden space-y-4">
              <select
                className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-900 shadow-sm focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                value={selectedAttrId}
                onChange={(e) => setSelectedAttrId(e.target.value)}
              >
                <option value="">Sélectionner un attribut...</option>
                {attributes.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>

              {selectedAttrId && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Valeurs disponibles</div>
                  <div className="flex flex-wrap gap-2">
                    {attributes.find(a => String(a.id) === String(selectedAttrId))?.values?.map((v) => {
                      const isSelected = (filters.attributes[selectedAttrId] || []).includes(v.value);
                      return (
                        <button
                          key={v.id}
                          onClick={() => toggleAttributeValue(selectedAttrId, v.value)}
                          className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${isSelected ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-50 text-slate-500 border border-slate-100 hover:border-primary/30'}`}
                        >
                          {v.value}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {Object.entries(filters.attributes).length > 0 && (
                <div className="pt-4 border-t border-slate-50 space-y-2">
                  {Object.entries(filters.attributes).map(([attrId, vals]) => {
                    const attrName = attributes.find(a => String(a.id) === String(attrId))?.name || "Attribut";
                    return (
                      <div key={attrId} className="bg-slate-50 p-3 rounded-xl border border-slate-100 relative group">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{attrName}</p>
                        <p className="text-xs font-bold text-slate-700 truncate pr-6">{vals.join(", ")}</p>
                        <button
                          onClick={() => {
                            const nextAttrs = { ...filters.attributes };
                            delete nextAttrs[attrId];
                            updateFilters({ attributes: nextAttrs });
                          }}
                          className="absolute top-1/2 -translate-y-1/2 right-3 w-6 h-6 flex items-center justify-center bg-white border border-slate-100 rounded-full text-slate-300 hover:text-red-400 transition-all"
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

      {/* Category Search Modal - Rendered outside overflow container for better stacking context */}
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