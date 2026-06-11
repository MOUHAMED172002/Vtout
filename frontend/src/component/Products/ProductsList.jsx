import { useEffect, useRef, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { ProductSkeleton } from "../Shared/Skeleton";
import ProductsCard from "../../component/Products/ProductsCard";
import FiltersPanel from "../../component/Products/FiltersPanel";
import FiltersPanelDrawer from "../../component/Products/FiltersPanelDrawer";
import { getProducts } from "../../services/productService";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, PackageSearch, X, Loader2, CheckCircle2 } from "lucide-react";

const LIMIT = 20;

export default function ProductsList() {
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const location = useLocation();
  const sentinelRef = useRef(null);
  const observerRef = useRef(null);

  // Sync category from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryId = params.get("category_id");
    setFilters(prev => {
      const next = { ...prev };
      if (categoryId) next.category_id = categoryId;
      else delete next.category_id;
      return next;
    });
    // Reset scroll when URL changes
    setPage(1);
    setProducts([]);
  }, [location.search]);

  // Reset when filters change
  const prevFiltersRef = useRef(null);
  useEffect(() => {
    const json = JSON.stringify(filters);
    if (prevFiltersRef.current !== null && prevFiltersRef.current !== json) {
      setPage(1);
      setProducts([]);
    }
    prevFiltersRef.current = json;
  }, [filters]);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      if (page === 1) setLoading(true);
      else setLoadingMore(true);

      try {
        const data = await getProducts({ ...filters, page, limit: LIMIT });
        const newProducts = data?.products || data || [];
        const pages = data?.totalPages || 1;
        const count = data?.total || newProducts.length;

        setProducts(prev => page === 1 ? newProducts : [...prev, ...newProducts]);
        setTotalPages(pages);
        setTotalCount(count);
      } catch (error) {
        console.error("Erreur récupération produits:", error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };

    fetchProducts();
  }, [filters, page]);

  // IntersectionObserver to trigger next page
  const handleObserver = useCallback((entries) => {
    const [entry] = entries;
    if (entry.isIntersecting && !loadingMore && !loading && page < totalPages) {
      setPage(prev => prev + 1);
    }
  }, [loadingMore, loading, page, totalPages]);

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: "200px",
      threshold: 0,
    });
    if (sentinelRef.current) observerRef.current.observe(sentinelRef.current);
    return () => observerRef.current?.disconnect();
  }, [handleObserver]);

  const hasMore = page < totalPages;
  const allLoaded = !loading && !loadingMore && !hasMore && products.length > 0;

  return (
    <div className="bg-base-200 min-h-screen">

      {/* Header */}
      <div className="bg-base-100 border-b border-base-200 pt-8 md:pt-16 pb-8 md:pb-12">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8">
            <div className="space-y-3 md:space-y-4">
              <div className="flex items-center gap-3 text-primary font-black uppercase text-[10px] md:text-xs tracking-[0.3em]">
                <SlidersHorizontal size={14} /> Collection Complète
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter leading-tight">
                Notre <span className="text-base-content/40">Boutique</span>
              </h1>
              <p className="text-base-content/50 font-bold max-w-xl text-sm md:text-lg">
                Découvrez une sélection rigoureuse d'articles premium.
              </p>
            </div>

            {/* Search bar - sticky on mobile */}
            <div className="sticky top-20 md:relative z-40 md:top-0 -mx-6 px-6 py-4 md:p-0 bg-base-100/80 md:bg-transparent backdrop-blur-md md:backdrop-blur-none transition-all">
              <div className="relative w-full md:w-[450px] group">
                <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none transition-transform group-focus-within:scale-110">
                  <Search size={20} className="text-base-content/40 group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Rechercher un article..."
                  value={filters.search || ""}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full bg-base-200 border-2 border-base-200 rounded-2xl md:rounded-[2.5rem] py-4 md:py-5 pl-16 pr-12 text-base md:text-lg font-bold text-base-content placeholder:text-base-content/30 focus:bg-base-100 focus:border-primary/30 focus:ring-8 focus:ring-primary/5 transition-all outline-none shadow-sm group-hover:shadow-md"
                />
                {filters.search && (
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, search: "" }))}
                    className="absolute inset-y-0 right-6 flex items-center text-base-content/30 hover:text-rose-500 transition-colors"
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
        <aside className="hidden lg:block w-80 shrink-0">
          <div className="bg-base-100 rounded-[2.5rem] border border-base-200 p-8 shadow-xl shadow-slate-200/40 sticky top-36 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-x-[-20%] -translate-y-[20%] blur-3xl pointer-events-none" />
            <div className="flex items-center gap-4 mb-10 pb-6 border-b border-base-200 relative">
              <div className="w-12 h-12 bg-neutral rounded-2xl flex items-center justify-center text-primary shadow-xl shadow-slate-900/20">
                <SlidersHorizontal size={22} className="stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-base-content">Filtres</h3>
                <p className="text-[10px] font-black text-base-content/40 uppercase tracking-widest mt-1">Personnalisation</p>
              </div>
            </div>
            <FiltersPanel onFilterChange={setFilters} />
          </div>
        </aside>

        {/* Product Area */}
        <div className="flex-1">

          {/* Mobile Filters & Count */}
          <div className="flex items-center justify-between lg:hidden mb-8">
            <FiltersPanelDrawer onFilterChange={setFilters} mobileOnly />
            {!loading && (
              <p className="text-xs font-black text-base-content/40 uppercase tracking-widest">
                {products.length} / {totalCount} articles
              </p>
            )}
          </div>

          {/* Initial Loading Skeletons */}
          {loading && (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
              {Array.from({ length: LIMIT }).map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && products.length === 0 && (
            <div className="py-32 flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-24 h-24 bg-base-200 rounded-full flex items-center justify-center text-base-content/30">
                <PackageSearch size={48} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-base-content">Aucun produit trouvé</h3>
                <p className="text-base-content/50 font-bold max-w-xs mx-auto">
                  Essayez de modifier vos filtres ou effectuez une nouvelle recherche.
                </p>
              </div>
              <button
                onClick={() => setFilters({})}
                className="btn btn-primary rounded-2xl px-8 font-black shadow-lg shadow-primary/20"
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}

          {/* Product Grid with Infinite Scroll */}
          {!loading && products.length > 0 && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8"
              >
                <AnimatePresence mode="popLayout">
                  {products.map((p, idx) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(idx % LIMIT * 0.04, 0.4) }}
                    >
                      <ProductsCard product={p} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>

              {/* Loading More Skeletons */}
              {loadingMore && (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8 mt-4 md:mt-8">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <ProductSkeleton key={`more-${i}`} />
                  ))}
                </div>
              )}

              {/* Loading More Indicator */}
              {loadingMore && (
                <div className="flex items-center justify-center gap-3 py-8 mt-4">
                  <Loader2 size={22} className="animate-spin text-primary" />
                  <span className="text-sm font-black text-base-content/40 uppercase tracking-widest">
                    Chargement...
                  </span>
                </div>
              )}

              {/* All Loaded Indicator */}
              {allLoaded && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center gap-3 py-12 mt-4 border-t border-base-300"
                >
                  <div className="flex items-center gap-2 text-emerald-500">
                    <CheckCircle2 size={20} />
                    <span className="text-sm font-black uppercase tracking-widest">
                      Tous les articles sont affichés
                    </span>
                  </div>
                  <p className="text-[11px] font-bold text-base-content/40 uppercase tracking-widest">
                    {products.length} article{products.length > 1 ? "s" : ""} au total
                  </p>
                </motion.div>
              )}

              {/* Invisible Sentinel for IntersectionObserver */}
              <div ref={sentinelRef} className="h-4 w-full" aria-hidden="true" />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
