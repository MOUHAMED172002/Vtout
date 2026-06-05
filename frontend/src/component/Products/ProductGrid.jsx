import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import ProductCard from "./ProductsCard";
import { Sparkles, ArrowRight } from "lucide-react";

// Effect 5: Skeleton Shimmer Component
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 p-4 space-y-4 shadow-sm relative isolate">
    <div className="aspect-square bg-slate-100 rounded-xl relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer" style={{ width: '200%' }} />
    </div>
    <div className="h-4 bg-slate-100 rounded-full w-2/3 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer" style={{ width: '200%' }} />
    </div>
    <div className="h-4 bg-slate-100 rounded-full w-1/3 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer" style={{ width: '200%' }} />
    </div>
    <div className="h-2 bg-slate-100 rounded-full w-full relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer" style={{ width: '200%' }} />
    </div>
  </div>
);

export default function ProductGrid({ products = [], showButton = true, title = "Produits récents", loading = false }) {
  // Effect 1: Staggered Entrance Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0, scale: 0.95 },
    visible: { 
      y: 0, 
      opacity: 1, 
      scale: 1,
      transition: { type: "spring", damping: 20, stiffness: 100 }
    }
  };

  return (
    <section className="pt-4 pb-12 px-4 md:px-8 max-w-[1400px] mx-auto overflow-hidden">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 px-2 lg:px-4 gap-4"
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.3em]">
            <Sparkles size={14} className="animate-pulse" /> Notre sélection
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 leading-tight tracking-tighter">
            {title}
          </h2>
        </div>

        {showButton && (
          <motion.div
            whileHover={{ x: 5 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <Link
              to="/products-liste"
              className="flex items-center gap-2 font-black text-[10px] uppercase tracking-widest text-gray-400 hover:text-primary transition-colors group bg-slate-50 px-6 py-3 rounded-full border border-slate-100 shadow-sm"
            >
              Voir tout le catalogue <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        )}
      </motion.div>

      {/* Grid Layout */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 lg:gap-8">
          {[...Array(12)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-20px" }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 lg:gap-8"
        >
          {products.length > 0 ? (
            products.slice(0, 20).map((product) => (
              <motion.div key={product.id} variants={itemVariants}>
                <ProductCard product={product} />
              </motion.div>
            ))
          ) : (
            <motion.div 
              variants={itemVariants}
              className="col-span-full py-20 text-center space-y-4 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-100 shadow-inner"
            >
              <div className="text-gray-200 text-6xl">📦</div>
              <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Aucun produit trouvé</p>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Responsive View All Button - Always visible at bottom */}
      {showButton && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <Link 
            to="/products-liste" 
            className="inline-flex h-16 items-center px-12 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-slate-200 hover:bg-primary hover:shadow-primary/30 active:scale-95 transition-all group gap-4"
          >
            Tout explorer le catalogue
            <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
          </Link>
        </motion.div>
      )}
    </section>
  );
}