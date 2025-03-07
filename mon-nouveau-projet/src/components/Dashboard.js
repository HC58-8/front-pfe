// src/dashboard/Dashboard.js
import React, { useState } from "react";
import SideBar from './dashboard/SideBar';  // La barre latérale
import NavBar from './dashboard/NavBar';    // La barre de navigation
import AddProductForm from './dashboard/AddProductForm'; // Formulaire pour ajouter un produit

function Dashboard() {
  const [showAddProductForm, setShowAddProductForm] = useState(false);

  const handleShowAddProductForm = (show) => {
    setShowAddProductForm(show);
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <SideBar onShowAddProductForm={handleShowAddProductForm} />

      {/* Contenu principal */}
      <div className="flex-1 bg-red-100">
        <NavBar />
        <div className="mt-4 p-4">
          {showAddProductForm ? <AddProductForm /> : <h2>Bienvenue dans le Dashboard</h2>}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
