# Documentation de Déploiement - Vtout App

Ce document regroupe toutes les informations nécessaires à l'équipe DevOps pour le déploiement, la configuration et la gestion de la plateforme Vtout.

---

## 1. Vue d'ensemble de l'Architecture

La plateforme est composée de **trois applications totalement indépendantes** partageant le même backend :

| Application | Dossier | Description |
|---|---|---|
| **Site client (Boutique)** | `frontend/` | Interface d'achat pour les clients |
| **Portail Fournisseur** | `supplier-portal/` | Interface dédiée exclusivement aux fournisseurs, hébergeable sur un sous-domaine (ex: `vendeur.vtout.bj`) |
| **Backend (API REST)** | `server/` | Serveur Node.js/Express connecté à MySQL, commun aux deux frontends |

---

## 2. Technologies Utilisées et Versions

### **Frontend Client (`frontend/`)**
- **React** : `^18.3.1`
- **Vite** : `^7.1.2`
- **TailwindCSS** : `^3.4.17` / **DaisyUI** : `^5.2.3`
- **Authentification** : `@clerk/clerk-react` (`^5.60.1`)
- **Cartographie** : `mapbox-gl` + `react-map-gl` (remplacement de Google Maps)
- **Paiement** : FedaPay (`fedapay-reactjs` `^1.1.2`)
- **Animations** : Framer Motion, AOS
- **Stockage médias** : Cloudinary

### **Portail Fournisseur (`supplier-portal/`)**
- **React** : `^19.x`
- **Vite** : `^7.x`
- **TailwindCSS** : `^4.x` (avec plugin `@tailwindcss/vite`)
- **Authentification** : `@clerk/clerk-react` (même instance Clerk que le site principal)
- **Cartographie** : `mapbox-gl` + `react-map-gl` v8
- **Animations** : Framer Motion
- **HTTP** : Axios

### **Backend (`server/`)**
- **Node.js** : `>=18.x`
- **Framework** : Express (`^5.1.0`)
- **Base de données ORM** : Sequelize (`^6.37.7`)
- **Pilote BDD** : MySQL (`mysql2` `^3.17.1`)
- **Authentification** : `@clerk/clerk-sdk-node` (`^4.13.7`)
- **Upload d'images** : Multer (`^2.0.2`) + Cloudinary / Multer Storage Cloudinary
- **Emails** : Resend (`^6.9.2`)
- **Sécurité** : `helmet`, `express-rate-limit`, `hpp`, `xss-clean`

---

## 3. Points d'Entrée (Entry Points)

### **Site Client (`frontend/`)**
- Fichier principal : `frontend/index.html` et `frontend/src/main.jsx`
- Commande dev : `npm run dev` (port `5173`)
- Commande build : `npm run build` → génère `frontend/dist/`

### **Portail Fournisseur (`supplier-portal/`)**
- Fichier principal : `supplier-portal/index.html` et `supplier-portal/src/main.jsx`
- Commande dev : `npm run dev` (port `5174`)
- Commande build : `npm run build` → génère `supplier-portal/dist/`
- **Déployable sur** : `vendeur.vtout.bj` (sous-domaine séparé)

### **Backend (`server/`)**
- Fichier principal : `server/index.js`
- Commande dev : `npm run dev` (nodemon)
- Commande prod : `npm start` ou `pm2 start index.js --name vtout-api`
- Port défini par `PORT` dans `.env` (défaut : `3000`)

---

## 4. Prérequis Système pour le Serveur

- Node.js : version `v18.x` ou supérieure
- NPM : version `v9.x` ou supérieure
- Base de données : Serveur **MySQL** fonctionnel

---

## 5. Variables d'Environnement (.env)

### **Backend (`server/.env`)**

```env
# Base de Données (MySQL)
MYSQL_DATABASE_URL=mysql://root:password@host:3306/eshop_db

# Clerk (Authentification)
CLERK_SECRET_KEY=sk_live_...
CLERK_PUBLISHABLE_KEY=pk_live_...

# Cloudinary (Uploads)
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# FedaPay (Paiement)
FEDAPAY_SECRET=sk_live_...

# Webhook FedaPay (Sécurité)
FEDAPAY_WEBHOOK_SECRET=choisir_un_secret_robuste_et_aleatoire

# Configuration Serveur
PORT=3000

# Administration
ADMIN_EMAILS=admin1@vtout.com,admin2@vtout.com

# CORS — Lister toutes les origines autorisées
ALLOWED_ORIGINS=https://vtout.bj,https://vendeur.vtout.bj

# Email (Resend)
RESEND_API_KEY=re_...
FRONTEND_URL=https://vtout.bj
ADMIN_URL=https://vtout.bj/admin
ADMIN_NOTIF_EMAIL=admin@vtout.com
```

### **Frontend Client (`frontend/.env`)**

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_live_...
VITE_API_URL=https://api.vtout.bj/api
VITE_FEDAPAY_PUBLIC_KEY=pk_live_...

