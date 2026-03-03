# Documentation de Déploiement - Vtout App

Ce document regroupe toutes les informations nécessaires à l'équipe DevOps pour le déploiement, la configuration et la gestion de l'application Vtout.

## 1. Vue d'ensemble de l'Architecture

L'application est divisée en deux parties principales :
- **Frontend** : Application côté client (React + Vite)
- **Backend (API)** : Serveur (Node.js + Express) connecté à une base de données MySQL.

---

## 2. Technologies Utilisées et Versions

### **Frontend**
- **React** : `^18.3.1`
- **Vite** : `^7.1.2`
- **TailwindCSS** : `^3.4.17` / **DaisyUI** : `^5.2.3`
- **Authentification** : `@clerk/clerk-react` (`^5.60.1`)
- **Stockage / Services tiers** : Supabase (`@supabase/supabase-js` `^2.74.0`), Cloudinary
- **Paiement** : FedaPay (`fedapay-reactjs` `^1.1.2`)

### **Backend (Serveur)**
- **Node.js** : `>=18.x`
- **Framework** : Express (`^5.1.0`)
- **Base de données ORM** : Sequelize (`^6.37.7`)
- **Pilote BDD** : MySQL (`mysql2` `^3.17.1`)
- **Authentification et vérification** : `@clerk/clerk-sdk-node` (`^4.13.7`)
- **Upload d'images** : Multer (`^2.0.2`), Cloudinary / Multer Storage Cloudinary
- **Emails** : Resend (`^6.9.2`)

---

## 3. Points d'Entrée (Entry Points)

- **Frontend** : 
  - Fichier principal : `frontend/index.html` et `frontend/src/main.jsx`.
  - Commande de développement : `npm run dev` (démarre Vite souvent sur le port `5173`).
  - Commande de build : `npm run build` (génère les fichiers statiques dans le dossier `frontend/dist`).

- **Backend** : 
  - Fichier principal : `server/index.js`
  - Commande de démarrage production : `npm start` (ou avec PM2: `pm2 start index.js --name vtout-api`)
  - Commande de développement : `npm run dev` (utilise nodemon).
  - Port par défaut : Souvent défini par `PORT` dans `.env` (ex: `5000` ou `3000`).

---

## 4. Prérequis Système pour le Serveur

* Node.js : version `v18.x` ou supérieure.
* NPM : version `v9.x` ou supérieure.
* Base de données : Serveur **MySQL** fonctionnel (Local, RDS, Cloud SQL, etc...).

---

## 5. Variables d'Environnement (.env)

Pour que l'application fonctionne correctement, les variables d'environnement suivantes doivent être configurées côté **Frontend** et **Backend**.

### **Backend (`server/.env`)**
Vous devez créer un fichier `.env` dans le dossier `server/` basé sur `server/.env.example` s'il existe. Il contient typiquement :

```env
# Configuration Serveur
PORT=5000

# Base de Données (MySQL)
DB_HOST=adresse_de_votre_serveur_mysql
DB_USER=votre_utilisateur
DB_PASSWORD=votre_mot_de_passe
DB_NAME=votre_base_de_donnees
DB_PORT=3306

# Clerk (Authentification)
CLERK_SECRET_KEY=votre_secret_api_clerk

# Cloudinary (Gestion Médias / Uploads)
CLOUDINARY_CLOUD_NAME=nom_du_cloud
CLOUDINARY_API_KEY=cle_api_cloudinary
CLOUDINARY_API_SECRET=secret_api_cloudinary

# Email (Resend)
RESEND_API_KEY=cle_api_resend_pour_notifications
```

### **Frontend (`frontend/.env`)**
Le frontend avec Vite exige que les variables publiques soient préfixées par `VITE_`.

```env
# Variables Publiques (Accès frontend)
VITE_API_URL=http://localhost:5000  # En prod: URL HTTPS du Backend (ex: https://api.vtout.com)
VITE_CLERK_PUBLISHABLE_KEY=cle_public_clerk
VITE_SUPABASE_URL=url_de_votre_projet_supabase
VITE_SUPABASE_ANON_KEY=cle_anonyme_supabase
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
npm install    # Installe toutes les dépendances
```
1. Configurer le fichier `server/.env` avec les valeurs de production.
2. Démarrer le serveur via un gestionnaire de processus comme **PM2** (Recommandé) ou **systemd**.
   ```bash
   pm2 start index.js --name "vtout-api"
   pm2 save
   pm2 startup
   ```

### Étape 3 : Déploiement du Frontend
```bash
cd ../frontend
npm install    # Installe les dépendances frontend
```
1. Configurer le fichier `frontend/.env` en définissant impérativement `VITE_API_URL` à l'URL publique de l'API déployée.
2. Construire (build) l'application pour la production :
   ```bash
   npm run build
   ```
3. Le résultat se trouve dans `frontend/dist`. 
4. Configurer **Nginx** ou **Apache** (ou un service comme Vercel/Netlify) pour servir les fichiers statiques du répertoire `dist`. **Important** : Implémenter le fallback vers `index.html` pour React Router.

Exemple de bloc Nginx pour le Frontend :
```nginx
server {
    listen 80;
    server_name vtout.com;
    root /chemin/vers/eshop/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Exemple de reverse proxy Nginx pour le Backend (API) :
```nginx
server {
    listen 80;
    server_name api.vtout.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 7. Migration & Base de Données
Le backend utilise **Sequelize**. Dans ce projet, le schéma de base de données est habituellement synchronisé via Sequelize lors du démarrage (`sequelize.sync()`), ce qui crée les tables automatiquement. 
Veillez à ce que la base de données soit accessible avant le lancement du serveur.

> **Note de l'équipe de développement :**
> - La fonctionnalité des "avis clients" a été configurée pour supporter le téléversement d'images (Cloudinary) et limite désormais l'ajout à **un seul avis par produit et par utilisateur** afin d'éviter les doublons de reviews sur Vtout.
