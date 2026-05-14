import { useState, useEffect } from "react";
import { Eye, EyeOff, Pencil, Trash2 } from 'lucide-react'
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { createPortal } from 'react-dom'

const ROLES = ["gerant", "gestionnaire_stock", "caissier", "magasinier"];

const Utilisateurs = () => {
  const { user } = useAuth();
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [errorModal, setErrorModal] = useState(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    nom: "", prenom: "", login: "", email: "",
    motDePasse: "", motDePasse_confirmation: "", role: "caissier",
  })

  const genererMotDePasse = () => {
    const majuscules = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const chiffres = '0123456789'
    const speciaux = '!*_-'
    const minuscules = 'abcdefghijklmnopqrstuvwxyz'
    
    // Au moins 1 de chaque critère requis
    let pwd = ''
    pwd += majuscules[Math.floor(Math.random() * majuscules.length)]
    pwd += chiffres[Math.floor(Math.random() * chiffres.length)]
    pwd += speciaux[Math.floor(Math.random() * speciaux.length)]
    
    // Compléter jusqu'à 10 caractères
    const tous = majuscules + chiffres + speciaux + minuscules
    for (let i = 0; i < 7; i++) {
        pwd += tous[Math.floor(Math.random() * tous.length)]
    }
    
    // Mélanger
    return pwd.split('').sort(() => Math.random() - 0.5).join('')
  }

  const [filterRole, setFilterRole] = useState("")

  const [showPwd, setShowPwd] = useState(false);

  useEffect(() => { fetchUtilisateurs(); }, []);

  const fetchUtilisateurs = async () => {
    try {
      setLoading(true);
      const res = await api.get("/utilisateurs");
      setUtilisateurs(res.data.data || res.data);
    } catch {
      setError("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const fermerModal = () => {
    setShowModal(false);
    setEditUser(null);
    setErrorModal(null);
    setForm({ nom: "", prenom: "", login: "", email: "", motDePasse: "", motDePasse_confirmation: "", role: "caissier" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editUser) {
        const data = { nom: form.nom, prenom: form.prenom, login: form.login, email: form.email, role: form.role };
        if (form.motDePasse) {
          data.motDePasse = form.motDePasse;
          data.motDePasse_confirmation = form.motDePasse_confirmation;
        }
        await api.put(`/utilisateurs/${editUser.idUtilisateur}`, data);
      } else {
        await api.post("/register", form);
      }
      fermerModal();
      fetchUtilisateurs();
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors) {
        setErrorModal(Object.values(errors)[0][0]);
      } else {
        setErrorModal(err.response?.data?.message ?? 'Erreur lors de la sauvegarde.');
      }
    }
  };

  const handleDelete = async (u) => {
    if (!window.confirm(`Supprimer ${u.prenom} ${u.nom} ?`)) return;
    try {
      await api.delete(`/utilisateurs/${u.idUtilisateur}`);
      fetchUtilisateurs();
    } catch {
      setError("Erreur lors de la suppression");
    }
  };

  const toggleActif = async (id) => {
    try {
      await api.patch(`/utilisateurs/${id}/toggleActif`);
      fetchUtilisateurs();
    } catch {
      setError("Erreur lors de la mise à jour");
    }
  };

  const getRoleBadge = (role) => {
    const styles = { gerant: "badge-error", gestionnaire_stock: "badge-warning", caissier: "badge-info", magasinier: "badge-success" };
    return styles[role] || "badge-neutral";
  };

  const filtered = utilisateurs.filter((u) =>
    (!filterRole || u.role === filterRole) &&
    (
        u.nom?.toLowerCase().includes(search.toLowerCase()) ||
        u.prenom?.toLowerCase().includes(search.toLowerCase()) ||
        u.login?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
    )
  )

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">👥 Gestion des Utilisateurs</h1>
          <p className="text-sm text-base-content/60 mt-1">Administration des comptes et des rôles</p>
        </div>
        <button className="btn btn-primary" 
          onClick={() => {
            const pwd = genererMotDePasse()
            setForm({ 
                nom: "", prenom: "", login: "", email: "",
                motDePasse: pwd, 
                motDePasse_confirmation: pwd, 
                role: "caissier" 
            })
            setShowModal(true)
          }}
        >
          + Nouvel Utilisateur
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {ROLES.map((role) => (
          <div key={role} className="stat bg-base-100 rounded-2xl shadow py-3">
            <div className="stat-title text-xs capitalize">{role}s</div>
            <div className="stat-value text-xl text-primary">{utilisateurs.filter((u) => u.role === role).length}</div>
          </div>
        ))}
      </div>

      <div className="mb-4 flex gap-3">
        <input type="text" placeholder="🔍 Rechercher un utilisateur..."
            className="input input-bordered w-full max-w-md"
            value={search} onChange={(e) => setSearch(e.target.value)} />
        
        <select className="select select-bordered"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}>
            <option value="">Tous les rôles</option>
            {ROLES.map(r => (
                <option key={r} value={r}>{r}</option>
            ))}
        </select>
      </div>
      {error && (
        <div className="alert alert-error mb-4">
          <span>{error}</span>
          <button className="btn btn-sm btn-ghost" onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><span className="loading loading-spinner loading-lg text-primary"></span></div>
      ) : (
        <div className="overflow-x-auto bg-base-100 rounded-2xl shadow">
          <table className="table table-zebra">
            <thead>
              <tr>
                <th>Utilisateur</th><th>Login</th><th>Email</th>
                <th>Rôle</th><th>Statut</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-8 text-base-content/50">Aucun utilisateur trouvé</td></tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.idUtilisateur}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar placeholder">
                          <div className="bg-primary text-primary-content rounded-full w-9">
                            <span className="text-sm">{u.prenom?.[0]}{u.nom?.[0]}</span>
                          </div>
                        </div>
                        <div className="font-bold">{u.prenom} {u.nom}</div>
                      </div>
                    </td>
                    <td className="font-mono text-sm">{u.login}</td>
                    <td className="text-sm">{u.email}</td>
                    <td><span className={`badge ${getRoleBadge(u.role)}`}>{u.role}</span></td>
                    <td><span className={`badge ${u.actif ? "badge-success" : "badge-ghost"}`}>{u.actif ? "Actif" : "Inactif"}</span></td>
                    <td>
                      {u.idUtilisateur !== user?.idUtilisateur && (
                        <div className="flex gap-1">
                          <button className={`btn btn-xs ${u.actif ? "btn-error" : "btn-success"}`} onClick={() => toggleActif(u.idUtilisateur)}>
                            {u.actif ? "Désactiver" : "Activer"}
                          </button>
                          <button className="btn btn-xs btn-error" onClick={() => handleDelete(u)} title="Supprimer">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={fermerModal} />
            <div className="relative bg-base-100 w-full max-w-lg rounded-2xl overflow-hidden flex flex-col shadow-2xl"
                style={{ maxHeight: '90vh' }}>

                {/* Header */}
                <div className="bg-primary text-primary-content px-5 py-4 flex items-center justify-between shrink-0">
                    <h3 className="font-extrabold">
                        {editUser ? "✏️ Modifier Utilisateur" : "➕ Nouvel Utilisateur"}
                    </h3>
                    <button className="btn btn-ghost btn-sm btn-circle text-primary-content"
                        onClick={fermerModal}>✕</button>
                </div>

                {/* Formulaire scrollable */}
                <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden flex-1" noValidate>
                    <div className="p-5 space-y-3 overflow-y-auto flex-1">

                        {errorModal && (
                            <div className="alert alert-error text-sm py-2">
                                <span>{errorModal}</span>
                                <button type="button" className="btn btn-xs btn-ghost ml-auto" onClick={() => setErrorModal(null)}>✕</button>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                            <div className="form-control">
                                <label className="label"><span className="label-text font-medium">Prénom *</span></label>
                                <input type="text" className="input input-bordered" required
                                    value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} />
                            </div>
                            <div className="form-control">
                                <label className="label"><span className="label-text font-medium">Nom *</span></label>
                                <input type="text" className="input input-bordered" required
                                    value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
                            </div>
                        </div>

                        <div className="form-control">
                            <label className="label"><span className="label-text font-medium">Login *</span></label>
                            <input type="text" className="input input-bordered" required
                                value={form.login} onChange={(e) => setForm({ ...form, login: e.target.value })} />
                        </div>

                        <div className="form-control">
                            <label className="label"><span className="label-text font-medium">Email *</span></label>
                            <input type="text" className="input input-bordered" required
                                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                        </div>

                        <div className="form-control">
                            <label className="label">
                              <span className="label-text font-medium">Mot de passe généré automatiquement</span>
                            </label>
                            <div className="relative">
                                <input type="text" className="input input-bordered flex-1 font-mono bg-base-200/50"
                                    value={form.motDePasse}
                                    readOnly />
                                {!editUser && (
                                    <button type="button" className="btn btn-ghost border border-base-300"
                                        onClick={() => {
                                            const pwd = genererMotDePasse()
                                            setForm(f => ({ ...f, motDePasse: pwd, motDePasse_confirmation: pwd }))
                                        }}>
                                        🔄
                                    </button>
                                )}
                                <button type="button" onClick={() => setShowPwd(!showPwd)}
                                    className="absolute right-3 top-3 text-base-content/40">
                                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {(!editUser || form.motDePasse) && (
                            <div className="form-control">
                                <label className="label"><span className="label-text font-medium">Confirmer mot de passe *</span></label>
                                <input type={showPwd ? 'text' : 'password'} className="input input-bordered"
                                    required={!editUser || !!form.motDePasse} minLength={8}
                                    value={form.motDePasse_confirmation} onChange={(e) => setForm({ ...form, motDePasse_confirmation: e.target.value })} />
                            </div>
                        )}

                        <div className="form-control">
                            <label className="label"><span className="label-text font-medium">Rôle *</span></label>
                            <select className="select select-bordered" value={form.role}
                                onChange={(e) => setForm({ ...form, role: e.target.value })}>
                                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 px-5 py-4 border-t border-base-200 shrink-0 bg-base-100">
                        <button type="button" className="btn btn-ghost" onClick={fermerModal}>Annuler</button>
                        <button type="submit" className="btn btn-primary">{editUser ? "Modifier" : "Créer"}</button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Utilisateurs;