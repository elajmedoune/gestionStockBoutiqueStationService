import { useState, useEffect, useContext } from "react";
import api from "../services/api";
import { useAuth  } from "../context/AuthContext";

const Inventaires = () => {
  const { user } = useContext(AuthContext);
  const [inventaires, setInventaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    idProduit: "",
    quantiteComptee: "",
    observation: "",
  });
  const [editId, setEditId] = useState(null);
  const [produits, setProduits] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchInventaires();
    fetchProduits();
  }, []);

  const fetchInventaires = async () => {
    try {
      setLoading(true);
      const res = await api.get("/inventaires");
      setInventaires(res.data.data || res.data);
    } catch (err) {
      setError("Erreur lors du chargement des inventaires");
    } finally {
      setLoading(false);
    }
  };

  const fetchProduits = async () => {
    try {
      const res = await api.get("/produits");
      setProduits(res.data.data || res.data);
    } catch {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/inventaires/${editId}`, form);
      } else {
        await api.post("/inventaires", form);
      }
      setShowModal(false);
      setForm({ idProduit: "", quantiteComptee: "", observation: "" });
      setEditId(null);
      fetchInventaires();
    } catch (err) {
      setError("Erreur lors de la sauvegarde");
    }
  };

  const handleEdit = (inv) => {
    setForm({
      idProduit: inv.idProduit,
      quantiteComptee: inv.quantiteComptee,
      observation: inv.observation || "",
    });
    setEditId(inv.idInventaire);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Confirmer la suppression ?")) return;
    try {
      await api.delete(`/inventaires/${id}`);
      fetchInventaires();
    } catch {
      setError("Erreur lors de la suppression");
    }
  };

  const filtered = inventaires.filter((inv) => {
    const produitNom = inv.produit?.nomProduit || "";
    return produitNom.toLowerCase().includes(search.toLowerCase());
  });

  const getEcart = (inv) => {
    const stock = inv.produit?.stock?.quantite || 0;
    return inv.quantiteComptee - stock;
  };

  return (
    <div className="p-6" data-theme="cupcake">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-base-content">
            📦 Gestion des Inventaires
          </h1>
          <p className="text-sm text-base-content/60 mt-1">
            Suivi et contrôle des stocks physiques
          </p>
        </div>
        {["admin", "gestionnaire"].includes(user?.role) && (
          <button
            className="btn btn-primary"
            onClick={() => {
              setShowModal(true);
              setEditId(null);
              setForm({ idProduit: "", quantiteComptee: "", observation: "" });
            }}
          >
            + Nouvel Inventaire
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="stat bg-base-100 rounded-2xl shadow">
          <div className="stat-title">Total inventaires</div>
          <div className="stat-value text-primary">{inventaires.length}</div>
        </div>
        <div className="stat bg-base-100 rounded-2xl shadow">
          <div className="stat-title">Écarts positifs</div>
          <div className="stat-value text-success">
            {inventaires.filter((i) => getEcart(i) > 0).length}
          </div>
        </div>
        <div className="stat bg-base-100 rounded-2xl shadow">
          <div className="stat-title">Écarts négatifs</div>
          <div className="stat-value text-error">
            {inventaires.filter((i) => getEcart(i) < 0).length}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="🔍 Rechercher un produit..."
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
                <th>#</th>
                <th>Produit</th>
                <th>Stock Système</th>
                <th>Qté Comptée</th>
                <th>Écart</th>
                <th>Observation</th>
                <th>Date</th>
                {["admin", "gestionnaire"].includes(user?.role) && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-base-content/50">
                    Aucun inventaire trouvé
                  </td>
                </tr>
              ) : (
                filtered.map((inv, i) => {
                  const ecart = getEcart(inv);
                  return (
                    <tr key={inv.idInventaire}>
                      <td className="font-mono text-sm">{i + 1}</td>
                      <td className="font-medium">{inv.produit?.nomProduit || "—"}</td>
                      <td>{inv.produit?.stock?.quantite ?? "—"}</td>
                      <td className="font-semibold">{inv.quantiteComptee}</td>
                      <td>
                        <span
                          className={`badge ${
                            ecart > 0
                              ? "badge-success"
                              : ecart < 0
                              ? "badge-error"
                              : "badge-neutral"
                          }`}
                        >
                          {ecart > 0 ? "+" : ""}{ecart}
                        </span>
                      </td>
                      <td className="text-sm text-base-content/70 max-w-xs truncate">
                        {inv.observation || "—"}
                      </td>
                      <td className="text-sm">
                        {inv.created_at
                          ? new Date(inv.created_at).toLocaleDateString("fr-FR")
                          : "—"}
                      </td>
                      {["admin", "gestionnaire"].includes(user?.role) && (
                        <td>
                          <div className="flex gap-2">
                            <button
                              className="btn btn-xs btn-warning"
                              onClick={() => handleEdit(inv)}
                            >
                              ✏️
                            </button>
                            <button
                              className="btn btn-xs btn-error"
                              onClick={() => handleDelete(inv.idInventaire)}
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">
              {editId ? "✏️ Modifier Inventaire" : "➕ Nouvel Inventaire"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Produit *</span>
                </label>
                <select
                  className="select select-bordered"
                  value={form.idProduit}
                  onChange={(e) => setForm({ ...form, idProduit: e.target.value })}
                  required
                >
                  <option value="">-- Sélectionner un produit --</option>
                  {produits.map((p) => (
                    <option key={p.idProduit} value={p.idProduit}>
                      {p.nomProduit}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Quantité Comptée *</span>
                </label>
                <input
                  type="number"
                  min="0"
                  className="input input-bordered"
                  value={form.quantiteComptee}
                  onChange={(e) => setForm({ ...form, quantiteComptee: e.target.value })}
                  required
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Observation</span>
                </label>
                <textarea
                  className="textarea textarea-bordered"
                  rows="3"
                  value={form.observation}
                  onChange={(e) => setForm({ ...form, observation: e.target.value })}
                  placeholder="Remarques éventuelles..."
                />
              </div>
              <div className="modal-action">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  {editId ? "Modifier" : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
          <div className="modal-backdrop" onClick={() => setShowModal(false)} />
        </dialog>
      )}
    </div>
  );
};

export default Inventaires;
