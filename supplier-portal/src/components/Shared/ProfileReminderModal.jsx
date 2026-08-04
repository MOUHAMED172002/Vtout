import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, ArrowRight, Store, MapPin, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProfileReminderModal = ({ isOpen, onClose }) => {
    const navigate = useNavigate();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                className="absolute inset-0 bg-neutral/60 backdrop-blur-md"
            />
            
            <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }} 
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="bg-base-100 w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden"
            >
                {/* Header Decoration */}
                <div className="h-2 bg-gradient-to-r from-amber-400 to-orange-500" />
                
                <div className="p-10 space-y-8">
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-3xl flex items-center justify-center shadow-inner">
                            <AlertCircle size={40} strokeWidth={2.5} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-base-content tracking-tighter">Boutique Incomplète</h3>
                            <p className="text-sm font-bold text-base-content/50 leading-relaxed px-4">
                                Pour commencer à vendre sur Vtout, vous devez configurer au moins une boutique avec une adresse et un contact valides.
                            </p>
                        </div>
                    </div>

                    <div className="bg-base-200 rounded-2xl p-6 space-y-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-base-content/40 mb-2">Informations requises :</p>
                        <div className="flex items-center gap-4 text-base-content/70">
                            <div className="w-8 h-8 rounded-lg bg-base-100 shadow-sm flex items-center justify-center text-primary">
                                <Store size={16} />
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest">Nom de la boutique</span>
                        </div>
                        <div className="flex items-center gap-4 text-base-content/70">
                            <div className="w-8 h-8 rounded-lg bg-base-100 shadow-sm flex items-center justify-center text-primary">
                                <Phone size={16} />
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest">Numéro de téléphone</span>
                        </div>
                        <div className="flex items-center gap-4 text-base-content/70">
                            <div className="w-8 h-8 rounded-lg bg-base-100 shadow-sm flex items-center justify-center text-primary">
                                <MapPin size={16} />
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest">Localisation précise</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button 
                            onClick={() => {
                                navigate('/mes-boutiques');
                                onClose();
                            }}
                            className="w-full py-5 bg-neutral text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:bg-primary transition-all flex items-center justify-center gap-3"
                        >
                            Configurer ma boutique <ArrowRight size={18} />
                        </button>
                        <button 
                            onClick={onClose}
                            className="w-full py-4 text-base-content/40 font-bold text-[10px] uppercase tracking-widest hover:text-base-content/70 transition-all"
                        >
                            Continuer vers le tableau de bord
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ProfileReminderModal;
