import { useState, useEffect } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const Alertes = () => {
  const { user } = useAuth();
  const [alertes, setAlertes] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("tous");

  useEffect(() => {
    fetchAlertes();
    fetchStats();
  }, []);

  const fetchAlertes = async () => {
    try {
      setLoading(true);
      const res = await api.get("/alertes");
      setAlertes(res.data.data || res.data);
    } catch {
      setError("Erreur lors du chargement des alertes");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get("/alertes/stats");
      setStats(res.data);
    } catch {}
  };

  const marquerLue = async (id) => {
    try {
      await api.patch(`/alertes/${id}/lire`);
      fetchAlertes();
      fetchStats();
    } catch {
      setError("Erreur lors de la mise à jour");
    }
  };

  const marquerToutLu = async () => {
    try {
      await api.patch("/alertes/lire_tout");
      fetchAlertes();
      fetchStats();
    } catch {
      setError("Erreur lors de la mise à jour");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette alerte ?")) return;
    try {
      await api.delete(`/alertes/${id}`);
      fetchAlertes();
    } catch {
      setError("Erreur lors de la suppression");
    }
  };

  const getTypeStyle = (type) => {
    switch (type) {
      case "rupture": return "badge-error";
      case "stock_faible": return "badge-warning";
      case "expiration": return "badge-info";
      default: return "badge-neutral";
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "rupture": return "🚨";
      case "stock_faible": return "⚠️";
      case "expiration": return "📅";
      default: return "🔔";
    }
  };

  const filtered = alertes.filter((a) => {
    if (filter === "non_lues") return !a.lue;
    if (filter === "lues") return a.lue;
    return true;
  });

  const nonLues = alertes.filter((a) => !a.lue).length;

  return (
    <div className="p-6" data-theme="cupcake">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-base-content flex items-center gap-2">
            🔔 Gestion des Alertes
            {nonLues > 0 && (
              <span className="badge badge-error badge-lg">{nonLues}</span>
            )}
          </h1>
          <p className="text-sm text-base-content/60 mt-1">
            Notifications et alertes système
          </p>
        </div>
        {nonLues > 0 && (
          <button className="btn btn-outline btn-sm" onClick={marquerToutLu}>
            ✅ Tout marquer comme lu
          </button>
        )}
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="stat bg-base-100 rounded-2xl shadow py-3">
            <div className="stat-title text-xs">Total</div>
            <div className="stat-value text-2xl text-primary">{stats.total || alertes.length}</div>
          </div>
          <div className="stat bg-base-100 rounded-2xl shadow py-3">
            <div className="stat-title text-xs">Non lues</div>
            <div className="stat-value text-2xl text-error">{stats.non_lues || nonLues}</div>
          </div>
          <div className="stat bg-base-100 rounded-2xl shadow py-3">
            <div className="stat-title text-xs">Ruptures</div>
            <div className="stat-value text-2xl text-error">
              {alertes.filter((a) => a.type === "rupture").length}
            </div>
          </div>
          <div className="stat bg-base-100 rounded-2xl shadow py-3">
            <div className="stat-title text-xs">Stock faible</div>
            <div className="stat-value text-2xl text-warning">
              {alertes.filter((a) => a.type === "stock_faible").length}
            </div>
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="flex gap-2 mb-4">
        {["tous", "non_lues", "lues"].map((f) => (
          <button
            key={f}
            className={`btn btn-sm ${filter === f ? "btn-primary" : "btn-outline"}`}
            onClick={() => setFilter(f)}
          >
            {f === "tous" ? "Toutes" : f === "non_lues" ? "Non lues" : "Lues"}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="alert alert-error mb-4">
          <span>{error}</span>
          <button className="btn btn-sm btn-ghost" onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {/* Liste */}
      {loading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-base-100 rounded-2xl shadow">
          <div className="text-5xl mb-4">🎉</div>
          <p className="text-lg font-medium text-base-content/60">Aucune alerte</p>
          <p className="text-sm text-base-content/40">Tout est en ordre !</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((alerte) => (
            <div
              key={alerte.idAlerte}
              className={`card bg-base-100 shadow transition-all ${
                !alerte.lue ? "border-l-4 border-warning" : "opacity-70"
              }`}
            >
              <div className="card-body py-4 px-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{getTypeIcon(alerte.type)}</span>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`badge badge-sm ${getTypeStyle(alerte.type)}`}>
                          {alerte.type?.replace("_", " ") || "—"}
                        </span>
                        {!alerte.lue && (
                          <span className="badge badge-sm badge-warning">Nouveau</span>
                        )}
                      </div>
                      <p className="font-medium text-sm">{alerte.message}</p>
                      {alerte.produit && (
                        <p className="text-xs text-base-content/60 mt-1">
                          Produit : {alerte.produit.nomProduit}
                        </p>
                      )}
                      <p className="text-xs text-base-content/40 mt-1">
                        {alerte.created_at
                          ? new Date(alerte.created_at).toLocaleString("fr-FR")
                          : "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {!alerte.lue && (
                      <button
                        className="btn btn-xs btn-success"
                        onClick={() => marquerLue(alerte.idAlerte)}
                        title="Marquer comme lue"
                      >
                        ✓
                      </button>
                    )}
                    {["admin", "magasinier", "gestionnaireStock"].includes(user?.role) && (
                      <button
                        className="btn btn-xs btn-error"
                        onClick={() => handleDelete(alerte.idAlerte)}
                        title="Supprimer"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Alertes;
