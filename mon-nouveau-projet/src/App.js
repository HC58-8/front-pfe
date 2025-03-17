import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Signup from './components/Signup';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ChatBot from './components/ChatBot';
import './tailwind.css'; // Import du fichier Tailwind
import AjoutProd from './components/dashboard/AddProductForm';
import ProduitList  from './components/dashboard/ProductList';

function App() {
  return (
    <Router>
      <div>
        {/* Composant ChatBot en dehors des Routes, il sera affiché sur toutes les pages */}
        <ChatBot />

        {/* Définir les routes */}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/produits/ajouterunproduit" element={<AjoutProd />} />
          <Route path="/produits/listedesproduits" element={<ProduitList  />} />


        </Routes>
      </div>
    </Router>
  );
}

export default App;
