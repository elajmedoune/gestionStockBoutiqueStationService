<?php

namespace App\Http\Controllers;

use App\Models\Commande;
use App\Http\Resources\CommandeResource;
use Illuminate\Http\Request;

class CommandeController extends Controller
{
    public function index()
    {
        $commandes = Commande::with(['utilisateur', 'livraison', 'lignes'])
                             ->orderBy('dateCommande', 'desc')
                             ->get();
        return CommandeResource::collection($commandes);
    }

    public function store(Request $request)
    {
        $request->validate([
            'dateCommande'        => 'required|date',
            'dateLivraisonPrevue' => 'nullable|date',
            'montantTotal'        => 'required|numeric|min:0',
            'idUtilisateur'       => 'required|integer|exists:Utilisateur,idUtilisateur',
        ]);
        $commande = Commande::create($request->all());
        return new CommandeResource($commande->load(['utilisateur']));
    }

    public function show($id)
    {
        $commande = Commande::with(['utilisateur', 'livraison', 'lignes'])
                            ->findOrFail($id);
        return new CommandeResource($commande);
    }

    public function update(Request $request, $id)
    {
        $commande = Commande::findOrFail($id);
        $request->validate([
            'statut'       => 'sometimes|string|max:20',
            'montantTotal' => 'sometimes|numeric|min:0',
        ]);
        $commande->update($request->all());
        return new CommandeResource($commande);
    }

    public function destroy($id)
    {
        $commande = Commande::findOrFail($id);
        $commande->delete();
        return response()->json(['message' => 'Commande supprimée']);
    }
}