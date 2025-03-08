import React, { useState } from 'react';

const AjoutAgent = ({ ajouterAgent, onClose }) => {
  const [nouvelAgent, setNouvelAgent] = useState({
    nom: '',
    prenom: '',
    phone: '',
    email: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNouvelAgent({ ...nouvelAgent, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:8080/agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nouvelAgent),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Agent ajouté avec succès', data);
        ajouterAgent(data); // Ajoute l'agent retourné par l'API
        onClose();
      } else {
        console.error("Erreur lors de l'ajout de l'agent", data.message);
      }
    } catch (error) {
      console.error('Erreur de réseau ou autre', error);
    }
  };

  const handleClickOutside = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={handleClickOutside}
    >
      <div className="bg-white p-8 rounded-lg shadow-lg w-[50%]" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-semibold text-center mb-6">Ajouter un Agent</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <input
            type="text"
            name="nom"
            placeholder="Nom"
            value={nouvelAgent.nom}
            onChange={handleChange}
            required
            className="border p-2 w-full rounded"
          />
          <input
            type="text"
            name="prenom"
            placeholder="Prénom"
            value={nouvelAgent.prenom}
            onChange={handleChange}
            required
            className="border p-2 w-full rounded"
          />
          <input
            type="text"
            name="phone"
            placeholder="Téléphone"
            value={nouvelAgent.phone}
            onChange={handleChange}
            required
            className="border p-2 w-full rounded"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={nouvelAgent.email}
            onChange={handleChange}
            required
            className="border p-2 w-full rounded"
          />

          <div className="col-span-2 flex justify-end space-x-4 mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-custom-gray text-white rounded-lg">
              Annuler
            </button>
            <button type="submit" className="px-4 py-2 bg-custom-red text-white rounded-lg">
              Ajouter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AjoutAgent;