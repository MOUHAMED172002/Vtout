import { useState } from "react";
import { Reorder, motion, AnimatePresence } from "framer-motion";
import { GripVertical, X, Save, Layers } from "lucide-react";
import toast from "react-hot-toast";
import { reorderSubcategories } from "../../../services/productService";
import { useAuth } from "../../../lib/AuthHooks";

export default function SubcategoryOrderModal({ parent, onClose, onSaved }) {
  const { getToken } = useAuth();
  const [items, setItems] = useState(
    [...(parent.children || [])].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = await getToken();
      const orderedIds = items.map((item, index) => ({ id: item.id, display_order: index }));
      await reorderSubcategories(orderedIds, token);
      toast.success("Ordre sauvegardé");
      onSaved();
      onClose();
    } catch {
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 22, stiffness: 300 }}
          className="bg-base-100 rounded-[2.5rem] shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-8 pt-8 pb-6 border-b border-base-200">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
                <Layers size={12} /> Sous-catégories
              </div>
              <h2 className="text-2xl font-black text-base-content">{parent.name}</h2>
              <p className="text-xs text-base-content/40 font-bold">Glissez-déposez pour réorganiser</p>
            </div>
            <button
              onClick={onClose}
              className="p-3 hover:bg-base-200 rounded-2xl transition-colors text-base-content/40 hover:text-base-content"
            >
              <X size={20} />
            </button>
          </div>

          {/* Draggable list */}
          <div className="overflow-y-auto flex-1 px-6 py-4">
            <Reorder.Group axis="y" values={items} onReorder={setItems} className="space-y-2">
              {items.map((item) => (
                <Reorder.Item
                  key={item.id}
                  value={item}
                  className="cursor-grab active:cursor-grabbing"
                >
                  <motion.div
                    layout
                    whileDrag={{ scale: 1.02, boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}
                    className="flex items-center gap-4 bg-base-200 hover:bg-base-300 rounded-2xl px-5 py-4 transition-colors select-none"
                  >
                    <GripVertical size={18} className="text-base-content/30 shrink-0" />
                    <span className="text-sm font-black text-base-content flex-1">{item.name}</span>
                    {item.icon && (
                      <span className="text-xl shrink-0">{item.icon}</span>
                    )}
                  </motion.div>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-8 py-6 border-t border-base-200">
            <button
              onClick={onClose}
              className="btn btn-ghost rounded-2xl px-6 font-black"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn btn-primary rounded-2xl px-8 font-black gap-2 shadow-lg shadow-primary/20"
            >
              <Save size={16} />
              {saving ? "Sauvegarde..." : "Sauvegarder l'ordre"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
