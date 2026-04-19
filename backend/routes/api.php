<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

use App\Http\Controllers\CategorieController;
use App\Http\Controllers\FournisseurController;
use App\Http\Controllers\ProduitController;
use App\Http\Controllers\StockController;

use App\Http\Controllers\VenteController;
use App\Http\Controllers\CommandeController;
use App\Http\Controllers\LivraisonController;


//  Routes publiques — pas besoin d'être connecté
Route::post('/login',  [AuthController::class, 'login'])->middleware('throttle:5,1');

//  Routes protégées — token Sanctum obligatoire
Route::middleware(['auth:sanctum', 'throttle:50,1'])->group(function () {

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']);

    // Categories, fournisseur, produit, stock
    Route::apiResource('categories', CategorieController::class);
    Route::apiResource('fournisseurs', FournisseurController::class);
    Route::apiResource('produits', ProduitController::class);
    Route::apiResource('stocks', StockController::class);

    // Profil

    Route::post('/profil/photo', [AuthController::class, 'uploadPhoto']);
    Route::put('/profil', [AuthController::class, 'updateProfil']);
    Route::put('/profil/password', [AuthController::class, 'updatePassword']);

    // Ventes
    Route::get('/ventes/rapport', [VenteController::class, 'rapport']);
    Route::apiResource('ventes', VenteController::class);

    // Commandes
    Route::apiResource('commandes', CommandeController::class);

    // Livraisons
    Route::apiResource('livraisons', LivraisonController::class);
});