<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Vente extends Model
{
    protected $table      = 'Vente';
    protected $primaryKey = 'idVente';

    protected $fillable = [
        'dateVente',
        'montantTotal',
        'totalHorsTaxe',
        'tva',
        'modePaiement',
        'totalTaxeComprise',
        'idUtilisateur',
        'statut',
    ];

    protected $casts = [
        'dateVente'         => 'datetime',
        'montantTotal'      => 'decimal:2',
        'totalHorsTaxe'     => 'decimal:2',
        'tva'               => 'decimal:2',
        'totalTaxeComprise' => 'decimal:2',
    ];

    public function utilisateur()
    {
        return $this->belongsTo(Utilisateur::class, 'idUtilisateur', 'idUtilisateur');
    }

    public function lignes()
    {
        return $this->hasMany(LigneVente::class, 'idVente', 'idVente');
    }
}