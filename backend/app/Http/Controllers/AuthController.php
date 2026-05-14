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
            'login'      => 'required|string|max:50|unique:utilisateurs,login',
            'email'      => ['required', 'max:100', 'unique:utilisateurs,email',
                            'regex:/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/'],
            'motDePasse' => ['required', 'string', 'min:8', 'confirmed',
                             'regex:/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!*_\-@]).{8,}$/'],
            'role'       => 'required|in:gerant,caissier,magasinier,gestionnaire_stock',
        ], [
            'nom.required'          => 'Le nom est obligatoire.',
            'prenom.required'       => 'Le prénom est obligatoire.',
            'login.required'        => 'Le login est obligatoire.',
            'login.unique'          => 'Ce login est déjà utilisé.',
            'email.required'        => 'L\'email est obligatoire.',
            'email.unique'          => 'Cet email est déjà utilisé.',
            'email.regex'           => 'Format email invalide. Exemple valide : prenom@domaine.sn',
            'motDePasse.required'   => 'Le mot de passe est obligatoire.',
            'motDePasse.min'        => 'Le mot de passe doit contenir au moins 8 caractères.',
            'motDePasse.confirmed'  => 'La confirmation du mot de passe ne correspond pas.',
            'motDePasse.regex'      => 'Le mot de passe doit contenir au moins une majuscule, un chiffre et un caractère spécial (! * _ -).',
            'role.required'         => 'Le rôle est obligatoire.',
            'role.in'               => 'Rôle invalide.',
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

        // Envoi email
        \Illuminate\Support\Facades\Mail::raw(
            "Bonjour {$utilisateur->prenom},\n\nVotre compte a été créé.\nLogin : {$validated['login']}\nMot de passe : {$validated['motDePasse']}\n\nConnectez-vous sur : http://localhost:5173",
            function ($message) use ($utilisateur) {
                $message->to($utilisateur->email)
                        ->subject('Vos identifiants de connexion - GestStock');
            }
        );

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

    // GET /api/utilisateurs
    public function index(): JsonResponse
    {
        $utilisateurs = Utilisateur::orderBy('nom')->paginate(20);
        return response()->json($utilisateurs);
    }

    // GET /api/utilisateurs/{id}
    public function show(int $id): JsonResponse
    {
        $utilisateur = Utilisateur::findOrFail($id);
        return response()->json($utilisateur);
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

    public function removePhoto(Request $request)
    {
        $user = $request->user();
        $user->photo = null;
        $user->save();
        return response()->json(['message' => 'Photo supprimée']);
    }

    public function updateProfil(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'login' => 'sometimes|string|max:50|unique:utilisateurs,login,' . $user->idUtilisateur . ',idUtilisateur',
            'nom'   => 'sometimes|string|max:50',
            'prenom'=> 'sometimes|string|max:50',
            'email' => ['sometimes', 'max:100', 
                        'unique:utilisateurs,email,' . $user->idUtilisateur . ',idUtilisateur',
                        'regex:/^[a-zA-Z0-9\-]+@[a-zA-Z.\-]+\.[a-zA-Z]{2,3}$/'],
        ], [
            'login.unique'  => 'Ce login est déjà utilisé.',
            'login.max'     => 'Le login ne peut pas dépasser 50 caractères.',
            'email.unique'  => 'Cet email est déjà utilisé.',
            'email.regex'   => 'Format email invalide. Exemple valide : prenom@domaine.sn',
        ]);
        $user->nom    = $request->nom ?? $user->nom;
        $user->prenom = $request->prenom ?? $user->prenom;
        $user->email  = $request->email ?? $user->email;
        $user->login  = $request->login ?? $user->login;
        $user->save();
        
        return response()->json(['message' => 'Profil mis à jour']);
    }

    public function updatePassword(Request $request)
    {
        $user = $request->user();
        
        $request->validate([
           'ancien_mot_de_passe'  => 'required|string',
            'nouveau_mot_de_passe' => ['required', 'string', 'min:8',
                                    'regex:/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!*_\-]).{8,}/'],
        ], [
            'ancien_mot_de_passe.required'  => 'L\'ancien mot de passe est obligatoire.',
            'nouveau_mot_de_passe.required' => 'Le nouveau mot de passe est obligatoire.',
            'nouveau_mot_de_passe.min'      => 'Le nouveau mot de passe doit contenir au moins 8 caractères.',
            'nouveau_mot_de_passe.regex'    => 'Le nouveau mot de passe doit contenir au moins une majuscule, un chiffre et un caractère spécial (! * _ -).',
        ]);
        if (!Hash::check($request->ancien_mot_de_passe, $user->motDePasse)) {
            return response()->json(['message' => 'Ancien mot de passe incorrect'], 401);
        }
        $user->motDePasse = Hash::make($request->nouveau_mot_de_passe);
        $user->save();
        return response()->json(['message' => 'Mot de passe modifié']);
    }
    public function update(Request $request, int $id): JsonResponse{
        $utilisateur = Utilisateur::findOrFail($id);
        $request->validate([
            'nom'                                      =>'sometimes|string|max:50',
            'prenom'                                   =>'sometimes|string|max:50',
            'login'                                    =>['sometimes','string','max:50', \Illuminate\Validation\Rule::unique('utilisateurs','login')->ignore($id, 'idUtilisateur')],
            'email'                                    =>['sometimes','string','max:100', \Illuminate\Validation\Rule::unique('utilisateurs','email')->ignore($id, 'idUtilisateur')],
            'role'                                     =>'sometimes|in:gerant,caissier,magasinier,gestionnaire_stock',
            'motDePasse'                               =>'sometimes|string|min:8|confirmed',
            ]);
            if ($request->has('motDePasse')&& $request->motDePasse) {
                $utilisateur->motDePasse = hash::make($request->motDePasse);
            }
            $utilisateur->fill($request->except(['motDePasse', 'motDePasse_confirmation']));
            $utilisateur->save();
            return response()->json(['message' => 'Utilisateur modifié', 'utilisateur' =>$utilisateur]);
    }
    public function destroy(int $id): JsonResponse{
        $utilisateur = Utilisateur::findOrFail($id);
        $utilisateur->tokens()->delete();
        $utilisateur->delete();
        return response()->json(['message' =>'Utilisateur supprimé']);
    }
}