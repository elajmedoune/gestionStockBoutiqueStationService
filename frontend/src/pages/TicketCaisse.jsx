import { useRef } from "react";
import appConfig from "../../config/app";

const TicketCaisse = ({ vente, onClose }) => {
  const ticketRef = useRef(null);
  const company = appConfig.company;

  const handlePrint = () => {
    const content = ticketRef.current.innerHTML;
    const win = window.open("", "_blank", "width=400,height=600");
    win.document.write(`
      <html>
        <head>
          <title>Ticket Caisse</title>
          <style>
            * { box-sizing: border-box; }
            body { font-family: 'Courier New', monospace; font-size: 12px; margin: 0; padding: 10px; width: 80mm; }
            .separator-solid  { border-top: 1px solid #000; margin: 6px 0; }
            .separator-dashed { border-top: 1px dashed #000; margin: 6px 0; }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .row { display: flex; justify-content: space-between; margin: 2px 0; }
            .title { font-size: 15px; font-weight: bold; text-align: center; letter-spacing: 1px; }
            .subtitle { font-size: 11px; text-align: center; color: #444; }
            .total-row { display: flex; justify-content: space-between; font-size: 14px; font-weight: bold; margin: 4px 0; }
            .article-name { font-weight: bold; }
            .article-detail { display: flex; justify-content: space-between; padding-left: 8px; color: #333; }
            .badge { display: inline-block; border: 1px solid #000; padding: 1px 6px; font-size: 10px; border-radius: 3px; }
            .footer { text-align: center; font-size: 11px; color: #555; margin-top: 4px; }
            .ticket-no { font-size: 13px; font-weight: bold; }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `);
    win.document.close();
    win.print();
    win.close();
  };

  if (!vente) {
    return (
      <div className="p-6 text-center">
        <div className="text-5xl mb-4">🧾</div>
        <p className="text-base-content/60">Aucune vente sélectionnée</p>
      </div>
    );
  }

  const totalHT    = vente.totalHorsTaxe  || vente.lignes?.reduce((s, l) => s + (l.quantite * l.prixUnitaire), 0) || 0;
  const tva        = vente.tva            || (totalHT * appConfig.tva / 100);
  const totalTTC   = vente.montantTotal   || (totalHT + tva);
  const monnaie    = vente.montantRecu    ? vente.montantRecu - totalTTC : null;

  const date = vente.created_at ? new Date(vente.created_at) : new Date();

  return (
    <div className="p-6 max-w-sm mx-auto">
      {/* Aperçu ticket */}
      <div
        ref={ticketRef}
        className="bg-white border border-dashed border-gray-300 p-4 rounded-xl shadow-inner"
        style={{ fontFamily: "'Courier New', monospace", fontSize: "12px" }}
      >
        {/* En-tête */}
        <div className="text-center mb-3">
          <div style={{ fontSize: "22px", fontWeight: "bold", letterSpacing: "2px", marginBottom: "4px" }}>
            {company.name.toUpperCase()}
          </div>
          {company.slogan && (
            <div style={{ fontSize: "11px", color: "#555" }}>{company.slogan}</div>
          )}
          {company.address && (
            <div style={{ fontSize: "11px" }}>{company.address}</div>
          )}
          {company.phone && (
            <div style={{ fontSize: "11px" }}>Tél : {company.phone}</div>
          )}
          {company.email && (
            <div style={{ fontSize: "11px" }}>{company.email}</div>
          )}
        </div>

        <div style={{ borderTop: "2px solid #000", margin: "6px 0" }} />

        {/* Infos vente */}
        <div style={{ display: "flex", justifyContent: "space-between", margin: "2px 0" }}>
          <span style={{ fontWeight: "bold" }}>TICKET N°</span>
          <span style={{ fontWeight: "bold" }}>#{String(vente.idVente || "—").padStart(5, "0")}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", margin: "2px 0" }}>
          <span>Date :</span>
          <span>{date.toLocaleDateString("fr-FR")}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", margin: "2px 0" }}>
          <span>Heure :</span>
          <span>{date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
        </div>
        {vente.utilisateur && (
          <div style={{ display: "flex", justifyContent: "space-between", margin: "2px 0" }}>
            <span>Caissier :</span>
            <span>{vente.utilisateur.prenom} {vente.utilisateur.nom}</span>
          </div>
        )}
        {vente.modePaiement && (
          <div style={{ display: "flex", justifyContent: "space-between", margin: "2px 0" }}>
            <span>Paiement :</span>
            <span style={{ textTransform: "capitalize" }}>{vente.modePaiement}</span>
          </div>
        )}

        <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }} />

        {/* Articles */}
        <div style={{ fontWeight: "bold", marginBottom: "4px" }}>ARTICLES</div>
        {vente.lignes?.map((ligne, i) => (
          <div key={i} style={{ marginBottom: "4px" }}>
            <div style={{ fontWeight: "bold" }}>
              {ligne.produit?.nomProduit || ligne.nomProduit || `Article ${i + 1}`}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", paddingLeft: "8px", color: "#333" }}>
              <span>{ligne.quantite} x {Number(ligne.prixUnitaire || 0).toLocaleString("fr-FR")} {appConfig.currency}</span>
              <span>{Number((ligne.quantite || 1) * (ligne.prixUnitaire || 0)).toLocaleString("fr-FR")} {appConfig.currency}</span>
            </div>
          </div>
        ))}

        <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }} />

        {/* Totaux */}
        <div style={{ display: "flex", justifyContent: "space-between", margin: "2px 0" }}>
          <span>Sous-total HT :</span>
          <span>{Number(totalHT).toLocaleString("fr-FR")} {appConfig.currency}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", margin: "2px 0" }}>
          <span>TVA ({appConfig.tva}%) :</span>
          <span>{Number(tva).toLocaleString("fr-FR")} {appConfig.currency}</span>
        </div>

        <div style={{ borderTop: "1px solid #000", margin: "6px 0" }} />

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", fontWeight: "bold", margin: "4px 0" }}>
          <span>TOTAL TTC :</span>
          <span>{Number(totalTTC).toLocaleString("fr-FR")} {appConfig.currency}</span>
        </div>

        {vente.montantRecu && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", margin: "2px 0" }}>
              <span>Montant reçu :</span>
              <span>{Number(vente.montantRecu).toLocaleString("fr-FR")} {appConfig.currency}</span>
            </div>
            {monnaie >= 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", margin: "2px 0" }}>
                <span>Monnaie rendue :</span>
                <span>{Number(monnaie).toLocaleString("fr-FR")} {appConfig.currency}</span>
              </div>
            )}
          </>
        )}

        <div style={{ borderTop: "2px solid #000", margin: "6px 0" }} />

        {/* Pied de page */}
        <div className="text-center" style={{ fontSize: "11px", color: "#555", marginTop: "4px" }}>
          <div style={{ fontWeight: "bold", marginBottom: "2px" }}>Merci pour votre achat !</div>
          <div>À bientôt 😊</div>
          <div style={{ marginTop: "4px" }}>
            {date.toLocaleDateString("fr-FR", {
              weekday: "long", year: "numeric",
              month: "long", day: "numeric",
            })}
          </div>
          {company.address && (
            <div style={{ marginTop: "4px", fontSize: "10px" }}>{company.address}</div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-4">
        <button className="btn btn-primary flex-1 gap-2" onClick={handlePrint}>
          🖨️ Imprimer le ticket
        </button>
        {onClose && (
          <button className="btn btn-ghost" onClick={onClose}>
            ✕ Fermer
          </button>
        )}
      </div>
      <p className="text-xs text-base-content/40 text-center mt-2">
        Format 80mm — Compatible imprimante thermique
      </p>
    </div>
  );
};

export default TicketCaisse;