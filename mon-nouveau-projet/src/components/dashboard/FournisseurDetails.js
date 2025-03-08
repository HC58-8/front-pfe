import React from 'react';

const FournisseurDetails = ({ fournisseur, onFermer }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
        <h2 className="text-xl font-semibold mb-4">Détails du fournisseur</h2>
        <p><strong>Code:</strong> {fournisseur.code}</p>
        <p><strong>Nom:</strong> {fournisseur.nom}</p>
        <p><strong>Téléphone:</strong> {fournisseur.telephone}</p>
        <p><strong>Email:</strong> {fournisseur.email}</p>
        <p><strong>Dette d'achat:</strong> {fournisseur.detteAchat} TND</p>
        <p><strong>Dette de retour:</strong> {fournisseur.detteRetour} TND</p>
        <div className="flex justify-end space-x-4 mt-4">
          <button onClick={onFermer} className="bg-red-500 text-white px-4 py-2 rounded-lg">Fermer</button>
        </div>
      </div>
    </div>
  );
};

export default FournisseurDetails;
