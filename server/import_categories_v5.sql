-- ============================================================================
-- 📦 CATÉGORIES V5 — 20 sous-catégories par catégorie parente
-- IDs : 1400 → 4518  |  ~2950 nouvelles entrées  |  INSERT IGNORE idempotent
-- ============================================================================
SET FOREIGN_KEY_CHECKS = 0;

-- ── 1. ÉLECTRONIQUE (9→20, +11) ──────────────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1400,'TV & Téléviseurs',1,'📺'),
(1401,'Domotique & Maison Connectée',1,'🏠'),
(1402,'Consoles de Jeux',1,'🎮'),
(1403,'Imprimantes & Scanners',1,'🖨️'),
(1404,'Projecteurs & Vidéoprojecteurs',1,'📽️'),
(1405,'Systèmes Son Maison & HiFi',1,'🔊'),
(1406,'Câbles & Adaptateurs Universels',1,'🔌'),
(1407,'Onduleurs & Batteries de Secours',1,'⚡'),
(1408,'Drones & Robots',1,'🚁'),
(1409,'Réseaux Maison (WiFi, Box)',1,'📡'),
(1410,'Accessoires TV & Multimédia',1,'📺');

-- ── 2. TÉLÉPHONES (4→20, +16) ─────────────────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1411,'Téléphones Reconditionnés',2,'♻️'),
(1412,'Téléphones Double SIM',2,'📲'),
(1413,'Téléphones Seniors',2,'📞'),
(1414,'Téléphones Étanches & Robustes',2,'💪'),
(1415,'Tecno, Infinix & Itel',2,'📱'),
(1416,'Samsung Galaxy',2,'📱'),
(1417,'iPhone & Apple',2,'🍎'),
(1418,'Huawei & Honor',2,'📱'),
(1419,'Nokia & HMD',2,'📱'),
(1420,'Xiaomi & Redmi',2,'📱'),
(1421,'Oppo & OnePlus',2,'📱'),
(1422,'Téléphones 5G',2,'📶'),
(1423,'Téléphones Entrée de Gamme',2,'💰'),
(1424,'Téléphones Haut de Gamme',2,'💎'),
(1425,'Téléphones Mi-Gamme',2,'📱'),
(1426,'Téléphones Photographiques',2,'📸');

-- ── 7. ACCESSOIRES TÉLÉPHONE (6→20, +14) ─────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1427,'Écouteurs & Casques Filaires',7,'🎧'),
(1428,'Selfie Stick & Trépieds',7,'🤳'),
(1429,'Cartes Mémoire MicroSD',7,'💾'),
(1430,'Ring Light & Lumières Selfie',7,'💡'),
(1431,'Câbles USB-C & Lightning',7,'🔌'),
(1432,'Chargeurs Sans Fil (Qi)',7,'🔋'),
(1433,'Enceintes Bluetooth Portables',7,'🔊'),
(1434,'Ventilateurs Refroidisseurs Téléphone',7,'❄️'),
(1435,'Bagues, Stickers & PopSockets',7,'💍'),
(1436,'Boîtiers Étanches & Waterproof',7,'🌊'),
(1437,'Lecteurs de Cartes OTG',7,'💳'),
(1438,'Accessoires Photo & Objectifs Téléphone',7,'📷'),
(1439,'Câbles Magnétiques de Recharge',7,'🔌'),
(1440,'Stylets & Crayons Tactiles',7,'✏️');

-- ── 15. ORDINATEURS (5→20, +15) ───────────────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1441,'Ordinateurs All-in-One',15,'🖥️'),
(1442,'Chromebooks',15,'💻'),
(1443,'PC Gaming Tour',15,'🎮'),
(1444,'Ordinateurs Reconditionnés',15,'♻️'),
(1445,'Ordinateurs Apple Mac',15,'🍎'),
(1446,'Ordinateurs Éducation & Enfants',15,'📚'),
(1447,'Ordinateurs Industriels & Robustes',15,'🏭'),
(1448,'Systèmes NUC & Nano PC',15,'🔲'),
(1449,'PC Multimédia & HTPC',15,'🎬'),
(1450,'Thin Clients & Postes Légers',15,'💡'),
(1451,'Kits PC à Monter (Barebone)',15,'🔧'),
(1452,'Ordinateurs Linux',15,'🐧'),
(1453,'Stations de Travail CAO',15,'🖥️'),
(1454,'PC Serveur Tour',15,'🗄️'),
(1455,'Ordinateurs Tablettes Pro',15,'📱');

-- ── 16. ORDINATEURS PORTABLES (3→20, +17) ────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1456,'Laptops Bureautique',16,'💼'),
(1457,'Laptops Étudiant',16,'🎓'),
(1458,'MacBook Apple',16,'🍎'),
(1459,'Laptops HP',16,'💻'),
(1460,'Laptops Dell',16,'💻'),
(1461,'Laptops Lenovo ThinkPad & IdeaPad',16,'💻'),
(1462,'Laptops Asus',16,'💻'),
(1463,'Laptops Acer',16,'💻'),
(1464,'Laptops Samsung',16,'💻'),
(1465,'Laptops Reconditionnés',16,'♻️'),
(1466,'Laptops Pro & Business',16,'👔'),
(1467,'Laptops Écran Tactile',16,'👆'),
(1468,'Laptops 17 pouces & Grand Écran',16,'📐'),
(1469,'Laptops Légers & Fins (Ultraslim)',16,'✈️'),
(1470,'Laptops Linux',16,'🐧'),
(1471,'Laptops Moins de 150 000 FCFA',16,'💰'),
(1472,'Laptops Multimédia & Créatifs',16,'🎨');

-- ── 26. TABLETTES & E-READERS (4→20, +16) ────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1473,'Tablettes Samsung Galaxy Tab',26,'📱'),
(1474,'Tablettes Huawei MatePad',26,'📱'),
(1475,'Tablettes Amazon Fire',26,'📚'),
(1476,'Tablettes Lenovo',26,'📱'),
(1477,'Tablettes Éducatives Enfants',26,'📚'),
(1478,'Tablettes Gaming',26,'🎮'),
(1479,'Tablettes Reconditionnées',26,'♻️'),
(1480,'Tablettes Graphiques & Dessin',26,'🎨'),
(1481,'Tablettes Industrielles & Robustes',26,'🏭'),
(1482,'Tablettes Double SIM & 4G',26,'📶'),
(1483,'Tablettes Windows',26,'💻'),
(1484,'Tablettes Entrée de Gamme',26,'💰'),
(1485,'Housses & Claviers Tablettes',26,'⌨️'),
(1486,'Stylets & Accessoires Tablettes',26,'✏️'),
(1487,'Supports & Socles Tablettes',26,'📐'),
(1488,'Chargeurs & Câbles Tablettes',26,'🔌');

-- ── 31. AUDIO & CASQUES (7→20, +13) ──────────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1489,'Barre de Son & Soundbar',31,'🔊'),
(1490,'Enceintes de Salon Hi-Fi',31,'🎵'),
(1491,'Platines Vinyle & Tourne-disques',31,'💿'),
(1492,'Récepteurs & Amplificateurs Audio',31,'🔊'),
(1493,'Casques à Réduction de Bruit',31,'🎧'),
(1494,'Écouteurs Gaming',31,'🎮'),
(1495,'Enceintes Étanches (Outdoor)',31,'🌊'),
(1496,'Systèmes 5.1 & Home Cinema Audio',31,'🎬'),
(1497,'Accessoires Audio (câbles, adaptateurs)',31,'🔌'),
(1498,'Radios & Postes Radio',31,'📻'),
(1499,'Lecteurs MP3 & Baladeurs',31,'🎵'),
(1500,'Haut-parleurs Solaires & Rechargeables',31,'☀️'),
(1501,'Microphones de Conférence & Podcast',31,'🎙️');

-- ── 40. CAMÉRAS & PHOTOGRAPHIE (9→20, +11) ───────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1502,'Trépied & Stabilisateurs',40,'📷'),
(1503,'Sacs & Housses Appareil Photo',40,'🎒'),
(1504,'Cartes Mémoire CF & SD',40,'💾'),
(1505,'Batteries & Chargeurs Photo',40,'🔋'),
(1506,'Filtres & Polarisants',40,'🌈'),
(1507,'Imprimantes Photo',40,'🖨️'),
(1508,'Caméras de Surveillance DIY',40,'👁️'),
(1509,'Éclairage Studio & Softbox',40,'💡'),
(1510,'Toiles de Fond & Décors Studio',40,'🎭'),
(1511,'Appareils Photo Instantanés',40,'📸'),
(1512,'Caméras 360° & VR',40,'🌐');

-- ── 53. MONTRES & WEARABLES (5→20, +15) ──────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1513,'Smartwatches Samsung Galaxy Watch',53,'⌚'),
(1514,'Apple Watch & Accessoires',53,'🍎'),
(1515,'Smartwatches Huawei & Honor',53,'⌚'),
(1516,'Smartwatches Xiaomi & Amazfit',53,'⌚'),
(1517,'Montres Sport & Triathlon (Garmin)',53,'🏃'),
(1518,'Bracelets Connectés Bébé & Enfants',53,'👶'),
(1519,'Traceurs GPS & Balises',53,'📍'),
(1520,'Montres Classiques Analogiques',53,'🕐'),
(1521,'Montres de Luxe & Prestige',53,'💎'),
(1522,'Montres Solaires & Écologiques',53,'☀️'),
(1523,'Bagues Connectées',53,'💍'),
(1524,'Lunettes Connectées & AR',53,'👓'),
(1525,'Capteurs Santé & IoT Portables',53,'❤️'),
(1526,'Bracelets Anti-moustiques Connectés',53,'🦟'),
(1527,'Accessoires Smartwatch (bracelets, chargeurs)',53,'🔌');

-- ── 61. ACCESSOIRES INFORMATIQUES (7→20, +13) ────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1528,'Webcams & Caméras PC',61,'📷'),
(1529,'Imprimantes & Cartouches',61,'🖨️'),
(1530,'Écrans & Moniteurs',61,'🖥️'),
(1531,'Tablettes Graphiques',61,'🎨'),
(1532,'Scanners & Lecteurs',61,'📄'),
(1533,'Lampes de Bureau LED',61,'💡'),
(1534,'Tapis Souris & Bureaux Gaming',61,'🖱️'),
(1535,'Nettoyants & Produits Entretien PC',61,'🧹'),
(1536,'Antivols & Câbles de Sécurité PC',61,'🔒'),
(1537,'Boîtiers PC & Châssis',61,'🖥️'),
(1538,'Sacs & Housses Ordinateur',61,'🎒'),
(1539,'Adaptateurs DisplayPort / HDMI',61,'🔌'),
(1540,'Tiroirs & Fixations Écran',61,'🔧');

-- ── 72. PÉRIPHÉRIQUES JEUX (6→20, +14) ───────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1541,'Manettes PS4 & PS5',72,'🎮'),
(1542,'Manettes Xbox',72,'🎮'),
(1543,'Manettes Nintendo Switch',72,'🎮'),
(1544,'Claviers Gaming Mécaniques',72,'⌨️'),
(1545,'Souris Gaming',72,'🖱️'),
(1546,'Casques Gaming & Micro',72,'🎧'),
(1547,'Écrans Gaming Haute Fréquence',72,'🖥️'),
(1548,'Jeux PS4 & PS5',72,'💿'),
(1549,'Jeux Xbox',72,'💿'),
(1550,'Jeux Nintendo Switch',72,'💿'),
(1551,'Cartes Cadeaux & Codes Jeux',72,'🎁'),
(1552,'Figurines & Amiibo',72,'🧸'),
(1553,'Consoles Rétro & Émulation',72,'🕹️'),
(1554,'Accessoires VR & Réalité Virtuelle',72,'🥽');

-- ── 81. INFORMATIQUE & SERVEURS (3→20, +17) ──────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1555,'Ordinateurs de Bureau Pro',81,'🖥️'),
(1556,'Postes de Travail & Workstations',81,'💼'),
(1557,'Systèmes d\'Exploitation (OS)',81,'💿'),
(1558,'Licences & Logiciels Pro',81,'📋'),
(1559,'Câbles Réseau & Fibre Optique',81,'🌐'),
(1560,'Switches & Hubs Réseau',81,'🔀'),
(1561,'Pare-feu & Sécurité Réseau',81,'🛡️'),
(1562,'Points d\'Accès WiFi Professionnel',81,'📡'),
(1563,'Bornes WiFi Extérieures',81,'📡'),
(1564,'Écrans & Moniteurs Professionnels',81,'🖥️'),
(1565,'Imprimantes Réseau Pro',81,'🖨️'),
(1566,'Claviers & Souris Professionnels',81,'⌨️'),
(1567,'Coffrets & Baies 19 Pouces',81,'🗄️'),
(1568,'UPS & Onduleurs Réseau',81,'⚡'),
(1569,'Gestion à Distance (KVM, IPMI)',81,'🔧'),
(1570,'Consommables Serveur (RAM, HDD)',81,'💾'),
(1571,'Maintenance & Support Informatique',81,'🛠️');

-- ── 82. COMPOSANTS PC (9→20, +11) ────────────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1572,'Boîtiers PC & Tours',82,'🖥️'),
(1573,'Écrans & Moniteurs',82,'🖥️'),
(1574,'Cartes Son',82,'🎵'),
(1575,'Lecteurs DVD / Blu-ray',82,'💿'),
(1576,'Cartes Réseau & WiFi',82,'📡'),
(1577,'Contrôleurs RAID',82,'💾'),
(1578,'Câbles Internes SATA & PCIe',82,'🔌'),
(1579,'Ventilateurs & Watercooling',82,'❄️'),
(1580,'Pieds & Supports Boîtier',82,'🔧'),
(1581,'Pâte Thermique & Accessoires Montage',82,'🧴'),
(1582,'Kits de Mise à Niveau PC Complets',82,'⬆️');

-- ── 93. SERVEURS & STORAGE (6→20, +14) ───────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1583,'Serveurs Rack 1U / 2U',93,'🗄️'),
(1584,'Serveurs Lame (Blade)',93,'🗄️'),
(1585,'Mini Serveurs & Home Lab',93,'🖥️'),
(1586,'Disques Durs NAS (WD Red, Seagate)',93,'💾'),
(1587,'Baies de Stockage (DAS)',93,'🗄️'),
(1588,'Bandes Magnétiques & Archives',93,'📼'),
(1589,'Onduleurs & Alimentation Serveur',93,'⚡'),
(1590,'Mémoire RAM Serveur ECC',93,'🧠'),
(1591,'Processeurs Serveur (Xeon, EPYC)',93,'⚙️'),
(1592,'Système de Sauvegarde & Backup',93,'🔄'),
(1593,'Logiciels Virtualisation (VMware)',93,'💻'),
(1594,'Hyperconvergé & Software Defined',93,'🌐'),
(1595,'Gestion Réseau & Supervision',93,'📊'),
(1596,'Armoires & Refroidissement Datacenter',93,'🏭');

-- ── 97. RÉSEAU & CONNECTIVITÉ (5→20, +15) ────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1597,'Box Internet & CPL',97,'📡'),
(1598,'Câbles Ethernet Cat5e / Cat6 / Cat7',97,'🔌'),
(1599,'Convertisseurs Fibre Optique',97,'💡'),
(1600,'VPN Hardware',97,'🛡️'),
(1601,'Téléphones IP & VoIP',97,'📞'),
(1602,'Points d\'Accès WiFi 6',97,'📶'),
(1603,'Antennes WiFi Directionnelles',97,'📡'),
(1604,'Décodeurs IPTV & Multicast',97,'📺'),
(1605,'Gestion de Bande Passante (QoS)',97,'⚡'),
(1606,'Câbles Coaxiaux & Connecteurs',97,'🔌'),
(1607,'Prises RJ45 & Outils Réseau',97,'🔧'),
(1608,'Armoires Murales & Patch Panels',97,'🗄️'),
(1609,'Analyseurs Réseau & Testeurs',97,'🔍'),
(1610,'GSM / 4G Gateway',97,'📶'),
(1611,'Systèmes de Détection d\'Intrusion Réseau',97,'🛡️');

-- ── 103. LOGICIELS & SERVICES (7→20, +13) ────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1612,'Logiciels Éducatifs & E-Learning',103,'📚'),
(1613,'Logiciels Comptabilité & Gestion',103,'💼'),
(1614,'Logiciels Médical & Santé',103,'🏥'),
(1615,'Logiciels Agriculture & Élevage',103,'🌾'),
(1616,'Logiciels Retouche Vidéo Mobile',103,'🎬'),
(1617,'Applications Android & iOS (licences)',103,'📱'),
(1618,'Logiciels Sauvegarde & Récupération',103,'🔄'),
(1619,'Plateformes Cloud (AWS, Azure...)',103,'☁️'),
(1620,'Logiciels Caisse & Point de Vente',103,'💳'),
(1621,'Logiciels Restauration & Hôtellerie',103,'🍽️'),
(1622,'Logiciels Architecture & BTP',103,'🏗️'),
(1623,'Logiciels Traduction & Langues',103,'🌍'),
(1624,'Abonnements Office 365 & G-Suite',103,'📧');

-- ── 106. SUITES BUREAUTIQUES (7→20, +13) ─────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1625,'WPS Office & Alternatives Gratuites',106,'📄'),
(1626,'OnlyOffice & Collabora',106,'📄'),
(1627,'Logiciels Présentation (Impress, Keynote)',106,'📊'),
(1628,'Tableaux & Feuilles de Calcul',106,'📈'),
(1629,'Logiciels de Traitement de Texte',106,'✏️'),
(1630,'Outils de Signature Électronique',106,'✍️'),
(1631,'Gestionnaires de Tâches & Kanban',106,'✅'),
(1632,'Outils de Prise de Notes (OneNote)',106,'📝'),
(1633,'Logiciels de Formulaires & Sondages',106,'📋'),
(1634,'Outils de Publication Assistée',106,'📰'),
(1635,'Logiciels de Traduction Bureautique',106,'🌍'),
(1636,'Outils de Comparaison de Documents',106,'🔍'),
(1637,'Suites Bureautiques sur Abonnement',106,'♾️');

-- ── 107. ANTIVIRUS & SÉCURITÉ (6→20, +14) ────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1638,'Norton & McAfee',107,'🛡️'),
(1639,'Bitdefender & ESET',107,'🛡️'),
(1640,'Trend Micro & Sophos',107,'🛡️'),
(1641,'Antivirus Gratuit (AVG, Avira)',107,'🛡️'),
(1642,'Sécurité Mobile Android & iOS',107,'📱'),
(1643,'Protection Enfants & Contrôle Parental',107,'👶'),
(1644,'Chiffrement & Cryptage de Données',107,'🔐'),
(1645,'Anti-ransomware & Anti-phishing',107,'🚨'),
(1646,'Outils de Suppression de Malwares',107,'🧹'),
(1647,'Détection d\'Intrusion (IDS)',107,'👁️'),
(1648,'Sécurité Cloud & SaaS',107,'☁️'),
(1649,'Audit & Test de Pénétration',107,'🔍'),
(1650,'Certificats SSL & HTTPS',107,'🔒'),
(1651,'Formations Cybersécurité',107,'📚');

-- ── 108. VPN & PROXIES (5→20, +15) ───────────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1652,'VPN pour Streaming (Netflix, Prime)',108,'🎬'),
(1653,'VPN Illimité & Sans Log',108,'♾️'),
(1654,'VPN pour Gaming',108,'🎮'),
(1655,'VPN Mobile Android & iOS',108,'📱'),
(1656,'VPN Routeur (DD-WRT, OpenWRT)',108,'📡'),
(1657,'Proxy HTTP & HTTPS',108,'🌐'),
(1658,'Accès Tor & Dark Web Sécurisé',108,'🕵️'),
(1659,'VPN Gratuit & Open Source',108,'💰'),
(1660,'VPN Multi-appareils (5-10 connexions)',108,'💻'),
(1661,'VPN Entreprise & Teams',108,'🏢'),
(1662,'IP Dédiée & Résidence Proxy',108,'🏠'),
(1663,'Proxies Mobiles & Rotatifs',108,'🔄'),
(1664,'Protection DNS & DoH',108,'🔒'),
(1665,'Tests de Fuite DNS & VPN',108,'🔍'),
(1666,'Comparatifs & Guides VPN',108,'📖');

-- ── 109. JEUX PC (7→20, +13) ──────────────────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1667,'Jeux MOBA (LoL, Dota 2)',109,'🎮'),
(1668,'Jeux MMORPG & Mondes Ouverts',109,'🌍'),
(1669,'Jeux Survival & Battle Royale',109,'⚔️'),
(1670,'Jeux Musique & Rythme',109,'🎵'),
(1671,'Jeux Horreur & Suspense',109,'👻'),
(1672,'Jeux Éducatifs & Sérieux',109,'📚'),
(1673,'Jeux Rétro & Émulateurs',109,'🕹️'),
(1674,'Jeux Afrique & Locaux',109,'🌍'),
(1675,'Jeux Gratuits (F2P)',109,'💰'),
(1676,'Monnaie de Jeu & V-Bucks',109,'💰'),
(1677,'Plateformes Steam & Epic (crédits)',109,'🛒'),
(1678,'Guides & Soldes de Jeux',109,'📖'),
(1679,'Accessoires Gaming (tapis, siège)',109,'🎮');

-- ── 110. LOGICIELS DESIGN (6→20, +14) ────────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1680,'Clipart, Polices & Assets Créatifs',110,'🎨'),
(1681,'Logiciels de Maquette & Mockup',110,'📐'),
(1682,'Logiciels de Broderie & Patron',110,'🧵'),
(1683,'Montage Audio & Podcast',110,'🎙️'),
(1684,'Animation 2D & 3D (After Effects)',110,'🎬'),
(1685,'Logiciels de Plan Architecture',110,'🏗️'),
(1686,'Logiciels CAO & Mécanique (SolidWorks)',110,'⚙️'),
(1687,'Logiciels de Dessin Vectoriel',110,'✏️'),
(1688,'Outils Collaboration & Prototypage',110,'🤝'),
(1689,'Logiciels Impression 3D',110,'🖨️'),
(1690,'Éditeurs d\'Images en Ligne',110,'🌐'),
(1691,'Logiciels de Reconnaissance Texte (OCR)',110,'🔍'),
(1692,'Logiciels NFT & Art Numérique',110,'🖼️'),
(1693,'Formations Design en Ligne',110,'📚');

-- ── 111. LOGICIELS DÉVELOPPEMENT (7→20, +13) ─────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1694,'Langages de Programmation (Python, JS)',111,'🐍'),
(1695,'Développement Mobile (Flutter, React Native)',111,'📱'),
(1696,'Développement Web Frontend',111,'🌐'),
(1697,'Développement Web Backend',111,'🔧'),
(1698,'APIs & Intégrations (REST, GraphQL)',111,'🔗'),
(1699,'Machine Learning & IA',111,'🤖'),
(1700,'Développement Jeux (Unity, Unreal)',111,'🎮'),
(1701,'Sécurité & Pentest',111,'🔒'),
(1702,'Cloud & Infrastructure (AWS, GCP)',111,'☁️'),
(1703,'Blockchain & Smart Contracts',111,'⛓️'),
(1704,'No-Code & Low-Code (Bubble, AppGyver)',111,'🧩'),
(1705,'Automatisation & Scripts (Zapier, n8n)',111,'⚡'),
(1706,'Formations Dev & Certifications',111,'🎓');

-- ── 112. MODE & VÊTEMENTS (12→20, +8) ────────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1707,'Maillots de Bain & Beachwear',112,'🏖️'),
(1708,'Vêtements de Sport & Fitness',112,'🏋️'),
(1709,'Vêtements Bébé & Nourrissons',112,'👶'),
(1710,'Vêtements Grande Taille',112,'👗'),
(1711,'Vêtements Maternité & Grossesse',112,'🤰'),
(1712,'Seconde Main & Friperie',112,'♻️'),
(1713,'Créateurs & Marques Locales Béninois',112,'🇧🇯'),
(1714,'Vêtements Anti-chaleur & Tropicaux',112,'☀️');

-- ── 113. VÊTEMENTS HOMMES (4→20, +16) ────────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1715,'Hoodies & Sweats Hommes',113,'👕'),
(1716,'Débardeurs & T-Shirts de Sport',113,'🏋️'),
(1717,'Djellabas & Boubous Hommes',113,'👘'),
(1718,'Costumes & Complets Hommes',113,'👔'),
(1719,'Chinos & Pantalons Décontractés',113,'👖'),
(1720,'Shorts & Bermudas Hommes',113,'🩳'),
(1721,'Sous-vêtements & Slips Hommes',113,'🩲'),
(1722,'Pyjamas & Vêtements Intérieur H',113,'🌙'),
(1723,'Maillots de Bain Hommes',113,'🩱'),
(1724,'Vêtements de Travail Hommes',113,'🦺'),
(1725,'Vêtements Sport & Football',113,'⚽'),
(1726,'Manteaux & Parkas Hommes',113,'🧥'),
(1727,'Tenues Traditionnelles Hommes',113,'👘'),
(1728,'Vêtements Grande Taille Hommes',113,'👔'),
(1729,'Vêtements Cérémonie & Mariage H',113,'🤵'),
(1730,'Vêtements Reconditionnés Hommes',113,'♻️');

-- ── 114. T-SHIRTS & POLOS (3→20, +17) ────────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1731,'T-Shirts Graphiques & Imprimés',114,'🎨'),
(1732,'T-Shirts Oversized',114,'👕'),
(1733,'T-Shirts Col V',114,'👕'),
(1734,'T-Shirts Col Rond Basiques',114,'👕'),
(1735,'T-Shirts Manches Longues',114,'👕'),
(1736,'T-Shirts Sérigraphiés Personnalisés',114,'🎭'),
(1737,'T-Shirts Béninois & Africains',114,'🇧🇯'),
(1738,'T-Shirts de Football & Maillots',114,'⚽'),
(1739,'T-Shirts Musique & Culture',114,'🎵'),
(1740,'T-Shirts en Coton Bio',114,'🌿'),
(1741,'Polos Slim Fit',114,'👕'),
(1742,'Polos Grande Taille',114,'👕'),
(1743,'Polos d\'Entreprise Brodés',114,'🏢'),
(1744,'Polos de Sport & Golf',114,'⛳'),
(1745,'Polos Été & Légère Maille',114,'☀️'),
(1746,'T-Shirts Enfants & Ados',114,'👦'),
(1747,'Packs T-Shirts Multi-couleurs',114,'📦');

-- ── 118. CHEMISES & BLOUSES H (3→20, +17) ────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1748,'Chemises Oxford & Twill',118,'👔'),
(1749,'Chemises Lin & Coton Léger',118,'☀️'),
(1750,'Chemises Slim Fit',118,'👔'),
(1751,'Chemises Regular Fit',118,'👔'),
(1752,'Chemises Col Mao',118,'👘'),
(1753,'Chemises à Carreaux',118,'🟦'),
(1754,'Chemises Imprimées & Tropicales',118,'🌺'),
(1755,'Chemises de Soirée & Smoking',118,'🤵'),
(1756,'Chemises Sans Manches & Débardeurs',118,'🩲'),
(1757,'Chemises Grande Taille',118,'👔'),
(1758,'Chemises Double Boutonnage',118,'👔'),
(1759,'Chemises Brodées Africaines',118,'🇧🇯'),
(1760,'Chemises Techniques (anti-transpiration)',118,'🏋️'),
(1761,'Chemises Col Boutonné (button-down)',118,'👔'),
(1762,'Chemises Flanelle & Automne',118,'🍂'),
(1763,'Chemises Reconditionnées',118,'♻️'),
(1764,'Lots & Packs Chemises',118,'📦');

-- ── 123. PANTALONS & SHORTS H (4→20, +16) ────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1765,'Pantalons de Jogging & Survêtement',123,'🏃'),
(1766,'Pantalons Cargo & Multi-poches',123,'🎒'),
(1767,'Pantalons en Lin & Été',123,'☀️'),
(1768,'Pantalons Grande Taille',123,'👖'),
(1769,'Pantalons Slim & Skinny',123,'👖'),
(1770,'Pantalons Larges & Baggy',123,'👖'),
(1771,'Pantalons de Travail & Sécurité',123,'🦺'),
(1772,'Pantalons Traditionnels Africains',123,'👘'),
(1773,'Shorts de Bain & Bermudas Plage',123,'🏖️'),
(1774,'Shorts de Sport & Football',123,'⚽'),
(1775,'Shorts Casual & Été',123,'☀️'),
(1776,'Shorts Grande Taille',123,'🩳'),
(1777,'Jeans Skinny',123,'👖'),
(1778,'Jeans Baggy & Loose',123,'👖'),
(1779,'Jeans Stretch & Comfort',123,'👖'),
(1780,'Jeans Reconditionnés',123,'♻️');

