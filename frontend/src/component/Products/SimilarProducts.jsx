import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProducts, getRelatedProducts } from "../../services/productService";
import ProductCard from "./ProductsCard";
import { Sparkles } from "lucide-react";

export default function SimilarProducts({ productId: propProductId = null, limit = 6 }) {
  const params = useParams();
  const productId = propProductId || params.id;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!productId) return;

    async function fetchSimilar() {
      setLoading(true);
      try {
        const related = await getRelatedProducts(productId);
        setItems(related.slice(0, limit));
      } catch (err) {
        console.error("fetchSimilar err", err);
      } finally {
        setLoading(false);
      }
    }

    fetchSimilar();
  }, [productId, limit]);

  if (loading) return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 pt-10">
      {[...Array(limit)].map((_, i) => (
        <div key={i} className="aspect-square bg-gray-50 animate-pulse rounded-2xl"></div>
      ))}
    </div>
  );

  if (items.length === 0) return null;

  return (
    <section className="mt-20">
      <div className="flex items-center gap-3 mb-10">
        <div className="p-2 bg-primary/10 rounded-xl text-primary">
          <Sparkles size={24} />
        </div>
        <div>
          <h3 className="text-2xl font-black text-gray-900">Produits similaires</h3>
          <p className="text-sm text-gray-400 font-medium">Vous pourriez aussi aimer ces articles</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
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
