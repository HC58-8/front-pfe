import React, { useState } from 'react';
import { FaSearch, FaGlobe, FaBell } from 'react-icons/fa'; // Importation des icônes nécessaires
import logo from './../../images/logo.png'; // Assurez-vous que le chemin vers l'image est correct

function NavBar() {
  const [searchQuery, setSearchQuery] = useState(''); // État pour la recherche

  // Gérer le changement de valeur de recherche
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Gérer la soumission du formulaire de recherche
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    console.log('Rechercher:', searchQuery);
    // Ajoutez ici la logique pour traiter la recherche
  };

  return (
    <div className="fixed top-0 left-0 w-full bg-white p-0 m-0 shadow-md z-50 h-[60px]">
      <div className="flex items-center justify-between p-0">
        <img src={logo} alt="Logo" className="m-2 w-16 h-[51px]" />
        <div className="menu-toggle"> </div>
        {/* Zone de recherche */}
        <form onSubmit={handleSearchSubmit} className="flex items-center w-1/3">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Rechercher des produits"
            className="w-full px-4 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-custom-red text-white px-4 py-2 rounded-r-lg hover:bg-custom-gray focus:outline-none focus:ring-2 focus:ring-custom-red"
          >
            <FaSearch />
          </button>
        </form>

        {/* Icônes de multilingue, notification et image de profil réservée */}
        <div className="flex space-x-4 items-center">
          {/* Icône de langue */}
          <button className="text-custom-red">
            <FaGlobe size={20} />
          </button>

          {/* Icône de notification */}
          <button className="relative text-custom-red">
            <FaBell size={20} />
            {/* Badge de notification */}
            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              3
            </span>
          </button>

          {/* Espace réservé pour l'image de profil de l'utilisateur connecté */}
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
            {/* Vous pouvez ajouter une image ici plus tard */}
            <span className="text-white text-lg">U</span> {/* Exemple d'initiale */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default NavBar;
