<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AssistantController extends Controller
{
    public function ask(Request $request)
    {
        $question = $request->input('message');
        $user     = $request->user();
        $role     = $user->role;
        $prenom   = $user->prenom;
        $nom      = $user->nom;

        $interdit = false;

        if ($role !== 'gerant') {
            $motsClesInterdits = [
                'bénéfice', 'benefice', 'chiffre d\'affaires',
                'argent', 'montant', 'revenu', 'revenue',
                'salaire', 'marge', 'profit',
                'utilisateur', 'user', 'employe', 'employé', 'personnel', 'staff',
                'mot de passe', 'password', 'clé api', 'api key', 'token',
                'secret', 'base de données', 'database', 'serveur', 'config'
            ];
            foreach ($motsClesInterdits as $mot) {
                if (str_contains(strtolower($question), $mot)) { $interdit = true; break; }
            }
        }

        if ($role === 'caissier') {
            $motsClesInterdits = ['fournisseur', 'commande', 'inventaire', 'rapport'];
            foreach ($motsClesInterdits as $mot) {
                if (str_contains(strtolower($question), $mot)) { $interdit = true; break; }
            }
        }

        if ($role === 'magasinier') {
            $motsClesInterdits = ['vente', 'caissier'];
            foreach ($motsClesInterdits as $mot) {
                if (str_contains(strtolower($question), $mot)) { $interdit = true; break; }
            }
        }

        if ($interdit) {
            return response()->json([
                'reponse' => "Désolé {$prenom}, vous n'avez pas accès à cette information."
            ]);
        }

        try {

            // Stock : somme par produit avec consommation
            $stocksBruts = DB::table('stocks')
                ->join('produits', 'stocks.idProduit', '=', 'produits.idProduit')
                ->select(
                    'produits.reference',
                    'produits.seuilSecurite',
                    DB::raw('SUM(stocks.quantiteInitiale) as quantiteInitiale'),
                    DB::raw('SUM(stocks.quantiteRestante) as quantiteRestante'),
                    DB::raw('SUM(stocks.quantiteInitiale) - SUM(stocks.quantiteRestante) as quantiteConsommee')
                )
                ->groupBy('produits.idProduit', 'produits.reference', 'produits.seuilSecurite')
                ->get();

            $stockTotal = $stocksBruts->sum('quantiteRestante');

            // Précalcul PHP
            $produitsEnAlerte = $stocksBruts
                ->filter(fn($s) => $s->quantiteRestante < $s->seuilSecurite)
                ->map(fn($s) => [
                    'reference'        => $s->reference,
                    'quantiteRestante' => (int) $s->quantiteRestante,
                    'seuilSecurite'    => (int) $s->seuilSecurite,
                    'deficit'          => (int) $s->seuilSecurite - (int) $s->quantiteRestante,
                ])
                ->values();

            $produitsEnRupture = $stocksBruts
                ->filter(fn($s) => (int) $s->quantiteRestante === 0)
                ->map(fn($s) => ['reference' => $s->reference])
                ->values();

            $produitsOK = $stocksBruts
                ->filter(fn($s) => $s->quantiteRestante >= $s->seuilSecurite)
                ->count();

            // Top consommés
            $topConsommes = $stocksBruts
                ->filter(fn($s) => $s->quantiteConsommee > 0)
                ->sortByDesc('quantiteConsommee')
                ->map(fn($s) => [
                    'reference'         => $s->reference,
                    'quantiteConsommee' => (int) $s->quantiteConsommee,
                    'quantiteInitiale'  => (int) $s->quantiteInitiale,
                    'quantiteRestante'  => (int) $s->quantiteRestante,
                    'tauxConsommation'  => $s->quantiteInitiale > 0
                        ? round(($s->quantiteConsommee / $s->quantiteInitiale) * 100, 1)
                        : 0,
                ])
                ->values()
                ->take(10);

            // Alertes
            $alertes = DB::table('alertes')
                ->where('lue', 0)
                ->orderByRaw("FIELD(niveauUrgence, 'critique', 'haute', 'moyenne', 'faible') ASC")
                ->limit(10)
                ->get();

            // Catégories
            $categories = DB::table('categories')
                ->select('libelle', 'description', 'emoji')
                ->get();

            // Livraisons
            $livraisons = DB::table('livraisons')
                ->select('dateLivraison', 'montantTotal', 'statut', 'observations')
                ->orderBy('dateLivraison', 'desc')
                ->limit(20)
                ->get();

            $contexteData = [
                'stock_par_produit'      => $stocksBruts,
                'stock_total_unites'     => $stockTotal,
                'nb_produits'            => $stocksBruts->count(),
                'produits_en_alerte'     => $produitsEnAlerte,
                'nb_produits_en_alerte'  => $produitsEnAlerte->count(),
                'produits_en_rupture'    => $produitsEnRupture,
                'nb_produits_en_rupture' => $produitsEnRupture->count(),
                'nb_produits_ok'         => $produitsOK,
                'top_consommes'          => $topConsommes,
                'produit_plus_consomme'  => $topConsommes->first(),
                'categories'             => $categories,
                'nb_categories'          => $categories->count(),
                'livraisons'             => $livraisons,
                'nb_livraisons'          => $livraisons->count(),
                'alertes_actives'        => $alertes,
                'nb_alertes'             => $alertes->count(),
                'role_utilisateur'       => $role,
            ];

            // Ventes par produit pour gérant et gestionnaire
            if ($role === 'gerant' || $role === 'gestionnaire_stock') {
                $ventesParProduit = DB::table('ventes')
                    ->join('lignevente', 'ventes.idVente', '=', 'lignevente.idVente')
                    ->join('produits', 'lignevente.idProduit', '=', 'produits.idProduit')
                    ->select(
                        'produits.reference',
                        DB::raw('SUM(lignevente.quantite) as quantiteVendue')
                    )
                    ->where('ventes.statut', '!=', 'annulee')
                    ->groupBy('produits.idProduit', 'produits.reference')
                    ->orderBy('quantiteVendue', 'desc')
                    ->get();

                $contexteData['ventes_par_produit'] = $ventesParProduit;
                $contexteData['produit_plus_vendu'] = $ventesParProduit->first();
            }

            // Données financières réservées au gérant
            if ($role === 'gerant') {
                $ventesFinancieres = DB::table('ventes')
                    ->select('idVente', 'montantTotal', 'totalHorsTaxe', 'tva', 'totalTaxeComprise', 'dateVente', 'modePaiement', 'statut')
                    ->orderBy('dateVente', 'desc')
                    ->limit(200)
                    ->get();

                $ventesActives  = $ventesFinancieres->where('statut', '!=', 'annulee')->values();
                $ventesAnnulees = $ventesFinancieres->where('statut', 'annulee')->values();

                $utilisateurs = DB::table('utilisateurs')
                    ->select('nom', 'prenom', 'role', 'actif')
                    ->get();

                $contexteData['nb_ventes_actives']  = $ventesActives->count();
                $contexteData['nb_ventes_annulees'] = $ventesAnnulees->count();
                $contexteData['utilisateurs']       = $utilisateurs;
                $contexteData['nb_utilisateurs']    = $utilisateurs->count();
            }

            $contexte      = json_encode($contexteData, JSON_UNESCAPED_UNICODE);
            $alertesJson   = json_encode($produitsEnAlerte, JSON_UNESCAPED_UNICODE);
            $rupturesJson  = json_encode($produitsEnRupture, JSON_UNESCAPED_UNICODE);
            $consommesJson = json_encode($topConsommes->take(5), JSON_UNESCAPED_UNICODE);
            $nbAlerte      = $produitsEnAlerte->count();
            $nbRupture     = $produitsEnRupture->count();

            $apiKey = env('GROQ_API_KEY');

            $response = Http::withHeaders([
                'Authorization' => "Bearer {$apiKey}",
                'Content-Type'  => 'application/json',
            ])->post('https://api.groq.com/openai/v1/chat/completions', [
                'model'    => 'llama-3.3-70b-versatile',
                'messages' => [
                    [
                        'role'    => 'system',
                        'content' => "Tu es l'assistant IA de la Boutique Station Service à Thiès, Sénégal. Tu parles à {$prenom} {$nom} (rôle : {$role}).

RÈGLES STRICTES :
- Réponds en français simple et clair
- Ne dis JAMAIS bonjour sauf si l'utilisateur te salue en premier
- N'utilise JAMAIS le prénom de l'utilisateur dans tes réponses, sauf s'il te salue en premier
- N'affiche jamais les IDs techniques
- Donne des chiffres lisibles avec des espaces (ex: 12 794 unités)
- Sois concis et direct
- Ne réponds jamais aux questions sur les finances, mots de passe ou données confidentielles
- Les données financières sont strictement réservées au gérant
- Les informations sur les utilisateurs sont strictement réservées au gérant
- Pour les listes, mets chaque élément sur une nouvelle ligne avec un tiret : - produit
- Ne mets jamais plusieurs produits sur la même ligne

DONNÉES PRÉ-CALCULÉES — UTILISE-LES DIRECTEMENT SANS JAMAIS RECALCULER :
- produits_en_alerte = liste EXACTE des produits dont quantiteRestante < seuilSecurite
- produits_en_rupture = liste EXACTE des produits dont quantiteRestante = 0
- top_consommes = produits classés par (quantiteInitiale - quantiteRestante) décroissant
- produit_plus_consomme = le produit avec la plus grande consommation
- NE RECALCULE JAMAIS ces listes toi-même
- Fais confiance à 100% aux listes précalculées

STYLE :
- Réponses courtes et directes
- Ne donne pas d'informations non demandées"
                    ],
                    [
                        'role'    => 'user',
                        'content' => "RÉSUMÉ PRÉ-CALCULÉ (source de vérité absolue) :
- Produits en alerte ({$nbAlerte}) : {$alertesJson}
- Produits en rupture ({$nbRupture}) : {$rupturesJson}
- Top 5 produits les plus consommés : {$consommesJson}

Toutes les données complètes :
{$contexte}

Question : {$question}"
                    ]
                ]
            ]);

            $reponse = $response->json('choices.0.message.content') ?? 'Erreur de réponse.';

            return response()->json(['reponse' => $reponse]);

        } catch (\Exception $e) {
            Log::error('Assistant error: ' . $e->getMessage());
            return response()->json([
                'reponse' => 'Erreur technique: ' . $e->getMessage()
            ], 200);
        }
    }
}