<?php

namespace App\Http\Controllers;

use App\Models\Alerte;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AlerteController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Alerte::with(['utilisateur', 'stock.produit']);

        if ($request->filled('lue')) {
            $query->where('lue', filter_var($request->lue, FILTER_VALIDATE_BOOLEAN));
        }
        if ($request->filled('niveauUrgence')) {
            $query->where('niveauUrgence', $request->niveauUrgence);
        }
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }
        if ($request->filled('idStock')) {
            $query->where('idStock', $request->idStock);
        }

        $user = $request->user();
        if ($user->role === 'caissier') {
            $query->where('idUtilisateur', $user->idUtilisateur);
        }

        $alertes = $query->orderBy('created_at', 'desc')->paginate(20);
        return response()->json($alertes);
    }

    public function show(int $id): JsonResponse
    {
        $alerte = Alerte::with(['utilisateur', 'stock.produit'])->findOrFail($id);
        return response()->json($alerte); // corrigé : $alerte pas $alertes
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type'           => 'required|string|max:20',
            'message'        => 'required|string|max:300',
            'niveauUrgence'  => 'required|in:faible,moyen,critique', // sans espaces
            'idStock'        => 'required|exists:stocks,idStock',     // sans espaces
            'idUtilisateur'  => 'required|exists:utilisateurs,idUtilisateur', // table correcte
        ]);

        $alerte = Alerte::create($validated);

        return response()->json([
            'message' => 'Alerte créée',
            'alerte'  => $alerte->load(['utilisateur', 'stock.produit'])
        ], 201);
    }

    public function marquerLue(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $query = Alerte::where('lue', false);

        if ($user->role === 'caissier') {
            $query->where('idUtilisateur', $user->idUtilisateur);
        }

        $count = $query->update(['lue' => true]);
        return response()->json([
            'message' => "$count alerte(s) marquée(s) comme lue(s)",
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        Alerte::findOrFail($id)->delete();
        return response()->json(['message' => 'Alerte supprimée']);
    }

    public function stats(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Alerte::query();

        if ($user->role === 'caissier') {
            $query->where('idUtilisateur', $user->idUtilisateur); // corrigé : idUtilisateeur -> idUtilisateur
        }

        return response()->json([
            'total'             => (clone $query)->count(),
            'non_lues'          => (clone $query)->where('lue', false)->count(),
            'critiques'         => (clone $query)->where('niveauUrgence', 'critique')->count(),
            'critiques_nonlues' => (clone $query)->where('niveauUrgence', 'critique')->where('lue', false)->count(),
            'stock_faible'      => (clone $query)->where('type', 'stock_faible')->where('lue', false)->count(),
            'expiration'        => (clone $query)->where('type', 'expiration')->where('lue', false)->count(),
        ]);
    }
}