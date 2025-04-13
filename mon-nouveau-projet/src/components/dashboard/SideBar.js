import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "../../firebaseConfig";

const menuItems = [
  { icon: "i-Bar-Chart", label: "Dashboard", component: "dashboard" },
  {
    icon: "i-Library",
    label: "Produits",
    crudLinks: [
      { 
        path: "/produits/ajouterunproduit", 
        label: "AJOUTER UN PRODUIT", 
        component: "addProduct",
        permission: "createProduct"
      },
      { 
        path: "/ajoutfournisseur", 
        label: "AJOUTER UN FOURNISSEUR", 
        component: "AjoutFournisseur",
        permission: "createSupplier"
      },
      { 
        path: "/produits/listedesproduits", 
        label: "LISTE DES PRODUITS", 
        component: "ProductList",
        permission: "viewProducts"
      },
      { 
        path: "/produits/update", 
        label: "METTRE À JOUR", 
        component: "updateProduct",
        permission: "updateProduct"
      },
      { 
        path: "/produits/delete", 
        label: "SUPPRIMER", 
        component: "deleteProduct",
        permission: "deleteProduct"
      }
    ],
  },
  { 
    icon: "i-Receipt", 
    label: "Achats", 
    crudLinks: [
      { 
        path: "/achats/create", 
        label: "CRÉER", 
        component: "createPurchase",
        permission: "createPurchase"
      },
      { 
        path: "/achats/view", 
        label: "VOIR", 
        component: "viewPurchase",
        permission: "viewPurchases"
      },
      { 
        path: "/achats/track", 
        label: "SUIVRE", 
        component: "trackPurchase",
        permission: "trackPurchases"
      }
    ] 
  },
  {
    icon: "i-Exchange", 
    label: "Location", 
    crudLinks: [
      { 
        path: "/renting", 
        label: "GÉRER LES LOCATIONS", 
        component: "RentPage",
        permission: "manageRentals"
      },
      { 
        path: "/rentinghistory", 
        label: "HISTORIQUE DES LOCATIONS", 
        component: "RentalHistoryPage",
        permission: "viewRentalHistory"
      }
    ]
  },
  { 
    icon: "i-Right", 
    label: "Retour d'emprunt", 
    crudLinks: [
      { 
        path: "/retour-emprunt/request", 
        label: "DEMANDER", 
        component: "requestReturn",
        permission: "requestReturn"
      },
      { 
        path: "/retour-emprunt/history", 
        label: "HISTORIQUE", 
        component: "returnHistory",
        permission: "viewReturnHistory"
      }
    ] 
  },
  { 
    icon: "i-Left", 
    label: "Retour d'achat", 
    crudLinks: [
      { 
        path: "/retour-achat/initiate", 
        label: "INITIER", 
        component: "initiateReturn",
        permission: "initiateReturn"
      },
      { 
        path: "/retour-achat/status", 
        label: "STATUT", 
        component: "returnStatus",
        permission: "viewReturnStatus"
      }
    ] 
  },
  { 
    icon: "i-Business-Mens", 
    label: "Gens", 
    crudLinks: [
      { 
        path: "/gens/agent", 
        label: "Agent", 
        component: "GestionAgent",
        permission: "manageAgents"
      },
      { 
        path: "/gens/fournisseur", 
        label: "Fournisseur", 
        component: "GestionDeFournisseur",
        permission: "manageSuppliers"
      },
      { 
        path: "/gens/utilisateur", 
        label: "Utilisateur", 
        component: "GestionDutilisateur",
        permission: "manageUsers"
      },
      { 
        path: "/userslist", 
        label: "Gestion des Utilisateur", 
        component: "UsersList",
        permission: "manageUsers"
      }
    ] 
  },
  { 
    icon: "i-Data-Settings", 
    label: "Paramètres", 
    crudLinks: [
      { 
        path: "/parametres/general", 
        label: "GÉNÉRAL", 
        component: "generalSettings",
        permission: "manageSettings"
      },
      { 
        path: "/parametres/security", 
        label: "SÉCURITÉ", 
        component: "securitySettings",
        permission: "manageSecurity"
      },
      { 
        path: "/parametres/preferences", 
        label: "PRÉFÉRENCES", 
        component: "preferenceSettings",
        permission: "managePreferences"
      },
      { 
        path: "/profile", 
        label: "MON PROFIL", 
        component: "ProfileUpdate",
        permission: "basicAccess"
      }
    ] 
  },
  { 
    icon: "i-Line-Chart", 
    label: "Rapports", 
    crudLinks: [
      { 
        path: "/rapports/financiers", 
        label: "FINANCIERS", 
        component: "financialReports",
        permission: "viewFinancialReports"
      },
      { 
        path: "/rapports/ventes", 
        label: "VENTES", 
        component: "salesReports",
        permission: "viewSalesReports"
      },
      { 
        path: "/rapports/activite", 
        label: "ACTIVITÉ", 
        component: "activityReports",
        permission: "viewActivityReports"
      }
    ] 
  },
];

const SideBar = ({ onMenuItemClick }) => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [userPermissions, setUserPermissions] = useState([]);
  const [userRole, setUserRole] = useState("");
  const navigate = useNavigate();
  const currentUser = useRef(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get user from localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          currentUser.current = parsedUser;
          
          const userDoc = await getDoc(doc(firestore, "users", parsedUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserRole(userData.role);
            setUserPermissions(userData.permissions || []);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
  }, []);

  const hasPermission = (requiredPermission) => {
    if (userRole === "Administrateur") return true;
    return userPermissions.includes(requiredPermission);
  };

  const handleMouseEnter = (index) => setActiveIndex(index);
  const handleMouseLeave = () => setActiveIndex(null);

  const handleLinkClick = (item, component = null) => {
    if (!hasPermission(item.permission)) return;

    if (component) {
      const specialRoutes = {
        "RentPage": "/renting",
        "RentalHistoryPage": "/rentinghistory",
        "ProfileUpdate": "/profile",
        "AjoutFournisseur": "/ajoutfournisseur",
        "UsersList": "/userslist"  
      };

      if (specialRoutes[component]) {
        navigate(specialRoutes[component]);
      } else {
        onMenuItemClick(component);
      }
      setActiveIndex(null);
    } else if (item.component) {
      onMenuItemClick(item.component);
    } else {
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
          {menuItems.map((item, index) => {
            const hasAccess = item.crudLinks 
              ? item.crudLinks.some(link => hasPermission(link.permission))
              : hasPermission(item.permission);
            
            return hasAccess ? (
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
            ) : null;
          })}
        </ul>
      </div>

      {/* Secondary Section */}
      <section className="sidebar-left-secondary bg-green-200 flex-grow">
        {activeIndex !== null && menuItems[activeIndex].crudLinks && (
          <div className="h-full bg-white p-4" onMouseLeave={handleMouseLeave}>
            <h3 className="text-lg font-semibold mb-4">{menuItems[activeIndex].label}</h3>
            <ul>
              {menuItems[activeIndex].crudLinks.map((link, i) => {
                const isAllowed = hasPermission(link.permission);
                return isAllowed ? (
                  <li key={i} className="mb-2">
                    <button 
                      onClick={() => handleLinkClick(link, link.component)} 
                      className="w-full text-left p-2 rounded text-blue-500 hover:bg-gray-100"
                    >
                      {link.label}
                    </button>
                  </li>
                ) : null;
              })}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
};

export default SideBar;