// On utilise fetch natif de Node 18+ (pas besoin d'import)

// Extrait l'objet transaction d'une réponse FedaPay quel que soit le format
// exact renvoyé — pure fonction, testable indépendamment (voir
// server/tests/fedapayService.test.js) sans avoir à mocker fetch().
// Confirmé en prod (10/08/2026) : la vraie clé racine est littéralement
// 'v1/transaction' AVEC UN SLASH (cohérent avec le "klass": "v1/transaction"
// déjà vu dans les payloads webhook) — impossible à écrire en notation
// pointée, d'où l'accès par crochets. Anciennes variantes (v1_transaction,
// transaction, objet à la racine) gardées en repli au cas où le format
// varie encore selon compte/version d'API.
export const extractFedapayTransaction = (data) => {
    if (!data || typeof data !== 'object') return null;
    return data['v1/transaction'] || data.v1_transaction || data.transaction || (data.id ? data : null);
};

export const createFedapayTransaction = async (order, customerProfile, redirectUrl, extraMetadata = {}) => {
    try {
        // Accepte les deux noms de variable (FEDAPAY_SECRET_KEY est le nom
        // documenté/attendu ; FEDAPAY_SECRET est l'ancien nom encore présent
        // dans certains .env) pour éviter qu'une clé déjà configurée sous
        // l'un ou l'autre nom ne soit silencieusement ignorée.
        const apiKey = process.env.FEDAPAY_SECRET_KEY || process.env.FEDAPAY_SECRET;
        // Log de diagnostic sans jamais exposer la clé en entier — juste de
        // quoi vérifier côté logs qu'une clé est bien détectée et de quel
        // type (sk_live_ vs sk_sandbox_/sk_test_) sans risque de fuite.
        console.log(`[FedaPay] Config — clé: ${apiKey ? `${apiKey.slice(0, 9)}… (${apiKey.length} car.)` : 'AUCUNE (undefined)'} | env: ${process.env.FEDAPAY_ENV || '(non défini → sandbox)'}`);
        // Utilisez 'api.fedapay.com' pour la production
        const env = process.env.FEDAPAY_ENV === 'live' ? 'api' : 'sandbox-api';
        const baseUrl = `https://${env}.fedapay.com/v1/transactions`;

        const response = await fetch(baseUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amount: Math.round(order.total_amount),
                currency: {
                    iso: 'XOF'
                },
                description: `Commande #${order.id.slice(0, 8)} sur Vtout`,
                callback_url: redirectUrl,
                customer: {
                    firstname: customerProfile?.fullname?.split(' ')[0] || order.guest_name?.split(' ')[0] || "Client",
                    lastname: customerProfile?.fullname?.split(' ')[1] || order.guest_name?.split(' ')[1] || "Vtout",
                    email: customerProfile?.email || order.guest_email || "test@vtout.com",
                    phone_number: {
                        number: customerProfile?.phone || order.guest_phone || "00000000",
                        country: "bj"
                    }
                },
                metadata: {
                    order_id: order.id,
                    ...extraMetadata
                }
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            console.error('[FedaPay] Erreur création transaction:', data);
            throw new Error(data.message || 'Erreur API FedaPay');
        }

        // Si aucune forme connue ne matche, on log la vraie forme reçue pour
        // ajuster précisément au lieu de re-deviner (voir extractFedapayTransaction).
        const txObject = extractFedapayTransaction(data);
        if (!txObject?.id) {
            console.error('[FedaPay] Structure de réponse inattendue — clés reçues:', Object.keys(data));
            throw new Error('Réponse FedaPay inattendue (transaction introuvable dans la réponse)');
        }
        const transactionId = txObject.id;

        const tokenResponse = await fetch(`${baseUrl}/${transactionId}/token`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });
        const tokenData = await tokenResponse.json();

        if (!tokenResponse.ok) {
            console.error('[FedaPay] Erreur génération token:', tokenData);
            throw new Error('Erreur génération token FedaPay');
        }

        const paymentToken = tokenData.token;
        const checkoutUrl = `https://checkout.fedapay.com/pay/${paymentToken}`;

        return {
            transactionId: transactionId,
            checkoutUrl: checkoutUrl,
            token: paymentToken
        };

    } catch (error) {
        console.error('[FedaPay Service] Error:', error);
        throw error;
    }
};

export const verifyFedapayTransaction = async (transactionId) => {
    try {
        // Accepte les deux noms de variable (FEDAPAY_SECRET_KEY est le nom
        // documenté/attendu ; FEDAPAY_SECRET est l'ancien nom encore présent
        // dans certains .env) pour éviter qu'une clé déjà configurée sous
        // l'un ou l'autre nom ne soit silencieusement ignorée.
        const apiKey = process.env.FEDAPAY_SECRET_KEY || process.env.FEDAPAY_SECRET;
        // Log de diagnostic sans jamais exposer la clé en entier — juste de
        // quoi vérifier côté logs qu'une clé est bien détectée et de quel
        // type (sk_live_ vs sk_sandbox_/sk_test_) sans risque de fuite.
        console.log(`[FedaPay] Config — clé: ${apiKey ? `${apiKey.slice(0, 9)}… (${apiKey.length} car.)` : 'AUCUNE (undefined)'} | env: ${process.env.FEDAPAY_ENV || '(non défini → sandbox)'}`);
        const env = process.env.FEDAPAY_ENV === 'live' ? 'api' : 'sandbox-api';
        const baseUrl = `https://${env}.fedapay.com/v1/transactions/${transactionId}`;

        const response = await fetch(baseUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        const txObject = extractFedapayTransaction(data);
        if (!txObject) {
            console.error('[FedaPay] Structure de réponse inattendue (verify) — clés reçues:', Object.keys(data));
        }
        return txObject;
    } catch (error) {
        console.error('[FedaPay Service] Verify Error:', error);
        throw error;
    }
};
