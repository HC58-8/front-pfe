import React, { useState } from 'react';
import axios from 'axios';
import logo from '../images/logo.png';
import { useNavigate } from 'react-router-dom'; // Importer useNavigate

function Signup() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  const navigate = useNavigate(); // Initialiser useNavigate

  // Fonction pour gérer les changements dans les champs du formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Fonction pour soumettre le formulaire
  const handleSubmit = (e) => {
    e.preventDefault();

    const cleanedData = {
      username: formData.username.trim(),
      email: formData.email.trim(),
      password: formData.password.trim(),
    };

    // Envoi des données d'inscription
    axios
      .post('http://localhost:8080/api/auth/signup', cleanedData, {
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
      })
      .then((response) => {
        console.log('Réponse du serveur:', response.data);
        if (response.data.message === "User registered successfully") {
          // Redirection vers la page de connexion après succès
          navigate('/login');
        }
      })
      .catch((error) => {
        if (error.response) {
          console.error('Erreur lors de l\'appel API:', error.response.data);
          alert('Erreur lors de l\'inscription: ' + JSON.stringify(error.response.data));
        }
      });
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
        <div className="flex justify-center mb-6">
          <img src={logo} alt="Logo" className="w-32" />
        </div>

        <h1 className="text-2xl font-bold text-center mb-4 text-custom-gray">Inscription</h1>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-custom-gray font-medium mb-2">
              Nom d'utilisateur
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Entrez votre nom d'utilisateur"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="block text-custom-gray font-medium mb-2">
              Adresse e-mail
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Entrez votre e-mail"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-custom-gray font-medium mb-2">
              Mot de passe
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Entrez votre mot de passe"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-custom-red text-white py-2 rounded-lg hover:bg-custom-gray transition duration-200"
          >
            S'inscrire
          </button>
        </form>

        <p className="text-center text-custom-gray mt-4">
          Déjà un compte ?{' '}
          <button
            onClick={() => window.location.href = '/login'} // Redirection manuelle si nécessaire
            className="text-blue-500 hover:underline"
          >
            Connectez-vous
          </button>
        </p>
      </div>
    </div>
  );
}

export default Signup;
