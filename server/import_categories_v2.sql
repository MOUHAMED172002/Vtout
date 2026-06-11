-- ============================================================================
-- 📦 NOUVELLES CATÉGORIES — Extension V2
-- Couvre : Maison, Beauté, Sport, Alimentation, Jouets, Auto, Livres,
--          Art & Artisanat, Animalerie, Bébé, Musique, Bureau,
--          Énergie, Sécurité, Voyage, Services
-- IDs démarrent à 300 pour éviter les conflits avec l'import V1
-- ============================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ══════════════════════════════════════════════════════════════════
-- 5️⃣  MAISON & DÉCORATION  (root 300, sous-catégories 301–349)
-- ══════════════════════════════════════════════════════════════════
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(300, 'Maison & Décoration', NULL, '🏡'),

-- Meubles
(301, 'Meubles', 300, '🛋️'),
(302, 'Canapés & Sofas', 301, '🛋️'),
(303, 'Tables & Bureaux', 301, '🪑'),
(304, 'Chaises & Fauteuils', 301, '🪑'),
(305, 'Armoires & Rangements', 301, '🗄️'),
(306, 'Lits & Cadres de Lit', 301, '🛏️'),
(307, 'Commodes & Chevets', 301, '🛏️'),

-- Literie & Textiles
(308, 'Literie & Textiles', 300, '🛏️'),
(309, 'Draps & Housses de Couette', 308, '🛏️'),
(310, 'Couvertures & Coussins', 308, '🛏️'),
(311, 'Rideaux & Voilages', 308, '🪟'),
(312, 'Tapis & Carpettes', 308, '🟫'),

-- Cuisine & Arts de la Table
(313, 'Cuisine & Arts de la Table', 300, '🍳'),
(314, 'Vaisselle & Couverts', 313, '🍽️'),
(315, 'Casseroles & Poêles', 313, '🍳'),
(316, 'Électroménager Cuisine', 313, '🔌'),
(317, 'Accessoires Cuisine', 313, '🥄'),
(318, 'Stockage & Conservation', 313, '🫙'),
(319, 'Cafetières & Théières', 313, '☕'),

-- Décoration Intérieure
(320, 'Décoration Intérieure', 300, '🖼️'),
(321, 'Cadres & Tableaux', 320, '🖼️'),
(322, 'Miroirs', 320, '🪞'),
(323, 'Bougies & Diffuseurs', 320, '🕯️'),
(324, 'Vases & Fleurs Artificielles', 320, '🌸'),
(325, 'Horloges & Pendules', 320, '🕰️'),
(326, 'Coussins Décoratifs', 320, '🛋️'),

-- Jardin & Extérieur
(327, 'Jardin & Extérieur', 300, '🌿'),
(328, 'Mobilier Jardin', 327, '⛱️'),
(329, 'Outils de Jardinage', 327, '🌱'),
(330, 'Plantes & Semences', 327, '🌿'),
(331, 'Arrosage & Irrigation', 327, '💧'),
(332, 'Barbecue & Plancha', 327, '🔥'),
(333, 'Piscines & Accessoires', 327, '🏊'),

-- Électroménager
(334, 'Électroménager', 300, '📺'),
(335, 'Réfrigérateurs & Congélateurs', 334, '❄️'),
(336, 'Machines à Laver', 334, '🫧'),
(337, 'Climatiseurs & Ventilateurs', 334, '🌬️'),
(338, 'Télévisions & Écrans', 334, '📺'),
(339, 'Aspirateurs & Nettoyage', 334, '🧹'),
(340, 'Fers à Repasser', 334, '👔'),
(341, 'Mixeurs & Blenders', 334, '🥤'),
(342, 'Fours & Micro-ondes', 334, '🍕'),

-- Bricolage & Outillage
(343, 'Bricolage & Outillage', 300, '🔧'),
(344, 'Outils à Main', 343, '🔨'),
(345, 'Outillage Électrique', 343, '⚡'),
(346, 'Peinture & Revêtements', 343, '🎨'),
(347, 'Plomberie', 343, '🚿'),
(348, 'Quincaillerie', 343, '🔩'),
(349, 'Échelles & Escabeaux', 343, '🪜');

-- ══════════════════════════════════════════════════════════════════
-- 6️⃣  BEAUTÉ & SANTÉ  (root 350, sous-catégories 351–399)
-- ══════════════════════════════════════════════════════════════════
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(350, 'Beauté & Santé', NULL, '💄'),

-- Soins Visage
(351, 'Soins Visage', 350, '✨'),
(352, 'Crèmes & Sérums', 351, '🧴'),
(353, 'Nettoyants Visage', 351, '🫧'),
(354, 'Masques & Exfoliants', 351, '🌿'),
(355, 'Contour des Yeux', 351, '👁️'),
(356, 'Soins Solaires & SPF', 351, '☀️'),

