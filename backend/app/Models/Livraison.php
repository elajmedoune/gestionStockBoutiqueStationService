<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Livraison extends Model
{
    protected $table      = 'Livraison';
    protected $primaryKey = 'IdLivraison';

    protected $fillable = [
        'dateLivraison',
        'montantTotal',
        'observations',
        'IdCommande',
    ];

    protected $casts = [
        'dateLivraison' => 'date',
        'montantTotal'  => 'decimal:2',
    ];

    public function commande()
    {
        return $this->belongsTo(Commande::class, 'IdCommande', 'IdCommande');
    }
}