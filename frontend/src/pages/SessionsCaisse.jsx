import { useState, useEffect, useCallback } from "react"
import api from "../services/api"
import LoadingCard from "../components/layouts/LoadingCard"
import EmptyState from "../components/layouts/EmptyState"
import { Wallet, Search, X, Clock, CheckCircle, AlertTriangle } from "lucide-react"

const fmt = n => new Intl.NumberFormat('fr-FR').format(Math.round(n || 0))

export default function SessionsCaisse() {
  const [sessions, setSessions] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)

  const [caissier, setCaissier] = useState('')
  const [jour,     setJour]     = useState('')
  const [produit,  setProduit]  = useState('')
  const [statut,   setStatut]   = useState('')

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true)
      const params = {}
      if (caissier) params.caissier = caissier
      if (jour)     params.jour     = jour
      if (produit)  params.produit  = produit
      if (statut)   params.statut   = statut
      const res = await api.get('/caisse/sessions', { params })
      setSessions(res.data.data ?? res.data)
      setError(null)
    } catch {
      setError("Erreur lors du chargement des sessions de caisse")
    } finally {
      setLoading(false)
    }
  }, [caissier, jour, produit, statut])

  useEffect(() => {
    const t = setTimeout(fetchSessions, 300)
    return () => clearTimeout(t)
  }, [fetchSessions])

  const reinitialiser = () => { setCaissier(''); setJour(''); setProduit(''); setStatut('') }

  const sessionsOuvertes = sessions.filter(s => s.statut === 'ouverte').length
  const totalEcarts = sessions.reduce((s, sess) => s + Math.abs(parseFloat(sess.ecart) || 0), 0)

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-5">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-base-content flex items-center gap-2">
          <div className="p-2 bg-primary/15 rounded-2xl">
            <Wallet size={20} className="text-primary" />
          </div>
          Sessions de caisse
        </h1>
        <p className="text-sm text-base-content/50 mt-0.5 ml-1">
          Historique des ouvertures/fermetures de caisse, tous caissiers confondus
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body p-4 gap-1">
            <p className="text-xs font-bold uppercase tracking-widest text-base-content/40">Total sessions</p>
            <p className="text-2xl font-extrabold text-primary">{sessions.length}</p>
          </div>
        </div>
        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body p-4 gap-1">
            <p className="text-xs font-bold uppercase tracking-widest text-base-content/40">Caisses ouvertes</p>
            <p className="text-2xl font-extrabold text-success">{sessionsOuvertes}</p>
          </div>
        </div>
        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body p-4 gap-1">
            <p className="text-xs font-bold uppercase tracking-widest text-base-content/40">Total écarts (abs.)</p>
            <p className="text-2xl font-extrabold text-warning">{fmt(totalEcarts)} F</p>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body p-3">
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
              <input type="text" placeholder="Caissier (nom/prénom)..."
                className="input input-bordered input-sm pl-8 w-48"
                value={caissier} onChange={e => setCaissier(e.target.value)} />
            </div>
            <input type="date" className="input input-bordered input-sm w-40"
              value={jour} onChange={e => setJour(e.target.value)} title="Filtrer par jour" />
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
              <input type="text" placeholder="Produit vendu..."
                className="input input-bordered input-sm pl-8 w-44"
                value={produit} onChange={e => setProduit(e.target.value)} />
            </div>
            <select className="select select-bordered select-sm w-36"
              value={statut} onChange={e => setStatut(e.target.value)}>
              <option value="">Tous les statuts</option>
              <option value="ouverte">Ouverte</option>
              <option value="fermee">Fermée</option>
            </select>
            {(caissier || jour || produit || statut) && (
              <button className="btn btn-ghost btn-sm gap-1 text-error" onClick={reinitialiser}>
                <X size={13} /> Effacer
              </button>
            )}
            <span className="ml-auto text-xs text-base-content/40 font-semibold">{sessions.length} session(s)</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-error rounded-2xl">
          <AlertTriangle size={14} />
          <span>{error}</span>
          <button className="btn btn-sm btn-ghost ml-auto" onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {loading ? (
        <LoadingCard count={6} />
      ) : (
        <div className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table table-sm w-full">
              <thead>
                <tr className="bg-primary text-primary-content">
                  <th>#</th>
                  <th>Caissier</th>
                  <th>Ouverture</th>
                  <th>Fermeture</th>
                  <th className="text-right">Fonds ouv.</th>
                  <th className="text-right">Ventes</th>
                  <th className="text-right">Fonds ferm.</th>
                  <th className="text-right">Écart</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {sessions.length === 0 ? (
                  <tr>
                    <td colSpan={9}>
                      <EmptyState title="Aucune session" message="Aucune session de caisse ne correspond aux filtres" />
                    </td>
                  </tr>
                ) : sessions.map((s) => (
                  <tr key={s.idSession} className="hover">
                    <td className="font-bold text-primary">#{s.idSession}</td>
                    <td className="text-xs font-medium">
                      {s.utilisateur ? `${s.utilisateur.prenom} ${s.utilisateur.nom}` : '—'}
                    </td>
                    <td className="text-xs">
                      {s.dateOuverture ? new Date(s.dateOuverture).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                    </td>
                    <td className="text-xs">
                      {s.dateFermeture ? new Date(s.dateFermeture).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                    </td>
                    <td className="text-right text-xs">{fmt(s.fondsOuverture)} F</td>
                    <td className="text-right text-xs font-semibold text-success">{fmt(s.montantVentes)} F</td>
                    <td className="text-right text-xs">{s.fondsFermeture != null ? `${fmt(s.fondsFermeture)} F` : '—'}</td>
                    <td className="text-right text-xs">
                      {s.ecart != null
                        ? <span className={`badge badge-sm font-semibold ${Math.abs(s.ecart) < 1 ? 'badge-success' : 'badge-warning'}`}>
                            {s.ecart > 0 ? '+' : ''}{fmt(s.ecart)} F
                          </span>
                        : '—'}
                    </td>
                    <td>
                      <span className={`badge badge-sm gap-1 font-semibold ${s.statut === 'ouverte' ? 'badge-success' : 'badge-ghost'}`}>
                        {s.statut === 'ouverte' ? <Clock size={11} /> : <CheckCircle size={11} />}
                        {s.statut === 'ouverte' ? 'Ouverte' : 'Fermée'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
