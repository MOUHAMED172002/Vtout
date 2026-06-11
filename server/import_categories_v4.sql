-- ============================================================================
-- 📦 CATÉGORIES V4 — Complétion des vides et catégories trop minces
-- Règles :
--   • Toutes les catégories VIDES (0 enfant) reçoivent leurs sous-catégories
--   • Toutes les catégories à 1-3 enfants sont complétées à 5+ enfants
--   • IDs démarrent à 1230 (après le dernier ID V3 : 1221)
-- ============================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ══════════════════════════════════════════════════════════════════
-- 1. LOGICIELS & SERVICES — 6 catégories VIDES (IDs 106-111)
-- ══════════════════════════════════════════════════════════════════

-- 106 · Suites Bureautiques
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1230, 'Microsoft Office (Word, Excel, PowerPoint)', 106, '📄'),
(1231, 'Google Workspace (Docs, Sheets, Drive)', 106, '☁️'),
(1232, 'LibreOffice & OpenOffice (gratuit)', 106, '📝'),
(1233, 'Outils PDF (Adobe, Foxit...)', 106, '📕'),
(1234, 'Logiciels Comptabilité & Facturation', 106, '💰'),
(1235, 'Gestion de Projet (Trello, Notion...)', 106, '📋'),
(1236, 'Messagerie & Collaboration (Outlook, Slack)', 106, '📧');

-- 107 · Antivirus & Sécurité
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1237, 'Antivirus Windows (Kaspersky, Avast...)', 107, '🛡️'),
(1238, 'Antivirus Mac & Mobile', 107, '🍎'),
(1239, 'Firewall & Protection Réseau', 107, '🔥'),
(1240, 'Nettoyeurs & Optimiseurs PC', 107, '🧹'),
(1241, 'Gestionnaires de Mots de Passe', 107, '🔐'),
(1242, 'Sauvegardes & Récupération de Données', 107, '💾');

-- 108 · VPN & Proxies
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1243, 'VPN Grand Public (NordVPN, ExpressVPN...)', 108, '🔒'),
(1244, 'VPN Professionnel & Entreprise', 108, '🏢'),
(1245, 'Proxy & Navigation Anonyme', 108, '🌐'),
(1246, 'Sécurité Wi-Fi Public & Voyage', 108, '📶'),
(1247, 'DNS Sécurisé & Contrôle Parental', 108, '👶');

-- 109 · Jeux PC
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1248, 'Jeux Action & FPS (Call of Duty, Valorant...)', 109, '🎯'),
(1249, 'Jeux RPG & Aventure (Witcher, Assassin...)', 109, '⚔️'),
(1250, 'Jeux Sport & Course (FIFA, F1...)', 109, '⚽'),
(1251, 'Jeux Stratégie & Simulation (Civ, Sims...)', 109, '♟️'),
(1252, 'Jeux Casual, Puzzle & Indépendants', 109, '🎮'),
(1253, 'Cartes de Jeu, DLC & Extensions', 109, '🃏'),
(1254, 'Abonnements Gaming (Xbox Game Pass...)', 109, '📅');

-- 110 · Logiciels Design
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1255, 'Retouche Photo (Photoshop, Lightroom, GIMP)', 110, '🖼️'),
(1256, 'Design Graphique (Illustrator, Canva, CorelDraw)', 110, '🎨'),
(1257, 'Montage Vidéo (Premiere, DaVinci, CapCut Pro)', 110, '🎬'),
(1258, 'Modélisation 3D & CAO (Blender, AutoCAD)', 110, '🧊'),
(1259, 'Design UI/UX (Figma, Adobe XD)', 110, '📱'),
(1260, 'Polices, Icônes & Assets Créatifs', 110, '🔤');

-- 111 · Logiciels Développement
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1261, 'IDE & Éditeurs de Code (VS Code, JetBrains)', 111, '💻'),
(1262, 'Outils DevOps & CI/CD (Docker, GitHub)', 111, '🔧'),
(1263, 'Bases de Données (MySQL, MongoDB...)', 111, '🗄️'),
(1264, 'Frameworks & Bibliothèques (React, Laravel)', 111, '📦'),
(1265, 'Outils Test, Debug & Monitoring', 111, '🔍'),
(1266, 'Hébergement, Domaines & Cloud', 111, '☁️'),
(1267, 'Cours Code & Licences Apprentissage', 111, '🎓');

