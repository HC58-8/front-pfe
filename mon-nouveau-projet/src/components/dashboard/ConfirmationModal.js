import React from 'react';

const ConfirmationModal = ({ onAnnuler, onConfirmer }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-[50%]" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-semibold text-center mb-6">Êtes-vous sûr ?</h2>
        <p className="text-center mb-6">Vous ne pourrez pas revenir en arrière !</p>
        <div className="flex justify-center space-x-4">
          <button onClick={onAnnuler} className="px-4 py-2 bg-gray-500 text-white rounded-lg">Annuler</button>
          <button onClick={onConfirmer} className="px-4 py-2 bg-red-500 text-white rounded-lg">Oui, supprimez-le !</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
