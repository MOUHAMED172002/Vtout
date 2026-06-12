import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { Reorder } from 'framer-motion';
import { GripVertical, X, Save } from 'lucide-react';
import { reorderSubcategories } from '../../../services/productService';
import { useAuth } from '../../../lib/AuthHooks';
import toast from 'react-hot-toast';

export default function SubcategoryOrderModal({ parent, onClose, onSaved }) {
  const { getToken } = useAuth();
  const [items, setItems] = useState(
    [...(parent.children || [])].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = await getToken();
      await reorderSubcategories(
        items.map((item, i) => ({ id: item.id, display_order: i })),
        token
      );
      toast.success('Ordre sauvegardé');
      onSaved();
      onClose();
    } catch (err) {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const portalTarget = document.getElementById('modal-root') || document.body;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-neutral/80 backdrop-blur-xl"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-base-100 w-full max-w-md rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border border-base-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-8 border-b border-base-200">
          <div>
            <h2 className="text-xl font-black text-base-content tracking-tight">
              Ordonner les sous-catégories
            </h2>
            <p className="text-[10px] font-black uppercase tracking-widest text-primary mt-1">
              {parent.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-2xl bg-base-200 flex items-center justify-center text-base-content/40 hover:bg-rose-50 hover:text-rose-500 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 max-h-[60vh]">
          <Reorder.Group axis="y" values={items} onReorder={setItems} className="space-y-2">
            {items.map((item) => (
              <Reorder.Item key={item.id} value={item}>
                <div className="flex items-center gap-4 p-4 bg-base-200 rounded-2xl cursor-grab active:cursor-grabbing border border-base-200 hover:border-primary/20 transition-all">
                  <GripVertical size={16} className="text-base-content/30 shrink-0" />
                  <span className="text-sm font-bold text-base-content flex-1">{item.name}</span>
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </div>

        <div className="p-6 border-t border-base-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl bg-base-200 text-base-content/60 font-black text-xs uppercase tracking-widest hover:bg-base-300 transition-all"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-3 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-neutral transition-all disabled:opacity-60"
          >
            <Save size={14} />
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </motion.div>
    </div>,
    portalTarget
  );
}
