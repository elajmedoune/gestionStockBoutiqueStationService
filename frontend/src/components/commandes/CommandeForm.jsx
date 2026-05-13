// src/components/commandes/CommandeForm.jsx

import { useState, useEffect } from 'react'
import {
    Calendar, CalendarCheck, Package, Plus, Trash2,
    ShoppingBag, DollarSign, Building2,
    Clock, CheckCircle, Truck, PackageCheck, XCircle,
} from 'lucide-react'
import api from '../../services/api'

const STATUTS = ['en_attente', 'confirmee', 'expediee', 'livree', 'annulee']

const STATUT_CONFIG = {
    en_attente: { label: 'En attente', color: 'btn-warning',   icon: <Clock        size={12} /> },
    confirmee:  { label: 'Confirmée',  color: 'btn-info',      icon: <CheckCircle  size={12} /> },
    expediee:   { label: 'Expédiée',   color: 'btn-secondary', icon: <Truck        size={12} /> },
    livree:     { label: 'Livrée',     color: 'btn-success',   icon: <PackageCheck size={12} /> },
    annulee:    { label: 'Annulée',    color: 'btn-error',     icon: <XCircle      size={12} /> },
}

const INITIAL = {
    dateCommande:        '',
    dateLivraisonPrevue: '',
    idFournisseur:       '',
    montantTotal:        0,
    lignes:              [],
}

