# 🚀 Guide de Déploiement & Documentation Technique — Vtout

> **Dernière Mise à jour :** 26 Avril 2026  
> **Version :** 2.1.0 (Production Ready)  
> **Statut :** Finalisé après Audit de Sécurité et Branding

Ce document contient toutes les informations cruciales pour l'équipe de déploiement afin de mettre en ligne la plateforme **Vtout** en toute sécurité.

---

## 🏗️ 1. Architecture du Projet

La plateforme repose sur une architecture découplée en trois pôles :

| Composant | Technologie | URL Recommandée |
| :--- | :--- | :--- |
| **Backend API** | Node.js (Express) | `https://api.vtout.com` |
| **Boutique Client** | React (Vite) | `https://vtout.com` |
| **Portail Vendeur** | React (Vite) | `https://vendeur.vtout.com` |

---

## 🔐 2. Configuration Critique (Environnement)

### 🖥️ Backend (`server/.env`)
Les variables suivantes sont **obligatoires** pour le fonctionnement des services tiers :

| Variable | Description | Exemple / Note |
| :--- | :--- | :--- |
| `MYSQL_DATABASE_URL` | Chaîne de connexion SQL | `mysql://user:pass@host:3306/db` |
| `BETTER_AUTH_SECRET` | Clé de signature des sessions | *Générer une clé de 64 chars* |
| `BETTER_AUTH_URL` | URL publique de l'API auth | `https://api.vtout.com/api/auth` |
| `CLIENT_URL` | URL de la boutique client | `https://vtout.com` |
| `ADMIN_NOTIF_EMAIL` | Email de réception des alertes | `abdoul172002@gmail.com` |
| `RESEND_API_KEY` | Clé API pour les emails | `re_...` |
| `FEDAPAY_SECRET` | Clé secrète FedaPay | `sk_live_...` |

### 🌐 Frontend Client & Vendeur (`.env`)
- `VITE_API_URL` : Pointer vers l'URL de votre backend suivi de `/api`.
- `VITE_MAIN_SITE_URL` : (Pour le portail vendeur) URL du site client.

---

## 🛠️ 3. Procédure de Préparation (AVANT Lancement)

Avant d'ouvrir le site au public, vous **devez** vider les données de test accumulées durant le développement.

### Nettoyage de la Base de Données
Un script sécurisé a été mis en place pour vider les tables (commandes, transactions, comptes tests) tout en **conservant le compte administrateur** et les configurations (catégories, géographie).

```bash
cd server
node launch_prep.js
```
*Action requise : Tapez `LANCER` pour valider l'opération.*

---

## 📧 4. Configuration des Services Post-Déploiement

### Système d'Emails (Resend)
Le système est désormais **dynamique**. L'administrateur peut modifier les réglages sans redémarrer le serveur.

1. Se connecter au dashboard **Admin**.
2. Aller dans **Paramètres > 📧 Email & Notifications**.
3. Configurer la **Clé API Resend** et l'**Adresse Expéditeur** (doit être un domaine vérifié sur Resend, ex: `noreply@vtout.com`).
4. Utiliser le bouton **"Envoyer un test"** pour valider la délivrabilité.

### Sécurité des Comptes
- Le flux de **Réinitialisation de mot de passe** est sécurisé (expiration de 1h, template branded).
- Les mots de passe exigent désormais : **8+ caractères, 1 Majuscule, 1 Chiffre**.

---

## 📡 5. WebSocket & Temps Réel
La plateforme utilise `Socket.io` pour :
- Le **Chat Support** en direct.
- Le **Suivi des Livreurs** sur la carte.
- Les notifications de commande en temps réel.

**Note Nginx :** Assurez-vous de configurer le proxy pour supporter les WebSockets (`Upgrade: websocket`).

---

## 🏁 6. Checklist de Mise en Ligne

1. [ ] **SSL (HTTPS)** : Activé sur tous les domaines (obligatoire pour Better Auth).
2. [ ] **SMTP/Resend** : Domaine vérifié sur le dashboard Resend.
3. [ ] **FedaPay Webhook** : Configurer l'URL de webhook dans le panel FedaPay vers `https://api.vtout.com/api/fedapay-webhook`.
4. [ ] **Admin Credentials** : S'assurer que le mot de passe de l'admin par défaut a été changé.
5. [ ] **Production Build** : Utiliser `npm run build` pour le frontend et servir les fichiers statiques via Nginx.

---

*Document produit par Antigravity pour l'équipe Vtout.*
