<?php

namespace Database\Seeders;

use App\Models\Utilisateur;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        Utilisateur::create([
            'nom'        => 'MBAYE',
            'prenom'     => 'Fatou',
            'login'      => 'caissier',
            'email'      => 'caissier@station.sn',
            'motDePasse' => Hash::make('password123'),
            'role'       => 'caissier',
            'actif'      => true,
        ]);
        Utilisateur::create([
            'nom'        => 'DIALLO',
            'prenom'     => 'Mamadou',
            'login'      => 'gerant',
            'email'      => 'gerant@station.sn',
            'motDePasse' => Hash::make('password123'),
            'role'       => 'gerant',
            'actif'      => true,
        ]);
        $magasinier = Utilisateur::create([
            'nom' => 'FALL', 'prenom' => 'Ibrahima',
            'login' => 'magasinier', 'email' => 'magasinier@station.sn',
            'motDePasse' => Hash::make('password123'),
            'role' => 'magasinier', 'actif' => true,
        ]);

        // Catégories
        $cat1 = Categorie::create(['libelle' => 'Carburants']);
        $cat2 = Categorie::create(['libelle' => 'Lubrifiants']);
        $cat3 = Categorie::create(['libelle' => 'Accessoires']);

        // Fournisseurs
        $f1 = Fournisseur::create([
            'nomFournisseur' => 'Total Sénégal',
            'telephone' => '338001234',
            'email' => 'contact@total.sn',
            'adresse' => 'Dakar, Plateau',
        ]);
        $f2 = Fournisseur::create([
            'nomFournisseur' => 'Shell Distribution',
            'telephone' => '338005678',
            'email' => 'info@shell.sn',
            'adresse' => 'Dakar, Almadies',
        ]);

        // Produits
        $p1 = Produit::create([
            'nomProduit' => 'Essence Super',
            'reference' => 'CARB-001',
            'prixUnitaire' => 850,
            'seuilSecurite' => 100,
            'idCategorie' => $cat1->idCategorie,
        ]);
        $p2 = Produit::create([
            'nomProduit' => 'Gasoil',
            'reference' => 'CARB-002',
            'prixUnitaire' => 780,
            'seuilSecurite' => 100,
            'idCategorie' => $cat1->idCategorie,
        ]);
        $p3 = Produit::create([
            'nomProduit' => 'Huile Moteur 5L',
            'reference' => 'LUB-001',
            'prixUnitaire' => 12500,
            'seuilSecurite' => 10,
            'idCategorie' => $cat2->idCategorie,
        ]);
        $p4 = Produit::create([
            'nomProduit' => 'Filtre à huile',
            'reference' => 'ACC-001',
            'prixUnitaire' => 3500,
            'seuilSecurite' => 5,
            'idCategorie' => $cat3->idCategorie,
        ]);

        // Stocks
        Stock::create(['idProduit' => $p1->idProduit, 'quantiteInitiale' => 5000, 'quantiteRestante' => 3200, 'prixAchat' => 700]);
        Stock::create(['idProduit' => $p2->idProduit, 'quantiteInitiale' => 8000, 'quantiteRestante' => 5500, 'prixAchat' => 650]);
        Stock::create(['idProduit' => $p3->idProduit, 'quantiteInitiale' => 100, 'quantiteRestante' => 8, 'prixAchat' => 10000]);
        Stock::create(['idProduit' => $p4->idProduit, 'quantiteInitiale' => 50, 'quantiteRestante' => 3, 'prixAchat' => 2500]);

        // Ventes
        for ($i = 1; $i <= 10; $i++) {
            Vente::create([
                'idUtilisateur' => $caissier->idUtilisateur,
                'dateVente' => now()->subDays(rand(0, 30)),
                'modePaiement' => ['especes', 'carte', 'mobile_money'][rand(0, 2)],
                'totalHorsTaxe' => $i * 15000,
                'tva' => $i * 2700,
                'totalTaxeComprise' => $i * 17700,
                'statut' => 'validee',
            ]);
        }

        // Alertes
        Alerte::create([
            'idUtilisateur' => $gerant->idUtilisateur,
            'idProduit' => $p3->idProduit,
            'type' => 'stock_faible',
            'message' => 'Stock Huile Moteur 5L sous le seuil critique (8 restants)',
            'niveauUrgence' => 'critique',
            'lue' => false,
        ]);
        Alerte::create([
            'idUtilisateur' => $gerant->idUtilisateur,
            'idProduit' => $p4->idProduit,
            'type' => 'rupture',
            'message' => 'Filtre à huile presque en rupture (3 restants)',
            'niveauUrgence' => 'critique',
            'lue' => false,
        ]);

        // Inventaire
        Inventaire::create([
            'idUtilisateur' => $magasinier->idUtilisateur,
            'idProduit' => $p1->idProduit,
            'quantiteTheorique' => 3200,
            'quantiteReelle' => 3150,
            'ecart' => -50,
            'dateInventaire' => now()->subDays(5),
            'statut' => 'valide',
        ]);
    }
}
