import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const Parametres = () => {
  const { user } = useAuth();
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "cupcake"
  );
  const [langue, setLangue] = useState(
    localStorage.getItem("langue") || "fr"
  );
  const [notifications, setNotifications] = useState(
    JSON.parse(localStorage.getItem("notifications") || "true")
  );
  const [success, setSuccess] = useState(null);

  const THEMES = [
    "cupcake", "light", "dark", "corporate",
    "retro", "cyberpunk", "valentine", "aqua",
  ];

  const handleSave = () => {
    localStorage.setItem("theme", theme);
    localStorage.setItem("langue", langue);
    localStorage.setItem("notifications", JSON.stringify(notifications));
    document.documentElement.setAttribute("data-theme", theme);
    setSuccess("Paramètres sauvegardés !");
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleReset = () => {
    setTheme("cupcake");
    setLangue("fr");
    setNotifications(true);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto" data-theme={theme}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">⚙️ Paramètres</h1>
        <p className="text-sm text-base-content/60 mt-1">
          Personnaliser votre expérience
        </p>
      </div>

      {success && (
        <div className="alert alert-success mb-4">
          <span>✅ {success}</span>
        </div>
      )}

      {/* Apparence */}
      <div className="card bg-base-100 shadow mb-4">
        <div className="card-body">
          <h2 className="card-title text-base">🎨 Apparence</h2>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Thème de l'interface</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {THEMES.map((t) => (
                <button
                  key={t}
                  data-theme={t}
                  className={`btn btn-sm capitalize ${
                    theme === t ? "btn-primary" : "btn-outline"
                  }`}
                  onClick={() => setTheme(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Langue */}
      <div className="card bg-base-100 shadow mb-4">
        <div className="card-body">
          <h2 className="card-title text-base">🌍 Langue</h2>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Langue de l'interface</span>
            </label>
            <select
              className="select select-bordered w-full max-w-xs"
              value={langue}
              onChange={(e) => setLangue(e.target.value)}
            >
              <option value="fr">🇫🇷 Français</option>
              <option value="en">🇬🇧 English</option>
              <option value="wo">🇸🇳 Wolof</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="card bg-base-100 shadow mb-4">
        <div className="card-body">
          <h2 className="card-title text-base">🔔 Notifications</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Alertes de stock</p>
              <p className="text-sm text-base-content/60">
                Recevoir des notifications en cas de stock faible ou rupture
              </p>
            </div>
            <input
              type="checkbox"
              className="toggle toggle-primary"
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
            />
          </div>
        </div>
      </div>

      {/* Infos système */}
      {user?.role === "admin" && (
        <div className="card bg-base-100 shadow mb-4">
          <div className="card-body">
            <h2 className="card-title text-base">ℹ️ Informations Système</h2>
            <div className="overflow-x-auto">
              <table className="table table-sm">
                <tbody>
                  <tr>
                    <td className="font-medium text-base-content/60">Application</td>
                    <td>Gestion Stock Boutique Station Service</td>
                  </tr>
                  <tr>
                    <td className="font-medium text-base-content/60">Version</td>
                    <td>1.0.0</td>
                  </tr>
                  <tr>
                    <td className="font-medium text-base-content/60">Stack</td>
                    <td>Laravel 12 + React 18</td>
                  </tr>
                  <tr>
                    <td className="font-medium text-base-content/60">Base de données</td>
                    <td>MySQL / MariaDB</td>
                  </tr>
                  <tr>
                    <td className="font-medium text-base-content/60">Votre rôle</td>
                    <td>
                      <span className="badge badge-error capitalize">{user?.role}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button className="btn btn-primary flex-1" onClick={handleSave}>
          💾 Sauvegarder
        </button>
        <button className="btn btn-ghost" onClick={handleReset}>
          🔄 Réinitialiser
        </button>
      </div>
    </div>
  );
};

export default Parametres;
