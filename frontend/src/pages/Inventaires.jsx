import { useState, useEffect } from "react";
import api from "../services/api";
import { useAuth  } from "../context/AuthContext";

const Inventaires = () => {
  const { user } = useAuth();
  const [inventaires, setInventaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    idStock: "",
    dateInventaire: new Date().toISOString().split('T')[0],
    quantiteReelle: "",
    observations: "",
  });
  const [editId, setEditId] = useState(null);
  const [stocks, setStocks] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchInventaires();
    fetchStocks();
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

  const fetchStocks = async () => {
    try {
      const res = await api.get("/stocks");
      setStocks(res.data.data || res.data);
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
      setForm({ idtSock: "", dateInventaire: new Date().toISOString().split('T')[0], quantiteReelle: "", observations: "" });
      setEditId(null);
      fetchInventaires();
    } catch (err) {
      setError("Erreur lors de la sauvegarde");
    }
  };

  const handleEdit = (inv) => {
    setForm({
      idStock: "",
      dateInventaire: new Date().toISOString().split('T')[0],
      quantiteReelle: "",
      observations: "",
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
    const produitNom = inv.stock?.produit?.nomProduit || "";
    return produitNom.toLowerCase().includes(search.toLowerCase());
  });

  const getEcart = (inv) => {
    const stockSysteme = inv.stock?.quantiteRestante ?? 0;
    return inv.quantiteReelle - stockSysteme;
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
        {["gerant", "magasinier", "gestionnaire_stock"].includes(user?.role) && (
          <button
            className="btn btn-primary"
            onClick={() => {
              setShowModal(true);
              setEditId(null);
              setForm({ idStock: "", quantiteReelle: "", dateInventaire: "", observations: "" });
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
                {["gerant", "magasinier", "gestionnaire_stockj"].includes(user?.role) && <th>Actions</th>}
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
                      <td>{i + 1}</td>
                      <td>{inv.stock?.produit?.nomProduit || "—"}</td>
                      <td>{inv.stock?.quantiteRestante ?? "—"}</td>
                      <td>{inv.quantiteReelle}</td>
                      <td>
                        <span className={`badge ${ecart > 0 ? "badge-success" : ecart < 0 ? "badge-error" : "badge-neutral"}`}>
                          {ecart > 0 ? "+" : ""}{ecart}
                        </span>
                      </td>
                      <td className="text-sm text-base-content/70 max-w-xs truncate">
                        {inv.observations || "—"}
                      </td>
                      <td className="text-sm">
                        {inv.dateInventaire
                          ? new Date(inv.created_at).toLocaleDateString("fr-FR")
                          : "—"}
                      </td>
                      {["gerant", "magasinier", "gestionnaire_stock"].includes(user?.role) && (
                        <td>
                          <div className="flex gap-2">
                            <button
                              className="btn btn-xs btn-warning" onClick={() => handleEdit(inv)}> ✏️</button>
                            <button className="btn btn-xs btn-error" onClick={() => handleDelete(inv.idInventaire)}>🗑️</button>
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
                  <span className="label-text">Stock / Produit *</span>
                </label>
                <select
                  className="select select-bordered"
                  value={form.idStock}
                  onChange={(e) => setForm({ ...form, idStock: e.target.value })}
                  required
                >
                  <option value="">-- Sélectionner un stock --</option>
                  {stocks.map((s) => (
                    <option key={s.idStock} value={s.idStock}>
                      {s.produit?.nomProduit || `Stock #${s.idStock}`}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Date inventaire *</span>
                </label>
                <input
                  type="date"
                  min="0"
                  className="input input-bordered"
                  value={form.dateInventaire}
                  onChange={(e) => setForm({ ...form, dateInventaire: e.target.value })}
                  required
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Quantité Réelle *</span>
                </label>
                <input
                  type="number"
                  min="0"
                  className="input input-bordered"
                  value={form.quantiteReelle}
                  onChange={(e) => setForm({ ...form, quantiteReelle: e.target.value })}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Observations *</span>
                </label>
                <textarea
                  className="textarea textarea-bordered"
                  rows="3"
                  value={form.observations}
                  onChange={(e) => setForm({ ...form, observations: e.target.value })}
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
