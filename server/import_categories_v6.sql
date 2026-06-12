SET FOREIGN_KEY_CHECKS = 0;

-- ── 418. NATATION & AQUATIQUE (18→20, +2)
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(4519,'Nageoires & Monofins',418,'🦈'),
(4520,'Aquabiking & Vélos de Piscine',418,'🚴');

-- ── 563. ENTRETIEN & NETTOYAGE AUTO (19→20, +1)
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(4521,'Nettoyeur Vapeur Auto',563,'♨️');

-- ── 747. GROUPES ÉLECTROGÈNES (19→20, +1)
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(4522,'Accessoires & Pièces Groupes Élect.',747,'🔩');

-- ── 1195. HANDBALL (19→20, +1)
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(4523,'Vestes & Survêtements Handball',1195,'🧥');

-- ── 1202. SPORTS SCOLAIRES & JEUX EPS (19→20, +1)
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(4524,'Raquettes Tennis de Table Scolaires',1202,'🏓');

-- ── 1205. BILLARD, FLÉCHETTES & JEUX ADULTES (19→20, +1)
INSERT IGNORE INTO categories (id, name, parent_id, icon) VALUES
(4525,'Jeux de Fléchettes Électroniques',1205,'🎯');

SET FOREIGN_KEY_CHECKS = 1;
