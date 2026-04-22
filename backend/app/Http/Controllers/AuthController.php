<?php

namespace App\Http\Controllers;

use App\Models\Utilisateur;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'login'      => 'required|string',
            'motDePasse' => 'required|string',
        ]);

        $utilisateur = Utilisateur::where('login', $request->login)
                           ->orWhere('email', $request->login)
                           ->first();

        if (! $utilisateur || ! Hash::check($request->motDePasse, $utilisateur->motDePasse)) {
            throw ValidationException::withMessages([
                'login' => ['Identifiants incorrects.']
            ]);
        }

        if (! $utilisateur->actif) {
            return response()->json([
                'message' => 'Compte desactive. Contactez un administrateur.',
            ], 403);
        }

        $utilisateur->tokens()->delete();

        $token = $utilisateur->createToken(
            'auth_token',
            [$utilisateur->role]
        )->plainTextToken;

        return response()->json([
            'message'      => 'Connexion réussie',
            'token'        => $token,
            'token_type'   => 'Bearer',
            'utilisateur'  => [
                'idUtilisateur' => $utilisateur->idUtilisateur,
                'nom'           => $utilisateur->nom,
                'prenom'        => $utilisateur->prenom,
                'login'         => $utilisateur->login,
                'email'         => $utilisateur->email,
                'role'          => $utilisateur->role,
                'photo'         => $utilisateur->photo,
            ],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Déconnexion réussie']);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json($request->user());
    }

    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nom'        => 'required|string|max:50',
            'prenom'     => 'required|string|max:50',
            'login'      => 'required|string|max:50|unique:utilisateur,login',
            'email'      => 'required|string|max:100|unique:utilisateur,email',
            'motDePasse' => 'required|string|min:8|confirmed',
            'role'       => 'required|in:gerant,caissier,magasinier,gestionnaire_stock',
        ]);

        $utilisateur = Utilisateur::create([
            'nom'        => $validated['nom'],
            'prenom'     => $validated['prenom'],
            'login'      => $validated['login'],
            'email'      => $validated['email'],
            'motDePasse' => Hash::make($validated['motDePasse']),
            'role'       => $validated['role'],
            'actif'      => true,
        ]);

        return response()->json([
            'message'     => 'Utilisateur créé avec succès',
            'utilisateur' => $utilisateur,
        ], 201);
    }

    public function toggleActif(int $id): JsonResponse
    {
        $utilisateur = Utilisateur::findOrFail($id);
        $utilisateur->update(['actif' => ! $utilisateur->actif]);
        $etat = $utilisateur->actif ? 'activé' : 'désactivé';
        return response()->json([
            'message'     => "Compte $etat avec succès",
            'utilisateur' => $utilisateur,
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