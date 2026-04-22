<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Stock extends Model
{
    protected $table = 'stocks';
    protected $primaryKey = 'idStock';
    protected $fillable = [
        'quantiteInitiale', 'dateEntree',
        'dateExpiration', 'quantiteRestante', 'prixEnGros',
        'prixAchat', 'idProduit',
    ];

    public function produit() {
        return $this->belongsTo(Produit::class, 'idProduit');
    }
}
