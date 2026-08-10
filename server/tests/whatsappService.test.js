import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatPhoneNumber } from '../services/whatsappService.js';

// Régression directe d'un bug de prod : les numéros béninois à 10 chiffres
// commençant par 0 (format en vigueur depuis nov. 2024) partaient sans
// l'indicatif 229 vers Green API, qui les rejetait ("invalid phone
// number") — notification jamais envoyée, silencieusement.
test('formatPhoneNumber: ajoute l\'indicatif 229 pour un numéro béninois 10 chiffres (format 2024+)', () => {
    assert.equal(formatPhoneNumber('0167703242'), '2290167703242');
});

test('formatPhoneNumber: ajoute l\'indicatif 229 pour l\'ancien format 8 chiffres', () => {
    assert.equal(formatPhoneNumber('97000000'), '22997000000');
});

test('formatPhoneNumber: retire le préfixe international 00', () => {
    assert.equal(formatPhoneNumber('0022997000000'), '22997000000');
});

test('formatPhoneNumber: laisse passer un numéro déjà international', () => {
    assert.equal(formatPhoneNumber('22997000000'), '22997000000');
    assert.equal(formatPhoneNumber('33600000000'), '33600000000');
});

test('formatPhoneNumber: retire tous les caractères non numériques (espaces, +, tirets)', () => {
    assert.equal(formatPhoneNumber('+229 01 67 70 32 42'), '2290167703242');
});

test('formatPhoneNumber: numéro vide/absent renvoie une chaîne vide', () => {
    assert.equal(formatPhoneNumber(''), '');
    assert.equal(formatPhoneNumber(null), '');
    assert.equal(formatPhoneNumber(undefined), '');
});
