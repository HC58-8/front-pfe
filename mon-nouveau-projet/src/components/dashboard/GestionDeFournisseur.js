import React, { useState, useEffect } from 'react';
import { FaPlus, FaFileImport, FaEllipsisV, FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import AjoutFournisseur from './AjoutFournisseur';
import axios from 'axios';
import FournisseurDetails from './FournisseurDetails';
import ModifierFournisseur from './ModifierFournisseur';
import ConfirmationModal from './ConfirmationModal'; // Importer la modal de confirmation

const GestionDeFournisseur = () => {
  const [recherche, setRecherche] = useState('');
  const [fournisseurs, setFournisseurs] = useState([]);
  const [menuOuvert, setMenuOuvert] = useState(null);
  const [rowsPerPage, setRowsPerPage] = useState(3);
  const [page, setPage] = useState(0);
  const [afficherFormulaire, setAfficherFormulaire] = useState(false);
  const [fournisseurDetail, setFournisseurDetail] = useState(null);
  const [confirmationVisible, setConfirmationVisible] = useState(false); // Nouvel état pour la modal
  const [fournisseurASupprimer, setFournisseurASupprimer] = useState(null); // Fournisseur à supprimer

  useEffect(() => {
    const fetchFournisseurs = async () => {
      try {
        const response = await axios.get('http://localhost:8080/fournisseurs');
        const data = response.data.map(f => ({
          ...f,
          detteAchat: f.detteAchat || 0.0,
          detteRetour: f.detteRetour || 0.0,
        }));
        setFournisseurs(data);
      } catch (error) {
        console.error('Erreur lors de la récupération des fournisseurs:', error);
      }
    };

    fetchFournisseurs();
  }, []);

  const handleRecherche = (e) => setRecherche(e.target.value);

  const toggleMenu = (id) => {
    setMenuOuvert(menuOuvert === id ? null : id);
  };

  const handleSupprimer = (id) => {
    setFournisseurASupprimer(id); // Enregistrer le fournisseur à supprimer
    setConfirmationVisible(true); // Afficher la confirmation
    setMenuOuvert(null);
  };

  const confirmerSuppression = () => {
    // Supprimer le fournisseur une fois la confirmation donnée
    setFournisseurs(fournisseurs.filter((f) => f.id !== fournisseurASupprimer));
    setConfirmationVisible(false); // Fermer la modal après suppression
  };

  const annulerSuppression = () => {
    setConfirmationVisible(false); // Fermer la modal sans supprimer
  };

  const fournisseursFiltres = fournisseurs.filter((f) =>
    f.nom.toLowerCase().includes(recherche.toLowerCase())
  );

  const indexDébut = page * rowsPerPage;
  const indexFin = indexDébut + rowsPerPage;
  const fournisseursAffiches = fournisseursFiltres.slice(indexDébut, indexFin);

  const handlePageChange = (nouvellePage) => {
    if (nouvellePage >= 0 && nouvellePage < Math.ceil(fournisseursFiltres.length / rowsPerPage)) {
      setPage(nouvellePage);
    }
  };

  const ajouterFournisseur = (nouveauFournisseur) => {
    setFournisseurs([...fournisseurs, nouveauFournisseur]);
    setAfficherFormulaire(false);
  };

  const voirDetails = (fournisseur) => {
    setFournisseurDetail(fournisseur);
  };

  const fermerDetails = () => {
    setFournisseurDetail(null);
  };

  return (
    <div className="h-[100vh] pt-[50px] bg-white">
      <h1 className="py-4 text-3xl font-semibold">Gestion des Fournisseurs</h1>
      <hr className="border-t-2 border-gray-200 my-4" />
      <div className="flex justify-between items-center mb-4">
        <div className="relative w-1/2">
          <input
            type="text"
            placeholder="Rechercher dans ce tableau..."
            value={recherche}
            onChange={handleRecherche}
            className="border p-2 rounded-lg pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 h-8 text-sm font-normal text-gray-600 border-gray-300"
          />
        </div>

        <div className="flex space-x-4">
          <button className="bg-custom-gray text-white px-4 py-2 rounded-lg flex items-center">
            <FaFileImport className="mr-2 " /> Importer
          </button>
          <button onClick={() => setAfficherFormulaire(true)} className=" bg-custom-red text-white px-4 py-2 rounded-lg flex items-center">
            <FaPlus className="mr-2 " /> Ajouter
          </button>
        </div>
      </div>

      {afficherFormulaire && (
        <AjoutFournisseur 
          onAjouter={ajouterFournisseur} 
          onFermer={() => setAfficherFormulaire(false)} 
        />
      )}

      {fournisseurDetail && (
        <FournisseurDetails fournisseur={fournisseurDetail} onFermer={fermerDetails} />
      )}

      {confirmationVisible && (
        <ConfirmationModal 
          onAnnuler={annulerSuppression} 
          onConfirmer={confirmerSuppression} 
        />
      )}

      <div className="overflow-x-auto h-1/2  mt-4">
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-3">Code</th>
              <th className="border p-3">Nom</th>
              <th className="border p-3">Téléphone</th>
              <th className="border p-3">Email</th>
              <th className="border p-3">Dette d'achat</th>
              <th className="border p-3">Dette de retour</th>
              <th className="border p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {fournisseursAffiches.map((f) => (
              <tr key={f.id} className="hover:bg-gray-50">
                <td className="border p-3">{f.code}</td>
                <td className="border p-3">{f.nom}</td>
                <td className="border p-3">{f.telephone}</td>
                <td className="border p-3">{f.email}</td>
                <td className="border p-3">{f.detteAchat} TND</td>
                <td className="border p-3">{f.detteRetour} TND</td>
                <td className="border p-3 relative">
                  <button onClick={() => toggleMenu(f.id)}>
                    <FaEllipsisV />
                  </button>
                  {menuOuvert === f.id && (
                    <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-lg z-10">
                      <button
                        onClick={() => voirDetails(f)}
                        className="block px-4 py-2 text-sm hover:bg-gray-100 w-full text-left"
                      >
                        <FaEye className="inline mr-2" /> Voir détails
                      </button>
                      <button className="block px-4 py-2 text-sm hover:bg-gray-100 w-full text-left">
                        <FaEdit className="inline mr-2" /> Modifier
                      </button>
                      <button
                        onClick={() => handleSupprimer(f.id)}
                        className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                      >
                        <FaTrash className="inline mr-2" /> Supprimer
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {fournisseursAffiches.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center p-4 text-gray-500">Aucun fournisseur trouvé</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between mt-4">
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 0}
          className="px-4 py-2 bg-gray-300 text-white rounded-lg"
        >
          Précédent
        </button>
        <span className="flex items-center justify-center text-sm font-semibold">
          Page {page + 1} sur {Math.ceil(fournisseursFiltres.length / rowsPerPage)}
        </span>
        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page === Math.ceil(fournisseursFiltres.length / rowsPerPage) - 1}
          className="px-4 py-2 bg-gray-300 text-white rounded-lg"
        >
          Suivant
        </button>
      </div>
    </div>
  );
};

export default GestionDeFournisseur;
