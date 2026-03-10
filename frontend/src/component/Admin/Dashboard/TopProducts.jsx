import React from "react";

/**
 * TopProducts
 * props:
 *  - products: [{ id, name, image, sold }]
 */
const TopProducts = ({ products = [] }) => {
  return (
    <div className="space-y-3">
      {products.map((p) => (
        <div key={p.id} className="flex items-center gap-4">
          <div className="avatar">
            <div className="w-12 h-12 rounded">
              <img src={p.image} alt={p.name} />
            </div>
          </div>
          <div className="flex-1">
            <div className="font-medium">{p.name}</div>
            <div className="text-sm text-muted">Vendus: {p.sold}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted">{p.price ? `${p.price} CFA` : ""}</div>
          </div>
        </div>
      ))}
      {products.length === 0 && <div className="text-sm text-muted">Aucun produit</div>}
    </div>
  );
};

export default TopProducts;