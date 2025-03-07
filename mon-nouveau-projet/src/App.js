import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Signup from './components/Signup';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ChatBot from './components/ChatBot';
import './tailwind.css'; // Import du fichier Tailwind
import AddProductForm from './components/dashboard/AddProductForm';

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
          <Route path="/produits/ajouterunproduit" element={<AddProductForm />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
