-- ============================================================
-- BASE DE DONNÉES : gestion_stock
-- Projet : Gestion Stock Boutique Station Service
-- Date   : 2026-04-22
-- ============================================================

CREATE DATABASE IF NOT EXISTS gestion_stock

  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
  
USE gestion_stock;

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';

-- ============================================================
-- TABLE : categories
-- ============================================================
CREATE TABLE `categories` (
  `idCategorie`  INT(11)       NOT NULL AUTO_INCREMENT,
  `libelle`      VARCHAR(50)   NOT NULL,
  `description`  VARCHAR(500)  DEFAULT NULL,
  `emoji`        VARCHAR(10)   ,
  `created_at`   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`idCategorie`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `categories` VALUES
(1, 'Carburants',   'Essence, gasoil, gaz',              NOW(), NOW()),
(2, 'Lubrifiants',  'Huiles moteur et transmission',      NOW(), NOW()),
(3, 'Accessoires',  'Pièces et accessoires auto',         NOW(), NOW()),
(4, 'Boissons',     'Eau, jus, sodas',                   NOW(), NOW()),
(5, 'Alimentaire',  'Snacks, conserves, divers',          NOW(), NOW()),
(6, 'Hygiène',      'Produits d\'entretien et hygiène',   NOW(), NOW());

-- ============================================================
-- TABLE : utilisateurs
-- ============================================================
CREATE TABLE `utilisateurs` (
  `idUtilisateur` INT(11)      NOT NULL AUTO_INCREMENT,
  `nom`           VARCHAR(50)  NOT NULL,
  `prenom`        VARCHAR(50)  NOT NULL,
  `login`         VARCHAR(50)  NOT NULL,
  `email`         VARCHAR(100) NOT NULL,
  `motDePasse`    VARCHAR(255) NOT NULL,
  `actif`         TINYINT(1)   NOT NULL DEFAULT 1,
  `role`          ENUM('gerant','caissier','magasinier','gestionnaire_stock') NOT NULL DEFAULT 'caissier',
  `photo`         VARCHAR(255) DEFAULT NULL,
  `created_at`    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`idUtilisateur`),
  UNIQUE KEY `login` (`login`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `utilisateurs` (`nom`, `prenom`, `login`, `email`, `motDePasse`, `actif`, `role`) VALUES
('Medoune',  'Elaj',  'admin',    'admin@station.sn',    '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, 'gerant'),
('Diallo',   'Awa',   'awa',      'awa@station.sn',      '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.usfutJ6hi', 1, 'gestionnaire_stock'),
('Badiene',  'Fatou', 'badiene',  'badiene@station.sn',  '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.usfutJ6hi', 1, 'caissier'),
('Ndiaye',   'Omar',  'caissier2','omar@station.sn',     '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.usfutJ6hi', 1, 'caissier');

-- ============================================================
-- TABLE : fournisseurs
-- ============================================================
CREATE TABLE `fournisseurs` (
  `idFournisseur`  INT(11)      NOT NULL AUTO_INCREMENT,
  `nom`            VARCHAR(100) NOT NULL,
  `telephone`      VARCHAR(20)  DEFAULT NULL,
  `email`          VARCHAR(100) DEFAULT NULL,
  `adresse`        VARCHAR(100) DEFAULT NULL,
  `delaiLivraison` INT(11)      NOT NULL DEFAULT 1,
  `photo`          VARCHAR(255) DEFAULT NULL,
  `created_at`     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`idFournisseur`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `fournisseurs` (`nom`, `telephone`, `email`, `adresse`, `delaiLivraison`) VALUES
('Total Sénégal',   '338201234', 'contact@total.sn',    'Dakar, Plateau',   2),
('Shell Distribution','338205678','info@shell.sn',       'Dakar, Almadies',  3),
('Auto Parts SN',   '771234567', 'vente@autoparts.sn',  'Dakar, Colobane',  5),
('Auchan Sénégal',  '338209900', 'pro@auchan.sn',       'Dakar, Ouakam',    1),
('Kirène SA',       '338341100', 'commande@kirene.sn',  'Thiès',            2);

-- ============================================================
-- TABLE : produits
-- ============================================================
CREATE TABLE `produits` (
  `idProduit`     INT(11)        NOT NULL AUTO_INCREMENT,
  `nomProduit`    VARCHAR(100)   DEFAULT NULL,
  `reference`     VARCHAR(50)    NOT NULL,
  `codeBarre`     VARCHAR(50)    DEFAULT NULL,
  `prixUnitaire`  DECIMAL(10,2)  NOT NULL DEFAULT 0.00,
  `seuilSecurite` DECIMAL(8,2)   NOT NULL DEFAULT 0.00,
  `idCategorie`   INT(11)        NOT NULL,
  `photo`         VARCHAR(255)   DEFAULT NULL,
  `created_at`    TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`idProduit`),
  KEY `fk_produit_categorie` (`idCategorie`),
  CONSTRAINT `fk_produit_categorie` FOREIGN KEY (`idCategorie`) REFERENCES `categories` (`idCategorie`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `produits` (`reference`, `codeBarre`, `prixUnitaire`, `seuilSecurite`, `idCategorie`) VALUES
('SP95',           '6011000001',  750.00,   500.00, 1),
('SP98',           '6011000002',  800.00,   300.00, 1),
('GASOIL',         '6011000003',  680.00,   800.00, 1),
('GPL',            '6011000004',  450.00,   200.00, 1),
('HUILE-5W30-1L',  '6011000005', 4500.00,    20.00, 2),
('HUILE-5W30-5L',  '6011000006',12500.00,    10.00, 2),
('HUILE-15W40-1L', '6011000007', 3800.00,    20.00, 2),
('LIQ-FREIN',      '6011000008', 2200.00,    15.00, 2),
('FILTRE-HUILE',   '6011000009', 3500.00,    10.00, 3),
('FILTRE-AIR',     '6011000010', 4200.00,    10.00, 3),
('BALAI-ESSUIE',   '6011000011', 5500.00,     8.00, 3),
('EAU-KIRENE-1L',  '6011000012',  400.00,    50.00, 4),
('EAU-KIRENE-5L',  '6011000013',  900.00,    30.00, 4),
('COCA-COLA-33CL', '6011000014',  600.00,    40.00, 4),
('JUS-BOUYE',      '6011000015',  500.00,    30.00, 4),
('BISCUITS-LU',    '6011000016',  350.00,    25.00, 5),
('CHIPS-PRINGLES', '6011000017', 1200.00,    15.00, 5),
('SAVON-LUX',      '6011000018',  450.00,    20.00, 6),
('ESSUIE-MAIN',    '6011000019',  800.00,    15.00, 6);

-- ============================================================
-- TABLE : produit_fournisseur
-- ============================================================
CREATE TABLE `produit_fournisseur` (
  `idProduit`     INT(11) NOT NULL,
  `idFournisseur` INT(11) NOT NULL,
  PRIMARY KEY (`idProduit`, `idFournisseur`),
  KEY `fk_pf_fournisseur` (`idFournisseur`),
  CONSTRAINT `fk_pf_produit`      FOREIGN KEY (`idProduit`)     REFERENCES `produits`     (`idProduit`)     ON DELETE CASCADE,
  CONSTRAINT `fk_pf_fournisseur`  FOREIGN KEY (`idFournisseur`) REFERENCES `fournisseurs` (`idFournisseur`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `produit_fournisseur` VALUES
(1,1),(2,1),(3,1),(4,1),
(5,2),(6,2),(7,2),(8,2),
(9,3),(10,3),(11,3),
(12,5),(13,5),
(14,4),(15,4),(16,4),(17,4),(18,4),(19,4);

-- ============================================================
-- TABLE : stocks
-- ============================================================
CREATE TABLE `stocks` (
  `idStock`          INT(11)       NOT NULL AUTO_INCREMENT,
  `quantiteInitiale` INT(11)       NOT NULL DEFAULT 0,
  `quantiteRestante` INT(11)       NOT NULL DEFAULT 0,
  `dateEntree`       DATE          NOT NULL,
  `dateExpiration`   DATE          DEFAULT NULL,
  `prixEnGros`       DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `prixAchat`        DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `idProduit`        INT(11)       NOT NULL,
  `created_at`       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`idStock`),
  KEY `fk_stock_produit` (`idProduit`),
  CONSTRAINT `fk_stock_produit` FOREIGN KEY (`idProduit`) REFERENCES `produits` (`idProduit`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `stocks` (`quantiteInitiale`, `quantiteRestante`, `dateEntree`, `dateExpiration`, `prixEnGros`, `prixAchat`, `idProduit`) VALUES
(5001, 4199, '2026-04-01', NULL,         620.00,   600.00,  1),
(2000,  900, '2026-04-01', NULL,         670.00,   650.00,  2),
(8000, 5998, '2026-04-01', NULL,         560.00,   540.00,  3),
(1000,  850, '2026-04-01', NULL,         380.00,   360.00,  4),
( 100,   76, '2026-03-15', '2028-03-15', 3800.00, 3600.00,  5),
(  50,   47, '2026-03-15', '2028-03-15',10500.00,10000.00,  6),
(  80,   45, '2026-03-15', '2028-03-15', 3200.00, 3000.00,  7),
(  83,   11, '2026-03-15', '2028-03-15', 1800.00, 1700.00,  8),
(  40,   32, '2026-02-10', NULL,         2800.00, 2500.00,  9),
(  35,   26, '2026-02-10', NULL,         3500.00, 3200.00, 10),
(  20,   15, '2026-02-10', NULL,         4500.00, 4200.00, 11),
( 200,  165, '2026-04-10', '2026-10-10',  300.00,  280.00, 12),
( 100,   80, '2026-04-10', '2026-10-10',  700.00,  650.00, 13),
( 150,  120, '2026-04-05', '2026-09-05',  450.00,  420.00, 14),
(  80,   59, '2026-04-05', '2026-08-05',  380.00,  350.00, 15),
( 100,   75, '2026-03-20', '2026-09-20',  250.00,  230.00, 16),
(  60,   45, '2026-03-20', '2026-08-20',  950.00,  900.00, 17),
(  80,   61, '2026-03-01', '2027-03-01',  350.00,  320.00, 18),
(  50,   38, '2026-03-01', '2027-03-01',  650.00,  600.00, 19);

-- ============================================================
-- TABLE : ventes
-- ============================================================
CREATE TABLE `ventes` (
  `idVente`           INT(11)       NOT NULL AUTO_INCREMENT,
  `dateVente`         TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `montantTotal`      DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `totalHorsTaxe`     DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `tva`               DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `totalTaxeComprise` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `modePaiement`      VARCHAR(20)   NOT NULL DEFAULT 'especes',
  `statut`            VARCHAR(20)   NOT NULL DEFAULT 'active',
  `idUtilisateur`     INT(11)       NOT NULL,
  `created_at`        TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`        TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`idVente`),
  KEY `fk_vente_utilisateur` (`idUtilisateur`),
  CONSTRAINT `fk_vente_utilisateur` FOREIGN KEY (`idUtilisateur`) REFERENCES `utilisateurs` (`idUtilisateur`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================================
-- TABLE : lignevente
-- ============================================================
CREATE TABLE `lignevente` (
  `idProduit`      INT(11)       NOT NULL,
  `idVente`        INT(11)       NOT NULL,
  `quantite`       INT(11)       NOT NULL DEFAULT 1,
  `totalPartielle` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`idProduit`, `idVente`),
  KEY `fk_lv_vente` (`idVente`),
  CONSTRAINT `fk_lv_produit` FOREIGN KEY (`idProduit`) REFERENCES `produits` (`idProduit`),
  CONSTRAINT `fk_lv_vente`   FOREIGN KEY (`idVente`)   REFERENCES `ventes`   (`idVente`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================================
-- TABLE : commandes
-- ============================================================
CREATE TABLE `commandes` (
  `idCommande`          INT(11)       NOT NULL AUTO_INCREMENT,
  `dateCommande`        DATE          NOT NULL,
  `dateLivraisonPrevue` DATE          DEFAULT NULL,
  `statut`              VARCHAR(20)   NOT NULL DEFAULT 'en_attente',
  `montantTotal`        DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `idLivraison`         INT(11)       DEFAULT NULL,
  `idUtilisateur`       INT(11)       NOT NULL,
  `created_at`          TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`          TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`idCommande`),
  KEY `fk_commande_utilisateur` (`idUtilisateur`),
  CONSTRAINT `fk_commande_utilisateur` FOREIGN KEY (`idUtilisateur`) REFERENCES `utilisateurs` (`idUtilisateur`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `commandes` (`dateCommande`, `dateLivraisonPrevue`, `statut`, `montantTotal`, `idUtilisateur`) VALUES
('2026-03-01', '2026-03-05', 'livree',    850000.00, 2),
('2026-03-15', '2026-03-20', 'livree',    320000.00, 2),
('2026-04-01', '2026-04-05', 'livree',    580000.00, 2),
('2026-04-10', '2026-04-15', 'en_attente',150000.00, 2);

-- ============================================================
-- TABLE : lignecommande
-- ============================================================
CREATE TABLE `lignecommande` (
  `idProduit`        INT(11)       NOT NULL,
  `idCommande`       INT(11)       NOT NULL,
  `quantiteCommande` INT(11)       NOT NULL DEFAULT 1,
  `quantiteRecu`     INT(11)       NOT NULL DEFAULT 0,
  `montantLigne`     DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`idProduit`, `idCommande`),
  KEY `fk_lc_commande` (`idCommande`),
  CONSTRAINT `fk_lc_produit`  FOREIGN KEY (`idProduit`)  REFERENCES `produits`  (`idProduit`),
  CONSTRAINT `fk_lc_commande` FOREIGN KEY (`idCommande`) REFERENCES `commandes` (`idCommande`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================================
-- TABLE : livraisons
-- ============================================================
CREATE TABLE `livraisons` (
  `idLivraison`  INT(11)       NOT NULL AUTO_INCREMENT,
  `dateLivraison`DATE          NOT NULL,
  `montantTotal` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `observations` VARCHAR(300)  DEFAULT NULL,
  `statut`       VARCHAR(20)   NOT NULL DEFAULT 'en_cours',
  `idCommande`   INT(11)       NOT NULL,
  `created_at`   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`idLivraison`),
  UNIQUE KEY `idCommande` (`idCommande`),
  CONSTRAINT `fk_livraison_commande` FOREIGN KEY (`idCommande`) REFERENCES `commandes` (`idCommande`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================================
-- TABLE : inventaires
-- ============================================================
CREATE TABLE `inventaires` (
  `idInventaire`      INT(11)      NOT NULL AUTO_INCREMENT,
  `dateInventaire`    DATE         NOT NULL,
  `quantiteTheorique` INT(11)      NOT NULL DEFAULT 0,
  `quantiteReelle`    INT(11)      NOT NULL DEFAULT 0,
  `observations`      VARCHAR(300) DEFAULT NULL,
  `statut`            VARCHAR(20)  NOT NULL DEFAULT 'en_cours',
  `idUtilisateur`     INT(11)      NOT NULL,
  `idStock`           INT(11)      NOT NULL,
  `created_at`        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`idInventaire`),
  KEY `fk_inventaire_utilisateur` (`idUtilisateur`),
  KEY `fk_inventaire_stock`       (`idStock`),
  CONSTRAINT `fk_inventaire_utilisateur` FOREIGN KEY (`idUtilisateur`) REFERENCES `utilisateurs` (`idUtilisateur`),
  CONSTRAINT `fk_inventaire_stock`       FOREIGN KEY (`idStock`)       REFERENCES `stocks`        (`idStock`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================================
-- TABLE : alertes
-- ============================================================
CREATE TABLE `alertes` (
  `idAlerte`      INT(11)      NOT NULL AUTO_INCREMENT,
  `type`          VARCHAR(20)  NOT NULL,
  `message`       VARCHAR(300) NOT NULL,
  `lue`           TINYINT(1)   NOT NULL DEFAULT 0,
  `niveauUrgence` ENUM('faible','moyen','critique') NOT NULL DEFAULT 'moyen',
  `idUtilisateur` INT(11)      NOT NULL,
  `idProduit`     INT(11)      NOT NULL,
  `created_at`    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`idAlerte`),
  KEY `fk_alerte_utilisateur` (`idUtilisateur`),
  KEY `fk_alerte_produit`     (`idProduit`),
  CONSTRAINT `fk_alerte_utilisateur` FOREIGN KEY (`idUtilisateur`) REFERENCES `utilisateurs` (`idUtilisateur`),
  CONSTRAINT `fk_alerte_produit`     FOREIGN KEY (`idProduit`)     REFERENCES `produits`     (`idProduit`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================================
-- TABLE : personal_access_tokens (Sanctum)
-- ============================================================
CREATE TABLE `personal_access_tokens` (
  `id`             BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `tokenable_type` VARCHAR(255)        NOT NULL,
  `tokenable_id`   BIGINT(20) UNSIGNED NOT NULL,
  `name`           TEXT                NOT NULL,
  `token`          VARCHAR(64)         NOT NULL,
  `abilities`      TEXT                DEFAULT NULL,
  `last_used_at`   TIMESTAMP           NULL DEFAULT NULL,
  `expires_at`     TIMESTAMP           NULL DEFAULT NULL,
  `created_at`     TIMESTAMP           NULL DEFAULT NULL,
  `updated_at`     TIMESTAMP           NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`, `tokenable_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TRIGGERS
-- ============================================================

DELIMITER ;;

-- Diminuer le stock + alerte si sous seuil
CREATE TRIGGER trg_after_lignevente_insert
AFTER INSERT ON lignevente
FOR EACH ROW
BEGIN
    UPDATE stocks s
    SET s.quantiteRestante = s.quantiteRestante - NEW.quantite
    WHERE s.idProduit = NEW.idProduit;

    INSERT INTO alertes (type, message, niveauUrgence, idUtilisateur, idProduit)
    SELECT
        'stock_faible',
        CONCAT('Stock faible pour le produit réf : ', p.reference,
               ' — Restant : ', s.quantiteRestante,
               ' / Seuil : ', p.seuilSecurite),
        CASE
            WHEN s.quantiteRestante = 0                          THEN 'critique'
            WHEN s.quantiteRestante <= p.seuilSecurite / 2       THEN 'critique'
            ELSE 'moyen'
        END,
        v.idUtilisateur,
        NEW.idProduit
    FROM produits p
    JOIN stocks s ON s.idProduit = p.idProduit
    JOIN ventes v ON v.idVente   = NEW.idVente
    WHERE p.idProduit = NEW.idProduit
      AND s.quantiteRestante <= p.seuilSecurite;
END;;

-- Recalculer les totaux HT/TVA/TTC de la vente
CREATE TRIGGER trg_update_vente_total
AFTER INSERT ON lignevente
FOR EACH ROW
BEGIN
    DECLARE v_total_ht DECIMAL(10,2);
    DECLARE v_tva_rate DECIMAL(5,2) DEFAULT 18.00;
    DECLARE v_tva      DECIMAL(10,2);
    DECLARE v_ttc      DECIMAL(10,2);

    SELECT COALESCE(SUM(totalPartielle), 0)
    INTO v_total_ht
    FROM lignevente
    WHERE idVente = NEW.idVente;

    SET v_tva = ROUND(v_total_ht * v_tva_rate / 100, 2);
    SET v_ttc = v_total_ht + v_tva;

    UPDATE ventes
    SET totalHorsTaxe     = v_total_ht,
        tva               = v_tva,
        totalTaxeComprise = v_ttc,
        montantTotal      = v_ttc
    WHERE idVente = NEW.idVente;
END;;

-- Alerte expiration à l'entrée d'un stock
CREATE TRIGGER trg_alerte_expiration
AFTER INSERT ON stocks
FOR EACH ROW
BEGIN
    IF NEW.dateExpiration IS NOT NULL
       AND NEW.dateExpiration <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN
        INSERT INTO alertes (type, message, niveauUrgence, idUtilisateur, idProduit)
        SELECT
            'expiration',
            CONCAT('Produit expire dans moins de 30 jours — Réf : ',
                   p.reference, ' — Date : ', NEW.dateExpiration),
            CASE
                WHEN NEW.dateExpiration <= DATE_ADD(CURDATE(), INTERVAL 7 DAY) THEN 'critique'
                ELSE 'moyen'
            END,
            1,
            p.idProduit
        FROM produits p
        WHERE p.idProduit = NEW.idProduit;
    END IF;
END;;

-- Calcul automatique statut inventaire
CREATE TRIGGER trg_inventaire_statut_insert
BEFORE INSERT ON inventaires
FOR EACH ROW
BEGIN
    DECLARE v_qte INT DEFAULT 0;
    SELECT s.quantiteRestante INTO v_qte
    FROM stocks s
    WHERE s.idStock = NEW.idStock
    LIMIT 1;
    SET NEW.quantiteTheorique = v_qte;
    SET NEW.statut = CASE
        WHEN NEW.quantiteReelle = v_qte THEN 'conforme'
        WHEN NEW.quantiteReelle < v_qte THEN 'deficit'
        ELSE 'surplus'
    END;
END;;

-- Mise à jour stock à la réception d'une livraison
CREATE TRIGGER trg_after_livraison_insert
AFTER INSERT ON livraisons
FOR EACH ROW
BEGIN
    UPDATE stocks s
    JOIN lignecommande lc ON lc.idProduit = s.idProduit
    SET s.quantiteRestante = s.quantiteRestante + lc.quantiteRecu,
        s.dateEntree       = NEW.dateLivraison
    WHERE lc.idCommande = NEW.idCommande;

    UPDATE commandes
    SET statut      = 'livree',
        idLivraison = NEW.idLivraison
    WHERE idCommande = NEW.idCommande;
END;;

-- Mise à jour statut commande lors d'update livraison
CREATE TRIGGER trg_after_livraison_update
AFTER UPDATE ON livraisons
FOR EACH ROW
BEGIN
    UPDATE commandes
    SET statut = 'livree'
    WHERE idCommande = NEW.idCommande;
END;;

DELIMITER ;

-- ============================================================
-- PROCÉDURES STOCKÉES
-- ============================================================

DELIMITER ;;

CREATE PROCEDURE sp_ajouter_ligne_vente(
    IN p_idVente   INT,
    IN p_idProduit INT,
    IN p_quantite  INT
)
BEGIN
    DECLARE v_stock INT;
    DECLARE v_prix  DECIMAL(10,2);
    DECLARE v_total DECIMAL(10,2);
    DECLARE v_msg   VARCHAR(200);

    SELECT s.quantiteRestante, p.prixUnitaire
    INTO v_stock, v_prix
    FROM produits p
    JOIN stocks s ON s.idProduit = p.idProduit
    WHERE p.idProduit = p_idProduit
    LIMIT 1;

    IF v_stock < p_quantite THEN
        SET v_msg = CONCAT('Stock insuffisant. Disponible : ', v_stock, ' - Demande : ', p_quantite);
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = v_msg;
    ELSE
        SET v_total = v_prix * p_quantite;
        INSERT INTO lignevente (idProduit, idVente, quantite, totalPartielle)
        VALUES (p_idProduit, p_idVente, p_quantite, v_total);
        SELECT 'Ligne ajoutée avec succès' AS message;
    END IF;
END;;

CREATE PROCEDURE sp_creer_vente(
    IN p_idUtilisateur INT,
    IN p_modePaiement  VARCHAR(20)
)
BEGIN
    INSERT INTO ventes (dateVente, montantTotal, totalHorsTaxe, tva,
                        modePaiement, totalTaxeComprise, idUtilisateur)
    VALUES (NOW(), 0, 0, 0, p_modePaiement, 0, p_idUtilisateur);
    SELECT LAST_INSERT_ID() AS idVente;
END;;

CREATE PROCEDURE sp_etat_stock()
BEGIN
    SELECT
        p.idProduit,
        p.reference,
        c.libelle                                        AS categorie,
        s.quantiteRestante                               AS stock_actuel,
        p.seuilSecurite,
        s.dateExpiration,
        CASE
            WHEN s.quantiteRestante = 0                        THEN 'RUPTURE'
            WHEN s.quantiteRestante <= p.seuilSecurite         THEN 'CRITIQUE'
            WHEN s.quantiteRestante <= p.seuilSecurite * 1.5   THEN 'FAIBLE'
            ELSE 'OK'
        END                                              AS statut_stock,
        DATEDIFF(s.dateExpiration, CURDATE())            AS jours_avant_expiration
    FROM produits p
    JOIN stocks s     ON s.idProduit   = p.idProduit
    JOIN categories c ON c.idCategorie = p.idCategorie
    ORDER BY s.quantiteRestante ASC;
END;;

CREATE PROCEDURE sp_historique_produit(
    IN p_idProduit INT
)
BEGIN
    SELECT
        'ENTREE'                          AS type_mouvement,
        l.dateLivraison                   AS date_mouvement,
        lc.quantiteRecu                   AS quantite,
        f.nom                             AS source,
        NULL                              AS idVente
    FROM lignecommande lc
    JOIN commandes c         ON c.idCommande    = lc.idCommande
    JOIN livraisons l        ON l.idCommande    = c.idCommande
    JOIN produit_fournisseur pf ON pf.idProduit = p_idProduit
    JOIN fournisseurs f      ON f.idFournisseur = pf.idFournisseur
    WHERE lc.idProduit = p_idProduit

    UNION ALL

    SELECT
        'SORTIE'                          AS type_mouvement,
        DATE(v.dateVente)                 AS date_mouvement,
        lv.quantite                       AS quantite,
        CONCAT(u.prenom, ' ', u.nom)      AS source,
        lv.idVente
    FROM lignevente lv
    JOIN ventes v       ON v.idVente       = lv.idVente
    JOIN utilisateurs u ON u.idUtilisateur = v.idUtilisateur
    WHERE lv.idProduit = p_idProduit

    ORDER BY date_mouvement DESC;
END;;

CREATE PROCEDURE sp_rapport_ventes(
    IN p_dateDebut DATE,
    IN p_dateFin   DATE
)
BEGIN
    SELECT
        DATE(v.dateVente)             AS jour,
        COUNT(DISTINCT v.idVente)     AS nb_ventes,
        SUM(v.totalHorsTaxe)          AS total_ht,
        SUM(v.tva)                    AS total_tva,
        SUM(v.totalTaxeComprise)      AS total_ttc,
        CONCAT(u.prenom, ' ', u.nom)  AS caissier
    FROM ventes v
    JOIN utilisateurs u ON u.idUtilisateur = v.idUtilisateur
    WHERE DATE(v.dateVente) BETWEEN p_dateDebut AND p_dateFin
      AND v.statut = 'active'
    GROUP BY DATE(v.dateVente), v.idUtilisateur
    ORDER BY jour DESC;
END;;

CREATE PROCEDURE sp_top_produits(
    IN p_dateDebut DATE,
    IN p_dateFin   DATE,
    IN p_limite    INT
)
BEGIN
    SELECT
        p.idProduit,
        p.reference,
        c.libelle                      AS categorie,
        SUM(lv.quantite)               AS total_vendu,
        SUM(lv.totalPartielle)         AS chiffre_affaires,
        COUNT(DISTINCT lv.idVente)     AS nb_transactions
    FROM lignevente lv
    JOIN produits p   ON p.idProduit   = lv.idProduit
    JOIN categories c ON c.idCategorie = p.idCategorie
    JOIN ventes v     ON v.idVente     = lv.idVente
    WHERE DATE(v.dateVente) BETWEEN p_dateDebut AND p_dateFin
      AND v.statut = 'active'
    GROUP BY p.idProduit, p.reference, c.libelle
    ORDER BY total_vendu DESC
    LIMIT p_limite;
END;;

CREATE PROCEDURE sp_valeur_stock()
BEGIN
    SELECT
        c.libelle                                                  AS categorie,
        COUNT(p.idProduit)                                         AS nb_produits,
        SUM(s.quantiteRestante)                                    AS quantite_totale,
        SUM(s.quantiteRestante * s.prixAchat)                      AS valeur_achat,
        SUM(s.quantiteRestante * p.prixUnitaire)                   AS valeur_vente,
        SUM(s.quantiteRestante * (p.prixUnitaire - s.prixAchat))   AS marge_potentielle
    FROM produits p
    JOIN stocks s     ON s.idProduit   = p.idProduit
    JOIN categories c ON c.idCategorie = p.idCategorie
    GROUP BY c.idCategorie, c.libelle
    WITH ROLLUP;
END;;

DELIMITER ;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- FIN DU SCRIPT
-- ============================================================
