<?php

namespace App\Models;

use Illuminate\Databbase\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Alerte extends Model
{
    use HasFactory;

    protected $table = 'alertes';
    protected $primaryKey = 'IdAlerte';

    protected $fillable = [
        'type',
        'message',
        'niveauUrgence',
        'IdUtilisateur',
        'IdProduit',
    ];
    protected $casts = [
        'lue' => 'boolean',
        'dateCreation' => 'datetime',
    ];

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
    //Scopes utiles
    //-----------------------------------------------------------------------------------------------------
    /**Alertes non lues */
    public function scopeNonLues($query){
        return $query->where('lue', 'false');
    }

    /**Alertes critiques */
     public function scopeCritiques($query){
        return $query->where('niveauUrgence', 'critique');
    }

    /**Alertes d'un utilisateur donne */
     public function scopePourUtilisateur($query, int $idUtilisateur){
        return $query->where('IdUtilisateur', '$idUtilisateur');
    }
}