-- ── 131. VESTES & MANTEAUX H (3→20, +17) ─────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1781,'Vestes Légères & Coupe-vent',131,'🌬️'),
(1782,'Vestes en Jean',131,'👖'),
(1783,'Vestes de Sport & Zippées',131,'🏋️'),
(1784,'Vestes Imperméables & Pluie',131,'🌧️'),
(1785,'Vestes Militaires & Field Jacket',131,'🪖'),
(1786,'Bombers & Aviateurs',131,'✈️'),
(1787,'Vestes Africaines & Boubous H',131,'👘'),
(1788,'Blousons & Doudounes Légères',131,'❄️'),
(1789,'Vestes de Costume Séparées',131,'👔'),
(1790,'Vestes Grande Taille',131,'🧥'),
(1791,'Vestes de Travail & Sécurité',131,'🦺'),
(1792,'Gilets & Sans-manches',131,'🩲'),
(1793,'Vestes Cargo & Tactiques',131,'🎒'),
(1794,'Vestes de Soirée & Smoking',131,'🤵'),
(1795,'Vestes Reconditionnées',131,'♻️'),
(1796,'Vestes Laine & Cachemire',131,'🧶'),
(1797,'Manteaux Imperméables Longs',131,'🌧️');

-- ── 138. VÊTEMENTS FEMMES (6→20, +14) ────────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1798,'Shorts Femmes',138,'🩳'),
(1799,'Combinaisons & Combishorts',138,'👗'),
(1800,'Hoodies & Sweatshirts Femmes',138,'👕'),
(1801,'Vêtements de Sport Femmes',138,'🏋️'),
(1802,'Maillots de Bain Femmes',138,'🩱'),
(1803,'Robes de Grossesse & Maternité',138,'🤰'),
(1804,'Vêtements Africains & Pagne Femme',138,'🇧🇯'),
(1805,'Vêtements Grande Taille Femmes',138,'👗'),
(1806,'Vêtements de Soirée & Gala',138,'✨'),
(1807,'Vêtements Intérieur & Pyjamas F',138,'🌙'),
(1808,'Gilets & Cardigans Femmes',138,'🧥'),
(1809,'Tuniques & Caftans',138,'👘'),
(1810,'Vêtements Seconde Main Femmes',138,'♻️'),
(1811,'Créatrices Locales & Marques Béninoises',138,'🇧🇯');

-- ── 139. ROBES (2→20, +18) ────────────────────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1812,'Robes Casual & Quotidien',139,'👗'),
(1813,'Robes de Bureau & Formelles',139,'💼'),
(1814,'Robes Traditionnelles en Pagne',139,'🇧🇯'),
(1815,'Robes de Grossesse & Maternité',139,'🤰'),
(1816,'Robes Courtes',139,'👗'),
(1817,'Robes Mi-longues (Midi)',139,'👗'),
(1818,'Robes Plage & Été',139,'🏖️'),
(1819,'Robes Imprimées & Colorées',139,'🎨'),
(1820,'Robes en Dentelle',139,'🌸'),
(1821,'Robes en Pagne Africain',139,'👘'),
(1822,'Robes de Mariée & Cérémonie',139,'💒'),
(1823,'Robes de Soirée Africaines',139,'✨'),
(1824,'Robes Sportswear',139,'🏋️'),
(1825,'Robes Pull & Tricot',139,'🧶'),
(1826,'Robes Chemise',139,'👔'),
(1827,'Robes Bustier & Bretelles',139,'👗'),
(1828,'Robes Fluides & Légères',139,'💨'),
(1829,'Robes Grande Taille',139,'👗');

-- ── 142. JUPES (2→20, +18) ───────────────────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1830,'Jupes en Pagne Africain',142,'🇧🇯'),
(1831,'Jupes Plissées',142,'👗'),
(1832,'Jupes Droites & Crayon',142,'👗'),
(1833,'Jupes Évasées & Fluides',142,'👗'),
(1834,'Jupes Portefeuille',142,'👗'),
(1835,'Jupes en Jean',142,'👖'),
(1836,'Jupes Brodées & Dentelle',142,'🌸'),
(1837,'Jupes de Soirée & Gala',142,'✨'),
(1838,'Jupes Sport & Tennis',142,'🎾'),
(1839,'Jupes de Bureau',142,'💼'),
(1840,'Jupes Tutu & Écossaise',142,'🩰'),
(1841,'Jupes Grande Taille',142,'👗'),
(1842,'Jupes Maternité',142,'🤰'),
(1843,'Jupes Mi-longues (Midi)',142,'👗'),
(1844,'Jupes Maxi Soirée',142,'✨'),
(1845,'Jupes en Cuir & Similicuir',142,'👗'),
(1846,'Jupes Imprimées & Colorées',142,'🎨'),
(1847,'Jupes Seconde Main',142,'♻️');

-- ── 145. PANTALONS & LEGGINGS F (2→20, +18) ──────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1848,'Pantalons en Pagne Africain',145,'🇧🇯'),
(1849,'Pantalons de Bureau & Formels',145,'💼'),
(1850,'Pantalons Larges & Palazzo',145,'👖'),
(1851,'Pantalons Slim & Skinny F',145,'👖'),
(1852,'Pantalons Cargo Femmes',145,'🎒'),
(1853,'Pantalons de Jogging Femmes',145,'🏃'),
(1854,'Pantalons en Lin & Coton',145,'☀️'),
(1855,'Pantalons Grande Taille F',145,'👖'),
(1856,'Pantalons Maternité',145,'🤰'),
(1857,'Shorts & Bermudas Femmes',145,'🩳'),
(1858,'Leggings Sport & Compression',145,'🏋️'),
(1859,'Leggings Push-Up',145,'🍑'),
(1860,'Leggings Imprimés',145,'🎨'),
(1861,'Leggings Thermiques',145,'❄️'),
(1862,'Leggings Grande Taille',145,'👗'),
(1863,'Jeans Femme Taille Haute',145,'👖'),
(1864,'Jeans Femme Bootcut & Flare',145,'👖'),
(1865,'Jeans Femme Reconditionnés',145,'♻️');

SET FOREIGN_KEY_CHECKS = 1;

SET FOREIGN_KEY_CHECKS = 0;

-- ── 169. VÊTEMENTS ENFANTS (8→20, +12) ───────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1866,'Ensembles & Tenues Complètes Enfants',169,'👗'),
(1867,'Uniformes Scolaires',169,'🎒'),
(1868,'Vêtements Bébé 0-3 mois',169,'👶'),
(1869,'Déguisements & Costumes Enfants',169,'🎭'),
(1870,'Vêtements de Bain Enfants',169,'🏊'),
(1871,'Vêtements Sport Enfants',169,'⚽'),
(1872,'Robes & Tenues Filles',169,'👗'),
(1873,'Chemises & Polos Garçons',169,'👔'),
(1874,'Pantalons & Jeans Enfants',169,'👖'),
(1875,'Sous-vêtements Enfants',169,'🩲'),
(1876,'Vêtements Africains Enfants (Pagne)',169,'🇧🇯'),
(1877,'Vêtements Grande Taille Enfants',169,'👕');

-- ── 180. CHAUSSURES (3→20, +17) ──────────────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1878,'Chaussures de Sport Polyvalentes',180,'👟'),
(1879,'Chaussures Artisanales Béninoises',180,'🇧🇯'),
(1880,'Chaussures de Mariage & Cérémonie',180,'💒'),
(1881,'Chaussures de Travail & Sécurité',180,'🦺'),
(1882,'Chaussures Imperméables',180,'🌧️'),
(1883,'Chaussures Légères & Tongs',180,'🩴'),
(1884,'Chaussures Grande Taille',180,'👞'),
(1885,'Chaussures Reconditionnées',180,'♻️'),
(1886,'Semelles & Accessoires Chaussures',180,'🦶'),
(1887,'Chaussures Bébé & Nourrissons',180,'👶'),
(1888,'Chaussures Orthopédiques',180,'🏥'),
(1889,'Chaussures en Cuir Véritable',180,'🐄'),
(1890,'Chaussures Fantaisie & Créateurs',180,'✨'),
(1891,'Chaussures Légères Tressées (Raphia)',180,'🌿'),
(1892,'Chaussures Montagne & Trekking',180,'🏔️'),
(1893,'Chaussures Lacées & Richelieu',180,'👞'),
(1894,'Chaussures Slip-On & Sans-lacet',180,'🩴');

-- ── 181. CHAUSSURES HOMMES (6→20, +14) ───────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1895,'Derbies & Richelieu Hommes',181,'👞'),
(1896,'Loafers & Mocassins Hommes',181,'👞'),
(1897,'Chaussures de Running Hommes',181,'🏃'),
(1898,'Chaussures de Football Hommes',181,'⚽'),
(1899,'Claquettes & Slides Hommes',181,'🩴'),
(1900,'Chaussures Légères Lin & Raphia',181,'🌿'),
(1901,'Boots Chelsea & Chukka Hommes',181,'🥾'),
(1902,'Espadrilles Hommes',181,'👞'),
(1903,'Chaussures de Mariage Hommes',181,'💒'),
(1904,'Chaussures Orthopédiques Hommes',181,'🏥'),
(1905,'Chaussures Sécurité & Embouts Acier',181,'🦺'),
(1906,'Chaussures Grande Taille Hommes',181,'👞'),
(1907,'Sneakers Montantes Hommes',181,'👟'),
(1908,'Chaussures Reconditionnées H',181,'♻️');

-- ── 189. CHAUSSURES FEMMES (6→20, +14) ───────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1909,'Talons Bloc & Chunky Femmes',189,'👠'),
(1910,'Compensées & Plateformes',189,'👠'),
(1911,'Mocassins & Chaussures Plates',189,'👞'),
(1912,'Tongs & Claquettes Femmes',189,'🩴'),
(1913,'Running & Chaussures Sport F',189,'🏃'),
(1914,'Chaussures Légères Pagne & Raphia',189,'🇧🇯'),
(1915,'Mules & Sabots Femmes',189,'👡'),
(1916,'Chaussures de Mariage F',189,'💒'),
(1917,'Chaussures Grande Taille F',189,'👠'),
(1918,'Chaussures Reconditionnées F',189,'♻️'),
(1919,'Espadrilles & Toile Femmes',189,'👞'),
(1920,'Boots Femmes Zippées',189,'🥾'),
(1921,'Chaussures Bureau Confort F',189,'💼'),
(1922,'Mocassins Africains & Artisanaux',189,'🇧🇯');

-- ── 197. CHAUSSURES ENFANTS (4→20, +16) ──────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1923,'Chaussures de Running Enfants',197,'🏃'),
(1924,'Claquettes & Sandales Enfants',197,'🩴'),
(1925,'Bottes Imperméables Enfants',197,'🌧️'),
(1926,'Chaussures de Football Enfants',197,'⚽'),
(1927,'Chaussures Lumineuses Enfants',197,'💡'),
(1928,'Mocassins & Babies Filles',197,'👞'),
(1929,'Chaussures Semelle Souple Bébé',197,'👶'),
(1930,'Chaussures Orthopédiques Enfants',197,'🏥'),
(1931,'Chaussures Danse & Ballet',197,'🩰'),
(1932,'Chaussures Taille XXS/XS (16-22)',197,'👞'),
(1933,'Chaussures Taille 23-30',197,'👞'),
(1934,'Chaussures Taille 31-38',197,'👞'),
(1935,'Chaussures de Fête Enfants',197,'🎉'),
(1936,'Chaussures Traditionnelles Enfants',197,'🇧🇯'),
(1937,'Chaussures Grande Taille Enfants',197,'👟'),
(1938,'Chaussures Reconditionnées Enfants',197,'♻️');

-- ── 206. ACCESSOIRES MODE (10→20, +10) ───────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1939,'Colliers & Chaînes',206,'📿'),
(1940,'Boucles d\'Oreilles',206,'💎'),
(1941,'Bracelets & Manchettes',206,'🌿'),
(1942,'Sacs Tote & Cabas',206,'👜'),
(1943,'Sacs à Dos Mode',206,'🎒'),
(1944,'Chapeau Panama & Paille',206,'🎩'),
(1945,'Turbans & Foulards Tête',206,'🧣'),
(1946,'Masques & Bijoux de Visage',206,'✨'),
(1947,'Porte-clés & Breloques',206,'🔑'),
(1948,'Badges & Pins Mode',206,'📌');

-- ── 300. MAISON & DÉCORATION (10→20, +10) ────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1949,'Salles de Bain & Sanitaires',300,'🚿'),
(1950,'Climatisation & Ventilation Maison',300,'❄️'),
(1951,'Sécurité Maison & Serrures',300,'🔒'),
(1952,'Rangements & Organisation',300,'📦'),
(1953,'Décoration Extérieure & Entrée',300,'🌿'),
(1954,'Papier Peint & Revêtements Muraux',300,'🖼️'),
(1955,'Tapis & Revêtements de Sol',300,'🪵'),
(1956,'Vêtements de Maison (Tabliers, Gants)',300,'🧤'),
(1957,'Poubelles & Gestion Déchets',300,'🗑️'),
(1958,'Domotique & Automatisation Maison',300,'🏠');

-- ── 301. MEUBLES (6→20, +14) ─────────────────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1959,'Tables Basses & Tables Gigognes',301,'🪑'),
(1960,'Buffets & Bahuts',301,'🗄️'),
(1961,'Bibliothèques & Étagères',301,'📚'),
(1962,'Meubles TV & Multimédias',301,'📺'),
(1963,'Meubles de Salle de Bain',301,'🚿'),
(1964,'Meubles d\'Entrée & Vestiaires',301,'🚪'),
(1965,'Meubles de Jardin & Terrasse',301,'🌿'),
(1966,'Meubles Enfants & Chambre Bébé',301,'👶'),
(1967,'Meubles en Bois Local Béninois',301,'🪵'),
(1968,'Meubles en Rotin & Bambou',301,'🎋'),
(1969,'Meubles Multifonctions & Gain de Place',301,'🔲'),
(1970,'Meubles de Cuisine & Bar',301,'🍽️'),
(1971,'Meubles de Bureau Maison',301,'💼'),
(1972,'Meubles Seconde Main',301,'♻️');

-- ── 308. LITERIE & TEXTILES (4→20, +16) ──────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1973,'Oreillers & Traversins',308,'😴'),
(1974,'Couettes & Édredons',308,'🛏️'),
(1975,'Alèses & Protège-matelas',308,'🛏️'),
(1976,'Matelas & Sommiers',308,'🛏️'),
(1977,'Serviettes de Bain & Peignoirs',308,'🛁'),
(1978,'Nappes & Sets de Table',308,'🍽️'),
(1979,'Torchons & Tabliers Cuisine',308,'🍳'),
(1980,'Linge de Table Africain',308,'🇧🇯'),
(1981,'Moustiquaires de Lit Imprégnées',308,'🦟'),
(1982,'Couvertures Anti-chaleur Légères',308,'☀️'),
(1983,'Housses de Canapé & Fauteuil',308,'🛋️'),
(1984,'Cache-oreillers Décoratifs',308,'🌸'),
(1985,'Draps Bébé & Enfants',308,'👶'),
(1986,'Draps Microfibre & Bambou',308,'🎋'),
(1987,'Couvertures Lestées',308,'😴'),
(1988,'Textiles de Bain Enfants',308,'🛁');

-- ── 313. CUISINE & ARTS DE LA TABLE (6→20, +14) ──────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1989,'Planches à Découper',313,'🔪'),
(1990,'Couteaux & Bloc Couteaux',313,'🔪'),
(1991,'Mixeurs & Robots Ménagers',313,'🥣'),
(1992,'Épices & Condiments Cuisine',313,'🌶️'),
(1993,'Ustensiles Cuisine Africaine',313,'🫕'),
(1994,'Mortiers & Pilons',313,'🫙'),
(1995,'Cantines & Gamelles',313,'🍱'),
(1996,'Bouteilles & Gourdes Isothermes',313,'🥤'),
(1997,'Verres & Caraffes',313,'🥛'),
(1998,'Services à Thé & Café',313,'☕'),
(1999,'Poêles & Casseroles Antiadhésives',313,'🍳'),
(2000,'Cuisinières à Gaz & Réchauds',313,'🔥'),
(2001,'Friteuses & Airfryers',313,'🍟'),
(2002,'Boîtes de Conservation Alimentaire',313,'📦');

-- ── 320. DÉCORATION INTÉRIEURE (6→20, +14) ───────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(2003,'Sculptures & Statues Décoratives',320,'🗿'),
(2004,'Plantes Artificielles & Plantes Vertes',320,'🌿'),
(2005,'Lanternes & Photophores',320,'🕯️'),
(2006,'Stickers Muraux & Décalcomanies',320,'✨'),
(2007,'Décorations Africaines & Ethniques',320,'🇧🇯'),
(2008,'Coussins & Poufs Décoratifs',320,'🛋️'),
(2009,'Fontaines d\'Intérieur & Bambou',320,'💧'),
(2010,'Suspensions & Mobiles Décoratifs',320,'🌀'),
(2011,'Rideaux & Voilages',320,'🪟'),
(2012,'Tapis Décoratifs & Berbères',320,'🟫'),
(2013,'Boîtes & Coffrets Décoratifs',320,'🎁'),
(2014,'Céramiques & Poteries Décoratives',320,'🏺'),
(2015,'Tableaux Africains & Peintures Murales',320,'🖼️'),
(2016,'Guirlandes & Décorations Lumineuses',320,'✨');

-- ── 327. JARDIN & EXTÉRIEUR (6→20, +14) ──────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(2017,'Parasols & Tonnelles',327,'☂️'),
(2018,'Hamacs & Chaises Longues',327,'🏖️'),
(2019,'Pots de Fleurs & Jardinières',327,'🌸'),
(2020,'Engrais & Terreau Jardinage',327,'🌱'),
(2021,'Éclairage Extérieur Solaire',327,'☀️'),
(2022,'Clôtures & Bordures Jardin',327,'🌿'),
(2023,'Composteurs & Recyclage Jardin',327,'♻️'),
(2024,'Filets & Treillages de Jardin',327,'🔲'),
(2025,'Serres & Tunnels Jardin',327,'🌱'),
(2026,'Piscines Hors-Sol & Gonflables',327,'🏊'),
(2027,'Tapis de Jardin & Terrasse',327,'🪵'),
(2028,'Bacs à Sable & Jeux Extérieur',327,'🏖️'),
(2029,'Pompes de Fontaine & Bassin',327,'💧'),
(2030,'Décorations Jardin (gnomes, statues)',327,'🪨');

-- ── 334. ÉLECTROMÉNAGER (8→20, +12) ──────────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(2031,'Climatiseurs Split & Portables',334,'❄️'),
(2032,'Ventilateurs & Brasseurs d\'Air',334,'💨'),
(2033,'Cuisinières & Fourneaux',334,'🔥'),
(2034,'Chauffe-eau Électriques',334,'🚿'),
(2035,'Hotte & Extracteur Cuisine',334,'🌬️'),
(2036,'Cafetières & Machines Expresso',334,'☕'),
(2037,'Robots Cuiseurs Multifonctions',334,'🍲'),
(2038,'Sèche-linge & Séchoirs',334,'🌬️'),
(2039,'Congélateurs Coffre',334,'🧊'),
(2040,'Pompe à Eau Domestique',334,'💧'),
(2041,'Ioniseurs & Purificateurs d\'Air',334,'🌬️'),
(2042,'Électroménager Reconditionné',334,'♻️');

-- ── 343. BRICOLAGE & OUTILLAGE (6→20, +14) ───────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(2043,'Perceuses & Visseuses',343,'🔧'),
(2044,'Scies Circulaires & Scies Sauteuses',343,'🪚'),
(2045,'Ponceuses & Polisseuses',343,'🔧'),
(2046,'Pistolets à Colle & Mastic',343,'🔫'),
(2047,'Niveaux Laser & Mesure',343,'📐'),
(2048,'Bâches & Protections Travaux',343,'🏗️'),
(2049,'Masques & EPI Bricolage',343,'😷'),
(2050,'Coffrets & Boîtes à Outils',343,'🧰'),
(2051,'Ciment Colle & Enduits',343,'🏠'),
(2052,'Papier Abrasif & Ponçage',343,'🔧'),
(2053,'Pistolets à Peinture',343,'🎨'),
(2054,'Mèches, Lames & Consommables',343,'🔩'),
(2055,'Alarmes & Détecteurs DIY',343,'🔔'),
(2056,'Kits de Réparation Maison',343,'🔧');

-- ── 350. BEAUTÉ & SANTÉ (9→20, +11) ──────────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(2057,'Épilation & Rasage Femme',350,'✨'),
(2058,'Manucure & Pédicure',350,'💅'),
(2059,'Soins Solaires & Après-Soleil',350,'☀️'),
(2060,'Accessoires Beauté (pinceaux, miroirs)',350,'🪞'),
(2061,'Coffrets & Kits Beauté Cadeaux',350,'🎁'),
(2062,'Matériel Salon de Coiffure',350,'💈'),
(2063,'Produits Blanchiment Dents',350,'🦷'),
(2064,'Matériel Esthétique Professionnel',350,'💆'),
(2065,'Huiles & Sérums Anti-âge',350,'✨'),
(2066,'Produits Naturels & Bio Beauté',350,'🌿'),
(2067,'Tatouages & Art Corporel',350,'🎨');

-- ── 351. SOINS VISAGE (5→20, +15) ────────────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(2068,'Huiles Visage & Sérums Précieux',351,'✨'),
(2069,'Crèmes Anti-rides & Anti-âge',351,'⏳'),
(2070,'Soins Hydratants Peaux Sèches',351,'💧'),
(2071,'Soins Visage Peaux Grasses',351,'🌿'),
(2072,'Soins Peaux Mixtes',351,'🌸'),
(2073,'Eau Micellaire & Démaquillants',351,'💦'),
(2074,'Toners & Lotions Équilibrantes',351,'🌿'),
(2075,'Mousses Nettoyantes & Gels',351,'🫧'),
(2076,'Crèmes SPF & Protection Solaire',351,'☀️'),
(2077,'Patches Yeux & Lèvres',351,'👁️'),
(2078,'Crèmes Éclat Peau Noire',351,'✨'),
(2079,'Soins Anti-taches & Hyperpigmentation',351,'🌸'),
(2080,'Soins Barbe & Contour Visage H',351,'🧔'),
(2081,'Soins Visage Naturels & DIY',351,'🌿'),
(2082,'Appareils Soins Visage (LED, ultrasons)',351,'💡');

-- ── 357. SOINS CORPS (5→20, +15) ─────────────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(2083,'Beurre de Karité & Corps',357,'🌿'),
(2084,'Huile de Coco & Corps',357,'🥥'),
(2085,'Lait & Crème Éclaircissante Corps',357,'✨'),
(2086,'Soins Anti-cellulite',357,'💪'),
(2087,'Soins Pieds & Talons',357,'🦶'),
(2088,'Soins Mains & Ongles',357,'💅'),
(2089,'Gommages & Peeling Corps',357,'✨'),
(2090,'Soins Ventre & Post-partum',357,'🤰'),
(2091,'Crèmes Après-rasage Corps',357,'🧴'),
(2092,'Huiles de Massage Corps',357,'💆'),
(2093,'Savons Hydratants & Crème',357,'🛁'),
(2094,'Soins Corps Bio & Naturels',357,'🌿'),
(2095,'Soins Corps Homme',357,'🧔'),
(2096,'Crème Solaire Corps SPF',357,'☀️'),
(2097,'Produits Allaitement & Post-natal',357,'🤱');

-- ── 363. MAQUILLAGE (6→20, +14) ───────────────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(2098,'BB Cream & CC Cream',363,'✨'),
(2099,'Poudres Compactes & Libres',363,'🌸'),
(2100,'Bronzers, Enlumineurs & Highlighters',363,'✨'),
(2101,'Correcteurs & Anti-cernes',363,'👁️'),
(2102,'Fards à Paupières',363,'👁️'),
(2103,'Sourcils : Crayons, Gels & Poudres',363,'🖊️'),
(2104,'Lèvres : Liners & Contour',363,'💋'),
(2105,'Fixateurs & Sprays de Maquillage',363,'💦'),
(2106,'Maquillage Peau Noire (teintes foncées)',363,'🇧🇯'),
(2107,'Maquillage Mariage & Cérémonie',363,'💒'),
(2108,'Maquillage Enfants & Carnaval',363,'🎭'),
(2109,'Kits Maquillage Complets',363,'🎁'),
(2110,'Démaquillants & Lingettes',363,'💦'),
(2111,'Accessoires Maquillage (éponges, applicateurs)',363,'💄');

-- ── 370. PARFUMS & FRAGRANCES (4→20, +16) ────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(2112,'Parfums Arabes & Oud',370,'🕌'),
(2113,'Parfums Africains & Locaux',370,'🌍'),
(2114,'Parfums Floraux',370,'🌸'),
(2115,'Parfums Boisés & Musqués',370,'🪵'),
(2116,'Parfums Épicés & Orientaux',370,'🌶️'),
(2117,'Parfums Citrus & Frais',370,'🍊'),
(2118,'Huiles Parfumées Concentration',370,'💧'),
(2119,'Encens & Bâtonnets Parfumés',370,'🕯️'),
(2120,'Parfums Maison & Sprays d\'Ambiance',370,'🏠'),
(2121,'Eau de Cologne & After-shave',370,'🧴'),
(2122,'Parfums Corpo (Lotion, Brume)',370,'✨'),
(2123,'Coffrets Parfum Cadeau',370,'🎁'),
(2124,'Parfums Unisexes',370,'⚤'),
(2125,'Parfums Luxe & Prestige',370,'💎'),
(2126,'Mini-parfums & Format Voyage',370,'✈️'),
(2127,'Parfums Bio & Naturels',370,'🌿');

-- ── 375. SOINS CHEVEUX (6→20, +14) ───────────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(2128,'Huile de Ricin & Croissance',375,'🌿'),
(2129,'Traitements Kératine & Lissage',375,'✨'),
(2130,'Soins Cheveux Bouclés & Frisés',375,'🌀'),
(2131,'Soins Locks & Dreadlocks',375,'🧘'),
(2132,'Shampooings Anti-pelliculaires',375,'❄️'),
(2133,'Masques Cheveux Profonds',375,'🌿'),
(2134,'Huile Argan & Avocat',375,'🥑'),
(2135,'Casques Chauffants',375,'💡'),
(2136,'Sèche-cheveux & Diffuseurs',375,'💨'),
(2137,'Rouleaux & Bigoudi Chauffants',375,'🌀'),
(2138,'Peignes Démêlants',375,'🪮'),
(2139,'Bandeaux & Accessoires Coiffure',375,'🎀'),
(2140,'Sprays Thermo-protecteurs',375,'🔥'),
(2141,'Soins Cheveux Naturels DIY',375,'🌿');

-- ── 382. SOINS HOMME (6→20, +14) ──────────────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(2142,'Tondeuses & Rasoirs Électriques',382,'✂️'),
(2143,'Rasoirs Mécaniques & Lames',382,'🪒'),
(2144,'Huiles & Baumes Barbe',382,'🧔'),
(2145,'Taille-barbe & Tondeuses Contour',382,'✂️'),
(2146,'Shampooing Homme',382,'🚿'),
(2147,'Gel Douche & Savon Homme',382,'🧼'),
(2148,'Déodorants Homme',382,'💪'),
(2149,'Crème Hydratante Homme',382,'🧴'),
(2150,'Soins Anti-acné Homme',382,'✨'),
(2151,'Spray Fixant Coiffure Homme',382,'💆'),
(2152,'Cire, Gel & Gomme Coiffure H',382,'💈'),
(2153,'Soins Pieds Homme',382,'🦶'),
(2154,'Kits Soin Complets Homme',382,'🎁'),
(2155,'Soins Homme Naturels & Bio',382,'🌿');

-- ── 386. SANTÉ & BIEN-ÊTRE (7→20, +13) ───────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(2156,'Tensiomètres & Glucomètres',386,'❤️'),
(2157,'Thermomètres Médicaux',386,'🌡️'),
(2158,'Tests Rapides (paludisme, covid...)',386,'🔬'),
(2159,'Médicaments Sans Ordonnance',386,'💊'),
(2160,'Préparations Phytothérapie Africaine',386,'🌿'),
(2161,'Matériaux Premiers Secours',386,'🩹'),
(2162,'Orthèses & Ceintures de Soutien',386,'🦾'),
(2163,'Appareils Physiothérapie',386,'⚡'),
(2164,'Soins Auditifs & Appareils',386,'👂'),
(2165,'Soins Dentaires Maison',386,'🦷'),
(2166,'Huiles Essentielles Thérapeutiques',386,'🌿'),
(2167,'Compléments Immunité & Énergie',386,'💪'),
(2168,'Formations & Livres Santé',386,'📚');

