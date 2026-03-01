# Instructions de Lancement - Vtout (Migration Node.js/MySQL + Cloudinary)

Ce projet a été migré de **Supabase** vers un backend **Node.js (Express) + MySQL (Sequelize)** avec **Clerk** pour l'authentification et **Cloudinary** pour le stockage d'images.

## 📋 Prérequis
- [Node.js](https://nodejs.org/) (v16+)
- [MySQL](https://www.mysql.com/) installé et en cours d'exécution
- Un compte [Clerk](https://clerk.com/) pour l'authentification
- Un compte [Cloudinary](https://cloudinary.com/) (Gratuit) pour les images

## 🚀 Étape 1 : Configuration du Backend
1. Naviguez vers le dossier `server` :
   ```bash
   cd server
   ```
2. Installez les dépendances :
   ```bash
   npm install
   ```
3. Créez un fichier `.env` à la racine de `server` :
   ```env
   # Database
   MYSQL_DATABASE_URL=mysql://utilisateur:motdepasse@localhost:3306/eshop_db

   # Clerk Auth
   CLERK_SECRET_KEY=sk_test_...
   CLERK_PUBLISHABLE_KEY=pk_test_...

   # Cloudinary Storage
   CLOUDINARY_CLOUD_NAME=votre_cloud_name
   CLOUDINARY_API_KEY=votre_api_key
   CLOUDINARY_API_SECRET=votre_api_secret

   # Server Config
   PORT=3000
   ```
4. Initialisez la base de données et insérez les données de test :
   ```bash
   node seed.js
   ```
5. Lancez le serveur :
   ```bash
   npm run dev
   ```

## 💻 Étape 2 : Configuration du Frontend
1. Naviguez vers le dossier `frontend` :
   ```bash
   cd frontend
   ```
2. Installez les dépendances :
   ```bash
   npm install
   ```
3. Créez un fichier `.env` à la racine de `frontend` :
   ```env
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
   VITE_API_URL=http://localhost:3000/api
   VITE_FEDAPAY_PUBLIC_KEY=pk_test_...
   ```
4. Lancez l'application :
   ```bash
   npm run dev
   ```

## 🛠️ Modifications effectuées lors de la migration
- **Authentification** : Migration complète vers Clerk.
- **Base de données** : Passage à MySQL avec Sequelize.
- **Stockage** : Remplacement de Supabase Storage par **Cloudinary** via Multer.
- **Services** : Centralisation de tous les appels API (Produits, Commandes, Adresses, Avis, Favoris, Upload).
- **Admin** : Dashboard et gestion de produits mis à jour pour le nouveau stack.

## ⚠️ Notes importantes
- Assurez-vous que votre instance MySQL est lancée avant de démarrer le serveur.
- Les images uploadées (avis, produits, avatars) sont désormais stockées sur Cloudinary et leurs URLs sont enregistrées en base de données.
