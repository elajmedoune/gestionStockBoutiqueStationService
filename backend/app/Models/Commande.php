<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Commande extends Model
{
    protected $table      = 'Commande';
    protected $primaryKey = 'idCommande';

    protected $fillable = [
        'dateCommande',
        'dateLivraisonPrevue',
        'statut',
        'montantTotal',
        'idLivraison',
        'idUtilisateur',
    ];

    protected $casts = [
        'dateCommande'        => 'date',
        'dateLivraisonPrevue' => 'date',
        'montantTotal'        => 'decimal:2',
    ];

    public function utilisateur()
    {
        return $this->belongsTo(Utilisateur::class, 'idUtilisateur', 'idUtilisateur');
    }

    public function livraison()
    {
        return $this->belongsTo(Livraison::class, 'idLivraison', 'idLivraison');
    }

    public function lignes()
    {
        return $this->hasMany(LigneCommande::class, 'idCommande', 'idCommande');
    }
}