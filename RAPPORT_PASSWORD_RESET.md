# Rapport : Fonctionnement du Forgot Password / Reset Password

## 1. Vue d'ensemble

Le système permet à un utilisateur qui a oublié son mot de passe de :
1. Demander un lien de réinitialisation par email
2. Cliquer sur le lien reçu
3. Définir un nouveau mot de passe
4. Se reconnecter avec ce nouveau mot de passe

C'est un flux **stateless** (sans session) basé sur un **token unique** envoyé par email. Le token est temporaire (expire au bout de 60 minutes) et à usage unique.

---

## 2. Architecture

```
┌──────────────────┐         ┌─────────────────────┐         ┌──────────┐
│   FRONTEND       │  HTTP   │   BACKEND LARAVEL   │  SMTP   │  GMAIL   │
│   React (Vite)   │ ◄─────► │   API REST          │ ─────►  │  SERVER  │
│   :5173          │  JSON   │   :8000             │         │          │
└──────────────────┘         └─────────────────────┘         └──────────┘
                                       │
                                       ▼
                             ┌─────────────────────┐
                             │   MySQL             │
                             │   gestion_stocks    │
                             │ ┌─────────────────┐ │
                             │ │ utilisateurs    │ │
                             │ │ password_reset_ │ │
                             │ │   tokens        │ │
                             │ └─────────────────┘ │
                             └─────────────────────┘
```

---

## 3. Le flux complet, étape par étape

### Étape 1 : L'utilisateur saisit son email (Frontend)

**Fichier :** `frontend/src/pages/ForgotPassword.jsx`

L'utilisateur arrive sur la page "Mot de passe oublié", saisit son email et clique sur "Envoyer le lien". Le code appelle :

```javascript
await api.post('/forgot-password', { email })
```

Cela envoie une requête `POST` vers `http://localhost:8000/api/forgot-password` avec un JSON `{ "email": "..." }`.

### Étape 2 : Réception côté backend (Route API)

**Fichier :** `backend/routes/api.php`

```php
Route::post('/forgot-password', [PasswordResetController::class, 'sendLink'])
     ->middleware('throttle:3,1');
```

Le middleware `throttle:3,1` limite à **3 requêtes par minute par IP** (protection anti-bruteforce).

### Étape 3 : Génération et envoi du token (Controller)

**Fichier :** `backend/app/Http/Controllers/PasswordResetController.php`

```php
public function sendLink(Request $request) {
    // 1. Validation de l'email
    $validator = Validator::make($request->all(), [
        'email' => 'required|email',
    ]);

    // 2. Demande au broker de mots de passe Laravel d'envoyer le lien
    $status = Password::sendResetLink(
        $request->only('email')
    );

    // 3. Réponse selon le résultat
    return $status === Password::RESET_LINK_SENT
        ? response()->json(['message' => 'Lien envoyé.'])
        : response()->json(['message' => 'Email introuvable.'], 422);
}
```

### Étape 4 : Que fait `Password::sendResetLink()` en interne ?

Cette méthode Laravel fait quatre choses dans l'ordre :

1. **Cherche l'utilisateur** dans la table `utilisateurs` (configurée dans `config/auth.php`)
2. **Génère un token aléatoire sécurisé** (via `Str::random(60)`)
3. **Stocke le token hashé** dans la table `password_reset_tokens` :

   | email | token | created_at |
   |-------|-------|------------|
   | user@x.com | $2y$10$... | 2026-05-07 15:30 |

4. **Envoie une notification email** (`Illuminate\Auth\Notifications\ResetPassword`) qui :
   - Construit le contenu HTML de l'email
   - Construit le lien de reset via `ResetPassword::createUrlUsing(...)` défini dans `AppServiceProvider`
   - Envoie via le mailer configuré (SMTP Gmail dans notre cas)

### Étape 5 : Construction du lien personnalisé

