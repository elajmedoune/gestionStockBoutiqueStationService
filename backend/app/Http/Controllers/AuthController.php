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
        ]);
    }
}