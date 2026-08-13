import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ArrowRight, Store, Upload, Bell, Send, DollarSign, BarChart3, BadgeCheck } from 'lucide-react';
import { useTour } from './TourContext';

const PAD = 8;

// Icônes optionnelles pour illustrer une étape (voir SUPPLIER_TOUR_STEPS) —
// utilisées aussi bien sur des étapes ancrées que sur les étapes "récit" sans
// cible DOM (ex. « Remettez au livreur », une action physique sans écran).
const STEP_ICONS = { Store, Upload, Bell, Send, DollarSign, BarChart3, BadgeCheck };

/**
 * Calque plein écran de la visite guidée : fond assombri avec une découpe SVG
 * (mask) autour de la cible courante + infobulle titre/description/navigation.
 * Rendu via un portail dans document.body pour ignorer les `overflow-hidden` /
 * transformations CSS des conteneurs ancêtres.
 */
export default function TourOverlay() {
  const { tour, next, stop, getAnchorEl } = useTour();
  const [rect, setRect] = useState(null);
  const skippedRef = useRef(new Set());
  const rafRef = useRef(null);

  const step = tour?.steps?.[tour.index] || null;

  const measure = useCallback(() => {
    // Une étape sans `target` est volontairement une carte "récit" centrée, sans
    // découpe — pas d'ancre à chercher (voir SUPPLIER_TOUR_STEPS pour un
    // exemple : « Remettez au livreur », un moment du parcours qui n'a pas
    // d'élément visible sur le portail à cet instant).
    if (!step || !step.target) { setRect(null); return; }
    const el = getAnchorEl(step.target);
    if (!el) { setRect(null); return; }
    const r = el.getBoundingClientRect();
    setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
  }, [step, getAnchorEl]);

  // Nouvelle étape : on retente la mesure (et on scrolle la cible en vue si besoin).
  useEffect(() => {
    if (!step) return undefined;
    if (!step.target) { setRect(null); return undefined; }
    skippedRef.current.delete(step.target);
    const el = getAnchorEl(step.target);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const t = setTimeout(measure, el ? 350 : 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tour?.index, step?.target]);

  // Cible introuvable / non visible à cette résolution (ex. desktop-only à cet id) :
  // on saute l'étape une seule fois pour ne pas boucler indéfiniment. Une étape
  // sans `target` n'est jamais sautée : c'est son état normal (carte centrée).
  useEffect(() => {
    if (!step || !step.target || rect) return undefined;
    if (skippedRef.current.has(step.target)) return undefined;
    if (getAnchorEl(step.target)) return undefined; // trouvé, measure() va suivre
    skippedRef.current.add(step.target);
    const t = setTimeout(() => next(), 50);
    return () => clearTimeout(t);
  }, [step, rect, getAnchorEl, next]);

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
