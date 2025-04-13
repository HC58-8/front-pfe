import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth,firestore } from '../firebaseConfig';
import logo from '../images/logo.png';
import { useNavigate } from 'react-router-dom';

function Signup() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '+216 ',
    email: '',
    password: '',
    role: 'Utilisateur',
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      if (!value.startsWith('+216 ')) {
        setFormData((prevData) => ({
          ...prevData,
          [name]: '+216 ' + value.replace('+216 ', ''),
        }));
      } else {
        setFormData((prevData) => ({
          ...prevData,
          [name]: value,
        }));
      }
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
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
    
    if (!formData.password.trim()) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }
    
    if (!formData.phone.trim() || formData.phone === '+216 ') {
      newErrors.phone = 'Le téléphone est requis';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setErrors({});

    try {
      // Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      const user = userCredential.user;

      // Firestore Document Creation
      const userData = {
        uid: user.uid,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        role: formData.role,
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(firestore, 'users', user.uid), userData);

      alert('Inscription réussie! Vous pouvez maintenant vous connecter.');
      navigate('/login');
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          setErrors({ 
            general: 'Un compte existe déjà avec cet email.' 
          });
          break;
        case 'auth/weak-password':
          setErrors({ 
            password: 'Le mot de passe est trop faible.' 
          });
          break;
        case 'auth/invalid-email':
          setErrors({ 
            email: 'Format d\'email invalide.' 
          });
          break;
        default:
          setErrors({ 
            general: 'Une erreur s\'est produite lors de l\'inscription.' 
          });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // The UI remains exactly the same as your original implementation
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 overflow-hidden">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg flex h-screen md:h-auto md:max-h-screen md:my-4 overflow-hidden">
        {/* Logo section (left side) */}
        <div className="hidden md:flex flex-col items-center justify-center w-1/3 p-6 bg-gray-50">
          <img src={logo} alt="Logo" className="w-40 mb-6" />
          <h2 className="text-xl font-bold text-custom-gray text-center">Bienvenue sur notre plateforme</h2>
          <p className="text-center text-custom-gray mt-4">
            Créez votre compte pour accéder à tous nos services.
          </p>
        </div>

        {/* Vertical divider */}
        <div className="hidden md:block w-px bg-gray-300 h-full"></div>

        {/* Form section (right side) */}
        <div className="w-full md:w-2/3 flex flex-col p-4 md:p-6 overflow-auto">
          {/* Mobile logo - only visible on small screens */}
          <div className="md:hidden flex justify-center mb-4">
            <img src={logo} alt="Logo" className="w-24" />
          </div>

          <h1 className="text-xl font-bold text-center mb-4 text-custom-gray">Inscription</h1>

          {errors.general && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label htmlFor="firstName" className="block text-custom-gray font-medium mb-1 text-sm">
                  Prénom
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Entrez votre prénom"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.firstName ? 'border-red-500' : ''
                  }`}
                />
                {errors.firstName && (
                  <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-custom-gray font-medium mb-1 text-sm">
                  Nom
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Entrez votre nom"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.lastName ? 'border-red-500' : ''
                  }`}
                />
                {errors.lastName && (
                  <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label htmlFor="phone" className="block text-custom-gray font-medium mb-1 text-sm">
                  Téléphone (avec préfixe +216)
                </label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+216 00000000"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.phone ? 'border-red-500' : ''
                  }`}
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-custom-gray font-medium mb-1 text-sm">
                  Adresse e-mail
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Entrez votre e-mail"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.email ? 'border-red-500' : ''
                  }`}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-custom-gray font-medium mb-1 text-sm">
                Mot de passe
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Entrez votre mot de passe"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.password ? 'border-red-500' : ''
                }`}
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="role" className="block text-custom-gray font-medium mb-1 text-sm">
                Rôle
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Utilisateur">Utilisateur</option>
                <option value="Administrateur">Administrateur</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full ${
                isSubmitting ? 'bg-gray-400' : 'bg-custom-red hover:bg-custom-gray'
              } text-white py-2 rounded-lg transition duration-200`}
            >
              {isSubmitting ? 'Inscription en cours...' : 'S\'inscrire'}
            </button>
          </form>

          <p className="text-center text-custom-gray mt-4 text-sm">
            Déjà un compte ?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-blue-500 hover:underline"
            >
              Connectez-vous
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;