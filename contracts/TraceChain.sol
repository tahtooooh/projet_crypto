// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract TraceChain {

    uint256 public nextProductId = 1;
    uint256 public nextVenteId = 1;

    // =========================
    // ROLES
    // =========================
    enum Role { Aucun, Producteur, Transporteur, Client, Admin }
    mapping(address => Role) public roles;

    // =========================
    // STATUS
    // =========================
    enum StatutProduit { EnProduction, EnStock, EnTransport, Livre, NonRecu }
    enum EtapeTransport { PasCommence, Depart, EnCours, Arrive }
    enum EvenementLogistique { Aucun, Retard, Anomalie, Incident }
    enum ResolutionType { Aucune, Remise, Remboursement, Remplacement, Annulation }

    // =========================
    // PRODUCT (ERP STOCK)
    // =========================
    struct Product {
        uint256 id;
        string referenceProduit;
        string nom;
        string origine;

        uint256 dateProductionStart;
        uint256 dateProductionEnd;

        string etapeProduction;

        uint256 stockProduit;
        uint256 stockDisponible;
        uint256 stockReserve;
        uint256 stockExpedie;

        address producteur;

        StatutProduit statut;
        uint256 timestampCreation;
    }

    // =========================
    // VENTE (DELIVERY UNIT)
    // =========================
    struct Vente {
        uint256 id;
        uint256 productId;

        address client;
        string adresseLivraison;
        uint256 quantite;

        address transporteur;

        EtapeTransport etapeTransport;
        EvenementLogistique evenement;

        StatutProduit statut;

        bool confirmee;

        // RESOLUTION SYSTEM
        ResolutionType resolution;
        string resolutionNote;
        bool resolu;

        uint256 timestamp;
    }

    // =========================
    // HISTORY (SEPARATED CLEANLY)
    // =========================
    struct HistoriqueGlobal {
        uint256 productId;
        uint256 venteId;
        string source;
        string etape;
        string note;
        address acteur;
        uint256 timestamp;
    }

    mapping(uint256 => Product) public products;
    mapping(uint256 => Vente) public ventes;

    mapping(string => uint256) public refToProductId;

    mapping(uint256 => HistoriqueGlobal[]) public histProduct;
    mapping(uint256 => HistoriqueGlobal[]) public histVente;

    address public admin;

    // =========================
    // EVENTS
    // =========================
    event ProduitAjoute(uint256 id);
    event ProduitFinalise(uint256 id);
    event VenteCree(uint256 id);
    event TransportAssigne(uint256 id);
    event TransportMisAJour(uint256 id);
    event LivraisonConfirmee(uint256 id);
    event AdminTransfere(address oldAdmin, address newAdmin);

    // =========================
    // CONSTRUCTOR
    // =========================
    constructor() {
        admin = msg.sender;
        roles[msg.sender] = Role.Admin;
    }

    // =========================
    // MODIFIERS (SAFE CHECKED)
    // =========================
    modifier onlyAdmin() {
        require(roles[msg.sender] == Role.Admin, "Admin uniquement");
        _;
    }

    modifier onlyProducteur() {
        require(roles[msg.sender] == Role.Producteur, "Producteur uniquement");
        _;
    }

    modifier onlyTransporteur() {
        require(roles[msg.sender] == Role.Transporteur, "Transporteur uniquement");
        _;
    }

    modifier onlyClient() {
        require(roles[msg.sender] == Role.Client, "Client uniquement");
        _;
    }

    modifier productExists(uint256 id) {
        require(products[id].id != 0, "Produit introuvable");
        _;
    }

    modifier venteExists(uint256 id) {
        require(ventes[id].id != 0, "Vente introuvable");
        _;
    }

    // =========================
    // ADMIN
    // =========================
    function transferAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "Adresse invalide");
        roles[admin] = Role.Aucun;
        address old = admin;
        admin = newAdmin;
        roles[newAdmin] = Role.Admin;
        emit AdminTransfere(old, newAdmin);
    }

    function addProducteur(address u) external onlyAdmin { roles[u] = Role.Producteur; }
    function addTransporteur(address u) external onlyAdmin { roles[u] = Role.Transporteur; }
    function addClient(address u) external onlyAdmin { roles[u] = Role.Client; }

    // =========================
    // PRODUCT CREATION
    // =========================
    function ajouterProduit(
        string memory ref,
        string memory nom,
        string memory origine,
        uint256 stock
    ) external onlyProducteur {

        require(bytes(ref).length > 0, "Ref vide");
        require(bytes(nom).length > 0, "Nom vide");
        require(stock > 0, "Stock invalide");

        uint256 id = nextProductId;

        products[id] = Product(
            id,
            ref,
            nom,
            origine,
            block.timestamp,
            0,
            "Debut",
            stock,
            0,
            0,
            0,
            msg.sender,
            StatutProduit.EnProduction,
            block.timestamp
        );

        refToProductId[ref] = id;

        _logProduct(id, "Creation", "Produit cree");

        emit ProduitAjoute(id);
        nextProductId++;
    }

    // =========================
    // PRODUCTION UPDATE
    // =========================
    function miseAJourProduction(uint256 id, string memory etape)
        external onlyProducteur productExists(id)
    {
        require(products[id].statut == StatutProduit.EnProduction, "Etat invalide");

        products[id].etapeProduction = etape;

        _logProduct(id, etape, "production update");
    }

    // =========================
    // FINALIZE PRODUCT (ACTIVATE STOCK)
    // =========================
    function finaliserProduit(uint256 id)
        external onlyProducteur productExists(id)
    {
        Product storage p = products[id];

        require(p.statut == StatutProduit.EnProduction, "Deja finalise");

        p.dateProductionEnd = block.timestamp;
        p.statut = StatutProduit.EnStock;

        p.stockDisponible = p.stockProduit;

        _logProduct(id, "Finalisation", "stock disponible");

        emit ProduitFinalise(id);
    }

    // =========================
    // VENTE (RESERVATION SYSTEM)
    // =========================
    function vendreProduit(
        uint256 id,
        address client,
        string memory adresse,
        uint256 qte
    ) external onlyProducteur productExists(id) {

        Product storage p = products[id];

        require(roles[client] == Role.Client, "Client invalide");
        require(p.stockDisponible >= qte, "Stock insuffisant");

        uint256 vid = nextVenteId;

        p.stockDisponible -= qte;
        p.stockReserve += qte;

        ventes[vid] = Vente(
            vid,
            id,
            client,
            adresse,
            qte,
            address(0),
            EtapeTransport.PasCommence,
            EvenementLogistique.Aucun,
            StatutProduit.EnStock,
            false,
            ResolutionType.Aucune,
            "",
            false,
            block.timestamp
        );

        _logVente(id, vid, "Creation", "vente cree");

        emit VenteCree(vid);
        nextVenteId++;
    }

    // =========================
    // ASSIGN TRANSPORT
    // =========================
    function assignerTransporteur(uint256 vid, address t)
        external onlyProducteur venteExists(vid)
    {
        require(roles[t] == Role.Transporteur, "Pas transporteur");
        ventes[vid].transporteur = t;

        emit TransportAssigne(vid);
    }

    // =========================
    // TRANSPORT FLOW
    // =========================
    function miseAJourTransport(
        uint256 vid,
        EtapeTransport etape,
        EvenementLogistique ev,
        string memory note
    ) external onlyTransporteur venteExists(vid)
    {
        Vente storage v = ventes[vid];
        Product storage p = products[v.productId];

        require(v.transporteur == msg.sender, "Non assigne");

        v.etapeTransport = etape;
        v.evenement = ev;

        if (etape == EtapeTransport.Depart) {
            v.statut = StatutProduit.EnTransport;
            p.stockReserve -= v.quantite;
            p.stockExpedie += v.quantite;
        }

        if (etape == EtapeTransport.Arrive) {
            v.statut =
                (ev == EvenementLogistique.Aucun)
                ? StatutProduit.Livre
                : StatutProduit.NonRecu;

            p.stockExpedie -= v.quantite;
        }

        _logVente(v.productId, vid, "Transport", note);

        emit TransportMisAJour(vid);
    }

    // =========================
    // DELIVERY CONFIRMATION
    // =========================
    function confirmerLivraison(uint256 vid)
        external onlyClient venteExists(vid)
    {
        Vente storage v = ventes[vid];

        require(v.client == msg.sender, "Pas votre commande");
        require(!v.confirmee, "Deja confirme");

        v.confirmee = true;

        _logVente(v.productId, vid, "Livraison", "confirmee");

        emit LivraisonConfirmee(vid);
    }

    // =========================
    // PROBLEM SOLVING SYSTEM (NEW)
    // =========================
    function solvePb(
        uint256 vid,
        ResolutionType resolution,
        string memory note
    ) external onlyProducteur venteExists(vid)
    {
        Vente storage v = ventes[vid];

        require(
            v.evenement != EvenementLogistique.Aucun,
            "Aucun probleme"
        );

        require(!v.resolu, "Deja resolu");

        v.resolution = resolution;
        v.resolutionNote = note;
        v.resolu = true;

        if (resolution == ResolutionType.Annulation) {
            v.statut = StatutProduit.NonRecu;
        }

        _logVente(v.productId, vid, "RESOLUTION", note);
    }

    // =========================
    // HISTORY SYSTEM
    // =========================
    function _logProduct(uint256 pid, string memory etape, string memory note) internal {
        histProduct[pid].push(HistoriqueGlobal(
            pid,
            0,
            "PRODUCTION",
            etape,
            note,
            msg.sender,
            block.timestamp
        ));
    }

    function _logVente(uint256 pid, uint256 vid, string memory etape, string memory note) internal {
        histVente[vid].push(HistoriqueGlobal(
            pid,
            vid,
            "VENTE",
            etape,
            note,
            msg.sender,
            block.timestamp
        ));
    }

    // =========================
    // GETTERS
    // =========================
    function getProduct(uint256 id) external view returns (Product memory) {
        return products[id];
    }

    function getVente(uint256 id) external view returns (Vente memory) {
        return ventes[id];
    }

    function getHistoriqueProduit(uint256 id)
        external view returns (HistoriqueGlobal[] memory)
    {
        return histProduct[id];
    }

    function getHistoriqueVente(uint256 id)
        external view returns (HistoriqueGlobal[] memory)
    {
        return histVente[id];
    }

    function getProductByReference(string memory ref)
        external view returns (Product memory)
    {
        uint256 id = refToProductId[ref];
        require(id != 0, "Reference introuvable");
        return products[id];
    }
}