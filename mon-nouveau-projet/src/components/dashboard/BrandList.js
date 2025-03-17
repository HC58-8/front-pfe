import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './BrandList.css';

const BrandList = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showOptions, setShowOptions] = useState({});
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch('http://localhost:8080/brands');
        if (!response.ok) {
          throw new Error('Failed to fetch brands');
        }
        const data = await response.json();
        setBrands(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  const toggleOptions = (brandId) => {
    setShowOptions((prev) => ({
      ...prev,
      [brandId]: !prev[brandId],
    }));
  };

  const handleDelete = async (brandId) => {
    try {
      const response = await fetch(`http://localhost:8080/brands/${brandId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete brand');
      }

      // Remove the deleted brand from the state
      setBrands((prevBrands) => prevBrands.filter((brand) => brand.id !== brandId));
      alert('Brand deleted successfully!');
    } catch (error) {
      alert(`Error deleting brand: ${error.message}`);
    }
  };

  const handleAddBrand = () => {
    navigate('/brands/add'); // Redirect to the Add Brand page
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="brand-list-container">
      <h1>Brand List</h1>
      <button className="add-brand-button" onClick={handleAddBrand}>
        Add Brand
      </button>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {brands.map((brand) => (
            <tr key={brand.id}>
              <td>{brand.name}</td>
              <td>{brand.description}</td>
              <td>
                <span className="ellipsis" onClick={() => toggleOptions(brand.id)}>
                  ...
                </span>
                {showOptions[brand.id] && (
                  <div className="options">
                    <button onClick={() => handleDelete(brand.id)}>Delete</button>
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

export default BrandList;