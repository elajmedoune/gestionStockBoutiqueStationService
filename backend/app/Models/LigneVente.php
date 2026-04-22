<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LigneVente extends Model
{
    protected $table = 'lignevente';
    public    $incrementing = false;
    public    $timestamps   = false;
    protected $primaryKey   = 'idProduit';

    protected $fillable = [
        'idProduit',
        'idVente',
        'quantite',
        'totalPartielle',
    ];

    protected $casts = [
        'idProduit'      => 'integer',
        'idVente'        => 'integer',
        'quantite'       => 'integer',
        'totalPartielle' => 'decimal:2',
    ];

    public static function findByKeys(int $idProduit, int $idVente): ?self
    {
        return static::where('idProduit', $idProduit)
                     ->where('idVente', $idVente)
                     ->first();
    }

    public function vente()
    {
        return $this->belongsTo(Vente::class, 'idVente', 'idVente');
    }

    public function produit()
    {
        return $this->belongsTo(Produit::class, 'idProduit', 'idProduit');
    }
}