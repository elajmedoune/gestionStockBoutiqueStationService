<?php

namespace App\Http\Controllers;

use App\Models\Inventaire;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class InventaireController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Inventaire::with(['utilisateur', 'stock.produit']);

        if ($request->filled('statut')) {
            $query->where('statut', $request->statut);
        }

        if ($request->filled('idStock')) {
            $query->where('idStock', $request->idStock);
        }

        if ($request->filled('date_debut') && $request->filled('date_fin')) {
            $query->whereBetween('dateInventaire', [
                $request->date_debut,
                $request->date_fin,
            ]);
        }

        $inventaires = $query->orderBy('dateInventaire', 'desc')->paginate(15);
        return response()->json($inventaires);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'dateInventaire' => 'required|date',
            'quantiteReelle' => 'required|integer|min:0',
            'observations'   => 'nullable|string|max:300',
            'idStock'        => 'required|exists:stocks,idStock',
        ], [
            'dateInventaire.required' => 'La date est obligatoire.',
            'quantiteReelle.required' => 'La quantité réelle est obligatoire.',
            'quantiteReelle.min'      => 'La quantité ne peut pas être négative.',
            'idStock.required'        => 'Le stock est obligatoire.',
            'idStock.exists'          => 'Ce stock n\'existe pas.',
        ]);

        $validated['idUtilisateur'] = $request->user()->idUtilisateur;

        // Le trigger trg_inventaire_statut_insert calculera automatiquement
        // quantiteTheorique et statut
        $inventaire = Inventaire::create($validated);
        $inventaire->refresh();

        return response()->json([
            'message'    => 'Inventaire enregistré avec succès',
            'inventaire' => $inventaire->load(['utilisateur', 'stock.produit'])
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        $inventaire = Inventaire::with(['utilisateur', 'stock.produit'])->findOrFail($id);
        return response()->json($inventaire);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $inventaire = Inventaire::findOrFail($id);

        $validated = $request->validate([
            'quantiteReelle' => 'sometimes|integer|min:0',
            'observations'   => 'nullable|string|max:300',
            'statut'         => 'sometimes|in:en_cours,conforme,deficit,surplus',
        ], [
            'quantiteReelle.min' => 'La quantité ne peut pas être négative.',
            'statut.in'          => 'Statut invalide.',
        ]);

        $inventaire->update($validated);
        $inventaire->refresh();

        return response()->json([
            'message'    => 'Inventaire mis à jour',
            'inventaire' => $inventaire->load(['utilisateur', 'stock.produit'])
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        Inventaire::findOrFail($id)->delete();
        return response()->json(['message' => 'Inventaire supprimé']);
    }

    public function rapport(Request $request): JsonResponse
    {
        $request->validate([
            'date_debut' => 'required|date',
            'date_fin'   => 'required|date|after_or_equal:date_debut',
        ]);

        $rapport = DB::table('inventaires as i')
            ->join('stocks as s',      's.idStock',      '=', 'i.idStock')
            ->join('produits as p',    'p.idProduit',    '=', 's.idProduit')
            ->join('categories as c',  'c.idCategorie',  '=', 'p.idCategorie')
            ->join('utilisateurs as u','u.idUtilisateur','=', 'i.idUtilisateur')
            ->whereBetween('i.dateInventaire', [$request->date_debut, $request->date_fin])
            ->select(
                'i.idInventaire',
                'i.dateInventaire',
                'p.nomProduit',
                'p.reference',
                'c.libelle as categorie',
                DB::raw("CONCAT(u.prenom, ' ', u.nom) as responsable"),
                'i.quantiteTheorique',
                'i.quantiteReelle',
                DB::raw('(i.quantiteReelle - i.quantiteTheorique) as ecart'),
                'i.statut',
                'i.observations',
            )
            ->orderBy('i.dateInventaire', 'desc')
            ->get();

        $stats = [
            'total'     => $rapport->count(),
            'conformes' => $rapport->where('statut', 'conforme')->count(),
            'deficits'  => $rapport->where('statut', 'deficit')->count(),
            'surplus'   => $rapport->where('statut', 'surplus')->count(),
        ];

        return response()->json([
            'stats'   => $stats,
            'details' => $rapport,
        ]);
    }
}