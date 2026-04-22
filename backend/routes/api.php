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

Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');

Route::middleware(['auth:sanctum', 'throttle:200,1'])->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']);

    Route::middleware('role:gerant')->group(function() {
        Route::post('/register',                        [AuthController::class, 'register']);
        Route::patch('/utilisateurs/{id}/toggleActif',  [AuthController::class, 'toggleActif']);
    });

    Route::post('/profil/photo',     [AuthController::class, 'uploadPhoto']);
    Route::put('/profil',            [AuthController::class, 'updateProfil']);
    Route::put('/profil/password',   [AuthController::class, 'updatePassword']);

    Route::middleware('role:gerant,gestionnaire_stock')->group(function() {
        Route::get('/inventaires/rapport',  [InventaireController::class, 'rapport']);
        Route::get('/inventaires',          [InventaireController::class, 'index']);
        Route::get('/inventaires/{id}',     [InventaireController::class, 'show']);
        Route::post('/inventaires',         [InventaireController::class, 'store']);
        Route::put('/inventaires/{id}',     [InventaireController::class, 'update']);
        Route::delete('/inventaires/{id}',  [InventaireController::class, 'destroy']);
    });

    Route::get('/alertes',               [AlerteController::class, 'index']);
    Route::get('/alertes/stats',         [AlerteController::class, 'stats']);
    Route::get('/alertes/{id}',          [AlerteController::class, 'show']);
    Route::patch('/alertes/lire_tout',   [AlerteController::class, 'marquerToutLu']);
    Route::patch('/alertes/{id}/lire',   [AlerteController::class, 'marquerLue']);

<<<<<<< HEAD
    // Alertes — Création / suppression : admin + gestionnaire
    Route::middleware('role:mangasinier, gestionnaireStock')->group(function() {
=======
    Route::middleware('role:gerant,gestionnaire_stock')->group(function() {
>>>>>>> 5a4f99ee5a091014743c40bcc320d062e9c388fc
        Route::post('/alertes',         [AlerteController::class, 'store']);
        Route::delete('/alertes/{id}',  [AlerteController::class, 'destroy']);
    });

    Route::apiResource('categories',   CategorieController::class);
    Route::apiResource('fournisseurs', FournisseurController::class);
    Route::apiResource('produits',     ProduitController::class);
    Route::apiResource('stocks',       StockController::class);

    Route::get('/ventes/rapport', [VenteController::class, 'rapport']);
    Route::apiResource('ventes', VenteController::class);

    Route::apiResource('commandes', CommandeController::class);
    Route::apiResource('livraisons', LivraisonController::class);
});