function CommandeForm({ initial = null, onSubmit, onCancel, loading = false, error = null }) {
    const [form,        setForm]        = useState(INITIAL)
    const [produits,    setProduits]    = useState([])
    const [fournisseurs, setFournisseurs] = useState([])

    useEffect(() => {
        api.get('/produits').then(({ data }) => {
            setProduits(Array.isArray(data) ? data : data.data ?? [])
        }).catch(() => {})

        api.get('/fournisseurs').then(({ data }) => {
            setFournisseurs(Array.isArray(data) ? data : data.data ?? [])
        }).catch(() => {})
    }, [])

    useEffect(() => {
        if (initial) {
            setForm({
                dateCommande:        initial.dateCommande ? String(initial.dateCommande).split('T')[0] : '',
                dateLivraisonPrevue: initial.dateLivraisonPrevue ? String(initial.dateLivraisonPrevue).split('T')[0] : '',
                idFournisseur:       initial.idFournisseur ??            initial.fournisseur?.idFournisseur ?? '',
                montantTotal:        initial.montantTotal || 0,
                statut:              initial.statut || 'en_attente',
                lignes:              (initial.lignes ?? []).map(l => ({
                    idProduit:    l.idProduit,
                    quantite:     l.quantite,
                    prixUnitaire: l.prixUnitaire,
                    sousTotal:    l.sousTotal ?? (l.quantite * l.prixUnitaire),
                })),
            })
        } else {
            setForm(INITIAL)
        }
    }, [initial])

    const handle = (e) => {
        const { name, value } = e.target
        setForm(f => {
            const updated = { ...f, [name]: value }
            
            // Calcul automatique de la date de livraison prévue
            if (name === 'idFournisseur' || name === 'dateCommande') {
                const fournisseur = fournisseurs.find(f => String(f.idFournisseur) === String(
                    name === 'idFournisseur' ? value : f.idFournisseur
                ))
                const dateCmd = name === 'dateCommande' ? value : f.dateCommande
                if (fournisseur && dateCmd) {
                    const date = new Date(dateCmd)
                    date.setDate(date.getDate() + fournisseur.delaiLivraison)
                    updated.dateLivraisonPrevue = date.toISOString().split('T')[0]
                }
            }
            return updated
        })
    }

    const ajouterLigne = () => {
        setForm(f => ({
            ...f,
            lignes: [...f.lignes, { idProduit: '', quantite: 1, prixUnitaire: 0, sousTotal: 0 }]
        }))
    }

    const supprimerLigne = (i) => {
        setForm(f => {
            const lignes = f.lignes.filter((_, idx) => idx !== i)
            return { ...f, lignes, montantTotal: lignes.reduce((s, l) => s + Number(l.sousTotal), 0) }
        })
    }

    const updateLigne = (i, field, value) => {
        setForm(f => {
            const lignes = f.lignes.map((l, idx) => {
                if (idx !== i) return l
                const updated = { ...l, [field]: value }
                if (field === 'idProduit') {
                    const produit = produits.find(p => String(p.idProduit) === String(value))
                    // Prendre le prixEnGros du dernier stock au lieu du prixUnitaire
                    const dernierStock = produit?.stocks?.slice().sort((a, b) => 
                        new Date(b.dateEntree) - new Date(a.dateEntree)
                    )[0]
                    updated.prixUnitaire = dernierStock?.prixEnGros ?? produit?.prixUnitaire ?? 0
                    updated.sousTotal    = updated.quantite * updated.prixUnitaire
                }
                if (field === 'quantite' || field === 'prixUnitaire') {
                    updated.sousTotal = (field === 'quantite' ? value : l.quantite) *
                                        (field === 'prixUnitaire' ? value : l.prixUnitaire)
                }
                return updated
            })
            return { ...f, lignes, montantTotal: lignes.reduce((s, l) => s + Number(l.sousTotal), 0) }
        })
    }

    const submit = (e) => {
        e.preventDefault()
        onSubmit(form)
    }

    const fmt = n => new Intl.NumberFormat('fr-FR').format(Math.round(n || 0))

    return (
        <form onSubmit={submit} className="space-y-5">
            {error && (
                <div className="alert alert-error text-sm py-2">
                    <span>{error}</span>
                </div>
            )}
            {/* Fournisseur */}
            <div className="form-control">
                <label className="label">
                    <span className="label-text font-medium flex items-center gap-1">
                        <Building2 size={13} className="text-primary" /> Fournisseur *
                    </span>
                </label>
                <select className="select select-bordered"
                    name="idFournisseur"
                    value={form.idFournisseur}
                    onChange={handle}
                    required>
                    <option value="">-- Sélectionner un fournisseur --</option>
                    {fournisseurs.map(f => (
                        <option key={f.idFournisseur} value={f.idFournisseur}>
                            {f.nom}
                        </option>
                    ))}
                </select>
            </div>
            
            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-control">
                    <label className="label">
                        <span className="label-text font-medium flex items-center gap-1">
                            <Calendar size={13} className="text-primary" /> Date commande *
                        </span>
                    </label>
                    <input className="input input-bordered"
                        name="dateCommande" type="date"
                        value={form.dateCommande} onChange={handle} required />
                </div>
                <div className="form-control">
                    <label className="label">
                        <span className="label-text font-medium flex items-center gap-1">
                            <CalendarCheck size={13} className="text-primary" /> Livraison prévue
                        </span>
                    </label>
                    <input className="input input-bordered bg-base-200/50"
                        name="dateLivraisonPrevue" type="date"
                        value={form.dateLivraisonPrevue} onChange={handle}
                        placeholder="Calculé automatiquement" 
                    />
                </div>
            </div>

            {/* Lignes de commande */}
            {!initial && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm flex items-center gap-1">
                            <ShoppingBag size={14} className="text-primary" /> Produits commandés
                        </h4>
                        <button type="button" className="btn btn-xs btn-primary gap-1" onClick={ajouterLigne}>
                            <Plus size={12} /> Ajouter
                        </button>
                    </div>

                    {form.lignes.length === 0 ? (
                        <div className="text-center py-6 text-base-content/30 border-2 border-dashed border-base-300 rounded-2xl">
                            <Package size={24} className="mx-auto mb-2 opacity-30" />
                            <p className="text-xs">Aucun produit — cliquez sur Ajouter</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {/* En-têtes */}
                            <div className="grid grid-cols-12 gap-2 px-2 text-xs text-base-content/40 font-semibold">
                                <div className="col-span-5">Produit</div>
                                <div className="col-span-2">Qté</div>
                                <div className="col-span-3">Prix unit.</div>
                                <div className="col-span-1 text-right">Total</div>
                                <div className="col-span-1" />
                            </div>
                            {form.lignes.map((l, i) => (
                                <div key={i} className="grid grid-cols-12 gap-2 items-center bg-base-200/50 rounded-2xl p-2">
                                    <div className="col-span-5">
                                        <select className="select select-bordered select-sm w-full"
                                            value={l.idProduit}
                                            onChange={e => updateLigne(i, 'idProduit', e.target.value)}
                                            required>
                                            <option value="">-- Produit --</option>
                                            {produits.map(p => (
                                                <option key={p.idProduit} value={p.idProduit}>
                                                    {p.nomProduit ?? p.reference}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-span-2">
                                        <input type="number" min="1"
                                            className="input input-bordered input-sm w-full"
                                            placeholder="Qté"
                                            value={l.quantite}
                                            onChange={e => updateLigne(i, 'quantite', Number(e.target.value))}
                                            required />
                                    </div>
                                    <div className="col-span-3">
                                        <input type="number" min="0" step="0.01"
                                            className="input input-bordered input-sm w-full"
                                            placeholder="Prix"
                                            value={l.prixUnitaire}
                                            onChange={e => updateLigne(i, 'prixUnitaire', Number(e.target.value))}
                                            required />
                                    </div>
                                    <div className="col-span-1 text-xs font-bold text-primary text-right">
                                        {fmt(l.sousTotal)}
                                    </div>
                                    <div className="col-span-1 flex justify-center">
                                        <button type="button" className="btn btn-ghost btn-xs btn-circle text-error"
                                            onClick={() => supprimerLigne(i)}>
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Lignes existantes en mode édition */}
{initial && (initial.lignes ?? []).length > 0 && (
    <div className="space-y-3">
        <h4 className="font-bold text-sm flex items-center gap-1">
            <ShoppingBag size={14} className="text-primary" /> Produits commandés
        </h4>
        <div className="bg-base-200/50 rounded-2xl p-3">
            <table className="table table-xs w-full">
                <thead>
                    <tr className="bg-base-300/50">
                        <th>Produit</th>
                        <th className="text-right">Qté</th>
                        <th className="text-right">Prix unit.</th>
                        <th className="text-right">Sous-total</th>
                    </tr>
                </thead>
                <tbody>
                    {(initial.lignes ?? []).map((l, i) => (
                        <tr key={i} className="hover">
                            <td className="font-semibold">
                                {l.produit?.nomProduit ?? l.produit?.reference ?? `#${l.idProduit}`}
                            </td>
                            <td className="text-right">
                                <span className="badge badge-ghost badge-sm">{l.quantite}</span>
                            </td>
                            <td className="text-right text-base-content/60">{fmt(l.prixUnitaire)} F</td>
                            <td className="text-right font-bold text-primary">{fmt(l.sousTotal)} F</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
)}

            {/* Montant total */}
            <div className="form-control">
                <label className="label">
                    <span className="label-text font-medium flex items-center gap-1">
                        <DollarSign size={13} className="text-primary" /> Montant total (FCFA)
                    </span>
                </label>
                <input type="number" className="input input-bordered bg-base-200 cursor-not-allowed"
                    name="montantTotal" value={form.montantTotal} readOnly />
            </div>

            {/* Statut en mode édition */}
{initial && (
    <div className="form-control">
        <label className="label">
            <span className="label-text font-medium">Statut</span>
        </label>
        <div className="flex flex-wrap gap-2">
            {STATUTS.filter(s => s !== 'livree').map(s => (
                <button key={s} type="button"
                    onClick={() => setForm(f => ({ ...f, statut: s }))}
                    className={`btn btn-sm gap-1 ${form.statut === s ? STATUT_CONFIG[s].color : 'btn-ghost border border-base-300'}`}>
                    {STATUT_CONFIG[s].icon}
                    {STATUT_CONFIG[s].label}
                </button>
            ))}
        </div>
        {initial.statut === 'livree' && (
            <p className="text-xs text-success mt-2 flex items-center gap-1">
                <PackageCheck size={12} /> Cette commande est livrée — statut non modifiable
            </p>
        )}
    </div>
)}

            {/* Boutons */}
            <div className="flex justify-end gap-2 pt-2">
                <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={loading}>
                    Annuler
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading && <span className="loading loading-spinner loading-xs" />}
                    {initial ? 'Modifier' : 'Créer'}
                </button>
            </div>
        </form>
    )
}
export default CommandeForm