-- Soins Corps
(357, 'Soins Corps', 350, '🧴'),
(358, 'Crèmes & Lotions Corps', 357, '🧴'),
(359, 'Huiles Corporelles', 357, '💧'),
(360, 'Savons & Gels Douche', 357, '🫧'),
(361, 'Déodorants & Anti-transpirants', 357, '🌸'),
(362, 'Gommages Corps', 357, '✨'),

-- Maquillage
(363, 'Maquillage', 350, '💄'),
(364, 'Fonds de Teint & BB Cream', 363, '🎨'),
(365, 'Rouges à Lèvres & Gloss', 363, '💄'),
(366, 'Mascaras & Eyeliners', 363, '👁️'),
(367, 'Fards & Palettes', 363, '🎨'),
(368, 'Vernis à Ongles', 363, '💅'),
(369, 'Pinceaux & Accessoires Makeup', 363, '🖌️'),

-- Parfums
(370, 'Parfums & Fragrances', 350, '🌸'),
(371, 'Parfums Femme', 370, '🌸'),
(372, 'Parfums Homme', 370, '🏔️'),
(373, 'Eaux de Toilette', 370, '💦'),
(374, 'Huiles Parfumées', 370, '🫙'),

-- Soins Cheveux
(375, 'Soins Cheveux', 350, '💇'),
(376, 'Shampooings', 375, '🫧'),
(377, 'Après-Shampooings & Masques', 375, '💆'),
(378, 'Colorations & Teintures', 375, '🎨'),
(379, 'Extensions & Perruques', 375, '💇'),
(380, 'Accessoires Coiffure', 375, '✂️'),
(381, 'Fer à Lisser & Boucleur', 375, '🔥'),

-- Soins Homme
(382, 'Soins Homme', 350, '🧔'),
(383, 'Rasage & Après-Rasage', 382, '🪒'),
(384, 'Soins Barbe', 382, '🧔'),
(385, 'Crèmes Hydratantes Homme', 382, '🧴'),

-- Santé & Bien-être
(386, 'Santé & Bien-être', 350, '💊'),
(387, 'Vitamines & Compléments', 386, '💊'),
(388, 'Premiers Secours', 386, '🩹'),
(389, 'Appareils Santé', 386, '🩺'),
(390, 'Hygiène Bucco-dentaire', 386, '🦷'),
(391, 'Hygiène Féminine', 386, '🌸'),
(392, 'Lunettes & Optique', 386, '👓'),

-- Bien-être & Relaxation
(393, 'Bien-être & Relaxation', 350, '🧘'),
(394, 'Huiles Essentielles', 393, '🌿'),
(395, 'Diffuseurs Aromatiques', 393, '🕯️'),
(396, 'Massages & Accessoires', 393, '💆'),
(397, 'Méditation & Yoga', 393, '🧘'),
(398, 'Bains & Spas', 393, '🛁'),
(399, 'Préservatifs & Planning Familial', 386, '💊');

-- ══════════════════════════════════════════════════════════════════
-- 7️⃣  SPORT & LOISIRS  (root 400, sous-catégories 401–449)
-- ══════════════════════════════════════════════════════════════════
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(400, 'Sport & Loisirs', NULL, '⚽'),

-- Football
(401, 'Football', 400, '⚽'),
(402, 'Ballons de Football', 401, '⚽'),
(403, 'Chaussures de Football', 401, '👟'),
(404, 'Équipements & Protections', 401, '🦺'),
(405, 'Maillots & Shorts Football', 401, '👕'),
(406, 'Filets & Buts', 401, '🥅'),

-- Basketball
(407, 'Basketball', 400, '🏀'),
(408, 'Ballons de Basketball', 407, '🏀'),
(409, 'Chaussures Basketball', 407, '👟'),
(410, 'Paniers & Accessoires', 407, '🏀'),

-- Fitness & Musculation
(411, 'Fitness & Musculation', 400, '🏋️'),
(412, 'Haltères & Poids', 411, '🏋️'),
(413, 'Tapis de Yoga & Fitness', 411, '🧘'),
(414, 'Machines Cardio', 411, '🚴'),
(415, 'Bandes de Résistance', 411, '💪'),
(416, 'Vêtements Fitness', 411, '👕'),
(417, 'Protéines & Nutrition Sportive', 411, '💪'),

-- Natation & Aquatique
(418, 'Natation & Aquatique', 400, '🏊'),
(419, 'Maillots de Bain Homme', 418, '🩱'),
(420, 'Maillots de Bain Femme', 418, '👙'),
(421, 'Lunettes de Natation', 418, '🥽'),
(422, 'Bonnets & Accessoires Piscine', 418, '🏊'),

-- Cyclisme
(423, 'Cyclisme', 400, '🚴'),
(424, 'Vélos City & Trekking', 423, '🚲'),
(425, 'Vélos VTT', 423, '🚵'),
(426, 'Casques Vélo', 423, '⛑️'),
(427, 'Accessoires & Pièces Vélo', 423, '🔧'),

