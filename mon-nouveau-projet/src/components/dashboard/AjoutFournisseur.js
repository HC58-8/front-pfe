import React, { useState } from 'react';

const AjoutFournisseur = ({ onAjouter, onFermer }) => {
  const [nouveauFournisseur, setNouveauFournisseur] = useState({
    nom: '',
    telephone: '',
    email: '',
    adresse: '', // Ajout de l'adresse
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNouveauFournisseur({ ...nouveauFournisseur, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Effectuer l'appel API pour ajouter le fournisseur
      const response = await fetch('http://localhost:8080/fournisseurs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nouveauFournisseur),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Fournisseur ajouté avec succès', data);
        onAjouter(nouveauFournisseur); // Appeler la fonction de succès
        onFermer(); // Ferme le formulaire après l'ajout
      } else {
        console.error('Erreur lors de l\'ajout du fournisseur', data.message);
      }
    } catch (error) {
      console.error('Erreur de réseau ou autre', error);
    }
  };

  const handleClickOutside = (e) => {
    if (e.target === e.currentTarget) {
      onFermer();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={handleClickOutside} // Ferme la fenêtre si on clique à l'extérieur
    >
      <div className="bg-white p-8 rounded-lg shadow-lg w-[50%]" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-semibold text-center mb-6">Ajouter un Fournisseur</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <input
            type="text"
            name="nom"
            placeholder="Nom"
            value={nouveauFournisseur.nom}
            onChange={handleChange}
            required
            className="border p-2 w-full rounded"
          />
          <input
            type="text"
            name="telephone"
            placeholder="Téléphone"
            value={nouveauFournisseur.telephone}
            onChange={handleChange}
            required
            className="border p-2 w-full rounded"
          /> 
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={nouveauFournisseur.email}
            onChange={handleChange}
            required
            className="border p-2 w-full rounded"
          />
          <input
            type="text"
            name="adresse"
            placeholder="Adresse"
            value={nouveauFournisseur.adresse}
            onChange={handleChange}
            required
            className="border p-2 w-full rounded"
          />

          <div className="col-span-2 flex justify-end space-x-4 mt-4">
            <button type="button" onClick={onFermer} className="px-4 py-2 bg-custom-gray text-white rounded-lg">Annuler</button>
            <button type="submit" className="px-4 py-2 bg-custom-red text-white rounded-lg">Ajouter</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AjoutFournisseur;
