import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Signup from './components/Signup';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ChatBot from './components/ChatBot';
import AjoutProd from './components/dashboard/AddProductForm';
import ProduitList from './components/dashboard/ProductList';
import RentPage from './components/dashboard/RentPage';
import ProfilePage from './components/dashboard/ProfilePage';
import RentalHistoryPage from './components/dashboard/RentalHistoryPage';
import ProfileUpdate from './components/dashboard/ProfileUpdate';
import AjoutFournisseur from './components/dashboard/AjoutFournisseur';
import FournisseurList from './components/dashboard/FournisseurList';
import ReturnProductPage from './components/dashboard/ReturnProductPage';
import UsersRoleManagement from './components/dashboard/usersRole';
import UsersList from './components/userslist';
function App() {
  return (
    <Router>
        <div>
          {/* ChatBot component displayed on all pages */}
          <ChatBot />

          {/* Define routes */}
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/produits/ajouterunproduit" element={<AjoutProd />} />
            <Route path="/produits/listedesproduits" element={<ProduitList />} />
            <Route path="/renting" element={<RentPage />} />
            <Route path="/rentinghistory" element={<RentalHistoryPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/:uid" element={<ProfilePage />} /> {/* Specific user's profile */}
            <Route path="/settings" element={<ProfileUpdate />} />
            <Route path="/ajoutfournisseur" element={<AjoutFournisseur />} />
            <Route path="/fournisseurlist" element={<FournisseurList />} />
            <Route path="/return-product" element={<ReturnProductPage />} />
            <Route path="/user/:userId/rental-history" element={<RentalHistoryPage />} />
            <Route path="/userrole/:userId" element={<UsersRoleManagement />} />
             <Route path="/userslist" element={<UsersList/>} />




          </Routes>
        </div>
    </Router>
  );
}

export default App;