import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, ArrowRight, Search, ShoppingBag, CreditCard, Truck, Package, Star, Bell, Navigation, Wallet, UserCheck } from 'lucide-react';
import { useTour } from './TourContext';

const PAD = 8;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Icônes optionnelles pour illustrer une étape (voir HOME_TOUR_STEPS /
// DELIVERY_TOUR_STEPS) — utilisées aussi bien sur des étapes ancrées que sur
// les étapes "récit" sans cible DOM.
const STEP_ICONS = { Search, ShoppingBag, CreditCard, Truck, Package, Star, Bell, Navigation, Wallet, UserCheck };

/**
 * Calque plein écran de la visite guidée : fond assombri avec une découpe SVG
 * (mask) autour de la cible courante + infobulle titre/description/navigation.
 * Rendu via un portail dans document.body pour ignorer les `overflow-hidden` /
 * transformations CSS des conteneurs ancêtres (App.jsx a overflow-hidden).
 *
 * Une étape peut porter `route` : si elle diffère de la page courante, on y
 * navigue avant de chercher sa cible — la visite peut ainsi traverser
 * plusieurs pages réelles (ex. panier → "Comment ça marche") au lieu de tout
 * expliquer depuis l'accueil.
 */
export default function TourOverlay() {
  const { tour, next, stop, getAnchorEl } = useTour();
  const navigate = useNavigate();
  const location = useLocation();
  const [rect, setRect] = useState(null);
  const rafRef = useRef(null);
  const runIdRef = useRef(0);

  const step = tour?.steps?.[tour.index] || null;

  const measure = useCallback(() => {
    if (!step || !step.target) return;
    const el = getAnchorEl(step.target);
    if (!el) return;
    const r = el.getBoundingClientRect();
    setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
  }, [step, getAnchorEl]);

  // Nouvelle étape : navigue vers sa page si besoin, puis cherche sa cible avec
  // quelques tentatives (le temps que la nouvelle page se monte), et saute
  // l'étape si rien n'apparaît. Une étape sans `target` est volontairement une
  // carte "récit" centrée : pas d'ancre à chercher, jamais sautée (voir
  // HOME_TOUR_STEPS pour des exemples : paiement, livraison...).
  useEffect(() => {
    // Incrémenté en premier, inconditionnellement : invalide toute exécution
    // précédente encore en vol (y compris quand la nouvelle étape est nulle,
    // ex. fin de la visite), sans avoir besoin d'une fonction de nettoyage.
    runIdRef.current += 1;
    const runId = runIdRef.current;
    const cancelled = () => runId !== runIdRef.current;
    setRect(null);
    if (!step) return;

    (async () => {
      if (step.route && location.pathname !== step.route) {
        navigate(step.route);
        await wait(500); // laisse le temps à la nouvelle page de se monter
      }
      if (cancelled()) return;
      if (!step.target) return; // carte centrée, rien à mesurer

      for (let attempt = 0; attempt < 10; attempt++) {
        if (cancelled()) return;
        const el = getAnchorEl(step.target);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          await wait(350);
          if (cancelled()) return;
          const r = el.getBoundingClientRect();
          setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
          return;
        }
        await wait(150);
      }
      // Cible introuvable après plusieurs tentatives (ex. panier vide sans
      // bouton de commande) : on saute l'étape plutôt que de rester bloqué.
      if (!cancelled()) next();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tour?.index, step?.target, step?.route]);

  // Le calque reste ouvert : garde le spot aligné si la page défile/se redimensionne.
  useEffect(() => {
    if (!tour) return undefined;
    const onChange = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(measure);
    };
    window.addEventListener('resize', onChange);
    window.addEventListener('scroll', onChange, true);
    return () => {
      window.removeEventListener('resize', onChange);
      window.removeEventListener('scroll', onChange, true);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [tour, measure]);

  if (!tour || !step) return null;

  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const spot = rect ? {
    x: Math.max(rect.left - PAD, 0),
    y: Math.max(rect.top - PAD, 0),
    w: rect.width + PAD * 2,
    h: rect.height + PAD * 2,
  } : null;

  // Infobulle sous la cible si elle est dans la moitié haute de l'écran, sinon au-dessus.
  const tooltipBelow = rect ? rect.top < vh / 2 : true;
  const tooltipTop = rect
    ? (tooltipBelow ? Math.min(rect.top + rect.height + PAD * 2, vh - 20) : undefined)
    : vh / 2 - 80;
  const tooltipBottom = rect && !tooltipBelow ? Math.max(vh - rect.top + PAD * 2, 20) : undefined;

  const isLast = tour.index === tour.steps.length - 1;

  return createPortal(
    <div className="fixed inset-0 z-[300]" role="dialog" aria-modal="true" aria-label="Visite guidée">
      <svg className="absolute inset-0 w-full h-full" width={vw} height={vh}>
        <defs>
          <mask id="vtout-tour-mask">
            <rect x="0" y="0" width={vw} height={vh} fill="white" />
            {spot && <rect x={spot.x} y={spot.y} width={spot.w} height={spot.h} rx="14" fill="black" />}
          </mask>
        </defs>
        <rect x="0" y="0" width={vw} height={vh} fill="rgba(15,17,21,0.72)" mask="url(#vtout-tour-mask)" className="cursor-pointer" onClick={stop} />
        {spot && (
          <rect x={spot.x} y={spot.y} width={spot.w} height={spot.h} rx="14" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-primary pointer-events-none" />
        )}
      </svg>

      <div
        className="absolute left-1/2 -translate-x-1/2 w-[92%] max-w-sm bg-base-100 text-base-content rounded-3xl shadow-2xl p-5"
        style={{ top: tooltipTop, bottom: tooltipBottom }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            {tour.steps.map((_, i) => (
              <span key={i} className={`h-1.5 rounded-full transition-all ${i === tour.index ? 'w-5 bg-primary' : 'w-1.5 bg-base-300'}`} />
            ))}
          </div>
          <button onClick={stop} className="p-1 text-base-content/40 hover:text-base-content transition-colors" aria-label="Fermer la visite">
            <X size={16} />
          </button>
        </div>
        {step.icon && STEP_ICONS[step.icon] && (
          <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3">
            {React.createElement(STEP_ICONS[step.icon], { size: 20 })}
          </div>
        )}
        <h3 className="font-black text-base mb-1">{step.title}</h3>
        <p className="text-sm text-base-content/70 mb-4">{step.description}</p>
        <div className="flex items-center justify-between gap-3">
          <button onClick={stop} className="text-xs font-bold text-base-content/50 hover:text-base-content transition-colors">Passer</button>
          <button onClick={next} className="btn btn-primary btn-sm rounded-full px-5 gap-1.5 font-black">
            {isLast ? "C'est parti !" : 'Suivant'}
            {!isLast && <ArrowRight size={14} />}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
