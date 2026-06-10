import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, Send, CheckCircle2, ShoppingBag } from 'lucide-react';
import { useAuth } from '../../lib/AuthHooks';
import { createPlatformReview } from '../../services/contentService';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

export default function PlatformReviewModal({ isOpen, onClose }) {
  const { getToken, isSignedIn } = useAuth();
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) { toast.error('Sélectionnez une note'); return; }
    if (comment.trim().length < 10) { toast.error('Commentaire trop court (10 caractères min.)'); return; }

    setSubmitting(true);
    try {
      const token = await getToken();
      await createPlatformReview({ rating, comment: comment.trim() }, token);
      setSubmitted(true);
    } catch {
      toast.error("Erreur lors de l'envoi");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setHovered(0);
    setComment('');
    setSubmitted(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[999] flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" />

          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 24, stiffness: 300 }}
            className="relative bg-white rounded-[2.5rem] shadow-2xl shadow-slate-900/20 w-full max-w-md overflow-hidden"
          >
            {/* Close */}
            <button
              onClick={handleClose}
              className="absolute top-5 right-5 z-10 w-9 h-9 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors text-slate-500"
            >
              <X size={16} />
            </button>

            <AnimatePresence mode="wait">
              {submitted ? (
                /* ── Success state ── */
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center text-center px-10 py-16 gap-5"
                >
                  <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center shadow-lg shadow-emerald-100">
                    <CheckCircle2 size={40} className="text-emerald-500" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Merci pour votre avis !</h3>
                    <p className="text-slate-500 font-medium text-sm max-w-xs">
                      Votre témoignage aide des milliers de béninois à découvrir Vtout.
                    </p>
                  </div>
                  <button
                    onClick={handleClose}
                    className="mt-2 px-10 py-3.5 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-primary/20"
                  >
                    Fermer
                  </button>
                </motion.div>
              ) : (
                /* ── Form state ── */
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {/* Header gradient */}
                  <div className="bg-gradient-to-br from-primary to-orange-400 px-10 pt-10 pb-8">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
                      <ShoppingBag size={22} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-black text-white tracking-tight leading-tight">
                      Partagez votre<br />expérience Vtout
                    </h2>
                    <p className="text-orange-100 text-xs font-bold mt-2">
                      Votre avis est visible sur la page Témoignages
                    </p>
                  </div>

                  <div className="px-10 py-8 space-y-6">
                    {!isSignedIn ? (
                      <div className="text-center py-4 space-y-3">
                        <p className="text-slate-600 font-bold text-sm">Connectez-vous pour laisser un avis.</p>
                        <Link
                          to="/auth/connexion"
                          onClick={handleClose}
                          className="inline-block px-8 py-3 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:brightness-110 transition-all"
                        >
                          Se connecter
                        </Link>
                      </div>
                    ) : (
                      <>
                        {/* Star rating */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            Votre note
                          </label>
                          <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHovered(star)}
                                onMouseLeave={() => setHovered(0)}
                                className="transition-transform hover:scale-110 active:scale-95"
                              >
                                <Star
                                  size={32}
                                  className={`transition-colors ${
                                    star <= (hovered || rating)
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'text-slate-200 fill-slate-100'
                                  }`}
                                />
                              </button>
                            ))}
                            {rating > 0 && (
                              <span className="ml-1 text-xs font-black text-slate-400">
                                {['', 'Décevant', 'Passable', 'Bien', 'Très bien', 'Excellent !'][rating]}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Comment */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            Votre commentaire
                          </label>
                          <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={4}
                            maxLength={500}
                            placeholder="Dites-nous ce que vous pensez de Vtout : la livraison, les produits, le service client..."
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-medium text-slate-700 placeholder-slate-300 focus:outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/10 resize-none transition-all"
                          />
                          <p className="text-right text-[10px] text-slate-300 font-bold">{comment.length}/500</p>
                        </div>

                        {/* Submit */}
                        <button
                          onClick={handleSubmit}
                          disabled={submitting || rating === 0}
                          className="w-full py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                        >
                          {submitting
                            ? <span className="loading loading-spinner loading-xs" />
                            : <Send size={14} />}
                          Publier mon avis
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
