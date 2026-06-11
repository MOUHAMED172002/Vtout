-- ============================================================================
-- 📦 CATÉGORIES V3 — Manques critiques pour le marché béninois
-- Couvre :
--   • Matériaux de Construction
--   • Agriculture & Élevage
--   • Tenues Traditionnelles & Cérémoniales Béninoises
--   • Restauration & Traiteur
--   • Matériel Médical & Paramédical
--   • Formation & Éducation
--   • Transport Local & Zemidjan
--   • Compléments Mode (Lingerie, Uniforme, Mariage...)
--   • Beauté spécifique Peau Noire & Africaine
--   • Alimentation Fraîche (Viandes, Légumes, Poissons)
--   • Sports Populaires Bénin (Volleyball, Handball, Athlétisme)
--   • Maison tropicale (Moustiquaires, Pompes, Chauffe-eau)
--   • Fix icône Accessoires Mode CAP → 👜
-- IDs démarrent à 900
-- ============================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ──────────────────────────────────────────────────────────────────
-- CORRECTIF : Accessoires Mode (ID 206) avait l'icône 'CAP' (invalide)
-- ──────────────────────────────────────────────────────────────────
UPDATE categories SET icon = '👜' WHERE id = 206;

-- ══════════════════════════════════════════════════════════════════
-- A.  MATÉRIAUX DE CONSTRUCTION  (root 900, IDs 900–959)
-- ══════════════════════════════════════════════════════════════════
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(900, 'Matériaux de Construction', NULL, '🏗️'),

-- Gros Œuvre
(901, 'Gros Œuvre & Fondations', 900, '🧱'),
(902, 'Ciment & Béton', 901, '🧱'),
(903, 'Briques, Parpaings & Agglos', 901, '🧱'),
(904, 'Sable, Gravier & Ballast', 901, '⛏️'),
(905, 'Fer à Béton & Acier de Construction', 901, '🔩'),
(906, 'Hourdis, Poutrelles & Planchers', 901, '🏗️'),
(907, 'Pré-dalles & Préfabriqués', 901, '🏗️'),

-- Couverture & Toiture
(908, 'Couverture & Toiture', 900, '🏠'),
(909, 'Tôles Ondulées & Bacs Acier', 908, '🏠'),
(910, 'Tuiles & Ardoises', 908, '🏚️'),
(911, 'Charpente & Bois de Construction', 908, '🪵'),
(912, 'Gouttières, Chéneaux & Évacuation', 908, '💧'),
(913, 'Mousses & Isolants Toiture', 908, '🌡️'),

-- Revêtements & Finitions
(914, 'Revêtements & Finitions', 900, '🪟'),
(915, 'Carrelage & Faïence', 914, '⬜'),
(916, 'Peinture Bâtiment (intérieur & ext.)', 914, '🎨'),
(917, 'Enduits, Plâtres & Mortiers', 914, '🪣'),
(918, 'Parquet, Stratifié & Vinyle', 914, '🪵'),
(919, 'Faux Plafond & Cloisons Légères', 914, '🏗️'),
(920, 'Colle à Carrelage & Joint', 914, '🔧'),

-- Portes, Fenêtres & Menuiserie
(921, 'Portes, Fenêtres & Menuiserie', 900, '🚪'),
(922, 'Portes Métalliques & Blindées', 921, '🚪'),
(923, 'Portes en Bois & PVC', 921, '🚪'),
(924, 'Fenêtres, Jalousies & Volets', 921, '🪟'),
(925, 'Portails, Grilles & Clôtures', 921, '🔒'),
(926, 'Stores & Moustiquaires Fenêtres', 921, '🪟'),
(927, 'Serrures & Quincaillerie Menuiserie', 921, '🗝️'),

