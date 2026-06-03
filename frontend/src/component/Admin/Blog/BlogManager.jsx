import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { 
  Plus, Search, Edit2, Trash2, Eye, 
  CheckCircle, XCircle, Calendar, Tag,
  PenTool, Image as ImageIcon, FileText, 
  Settings, Save, X, Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const BlogManager = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isNewCategory, setIsNewCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    content: "",
    image_url: "",
    category: "Général",
    tags: "",
    meta_title: "",
    meta_description: "",
    is_published: false
  });

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

  const fetchBlogs = async () => {
    try {
      const res = await axios.get(`${API_URL}/blogs?publishedOnly=false`);
      setBlogs(res.data);
    } catch (err) {
      toast.error("Erreur lors du chargement des articles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleOpenModal = (blog = null) => {
    if (blog) {
      setEditingBlog(blog);
      setFormData({
        title: blog.title,
        summary: blog.summary,
        content: blog.content,
        image_url: blog.image_url || "",
        category: blog.category,
        tags: blog.tags || "",
        meta_title: blog.meta_title || "",
        meta_description: blog.meta_description || "",
        is_published: blog.is_published
      });
    } else {
      setEditingBlog(null);
      setFormData({
        title: "",
        summary: "",
        content: "",
        image_url: "",
        category: "Général",
        tags: "",
        meta_title: "",
        meta_description: "",
        is_published: false
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem("token"); // Better Auth token logic should be here
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (editingBlog) {
        await axios.put(`${API_URL}/blogs/${editingBlog.id}`, formData, config);
        toast.success("Article mis à jour !");
      } else {
        await axios.post(`${API_URL}/blogs`, formData, config);
        toast.success("Article créé avec succès !");
      }
      setShowModal(false);
      fetchBlogs();
    } catch (err) {
      toast.error(err.response?.data?.error || "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cet article définitivement ?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/blogs/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Article supprimé");
      fetchBlogs();
    } catch (err) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append("image", file);

    setUploading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${API_URL}/upload/single`, formDataUpload, {
        headers: { 
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`
        }
      });
      setFormData({ ...formData, image_url: res.data.url });
      toast.success("Image téléchargée !");
    } catch (err) {
      toast.error("Erreur lors de l'upload");
    } finally {
      setUploading(false);
    }
  };

  const categories = [...new Set(blogs.map(b => b.category)), "Mode", "Électronique", "Maison", "Lifestyle", "Actualités", "Général"];

  const filteredBlogs = blogs.filter(b => 
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-slate-900">Le Mag Vtout</h1>
          <p className="text-slate-500 font-medium">Gérez vos articles, actualités et conseils SEO.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-6 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-slate-900 transition-all shadow-xl shadow-indigo-200"
        >
          <Plus size={20} /> Nouvel Article
        </button>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Articles Total", value: blogs.length, icon: <FileText className="text-indigo-500" />, bg: "bg-indigo-50" },
          { label: "Publiés", value: blogs.filter(b => b.is_published).length, icon: <CheckCircle className="text-emerald-500" />, bg: "bg-emerald-50" },
          { label: "Brouillons", value: blogs.filter(b => !b.is_published).length, icon: <Calendar className="text-amber-500" />, bg: "bg-amber-50" },
          { label: "Catégories", value: new Set(blogs.map(b => b.category)).size, icon: <Tag className="text-violet-500" />, bg: "bg-violet-50" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center gap-4">
            <div className={`w-12 h-12 ${stat.bg} rounded-2xl flex items-center justify-center`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search & List */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200/50 border border-slate-100">
        <div className="flex items-center gap-4 bg-slate-50 rounded-2xl px-6 py-4 mb-8 border border-slate-100">
          <Search size={20} className="text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher un titre, une catégorie..."
            className="bg-transparent border-none focus:ring-0 text-sm font-bold w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="py-20 text-center animate-pulse font-black text-slate-300 uppercase tracking-widest">
            Chargement des articles...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-slate-50">
                  <th className="pb-4 text-[10px] font-black uppercase text-slate-400 tracking-widest px-4">Article</th>
                  <th className="pb-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Statut</th>
                  <th className="pb-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Catégorie</th>
                  <th className="pb-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Date</th>
                  <th className="pb-4 text-right pr-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredBlogs.map((blog) => (
                  <tr key={blog.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="py-5 px-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-slate-100 rounded-xl overflow-hidden shrink-0">
                          <img src={blog.image_url || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop"} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">{blog.title}</p>
                          <p className="text-[10px] font-bold text-slate-400 tracking-tighter">slug: {blog.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-5">
                      {blog.is_published ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                          <CheckCircle size={12} /> Publié
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                          <XCircle size={12} /> Brouillon
                        </span>
                      )}
                    </td>
                    <td className="py-5">
                      <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">{blog.category}</span>
                    </td>
                    <td className="py-5">
                      <p className="text-xs font-bold text-slate-500">
                        {new Date(blog.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </td>
                    <td className="py-5 text-right pr-4">
                      <div className="flex items-center justify-end gap-2">
                        <a href={`/blog/${blog.slug}`} target="_blank" rel="noreferrer" className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                          <Eye size={18} />
                        </a>
                        <button onClick={() => handleOpenModal(blog)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                          <Edit2 size={18} />
                        </button>
                        <button onClick={() => handleDelete(blog.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Editor Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            ></motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-5xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-white sticky top-0 z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                    <PenTool size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black tracking-tighter text-slate-900">
                      {editingBlog ? "Modifier l'article" : "Nouvel Article"}
                    </h2>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Éditeur Vtout Mag</p>
                  </div>
                </div>
                <button onClick={() => setShowModal(false)} className="p-3 hover:bg-slate-50 rounded-2xl text-slate-400 transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left Column: Content */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Titre de l'article</label>
                      <input
                        required
                        className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 font-bold text-lg focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all"
                        placeholder="Ex: 5 astuces pour choisir sa smartwatch..."
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Résumé (Intro)</label>
                      <textarea
                        required
                        rows="3"
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-6 font-medium text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all resize-none"
                        placeholder="Court résumé accrocheur pour la liste..."
                        value={formData.summary}
                        onChange={(e) => setFormData({...formData, summary: e.target.value})}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between ml-2">
                         <label className="text-[10px] font-black uppercase text-slate-400">Contenu (HTML supporté)</label>
                         <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded italic">Pro-tip: Utilisez des balises h2, p, img...</span>
                      </div>
                      <textarea
                        required
                        className="w-full min-h-[400px] bg-slate-50 border border-slate-100 rounded-2xl p-6 font-mono text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all"
                        placeholder="Écrivez votre article ici..."
                        value={formData.content}
                        onChange={(e) => setFormData({...formData, content: e.target.value})}
                      />
                    </div>
                  </div>

                  {/* Right Column: Settings & SEO */}
                  <div className="space-y-8">
                    {/* Publication */}
                    <div className="bg-slate-50 rounded-[2rem] p-6 border border-slate-100 space-y-6">
                      <div className="flex items-center justify-between">
                         <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Publication</span>
                         <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="sr-only peer" 
                              checked={formData.is_published}
                              onChange={(e) => setFormData({...formData, is_published: e.target.checked})}
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                         </label>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-black uppercase text-slate-400">Catégorie</label>
                          <button 
                            type="button"
                            onClick={() => setIsNewCategory(!isNewCategory)}
                            className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg uppercase"
                          >
                            {isNewCategory ? "Sélectionner" : "+ Nouvelle"}
                          </button>
                        </div>
                        
                        {isNewCategory ? (
                          <input 
                            className="w-full h-12 bg-white border border-slate-200 rounded-xl px-4 font-bold text-xs outline-none focus:border-indigo-500 transition-all"
                            placeholder="Saisir la nouvelle catégorie..."
                            value={formData.category}
                            onChange={(e) => setFormData({...formData, category: e.target.value})}
                          />
                        ) : (
                          <select 
                            className="w-full h-12 bg-white border border-slate-200 rounded-xl px-4 font-bold text-xs outline-none focus:border-indigo-500 transition-all"
                            value={formData.category}
                            onChange={(e) => setFormData({...formData, category: e.target.value})}
                          >
                            {categories.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400">Image de couverture</label>
                        <div className="flex flex-col gap-3">
                          {formData.image_url && (
                            <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-slate-200 group">
                              <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                              <button 
                                type="button"
                                onClick={() => setFormData({...formData, image_url: ""})}
                                className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          )}
                          <div className="relative">
                            <label className={`
                              flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-2xl cursor-pointer transition-all
                              ${uploading ? "bg-slate-50 border-slate-200" : "bg-white border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/30"}
                            `}>
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                {uploading ? (
                                  <Loader2 size={24} className="text-indigo-500 animate-spin" />
                                ) : (
                                  <>
                                    <Plus size={20} className="text-slate-400 mb-2" />
                                    <p className="text-[10px] font-black text-slate-400 uppercase">Importer une image</p>
                                  </>
                                )}
                              </div>
                              <input 
                                type="file" 
                                className="hidden" 
                                accept="image/*"
                                onChange={handleImageUpload}
                                disabled={uploading}
                              />
                            </label>
                          </div>
                          <div className="relative">
                            <input 
                              className="w-full h-10 bg-slate-50 border border-slate-100 rounded-xl px-4 pr-10 font-bold text-[10px] outline-none focus:border-indigo-500 transition-all"
                              placeholder="Ou coller un lien direct..."
                              value={formData.image_url}
                              onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                            />
                            <ImageIcon size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300" />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400">Tags (séparés par virgule)</label>
                        <input 
                          className="w-full h-12 bg-white border border-slate-200 rounded-xl px-4 font-bold text-xs outline-none focus:border-indigo-500 transition-all"
                          placeholder="smartwatch, tech, promo..."
                          value={formData.tags}
                          onChange={(e) => setFormData({...formData, tags: e.target.value})}
                        />
                      </div>
                    </div>

                    {/* SEO Settings */}
                    <div className="bg-indigo-50/50 rounded-[2rem] p-6 border border-indigo-100 space-y-6">
                      <div className="flex items-center gap-2">
                         <Settings size={16} className="text-indigo-500" />
                         <span className="text-xs font-black text-indigo-900 uppercase tracking-widest">Optimisation SEO</span>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-indigo-400">Meta Title</label>
                        <input 
                          className="w-full h-12 bg-white border border-indigo-100 rounded-xl px-4 font-bold text-xs outline-none focus:border-indigo-500 transition-all"
                          placeholder="Titre Google..."
                          value={formData.meta_title}
                          onChange={(e) => setFormData({...formData, meta_title: e.target.value})}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-indigo-400">Meta Description</label>
                        <textarea 
                          rows="4"
                          className="w-full bg-white border border-indigo-100 rounded-xl p-4 font-medium text-xs outline-none focus:border-indigo-500 transition-all resize-none"
                          placeholder="Description pour les résultats de recherche Google..."
                          value={formData.meta_description}
                          onChange={(e) => setFormData({...formData, meta_description: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </form>

              <div className="p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-4 sticky bottom-0 z-10">
                <button 
                  type="button" onClick={() => setShowModal(false)}
                  className="px-8 py-4 text-slate-500 font-black text-sm hover:text-slate-900 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={saving}
                  className="flex items-center gap-3 px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-slate-900 transition-all shadow-xl shadow-indigo-200 disabled:opacity-50"
                >
                  {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                  {editingBlog ? "Enregistrer les modifications" : "Publier l'article"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BlogManager;
