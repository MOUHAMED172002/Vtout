import { Policy } from './models/index.js';

async function insertCGV() {
    try {
        console.log('Inserting CGV...');
        
        const cgvContent = `
CONDITIONS GÉNÉRALES DE VENTE (CGV) - VTOUT BÉNIN
Dernière mise à jour : Avril 2026

1. OBJET
Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles entre la plateforme VTOUT (ci-après "Vtout"), ses fournisseurs partenaires, et ses clients. Vtout est une plateforme de mise en relation et de vente de produits divers.

2. PRODUITS ET PRIX
Les produits proposés sont décrits avec la plus grande précision possible. Les prix sont indiqués en Francs CFA (XOF). Vtout se réserve le droit de modifier ses prix à tout moment, mais le produit sera facturé sur la base du tarif en vigueur au moment de la validation de la commande.

3. COMMANDE ET PAIEMENT
La validation de la commande implique l'acceptation intégrale des présentes CGV.
Moyens de paiement acceptés : 
- Mobile Money (MTN MoMo, Moov Money) via FedaPay.
- Carte Bancaire (Visa, Mastercard).
- Paiement à la livraison (selon éligibilité de la zone).

4. LIVRAISON (BÉNIN)
Les livraisons sont effectuées dans un délai moyen de :
- Cotonou & Calavi : 24h à 48h ouvrées.
- Autres zones : 3 à 5 jours ouvrés.
Les frais de livraison sont calculés automatiquement lors de la commande en fonction de la distance et du poids.

5. DROIT DE RÉTRACTATION ET RETOURS
Conformément aux usages du commerce électronique au Bénin :
- Le client dispose de 48h après réception pour signaler un produit non conforme ou défectueux.
- Les articles doivent être retournés dans leur emballage d'origine, non utilisés.
- Les frais de retour sont à la charge du client, sauf en cas de défaut avéré du produit.

6. GARANTIE ET RESPONSABILITÉ
Vtout intervient en tant qu'intermédiaire. La garantie légale est assurée par le fournisseur du produit. Vtout s'engage toutefois à assister le client dans ses démarches auprès du fournisseur en cas de litige.

7. PROTECTION DES DONNÉES
Vtout s'engage à protéger les données personnelles de ses utilisateurs. Celles-ci sont utilisées uniquement pour le traitement des commandes et l'amélioration de nos services.

8. LITIGES
En cas de litige, une solution amiable sera recherchée en priorité. À défaut, les tribunaux de Cotonou seront seuls compétents.
        `.trim();

        // Check if CGV already exists
        const existing = await Policy.findOne({ where: { type: 'cgv' } });
        
        if (existing) {
            await existing.update({
                title: "Conditions Générales de Vente",
                content: cgvContent
            });
            console.log('✅ CGV updated successfully');
        } else {
            await Policy.create({
                title: "Conditions Générales de Vente",
                content: cgvContent,
                type: 'cgv'
            });
            console.log('✅ CGV created successfully');
        }

        process.exit(0);
    } catch (err) {
        console.error('❌ Failed to insert CGV:', err);
        process.exit(1);
    }
}

insertCGV();