-- ── 393. BIEN-ÊTRE & RELAXATION (5→20, +15) ──────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(2169,'Tapis de Yoga & Pilates',393,'🧘'),
(2170,'Accessoires Méditation',393,'🕉️'),
(2171,'Bains de Pieds & Spa Maison',393,'🛁'),
(2172,'Coussins de Massage Chauffants',393,'💆'),
(2173,'Rouleaux de Massage (Foam Roller)',393,'🔄'),
(2174,'Pistolets de Massage Fasciaux',393,'💪'),
(2175,'Boules de Jade & Pierres Gua Sha',393,'💚'),
(2176,'Aromatiques & Senteurs Relaxantes',393,'🌸'),
(2177,'Bougies de Massage',393,'🕯️'),
(2178,'Produits Hammam & Gommage',393,'🛁'),
(2179,'Literie de Relaxation',393,'😴'),
(2180,'Appareils TENS & Électrostimulation',393,'⚡'),
(2181,'Sauna Portable & Infrarouge',393,'🔥'),
(2182,'Cérémonies Thé & Détente',393,'🍵'),
(2183,'Applications & Guides Bien-être',393,'📱');

-- ── 400. SPORT & LOISIRS (15→20, +5) ─────────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(2184,'Patins & Sports de Glisse',400,'⛸️'),
(2185,'Équitation & Sports Équestres',400,'🐴'),
(2186,'Sports Extrêmes & Urbains',400,'🛹'),
(2187,'Golf',400,'⛳'),
(2188,'Yoga & Arts Martiaux Doux',400,'🧘');

SET FOREIGN_KEY_CHECKS = 1;

SET FOREIGN_KEY_CHECKS = 0;

-- ── 401. FOOTBALL (5→20, +15) ─────────────────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(2189,'Crampons de Football',401,'⚽'),
(2190,'Gardiens de But (gants, équipements)',401,'🧤'),
(2191,'Entraînement Technique (plots, échelles)',401,'🏋️'),
(2192,'Tableaux Tactiques Football',401,'📋'),
(2193,'Shorts & Chaussettes Football',401,'🧦'),
(2194,'Vestes d\'Entraînement Football',401,'🧥'),
(2195,'Sacs de Sport Football',401,'🎒'),
(2196,'Arbitrage & Sifflets Football',401,'🟡'),
(2197,'Montres & GPS Football',401,'⌚'),
(2198,'Accessoires Football Salle (Futsal)',401,'🏟️'),
(2199,'Maillots Clubs Africains',401,'🌍'),
(2200,'Maillots Équipes Nationales',401,'🇧🇯'),
(2201,'Brancards & Sécurité Terrain',401,'🏥'),
(2202,'Filets de Remplacement',401,'🔲'),
(2203,'Pompes & Aiguilles pour Ballons',401,'💨');

-- ── 407. BASKETBALL (5→20, +15) ───────────────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(2204,'Tenues de Basketball',407,'🏀'),
(2205,'Genouillères & Protections Basketball',407,'🦵'),
(2206,'Sacs Basketball',407,'🎒'),
(2207,'Pompes & Aiguilles Basketball',407,'💨'),
(2208,'Arbitrage Basketball',407,'🟡'),
(2209,'Formations & Tactiques Basketball',407,'📋'),
(2210,'Mini-paniers & Basketball Intérieur',407,'🏠'),
(2211,'Accessoires Streetball',407,'🏙️'),
(2212,'Chaussures Femme Basketball',407,'👟'),
(2213,'Chaussures Homme Basketball',407,'👟'),
(2214,'Chaussures Enfants Basketball',407,'👟'),
(2215,'Paniers Réglables en Hauteur',407,'🏀'),
(2216,'Ballons Taille 3, 5, 7',407,'🏀'),
(2217,'Accessoires Entraînement (dribble)',407,'🤸'),
(2218,'Maillots Clubs & Équipes Nationales',407,'🏀');

-- ── 411. FITNESS & MUSCULATION (6→20, +14) ───────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(2219,'Barres de Traction',411,'🏋️'),
(2220,'Cordes à Sauter',411,'🪢'),
(2221,'Kettlebells',411,'🏋️'),
(2222,'Racks & Cages de Musculation',411,'🏋️'),
(2223,'Bancs de Musculation',411,'🏋️'),
(2224,'Roues Abdominales',411,'🎯'),
(2225,'Ceintures & Attaches Musculation',411,'🏋️'),
(2226,'Gants de Musculation',411,'🧤'),
(2227,'Boules de Stabilité (Swiss Ball)',411,'⚽'),
(2228,'Plateformes Vibratoires',411,'⚡'),
(2229,'Appareils Cardio (vélos d\'appart)',411,'🚴'),
(2230,'Tapis de Course',411,'🏃'),
(2231,'Compléments Whey & Créatine',411,'💪'),
(2232,'Applications Fitness (licences)',411,'📱');

-- ── 418. NATATION & AQUATIQUE (4→20, +16) ────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(2233,'Planches de Natation',418,'🏊'),
(2234,'Palmes & Flotteurs',418,'🩱'),
(2235,'Combinaisons de Natation',418,'🩱'),
(2236,'Pinces Nez & Bouchons Oreilles',418,'👃'),
(2237,'Sacs de Natation',418,'🎒'),
(2238,'Casques de Piscine (bonnet)',418,'🧢'),
(2239,'Chronomètres Natation',418,'⏱️'),
(2240,'Serviettes Microfibre Piscine',418,'🏊'),
(2241,'Jouets Piscine Enfants',418,'🦆'),
(2242,'Pompes à Piscine',418,'💧'),
(2243,'Produits Traitement Eau Piscine',418,'🧪'),
(2246,'Maillots de Bain Enfants',418,'🩱'),
(2247,'Lunettes de Plongée',418,'🥽'),
(2248,'Accessoires Aquagym',418,'🏋️');

-- ── 423. CYCLISME (4→20, +16) ─────────────────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(2249,'Vélos de Route & Gravel',423,'🚴'),
(2250,'Vélos de BMX',423,'🚵'),
(2251,'Vélos Électriques (VAE)',423,'⚡'),
(2252,'Vélos Pliables',423,'📐'),
(2253,'Vélos Enfants',423,'👶'),
(2254,'Vêtements Cyclisme',423,'🚴'),
(2255,'Chaussures Cyclisme',423,'👟'),
(2256,'Lumières Vélo Avant & Arrière',423,'💡'),
(2257,'Antivols Vélo',423,'🔒'),
(2258,'Guidons & Selles',423,'🚲'),
(2259,'Porte-bagages & Sacoches',423,'🎒'),
(2260,'Ordinateurs de Vélo & GPS',423,'📍'),
(2261,'Pneus & Chambres à Air Vélo',423,'🔵'),
(2262,'Freins, Dérailleur & Transmission',423,'⚙️'),
(2263,'Pompes à Vélo',423,'💨'),
(2264,'Casques Vélo & Protection',423,'⛑️');

-- ── 428. TENNIS & RAQUETTES (6→20, +14) ──────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(2265,'Raquettes Femme Tennis',428,'🎾'),
(2266,'Raquettes Junior Tennis',428,'🎾'),
(2267,'Surgrips & Grips de Raquette',428,'🖐️'),
(2268,'Cordages & Tensions',428,'🎾'),
(2269,'Tables de Ping-Pong',428,'🏓'),
(2270,'Raquettes Ping-Pong',428,'🏓'),
(2271,'Volants & Raquettes Badminton',428,'🏸'),
(2272,'Filets de Tennis Portables',428,'🔲'),
(2273,'Balles de Tennis en Vrac',428,'🟡'),
(2274,'Tenues de Tennis',428,'👗'),
(2275,'Chaussures de Tennis H',428,'👟'),
(2276,'Chaussures de Tennis F',428,'👟'),
(2277,'Sacs de Raquettes',428,'🎒'),
(2278,'Accessoires Arbitrage Tennis',428,'🟡');

-- ── 432. SPORTS DE COMBAT (4→20, +16) ────────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(2279,'Kimonos & Gi Judo / BJJ',432,'🥋'),
(2280,'Kimonos Karaté',432,'🥋'),
(2281,'Vêtements MMA',432,'🥊'),
(2282,'Chevillières & Protège-pieds',432,'🦵'),
(2283,'Ceintures Arts Martiaux',432,'🎗️'),
(2284,'Plastrons & Protège-tibias',432,'🦾'),
(2285,'Protège-dents',432,'😬'),
(2286,'Coquilles de Protection',432,'🛡️'),
(2287,'Tatamis & Moquettes Gym',432,'🟥'),
(2288,'Miroirs de Dojo',432,'🪞'),
(2289,'Cordes Speed Bag Boxe',432,'🥊'),
(2290,'Gants de Kick-boxing',432,'🥊'),
(2291,'Bandelettes & Wraps',432,'🩹'),
(2292,'Chronos & Minuteries Boxe',432,'⏱️'),
(2293,'Gilets de Boxe Thai',432,'🥊'),
(2294,'Mannequins d\'Entraînement',432,'🤼');

-- ── 437. OUTDOOR & RANDONNÉE (5→20, +15) ─────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(2295,'Bâtons de Randonnée',437,'🥢'),
(2296,'Vestes de Randonnée & Imperméables',437,'🌧️'),
(2297,'Pantalons de Randonnée',437,'👖'),
(2298,'Gourdes & Systèmes Hydratation',437,'💧'),
(2299,'Boussoles & GPS Randonnée',437,'🧭'),
(2300,'Réchauds de Camping',437,'🔥'),
(2301,'Couverts & Ustensiles Camping',437,'🍴'),
(2302,'Tables & Chaises de Camping',437,'🪑'),
(2303,'Lampes Frontales',437,'💡'),
(2304,'Couteaux Multifonctions',437,'🔪'),
(2305,'Trousses de Premiers Secours Outdoor',437,'🩹'),
(2306,'Hammocs de Camping',437,'😴'),
(2307,'Survêtements Thermiques',437,'🌡️'),
(2308,'Répulsifs & Protection Insectes',437,'🦟'),
(2309,'Cartes & Guides de Randonnée',437,'🗺️');

-- ── 443. SPORTS AQUATIQUES & PLAGE (5→20, +15) ───────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(2310,'Combinaisons Surf & Plongée',443,'🌊'),
(2311,'Serviettes de Plage',443,'🏖️'),
(2312,'Parasols de Plage',443,'☂️'),
(2313,'Matelas Gonflables Plage',443,'🛏️'),
(2314,'Jeux de Plage (raquettes, frisbee)',443,'🎾'),
(2315,'Masques & Tuba de Plongée',443,'🤿'),
(2316,'Chaussures Aquatiques',443,'👟'),
(2317,'Gilets de Sauvetage',443,'🦺'),
(2318,'Planches de Surf & SUP',443,'🏄'),
(2319,'Filets de Volley Plage',443,'🏐'),
(2320,'Crème Solaire Sport & Plage',443,'☀️'),
(2321,'Lunettes de Mer',443,'🥽'),
(2322,'Sacs Étanches Plage',443,'🌊'),
(2323,'Flotteurs & Bouées Adultes',443,'🟡'),
(2324,'Chariots de Plage',443,'🛒');

-- ── 447. PÊCHE (5→20, +15) ───────────────────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(2325,'Canne Télescopique',447,'🎣'),
(2326,'Canne à Lancer',447,'🎣'),
(2327,'Éperviers & Filets Jetés',447,'🪃'),
(2328,'Swivels, Perles & Accessoires Ligne',447,'⚙️'),
(2329,'Vestes & Gilets Pêcheur',447,'🧥'),
(2330,'Bottes & Waders de Pêche',447,'🥾'),
(2331,'Tables Pliantes Pêche',447,'🪑'),
(2332,'Poissons Appâts Artificiels Locaux',447,'🐟'),
(2333,'Sondes & Détecteurs de Poissons',447,'📡'),
(2334,'Glacières de Pêche',447,'🧊'),
(2335,'Pirogues & Barques Pliables',447,'🛶'),
(2336,'Feux de Position & Sécurité Bord',447,'💡'),
(2337,'Guides de Pêche Locale (Bénin)',447,'📖'),
(2338,'Seaux & Viviers Pêche',447,'🪣'),
(2339,'Pinces & Outils Dégagage',447,'🔧');

-- ── 450. ALIMENTATION (13→20, +7) ────────────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(2340,'Huiles Alimentaires',450,'🫙'),
(2341,'Farines & Mélanges à Pâtisserie',450,'🥐'),
(2342,'Café, Cacao & Chocolat Local',450,'☕'),
(2343,'Noix, Arachides & Légumineuses',450,'🥜'),
(2344,'Aliments Pour Diabétiques & Régimes',450,'🏥'),
(2345,'Épices Importées (curry, cumin...)',450,'🌶️'),
(2346,'Livraison Repas & Traiteur Domicile',450,'🍱');

-- ── 451. CÉRÉALES & FÉCULENTS (5→20, +15) ────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(2347,'Riz Local (Djougou, Glazoué)',451,'🍚'),
(2348,'Maïs Grain & Épi',451,'🌽'),
(2349,'Millet & Mil Local',451,'🌾'),
(2350,'Sorgho & Tchoukoutou',451,'🍺'),
(2351,'Igname Pilée & Farine d\'Igname',451,'🫙'),
(2352,'Patate Douce & Dérivés',451,'🍠'),
(2353,'Manioc & Gari',451,'🫙'),
(2354,'Fonio & Graines Locales',451,'🌾'),
(2355,'Plantain & Banane',451,'🍌'),
(2356,'Couscous & Semoule de Maïs',451,'🍽️'),
(2357,'Haricots & Niébé',451,'🫘'),
(2358,'Pâtes & Macaroni',451,'🍝'),
(2359,'Pain de Maïs & Ablo',451,'🍞'),
(2360,'Bouillie & Akassa',451,'🫕'),
(2361,'Céréales Complètes Nutritives',451,'🥣');

-- ── 457. PRODUITS LOCAUX BÉNINOIS (7→20, +13) ────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(2362,'Noix de Coco & Huile',457,'🥥'),
(2363,'Graines de Néré & Soumbala',457,'🌿'),
(2364,'Moringa & Plantes Médicinales',457,'🌿'),
(2365,'Miel Local & Naturel',457,'🍯'),
(2366,'Ananas & Fruits Exotiques Locaux',457,'🍍'),
(2367,'Tomates Concentrées Locales',457,'🍅'),
(2368,'Feuilles de Baobab (Lalo)',457,'🌿'),
(2369,'Sésame & Graines Oléagineuses',457,'🌱'),
(2370,'Viande de Brousse Séchée',457,'🥩'),
(2371,'Poivre & Grains de Selim Locaux',457,'🫙'),
(2372,'Goussi (Graines de Courge)',457,'🌿'),
(2373,'Haricot Voandzou (pois bambara)',457,'🫘'),
(2374,'Natron (kaun) & Additifs Traditionnels',457,'🫙');

-- ── 465. ÉPICES & CONDIMENTS (5→20, +15) ─────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(2375,'Curcuma & Gingembre',465,'🫙'),
(2376,'Cannelle, Anis & Badiane',465,'🌿'),
(2377,'Ail Séché & Poudre d\'Oignon',465,'🧄'),
(2378,'Piment Sec Entier & Moulu',465,'🌶️'),
(2379,'Bouillon Cube & Magngi',465,'🧂'),
(2380,'Sauce Soja, Oyster & Nuoc-mam',465,'🫙'),
(2381,'Ketchup & Sauces Tomate',465,'🍅'),
(2382,'Moutardes & Cornichons',465,'🫙'),
(2383,'Huile d\'Olive & Spécialités',465,'🫒'),
(2384,'Vinaigre Balsamique & Spécial',465,'🫙'),
(2385,'Mélanges d\'Épices BBQ & Grill',465,'🔥'),
(2386,'Harissa & Sauces Piquantes',465,'🌶️'),
(2387,'Sel de Mer & Fleur de Sel',465,'🧂'),
(2388,'Levure & Poudre à Lever',465,'🍞'),
(2389,'Colorants & Arômes Alimentaires',465,'🎨');

-- ── 471. BOISSONS (7→20, +13) ─────────────────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(2390,'Bières & Bières Artisanales',471,'🍺'),
(2391,'Vins & Champagnes (occasions)',471,'🍷'),
(2392,'Cidres & Pétillants Non Alcoolisés',471,'🍾'),
(2393,'Jus de Fruits 100% Naturels',471,'🍊'),
(2394,'Smoothies & Jus Pressés',471,'🥤'),
(2395,'Laits Végétaux (soja, avoine)',471,'🥛'),
(2396,'Sirop de Grenadine & Fruits',471,'🫙'),
(2397,'Alcool Local (sodabi, vin de palme)',471,'🥃'),
(2398,'Limonade & Boissons Artisanales',471,'🍋'),
(2399,'Tisanes & Infusions Locales',471,'🌿'),
(2400,'Concentrés & Sirops Locaux',471,'🫙'),
(2401,'Eau de Coco Fraîche',471,'🥥'),
(2402,'Kombucha & Boissons Fermentées',471,'🍵');

-- ── 479. CONSERVES & SURGELÉS (6→20, +14) ────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(2403,'Légumineuses en Conserve (haricots)',479,'🫘'),
(2404,'Maïs & Petits Pois en Conserve',479,'🌽'),
(2405,'Tomates & Sauces en Conserve',479,'🍅'),
(2406,'Lait Concentré & Crème',479,'🥛'),
(2407,'Pâtes de Tomate & Concentré',479,'🍅'),
(2408,'Fruits au Sirop',479,'🍑'),
(2409,'Poissons Entiers Surgelés',479,'🐟'),
(2410,'Crevettes & Fruits de Mer Surgelés',479,'🦐'),
(2411,'Frites & Légumes Surgelés',479,'🥔'),
(2412,'Pizzas & Plats Surgelés Importés',479,'🍕'),
(2413,'Glaces & Sorbets',479,'🍦'),
(2414,'Charcuterie & Fromage Importé',479,'🧀'),
(2415,'Boîtes de Repas Prêts (rations)',479,'🍱'),
(2416,'Conserves Artisanales & Locales',479,'🫙');

-- ── 483. PRODUITS LAITIERS & ŒUFS (4→20, +16) ───────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(2417,'Lait de Vache Frais Local',483,'🥛'),
(2418,'Lait UHT Longue Conservation',483,'🥛'),
(2419,'Lait Infantile & Maternité',483,'👶'),
(2420,'Lait de Soja & Végétal',483,'🌱'),
(2421,'Fromage Frais & Demi-sel',483,'🧀'),
(2422,'Fromage Râpé & Fondu',483,'🧀'),
(2423,'Yaourt Nature & Aromatisé',483,'🫙'),
(2424,'Yaourt Bébé',483,'👶'),
(2425,'Crème Fraîche & Liquide',483,'🥛'),
(2426,'Beurre Doux & Demi-sel',483,'🧈'),
(2427,'Beurre de Karité Alimentaire',483,'🌿'),
(2428,'Œufs de Poule Frais',483,'🥚'),
(2429,'Œufs de Caille',483,'🥚'),
(2430,'Lait Concentré Sucré & Non sucré',483,'🥛'),
(2431,'Fromage Importé (Edam, Gouda)',483,'🧀'),
(2432,'Desserts Lactés & Flans',483,'🍮');

-- ── 488. CONFISERIES & SNACKS (4→20, +16) ────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(2433,'Bonbons & Caramels',488,'🍬'),
(2434,'Chewing-gum',488,'🫧'),
(2435,'Lollipop & Sucettes',488,'🍭'),
(2436,'Chocolat au Lait & Noir',488,'🍫'),
(2437,'Snacks Épicés & Pimentés',488,'🌶️'),
(2438,'Popcorn & Maïs Soufflé',488,'🍿'),
(2439,'Cacahuètes Grillées & Salées',488,'🥜'),
(2440,'Noix de Cajou & Noix Grillées',488,'🥜'),
(2441,'Barres Céréales & Granola',488,'🍪'),
(2442,'Crackers & Biscuits Salés',488,'🫙'),
(2443,'Gâteaux Secs & Cookies',488,'🍪'),
(2444,'Brioches & Viennoiseries Emballées',488,'🥐'),
(2445,'Chips de Plantain Locales',488,'🍌'),
(2446,'Sucreries Africaines (soumoun)',488,'🌍'),
(2447,'Céréales du Matin & Müesli',488,'🥣'),
(2448,'Kola & Noisette Africaine',488,'🌰');

-- ── 493. BIO & NATUREL (6→20, +14) ───────────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(2449,'Miel Biologique Local',493,'🍯'),
(2450,'Huile de Palme Rouge Bio',493,'🌿'),
(2451,'Farine de Moringa Bio',493,'🌿'),
(2452,'Légumes Bio Frais (saison)',493,'🥬'),
(2453,'Graines Germées & Pousses',493,'🌱'),
(2454,'Farines Sans Gluten',493,'🌾'),
(2455,'Sucre de Canne Non Raffiné',493,'🍯'),
(2456,'Tisanes & Plantes Bio Locales',493,'🌿'),
(2457,'Cosmétiques Bio (voir Beauté)',493,'🌸'),
(2458,'Produits Végans & Sans Lactose',493,'🐄'),
(2459,'Condiments Bio',493,'🫙'),
(2460,'Céréales Complètes Bio',493,'🌾'),
(2461,'Noix & Fruits Secs Bio',493,'🥜'),
(2462,'Boissons Bio & Kombucha',493,'🍵');

-- ── 500. JOUETS & ENFANTS (8→20, +12) ────────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(2463,'Jeux de Plein Air Aquatiques',500,'💦'),
(2464,'Instruments Musique Enfants',500,'🎵'),
(2465,'Bandes Dessinées Africaines',500,'📚'),
(2466,'Jouets Apprentissage (langue, calcul)',500,'📊'),
(2467,'Jouets Sensoriels & Autisme',500,'🌈'),
(2468,'Cadeaux Anniversaire Enfants',500,'🎁'),
(2469,'Mobilité Enfants (tricycle, draisienne)',500,'🛵'),
(2470,'Jeux de Cartes Africains',500,'🃏'),
(2471,'Piscines Gonflables Enfants',500,'🏊'),
(2472,'Jouets Éducatifs Science',500,'🔬'),
(2473,'Sacs à Dos Enfants',500,'🎒'),
(2474,'Matériel Scolaire & Art Enfants',500,'✏️');

-- ── 501. JOUETS BÉBÉ 0-2 ANS (5→20, +15) ─────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(2475,'Livres Bébé (tissu, bain)',501,'📚'),
(2476,'Portiques & Arches d\'Éveil',501,'🌈'),
(2477,'Balles Sensorielles',501,'⚽'),
(2478,'Jouets de Poussée & Trotteur',501,'🚶'),
(2479,'Jouets Musicaux Bébé',501,'🎵'),
(2480,'Jouets d\'Imitation (téléphone, cuisine)',501,'📞'),
(2481,'Jeux d\'Emboîtement & Tri',501,'🔵'),
(2482,'Pouet-pouet & Hochets Silicone',501,'🧶'),
(2483,'Tapis Sensoriel & Miroir',501,'🪞'),
(2484,'Chaussures & Chaussettes d\'Éveil',501,'🦶'),
(2485,'Portiques Bébé Voiture',501,'🚗'),
(2486,'Mobiles Musicaux',501,'🎵'),
(2487,'Balançoires Bébé',501,'🪷'),
(2488,'Jouets de Bain Bébé',501,'🛁'),
(2489,'Ceintures Portage & Écharpes Bébé',501,'🧣');

-- ── 506. JEUX DE CONSTRUCTION (5→20, +15) ────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(2490,'Lego Technic & Expert',506,'🔧'),
(2491,'Lego City & Friends',506,'🏙️'),
(2492,'Lego Star Wars & Marvel',506,'⭐'),
(2493,'Blocs Duplo (petits enfants)',506,'🟥'),
(2494,'Briques Compatibles Lego (Cobi, Bela)',506,'🔵'),
(2495,'Puzzles 3D Architecture',506,'🏗️'),
(2496,'Maquettes Bateaux & Avions',506,'✈️'),
(2497,'Maquettes Voitures & Véhicules',506,'🚗'),
(2498,'Jeux Magnétiques Enfants',506,'🔵'),
(2499,'Circuits Voitures Piste',506,'🏎️'),
(2500,'Trains Électriques & Rails',506,'🚂'),
(2501,'Construction en Bois',506,'🪵'),
(2502,'Blocs Géants Mousse (bébé)',506,'🔴'),
(2503,'Jeux Ingénierie STEM',506,'🔬'),
(2504,'Kits Architecture & Maquettes Papier',506,'🏛️');

-- ── 510. JEUX DE SOCIÉTÉ (4→20, +16) ─────────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(2505,'Jeux de Mémoire & Observation',510,'🧠'),
(2506,'Jeux de Rapidité & Réflexes',510,'⚡'),
(2507,'Jeux de Coopération',510,'🤝'),
(2508,'Jeux de Devinettes & Charades',510,'❓'),
(2509,'Jeux de Mots (Scrabble, Bananagrams)',510,'📝'),
(2510,'Jeux de Négociation (Catan, Monopoly)',510,'🏘️'),
(2511,'Jeux d\'Ambiance & Party Games',510,'🎉'),
(2512,'Wari & Jeux Traditionnels Africains',510,'🌍'),
(2513,'Jeux de Dés',510,'🎲'),
(2514,'Trivial Pursuit & Questions',510,'❓'),
(2515,'Jeux de Rôle & Narration',510,'📖'),
(2516,'Jeux Enfants 3-6 ans',510,'👶'),
(2517,'Jeux 7-12 ans',510,'🧒'),
(2518,'Jeux Adultes & Soirée',510,'🍷'),
(2519,'Jeux 2 joueurs (Othello, Stratego)',510,'⚔️'),
(2520,'Casse-têtes & Puzzles Adultes',510,'🧩');

-- ── 515. POUPÉES & FIGURINES (4→20, +16) ─────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(2521,'Poupées Barbie & Fashion',515,'👗'),
(2522,'Poupées Bébé & Réalistes',515,'👶'),
(2523,'Poupées Africaines',515,'🌍'),
(2524,'Maisons de Poupées & Mobilier',515,'🏠'),
(2525,'Accessoires Poupées (vêtements)',515,'👗'),
(2526,'Figurines Avengers & DC',515,'🦸'),
(2527,'Figurines Star Wars',515,'⭐'),
(2528,'Figurines Dinosaures & Animaux',515,'🦕'),
(2529,'Figurines Mini Véhicules (Hotwheels)',515,'🚗'),
(2530,'Poupées Chiffon & Tissu',515,'🧸'),
(2531,'Peluches Animaux Réalistes',515,'🐻'),
(2532,'Robots Jouets Interactifs',515,'🤖'),
(2533,'Drones Jouets Enfants',515,'🚁'),
(2534,'Personnages de Dessins Animés Africains',515,'🌍'),
(2535,'Figurines Fer & Résine Artisanales',515,'🎨'),
(2536,'Coffrets Figurines Thématiques',515,'🎁');

-- ── 520. JEUX DE PLEIN AIR (5→20, +15) ───────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(2537,'Cerfs-volants',520,'🪁'),
(2538,'Frisbees & Disques',520,'🥏'),
(2539,'Raquettes de Plage',520,'🏖️'),
(2540,'Badminton de Jardin',520,'🏸'),
(2541,'Jeux de Boules & Pétanque',520,'⚽'),
(2542,'Glissières & Tobogans',520,'🎠'),
(2543,'Jeux d\'eau de Jardin',520,'💦'),
(2544,'Filets de Badminton Portables',520,'🔲'),
(2545,'Jeux de Lawn Tennis',520,'🎾'),
(2546,'Ballons Sauteurs',520,'🏀'),
(2547,'Poignées Grip & Exercice',520,'🏋️'),
(2548,'Jeux de Billes & Toupies',520,'🔵'),
(2549,'Tyroliennes Enfants',520,'🌲'),
(2550,'Murs d\'Escalade Enfants',520,'🧗'),
(2551,'Sports Collectifs Jardin (jeux équipe)',520,'⚽');

-- ── 526. JEUX ÉDUCATIFS & CRÉATIFS (4→20, +16) ───────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(2552,'Ateliers Peinture Enfants',526,'🎨'),
(2553,'Pâte à Modeler & Argile',526,'🏺'),
(2554,'Dessin & Coloriage',526,'✏️'),
(2555,'Origami & Pliage',526,'🦢'),
(2556,'Puzzles Éducatifs Petits Enfants',526,'🧩'),
(2557,'Lettres & Chiffres Magnétiques',526,'🔤'),
(2558,'Cartes Géographiques Enfants',526,'🗺️'),
(2559,'Kits Science & Expériences',526,'🔬'),
(2560,'Electronique Éducative (Arduino Kid)',526,'⚡'),
(2561,'Activités Musicales (clavier jouet)',526,'🎹'),
(2562,'Jeux de Tri Couleurs & Formes',526,'🔵'),
(2563,'Livres Illustrés & Albums Africains',526,'📚'),
(2564,'Kits Couture & Broderie Enfants',526,'🧵'),
(2565,'Jeux de Rôle & Imitation (marché, docteur)',526,'👨‍⚕️'),
(2566,'Jeux Numériques Éducatifs',526,'💻'),
(2567,'Kits Cuisine Enfants',526,'👨‍🍳');

