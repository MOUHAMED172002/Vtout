import React from 'react';
import { HelpCircle } from 'lucide-react';
import { useTour } from '../../tour/TourContext';

/**
 * Bouton "?" pour relancer la visite guidée à la demande.
 * `onBeforeStart` est optionnel : utile pour ouvrir un état d'UI (ex. tiroir
 * mobile fermé) avant de démarrer la visite.
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
