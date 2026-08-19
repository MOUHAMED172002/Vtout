// Normalise une chaîne pour une recherche insensible aux accents/emojis/casse
// — permet de taper "parametre" et matcher "Paramètres", ou "whatsapp" et
// matcher un texte contenant "WhatChimp" via des mots-clés associés.
// Utilisé par la recherche de navigation (AdminLayaout) et le centre d'aide
// (AdminHelpCenter) pour un comportement identique et cohérent.
export const normalizeSearch = (str) =>
  String(str || "")
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