-- ── 531. JEUX VIDÉO ENFANTS (5→20, +15) ──────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(2568,'Jeux Nintendo Switch Enfants',531,'🎮'),
(2569,'Jeux PS4/PS5 PEGI 3 & 7',531,'🎮'),
(2570,'Jeux Xbox Enfants',531,'🎮'),
(2571,'Jeux PC Enfants',531,'💻'),
(2572,'Applications Éducatives Payantes',531,'📱'),
(2573,'Casques VR Enfants',531,'🥽'),
(2574,'Manettes pour Petites Mains',531,'🎮'),
(2575,'Chaises Gaming Enfants',531,'🪑'),
(2576,'Bureaux Gaming Enfants',531,'🖥️'),
(2577,'Casques Gaming Enfants',531,'🎧'),
(2578,'Jeux Kinect & Mouvement',531,'🕺'),
(2579,'Jeux Rétro & Portables Enfants',531,'🕹️'),
(2580,'Codes & Cartes Cadeau Jeux',531,'🎁'),
(2581,'Housses & Accessoires Consoles',531,'🎮'),
(2582,'Jeux Coopératifs Famille',531,'👨‍👩‍👧‍👦');

-- ── 534. DÉGUISEMENTS & CARNAVAL (5→20, +15) ─────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(2583,'Déguisements Princesses & Fées',534,'👸'),
(2584,'Déguisements Super-Héros',534,'🦸'),
(2585,'Déguisements Animaux',534,'🦁'),
(2586,'Déguisements Professionnels (docteur)',534,'👨‍⚕️'),
(2587,'Déguisements Traditionnels Africains',534,'🌍'),
(2588,'Masques Carnaval & Vénitiens',534,'🎭'),
(2589,'Perruques Multicolores',534,'💇'),
(2590,'Spray & Maquillage Corps',534,'🎨'),
(2591,'Accessoires Fête (chapeau, confetti)',534,'🎉'),
(2592,'Décorations Anniversaire',534,'🎂'),
(2593,'Ballons Latex & Mylar',534,'🎈'),
(2594,'Cotillons & Souffleurs',534,'🎊'),
(2595,'Décorations Noël & Fin d\'Année',534,'🎄'),
(2596,'Photo Booth Props & Accessoires',534,'📷'),
(2597,'Tenues Thématiques (années 80...)',534,'🕺');

-- ── 540. AUTO & MOTO (6→20, +14) ─────────────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(2598,'Peinture & Retouche Carrosserie',540,'🎨'),
(2599,'Sièges Bébé & Rehausseurs Auto',540,'👶'),
(2600,'Housses de Siège Auto',540,'🚗'),
(2601,'Alarmes & Traceurs GPS Auto',540,'📍'),
(2602,'Tapis de Sol Voiture',540,'🚗'),
(2603,'Désodorisants & Purificateurs Auto',540,'🌿'),
(2604,'Porte-bagages Toit & Attelage',540,'🎒'),
(2605,'Radar & Détecteur Vitesse',540,'📡'),
(2606,'Fenêtres Teintées & Films Solaires',540,'☀️'),
(2607,'Extincteurs Auto & Sécurité',540,'🔥'),
(2608,'Câbles Diagnostic OBD2',540,'🔧'),
(2609,'Gilets & Triangles de Sécurité',540,'⚠️'),
(2610,'Huiles Moteur & Fluides Auto',540,'🛢️'),
(2611,'Batteries Voiture & Chargeurs',540,'🔋');

-- ── 541. PIÈCES AUTOMOBILES (6→20, +14) ──────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(2612,'Bougies d\'Allumage',541,'⚡'),
(2613,'Courroies & Chaînes Timing',541,'⚙️'),
(2614,'Radiateurs & Refroidissement',541,'❄️'),
(2615,'Boîtes de Vitesses',541,'⚙️'),
(2616,'Direction & Colonne',541,'🚗'),
(2617,'Essuie-glaces & Balais',541,'🌧️'),
(2618,'Rétroviseurs & Vitres',541,'🪟'),
(2619,'Pare-chocs & Carrosserie',541,'🚗'),
(2620,'Tableaux de Bord & Compteurs',541,'📊'),
(2621,'Pompe à Essence',541,'⛽'),
(2622,'Injecteurs & Carburateur',541,'⚙️'),
(2623,'Embrayage & Volant Moteur',541,'🔄'),
(2624,'Amortisseurs & Ressorts',541,'🔧'),
(2625,'Échappements & Catalyseurs',541,'💨');

-- ── 548. ACCESSOIRES AUTO (5→20, +15) ────────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(2626,'Porte-gobelet & Rangements Auto',548,'🥤'),
(2627,'Chargeurs USB Voiture',548,'🔌'),
(2628,'Supports Téléphone Auto',548,'📱'),
(2629,'Couvre-volant',548,'🚗'),
(2630,'Arômes & Diffuseurs Auto',548,'🌿'),
(2631,'Balais Essuie-glace',548,'🌧️'),
(2632,'Caches Bouton & Stickers Auto',548,'✨'),
(2633,'Coffre de Toit & Galerie',548,'📦'),
(2634,'Rideaux & Stores Auto',548,'🪟'),
(2635,'Couvertures de Voiture (bâche)',548,'🛡️'),
(2636,'Alarmes & Antivols Volant',548,'🔒'),
(2637,'Neon Intérieur & Éclairage Auto',548,'💡'),
(2638,'Jantes & Enjoliveurs',548,'🔵'),
(2639,'Câbles Remorquage',548,'🚗'),
(2640,'Kits Premiers Secours Voiture',548,'🩹');

-- ── 554. MOTO & SCOOTER (4→20, +16) ──────────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(2641,'Scooters 50cc & 125cc',554,'🛵'),
(2642,'Motos Cross & Enduro',554,'🏍️'),
(2643,'Motos Custom & Chopper',554,'🏍️'),
(2644,'Vélos Électriques Moto (e-bike)',554,'⚡'),
(2645,'Vêtements & Blousons Moto',554,'🧥'),
(2646,'Bottes de Moto',554,'🥾'),
(2647,'Gants de Moto',554,'🧤'),
(2648,'Protections Dorsale & Épaules',554,'🛡️'),
(2649,'GPS Moto',554,'📍'),
(2650,'Porte-bagages & Sacoches Moto',554,'🎒'),
(2651,'Manomètres & Outils Moto',554,'🔧'),
(2652,'Antivols Moto',554,'🔒'),
(2653,'Housses & Bâches Moto',554,'🛡️'),
(2654,'Casques Moto Intégraux',554,'🪖'),
(2655,'Casques Jet & Demi-jet',554,'🪖'),
(2656,'Batteries & Démarreurs Moto',554,'🔋');

-- ── 559. VÉHICULES ÉLECTRIQUES (5→20, +15) ───────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(2657,'Trottinettes Électriques Adultes',559,'🛴'),
(2658,'Trottinettes Enfants Électriques',559,'🛴'),
(2659,'Vélos Électriques VTT',559,'🚵'),
(2660,'Vélos Électriques Ville',559,'🚴'),
(2661,'Vélos Cargo Électriques',559,'📦'),
(2662,'Hover Boards & Segway',559,'🛹'),
(2663,'Gyropodes & Monoroues',559,'⭕'),
(2664,'Scooters Électriques Petite Cylindrée',559,'🛵'),
(2665,'Batteries & Packs de Remplacement',559,'🔋'),
(2666,'Chargeurs Rapides Véhicules Élec.',559,'⚡'),
(2667,'Accessoires Trottinette',559,'🛴'),
(2668,'Casques Vélo Élec. & Trottinette',559,'⛑️'),
(2669,'Protections Genoux & Coudes',559,'🛡️'),
(2670,'Applications & Diagnostic Véhicule Élec.',559,'📱'),
(2671,'Entretien & Pièces Véhicules Élec.',559,'🔧');

-- ── 563. ENTRETIEN & NETTOYAGE AUTO (3→20, +17) ──────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(2672,'Shampooing Carrosserie',563,'🚗'),
(2673,'Nettoyant Jantes & Pneus',563,'🔵'),
(2674,'Polish & Cire de Protection',563,'✨'),
(2675,'Nettoyant Habitacle & Tableau de Bord',563,'🧹'),
(2676,'Nettoyant Moteur & Dégraissant',563,'🔧'),
(2677,'Chiffons & Éponges Microfibres Auto',563,'🧽'),
(2678,'Kit Nettoyage Complet Voiture',563,'🎁'),
(2679,'Balais Brosse & Raclettes',563,'🧹'),
(2680,'Pistolet Lavage Haute Pression',563,'💦'),
(2681,'Nettoyant Vitres Auto',563,'🪟'),
(2682,'Revitalisant Cuir & Plastiques',563,'🧴'),
(2683,'Désinfectants & Assainisseurs Auto',563,'🦠'),
(2684,'Housses de Protection Peinture',563,'🎨'),
(2685,'Anti-mousse & Traitement Pneus',563,'🔵'),
(2686,'Rénovateur Phares Ternis',563,'💡'),
(2688,'Produits Anti-pluie Vitres',563,'🌧️');

-- ── 567. OUTILS & ÉQUIPEMENTS AUTO (5→20, +15) ───────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(2689,'Clés à Choc & Clés Dynamométriques',567,'🔧'),
(2690,'Outils de Démontage Intérieur',567,'🪛'),
(2691,'Valises de Climatisation Auto',567,'❄️'),
(2692,'Outils de Correction de Carrosserie',567,'🔨'),
(2693,'Kits Ponceuse Orbitale & Polisseuse',567,'🔧'),
(2694,'Vérins & Chandelles',567,'🔩'),
(2695,'Pistolets Peinture Auto',567,'🎨'),
(2696,'Outils de Transmission & Embrayage',567,'⚙️'),
(2697,'Kits Réparation Crevaison',567,'🔵'),
(2698,'Détecteur de Rouille & Scan Carrosserie',567,'🔍'),
(2699,'Banc de Redressage Carrosserie',567,'🏗️'),
(2700,'Chargeur & Testeur Batterie',567,'🔋'),
(2701,'Pompe à Peinture Airless',567,'🎨'),
(2702,'Compresseurs Portatifs',567,'💨'),
(2703,'Stations de Charge VE (borne maison)',567,'⚡');

SET FOREIGN_KEY_CHECKS = 1;

SET FOREIGN_KEY_CHECKS = 0;

-- ── 580. LIVRES & MÉDIAS (4→20, +16) ─────────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(2704,'Jeux & Divertissement Famille',580,'🎲'),
(2705,'E-books & Livres Numériques',580,'📱'),
(2706,'Podcasts & Émissions Audio',580,'🎙️'),
(2707,'Cours & MOOC en Ligne',580,'💻'),
(2708,'Cartes Éducatives & Flashcards',580,'📇'),
(2709,'Abonnements Presse & Magazines',580,'📰'),
(2710,'Films & Séries (DVD/BluRay)',580,'🎬'),
(2711,'Musique Locale Béninoise',580,'🎵'),
(2712,'Bandes Dessinées Africaines',580,'📚'),
(2713,'Guides Touristiques & Voyages',580,'🗺️'),
(2714,'Livres Religieux & Spirituels',580,'📖'),
(2715,'Dictionnaires & Encyclopédies',580,'📖'),
(2716,'Livres Auto-édités & Auteurs Locaux',580,'✍️'),
(2717,'Logiciels Éducatifs (CD/clé USB)',580,'💾'),
(2718,'Activités à Imprimer (coloriages)',580,'🖨️'),
(2719,'Cartes Géographiques Bénin & Afrique',580,'🗺️');

-- ── 581. LIVRES (9→20, +11) ───────────────────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(2720,'Livres Droit & Sciences Politiques',581,'⚖️'),
(2721,'Livres Économie & Finance',581,'💰'),
(2722,'Livres Histoire Afrique',581,'🌍'),
(2723,'Livres Ingénierie & Sciences',581,'🔬'),
(2724,'Livres Philosophie & Culture',581,'🤔'),
(2725,'Livres Maternité & Puériculture',581,'👶'),
(2726,'Livres Langues & Linguistique',581,'🌐'),
(2727,'Livres Tourisme & Patrimoine Bénin',581,'🇧🇯'),
(2728,'Guides Pratiques (bricolage, jardinage)',581,'🔧'),
(2729,'Livres d\'Auteurs Béninois',581,'✍️'),
(2730,'Romans Graphiques & Illustrés',581,'🎨');

-- ── 591. MÉDIAS & DIVERTISSEMENT (5→20, +15) ─────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(2731,'Séries Télévisées Africaines (DVD)',591,'📺'),
(2732,'Films Nollywood & Bollywood',591,'🎬'),
(2733,'Musique Benga & Coupé-Décalé',591,'🎵'),
(2734,'Musique Évangélique & Gospel',591,'⛪'),
(2735,'Musique Classique & Jazz',591,'🎻'),
(2736,'Audiobooks & Livres Audio',591,'🎧'),
(2737,'Documentaires & Reportages',591,'🎥'),
(2738,'Karaoké & Instruments Playback',591,'🎤'),
(2739,'Codes Streaming (Netflix, Prime)',591,'📺'),
(2740,'Vinyles & Disques Rares',591,'💿'),
(2741,'Abonnements Canal+ & IPTV',591,'📡'),
(2742,'Jeux de Plateau Adultes',591,'🎲'),
(2743,'Cartes Pokémon & YuGiOh',591,'🃏'),
(2744,'Collections & Figurines Adultes',591,'🗿'),
(2745,'Instruments & Partitions Locaux',591,'🎶');

-- ── 595. PAPETERIE & FOURNITURES (5→20, +15) ─────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(2746,'Agendas & Planners',595,'📅'),
(2747,'Post-it & Mémo',595,'🟡'),
(2748,'Gommes & Taille-crayons',595,'✏️'),
(2749,'Trousses & Étuis',595,'🖊️'),
(2750,'Pochettes & Porte-documents',595,'📁'),
(2751,'Panneaux d\'Affichage & Liège',595,'📌'),
(2752,'Agrafeuses & Perforeuses',595,'🔩'),
(2753,'Scotch, Colle & Adhésifs',595,'🧲'),
(2754,'Ciseaux Bureautique',595,'✂️'),
(2755,'Trombone, Punaises & Trombones',595,'📌'),
(2756,'Intercalaires & Chemises',595,'📂'),
(2757,'Porte-stylos & Organiseurs Bureau',595,'✏️'),
(2758,'Rubans Correcteurs & Blanc',595,'✏️'),
(2759,'Feuilles de Couleur & Cartonnage',595,'🎨'),
(2760,'Lots & Packs Fournitures',595,'📦');

-- ── 601. IMPRESSION & BUREAU (5→20, +15) ─────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(2761,'Imprimantes Jet d\'Encre',601,'🖨️'),
(2762,'Imprimantes Laser',601,'🖨️'),
(2763,'Imprimantes Photo Compactes',601,'📷'),
(2764,'Imprimantes Étiquettes',601,'🏷️'),
(2765,'Scanners A4 & A3',601,'📄'),
(2766,'Cartouches Originales Canon',601,'🔵'),
(2767,'Cartouches Originales HP',601,'🔵'),
(2768,'Cartouches Originales Epson',601,'🔵'),
(2769,'Toners Laser Samsung & Brother',601,'⚫'),
(2770,'Papier Jet d\'Encre 180g',601,'📄'),
(2771,'Papier Photo Brillant & Mat',601,'📸'),
(2772,'Risographie & Duplicateurs',601,'🖨️'),
(2773,'Reliures & Couvre-câbles',601,'📋'),
(2774,'Numériseurs de Documents',601,'🗂️'),
(2775,'Plotters & Découpe Vinyle',601,'🎨');

-- ── 610. ART & ARTISANAT (5→20, +15) ─────────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(2776,'Cuir & Maroquinerie Artisanale',610,'🐄'),
(2777,'Céramique & Poterie Africaine',610,'🏺'),
(2778,'Sculpture sur Bois',610,'🪵'),
(2779,'Mosaïque & Art Déco',610,'🔵'),
(2780,'Impression Sérigraphique',610,'🖨️'),
(2781,'Gravure & Pyrographie',610,'🔥'),
(2782,'Perles & Bijoux Faits Main',610,'📿'),
(2783,'Vannerie & Natttage',610,'🧺'),
(2784,'Photographie Artistique',610,'📷'),
(2785,'Art Numérique & Tablettes',610,'💻'),
(2786,'Lithographie & Estampe',610,'🖼️'),
(2787,'Art Textile & Batik',610,'🎨'),
(2788,'Installations & Art Contemporain',610,'🎭'),
(2789,'Matériaux Résine & Époxy',610,'🧪'),
(2790,'Vente d\'Œuvres d\'Art Locales',610,'🛒');

-- ── 611. TISSUS & COUTURE (5→20, +15) ─────────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(2791,'Pagnes Wax Authentique (Hollandais)',611,'🌍'),
(2792,'Tissu Bazin Riche & Getzner',611,'✨'),
(2793,'Tissu Kente & Tissé Main',611,'🇬🇭'),
(2794,'Tissu Adire (tie-dye nigérian)',611,'🎨'),
(2795,'Soie & Organza',611,'✨'),
(2796,'Jersey & Tissu Stretch',611,'🧶'),
(2797,'Velours & Satin',611,'✨'),
(2798,'Tissu Jeans & Denim',611,'👖'),
(2799,'Tissu Imprimé Floral & Tropical',611,'🌺'),
(2800,'Tulle & Tissu Voile',611,'💍'),
(2801,'Aiguilles, Fil & Accessoires Couture',611,'🪡'),
(2802,'Dés à Coudre & Ciseaux de Couture',611,'✂️'),
(2803,'Fermetures Éclair & Boutons',611,'🔵'),
(2804,'Gabarits & Tringles de Couture',611,'📐'),
(2805,'Cours de Couture & Broderie',611,'📚');

-- ── 617. PEINTURE & DESSIN (5→20, +15) ────────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(2806,'Peinture Acrylique',617,'🎨'),
(2807,'Peinture à Huile',617,'🖼️'),
(2808,'Couleurs Gouache',617,'🎨'),
(2809,'Crayons de Couleur Professionnels',617,'✏️'),
(2810,'Feutres & Marqueurs Artistiques',617,'🖊️'),
(2811,'Liners & Stylos Encre de Chine',617,'🖊️'),
(2812,'Toile Lin & Coton (canvas)',617,'🖼️'),
(2813,'Encres & Lavis',617,'💧'),
(2814,'Pastels Secs & Gras',617,'🎨'),
(2815,'Fusains & Sanguines',617,'⬛'),
(2816,'Papier Aquarelle & Bloc',617,'💧'),
(2817,'Chevalet & Supports',617,'🖼️'),
(2818,'Médiums & Vernis',617,'🧪'),
(2819,'Spray de Fixatif',617,'💦'),
(2820,'Cours Peinture & Dessin en Ligne',617,'📚');

-- ── 623. BIJOUX & JOAILLERIE (6→20, +14) ─────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(2821,'Bijoux Or 18 Carats',623,'💛'),
(2822,'Bijoux Argent',623,'⚪'),
(2823,'Bijoux Plaqués Or',623,'💛'),
(2824,'Bijoux Fantaisie Colorés',623,'🌈'),
(2825,'Bijoux Perles & Cristal',623,'💎'),
(2826,'Bijoux Pierres Semi-précieuses',623,'💎'),
(2827,'Bijoux Africains Authentiques',623,'🌍'),
(2828,'Piercing & Bijoux de Corps',623,'💉'),
(2829,'Bijoux de Mariage',623,'💒'),
(2830,'Alliances & Fiançailles',623,'💍'),
(2831,'Bijoux pour Hommes',623,'👨'),
(2832,'Bijoux pour Enfants',623,'👧'),
(2833,'Coffrets & Boîtes à Bijoux',623,'🎁'),
(2834,'Nettoyants & Entretien Bijoux',623,'✨');

-- ── 630. ARTISANAT LOCAL BÉNINOIS (6→20, +14) ────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(2835,'Art Vodoun & Fétiches (Bénin)',630,'🌍'),
(2836,'Perles Royales Yoruba & Fon',630,'📿'),
(2837,'Tissage Bogolan & Textile Africain',630,'🧶'),
(2838,'Cuir Tanné Local (Parakou)',630,'🐄'),
(2839,'Instruments Traditionnels Fabriqués',630,'🎵'),
(2840,'Bois Sculpté (portes, plateaux)',630,'🪵'),
(2841,'Bijoux Artisanaux Bronze & Laiton',630,'🔩'),
(2842,'Poteries Traditionnelles Dassa',630,'🏺'),
(2843,'Objets Décoration Raphia & Osier',630,'🧺'),
(2844,'Peintures sur Tissu & Batik Béninois',630,'🎨'),
(2845,'Calligraphie & Lettrages Africains',630,'✍️'),
(2846,'Savons Artisanaux Natron & Shea',630,'🧼'),
(2847,'Jouets Traditionnels en Bois',630,'🪀'),
(2848,'Art Afrofuturiste & Contemporain Local',630,'🚀');

-- ── 637. SCRAPBOOKING & DIY (4→20, +16) ──────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(2849,'Albums Photo & Scrapbooks',637,'📷'),
(2850,'Papiers Décoratifs Kraft & Vintage',637,'📜'),
(2851,'Kits Cartes de Vœux DIY',637,'💌'),
(2852,'Embossage & Repoussage',637,'✨'),
(2853,'Pistolet à Colle & Bâtons',637,'🔫'),
(2854,'Perforatrices Décoratives',637,'✂️'),
(2855,'Ruban Washi & Masking Tape',637,'🎀'),
(2856,'Scrapbooking Digital & Clipart',637,'💻'),
(2857,'Créations en Résine UV',637,'🧪'),
(2858,'Kits Macramé',637,'🪢'),
(2859,'Broderie au Ruban',637,'🎀'),
(2860,'DIY Bougies & Savons',637,'🕯️'),
(2861,'Kits Crochet & Tricot',637,'🧶'),
(2862,'Teinture Tissu & Tye-Dye DIY',637,'🎨'),
(2863,'Fabrication Bijoux DIY',637,'📿'),
(2864,'Encadrement & Assemblage DIY',637,'🖼️');

-- ── 650. ANIMALERIE (6→20, +14) ───────────────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(2865,'Poules & Poulets d\'Élevage',650,'🐔'),
(2866,'Lapins & Rongeurs',650,'🐰'),
(2867,'Chèvres & Moutons Domestiques',650,'🐐'),
(2868,'Porcs Domestiques',650,'🐷'),
(2869,'Abeilles & Apiculture',650,'🐝'),
(2870,'Vaches & Taureaux',650,'🐄'),
(2871,'Ânes & Chevaux (accessoires)',650,'🐴'),
(2872,'Animaux Exotiques & Rares',650,'🦜'),
(2873,'Accessoires Ferme & Élevage Familial',650,'🏚️'),
(2874,'Vaccination & Suivi Vétérinaire',650,'💉'),
(2875,'GPS & Traceurs Animaux',650,'📍'),
(2876,'Cages Transporteurs & Transports',650,'🚗'),
(2877,'Accessoires Laisses & Sécurité',650,'🔗'),
(2878,'Livres & Guides Animalerie',650,'📚');

-- ── 651. CHIENS (5→20, +15) ───────────────────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(2879,'Croquettes & Alimentation Sèche',651,'🍖'),
(2880,'Pâtée & Alimentation Humide',651,'🥫'),
(2881,'Friandises & Récompenses',651,'🦴'),
(2882,'Colliers GPS & Localisation',651,'📍'),
(2883,'Manteaux & Vêtements Chien',651,'🧥'),
(2884,'Chaussures & Chaussettes Chien',651,'👟'),
(2885,'Brosses & Peigne Pelage',651,'🐾'),
(2886,'Shampooings & Soins Chien',651,'🛁'),
(2887,'Gamelles & Fontaines Eau',651,'💧'),
(2888,'Coussins & Paniers Confort',651,'🛏️'),
(2889,'Sacs de Transport Chien',651,'🎒'),
(2890,'Jouets Interactifs & Kong',651,'🎾'),
(2891,'Clôtures & Parcs Chien',651,'🔲'),
(2892,'Antiparasitaires Chien',651,'🦟'),
(2893,'Formations & Guides Dressage',651,'📚');

-- ── 657. CHATS (4→20, +16) ────────────────────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(2894,'Croquettes Premium Chat',657,'🐱'),
(2895,'Pâtée & Sachets Chat',657,'🥫'),
(2896,'Friandises Chat',657,'🐟'),
(2897,'Fontaines à Eau Chat',657,'💧'),
(2898,'Maison & Arbre à Chat',657,'🏠'),
(2899,'Griffoirs & Scratchers',657,'🐾'),
(2900,'Jouets Interactifs Chat',657,'🎾'),
(2901,'Harnais & Laisse Chat',657,'🔗'),
(2902,'Coussins & Nids Chat',657,'😴'),
(2903,'Shampooings Chat',657,'🛁'),
(2904,'Brosses & Peigne Chat',657,'🐾'),
(2905,'Bacs à Litière Fermés',657,'🪣'),
(2906,'Antiparasitaires Chat',657,'🦟'),
(2907,'Collerette Elizabethaine',657,'🔵'),
(2908,'Sacs & Cages Transport Chat',657,'🎒'),
(2909,'Vitamines & Compléments Chat',657,'💊');

-- ── 662. OISEAUX (5→20, +15) ──────────────────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(2910,'Graines & Mélange Perroquet',662,'🦜'),
(2911,'Graines & Mélange Canari',662,'🐦'),
(2912,'Pâtée aux Œufs',662,'🥚'),
(2913,'Volières Grandes (extérieur)',662,'🏚️'),
(2914,'Nids & Matériaux Nichage',662,'🪺'),
(2915,'Perchoirs & Balançoires',662,'🎠'),
(2916,'Jouets Perroquet (anneaux, miroir)',662,'🪞'),
(2917,'Couvertures de Cage',662,'🛏️'),
(2918,'Soins Plumes & Poudre de Bain',662,'✨'),
(2919,'Vitamines Oiseaux',662,'💊'),
(2920,'Anti-poux & Parasitaires Oiseaux',662,'🦟'),
(2921,'Accessoires Élevage Canaris',662,'🐦'),
(2922,'Livre Guide Oiseaux Tropicaux',662,'📚'),
(2923,'GPS & Bagues Oiseaux',662,'🔵'),
(2924,'Pipettes & Seringues Gavage',662,'💉');

-- ── 666. POISSONS & AQUARIOPHILIE (4→20, +16) ────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(2925,'Aquariums Nano & Bowfront',666,'🐠'),
(2926,'Bacs Marins & Eau Salée',666,'🌊'),
(2927,'Bassins Extérieurs & Koïs',666,'🎏'),
(2928,'Nourriture Poissons Tropicaux',666,'🐟'),
(2929,'Nourriture Poissons Rouges',666,'🐠'),
(2930,'Éclairage LED Aquarium',666,'💡'),
(2931,'Thermomètres Aquarium',666,'🌡️'),
(2932,'Conditionneur d\'Eau',666,'💧'),
(2933,'Plantes Aquatiques & Mosse',666,'🌿'),
(2934,'Tuyaux & Raccords Pompe',666,'🔌'),
(2935,'Gravier & Substrat Fond',666,'🪨'),
(2936,'Décors & Résines Aquarium',666,'🏺'),
(2937,'Filets & Épuisettes',666,'🔲'),
(2938,'Tests Eau (pH, NH3, NO2)',666,'🧪'),
(2939,'Chauffages & Thermostats',666,'🌡️'),
(2940,'Alimentation Automatique',666,'⏰');

-- ── 671. REPTILES & PETITS ANIMAUX (6→20, +14) ───────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(2941,'Terrarium en Verre',671,'🦎'),
(2942,'Lampes UVB & Chauffage Reptile',671,'💡'),
(2943,'Substrat & Sol Terrarium',671,'🌿'),
(2944,'Nourriture Insectes (crickets)',671,'🦗'),
(2945,'Nourriture Rongeurs Complète',671,'🐭'),
(2946,'Roues de Course Hamster',671,'⭕'),
(2947,'Cages Gerbilles & Hamsters',671,'🐹'),
(2948,'Tunnels & Accessoires Rongeurs',671,'🌀'),
(2949,'Décors Cachettes Reptile',671,'🪨'),
(2950,'Nourriture Tortues',671,'🐢'),
(2951,'Accessoires Lapin (enclos, jouets)',671,'🐰'),
(2952,'Furets & Petits Mammifères',671,'🦡'),
(2953,'Cobayes & Cochons d\'Inde',671,'🐹'),
(2954,'Vitamines Reptiles & Rongeurs',671,'💊');

