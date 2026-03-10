import React, { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { getOrderById } from "../../services/orderService";
import { createReview } from "../../services/reviewService";
import { uploadMultipleImages } from "../../services/uploadService";
import { Star, X, Upload, Package, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

export default function ReviewModal({ product: initialProduct = null, orderId, onClose, onSaved }) {
  const { getToken } = useAuth();
  const [product, setProduct] = useState(initialProduct);
  const [productsList, setProductsList] = useState([]);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [localFiles, setLocalFiles] = useState([]); // File objects
  const [previews, setPreviews] = useState([]);
  const [uploadedUrls, setUploadedUrls] = useState([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    // previews from selected files
    const urls = localFiles.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => {
      urls.forEach((u) => {
        try { URL.revokeObjectURL(u); } catch (e) { }
      });
    };
  }, [localFiles]);

  useEffect(() => {
    if (!orderId || initialProduct) return;
    let mounted = true;
    async function loadOrderProducts() {
      setLoadingProducts(true);
      try {
        const token = await getToken();
        const order = await getOrderById(orderId, token);
        if (order && order.items) {
          // Extraire les produits uniques des items de la commande
          const prods = order.items.map(item => ({
            id: item.product_id,
            name: item.product?.name || `Produit ${item.product_id}`,
            image_url: item.product?.images?.[0]?.image_url || null
          }));

          // Dédupliquer par ID produit
          const uniqueProds = Array.from(new Map(prods.map(p => [p.id, p])).values());
          if (mounted) setProductsList(uniqueProds);
        }
      } catch (err) {
        console.error("loadOrderProducts", err);
        toast.error("Impossible de charger les produits de la commande.");
      } finally {
        if (mounted) setLoadingProducts(false);
      }
    }

    loadOrderProducts();
    return () => { mounted = false; };
  }, [orderId, initialProduct, getToken]);

  async function uploadFiles(files) {
    if (!files || files.length === 0) return [];
    setUploading(true);
    try {
      const token = await getToken();
      const validFiles = Array.from(files).filter(f => f instanceof File);
      const urls = await uploadMultipleImages(validFiles, token);
      setUploadedUrls((prev) => [...prev, ...urls]);
      return urls;
    } catch (err) {
      console.error("Upload multiple error", err);
      toast.error("Erreur lors du téléchargement des images.");
      return [];
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    if (!orderId) return toast.error("OrderId manquant.");
    if (!product || !product.id) return toast.error("Veuillez sélectionner un produit.");
    if (!rating || rating < 1 || rating > 5) return toast.error("Donnez une note entre 1 et 5.");

    setSaving(true);
    try {
      const token = await getToken();

      let urls = [...uploadedUrls];
      if (localFiles.length > 0) {
        try {
          const uploaded = await uploadFiles(localFiles);
          urls = urls.concat(uploaded);
        } catch (uploadErr) {
          console.error("upload error", uploadErr);
          toast.error("Impossible d'uploader les images. L'avis sera enregistré sans images.");
          urls = [];
        }
      }

      const payload = {
        product_id: product.id,
        order_id: orderId,
        rating: Number(rating),
        title: title.trim() || null,
        body: body.trim() || "",
        images: urls.length ? urls : []
      };

      await createReview(payload, token);

      toast.success("Merci ! Votre avis a été ajouté.");
      if (onSaved) {
        try { await onSaved(); } catch (e) { console.warn("onSaved callback error", e); }
      }
      if (onClose) onClose();
    } catch (err) {
      console.error("save review error", err);
      const msg = err.response?.data?.error || err.message || "Erreur lors de l'enregistrement de l'avis.";
      toast.error(msg);
    } finally {
      setSaving(false);
      setLocalFiles([]);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex justify-center items-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-white"
      >
        {/* Header */}
        <div className="p-8 md:p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Laisser un <span className="text-slate-400">avis.</span></h3>
            <p className="text-sm font-bold text-slate-400 mt-1">Partagez votre expérience avec la communauté</p>
          </div>
          <button
            onClick={onClose}
            className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all shadow-sm hover:shadow-md"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 md:p-10 space-y-8 custom-scrollbar">
          {/* Product Selection / Info */}
          <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-4">
            {!initialProduct && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Sélectionner un produit</label>
                {loadingProducts ? (
                  <div className="flex items-center gap-2 text-primary font-bold animate-pulse">
                    <span className="loading loading-spinner loading-xs"></span> Chargement...
                  </div>
                ) : productsList.length === 0 ? (
                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 text-amber-700 text-xs font-bold">
                    Aucun produit trouvé pour cette commande.
                  </div>
                ) : (
                  <div className="relative">
                    <select
                      value={product?.id || ""}
                      onChange={(e) => {
                        const p = productsList.find(x => String(x.id) === String(e.target.value));
                        setProduct(p || null);
                      }}
                      className="w-full bg-white border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-900 appearance-none focus:border-primary outline-none transition-all cursor-pointer shadow-sm"
                    >
                      <option value="">-- Choisir un article --</option>
                      {productsList.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <Package size={18} />
                    </div>
                  </div>
                )}
              </div>
            )}

            {product && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm"
              >
                <div className="w-20 h-20 bg-slate-50 rounded-xl overflow-hidden p-2 flex-shrink-0 border border-slate-50">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-300">
                      <Package size={24} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest">Produit sélectionné</p>
                  <h4 className="text-lg font-black text-slate-900 tracking-tight truncate">{product.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <ShieldCheck size={14} className="text-emerald-500" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Achat vérifié</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Rating */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Note globale</label>
            <div className="flex items-center gap-3">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  onClick={() => setRating(s)}
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${rating >= s ? 'bg-amber-400 text-white shadow-lg shadow-amber-200' : 'bg-slate-50 text-slate-300 hover:bg-slate-100'}`}
                >
                  <Star size={24} fill={rating >= s ? "currentColor" : "none"} strokeWidth={rating >= s ? 0 : 2} />
                </button>
              ))}
              <span className="ml-2 font-black text-slate-900 text-lg">
                {rating}/5 <span className="text-slate-400 text-sm font-bold ml-1">— {['Très mauvais', 'Mauvais', 'Moyen', 'Très bien', 'Excellent'][rating - 1]}</span>
              </span>
            </div>
          </div>

          {/* Title & Body */}
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Titre de votre avis</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Excellent produit, très satisfait !"
                className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 font-bold text-slate-700 focus:bg-white focus:border-primary outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Votre commentaire</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Dites-nous ce que vous avez aimé ou ce qui peut être amélioré..."
                className="w-full bg-slate-50 border-2 border-slate-50 rounded-3xl px-6 py-4 font-medium text-slate-600 focus:bg-white focus:border-primary outline-none transition-all min-h-[150px] resize-none"
              />
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Photos (Optionnel)</label>
            <div className="flex flex-wrap gap-4">
              <label className="w-24 h-24 rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-primary hover:text-primary cursor-pointer transition-all bg-slate-50 group">
                <Upload size={20} className="group-hover:-translate-y-1 transition-transform" />
                <span className="text-[8px] font-black uppercase mt-2">Ajouter</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setLocalFiles(Array.from(e.target.files || []))}
                  className="hidden"
                />
              </label>

              {previews.map((u, i) => (
                <div key={i} className="w-24 h-24 rounded-[2rem] overflow-hidden border border-slate-100 bg-white relative group shadow-sm">
                  <img src={u} alt={`preview-${i}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button onClick={() => setLocalFiles(prev => prev.filter((_, idx) => idx !== i))} className="text-slate-900">
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}

              {uploadedUrls.map((u, i) => (
                <div key={`u-${i}`} className="w-24 h-24 rounded-[2rem] overflow-hidden border border-emerald-100 bg-white relative shadow-sm">
                  <img src={u} alt={`uploaded-${i}`} className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg">
                    <ShieldCheck size={10} />
                  </div>
                </div>
              ))}
            </div>
            {(saving || uploading) && (
              <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest">
                <span className="loading loading-spinner loading-xs"></span> Étape: {uploading ? 'Upload des images...' : 'Enregistrement de l\'avis...'}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 md:p-10 border-t border-slate-50 bg-slate-50/50 flex flex-col sm:flex-row gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-8 py-4 bg-white border border-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 hover:text-slate-900 hover:border-slate-900 transition-all"
            disabled={saving || uploading}
          >
            Annuler
          </button>
          <button
            onClick={save}
            className="flex-[2] px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-900/10 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
            disabled={saving || uploading || !product || !rating}
          >
            {saving ? "Finalisation..." : (uploading ? "Upload en cours..." : "Publier mon avis")}
          </button>
        </div>
      </motion.div>
    </div>
  );
}