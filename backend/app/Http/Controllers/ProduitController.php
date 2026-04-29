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
        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('photos', 'public');
            $validated['photo'] = $path;
        }

        $validated = $request->validated();
        $produit = Produit::create($validated);
        return response()->json($produit, 201);
    }

    public function show($id)
    {
        $produit = Produit::with(['categorie', 'stocks', 'fournisseurs'])->findOrFail($id);
        return response()->json($produit, 200);
    }

    public function update(StoreProduitRequest $request, $id)
    {
        $produit = Produit::findOrFail($id);
        $produit->update($request->validated());
        return response()->json($produit, 200);
    }

    public function destroy($id)
    {
        $produit = Produit::findOrFail($id);
        $produit->delete();
        return response()->json(['message' => 'Produit supprime'], 200);
    }
}