-- Tennis & Raquettes
(428, 'Tennis & Raquettes', 400, '🎾'),
(429, 'Raquettes Tennis', 428, '🎾'),
(430, 'Balles & Accessoires Tennis', 428, '🎾'),
(431, 'Badminton & Ping-Pong', 428, '🏸'),

-- Sports Combat
(432, 'Sports de Combat', 400, '🥊'),
(433, 'Gants de Boxe', 432, '🥊'),
(434, 'Équipements Arts Martiaux', 432, '🥋'),
(435, 'Protections & Casques Combat', 432, '⛑️'),
(436, 'Sacs de Frappe', 432, '🥊'),

-- Outdoor & Randonnée
(437, 'Outdoor & Randonnée', 400, '🏔️'),
(438, 'Sacs à Dos Randonnée', 437, '🎒'),
(439, 'Chaussures Randonnée', 437, '👟'),
(440, 'Tentes & Camping', 437, '⛺'),
(441, 'Sacs de Couchage', 437, '🛏️'),
(442, 'Lampes & Torches', 437, '🔦'),

-- Sports Aquatiques & Plage
(443, 'Sports Aquatiques & Plage', 400, '🏄'),
(444, 'Surf & Windsurf', 443, '🏄'),
(445, 'Plongée & Snorkeling', 443, '🤿'),
(446, 'Accessoires Plage', 443, '🏖️'),

-- Pêche
(447, 'Pêche', 400, '🎣'),
(448, 'Cannes & Moulinets', 447, '🎣'),
(449, 'Appâts & Leurres', 447, '🐟');

-- ══════════════════════════════════════════════════════════════════
-- 8️⃣  ALIMENTATION & ÉPICERIE  (root 450, sous-catégories 451–499)
-- ══════════════════════════════════════════════════════════════════
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(450, 'Alimentation & Épicerie', NULL, '🛒'),

-- Céréales & Féculents
(451, 'Céréales & Féculents', 450, '🌾'),
(452, 'Riz & Maïs', 451, '🌾'),
(453, 'Farine & Semoule', 451, '🌾'),
(454, 'Pâtes & Nouilles', 451, '🍝'),
(455, 'Pain & Viennoiseries', 451, '🍞'),
(456, 'Fonio & Sorgho', 451, '🌿'),

-- Produits Locaux Béninois
(457, 'Produits Locaux Béninois', 450, '🌍'),
(458, 'Huile de Palme & Noix', 457, '🌴'),
(459, 'Gari & Cossettes', 457, '🥔'),
(460, 'Piments & Épices Locales', 457, '🌶️'),
(461, 'Arachides & Noix de Cajou', 457, '🥜'),
(462, 'Ignames & Tubercules', 457, '🥔'),
(463, 'Feuilles & Légumes Locaux', 457, '🥬'),
(464, 'Poissons Séchés & Fumés', 457, '🐟'),

-- Épices & Condiments
(465, 'Épices & Condiments', 450, '🧂'),
(466, 'Épices & Herbes Aromatiques', 465, '🌿'),
(467, 'Huiles de Cuisine', 465, '🫙'),
(468, 'Sauces & Marinades', 465, '🍶'),
(469, 'Sel, Sucre & Sucrants', 465, '🧂'),
(470, 'Vinaigres & Moutardes', 465, '🫙'),

-- Boissons
(471, 'Boissons', 450, '🥤'),
(472, 'Eau Minérale & Gazeuse', 471, '💧'),
(473, 'Jus de Fruits', 471, '🍹'),
(474, 'Sodas & Limonades', 471, '🥤'),
(475, 'Thé, Tisanes & Infusions', 471, '🍵'),
(476, 'Café & Cacao', 471, '☕'),
(477, 'Boissons Énergisantes', 471, '⚡'),
(478, 'Bissap & Boissons Locales', 471, '🌺'),

-- Conserves & Surgelés
(479, 'Conserves & Surgelés', 450, '🥫'),
(480, 'Conserves Légumes & Fruits', 479, '🥫'),
(481, 'Poissons & Viandes en Conserve', 479, '🐟'),
(482, 'Plats Cuisinés', 479, '🍲'),

-- Produits Laitiers & Œufs
(483, 'Produits Laitiers & Œufs', 450, '🥛'),
(484, 'Lait & Crèmes', 483, '🥛'),
(485, 'Fromages', 483, '🧀'),
(486, 'Yaourts & Desserts Lactés', 483, '🍮'),
(487, 'Œufs', 483, '🥚'),

-- Confiseries & Snacks
(488, 'Confiseries & Snacks', 450, '🍫'),
(489, 'Chocolats & Confiseries', 488, '🍫'),
(490, 'Biscuits & Gâteaux', 488, '🍪'),
(491, 'Chips & Snacks Salés', 488, '🥨'),
(492, 'Fruits Secs & Oléagineux', 488, '🥜'),

-- Bio & Naturel
(493, 'Bio & Naturel', 450, '🌱'),
(494, 'Produits Bio Céréales', 493, '🌾'),
(495, 'Épices Bio', 493, '🌿'),
(496, 'Boissons Bio', 493, '🍃');

