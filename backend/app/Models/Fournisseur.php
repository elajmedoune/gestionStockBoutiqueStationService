<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Fournisseur extends Model
{
    protected $table = 'fournisseurs';
    protected $primaryKey = 'idFournisseur';
    protected $fillable = [
        'nom', 'photo', 'telephone', 'email',
        'adresse', 'delaiLivraison'
    ];

    public function produits() {
        return $this->belongsToMany(
            Produit::class,
            'produit_fournisseur',
            'idFournisseur',
            'idProduit',
        );
    }
}
