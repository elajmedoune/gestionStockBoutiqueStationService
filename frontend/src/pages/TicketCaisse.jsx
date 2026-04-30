import { useRef } from "react";

const TicketCaisse = ({ vente, onClose }) => {
  const ticketRef = useRef(null);

  const handlePrint = () => {
    const content = ticketRef.current.innerHTML;
    const win = window.open("", "_blank", "width=400,height=600");
    win.document.write(`
      <html>
        <head>
          <title>Ticket Caisse</title>
          <style>
            body { font-family: 'Courier New', monospace; font-size: 12px; margin: 0; padding: 10px; }
            .separator { border-top: 1px dashed #000; margin: 8px 0; }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .row { display: flex; justify-content: space-between; }
            .title { font-size: 16px; font-weight: bold; text-align: center; }
            .total { font-size: 14px; font-weight: bold; }
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
      <div className="p-6 text-center" data-theme="cupcake">
        <div className="text-5xl mb-4">🧾</div>
        <p className="text-base-content/60">Aucune vente sélectionnée</p>
      </div>
    );
  }

  const total = vente.lignes?.reduce(
    (sum, l) => sum + (l.quantite * l.prixUnitaire), 0
  ) || vente.montantTotal || 0;

  const date = vente.created_at
    ? new Date(vente.created_at)
    : new Date();

  return (
    <div className="p-6 max-w-sm mx-auto" data-theme="cupcake">
      {/* Aperçu ticket */}
      <div
        ref={ticketRef}
        className="bg-white border border-dashed border-gray-400 p-4 font-mono text-sm rounded-lg shadow-inner"
        style={{ fontFamily: "'Courier New', monospace" }}
      >
        {/* En-tête */}
        <div className="center mb-2">
          <div className="title">STATION SHELL THIÈS</div>
          <div>Boutique Station Service</div>
          <div>Thiès Ouest, Route de Dakar</div>
          <div>Tel: +221 XX XXX XX XX</div>
        </div>

        <div className="separator"></div>

        {/* Infos vente */}
        <div className="row">
          <span>Ticket N°:</span>
          <span className="bold">#{vente.idVente || "—"}</span>
        </div>
        <div className="row">
          <span>Date:</span>
          <span>{date.toLocaleDateString("fr-FR")}</span>
        </div>
        <div className="row">
          <span>Heure:</span>
          <span>{date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
        </div>
        {vente.utilisateur && (
          <div className="row">
            <span>Caissier:</span>
            <span>{vente.utilisateur.prenom} {vente.utilisateur.nom}</span>
          </div>
        )}

        <div className="separator"></div>

        {/* Lignes produits */}
        <div className="bold mb-1">ARTICLES</div>
        {vente.lignes?.map((ligne, i) => (
          <div key={i} className="mb-1">
            <div>{ligne.produit?.nomProduit || ligne.nomProduit || `Article ${i + 1}`}</div>
            <div className="row">
              <span>  {ligne.quantite} x {Number(ligne.prixUnitaire || 0).toLocaleString()} F</span>
              <span>{Number((ligne.quantite || 1) * (ligne.prixUnitaire || 0)).toLocaleString()} F</span>
            </div>
          </div>
        ))}

        <div className="separator"></div>

        {/* Total */}
        <div className="row total">
          <span>TOTAL:</span>
          <span>{Number(total).toLocaleString()} FCFA</span>
        </div>

        {vente.montantRecu && (
          <>
            <div className="row">
              <span>Reçu:</span>
              <span>{Number(vente.montantRecu).toLocaleString()} FCFA</span>
            </div>
            <div className="row bold">
              <span>Monnaie:</span>
              <span>{Number(vente.montantRecu - total).toLocaleString()} FCFA</span>
            </div>
          </>
        )}

        {vente.modePaiement && (
          <div className="row">
            <span>Paiement:</span>
            <span className="capitalize">{vente.modePaiement}</span>
          </div>
        )}

        <div className="separator"></div>

        {/* Pied de page */}
        <div className="center mt-2">
          <div>Merci pour votre achat !</div>
          <div>À bientôt 😊</div>
          <div className="mt-2 text-xs">
            {date.toLocaleDateString("fr-FR", {
              weekday: "long", year: "numeric",
              month: "long", day: "numeric",
            })}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-4">
        <button className="btn btn-primary flex-1" onClick={handlePrint}>
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
