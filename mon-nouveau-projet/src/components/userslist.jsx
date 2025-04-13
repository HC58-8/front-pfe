import React, { useState, useEffect } from 'react';
import { doc, updateDoc, getDoc, collection, getDocs } from 'firebase/firestore';
import { firestore, auth } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';

function UsersList() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    
    const verifyAdminAndFetchUsers = async () => {
      try {
        const currentUser = auth.currentUser;
        
        if (!currentUser) {
          navigate('/login');
          return;
        }

        const userDoc = await getDoc(doc(firestore, 'users', currentUser.uid));
        const userData = userDoc.data();
        
        if (!userDoc.exists() || userData.role !== 'Administrateur') {
          navigate('/dashboard');
          return;
        }

        const querySnapshot = await getDocs(collection(firestore, 'users'));
        const usersData = [];
        
        querySnapshot.forEach((doc) => {
          usersData.push({
            uid: doc.id,
            ...doc.data()
          });
        });

        setUsers(usersData);
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to load users');
      }
    };

    verifyAdminAndFetchUsers();
  }, [navigate]);
  
  const handleRoles = (userId) => {
    navigate(`/userrole/${userId}`);
  }

  const handleRoleChange = async (userId, currentRole) => {
    const newRole = currentRole === 'Administrateur' ? 'Utilisateur' : 'Administrateur';
    
    try {
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.uid === userId ? { ...user, role: newRole } : user
        )
      );

      const userRef = doc(firestore, 'users', userId);
      await updateDoc(userRef, { role: newRole });
    } catch (error) {
      console.error('Error updating role:', error);
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.uid === userId ? { ...user, role: currentRole } : user
        )
      );
      setError('Failed to update role. Please try again.');
    }
  };

  if (error) return <div className="text-red-500 text-center mt-8">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gestion des Utilisateurs</h1>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded-lg shadow">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-3 px-6 text-left">Nom Complet</th>
              <th className="py-3 px-6 text-left">Email</th>
              <th className="py-3 px-6 text-left">Téléphone</th>
              <th className="py-3 px-6 text-left">Rôle</th>
              <th className="py-3 px-6 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.uid} className="border-b hover:bg-gray-50">
                <td className="py-4 px-6">{`${user.firstName} ${user.lastName}`}</td>
                <td className="py-4 px-6">{user.email}</td>
                <td className="py-4 px-6">{user.phone}</td>
                <td className="py-4 px-6">
                  <span className={`px-2 py-1 rounded ${
                    user.role === 'Administrateur' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <button
                    onClick={() => handleRoleChange(user.uid, user.role)}
                    className={`px-4 py-2 rounded transition-colors ${
                      user.role === 'Administrateur' 
                        ? 'bg-orange-500 hover:bg-orange-600' 
                        : 'bg-blue-500 hover:bg-blue-600'
                    } text-white`}
                  >
                    {user.role === 'Administrateur' 
                      ? 'Rétrograder en Utilisateur' 
                      : 'Promouvoir en Administrateur'}
                  </button>
                </td>
                <td>
                  <button 
                    onClick={() => handleRoles(user.uid)}
                    className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
                    id='btnrole'
                  >
                    Assigner un rôle spécifique
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UsersList;