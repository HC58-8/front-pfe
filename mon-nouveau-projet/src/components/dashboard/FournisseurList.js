import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as pdfjsLib from 'pdfjs-dist';
import './FournisseurList.css';

const FournisseurList = () => {
  const [fournisseurs, setFournisseurs] = useState([]);
  const [filteredFournisseurs, setFilteredFournisseurs] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showOptions, setShowOptions] = useState({});
  const [message, setMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Fetch fournisseurs from the backend
  useEffect(() => {
    fetchFournisseurs();
  }, []);

  const fetchFournisseurs = async () => {
    try {
      const response = await fetch('http://localhost:8081/suppliers');
      if (!response.ok) {
        throw new Error('Failed to fetch fournisseurs');
      }
      const data = await response.json();
      setFournisseurs(data);
      setFilteredFournisseurs(data); // Initialize filtered fournisseurs with all data
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleOptions = (fournisseurId) => {
    setShowOptions((prev) => ({
      ...prev,
      [fournisseurId]: !prev[fournisseurId],
    }));
  };

  const handleDelete = async (fournisseurId) => {
    try {
      const response = await fetch(`http://localhost:8081/suppliers/${fournisseurId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete fournisseur');
      }

      setFournisseurs((prev) => prev.filter((f) => f.id !== fournisseurId));
      setFilteredFournisseurs((prev) => prev.filter((f) => f.id !== fournisseurId));
      alert('Fournisseur deleted successfully!');
    } catch (error) {
      alert(`Error deleting fournisseur: ${error.message}`);
    }
  };

  const handleModify = (fournisseurId) => {
    navigate(`/updatefournisseur/${fournisseurId}`);
  };

  const handleAddFournisseur = () => {
    navigate('/ajoutfournisseur');
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  const parsePDF = async (file) => {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onload = async (e) => {
        const data = new Uint8Array(e.target.result);
        const pdf = await pdfjsLib.getDocument(data).promise;
        let text = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map((item) => item.str).join(' ');
        }
        resolve(text);
      };
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  };

  const handleImport = async () => {
    if (!file) {
      setMessage({ type: 'error', text: 'Please select a file.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      let fournisseurs = [];

      if (file.name.endsWith('.xlsx')) {
        const reader = new FileReader();
        const data = await new Promise((resolve, reject) => {
          reader.onload = (e) => resolve(new Uint8Array(e.target.result));
          reader.onerror = (error) => reject(error);
          reader.readAsArrayBuffer(file);
        });

        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);

        fournisseurs = json.map((row) => ({
          name: row['Name'],
          code: row['Code'],
          phone: row['Phone'],
          email: row['Email'],
          address: row['Address'],
        }));
      } else if (file.name.endsWith('.pdf')) {
        const text = await parsePDF(file);
        const lines = text.split('\n');
        fournisseurs = lines.map((line) => {
          const [name, code, phone, email, address] = line.split(',');
          return {
            name,
            code,
            phone,
            email,
            address
          };
        });
      } else {
        setMessage({ type: 'error', text: 'Unsupported file format.' });
        return;
      }

      const response = await fetch('http://localhost:8081/suppliers/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fournisseurs),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to import fournisseurs');
      }

      setMessage({ type: 'success', text: 'Fournisseurs imported successfully!' });
      const updatedResponse = await fetch('http://localhost:8081/suppliers');
      const updatedData = await updatedResponse.json();
      setFournisseurs(updatedData);
      setFilteredFournisseurs(updatedData);
    } catch (error) {
      setMessage({ type: 'error', text: `Error importing fournisseurs: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = fournisseurs.filter((fournisseur) => {
      const name = fournisseur.name || '';
      return name.toLowerCase().includes(query);
    });

    setFilteredFournisseurs(filtered);
  };

  const exportToExcel = () => {
    const exportData = filteredFournisseurs.map((fournisseur) => ({
      Name: fournisseur.name,
      Code: fournisseur.code,
      Phone: fournisseur.phone,
      Email: fournisseur.email,
      Address: fournisseur.address,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Fournisseurs');
    XLSX.writeFile(workbook, 'fournisseur_list.xlsx');
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Fournisseur List', 14, 22);

    const tableColumn = ['Name', 'Code', 'Phone', 'Email', 'Address'];
    const tableRows = filteredFournisseurs.map((fournisseur) => [
      fournisseur.name,
      fournisseur.code,
      fournisseur.phone,
      fournisseur.email,
      fournisseur.address,
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 3,
        overflow: 'linebreak',
      },
      headStyles: {
        fillColor: [66, 66, 66],
      },
    });

    doc.save('fournisseur_list.pdf');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="fournisseur-list-container">
      <h1>Fournisseur List</h1>
      <div className="action-buttons">
        <button className="add-fournisseur-button" onClick={handleAddFournisseur}>
          Add Fournisseur
        </button>
        <button className="export-button excel" onClick={exportToExcel}>
          Export XL
        </button>
       
      </div>
      <div className="search-filter-section">
        <input
          type="text"
          placeholder="Search fournisseurs..."
          value={searchQuery}
          onChange={handleSearch}
          className="search-bar"
        />
      </div>
      <div className="import-section">
        <input type="file" accept=".xlsx,.pdf" onChange={handleFileChange} />
        <button onClick={handleImport} disabled={loading}>
          {loading ? 'Importing...' : 'Import Fournisseurs'}
        </button>
      </div>
      {message && <div className={`message ${message.type}`}>{message.text}</div>}
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Code</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Address</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredFournisseurs.map((fournisseur) => (
            <tr key={fournisseur.id}>
              <td>{fournisseur.name}</td>
              <td>{fournisseur.code}</td>
              <td>{fournisseur.phone}</td>
              <td>{fournisseur.email}</td>
              <td>{fournisseur.address}</td>
              <td>
                <span className="ellipsis" onClick={() => toggleOptions(fournisseur.id)}>
                  ...
                </span>
                {showOptions[fournisseur.id] && (
                  <div className="options">
                    <button onClick={() => handleDelete(fournisseur.id)}>Delete</button>
                    <button onClick={() => handleModify(fournisseur.id)}>Modify</button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FournisseurList;