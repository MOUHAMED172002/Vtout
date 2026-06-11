import React, { useState, useEffect } from 'react';
import Heading from '../Shared/Heading';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
        const res = await axios.get(`${API_URL}/blogs`);
        setBlogs(res.data);
      } catch (err) {
        console.error("Erreur lors de la récupération des blogs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  if (loading) {
    return (
      <div className="py-12 px-12 text-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-48 bg-base-300 rounded mb-4"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full mt-10">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-[300px] bg-base-200 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (blogs.length === 0) return null;

  return (
    <div id='vtout-mag' className='px-6 md:px-12 py-12'>
      <Heading title={'Vtout Mag'} subtitle={'Conseils & Tendances Shopping'} />

      <div className='container grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mt-10'>
        {blogs.map((data, index) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            key={data.id} 
            className='group cursor-pointer'
          >
            <Link to={`/blog/${data.slug}`}>
              {/* Image section */}
              <div className="overflow-hidden rounded-3xl mb-4 relative aspect-[4/3]">
                <img 
                  className='w-full h-full object-cover transition-transform duration-700 group-hover:scale-110' 
                  src={data.image_url || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop"}
                  alt={data.title}
                />
                <div className="absolute top-4 left-4 bg-base-100/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-indigo-600">
                   {data.category}
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-base-content/40 uppercase tracking-widest">
                  {new Date(data.published_at || data.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <h3 className='font-black text-xl text-base-content group-hover:text-primary transition-colors leading-tight'>
                  {data.title}
                </h3>
                <p className='line-clamp-2 text-sm text-base-content/50 font-medium leading-relaxed whitespace-pre-wrap'>
                  {data.summary}
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <span className="text-[11px] font-black uppercase text-primary tracking-widest">Lire l'article</span>
                  <div className="w-8 h-[1px] bg-primary group-hover:w-12 transition-all"></div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Blogs;
