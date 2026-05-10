<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Auth\Passwords\CanResetPassword;
use Illuminate\Contracts\Auth\CanResetPassword as CanResetPasswordContract;
use Laravel\Sanctum\HasApiTokens;

class Utilisateur extends Authenticatable implements CanResetPasswordContract
{
    use HasApiTokens, HasFactory, Notifiable, CanResetPassword;

    // Nom de la table personnalisé
    protected $table      = 'utilisateurs';
    protected $primaryKey = 'idUtilisateur';

    protected $fillable = [
        'nom',
        'prenom',
        'login',
        'email',
        'motDePasse',
        'actif',
        'role',
        'photo',
    ];

    protected $hidden = [
        'motDePasse',
        'remember_token',
    ];

    protected $casts = [
        'actif' => 'boolean',
    ];

    // Laravel attend "password" pour l'auth — on pointe vers motDePasse
    public function getAuthPassword(): string
    {
        return $this->motDePasse;
    }

    // Email utilisé pour envoyer le lien de reset (vient du trait CanResetPassword,
    // mais on l'override pour être explicite)
    public function getEmailForPasswordReset(): string
    {
        return $this->email;
    }

    //-------------------------------------------------------------------
    // Relations
    //-------------------------------------------------------------------
    public function inventaires()
    {
        return $this->hasMany(Inventaire::class, 'idUtilisateur', 'idUtilisateur');
    }

    public function alertes()
    {
        return $this->hasMany(Alerte::class, 'idUtilisateur', 'idUtilisateur');
    }

    public function ventes()
    {
        return $this->hasMany(Vente::class, 'idUtilisateur', 'idUtilisateur');
    }

    public function commandes()
    {
        return $this->hasMany(Commande::class, 'idUtilisateur', 'idUtilisateur');
    }

    public function isMangasinier(): bool
    {
        return $this->role === 'magasinier';
    }

    public function isGestionnaireStock(): bool
    {
        return $this->role === 'gestionnaire_stock';
    }

    public function isCaissier(): bool
    {
        return $this->role === 'caissier';
    }

    public function isGerant(): bool
    {
        return $this->role === 'gerant';
    }
}