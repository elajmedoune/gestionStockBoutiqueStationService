<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;

class AssistantController extends Controller
{
    public function ask(Request $request)
    {
        $question = $request->input('message');
        $user = $request->user();
        $role = $user->role;
        $prenom = $user->prenom;
        $nom = $user->nom;

        $interdit = false;

        // Mots interdits pour TOUT LE MONDE sauf gérant
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

        // Mots supplémentaires interdits pour caissier
        if ($role === 'caissier') {
            $motsClesInterdits = ['fournisseur', 'commande', 'inventaire', 'rapport'];
            foreach ($motsClesInterdits as $mot) {
                if (str_contains(strtolower($question), $mot)) { $interdit = true; break; }
            }
        }

        // Mots supplémentaires interdits pour magasinier
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

        // Stock : somme par produit
        $stocksBruts = DB::table('stocks')
            ->join('produits', 'stocks.idProduit', '=', 'produits.idProduit')
            ->select(
                'produits.reference',
                'produits.seuilSecurite',
                DB::raw('SUM(stocks.quantiteRestante) as quantiteRestante')
            )
            ->groupBy('produits.idProduit', 'produits.reference', 'produits.seuilSecurite')
            ->get();

        $stockTotal = $stocksBruts->sum('quantiteRestante');

        // Alertes
        $alertes = DB::table('alertes')
            ->where('lue', 0)
            ->orderBy('niveauUrgence', 'desc')
            ->limit(10)
            ->get();

        // Catégories
        $categories = DB::table('categories')
            ->select('libelle', 'description')
            ->get();

        // Livraisons
        $livraisons = DB::table('livraisons')
            ->select('dateLivraison', 'montantTotal', 'statut', 'observations')
            ->orderBy('dateLivraison', 'desc')
            ->limit(20)
            ->get();

        $contexteData = [
            'stock_par_produit'  => $stocksBruts,
            'stock_total_unites' => $stockTotal,
            'nb_produits'        => $stocksBruts->count(),
            'categories'         => $categories,
            'nb_categories'      => $categories->count(),
            'livraisons'         => $livraisons,
            'nb_livraisons'      => $livraisons->count(),
            'alertes_actives'    => $alertes,
            'nb_alertes'         => $alertes->count(),
            'role_utilisateur'   => $role,
        ];

        // Données financières et utilisateurs réservées au gérant uniquement
        if ($role === 'gerant') {
            $ventes = DB::table('ventes')
                ->select('idVente', 'montantTotal', 'totalHorsTaxe', 'tva', 'totalTaxeComprise', 'dateVente', 'modePaiement', 'statut')
                ->orderBy('dateVente', 'desc')
                ->limit(200)
                ->get();

            $ventesActives  = $ventes->where('statut', '!=', 'annulee')->values();
            $ventesAnnulees = $ventes->where('statut', 'annulee')->values();

            $utilisateurs = DB::table('utilisateurs')
                ->select('nom', 'prenom', 'role', 'actif')
                ->get();

            $contexteData['nb_ventes_actives']  = $ventesActives->count();
            $contexteData['nb_ventes_annulees'] = $ventesAnnulees->count();
            $contexteData['utilisateurs']       = $utilisateurs;
            $contexteData['nb_utilisateurs']    = $utilisateurs->count();
        }

        $contexte = json_encode($contexteData);

        $apiKey = env('GROQ_API_KEY');

        $response = Http::withHeaders([
            'Authorization' => "Bearer {$apiKey}",
            'Content-Type' => 'application/json',
        ])->post('https://api.groq.com/openai/v1/chat/completions', [
            'model' => 'llama-3.3-70b-versatile',
            'messages' => [
                ['role' => 'system', 'content' => "Tu es l'assistant IA de la Boutique Station Service à Thiès, Sénégal. Tu parles à {$prenom} {$nom} (rôle : {$role}).

Règles :
- Réponds en français simple et clair
- Ne dis JAMAIS bonjour sauf si l'utilisateur te salue en premier
- N'appelle l'utilisateur par son prénom qu'une seule fois par réponse, pas systématiquement
- N'affiche jamais les IDs techniques
- Utilise les références des produits
- Donne des chiffres lisibles avec des espaces (ex: 12 794 unités)
- Sois concis et direct
- Ne réponds jamais aux questions sur les finances, mots de passe ou données confidentielles
- Les données financières sont strictement réservées au gérant
- Les informations sur les utilisateurs sont strictement réservées au gérant"],
                ['role' => 'user', 'content' => "Données actuelles :\n{$contexte}\n\nQuestion : {$question}"]
            ]
        ]);

        $reponse = $response->json('choices.0.message.content') ?? 'Erreur de réponse.';

        return response()->json(['reponse' => $reponse]);
    }
}