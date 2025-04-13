import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import logo from "../images/logo.png";
import api from "./api";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, onValue } from "firebase/database";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [qrCodeData, setQrCodeData] = useState(null);
  const [qrStatus, setQrStatus] = useState("pending");
  const navigate = useNavigate();
  const auth = getAuth();
  const db = getDatabase();
  const loginButtonRef = useRef(null); // Create a ref to the login button

  useEffect(() => {
    let isMounted = true;
    let qrSessionUnsubscribe;

    const generateQrCodeData = async () => {
      try {
        const response = await api.generateQrCodeToken();
        if (isMounted) {
          setQrCodeData(response.token);
          setQrStatus('pending');

          const sessionRef = ref(db, `qrSessions/${response.token}`);
          qrSessionUnsubscribe = onValue(sessionRef, async (snapshot) => {
            const sessionData = snapshot.val();
            if (!sessionData) return;

            if (isMounted) {
              setQrStatus(sessionData.status);
            }

            // If the QR code has been authenticated by the mobile app and we have user data
            if (sessionData.status === 'authenticated' && sessionData.user && sessionData.user.email) {
              console.log("QR code authenticated, populating credentials:", sessionData.user);
              if (isMounted) {
                setFormData({
                  email: sessionData.user.email,
                  password: sessionData.user.uid || '', // You might not have the actual password
                });
                setQrStatus('credentials_populated');
              }
              // Trigger login after credentials are populated
              if (loginButtonRef.current) {
                loginButtonRef.current.click(); // Programmatically click the login button
              }
            }
          });
        }
      } catch (error) {
        console.error("Failed to generate QR code token", error);
        if (isMounted) {
          setErrors({
            general: "Failed to generate QR code. Please refresh the page."
          });
        }
      }
    };

    generateQrCodeData();

    return () => {
      isMounted = false;
      if (qrSessionUnsubscribe) {
        qrSessionUnsubscribe();
      }
    };
  }, [navigate, db, auth]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Format d'email invalide";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Le mot de passe est requis";
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
      const response = await api.login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      setErrors({
        general: error.message || 'Login failed. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getQrStatusDisplay = () => {
    switch (qrStatus) {
      case 'pending':
        return 'Scannez ce code QR avec l\'application mobile';
      case 'verified':
        return 'Code QR vérifié, en attente d\'authentification...';
      case 'authenticated':
        return 'Authentification réussie, informations récupérées.';
      case 'credentials_populated':
        return 'Les informations ont été renseignées, veuillez vous connecter.';
      default:
        return 'Scannez ce code QR avec l\'application mobile';
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
                errors.email ? "border-red-500" : ""
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
                errors.password ? "border-red-500" : ""
              }`}
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          <button
            ref={loginButtonRef} // Assign the ref to the button
            type="submit"
            disabled={isSubmitting}
            className={`w-full ${
              isSubmitting ? "bg-gray-400" : "bg-custom-red hover:bg-custom-gray"
            } text-white py-2 rounded-lg transition duration-200`}
          >
            {isSubmitting ? "Connexion en cours..." : "Se connecter"}
          </button>
        </form>

        {qrCodeData && (
          <div className="mt-4 text-center">
            <p className="text-gray-600">{getQrStatusDisplay()}</p>
            <div className={`relative mt-2 mx-auto inline-block ${qrStatus === 'credentials_populated' ? 'opacity-50' : ''}`}>
              <QRCodeSVG
                value={qrCodeData}
                size={256}
              />
              {qrStatus === 'credentials_populated' && (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70">
                  <p className="text-green-600 font-bold text-lg">Prêt à se connecter!</p>
                </div>
              )}
            </div>
            <p className="text-gray-600 mt-2">Scannez le QR code avec votre application mobile.</p>
          </div>
        )}

        <p className="text-center text-gray-600 mt-4">
          Pas encore de compte ?{" "}
          <Link to="/signup" className="text-blue-500 hover:underline">
            Inscrivez-vous
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;