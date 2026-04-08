<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Commande extends Model
{
    protected $table      = 'Commande';
    protected $primaryKey = 'IdCommande';

    protected $fillable = [
        'dateCommande',
        'dateLivraisonPrevue',
        'statut',
        'montantTotal',
        'IdFournisseur',
        'IdProduit',
    ];

    protected $casts = [
        'dateCommande'        => 'date',
        'dateLivraisonPrevue' => 'date',
        'montantTotal'        => 'decimal:2',
    ];

    public function fournisseur()
    {
        return $this->belongsTo(Fournisseur::class, 'IdFournisseur', 'IdFournisseur');
    }

    public function produit()
    {
        return $this->belongsTo(Produit::class, 'IdProduit', 'IdProduit');
    }

    public function livraison()
    {
        return $this->hasOne(Livraison::class, 'IdCommande', 'IdCommande');
    }
}