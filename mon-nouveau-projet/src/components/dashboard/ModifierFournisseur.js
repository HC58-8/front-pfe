import React, { useState, useEffect } from 'react';

const ModifierFournisseur = ({ fournisseur, onModifier, onFermer }) => {
  // Initialiser l'état avec les données du fournisseur à modifier
  const [fournisseurModifie, setFournisseurModifie] = useState({
    nom: fournisseur.nom || '',
    telephone: fournisseur.telephone || '',
    email: fournisseur.email || '',
    adresse: fournisseur.adresse || '',
  });

  useEffect(() => {
    // Mettre à jour l'état si les données du fournisseur changent
    setFournisseurModifie({
      nom: fournisseur.nom,
      telephone: fournisseur.telephone,
      email: fournisseur.email,
      adresse: fournisseur.adresse,
    });
  }, [fournisseur]); // Effectuer la mise à jour à chaque changement du fournisseur

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFournisseurModifie({ ...fournisseurModifie, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Effectuer l'appel API pour modifier le fournisseur
      const response = await fetch(`http://localhost:8080/fournisseurs/${fournisseur.id}`, {
        method: 'PUT', // Utilisation de PUT pour la modification
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fournisseurModifie),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Fournisseur modifié avec succès', data);
        onModifier(fournisseurModifie); // Appeler la fonction de succès
        onFermer(); // Ferme le formulaire après la modification
      } else {
        console.error('Erreur lors de la modification du fournisseur', data.message);
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
        <h2 className="text-2xl font-semibold text-center mb-6">Modifier un Fournisseur</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <input
            type="text"
            name="nom"
            placeholder="Nom"
            value={fournisseurModifie.nom}
            onChange={handleChange}
            required
            className="border p-2 w-full rounded"
          />
          <input
            type="text"
            name="telephone"
            placeholder="Téléphone"
            value={fournisseurModifie.telephone}
            onChange={handleChange}
            required
            className="border p-2 w-full rounded"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={fournisseurModifie.email}
            onChange={handleChange}
            required
            className="border p-2 w-full rounded"
          />
          <input
            type="text"
            name="adresse"
            placeholder="Adresse"
            value={fournisseurModifie.adresse}
            onChange={handleChange}
            required
            className="border p-2 w-full rounded"
          />

          <div className="col-span-2 flex justify-end space-x-4 mt-4">
            <button type="button" onClick={onFermer} className="px-4 py-2 bg-custom-gray text-white rounded-lg">Annuler</button>
            <button type="submit" className="px-4 py-2 bg-custom-red text-white rounded-lg">Modifier</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModifierFournisseur;
