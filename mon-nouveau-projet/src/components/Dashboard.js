// src/dashboard/Dashboard.js
import React, { useState } from 'react';
import SideBar from './dashboard/SideBar';
import NavBar from './dashboard/NavBar';
import AddProductForm from './dashboard/AddProductForm';

function Dashboard() {
  const [isAddProductFormVisible, setIsAddProductFormVisible] = useState(false); // État pour afficher le formulaire

  const handleAddProductClick = () => {
    setIsAddProductFormVisible(true); // Affiche le formulaire
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <SideBar onAddProductClick={handleAddProductClick} />

      {/* Contenu principal */}
      <div className="flex-1 pt-20">
        <NavBar />
        <div className="mt-4">
          {/* Afficher le formulaire uniquement si l'état est activé */}
          {isAddProductFormVisible && <AddProductForm />}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
