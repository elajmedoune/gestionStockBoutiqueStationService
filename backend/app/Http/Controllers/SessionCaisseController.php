<?php

namespace App\Http\Controllers;

use App\Models\SessionCaisse;
use App\Models\Utilisateur;
use App\Models\Vente;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class SessionCaisseController extends Controller
{
    /**
     * Session active de l'utilisateur connecté (s'il y en a une).
     */
    public function active(Request $request): JsonResponse
    {
        $session = SessionCaisse::where('idUtilisateur', $request->user()->idUtilisateur)
            ->where('statut', 'ouverte')
            ->first();

        return response()->json(['session' => $session]);
    }

    public function ouvrir(Request $request): JsonResponse
    {
        // Bouton de simple traçabilité : aucune saisie requise, le montant
        // est calculé automatiquement (total des ventes actives à l'instant T).
        $validated = $request->validate([
            'fondsOuverture' => 'nullable|numeric|min:0',
        ]);

        $existante = SessionCaisse::where('idUtilisateur', $request->user()->idUtilisateur)
            ->where('statut', 'ouverte')
            ->first();

        if ($existante) {
            return response()->json([
                'message' => 'Une session de caisse est déjà ouverte.',
                'session' => $existante,
            ], 409);
        }

        $fondsOuverture = $validated['fondsOuverture']
            ?? (float) Vente::where('statut', '!=', 'annulee')->sum('totalTaxeComprise');

        $session = SessionCaisse::create([
            'idUtilisateur'  => $request->user()->idUtilisateur,
            'dateOuverture'  => now(),
            'fondsOuverture' => $fondsOuverture,
            'statut'         => 'ouverte',
        ]);

        return response()->json([
            'message' => 'Caisse ouverte avec succès',
            'session' => $session,
        ], 201);
    }

    public function fermer(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'fondsFermeture' => 'nullable|numeric|min:0',
            'observations'   => 'nullable|string|max:300',
        ]);

        $session = SessionCaisse::where('idUtilisateur', $request->user()->idUtilisateur)
            ->where('statut', 'ouverte')
            ->first();

        if (!$session) {
            return response()->json(['message' => 'Aucune session de caisse ouverte.'], 404);
        }

        $montantVentes  = (float) $session->ventesQuery()->sum('totalTaxeComprise');
        $fondsAttendu   = (float) $session->fondsOuverture + $montantVentes;
        $fondsFermeture = $validated['fondsFermeture'] ?? $fondsAttendu;
        $ecart          = $fondsFermeture - $fondsAttendu;

        $session->update([
            'dateFermeture'  => now(),
            'fondsFermeture' => $fondsFermeture,
            'montantVentes'  => $montantVentes,
            'ecart'          => $ecart,
            'observations'   => $validated['observations'] ?? null,
            'statut'         => 'fermee',
        ]);

        return response()->json([
            'message' => 'Caisse fermée avec succès',
            'session' => $session,
        ]);
    }

    /**
     * Liste de toutes les sessions de caisse (gérant uniquement),
     * avec recherche par caissier, par jour et par produit vendu.
     */
    public function index(Request $request): JsonResponse
    {
        $query = SessionCaisse::with('utilisateur')
            ->orderBy('dateOuverture', 'desc');

        if ($request->filled('caissier')) {
            $recherche = $request->caissier;
            $query->whereHas('utilisateur', function ($q) use ($recherche) {
                $q->where('nom', 'like', "%{$recherche}%")
                  ->orWhere('prenom', 'like', "%{$recherche}%");
            });
        }

        if ($request->filled('idUtilisateur')) {
            $query->where('idUtilisateur', $request->idUtilisateur);
        }

        if ($request->filled('jour')) {
            $query->whereDate('dateOuverture', $request->jour);
        }

        if ($request->filled('statut')) {
            $query->where('statut', $request->statut);
        }

        if ($request->filled('produit')) {
            $recherche = $request->produit;
            $idsCorrespondants = DB::table('sessions_caisse as sc')
                ->join('ventes as v', function ($join) {
                    $join->on('v.idUtilisateur', '=', 'sc.idUtilisateur')
                         ->where('v.statut', '!=', 'annulee')
                         ->whereColumn('v.dateVente', '>=', 'sc.dateOuverture')
                         ->where(function ($q) {
                             $q->whereColumn('v.dateVente', '<=', 'sc.dateFermeture')
                               ->orWhereNull('sc.dateFermeture');
                         });
                })
                ->join('lignevente as lv', 'lv.idVente', '=', 'v.idVente')
                ->join('produits as p', 'p.idProduit', '=', 'lv.idProduit')
                ->where(function ($q) use ($recherche) {
                    $q->where('p.nomProduit', 'like', "%{$recherche}%")
                      ->orWhere('p.reference', 'like', "%{$recherche}%");
                })
                ->distinct()
                ->pluck('sc.idSession');

            $query->whereIn('idSession', $idsCorrespondants);
        }

        $sessions = $query->get();

        return response()->json(['data' => $sessions]);
    }
}
