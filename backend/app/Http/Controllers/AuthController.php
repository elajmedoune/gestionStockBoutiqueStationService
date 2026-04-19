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
                'photo'  => $user->photo,
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
            'photo'  => $user->photo,
        ]);
    }
    public function uploadPhoto(Request $request)
    {
        $request->validate(['photo' => 'required|image|max:2048']);
        $user = $request->user();
        $path = $request->file('photo')->store('photos', 'public');
        $user->photo = $path;
        $user->save();
        return response()->json(['photo' => $path]);
    }

    public function updateProfil(Request $request)
    {
        $user = $request->user();
        $user->nom    = $request->nom;
        $user->prenom = $request->prenom;
        $user->email  = $request->email;
        $user->save();
        return response()->json(['message' => 'Profil mis à jour']);
    }

    public function updatePassword(Request $request)
    {
        $user = $request->user();
        if (!Hash::check($request->ancien_mot_de_passe, $user->motDePasse)) {
            return response()->json(['message' => 'Ancien mot de passe incorrect'], 401);
            }
        $user->motDePasse = Hash::make($request->nouveau_mot_de_passe);
        $user->save();
        return response()->json(['message' => 'Mot de passe modifié']);
    }
}