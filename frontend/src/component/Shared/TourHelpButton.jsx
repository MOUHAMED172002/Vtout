import React from 'react';
import { HelpCircle } from 'lucide-react';
import { useTour } from '../../tour/TourContext';

/**
 * Bouton "?" pour relancer la visite guidée à la demande (équivalent de
 * src/components/TourHelpButton.js côté mobile).
 */
export default function TourHelpButton({ steps, className = '' }) {
  const { start } = useTour();
  return (
    <button
      type="button"
      onClick={() => start(steps)}
      className={`p-2 text-base-content/40 hover:text-primary transition-colors ${className}`}
      title="Revoir la visite guidée"
      aria-label="Revoir la visite guidée"
    >
      <HelpCircle size={18} />
    </button>
  );
}
