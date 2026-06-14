import React, { useEffect, useState } from "react";
import { getFrequentlyBoughtTogether } from "../../services/productService";
import ProductCard from "./ProductsCard";
import { PackagePlus } from "lucide-react";

export default function FrequentlyBoughtTogether({ productId, limit = 4 }) {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!productId) return;

    async function fetchBoughtTogether() {
      setLoading(true);
      try {
        const data = await getFrequentlyBoughtTogether(productId);
        setItems((data || []).slice(0, limit));
      } catch (err) {
        console.error("fetchBoughtTogether err", err);
      } finally {
        setLoading(false);
      }
    }

    fetchBoughtTogether();
  }, [productId, limit]);

  if (loading) return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-10">
      {[...Array(limit)].map((_, i) => (
        <div key={i} className="aspect-square bg-gray-50 animate-pulse rounded-2xl"></div>
      ))}
    </div>
  );

  if (items.length === 0) return null;

  return (
    <section className="mt-12 bg-indigo-50/50 p-6 md:p-10 rounded-[2rem] border border-indigo-100">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2.5 bg-indigo-100 rounded-xl text-indigo-600">
          <PackagePlus size={24} />
        </div>
        <div>
          <h3 className="text-xl md:text-2xl font-black text-base-content">Souvent achetés ensemble</h3>
          <p className="text-xs md:text-sm text-base-content/50 font-bold uppercase tracking-widest mt-1">Complétez votre achat</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
        {items.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
          />
        ))}
      </div>
    </section>
  );
}
