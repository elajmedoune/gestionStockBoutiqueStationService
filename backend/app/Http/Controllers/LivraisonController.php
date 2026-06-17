<?php

namespace App\Http\Controllers;

use App\Models\Livraison;
use App\Models\Commande;
use App\Models\Stock;
use App\Http\Resources\LivraisonResource;
use Illuminate\Http\Request;

class LivraisonController extends Controller
{
    public function index()
    {
        $livraisons = Livraison::with([
            'commande.utilisateur',
            'commande.lignes.produit',
            'commande.fournisseur',
            ])
            ->orderBy('dateLivraison', 'desc')
            ->get();
        return LivraisonResource::collection($livraisons);
    }

    public function store(Request $request)
    {
        $request->validate([
            'dateLivraison' => 'required|date',
            'montantTotal'  => 'nullable|numeric|min:0',
            'observations'  => 'nullable|string|max:300',
            'idCommande' => [
            'required',
            'integer',
            'exists:commandes,idCommande',
            \Illuminate\Validation\Rule::unique('livraisons', 'idCommande')
            ->whereNotIn('statut', ['annulee']),
            ],
            'statut'        => 'nullable|string|in:en_attente,livree,annulee',
        ]);
        $livraison = Livraison::create($request->only([
            'dateLivraison', 'montantTotal', 'observations', 'idCommande', 'statut'
            ]));

        if ($livraison->statut === 'livree') {
            $this->mettreAJourStock($livraison, $request->datesExpiration ?? []);
        }

        return new LivraisonResource($livraison->load([
            'commande.lignes.produit',
            'commande.fournisseur', 
        ]));
    }

    public function show($id)
    {
        $livraison = Livraison::with([
            'commande.utilisateur',
            'commande.lignes.produit',
        ])->findOrFail($id);
        return new LivraisonResource($livraison);
    }

    public function update(Request $request, $id)
{
    $livraison = Livraison::findOrFail($id);
    $request->validate([
        'dateLivraison' => 'sometimes|date',
        'montantTotal'  => 'sometimes|numeric|min:0',
        'observations'  => 'nullable|string|max:300',
        'statut'        => 'sometimes|string|in:en_attente,livree,annulee',
        'idCommande'    => 'sometimes|integer|exists:commandes,idCommande',
    ]);

    $statutAvant = $livraison->statut;

    $livraison->update($request->only([
        'dateLivraison', 'montantTotal', 'observations', 'statut', 'idCommande'
    ]));

    if ($livraison->statut === 'livree' && $statutAvant !== 'livree') {
        $this->mettreAJourStock($livraison, $request->datesExpiration ?? []);
    }

    return new LivraisonResource($livraison->load([
        'commande.lignes.produit',
        'commande.fournisseur',
    ]));
}

    /**
     * Crée une entrée de stock pour chaque ligne de la commande livrée.
     */
    private function mettreAJourStock(Livraison $livraison, array $datesExpiration = []): void
    {
        $commande = $livraison->commande()->with('lignes')->first();
        if (!$commande) {
            return;
        }

        foreach ($commande->lignes as $ligne) {
            $dateExpiration = $datesExpiration[$ligne->idProduit] ?? null;

            Stock::create([
                'idProduit'        => $ligne->idProduit,
                'quantiteInitiale' => $ligne->quantite,
                'quantiteRestante' => $ligne->quantite,
                'dateEntree'       => $livraison->dateLivraison,
                'dateExpiration'   => $dateExpiration ?: null,
                'prixEnGros'       => $ligne->prixUnitaire,
                'prixAchat'        => $ligne->prixUnitaire,
            ]);
        }

        $commande->update(['statut' => 'livree']);
    }

    public function destroy($id)
    {
        $livraison = Livraison::findOrFail($id);
        $livraison->delete();
        return response()->json(['message' => 'Livraison supprimée']);
    }

    public function saveDatesExpiration(Request $request, $id)
    {
        // Conservé pour compatibilité : les dates d'expiration sont en réalité
        // appliquées aux stocks créés lors du passage au statut "livree" (cf. update()).
        Livraison::findOrFail($id);
        return response()->json(['message' => 'Dates sauvegardées']);
    }
}