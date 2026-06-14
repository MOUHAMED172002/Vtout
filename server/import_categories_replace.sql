-- Replace ALL categories with the new clean structure
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE categories;
SET FOREIGN_KEY_CHECKS = 1;

-- ── L1 Root Categories ────────────────────────────────────────────────────────
INSERT INTO categories (id, name, parent_id, display_order, created_at, updated_at) VALUES
(1,  'Téléphones & Accessoires',    NULL, 1,  NOW(), NOW()),
(2,  'Électronique & High-Tech',    NULL, 2,  NOW(), NOW()),
(3,  'Mode',                        NULL, 3,  NOW(), NOW()),
(4,  'Beauté & Cosmétique',         NULL, 4,  NOW(), NOW()),
(5,  'Maison & Cuisine',            NULL, 5,  NOW(), NOW()),
(6,  'Électroménager',              NULL, 6,  NOW(), NOW()),
(7,  'Supermarché & Alimentation',  NULL, 7,  NOW(), NOW()),
(8,  'Produits Locaux',             NULL, 8,  NOW(), NOW()),
(9,  'Auto & Moto',                 NULL, 9,  NOW(), NOW()),
(10, 'Sport & Loisirs',             NULL, 10, NOW(), NOW()),
(11, 'Bébé & Enfants',              NULL, 11, NOW(), NOW()),
(12, 'Meubles & Décoration',        NULL, 12, NOW(), NOW());

-- ── L2 Subcategories ─────────────────────────────────────────────────────────

-- Téléphones & Accessoires (1)
INSERT INTO categories (name, parent_id, display_order, created_at, updated_at) VALUES
('Smartphones',          1, 1, NOW(), NOW()),
('Téléphones classiques',1, 2, NOW(), NOW()),
('Tablettes',            1, 3, NOW(), NOW()),
('Coques & Étuis',       1, 4, NOW(), NOW()),
('Chargeurs',            1, 5, NOW(), NOW()),
('Écouteurs & Casques',  1, 6, NOW(), NOW()),
('Power Banks',          1, 7, NOW(), NOW()),
('Câbles & Adaptateurs', 1, 8, NOW(), NOW()),
('Montres connectées',   1, 9, NOW(), NOW());

-- Électronique & High-Tech (2)
INSERT INTO categories (name, parent_id, display_order, created_at, updated_at) VALUES
('Ordinateurs portables',       2, 1, NOW(), NOW()),
('Ordinateurs de bureau',       2, 2, NOW(), NOW()),
('Imprimantes',                 2, 3, NOW(), NOW()),
('Routeurs & Réseau',           2, 4, NOW(), NOW()),
('Stockage (SSD, HDD, Clés USB)', 2, 5, NOW(), NOW()),
('Composants PC',               2, 6, NOW(), NOW()),
('Accessoires informatiques',   2, 7, NOW(), NOW()),
('Gaming',                      2, 8, NOW(), NOW());

-- Mode (3)
INSERT INTO categories (name, parent_id, display_order, created_at, updated_at) VALUES
('Vêtements Homme',      3, 1, NOW(), NOW()),
('Vêtements Femme',      3, 2, NOW(), NOW()),
('Vêtements Enfant',     3, 3, NOW(), NOW()),
('Chaussures Homme',     3, 4, NOW(), NOW()),
('Chaussures Femme',     3, 5, NOW(), NOW()),
('Sacs & Maroquinerie',  3, 6, NOW(), NOW()),
('Montres',              3, 7, NOW(), NOW()),
('Lunettes',             3, 8, NOW(), NOW()),
('Accessoires de mode',  3, 9, NOW(), NOW());

-- Beauté & Cosmétique (4)
INSERT INTO categories (name, parent_id, display_order, created_at, updated_at) VALUES
('Maquillage',              4, 1, NOW(), NOW()),
('Soins du visage',         4, 2, NOW(), NOW()),
('Soins du corps',          4, 3, NOW(), NOW()),
('Parfums',                 4, 4, NOW(), NOW()),
('Produits capillaires',    4, 5, NOW(), NOW()),
('Perruques & Extensions',  4, 6, NOW(), NOW()),
('Produits pour hommes',    4, 7, NOW(), NOW()),
('Accessoires beauté',      4, 8, NOW(), NOW());