**Fichier :** `backend/app/Providers/AppServiceProvider.php`

```php
ResetPassword::createUrlUsing(function ($user, string $token) {
    $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
    return $frontendUrl . '/reset-password?token=' . $token . '&email=' . urlencode($user->email);
});
```

Au lieu du lien Laravel par défaut (qui pointerait vers une route web Blade), on génère un lien vers le **frontend React** :

```
http://localhost:5173/reset-password?token=abc123def456...&email=user%40example.com
```

### Étape 6 : Envoi par SMTP Gmail

**Configuration dans `.env` :**

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=465
MAIL_USERNAME=elajmedoune12@gmail.com
MAIL_PASSWORD="wykg cfnp gjun moyo"   ← App Password Gmail (pas le vrai mdp)
MAIL_SCHEME=smtps                      ← SSL direct (pas STARTTLS)
MAIL_ENCRYPTION=ssl
MAIL_FROM_ADDRESS="elajmedoune12@gmail.com"
MAIL_FROM_NAME="GestStock SN"
FRONTEND_URL=http://localhost:5173
```

**Override SSL dans `AppServiceProvider`** (uniquement pour dev local) :

```php
Mail::extend('smtp', function (array $config) {
    // ... création du transport
    $transport->getStream()->setStreamOptions([
        'ssl' => [
            'verify_peer'       => false,
            'verify_peer_name'  => false,
            'allow_self_signed' => true,
        ],
    ]);
    return $transport;
});
```

Pourquoi ? PHP sur Windows n'a souvent pas de bundle CA configuré pour vérifier les certificats SSL. Sans cet override, on a l'erreur `certificate verify failed`.

### Étape 7 : Réception de l'email côté utilisateur

L'utilisateur reçoit dans sa boîte Gmail un email "Reset Password Notification" contenant :
- Un bouton "Reset Password" cliquable
- Un texte explicatif (token valide 60 min, etc.)
- Le lien complet en cas de problème de copier-coller

### Étape 8 : Clic sur le lien → arrivée sur le frontend

**Fichier :** `frontend/src/pages/ResetPassword.jsx`

L'utilisateur arrive sur `http://localhost:5173/reset-password?token=...&email=...`. Le code React extrait les paramètres :

```javascript
const [searchParams] = useSearchParams()
const token = searchParams.get('token')
const email = searchParams.get('email')
```

Si l'un manque, on affiche "Lien invalide". Sinon, on affiche le formulaire pour saisir le nouveau mot de passe + confirmation.

### Étape 9 : Soumission du nouveau mot de passe

```javascript
await api.post('/reset-password', {
    token,
    email,
    password:              form.password,
    password_confirmation: form.confirmation,
})
```

### Étape 10 : Validation et réinitialisation côté backend

**Fichier :** `backend/app/Http/Controllers/PasswordResetController.php`

```php
public function reset(Request $request) {
    // 1. Validation : token, email, password (min 8, confirmé)
    $validator = Validator::make($request->all(), [
        'token'    => 'required',
        'email'    => 'required|email',
        'password' => 'required|min:8|confirmed',
    ]);

    // 2. Demande au broker de réinitialiser
    $status = Password::reset(
        $request->only('email', 'password', 'password_confirmation', 'token'),
        function ($utilisateur, $password) {
            // Callback exécuté SI le token est valide
            $utilisateur->motDePasse = Hash::make($password);
            $utilisateur->save();
        }
    );

    return $status === Password::PASSWORD_RESET
        ? response()->json(['message' => 'Mot de passe réinitialisé.'])
        : response()->json(['message' => 'Token invalide ou expiré.'], 422);
}
```

### Étape 11 : Que fait `Password::reset()` en interne ?

