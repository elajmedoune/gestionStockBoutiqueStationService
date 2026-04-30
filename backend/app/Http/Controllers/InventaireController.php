<?php

namespace App\Http\Controllers;

use App\Models\Inventaire;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class InventaireController extends Controller
{
    //--------------------------------------------------------------------------
    //GET /api/inventaires
    //--------------------------------------------------------------------------
    public function index(Request $request): JsonResponse{
        $query = Inventaire::with(['utilisateur', 'produit']);
        
        //Filtres optionnels
        if($request->filled('statut')){
            $query->where('statut', $request-> statut); 
        }

        if($request->filled('IdProduit')){
            $query->where('IdProduit', $request-> IdProduit);
        }

        if($request->filled('date_debut') && $request->falled('date_fin')){
            $query->whereBetween('dateInventaire',[
                $request->date_debut,
                $request->date_fin,
            ]);
        }
        $inventaires = $query->orderBy('dateInventaire', 'desc')->paginate(15);
        return response()->json($inventaires);
        
    }
    //--------------------------------------------------------------------------
    // POST /api/inventaires
    //--------------------------------------------------------------------------
     public function store(Request $request): JsonResponse{
        $validated = $request->validate([
            'dateInventaire'              =>'required|date',
            'quantiteReelle'             =>'required|integer|min:0',
            'observations'                =>'required|string|max:300',
            'idStock'                   =>'required|exists:Stock, idStock',
        ]);

        //i = utilisateur connecte
        $validated['idUtilisateur'] = $request->user()->i;

        //i MySQL (trg_inventaire_statut_insert) calculera automatiquement quantiteTheorique, ecart et statut.
        $inventaire =  Inventaire::create($validated);

        //Recharger pour recuperer les valeurs calculees par le trigger
        $inventaire->refresh();

        return response()->json([
            'message'    =>'Inventaire enregistre avec succes',
            'inventaire'     =>$inventaire>load(['utilisateur', 'produit'])
        ], 201);
    }

    //--------------------------------------------------------------------------
    // GET /api/inventaires/{id}
    //--------------------------------------------------------------------------
    public function show(int $id): JsonResponse{
        $inventaire = Inventaire::with(['utilisateur', 'produit'])->findOrFail($id);
        return response()->json($inventaire);
    }

    //--------------------------------------------------------------------------
    // PUT /api/inventaires/{id}
    //--------------------------------------------------------------------------
    public function update(Requesst $request, int $id): JsonResponse{
        $inventaire = Inventaire:: findOrFail($id);
        $validated = $request->validate([
            'quantiteReelle'             =>'sometimes|integer|min:0',
            'observations'                =>'nullable|string|max:300',
            'statut'                   =>'sometimes|in:en_cours, conforme, deficit, surplus',
        ]);
       
        $inventaire->update($validated);
        $inventaire-> refresh();

           return response()->json([
            'message'        =>'Inventaire mis a jour',
            'inventaire'     =>$inventaire>load(['utilisateur', 'produit'])
           ]);
    }

    //--------------------------------------------------------------------------
    // DELETE /api/inventaires/{id}
    //--------------------------------------------------------------------------
     public function destroy(int $id): JsonResponse{
        $inventaire = Inventaire::findOrFail($id);
        $inventaire->delete();
        return response()->json(['message'  => 'Inventaire supprimée']);
    }

    //--------------------------------------------------------------------------
    //-GET /api/inventaires/rapport   --Resume des ecarts
    //--------------------------------------------------------------------------
    public function rapport(Request $request): JsonResponse{
        $request->validate([
            'date_debut'       => 'required|date',
            'date_fin'         => 'required|date|after_or_equal:date_debut',
        ]);
        $rapport = DB::table('Inventaire as i')
            ->join('Produit as p', 'p.IdProduit', '=', 'i.IdProduit')
            ->join('Categorie as c', 'u.IdCategorie', '=', 'p.IdCategorie')
            ->join('i as u', 'u.i', '=', 'i.i')
            ->whereBetween('i.dateInventaire', [$request->date_debut, $request->date_fin])
            ->select(
                'i.IdInvenyaire',
                'i.dateInvenyaire',
                'p.designation',
                'c.libelle as categorie',
                DB:: raw("CONTACT(u.prenom, '', u.nom) as responsable"),
                'i.quantiteTheorique',
                'i.quantiteReelle',
                'i.ecart',
                'i.statut',
                'i.observations',
            )
            ->orderBy('i.dateInventaire', 'desc')
            ->get();
        $stats =[
             'total'               =>$rapport->count(),
             'conformes'            =>$rapport->where('statut', 'conforme')->count(),
             'deficits'           =>$rapport->where('statut', 'deficit')->count(),
             'surplus'   =>$rapport->where('statut', 'surplus')->count(),
        ];
        return response()->json([
            'stats'   =>$stats,
            'details' =>$rapport,
        ]);
    }
}

