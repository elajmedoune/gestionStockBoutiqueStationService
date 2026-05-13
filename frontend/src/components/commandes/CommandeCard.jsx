// src/components/commandes/CommandeCard.jsx

import { Pencil, Trash2, Clock, CheckCircle, Truck, Package, AlertTriangle, CalendarX, User, Calendar, DollarSign, PackageCheck, XCircle } from 'lucide-react'
const STATUT_CONFIG = {
    en_attente: { label: 'En attente', badge: 'badge-warning',  icon: <Clock        size={12} /> },
    confirmee:  { label: 'Confirmée',  badge: 'badge-info',     icon: <CheckCircle  size={12} /> },
    expediee:   { label: 'Expédiée',   badge: 'badge-secondary',icon: <Truck        size={12} /> },
    livree:     { label: 'Livrée',     badge: 'badge-success',  icon: <PackageCheck size={12} /> },
    annulee:    { label: 'Annulée',    badge: 'badge-error',    icon: <XCircle      size={12} /> },
}

const STATUTS = ['en_attente', 'confirmee', 'expediee', 'livree']

const fmt = n => new Intl.NumberFormat('fr-FR').format(Math.round(n || 0))

function CommandeCard({ commande, onEdit, onDelete, canDelete, onStatutChange }) {
    const statut   = commande.statut || 'en_attente'
    const config   = STATUT_CONFIG[statut] ?? { label: statut, badge: 'badge-ghost', icon: null }
    const today    = new Date(); today.setHours(0, 0, 0, 0)
    const prevue   = commande.dateLivraisonPrevue ? new Date(commande.dateLivraisonPrevue) : null
    const enRetard = prevue && prevue < today && statut !== 'livree' && statut !== 'annulee'
    const joursRetard = enRetard ? Math.floor((today - prevue) / (1000 * 60 * 60 * 24)) : 0

    return (
        <div className={`card bg-base-100 shadow-sm border transition-all duration-200 hover:-translate-y-1 hover:shadow-md 
            ${enRetard ? 'border-error/40' : 'border-base-200'}
            ${statut === 'livree' || statut === 'annulee' ? 'opacity-60' : ''}
        `}>
            <div className="card-body p-4 space-y-3">

                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                    <div>
                        <p className="font-extrabold text-base-content">Commande #{commande.idCommande}</p>
                        <p className="text-xs text-base-content/40 flex items-center gap-1 mt-0.5">
                            <Calendar size={11} /> {commande.dateCommande ? new Date(commande.dateCommande).toLocaleDateString('fr-FR') : '—'}
                        </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <span className={`badge badge-sm gap-1 font-semibold ${config.badge}`}>
                            {config.icon} {config.label}
                        </span>
                        {enRetard && (
                            <span className="badge badge-error badge-xs gap-1 font-bold animate-pulse">
                                <AlertTriangle size={9} /> {joursRetard}j de retard
                            </span>
                        )}
                    </div>
                </div>

                {/* Détails */}
                <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-base-content/50 flex items-center gap-1">
                            <User size={11} /> Créé par
                        </span>
                        <span className="font-semibold truncate ml-2">
                            {commande.utilisateur?.prenom ?? '—'} {commande.utilisateur?.nom ?? ''}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className={`flex items-center gap-1 ${enRetard ? 'text-error font-semibold' : 'text-base-content/50'}`}>
                            <CalendarX size={11} /> Livraison prévue
                        </span>
                        <span className={`font-semibold ml-2 ${enRetard ? 'text-error' : ''}`}>
                            {commande.dateLivraisonPrevue
                                ? new Date(commande.dateLivraisonPrevue).toLocaleDateString('fr-FR')
                                : '—'}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-base-content/50 flex items-center gap-1">
                            <DollarSign size={11} /> Montant total
                        </span>
                        <span className="font-extrabold text-primary ml-2">
                            {fmt(commande.montantTotal)} FCFA
                        </span>
                    </div>
                    {commande.lignes && commande.lignes.length > 0 && (
                        <div className="flex items-center justify-between">
                            <span className="text-base-content/50 flex items-center gap-1">
                                <Package size={11} /> Produits
                            </span>
                            <span className="font-semibold ml-2">
                                {commande.lignes.length} ligne(s)
                            </span>
                        </div>
                    )}
                </div>

                {/* Barre de progression */}
                <div className="flex items-center gap-1">
                    {STATUTS.map((s, i) => (
                        <div key={s} className="flex items-center gap-1 flex-1">
                            <div className={`w-2.5 h-2.5 rounded-full shrink-0 transition-colors ${
                                STATUTS.indexOf(statut) >= i ? 'bg-primary' : 'bg-base-300'
                            }`} />
                            {i < STATUTS.length - 1 && (
                                <div className={`h-px flex-1 transition-colors ${
                                    STATUTS.indexOf(statut) > i ? 'bg-primary' : 'bg-base-300'
                                }`} />
                            )}
                        </div>
                    ))}
                </div>
                <div className="flex justify-between text-xs text-base-content/30 -mt-1">
                    {STATUTS.map(s => (
                        <span key={s} className={`${statut === s ? 'text-primary font-bold' : ''}`}>
                            {STATUT_CONFIG[s]?.label}
                        </span>
                    ))}
                </div>

                {/* Actions statut — seulement si pas livree/annulee */}
                {statut !== 'livree' && statut !== 'annulee' && (
                    <div className="flex flex-wrap gap-1 pt-2 border-t border-base-200">
                        {['en_attente', 'confirmee', 'expediee'].map(s => (
                            s !== statut && (
                                <button key={s} type="button"
                                    className={`btn btn-xs gap-1 ${STATUT_CONFIG[s].badge.replace('badge-', 'btn-')} btn-outline`}
                                    onClick={() => onStatutChange(commande.idCommande, s)}
                                >
                                    {STATUT_CONFIG[s].icon}
                                    {STATUT_CONFIG[s].label}
                                </button>
                            )
                        ))}
                    </div>
                )}

                {/* Actions edit/delete */}
                <div className={`flex justify-end gap-1 ${statut !== 'livree' && statut !== 'annulee' ? '' : 'pt-2 border-t border-base-200'}`}>
                    {statut !== 'livree' && statut !== 'annulee' && (
                        <button className="btn btn-xs btn-ghost tooltip text-warning"
                            data-tip="Modifier"
                            onClick={() => onEdit(commande)}>
                            <Pencil size={13} />
                        </button>
                    )}
                    {canDelete && (
                        <button className="btn btn-xs btn-ghost tooltip text-error"
                            data-tip="Supprimer"
                            onClick={() => onDelete(commande)}>
                            <Trash2 size={13} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
export default CommandeCard