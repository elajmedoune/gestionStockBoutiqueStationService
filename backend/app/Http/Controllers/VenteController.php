<?php

namespace App\Http\Controllers;

use App\Models\Vente;
use App\Models\LigneVente;
use App\Http\Resources\VenteResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class VenteController extends Controller
{
    // GET /api/ventes
    public function index()
    {
        $ventes = Vente::with(['utilisateur', 'lignes.produit'])
                       ->orderBy('dateVente', 'desc')
                       ->get();

        return VenteResource::collection($ventes);
    }

    // POST /api/ventes
    public function store(Request $request)
    {
        $request->validate([
            'modePaiement'          => 'required|string|max:20',
            'lignes'                => 'required|array|min:1',
            'lignes.*.IdProduit'    => 'required|integer|exists:Produit,IdProduit',
            'lignes.*.quantite'     => 'required|integer|min:1',
            'lignes.*.prixUnitaire' => 'required|numeric|min:0',
        ]);

        DB::beginTransaction();
        try {
            // Créer la vente
            $vente = Vente::create([
                'modePaiement' => $request->modePaiement,
                'IdUtilisateur' => $request->user()->IdUtilisateur,
            ]);

            // Ajouter les lignes (le trigger recalcule les totaux)
            foreach ($request->lignes as $ligne) {
                LigneVente::create([
                    'IdVente'      => $vente->IdVente,
                    'IdProduit'    => $ligne['IdProduit'],
                    'quantite'     => $ligne['quantite'],
                    'prixUnitaire' => $ligne['prixUnitaire'],
                ]);
            }

            DB::commit();

            // Recharger avec les totaux mis à jour par le trigger
            $vente->refresh();

            return new VenteResource($vente->load(['utilisateur', 'lignes.produit']));

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    // GET /api/ventes/{id}
    public function show($id)
    {
        $vente = Vente::with(['utilisateur', 'lignes.produit'])->findOrFail($id);
        return new VenteResource($vente);
    }

    // DELETE /api/ventes/{id}
    public function destroy($id)
    {
        $vente = Vente::findOrFail($id);
        $vente->lignes()->delete();
        $vente->delete();

        return response()->json(['message' => 'Vente supprimée']);
    }

    // GET /api/ventes/rapport?dateDebut=...&dateFin=...
    public function rapport(Request $request)
    {
        $request->validate([
            'dateDebut' => 'required|date',
            'dateFin'   => 'required|date|after_or_equal:dateDebut',
        ]);

        $rapport = DB::select('CALL sp_rapport_ventes(?, ?)', [
            $request->dateDebut,
            $request->dateFin,
        ]);

        return response()->json($rapport);
    }
}