-- ══════════════════════════════════════════════════════════════════
-- 2. ACCESSOIRES MODE (ID 206) — VIDE, complétion complète
-- ══════════════════════════════════════════════════════════════════
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1268, 'Sacs à Main & Pochettes', 206, '👜'),
(1269, 'Ceintures & Bretelles', 206, '👖'),
(1270, 'Écharpes, Foulards & Châles', 206, '🧣'),
(1271, 'Montres Mode Femme', 206, '⌚'),
(1272, 'Montres Mode Homme', 206, '⌚'),
(1273, 'Bijoux Fantaisie & Costume Jewelry', 206, '💍'),
(1274, 'Maroquinerie & Porte-monnaie', 206, '👛'),
(1275, 'Parapluies & Cannes de Marche', 206, '☂️'),
(1276, 'Gants & Manchons Mode', 206, '🧤'),
(1277, 'Bracelets & Joncs Mode', 206, '💛');

-- ══════════════════════════════════════════════════════════════════
-- 3. MODE — catégories trop minces
-- ══════════════════════════════════════════════════════════════════

-- 169 · Vêtements Enfants (1 seul enfant actuellement)
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1278, 'Vêtements Garçons 2-12 ans', 169, '👦'),
(1279, 'Vêtements Filles 2-12 ans', 169, '👧'),
(1280, 'Tenues Adolescents (12-16 ans)', 169, '🧒'),
(1281, 'Manteaux & Vestes Enfants', 169, '🧥'),
(1282, 'Pyjamas & Vêtements Intérieur Enfants', 169, '😴'),
(1283, 'Maillots de Bain Enfants', 169, '🏊'),
(1284, 'Accessoires Enfants (bonnet, gants, sac)', 169, '🎒');

-- 180 · Chaussures — complétion des 3 sous-catégories trop larges
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
-- Chaussures Hommes (ID 181)
(1285, 'Sneakers & Baskets Hommes', 181, '👟'),
(1286, 'Chaussures Habillées & Oxford', 181, '👞'),
(1287, 'Mocassins & Chaussures Bateau', 181, '🥿'),
(1288, 'Sandales & Tongs Hommes', 181, '🩴'),
(1289, 'Bottes & Bottines Hommes', 181, '👢'),
(1290, 'Chaussures de Sport Hommes', 181, '⚽'),
-- Chaussures Femmes (ID 189)
(1291, 'Escarpins & Chaussures à Talons', 189, '👠'),
(1292, 'Ballerines & Chaussures Plates', 189, '🥿'),
(1293, 'Sandales & Mules Femmes', 189, '🩴'),
(1294, 'Bottes & Bottines Femmes', 189, '👢'),
(1295, 'Sneakers & Baskets Femmes', 189, '👟'),
(1296, 'Chaussures de Cérémonie Femmes', 189, '💒'),
-- Chaussures Enfants (ID 197)
(1297, 'Chaussures Bébé & Premiers Pas', 197, '👶'),
(1298, 'Tennis & Baskets Enfants', 197, '👟'),
(1299, 'Sandales & Chaussures d\'Été Enfants', 197, '🩴'),
(1300, 'Chaussures Scolaires Enfants', 197, '🎒');

-- Soins Homme (ID 382) — 3 enfants → compléter
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1301, 'Parfums & Déodorants Homme', 382, '🌲'),
(1302, 'Soins Corps & Douche Homme', 382, '🚿'),
(1303, 'Accessoires Rasage (blaireau, coupe-choux)', 382, '🪒');

-- Vêtements de Mariage (ID 1145) — compléter
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1304, 'Bijoux & Parures Mariage', 1145, '💍'),
(1305, 'Tenues Enfants d\'Honneur', 1145, '👶');