-- ══════════════════════════════════════════════════════════════════
-- 9️⃣  JOUETS & ENFANTS  (root 500, sous-catégories 501–539)
-- ══════════════════════════════════════════════════════════════════
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(500, 'Jouets & Enfants', NULL, '🧸'),

-- Jouets Bébé (0-2 ans)
(501, 'Jouets Bébé 0-2 ans', 500, '👶'),
(502, 'Hochets & Anneaux de Dentition', 501, '🔔'),
(503, 'Tapis d\'Éveil', 501, '🌈'),
(504, 'Peluches Bébé', 501, '🧸'),
(505, 'Mobiles & Projections', 501, '✨'),

-- Jeux Construction
(506, 'Jeux de Construction', 500, '🧱'),
(507, 'Lego & Briques', 506, '🧱'),
(508, 'Puzzles Enfants', 506, '🧩'),
(509, 'Maquettes & Modélisme', 506, '✈️'),

-- Jeux de Société
(510, 'Jeux de Société', 500, '🎲'),
(511, 'Jeux de Cartes', 510, '🃏'),
(512, 'Jeux de Plateau', 510, '🎲'),
(513, 'Échecs, Dames & Dominos', 510, '♟️'),
(514, 'Jeux de Stratégie', 510, '🧠'),

-- Poupées & Figurines
(515, 'Poupées & Figurines', 500, '🪆'),
(516, 'Poupées', 515, '🪆'),
(517, 'Figurines & Super-héros', 515, '🦸'),
(518, 'Voitures & Véhicules Miniatures', 515, '🚗'),
(519, 'Animaux & Dinosaures', 515, '🦕'),

-- Jeux Plein Air
(520, 'Jeux de Plein Air', 500, '🏃'),
(521, 'Vélos Enfant', 520, '🚲'),
(522, 'Trottinettes & Patins', 520, '🛴'),
(523, 'Ballons & Sports Enfants', 520, '⚽'),
(524, 'Trampolines & Tobogans', 520, '🎡'),
(525, 'Pistolets à Eau & Plein Air', 520, '💦'),

-- Jeux Éducatifs
(526, 'Jeux Éducatifs & Créatifs', 500, '📚'),
(527, 'Livres Enfants & Albums', 526, '📖'),
(528, 'Jouets Musicaux', 526, '🎵'),
(529, 'Kits Créatifs & Dessin', 526, '🎨'),
(530, 'Sciences & Expériences', 526, '🔬'),

-- Jeux Vidéo Enfants
(531, 'Jeux Vidéo Enfants', 500, '🎮'),
(532, 'Consoles Portables Enfants', 531, '🎮'),
(533, 'Jeux & Accessoires Nintendo', 531, '🎮'),

-- Déguisements & Carnaval
(534, 'Déguisements & Carnaval', 500, '🎭'),
(535, 'Costumes Enfants', 534, '🦸'),
(536, 'Accessoires Déguisements', 534, '🎭');

-- ══════════════════════════════════════════════════════════════════
-- 🔟  AUTO & MOTO  (root 540, sous-catégories 541–579)
-- ══════════════════════════════════════════════════════════════════
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(540, 'Auto & Moto', NULL, '🚗'),

-- Pièces Auto
(541, 'Pièces Automobiles', 540, '🔧'),
(542, 'Moteurs & Pièces Moteur', 541, '⚙️'),
(543, 'Freins & Suspension', 541, '🛞'),
(544, 'Carrosserie & Optiques', 541, '🚗'),
(545, 'Filtres & Lubrifiants', 541, '🛢️'),
(546, 'Batteries Auto', 541, '⚡'),
(547, 'Pneumatiques & Jantes', 541, '🛞'),

-- Accessoires Auto
(548, 'Accessoires Auto', 540, '🚘'),
(549, 'Autoradios & GPS', 548, '📻'),
(550, 'Housses & Tapis de Sol', 548, '🚗'),
(551, 'Caméras de Recul & Radars', 548, '📷'),
(552, 'Câbles & Chargeurs Auto', 548, '🔌'),
(553, 'Pare-soleil & Signalisation', 548, '🌞'),

-- Moto & Scooter
(554, 'Moto & Scooter', 540, '🏍️'),
(555, 'Casques Moto', 554, '⛑️'),
(556, 'Équipements Moto', 554, '🧥'),
(557, 'Pièces Moto & Scooter', 554, '🔧'),
(558, 'Accessoires Moto', 554, '🏍️'),

-- Véhicules Électriques
(559, 'Véhicules Électriques', 540, '⚡'),
(560, 'Trottinettes Électriques', 559, '🛴'),
(561, 'Vélos Électriques', 559, '🚲'),
(562, 'Accessoires Véhicules Élec.', 559, '🔋'),

-- Entretien Auto
(563, 'Entretien & Nettoyage Auto', 540, '🧽'),
(564, 'Produits de Lavage', 563, '🫧'),
(565, 'Cires & Protections', 563, '✨'),
(566, 'Aspirateurs Auto', 563, '🧹'),

