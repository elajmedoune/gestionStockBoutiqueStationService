<?php

namespace App\Http\Controllers;

use App\Models\Livraison;
use App\Models\Commande;
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
            if ($request->datesExpiration) {
            foreach ($request->datesExpiration as $idProduit => $dateExpiration) {
            \App\Models\LigneCommande::where('idCommande', $request->idCommande)
            ->where('idProduit', $idProduit)
            ->update(['dateExpiration' => $dateExpiration ?: null]);
            }
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
    $livraison->update($request->only([
        'dateLivraison', 'montantTotal', 'observations', 'statut', 'idCommande'
    ]));
    return new LivraisonResource($livraison->load([
        'commande.lignes.produit',
        'commande.fournisseur',
    ]));
}

    public function destroy($id)
    {
        $livraison = Livraison::findOrFail($id);
        $livraison->delete();
        return response()->json(['message' => 'Livraison supprimée']);
    }

    public function saveDatesExpiration(Request $request, $id)
    {
    $livraison = Livraison::findOrFail($id);
    if ($request->datesExpiration) {
        foreach ($request->datesExpiration as $idProduit => $dateExpiration) {
            \App\Models\LigneCommande::where('idCommande', $livraison->idCommande)
                ->where('idProduit', $idProduit)
                ->update(['dateExpiration' => $dateExpiration ?: null]);
        }
    }
    return response()->json(['message' => 'Dates sauvegardées']);
    }
}