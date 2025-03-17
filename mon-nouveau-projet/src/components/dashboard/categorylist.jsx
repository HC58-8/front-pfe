import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './CategoryList.css';

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showOptions, setShowOptions] = useState({});
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:8080/categories');
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const toggleOptions = (categoryId) => {
    setShowOptions((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const handleDelete = async (categoryId) => {
    try {
      const response = await fetch(`http://localhost:8080/categories/${categoryId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete category');
      }

      // Remove the deleted category from the state
      setCategories((prevCategories) =>
        prevCategories.filter((category) => category.id !== categoryId)
      );
      alert('Category deleted successfully!');
    } catch (error) {
      alert(`Error deleting category: ${error.message}`);
    }
  };

  const handleAddCategory = () => {
    navigate('/categories/add'); // Redirect to the Add Category page
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="category-list-container">
      <h1>Category List</h1>
      <button className="add-category-button" onClick={handleAddCategory}>
        Add Category
      </button>
      <table>
        <thead>
          <tr>
            <th>Category Code</th>
            <th>Category Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category.id}>
              <td>{category.categoryCode}</td>
              <td>{category.categoryName}</td>
              <td>
                <span className="ellipsis" onClick={() => toggleOptions(category.id)}>
                  ...
                </span>
                {showOptions[category.id] && (
                  <div className="options">
                    <button onClick={() => handleDelete(category.id)}>Delete</button>
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

export default CategoryList;