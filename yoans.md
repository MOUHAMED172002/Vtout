# Documentation Technique — Vtout Platform

> **Dernière mise à jour :** Avril 2026  
> Ce document est la référence technique complète pour le déploiement, la configuration et la maintenance de la plateforme Vtout.

---

## 1. Architecture Générale

La plateforme est composée de **trois applications indépendantes** partageant un backend commun :

| Application | Dossier | Port Dev | Description |
|---|---|---|---|
| **Boutique Client** | `frontend/` | `5173` | Interface d'achat pour les clients |
| **Portail Fournisseur** | `supplier-portal/` | `5174` | Interface dédiée aux fournisseurs (sous-domaine) |
| **Backend API** | `server/` | `3000` | API REST Node.js/Express + MySQL + Socket.io |

---

## 2. Stack Technologique

### Backend (`server/`)
- **Runtime** : Node.js `>=18.x`
- **Framework** : Express `^5.1.0`
- **ORM** : Sequelize `^6.37.7` + MySQL2 `^3.17.1`
- **Authentification** : Better Auth `^1.5.6`
- **Temps réel** : Socket.io `^4.8.3`
- **Upload** : Multer `^2.0.2` + Cloudinary
- **Emails** : Resend `^6.9.4`
- **Sécurité** : Helmet, express-rate-limit, HPP, xss-clean

### Frontend Client (`frontend/`)
- **Framework** : React `^18.3.1` + Vite `^7.x`
- **Style** : TailwindCSS `^3.4.x` + DaisyUI `^5.x`
- **Authentification** : Better Auth (session cookie)
- **Cartographie** : Leaflet + React-Leaflet (tuiles Google Maps, gratuit)
- **Paiement** : FedaPay
- **Animations** : Framer Motion

### Portail Fournisseur (`supplier-portal/`)
- **Framework** : React `^19.x` + Vite `^7.x`
- **Style** : TailwindCSS `^4.x`
- **HTTP** : Axios

---

## 3. Variables d'Environnement

### `server/.env`
```env
# Base de données
MYSQL_DATABASE_URL=mysql://user:password@host:3306/eshop_db

# Better Auth
BETTER_AUTH_SECRET=un_secret_tres_long_et_aleatoire_min_32_chars
BETTER_AUTH_URL=https://api.vtout.com

# Cloudinary (Uploads images)
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# FedaPay (Paiement)
FEDAPAY_SECRET=sk_live_...
FEDAPAY_WEBHOOK_SECRET=un_secret_robuste

# Resend (Emails)
RESEND_API_KEY=re_...
FRONTEND_URL=https://vtout.com
ADMIN_URL=https://vtout.com/admin
ADMIN_NOTIF_EMAIL=admin@vtout.com

# Serveur
PORT=3000
ADMIN_EMAILS=admin@vtout.com,autre@vtout.com
ALLOWED_ORIGINS=https://vtout.com,https://vendeur.vtout.com
```

### `frontend/.env`
```env
VITE_API_URL=https://api.vtout.com/api
VITE_FEDAPAY_PUBLIC_KEY=pk_live_...
```

### `supplier-portal/.env`
```env
VITE_API_URL=https://api.vtout.com/api
```

---

## 4. Procédure de Déploiement

### Backend
```bash
cd server
npm install
# Créer server/.env avec les valeurs de production
pm2 start index.js --name "vtout-api"
pm2 save && pm2 startup
```

### Frontend Client
```bash
cd frontend
npm install
# Créer frontend/.env
npm run build
# Servir frontend/dist/ sur vtout.com
```

### Portail Fournisseur
```bash
cd supplier-portal
npm install
# Créer supplier-portal/.env
npm run build
# Servir supplier-portal/dist/ sur vendeur.vtout.com
```

---

## 5. Configuration Nginx (Production)

### Boutique client (`vtout.com`)
```nginx
server {
    listen 80;
    server_name vtout.com www.vtout.com;
    root /var/www/vtout/frontend/dist;
    index index.html;
    location / { try_files $uri $uri/ /index.html; }
}
```

### Portail fournisseur (`vendeur.vtout.com`)
```nginx
server {
    listen 80;
    server_name vendeur.vtout.com;
    root /var/www/vtout/supplier-portal/dist;
    index index.html;
    location / { try_files $uri $uri/ /index.html; }
}
```

