<?php

namespace App\Http\Controllers;

use App\Models\Livraison;
use App\Http\Resources\LivraisonResource;
use Illuminate\Http\Request;

class LivraisonController extends Controller
{
    public function index()
    {
        $livraisons = Livraison::with(['commande.utilisateur'])
                               ->orderBy('dateLivraison', 'desc')
                               ->get();
        return LivraisonResource::collection($livraisons);
    }

    public function store(Request $request)
    {
        $request->validate([
            'dateLivraison' => 'required|date',
            'montantTotal'  => 'required|numeric|min:0',
            'observations'  => 'nullable|string|max:300',
            'idCommande' => 'required|integer|exists:commande,idCommande|unique:livraison,idCommande',
        ]);
        $livraison = Livraison::create($request->all());
        return new LivraisonResource($livraison->load(['commande']));
    }

    public function show($id)
    {
        $livraison = Livraison::with(['commande.utilisateur'])->findOrFail($id);
        return new LivraisonResource($livraison);
    }

    public function update(Request $request, $id)
    {
        $livraison = Livraison::findOrFail($id);
        $request->validate([
            'dateLivraison' => 'sometimes|date',
            'montantTotal'  => 'sometimes|numeric|min:0',
            'observations'  => 'nullable|string|max:300',
        ]);
        $livraison->update($request->all());
        return new LivraisonResource($livraison);
    }

    public function destroy($id)
    {
        $livraison = Livraison::findOrFail($id);
        $livraison->delete();
        return response()->json(['message' => 'Livraison supprimée']);
    }
}