<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SessionCaisse extends Model
{
    protected $table      = 'sessions_caisse';
    protected $primaryKey = 'idSession';

    protected $fillable = [
        'idUtilisateur',
        'dateOuverture',
        'dateFermeture',
        'fondsOuverture',
        'fondsFermeture',
        'montantVentes',
        'ecart',
        'observations',
        'statut',
    ];

    protected $casts = [
        'dateOuverture'  => 'datetime',
        'dateFermeture'  => 'datetime',
        'fondsOuverture' => 'decimal:2',
        'fondsFermeture' => 'decimal:2',
        'montantVentes'  => 'decimal:2',
        'ecart'          => 'decimal:2',
    ];

    public function utilisateur()
    {
        return $this->belongsTo(Utilisateur::class, 'idUtilisateur', 'idUtilisateur');
    }

    /**
     * Ventes réalisées par le caissier pendant cette session (pas de FK directe :
     * on délimite par utilisateur + plage horaire de la session).
     */
    public function ventesQuery()
    {
        return Vente::where('idUtilisateur', $this->idUtilisateur)
            ->where('statut', '!=', 'annulee')
            ->where('dateVente', '>=', $this->dateOuverture)
            ->when($this->dateFermeture, fn ($q) => $q->where('dateVente', '<=', $this->dateFermeture));
    }
}
