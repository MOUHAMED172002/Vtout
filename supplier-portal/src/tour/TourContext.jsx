import React, { createContext, useCallback, useContext, useRef, useState } from 'react';

const TourCtx = createContext(null);

/**
 * Contexte de la visite guidée du site (miroir de src/tour/TourContext.js côté mobile).
 * `tour` regroupe les étapes ET l'index courant dans un seul état pour éviter les
 * lectures de closures obsolètes lors d'appels rapprochés de next().
 */
export function TourProvider({ children }) {
  const [tour, setTour] = useState(null); // { steps, index } | null

  // Registre des ancres DOM par id. Une Map<id, Set<HTMLElement>> plutôt qu'un seul
  // élément par id : la même cible logique (ex. barre de recherche) peut être rendue
  // deux fois dans le DOM (version desktop + mobile, `hidden lg:flex` / `flex lg:hidden`),
  // une seule étant visible selon la largeur d'écran.
  const anchors = useRef(new Map());

  const registerAnchor = useCallback((id, el) => {
    if (!anchors.current.has(id)) anchors.current.set(id, new Set());
    anchors.current.get(id).add(el);
  }, []);

  const unregisterAnchor = useCallback((id, el) => {
    const set = anchors.current.get(id);
    if (!set) return;
    set.delete(el);
    if (set.size === 0) anchors.current.delete(id);
  }, []);

  // Renvoie l'élément effectivement visible pour un id (largeur/hauteur non nulles),
  // ou null si aucune instance enregistrée n'est actuellement affichée.
  const getAnchorEl = useCallback((id) => {
    const set = anchors.current.get(id);
    if (!set) return null;
    for (const el of set) {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) return el;
    }
    return null;
  }, []);

  const start = useCallback((steps) => {
    if (!steps || steps.length === 0) return;
    setTour({ steps, index: 0 });
  }, []);

  const next = useCallback(() => {
    setTour((t) => {
      if (!t) return t;
      const nextIndex = t.index + 1;
      if (nextIndex >= t.steps.length) return null;
      return { ...t, index: nextIndex };
    });
  }, []);

  const stop = useCallback(() => setTour(null), []);

  return (
    <TourCtx.Provider value={{ tour, start, next, stop, registerAnchor, unregisterAnchor, getAnchorEl }}>
      {children}
    </TourCtx.Provider>
  );
}

export function useTour() {
  const ctx = useContext(TourCtx);
  if (!ctx) throw new Error('useTour() doit être appelé à l’intérieur d’un <TourProvider>');
  return ctx;
}
