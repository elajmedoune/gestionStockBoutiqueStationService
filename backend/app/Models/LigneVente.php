<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LigneVente extends Model
{
    protected $table      = 'LigneVente';
    protected $primaryKey = 'IdLigneVente';
    public    $timestamps = false;

    protected $fillable = [
        'quantite',
        'prixUnitaire',
        'IdVente',
        'IdProduit',
    ];

    protected $casts = [
        'prixUnitaire' => 'decimal:2',
        'sousTotal'    => 'decimal:2',
    ];

    public function vente()
    {
        return $this->belongsTo(Vente::class, 'IdVente', 'IdVente');
    }

    public function produit()
    {
        return $this->belongsTo(Produit::class, 'IdProduit', 'IdProduit');
    }
}