-- Plomberie & Sanitaire
(928, 'Plomberie & Sanitaire', 900, '🚿'),
(929, 'Tuyaux PVC, PPR & Raccords', 928, '🔧'),
(930, 'Robinetterie & Mitigeurs', 928, '🚿'),
(931, 'WC, Lavabos & Éviers', 928, '🚽'),
(932, 'Chauffe-eau Électrique & Gaz', 928, '🔥'),
(933, 'Chauffe-eau Solaire', 928, '☀️'),
(934, 'Pompes à Eau (immergées & surface)', 928, '💧'),
(935, 'Réservoirs, Châteaux d\'Eau & Cuves', 928, '🏗️'),

-- Électricité Bâtiment
(936, 'Électricité Bâtiment', 900, '⚡'),
(937, 'Câbles & Fils Électriques Bâtiment', 936, '🔌'),
(938, 'Tableaux Électriques & Disjoncteurs', 936, '⚡'),
(939, 'Prises, Interrupteurs & Gaines', 936, '🔌'),
(940, 'Éclairage Extérieur & Bâtiment', 936, '💡'),

-- Outillage Chantier
(941, 'Outillage de Chantier', 900, '🔨'),
(942, 'Bétonières & Vibreurs', 941, '⚙️'),
(943, 'Niveaux, Mètres & Mesure', 941, '📏'),
(944, 'Échafaudages & Étais', 941, '🪜'),
(945, 'Outils Maçonnerie (truelles, talochons)', 941, '🔨'),
(946, 'Perceuses, Marteaux-piqueurs & Meuleuses', 941, '⚡'),

-- Isolation & Étanchéité
(947, 'Isolation & Étanchéité', 900, '🌡️'),
(948, 'Étanchéité Toiture & Terrasse', 947, '🏠'),
(949, 'Bandes Armées & Membranes', 947, '🔧');

-- ══════════════════════════════════════════════════════════════════
-- B.  AGRICULTURE & ÉLEVAGE  (root 950, IDs 950–999)
-- ══════════════════════════════════════════════════════════════════
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(950, 'Agriculture & Élevage', NULL, '🌾'),

-- Semences & Plants
(951, 'Semences & Plants', 950, '🌱'),
(952, 'Semences Céréales (maïs, riz, sorgho)', 951, '🌽'),
(953, 'Semences Légumes & Tubercules', 951, '🥬'),
(954, 'Plants Fruitiers & Arbres', 951, '🌳'),
(955, 'Semences Fourragères & Couverture', 951, '🌿'),
(956, 'Bulbes, Rhizomes & Boutures', 951, '🌱'),

-- Engrais & Fertilisants
(957, 'Engrais & Produits Phytosanitaires', 950, '🧪'),
(958, 'Engrais Minéraux (NPK, Urée, DAP)', 957, '🧪'),
(959, 'Engrais Organiques & Compost', 957, '♻️'),
(960, 'Pesticides & Herbicides', 957, '🌿'),
(961, 'Fongicides & Biopesticides', 957, '🔬'),
(962, 'Amendements & Chaux Agricoles', 957, '🌱'),

-- Matériel Agricole
(963, 'Matériel & Équipement Agricole', 950, '🚜'),
(964, 'Houes, Daba & Outillage Manuel', 963, '⛏️'),
(965, 'Motoculteurs, Tracteurs & Accessoires', 963, '🚜'),
(966, 'Pompes Agricoles & Motopompes', 963, '💧'),
(967, 'Systèmes d\'Irrigation Goutte-à-goutte', 963, '💦'),
(968, 'Filets, Bâches & Tunnels Agricoles', 963, '🌿'),
(969, 'Brouettes, Charrettes & Transport', 963, '🪣'),
(970, 'Pulvérisateurs & Atomiseurs', 963, '💨'),

