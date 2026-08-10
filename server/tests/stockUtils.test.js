import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeAvailableStock } from '../utils/stockUtils.js';

test('computeAvailableStock: soustrait la réservation du stock physique', () => {
    assert.equal(computeAvailableStock(10, 3), 7);
});

test('computeAvailableStock: ne descend jamais sous zéro', () => {
    // Ne devrait pas arriver grâce au verrouillage FOR UPDATE à la création
    // de commande, mais l'affichage doit rester défensif malgré tout.
    assert.equal(computeAvailableStock(2, 5), 0);
});

test('computeAvailableStock: traite null/undefined comme zéro', () => {
    assert.equal(computeAvailableStock(null, undefined), 0);
    assert.equal(computeAvailableStock(5, null), 5);
    assert.equal(computeAvailableStock(undefined, 2), 0);
});

test('computeAvailableStock: aucune réservation = stock complet disponible', () => {
    assert.equal(computeAvailableStock(42, 0), 42);
});
