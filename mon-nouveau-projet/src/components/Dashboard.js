import React, { useState } from "react";
import SideBar from './dashboard/SideBar';
import NavBar from './dashboard/NavBar';
import AddProductForm from './dashboard/AddProductForm';
import GestionDeFournisseur from "./dashboard/GestionDeFournisseur";
import GestionAgent from "./dashboard/GestionAgent";

function Dashboard() {
  const [activeComponent, setActiveComponent] = useState('dashboard');
  
  const handleMenuItemClick = (componentName) => {
    setActiveComponent(componentName);
  };
  
  // Render the appropriate component based on the active selection
  const renderComponent = () => {
    switch(activeComponent) {
      case 'addProduct':
        return <AddProductForm />;
      case 'GestionDeFournisseur':
        return <GestionDeFournisseur />;
      case 'GestionAgent':
        return <GestionAgent />;
      case 'dashboard':
      default:
        return <h2>Bienvenue dans le Dashboard</h2>;
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <SideBar onMenuItemClick={handleMenuItemClick} />
      
      {/* Contenu principal */}
      <div className="flex-1 bg-white">
        <NavBar />
        <div className=" mx-[20px] ">
          {renderComponent()}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
