<?php

namespace App\Http\Controllers;

use App\Models\Commande;
use App\Http\Resources\CommandeResource;
use Illuminate\Http\Request;

class CommandeController extends Controller
{
    // GET /api/commandes
    public function index()
    {
        $commandes = Commande::with(['fournisseur', 'produit', 'livraison'])
                             ->orderBy('dateCommande', 'desc')
                             ->get();

        return CommandeResource::collection($commandes);
    }

    // POST /api/commandes
    public function store(Request $request)
    {
        $request->validate([
            'dateCommande'        => 'required|date',
            'dateLivraisonPrevue' => 'nullable|date|after_or_equal:dateCommande',
            'montantTotal'        => 'required|numeric|min:0',
            'IdFournisseur'       => 'required|integer|exists:Fournisseur,IdFournisseur',
            'IdProduit'           => 'required|integer|exists:Produit,IdProduit',
        ]);

        $commande = Commande::create($request->all());

        return new CommandeResource($commande->load(['fournisseur', 'produit']));
    }

    // GET /api/commandes/{id}
    public function show($id)
    {
        $commande = Commande::with(['fournisseur', 'produit', 'livraison'])
                            ->findOrFail($id);

        return new CommandeResource($commande);
    }

    // PUT /api/commandes/{id}
    public function update(Request $request, $id)
    {
        $commande = Commande::findOrFail($id);

        $request->validate([
            'dateCommande'        => 'sometimes|date',
            'dateLivraisonPrevue' => 'nullable|date',
            'statut'              => 'sometimes|string|max:20',
            'montantTotal'        => 'sometimes|numeric|min:0',
            'IdFournisseur'       => 'sometimes|integer|exists:Fournisseur,IdFournisseur',
            'IdProduit'           => 'sometimes|integer|exists:Produit,IdProduit',
        ]);

        $commande->update($request->all());

        return new CommandeResource($commande->load(['fournisseur', 'produit']));
    }

    // DELETE /api/commandes/{id}
    public function destroy($id)
    {
        $commande = Commande::findOrFail($id);
        $commande->delete();

        return response()->json(['message' => 'Commande supprimée']);
    }
}