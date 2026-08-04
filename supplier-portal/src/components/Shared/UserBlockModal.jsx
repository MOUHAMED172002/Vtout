import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, X, UserCheck, ArrowRight } from 'lucide-react';

const UserBlockModal = ({ isOpen, onClose, onAction }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           onClick={onClose}
           className="absolute inset-0 bg-neutral/60 backdrop-blur-md"
        />

        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-md bg-base-100 rounded-[2.5rem] shadow-2xl overflow-hidden border border-base-300"
        >
          <div className="h-32 bg-emerald-600 flex items-center justify-center relative">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-white backdrop-blur-xl border border-white/10">
              <ShieldAlert size={32} />
            </div>
          </div>

          <div className="p-8 pt-10 text-center space-y-6">
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-base-content tracking-tighter">Accès Marchand Uniquement</h3>
              <p className="text-emerald-600 font-bold uppercase tracking-widest text-[10px]">Espace Professionnel</p>
            </div>

            <p className="text-sm font-medium text-base-content/50 leading-relaxed px-4">
              Ce portail est réservé aux vendeurs professionnels. Votre compte actuel est un compte <span className="font-bold text-base-content uppercase">Client/Admin</span>. Pour accéder à cet espace, vous devez activer votre profil marchand.
            </p>

            <div className="grid grid-cols-1 gap-4 pt-4">
              <button
                onClick={onAction}
                className="group w-full py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:brightness-90 transition-all flex items-center justify-center gap-3 shadow-xl shadow-emerald-200"
              >
                <UserCheck size={18} />
                Activer Profil Marchand
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button
                onClick={onClose}
                className="w-full py-4 bg-base-200 text-base-content/40 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-base-300 transition-all"
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

export default UserBlockModal;
