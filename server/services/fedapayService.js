import fetch from 'node-fetch'; // On utilise fetch natif de Node 18+ (pas besoin de node-fetch si Node 18+)

export const createFedapayTransaction = async (order, customerProfile, redirectUrl) => {
    try {
        const apiKey = process.env.FEDAPAY_SECRET_KEY;
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
                    order_id: order.id
                }
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            console.error('[FedaPay] Erreur création transaction:', data);
            throw new Error(data.message || 'Erreur API FedaPay');
        }

        // FedaPay retourne Transaction et token (selon leur API REST v1)
        // Pour générer le lien de paiement, nous devons appeler l'endpoint token
        const transactionId = data.v1_transaction.id;
        
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
        const apiKey = process.env.FEDAPAY_SECRET_KEY;
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
        return data.v1_transaction;
    } catch (error) {
        console.error('[FedaPay Service] Verify Error:', error);
        throw error;
    }
};
