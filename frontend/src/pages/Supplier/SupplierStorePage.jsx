import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProducts } from "../../services/productService";
import ProductCard from "../../component/Products/ProductsCard";
import { ArrowLeft, Store, Package } from "lucide-react";
import { motion } from "framer-motion";
import VerifiedSellerBadge from "../../component/Shared/VerifiedSellerBadge";

const SkeletonCard = () => (
  <div className="rounded-2xl bg-base-200 animate-pulse aspect-[3/4]" />
);

export default function SupplierStorePage() {
  const { supplierId } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supplierId) return;
    setLoading(true);
    getProducts({ supplier_id: supplierId, limit: 100 })
      .then(data => {
        const list = Array.isArray(data) ? data : (data.products || []);
        setProducts(list);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [supplierId]);

  return (
    <div className="min-h-screen bg-base-100">
      {/* Header */}
      <div className="border-b border-base-200 bg-base-100 sticky top-0 z-30 backdrop-blur-xl bg-base-100/90">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-2xl bg-base-200 flex items-center justify-center hover:bg-base-300 transition-all"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
              <Store size={16} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="font-black text-base-content text-sm leading-none">Boutique du vendeur</p>
                {products[0]?.supplier?.is_certified && (
                  <VerifiedSellerBadge size={14} />
                )}
              </div>
              <p className="text-[10px] font-bold text-base-content/40 uppercase tracking-widest">
                {loading ? '...' : `${products.length} produit${products.length > 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {[...Array(10)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4 text-base-content/30">
            <Package size={48} />
            <p className="font-black uppercase tracking-widest text-sm">Aucun produit disponible</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6"
          >
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
