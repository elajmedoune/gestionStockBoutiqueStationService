<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Stock extends Model
{
    protected $table = 'stocks';
    protected $primaryKey = 'idStock';
    protected $fillable = [
        'quantiteInitiale', 'dateEntree',
        'dateExpiration', 'prixEnGros',
        'prixAchat', 'idProduit',
    ];

    public function produit() {
        return $this->belongsTo(Produit::class, 'idProduit');
    }
    public function alertes(){
        return $this->hasMany(Alerte::class, 'idStock', 'idStock');
    }

}