-- Maison & Cuisine (5)
INSERT INTO categories (name, parent_id, display_order, created_at, updated_at) VALUES
('Ustensiles de cuisine',   5, 1, NOW(), NOW()),
('Vaisselle',               5, 2, NOW(), NOW()),
('Rangement',               5, 3, NOW(), NOW()),
('Décoration intérieure',   5, 4, NOW(), NOW()),
('Linge de maison',         5, 5, NOW(), NOW()),
('Éclairage',               5, 6, NOW(), NOW()),
('Articles ménagers',       5, 7, NOW(), NOW());

-- Électroménager (6)
INSERT INTO categories (name, parent_id, display_order, created_at, updated_at) VALUES
('Réfrigérateurs',      6, 1, NOW(), NOW()),
('Congélateurs',        6, 2, NOW(), NOW()),
('Cuisinières',         6, 3, NOW(), NOW()),
('Fours & Micro-ondes', 6, 4, NOW(), NOW()),
('Mixeurs & Blenders',  6, 5, NOW(), NOW()),
('Ventilateurs',        6, 6, NOW(), NOW()),
('Climatiseurs',        6, 7, NOW(), NOW()),
('Machines à laver',    6, 8, NOW(), NOW());

-- Supermarché & Alimentation (7)
INSERT INTO categories (name, parent_id, display_order, created_at, updated_at) VALUES
('Épicerie',            7, 1, NOW(), NOW()),
('Boissons',            7, 2, NOW(), NOW()),
('Conserves',           7, 3, NOW(), NOW()),
('Produits frais',      7, 4, NOW(), NOW()),
('Produits surgelés',   7, 5, NOW(), NOW()),
('Produits bio',        7, 6, NOW(), NOW()),
('Snacks & Confiseries',7, 7, NOW(), NOW());

-- Produits Locaux (8)
INSERT INTO categories (name, parent_id, display_order, created_at, updated_at) VALUES
('Produits agricoles',        8, 1, NOW(), NOW()),
('Épices',                    8, 2, NOW(), NOW()),
('Miel',                      8, 3, NOW(), NOW()),
('Artisanat',                 8, 4, NOW(), NOW()),
('Produits transformés locaux', 8, 5, NOW(), NOW()),
('Vêtements traditionnels',   8, 6, NOW(), NOW()),
('Objets d''art',             8, 7, NOW(), NOW());

-- Auto & Moto (9)
INSERT INTO categories (name, parent_id, display_order, created_at, updated_at) VALUES
('Pièces auto',             9, 1, NOW(), NOW()),
('Pièces moto',             9, 2, NOW(), NOW()),
('Pneus',                   9, 3, NOW(), NOW()),
('Huiles & Lubrifiants',    9, 4, NOW(), NOW()),
('Accessoires auto',        9, 5, NOW(), NOW()),
('Accessoires moto',        9, 6, NOW(), NOW()),
('Équipements de sécurité', 9, 7, NOW(), NOW());

-- Sport & Loisirs (10)
INSERT INTO categories (name, parent_id, display_order, created_at, updated_at) VALUES
('Équipements de sport', 10, 1, NOW(), NOW()),
('Fitness & Musculation',10, 2, NOW(), NOW()),
('Football',             10, 3, NOW(), NOW()),
('Cyclisme',             10, 4, NOW(), NOW()),
('Camping & Plein air',  10, 5, NOW(), NOW()),
('Jeux de société',      10, 6, NOW(), NOW()),
('Jouets',               10, 7, NOW(), NOW());

-- Bébé & Enfants (11)
INSERT INTO categories (name, parent_id, display_order, created_at, updated_at) VALUES
('Vêtements bébé',      11, 1, NOW(), NOW()),
('Couches',             11, 2, NOW(), NOW()),
('Alimentation bébé',   11, 3, NOW(), NOW()),
('Jouets',              11, 4, NOW(), NOW()),
('Poussettes',          11, 5, NOW(), NOW()),
('Accessoires bébé',    11, 6, NOW(), NOW()),
('Fournitures scolaires',11, 7, NOW(), NOW());

-- Meubles & Décoration (12)
INSERT INTO categories (name, parent_id, display_order, created_at, updated_at) VALUES
('Salons',             12, 1, NOW(), NOW()),
('Chambres',           12, 2, NOW(), NOW()),
('Bureaux',            12, 3, NOW(), NOW()),
('Tables & Chaises',   12, 4, NOW(), NOW()),
('Armoires',           12, 5, NOW(), NOW()),
('Décoration murale',  12, 6, NOW(), NOW()),
('Rideaux',            12, 7, NOW(), NOW()),
('Tapis',              12, 8, NOW(), NOW())
