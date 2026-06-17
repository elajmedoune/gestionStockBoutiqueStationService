<?php

namespace App\Services;

use App\Models\Alerte;
use App\Models\Stock;
use App\Models\Produit;

class AlerteService
{
    public static function verifierStock(int $idProduit, int $idUtilisateur): void
    {
        $produit = Produit::find($idProduit);
        if (!$produit) return;

        $stockTotal = Stock::where('idProduit', $idProduit)->sum('quantiteRestante');
        $seuil = $produit->seuilSecurite ?? 5;

        if ($stockTotal > $seuil) return;

        $niveau = $stockTotal == 0 ? 'critique' : 'moyen';
        $message = $stockTotal == 0
            ? "Rupture de stock : {$produit->nomProduit}"
            : "Stock faible : {$produit->nomProduit} ({$stockTotal} restant(s))";

        // Récupérer un stock existant pour ce produit (pour idStock requis)
        $stock = Stock::where('idProduit', $idProduit)->first();
        if (!$stock) return;

        // Éviter les doublons : pas de nouvelle alerte non lue identique dans les dernières 24h
        $existeDeja = Alerte::where('idStock', $stock->idStock)
            ->where('type', 'stock_faible')
            ->where('lue', false)
            ->exists();

        if ($existeDeja) return;

        Alerte::create([
            'type'          => 'stock_faible',
            'message'       => $message,
            'niveauUrgence' => $niveau,
            'idStock'       => $stock->idStock,
            'idUtilisateur' => $idUtilisateur,
        ]);
    }
}