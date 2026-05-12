<?php

namespace App\Http\Controllers;

use App\Models\Commande;
use App\Http\Resources\CommandeResource;
use Illuminate\Http\Request;

class CommandeController extends Controller
{
    public function index()
{
    $commandes = Commande::with(['utilisateur', 'livraison', 'lignes.produit', 'fournisseur'])
                         ->orderBy('dateCommande', 'desc')
                         ->get();
    return CommandeResource::collection($commandes);
}

    public function store(Request $request)
{
    $request->validate([
        'dateCommande'          => 'required|date',
        'dateLivraisonPrevue'   => 'nullable|date',
        'montantTotal'          => 'required|numeric|min:0',
        'idFournisseur'         => 'required|integer|exists:fournisseurs,idFournisseur',
        'lignes'                => 'required|array|min:1',
        'lignes.*.idProduit'    => 'required|integer|exists:produits,idProduit',
        'lignes.*.quantite'     => 'required|integer|min:1',
        'lignes.*.prixUnitaire' => 'required|numeric|min:0',
    ]);

    $commande = Commande::create([
        'dateCommande'        => $request->dateCommande,
        'dateLivraisonPrevue' => $request->dateLivraisonPrevue,
        'montantTotal'        => $request->montantTotal,
        'idUtilisateur'       => $request->user()->idUtilisateur,
        'idFournisseur'       => $request->idFournisseur,
        'statut'              => 'en_attente',
    ]);

    foreach ($request->lignes as $ligne) {
        $commande->lignes()->create([
            'idProduit'    => $ligne['idProduit'],
            'quantite'     => $ligne['quantite'],
            'prixUnitaire' => $ligne['prixUnitaire'],
            'sousTotal'    => $ligne['quantite'] * $ligne['prixUnitaire'],
        ]);
    }

    return new CommandeResource($commande->load(['utilisateur', 'lignes.produit', 'fournisseur']));
}

    public function show($id)
{
    $commande = Commande::with(['utilisateur', 'livraison', 'lignes.produit', 'fournisseur'])
                        ->findOrFail($id);
    return new CommandeResource($commande);
}
    public function update(Request $request, $id)
{
    $commande = Commande::findOrFail($id);
    $request->validate([
        'statut'         => 'sometimes|string|max:20',
        'montantTotal'   => 'sometimes|numeric|min:0',
        'idFournisseur'  => 'sometimes|integer|exists:fournisseurs,idFournisseur',
    ]);
    $commande->update($request->only(['statut', 'montantTotal', 'idFournisseur', 'dateLivraisonPrevue']));
    return new CommandeResource($commande->load(['utilisateur', 'livraison', 'lignes.produit', 'fournisseur']));
}

    public function destroy($id)
    {
        $commande = Commande::findOrFail($id);
        $commande->delete();
        return response()->json(['message' => 'Commande supprimée']);
    }
}