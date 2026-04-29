<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Alerte extends Model
{
    use HasFactory;

    protected $table = 'alertes';
    protected $primaryKey = 'idAlerte';

    protected $fillable = [
        'type',
        'message',
        'niveauUrgence',
        'idUtilisateur',
        'idStock',
    ];
    protected $casts = [
        'lue' => 'boolean',
        'dateCreation' => 'datetime',
    ];
    public $timestamps = false;

    //-----------------------------------------------------------------------------------------------------
    //Relations
    //-----------------------------------------------------------------------------------------------------
   
    public function utilisateur(){
        return $this->belongsTo(Utilisateur::class, 'idUtilisateur', 'idUtilisateur');
    }

    public function stock(){
        return $this->belongsTo(\App\Models\Stock::class, 'idStock', 'idStock');
    }

    //-----------------------------------------------------------------------------------------------------
    //Scopes utiles
    //-----------------------------------------------------------------------------------------------------
    /**Alertes non lues */
    public function scopeNonLues($query){
        return $query->where('lue', false);
    }

    /**Alertes critiques */
     public function scopeCritiques($query){
        return $query->where('niveauUrgence', critique);
    }

    /**Alertes d'un utilisateur donne */
     public function scopePourUtilisateur($query, int $idUtilisateur){
        return $query->where('idUtilisateur', $idUtilisateur);
    }
}
