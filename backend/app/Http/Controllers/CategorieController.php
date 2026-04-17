<?php

namespace App\Http\Controllers;

use App\Models\Categorie;
use App\Http\Requests\StoreCategorieRequest;

class CategorieController extends Controller
{
    public function index()
    {
        return response()->json(Categorie::with('produits')->get(), 200);
    }

    public function store(StoreCategorieRequest $request)
    {
        $categorie = Categorie::create($request->validated());
        return response()->json($categorie, 201);
    }

    public function show($id)
    {
        $categorie = Categorie::with('produits')->findOrFail($id);
        return response()->json($categorie, 200);
    }

    public function update(StoreCategorieRequest $request, $id)
    {
        $categorie = Categorie::findOrFail($id);
        $categorie->update($request->validated());
        return response()->json($categorie, 200);
    }

    public function destroy($id)
    {
        $categorie = Categorie::findOrFail($id);
        $categorie->delete();
        return response()->json(['message' => 'Categorie supprimee'], 200);
    }
}