1. **Cherche l'utilisateur** par email
2. **Cherche le token** dans `password_reset_tokens` pour cet email
3. **Vérifie le token** (compare le hash) ET vérifie qu'il n'est pas expiré (60 min, défini dans `config/auth.php`)
4. Si valide : **exécute le callback** (qui hash le nouveau mot de passe et sauvegarde l'utilisateur)
5. **Supprime le token** de la table (un token = un usage)
6. Renvoie `Password::PASSWORD_RESET` (succès) ou un statut d'erreur

### Étape 12 : Redirection et reconnexion

Côté frontend, sur succès :

```javascript
setSuccess(true)
setTimeout(() => navigate('/login'), 3000)
```

L'utilisateur est redirigé vers la page de connexion et peut se reconnecter avec son nouveau mot de passe.

---

## 4. Pourquoi le `Utilisateur` model fonctionne malgré ses noms personnalisés

Votre modèle `Utilisateur` a des champs en français (`motDePasse`, `idUtilisateur`) au lieu des standards Laravel (`password`, `id`). Pour faire fonctionner Laravel Auth, il y a deux trucs dans `app/Models/Utilisateur.php` :

```php
class Utilisateur extends Authenticatable implements CanResetPasswordContract
{
    use CanResetPassword;

    // Laravel attend "password" → on le pointe sur "motDePasse"
    public function getAuthPassword(): string {
        return $this->motDePasse;
    }

    // Email pour le reset (CanResetPassword sait déjà, mais on est explicite)
    public function getEmailForPasswordReset(): string {
        return $this->email;
    }
}
```

Le trait `CanResetPassword` ajoute la méthode `sendPasswordResetNotification()` qui est appelée automatiquement par Laravel.

---

## 5. Les tables impliquées

### `utilisateurs` (votre table principale)
Contient les comptes : `idUtilisateur`, `email`, `motDePasse`, `nom`, etc.

### `password_reset_tokens` (créée par notre nouvelle migration)
Stocke temporairement les tokens :

| Colonne | Type | Rôle |
|---------|------|------|
| email | string (PK) | Identifie l'utilisateur |
| token | string | Token hashé (bcrypt) |
| created_at | timestamp | Pour vérifier l'expiration |

**Note :** la PK est l'email, donc une seule demande active à la fois par email. Une nouvelle demande écrase l'ancienne.

---

## 6. Sécurité

Plusieurs couches protègent ce flux :

| Protection | Comment | Où |
|-----------|---------|-----|
| **Rate limiting** | 3 requêtes/min par IP sur `/forgot-password`, 5 sur `/reset-password` | `routes/api.php` |
| **Token sécurisé** | 60 caractères aléatoires, hashé en BDD | Laravel `Str::random(60)` + bcrypt |
| **Expiration** | 60 minutes | `config/auth.php` → `'expire' => 60` |
| **Usage unique** | Token supprimé après utilisation | Auto par `Password::reset()` |
| **Throttle de génération** | 60s minimum entre 2 demandes | `config/auth.php` → `'throttle' => 60` |
| **Validation password** | Min 8 caractères + confirmation | `PasswordResetController::reset` |
| **Hash en BDD** | bcrypt rounds=12 | `BCRYPT_ROUNDS=12` dans `.env` |
| **App Password Gmail** | Pas le vrai mot de passe Google | `.env` MAIL_PASSWORD |

---

## 7. Diagramme de séquence

```
User              Frontend          Backend           DB              Gmail
 │                   │                 │               │                │
 │ Saisit email      │                 │               │                │
 ├──────────────────►│                 │               │                │
 │                   │ POST /forgot    │               │                │
 │                   ├────────────────►│               │                │
 │                   │                 │ SELECT user   │                │
 │                   │                 ├──────────────►│                │
 │                   │                 │◄──────────────┤                │
 │                   │                 │ INSERT token  │                │
 │                   │                 ├──────────────►│                │
 │                   │                 │               │                │
 │                   │                 │ Send email (SMTP SSL)          │
 │                   │                 ├───────────────────────────────►│
 │                   │                 │◄───────────────────────────────┤
 │                   │ 200 OK          │               │                │
 │                   │◄────────────────┤               │                │
 │ "Email envoyé !"  │                 │               │                │
 │◄──────────────────┤                 │               │                │
 │                                                                       │
 │                  ╔═════════ Reçoit l'email Gmail ═════════════════════╣
 │                                                                       │
 │ Clique sur le lien                                                    │
 ├──────────────────►│                 │               │                │
 │                   │ Affiche form    │               │                │
 │ Saisit nouveau MDP│                 │               │                │
 ├──────────────────►│                 │               │                │
 │                   │ POST /reset     │               │                │
 │                   ├────────────────►│               │                │
 │                   │                 │ Vérif token   │                │
 │                   │                 ├──────────────►│                │
 │                   │                 │◄──────────────┤                │
 │                   │                 │ UPDATE pwd    │                │
 │                   │                 ├──────────────►│                │
 │                   │                 │ DELETE token  │                │
 │                   │                 ├──────────────►│                │
 │                   │ 200 OK          │               │                │
 │                   │◄────────────────┤               │                │
 │ Redirige /login   │                 │               │                │
 │◄──────────────────┤                 │               │                │
```

---

## 8. Fichiers clés à connaître

| Fichier | Rôle |
|---------|------|
| `backend/.env` | Config SMTP, BDD, FRONTEND_URL |
| `backend/config/auth.php` | Config du broker (table, expiration, throttle) |
| `backend/config/mail.php` | Config du mailer Symfony |
| `backend/routes/api.php` | Routes `/forgot-password` et `/reset-password` |
| `backend/app/Http/Controllers/PasswordResetController.php` | Logique métier |
| `backend/app/Providers/AppServiceProvider.php` | URL custom + override SSL |
| `backend/app/Models/Utilisateur.php` | Implémente `CanResetPassword` |
| `backend/database/migrations/2026_05_07_150000_create_password_reset_tokens_table.php` | Crée la table des tokens |
| `frontend/src/pages/ForgotPassword.jsx` | Page de demande |
| `frontend/src/pages/ResetPassword.jsx` | Page de saisie du nouveau MDP |

---

## 9. Avant la mise en production

⚠️ Trois actions à faire AVANT de déployer :

1. **Désactiver l'override SSL dev** dans `AppServiceProvider.php` :
   ```php
   if (app()->environment('local')) {
       Mail::extend('smtp', ...);   // Seulement en local
   }
   ```
   Ou configurer un vrai bundle CA dans le `php.ini` du serveur de prod.

2. **Mettre à jour `FRONTEND_URL`** dans le `.env` de prod :
   ```
   FRONTEND_URL=https://votre-domaine.com
   ```

3. **Utiliser un service email pro** plutôt que Gmail SMTP (limite à ~500 emails/jour) :
   - SendGrid (100/jour gratuit)
   - Mailgun
   - Amazon SES (très peu cher)
   - Postmark

   Il suffira de changer `MAIL_*` dans le `.env` de prod, le code reste identique.

---

## 10. Pour debugger si quelque chose casse

1. **Lire le log Laravel :**
   ```
   backend/storage/logs/laravel.log
   ```
   Cherchez `local.ERROR` pour voir les erreurs récentes.

2. **Vider les caches après tout changement de config :**
   ```bash
   php artisan config:clear
   php artisan cache:clear
   ```

3. **Vérifier que la table `password_reset_tokens` existe** :
   ```sql
   SELECT * FROM password_reset_tokens;
   ```

4. **Tester l'envoi d'email manuellement** dans `tinker` :
   ```bash
   php artisan tinker
   >>> Mail::raw('Test', fn($m) => $m->to('vous@gmail.com')->subject('Test'));
   ```

5. **Si l'email n'arrive pas** : vérifier le dossier Spam de Gmail, et regénérer un App Password sur https://myaccount.google.com/apppasswords si besoin.
