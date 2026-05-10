<?php

namespace App\Http\Controllers;

use App\Models\Produit;
use App\Http\Requests\StoreProduitRequest;

class ProduitController extends Controller
{
    public function index()
    {
        return response()->json(
            Produit::with(['categorie', 'stocks', 'fournisseurs'])->get(), 200
        );
    }

    public function store(StoreProduitRequest $request)
    {
        $validated = $request->validated();

        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('photos', 'public');
            $validated['photo'] = $path;
        }

        // $validated = $request->validated();
       $produit = Produit::create([
            'nomProduit'    => $validated['nomProduit'] ?? null,
            'reference'     => $validated['reference'],
            'codeBarre'     => $validated['codeBarre'] ?? null,
            'photo'         => $validated['photo'] ?? null,
            'prixUnitaire'  => (float) $validated['prixUnitaire'],
            'seuilSecurite' => (int) $validated['seuilSecurite'],
            'idCategorie'   => (int) $validated['idCategorie'],
        ]);

        // Création automatique du stock initial
        if ($request->filled('quantiteInitiale') && $request->quantiteInitiale > 0) {
            \App\Models\Stock::create([
                'idProduit'        => $produit->idProduit,
                'quantiteInitiale' => (int)  $request->quantiteInitiale,
                'quantiteRestante' => (int)  $request->quantiteInitiale,
                'dateEntree'       => now()->toDateString(),
                'prixAchat'        => 0,
                'prixEnGros'       => 0,
            ]);
        }
    
        return response()->json($produit->load(['categorie', 'stocks', 'fournisseurs']), 201);
    }

    public function show($id)
    {
        $produit = Produit::with(['categorie', 'stocks', 'fournisseurs'])->findOrFail($id);
        return response()->json($produit, 200);
    }

    public function update(StoreProduitRequest $request, $id)
    {
        $produit = Produit::findOrFail($id);

        $validated = $request->validated();

        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('photos', 'public');
            $validated['photo'] = $path;
        }

        $produit->update([
            'nomProduit'    => $validated['nomProduit'] ?? $produit->nomProduit,
            'reference'     => $validated['reference'],
            'codeBarre'     => $validated['codeBarre'] ?? null,
            'photo'         => $validated['photo'] ?? $produit->photo,
            'prixUnitaire'  => (float) $validated['prixUnitaire'],
            'seuilSecurite' => (float) $validated['seuilSecurite'],
            'idCategorie'   => (int) $validated['idCategorie'],
        ]);

        return response()->json($produit, 200);
    }

    public function destroy($id)
    {
        $produit = Produit::findOrFail($id);
        $produit->delete();
        return response()->json(['message' => 'Produit supprime'], 200);
    }
}