-- ── 674. SOINS & MÉDICAMENTS ANIMAUX (5→20, +15) ─────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(2955,'Vermifuges & Antiparasitaires Internes',674,'💊'),
(2956,'Antibiotiques & Antiseptiques Animaux',674,'💉'),
(2957,'Colliers Antiparasitaires',674,'🔵'),
(2958,'Sprays & Pipettes Antipuces',674,'🦟'),
(2959,'Soins Oreilles & Yeux Animaux',674,'👁️'),
(2960,'Vitamines & Minéraux Animaux',674,'💊'),
(2961,'Pansements & Bandages Vétérinaires',674,'🩹'),
(2962,'Seringues & Matériel Injection',674,'💉'),
(2963,'Thermomètres Vétérinaires',674,'🌡️'),
(2964,'Désinfectants & Bétadine Vétérinaire',674,'🧴'),
(2965,'Suppléments Articulaires (chien/chat)',674,'🦴'),
(2966,'Anesthésiques Locaux Vétérinaires',674,'💉'),
(2967,'Insecticides Bétail',674,'🐄'),
(2968,'Nettoyants Pattes & Poils',674,'🐾'),
(2969,'Guides Santé & Premiers Secours Animaux',674,'📚');

-- ── 680. BÉBÉ & PUÉRICULTURE (5→20, +15) ─────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(2970,'Siège Auto Bébé Groupe 0',680,'🚗'),
(2971,'Siège Auto Enfant Groupe 1-2-3',680,'🚗'),
(2972,'Baby-phone Vidéo & Audio',680,'📷'),
(2973,'Rehausseurs & Coussins de Maternité',680,'🤰'),
(2974,'Pharmacie Bébé (mouche-bébé...)',680,'💊'),
(2975,'Stérilisateurs & Chauffe-biberons',680,'🍼'),
(2976,'Tapis de Jeux & Couffins',680,'🛏️'),
(2977,'Piscines Gonflables Bébé',680,'💦'),
(2978,'Veilleuses Musicales Bébé',680,'🌙'),
(2979,'Hochets & Anneaux de Dentition',680,'👶'),
(2980,'Sucettes & Attache-sucettes',680,'🍬'),
(2981,'Coupes Ongles & Soins Bébé',680,'✂️'),
(2982,'Bibliothèque & Livres Bébé',680,'📚'),
(2983,'Fauteuil d\'Allaitement',680,'🪑'),
(2984,'Vêtements Bébé 0-12 mois',680,'👶');

-- ── 681. ALIMENTATION BÉBÉ (4→20, +16) ───────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(2985,'Lait Maternisé 1er âge',681,'🍼'),
(2986,'Lait Maternisé 2ème âge',681,'🍼'),
(2987,'Lait de Croissance 3ème âge',681,'🍼'),
(2988,'Lait Anti-régurgitation',681,'🍼'),
(2989,'Lait Hypoallergénique',681,'🍼'),
(2990,'Céréales Bébé sans Gluten',681,'🌾'),
(2991,'Céréales Bébé avec Gluten',681,'🥣'),
(2992,'Biscuits Bébé Fondants',681,'🍪'),
(2993,'Compotes & Smoothies Bébé',681,'🍑'),
(2994,'Purées Légumes Bébé',681,'🥕'),
(2995,'Purées Viande & Poisson Bébé',681,'🥩'),
(2996,'Eau Minérale Adaptée Bébé',681,'💧'),
(2997,'Tisanes Bébé (fenouil, camomille)',681,'🌿'),
(2998,'Snacks & Grignotines Bébé',681,'🍌'),
(2999,'Biberons & Tétines (accessoires repas)',681,'🍼'),
(3000,'Tablettes Alimentaires Enrichies',681,'💊');

-- ── 686. HYGIÈNE & SOINS BÉBÉ (4→20, +16) ────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(3001,'Couches Taille 1 (2-5 kg)',686,'👶'),
(3002,'Couches Taille 2 (3-6 kg)',686,'👶'),
(3003,'Couches Taille 3-5',686,'👶'),
(3004,'Culottes d\'Apprentissage',686,'👶'),
(3005,'Lingettes Bébé Hypoallergéniques',686,'✨'),
(3006,'Coton & Hydrophile Bébé',686,'🤍'),
(3007,'Crème de Change & Anti-érythème',686,'🧴'),
(3008,'Talc & Poudre Bébé',686,'✨'),
(3009,'Savon Liquide & Gel Bébé',686,'🧼'),
(3010,'Shampooings Doux Bébé',686,'🛁'),
(3011,'Baignoires Bébé & Supports',686,'🛁'),
(3012,'Thermomètre de Bain',686,'🌡️'),
(3013,'Sérum Physiologique',686,'💉'),
(3014,'Mouche-bébé & Aspirateur Nasal',686,'👃'),
(3015,'Coupe-ongles Sécurité Bébé',686,'✂️'),
(3016,'Kits Hygiène Complets Naissance',686,'🎁');

-- ── 691. MOBILIER & CHAMBRE BÉBÉ (4→20, +16) ─────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(3017,'Lit à Barreaux Évolutif',691,'🛏️'),
(3018,'Berceau & Moïse',691,'🛏️'),
(3019,'Cododo & Lit d\'Appoint',691,'🛏️'),
(3020,'Matelas de Berceau',691,'🛏️'),
(3021,'Matelas de Lit Bébé',691,'🛏️'),
(3022,'Table à Langer & Rehausseur',691,'🪑'),
(3023,'Commode & Armoire Bébé',691,'🗄️'),
(3024,'Mobile Musical Lit',691,'🎵'),
(3025,'Veilleuse Projecteur',691,'🌟'),
(3026,'Humidificateur Chambre Bébé',691,'💧'),
(3027,'Thermomètre Chambre',691,'🌡️'),
(3028,'Tapis de Sol Chambre Bébé',691,'🔵'),
(3029,'Poussette Canne & Poussette Standard',691,'🛒'),
(3030,'Porte-bébé Ergonomique',691,'🧣'),
(3031,'Transat & Balancelle',691,'🪷'),
(3032,'Siège de Bain Bébé',691,'🛁');

-- ── 696. VÊTEMENTS & CHAUSSURES BÉBÉ (3→20, +17) ────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(3033,'Bodies Manches Courtes Bébé',696,'👶'),
(3034,'Bodies Manches Longues',696,'👶'),
(3035,'Grenouillères & Pyjamas Zip',696,'😴'),
(3036,'Gilets & Cardigans Bébé',696,'🧶'),
(3037,'Leggings & Pantalons Bébé',696,'👶'),
(3038,'Robes & Tenues Bébé Fille',696,'👗'),
(3039,'T-shirts & Shorts Bébé',696,'👕'),
(3040,'Ensembles Bébé (2-3 pièces)',696,'👶'),
(3041,'Manteaux & Vestes Bébé',696,'🧥'),
(3042,'Bonnets, Gants & Écharpes Bébé',696,'🧣'),
(3043,'Turbans & Bandeaux Bébé',696,'🎀'),
(3044,'Barboteuses Été',696,'☀️'),
(3045,'Tenues de Naissance & Coffrets',696,'🎁'),
(3046,'Maillots de Bain Bébé',696,'🩱'),
(3047,'Déguisements & Fêtes Bébé',696,'🎭'),
(3048,'Vêtements Bio Bébé',696,'🌿'),
(3049,'Premières Chaussures Souples',696,'🦶');

-- ── 700. ÉVEIL & SÉCURITÉ BÉBÉ (6→20, +14) ───────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(3050,'Protège-coins & Prises Sécurité',700,'🔒'),
(3051,'Barrières Escaliers Extensibles',700,'🔲'),
(3052,'Moniteurs Respiratoires',700,'❤️'),
(3053,'Capteurs CO2 Chambre Bébé',700,'🌬️'),
(3054,'Tapis de Jeux Intérieur Mousse',700,'🎨'),
(3055,'Jouets d\'Éveil Mer & Plage Bébé',700,'🌊'),
(3056,'Mobiles Musicaux Suspendus',700,'🎵'),
(3057,'Tableaux Sensoriels Tactiles',700,'👆'),
(3058,'Siège Ergonomique Apprentissage',700,'🪑'),
(3059,'Livres à Toucher & Découvrir',700,'📚'),
(3060,'Puzzles Bébé en Bois',700,'🧩'),
(3061,'Jouets Lumineux & Sonores',700,'💡'),
(3062,'Cage de Parc Bébé',700,'🔲'),
(3063,'GPS Enfant & Traceurs',700,'📍');

-- ── 710. MUSIQUE & INSTRUMENTS (6→20, +14) ───────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(3064,'Instruments Traditionnels Béninois',710,'🌍'),
(3065,'Balafon & Kora',710,'🎵'),
(3066,'Flûte de Pan & Flûte Africaine',710,'🎶'),
(3067,'Vuvuzela & Instruments de Stade',710,'📣'),
(3068,'Instruments Évangéliques & Gospel',710,'⛪'),
(3069,'Supports & Pupitres Instruments',710,'🎼'),
(3070,'Métronomes & Accordeurs',710,'⏱️'),
(3071,'Câbles Jack & XLR',710,'🔌'),
(3072,'Housses & Étuis Instruments',710,'🎒'),
(3073,'Revêtements & Silencieux Instruments',710,'🔇'),
(3074,'Livres de Partitions Africaines',710,'📚'),
(3075,'Logiciels Composition Musicale',710,'💻'),
(3076,'Cours de Musique en Ligne',710,'🎓'),
(3077,'Streaming & Plateformes Musicales',710,'🎵');

SET FOREIGN_KEY_CHECKS = 1;

SET FOREIGN_KEY_CHECKS = 0;

-- ── 711. GUITARES (4→20, +16) ─────────────────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(3078,'Guitares Folk & Country',711,'🎸'),
(3079,'Guitares Classiques & Nylon',711,'🎸'),
(3080,'Guitares Demi-caisse',711,'🎸'),
(3081,'Guitares 7 cordes',711,'🎸'),
(3082,'Basses 5 cordes',711,'🎸'),
(3083,'Violoncelles & Contrebasses',711,'🎻'),
(3084,'Mandolines & Bouzouki',711,'🎵'),
(3085,'Harpes (classiques & petites)',711,'🎵'),
(3086,'Amplificateurs Guitare',711,'🔊'),
(3087,'Pédales d\'Effets',711,'🎸'),
(3088,'Câbles Guitare',711,'🔌'),
(3089,'Médiators & Capodastres',711,'🎵'),
(3090,'Tuteurs & Apprentissage Guitare',711,'📚'),
(3091,'Cordes de Rechange Guitare',711,'🎸'),
(3092,'Guitares pour Débutants',711,'🎸'),
(3093,'Guitares de Lutherie Artisanale',711,'🎨');

-- ── 716. PERCUSSIONS (4→20, +16) ──────────────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(3094,'Tambours Batá Yoruba',716,'🥁'),
(3095,'Tam-tam & Kalimba',716,'🎵'),
(3096,'Cajon & Percussion Acoustique',716,'🥁'),
(3097,'Shakers & Maracas',716,'🎵'),
(3098,'Claves & Woodblocks',716,'🎵'),
(3099,'Triangles & Cymbales',716,'🔔'),
(3100,'Baguettes de Batterie',716,'🥁'),
(3101,'Pads & Silencieux Batterie',716,'🔇'),
(3102,'Pédale de Grosse Caisse',716,'🥁'),
(3103,'Cymbales Hi-Hat & Crash',716,'🔔'),
(3104,'Boîte à Rythmes Électronique',716,'🎹'),
(3105,'Percussions Latines (Pandeiro)',716,'🎵'),
(3106,'Frame Drums & Ocean Drums',716,'🥁'),
(3107,'Kits Percussion Enfants',716,'👶'),
(3108,'Tapis Insonorisants Batterie',716,'🔇'),
(3109,'Cours & Méthodes Percussion',716,'📚');

-- ── 721. INSTRUMENTS À VENT (5→20, +15) ──────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(3110,'Trombones & Tubas',721,'🎺'),
(3111,'Cors d\'Harmonie',721,'🎺'),
(3112,'Euphoniums & Bombardons',721,'🎺'),
(3113,'Hautbois & Bassons',721,'🎵'),
(3114,'Clarinette Soprano',721,'🎵'),
(3115,'Clarinette Alto & Basse',721,'🎵'),
(3116,'Saxophone Alto',721,'🎷'),
(3117,'Saxophone Ténor',721,'🎷'),
(3118,'Flûtes Traversières',721,'🎵'),
(3119,'Flûtes de Bambou Africaines',721,'🌿'),
(3120,'Ocarina & Flûtes Douces',721,'🎵'),
(3121,'Accordéon & Bandonéon',721,'🪗'),
(3122,'Anches & Accessoires Vent',721,'⚙️'),
(3123,'Nettoyants & Entretien Instruments Vent',721,'🧹'),
(3124,'Méthodes & Cours Vent',721,'📚');

-- ── 725. CLAVIERS & PIANO (3→20, +17) ────────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(3125,'Pianos Droits & Grands Pianos',725,'🎹'),
(3126,'Pianos Électroniques 88 Touches',725,'🎹'),
(3127,'Claviers 61 Touches Débutants',725,'🎹'),
(3128,'Claviers de Scène Professionnels',725,'🎹'),
(3129,'Synthétiseurs Analogiques',725,'🎛️'),
(3130,'Synthétiseurs Numériques',725,'🎛️'),
(3131,'Orgues Liturgiques & Gospel',725,'⛪'),
(3132,'Orgues Hammond & Électriques',725,'🎵'),
(3133,'Accordéons Diatoniques',725,'🪗'),
(3134,'Mélodicas',725,'🎵'),
(3135,'Claviers MIDI 49 Touches',725,'🎹'),
(3136,'Claviers MIDI 88 Touches',725,'🎹'),
(3137,'Supports & Stands Piano',725,'📐'),
(3138,'Banquettes & Chaises Piano',725,'🪑'),
(3139,'Partitions & Méthodes Piano',725,'📚'),
(3140,'Pédales Piano & Expression',725,'⚙️'),
(3141,'Pianos Jouets Enfants',725,'👶');

-- ── 729. MATÉRIEL DJ & STUDIO (5→20, +15) ────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(3142,'Contrôleurs DJ (Traktor, Pioneer)',729,'🎛️'),
(3143,'Lecteurs CDJ & Mixettes',729,'💿'),
(3144,'Logiciels DJ (Serato, VirtualDJ)',729,'💻'),
(3145,'Enceintes Actives de Scène',729,'🔊'),
(3146,'Subwoofers & Caissons',729,'🔊'),
(3147,'Câbles XLR & Jack Studio',729,'🔌'),
(3148,'Interfaces Audio Enregistrement',729,'🎛️'),
(3149,'Microphones Studio Cardio',729,'🎙️'),
(3150,'Casques de Studio Fermés',729,'🎧'),
(3151,'Traitement Acoustique (mousse)',729,'🔇'),
(3152,'Multi-pistes & Enregistreurs',729,'📼'),
(3153,'Éclairage DJ & LED (stroboscopes)',729,'💡'),
(3154,'Machines Fumée & Effets Scène',729,'💨'),
(3155,'Support Laptop DJ',729,'📐'),
(3156,'Formations DJ & Production',729,'📚');

-- ── 735. ACCESSOIRES MUSIQUE (5→20, +15) ─────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(3157,'Housses & Étuis Guitare',735,'🎒'),
(3158,'Supports & Stands Guitare',735,'📐'),
(3159,'Supports Cymbaless & Batterie',735,'🥁'),
(3160,'Crochets Muraux Instruments',735,'🪝'),
(3161,'Huile & Entretien Instrument',735,'🧴'),
(3162,'Pièces de Rechange Clarinette',735,'⚙️'),
(3163,'Pièces de Rechange Trompette',735,'⚙️'),
(3164,'Reeds & Anches Saxophone',735,'⚙️'),
(3165,'Enrouleurs de Câbles',735,'🔌'),
(3166,'Nettoyants Cuivres & Bois',735,'🧹'),
(3167,'Luthiers & Réparation Instruments',735,'🔧'),
(3168,'Protège-oreilles Musiciens',735,'👂'),
(3169,'Batterie d\'Alimentation Effets',735,'🔋'),
(3170,'Kits Entretien Complets',735,'🎁'),
(3171,'Albums & Partitions Africaines',735,'📚');

-- ── 740. ÉNERGIE & ÉLECTRICITÉ (4→20, +16) ───────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(3172,'Kits Solaires Domestiques (100W-300W)',740,'☀️'),
(3173,'Kits Solaires Professionnels (1kW+)',740,'☀️'),
(3174,'Générateurs à Gaz & Biogaz',740,'🌿'),
(3175,'Groupes Électrogènes Silencieux',740,'🔇'),
(3176,'Batteries Lithium & LiFePO4',740,'🔋'),
(3177,'Régulateurs MPPT & PWM',740,'⚙️'),
(3178,'Câblage & Installation Solaire',740,'🔌'),
(3179,'Compteurs Électriques',740,'📊'),
(3180,'Prises Programmables',740,'⏰'),
(3181,'Chargeurs Solaires Portables',740,'☀️'),
(3182,'Ampoules Solaires Rechargeables',740,'💡'),
(3183,'Réverbères Solaires',740,'🌆'),
(3184,'Pompes Solaires',740,'💧'),
(3185,'Formation & Installations Solaires',740,'📚'),
(3186,'Câbles Solaires & Connecteurs MC4',740,'🔌'),
(3187,'Protections Parafoudres & Fusibles',740,'⚡');

-- ── 741. ÉNERGIE SOLAIRE (5→20, +15) ─────────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(3188,'Panneaux 50W & 100W',741,'☀️'),
(3189,'Panneaux 200W & 300W',741,'☀️'),
(3190,'Panneaux 400W & Puissants',741,'☀️'),
(3191,'Panneaux Souples & Flexibles',741,'☀️'),
(3192,'Panneaux Portables & Pliables',741,'☀️'),
(3193,'Batteries AGM & Gel',741,'🔋'),
(3194,'Batteries Lithium-Ion Solaires',741,'🔋'),
(3195,'Batteries LiFePO4 Grande Capacité',741,'🔋'),
(3196,'Kits Lampe Solaire Village',741,'🏘️'),
(3197,'Kits Solaires Recharge Téléphone',741,'📱'),
(3198,'Kits Solaires TV & Satellite',741,'📺'),
(3199,'Pompes Solaires Submersibles',741,'💧'),
(3200,'Clôtures Électriques Solaires',741,'⚡'),
(3201,'Installateurs Certifiés (services)',741,'🔧'),
(3202,'Formations Solaire & Certification',741,'📚');

-- ── 747. GROUPES ÉLECTROGÈNES (4→20, +16) ────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(3203,'Groupes 1kVA à 3kVA (maison)',747,'⚡'),
(3204,'Groupes 5kVA à 10kVA (commerce)',747,'⚡'),
(3205,'Groupes 15kVA à 50kVA (industrie)',747,'⚡'),
(3206,'Groupes Inverter Silencieux',747,'🔇'),
(3207,'Groupes Bi-Fuel (essence + gaz)',747,'🔄'),
(3208,'Groupes Diesel Monocylindre',747,'⛽'),
(3209,'Groupes Triphasés Professionnels',747,'⚡'),
(3211,'Onduleurs On-line Double Conversion',747,'⚡'),
(3212,'Onduleurs Line Interactive',747,'⚡'),
(3213,'Batteries UPS & Remplacement',747,'🔋'),
(3214,'Rallonges & Câbles Groupe',747,'🔌'),
(3215,'Silencieux & Capotages Groupe',747,'🔇'),
(3216,'Maintenance Groupe Élect. (pièces)',747,'🔧'),
(3217,'Carburant & Jerricanes Stockage',747,'⛽'),
(3218,'Formation Installation Groupe',747,'📚');

-- ── 752. ÉCLAIRAGE (4→20, +16) ───────────────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(3219,'Ampoules LED Solaires',752,'☀️'),
(3220,'Tubes Néon LED',752,'💡'),
(3221,'Panneaux LED Plafond',752,'💡'),
(3222,'Lampes de Rue LED',752,'🌆'),
(3223,'Éclairage Solaire Extérieur',752,'☀️'),
(3224,'Spots Encastrés & Plafonniers',752,'💡'),
(3225,'Rubans LED & Bandes Lumineuses',752,'🌈'),
(3226,'Lampes de Bureau LED',752,'💡'),
(3227,'Projecteurs LED Industriels',752,'🏭'),
(3228,'Guirlandes LED Déco',752,'✨'),
(3229,'Ampoules Smart & Connectées',752,'📱'),
(3230,'Lampes de Chevet & Lecture',752,'📚'),
(3231,'Éclairage Cuisine Sous-Meuble',752,'🍳'),
(3232,'Détecteurs de Présence',752,'👁️'),
(3233,'Interrupteurs Variateurs',752,'🔘'),
(3234,'Éclairage de Sécurité & Urgence',752,'🚨');

-- ── 757. MATÉRIEL ÉLECTRIQUE (5→20, +15) ─────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(3235,'Câbles NYA & Fils de Cuivre',757,'🔌'),
(3236,'Câbles VVG & Armés',757,'🔌'),
(3237,'Câbles Résistants Chaleur',757,'🔥'),
(3238,'Prises de Courant 16A & 32A',757,'🔌'),
(3239,'Interrupteurs Simples & Doubles',757,'💡'),
(3240,'Boîtiers & Boîtes de Dérivation',757,'📦'),
(3241,'Disjoncteurs Différentiels',757,'⚡'),
(3242,'Disjoncteurs Magnéto-thermiques',757,'⚡'),
(3243,'Rails DIN & Armoires Électriques',757,'🗄️'),
(3244,'Gaines & Tubes Gainables',757,'🔌'),
(3245,'Cosses & Embouts de Câble',757,'⚙️'),
(3246,'Multimètres & Appareils Mesure',757,'📊'),
(3247,'Détecteurs de Câbles & Tension',757,'🔍'),
(3248,'Outils Électricien (pince, tournevis)',757,'🔧'),
(3249,'Formations Électricité Bâtiment',757,'📚');

-- ── 770. SÉCURITÉ & SURVEILLANCE (4→20, +16) ─────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(3250,'Systèmes d\'Alarme Complets',770,'🚨'),
(3251,'Détecteurs Vitres Brisées',770,'🪟'),
(3252,'Détecteurs Vibrations',770,'📳'),
(3253,'Systèmes CCTV 4 Caméras',770,'📷'),
(3254,'Systèmes CCTV 8 Caméras',770,'📷'),
(3255,'Caméras Thermiques',770,'🌡️'),
(3256,'Lecteurs Badges RFID',770,'💳'),
(3257,'Détecteurs Gaz & CO',770,'💨'),
(3258,'Sécurité Périmétrique',770,'🔲'),
(3259,'Alarmes Voiture GPS',770,'🚗'),
(3260,'Coffres-Forts & Sécurité Domicile',770,'🔒'),
(3261,'Gilets Pare-balles & Protection',770,'🦺'),
(3262,'Clôtures Électrifiées Sécurité',770,'⚡'),
(3263,'Barrières Infrarouge',770,'🔴'),
(3264,'Services Télésurveillance',770,'👁️'),
(3265,'Formation Sécurité',770,'📚');

-- ── 771. CAMÉRAS DE SURVEILLANCE (4→20, +16) ─────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(3266,'Caméras PTZ Motorisées',771,'📷'),
(3267,'Caméras Fish-Eye 360°',771,'🌐'),
(3268,'Caméras 4K Ultra HD',771,'📷'),
(3269,'Caméras PoE (alimentation réseau)',771,'🔌'),
(3270,'Caméras Infrarouge Longue Portée',771,'🔴'),
(3271,'Caméras Anti-vandalisme',771,'🛡️'),
(3272,'Mini Caméras & Micro Espion',771,'🔍'),
(3273,'Caméras Solaires (sans câble)',771,'☀️'),
(3274,'Enregistreurs NVR & DVR',771,'🗄️'),
(3275,'Disques Durs Surveillance',771,'💾'),
(3276,'Moniteurs de Surveillance',771,'🖥️'),
(3277,'Câbles BNC & Alimentation',771,'🔌'),
(3278,'Supports & Boîtiers Caméra',771,'🔩'),
(3279,'Kits Complets CCTV',771,'📦'),
(3280,'Logiciels de Surveillance',771,'💻'),
(3281,'Accès Distant Smartphone',771,'📱');

-- ── 776. ALARMES & DÉTECTION (4→20, +16) ─────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(3282,'Alarmes Maison Sans Fil',776,'📡'),
(3283,'Alarmes Commerce Filaires',776,'🔌'),
(3284,'Alarmes Solaires Extérieures',776,'☀️'),
(3285,'Détecteurs Périmétrique Laser',776,'🔴'),
(3286,'Détecteurs d\'Eau & Inondation',776,'💧'),
(3287,'Détecteurs Bris de Vitre',776,'🪟'),
(3288,'Détecteurs Chaleur & Incendie',776,'🔥'),
(3289,'Boutons Panique & SOS',776,'🆘'),
(3290,'Claviers & Codes d\'Accès',776,'🔢'),
(3291,'Sirènes Intérieures',776,'🔔'),
(3292,'Sirènes Extérieures Flashlights',776,'🚨'),
(3293,'Systèmes Alertes SMS & Appel',776,'📱'),
(3294,'Répéteurs & Amplificateurs Alarme',776,'📡'),
(3295,'Batteries Sauvegarde Alarme',776,'🔋'),
(3296,'Accessoires & Pièces Détachées',776,'⚙️'),
(3297,'Contrats & Maintenance Alarme',776,'📋');

-- ── 781. CONTRÔLE D'ACCÈS (4→20, +16) ────────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(3298,'Lecteurs Empreinte Digitale',781,'👆'),
(3299,'Lecteurs Reconnaissance Faciale',781,'😊'),
(3300,'Serrures Connectées Bluetooth',781,'🔵'),
(3301,'Serrures Code PIN',781,'🔢'),
(3302,'Serrures Magnétiques',781,'🔵'),
(3303,'Contrôle d\'Accès Carte RFID',781,'💳'),
(3304,'Barrières de Parking Automatiques',781,'🅿️'),
(3305,'Portails Coulissants Automatiques',781,'🚪'),
(3306,'Portails Battants Automatiques',781,'🚪'),
(3307,'Moteurs de Portail & Accessoires',781,'⚙️'),
(3308,'Interphones Audio',781,'📞'),
(3309,'Visiophone Couleur',781,'📺'),
(3310,'Lecteurs Palmaire & Rétine',781,'🖐️'),
(3311,'Logiciels Gestion Contrôle Accès',781,'💻'),
(3312,'Tourniquet & Tripodes',781,'🔄'),
(3313,'Coffres Électroniques & Dépôt',781,'🔒');

-- ── 786. PROTECTION INCENDIE (5→20, +15) ─────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(3314,'Extincteurs CO2',786,'🔥'),
(3315,'Extincteurs Poudre ABC',786,'🔥'),
(3316,'Extincteurs Eau & Mousse',786,'💧'),
(3317,'Lances & Tuyaux Incendie',786,'💧'),
(3318,'Robinets d\'Incendie Armés (RIA)',786,'🔴'),
(3319,'Centrales d\'Alarme Incendie',786,'🚨'),
(3320,'Détecteurs Fumée Autonomes',786,'💨'),
(3321,'Détecteurs de Flamme UV',786,'🔥'),
(3322,'Signalisation Sortie de Secours',786,'🚪'),
(3323,'Evacuation & Plan de Sécurité',786,'📋'),
(3324,'Systèmes Sprinklers',786,'💧'),
(3325,'Matériaux Coupe-Feu',786,'🧱'),
(3326,'EPI Pompier & Protection',786,'🦺'),
(3327,'Formation Prévention Incendie',786,'📚'),
(3328,'Maintenance Extincteurs (services)',786,'🔧');

-- ── 800. VOYAGE & BAGAGERIE (3→20, +17) ──────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(3329,'Valises Cabine Low-Cost',800,'✈️'),
(3330,'Sets de Valises & Troleys',800,'🧳'),
(3331,'Sacs à Dos de Voyage 40-60L',800,'🎒'),
(3332,'Sacs de Sport & Duffle Bag',800,'💪'),
(3333,'Organiseurs & Cube de Rangement',800,'📦'),
(3334,'Étiquettes & Cadenas Valises',800,'🏷️'),
(3335,'Housses de Valises',800,'🧳'),
(3336,'Bananes & Sacoches Voyage',800,'👜'),
(3337,'Coussins Gonflables Voyage',800,'😴'),
(3338,'Masques de Sommeil & Bouchons',800,'😴'),
(3339,'Guides & Livres de Voyage Afrique',800,'📚'),
(3340,'Assurances Voyage',800,'🛡️'),
(3341,'SIM Internationale & Roaming',800,'📶'),
(3342,'Adaptateurs Prises Universels',800,'🔌'),
(3343,'Pharmacie & Kit Voyage',800,'💊'),
(3344,'Porte-passeport & Documents',800,'📄'),
(3345,'Billets & Réservations (services)',800,'🎫');

