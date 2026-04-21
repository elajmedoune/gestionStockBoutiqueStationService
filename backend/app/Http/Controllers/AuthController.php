<?php

namespace App\Http\Controllers;

use App\Models\Utilisateur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    //--------------------------------------------------------------------------------
    //POST /api/login
    //--------------------------------------------------------------------------------
    public function login(Request $request):JsonResponse
    {
        $request->validate([
            'login'      => 'required|string',
            'motDePasse' => 'required|string',
        ]);

        $utilisateur = Utilisateur::where('login', $request->login)
                           ->orWhere('email', $request->login)
                           ->first();

        //Verification mot de passe
        if (! $utilisateur || ! Hash::check($request->motDePasse, $utilisateur->motDePasse)) {
            throw ValidationException::withMessages([
                'login' => ['Identifiants incorrects.']
            ]);
        }

        //Compte desactive
         if (! $utilisateur->actif) {
            return reponse()->json([
                'message' => ['Compte desactive. Connectez un administrateur.'],
            ], 403);
        }

        //Supprimer les anciens tokens (une session a la fois)
        $utilisateur->tokens()->delete();
        //Creer le token selon le role
        $token = $utilisateur->createToken(
            'auth_token',
            [$utilisateur->role]   //abilities = role de l'utilisateur
        )->plainTextTocken;
        return response()->json([
<<<<<<< HEAD
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
=======
            'message'    => 'Connexion réussie',
            'token'      => $token,
            'token_type' => 'Bearer',
            'utilisateur'  => [
                'idUtilisateur'     => $utilisateur->idUtilisateur,
                'nom'               => $utilisateur->nom,
                'prenom'            => $utilisateur->prenom,
                'login'             => $utilisateur->login,
                'email'             => $utilisateur->email,
                'role'              => $utilisateur->role,
            ],
>>>>>>> origin/badiene
        ]);
    }

    //--------------------------------------------------------------------------------
    //POST /api/logout
    //--------------------------------------------------------------------------------

    public function logout(Request $request): JsonResponse
    {
        //Revoquer le token courant
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Déconnexion réussie']);
    }

     //--------------------------------------------------------------------------------
    //POST /api/me
    //--------------------------------------------------------------------------------

    public function me(Request $request): JsonResponse
    {
        return response()->json($request->user());
    }

     //--------------------------------------------------------------------------------
    //POST /api/register (admin seulement)
    //--------------------------------------------------------------------------------
     public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nom'          => 'required|string|max:50',
            'prenom'       => 'required|string|max:50',
            'login'        => 'required|string|max:50|unique:Utilisateur,login',
            'email'        => 'required|string|max:100|unique:Utilisateur,mail',
            'motDePasse'   => 'required|string|min:8|confirmed',
            'role'         => 'required|in:admin, gestionnaire, caissier',
        ]);
        $utilisateur = Utilisateur::create([
            'nom'          => $validated['nom'],
            'prenom'       => $validated['prenom'],
            'login'        => $validated['login'],
            'email'        => $validated['email'],
            'motDePasse'   => Hash::make($validated['motDePasse']),
            'role'         => $validated['role'],
            'actif'        =>true,
        ]);
        
        return response()->json([
<<<<<<< HEAD
            'id'     => $user->idUtilisateur,
            'nom'    => $user->nom,
            'prenom' => $user->prenom,
            'login'  => $user->login,
            'email'  => $user->email,
            'role'   => $user->role,
            'photo'  => $user->photo,
=======
            'message'      => 'Utilisateur cree avec succes',
            'utilisateur'  => $utilisateur,
        ], 201);
    }
    //--------------------------------------------------------------------------------
    //POST /api/utilisateurs/{id}/toggle-actif  (admin seulement)
    //--------------------------------------------------------------------------------
    public function toggleActif(int $id): JsonResponse{
        $utilisateur = Utilisateur::findOrFail($id);
        $utilisateur->update(['actif' => ! $utilisateur->actif]);
        $etat = $utilisateur->actif ? 'activé' : 'désactivé';
        return response()->json([
            'message'      =>"Compte $etat avec succés",
            'utilisateur'  =>$utilisateur,
>>>>>>> origin/badiene
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