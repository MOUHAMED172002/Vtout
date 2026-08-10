// Petit helper partagé — extrait de productController.js pour être testable
// (voir server/tests/stockUtils.test.js) et éviter de dupliquer la même
// formule à plusieurs endroits.
//
// stock disponible à l'achat = stock physique - quantité réservée par des
// commandes en cours (créées mais pas encore livrées/annulées). Jamais
// négatif : une réservation qui dépasserait le stock physique (ne devrait
// pas arriver grâce au verrouillage FOR UPDATE à la création de commande,
// mais on reste défensif côté affichage) ne doit jamais afficher un stock
// négatif au client.
export const computeAvailableStock = (stock, reservedStock) => {
    return Math.max(0, (Number(stock) || 0) - (Number(reservedStock) || 0));
};