-- Élevage & Aviculture
(971, 'Élevage & Aviculture', 950, '🐔'),
(972, 'Aliments Volaille (poulets, pintades, canards)', 971, '🐔'),
(973, 'Aliments Ruminants (bœufs, moutons, chèvres)', 971, '🐄'),
(974, 'Aliments Porcs & Lapins', 971, '🐖'),
(975, 'Médicaments & Vaccins Vétérinaires', 971, '💉'),
(976, 'Équipements Aviculture (cages, poussinières)', 971, '🏠'),
(977, 'Abreuvoirs & Mangeoires', 971, '🥣'),
(978, 'Matériel Traite & Laiterie', 971, '🥛'),

-- Pêche & Aquaculture
(979, 'Pêche & Aquaculture', 950, '🎣'),
(980, 'Filets de Pêche & Éperviers', 979, '🎣'),
(981, 'Bassins, Cages & Étangs Aquaculture', 979, '🐟'),
(982, 'Aliments Poissons d\'Élevage', 979, '🐠'),
(983, 'Équipements Pêche Artisanale', 979, '⛵'),

-- Transformation Agricole
(984, 'Transformation & Agro-industrie', 950, '⚙️'),
(985, 'Décortiqueuses & Égreneuses', 984, '⚙️'),
(986, 'Moulins, Broyeurs & Concasseurs', 984, '⚙️'),
(987, 'Presses à Huile de Palme & Arachide', 984, '🫙'),
(988, 'Séchoirs & Fumoirs', 984, '🔥'),
(989, 'Emballages & Conditionnement Agricole', 984, '📦');

-- ══════════════════════════════════════════════════════════════════
-- C.  TENUES TRADITIONNELLES & CÉRÉMONIALES  (root 990, IDs 990–1029)
-- ══════════════════════════════════════════════════════════════════
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(990, 'Tenues Traditionnelles & Cérémoniales', NULL, '👘'),

-- Pagnes & Tissus
(991, 'Pagnes & Tissus Africains', 990, '🪡'),
(992, 'Pagne Wax Authentique (Hollandais)', 991, '🪡'),
(993, 'Pagne Super Wax & Premium', 991, '✨'),
(994, 'Pagne Imprimé & Fancy', 991, '🎨'),
(995, 'Bazin Riche & Getzner', 991, '💎'),
(996, 'Kente & Tissus Tissés Main', 991, '🧵'),
(997, 'Faso Dan Fani & Pagne Local', 991, '🌍'),
(998, 'Dentelle & Broderie Africaine', 991, '🪡'),

-- Tenues Hommes
(999, 'Tenues Traditionnelles Hommes', 990, '👔'),
(1000, 'Agbada & Grand Boubou', 999, '👘'),
(1001, 'Dashiki & Chemises Africaines', 999, '👕'),
(1002, 'Ensemble Bazin Homme', 999, '👔'),
(1003, 'Pantalon & Short Traditionnel', 999, '👖'),
(1004, 'Coiffes & Chapeaux Traditionnels H', 999, '🎩'),

-- Tenues Femmes
(1005, 'Tenues Traditionnelles Femmes', 990, '👗'),
(1006, 'Kaba & Robe Pagne', 1005, '👗'),
(1007, 'Ensemble 2 ou 3 Pièces Pagne', 1005, '👗'),
(1008, 'Tenue de Mariage & Cérémonie', 1005, '👰'),
(1009, 'Gele & Foulard Tête Africain', 1005, '🎀'),
(1010, 'Bijoux Traditionnels (Yoruba, Fon, Bariba)', 1005, '📿'),

-- Tenues Enfants
(1011, 'Tenues Traditionnelles Enfants', 990, '👶'),
(1012, 'Ensemble Pagne Garçon', 1011, '👕'),
(1013, 'Robe & Ensemble Pagne Fille', 1011, '👗'),
(1014, 'Tenue Baptême & Communion', 1011, '🕊️'),

