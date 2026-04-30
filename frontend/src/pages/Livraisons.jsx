import { useState, useEffect } from "react";
import api from "../services/api";

const STATUTS = ["en_attente", "en_cours", "livree", "annulee"];

const Livraisons = () => {
  const [livraisons, setLivraisons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStatut, setFilterStatut] = useState("tous");
  const [form, setForm] = useState({
    idCommande: "",
    dateLivraison: "",
    statut: "en_attente",
    observation: "",
  });
  const [commandes, setCommandes] = useState([]);

  useEffect(() => {
    fetchLivraisons();
    fetchCommandes();
  }, []);

  const fetchLivraisons = async () => {
    try {
      setLoading(true);
      const res = await api.get("/livraisons");
      setLivraisons(res.data.data || res.data);
    } catch {
      setError("Erreur lors du chargement des livraisons");
    } finally {
      setLoading(false);
    }
  };

  const fetchCommandes = async () => {
    try {
      const res = await api.get("/commandes");
      setCommandes(res.data.data || res.data);
    } catch {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editItem) {
        await api.put(`/livraisons/${editItem.idLivraison}`, form);
      } else {
        await api.post("/livraisons", form);
      }
      setShowModal(false);
      setEditItem(null);
      setForm({ idCommande: "", dateLivraison: "", statut: "en_attente", observation: "" });
      fetchLivraisons();
    } catch (err) {
      setError("Erreur lors de la sauvegarde");
    }
  };

  const handleEdit = (liv) => {
    setForm({
      idCommande: liv.idCommande,
      dateLivraison: liv.dateLivraison?.split("T")[0] || "",
      statut: liv.statut,
      observation: liv.observation || "",
    });
    setEditItem(liv);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette livraison ?")) return;
    try {
      await api.delete(`/livraisons/${id}`);
      fetchLivraisons();
    } catch {
      setError("Erreur lors de la suppression");
    }
  };

  const getStatutStyle = (statut) => {
    switch (statut) {
      case "livree": return "badge-success";
      case "en_cours": return "badge-info";
      case "en_attente": return "badge-warning";
      case "annulee": return "badge-error";
      default: return "badge-neutral";
    }
  };

  const getStatutIcon = (statut) => {
    switch (statut) {
      case "livree": return "✅";
      case "en_cours": return "🚚";
      case "en_attente": return "⏳";
      case "annulee": return "❌";
      default: return "📦";
    }
  };

  const filtered = livraisons.filter((l) => {
    const matchSearch =
      l.commande?.fournisseur?.nomFournisseur?.toLowerCase().includes(search.toLowerCase()) ||
      String(l.idLivraison).includes(search);
    const matchStatut = filterStatut === "tous" || l.statut === filterStatut;
    return matchSearch && matchStatut;
  });

  return (
    <div className="p-6" data-theme="cupcake">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">🚚 Gestion des Livraisons</h1>
          <p className="text-sm text-base-content/60 mt-1">
            Suivi des livraisons fournisseurs
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setShowModal(true);
            setEditItem(null);
            setForm({ idCommande: "", dateLivraison: "", statut: "en_attente", observation: "" });
          }}
        >
          + Nouvelle Livraison
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {STATUTS.map((s) => (
          <div key={s} className="stat bg-base-100 rounded-2xl shadow py-3">
            <div className="stat-title text-xs capitalize">{s.replace("_", " ")}</div>
            <div className="stat-value text-xl text-primary">
              {livraisons.filter((l) => l.statut === s).length}
            </div>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="text"
          placeholder="🔍 Rechercher..."
          className="input input-bordered flex-1 max-w-md"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="select select-bordered"
          value={filterStatut}
          onChange={(e) => setFilterStatut(e.target.value)}
        >
          <option value="tous">Tous les statuts</option>
          {STATUTS.map((s) => (
            <option key={s} value={s}>{s.replace("_", " ")}</option>
          ))}
        </select>
      </div>

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
                <th>Commande</th>
                <th>Fournisseur</th>
                <th>Date Livraison</th>
                <th>Statut</th>
                <th>Observation</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-base-content/50">
                    Aucune livraison trouvée
                  </td>
                </tr>
              ) : (
                filtered.map((liv) => (
                  <tr key={liv.idLivraison}>
                    <td className="font-mono text-sm">#{liv.idLivraison}</td>
                    <td>CMD #{liv.idCommande}</td>
                    <td>{liv.commande?.fournisseur?.nomFournisseur || "—"}</td>
                    <td className="text-sm">
                      {liv.dateLivraison
                        ? new Date(liv.dateLivraison).toLocaleDateString("fr-FR")
                        : "—"}
                    </td>
                    <td>
                      <span className={`badge ${getStatutStyle(liv.statut)}`}>
                        {getStatutIcon(liv.statut)} {liv.statut?.replace("_", " ")}
                      </span>
                    </td>
                    <td className="text-sm text-base-content/70 max-w-xs truncate">
                      {liv.observation || "—"}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn btn-xs btn-warning" onClick={() => handleEdit(liv)}>✏️</button>
                        <button className="btn btn-xs btn-error" onClick={() => handleDelete(liv.idLivraison)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))
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
              {editItem ? "✏️ Modifier Livraison" : "➕ Nouvelle Livraison"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-control">
                <label className="label"><span className="label-text">Commande *</span></label>
                <select className="select select-bordered" value={form.idCommande}
                  onChange={(e) => setForm({ ...form, idCommande: e.target.value })} required>
                  <option value="">-- Sélectionner une commande --</option>
                  {commandes.map((c) => (
                    <option key={c.idCommande} value={c.idCommande}>
                      CMD #{c.idCommande} — {c.fournisseur?.nomFournisseur || ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Date de livraison</span></label>
                <input type="date" className="input input-bordered" value={form.dateLivraison}
                  onChange={(e) => setForm({ ...form, dateLivraison: e.target.value })} />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Statut *</span></label>
                <select className="select select-bordered" value={form.statut}
                  onChange={(e) => setForm({ ...form, statut: e.target.value })}>
                  {STATUTS.map((s) => (
                    <option key={s} value={s}>{s.replace("_", " ")}</option>
                  ))}
                </select>
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Observation</span></label>
                <textarea className="textarea textarea-bordered" rows="3"
                  value={form.observation}
                  onChange={(e) => setForm({ ...form, observation: e.target.value })} />
              </div>
              <div className="modal-action">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary">
                  {editItem ? "Modifier" : "Enregistrer"}
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

export default Livraisons;