-- Outils Auto
(567, 'Outils & Équipements Auto', 540, '🔧'),
(568, 'Outils Diagnostic', 567, '🔍'),
(569, 'Crics & Compresseurs', 567, '⚙️'),
(570, 'Câbles de Démarrage', 567, '⚡');

-- ══════════════════════════════════════════════════════════════════
-- 1️⃣1️⃣  LIVRES & MÉDIAS  (root 580, sous-catégories 581–609)
-- ══════════════════════════════════════════════════════════════════
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(580, 'Livres & Médias', NULL, '📚'),

-- Livres
(581, 'Livres', 580, '📖'),
(582, 'Romans & Littérature', 581, '📖'),
(583, 'Développement Personnel', 581, '🧠'),
(584, 'Livres Scolaires & Parascolaires', 581, '🎓'),
(585, 'Livres Religieux & Spirituels', 581, '🙏'),
(586, 'Livres Jeunesse', 581, '🧒'),
(587, 'Bandes Dessinées & Mangas', 581, '📕'),
(588, 'Livres Business & Management', 581, '💼'),
(589, 'Livres Santé & Bien-être', 581, '💊'),
(590, 'Livres Cuisine & Gastronomie', 581, '🍳'),

-- Médias Numériques
(591, 'Médias & Divertissement', 580, '🎬'),
(592, 'CD & Albums Musicaux', 591, '💿'),
(593, 'DVD & Films', 591, '🎬'),
(594, 'Livres Audio & Podcasts', 591, '🎧'),

-- Papeterie & Fournitures
(595, 'Papeterie & Fournitures', 580, '✏️'),
(596, 'Cahiers & Carnets', 595, '📓'),
(597, 'Stylos, Crayons & Marqueurs', 595, '✏️'),
(598, 'Classeurs & Intercalaires', 595, '📂'),
(599, 'Enveloppes & Matériel Postal', 595, '✉️'),
(600, 'Calculatrices', 595, '🔢'),

-- Impression & Bureau
(601, 'Impression & Bureau', 580, '🖨️'),
(602, 'Imprimantes', 601, '🖨️'),
(603, 'Cartouches & Toners', 601, '🖨️'),
(604, 'Papier Imprimante', 601, '📄'),
(605, 'Scanners', 601, '🔍'),
(606, 'Destructeurs de Documents', 601, '📄');

-- ══════════════════════════════════════════════════════════════════
-- 1️⃣2️⃣  ART & ARTISANAT  (root 610, sous-catégories 611–649)
-- ══════════════════════════════════════════════════════════════════
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(610, 'Art & Artisanat', NULL, '🎨'),

-- Tissus & Couture
(611, 'Tissus & Couture', 610, '🧵'),
(612, 'Pagnes & Tissus Africains', 611, '🌍'),
(613, 'Broderies & Dentelles', 611, '🪡'),
(614, 'Fils, Laines & Tricot', 611, '🧶'),
(615, 'Machines à Coudre & Accessoires', 611, '🧵'),
(616, 'Patrons & Modèles', 611, '📐'),

-- Peinture & Dessin
(617, 'Peinture & Dessin', 610, '🖌️'),
(618, 'Peintures & Pinceaux', 617, '🖌️'),
(619, 'Toiles & Supports', 617, '🖼️'),
(620, 'Crayons, Pastels & Fusains', 617, '✏️'),
(621, 'Aquarelles & Gouaches', 617, '💧'),
(622, 'Spray & Peinture Aérosol', 617, '🎨'),

-- Bijoux & Joaillerie
(623, 'Bijoux & Joaillerie', 610, '💎'),
(624, 'Colliers & Pendentifs', 623, '📿'),
(625, 'Bracelets & Bangles', 623, '💛'),
(626, 'Boucles d\'Oreilles', 623, '👂'),
(627, 'Bagues & Alliances', 623, '💍'),
(628, 'Bijoux Traditionnels Béninois', 623, '🌍'),
(629, 'Montres Bijoux', 623, '⌚'),

-- Artisanat Local Béninois
(630, 'Artisanat Local Béninois', 610, '🌍'),
(631, 'Sculptures & Statuettes', 630, '🗿'),
(632, 'Poteries & Céramiques', 630, '🏺'),
(633, 'Paniers, Nattes & Vannerie', 630, '🧺'),
(634, 'Masques Traditionnels', 630, '🎭'),
(635, 'Tableaux & Peintures Locales', 630, '🖼️'),
(636, 'Broderies & Vêtements Brodés', 630, '👘'),

-- Scrapbooking & DIY
(637, 'Scrapbooking & DIY', 610, '✂️'),
(638, 'Papiers Décoratifs & Cartonnage', 637, '📋'),
(639, 'Colles & Adhésifs Créatifs', 637, '🔧'),
(640, 'Tampons & Matrices', 637, '🖊️'),
(641, 'Kits DIY Complets', 637, '🎁');

