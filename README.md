# TraceChain

### Application de Traçabilité de Produits Basée sur la Blockchain

TraceChain est une application décentralisée de traçabilité de produits. Elle garantit l'intégrité, la transparence et la sécurité des données tout au long de la chaîne logistique, de la production jusqu'à la livraison au client.

---

## Table des Matières

- [Problématique](#problématique)
- [Solution](#solution)
- [Fonctionnalités](#fonctionnalités)
- [Architecture](#architecture)
- [Technologies](#technologies)
- [Acteurs du Système](#acteurs-du-système)
- [Diagrammes UML](#diagrammes-uml)
- [Installation](#installation)
- [API](#api)
- [Membres de l'Équipe](#membres-de-léquipe)

---

## Problématique

Dans les chaînes logistiques classiques, il est difficile de vérifier l'origine des produits et de garantir la fiabilité des informations, car les données peuvent être modifiées, perdues ou manipulées.

**Problèmes identifiés :**
- Absence de transparence sur l'origine des produits
- Risque de falsification des données
- Difficulté à tracer les incidents logistiques
- Manque de confiance entre les acteurs

---

## Solution

TraceChain utilise la blockchain Ethereum pour garantir :

| Principe | Description |
|---|---|
| **Traçabilité** | Chaque étape du produit est enregistrée chronologiquement |
| **Transparence** | Les utilisateurs peuvent vérifier l'historique du produit en temps réel |
| **Intégrité** | Les données enregistrées sont immuables |
| **Sécurité** | Chaque acteur est identifié par son adresse blockchain |
| **Confiance** | Le client peut vérifier l'origine et le parcours du produit |

---

## Fonctionnalités

### Gestion des Produits

- Enregistrement d'un produit avec référence unique, nom, origine
- Suivi des étapes de production
- Génération automatique d'un **QR Code** unique par produit

### Gestion des Ventes

- Création de ventes avec réservation de stock
- Assignation d'un transporteur à chaque vente
- Mise à jour en temps réel des statuts

### Suivi Logistique

- 4 étapes de transport : Pas commencé → Départ → En cours → Arrivé
- Détection d'événements : Retard, Anomalie, Incident
- Résolution des problèmes : Remise, Remboursement, Remplacement, Annulation

### Consultation

- Scan du QR Code pour accéder à l'historique complet
- Affichage de toutes les étapes du cycle de vie
- Vérification de l'authenticité du produit

---

## Architecture

```
┌────────────────────────────────────────────────────────────┐
│                  Frontend (HTML/CSS/JS)                     │
│         Interfaces par rôle + Lecteur QR + Scan             │
└────────────────────────┬───────────────────────────────────┘
                         │ Appels HTTP (fetch)
┌────────────────────────▼───────────────────────────────────┐
│                   Backend (Node.js + Express)                │
│         Routes API + Service Blockchain (Ethers.js)         │
└────────────────────────┬───────────────────────────────────┘
                         │ Transactions signées
┌────────────────────────▼───────────────────────────────────┐
│               Smart Contract (Solidity 0.8.24)               │
│                    Réseau : Ethereum Sepolia                  │
└────────────────────────────────────────────────────────────┘
```

### Flux de Données

```
Producteur ──► Ajoute un produit ──► QR Code généré
                │
                ▼
Stock disponible ──► Vente créée ──► Client assigné
                │
                ▼
Transporteur ──► Départ ──► En cours ──► Arrivé
                │
                ▼
Client ──► Confirme la livraison
                │
                ▼
Historique complet enregistré sur la blockchain
```

---

## Technologies

| Couche | Technologie | Rôle |
|---|---|---|
| **Frontend** | HTML, CSS, JavaScript | Interface utilisateur |
| **Backend** | Node.js, Express | Serveur API REST |
| **Blockchain** | Ethereum Sepolia | Stockage immuable |
| **Smart Contract** | Solidity 0.8.24 | Logique métier décentralisée |
| **Librairie Web3** | Ethers.js v6 | Interaction avec la blockchain |
| **QR Code** | qrcode (npm) | Génération de QR Code |
| **Déploiement** | Hardhat | Compilation et déploiement du contrat |

---

## Acteurs du Système

### Producteur
Ajoute le produit dans le système, génère le QR Code, enregistre les informations initiales (nom, référence, date de production, lieu).

### Transporteur
Met à jour l'état du produit pendant le transport : départ, arrivée, retard, changement de localisation, incidents.

### Client
Scanne le QR Code pour consulter l'historique complet du produit, vérifier son origine, ses étapes et son authenticité.

### Administrateur
Gère les autorisations, contrôle les acteurs et supervise le fonctionnement global de la plateforme.

---

## Diagrammes UML

### Diagramme de Cas d'Utilisation

```
                    ┌───────────────────┐
                    │   Administrateur   │
                    └────────┬──────────┘
                             │ Gère les rôles
                             ▼
        ┌─────────────────────────────────────┐
        │           Système TraceChain         │
        │                                      │
        │  ┌───────────┐   ┌───────────┐      │
        │  │ Producteur │──►│ Ajouter   │      │
        │  └───────────┘   │ Produit   │      │
        │                  └───────────┘      │
        │  ┌───────────┐   ┌───────────┐      │
        │  │Transporteur│──►│ Mettre à  │      │
        │  └───────────┘   │ jour      │      │
        │                  │ Transport │      │
        │  ┌───────────┐   └───────────┘      │
        │  │  Client   │──►│ Consulter │      │
        │  └───────────┘   │ Historique│      │
        │                  └───────────┘      │
        └─────────────────────────────────────┘
```

### Diagramme de Classes (Simplifié)

```
┌─────────────────────────────────────────────┐
│                  Product                      │
├─────────────────────────────────────────────┤
│ - id: uint256                                │
│ - referenceProduit: string                   │
│ - nom: string                                │
│ - origine: string                            │
│ - dateProductionStart: uint256               │
│ - dateProductionEnd: uint256                 │
│ - etapeProduction: string                    │
│ - stockProduit: uint256                      │
│ - stockDisponible: uint256                   │
│ - statut: StatutProduit                      │
└──────────────────┬──────────────────────────┘
                   │ 1
                   │
┌──────────────────▼──────────────────────────┐
│                  Vente                        │
├─────────────────────────────────────────────┤
│ - id: uint256                                │
│ - client: address                            │
│ - transporteur: address                      │
│ - etapeTransport: EtapeTransport             │
│ - evenement: EvenementLogistique             │
│ - statut: StatutProduit                      │
│ - confirmee: bool                            │
│ - resolution: ResolutionType                 │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│             HistoriqueGlobal                  │
├─────────────────────────────────────────────┤
│ - productId: uint256                         │
│ - venteId: uint256                           │
│ - source: string                             │
│ - etape: string                              │
│ - note: string                               │
│ - acteur: address                            │
│ - timestamp: uint256                         │
└─────────────────────────────────────────────┘
```

---

## Smart Contract

Le smart contract `TraceChain.sol` gère l'ensemble de la logique métier :

- **Rôles** : Admin, Producteur, Transporteur, Client
- **Produits** : Création, suivi de production, finalisation
- **Stocks** : Disponible, réservé, expédié
- **Ventes** : Réservation, transport, livraison
- **Événements** : Retard, anomalie, incident
- **Résolutions** : Remise, remboursement, remplacement, annulation
- **Historique** : Traçabilité complète de chaque produit et vente

Le contrat est déployé sur **Ethereum Sepolia**.

---

## Installation

### Prérequis

- Node.js 18+
- MetaMask
- Compte Infura ou Alchemy

### Étapes

```bash
git clone https://github.com/tahtooooh/projet_crypto.git
cd projet_crypto
npm install
cp .env.example .env    # Configurer le fichier .env
npm run backend          # Lancement du serveur
```

### Configuration du fichier .env

```env
RPC_URL=https://sepolia.infura.io/v3/VOTRE_CLE_INFURA
ADMIN_KEY=0xVOTRE_CLE_PRIVEE
PRODUCEUR_KEY=0x...
TRANSPORTEUR_KEY=0x...
CLIENT_KEY=0x...
CONTRACT_ADDRESS=0x7a23Fc84e434522B8D1C90207D1f56dC8afb449F
```

Accéder à l'application : [http://localhost:3000](http://localhost:3000)

---

## API

### Routes disponibles

| Méthode | Route | Description |
|---|---|---|
| **Admin** | | |
| POST | `/api/admin/deploy` | Déploiement du contrat |
| POST | `/api/admin/role` | Assignation d'un rôle |
| **Produits** | | |
| POST | `/api/products` | Ajout d'un produit |
| PUT | `/api/products/:id/production` | Mise à jour production |
| PUT | `/api/products/:id/finalize` | Finalisation |
| GET | `/api/products/:id` | Consultation |
| GET | `/api/products/ref/:ref` | Recherche par référence |
| **Ventes** | | |
| POST | `/api/ventes` | Création d'une vente |
| PUT | `/api/ventes/:vid/transport/assign` | Assignation transport |
| PUT | `/api/ventes/:vid/transport` | Mise à jour transport |
| PUT | `/api/ventes/:vid/confirm` | Confirmation livraison |
| POST | `/api/ventes/:vid/resolve` | Résolution problème |
| GET | `/api/ventes/:id` | Consultation |
| **Historique** | | |
| GET | `/api/history/product/:id` | Historique produit |
| GET | `/api/history/vente/:id` | Historique vente |
| **QR Code** | | |
| GET | `/api/qrcode/:ref` | QR Code du produit |

---

## Workflow Complet

```
1. Admin         → Déploie le contrat + Assigne les rôles
2. Producteur    → Ajoute un produit (QR code généré)
3. Producteur    → Finalise la production
4. Producteur    → Crée une vente (client + quantité)
5. Producteur    → Assigne un transporteur
6. Transporteur  → Départ → En cours → Arrivé
7. Client        → Confirme la livraison
8. Scan QR       → Affiche tout l'historique
```

---

## Licence

MIT © 2026 TraceChain
