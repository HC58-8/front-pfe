import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { doc,getDoc,updateDoc } from 'firebase/firestore';
import { firestore } from '../../firebaseConfig';
import api from '../api';

function ProfileUpdate() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    currentPassword: '',
    newPassword: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const fetchUserData = async () => {
      try {
        const userDoc = await getDoc(doc(firestore, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setFormData(prev => ({
            ...prev,
            firstName: userDoc.data().firstName,
            lastName: userDoc.data().lastName,
            email: currentUser.email
          }));
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setErrors({ general: 'Erreur lors du chargement du profil' });
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Le prénom est requis';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Le nom est requis';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }
    
    if (formData.newPassword && formData.newPassword.length < 6) {
      newErrors.newPassword = 'Le mot de passe doit contenir au moins 6 caractères';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      // Update Firestore user data
      await updateDoc(doc(firestore, 'users', currentUser.uid), {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim()
      });

      // Update email if changed
      if (formData.email !== currentUser.email) {
        await updateEmail(currentUser, formData.email);
      }

      // Update password if provided
      if (formData.newPassword) {
        if (!formData.currentPassword) {
          throw new Error('Le mot de passe actuel est requis pour modifier le mot de passe');
        }
        
        const credential = EmailAuthProvider.credential(
          currentUser.email,
          formData.currentPassword
        );
        
        await reauthenticateWithCredential(currentUser, credential);
        await updatePassword(currentUser, formData.newPassword);
      }

      alert('Profil mis à jour avec succès!');
      navigate('/profile');
    } catch (error) {
      console.error('Update error:', error);
      switch (error.code) {
        case 'auth/email-already-in-use':
          setErrors({ email: 'Cet email est déjà utilisé par un autre compte' });
          break;
        case 'auth/wrong-password':
          setErrors({ currentPassword: 'Mot de passe actuel incorrect' });
          break;
        case 'auth/requires-recent-login':
          setErrors({ general: 'Veuillez vous reconnecter avant de modifier vos informations sensibles' });
          break;
        default:
          setErrors({ general: error.message || 'Erreur lors de la mise à jour du profil' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return <div>Chargement...</div>;

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
        <div className="flex justify-center mb-6">
        </div>

        <h1 className="text-2xl font-bold text-center mb-4">Modifier le Profil</h1>

        {errors.general && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            <p>{errors.general}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="firstName" className="block text-gray-700 font-medium mb-2">
              Prénom
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.firstName ? "border-red-500" : ""
              }`}
            />
            {errors.firstName && (
              <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
            )}
          </div>

          <div>
            <label htmlFor="lastName" className="block text-gray-700 font-medium mb-2">
              Nom
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.lastName ? "border-red-500" : ""
              }`}
            />
            {errors.lastName && (
              <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email ? "border-red-500" : ""
              }`}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="currentPassword" className="block text-gray-700 font-medium mb-2">
              Mot de passe actuel (pour modification)
            </label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              placeholder="Entrez votre mot de passe actuel"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.currentPassword ? "border-red-500" : ""
              }`}
            />
            {errors.currentPassword && (
              <p className="text-red-500 text-xs mt-1">{errors.currentPassword}</p>
            )}
          </div>

          <div>
            <label htmlFor="newPassword" className="block text-gray-700 font-medium mb-2">
              Nouveau mot de passe
            </label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="Laissez vide pour ne pas modifier"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.newPassword ? "border-red-500" : ""
              }`}
            />
            {errors.newPassword && (
              <p className="text-red-500 text-xs mt-1">{errors.newPassword}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full ${
              isSubmitting ? "bg-gray-400" : "bg-custom-red hover:bg-custom-gray"
            } text-white py-2 rounded-lg transition duration-200`}
          >
            {isSubmitting ? "Enregistrement..." : "Mettre à jour"}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-4">
          <button
            onClick={() => navigate(-1)}
            className="text-blue-500 hover:underline"
          >
            Retour
          </button>
        </p>
      </div>
    </div>
  );
}

export default ProfileUpdate;