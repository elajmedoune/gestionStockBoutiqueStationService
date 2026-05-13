<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Fournisseur;

class Commande extends Model
{
    protected $table = 'commandes';
    protected $primaryKey = 'idCommande';

    protected $fillable = [
        'dateCommande',
        'dateLivraisonPrevue',
        'statut',
        'montantTotal',
        'idLivraison',
        'idUtilisateur',
        'idFournisseur',
    ];

    protected $casts = [
        'dateCommande'        => 'date',
        'dateLivraisonPrevue' => 'date',
        'montantTotal'        => 'decimal:2',
    ];
    public function fournisseur()
{
    return $this->belongsTo(
        Fournisseur::class,
        'idFournisseur',
        'idFournisseur'
    );
}

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