-- Vêtements Religieux & Cultuels
(1015, 'Vêtements Religieux & Cultuels', 990, '🙏'),
(1016, 'Tenues Église & Gospel', 1015, '⛪'),
(1017, 'Tenues Mosquée & Djellaba', 1015, '🕌'),
(1018, 'Tenues Vodoun & Cultuelles', 1015, '🌍'),
(1019, 'Tenues Initiation & Couvents', 1015, '🌿'),

-- Couture Africaine
(1020, 'Couture & Confection Africaine', 990, '✂️'),
(1021, 'Machines à Coudre Africaines', 1020, '🧵'),
(1022, 'Fils & Accessoires Couture Africaine', 1020, '🪡'),
(1023, 'Modèles & Patrons Traditionnels', 1020, '📐');

-- ══════════════════════════════════════════════════════════════════
-- D.  RESTAURATION & TRAITEUR  (root 1024, IDs 1024–1059)
-- ══════════════════════════════════════════════════════════════════
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1024, 'Restauration & Traiteur', NULL, '🍽️'),

-- Cuisine Professionnelle
(1025, 'Matériel Cuisine Professionnelle', 1024, '👨‍🍳'),
(1026, 'Fours & Cuisinières Professionnels', 1025, '🔥'),
(1027, 'Friteuses, Grills & Plancha Pro', 1025, '🍳'),
(1028, 'Réfrigérateurs & Congélateurs Pro', 1025, '❄️'),
(1029, 'Mixeurs, Robots & Hachoirs Pro', 1025, '⚙️'),
(1030, 'Tables Inox & Plans de Travail', 1025, '🍽️'),
(1031, 'Hottes & Ventilation Cuisine Pro', 1025, '💨'),

-- Ustensiles & Vaisselle Pro
(1032, 'Ustensiles & Vaisselle Professionnels', 1024, '🍽️'),
(1033, 'Marmites, Casseroles Inox Grande Taille', 1032, '🫕'),
(1034, 'Assiettes, Bols & Couverts Restaurant', 1032, '🍽️'),
(1035, 'Verres, Carafes & Service Bar', 1032, '🥂'),
(1036, 'Plateaux & Chariots Service', 1032, '🛒'),

-- Emballages Alimentaires
(1037, 'Emballages & Conditionnement Alimentaire', 1024, '📦'),
(1038, 'Barquettes & Boîtes Alimentaires', 1037, '📦'),
(1039, 'Sachets, Sacs & Films Alimentaires', 1037, '🛍️'),
(1040, 'Gobelets & Couvercles', 1037, '☕'),
(1041, 'Papier Cuisson & Aluminium', 1037, '🥡'),
(1042, 'Étiquettes & Stickers Alimentaires', 1037, '🏷️'),

-- Équipements Bar & Boissons
(1043, 'Équipements Bar & Boissons', 1024, '🍹'),
(1044, 'Machines à Jus & Extracteurs', 1043, '🍊'),
(1045, 'Machines à Café Professionnelles', 1043, '☕'),
(1046, 'Glacières, Vitrines & Distributeurs', 1043, '❄️'),
(1047, 'Blenders & Shakers Bar', 1043, '🥤'),

-- Mobilier Restaurant
(1048, 'Mobilier & Aménagement Restaurant', 1024, '🪑'),
(1049, 'Tables & Chaises Restaurant', 1048, '🪑'),
(1050, 'Comptoirs & Buffets', 1048, '🍽️'),
(1051, 'Menus & Porte-menus', 1048, '📋');

-- ══════════════════════════════════════════════════════════════════
-- E.  MATÉRIEL MÉDICAL & PARAMÉDICAL  (root 1052, IDs 1052–1089)
-- ══════════════════════════════════════════════════════════════════
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1052, 'Matériel Médical & Paramédical', NULL, '🏥'),

