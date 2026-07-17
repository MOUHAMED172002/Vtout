import { useEffect, useRef, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { ProductSkeleton } from "../Shared/Skeleton";
import ProductsCard from "../../component/Products/ProductsCard";
import FiltersPanel from "../../component/Products/FiltersPanel";
import FiltersPanelDrawer from "../../component/Products/FiltersPanelDrawer";
import { getProducts } from "../../services/productService";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, PackageSearch, Loader2, CheckCircle2 } from "lucide-react";

const LIMIT = 24;

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

  // Sync category from URL — only update filters, let filtersEffect handle the reset
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryId = params.get("category_id");
    setFilters(prev => {
      const next = { ...prev };
      if (categoryId) next.category_id = categoryId;
      else delete next.category_id;
      return next;
    });
  }, [location.search]);

  // Reset page + products when filters change (covers both URL and panel-driven changes)
  const prevFiltersRef = useRef(null);
  useEffect(() => {
    const json = JSON.stringify(filters);
    if (prevFiltersRef.current !== null && prevFiltersRef.current !== json) {
      setPage(1);
      setProducts([]);
    }
    prevFiltersRef.current = json;
  }, [filters]);

  // Fetch products — abort controller prevents stale results from overwriting fresh ones
  useEffect(() => {
    let cancelled = false;

    const fetchProducts = async () => {
      if (page === 1) setLoading(true);
      else setLoadingMore(true);

      try {
        const data = await getProducts({ ...filters, page, limit: LIMIT });
        if (cancelled) return;

        const newProducts = data?.products || data || [];
        const pages = data?.totalPages || 1;
        const count = data?.totalCount ?? data?.total ?? newProducts.length;

        setProducts(prev => page === 1 ? newProducts : [...prev, ...newProducts]);
        setTotalPages(pages);
        setTotalCount(count);
      } catch (error) {
        if (!cancelled) console.error("Erreur récupération produits:", error);
      } finally {
        if (!cancelled) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    };

    fetchProducts();
    return () => { cancelled = true; };
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
    <div className="bg-slate-50 min-h-screen">


      <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-12 flex flex-col lg:flex-row gap-12">

        {/* Sidebar Filters Desktop */}
        <aside className="hidden lg:block w-80 shrink-0">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-xl shadow-slate-200/40 sticky top-36 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-x-[-20%] -translate-y-[20%] blur-3xl pointer-events-none" />
            <div className="flex items-center gap-4 mb-10 pb-6 border-b border-slate-50 relative">
              <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-primary shadow-xl shadow-slate-900/20">
                <SlidersHorizontal size={22} className="stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900">Filtres</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Personnalisation</p>
              </div>
            </div>
            <FiltersPanel onFilterChange={setFilters} />
          </div>
        </aside>

        {/* Product Area */}
        <div className="flex-1">

          {/* Mobile Filters & Count
          <div className="flex items-center justify-between lg:hidden mb-8">
            <FiltersPanelDrawer onFilterChange={setFilters} mobileOnly />
            {!loading && totalCount > 0 && (
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                {products.length} / {totalCount} articles
              </p>
            )}
          </div> */}

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
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
                <PackageSearch size={48} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900">Aucun produit trouvé</h3>
                <p className="text-slate-500 font-bold max-w-xs mx-auto">
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
                  <span className="text-sm font-black text-slate-400 uppercase tracking-widest">
                    Chargement...
                  </span>
                </div>
              )}

              {/* All Loaded Indicator */}
              {allLoaded && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center gap-3 py-12 mt-4 border-t border-slate-200"
                >
                  <div className="flex items-center gap-2 text-emerald-500">
                    <CheckCircle2 size={20} />
                    <span className="text-sm font-black uppercase tracking-widest">
                      Tous les articles sont affichés
                    </span>
                  </div>
                  
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
