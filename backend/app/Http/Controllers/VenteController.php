<?php

namespace App\Http\Controllers;

use App\Models\Vente;
use App\Models\LigneVente;
use App\Http\Resources\VenteResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class VenteController extends Controller
{
    public function index()
    {
        $ventes = Vente::with(['utilisateur', 'lignes'])
                       ->orderBy('dateVente', 'desc')
                       ->get();
        return VenteResource::collection($ventes);
    }

    public function store(Request $request)
    {
        $request->validate([
            'modePaiement'       => 'required|string|max:20',
            'lignes'             => 'required|array|min:1',
            'lignes.*.idProduit' => 'required|integer|exists:Produit,idProduit',
            'lignes.*.quantite'  => 'required|integer|min:1',
        ]);

        DB::beginTransaction();
        try {
            $vente = Vente::create([
                'modePaiement'  => $request->modePaiement,
                'idUtilisateur' => $request->user()->idUtilisateur,
            ]);

            foreach ($request->lignes as $ligne) {
                DB::statement('CALL sp_ajouter_ligne_vente(?, ?, ?)', [
                    $vente->idVente,
                    $ligne['idProduit'],
                    $ligne['quantite'],
                ]);
            }

            DB::commit();
            $vente->refresh();
            return new VenteResource($vente->load(['utilisateur', 'lignes']));

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function show($id)
    {
        $vente = Vente::with(['utilisateur', 'lignes'])->findOrFail($id);
        return new VenteResource($vente);
    }

    public function destroy($id)
    {
        $vente = Vente::findOrFail($id);
        $vente->lignes()->delete();
        $vente->delete();
        return response()->json(['message' => 'Vente supprimée']);
    }

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