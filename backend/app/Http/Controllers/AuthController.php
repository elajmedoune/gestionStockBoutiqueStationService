<?php

namespace App\Http\Controllers;

use App\Models\Utilisateur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'login'      => 'required|string',
            'motDePasse' => 'required|string',
        ]);

        $user = Utilisateur::where('login', $request->login)
                           ->where('actif', true)
                           ->first();

        if (! $user || ! Hash::check($request->motDePasse, $user->motDePasse)) {
            return response()->json(['message' => 'Identifiants incorrects'], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user'  => [
                'id'     => $user->idUtilisateur,
                'nom'    => $user->nom,
                'prenom' => $user->prenom,
                'login'  => $user->login,
                'email'  => $user->email,
                'role'   => $user->role,
            ]
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Déconnexion réussie']);
    }

    public function me(Request $request)
    {
        $user = $request->user();
        return response()->json([
            'id'     => $user->idUtilisateur,
            'nom'    => $user->nom,
            'prenom' => $user->prenom,
            'login'  => $user->login,
            'email'  => $user->email,
            'role'   => $user->role,
        ]);
    }
}