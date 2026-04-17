<?php

namespace App\Http\Controllers;

use App\Models\Fournisseur;
use App\Http\Requests\StoreFournisseurRequest;

class FournisseurController extends Controller
{
    public function index()
    {
        return response()->json(Fournisseur::with('produits')->get(), 200);
    }

    public function store(StoreFournisseurRequest $request)
    {
        $fournisseur = Fournisseur::create($request->validated());
        return response()->json($fournisseur, 201);
    }

    public function show($id)
    {
        $fournisseur = Fournisseur::with('produits')->findOrFail($id);
        return response()->json($fournisseur, 200);
    }

    public function update(StoreFournisseurRequest $request, $id)
    {
        $fournisseur = Fournisseur::findOrFail($id);
        $fournisseur->update($request->validated());
        return response()->json($fournisseur, 200);
    }

    public function destroy($id)
    {
        $fournisseur = Fournisseur::findOrFail($id);
        $fournisseur->delete();
        return response()->json(['message' => 'Fournisseur supprime'], 200);
    }
}
