import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { firestore } from '../../firebaseConfig';

const roleStructure = {
  userManagement: {
    label: 'CRUD Utilisateurs',
    roles: ['createUser', 'deleteUser'],
  },
  productManagement: {
    label: 'CRUD Produits',
    roles: ['createProduct', 'modifyProduct', 'deleteProduct'],
  },
  categoryManagement: {
    label: 'Gestion des Catégories',
    roles: ['addCategory'],
  },
  brandManagement: {
    label: 'Gestion des Marques',
    roles: ['addBrand'],
  },
};

const roleLabels = {
  createUser: 'Créer un utilisateur',
  deleteUser: 'Supprimer un utilisateur',
  createProduct: 'Créer un produit',
  modifyProduct: 'Modifier un produit',
  deleteProduct: 'Supprimer un produit',
  addCategory: 'Ajouter une catégorie',
  addBrand: 'Ajouter une marque',
};

function UsersRoleManagement() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [selectedRoles, setSelectedRoles] = useState({});
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userRef = doc(firestore, 'users', userId);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setUserInfo({
            name: `${userData.firstName} ${userData.lastName}`,
            email: userData.email
          });

          // Initialize selected roles from Firestore
          const initialRoles = {};
          (userData.permissions || []).forEach(role => {
            initialRoles[role] = true;
          });
          
          setSelectedRoles(initialRoles);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  const handleCheckboxChange = (role) => {
    setSelectedRoles(prev => ({
      ...prev,
      [role]: !prev[role]
    }));
  };

  const handleSubmit = async () => {
    try {
      const assignedRoles = Object.entries(selectedRoles)
        .filter(([_, value]) => value)
        .map(([key]) => key);

      const userRef = doc(firestore, 'users', userId);
      await updateDoc(userRef, {
        permissions: assignedRoles
      });
      
      alert('Rôles mis à jour avec succès!');
      navigate('/users');
    } catch (error) {
      console.error('Error updating roles:', error);
      alert('Échec de la mise à jour des rôles');
    }
  };

  if (loading) {
    return <div className="text-center mt-8">Chargement en cours...</div>;
  }

  if (!userInfo) {
    return <div className="text-red-500 text-center mt-8">Utilisateur non trouvé</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg mt-10">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-700">
        Assigner des rôles à {userInfo.name}
      </h2>
      
      <div className="mb-6 text-center">
        <p className="text-gray-600">{userInfo.email}</p>
      </div>

      {Object.entries(roleStructure).map(([sectionKey, section]) => (
        <div key={sectionKey} className="mb-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">
            {section.label}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {section.roles.map((role) => (
              <label key={role} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={!!selectedRoles[role]}
                  onChange={() => handleCheckboxChange(role)}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                <span className="text-gray-700">{roleLabels[role]}</span>
              </label>
            ))}
          </div>
        </div>
      ))}

      <div className="flex justify-between mt-8">
        <button
          onClick={() => navigate('/users')}
          className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
        >
          Retour
        </button>
        <button
          onClick={handleSubmit}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Enregistrer les rôles
        </button>
      </div>
    </div>
  );
}

export default UsersRoleManagement;