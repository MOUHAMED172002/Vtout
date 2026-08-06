import sharp from 'sharp';

// ── Anti-fraude : hash perceptif (aHash) des captures d'écran de statut WhatsApp ──
//
// Objectif : repérer les captures recyclées — la même image (ou une version
// recadrée/recompressée) réutilisée par le même compte sur une autre campagne,
// ou par un compte différent (partage/vol de capture). Un hash cryptographique
// classique (SHA256) échouerait dès que l'image est ne serait-ce que légèrement
// modifiée (recompression WhatsApp, recadrage) ; le hash perceptif reste stable
// dans ces cas.
//
// Principe (average hash) : réduire l'image à une grille 16x16 en niveaux de
// gris, comparer chaque pixel à la moyenne de l'image → un bit par pixel = un
// hash de 256 bits, encodé en hexadécimal (64 caractères).

const HASH_SIZE = 16; // grille 16x16 = 256 bits

/**
 * Calcule le hash perceptif (aHash) d'une image à partir de son buffer.
 * @param {Buffer} buffer
 * @returns {Promise<string>} hash hexadécimal de 64 caractères (256 bits)
 */
export async function computePerceptualHash(buffer) {
    const { data } = await sharp(buffer)
        .resize(HASH_SIZE, HASH_SIZE, { fit: 'fill' })
        .grayscale()
        .raw()
        .toBuffer({ resolveWithObject: true });

    const pixels = Array.from(data);
    const avg = pixels.reduce((sum, p) => sum + p, 0) / pixels.length;

    let bits = '';
    for (const p of pixels) {
        bits += p >= avg ? '1' : '0';
    }

    // Encode les 256 bits en hexadécimal (64 caractères) pour un stockage compact.
    let hex = '';
    for (let i = 0; i < bits.length; i += 4) {
        hex += parseInt(bits.slice(i, i + 4), 2).toString(16);
    }
    return hex;
}

/**
 * Distance de Hamming entre deux hashes hexadécimaux de même longueur —
 * nombre de bits différents. 0 = identiques, plus c'est bas plus les images
 * se ressemblent visuellement.
 */
export function hammingDistance(hexA, hexB) {
    if (!hexA || !hexB || hexA.length !== hexB.length) return Infinity;
    let distance = 0;
    for (let i = 0; i < hexA.length; i++) {
        const a = parseInt(hexA[i], 16);
        const b = parseInt(hexB[i], 16);
        let xor = a ^ b;
        while (xor) {
            distance += xor & 1;
            xor >>= 1;
        }
    }
    return distance;
}

// En dessous de ce seuil (sur 256 bits), deux captures sont considérées comme
// la même image recyclée. ~10 bits de différence tolère une légère
// recompression/recadrage sans laisser passer une capture réellement différente.
export const DUPLICATE_HASH_THRESHOLD = 10;

export function isLikelyDuplicate(hexA, hexB) {
    return hammingDistance(hexA, hexB) <= DUPLICATE_HASH_THRESHOLD;
}
