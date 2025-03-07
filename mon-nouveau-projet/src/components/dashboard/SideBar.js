import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const menuItems = [
  { icon: "i-Bar-Chart", label: "Dashboard", bg: "bg-blue-500" },
  {
    icon: "i-Library",
    label: "Produits",
    crudLinks: ["/produits/ajouterunproduit", "/produits/listedesproduits", "/produits/update", "/produits/delete"],
  },
  { icon: "i-Receipt", label: "Achats", crudLinks: ["/achats/create", "/achats/view", "/achats/track"] },
  { icon: "i-Right", label: "Retour d'emprunt", crudLinks: ["/retour-emprunt/request", "/retour-emprunt/history"] },
  { icon: "i-Left", label: "Retour d'achat", crudLinks: ["/retour-achat/initiate", "/retour-achat/status"] },
  { icon: "i-Business-Mens", label: "Gens", crudLinks: ["/gens/add", "/gens/list", "/gens/update", "/gens/remove"] },
  { icon: "i-Data-Settings", label: "Paramètres", crudLinks: ["/parametres/general", "/parametres/security", "/parametres/preferences"] },
  { icon: "i-Line-Chart", label: "Rapports", crudLinks: ["/rapports/financiers", "/rapports/ventes", "/rapports/activite"] },
];

const SideBar = ({ onShowAddProductForm }) => {
  const [activeIndex, setActiveIndex] = useState(null);
  const navigate = useNavigate();

  const handleMouseEnter = (index) => setActiveIndex(index);
  const handleMouseLeave = () => setActiveIndex(null);

  const handleLinkClick = (link, isAddProductLink) => {
    if (isAddProductLink) {
      onShowAddProductForm(true);  // Afficher le formulaire si c'est pour l'ajout de produit
    } else {
      navigate(link);  // Rediriger vers d'autres pages
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
                onClick={() =>
                  handleLinkClick(item.crudLinks ? item.crudLinks[0] : "#", item.label === "Produits" && item.crudLinks[0] === "/produits/ajouterunproduit")
                }
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
        {activeIndex !== null && (
          <div className="h-full bg-white p-4" onMouseLeave={handleMouseLeave}>
            <h3 className="text-lg font-semibold mb-4">{menuItems[activeIndex].label}</h3>
            <ul>
              {menuItems[activeIndex].crudLinks?.map((link, i) => (
                <li key={i} className="mb-2">
                  <button onClick={() => handleLinkClick(link, false)} className="text-blue-500 hover:underline">
                    {link.split("/").pop().replace("-", " ").toUpperCase()}
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