-- Appareils Diagnostic
(1053, 'Appareils de Diagnostic', 1052, '🩺'),
(1054, 'Tensiomètres (bras & poignet)', 1053, '🩺'),
(1055, 'Glucomètres & Bandelettes', 1053, '💉'),
(1056, 'Thermomètres Médicaux', 1053, '🌡️'),
(1057, 'Stéthoscopes', 1053, '🩺'),
(1058, 'Oxymètres de Pouls', 1053, '❤️'),
(1059, 'Balances Médicales', 1053, '⚖️'),

-- Mobilité & Rééducation
(1060, 'Mobilité, Handicap & Rééducation', 1052, '♿'),
(1061, 'Fauteuils Roulants', 1060, '♿'),
(1062, 'Béquilles, Cannes & Déambulateurs', 1060, '🦯'),
(1063, 'Lits Médicalisés & Accessoires', 1060, '🛏️'),
(1064, 'Orthèses & Prothèses', 1060, '🦾'),
(1065, 'Ceintures Lombaires & Cervicales', 1060, '💪'),

-- Soins & Urgences
(1066, 'Soins & Urgences', 1052, '🩹'),
(1067, 'Trousses & Kits de Secours', 1066, '🩹'),
(1068, 'Compresses, Pansements & Bandages', 1066, '🩹'),
(1069, 'Gants Médicaux, Masques & Blouses', 1066, '🧤'),
(1070, 'Seringues & Matériel Injection (pro)', 1066, '💉'),
(1071, 'Défibrillateurs & Matériel Urgences', 1066, '❤️'),

-- Optique Médicale
(1072, 'Optique & Vision', 1052, '👁️'),
(1073, 'Lunettes de Vue & Montures', 1072, '👓'),
(1074, 'Lentilles de Contact', 1072, '👁️'),
(1075, 'Étuis & Liquides Entretien Optique', 1072, '🧴'),

-- Maternité & Bébé Médical
(1076, 'Maternité & Soins Nouveau-né', 1052, '🤱'),
(1077, 'Tire-lait Électrique & Manuel', 1076, '🤱'),
(1078, 'Moniteurs Cardiaques Bébé', 1076, '❤️'),
(1079, 'Stérilisateurs & Chauffe-biberons', 1076, '🍼');

-- ══════════════════════════════════════════════════════════════════
-- F.  FORMATION & ÉDUCATION  (root 1080, IDs 1080–1109)
-- ══════════════════════════════════════════════════════════════════
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1080, 'Formation & Éducation', NULL, '🎓'),

-- Formations Pro
(1081, 'Formations Professionnelles', 1080, '💼'),
(1082, 'Informatique & Développement Web', 1081, '💻'),
(1083, 'Marketing Digital & Réseaux Sociaux', 1081, '📱'),
(1084, 'Comptabilité, Finance & Gestion', 1081, '💰'),
(1085, 'Langues Étrangères (Anglais, Français...)', 1081, '🌍'),
(1086, 'Métiers Manuels, Couture & Artisanat', 1081, '✂️'),
(1087, 'Cuisine & Pâtisserie Professionnelle', 1081, '👨‍🍳'),
(1088, 'Conduite & Transport', 1081, '🚗'),

-- Soutien Scolaire
(1089, 'Soutien Scolaire & Cours Particuliers', 1080, '📚'),
(1090, 'Cours Primaire (CP, CE, CM)', 1089, '📖'),
(1091, 'Cours Collège (6ème → 3ème / BEPC)', 1089, '📖'),
(1092, 'Cours Lycée & Préparation BAC', 1089, '🎓'),
(1093, 'Prépa Concours (BTS, Licence, INFAS...)', 1089, '🏆'),

-- Manuels Scolaires Bénin
(1094, 'Manuels & Livres Scolaires Bénin', 1080, '📗'),
(1095, 'Manuels Primaire INFRE/MEN Bénin', 1094, '📗'),
(1096, 'Manuels Collège & Lycée Bénin', 1094, '📘'),
(1097, 'Annales & Guides Révision BAC/BEPC', 1094, '📙'),
(1098, 'Livres Parascolaires & Méthodes', 1094, '📚'),

