import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/clerk-shim';
import { getMySupplierProfile, getMySupplierProductById } from '../services/supplierService';
import SupplierProductForm from '../components/Product/SupplierProductForm';
import { ShieldAlert, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const EditProductSupplier = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getToken } = useAuth();
    const [supplierStatus, setSupplierStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [product, setProduct] = useState(null);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const token = await getToken();
                if (!token) return;

                const [profile, productData] = await Promise.all([
                    getMySupplierProfile(token),
                    getMySupplierProductById(id, token)
                ]);

                setSupplierStatus(profile.status);

                if (!productData) {
                    toast.error("Produit introuvable");
                    navigate('/mes-produits');
                    return;
                }

                // Verify ownership (supplier_id match)
                if (productData.supplier_id !== profile.id) {
                    toast.error("Vous n'êtes pas autorisé à modifier ce produit.");
                    navigate('/mes-produits');
                    return;
                }

                setProduct(productData);

            } catch (err) {
                console.error('Fetch initial data error:', err);
                toast.error("Erreur lors de la récupération du produit.");
                navigate('/mes-produits');
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [getToken, id, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center font-black text-base-content/30 uppercase tracking-widest gap-4">
                <Loader2 className="animate-spin w-10 h-10 text-primary" />
                Chargement...
            </div>
        );
    }

    if (supplierStatus !== 'active') {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-base-200">
                <div className="max-w-md w-full bg-base-100 p-10 rounded-[3rem] shadow-2xl border border-base-300 text-center space-y-6">
                    <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-amber-100">
                        <ShieldAlert size={40} />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-black tracking-tighter text-base-content">Accès Refusé</h2>
                        <p className="text-sm font-bold text-base-content/40 leading-relaxed">
                            Votre compte est en cours d'approbation. Vous pourrez modifier vos produits dès que l'administrateur aura validé votre profil.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-full py-4 bg-neutral text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-primary transition-all"
                    >
                        Retour au Tableau de Bord
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-base-200 min-h-screen py-10 px-4">
            {product && (
                <SupplierProductForm
                    initialData={product}
                    onClose={() => navigate('/mes-produits')}
                />
            )}
        </div>
    );
};

export default EditProductSupplier;
