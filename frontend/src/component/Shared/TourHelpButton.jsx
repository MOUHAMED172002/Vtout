import React from 'react';
import { HelpCircle } from 'lucide-react';
import { useTour } from '../../tour/TourContext';

/**
 * Bouton "?" pour relancer la visite guidée à la demande (équivalent de
 * src/components/TourHelpButton.js côté mobile). `onBeforeStart` est optionnel :
 * utile quand la cible de la première étape est cachée par un état d'UI qu'il
 * faut ouvrir avant de démarrer (ex. tiroir admin fermé sur mobile).
 */
export default function TourHelpButton({ steps, onBeforeStart, className = '' }) {
  const { start } = useTour();
  return (
    <button
      type="button"
      onClick={() => {
        onBeforeStart?.();
        start(steps);
      }}
      className={`p-2 text-base-content/40 hover:text-primary transition-colors ${className}`}
      title="Revoir la visite guidée"
      aria-label="Revoir la visite guidée"
    >
      <HelpCircle size={18} />
    </button>
  );
}
