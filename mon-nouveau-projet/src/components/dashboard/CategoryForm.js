import React, { useState } from 'react';

const CategoryForm = () => {
  const [formData, setFormData] = useState({
    categoryCode: '',
    categoryName: '',
    picture: null, // Optional file upload
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, picture: file });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const formDataToSend = new FormData();
    formDataToSend.append('categoryCode', formData.categoryCode);
    formDataToSend.append('categoryName', formData.categoryName);
    if (formData.picture) {
      formDataToSend.append('picture', formData.picture);
    }

    try {
      // Replace this URL with your backend endpoint for adding/updating categories
      const response = await fetch('http://localhost:8080/categories', {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: `Category added successfully! ID: ${data.id}` });
        // Reset form
        setFormData({
          categoryCode: '',
          categoryName: '',
          picture: null,
        });
        // Reset file input
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';
      } else {
        setMessage({ type: 'error', text: `Failed to add category: ${data.error || 'Unknown error'}` });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: `Error submitting form: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="category-form-container">
      <h1>Add New Category</h1>

      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="form-container">
        <label>Category Code *</label>
        <input
          type="text"
          name="categoryCode"
          value={formData.categoryCode}
          onChange={handleChange}
          required
          placeholder="Enter Category Code"
          className="input-field"
        />

        <label>Category Name *</label>
        <input
          type="text"
          name="categoryName"
          value={formData.categoryName}
          onChange={handleChange}
          required
          placeholder="Enter Category Name"
          className="input-field"
        />

        <label>Category Picture (Optional)</label>
        <input
          type="file"
          name="picture"
          onChange={handleFileChange}
          className="input-field"
        />

        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  );
};

export default CategoryForm;