-- ══════════════════════════════════════════════════════════════════
-- 1️⃣3️⃣  ANIMALERIE  (root 650, sous-catégories 651–679)
-- ══════════════════════════════════════════════════════════════════
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(650, 'Animalerie', NULL, '🐾'),

-- Chiens
(651, 'Chiens', 650, '🐕'),
(652, 'Nourriture Chiens', 651, '🦴'),
(653, 'Jouets & Accessoires Chiens', 651, '🐕'),
(654, 'Hygiène & Toilettage Chiens', 651, '🛁'),
(655, 'Laisses, Colliers & Harnais', 651, '🔗'),
(656, 'Cages & Niches', 651, '🏠'),

-- Chats
(657, 'Chats', 650, '🐈'),
(658, 'Nourriture Chats', 657, '🐟'),
(659, 'Jouets & Griffoirs', 657, '🐱'),
(660, 'Litières & Bacs', 657, '🧹'),
(661, 'Accessoires Chats', 657, '🐈'),

-- Oiseaux
(662, 'Oiseaux', 650, '🐦'),
(663, 'Nourriture Oiseaux', 662, '🌾'),
(664, 'Cages & Volières', 662, '🏠'),
(665, 'Accessoires Oiseaux', 662, '🐦'),

-- Poissons & Aquariophilie
(666, 'Poissons & Aquariophilie', 650, '🐠'),
(667, 'Aquariums & Bassins', 666, '🐠'),
(668, 'Nourriture Poissons', 666, '🐟'),
(669, 'Filtres & Pompes', 666, '💧'),
(670, 'Décorations Aquarium', 666, '🌿'),

-- Reptiles & Petits Animaux
(671, 'Reptiles & Petits Animaux', 650, '🦎'),
(672, 'Terrarium & Équipements', 671, '🦎'),
(673, 'Nourriture Petits Animaux', 671, '🌿'),

-- Soins Vétérinaires
(674, 'Soins & Médicaments Animaux', 650, '🩺'),
(675, 'Antiparasitaires', 674, '💊'),
(676, 'Vitamines Animaux', 674, '🌿');

-- ══════════════════════════════════════════════════════════════════
-- 1️⃣4️⃣  BÉBÉ & PUÉRICULTURE  (root 680, sous-catégories 681–709)
-- ══════════════════════════════════════════════════════════════════
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(680, 'Bébé & Puériculture', NULL, '🍼'),

-- Alimentation Bébé
(681, 'Alimentation Bébé', 680, '🍼'),
(682, 'Laits Infantiles & Formules', 681, '🍼'),
(683, 'Petits Pots & Purées', 681, '🥣'),
(684, 'Biberons & Tétines', 681, '🍼'),
(685, 'Chaises Hautes & Accessoires Repas', 681, '🪑'),

-- Hygiène Bébé
(686, 'Hygiène & Soins Bébé', 680, '🧴'),
(687, 'Couches & Changes', 686, '🍼'),
(688, 'Soins Peau Bébé', 686, '🧴'),
(689, 'Bain & Accessoires Bain', 686, '🛁'),
(690, 'Mouche-bébé & Thermomètres', 686, '🌡️'),

-- Mobilier & Chambre Bébé
(691, 'Mobilier & Chambre Bébé', 680, '🛏️'),
(692, 'Lits, Berceaux & Cododo', 691, '🛏️'),
(693, 'Poussettes & Landaus', 691, '👶'),
(694, 'Transats & Balanços', 691, '🪑'),
(695, 'Baby-phones & Surveillance', 691, '📱'),

-- Vêtements Bébé
(696, 'Vêtements & Chaussures Bébé', 680, '👶'),
(697, 'Bodies, Grenouillères & Pyjamas', 696, '👶'),
(698, 'Chaussures & Chaussettes Bébé', 696, '👟'),
(699, 'Chapeaux, Gants & Bavoirs', 696, '🧤'),

-- Éveil & Sécurité
(700, 'Éveil & Sécurité Bébé', 680, '🌈'),
(701, 'Tapis d\'Éveil & Arches', 700, '🌈'),
(702, 'Barrières & Sécurité Maison', 700, '🔒'),
(703, 'Porte-bébés & Écharpes', 700, '👶');

-- ══════════════════════════════════════════════════════════════════
-- 1️⃣5️⃣  MUSIQUE & INSTRUMENTS  (root 710, sous-catégories 711–739)
-- ══════════════════════════════════════════════════════════════════
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(710, 'Musique & Instruments', NULL, '🎵'),

-- Guitares & Cordes
(711, 'Guitares & Instruments à Cordes', 710, '🎸'),
(712, 'Guitares Acoustiques', 711, '🎸'),
(713, 'Guitares Électriques', 711, '🎸'),
(714, 'Basses Électriques', 711, '🎸'),
(715, 'Ukulélés & Banjos', 711, '🎶'),

-- Percussions
(716, 'Percussions', 710, '🥁'),
(717, 'Djembés & Tambours Africains', 716, '🥁'),
(718, 'Batteries & Percussions Classiques', 716, '🥁'),
(719, 'Congas & Bongos', 716, '🥁'),
(720, 'Xylophones & Marimbas', 716, '🎵'),

