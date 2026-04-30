<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LigneCommande extends Model
{
    protected $table      = 'lignecommande';
    protected $primaryKey = ['idProduit', 'idCommande']; 
    public $incrementing  = false;                        
    public $timestamps    = false;                        

    protected $fillable = [
        'idCommande',
        'idProduit',
        'quantiteCommande', 
        'quantiteRecu',     
        'montantLigne',    
    ];

    protected $casts = [
        'montantLigne' => 'decimal:2',
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