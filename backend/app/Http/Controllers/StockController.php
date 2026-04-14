<?php

namespace App\Http\Controllers;

use App\Models\Stock;
use Illuminate\Http\Requests\StoreStockRequest;

class StockController extends Controller
{
    public function index()
    {
        return response()->json(Stock::with('produit')->get(), 200);
    }

    public function store(StoreStockRequest $request)
    {
        $stock = Stock::create($request->validated());
        return response()->json($stock, 201);
    }

    public function show($id)
    {
        $stock = Stock::with('produit')->findOrFail($id);
        return response()->json($stock, 200);
    }

    public function update(StoreStockRequest $request, $id)
    {
        $stock = Stock::findOrFail($id);
        $stock->update($request->validated());
        return response()->json(stock, 200);
    }

    public function destroy($id)
    {
        $stock = Stock::findOrFail($id);
        $stock->delete();
        return response()->json(['message' => 'Stock supprime'], 200);
    }
}