-- Matériel Pédagogique
(1099, 'Matériel & Fournitures Pédagogiques', 1080, '📐'),
(1100, 'Tableaux Pédagogiques & Feutres', 1099, '📋'),
(1101, 'Cartes Géographiques & Planisphères', 1099, '🗺️'),
(1102, 'Globes Terrestres', 1099, '🌍'),
(1103, 'Matériel Scientifique (microscopes...)', 1099, '🔬');

-- ══════════════════════════════════════════════════════════════════
-- G.  TRANSPORT LOCAL & ZEMIDJAN  (root 1104, IDs 1104–1129)
-- ══════════════════════════════════════════════════════════════════
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1104, 'Transport Local & Zemidjan', NULL, '🏍️'),

-- Pièces & Accessoires Zemidjan
(1105, 'Pièces & Accessoires Zemidjan', 1104, '🔧'),
(1106, 'Moteurs, Pistons & Transmission', 1105, '⚙️'),
(1107, 'Freins, Roues & Pneumatiques Moto', 1105, '🛞'),
(1108, 'Carrosserie, Réservoir & Phares', 1105, '🏍️'),
(1109, 'Filtres, Huiles & Entretien Moto', 1105, '🛢️'),
(1110, 'Casques Zemidjan & Sécurité', 1105, '⛑️'),
(1111, 'Gilets Réfléchissants & Tenues Zem', 1105, '🦺'),

-- Tricycles & Cargo
(1112, 'Tricycles & Transport de Marchandises', 1104, '🛺'),
(1113, 'Tricycles Motorisés', 1112, '🛺'),
(1114, 'Pièces & Réparation Tricycle', 1112, '🔧'),
(1115, 'Bâches, Caisses & Accessoires Cargo', 1112, '📦'),

-- Signalisation & Sécurité Routière
(1116, 'Signalisation & Sécurité Routière', 1104, '⚠️'),
(1117, 'Triangles, Gilets & Extincteurs Voiture', 1116, '🔺'),
(1118, 'Panneaux, Cônes & Balises', 1116, '🚧'),
(1119, 'GPS & Navigation', 1116, '📍'),

-- Entretien & Réparation Moto
(1120, 'Entretien & Atelier Moto', 1104, '🔧'),
(1121, 'Outils & Clés Moto', 1120, '🔧'),
(1122, 'Compresseurs & Gonfleurs', 1120, '💨'),
(1123, 'Lubrifiants & Produits Entretien', 1120, '🛢️');

-- ══════════════════════════════════════════════════════════════════
-- H.  COMPLÉMENTS MODE (ajouts à Mode & Vêtements, parent 112)
-- ══════════════════════════════════════════════════════════════════
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES

-- Lingerie & Sous-vêtements
(1124, 'Lingerie & Sous-vêtements Femme', 112, '👙'),
(1125, 'Soutiens-gorge', 1124, '👙'),
(1126, 'Culottes, Strings & Shorties', 1124, '👙'),
(1127, 'Combinaisons & Nuisettes', 1124, '🌙'),
(1128, 'Body & Corsets', 1124, '💃'),

(1129, 'Lingerie & Sous-vêtements Homme', 112, '🩲'),
(1130, 'Boxers & Caleçons', 1129, '🩲'),
(1131, 'Slips & Tangas Homme', 1129, '🩲'),
(1132, 'Maillots de Corps & Débardeurs', 1129, '👕'),

-- Pyjamas & Intérieur
(1133, 'Pyjamas & Vêtements d\'Intérieur', 112, '🌙'),
(1134, 'Pyjamas Femme', 1133, '🌙'),
(1135, 'Pyjamas Homme', 1133, '🌙'),
(1136, 'Pyjamas Enfants', 1133, '🧒'),
(1137, 'Robes de Chambre & Kimonos', 1133, '🛁'),
(1138, 'Chaussons & Pantoufles', 1133, '🥿'),

