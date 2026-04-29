import { useState, useEffect } from "react";
import api from "../services/api";
import { useAuth  } from "../context/AuthContext";

const ROLES = ["gerant", " gestionnaire_stock", "caissier", "magasinier"];

const Utilisateurs = () => {
  const { user } = useAuth();
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    nom: "", prenom: "", login: "", email: "",
    password: "", role: "caissier", actif: 1,
  });

  useEffect(() => {
    fetchUtilisateurs();
  }, []);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/register", form);
      setShowModal(false);
      setForm({ nom: "", prenom: "", login: "", email: "", password: "", role: "caissier", actif: 1 });
      fetchUtilisateurs();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la création");
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
    const styles = {
      gerant: "badge-error",
      gestionnaire_stock: "badge-warning",
      caissier: "badge-info",
      magasinier: "badge-success",
    };
    return styles[role] || "badge-neutral";
  };

  const filtered = utilisateurs.filter(
    (u) =>
      u.nom?.toLowerCase().includes(search.toLowerCase()) ||
      u.prenom?.toLowerCase().includes(search.toLowerCase()) ||
      u.login?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6" data-theme="cupcake">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">👥 Gestion des Utilisateurs</h1>
          <p className="text-sm text-base-content/60 mt-1">
            gerantistration des comptes et des rôles
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
        >
          + Nouvel Utilisateur
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {ROLES.map((role) => (
          <div key={role} className="stat bg-base-100 rounded-2xl shadow py-3">
            <div className="stat-title text-xs capitalize">{role}s</div>
            <div className="stat-value text-xl text-primary">
              {utilisateurs.filter((u) => u.role === role).length}
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="🔍 Rechercher un utilisateur..."
          className="input input-bordered w-full max-w-md"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="alert alert-error mb-4">
          <span>{error}</span>
          <button className="btn btn-sm btn-ghost" onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : (
        <div className="overflow-x-auto bg-base-100 rounded-2xl shadow">
          <table className="table table-zebra">
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Login</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-base-content/50">
                    Aucun utilisateur trouvé
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.idUtilisateur}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar placeholder">
                          <div className="bg-primary text-primary-content rounded-full w-9">
                            <span className="text-sm">
                              {u.prenom?.[0]}{u.nom?.[0]}
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className="font-bold">{u.prenom} {u.nom}</div>
                        </div>
                      </div>
                    </td>
                    <td className="font-mono text-sm">{u.login}</td>
                    <td className="text-sm">{u.email}</td>
                    <td>
                      <span className={`badge ${getRoleBadge(u.role)}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${u.actif ? "badge-success" : "badge-ghost"}`}>
                        {u.actif ? "Actif" : "Inactif"}
                      </span>
                    </td>
                    <td>
                      {u.idUtilisateur !== user?.idUtilisateur && (
                        <button
                          className={`btn btn-xs ${u.actif ? "btn-error" : "btn-success"}`}
                          onClick={() => toggleActif(u.idUtilisateur)}
                        >
                          {u.actif ? "Désactiver" : "Activer"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal création */}
      {showModal && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-lg">
            <h3 className="font-bold text-lg mb-4">➕ Nouvel Utilisateur</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="form-control">
                  <label className="label"><span className="label-text">Prénom *</span></label>
                  <input type="text" className="input input-bordered" required
                    value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Nom *</span></label>
                  <input type="text" className="input input-bordered" required
                    value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
                </div>
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Login *</span></label>
                <input type="text" className="input input-bordered" required
                  value={form.login} onChange={(e) => setForm({ ...form, login: e.target.value })} />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Email *</span></label>
                <input type="email" className="input input-bordered" required
                  value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Mot de passe *</span></label>
                <input type="password" className="input input-bordered" required minLength={8}
                  value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Rôle *</span></label>
                <select className="select select-bordered" value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="modal-action">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">Créer</button>
              </div>
            </form>
          </div>
          <div className="modal-backdrop" onClick={() => setShowModal(false)} />
        </dialog>
      )}
    </div>
  );
};

export default Utilisateurs;
