import React, { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth, useUser } from "@clerk/clerk-react"
import { checkFavorite } from "../../services/favoriteService"
import ProductCard from "./ProductsCard"
import { Sparkles, ArrowRight } from "lucide-react"

export default function ProductGrid({ products = [], showButton = true, title = "Produits récents" }) {
  const { getToken } = useAuth()
  const { isSignedIn } = useUser()
  const navigate = useNavigate()

  return (
    <section className="py-12 px-4 md:px-8 max-w-[1400px] mx-auto overflow-hidden">
      {/* Header Section */}
      <div className="flex items-end justify-between mb-10 px-2 lg:px-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.3em]">
            <Sparkles size={14} className="animate-pulse" /> Notre sélection
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight">
            {title}
          </h2>
        </div>

        {showButton && (
          <Link
            to="/products-liste"
            className="hidden md:flex items-center gap-2 font-bold text-gray-400 hover:text-primary transition-colors group"
          >
            Voir tout le catalogue <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </Link>
        )}
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 lg:gap-8">
        {products.length > 0 ? (
          products.slice(0, 12).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))
        ) : (
          <div className="col-span-full py-20 text-center space-y-4 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <div className="text-gray-400 text-6xl">📦</div>
            <p className="text-gray-500 font-medium">Aucun produit ne correspond à votre recherche.</p>
          </div>
        )}
      </div>

      {/* Responsive View All Button */}
      {showButton && (
        <div className="mt-12 text-center md:hidden">
          <Link to="/products-liste" className="btn btn-primary btn-wide rounded-full shadow-lg shadow-primary/20">
            Tout explorer
          </Link>
        </div>
      )}
    </section>
  )
}