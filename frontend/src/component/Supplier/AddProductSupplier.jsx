import React from 'react';
import { useNavigate } from 'react-router-dom';
import AddProductModal from '../Admin/Product/AddProductModal';
import { useProfile } from '../context/useProfile';
import { ShieldAlert, Clock, ArrowLeft } from 'lucide-react';
import { useAppConfig } from '../context/ConfigContext';

const AddProductSupplier = () => {
    const navigate = useNavigate();
    const { user: profile, loading: profileLoading } = useProfile();
    const { getConfig } = useAppConfig();

    if (profileLoading) {
        return (
            <div className="h-screen flex items-center justify-center bg-slate-50">
                <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
        );
    }

    if (profile?.role === 'fournisseur' && profile?.status !== 'active') {
        return (
            <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-2xl border border-slate-200 text-center space-y-6">
                    <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-amber-500">
                        <ShieldAlert size={40} />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">{getConfig('supplier_add_product_blocked_title', 'Accès Restreint')}</h2>
                        <p className="text-sm font-bold text-slate-400 leading-relaxed italic">
                            {getConfig('supplier_add_product_blocked_subtitle', 'Votre compte fournisseur est actuellement en attente d\'approbation ou suspendu.')}
                        </p>
                    </div>
                    <p className="text-xs font-medium text-slate-500">
                        {getConfig('supplier_add_product_blocked_message', 'L\'administrateur doit valider votre profil avant que vous ne puissiez commencer à vendre vos produits sur la plateforme.')}
                    </p>
                    <button 
                        onClick={() => navigate('/fournisseur/dashboard')}
                        className="btn btn-block bg-slate-900 border-none text-white rounded-2xl h-14 font-black uppercase tracking-widest text-[10px] hover:bg-primary transition-all flex items-center gap-2"
                    >
                        <ArrowLeft size={16} /> {getConfig('supplier_add_product_blocked_button', 'Retour au Dashboard')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 min-h-screen font-sans">
            <AddProductModal
                isSupplier={true}
                layout="page"
                onClose={() => navigate('/fournisseur/dashboard')}
            />
        </div>
    );
};

export default AddProductSupplier;
