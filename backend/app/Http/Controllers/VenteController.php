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
        $ventes = Vente::with(['utilisateur', 'lignes.produit.stocks'])
                       ->orderBy('dateVente', 'desc')
                       ->get();
        return VenteResource::collection($ventes);
    }

    public function store(Request $request)
    {
        $request->validate([
            'modePaiement'       => 'required|string|max:20',
            'lignes'             => 'required|array|min:1',
            'lignes.*.idProduit' => 'required|integer|exists:produits,idProduit',
            'lignes.*.quantite'  => 'required|integer|min:1',
        ]);

        DB::beginTransaction();
        try {
            $vente = Vente::create([
                'modePaiement'  => $request->modePaiement,
                'idUtilisateur' => $request->user()->idUtilisateur,
                'statut'        =>'validee',
            ]);
            $montantTotal = 0;

            foreach ($request->lignes as $ligne) {
                //Recuperer le stock disponible
                $stock = \App\Models\Stock::with('produit')
                    ->where('idProduit', $ligne['idProduit'])
                    ->where('quantiteRestante', '>', 0)
                    ->first();
                if(!$stock){
                    throw new \Exception("Quantite insuffisante pour le produit{$ligne['idProduit']}");
                }
                $prixUnitaire = $stock->produit->prixUnitaire ?? 0;
                $sousTotal = $prixUnitaire * $ligne['quantite'];
                $montantTotal += $sousTotal;
                //Creer la ligne de vente
                LigneVente::create([
                    'idVente'             =>$vente->idVente,
                    'idProduit'           =>$ligne['idProduit'],
                    'quantite'            =>$ligne['quantite'],
                    'totalPartielle'      =>$sousTotal,
                ]);
                //Decrementer le stock
                $stock->quantiteRestante -= $ligne['quantite'];
                $stock->save();
            }
            //Mettre a jour le montant total
            // $vente->montantTotal = $montantTotal;

            $tva = round($montantTotal * 0.18, 2);
            $vente->montantTotal      = $montantTotal;
            $vente->totalHorsTaxe     = $montantTotal;
            $vente->tva               = $tva;
            $vente->totalTaxeComprise = $montantTotal + $tva;
            $vente->statut            = 'validee';
            $vente->save();
            

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
        $vente = Vente::with(['utilisateur', 'lignes.produit.stocks'])->findOrFail($id);
        return new VenteResource($vente);
    }

    public function destroy($id)
    {
        $vente = Vente::with('lignes')->findOrFail($id);

        if ($vente->statut === 'annulee') {
            return response()->json(['message' => 'Vente déjà annulée'], 400);
        }

        foreach ($vente->lignes as $ligne) {
            $stock = \App\Models\Stock::where('idProduit', $ligne->idProduit)->first();
            if ($stock) {
                $stock->quantiteRestante += $ligne->quantite;
                $stock->save();
            }
        }

        $vente->statut = 'annulee';
        $vente->save();

        return response()->json(['message' => 'Vente annulée']);
    }
}