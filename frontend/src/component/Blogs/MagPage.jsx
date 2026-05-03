import React, { useState } from 'react';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import Blogs from './Blogs';
import { motion } from 'framer-motion';
import api from '../../services/api';
import toast from 'react-hot-toast';

const MagPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Veuillez entrer une adresse email");
    
    setLoading(true);
    try {
      await api.post('/content/newsletter', { email });
      toast.success("Merci ! Vous êtes bien inscrit à la newsletter.");
      setEmail('');
    } catch (error) {
      toast.error(error.response?.data?.error || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      {/* Header Mag */}
      <div className="bg-white pt-32 pb-20 border-b border-slate-100">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 bg-indigo-50 px-6 py-2 rounded-full">
              L'univers Vtout
            </span>
            <h1 className="text-5xl md:text-7xl font-black tracking-tightest text-slate-900">
              Vtout <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-orange-500">Mag.</span>
            </h1>
            <p className="text-slate-500 font-medium max-w-2xl mx-auto text-lg leading-relaxed">
              Retrouvez nos derniers conseils, tendances mode, guides high-tech et actualités pour mieux consommer.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Blog List Section */}
      <div className="max-w-[1400px] mx-auto py-12">
         <Blogs />
      </div>

      {/* Newsletter / CTA */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 pb-24">
        <div className="bg-indigo-600 rounded-[3rem] p-12 md:p-20 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          <div className="relative z-10 space-y-6">
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter">Ne ratez aucune tendance.</h2>
            <p className="text-indigo-100 font-medium text-lg max-w-xl mx-auto">
              Inscrivez-vous à notre newsletter pour recevoir les meilleurs articles directement dans votre boîte mail.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto pt-4">
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Votre adresse email..." 
                disabled={loading}
                className="w-full h-14 bg-white/10 border border-white/20 rounded-2xl px-6 text-white placeholder:text-indigo-200 outline-none focus:bg-white/20 transition-all disabled:opacity-50"
                required
              />
              <button 
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto h-14 bg-white text-indigo-600 px-10 rounded-2xl font-black text-sm hover:bg-orange-500 hover:text-white transition-all shadow-xl disabled:opacity-50"
              >
                {loading ? 'Inscription...' : "S'abonner"}
              </button>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default MagPage;
