import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Zap, ChevronRight, ShoppingCart, Star, ArrowRight, Tag } from 'lucide-react';
import { getProducts } from '../../services/productService';
import { Link, useNavigate } from 'react-router-dom';

import CountdownTimer from '../Shared/CountdownTimer';

export default function FlashSaleSection() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFlashSales = async () => {
            try {
                const data = await getProducts({ limit: 40 }); // fetch more to have room for filtering
                // Filter for real ACTIVE flash sales
                const flashSales = data.filter(p => p.is_flash_sale && (!p.flash_sale_end || new Date(p.flash_sale_end) > new Date()));
                setProducts(flashSales);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchFlashSales();
    }, []);

    const mainProduct = useMemo(() => products[0], [products]);

    if (loading || products.length === 0) return null;

    return (
        <div className="container py-24 space-y-16 overflow-hidden">

            {/* ── Premium Flash Sale Banner Header ── */}
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative w-full rounded-[3rem] overflow-hidden bg-slate-900 p-8 md:p-12 min-h-[400px] flex items-center shadow-2xl shadow-slate-900/30"
            >
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-rose-500/20 to-transparent pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
                    {/* Left Side: Info */}
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <motion.div
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                className="inline-flex items-center gap-2 bg-rose-500 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-rose-500/20"
                            >
                                <Zap size={12} fill="currentColor" /> Offres du Jour
                            </motion.div>
                            <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-tight uppercase">
                                Liquidation <br /><span className="text-rose-500 italic">Exceptionnelle.</span>
                            </h2>
                            <p className="text-slate-400 font-bold max-w-md text-sm md:text-base leading-relaxed">
                                Ne manquez pas nos offres à durée limitée. Jusqu'à -50% sur une sélection exclusive de produits premium.
                            </p>
                        </div>

                        {/* Banner Countdown */}
                        <div className="space-y-3">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900/30">L'offre se termine dans :</p>
                            <CountdownTimer targetDate={mainProduct.flash_sale_end || new Date(Date.now() + 86400000 * 2).toISOString()} variant="premium" />
                        </div>

                        <Link
                            to="/products-liste"
                            className="inline-flex items-center gap-4 bg-black hover:bg-rose-500 hover:text-white text-white px-8 py-5 rounded-full font-black text-xs uppercase tracking-[0.2em] transition-all duration-500 group shadow-xl"
                        >
                            Explorer les offres
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    {/* Right Side: Visual Preview of first product */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        className="hidden lg:flex justify-center items-center relative"
                    >
                        <div className="absolute inset-0 bg-rose-500/5 rounded-full blur-3xl" />
                        <div className="relative aspect-square w-full max-w-sm rounded-[3rem] overflow-hidden border border-white/5 bg-white/5 backdrop-blur-sm group cursor-pointer" onClick={() => navigate(`/products/${mainProduct.id}`)}>
                            <img
                                src={mainProduct.image_url || mainProduct.images?.[0]?.image_url || "/placeholder.png"}
                                alt={mainProduct.name}
                                className="w-full h-full object-cover p-8 group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute bottom-6 left-6 right-6 p-6 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-white/10 space-y-2">
                                <h4 className="text-slate-900 font-black text-sm truncate uppercase tracking-tight">{mainProduct.name}</h4>
                                <div className="flex items-center justify-between">
                                    <span className="text-rose-500 font-black text-lg">{mainProduct.price.toLocaleString()} F</span>
                                    <span className="text-slate-900/30 text-xs line-through">{mainProduct.old_price?.toLocaleString()} F</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>

            {/* ── Slider Section ── */}
            {/*  */}
        </div>
    );
}
