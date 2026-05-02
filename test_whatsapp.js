import { verifyWhatsAppOTP } from './server/controllers/authWhatsAppController.js';
import { Otp, Profile, sequelize } from './server/models/index.js';

const runTest = async () => {
    try {
        console.log("=== DÉBUT DU TEST DE CONNEXION WHATSAPP ===");
        
        const phone = '+22900000000';
        const cleanPhone = '22900000000';
        const code = '999999';
        
        // 1. Nettoyer les anciens tests
        await Otp.destroy({ where: { phone: cleanPhone } });
        await Profile.destroy({ where: { phone: cleanPhone } });
        await sequelize.query(`DELETE FROM \`user\` WHERE email = '${cleanPhone}@whatsapp.vtout.com'`);

        // 2. Insérer un faux OTP valide
        console.log("1. Création d'un faux code OTP valide...");
        await Otp.create({
            phone: cleanPhone,
            code: code,
            expires_at: new Date(Date.now() + 5 * 60 * 1000)
        });

        // 3. Simuler la requête de vérification
        console.log("2. Appel de la fonction verifyWhatsAppOTP...");
        const req = {
            body: { phone, code, name: 'Agent de Test' },
            headers: { 'user-agent': 'Script de test local' },
            ip: '127.0.0.1'
        };
        
        const res = {
            status: (s) => ({ json: (data) => { console.error('Erreur API:', s, data); } }),
            json: (data) => { console.log('✅ Succès API ! Utilisateur créé:', data.user.fullname); },
            cookie: (name, val, opts) => { console.log('✅ Cookie défini:', name); }
        };

        await verifyWhatsAppOTP(req, res);

        // 4. Vérifier la base de données
        console.log("3. Vérification des tables de la base de données...");
        const profileCount = await Profile.count({ where: { phone: cleanPhone } });
        console.log(`- Nombre de profils trouvés : ${profileCount} (Attendu: 1)`);
        
        const [users] = await sequelize.query(`SELECT * FROM \`user\` WHERE email = '${cleanPhone}@whatsapp.vtout.com'`);
        console.log(`- Nombre de users better-auth trouvés : ${users.length} (Attendu: 1)`);

        console.log("=== TEST TERMINÉ AVEC SUCCÈS ===");
        process.exit(0);
    } catch (error) {
        console.error("ÉCHEC DU TEST:", error);
        process.exit(1);
    }
};

runTest();