-- ── 801. VALISES & SACS DE VOYAGE (4→20, +16) ────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(3346,'Valises Rigides ABS',801,'🧳'),
(3347,'Valises Polycarbonate Légères',801,'🧳'),
(3348,'Valises 4 Roues Pivotantes',801,'🔄'),
(3349,'Valises Avion Cabine (55cm)',801,'✈️'),
(3350,'Valises Grandes 75-80cm',801,'🧳'),
(3351,'Valises Colorées & Imprimées',801,'🎨'),
(3352,'Valises Cuir & Similicuir',801,'🐄'),
(3353,'Valises Ultra-légères',801,'⚖️'),
(3354,'Valises Étanches & Robustes',801,'🌧️'),
(3355,'Valises Rabattables (gain de place)',801,'📐'),
(3356,'Sacs Souples Week-end',801,'🎒'),
(3357,'Trolleys de Cabine Business',801,'💼'),
(3358,'Valises Enfants (Personnages)',801,'👶'),
(3359,'Valises Portatives Pliables',801,'📐'),
(3360,'Trolleys Scolaires & Étudiants',801,'🎓'),
(3361,'Valises Reconditionnées',801,'♻️');

-- ── 806. ACCESSOIRES VOYAGE (5→20, +15) ──────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(3362,'Ceinture Porte-monnaie Sécurité',806,'💰'),
(3363,'Sacs Anti-RFID',806,'🛡️'),
(3364,'Couvertures de Voyage Chaudes',806,'🌡️'),
(3365,'Kits Couture & Urgence Voyage',806,'🧵'),
(3366,'Draps de Sac & Housses Hotel',806,'🛏️'),
(3367,'Guides Phrasebook & Traduction',806,'📖'),
(3368,'Boussoles & GPS Portables',806,'🧭'),
(3369,'Gourdes Filtrantes Voyage',806,'💧'),
(3370,'Wipes Antibactériens Voyage',806,'🧼'),
(3371,'Serrures TSA pour Valises',806,'🔒'),
(3372,'Balances Bagage Numériques',806,'⚖️'),
(3373,'Stylos & Tampons Voyage',806,'✒️'),
(3374,'Pochettes Étanches Plage',806,'🌊'),
(3375,'Jumelles Voyage & Randonnée',806,'🔭'),
(3376,'Concentrateurs Oxygène Portable',806,'🌬️');

-- ── 812. SACS À MAIN & MAROQUINERIE (5→20, +15) ──────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(3377,'Sacs Cuir Véritable',812,'🐄'),
(3378,'Sacs Simili-Cuir & Vegan',812,'🌿'),
(3379,'Sacs Raphia & Paille',812,'🌿'),
(3380,'Sacs Tressés Africains',812,'🌍'),
(3381,'Sacs Clutch & Pochettes Soirée',812,'✨'),
(3382,'Sacs Minaudières',812,'💎'),
(3383,'Sacs Shopping & Tote Bags',812,'🛒'),
(3384,'Sacs Hobo & Slouch',812,'👜'),
(3385,'Sacs Mini & Micro',812,'👜'),
(3386,'Sacs de Plage & Été',812,'🏖️'),
(3387,'Sacs de Mariage & Cérémonie',812,'💒'),
(3388,'Sacs Homme (sacoche, besace)',812,'👨'),
(3389,'Portefeuilles Long & Compact',812,'👛'),
(3390,'Porte-monnaie & Coin Purse',812,'💰'),
(3391,'Entretien Cuir & Rénovateurs',812,'✨');

-- ── 830. BUREAU & MOBILIER PRO (4→20, +16) ───────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(3392,'Open Space & Aménagement Bureau',830,'🏢'),
(3393,'Salles de Réunion (tables, chaises)',830,'🤝'),
(3394,'Rangements Archives & Classeurs',830,'📂'),
(3395,'Armoires Métalliques Sécurité',830,'🗄️'),
(3396,'Tables de Pliage & Tréteaux',830,'🪑'),
(3397,'Panneaux Acoustiques Bureau',830,'🔇'),
(3398,'Climatisation Bureau & Split Pro',830,'❄️'),
(3399,'Éclairage Bureau Professionnel',830,'💡'),
(3400,'Coffres & Boîtes Valeurs',830,'🔒'),
(3401,'Machines à Café Bureau',830,'☕'),
(3402,'Réfrigérateurs & Mini-bar Bureau',830,'❄️'),
(3403,'Téléphone VOIP Pro',830,'📞'),
(3404,'Imprimantes Réseau Pro',830,'🖨️'),
(3405,'Caméras Conférence Pro',830,'📷'),
(3406,'Tableaux d\'Affichage & Flip Charts',830,'📋'),
(3407,'Signalétique & Étiquettes Bureau',830,'🏷️');

-- ── 831. MOBILIER DE BUREAU (5→20, +15) ──────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(3408,'Fauteuils Gaming & Ergonomiques',831,'🎮'),
(3409,'Fauteuils Direction & Cuir',831,'👔'),
(3410,'Chaises de Conférence & Réunion',831,'🤝'),
(3411,'Tabourets de Bar & Accueil',831,'🍸'),
(3412,'Bureaux Assis-debout Réglables',831,'⬆️'),
(3413,'Bureaux Angle & L-Shape',831,'🔲'),
(3414,'Tables de Direction Longues',831,'🤝'),
(3415,'Tables Basses & Guéridon Bureau',831,'☕'),
(3416,'Bibliothèques & Rayonnages Métal',831,'📚'),
(3417,'Casiers Vestiaires',831,'🔒'),
(3418,'Chariots & Dessertes',831,'🛒'),
(3419,'Caissons Mobiles',831,'📦'),
(3420,'Banques d\'Accueil',831,'🏦'),
(3421,'Cloisons Modulaires',831,'🔲'),
(3422,'Mobilier de Bureau Reconditionné',831,'♻️');

-- ── 837. FOURNITURES SCOLAIRES (5→20, +15) ───────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(3423,'Crayons HB & Mines',837,'✏️'),
(3424,'Stylos Billes BIC & Roller',837,'🖊️'),
(3425,'Feutres de Tableau Blanc',837,'🖊️'),
(3426,'Surligneuses Multi-couleurs',837,'🌈'),
(3427,'Gommes, Taille-crayons & Colle',837,'🧴'),
(3428,'Règles, Équerres & Compas',837,'📐'),
(3429,'Rapporteurs & Geodreieck',837,'📐'),
(3430,'Agendas Scolaires',837,'📅'),
(3431,'Pochettes & Chemises',837,'📁'),
(3432,'Cahiers 100 Pages & Grands',837,'📓'),
(3433,'Livrets & Carnets de Petite Taille',837,'📔'),
(3434,'Sacs & Cartables Primaire',837,'🎒'),
(3435,'Sacs & Cartables Collège/Lycée',837,'🎒'),
(3436,'Boîtes à Lunch & Gourdes Scolaires',837,'🍱'),
(3437,'Tailles-crayon Électrique',837,'✏️');

-- ── 843. TÉLÉPHONIE & COMMUNICATION (3→20, +17) ──────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(3438,'Téléphones de Bureau IP/Analogique',843,'📞'),
(3439,'Combinés DECT & Mains Libres',843,'📞'),
(3440,'Systèmes d\'Interphonie Entreprise',843,'📣'),
(3441,'PABX Analogiques Petits Bureaux',843,'📞'),
(3442,'IPBX & Centrex (cloud)',843,'☁️'),
(3443,'SIP Phones & Softphones',843,'💻'),
(3444,'Casques Téléphoniques Pro',843,'🎧'),
(3445,'Enregistreurs d\'Appels',843,'🎙️'),
(3446,'Répondeurs & Messagerie',843,'📨'),
(3447,'Fax & Machines Télécopie',843,'📠'),
(3448,'Talkie-Walkies & Radios Pro',843,'📻'),
(3449,'Radios Portatives PMR446',843,'📻'),
(3450,'Câblage Téléphonique RJ11',843,'🔌'),
(3451,'Panneaux de Brassage Téléphone',843,'🗄️'),
(3452,'Visioconférence Pro (Polycom)',843,'📷'),
(3453,'Services VOIP & Numéros Virtuels',843,'🌐'),
(3454,'Sonorisation & Haut-parleurs Salle',843,'🔊');

-- ── 847. PRÉSENTATION & CONFÉRENCE (4→20, +16) ───────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(3455,'Présentoirs & Lutrin',847,'📋'),
(3456,'Télécommandes de Présentation',847,'🖱️'),
(3457,'Laser Pointer & Pointeurs Pros',847,'🔴'),
(3458,'Écrans Interactifs',847,'📱'),
(3459,'Tableaux Blancs Mobiles',847,'📝'),
(3460,'Tableaux Ardoise & Craie',847,'✏️'),
(3461,'Logiciels Présentation (Prezi)',847,'💻'),
(3462,'Microphones de Conférence',847,'🎙️'),
(3463,'Casques Interprétation',847,'🎧'),
(3464,'Systèmes Vote & Boîtiers',847,'🗳️'),
(3465,'Tables & Chaises de Réunion',847,'🤝'),
(3466,'Écrans de Projection Enroulables',847,'📐'),
(3467,'Câbles HDMI & VGA Longue Distance',847,'🔌'),
(3468,'Podiums & Tribunes',847,'🎤'),
(3469,'Enregistreurs de Réunion',847,'🎙️'),
(3470,'Diffusion Live & Streaming Réunion',847,'📡');

-- ── 860. SERVICES & OCCASIONS (3→20, +17) ────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(3471,'Livraison Express & Coursiers',860,'🚴'),
(3472,'Services de Plomberie',860,'🔧'),
(3473,'Services d\'Électricité',860,'⚡'),
(3474,'Services de Peinture Bâtiment',860,'🎨'),
(3475,'Services de Nettoyage',860,'🧹'),
(3476,'Services de Jardinage',860,'🌿'),
(3477,'Services Informatiques & Dépannage',860,'💻'),
(3478,'Services de Déménagement',860,'🚚'),
(3479,'Services de Beauté à Domicile',860,'💄'),
(3480,'Services de Traiteur & Chef',860,'👨‍🍳'),
(3481,'Services de Garde d\'Enfants',860,'👶'),
(3482,'Location de Véhicules',860,'🚗'),
(3483,'Vente de Billets & Événements',860,'🎫'),
(3484,'Services Administratifs & Légaux',860,'⚖️'),
(3485,'Cours & Formations Locales',860,'📚'),
(3486,'Petites Annonces & Occasions',860,'📌'),
(3487,'Artisanat & Travaux Manuels',860,'🔨');

-- ── 861. CADEAUX & OCCASIONS (9→20, +11) ─────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(3488,'Cadeaux Naissance & Bébé',861,'👶'),
(3489,'Cadeaux Retraite & Hommage',861,'🎖️'),
(3490,'Cadeaux Diplôme & Réussite',861,'🎓'),
(3491,'Cadeaux Réconciliation & Amour',861,'❤️'),
(3492,'Cadeaux Ramadan & Tabaski',861,'🌙'),
(3493,'Cadeaux Noël & Fêtes Fin Année',861,'🎄'),
(3494,'Cadeaux Fête des Mères & Pères',861,'💐'),
(3495,'Cadeaux Départ en Voyage',861,'✈️'),
(3496,'Kits Bien-être Spa',861,'🛁'),
(3497,'Cadeaux Numérique & Codes',861,'🎁'),
(3498,'Fleurs & Plantes Cadeaux',861,'🌸');

-- ── 868. SERVICES NUMÉRIQUES (8→20, +12) ─────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(3499,'Crédits MTN & Moov Money',868,'📱'),
(3500,'Achats Intégrés Apps & Jeux',868,'🎮'),
(3501,'Hébergement Web & Domaines .bj',868,'🌐'),
(3502,'E-mail Professionnel & G-Suite',868,'📧'),
(3503,'Stockage Cloud (Dropbox, iCloud)',868,'☁️'),
(3504,'Créations Sites Web',868,'💻'),
(3505,'Rédaction & Contenu Numérique',868,'✍️'),
(3506,'SEO & Marketing Digital',868,'📈'),
(3507,'Design Graphique Digital',868,'🎨'),
(3508,'Traductions & Interprétariat',868,'🌍'),
(3509,'Comptabilité & Gestion Numérique',868,'💼'),
(3510,'Cybersécurité & Audit IT',868,'🔒');

-- ── 873. IMPRESSION & PERSONNALISATION (6→20, +14) ───────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(3511,'Impression Flyers & Prospectus',873,'📄'),
(3512,'Impression Affiches & Kakémonos',873,'🖼️'),
(3513,'Impression Brochures & Catalogues',873,'📚'),
(3514,'Impression Cartes de Visite',873,'💳'),
(3515,'Impression Étiquettes & Autocollants',873,'🏷️'),
(3516,'Impression Toile & Fine Art',873,'🖼️'),
(3517,'Impression Banderoles & Oriflammes',873,'🎌'),
(3518,'Goodies Entreprise (stylos, clés USB)',873,'🎁'),
(3519,'Calendriers Personnalisés',873,'📅'),
(3520,'Trophées & Plaques Gravées',873,'🏆'),
(3521,'Broderie & Sérigraphie Tissu',873,'🧵'),
(3522,'Impression 3D Objets',873,'🖨️'),
(3523,'Tampons & Cachets',873,'🔵'),
(3524,'Signalétique Magasin & Enseigne',873,'🏪');

SET FOREIGN_KEY_CHECKS = 1;

SET FOREIGN_KEY_CHECKS = 0;

-- ── 900. MATÉRIAUX DE CONSTRUCTION (8→20, +12) ───────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(3525,'Matériaux Finition Intérieure',900,'🏠'),
(3526,'Aluminium & Profilés',900,'🔲'),
(3527,'Bois de Menuiserie',900,'🪵'),
(3528,'Verre & Miroirs Bâtiment',900,'🪞'),
(3529,'Imperméabilisation & Étanchéité',900,'💧'),
(3530,'Matériaux Locaux (terre, banco)',900,'🌍'),
(3531,'Climatisation & Ventilation Bâtiment',900,'❄️'),
(3532,'Menuiserie Aluminium & PVC',900,'🔲'),
(3533,'Carrelages & Dalles',900,'🟫'),
(3534,'Granit & Marbre',900,'💎'),
(3535,'Peintures & Revêtements Intérieurs',900,'🎨'),
(3536,'Armatures & Structures Métalliques',900,'🔩');

-- ── 901. GROS ŒUVRE & FONDATIONS (6→20, +14) ─────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(3537,'Béton Prêt à l\'Emploi',901,'🏗️'),
(3538,'Ciment CEM I & CEM II',901,'🏗️'),
(3539,'Mortier-Colle & Enduit',901,'🧪'),
(3540,'Briques Pleines & Creuses',901,'🟫'),
(3541,'Parpaings 15cm & 20cm',901,'🏗️'),
(3542,'Agglo de Béton',901,'🏗️'),
(3543,'Piliers & Poteaux Préfabriqués',901,'🔩'),
(3544,'Prédalles & Poutrelles',901,'🔩'),
(3545,'Ferraillage & Treillis Soudé',901,'🔩'),
(3546,'Fer à Béton HA8 à HA25',901,'🔩'),
(3547,'Sable de Construction',901,'🟡'),
(3548,'Gravier & Ballast',901,'🪨'),
(3549,'Géotextile & Drainage',901,'🌿'),
(3550,'Coffrages & Banches',901,'🏗️');

-- ── 908. COUVERTURE & TOITURE (5→20, +15) ────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(3551,'Tôles Galvanisées',908,'🏚️'),
(3552,'Tôles Colorées & Prélaquées',908,'🎨'),
(3553,'Tôles Sandwich Isolantes',908,'🏗️'),
(3554,'Panneaux Fibrociment',908,'🏗️'),
(3555,'Panneaux Polycarbonate',908,'🏗️'),
(3556,'Tuiles Béton',908,'🏠'),
(3557,'Zinguerie (chéneaux, noues)',908,'🔩'),
(3558,'Faîtières & Accessoires Toiture',908,'🔩'),
(3559,'Closoir & Aération Toiture',908,'🌬️'),
(3560,'Bâche & Membrane EPDM',908,'🛡️'),
(3561,'Bois de Charpente & Chevrons',908,'🪵'),
(3562,'Fermes & Portiques Métalliques',908,'🔩'),
(3563,'Étanchéité Liquid® & Résine',908,'💧'),
(3564,'Isolant Réfléchissant Multi-couches',908,'🌡️'),
(3565,'Formation Couverture & Toiture',908,'📚');

-- ── 914. REVÊTEMENTS & FINITIONS (6→20, +14) ─────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(3566,'Carrelage Sol 30x30 & 60x60',914,'🟫'),
(3567,'Carrelage Mural & Faïence',914,'🟫'),
(3568,'Peinture Acrylique Lessivable',914,'🎨'),
(3569,'Peinture Epoxy Sol Béton',914,'🏭'),
(3570,'Peinture Anticorrosion Métal',914,'🔩'),
(3571,'Enduit Décoratif & Stucco',914,'✨'),
(3572,'Revêtement Vinyle & PVC Sol',914,'🏠'),
(3573,'Stratifié & Parquet Flottant',914,'🪵'),
(3574,'Linoléum & Revêtements Rouleau',914,'🟫'),
(3575,'Mosaïque & Galets Décoratifs',914,'🎨'),
(3576,'Résine Époxy Décorative',914,'✨'),
(3577,'Colles & Joints Carrelage',914,'🧪'),
(3578,'Faux Plafond Dalles PVC & BA13',914,'🏠'),
(3579,'Lambris Bois & PVC',914,'🪵');

-- ── 921. PORTES, FENÊTRES & MENUISERIE (6→20, +14) ───────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(3580,'Portes d\'Entrée Acier Anti-effraction',921,'🔒'),
(3581,'Portes Intérieures Panneau Bois',921,'🚪'),
(3582,'Portes Coulissantes & Galandage',921,'🔄'),
(3583,'Portes de Garage',921,'🏠'),
(3584,'Fenêtres PVC Double Vitrage',921,'🪟'),
(3585,'Fenêtres Aluminium',921,'🔲'),
(3586,'Jalousies & Persiennes',921,'🌬️'),
(3587,'Volets Roulants Motorisés',921,'⚙️'),
(3588,'Stores Intérieurs (vénitiens)',921,'🏠'),
(3589,'Balustrades & Rambardes',921,'🔩'),
(3590,'Escaliers Béton & Métal',921,'🪜'),
(3591,'Coffres & Barres Anti-effraction',921,'🔒'),
(3592,'Serrures Multipoints',921,'🔐'),
(3593,'Gâches & Ferme-portes',921,'🔩');

-- ── 928. PLOMBERIE & SANITAIRE (7→20, +13) ───────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(3594,'Lavabos & Vasques Design',928,'🚿'),
(3595,'Baignoires & Douches',928,'🛁'),
(3596,'Urinoirs & Accessoires Sanitaires',928,'🚽'),
(3597,'Miroirs & Meubles Salle de Bain',928,'🪞'),
(3598,'Serviettes de Bain & Accessoires',928,'🛁'),
(3599,'Tuyaux PEHD & Polyéthylène',928,'🔌'),
(3600,'Raccords Coudés & Té PVC',928,'⚙️'),
(3601,'Clapets Anti-retour',928,'🔵'),
(3602,'Vannes & Robinets d\'Isolement',928,'🔧'),
(3603,'Pompes de Relevage',928,'💧'),
(3604,'Adoucisseurs d\'Eau',928,'💧'),
(3605,'Filtration & Traitement Eau Réseau',928,'🧪'),
(3606,'Formation Plomberie',928,'📚');

-- ── 936. ÉLECTRICITÉ BÂTIMENT (4→20, +16) ────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(3607,'Câbles NYM & NYY',936,'🔌'),
(3608,'Câbles U1000RO2V Enterré',936,'🔌'),
(3609,'Câbles Rigides 1,5mm & 2,5mm',936,'🔌'),
(3610,'Câbles Souples Multibrins',936,'🔌'),
(3611,'Prises de Sol & Multiprises',936,'🔌'),
(3612,'Disjoncteurs Mono & Triph.',936,'⚡'),
(3613,'Différentiels 30mA & 300mA',936,'⚡'),
(3614,'Boîtes de Dérivation Encastrées',936,'📦'),
(3615,'Conduit IRO & Gaines',936,'🔌'),
(3616,'Attaches Câbles & Colliers',936,'🔩'),
(3617,'Tableaux Électriques Résidentiel',936,'⚡'),
(3618,'Spots LED Encastrés',936,'💡'),
(3619,'Éclairages Extérieur Façade',936,'💡'),
(3620,'Minuteries & Télérupteurs',936,'⏰'),
(3621,'Prises Étanches Extérieures',936,'🔌'),
(3622,'Formation Electricité Bâtiment',936,'📚');

-- ── 941. OUTILLAGE DE CHANTIER (5→20, +15) ───────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(3623,'Marteaux-Perforateurs SDS',941,'🔨'),
(3624,'Marteaux-Piqueurs',941,'⚒️'),
(3625,'Meuleuses Angulaires',941,'🔧'),
(3626,'Scies Circulaires Professionnelles',941,'🪚'),
(3627,'Lappereau & Scie Sauteuse',941,'🪚'),
(3628,'Vibrateurs à Béton',941,'🏗️'),
(3629,'Malaxeurs de Chantier',941,'🏗️'),
(3630,'Pompes de Chantier',941,'💧'),
(3631,'Compresseurs de Chantier',941,'💨'),
(3632,'Groupes Électrogènes Chantier',941,'⚡'),
(3633,'Outils Topographie & Traçage',941,'📐'),
(3634,'Chariots & Manutention',941,'🛒'),
(3635,'Équipements Sécurité Chantier',941,'🦺'),
(3636,'Coffrets d\'Outils Chantier',941,'🧰'),
(3637,'Location Matériel Chantier',941,'🔑');

-- ── 947. ISOLATION & ÉTANCHÉITÉ (5→20, +15) ──────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(3638,'Polyuréthane Mousse Rigide',947,'🧪'),
(3639,'Laine de Roche',947,'🪨'),
(3640,'Polystyrène Expansé & Extrudé',947,'🧊'),
(3641,'Isolation Réfléchissante',947,'✨'),
(3642,'Pare-vapeur & Frein Vapeur',947,'💨'),
(3643,'Bitume Armé & Asphalte',947,'⬛'),
(3644,'Membrane TPO & PVC',947,'🏗️'),
(3645,'Produits d\'Étanchéité Liquide',947,'💧'),
(3646,'Solin & Bandes d\'Étanchéité',947,'🔩'),
(3647,'Drains & Nappe Drainage',947,'💧'),
(3648,'Isolants Phoniques',947,'🔇'),
(3649,'Barrières Thermiques',947,'🌡️'),
(3650,'Traitement Anti-humidité',947,'💧'),
(3651,'Mousse Expansive (PU)',947,'🧪'),
(3652,'Formation Isolation & Étanchéité',947,'📚');

-- ── 950. AGRICULTURE & ÉLEVAGE (6→20, +14) ───────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(3653,'Cultures Maraîchères',950,'🥬'),
(3654,'Agriculture Biologique',950,'🌿'),
(3655,'Horticulture & Pépinières',950,'🌺'),
(3656,'Arboriculture Fruitière',950,'🌳'),
(3657,'Riziculture & Bas-fonds',950,'🌾'),
(3658,'Coton & Cultures de Rente',950,'🌱'),
(3659,'Ananas & Cultures Tropicales',950,'🍍'),
(3660,'Cultures Sous Serre',950,'🏗️'),
(3661,'Hydroponique & Aquaponie',950,'💧'),
(3662,'Agroforesterie',950,'🌳'),
(3663,'Mécanisation Agricole',950,'🚜'),
(3664,'Stockage & Post-récolte',950,'📦'),
(3665,'Financement & Assurance Agricole',950,'💰'),
(3666,'Formation Agriculture Bénin',950,'📚');

-- ── 951. SEMENCES & PLANTS (5→20, +15) ───────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(3667,'Semences Maïs Hybride',951,'🌽'),
(3668,'Semences Riz Irrigué & Pluvial',951,'🌾'),
(3669,'Semences Sorgho & Mil',951,'🌾'),
(3670,'Semences Soja & Niébé',951,'🌱'),
(3671,'Semences Arachides',951,'🥜'),
(3672,'Plants Tomates, Piments & Poivrons',951,'🍅'),
(3673,'Plants Aubergines & Légumes',951,'🍆'),
(3674,'Plants Ananas',951,'🍍'),
(3675,'Plants Manioc (boutures)',951,'🌿'),
(3676,'Plants Igname & Patate',951,'🍠'),
(3677,'Plants Arbres Fruitiers (manguier)',951,'🥭'),
(3678,'Semences Fourragères (herbes)',951,'🌿'),
(3679,'Plants Moringa & Plantes Médicales',951,'🌿'),
(3680,'Semences Bio Certifiées',951,'🌿'),
(3681,'Oignons & Ail (bulbes & semences)',951,'🧅');

-- ── 957. ENGRAIS & PHYTOSANITAIRES (5→20, +15) ───────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(3682,'NPK 15-15-15',957,'🌱'),
(3683,'Urée 46% N',957,'🌱'),
(3684,'Sulfate d\'Ammonium',957,'🧪'),
(3685,'DAP & MOP',957,'🧪'),
(3686,'Engrais Foliaires',957,'🌿'),
(3687,'Compost & Humus Naturel',957,'♻️'),
(3688,'Biofertilisants & Rhizobium',957,'🌿'),
(3689,'Herbicides (Glyphosate, Paraquat)',957,'🌿'),
(3690,'Insecticides Agricoles',957,'🦟'),
(3691,'Fongicides (Mancozèbe, Captane)',957,'🍄'),
(3692,'Nématicides & Rodenticides',957,'🐭'),
(3693,'Hormones de Croissance Végétale',957,'🌱'),
(3694,'Fertilisants Potassiques',957,'🧪'),
(3695,'Micro-engrais (Zinc, Bore, Fer)',957,'🔬'),
(3696,'Formation Utilisation Produits Phyto',957,'📚');

-- ── 963. MATÉRIEL AGRICOLE (7→20, +13) ───────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(3697,'Tracteurs & Moissonneuses',963,'🚜'),
(3698,'Cultivateurs & Motobineuses',963,'🌾'),
(3699,'Semoirs & Planteuses',963,'🌱'),
(3700,'Batteuses & Égreneuses',963,'⚙️'),
(3701,'Décortiqueuses Riz & Mil',963,'🌾'),
(3702,'Presses à Huile Manuelles',963,'🫙'),
(3703,'Charrues & Herses Animales',963,'🐄'),
(3704,'Moto-pompes Diesel & Essence',963,'💧'),
(3705,'Cannes à Sucre (machines coupe)',963,'🍬'),
(3706,'Remorques Agricoles',963,'🚜'),
(3707,'Filets d\'Ombrage & Brise-vent',963,'🌿'),
(3708,'Sondes Humidité & Météo Ferme',963,'🌦️'),
(3709,'Location Matériel Agricole',963,'🔑');

-- ── 971. ÉLEVAGE & AVICULTURE (7→20, +13) ────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(3710,'Poussinières & Couvoirs',971,'🐣'),
(3711,'Ventilateurs Élevage',971,'💨'),
(3712,'Lampes Chauffantes Poussin',971,'💡'),
(3713,'Silos & Stockage Aliments',971,'🏗️'),
(3714,'Auges & Abreuvoirs Bétail',971,'💧'),
(3715,'Clôtures & Parcs Animaux',971,'🔲'),
(3716,'Balances Pèse-bétail',971,'⚖️'),
(3717,'Insémination & Reproduction',971,'💉'),
(3718,'Identification & Boucles Oreilles',971,'🏷️'),
(3719,'Traitement Antiparasitaire Bétail',971,'💊'),
(3720,'Soins Homéopathiques Élevage',971,'🌿'),
(3721,'Apiculture (ruches, extracteurs)',971,'🐝'),
(3722,'Formation Élevage & Aviculture',971,'📚');

-- ── 979. PÊCHE & AQUACULTURE (7→20, +13) ─────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(3723,'Cages Flottantes Tilapia',979,'🐟'),
(3724,'Cages Poissons Eau Douce',979,'🐟'),
(3725,'Alevins & Reproducteurs',979,'🐠'),
(3726,'Aliments Granulés Poissons',979,'🍽️'),
(3727,'Sondes Qualité Eau (O2, pH)',979,'🧪'),
(3728,'Aérateurs & Pompes Oxygène',979,'💨'),
(3729,'Filets Seinière & Trémail',979,'🔲'),
(3730,'Pirogues Motorisées FBR',979,'⛵'),
(3731,'Conservation & Glacières Poisson',979,'🧊'),
(3732,'Transformation Poisson (fumoir)',979,'🔥'),
(3733,'Conditionnement & Emballage Poisson',979,'📦'),
(3734,'Formation Pisciculture',979,'📚'),
(3735,'Certifications & Labels Aquaculture',979,'📋');

