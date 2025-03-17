import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './UnitList.css';

const UnitList = () => {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showOptions, setShowOptions] = useState({});
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const response = await fetch('http://localhost:8080/units');
        if (!response.ok) {
          throw new Error('Failed to fetch units');
        }
        const data = await response.json();
        setUnits(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUnits();
  }, []);

  const toggleOptions = (unitId) => {
    setShowOptions((prev) => ({
      ...prev,
      [unitId]: !prev[unitId],
    }));
  };

  const handleDelete = async (unitId) => {
    try {
      const response = await fetch(`http://localhost:8080/units/${unitId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete unit');
      }

      // Remove the deleted unit from the state
      setUnits((prevUnits) => prevUnits.filter((unit) => unit.id !== unitId));
      alert('Unit deleted successfully!');
    } catch (error) {
      alert(`Error deleting unit: ${error.message}`);
    }
  };

  const handleAddUnit = () => {
    navigate('/units/add'); // Redirect to the Add Unit page
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="unit-list-container">
      <h1>Unit List</h1>
      <button className="add-unit-button" onClick={handleAddUnit}>
        Add Unit
      </button>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Short Name</th>
            <th>Base Unit</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {units.map((unit) => (
            <tr key={unit.id}>
              <td>{unit.name}</td>
              <td>{unit.shortName}</td>
              <td>{unit.baseUnit}</td>
              <td>
                <span className="ellipsis" onClick={() => toggleOptions(unit.id)}>
                  ...
                </span>
                {showOptions[unit.id] && (
                  <div className="options">
                    <button onClick={() => handleDelete(unit.id)}>Delete</button>
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

export default UnitList;