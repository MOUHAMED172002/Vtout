import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, X, UserPlus, ArrowRight, UserCheck } from 'lucide-react';

const SupplierBlockModal = ({ 
  isOpen, 
  onClose, 
  onAction, 
  title = "Compte Marchand Détecté",
  subtitle = "Espace Client Réservé",
  message = "En tant que fournisseur, vous utilisez un compte professionnel. Pour une expérience d'achat optimale sur la boutique, veuillez créer un Nouveau Compte Client.",
  actionText = "Créer un compte client",
  icon: Icon = ShieldAlert,
  variant = "primary"
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           onClick={onClose}
           className="absolute inset-0 bg-neutral/60 backdrop-blur-md"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-sm bg-base-100 rounded-[2.5rem] shadow-2xl overflow-hidden border border-base-200"
        >
          {/* Header/Banner */}
          <div className={`h-32 ${variant === 'primary' ? 'bg-neutral' : 'bg-emerald-600'} flex items-center justify-center relative`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-base-100/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
            <div className="w-16 h-16 bg-base-100/10 rounded-2xl flex items-center justify-center text-white backdrop-blur-xl border border-white/10">
              <Icon size={32} />
            </div>
          </div>

          <div className="p-8 pt-10 text-center space-y-6">
            <div className="space-y-2">
              <h3 className="text-xl font-black text-base-content tracking-tighter">{title}</h3>
              <p className={`${variant === 'primary' ? 'text-primary' : 'text-emerald-600'} font-bold uppercase tracking-widest text-[10px]`}>{subtitle}</p>
            </div>

            <p className="text-xs font-medium text-base-content/50 leading-relaxed px-4">
              {message}
            </p>

            <div className="grid grid-cols-1 gap-3 pt-4">
              <button
                onClick={onAction}
                className={`group w-full py-4 ${variant === 'primary' ? 'bg-primary' : 'bg-emerald-600'} text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-neutral transition-all flex items-center justify-center gap-3 shadow-xl ${variant === 'primary' ? 'shadow-primary/20' : 'shadow-emerald-200'}`}
              >
                <UserPlus size={18} />
                {actionText}
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button
                onClick={onClose}
                className="w-full py-4 bg-base-200 text-base-content/40 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-base-200 transition-all"
              >
                Me déconnecter
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SupplierBlockModal;