-- ── 984. TRANSFORMATION & AGRO-INDUSTRIE (5→20, +15) ─────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(3736,'Moulins à Maïs Électriques',984,'⚙️'),
(3737,'Moulins à Manioc & Gari',984,'⚙️'),
(3738,'Extracteurs Huile de Palme',984,'🫙'),
(3739,'Machines à Arachide & Karité',984,'🌿'),
(3740,'Séchoirs Solaires',984,'☀️'),
(3741,'Séchoirs Électriques & Gaz',984,'🔥'),
(3742,'Chambres Froides Mobiles',984,'❄️'),
(3743,'Machines à Jus & Pasteuriseurs',984,'🧃'),
(3744,'Machines de Mise en Bouteille',984,'🍶'),
(3745,'Mixeurs & Broyeurs Industriels',984,'⚙️'),
(3746,'Conditionnement Sachets Plastique',984,'📦'),
(3747,'Étiqueteuses & Code-barres',984,'🏷️'),
(3748,'Machines Agro-alimentaires Locales',984,'🏭'),
(3749,'Certification ISO & HACCP',984,'📋'),
(3750,'Formation Transformation Agro',984,'📚');

-- ── 990. TENUES TRADITIONNELLES & CÉRÉMONIALES (6→20, +14) ───────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(3751,'Broderies & Fils Africains',990,'🧵'),
(3752,'Accessoires Traditionnels (bijoux, coiffes)',990,'📿'),
(3753,'Sacs & Accessoires Pagne',990,'👜'),
(3754,'Chaussures Traditionnelles',990,'👞'),
(3755,'Ceintures & Écharpes Traditionnel',990,'🎗️'),
(3756,'Tenues de Baptême Africain',990,'⛪'),
(3757,'Tenues de Funérailles & Deuil',990,'⚫'),
(3758,'Tenues d\'Initiation',990,'🌿'),
(3759,'Couvre-chefs Traditionnels',990,'🎩'),
(3760,'Vêtements Mascarade & Fêtes',990,'🎭'),
(3761,'Tenues Communauté Yoruba',990,'🌍'),
(3762,'Tenues Communauté Fon',990,'🌍'),
(3763,'Tenues Communauté Bariba & Peul',990,'🌍'),
(3764,'Couturiers & Ateliers Locaux',990,'✂️');

-- ── 991. PAGNES & TISSUS AFRICAINS (7→20, +13) ───────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(3765,'Wax Woodin Authentique',991,'🌍'),
(3766,'Wax Vlisco Hollandais Premium',991,'💎'),
(3767,'Wax ABC & Hitarget',991,'🌍'),
(3768,'Wax Imprimé Algérien & Chinois',991,'🎨'),
(3769,'Ankara & Tissu Imprimé Africain',991,'🎨'),
(3770,'Satin Africain & Taffetas',991,'✨'),
(3771,'Voile & Mousseline Africaine',991,'💨'),
(3772,'Kita & Tissu Cérémoniel',991,'✨'),
(3773,'Pagne Lokossa & Dantokpa Local',991,'🇧🇯'),
(3774,'Coton Blanc & Écru Naturel',991,'🌿'),
(3775,'Tissu Brodé Main',991,'🧵'),
(3776,'Tissus Spéciaux (mariages, fêtes)',991,'💒'),
(3777,'Achats en Gros & Grossiste Tissu',991,'📦');

-- ── 999. TENUES TRADITIONNELLES HOMMES (5→20, +15) ───────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(3778,'Grand Boubou 3 Pièces',999,'👘'),
(3779,'Agbada Yoruba',999,'👘'),
(3780,'Kaftan Court & Long',999,'👘'),
(3781,'Ensemble Bazin 2 Pièces',999,'🧵'),
(3782,'Chemise Dashiki',999,'🎨'),
(3783,'Pantalon Sarouel & Qamis',999,'👖'),
(3784,'Jellaba Marocaine Homme',999,'👘'),
(3785,'Tenue Bariba & Somba',999,'🌍'),
(3786,'Tenue Peul & Fulani',999,'🌍'),
(3787,'Tenue Dendi & Haoussa',999,'🌍'),
(3788,'Tenue Cérémonie Roi',999,'👑'),
(3789,'Broderie à la Main Hommes',999,'🧵'),
(3790,'Coiffes Homme (fez, toque)',999,'🎩'),
(3791,'Sandales Traditionnelles Homme',999,'👞'),
(3792,'Perles & Accessoires Royaux H',999,'📿');

-- ── 1005. TENUES TRADITIONNELLES FEMMES (5→20, +15) ──────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(3793,'Kaba Pagne Modèle Classique',1005,'👗'),
(3794,'Kaba Dentelle & Brodée',1005,'✨'),
(3795,'Ensemble Pagne 2 Pièces F',1005,'👗'),
(3796,'Ensemble Pagne 3 Pièces',1005,'👗'),
(3797,'Robe Sirène Pagne Soirée',1005,'✨'),
(3798,'Tenue Wax Convertible',1005,'🔄'),
(3799,'Tenue Gele & Iro Yoruba',1005,'🌍'),
(3800,'Tenue Fon & Goun',1005,'🌍'),
(3801,'Tenue Cérémonie de Mariage',1005,'💒'),
(3802,'Tenue Funéraille & Condoléances F',1005,'⚫'),
(3803,'Tenue Baptême & Naissance',1005,'⛪'),
(3804,'Bijoux Traditionnels Femmes',1005,'📿'),
(3805,'Gele & Foulard Noué Femmes',1005,'🎀'),
(3806,'Sandales Traditionnelles Femmes',1005,'👡'),
(3807,'Perles & Bracelets Royaux F',1005,'📿');

-- ── 1011. TENUES TRADITIONNELLES ENFANTS (3→20, +17) ─────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(3808,'Boubou & Kaftan Garçon',1011,'👘'),
(3809,'Robe & Kaba Pagne Fille',1011,'👗'),
(3810,'Ensemble Wax Garçon',1011,'🌍'),
(3811,'Ensemble Wax Fille',1011,'🌍'),
(3812,'Tenue Bébé Traditionnel',1011,'👶'),
(3813,'Tenue Mariage Garçon d\'Honneur',1011,'🤵'),
(3814,'Robe Demoiselle d\'Honneur',1011,'💒'),
(3815,'Tenue Baptême Garçon',1011,'⛪'),
(3816,'Tenue Baptême Fille',1011,'⛪'),
(3817,'Tenue Cérémonie Communauté',1011,'🌍'),
(3818,'Ensemble Brodé Main Enfant',1011,'🧵'),
(3819,'Coiffe Enfant (bonnet, tiara)',1011,'🎩'),
(3820,'Chaussures Traditionnelles Enfants',1011,'👞'),
(3821,'Perles & Bijoux Enfants',1011,'📿'),
(3822,'Déguisements Traditionnels Enfants',1011,'🎭'),
(3823,'Tenues Sport & EPS Pagne',1011,'🏋️'),
(3824,'Uniformes École Brodés',1011,'📚');

-- ── 1015. VÊTEMENTS RELIGIEUX & CULTUELS (4→20, +16) ─────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(3825,'Robes Baptismales',1015,'⛪'),
(3826,'Soutanes & Tenues Clergé',1015,'✝️'),
(3827,'Aube & Vêtements Liturgiques',1015,'✝️'),
(3828,'Étoles & Chasubles',1015,'✝️'),
(3829,'Tenues Église Évangélique',1015,'⛪'),
(3830,'Tenues Coran & Mosquée Femmes',1015,'🕌'),
(3831,'Djellaba & Qamis Homme',1015,'🕌'),
(3832,'Voile & Hijab',1015,'🧕'),
(3833,'Nikab & Abaya',1015,'🧕'),
(3834,'Jubba & Thoub',1015,'👘'),
(3835,'Chapelet & Tasbih',1015,'📿'),
(3836,'Tenues Vodoun & Convent',1015,'🌿'),
(3837,'Vêtements Zangbeto & Orisha',1015,'🌍'),
(3838,'Tenues Initiation Yakouta',1015,'🌿'),
(3839,'Costumes Masque Guèlèdè',1015,'🎭'),
(3840,'Accessoires Rituels & Fétiches',1015,'🌿');

-- ── 1020. COUTURE & CONFECTION AFRICAINE (6→20, +14) ─────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(3841,'Machines à Coudre Singer & Janome',1020,'⚙️'),
(3842,'Machines à Coudre Industrielles',1020,'🏭'),
(3843,'Machines Surjeteuses & Overlock',1020,'⚙️'),
(3844,'Tables de Coupe & Planches',1020,'📐'),
(3845,'Mannequins de Couture',1020,'👗'),
(3846,'Pied de Biche & Accessoires Machine',1020,'⚙️'),
(3847,'Boîtes & Kits de Couture',1020,'🧰'),
(3848,'Formations Couture Africaine',1020,'📚'),
(3849,'Patrons & Modèles Wax',1020,'📐'),
(3850,'Ceintures Élastiques & Biais',1020,'🎗️'),
(3851,'Galons & Passementerie',1020,'✨'),
(3852,'Décorations & Broderies',1020,'🌸'),
(3853,'Kits Débutant Couture',1020,'🎁'),
(3854,'Logiciels CAO Mode & Patron',1020,'💻');

SET FOREIGN_KEY_CHECKS = 1;

SET FOREIGN_KEY_CHECKS = 0;

-- ── 1024. RESTAURATION & TRAITEUR (5→20, +15) ────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(3855,'Autocuiseurs Professionnels',1024,'🍳'),
(3856,'Poêles & Woks Inox Pro',1024,'🥘'),
(3857,'Cuisinières 6 Feux Pro',1024,'🔥'),
(3858,'Braisières & Grils Pro',1024,'🔥'),
(3859,'Réfrigérateurs Vitrine & Positif',1024,'❄️'),
(3860,'Marmites en Fonte Local',1024,'🫕'),
(3861,'Tables Chauffantes & Bain-Marie',1024,'♨️'),
(3862,'Fontaines Eau Fraîche & Chaude',1024,'💧'),
(3863,'Machines à Glace Alimentaire',1024,'🧊'),
(3864,'Équipements Bar Mobile',1024,'🍸'),
(3865,'Chafing Dish & Réchaud Buffet',1024,'🔥'),
(3866,'Casiers & Rayonnages Cuisine',1024,'🗄️'),
(3867,'Tabliers & EPI Restauration',1024,'👨‍🍳'),
(3868,'Gants & Protections Cuisine',1024,'🧤'),
(3869,'Formation HACCP & Hygiène',1024,'📚');

-- ── 1025. MATÉRIEL CUISINE PROFESSIONNELLE (6→20, +14) ───────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(3870,'Salamandres & Gratins Pro',1025,'🔥'),
(3871,'Fours Convection & Vapeur',1025,'🔥'),
(3872,'Cuiseurs Vapeur Professionnels',1025,'💨'),
(3873,'Feux Wok & Feux Puissants',1025,'🔥'),
(3874,'Vitrine Froide Pâtisserie',1025,'❄️'),
(3875,'Cellule de Refroidissement Rapide',1025,'❄️'),
(3876,'Machines à Espresso Pro',1025,'☕'),
(3877,'Centrifugeuses & Extracteurs Pro',1025,'🧃'),
(3878,'Trancheurs & Coupe-Jambon',1025,'🔪'),
(3879,'Batteurs Mélangeurs Planétaires',1025,'🍰'),
(3880,'Fermentateurs & Étuves',1025,'🌡️'),
(3881,'Machines à Glace Italienne',1025,'🍦'),
(3882,'Planchas Gaz Pro',1025,'🔥'),
(3883,'Lave-vaisselle Professionnels',1025,'🍽️');

-- ── 1032. USTENSILES & VAISSELLE PRO (4→20, +16) ─────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(3884,'Couteaux Chef Professionnels',1032,'🔪'),
(3885,'Planches à Découper HACCP',1032,'🔲'),
(3886,'Fouets & Spatules Inox',1032,'🥄'),
(3887,'Économe & Mandolines',1032,'🔪'),
(3888,'Passoires & Chinois',1032,'🔲'),
(3889,'Bacs Gastronormes GN',1032,'📦'),
(3890,'Ramequins & Cocottes',1032,'🍲'),
(3891,'Moules Pâtisserie Pro',1032,'🎂'),
(3892,'Louches & Cuillères Service',1032,'🥄'),
(3893,'Pinces de Service',1032,'🤏'),
(3894,'Tire-bouchon & Décapsuleur',1032,'🍷'),
(3895,'Aiguiseurs & Fusil',1032,'🔪'),
(3896,'Poêles Lyonnaises',1032,'🍳'),
(3897,'Woks Inox & Carbone',1032,'🥘'),
(3898,'Boîtes & Contenants Alimentaires',1032,'📦'),
(3899,'Sets de Service & Présentation',1032,'🍽️');

-- ── 1037. EMBALLAGES & CONDITIONNEMENT ALIMENTAIRE (5→20, +15) ───────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(3900,'Barquettes Aluminium Jetables',1037,'🔲'),
(3901,'Contenants Biodégradables',1037,'🌿'),
(3902,'Boîtes Pizza & Carton',1037,'🍕'),
(3903,'Sacs Papier Kraft',1037,'📦'),
(3904,'Sachets Ziploc & Hermétiques',1037,'🔒'),
(3905,'Ficelles & Filets Alimentaires',1037,'🔲'),
(3906,'Filets Viande & Saucisson',1037,'🥩'),
(3907,'Plateaux Boulangerie & Pâtisserie',1037,'🍞'),
(3908,'Coupelles & Pots Yaourt',1037,'🫙'),
(3909,'Bouteilles PET & HDPE',1037,'🍶'),
(3910,'Bouchons & Capsules',1037,'🔵'),
(3911,'Manchons Thermorétractables',1037,'♨️'),
(3912,'Autocollants & Étiquettes',1037,'🏷️'),
(3913,'Machines Sous-vide',1037,'⚙️'),
(3914,'Ensacheuses & Conditionneuses',1037,'🏭');

-- ── 1043. ÉQUIPEMENTS BAR & BOISSONS (4→20, +16) ─────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(3915,'Réfrigérateurs Boissons Bar',1043,'❄️'),
(3916,'Bacs à Glace & Glacières Bar',1043,'🧊'),
(3917,'Verres à Cocktail & Flûtes',1043,'🥂'),
(3918,'Seaux & Carafes',1043,'🫙'),
(3919,'Sirop & Mixes Cocktail',1043,'🍹'),
(3920,'Piles Bar & Piliers',1043,'⚙️'),
(3921,'Machines à Café Capsules',1043,'☕'),
(3922,'Percolateurs & Cafetières Pro',1043,'☕'),
(3923,'Distributeurs Jus & Eau',1043,'🥤'),
(3924,'Fontaines à Bière Pression',1043,'🍺'),
(3925,'Pressoirs Fruits & Légumes Bar',1043,'🍋'),
(3926,'Centrifugeuses & Extracteurs Jus',1043,'🧃'),
(3927,'Blenders Bar Professionnel',1043,'🥤'),
(3928,'Flacons & Bouteilles Déco Bar',1043,'🍷'),
(3929,'Éclairage LED Bar & Comptoir',1043,'💡'),
(3930,'Chauffe-eau Instantané Bar',1043,'🔥');

-- ── 1048. MOBILIER & AMÉNAGEMENT RESTAURANT (3→20, +17) ──────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(3931,'Tables Rondes Restaurant',1048,'🍽️'),
(3932,'Tables Rectangulaires Pliantes',1048,'🍽️'),
(3933,'Chaises Résine Brasserie',1048,'🪑'),
(3934,'Chaises Empilables Métal',1048,'🪑'),
(3935,'Banquettes & Sofas Lounge',1048,'🛋️'),
(3936,'Tabourets de Bar Hauts',1048,'🍸'),
(3937,'Parasols de Terrasse Restaurant',1048,'☂️'),
(3938,'Mobilier de Terrasse Extérieur',1048,'🌿'),
(3939,'Comptoir Bar & Service',1048,'🍺'),
(3940,'Présentoirs & Étagères',1048,'📦'),
(3941,'Signalétique & Panneaux Menu',1048,'📋'),
(3942,'Climatisation Restaurant',1048,'❄️'),
(3943,'Éclairage Ambiance Restaurant',1048,'💡'),
(3944,'Système de Caisse & POS',1048,'💳'),
(3945,'Distributeurs Serviettes & PH',1048,'🧻'),
(3946,'Porte-manteaux & Vestiaire',1048,'🧥'),
(3947,'Décoration & Plantes Restaurant',1048,'🌿');

-- ── 1052. MATÉRIEL MÉDICAL & PARAMÉDICAL (5→20, +15) ─────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(3948,'Lits Médicalisés & Barreaux',1052,'🛏️'),
(3949,'Tables d\'Examen & Gynécologie',1052,'🏥'),
(3950,'Chariots de Soins & Urgences',1052,'🚑'),
(3951,'Stérilisateurs Autoclaves',1052,'🧪'),
(3952,'Imagerie & Échographie Portable',1052,'🔬'),
(3953,'ECG & Holter',1052,'❤️'),
(3954,'Équipements Physiothérapie',1052,'💪'),
(3955,'Oxygène Médical & Concentrateurs',1052,'🌬️'),
(3956,'Défibrillateurs DEA',1052,'⚡'),
(3957,'Aspirateurs Chirurgicaux',1052,'🔧'),
(3958,'Lampes & Éclairage Médical',1052,'💡'),
(3959,'Mobilier de Salle d\'Attente',1052,'🪑'),
(3960,'Logiciels Gestion Cabinet',1052,'💻'),
(3961,'Formation Soins Infirmiers',1052,'📚'),
(3962,'Consommables Médical (seringues)',1052,'💉');

-- ── 1053. APPAREILS DE DIAGNOSTIC (6→20, +14) ────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(3963,'Tensiomètre Bras Électronique',1053,'❤️'),
(3964,'Tensiomètre Poignet',1053,'❤️'),
(3965,'Glucomètre & Lancettes',1053,'🩸'),
(3966,'Bandelettes Urinaires',1053,'🧪'),
(3967,'Oxymètre Doigt',1053,'💆'),
(3968,'Thermomètre Frontal & Auriculaire',1053,'🌡️'),
(3969,'Spiromètre & Débitmètre',1053,'🌬️'),
(3970,'Dermatoscope & Otoscope',1053,'🔍'),
(3971,'Ophtalmoscope',1053,'👁️'),
(3972,'Tests Rapides Paludisme RDT',1053,'🦟'),
(3973,'Tests Grossesse & LH',1053,'🤰'),
(3974,'ECG Portable 12 Dérivations',1053,'❤️'),
(3975,'Audiomètre Portable',1053,'👂'),
(3976,'Balances Médicales Pèse-bébé',1053,'⚖️');

-- ── 1060. MOBILITÉ, HANDICAP & RÉÉDUCATION (5→20, +15) ───────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(3977,'Fauteuil Roulant Manuel',1060,'♿'),
(3978,'Fauteuil Roulant Électrique',1060,'⚡'),
(3979,'Fauteuil Roulant Sport',1060,'🏋️'),
(3980,'Déambulateurs & Rollators',1060,'🚶'),
(3981,'Béquilles Axillaires',1060,'🦯'),
(3982,'Cannes Anglaises',1060,'🦯'),
(3983,'Canne Blanche Malvoyant',1060,'🦯'),
(3984,'Rampes d\'Accès Portables',1060,'🪜'),
(3985,'Lève-personne & Transferts',1060,'🔧'),
(3986,'Coussins Anti-escarres',1060,'🛏️'),
(3987,'Attelles & Immobilisation',1060,'🦾'),
(3988,'Appareils Stimulation Musculaire',1060,'⚡'),
(3989,'Vélos de Rééducation',1060,'🚴'),
(3990,'Mains Courantes & Barres Appui',1060,'🔩'),
(3991,'Adaptation Véhicule Handicap',1060,'🚗');

-- ── 1066. SOINS & URGENCES (5→20, +15) ───────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(3992,'Seringues Jetables',1066,'💉'),
(3993,'Perfusions & Tubulures',1066,'💧'),
(3994,'Cathéters & Sondes',1066,'🔵'),
(3995,'Canules & Masques O2',1066,'😷'),
(3996,'Compresses Stériles',1066,'🩹'),
(3997,'Bandes Bandages Cohésifs',1066,'🩹'),
(3998,'Désinfectants Alcool & Bétadine',1066,'🧴'),
(3999,'Sutures & Agrafes Cutanées',1066,'🔵'),
(4000,'Plateaux Traitement & Haricots',1066,'🏥'),
(4001,'Trousses Médicales Terrain',1066,'🩺'),
(4002,'Brancard & Civière',1066,'🚑'),
(4003,'Sacs Poubelles DASRI',1066,'🗑️'),
(4004,'Matériel Intubation & Airway',1066,'😤'),
(4005,'Collets Cervicaux',1066,'🦾'),
(4006,'Formation Gestes Premiers Secours',1066,'📚');

-- ── 1072. OPTIQUE & VISION (5→20, +15) ───────────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(4007,'Montures Plastique & Acétate',1072,'👓'),
(4008,'Montures Métal & Titane',1072,'👓'),
(4009,'Montures Grande Taille',1072,'👓'),
(4010,'Montures Enfants',1072,'👧'),
(4011,'Verres Progressifs',1072,'👓'),
(4012,'Verres Anti-lumière Bleue',1072,'💡'),
(4013,'Verres Photochromiques',1072,'☀️'),
(4014,'Lentilles Mensuelles',1072,'👁️'),
(4015,'Lentilles Journalières',1072,'👁️'),
(4016,'Lentilles Colorées',1072,'🎨'),
(4017,'Liquides Conservation Lentilles',1072,'💧'),
(4018,'Lunettes de Soleil UV400',1072,'😎'),
(4019,'Lunettes Sport & Vélo',1072,'🚴'),
(4020,'Loupes & Aides Visuelles',1072,'🔍'),
(4021,'Appareils de Vue (correction)',1072,'🔬');

-- ── 1076. MATERNITÉ & SOINS NOUVEAU-NÉ (5→20, +15) ──────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(4022,'Ceinture de Grossesse & Soutien',1076,'🤰'),
(4023,'Vêtements de Maternité',1076,'🤰'),
(4024,'Soutiens-gorge d\'Allaitement',1076,'🤱'),
(4025,'Coussin de Grossesse & Allaitement',1076,'😴'),
(4026,'Crème Vergetures',1076,'🧴'),
(4027,'Test Grossesse (pharmacie)',1076,'🤰'),
(4028,'Sac de Maternité & Maternité',1076,'🎒'),
(4029,'Guide Préparation Accouchement',1076,'📚'),
(4030,'Oxymètre Fœtal',1076,'❤️'),
(4031,'Tables à Langer & Tapis Soins',1076,'🪑'),
(4032,'Kits de Naissance Complets',1076,'🎁'),
(4033,'Moniteurs Fœtaux Portables',1076,'❤️'),
(4034,'Bains Sièges Post-natal',1076,'🛁'),
(4035,'Protège-mamelons & Bouts de Sein',1076,'🤱'),
(4036,'Formation Doula & Préparation',1076,'📚');

-- ── 1080. FORMATION & ÉDUCATION (4→20, +16) ──────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(4037,'Alphabétisation & Langues Nationales',1080,'🌍'),
(4038,'Formation Entrepreneuriat',1080,'💼'),
(4039,'Certification & Diplômes Pro',1080,'🎓'),
(4040,'E-learning & MOOC',1080,'💻'),
(4041,'Coaching & Développement Personnel',1080,'🏆'),
(4042,'Formations Techniques Spécialisées',1080,'🔧'),
(4043,'Concours Entrée Grandes Écoles',1080,'📚'),
(4044,'Cours de Langues Étrangères',1080,'🌐'),
(4045,'Formation Santé & Médical',1080,'🏥'),
(4046,'Formation Juridique & RH',1080,'⚖️'),
(4047,'Formation Marketing & Ventes',1080,'📈'),
(4048,'Formation Bâtiment & Travaux',1080,'🏗️'),
(4049,'Formation Agro & Agriculture',1080,'🌾'),
(4050,'Formation Technologie & IA',1080,'🤖'),
(4051,'Formation Arts & Culture',1080,'🎨'),
(4052,'Bourses & Financements Études',1080,'💰');

-- ── 1081. FORMATIONS PROFESSIONNELLES (7→20, +13) ────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(4053,'Formation Développement Web',1081,'💻'),
(4054,'Formation Cybersécurité',1081,'🔒'),
(4055,'Formation Data & Excel',1081,'📊'),
(4056,'Formation Graphic Design',1081,'🎨'),
(4057,'Formation Community Management',1081,'📱'),
(4058,'Formation Prise de Vue Vidéo',1081,'🎬'),
(4059,'Formation Couture & Mode',1081,'✂️'),
(4060,'Formation Cuisine & Restauration',1081,'🍳'),
(4061,'Formation Électricité Auto',1081,'⚡'),
(4062,'Formation Maçonnerie & Carrelage',1081,'🏗️'),
(4063,'Formation Sécurité Privée',1081,'🛡️'),
(4064,'Formation Gestion PME/TPE',1081,'💼'),
(4065,'Formation RH & Paie',1081,'💰');

-- ── 1089. SOUTIEN SCOLAIRE & COURS PARTICULIERS (4→20, +16) ──────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(4066,'Cours Mathématiques Primaire',1089,'➕'),
(4067,'Cours Français Primaire',1089,'📝'),
(4068,'Cours Anglais Débutants',1089,'🇬🇧'),
(4069,'Cours Mathématiques Collège',1089,'➕'),
(4070,'Cours Physique-Chimie Lycée',1089,'🔬'),
(4071,'Cours SVT & Sciences',1089,'🌱'),
(4072,'Cours Histoire-Géographie',1089,'🌍'),
(4073,'Cours Philosophie Terminale',1089,'🤔'),
(4074,'Cours Informatique & Numérique',1089,'💻'),
(4075,'Aide Devoirs (maternelle)',1089,'🎒'),
(4076,'Préparation Examens (CEPE, BEPC)',1089,'📋'),
(4077,'Préparation BAC Toutes Séries',1089,'📚'),
(4078,'Cours Arabe & Coran',1089,'📖'),
(4079,'Cours Musique & Art',1089,'🎵'),
(4080,'Cours en Ligne (Zoom, WhatsApp)',1089,'💻'),
(4081,'Fiches & Cahiers de Révision',1089,'📓');

-- ── 1094. MANUELS & LIVRES SCOLAIRES BÉNIN (4→20, +16) ───────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(4082,'Manuels CP & CE1 Bénin',1094,'📚'),
(4083,'Manuels CE2 & CM1 Bénin',1094,'📚'),
(4084,'Manuels CM2 Bénin (CEPE)',1094,'📚'),
(4085,'Manuels 6ème & 5ème Bénin',1094,'📚'),
(4086,'Manuels 4ème & 3ème Bénin (BEPC)',1094,'📚'),
(4087,'Manuels Seconde & Première',1094,'📚'),
(4088,'Manuels Terminale BAC C, D, A',1094,'📚'),
(4089,'Annales BAC Bénin (5-10 ans)',1094,'📋'),
(4090,'Annales BEPC Bénin',1094,'📋'),
(4091,'Dictionnaires Français (Larousse)',1094,'📖'),
(4092,'Biblliothèque Verte & Rose',1094,'📗'),
(4093,'Livres Parascolaires Maths',1094,'➕'),
(4094,'Cahiers d\'Exercices Bénin',1094,'📓'),
(4095,'Atlas & Cartes Géo Scolaires',1094,'🗺️'),
(4096,'Manuels Techno & EPS',1094,'🔧'),
(4097,'Guides Parents & Éducateurs',1094,'📚');

-- ── 1099. MATÉRIEL & FOURNITURES PÉDAGOGIQUES (4→20, +16) ────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(4098,'Tableaux Magnétiques',1099,'🖊️'),
(4099,'Tableaux Veleda & Ardoise',1099,'✏️'),
(4100,'Feutres Tableau & Marqueurs',1099,'🖊️'),
(4101,'Éponges & Chiffons Tableau',1099,'🧹'),
(4102,'Rétroprojecteurs & Documents',1099,'📽️'),
(4103,'Écrans & Tableaux Numériques',1099,'📱'),
(4104,'Règles & Compas Tableau (grand)',1099,'📐'),
(4105,'Cartes Géographiques Murales',1099,'🗺️'),
(4106,'Globe Terrestre Scolaire',1099,'🌍'),
(4107,'Matériel Science (balance)',1099,'⚖️'),
(4108,'Boîtes Matériel Maternelle',1099,'🎨'),
(4109,'Jouets & Puzzles Salle de Classe',1099,'🧩'),
(4110,'Panneaux Signalétique Scolaire',1099,'🏫'),
(4111,'Mobilier Scolaire (tables enfants)',1099,'🪑'),
(4112,'Bibliothèques de Classe',1099,'📚'),
(4113,'Matériel Montessori',1099,'🌱');

