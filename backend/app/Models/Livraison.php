<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Livraison extends Model
{
    protected $table      = 'livraisons';
    protected $primaryKey = 'idLivraison';

    protected $fillable = [
        'dateLivraison',
        'montantTotal',
        'observations',
        'idCommande',
    ];

    protected $casts = [
        'dateLivraison' => 'date',
        'montantTotal'  => 'decimal:2',
    ];

    public function commande()
    {
        return $this->hasOne(Commande::class, 'idLivraison', 'idLivraison');
    }
}