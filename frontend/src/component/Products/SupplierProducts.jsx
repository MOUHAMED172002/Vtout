import React, { useEffect, useState } from "react";
import { getProducts } from "../../services/productService";
import ProductCard from "./ProductsCard";
import { Store } from "lucide-react";

export default function SupplierProducts({ supplierId, currentProductId, limit = 8 }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supplierId) { setLoading(false); return; }

    async function fetch() {
      setLoading(true);
      try {
        const data = await getProducts({ supplier_id: supplierId, limit: limit + 1 });
        const products = Array.isArray(data) ? data : (data.products || []);
        setItems(products.filter(p => p.id !== currentProductId).slice(0, limit));
      } catch (err) {
        console.error("SupplierProducts fetch error", err);
      } finally {
        setLoading(false);
      }
    }

    fetch();
  }, [supplierId, currentProductId, limit]);

  if (loading) return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pt-10">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="aspect-square bg-base-200 animate-pulse rounded-2xl" />
      ))}
    </div>
  );

  if (items.length === 0) return null;

  return (
    <section className="mt-20">
      <div className="flex items-center gap-3 mb-10">
        <div className="p-2 bg-primary/10 rounded-xl text-primary">
          <Store size={24} />
        </div>
        <div>
          <h3 className="text-2xl font-black text-base-content">Autres produits du même vendeur</h3>
          <p className="text-sm text-base-content/40 font-medium">Plus d'articles de cette boutique</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-6">
        {items.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
