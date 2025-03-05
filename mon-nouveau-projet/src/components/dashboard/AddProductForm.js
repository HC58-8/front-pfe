import React, { useState } from 'react';
import axios from 'axios';

const AddProductForm = () => {
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productStock, setProductStock] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [imageBase64, setImageBase64] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleImageChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setImageBase64(reader.result);
      };
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Validation des champs
    if (!productName || !productPrice || !productStock || !productCategory || !imageBase64) {
      setErrorMessage('Tous les champs doivent être remplis.');
      return;
    }

    // Validation du prix et du stock (doivent être des valeurs positives)
    if (productPrice <= 0 || productStock <= 0) {
      setErrorMessage('Le prix et le stock doivent être des valeurs positives.');
      return;
    }

    const productData = {
        nom: productName,
        prix: parseFloat(productPrice),  // Assurez-vous que le prix est un nombre
        stock: parseInt(productStock),    // Assurez-vous que le stock est un nombre entier
        categorie: productCategory,
        imageBase64: imageBase64,  // Image en base64
      };
      
    console.log("Données du produit à envoyer :", productData);

    try {
      const response = await axios.post('http://localhost:8080/api/produits', productData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 201) {
        setSuccessMessage('Produit ajouté avec succès !');
        setErrorMessage('');
        setProductName('');
        setProductPrice('');
        setProductStock('');
        setProductCategory('');
        setImageBase64('');
      } else {
        setErrorMessage('Erreur lors de l\'ajout du produit.');
      }
    } catch (error) {
      setErrorMessage('Erreur lors de l\'ajout du produit.');
      console.error('Erreur de requête', error);
    }
  };

  return (
    <div className="flex justify-center items-center bg-white">
      <div className="bg-gray-700 p-6 rounded-lg w-[50%]">
        <h3 className="text-xl font-semibold text-white mb-4">Ajouter un Produit</h3>

        {/* Affichage des messages d'erreur ou de succès */}
        {errorMessage && <div className="alert alert-danger text-red-500 mb-4">{errorMessage}</div>}
        {successMessage && <div className="alert alert-success text-green-500 mb-4">{successMessage}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="productImage" className="block text-white">Image du Produit</label>
            <input
              type="file"
              id="productImage"
              onChange={handleImageChange}
              className="mt-1 p-2 w-full border rounded"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="productName" className="block text-white">Nom du Produit</label>
            <input
              type="text"
              id="productName"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="mt-1 p-2 w-full border rounded"
              placeholder="Nom du produit"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="productPrice" className="block text-white">Prix</label>
            <input
              type="number"
              id="productPrice"
              value={productPrice}
              onChange={(e) => setProductPrice(e.target.value)}
              className="mt-1 p-2 w-full border rounded"
              placeholder="Prix du produit"
              min="0"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="productStock" className="block text-white">Stock</label>
            <input
              type="number"
              id="productStock"
              value={productStock}
              onChange={(e) => setProductStock(e.target.value)}
              className="mt-1 p-2 w-full border rounded"
              placeholder="Quantité en stock"
              min="0"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="productCategory" className="block text-white">Catégorie</label>
            <select
              id="productCategory"
              value={productCategory}
              onChange={(e) => setProductCategory(e.target.value)}
              className="mt-1 p-2 w-full border rounded"
            >
              <option value="">Sélectionner une catégorie</option>
              <option value="cat1">Catégorie 1</option>
              <option value="cat2">Catégorie 2</option>
              <option value="cat3">Catégorie 3</option>
            </select>
          </div>
          <button type="submit" className="bg-custom-red text-white px-4 py-2 rounded hover:bg-gray-700">
            Ajouter Produit
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProductForm;
