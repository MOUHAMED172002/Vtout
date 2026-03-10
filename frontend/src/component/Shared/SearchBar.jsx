import { searchProducts } from "../../services/productService";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, Loader2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import EmptyState from "./EmptyState";

export default function SearchModal() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Debouncing effect
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const products = await searchProducts(query);
        const formatted = (products || []).map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          category: p.category?.name || "Sans catégorie",
          image: p.images?.[0]?.image_url || "/placeholder.jpg",
        }));
        setResults(formatted);
      } catch (err) {
        console.error("Erreur recherche :", err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [query]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  function handleSelectProduct(id) {
    setOpen(false);
    setQuery("");
    setResults([]);
    navigate(`/products/${id}`);
  }

  return (
    <>
      {/* 🔘 Bouton d’ouverture */}
      <button
        onClick={() => setOpen(true)}
        className="group flex items-center gap-3 px-6 py-3 bg-slate-50 hover:bg-white hover:shadow-md border border-slate-100 rounded-full transition-all duration-300 w-full md:w-auto overflow-hidden relative"
      >
        <div className="absolute inset-0 bg-primary/5 translate-y-full group-hover:translate-y-0 transition-transform"></div>
        <Search className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors relative z-10" />
        <span className="text-xs font-black text-slate-500 group-hover:text-slate-900 uppercase tracking-widest relative z-10">Rechercher...</span>
        <kbd className="hidden md:inline-flex items-center gap-1 h-5 select-none rounded border border-slate-200 bg-white px-1.5 font-sans text-[10px] font-medium text-slate-400 opacity-100 ml-auto relative z-10">
          <span className="text-xs text-slate-300">⌘</span>K
        </kbd>
      </button>

      {/* 🪟 Modale */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-start justify-center pt-20 z-[200] px-4"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: -20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: -20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              {/* Header Search */}
              <div className="p-6 border-b border-slate-50 flex items-center gap-4">
                <div className={`p-3 rounded-2xl transition-colors ${loading ? 'bg-primary/10 text-primary' : 'bg-slate-50 text-slate-400'}`}>
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Search className="w-6 h-6" />}
                </div>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Que cherchez-vous aujourd'hui ?"
                  className="w-full text-xl font-bold placeholder:text-slate-300 border-none focus:ring-0"
                  autoFocus
                />
                <button
                  onClick={() => setOpen(false)}
                  className="p-3 hover:bg-slate-50 rounded-2xl transition-colors text-slate-400 hover:text-slate-900"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Résultats */}
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {results.length > 0 ? (
                  <div className="space-y-2">
                    <p className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Suggestions de produits</p>
                    {results.map((item, idx) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => handleSelectProduct(item.id)}
                        className="flex items-center gap-4 p-4 rounded-3xl hover:bg-slate-50 cursor-pointer transition-all group"
                      >
                        <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 border border-slate-100">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <div className="flex-1">
                          <p className="font-black text-slate-900 truncate tracking-tight">{item.name}</p>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{item.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-primary tracking-tighter">{item.price.toLocaleString()} F</p>
                          <div className="flex items-center gap-1 text-[10px] font-black text-slate-300 uppercase group-hover:text-primary transition-colors">
                            Voir <ArrowRight size={10} />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : query.trim().length >= 2 && !loading ? (
                  <EmptyState
                    type="search"
                    title="Aucun résultat"
                    description={`Nous n'avons trouvé aucun produit correspondant à "${query}".`}
                    actionLabel={null}
                  />
                ) : !loading && (
                  <div className="py-20 flex flex-col items-center justify-center text-center opacity-40">
                    <Search size={48} className="text-slate-200 mb-4" />
                    <p className="text-sm font-bold text-slate-400">Commencez à taper pour rechercher...</p>
                  </div>
                )}
              </div>

              {/* Footer Search */}
              <div className="p-4 bg-slate-50/50 border-t border-slate-50 text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Astuce : Utilisez les flèches pour naviguer rapidement</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
