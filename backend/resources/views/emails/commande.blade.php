<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; padding: 30px; background:#f5f5f5;">

  <div style="max-width:600px; margin:auto; background:white; border-radius:12px; padding:30px; box-shadow:0 2px 8px rgba(0,0,0,0.1);">

    <!-- Header -->
    <div style="background:#4f46e5; color:white; padding:20px; border-radius:8px; margin-bottom:24px; text-align:center;">
      <h1 style="margin:0; font-size:20px;">🛒 Nouvelle Commande</h1>
      <p style="margin:4px 0 0; opacity:0.85; font-size:14px;">Boutique Station Service — Thiès, Sénégal</p>
    </div>

    <!-- Bonjour -->
    <p style="font-size:16px;">Bonjour <strong>{{ $commande->fournisseur->nom }}</strong>,</p>
    <p style="color:#555;">Une nouvelle commande vous a été adressée le
      <strong>{{ \Carbon\Carbon::parse($commande->dateCommande)->format('d/m/Y') }}</strong>.
    </p>

    <!-- Infos commande -->
    <div style="background:#f9f9f9; border-radius:8px; padding:16px; margin:16px 0; font-size:14px;">
      <p style="margin:4px 0;">📦 <strong>N° Commande :</strong> #{{ $commande->idCommande }}</p>
      <p style="margin:4px 0;">📅 <strong>Livraison prévue :</strong>
        {{ $commande->dateLivraisonPrevue ? \Carbon\Carbon::parse($commande->dateLivraisonPrevue)->format('d/m/Y') : 'Non définie' }}
      </p>
      <p style="margin:4px 0;">🔖 <strong>Statut :</strong> En attente</p>
    </div>

    <!-- Tableau lignes -->
    <table width="100%" border="1" cellpadding="10" cellspacing="0"
           style="border-collapse:collapse; font-size:14px; margin-bottom:16px;">
      <tr style="background:#4f46e5; color:white;">
        <th align="left">Produit</th>
        <th align="center">Quantité</th>
        <th align="right">Prix unitaire</th>
        <th align="right">Sous-total</th>
      </tr>
      @foreach($commande->lignes as $ligne)
      <tr style="border-bottom:1px solid #eee;">
        <td>{{ $ligne->produit->reference ?? '—' }}</td>
        <td align="center">{{ $ligne->quantiteCommande }}</td>
        <td align="right">{{ number_format($ligne->prixUnitaire ?? 0, 0, ',', ' ') }} FCFA</td>
        <td align="right">{{ number_format($ligne->montantLigne ?? 0, 0, ',', ' ') }} FCFA</td>
      </tr>
      @endforeach
    </table>

    <!-- Total -->
    <div style="text-align:right; font-size:16px; font-weight:bold; color:#4f46e5;">
      Montant total : {{ number_format($commande->montantTotal, 0, ',', ' ') }} FCFA
    </div>

    <!-- Footer -->
    <hr style="margin:24px 0; border:none; border-top:1px solid #eee;">
    <p style="font-size:13px; color:#888; text-align:center;">
      Cordialement,<br>
      <strong>Boutique Station Service</strong> — Thiès, Sénégal
    </p>

  </div>
</body>
</html>