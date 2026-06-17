<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nouvelle Commande</title>
  <style>
    body { margin: 0; padding: 0; background: #f4f6f9; font-family: Arial, sans-serif; }
    .wrapper { width: 100%; padding: 30px 15px; box-sizing: border-box; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .header { background: #4f46e5; color: white; padding: 28px 24px; text-align: center; }
    .header h1 { margin: 0 0 6px; font-size: 22px; }
    .header p { margin: 0; opacity: 0.85; font-size: 14px; }
    .body { padding: 28px 24px; }
    .greeting { font-size: 16px; margin-bottom: 8px; color: #1a1a2e; }
    .date-text { color: #555; font-size: 14px; margin-bottom: 20px; }
    .info-box { background: #f9f9f9; border-radius: 8px; padding: 16px; margin-bottom: 24px; }
    .info-box p { margin: 6px 0; font-size: 14px; color: #333; }
    table { width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px; }
    th { background: #4f46e5; color: white; padding: 12px 10px; text-align: left; }
    td { padding: 10px; border-bottom: 1px solid #eee; color: #333; }
    .total { text-align: right; font-size: 16px; font-weight: bold; color: #4f46e5; margin-bottom: 24px; }
    .footer { border-top: 1px solid #eee; padding: 20px 24px; text-align: center; font-size: 13px; color: #888; }
    @media (max-width: 480px) {
      .body { padding: 20px 16px; }
      .header { padding: 20px 16px; }
      .header h1 { font-size: 18px; }
      th, td { padding: 8px 6px; font-size: 13px; }
      .total { font-size: 14px; }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">

      <div class="header">
        <h1>🛒 Nouvelle Commande</h1>
        <p>{{ $company }} — {{ $address }}</p>
      </div>

      <div class="body">
        <p class="greeting">Bonjour <strong>{{ $commande->fournisseur->nom }}</strong>,</p>
        <p class="date-text">Une nouvelle commande vous a été adressée le
          <strong>{{ \Carbon\Carbon::parse($commande->dateCommande)->format('d/m/Y') }}</strong>.
        </p>

        <div class="info-box">
          <p>📦 <strong>N° Commande :</strong> #{{ $commande->idCommande }}</p>
          <p>📅 <strong>Livraison prévue :</strong>
            {{ $commande->dateLivraisonPrevue ? \Carbon\Carbon::parse($commande->dateLivraisonPrevue)->format('d/m/Y') : 'Non définie' }}
          </p>
          <p>🔖 <strong>Statut :</strong> En attente</p>
        </div>

        <table>
          <thead>
            <tr>
              <th>Produit</th>
              <th style="text-align:center">Qté</th>
              <th style="text-align:right">Prix unit.</th>
              <th style="text-align:right">Sous-total</th>
            </tr>
          </thead>
          <tbody>
            @foreach($commande->lignes as $ligne)
            <tr>
              <td>{{ $ligne->produit->reference ?? '—' }}</td>
              <td style="text-align:center">{{ $ligne->quantite }}</td>
              <td style="text-align:right">{{ number_format($ligne->prixUnitaire ?? 0, 0, ',', ' ') }} FCFA</td>
              <td style="text-align:right">{{ number_format($ligne->sousTotal ?? 0, 0, ',', ' ') }} FCFA</td>
            </tr>
            @endforeach
          </tbody>
        </table>

        <div class="total">
          Montant total : {{ number_format($commande->montantTotal, 0, ',', ' ') }} FCFA
        </div>
      </div>

      <div class="footer">
        Cordialement,<br>
        <strong>{{ $company }}</strong> — {{ $address }}
        @if(!empty($email)) <br>📧 {{ $email }} @endif
        @if(!empty($phone)) <br>📞 {{ $phone }} @endif
      </div>

    </div>
  </div>
</body>
</html>