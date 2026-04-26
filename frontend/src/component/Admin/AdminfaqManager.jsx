import React, { useEffect, useState } from "react";
import { useAuth } from "../../lib/clerk-shim";
import { getFaqs, createFaq, updateFaq, deleteFaq as apiDeleteFaq } from "../../services/contentService";
import toast from "react-hot-toast";

export default function AdminFaqManager() {
  const { getToken } = useAuth();
  const [faqs, setFaqs] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ question: "", answer: "" });

  useEffect(() => {
    loadFaqs();
  }, []);

  async function loadFaqs() {
    try {
      const data = await getFaqs();
      setFaqs(data);
    } catch (err) {
      console.error(err);
      toast.error("Erreur de chargement");
    }
  }

  async function saveFaq() {
    if (!form.question || !form.answer) return toast.error("Remplis tous les champs");
    try {
      const token = await getToken();
      if (editing) {
        await updateFaq(editing.id, form, token);
        toast.success("FAQ mise à jour !");
      } else {
        await createFaq(form, token);
        toast.success("FAQ ajoutée !");
      }
      setForm({ question: "", answer: "" });
      setEditing(null);
      loadFaqs();
    } catch (err) {
      toast.error("Erreur d'enregistrement");
    }
  }

  async function deleteFaq(id) {
    if (!window.confirm("Supprimer cette FAQ ?")) return;
    try {
      const token = await getToken();
      await apiDeleteFaq(id, token);
      toast.success("Supprimée !");
      loadFaqs();
    } catch (err) {
      toast.error("Erreur de suppression");
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Gestion des FAQs</h2>

      <div className="mb-4 space-y-2">
        <input
          type="text"
          placeholder="Question"
          value={form.question}
          onChange={(e) => setForm({ ...form, question: e.target.value })}
          className="input input-bordered w-full"
        />
        <textarea
          placeholder="Réponse"
          value={form.answer}
          onChange={(e) => setForm({ ...form, answer: e.target.value })}
          className="textarea textarea-bordered w-full"
        />
        <button className="btn btn-primary w-full" onClick={saveFaq}>
          {editing ? "Mettre à jour" : "Ajouter"}
        </button>
      </div>

      <div className="divider"></div>

      <ul className="space-y-3">
        {faqs.map((faq) => (
          <li key={faq.id} className="border rounded-lg p-3">
            <div className="font-medium">{faq.question}</div>
            <div className="text-sm text-gray-600">{faq.answer}</div>
            <div className="flex gap-2 mt-2">
              <button className="btn btn-xs btn-outline" onClick={() => { setEditing(faq); setForm({ question: faq.question, answer: faq.answer }); }}>✏️</button>
              <button className="btn btn-xs btn-error" onClick={() => deleteFaq(faq.id)}>🗑️</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
