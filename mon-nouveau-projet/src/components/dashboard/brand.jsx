import React, { useState } from 'react';
import './BrandForm.css'; // You can reuse or create a new CSS file for styling

const BrandForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    picture: null,
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
    formDataToSend.append('name', formData.name);
    formDataToSend.append('description', formData.description);
    if (formData.picture) {
      formDataToSend.append('picture', formData.picture);
    }

    try {
      // Replace this URL with your backend endpoint for adding/updating brands
      const response = await fetch('http://localhost:8080/brands', {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: `Brand added successfully! ID: ${data.id}` });
        // Reset form
        setFormData({
          name: '',
          description: '',
          picture: null,
        });
        // Reset file input
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';
      } else {
        setMessage({ type: 'error', text: `Failed to add brand: ${data.error || 'Unknown error'}` });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: `Error submitting form: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="brand-form-container">
      <h1>Add New Brand</h1>

      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="form-container">
        <label>Name *</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="Enter Brand Name"
          className="input-field"
        />

        <label>Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter Brand Description"
          className="input-field"
        />

        <label>Brand Picture</label>
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

export default BrandForm;