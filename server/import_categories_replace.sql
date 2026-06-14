-- Replace ALL categories with the new clean structure
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE categories;
SET FOREIGN_KEY_CHECKS = 1;

-- ── L1 Root Categories ────────────────────────────────────────────────────────
INSERT INTO categories (id, name, icon, parent_id, display_order) VALUES
(1,  'Téléphones & Accessoires',    '📱', NULL, 1),
(2,  'Électronique & High-Tech',    '💻', NULL, 2),
(3,  'Mode',                        '👗', NULL, 3),
(4,  'Beauté & Cosmétique',         '💄', NULL, 4),
(5,  'Maison & Cuisine',            '🏠', NULL, 5),
(6,  'Électroménager',              '🧺', NULL, 6),
(7,  'Supermarché & Alimentation',  '🛒', NULL, 7),
(8,  'Produits Locaux',             '🌿', NULL, 8),
(9,  'Auto & Moto',                 '🚗', NULL, 9),
(10, 'Sport & Loisirs',             '⚽', NULL, 10),
(11, 'Bébé & Enfants',              '👶', NULL, 11),
(12, 'Meubles & Décoration',        '🛋️', NULL, 12);

-- ── L2 Subcategories ─────────────────────────────────────────────────────────

-- Téléphones & Accessoires (1)
INSERT INTO categories (name, icon, parent_id, display_order) VALUES
('Smartphones',          '📱', 1, 1),
('Téléphones classiques','☎️', 1, 2),
('Tablettes',            '📟', 1, 3),
('Coques & Étuis',       '🛡️', 1, 4),
('Chargeurs',            '🔋', 1, 5),
('Écouteurs & Casques',  '🎧', 1, 6),
('Power Banks',          '⚡', 1, 7),
('Câbles & Adaptateurs', '🔌', 1, 8),
('Montres connectées',   '⌚', 1, 9);

-- Électronique & High-Tech (2)
INSERT INTO categories (name, icon, parent_id, display_order) VALUES
('Ordinateurs portables',         '💻', 2, 1),
('Ordinateurs de bureau',         '🖥️', 2, 2),
('Imprimantes',                   '🖨️', 2, 3),
('Routeurs & Réseau',             '📡', 2, 4),
('Stockage (SSD, HDD, Clés USB)', '💾', 2, 5),
('Composants PC',                 '⚙️', 2, 6),
('Accessoires informatiques',     '🖱️', 2, 7),
('Gaming',                        '🎮', 2, 8);

-- Mode (3)
INSERT INTO categories (name, icon, parent_id, display_order) VALUES
('Vêtements Homme',     '👔', 3, 1),
('Vêtements Femme',     '👗', 3, 2),
('Vêtements Enfant',    '👕', 3, 3),
('Chaussures Homme',    '👞', 3, 4),
('Chaussures Femme',    '👠', 3, 5),
('Sacs & Maroquinerie', '👜', 3, 6),
('Montres',             '⌚', 3, 7),
('Lunettes',            '👓', 3, 8),
('Accessoires de mode', '💍', 3, 9);

-- Beauté & Cosmétique (4)
INSERT INTO categories (name, icon, parent_id, display_order) VALUES
('Maquillage',             '💋', 4, 1),
('Soins du visage',        '🧴', 4, 2),
('Soins du corps',         '🧼', 4, 3),
('Parfums',                '🌸', 4, 4),
('Produits capillaires',   '💇', 4, 5),
('Perruques & Extensions', '💆', 4, 6),
('Produits pour hommes',   '🪒', 4, 7),
('Accessoires beauté',     '🪞', 4, 8);

-- Maison & Cuisine (5)
INSERT INTO categories (name, icon, parent_id, display_order) VALUES
('Ustensiles de cuisine', '🍳', 5, 1),
('Vaisselle',             '🍽️', 5, 2),
('Rangement',             '📦', 5, 3),
('Décoration intérieure', '🖼️', 5, 4),
('Linge de maison',       '🛏️', 5, 5),
('Éclairage',             '💡', 5, 6),
('Articles ménagers',     '🧹', 5, 7);

-- Électroménager (6)
INSERT INTO categories (name, icon, parent_id, display_order) VALUES
('Réfrigérateurs',      '🧊', 6, 1),
('Congélateurs',        '❄️', 6, 2),
('Cuisinières',         '🔥', 6, 3),
('Fours & Micro-ondes', '🫙', 6, 4),
('Mixeurs & Blenders',  '🥤', 6, 5),
('Ventilateurs',        '💨', 6, 6),
('Climatiseurs',        '🌬️', 6, 7),
('Machines à laver',    '🌀', 6, 8);

-- Supermarché & Alimentation (7)
INSERT INTO categories (name, icon, parent_id, display_order) VALUES
('Épicerie',             '🛒', 7, 1),
('Boissons',             '🥤', 7, 2),
('Conserves',            '🥫', 7, 3),
('Produits frais',       '🥦', 7, 4),
('Produits surgelés',    '🧊', 7, 5),
('Produits bio',         '🌱', 7, 6),
('Snacks & Confiseries', '🍫', 7, 7);

-- Produits Locaux (8)
INSERT INTO categories (name, icon, parent_id, display_order) VALUES
('Produits agricoles',          '🌾', 8, 1),
('Épices',                      '🌶️', 8, 2),
('Miel',                        '🍯', 8, 3),
('Artisanat',                   '🏺', 8, 4),
('Produits transformés locaux', '🫙', 8, 5),
('Vêtements traditionnels',     '👘', 8, 6),
('Objets d''art',               '🎨', 8, 7);

-- Auto & Moto (9)
INSERT INTO categories (name, icon, parent_id, display_order) VALUES
('Pièces auto',              '🔧', 9, 1),
('Pièces moto',              '🏍️', 9, 2),
('Pneus',                    '🛞', 9, 3),
('Huiles & Lubrifiants',     '🛢️', 9, 4),
('Accessoires auto',         '🚗', 9, 5),
('Accessoires moto',         '🏍️', 9, 6),
('Équipements de sécurité',  '🦺', 9, 7);

-- Sport & Loisirs (10)
INSERT INTO categories (name, icon, parent_id, display_order) VALUES
('Équipements de sport',  '🏋️', 10, 1),
('Fitness & Musculation', '💪', 10, 2),
('Football',              '⚽', 10, 3),
('Cyclisme',              '🚴', 10, 4),
('Camping & Plein air',   '🏕️', 10, 5),
('Jeux de société',       '🎲', 10, 6),
('Jouets',                '🪀', 10, 7);

-- Bébé & Enfants (11)
INSERT INTO categories (name, icon, parent_id, display_order) VALUES
('Vêtements bébé',        '👶', 11, 1),
('Couches',               '🍼', 11, 2),
('Alimentation bébé',     '🥛', 11, 3),
('Jouets',                '🧸', 11, 4),
('Poussettes',            '🛒', 11, 5),
('Accessoires bébé',      '🎀', 11, 6),
('Fournitures scolaires', '📚', 11, 7);

-- Meubles & Décoration (12)
INSERT INTO categories (name, icon, parent_id, display_order) VALUES
('Salons',            '🛋️', 12, 1),
('Chambres',          '🛏️', 12, 2),
('Bureaux',           '🖥️', 12, 3),
('Tables & Chaises',  '🪑', 12, 4),
('Armoires',          '🗄️', 12, 5),
('Décoration murale', '🖼️', 12, 6),
('Rideaux',           '🪟', 12, 7),
('Tapis',             '🪵', 12, 8)