-- Instruments à Vent
(721, 'Instruments à Vent', 710, '🎺'),
(722, 'Flûtes & Flûtes à Bec', 721, '🎶'),
(723, 'Trompettes & Cuivres', 721, '🎺'),
(724, 'Saxophones & Clarinettes', 721, '🎷'),

-- Claviers & Piano
(725, 'Claviers & Piano', 710, '🎹'),
(726, 'Pianos Numériques', 725, '🎹'),
(727, 'Claviers MIDI', 725, '🎹'),
(728, 'Orgues & Accordéons', 725, '🎹'),

-- Matériel DJ & Studio
(729, 'Matériel DJ & Studio', 710, '🎧'),
(730, 'Tables de Mixage', 729, '🎚️'),
(731, 'Microphones Studio', 729, '🎤'),
(732, 'Enceintes & Moniteurs Studio', 729, '🔊'),
(733, 'Interfaces Audio', 729, '🎛️'),
(734, 'Câbles & Accessoires Studio', 729, '🔌'),

-- Accessoires Musique
(735, 'Accessoires Musique', 710, '🎶'),
(736, 'Cordes & Anches', 735, '🎸'),
(737, 'Partitions & Supports', 735, '📃'),
(738, 'Accordeurs & Métronomes', 735, '🎵');

-- ══════════════════════════════════════════════════════════════════
-- 1️⃣6️⃣  ÉNERGIE & ÉLECTRICITÉ  (root 740, sous-catégories 741–769)
-- ══════════════════════════════════════════════════════════════════
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(740, 'Énergie & Électricité', NULL, '⚡'),

-- Panneaux Solaires
(741, 'Énergie Solaire', 740, '☀️'),
(742, 'Panneaux Photovoltaïques', 741, '☀️'),
(743, 'Batteries Solaires & Stockage', 741, '🔋'),
(744, 'Kits Solaires Complets', 741, '☀️'),
(745, 'Contrôleurs de Charge', 741, '⚡'),
(746, 'Lampes Solaires', 741, '💡'),

-- Groupes Électrogènes
(747, 'Groupes Électrogènes', 740, '🔌'),
(748, 'Générateurs Essence', 747, '⛽'),
(749, 'Générateurs Diesel', 747, '🛢️'),
(750, 'Onduleurs & Inverseurs', 747, '⚡'),
(751, 'Stabilisateurs de Tension', 747, '🔌'),

-- Éclairage
(752, 'Éclairage', 740, '💡'),
(753, 'Ampoules LED', 752, '💡'),
(754, 'Projecteurs & Spots', 752, '🔦'),
(755, 'Guirlandes & Éclairage Déco', 752, '✨'),
(756, 'Lampadaires & Appliques', 752, '💡'),

-- Matériel Électrique
(757, 'Matériel Électrique', 740, '🔌'),
(758, 'Câbles & Fils Électriques', 757, '🔌'),
(759, 'Prises, Multiprises & Interrupteurs', 757, '🔌'),
(760, 'Tableaux & Disjoncteurs', 757, '⚡'),
(761, 'Détecteurs & Capteurs', 757, '📡'),
(762, 'Batteries & Piles', 757, '🔋');

-- ══════════════════════════════════════════════════════════════════
-- 1️⃣7️⃣  SÉCURITÉ & SURVEILLANCE  (root 770, sous-catégories 771–799)
-- ══════════════════════════════════════════════════════════════════
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(770, 'Sécurité & Surveillance', NULL, '🔒'),

-- Caméras de Surveillance
(771, 'Caméras de Surveillance', 770, '📷'),
(772, 'Caméras IP WiFi Intérieure', 771, '📷'),
(773, 'Caméras Extérieures & Dôme', 771, '📷'),
(774, 'Systèmes NVR & DVR', 771, '💾'),
(775, 'Caméras Factices', 771, '📷'),

-- Alarmes & Détection
(776, 'Alarmes & Détection', 770, '🚨'),
(777, 'Alarmes Maison', 776, '🏠'),
(778, 'Détecteurs de Fumée & CO', 776, '🔥'),
(779, 'Détecteurs de Mouvement', 776, '👁️'),
(780, 'Sirènes & Avertisseurs', 776, '🔔'),

-- Contrôle d'Accès
(781, 'Contrôle d\'Accès', 770, '🗝️'),
(782, 'Serrures Connectées & Biométriques', 781, '🔐'),
(783, 'Interphones & Visiophones', 781, '📞'),
(784, 'Portails & Barrières Automatiques', 781, '🚧'),
(785, 'Coffres-Forts', 781, '🔒'),

-- Protection Incendie
(786, 'Protection Incendie', 770, '🧯'),
(787, 'Extincteurs', 786, '🧯'),
(788, 'Sprinklers & Systèmes Anti-incendie', 786, '💧');

