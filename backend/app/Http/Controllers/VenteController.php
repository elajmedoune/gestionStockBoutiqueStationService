<?php

namespace App\Http\Controllers;

use App\Models\Vente;
use App\Models\LigneVente;
use App\Http\Resources\VenteResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class VenteController extends Controller
{
public function index(Request $request)
{
    $user = $request->user();

    $query = Vente::with(['utilisateur', 'lignes.produit.stocks'])
                  ->orderBy('dateVente', 'desc');

    if ($user->role === 'caissier') {
        $query->where('idUtilisateur', $user->idUtilisateur);
    }

    return VenteResource::collection($query->get());
}

    public function store(Request $request)
{
    $request->validate([
        'modePaiement' => 'required|in:especes,carte,orange_money,wave,free_money',
        'lignes'             => 'required|array|min:1',
        'lignes.*.idProduit' => 'required|integer|exists:produits,idProduit',
        'lignes.*.quantite'  => 'required|integer|min:1',
    ]);

    DB::beginTransaction();
    try {
        // Vérifier le stock disponible pour chaque produit AVANT de créer la vente
        foreach ($request->lignes as $ligne) {
            $stockTotal = \App\Models\Stock::where('idProduit', $ligne['idProduit'])
                ->where('quantiteRestante', '>', 0)
                ->sum('quantiteRestante');

            if ($stockTotal < $ligne['quantite']) {
                $produit = \App\Models\Produit::find($ligne['idProduit']);
                $nomProduit = $produit->nomProduit ?? $produit->reference;
                throw new \Exception("Stock insuffisant pour \"{$nomProduit}\". Disponible : {$stockTotal}");
            }
        }

        $vente = Vente::create([
            'modePaiement'  => $request->modePaiement,
            'idUtilisateur' => $request->user()->idUtilisateur,
            'statut'        => 'validee',
        ]);
        $montantTotal = 0;

        foreach ($request->lignes as $ligne) {
            $produit = \App\Models\Produit::find($ligne['idProduit']);
            $prixUnitaire = $produit->prixUnitaire ?? 0;
            $sousTotal = $prixUnitaire * $ligne['quantite'];
            $montantTotal += $sousTotal;

            LigneVente::create([
                'idVente'        => $vente->idVente,
                'idProduit'      => $ligne['idProduit'],
                'quantite'       => $ligne['quantite'],
                'totalPartielle' => $sousTotal,
            ]);
            // Le trigger FIFO s'occupe de décrémenter le stock
        }

        $tva = round($montantTotal * 0.18, 2);
        $vente->montantTotal      = $montantTotal;
        $vente->totalHorsTaxe     = $montantTotal;
        $vente->tva               = $tva;
        $vente->totalTaxeComprise = $montantTotal + $tva;
        $vente->statut            = 'validee';
        $vente->save();

        DB::commit();
        $vente->refresh();
        return new VenteResource($vente->load(['utilisateur', 'lignes']));

    } catch (\Exception $e) {
        DB::rollBack();
        return response()->json(['message' => $e->getMessage()], 422);
    }
}

    public function show(int $id)
    {
        $vente = Vente::with(['utilisateur', 'lignes.produit.stocks'])->findOrFail($id);
        return new VenteResource($vente);
    }

    public function destroy(int $id)
    {
        $vente = Vente::with('lignes')->findOrFail($id);

        if ($vente->statut === 'annulee') {
            return response()->json(['message' => 'Vente déjà annulée'], 400);
        }

        foreach ($vente->lignes as $ligne) {
            $stock = \App\Models\Stock::where('idProduit', $ligne->idProduit)->first();
            if ($stock) {
                $stock->quantiteRestante += $ligne->quantite;
                $stock->save();
            }
        }

        $vente->statut = 'annulee';
        $vente->save();

        return response()->json(['message' => 'Vente annulée']);
    }
}