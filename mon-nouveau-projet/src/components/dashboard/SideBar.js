import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const menuItems = [
  { icon: "i-Bar-Chart", label: "Dashboard",  component: "dashboard" },
  {
    icon: "i-Library",
    label: "Produits",
    crudLinks: [
      { path: "/produits/ajouterunproduit", label: "AJOUTER UN PRODUIT", component: "addProduct" },
      { path: "/produits/listedesproduits", label: "LISTE DES PRODUITS", component: "ProductList" },
      { path: "/produits/update", label: "METTRE À JOUR", component: "updateProduct" },
      { path: "/produits/delete", label: "SUPPRIMER", component: "deleteProduct" }
    ],
  },
  { 
    icon: "i-Receipt", 
    label: "Achats", 
    crudLinks: [
      { path: "/achats/create", label: "CRÉER", component: "createPurchase" },
      { path: "/achats/view", label: "VOIR", component: "viewPurchase" },
      { path: "/achats/track", label: "SUIVRE", component: "trackPurchase" }
    ] 
  },
  { 
    icon: "i-Right", 
    label: "Retour d'emprunt", 
    crudLinks: [
      { path: "/retour-emprunt/request", label: "DEMANDER", component: "requestReturn" },
      { path: "/retour-emprunt/history", label: "HISTORIQUE", component: "returnHistory" }
    ] 
  },
  { 
    icon: "i-Left", 
    label: "Retour d'achat", 
    crudLinks: [
      { path: "/retour-achat/initiate", label: "INITIER", component: "initiateReturn" },
      { path: "/retour-achat/status", label: "STATUT", component: "returnStatus" }
    ] 
  },
  { 
    icon: "i-Business-Mens", 
    label: "Gens", 
    crudLinks: [
      { path: "/gens/agent", label: "Agent", component: "GestionAgent" },
      { path: "/gens/fournisseur", label: "Fournisseur", component: "GestionDeFournisseur" },
      { path: "/gens/utilisateur", label: "Utilisateur", component: "GestionDutilisateur" },
    ] 
  },
  { 
    icon: "i-Data-Settings", 
    label: "Paramètres", 
    crudLinks: [
      { path: "/parametres/general", label: "GÉNÉRAL", component: "generalSettings" },
      { path: "/parametres/security", label: "SÉCURITÉ", component: "securitySettings" },
      { path: "/parametres/preferences", label: "PRÉFÉRENCES", component: "preferenceSettings" }
    ] 
  },
  { 
    icon: "i-Line-Chart", 
    label: "Rapports", 
    crudLinks: [
      { path: "/rapports/financiers", label: "FINANCIERS", component: "financialReports" },
      { path: "/rapports/ventes", label: "VENTES", component: "salesReports" },
      { path: "/rapports/activite", label: "ACTIVITÉ", component: "activityReports" }
    ] 
  },
];

const SideBar = ({ onMenuItemClick }) => {
  const [activeIndex, setActiveIndex] = useState(null);
  const navigate = useNavigate();

  const handleMouseEnter = (index) => setActiveIndex(index);
  const handleMouseLeave = () => setActiveIndex(null);

  const handleLinkClick = (item, component = null) => {
    if (component) {
      // Use the component name to show the correct component in Dashboard
      onMenuItemClick(component);
      setActiveIndex(null); // Close the submenu
    } else if (item.component) {
      // For main menu items that have a direct component
      onMenuItemClick(item.component);
    } else {
      // For navigation to external routes
      navigate(item.path || "#");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".sidebar-left") && !event.target.closest(".sidebar-left-secondary")) {
        setActiveIndex(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="h-screen flex">
      <div className="ps-container sidebar-left overflow-y-auto pt-[50px]">
        <ul className="layout-sidebar-large mt-8">
          {menuItems.map((item, index) => (
            <li
              key={index}
              className={`nav-item h-[120px] w-[120px] flex items-center justify-center ${item.bg || "bg-white"}`}
              onMouseEnter={() => handleMouseEnter(index)}
            >
              <button
                onClick={() => handleLinkClick(item)}
                className="nav-item flex flex-col items-center justify-center"
              >
                <i className={`nav-icon ${item.icon} block text-[32px] h-[32px] mb-2 w-[32px]`}></i>
                <span className="item-name text-[13px] font-normal">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Section secondaire */}
      <section className="sidebar-left-secondary bg-green-200 flex-grow">
        {activeIndex !== null && menuItems[activeIndex].crudLinks && (
          <div className="h-full bg-white p-4" onMouseLeave={handleMouseLeave}>
            <h3 className="text-lg font-semibold mb-4">{menuItems[activeIndex].label}</h3>
            <ul>
              {menuItems[activeIndex].crudLinks.map((link, i) => (
                <li key={i} className="mb-2">
                  <button 
                    onClick={() => handleLinkClick(link, link.component)} 
                    className="text-blue-500 hover:underline"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
};

export default SideBar;