-- ══════════════════════════════════════════════════════════════════
-- 1️⃣8️⃣  VOYAGE & BAGAGERIE  (root 800, sous-catégories 801–824)
-- ══════════════════════════════════════════════════════════════════
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(800, 'Voyage & Bagagerie', NULL, '✈️'),

-- Valises & Sacs
(801, 'Valises & Sacs de Voyage', 800, '🧳'),
(802, 'Valises Rigides', 801, '🧳'),
(803, 'Valises Souples', 801, '🧳'),
(804, 'Sacs de Voyage & Duffel Bags', 801, '👜'),
(805, 'Sacs à Dos Voyage', 801, '🎒'),

-- Accessoires Voyage
(806, 'Accessoires Voyage', 800, '✈️'),
(807, 'Cadenas de Voyage', 806, '🔒'),
(808, 'Adaptateurs de Prise', 806, '🔌'),
(809, 'Oreillers & Masques de Sommeil', 806, '😴'),
(810, 'Organiseurs & Trousse Voyage', 806, '🗂️'),
(811, 'Couvertures de Voyage', 806, '🛏️'),

-- Sacs à Main & Maroquinerie
(812, 'Sacs à Main & Maroquinerie', 800, '👜'),
(813, 'Sacs à Main Femme', 812, '👜'),
(814, 'Sacs Bandoulière & Besace', 812, '👜'),
(815, 'Portefeuilles & Porte-cartes', 812, '💳'),
(816, 'Ceintures', 812, '👖'),
(817, 'Sacs à Dos Mode', 812, '🎒');

-- ══════════════════════════════════════════════════════════════════
-- 1️⃣9️⃣  BUREAU & MOBILIER PRO  (root 830, sous-catégories 831–859)
-- ══════════════════════════════════════════════════════════════════
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(830, 'Bureau & Mobilier Professionnel', NULL, '🏢'),

-- Mobilier Bureau
(831, 'Mobilier de Bureau', 830, '🪑'),
(832, 'Bureaux & Tables de Travail', 831, '🪑'),
(833, 'Chaises & Fauteuils de Bureau', 831, '🪑'),
(834, 'Étagères & Rangements Bureau', 831, '📚'),
(835, 'Caissons & Tiroirs', 831, '🗄️'),
(836, 'Cloisons & Paravents', 831, '🏢'),

-- Fournitures Scolaires
(837, 'Fournitures Scolaires', 830, '🎒'),
(838, 'Cartables & Sacs École', 837, '🎒'),
(839, 'Stylos & Calculatrices Scolaires', 837, '✏️'),
(840, 'Cahiers & Blocs-Notes', 837, '📓'),
(841, 'Compas, Règles & Outils Scolaires', 837, '📐'),
(842, 'Colle, Ciseaux & Matériel Papeterie', 837, '✂️'),

-- Téléphonie Bureau
(843, 'Téléphonie & Communication', 830, '📞'),
(844, 'Téléphones Fixes', 843, '☎️'),
(845, 'Systèmes PABX & IPBX', 843, '📡'),
(846, 'Fax & Scanners Pro', 843, '📠'),

-- Présentation & Conférence
(847, 'Présentation & Conférence', 830, '📊'),
(848, 'Vidéoprojecteurs', 847, '📽️'),
(849, 'Tableaux Blancs & Flip Charts', 847, '📋'),
(850, 'Systèmes de Conférence', 847, '🎤'),
(851, 'Écrans de Projection', 847, '🖥️');

-- ══════════════════════════════════════════════════════════════════
-- 2️⃣0️⃣  SERVICES & OCCASIONS  (root 860, sous-catégories 861–879)
-- ══════════════════════════════════════════════════════════════════
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(860, 'Services & Occasions', NULL, '🎁'),

-- Cadeaux & Fêtes
(861, 'Cadeaux & Occasions', 860, '🎁'),
(862, 'Coffrets Cadeaux', 861, '🎁'),
(863, 'Cartes Cadeaux & Bons d\'Achat', 861, '🎟️'),
(864, 'Décorations de Fête', 861, '🎉'),
(865, 'Ballons & Accessoires Fête', 861, '🎈'),
(866, 'Articles de Mariage', 861, '💒'),
(867, 'Décorations Baptême & Communion', 861, '👶'),

-- Services Numériques
(868, 'Services Numériques', 860, '💻'),
(869, 'Abonnements Streaming & VOD', 868, '📺'),
(870, 'Cartes de Recharge Téléphone', 868, '📱'),
(871, 'Codes Jeux Vidéo & DLC', 868, '🎮'),
(872, 'Logiciels & Licences', 868, '💾'),

-- Impression & Personnalisation
(873, 'Impression & Personnalisation', 860, '🖨️'),
(874, 'T-Shirts & Objets Personnalisés', 873, '👕'),
(875, 'Cartes de Visite & Flyers', 873, '📄'),
(876, 'Tasses, Mugs & Objets Gravés', 873, '☕');

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- TOTAL : ~370 nouvelles catégories (IDs 300–876)
-- ============================================================
