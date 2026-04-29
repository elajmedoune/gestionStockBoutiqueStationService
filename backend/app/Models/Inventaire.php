<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Inventaire extends Model
{
    use HasFactory;

    protected $table = 'inventaires';
    protected $primaryKey = 'idInventaire';

    protected $fillable =[
        'dateInventaire',
        'quantiteTheorique',
        'quantiteReelle',
        'observations',
        'statut',
        'idUtilisateur',
        'idProduit',
    ];
    protected $casts =[
        'dateInventaire' =>'date',
    ];
    //ecart est unecolonne GENERATED cote MySQL -- lecture seule
    protected $appends =[];

    //-----------------------------------------------------------------------------------------------------
    //Relations
    //-----------------------------------------------------------------------------------------------------
   
    public function utilisateur(){
        return $this->belongsTo(Utilisateur::class, 'idUtilisateur', 'idUtilisateur');
    }

    public function produit(){
        return $this->belongsTo(\App\Models\Produit::class, 'idProduit', 'idProduit');
    }

    //-----------------------------------------------------------------------------------------------------
    //Statuts possibles
    //-----------------------------------------------------------------------------------------------------
    const STATUTS = ['en_cours', 'conforme', 'deficit', 'surplus'];
}
