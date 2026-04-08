<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class Utilisateur extends Authenticatable
{
    use HasApiTokens;

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
    ];

    protected $hidden = [
        'motDePasse',
    ];

    protected $casts = [
        'actif' => 'boolean',
    ];

    public function getAuthPassword()
    {
        return $this->motDePasse;
    }

    public function ventes()
    {
        return $this->hasMany(Vente::class, 'IdUtilisateur', 'IdUtilisateur');
    }
}