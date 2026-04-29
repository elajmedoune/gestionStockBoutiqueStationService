<?php

namespace App\Http\Controllers;

use App\Models\Alerte;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AlerteController extends Controller
{
    //-------------------------------------------------------------------
    //Get /api/alertes
    //-------------------------------------------------------------------
    public function index(Request $request): JsonResponse{
        $query = Alerte::with(['utilisateur', 'stock.produit']);

        //Filtres
        if($request->filled('lue')){
            $query->where('lue', filter_var($request-> lue, FILTER_VALiDATE_BOOLEAN));
        }
        if($request->filled('niveauUrgence')){
            $query->where('niveauUrgence', $request-> niveauUrgence);
        }
        if($request->filled('type')){
            $query->where('type', $request-> type);
        }
         if($request->filled('idStock')){
            $query->where('idStock', $request-> idStock);
        }
        //Un caissier ne voit que ses propres alertes
        $user = $request->user();
        if($user->role === 'caissier'){
            $query->where('idUtilisateur', $user-> idUtilisateur);
        }
        $alertes = $query->orderBy('dateCreation', 'desc')->paginate(20);
        return response()->json($alertes);
    }

     //-------------------------------------------------------------------
    //Get /api/alertes/{id}
    //-------------------------------------------------------------------
    public function show(int $id): JsonResponse{
        $alerte = Alerte::with(['utilisateur', 'stock.produit'])->findOrFail($id);
        return response()->json($alertes);
    }

    //-------------------------------------------------------------------
    //Get /api/alertes   (creation manuelle - role admin/gestionnaire)
    //-------------------------------------------------------------------
    public function store(Request $request): JsonResponse{
        $validated = $request->validate([
            'type'              =>'required|string|max:20',
            'message'              =>'required|string|max:300',
            'niveauUrgence'              =>'required|in:faible, moyen, critique',
            'idStock'              =>'required|exists:stocks, idStock',
            'idUtilisateur'              =>'required|exists:Utilisateur, idUtilisateur',
        ]);
        $alerte = Alerte::create($validated);

        return response()->json([
            'message'    =>'Alerte creee',
            'alerte'     =>$alerte->load(['utilisateur', 'stock.produit'])
        ], 201);
    }

    //-------------------------------------------------------------------
    //PATH /api/alertes{id}/lire-tout --Marquer comme lue
    //-------------------------------------------------------------------
    public function marquerLue(Request $request, int $id): JsonResponse{
        $user = $request->user();
        $query = Alerte::where('lue', false);
        if($user->role === 'caissier'){
            $query->where('idUtilisateur', $user-> idUtilisateur);
        }

        $count = $query->update(['lue' =>true]);
        return response()->json([
            'message'  =>  "$count alerte(s) marquée(s) comme lue(s)",
        ]);
    }

     //-------------------------------------------------------------------
    //DELETE /api/alertes{id}
    //-------------------------------------------------------------------
    public function destroy(int $id): JsonResponse{
        Alerte::findOrFail($id)->delete();
        return response()->json(['message'  => 'Alerte supprimée']);
    }

    //-------------------------------------------------------------------
    //GET /api/alertes/stats   --Compteurs pour le dashboard
    //-------------------------------------------------------------------
    public function stats(Request $request): JsonResponse{
        $user = $request->user();
        $query = Alerte::query();
        if($user->role === 'caissier'){
            $query->where('idUtilisateur', $user->idUtilisateeur);
        }
        return response()->json([
            'total'               =>(clone $query)->count(),
            'non_lues'            =>(clone $query)->where('lue', false)->count(),
            'critiques'           =>(clone $query)->where('niveauUrgence', 'critique')->count(),
            'critiques_nonlues'   =>(clone $query)->where('niveauUrgence', 'critique')->where('lue', false)->count(),
            'stock_faible'        =>(clone $query)->where('type', 'stock_faible')->where('lue', false)->count(),
            'expiration'           =>(clone $query)->where('type', 'expiration')->where('lue', false)->count(),
        ]);
    }

    
}
