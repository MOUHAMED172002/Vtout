import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Quote, User, CheckCircle, Pencil } from 'lucide-react';
import api from '../../services/api';
import PlatformReviewModal from './PlatformReviewModal';

const PlatformReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showReviewModal, setShowReviewModal] = useState(false);

    // Fictive reviews for start
    const dummyReviews = [
        {
            id: 'd1',
            rating: 5,
            comment: "Vtout a révolutionné ma façon de m'approvisionner. La livraison est rapide et les produits sont conformes. Je recommande à 100% !",
            user: { fullname: "Marc Alabi", avatar_url: null }
        },
        {
            id: 'd2',
            rating: 5,
            comment: "Service client exceptionnel. J'ai eu un petit souci avec une commande et l'équipe a réglé ça en moins de 24h. Très pro.",
            user: { fullname: "Sika Ahoussi", avatar_url: null }
        },
        {
            id: 'd3',
            rating: 4,
            comment: "Plateforme très intuitive. En tant que revendeuse, je trouve tout ce dont j'ai besoin au meilleur prix du marché béninois.",
            user: { fullname: "Bernice Kpadonou", avatar_url: null }
        },
        {
            id: 'd4',
            rating: 5,
            comment: "Enfin un site e-commerce fiable au Bénin ! Les livreurs sont polis et ponctuels.",
            user: { fullname: "Joël Dossou", avatar_url: null }
        }
    ];

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const { data } = await api.get('/content/platform-reviews');
                if (data && data.length > 0) {
                    setReviews([...data, ...dummyReviews]);
                } else {
                    setReviews(dummyReviews);
                }
            } catch (error) {
                console.error("Erreur reviews:", error);
                setReviews(dummyReviews);
            } finally {
                setLoading(false);
            }
        };
        fetchReviews();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-base-200 pt-24 pb-20 px-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16" data-aos="fade-up">
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-base-content mb-6 px-4">
                        Ce que disent <span className="text-primary italic">nos clients</span>
                    </h1>
                    <p className="text-base-content/50 font-bold uppercase tracking-widest text-xs md:text-sm max-w-2xl mx-auto">
                        Découvrez pourquoi des milliers de béninois font confiance à Vtout pour leurs achats quotidiens.
                    </p>
                </div>

                {/* Write review CTA */}
                <div className="flex justify-center mb-10">
                    <button
                        onClick={() => setShowReviewModal(true)}
                        className="flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/25 hover:brightness-110 transition-all active:scale-95"
                    >
                        <Pencil size={15} />
                        Écrire mon avis
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20" data-aos="fade-up" data-aos-delay="100">
                    {[
                        { label: "Avis Positifs", value: "2k+" },
                        { label: "Note Globale", value: "4.8/5" },
                        { label: "Clients Actifs", value: "10k+" },
                        { label: "Fiabilité", value: "99%" }
                    ].map((stat, i) => (stat.label && (
                        <div key={i} className="bg-base-100 p-6 rounded-[30px] shadow-sm border border-base-200 text-center">
                            <div className="text-2xl md:text-3xl font-black text-primary mb-1">{stat.value}</div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-base-content/40">{stat.label}</div>
                        </div>
                    )))}
                </div>

                {/* Reviews Masonry-like Grid */}
                <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                    {reviews.map((review, index) => (
                        <motion.div
                            key={review.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="break-inside-avoid bg-base-100 p-8 rounded-[40px] shadow-xl shadow-slate-200/50 border border-white hover:border-primary/20 transition-all group"
                        >
                            <div className="flex gap-1 mb-6">
                                {[...Array(5)].map((_, i) => (
                                    <Star 
                                        key={i} 
                                        size={16} 
                                        className={i < review.rating ? "fill-amber-400 text-amber-400" : "text-base-content/20"} 
                                    />
                                ))}
                            </div>

                            <div className="relative mb-8">
                                <Quote className="absolute -top-4 -left-4 text-base-content/10 group-hover:text-primary/5 transition-colors" size={48} />
                                <p className="relative text-base-content/80 font-medium leading-relaxed italic whitespace-pre-wrap">
                                    "{review.comment}"
                                </p>
                            </div>

                            <div className="flex items-center gap-4 pt-6 border-t border-base-200">
                                <div className="w-12 h-12 rounded-2xl bg-base-200 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                                    {(review.author?.avatar_url || review.user?.avatar_url) ? (
                                        <img src={review.author?.avatar_url || review.user?.avatar_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={20} className="text-base-content/40" />
                                    )}
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-base-content flex items-center gap-2">
                                        {review.author?.fullname || review.user?.fullname || "Client Vtout"}
                                        <CheckCircle size={14} className="text-emerald-500" />
                                    </h4>
                                    <p className="text-[10px] font-bold text-base-content/40 uppercase tracking-widest">Client Vérifié</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Call to action */}
                <div className="mt-20 text-center bg-primary rounded-[50px] p-12 md:p-20 text-white shadow-2xl shadow-primary/20 relative overflow-hidden" data-aos="zoom-in">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-base-100/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                    <div className="relative z-10 space-y-6">
                        <h2 className="text-3xl md:text-5xl font-black tracking-tighter">Prêt à vivre l'expérience Vtout ?</h2>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button
                                onClick={() => window.location.href = '/products-liste'}
                                className="bg-base-100 text-primary px-10 py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-neutral hover:text-white transition-all shadow-xl"
                            >
                                Commencer mes achats
                            </button>
                            <button
                                onClick={() => setShowReviewModal(true)}
                                className="flex items-center gap-2 bg-base-100/15 border border-white/30 text-white px-10 py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-base-200/25 transition-all"
                            >
                                <Pencil size={13} /> Laisser un avis
                            </button>
                        </div>
                    </div>
                </div>

                <PlatformReviewModal isOpen={showReviewModal} onClose={() => setShowReviewModal(false)} />
            </div>
        </div>
    );
};

export default PlatformReviews;
