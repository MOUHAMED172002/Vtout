import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Scale } from "lucide-react";
import { getPolicyByType } from "../services/contentService";

export default function MentionsLegales() {
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    getPolicyByType("mentions_legales")
      .then(setPolicy)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-base-100">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 py-20 px-4 md:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Header */}
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-[0.3em]"
          >
            <Scale size={16} /> Informations légales
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-black text-base-content tracking-tighter leading-[1.1]">
            Mentions <span className="text-primary">Légales</span>
          </h1>
        </div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-base-200 rounded-[3rem] p-10 md:p-16 border border-white shadow-inner"
        >
          {notFound || !policy ? (
            <p className="text-base-content/50 font-medium text-lg">
              Les mentions légales ne sont pas encore disponibles.
            </p>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-primary rounded-[1.5rem] flex items-center justify-center text-white shadow-xl">
                  <Scale size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-base-content tracking-tight">{policy.title}</h2>
                  {policy.updatedAt && (
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-1">
                      Dernière mise à jour : {new Date(policy.updatedAt).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
                    </p>
                  )}
                </div>
              </div>

              <div className="prose prose-lg max-w-none">
                <p className="text-base-content/70 font-medium text-lg leading-relaxed whitespace-pre-wrap">
                  {policy.content}
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