-- ══════════════════════════════════════════════════════════════════
-- 4. SPORT & LOISIRS — catégories trop minces
-- ══════════════════════════════════════════════════════════════════

-- Basketball (407) — compléter
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1306, 'Maillots & Tenues Basketball', 407, '👕'),
(1307, 'Protections & Accessoires Basketball', 407, '🏀');

-- Tennis & Raquettes (428) — compléter
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1308, 'Chaussures Tennis & Raquettes', 428, '👟'),
(1309, 'Padel & Squash', 428, '🎾'),
(1310, 'Sacs Tennis & Raquettes', 428, '🎒');

-- Sports Aquatiques (443) — compléter
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1311, 'Kayak, Paddle & Canoë', 443, '🛶'),
(1312, 'Équipements Apnée & Chasse Sous-marine', 443, '🤿');

-- Pêche (447) — compléter
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1313, 'Lignes, Hameçons & Plombs', 447, '🎣'),
(1314, 'Boîtes de Rangement & Glacières Pêche', 447, '🧊'),
(1315, 'Habits & Équipements Pêcheur', 447, '🧥');

-- Handball (1195) — compléter
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1316, 'Chaussures Handball', 1195, '👟'),
(1317, 'Tenues & Maillots Handball', 1195, '👕');

-- Sports Scolaires EPS (1202) — compléter
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1318, 'Dossards, Cônes & Matériel EPS', 1202, '🏃'),
(1319, 'Chronomètres & Sifflets Arbitrage', 1202, '⏱️'),
(1320, 'Filets Multi-sports', 1202, '🥅');

-- Billard & Jeux Adultes (1205) — compléter
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1321, 'Fléchettes & Cibles', 1205, '🎯'),
(1322, 'Jeux de Pétanque & Boules', 1205, '⚫');

-- ══════════════════════════════════════════════════════════════════
-- 5. ALIMENTATION & ÉPICERIE — catégories trop minces
-- ══════════════════════════════════════════════════════════════════

-- Conserves & Surgelés (479) — compléter
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1323, 'Soupes & Bouillons en Conserve', 479, '🍲'),
(1324, 'Fruits en Conserve & Confitures', 479, '🍓'),
(1325, 'Poissons Appertisés (thon, sardines)', 479, '🐟');

-- Bio & Naturel (493) — compléter
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1326, 'Légumes & Fruits Bio', 493, '🥦'),
(1327, 'Produits Laitiers Bio', 493, '🥛'),
(1328, 'Viandes & Poissons Bio', 493, '🥩');

-- Condiments Locaux (1183) — compléter
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1329, 'Pâte de Piment & Poivrons Mixés', 1183, '🌶️'),
(1330, 'Gombo Séché & Légumes Déshydratés', 1183, '🌿'),
(1331, 'Sel Iodé & Sel Marin Local', 1183, '🧂');

-- ══════════════════════════════════════════════════════════════════
-- 6. JOUETS & ENFANTS — catégories trop minces
-- ══════════════════════════════════════════════════════════════════

-- Jouets Bébé (501) — ajouter 1 enfant manquant
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1332, 'Bains & Jouets de Bain Bébé', 501, '🛁');

-- Jeux de Construction (506) — compléter
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1333, 'Jeux Magnétiques & 3D', 506, '🧲'),
(1334, 'Circuits & Trains Miniatures', 506, '🚂');

-- Jeux Vidéo Enfants (531) — compléter
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1335, 'Jeux PlayStation Enfants (PEGI 3-7)', 531, '🎮'),
(1336, 'Tablettes Éducatives Enfants', 531, '📱'),
(1337, 'Jouets Électroniques Interactifs', 531, '🔊');

-- Déguisements & Carnaval (534) — compléter
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1338, 'Maquillage & Perruques Déguisement', 534, '🎭'),
(1339, 'Décorations Carnaval & Anniversaire', 534, '🎉'),
(1340, 'Déguisements Adultes', 534, '🦸');

-- ══════════════════════════════════════════════════════════════════
-- 7. AUTO & MOTO — catégories trop minces
-- ══════════════════════════════════════════════════════════════════

