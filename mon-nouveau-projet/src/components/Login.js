import React, { useState } from 'react';
import axios from 'axios';
import logo from '../images/logo.png'; // Assurez-vous que le chemin de l'image est correct
import { Link, useNavigate } from 'react-router-dom';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate(); // Correctement importé depuis react-router-dom

  // Fonction pour gérer les changements dans les champs du formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Fonction pour soumettre le formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanedData = {
      email: formData.email.trim(),
      password: formData.password.trim(),
    };

    setErrorMessage('');
    setLoading(true);

    try {
      const response = await axios.post(
        'http://localhost:8080/api/auth/login',
        cleanedData,
        {
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
        }
      );

      console.log('Réponse du serveur:', response.data);

      if (response.data.message === 'Login successful') {
        navigate('/dashboard'); // Redirige vers la page Dashboard
      } else {
        setErrorMessage('Erreur: Réponse inattendue du serveur.');
      }
    } catch (error) {
      setLoading(false);

      if (error.response) {
        console.error('Erreur lors de l\'appel API:', error.response.data);
        setErrorMessage('Erreur lors de la connexion: ' + error.response.data.message);
      } else {
        setErrorMessage('Une erreur s\'est produite. Veuillez réessayer plus tard.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
        <div className="flex justify-center mb-6">
          <img src={logo} alt="Logo" className="w-32" />
        </div>

        <h1 className="text-2xl font-bold text-center mb-4">Connexion</h1>

        {errorMessage && (
          <div className="mb-4 text-red-600 text-center">
            <p>{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Entrez votre email"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
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
              required
            />
          </div>

          <button
            type="submit"
            className={`w-full ${loading ? 'bg-gray-500' : 'bg-custom-red'} text-white py-2 rounded-lg hover:bg-custom-gray transition duration-200`}
            disabled={loading}
          >
            {loading ? 'Chargement...' : 'Se connecter'}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-4">
          Pas encore de compte ?{' '}
          <Link to="/signup" className="text-blue-500 hover:underline">
            Inscrivez-vous
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
