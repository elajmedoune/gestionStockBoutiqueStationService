<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Index de performance + triggers métier manquants (jamais créés par les
     * migrations Laravel — seul gestion_stock.sql les documentait).
     *
     * Volontairement exclus : trg_after_livraison_insert / trg_after_livraison_update.
     * Ils incrémentent un stock existant par idProduit, ce qui ferait doublon avec
     * LivraisonController qui crée un nouveau lot de stock par livraison (gestion
     * des dates d'expiration par lot).
     */
    public function up(): void
    {
        // ── Index de performance (idempotent : la première tentative a été
        //    interrompue par un crash MySQL en plein milieu) ──────────────
        DB::unprepared('ALTER TABLE `alertes`     ADD INDEX IF NOT EXISTS `idx_alertes_lue`        (`lue`)');
        DB::unprepared('ALTER TABLE `alertes`     ADD INDEX IF NOT EXISTS `idx_alertes_urgence`    (`niveauUrgence`)');
        DB::unprepared('ALTER TABLE `alertes`     ADD INDEX IF NOT EXISTS `idx_alertes_created`    (`created_at`)');
        DB::unprepared('ALTER TABLE `alertes`     ADD INDEX IF NOT EXISTS `idx_alertes_lue_urg`    (`lue`, `niveauUrgence`)');
        DB::unprepared('ALTER TABLE `ventes`      ADD INDEX IF NOT EXISTS `idx_ventes_date`        (`dateVente`)');
        DB::unprepared('ALTER TABLE `ventes`      ADD INDEX IF NOT EXISTS `idx_ventes_statut`      (`statut`)');
        DB::unprepared('ALTER TABLE `stocks`      ADD INDEX IF NOT EXISTS `idx_stocks_dateentree`  (`dateEntree`)');
        DB::unprepared('ALTER TABLE `stocks`      ADD INDEX IF NOT EXISTS `idx_stocks_restante`    (`quantiteRestante`)');
        DB::unprepared('ALTER TABLE `inventaires` ADD INDEX IF NOT EXISTS `idx_inventaires_date`   (`dateInventaire`)');
        DB::unprepared('ALTER TABLE `inventaires` ADD INDEX IF NOT EXISTS `idx_inventaires_statut` (`statut`)');

        // ── Trigger : décrémente le stock (FIFO multi-lots) + alerte stock faible ──
        DB::unprepared('DROP TRIGGER IF EXISTS trg_after_lignevente_insert');
        DB::unprepared('
CREATE TRIGGER trg_after_lignevente_insert
AFTER INSERT ON lignevente
FOR EACH ROW
BEGIN
    DECLARE v_qte_restante INT DEFAULT NEW.quantite;
    DECLARE v_idStock      INT;
    DECLARE v_dispo        INT;
    DECLARE v_done         INT DEFAULT 0;

    DECLARE cur_lots CURSOR FOR
        SELECT idStock, quantiteRestante
        FROM stocks
        WHERE idProduit = NEW.idProduit AND quantiteRestante > 0
        ORDER BY dateEntree ASC;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = 1;

    OPEN cur_lots;
    boucle_fifo: LOOP
        FETCH cur_lots INTO v_idStock, v_dispo;
        IF v_done = 1 OR v_qte_restante <= 0 THEN
            LEAVE boucle_fifo;
        END IF;

        IF v_dispo >= v_qte_restante THEN
            UPDATE stocks SET quantiteRestante = quantiteRestante - v_qte_restante WHERE idStock = v_idStock;
            SET v_qte_restante = 0;
        ELSE
            UPDATE stocks SET quantiteRestante = 0 WHERE idStock = v_idStock;
            SET v_qte_restante = v_qte_restante - v_dispo;
        END IF;
    END LOOP;
    CLOSE cur_lots;

    INSERT INTO alertes (type, message, niveauUrgence, idUtilisateur, idStock)
    SELECT
        \'stock_faible\',
        CONCAT(\'Stock faible — Réf : \', p.reference,
               \' — Restant : \', s.quantiteRestante,
               \' / Seuil : \', p.seuilSecurite),
        CASE
            WHEN s.quantiteRestante = 0                    THEN \'critique\'
            WHEN s.quantiteRestante <= p.seuilSecurite / 2 THEN \'critique\'
            ELSE \'moyen\'
        END,
        v.idUtilisateur,
        s.idStock
    FROM produits p
    JOIN stocks s ON s.idProduit = p.idProduit
    JOIN ventes v ON v.idVente   = NEW.idVente
    WHERE p.idProduit = NEW.idProduit
      AND s.quantiteRestante <= p.seuilSecurite;
END
        ');

        // ── Trigger : recalcule totaux HT/TVA/TTC de la vente (redondant avec le
        //    calcul PHP de VenteController, conservé pour la cohérence avec le
        //    design SQL d'origine — les deux calculs donnent le même résultat) ──
        DB::unprepared('DROP TRIGGER IF EXISTS trg_update_vente_total');
        DB::unprepared('
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
END
        ');

        // ── Trigger : alerte expiration à l'entrée d'un nouveau lot de stock ──
        DB::unprepared('DROP TRIGGER IF EXISTS trg_alerte_expiration');
        DB::unprepared('
CREATE TRIGGER trg_alerte_expiration
AFTER INSERT ON stocks
FOR EACH ROW
BEGIN
    IF NEW.dateExpiration IS NOT NULL
       AND NEW.dateExpiration <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN
        INSERT INTO alertes (type, message, niveauUrgence, idUtilisateur, idStock)
        SELECT
            \'expiration\',
            CONCAT(\'Produit expire dans moins de 30 jours — Réf : \',
                   p.reference, \' — Date : \', NEW.dateExpiration),
            CASE
                WHEN NEW.dateExpiration <= DATE_ADD(CURDATE(), INTERVAL 7 DAY) THEN \'critique\'
                ELSE \'moyen\'
            END,
            1,
            NEW.idStock
        FROM produits p
        WHERE p.idProduit = NEW.idProduit;
    END IF;
END
        ');

        // ── Trigger : calcul automatique statut inventaire (redondant avec le
        //    calcul PHP de InventaireController, conservé en filet de sécurité) ──
        DB::unprepared('DROP TRIGGER IF EXISTS trg_inventaire_statut_insert');
        DB::unprepared('
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
        WHEN NEW.quantiteReelle = v_qte THEN \'conforme\'
        WHEN NEW.quantiteReelle < v_qte THEN \'deficit\'
        ELSE \'surplus\'
    END;
END
        ');

        // ── Procédure : ajouter ligne vente (FIFO) — référence, non appelée par
        //    l\'app (VenteController fait l\'équivalent via Eloquent + le trigger) ──
        DB::unprepared('DROP PROCEDURE IF EXISTS sp_ajouter_ligne_vente');
        DB::unprepared('
CREATE PROCEDURE sp_ajouter_ligne_vente(
    IN p_idVente   INT,
    IN p_idProduit INT,
    IN p_quantite  INT
)
BEGIN
    DECLARE v_stock_total  INT;
    DECLARE v_prix         DECIMAL(10,2);
    DECLARE v_total        DECIMAL(10,2);
    DECLARE v_msg          VARCHAR(200);
    DECLARE v_qte_restante INT;
    DECLARE v_idStock      INT;

    SELECT SUM(s.quantiteRestante), p.prixUnitaire
    INTO v_stock_total, v_prix
    FROM produits p
    JOIN stocks s ON s.idProduit = p.idProduit
    WHERE p.idProduit = p_idProduit;

    IF v_stock_total < p_quantite THEN
        SET v_msg = CONCAT(\'Stock insuffisant. Disponible : \', v_stock_total, \' — Demandé : \', p_quantite);
        SIGNAL SQLSTATE \'45000\' SET MESSAGE_TEXT = v_msg;
    ELSE
        SET v_qte_restante = p_quantite;
        WHILE v_qte_restante > 0 DO
            SELECT idStock, quantiteRestante
            INTO v_idStock, v_stock_total
            FROM stocks
            WHERE idProduit = p_idProduit AND quantiteRestante > 0
            ORDER BY dateEntree ASC
            LIMIT 1;

            IF v_stock_total >= v_qte_restante THEN
                UPDATE stocks SET quantiteRestante = quantiteRestante - v_qte_restante WHERE idStock = v_idStock;
                SET v_qte_restante = 0;
            ELSE
                UPDATE stocks SET quantiteRestante = 0 WHERE idStock = v_idStock;
                SET v_qte_restante = v_qte_restante - v_stock_total;
            END IF;
        END WHILE;

        SET v_total = v_prix * p_quantite;
        INSERT INTO lignevente (idProduit, idVente, quantite, totalPartielle)
        VALUES (p_idProduit, p_idVente, p_quantite, v_total);
        SELECT \'Ligne ajoutée avec succès\' AS message;
    END IF;
END
        ');

        // ── Procédure : créer une vente — référence, non appelée par l\'app ──
        DB::unprepared('DROP PROCEDURE IF EXISTS sp_creer_vente');
        DB::unprepared('
CREATE PROCEDURE sp_creer_vente(
    IN p_idUtilisateur INT,
    IN p_modePaiement  VARCHAR(20)
)
BEGIN
    INSERT INTO ventes (dateVente, montantTotal, totalHorsTaxe, tva, modePaiement, totalTaxeComprise, idUtilisateur)
    VALUES (NOW(), 0, 0, 0, p_modePaiement, 0, p_idUtilisateur);
    SELECT LAST_INSERT_ID() AS idVente;
END
        ');
    }

    public function down(): void
    {
        foreach (['trg_after_lignevente_insert', 'trg_update_vente_total', 'trg_alerte_expiration', 'trg_inventaire_statut_insert'] as $t) {
            DB::unprepared("DROP TRIGGER IF EXISTS {$t}");
        }
        foreach (['sp_ajouter_ligne_vente', 'sp_creer_vente'] as $p) {
            DB::unprepared("DROP PROCEDURE IF EXISTS {$p}");
        }

        DB::unprepared('ALTER TABLE `alertes`     DROP INDEX `idx_alertes_lue`');
        DB::unprepared('ALTER TABLE `alertes`     DROP INDEX `idx_alertes_urgence`');
        DB::unprepared('ALTER TABLE `alertes`     DROP INDEX `idx_alertes_created`');
        DB::unprepared('ALTER TABLE `alertes`     DROP INDEX `idx_alertes_lue_urg`');
        DB::unprepared('ALTER TABLE `ventes`      DROP INDEX `idx_ventes_date`');
        DB::unprepared('ALTER TABLE `ventes`      DROP INDEX `idx_ventes_statut`');
        DB::unprepared('ALTER TABLE `stocks`      DROP INDEX `idx_stocks_dateentree`');
        DB::unprepared('ALTER TABLE `stocks`      DROP INDEX `idx_stocks_restante`');
        DB::unprepared('ALTER TABLE `inventaires` DROP INDEX `idx_inventaires_date`');
        DB::unprepared('ALTER TABLE `inventaires` DROP INDEX `idx_inventaires_statut`');
    }
};