-- Véhicules Électriques (559) — compléter
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1341, 'Hover Boards & Gyropodes', 559, '🛹'),
(1342, 'Chargeurs & Batteries Véhicules Élec.', 559, '🔋');

-- Outils & Équipements Auto (567) — compléter
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1343, 'Manomètres & Gonfleurs Auto', 567, '💨'),
(1344, 'Nettoyeurs Haute Pression Auto', 567, '🫧');

-- ══════════════════════════════════════════════════════════════════
-- 8. ANIMALERIE — catégories trop minces
-- ══════════════════════════════════════════════════════════════════

-- Reptiles & Petits Animaux (671) — compléter
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1345, 'Lapins & Cobayes', 671, '🐰'),
(1346, 'Hamsters & Rongeurs', 671, '🐭'),
(1347, 'Serpents & Lézards', 671, '🦎'),
(1348, 'Nourriture Reptiles & Rongeurs', 671, '🌿');

-- Soins & Médicaments Animaux (674) — compléter
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1349, 'Shampoings & Toilettage Animaux', 674, '🛁'),
(1350, 'Colliers Anti-puces & Répulsifs', 674, '🔗'),
(1351, 'Compléments & Vitamines Animaux', 674, '💊');

-- Oiseaux (662) — compléter
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1352, 'Jouets & Balançoires Oiseaux', 662, '🪅'),
(1353, 'Soin Plumes & Bains Oiseaux', 662, '🛁');

-- ══════════════════════════════════════════════════════════════════
-- 9. BÉBÉ & PUÉRICULTURE — catégories trop minces
-- ══════════════════════════════════════════════════════════════════

-- Éveil & Sécurité Bébé (700) — compléter
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1354, 'Veilleuses & Projecteurs Bébé', 700, '🌙'),
(1355, 'Jouets d\'Éveil 0-12 mois', 700, '🌈'),
(1356, 'Coins Bébé Sécurisés (coins de table)', 700, '🔒');

-- ══════════════════════════════════════════════════════════════════
-- 10. INFORMATIQUE & SERVEURS — catégories trop minces
-- ══════════════════════════════════════════════════════════════════

-- Serveurs & Storage (93) — compléter
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1357, 'Rack & Baies Serveurs', 93, '🗄️'),
(1358, 'Câbles Réseau & Fibre Optique', 93, '🔌'),
(1359, 'Disques Durs Serveur & NAS', 93, '💾');

-- ══════════════════════════════════════════════════════════════════
-- 11. MATÉRIAUX DE CONSTRUCTION — catégories trop minces
-- ══════════════════════════════════════════════════════════════════

-- Isolation & Étanchéité (947) — compléter
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1360, 'Laine de Verre & Mousse Isolante', 947, '🌡️'),
(1361, 'Calfeutrage & Mastics', 947, '🔧'),
(1362, 'Panneaux Sandwich & Toiture Isolée', 947, '🏠');

-- ══════════════════════════════════════════════════════════════════
-- 12. MATÉRIEL MÉDICAL — catégories trop minces
-- ══════════════════════════════════════════════════════════════════

-- Optique & Vision (1072) — compléter
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1363, 'Lunettes de Protection & Sécurité', 1072, '🥽'),
(1364, 'Appareils Basse Vision & Malvoyants', 1072, '👁️');

-- Maternité & Soins Nouveau-né (1076) — compléter
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1365, 'Coussin d\'Allaitement & Maternité', 1076, '🤱'),
(1366, 'Tests de Grossesse & Ovulation', 1076, '🌸');

-- ══════════════════════════════════════════════════════════════════
-- 13. SÉCURITÉ & SURVEILLANCE — catégories trop minces
-- ══════════════════════════════════════════════════════════════════

-- Protection Incendie (786) — compléter
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1367, 'Panneaux Sécurité & Signalisation Incendie', 786, '⚠️'),
(1368, 'Portes Coupe-Feu', 786, '🚪'),
(1369, 'Couvertures Anti-Feu', 786, '🧯');

-- ══════════════════════════════════════════════════════════════════
-- 14. MAISON — catégories trop minces
-- ══════════════════════════════════════════════════════════════════

