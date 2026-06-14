import React from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Search, PackageOpen } from "lucide-react";
import { Link } from "react-router-dom";

const icons = {
    cart: <ShoppingBag size={64} className="text-base-content/20" />,
    search: <Search size={64} className="text-base-content/20" />,
    orders: <PackageOpen size={64} className="text-base-content/20" />,
};

export default function EmptyState({
    type = "search",
    title = "Rien à afficher ici",
    description = "Il semble que nous n'ayons pas pu trouver ce que vous cherchiez.",
    actionLabel = "Retour à la boutique",
    actionLink = "/products-liste"
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center text-center p-12 space-y-6 max-w-md mx-auto"
        >
            <div className="w-24 h-24 bg-base-200 rounded-full flex items-center justify-center shadow-inner">
                {icons[type] || icons.search}
            </div>
            <div className="space-y-2">
                <h3 className="text-2xl font-black text-base-content tracking-tighter">{title}</h3>
                <p className="text-base-content/50 font-bold leading-relaxed whitespace-pre-wrap">{description}</p>
            </div>
            {actionLabel && (
                <Link
                    to={actionLink}
                    className="btn btn-primary rounded-2xl px-8 h-12 font-black shadow-lg shadow-primary/20 border-none"
                >
                    {actionLabel}
                </Link>
            )}
        </motion.div>
    );
}
