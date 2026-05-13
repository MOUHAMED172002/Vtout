import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { ProductSkeleton } from "../Shared/Skeleton";
import ProductsCard from "../../component/Products/ProductsCard";
import FiltersPanelDrawer from "../../component/Products/FiltersPanelDrawer";
import { getProducts } from "../../services/productService";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, SlidersHorizontal, ChevronLeft, ChevronRight, PackageSearch, X } from "lucide-react";

export default function ProductsList() {
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(12);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryId = params.get("category_id");
    if (categoryId) {
      setFilters((prev) => ({
        ...prev,
        category_id: categoryId,
      }));
    }
  }, [location.search]);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 1600) setLimit(30);
      else if (width >= 1024) setLimit(20);
      else if (width >= 768) setLimit(12);
      else setLimit(8);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchProductsData = async () => {
      setLoading(true);
      try {
        const data = await getProducts({ ...filters, page, limit });
        if (data && data.products) {
          setProducts(data.products);
          setTotalPages(data.totalPages || 1);
        } else {
          setProducts(data || []);
          setTotalPages(1);
        }
      } catch (error) {
        console.error("Erreur récupération produits:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProductsData();
  }, [filters, page, limit]);

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Header Boutique */}
      <div className="bg-white border-b border-slate-100 pt-8 md:pt-16 pb-8 md:pb-12">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8">
            <div className="space-y-3 md:space-y-4">
              <div className="flex items-center gap-3 text-primary font-black uppercase text-[10px] md:text-xs tracking-[0.3em]">
                <SlidersHorizontal size={14} /> Collection Complète
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter leading-tight">Notre <span className="text-slate-400">Boutique</span></h1>
              <p className="text-slate-500 font-bold max-w-xl text-sm md:text-lg">Découvrez une sélection rigoureuse d'articles premium.</p>
            </div>

            {/* Mobile Sticky Search Wrapper */}
            <div className="sticky top-20 md:relative z-40 md:top-0 -mx-6 px-6 py-4 md:p-0 bg-white/80 md:bg-transparent backdrop-blur-md md:backdrop-blur-none transition-all">
              <div className="relative w-full md:w-[450px] group">
                <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none transition-transform group-focus-within:scale-110">
                  <Search size={20} className="text-slate-400 group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Rechercher un article..."
                  value={filters.search || ""}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl md:rounded-[2.5rem] py-4 md:py-5 pl-16 pr-12 text-base md:text-lg font-bold text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-primary/30 focus:ring-8 focus:ring-primary/5 transition-all outline-none shadow-sm group-hover:shadow-md"
                />
                {filters.search && (
                  <button 
                    onClick={() => setFilters(prev => ({ ...prev, search: "", page: 1 }))}
                    className="absolute inset-y-0 right-6 flex items-center text-slate-300 hover:text-rose-500 transition-colors"
                  >
                    <X size={20} strokeWidth={3} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-12 flex flex-col lg:flex-row gap-12">
        {/* Sidebar Filters Desktop */}
        <aside className="hidden lg:block w-72 shrink-0">
          <div className="sticky top-32 space-y-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                <Filter size={18} />
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Affiner les résultats</h3>
            </div>
            <FiltersPanelDrawer onFilterChange={setFilters} />
          </div>
        </aside>

        {/* Product Area */}
        <div className="flex-1 space-y-12">
          {/* Mobile Filters Trigger and Tools */}
          <div className="flex items-center justify-between lg:hidden mb-8">
            <FiltersPanelDrawer onFilterChange={setFilters} />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{products.length} articles trouvés</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="py-32 flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
                <PackageSearch size={48} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900">Aucun produit trouvé</h3>
                <p className="text-slate-500 font-bold max-w-xs mx-auto">Essayez de modifier vos filtres ou effectuez une nouvelle recherche.</p>
              </div>
              <button onClick={() => setFilters({})} className="btn btn-primary rounded-2xl px-8 font-black shadow-lg shadow-primary/20">Réinitialiser les filtres</button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid gap-8 grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
            >
              {products.map((p, idx) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <ProductsCard product={p} />
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Pagination Area */}
          {!loading && products.length > 0 && (
            <div className="pt-12 border-t border-slate-200 flex flex-col items-center gap-8">
              <div className="flex items-center gap-3">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="w-14 h-14 flex items-center justify-center bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-primary hover:border-primary transition-all disabled:opacity-30 disabled:hover:text-slate-400 disabled:hover:border-slate-100 shadow-sm"
                >
                  <ChevronLeft size={24} />
                </button>
                {[1].map(num => (
                  <button
                    key={num}
                    className={`w-14 h-14 rounded-2xl font-black transition-all ${page === num ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'bg-white border border-slate-100 text-slate-600 hover:bg-slate-50'}`}
                  >
                    {num}
                  </button>
                ))}
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="w-14 h-14 flex items-center justify-center bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-primary hover:border-primary transition-all disabled:opacity-30 disabled:hover:text-slate-400 disabled:hover:border-slate-100 shadow-sm"
                >
                  <ChevronRight size={24} />
                </button>
              </div>
              <p className="text-[10px] font-black italic text-slate-400 uppercase tracking-widest">Affichage de {products.length} articles par page</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
