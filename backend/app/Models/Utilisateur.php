<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Utilisateur extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    //Nom de la table personnalisé
    protected $table      = 'Utilisateur';
    protected $primaryKey = 'IdUtilisateur';

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

    //Laravel attend "password" pour l'auth -- on pointe vers motDePasse
    public function getAuthPassword(): string
    {
        return $this->motDePasse;
    }

    //-------------------------------------------------------------------
    //Relations
    //-------------------------------------------------------------------
    public function inventaires(){
       return $this->hasMany(Inventaire::class, 'IdUtilisateur', 'IdUtilisateur'); 
    }

    public function alertes(){
       return $this->hasMany(Alerte::class, 'IdUtilisateur', 'IdUtilisateur'); 
    }
    public function ventes()
    {
        return $this->hasMany(Vente::class, 'idUtilisateur', 'idUtilisateur');
    }

    public function commandes()
    {
        return $this->hasMany(Commande::class, 'idUtilisateur', 'idUtilisateur');
    }

    //--------------------------------------------------------------------
    //Helpers roles
    //--------------------------------------------------------------------
    public function isMangasinier(): bool{
        return $this->role === 'mangasinier';
    }
    
     public function isGestionnaireStock(): bool{
        return $this->role === 'gestionnaireStock';
    }

     public function isCaissier(): bool{
        return $this->role === 'caissier';
    }

     public function isGerant(): bool{
        return $this->role === 'gerant';
    }
}