### API Backend + Socket.io (`api.vtout.com`)
```nginx
server {
    listen 80;
    server_name api.vtout.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        # Headers WebSocket pour Socket.io
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

> **HTTPS obligatoire** :
> ```bash
> certbot --nginx -d vtout.com -d www.vtout.com -d api.vtout.com -d vendeur.vtout.com
> ```

---

## 6. Système de Rôles (RBAC)

| Rôle | Accès |
|---|---|
| `user` (Client) | Boutique, commandes, profil, support chat |
| `fournisseur` | Portail fournisseur, gestion de ses produits, commandes reçues |
| `livreur` | App livreur, courses disponibles, suivi de position GPS |
| `admin` | Dashboard complet, gestion de tout |

---

## 7. Système de Livraison

### Zones de livraison gratuites
Les quartiers et villes inclus dans ces zones bénéficient de la livraison gratuite :
- Cotonou (Littoral)
- Abomey-Calavi
- Porto-Novo
- Sèmè-Kpodji

### Calcul des frais hors zone
- **Référence** : Trajet Cotonou → Abomey-Calavi = **500 FCFA**
- Les frais sont calculés proportionnellement à la distance réelle du client.
- Le calcul se fait automatiquement lors du checkout.

### Assignation automatique
Lors d'une commande, le système sélectionne automatiquement :
1. **Le fournisseur le plus proche** du client parmi ceux vendant les produits commandés.
2. **Le livreur disponible le plus proche** du fournisseur sélectionné.

### Code de livraison (Sécurité)
- Un code à **4 chiffres** est généré à la création de la commande.
- Il est visible uniquement par le **client** dans ses commandes.
- Le livreur doit saisir ce code pour valider la livraison (statut → `livree`).
- Protection contre les fausses livraisons.

### Rémunération livreur
- Le livreur voit son **compteur de livraisons** s'incrémenter à chaque livraison validée.
- Les livraisons en paiement à la livraison créent une **dette** (argent à remettre à l'admin).
- Le livreur ne peut pas prendre de nouvelle course tant qu'il a une dette non remise.
- L'admin confirme la remise → statut de paiement passe à `payé`.

---

## 8. Chat de Support Interne

- **Un canal unique** : Admin ↔ Utilisateur (client, fournisseur, ou livreur).
- Accessible depuis une **icône flottante** sur toutes les pages (côté utilisateur).
- L'admin voit **toutes les conversations** dans son dashboard (onglet Support).
- Chaque message est identifié par le rôle de l'expéditeur avec une icône de badge.
- Communication en **temps réel** via Socket.io.

---

## 9. Cartographie

- **Bibliothèque** : Leaflet + React-Leaflet (open source, 100% gratuit)
- **Fond de carte** : Tuiles Google Maps (lyrs=m) via les serveurs mt0/mt1/mt2/mt3
- **Aucun token Google Maps requis** — compatible sans compte Google Cloud
- **Tour de contrôle admin** : Vue globale des livreurs en temps réel
- **Suivi client** : Carte de suivi de sa livraison en cours

---

## 10. Sécurité

| Mesure | Détail |
|---|---|
| **Helmet** | En-têtes HTTP sécurisés |
| **Rate Limiting** | 100 req/15min (général) / 10 req/15min (auth) |
| **XSS Clean** | Sanitisation des entrées utilisateur |
| **HPP** | Protection contre la pollution des paramètres HTTP |
| **CORS restreint** | Seules les origines `ALLOWED_ORIGINS` sont autorisées |
| **Better Auth** | Authentification par session sécurisée (cookie httpOnly) |
| **RBAC** | Middlewares `requireAuth`, `requireAdmin`, `requireLivreur`, `requireFournisseur` |
| **Code livraison** | Validation à 4 chiffres pour confirmer une livraison |
| **Body limit** | Requêtes limitées à 10kb pour prévenir les attaques DoS |

---

## 11. Notifications Email (Resend)

| Événement | Destinataire |
|---|---|
| Nouvelle commande passée | Admin (`ADMIN_NOTIF_EMAIL`) |
| Changement de statut commande | Client |
| Produit approuvé / refusé | Fournisseur |
| Facture après paiement | Client |

> **Config** : Créer un compte [resend.com](https://resend.com), vérifier votre domaine, et renseigner `RESEND_API_KEY`. Mettre à jour l'adresse `from` dans `server/services/mailService.js` avec votre domaine vérifié.

---

## 12. Dépannage Courant

| Problème | Solution |
|---|---|
| `EADDRINUSE: port 3000` | `powershell -Command "Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess -Force"` |
| Erreur 500 dashboard | Les requêtes sont isolées, vérifier les logs MySQL (mode `ONLY_FULL_GROUP_BY`) |
| Socket.io `ERR_CONNECTION_REFUSED` | Le serveur backend est arrêté — relancer `npm run dev` dans `server/` |
| Auth 401 Unauthorized | Vérifier que `BETTER_AUTH_SECRET` est identique côté client et serveur |
| Upload échoue | Vérifier les credentials Cloudinary dans `server/.env` |

ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIK9QgH1C61SxPYk5F70Qc66dMf0CZJkHyh93gNN4d20o vtout_github