-- Vêtements Pro & Uniformes
(1139, 'Vêtements de Travail & Uniformes', 112, '🦺'),
(1140, 'Blouses Médicales & Tabliers', 1139, '🏥'),
(1141, 'Combinaisons & Salopettes de Travail', 1139, '🔧'),
(1142, 'EPI (Équipements Protection Individuelle)', 1139, '🦺'),
(1143, 'Uniformes Scolaires & Tenues Sport', 1139, '🎒'),
(1144, 'Vestes & Polos d\'Entreprise', 1139, '👔'),

-- Vêtements de Mariage & Cérémonie
(1145, 'Vêtements de Mariage & Cérémonie', 112, '💒'),
(1146, 'Robes de Mariée', 1145, '👰'),
(1147, 'Costumes & Smokings Mariage', 1145, '🤵'),
(1148, 'Tenues Demoiselles & Garçons d\'Honneur', 1145, '💍'),
(1149, 'Accessoires Mariage (voile, gants...)', 1145, '💐'),

-- Casquettes & Chapeaux
(1150, 'Casquettes, Bonnets & Chapeaux', 112, '🧢'),
(1151, 'Casquettes & Snapbacks', 1150, '🧢'),
(1152, 'Bonnets & Cagoules', 1150, '🧤'),
(1153, 'Chapeaux Femme & Accessoires Tête', 1150, '👒'),

-- Lunettes Mode
(1154, 'Lunettes de Soleil Mode', 112, '🕶️'),
(1155, 'Lunettes Femme', 1154, '🕶️'),
(1156, 'Lunettes Homme', 1154, '🕶️'),
(1157, 'Lunettes Enfant', 1154, '🕶️');

-- ══════════════════════════════════════════════════════════════════
-- I.  BEAUTÉ SPÉCIFIQUE PEAU NOIRE & AFRICAINE (ajouts à parent 350)
-- ══════════════════════════════════════════════════════════════════
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1158, 'Soins Spécifiques Peau Noire & Africaine', 350, '🌍'),
(1159, 'Crèmes Éclat & Unification du Teint', 1158, '✨'),
(1160, 'Huile de Karité & Beurres Africains', 1158, '🌿'),
(1161, 'Huile de Coco, Argan & Baobab', 1158, '🥥'),
(1162, 'Savons Naturels Africains (Alata, Noir)', 1158, '🫧'),
(1163, 'Soins Anti-acné Peau Noire', 1158, '✨'),
(1164, 'Soins Cheveux Tressés, Locks & Afro', 1158, '💇'),
(1165, 'Extensions Cheveux Naturelles & Synthétiques', 1158, '💇'),
(1166, 'Perruques Lace Front & Full Lace', 1158, '💇'),
(1167, 'Produits pour Tresses & Nattes', 1158, '🪡');

-- ══════════════════════════════════════════════════════════════════
-- J.  ALIMENTATION FRAÎCHE (ajouts à parent 450)
-- ══════════════════════════════════════════════════════════════════
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1168, 'Viandes & Volailles', 450, '🥩'),
(1169, 'Bœuf & Veau', 1168, '🐄'),
(1170, 'Mouton & Chèvre', 1168, '🐑'),
(1171, 'Poulet, Pintade & Canard', 1168, '🍗'),
(1172, 'Porc & Abats', 1168, '🥓'),

(1173, 'Poissons & Fruits de Mer Frais', 450, '🐟'),
(1174, 'Poissons Frais (braisés ou crus)', 1173, '🐠'),
(1175, 'Poissons Fumés & Séchés', 1173, '🐟'),
(1176, 'Crevettes & Crustacés', 1173, '🦐'),

