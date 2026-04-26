import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/clerk-shim';
import { getMySupplierProfile } from '../services/supplierService';
import SupplierProductForm from '../components/Product/SupplierProductForm';
import { Loader2, ShieldAlert } from 'lucide-react';

const AddProductSupplier = () => {
    const navigate = useNavigate();
    const { getToken } = useAuth();
    const [supplierStatus, setSupplierStatus] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const token = await getToken();
                if (!token) return;

                const profile = await getMySupplierProfile(token);
                setSupplierStatus(profile.status);
            } catch (err) {
                console.error('Check status error:', err);
                navigate('/dashboard');
            } finally {
                setLoading(false);
            }
        };
        checkStatus();
    }, [getToken, navigate]);

    if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-slate-300 uppercase tracking-widest animate-pulse">Vérification de vos accès...</div>;

    if (supplierStatus !== 'active') {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
                <div className="max-w-md w-full bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100 text-center space-y-6">
                    <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-amber-100">
                        <ShieldAlert size={40} />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-black tracking-tighter text-slate-900">Accès Refusé</h2>
                        <p className="text-sm font-bold text-slate-400 leading-relaxed">
                            Votre compte est en cours d'approbation. Vous pourrez ajouter des produits dès que l'administrateur aura validé votre profil.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-primary transition-all"
                    >
                        Retour au Tableau de Bord
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 min-h-screen py-10 px-4">
            <SupplierProductForm
                onClose={() => navigate('/dashboard')}
            />
        </div>
    );
};

export default AddProductSupplier;
