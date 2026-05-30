# TraceChain - Application de Traçabilité de Produits

![Solidity](https://img.shields.io/badge/Solidity-0.8.24-blue)
![Ethereum](https://img.shields.io/badge/Ethereum-Sepolia-purple)
![Node.js](https://img.shields.io/badge/Node.js-24-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

## Description

TraceChain est une application de traçabilité de produits basée sur la blockchain Ethereum. Elle permet d'enregistrer chaque produit avec un identifiant unique, de suivre toutes les étapes de son cycle de vie (production, transport, vente) et de consulter l'historique complet via un QR code.

## Fonctionnalités

| Fonctionnalité | Description |
|---|---|
| **Ajout de produit** | Enregistrement avec référence unique, nom, origine, stock |
| **QR Code** | Génération automatique d'un QR code pour chaque produit |
| **Suivi production** | Mise à jour des étapes de production |
| **Gestion des ventes** | Création de vente, assignation transporteur |
| **Suivi transport** | Départ, en cours, arrivé avec gestion des incidents |
| **Confirmation livraison** | Par le client |
| **Résolution de problèmes** | Remise, remboursement, remplacement, annulation |
| **Historique complet** | Traçabilité de chaque étape sur la blockchain |
| **Scan QR** | Consultation de l'historique par scan ou référence |

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Frontend (HTML/CSS/JS)                 │
│               Interfaces par rôle + Scan QR              │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTP (fetch)
┌──────────────────────────▼──────────────────────────────┐
│                 Backend (Node.js + Express)               │
│        Routes API + Service blockchain (Ethers.js)        │
└──────────────────────────┬──────────────────────────────┘
                           │ Transactions signées
┌──────────────────────────▼──────────────────────────────┐
│               Smart Contract (Solidity)                   │
│              Déployé sur Ethereum Sepolia                  │
└─────────────────────────────────────────────────────────┘
```

## Acteurs du système

| Acteur | Rôle |
|---|---|
| **Admin** | Déploie le contrat, assigne les rôles |
| **Producteur** | Ajoute les produits, crée les ventes |
| **Transporteur** | Met à jour le transport |
| **Client** | Confirme la livraison, consulte l'historique |

## Tech Stack

| Couche | Technologie |
|---|---|
| Frontend | HTML, CSS, JavaScript (vanilla) |
| Backend | Node.js, Express |
| Blockchain | Ethereum Sepolia, Solidity |
| Smart Contract | Solidity 0.8.24 |
| Librairie Web3 | Ethers.js v6 |
| QR Code | API backend (bibliothèque qrcode) |
| Déploiement | Hardhat |

## Installation

### Prérequis

- Node.js 18+
- MetaMask
- Compte Infura ou Alchemy (pour Sepolia)

### Installation

```bash
git clone https://github.com/tahtooooh/projet_crypto.git
cd projet_crypto
npm install
```

### Configuration

Créez un fichier `.env` à partir du modèle :

```bash
cp .env.example .env
```

Éditez le fichier `.env` :

```env
RPC_URL=https://sepolia.infura.io/v3/VOTRE_PROJET_INFURA
ADMIN_KEY=0xVOTRE_CLE_PRIVEE_ADMIN
PRODUCEUR_KEY=0xVOTRE_CLE_PRIVEE_PRODUCTEUR
TRANSPORTEUR_KEY=0xVOTRE_CLE_PRIVEE_TRANSPORTEUR
CLIENT_KEY=0xVOTRE_CLE_PRIVEE_CLIENT
CONTRACT_ADDRESS=0x7a23Fc84e434522B8D1C90207D1f56dC8afb449F
ADMIN_ADDRESS=0x000936910B51e299A2e77C6983675A4bbc3628Be
```

### Lancer le projet

```bash
npm run backend
```

Ouvrir [http://localhost:3000](http://localhost:3000)

## API Routes

### Admin
```
POST /api/admin/deploy   – Déployer le contrat
POST /api/admin/role     – Assigner un rôle
```

### Produits
```
POST   /api/products                – Ajouter un produit
PUT    /api/products/:id/production  – Màj production
PUT    /api/products/:id/finalize    – Finaliser
GET    /api/products/:id             – Détails
GET    /api/products/ref/:ref        – Recherche par référence
```

### Ventes
```
POST   /api/ventes                    – Créer une vente
PUT    /api/ventes/:vid/transport/assign – Assigner transporteur
PUT    /api/ventes/:vid/transport     – Màj transport
PUT    /api/ventes/:vid/confirm       – Confirmer livraison
POST   /api/ventes/:vid/resolve       – Résoudre problème
GET    /api/ventes/:id                – Détails vente
```

### Historique
```
GET /api/history/product/:id  – Historique produit
GET /api/history/vente/:id    – Historique vente
```

### QR Code
```
GET /api/qrcode/:ref  – QR Code SVG du produit
```

## Déploiement

Pour déployer un nouveau contrat sur Sepolia :

```bash
npm run deploy
```

## Membres du groupe

| Membre | Tâche |
|---|---|
| **Hadil Barzani** | Smart Contract (Solidity) |
| **Taha Hajji** | Backend (Node.js + Express) |
| **Ibtissam EL ASSLOUJ** | Frontend |
| **Meryem EL ATIFI** | QR Code & Historique |
| **Ibrahim Bouaicha** | Module IA / Machine Learning |
| **Hind ELYOUBI** | Tests & Documentation |

## Structure du projet

```
TraceChain/
├── contracts/
│   └── TraceChain.sol              # Smart contract
├── backend/
│   ├── src/
│   │   ├── index.js                # Serveur Express
│   │   ├── config.js               # Config Ethers
│   │   ├── services/
│   │   │   └── blockchain.js       # Appels blockchain
│   │   └── routes/
│   │       ├── admin.js
│   │       ├── products.js
│   │       ├── ventes.js
│   │       ├── history.js
│   │       └── qrcode.js
│   └── artifacts/
│       └── contract.json           # ABI + adresse
├── frontend/
│   ├── index.html
│   ├── css/style.css
│   └── js/
│       ├── app.js
│       └── pages/
│           ├── admin.js
│           ├── producteur.js
│           ├── transporteur.js
│           ├── client.js
│           └── scan.js
├── scripts/
│   └── deploy.js
└── .env.example
```

## Licence

MIT