(1177, 'Fruits & Légumes Frais', 450, '🥦'),
(1178, 'Légumes Feuilles (gboma, molokhia, épinard)', 1177, '🥬'),
(1179, 'Fruits Tropicaux (mangue, ananas, papaye)', 1177, '🥭'),
(1180, 'Tubercules Frais (igname, manioc, patate)', 1177, '🥔'),
(1181, 'Tomates, Poivrons & Piments Frais', 1177, '🍅'),
(1182, 'Oignons, Ail & Aromates', 1177, '🧅'),

(1183, 'Condiments Locaux Préparés', 450, '🫙'),
(1184, 'Soumbala & Dawadawa', 1183, '🌿'),
(1185, 'Pâte d\'Arachide & Goussi', 1183, '🥜'),
(1186, 'Huile de Palme Raffinée & Brute', 1183, '🫙'),

(1187, 'Boulangerie & Pâtisserie Artisanale', 450, '🥐'),
(1188, 'Pain Artisanal & Baguettes', 1187, '🍞'),
(1189, 'Gâteaux & Pâtisseries', 1187, '🎂'),
(1190, 'Beignets & Pâtisseries Africaines', 1187, '🍩');

-- ══════════════════════════════════════════════════════════════════
-- K.  SPORTS POPULAIRES AU BÉNIN (ajouts à parent 400)
-- ══════════════════════════════════════════════════════════════════
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1191, 'Volleyball', 400, '🏐'),
(1192, 'Ballons de Volleyball', 1191, '🏐'),
(1193, 'Filets & Poteaux Volleyball', 1191, '🏐'),
(1194, 'Chaussures & Équipements Volleyball', 1191, '👟'),

(1195, 'Handball', 400, '🤾'),
(1196, 'Ballons de Handball', 1195, '🤾'),
(1197, 'Équipements & Protections Handball', 1195, '🤾'),

(1198, 'Athlétisme & Course à Pied', 400, '🏃'),
(1199, 'Chaussures de Course & Trail', 1198, '👟'),
(1200, 'Chronomètres & Équipements Athlétisme', 1198, '⏱️'),
(1201, 'Tenues Running & Compression', 1198, '👕'),

(1202, 'Sports Scolaires & Jeux EPS', 400, '🎒'),
(1203, 'Ballons & Équipements Multi-sports', 1202, '⚽'),
(1204, 'Jeux Sportifs Collectifs', 1202, '🎯'),

(1205, 'Billard, Fléchettes & Jeux Adultes', 400, '🎱'),
(1206, 'Tables de Billard', 1205, '🎱'),
(1207, 'Tables de Ping-Pong & Accessoires', 1205, '🏓'),
(1208, 'Baby-foot', 1205, '⚽');

-- ══════════════════════════════════════════════════════════════════
-- L.  MAISON TROPICALE (ajouts à parent 300)
-- ══════════════════════════════════════════════════════════════════
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(1209, 'Moustiquaires & Anti-moustiques', 300, '🦟'),
(1210, 'Moustiquaires de Lit (imprégnées)', 1209, '🛏️'),
(1211, 'Moustiquaires Portes & Fenêtres', 1209, '🪟'),
(1212, 'Répulsifs, Diffuseurs & Spirales', 1209, '💨'),
(1213, 'Climatiseurs Portables & Split', 1209, '❄️'),

(1214, 'Eau & Purification Domestique', 300, '💧'),
(1215, 'Filtres & Purificateurs d\'Eau', 1214, '💧'),
(1216, 'Robinets Filtreurs', 1214, '🚰'),
(1217, 'Réservoirs & Stockage Eau', 1214, '🪣'),

(1218, 'Éclairage & Confort Nocturne', 300, '🕯️'),
(1219, 'Lampes Solaires Rechargeables', 1218, '☀️'),
(1220, 'Lanternes & Lampes de Camping Maison', 1218, '🔦'),
(1221, 'Ventilateurs de Plafond & sur Pied', 1218, '🌬️');

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- TOTAL V3 : ~322 nouvelles catégories (IDs 900–1221)
-- ============================================================