# Mapbox (Carte de livraison)
VITE_MAPBOX_TOKEN=pk.eyJ1...
```

### **Portail Fournisseur (`supplier-portal/.env`)**

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_live_...   # Même clef que le site principal
VITE_API_URL=https://api.vtout.bj/api    # Même API backend
VITE_MAPBOX_TOKEN=pk.eyJ1...             # Même token Mapbox
```

---

## 6. Procédure de Déploiement

### Étape 1 : Cloner le Référentiel
```bash
git clone <URL_DU_REPO>
cd eshop
```

### Étape 2 : Déploiement du Backend (API)
```bash
cd server
npm install
# Configurer server/.env avec les valeurs de production
pm2 start index.js --name "vtout-api"
pm2 save
pm2 startup
```

### Étape 3 : Déploiement du Site Client
```bash
cd ../frontend
npm install
# Configurer frontend/.env
npm run build
# Déployer frontend/dist/ sur vtout.bj
```

### Étape 4 : Déploiement du Portail Fournisseur (sous-domaine)
```bash
cd ../supplier-portal
npm install
# Configurer supplier-portal/.env
npm run build
# Déployer supplier-portal/dist/ sur vendeur.vtout.bj
```

---

## 7. Configuration Nginx (Production)

### Site Client (`vtout.bj`)
```nginx
server {
    listen 80;
    server_name vtout.bj www.vtout.bj;
    root /var/www/vtout/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Portail Fournisseur (`vendeur.vtout.bj`)
```nginx
server {
    listen 80;
    server_name vendeur.vtout.bj;
    root /var/www/vtout/supplier-portal/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Backend API (`api.vtout.bj`)
```nginx
server {
    listen 80;
    server_name api.vtout.bj;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

> **💡 HTTPS obligatoire en production** : Utilisez Certbot (Let's Encrypt) pour SSL sur chaque domaine/sous-domaine.
```bash
certbot --nginx -d vtout.bj -d www.vtout.bj -d api.vtout.bj -d vendeur.vtout.bj
```

---

## 8. Base de Données

Le backend utilise **Sequelize**. Les tables sont synchronisées automatiquement au démarrage du serveur via `sequelize.sync()`. Assurez-vous que la base de données MySQL est accessible avant de lancer le serveur.

---

## 9. Sécurité (Mesures en Place)

| Mesure | Détail |
|---|---|
| **Helmet** | En-têtes HTTP sécurisés automatiques |
| **Rate Limiting** | 100 req/15min (général) / 10 req/15min (auth strict) |
| **XSS Clean** | Sanitisation des inputs utilisateur |
| **HPP** | Protection contre la pollution des paramètres HTTP |
| **CORS restreint** | Seules les origines listées dans `ALLOWED_ORIGINS` sont autorisées |
| **Webhook FedaPay** | Vérification par token secret (`FEDAPAY_WEBHOOK_SECRET`) |
| **RBAC Clerk** | Rôles : `client`, `fournisseur`, `livreur`, `admin` |
| **Upload sécurisé** | Upload multiple réservé aux fournisseurs et admins uniquement |

---

## 10. Système de Notifications Email (Resend)

Le backend envoie automatiquement des emails dans ces situations :

| Événement | Destinataire |
|---|---|
| Nouvelle commande passée | Admin (`ADMIN_NOTIF_EMAIL`) |
| Changement de statut commande | Client |
| Produit approuvé / refusé | Fournisseur |
| Facture après paiement | Client |

> **Configuration** : Créer un compte sur [resend.com](https://resend.com), vérifier votre domaine, et renseigner `RESEND_API_KEY` dans `server/.env`. Changer l'adresse `from` dans `server/services/mailService.js` de `onboarding@resend.dev` vers votre domaine vérifié en production.

---

## 11. Notes de l'Équipe Développement

- **Avis clients** : Un seul avis par produit et par utilisateur (anti-doublon).
- **Cartographie** : Mapbox remplace Google Maps pour la sélection des points de livraison et la localisation des fournisseurs.
- **Cookie Consent** : Banner RGPD intégré côté client.
- **Portail Fournisseur** : Application React séparée sur sous-domaine. Les fournisseurs s'inscrivent via `/inscription`, soumettent leurs produits pour approbation admin, et reçoivent des notifications email lors des décisions.
- **Sécurité et Propriété** : Un fournisseur peut uniquement modifier ou supprimer les produits qu'il a lui-même créés. Le backend vérifie systématiquement le `supplier_id` avant toute mutation sur un produit existant.
- **Approbation des produits** : Les produits des fournisseurs sont en `pending` par défaut. L'admin les approuve ou refuse depuis le dashboard admin (visibles via la nouvelle colonne **Statut** dans la table des produits). Le fournisseur est notifié par email automatiquement lors du changement d'état.
- **Paiements et Tarifs** : Pour les produits soumis par les fournisseurs, le prix de vente initial est forcé à 0. L'administrateur est responsable de fixer le prix de vente final au moment de l'approbation.
