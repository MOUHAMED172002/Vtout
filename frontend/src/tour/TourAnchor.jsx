import React, { useEffect, useRef } from 'react';
import { useTour } from './TourContext';

/**
 * Enveloppe un élément ciblé par la visite guidée. Aucun impact visuel : ne fait
 * qu'enregistrer sa position DOM auprès du TourContext pour que TourOverlay puisse
 * découper un « spot » autour au bon moment. `as`/`className` permettent de garder
 * le rendu identique à l'élément qu'il remplace (voir usages dans Navbar, Category...).
 */
export default function TourAnchor({ id, children, className, as = 'div' }) {
  const Tag = as;
  const { registerAnchor, unregisterAnchor } = useTour();
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    registerAnchor(id, el);
    return () => unregisterAnchor(id, el);
  }, [id, registerAnchor, unregisterAnchor]);

  return (
    <Tag ref={ref} className={className} data-tour-anchor={id}>
      {children}
    </Tag>
  );
}