-- ── 1104. TRANSPORT LOCAL & ZEMIDJAN (4→20, +16) ─────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(4114,'Motos Zemidjan 125cc',1104,'🏍️'),
(4115,'Motos 200cc & 250cc',1104,'🏍️'),
(4116,'Motos Électriques (e-zemidjan)',1104,'⚡'),
(4117,'Tricycles Mototaxi',1104,'🛺'),
(4118,'GPS & Applications Zemidjan',1104,'📍'),
(4119,'Uniforme & Tenue Zemidjan',1104,'🦺'),
(4120,'Gilet & Badge Identification',1104,'🏷️'),
(4121,'Assurance Moto & RCAM',1104,'🛡️'),
(4122,'Permis & Formation Conduite',1104,'🎓'),
(4123,'Vidange & Entretien Courant',1104,'🔧'),
(4124,'Lavage & Nettoyage Moto',1104,'🧹'),
(4125,'Pièces Détachées Rapides',1104,'⚙️'),
(4126,'Accessoires Cargo & Transport',1104,'📦'),
(4127,'Location Moto & Zemidjan',1104,'🔑'),
(4128,'Associations & Syndicats Zem',1104,'🤝'),
(4129,'Applications Taxis & VTC',1104,'📱');

-- ── 1105. PIÈCES & ACCESSOIRES ZEMIDJAN (6→20, +14) ──────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(4130,'Piston & Chemise Cylindre',1105,'⚙️'),
(4131,'Vilebrequin & Segments',1105,'⚙️'),
(4132,'Carburateur & Pompe Essence',1105,'⛽'),
(4133,'Bobine & Allumage',1105,'⚡'),
(4134,'Câble Embrayage & Accélérateur',1105,'🔌'),
(4135,'Roulement & Chaines',1105,'⚙️'),
(4136,'Amortisseurs Avant & Arrière',1105,'🔧'),
(4137,'Direction & Guidon',1105,'🏍️'),
(4138,'Feu Arrière & Clignotants',1105,'💡'),
(4139,'Compteur & Tableau de Bord',1105,'📊'),
(4140,'Selle & Réservoir',1105,'🏍️'),
(4141,'Poignées & Commandes',1105,'🏍️'),
(4142,'Boîte de Vitesses & Embrayage',1105,'⚙️'),
(4143,'Pneus Moto (2.75-17, 3.00-17)',1105,'🔵');

-- ── 1112. TRICYCLES & TRANSPORT MARCHANDISES (3→20, +17) ─────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(4144,'Tricycles Cargo 200cc & 250cc',1112,'🛺'),
(4145,'Tricycles Électriques Cargo',1112,'⚡'),
(4146,'Caisses & Bennes Cargo',1112,'📦'),
(4147,'Bâches de Protection Cargo',1112,'🛡️'),
(4148,'Pièces Moteur Tricycle',1112,'⚙️'),
(4149,'Pneus Tricycle',1112,'🔵'),
(4150,'Freins & Amortisseurs Tricycle',1112,'🔧'),
(4151,'Châssis & Cadre Tricycle',1112,'🔩'),
(4152,'Batterie & Démarrage Tricycle',1112,'🔋'),
(4153,'Antivol & Sécurité Tricycle',1112,'🔒'),
(4154,'Tracteurs Petits & Motoculteurs',1112,'🚜'),
(4155,'Charrettes & Remorques Traction',1112,'🐴'),
(4156,'Camionnettes de Livraison Locale',1112,'🚚'),
(4157,'Vélos Cargo & Bakfiets',1112,'🚲'),
(4158,'Applications Logistique Locale',1112,'📱'),
(4159,'Formation Conduite Tricycle',1112,'🎓'),
(4160,'Entretien & Réparation Tricycle',1112,'🔧');

-- ── 1116. SIGNALISATION & SÉCURITÉ ROUTIÈRE (5→20, +15) ──────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(4161,'Panneaux de Sens Interdit',1116,'🚫'),
(4162,'Panneaux Limitation Vitesse',1116,'🚦'),
(4163,'Panneaux de Stationnement',1116,'🅿️'),
(4164,'Balises & Cônes de Chantier',1116,'🔶'),
(4165,'Barrières de Sécurité Routière',1116,'🔲'),
(4166,'Glissières de Sécurité',1116,'🛡️'),
(4167,'Bandes Rugueuses & Dos d\'Âne',1116,'⬛'),
(4168,'Éclairage Solaire Routier',1116,'☀️'),
(4169,'Marquages Routiers (peinture)',1116,'🎨'),
(4170,'Gilets Fluorescents Lot',1116,'🦺'),
(4171,'Radar Pédagogique Vitesse',1116,'📡'),
(4172,'Feux Tricolores Solaires',1116,'🚦'),
(4173,'Compteurs de Trafic',1116,'📊'),
(4174,'Ralentisseurs Caoutchouc',1116,'⬛'),
(4175,'Formation Sécurité Routière',1116,'📚');

-- ── 1120. ENTRETIEN & ATELIER MOTO (3→20, +17) ───────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(4176,'Huile Moteur 2T & 4T',1120,'🛢️'),
(4177,'Huile de Boîte & Frein',1120,'🛢️'),
(4178,'Graisse Chaîne & Roulements',1120,'⚙️'),
(4179,'Nettoyant Carburateur',1120,'🧹'),
(4180,'Liquide Refroidissement',1120,'💧'),
(4181,'Liquide Frein DOT4',1120,'🔵'),
(4182,'Clés à Tube & Clés Plates',1120,'🔧'),
(4183,'Tournevis Cruciforme & Plat',1120,'🪛'),
(4184,'Pinces & Démonteurs',1120,'🔧'),
(4185,'Extracteur de Bobine',1120,'⚙️'),
(4186,'Multimètre & Diagnostic',1120,'📊'),
(4187,'Banc Moto & Béquilles',1120,'🔧'),
(4188,'Compresseur Portable Moto',1120,'💨'),
(4189,'Kits Vidange Complète Moto',1120,'🎁'),
(4190,'Peinture Touchup & Retouche',1120,'🎨'),
(4191,'Livres & Guides Mécanique Moto',1120,'📚'),
(4192,'Formation Mécanique Moto',1120,'🎓');

-- ── 1124. LINGERIE & SOUS-VÊTEMENTS FEMME (4→20, +16) ────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(4193,'Soutiens-gorge Bandeau',1124,'🩱'),
(4194,'Soutiens-gorge Push-Up',1124,'✨'),
(4195,'Soutiens-gorge Allaitement',1124,'🤱'),
(4196,'Soutiens-gorge Sport',1124,'🏋️'),
(4197,'Bralettes & Brassières',1124,'🩱'),
(4198,'Culottes Taille Haute',1124,'👗'),
(4199,'Shorties & Boxers Femme',1124,'🩲'),
(4200,'Culottes Menstruelles',1124,'🌸'),
(4201,'Culottes Grande Taille',1124,'👗'),
(4202,'Strings & Micro Bikini',1124,'✨'),
(4203,'Combinaisons & Gainants',1124,'✨'),
(4204,'Guêpières & Corsets',1124,'✨'),
(4205,'Bas & Collants',1124,'🩰'),
(4206,'Chaussettes Fantaisie Femme',1124,'🧦'),
(4207,'Sets Lingerie Coordonnés',1124,'🎁'),
(4208,'Lingerie Bio & Naturelle',1124,'🌿');

-- ── 1129. LINGERIE & SOUS-VÊTEMENTS HOMME (3→20, +17) ────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(4209,'Boxers Coton',1129,'🩲'),
(4210,'Boxers Sport',1129,'🏋️'),
(4211,'Boxers Grande Taille',1129,'🩲'),
(4212,'Slips Classiques',1129,'🩲'),
(4213,'Slips Slim & Micro',1129,'🩲'),
(4214,'Tangas Homme',1129,'🩲'),
(4215,'Maillots Corps Coton',1129,'👕'),
(4216,'Maillots Thermiques',1129,'❄️'),
(4217,'Débardeurs de Sport',1129,'🏋️'),
(4218,'Chaussettes Courtes (sport)',1129,'🧦'),
(4219,'Chaussettes Longues',1129,'🧦'),
(4220,'Chaussettes Techniques Running',1129,'🏃'),
(4221,'Chaussettes Fantaisie Homme',1129,'🎨'),
(4222,'Chaussettes Invisibles (no-show)',1129,'🦶'),
(4223,'Caleçons Longs',1129,'🩲'),
(4224,'Sous-vêtements Bio',1129,'🌿'),
(4225,'Packs Sous-vêtements Multi',1129,'📦');

-- ── 1133. PYJAMAS & VÊTEMENTS D'INTÉRIEUR (5→20, +15) ────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(4226,'Pyjamas Deux Pièces Femme',1133,'🌙'),
(4227,'Pyjamas Femme (combinaison)',1133,'💤'),
(4228,'Nuisettes & Chemises de Nuit',1133,'🌸'),
(4229,'Pyjamas Homme Bermuda',1133,'😴'),
(4230,'Pyjamas Homme Pantalon Long',1133,'🌙'),
(4231,'Pyjamas Famille Assortis',1133,'👨‍👩‍👧‍👦'),
(4232,'Pyjamas Noël & Thématiques',1133,'🎄'),
(4233,'Pyjamas Velours & Chaud',1133,'❄️'),
(4234,'Kimonos & Peignoirs Soie',1133,'✨'),
(4235,'Sarouel & Bas Confort',1133,'😴'),
(4236,'Pulls & Gilets de Maison',1133,'🧶'),
(4237,'Chaussettes Maison Antidérapantes',1133,'🧦'),
(4238,'Pantoufles & Chaussons Chauds',1133,'🥿'),
(4239,'Peignoir de Bain Unisexe',1133,'🛁'),
(4240,'Tenues de Grossesse Confort',1133,'🤰');

-- ── 1139. VÊTEMENTS DE TRAVAIL & UNIFORMES (5→20, +15) ───────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(4241,'Blouses Blanches & Médicales',1139,'🏥'),
(4242,'Tenues Chirurgicales (scrubs)',1139,'🩺'),
(4243,'Tenues de Cuisine',1139,'👨‍🍳'),
(4244,'Uniformes Police & Sécurité',1139,'👮'),
(4245,'Uniformes Armée & Forces',1139,'🪖'),
(4246,'Tenues Pompiers',1139,'🚒'),
(4247,'Tenues de Sport Scolaires',1139,'⚽'),
(4248,'Uniformes Hôtellerie & Service',1139,'🏨'),
(4249,'Vêtements Haute-visibilité',1139,'🟡'),
(4250,'EPI : Gilet, Casque, Lunettes',1139,'🦺'),
(4251,'Combinaisons Anti-chimique',1139,'🧪'),
(4252,'Bottes de Sécurité Norme EN',1139,'🥾'),
(4253,'Gants de Protection Travail',1139,'🧤'),
(4254,'Tabliers & Protège-bras',1139,'🛡️'),
(4255,'Personnalisation Uniformes',1139,'🎨');

-- ── 1145. VÊTEMENTS DE MARIAGE & CÉRÉMONIE (6→20, +14) ───────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(4256,'Robes de Mariée Wax Africain',1145,'💒'),
(4257,'Robes de Mariée Occidentales',1145,'👗'),
(4258,'Robes Demoiselles d\'Honneur',1145,'👗'),
(4259,'Costumes & Smokings Mariés',1145,'🤵'),
(4260,'Ensembles Famille Mariage Wax',1145,'👨‍👩‍👧‍👦'),
(4261,'Tenues Cérémonie Traditionnelle',1145,'🌍'),
(4262,'Accessoires Mariée (voile, couronne)',1145,'💐'),
(4263,'Chaussures de Mariée',1145,'👠'),
(4264,'Chaussures Marié',1145,'👞'),
(4265,'Bijoux de Mariage',1145,'💍'),
(4266,'Décorations Mariage',1145,'🌸'),
(4267,'Invitations & Faire-part',1145,'✉️'),
(4268,'Services Mariage (traiteur, DJ)',1145,'🎶'),
(4269,'Location Tenue de Mariage',1145,'🔑');

-- ── 1150. CASQUETTES, BONNETS & CHAPEAUX (3→20, +17) ─────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(4270,'Casquettes Baseball & Dad Cap',1150,'🧢'),
(4271,'Casquettes Trucker & Mesh',1150,'🧢'),
(4272,'Casquettes Snapback',1150,'🧢'),
(4273,'Casquettes Brodées Personnalisées',1150,'🎨'),
(4274,'Casquettes Sport & Running',1150,'🏃'),
(4275,'Casquettes Militaires',1150,'🪖'),
(4276,'Bonnets Tricot & Laine',1150,'🧶'),
(4277,'Bonnets de Bain',1150,'🏊'),
(4278,'Bonnets Bébé & Enfants',1150,'👶'),
(4279,'Chapeaux Panama & Paille',1150,'🎩'),
(4280,'Chapeaux de Soleil & Anti-UV',1150,'☀️'),
(4281,'Chapeaux Fedora',1150,'🎩'),
(4282,'Fez & Calots Traditionnels',1150,'🌍'),
(4283,'Turbans & Têtes de Femme',1150,'🧕'),
(4284,'Chapeaux Enfants',1150,'🎠'),
(4285,'Coiffes & Headbands Sport',1150,'💪'),
(4286,'Chapellerie Artisanale Locale',1150,'🇧🇯');

-- ── 1154. LUNETTES DE SOLEIL MODE (3→20, +17) ────────────────────────────────
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(4287,'Lunettes Aviateur',1154,'✈️'),
(4288,'Lunettes Wayfarer',1154,'🕶️'),
(4289,'Lunettes Cat Eye',1154,'😎'),
(4290,'Lunettes Ronde & Hipster',1154,'🔵'),
(4291,'Lunettes Sport & Cyclisme',1154,'🚴'),
(4292,'Lunettes Surdimensionnées',1154,'😎'),
(4293,'Lunettes Miroir & Photochromiques',1154,'🌈'),
(4294,'Lunettes de Plage & Mer',1154,'🏖️'),
(4295,'Lunettes Enfants UV400',1154,'👧'),
(4296,'Lunettes de Luxe & Créateurs',1154,'💎'),
(4297,'Lunettes Vintage & Rétro',1154,'🕶️'),
(4298,'Lunettes pour Hommes',1154,'👨'),
(4299,'Lunettes pour Femmes',1154,'👩'),
(4300,'Étuis & Protections Lunettes',1154,'🎁'),
(4301,'Nettoyants & Chiffons Lunettes',1154,'✨'),
(4302,'Lunettes Anti-Lumière Bleue Mode',1154,'💡'),
(4303,'Lunettes de Nuit & Conduite',1154,'🌙');

SET FOREIGN_KEY_CHECKS = 1;

SET FOREIGN_KEY_CHECKS = 0;

-- ── 1158. SOINS PEAU NOIRE (9→20, +11)
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(4304,'Sérums Éclat Peau Noire',1158,'✨'),
(4305,'Huiles Corps Traditionnelles',1158,'🫙'),
(4306,'Masques Visage Naturels',1158,'🌿'),
(4307,'Anti-Taches & Hyperpigmentation',1158,'💫'),
(4308,'Crèmes Hydratantes Intensives',1158,'💧'),
(4309,'Gommages Corps & Visage',1158,'🧴'),
(4310,'Beurre de Karité Pur',1158,'🌾'),
(4311,'Savons Naturels Africains',1158,'🧼'),
(4312,'Soins Lèvres & Contour',1158,'💋'),
(4313,'Soins Post-Épilation',1158,'🌸'),
(4314,'Crèmes Solaires Peaux Foncées',1158,'☀️');

-- ── 1168. VIANDES (4→20, +16)
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(4315,'Bœuf Local Entier',1168,'🐄'),
(4316,'Poulet Fermier',1168,'🐓'),
(4317,'Porc Frais',1168,'🐷'),
(4318,'Mouton & Agneau',1168,'🐑'),
(4319,'Lapin',1168,'🐇'),
(4320,'Viande de Brousse',1168,'🦌'),
(4321,'Abats & Abattis',1168,'🫀'),
(4322,'Saucisses & Merguez',1168,'🌭'),
(4323,'Viandes Marinées',1168,'🍖'),
(4324,'Bœuf Haché',1168,'🥩'),
(4325,'Côtelettes & Steaks',1168,'🥩'),
(4326,'Poulet Découpé',1168,'🍗'),
(4327,'Dinde',1168,'🦃'),
(4328,'Pieds & Queue',1168,'🐾'),
(4329,'Viandes Fumées',1168,'💨'),
(4330,'Charcuterie',1168,'🥓');

-- ── 1173. POISSONS FRAIS (3→20, +17)
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(4331,'Tilapia Frais',1173,'🐟'),
(4332,'Carpe',1173,'🐠'),
(4333,'Capitaine',1173,'🐡'),
(4334,'Poisson-Chat',1173,'🦈'),
(4335,'Homard & Crustacés',1173,'🦞'),
(4336,'Crevettes',1173,'🍤'),
(4337,'Crabes',1173,'🦀'),
(4338,'Calamars & Poulpes',1173,'🦑'),
(4339,'Sardines',1173,'🐟'),
(4340,'Maquereau',1173,'🐠'),
(4341,'Thon Frais',1173,'🐟'),
(4342,'Poissons Fumés',1173,'💨'),
(4343,'Poissons Séchés',1173,'☀️'),
(4344,'Poissons Salés',1173,'🧂'),
(4345,'Escargots',1173,'🐌'),
(4346,'Grenouilles',1173,'🐸'),
(4347,'Anguilles',1173,'〰️');

-- ── 1177. FRUITS & LÉGUMES (5→20, +15)
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(4348,'Tomates',1177,'🍅'),
(4349,'Oignons & Ail',1177,'🧅'),
(4350,'Piments & Poivrons',1177,'🌶️'),
(4351,'Ignames & Manioc',1177,'🥔'),
(4352,'Plantains',1177,'🍌'),
(4353,'Mangues',1177,'🥭'),
(4354,'Ananas',1177,'🍍'),
(4355,'Papayes',1177,'🍈'),
(4356,'Avocats',1177,'🥑'),
(4357,'Feuilles Locales (Gboma, Crincrin)',1177,'🥬'),
(4358,'Aubergines Africaines',1177,'🍆'),
(4359,'Gombos',1177,'🌿'),
(4360,'Corossols',1177,'🍏'),
(4361,'Oranges & Agrumes',1177,'🍊'),
(4362,'Noix de Coco',1177,'🥥');

-- ── 1183. CONDIMENTS LOCAUX (6→20, +14)
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(4363,'Huile de Palme',1183,'🫙'),
(4364,'Soumbala & Afitin',1183,'🌿'),
(4365,'Piment Moulu',1183,'🌶️'),
(4366,'Sel Iodé & Sel Gemme',1183,'🧂'),
(4367,'Cube Maggi & Bouillons',1183,'🟡'),
(4368,'Vinaigre',1183,'🫙'),
(4369,'Tomate Concentrée',1183,'🍅'),
(4370,'Moutarde',1183,'💛'),
(4371,'Ketchup',1183,'🍅'),
(4372,'Sauce Piment Artisanale',1183,'🌶️'),
(4373,'Mayonnaise',1183,'💛'),
(4374,'Epices Mélangées',1183,'✨'),
(4375,'Gingembre & Curcuma',1183,'🫚'),
(4376,'Noix de Muscade & Clou',1183,'🌰');

-- ── 1187. BOULANGERIE (3→20, +17)
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(4377,'Pain Baguette',1187,'🥖'),
(4378,'Pain de Mie',1187,'🍞'),
(4379,'Pain Sucré & Brioches',1187,'🥐'),
(4380,'Croissants',1187,'🥐'),
(4381,'Gâteaux Traditionnels',1187,'🎂'),
(4382,'Beignets',1187,'🍩'),
(4383,'Pâtisseries Fines',1187,'🍰'),
(4384,'Tartes & Quiches',1187,'🥧'),
(4385,'Cookies & Biscuits Artisanaux',1187,'🍪'),
(4386,'Muffins & Cupcakes',1187,'🧁'),
(4387,'Pain Complet & Céréales',1187,'🌾'),
(4388,'Pain Sans Gluten',1187,'🌿'),
(4389,'Pain aux Grains',1187,'🌰'),
(4390,'Galettes & Crêpes',1187,'🥞'),
(4391,'Pains Spéciaux',1187,'🍞'),
(4392,'Sandwichs Préparés',1187,'🥪'),
(4393,'Farines & Mélanges',1187,'🌾');

-- ── 1191. VOLLEYBALL (3→20, +17)
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(4394,'Ballons Volleyball',1191,'🏐'),
(4395,'Filets Volleyball',1191,'🕸️'),
(4396,'Poteaux Volleyball',1191,'🏐'),
(4397,'Chaussures Volleyball',1191,'👟'),
(4398,'Genouillères Volleyball',1191,'🦵'),
(4399,'Tenues Volleyball',1191,'👕'),
(4400,'Volleyball de Plage',1191,'🏖️'),
(4401,'Sacs Volleyball',1191,'🎒'),
(4402,'Pompes & Accessoires',1191,'🔧'),
(4403,'Lunettes Beach Volley',1191,'🕶️'),
(4404,'Brassards Volleyball',1191,'🤲'),
(4405,'Protège-poignets',1191,'🤜'),
(4406,'Chaussettes Volleyball',1191,'🧦'),
(4407,'Casquettes Beach Volley',1191,'🧢'),
(4408,'Antennes Filet',1191,'📡'),
(4409,'Marquage & Lignes de Terrain',1191,'📐'),
(4410,'Livres & Guides Volleyball',1191,'📖');

-- ── 1195. HANDBALL (4→20, +16)
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(4411,'Ballons Handball',1195,'🤾'),
(4412,'Buts Handball',1195,'🥅'),
(4413,'Tenues Handball',1195,'👕'),
(4415,'Genouillères Handball',1195,'🦵'),
(4416,'Protège-poignets Handball',1195,'🤜'),
(4417,'Gardien Handball (Équipement)',1195,'🧤'),
(4418,'Sacs Handball',1195,'🎒'),
(4419,'Cônes & Plots',1195,'🟠'),
(4420,'Filets de Remplacement',1195,'🕸️'),
(4421,'Tableaux de Score',1195,'📋'),
(4422,'Marquage Terrain',1195,'📐'),
(4423,'Pompes Ballon',1195,'🔧'),
(4424,'Bandages & Strapping',1195,'🩹'),
(4425,'Livres Handball',1195,'📖'),
(4426,'Arbitrage Matériel',1195,'🏅');

-- ── 1198. ATHLÉTISME (3→20, +17)
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(4427,'Chaussures de Course',1198,'👟'),
(4428,'Pointes d\'Athlétisme',1198,'👟'),
(4429,'Tenues de Course',1198,'🏃'),
(4430,'Chronométres & Montres Sport',1198,'⏱️'),
(4431,'Javelots',1198,'🏹'),
(4432,'Disques & Marteaux',1198,'⚙️'),
(4433,'Perches de Saut',1198,'🏅'),
(4434,'Haies',1198,'🏃'),
(4435,'Témoin de Relais',1198,'🔖'),
(4436,'Blocs de Départ',1198,'🚦'),
(4437,'Poids (Shot Put)',1198,'⚽'),
(4438,'Piste & Revêtement',1198,'🔴'),
(4439,'Sautoir & Tapis de Réception',1198,'🟦'),
(4440,'Rubans de Finition',1198,'🎀'),
(4441,'Cônes & Plots Athlétisme',1198,'🟠'),
(4442,'Sacs de Sport Athlétisme',1198,'🎒'),
(4443,'Nutrition Sport',1198,'💊');

-- ── 1202. SPORTS SCOLAIRES (5→20, +15)
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(4444,'Kits Gymkhana',1202,'🎯'),
(4445,'Cordes à Sauter Scolaires',1202,'🎪'),
(4446,'Balles Souples & Mousse',1202,'⚽'),
(4447,'Cerceaux Gymnase',1202,'⭕'),
(4448,'Plots & Marqueurs',1202,'🟠'),
(4449,'Tapis Gym Scolaire',1202,'🟦'),
(4450,'Haies Basses',1202,'🚧'),
(4452,'Dossards Scolaires',1202,'🏷️'),
(4453,'Ballons d\'EPS',1202,'🏈'),
(4454,'Bancs de Musculation Légers',1202,'🏋️'),
(4455,'Sacs de Sport Scolaire',1202,'🎒'),
(4456,'Médailles & Trophées',1202,'🏆'),
(4457,'Chronomètres',1202,'⏱️'),
(4458,'Programmes EPS',1202,'📚');

-- ── 1205. BILLARD (5→20, +15)
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(4460,'Queues de Billard',1205,'🎯'),
(4461,'Boules de Billard (Set)',1205,'🎱'),
(4462,'Triangle & Rack',1205,'🔺'),
(4463,'Craies de Billard',1205,'🖌️'),
(4464,'Porte-Queues',1205,'🗄️'),
(4465,'Housses de Table',1205,'🛏️'),
(4466,'Lampes de Billard',1205,'💡'),
(4467,'Tapis de Billard',1205,'🟩'),
(4468,'Score & Tableau',1205,'📋'),
(4469,'Accessoires Snooker',1205,'🎱'),
(4470,'Gants de Billard',1205,'🧤'),
(4471,'Tables Baby-Foot',1205,'⚽'),
(4472,'Mini-Billard Portable',1205,'🎮'),
(4473,'Livres & Stratégies Billard',1205,'📖');

-- ── 1209. MOUSTIQUAIRES (6→20, +14)
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(4474,'Moustiquaires Lit Double',1209,'🛏️'),
(4475,'Moustiquaires Lit Enfant',1209,'👶'),
(4476,'Moustiquaires Lit Simple',1209,'🛏️'),
(4477,'Moustiquaires Fenêtre',1209,'🪟'),
(4478,'Moustiquaires Porte',1209,'🚪'),
(4479,'Moustiquaires Carré',1209,'⬜'),
(4480,'Moustiquaires Pop-Up',1209,'⛺'),
(4481,'Moustiquaires Extérieur & Camping',1209,'🏕️'),
(4482,'Moustiquaires Hamac',1209,'🌴'),
(4483,'Répulsifs Anti-Moustiques',1209,'🌿'),
(4484,'Serpentins & Spirales',1209,'🌀'),
(4485,'Diffuseurs Électriques',1209,'🔌'),
(4486,'Raquettes Anti-Moustiques',1209,'🎾'),
(4487,'Tiges & Supports Moustiquaires',1209,'🔩');

-- ── 1214. EAU & PURIFICATION (6→20, +14)
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(4488,'Filtres à Eau Céramique',1214,'🏺'),
(4489,'Filtres à Charbon Actif',1214,'⚫'),
(4490,'Purificateurs UV',1214,'☀️'),
(4491,'Bidons & Jerricans',1214,'🪣'),
(4492,'Pompes à Main',1214,'💧'),
(4493,'Chlore & Pastilles',1214,'💊'),
(4494,'Fontaines Filtrantes',1214,'⛲'),
(4495,'Citernes & Réservoirs',1214,'🫙'),
(4496,'Forage & Puits (Matériel)',1214,'⚙️'),
(4497,'Tuyaux & Raccords',1214,'🔧'),
(4498,'Robinets & Vannes',1214,'🚿'),
(4499,'Tests de Qualité Eau',1214,'🔬'),
(4500,'Distillateurs',1214,'🧪'),
(4501,'Adoucisseurs d\'Eau',1214,'💧');

-- ── 1218. ÉCLAIRAGE & CONFORT NOCTURNE (3→20, +17)
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(4502,'Lampes Solaires Portables',1218,'☀️'),
(4503,'Lampes Torches LED',1218,'🔦'),
(4504,'Lampes de Bureau Solaires',1218,'💡'),
(4505,'Lampadaires Solaires Jardin',1218,'🌿'),
(4506,'Guirlandes LED Solaires',1218,'✨'),
(4507,'Ventilateurs Solaires',1218,'🌀'),
(4508,'Ventilateurs Rechargeables',1218,'⚡'),
(4509,'Bougies & Lanternes',1218,'🕯️'),
(4510,'Lampes Tempête',1218,'⛈️'),
(4511,'Projecteurs Solaires',1218,'🔦'),
(4512,'Ampoules LED Solaires',1218,'💡'),
(4513,'Chargeurs USB Solaires',1218,'🔋'),
(4514,'Horloges & Réveil Sans Courant',1218,'⏰'),
(4515,'Moustiquaires Lumineuses',1218,'✨'),
(4516,'Éclairages d\'Urgence',1218,'🚨'),
(4517,'Kits Complets Éclairage Solaire',1218,'☀️'),
(4518,'Ballons Lumineux Gonflables',1218,'🎈');

SET FOREIGN_KEY_CHECKS = 1;
