<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Produit extends Model
{
    protected $table = 'produits';
    protected $primaryKey = 'idProduit';
    protected $fillable = [
        'reference', 'codeBarre', 'photo',
        'prixUnitaire', 'seuilSecurite', 'idCategorie'
    ];

    public function categorie() {
        return $this->belongsTo(Categorie::class, 'idCategorie');
    }
    public function stocks() {
        return $this->hasMany(Stock::class, 'idProduit');
    }
    public function fournisseurs() {
        return $this->belongsToMany(
            Fournisseur::class,
            'produit_fournisseur',
            'idProduit',
            'idFournisseur',
        );
    }
}
