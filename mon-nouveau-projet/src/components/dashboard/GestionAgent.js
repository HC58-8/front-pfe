import React, { useState, useEffect } from 'react';
import { FaPlus, FaFileImport, FaEllipsisV, FaEye, FaTrash } from 'react-icons/fa';
import AjoutAgent from './AjoutAgent';
import axios from 'axios';

const GestionAgent = () => {
  const [recherche, setRecherche] = useState('');
  const [agents, setAgents] = useState([]);
  const [menuOuvert, setMenuOuvert] = useState(null);
  const [rowsPerPage, setRowsPerPage] = useState(3);
  const [page, setPage] = useState(0);
  const [afficherFormulaire, setAfficherFormulaire] = useState(false);
  const [agentDetail, setAgentDetail] = useState(null);
  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const [agentASupprimer, setAgentASupprimer] = useState(null);

  // Récupération des agents
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await axios.get('http://localhost:8080/agents');
        const data = response.data.map(a => ({
          ...a,
          phone: a.phone || '+216 ',
        }));
        setAgents(data);
      } catch (error) {
        console.error('Erreur lors de la récupération des agents:', error);
      }
    };
    fetchAgents();
  }, []);

  // Gestion de la recherche
  const handleRecherche = (e) => setRecherche(e.target.value);

  // Toggle du menu contextuel
  const toggleMenu = (id) => {
    setMenuOuvert(menuOuvert === id ? null : id);
  };

  // Suppression d'un agent
  const handleSupprimer = (id) => {
    setAgentASupprimer(id);
    setConfirmationVisible(true);
    setMenuOuvert(null);
  };

  const confirmerSuppression = () => {
    setAgents(agents.filter((a) => a.id !== agentASupprimer));
    setConfirmationVisible(false);
  };

  const annulerSuppression = () => {
    setConfirmationVisible(false);
  };

  // Filtrage des agents
  const agentsFiltres = agents.filter((a) =>
    `${a.nom} ${a.prenom}`.toLowerCase().includes(recherche.toLowerCase())
  );

  // Gestion de la pagination
  const indexDébut = page * rowsPerPage;
  const indexFin = indexDébut + rowsPerPage;
  const agentsAffiches = agentsFiltres.slice(indexDébut, indexFin);

  const handlePageChange = (nouvellePage) => {
    if (nouvellePage >= 0 && nouvellePage < Math.ceil(agentsFiltres.length / rowsPerPage)) {
      setPage(nouvellePage);
    }
  };

  // Ajouter un nouvel agent
  const ajouterAgent = (nouvelAgent) => {
    setAgents([...agents, nouvelAgent]);
    setAfficherFormulaire(false);
  };

  // Voir les détails de l'agent
  const voirDetails = (agent) => {
    setAgentDetail(agent);
  };

  const fermerDetails = () => {
    setAgentDetail(null);
  };

  return (
    <div className="h-[100vh] pt-[50px] bg-white">
      <h1 className="py-4 text-3xl font-semibold">Gestion Des Agents</h1>
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
            <FaFileImport className="mr-2" /> Importer
          </button>
          <button onClick={() => setAfficherFormulaire(true)} className="bg-custom-red text-white px-4 py-2 rounded-lg flex items-center">
            <FaPlus className="mr-2" /> Ajouter
          </button>
        </div>
      </div>

      {/* Formulaire Ajout d'agent */}
      {afficherFormulaire && (
        <AjoutAgent ajouterAgent={ajouterAgent} onClose={() => setAfficherFormulaire(false)} />
      )}

      {/* Tableau des agents */}
      <div className="overflow-x-auto h-1/2 mt-4">
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-3">Nom</th>
              <th className="border p-3">Prénom</th>
              <th className="border p-3">Téléphone</th>
              <th className="border p-3">Email</th>
              <th className="border p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {agentsAffiches.map((a) => (
              <tr key={a.id} className="hover:bg-gray-50">
                <td className="border p-3">{a.nom}</td>
                <td className="border p-3">{a.prenom}</td>
                <td className="border p-3">{a.phone}</td>
                <td className="border p-3">{a.email}</td>
                <td className="border p-3 relative">
                  <button onClick={() => toggleMenu(a.id)}>
                    <FaEllipsisV />
                  </button>
                  {menuOuvert === a.id && (
                    <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-lg z-10">
                      <button
                        onClick={() => voirDetails(a)}
                        className="block px-4 py-2 text-sm hover:bg-gray-100 w-full text-left"
                      >
                        <FaEye className="inline mr-2" /> Voir détails
                      </button>
                      <button
                        onClick={() => handleSupprimer(a.id)}
                        className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                      >
                        <FaTrash className="inline mr-2" /> Supprimer
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between mt-4">
        <button onClick={() => handlePageChange(page - 1)} disabled={page === 0}>
          Précédent
        </button>
        <span>Page {page + 1}</span>
        <button onClick={() => handlePageChange(page + 1)}>
          Suivant
        </button>
      </div>
    </div>
  );
};

export default GestionAgent;