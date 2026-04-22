<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LigneCommande extends Model
{
    protected $table      = 'lignecommande';
    protected $primaryKey = 'idLigneCommande';

    protected $fillable = [
        'idCommande',
        'idProduit',
        'quantite',
        'prixUnitaire',
        'sousTotal',
    ];

    protected $casts = [
        'prixUnitaire' => 'decimal:2',
        'sousTotal'    => 'decimal:2',
    ];

    public function commande()
    {
        return $this->belongsTo(Commande::class, 'idCommande', 'idCommande');
    }

    public function produit()
    {
        return $this->belongsTo(Produit::class, 'idProduit', 'idProduit');
    }
}