-- Eau & Purification (1214) — compléter
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1370, 'Filtres à Eau par Gravité (jerry-cans filtrants)', 1214, '💧'),
(1371, 'Stérilisateurs UV & Osmoseurs', 1214, '🔬'),
(1372, 'Pompes Domestiques & Surpresseurs', 1214, '⚡');

-- Moustiquaires (1209) — compléter
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1373, 'Insecticides & Produits Moustiques', 1209, '🧪'),
(1374, 'Bracelets & Patchs Anti-moustiques', 1209, '💚');

-- ══════════════════════════════════════════════════════════════════
-- 15. MUSIQUE & INSTRUMENTS — catégories trop minces
-- ══════════════════════════════════════════════════════════════════

-- Accessoires Musique (735) — compléter
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1375, 'Étuis & Housses d\'Instruments', 735, '🎸'),
(1376, 'Amplificateurs & Pédales d\'Effets', 735, '🔊');

-- Instruments à Vent (721) — compléter
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1377, 'Harmonicas', 721, '🎵'),
(1378, 'Didgeridoo & Instruments Ethno-Vent', 721, '🌍');

-- ══════════════════════════════════════════════════════════════════
-- 16. SERVICES & OCCASIONS — catégories trop minces
-- ══════════════════════════════════════════════════════════════════

-- Cadeaux & Occasions (861) — compléter
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1379, 'Décorations Nouvel An & Fêtes Locales', 861, '🎆'),
(1380, 'Paniers & Corbeilles Cadeaux', 861, '🧺'),
(1381, 'Cadeaux Entreprise & Goodies', 861, '🏢');

-- Services Numériques (868) — compléter
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1382, 'Crédits & Forfaits MTN MoMo / Moov', 868, '📲'),
(1383, 'Abonnements Canal+, Netflix & IPTV', 868, '📺'),
(1384, 'Domaines Web & Hébergement', 868, '🌐'),
(1385, 'Codes Promo & Bons Plans', 868, '🏷️');

-- Impression & Personnalisation (873) — compléter
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1386, 'Coques Téléphone Personnalisées', 873, '📱'),
(1387, 'Affiches, Bannières & Roll-up', 873, '🖼️'),
(1388, 'Broderies & Logos sur Vêtements', 873, '🪡');

-- ══════════════════════════════════════════════════════════════════
-- 17. LIVRES & MÉDIAS — compléter Médias & Divertissement (591)
-- ══════════════════════════════════════════════════════════════════
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1389, 'Magazines & Presse', 591, '📰'),
(1390, 'Jeux de Société & Puzzles Adultes', 591, '🎲');

-- ══════════════════════════════════════════════════════════════════
-- 18. AGRICULTURE — compléter Pêche & Aquaculture (979)
-- ══════════════════════════════════════════════════════════════════
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1391, 'Glacières & Conservation Poisson', 979, '🧊'),
(1392, 'Embarcations & Pirogues', 979, '⛵'),
(1393, 'Moteurs Hors-Bord & Avirons', 979, '🔧');

-- ══════════════════════════════════════════════════════════════════
-- 19. TENUES TRADITIONNELLES — compléter Couture Africaine (1020)
-- ══════════════════════════════════════════════════════════════════
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1394, 'Ruban, Dentelle & Passementerie Africaine', 1020, '🪡'),
(1395, 'Boutons, Fermetures & Mercerie', 1020, '🔘'),
(1396, 'Surjeteuses & Machines Broderie', 1020, '🧵');

-- ══════════════════════════════════════════════════════════════════
-- 20. TRANSPORT — compléter Signalisation (1116)
-- ══════════════════════════════════════════════════════════════════
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1397, 'Équipements Parking & Bornage', 1116, '🚧'),
(1398, 'Déflecteurs & Dos d\'Âne', 1116, '🛣️');

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- TOTAL V4 : ~180 sous-catégories ajoutées (IDs 1230–1398)
-- Toutes les catégories vides sont maintenant remplies.
-- Toutes les catégories à 1-3 enfants ont été portées à 5+.
-- ============================================================
