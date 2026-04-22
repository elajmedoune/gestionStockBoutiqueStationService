<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Inventaire extends Model
{
    use HasFactory;

    protected $table = 'inventaires';
    protected $primaryKey = 'IdInventaire';

    protected $fillable =[
        'dateInventaire',
        'quantiteTheorique',
        'quantiteReelle',
        'observations',
        'statut',
        'IdUtilisateur',
        'IdProduit',
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
        return $this->belongsTo(Utilisateur::class, 'IdUtilisateur', 'IdUtilisateur');
    }

    public function produit(){
        return $this->belongsTo(\App\Models\Produit::class, 'IdProduit', 'IdProduit');
    }

    //-----------------------------------------------------------------------------------------------------
    //Statuts possibles
    //-----------------------------------------------------------------------------------------------------
    const STATUTS = ['en_cours', 'conforme', 'deficit', 'surplus'];
}
