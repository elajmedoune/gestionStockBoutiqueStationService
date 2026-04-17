<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

use App\Http\Controllers\CategorieController;
use App\Http\Controllers\FournisseurController;
use App\Http\Controllers\ProduitController;
use App\Http\Controllers\StockController;

use App\Http\Controllers\VenteController;
use App\Http\Controllers\InventaireController;
use App\Http\Controllers\AlerteController;
use App\Http\Controllers\CommandeController;
use App\Http\Controllers\LivraisonController;


//  Routes publiques — pas besoin d'être connecté
Route::post('/login',  [AuthController::class, 'login'])->middleware('throttle:5,1');

//  Routes protégées — token Sanctum obligatoire
Route::middleware(['auth:sanctum', 'throttle:50,1'])->group(function () {

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']);

<<<<<<< HEAD
    //Gestion des utilisateurs (admin seulement)
    Route::middleware('role:admin')->group(function() {
        Route::post(' /register',                       [AuthController::class, 'register']);
        Route::patch(' /utilisateurs/{id}/toggleActif', [AuthController::class, 'toggleActif']);
    });

    //-----Inventaires-----

    //Lecture : admin + gestionnaire
    Route::middleware('role:admin, gestionnaire')->group(function() {
        Route::get(' /inventaires/rapport', [InventaireController::class, 'rapport']);
        Route::get(' /inventaires',         [InventaireController::class, 'index']);
        Route::get(' /inventaires/{id}',    [InventaireController::class, 'show']);
    });

    //Ecriture : admin + gestionnaire
     Route::middleware('role:admin, gestionnaire')->group(function() {
        Route::post(' /inventaires',        [InventaireController::class, 'store']);
        Route::put(' /inventaires/{id}',    [InventaireController::class, 'update']);
        Route::delete(' /inventaires/{id}', [InventaireController::class, 'destroy']);
    });

    //----Alertes----

    //Lecture: tous les roles connectes
     Route::get(' /alertes',       [AlerteController::class, 'index']);
     Route::get(' /alertes/stats', [AlerteController::class, 'stats']);
     Route::get(' /alertes/{id}',  [AlerteController::class, 'show']);

    //Marquer comme lue : tous les roles connectes
    Route::patch(' /alertes/lire_tout',  [AlerteController::class, 'marquerToutLu']);
    Route::patch(' /alertes//{id}/lire', [AlerteController::class, 'marquerLue']);

    //Creation / suppression manuelle: admin + gestionnaire
     Route::middleware('role:admin, gestionnaire')->group(function() {
        Route::post(' /alertes',        [AlerteController::class, 'store']);
        Route::delete(' /alertes/{id}', [AlerteController::class, 'destroy']);
     });

    // Categories, fournisseur, produit, stock
    Route::apiResource('categories',   CategorieController::class);
    Route::apiResource('fournisseurs', FournisseurController::class);
    Route::apiResource('produits',     ProduitController::class);
    Route::apiResource('stocks',       StockController::class);

>>>>>>> origin/main
    // Ventes
    Route::get('/ventes/rapport', [VenteController::class, 'rapport']);
    Route::apiResource('ventes', VenteController::class);

    // Commandes
    Route::apiResource('commandes', CommandeController::class);

    // Livraisons
    Route::apiResource('livraisons', LivraisonController::class);
});