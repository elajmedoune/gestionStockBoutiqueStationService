<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LigneVente extends Model
{
    protected $table      = 'LigneVente';
    public    $incrementing = false;
    public    $timestamps   = false;

    protected $primaryKey = ['idProduit', 'idVente'];

    protected $fillable = [
        'idProduit',
        'idVente',
        'quantite',
        'totalPartielle',
    ];

    protected $casts = [
        'totalPartielle' => 'decimal:2',
    ];

    public function vente()
    {
        return $this->belongsTo(Vente::class, 'idVente', 'idVente');
    }

    public function produit()
    {
        return $this->belongsTo(Produit::class, 'idProduit', 'idProduit');
    }
}