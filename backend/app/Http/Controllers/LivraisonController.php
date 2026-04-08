<?php

namespace App\Http\Controllers;

use App\Models\Livraison;
use App\Http\Resources\LivraisonResource;
use Illuminate\Http\Request;

class LivraisonController extends Controller
{
    // GET /api/livraisons
    public function index()
    {
        $livraisons = Livraison::with(['commande.fournisseur', 'commande.produit'])
                               ->orderBy('dateLivraison', 'desc')
                               ->get();

        return LivraisonResource::collection($livraisons);
    }

    // POST /api/livraisons
    public function store(Request $request)
    {
        $request->validate([
            'dateLivraison' => 'required|date',
            'montantTotal'  => 'required|numeric|min:0',
            'observations'  => 'nullable|string|max:300',
            'IdCommande'    => 'required|integer|exists:Commande,IdCommande|unique:Livraison,IdCommande',
        ]);

        // Le trigger met à jour le stock et le statut commande automatiquement
        $livraison = Livraison::create($request->all());

        return new LivraisonResource($livraison->load(['commande.fournisseur']));
    }

    // GET /api/livraisons/{id}
    public function show($id)
    {
        $livraison = Livraison::with(['commande.fournisseur', 'commande.produit'])
                              ->findOrFail($id);

        return new LivraisonResource($livraison);
    }

    // PUT /api/livraisons/{id}
    public function update(Request $request, $id)
    {
        $livraison = Livraison::findOrFail($id);

        $request->validate([
            'dateLivraison' => 'sometimes|date',
            'montantTotal'  => 'sometimes|numeric|min:0',
            'observations'  => 'nullable|string|max:300',
        ]);

        $livraison->update($request->all());

        return new LivraisonResource($livraison->load(['commande']));
    }

    // DELETE /api/livraisons/{id}
    public function destroy($id)
    {
        $livraison = Livraison::findOrFail($id);
        $livraison->delete();

        return response()->json(['message' => 'Livraison supprimée']);
    }
}