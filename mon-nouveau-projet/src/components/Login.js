      import React, { useState } from 'react';
      import api from '../components/api'; // Import your custom API service
      import logo from '../images/logo.png';
      import { Link, useNavigate } from 'react-router-dom';

      function Login() {
        const [formData, setFormData] = useState({
          email: '',
          password: '',
        });

        const [errors, setErrors] = useState({});
        const [isSubmitting, setIsSubmitting] = useState(false);

        const navigate = useNavigate();

        // Handle input changes
        const handleChange = (e) => {
          const { name, value } = e.target;
          setFormData((prevData) => ({
            ...prevData,
            [name]: value,
          }));

          // Clear field-specific error when user types
          if (errors[name]) {
            setErrors((prev) => ({
              ...prev,
              [name]: undefined,
            }));
          }
        };

        // Validate form inputs
        const validateForm = () => {
          const newErrors = {};

          if (!formData.email.trim()) {
            newErrors.email = "L'email est requis";
          } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Format d'email invalide";
          }

          if (!formData.password.trim()) {
            newErrors.password = 'Le mot de passe est requis';
          }

          setErrors(newErrors);
          return Object.keys(newErrors).length === 0;
        };

        // Handle form submission
        const handleSubmit = async (e) => {
          e.preventDefault();
        
          if (!validateForm()) {
            return;
          }
        
          setIsSubmitting(true);
          setErrors({});
        
          const cleanedData = {
            email: formData.email.trim(),
            password: formData.password.trim(),
          };
        
          try {
            // Send email and password to the backend
            const response = await api.post("/auth/login", cleanedData);
        
            console.log("Réponse du serveur:", response.data);
        
            if (response.data.message === "Login successful") {
              // Save JWT token and user data in localStorage
              localStorage.setItem("token", response.data.token);
              localStorage.setItem(
                "user",
                JSON.stringify({
                  uid: response.data.uid,
                  email: response.data.email,
                  displayName: response.data.displayName,
                  role: response.data.role,
                })
              );
        
              // Redirect to dashboard
              navigate("/dashboard");
            } else {
              setErrors({
                general: "Erreur: Réponse inattendue du serveur.",
              });
            }
          } catch (error) {
            console.error("Erreur lors de l'appel API:", error);
        
            if (error.response) {
              // Handle specific error responses
              if (error.response.status === 401) {
                setErrors({
                  general: "Email ou mot de passe incorrect",
                });
              } else if (error.response.data && error.response.data.message) {
                setErrors({
                  general: error.response.data.message,
                });
              } else {
                setErrors({
                  general: "Une erreur s'est produite lors de la connexion",
                });
              }
            } else {
              setErrors({
                general: "Problème de connexion au serveur",
              });
            }
          } finally {
            setIsSubmitting(false);
          }
        };

        return (
          <div className="flex items-center justify-center h-screen bg-gray-100">
            <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
              <div className="flex justify-center mb-6">
                <img src={logo} alt="Logo" className="w-32" />
              </div>

              <h1 className="text-2xl font-bold text-center mb-4">Connexion</h1>

              {errors.general && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  <p>{errors.general}</p>
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
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.email ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
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
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.password ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full ${
                    isSubmitting ? 'bg-gray-400' : 'bg-custom-red hover:bg-custom-gray'
                  } text-white py-2 rounded-lg transition duration-200`}
                >
                  {isSubmitting ? 'Connexion en cours...' : 'Se connecter'}
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