import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import appConfig from "../config/app";
import { Building2, Palette, Bell, Save, RotateCcw } from "lucide-react";

const getCompanyConfig = () => {
  try {
    const saved = localStorage.getItem("company_config");
    return saved ? { ...appConfig.company, ...JSON.parse(saved) } : appConfig.company;
  } catch {
    return appConfig.company;
  }
};

const Parametres = () => {
  const { user } = useAuth();

  const [theme, setTheme] = useState(localStorage.getItem("theme") || "cupcake");
  const [notifications, setNotifications] = useState(
    localStorage.getItem("notifications") !== "false"
  );

  const [company, setCompany] = useState(getCompanyConfig());
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState("entreprise");

  const THEMES = [
  { value: "cupcake",   label: "Cupcake"   },
  { value: "light",     label: "Light"     },
  { value: "dark",      label: "Dark"      },
  { value: "corporate", label: "Corporate" },
  { value: "business",  label: "Business"  },
  { value: "night",     label: "Night"     },
  { value: "dracula",   label: "Dracula"   },
  { value: "luxury",    label: "Luxury"    },
  { value: "coffee",    label: "Coffee"    },
  { value: "forest",    label: "Forest"    },
  { value: "elegance", label: "Élégance" },
  { value: "x",         label: "X"         },
];
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const handleSaveCompany = () => {
    localStorage.setItem("company_config", JSON.stringify(company));
    showSuccess("Informations entreprise sauvegardées !");
  };

  const handleSaveAppearance = () => {
    localStorage.setItem("theme", theme);
    localStorage.setItem("notifications", String(notifications));
    document.documentElement.setAttribute("data-theme", theme);
    showSuccess("Apparence sauvegardée !");
  };

  const handleReset = () => {
    setCompany(appConfig.company);
    localStorage.removeItem("company_config");
    showSuccess("Réinitialisé aux valeurs par défaut !");
  };

  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 3000);
  };

  const tabs = [
    { id: "entreprise", label: "Entreprise", icon: <Building2 size={14} />, roles: ["gerant"] },
    { id: "apparence",  label: "Apparence",  icon: <Palette size={14} />,  roles: ["gerant", "caissier", "magasinier", "gestionnaire_stock"] },
  ].filter(t => t.roles.includes(user?.role));

  return (
    <div className="max-w-2xl mx-auto space-y-5">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-base-content flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-xl">
            <Building2 size={18} className="text-primary" />
          </div>
          Paramètres
        </h1>
        <p className="text-xs text-base-content/40 mt-0.5 ml-1">Personnalisez votre application</p>
      </div>

      {/* Success */}
      {success && (
        <div className="alert alert-success text-sm py-2 rounded-xl">
          <span>✅ {success}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs tabs-boxed bg-base-200 p-1 rounded-xl">
        {tabs.map(tab => (
          <button key={tab.id}
            className={`tab gap-2 rounded-lg transition-all ${activeTab === tab.id ? 'tab-active' : ''}`}
            onClick={() => setActiveTab(tab.id)}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ── ENTREPRISE ── */}
      {activeTab === "entreprise" && user?.role === "gerant" && (
        <div className="space-y-4">
          <div className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden">
            <div className="bg-primary text-primary-content px-5 py-3 flex items-center gap-2">
              <div className="p-1.5 bg-white/20 rounded-lg"><Building2 size={14} /></div>
              <h3 className="font-extrabold text-sm">Informations générales</h3>
            </div>
            <div className="card-body space-y-4">

              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs font-semibold uppercase tracking-wider text-base-content/60">Nom de l'entreprise</span>
                  </label>
                  <input className="input input-bordered rounded-xl"
                  value={company.name}
                  onChange={e => setCompany({ ...company, name: e.target.value })}
                  placeholder="Boutique Station Service" />
              </div>

              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs font-semibold uppercase tracking-wider text-base-content/60">Adresse</span>
                </label>
                <input className="input input-bordered rounded-xl"
                  value={company.address}
                  onChange={e => setCompany({ ...company, address: e.target.value })}
                  placeholder="Thiès, Sénégal" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text text-xs font-semibold uppercase tracking-wider text-base-content/60">Email</span>
                  </label>
                  <input type="email" className="input input-bordered rounded-xl"
                    value={company.email}
                    onChange={e => setCompany({ ...company, email: e.target.value })}
                    placeholder="contact@station.sn" />
                </div>
                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text text-xs font-semibold uppercase tracking-wider text-base-content/60">Téléphone</span>
                  </label>
                  <input className="input input-bordered rounded-xl"
                    value={company.phone}
                    onChange={e => setCompany({ ...company, phone: e.target.value })}
                    placeholder="+221 77 000 00 00" />
                </div>
              </div>

            </div>
          </div>

          <div className="flex gap-3">
            <button className="btn btn-primary flex-1 gap-2 rounded-xl" onClick={handleSaveCompany}>
              <Save size={14} /> Sauvegarder
            </button>
            <button className="btn btn-ghost gap-2 rounded-xl" onClick={handleReset}>
              <RotateCcw size={14} /> Réinitialiser
            </button>
          </div>
        </div>
      )}

      {/* ── APPARENCE ── */}
      {activeTab === "apparence" && (
        <div className="space-y-4">
          <div className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden">
            <div className="bg-primary text-primary-content px-5 py-3 flex items-center gap-2">
              <div className="p-1.5 bg-white/20 rounded-lg"><Palette size={14} /></div>
              <h3 className="font-extrabold text-sm">Thème de l'interface</h3>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-4 gap-2">
                {THEMES.map(t => (
                  <button key={t.value} data-theme={t.value}
                    className={`btn btn-sm capitalize rounded-xl ${theme === t.value ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setTheme(t.value)}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden">
            <div className="bg-primary text-primary-content px-5 py-3 flex items-center gap-2">
              <div className="p-1.5 bg-white/20 rounded-lg"><Bell size={14} /></div>
              <h3 className="font-extrabold text-sm">Notifications</h3>
            </div>
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">Alertes de stock</p>
                  <p className="text-xs text-base-content/50 mt-0.5">Notifications en cas de stock faible ou rupture</p>
                </div>
                <input type="checkbox" className="toggle toggle-primary"
                  checked={notifications}
                  onChange={e => setNotifications(e.target.checked)} />
              </div>
            </div>
          </div>

          <button className="btn btn-primary w-full gap-2 rounded-xl" onClick={handleSaveAppearance}>
            <Save size={14} /> Sauvegarder l'apparence
          </button>
        </div>
      )}

    </div>
  );
};

export default Parametres;