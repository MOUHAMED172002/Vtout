import React from "react";
import { BadgeCheck } from "lucide-react";

// Badge "Vendeur vérifié" — un seul design, réutilisé partout où l'on affiche
// le statut de vérification d'un vendeur (carte produit, page produit,
// en-tête boutique). Inspiré du chip de vérification des grandes
// marketplaces (Amazon, Etsy, Meta) : un simple sceau bleu plein avec
// coche blanche, sans fond ni bordure superflus.
//
// - variant="icon"  → juste le sceau (à coller après un titre/nom qui peut
//   wrapper sur plusieurs lignes), sans libellé.
// - variant="chip"  → sceau + "Vérifié" en tout petit, sur sa propre ligne —
//   utilisé sur les cartes produit compactes, sous le nom (même gabarit que
//   la ligne "Livraison gratuite" juste en dessous).
// - variant="pill"  → sceau + libellé "Vérifié", dans une pastille — utilisé
//   là où il y a la place (page produit, en-tête boutique).
export default function VerifiedSellerBadge({ variant = "icon", size = 14, className = "" }) {
  if (variant === "chip") {
    return (
      <div title="Vendeur vérifié" className={`flex items-center gap-1 min-w-0 ${className}`}>
        <BadgeCheck size={size} strokeWidth={2.5} fill="#1d9bf0" className="text-white shrink-0" />
        <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-tight text-[#1d9bf0] truncate">
          Vendeur vérifié
        </span>
      </div>
    );
  }

  if (variant === "pill") {
    return (
      <span
        title="Vendeur vérifié"
        className={`inline-flex items-center gap-1.5 bg-[#1d9bf0]/10 text-[#1d9bf0] text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-tight shrink-0 ${className}`}
      >
        <BadgeCheck size={size} strokeWidth={2.5} fill="#1d9bf0" className="text-white" />
        Vérifié
      </span>
    );
  }

  return (
    <span title="Vendeur vérifié" className={`inline-flex shrink-0 ${className}`}>
      <BadgeCheck size={size} strokeWidth={2.5} fill="#1d9bf0" className="text-white drop-shadow-sm" />
    </span>
  );
}
