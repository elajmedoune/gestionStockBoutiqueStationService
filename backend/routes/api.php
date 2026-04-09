<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\VenteController;
use App\Http\Controllers\CommandeController;
use App\Http\Controllers\LivraisonController;

// ============================================================
//  Routes publiques — pas besoin d'être connecté
// ============================================================
Route::post('/login',  [AuthController::class, 'login'])->middleware('throttle:5,1');

// ============================================================
//  Routes protégées — token Sanctum obligatoire
// ============================================================
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']);

    // Ventes
    Route::apiResource('ventes', VenteController::class);
    Route::get('/ventes/rapport', [VenteController::class, 'rapport']);

    // Commandes
    Route::apiResource('commandes', CommandeController::class);

    // Livraisons
    Route::apiResource('livraisons', LivraisonController::class);
});