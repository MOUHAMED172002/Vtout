import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractFedapayTransaction } from '../services/fedapayService.js';

// Régression directe du bug de production (10/08/2026) : createFedapayTransaction
// plantait sur CHAQUE paiement en ligne car la réponse réelle de FedaPay
// place la transaction sous une clé contenant un slash, jamais couverte par
// l'ancienne chaîne de repli (data.v1_transaction, avec un underscore).
test('extractFedapayTransaction: reconnaît la clé réelle "v1/transaction" (avec slash)', () => {
    const data = { 'v1/transaction': { id: 123, status: 'pending' } };
    assert.deepEqual(extractFedapayTransaction(data), { id: 123, status: 'pending' });
});

test('extractFedapayTransaction: repli sur "v1_transaction" (underscore)', () => {
    const data = { v1_transaction: { id: 456 } };
    assert.deepEqual(extractFedapayTransaction(data), { id: 456 });
});

test('extractFedapayTransaction: repli sur "transaction"', () => {
    const data = { transaction: { id: 789 } };
    assert.deepEqual(extractFedapayTransaction(data), { id: 789 });
});

test('extractFedapayTransaction: repli sur un objet transaction à la racine', () => {
    const data = { id: 999, status: 'approved' };
    assert.deepEqual(extractFedapayTransaction(data), { id: 999, status: 'approved' });
});

test('extractFedapayTransaction: renvoie null si aucune forme connue ne matche', () => {
    assert.equal(extractFedapayTransaction({ unexpected: 'shape' }), null);
    assert.equal(extractFedapayTransaction(null), null);
    assert.equal(extractFedapayTransaction(undefined), null);
});
