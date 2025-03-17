import React, { useState } from 'react';

const UnitForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    shortName: '',
    baseUnit: 'meter', // Default base unit
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
    formDataToSend.append('name', formData.name);
    formDataToSend.append('shortName', formData.shortName);
    formDataToSend.append('baseUnit', formData.baseUnit);
    if (formData.picture) {
      formDataToSend.append('picture', formData.picture);
    }

    try {
      // Replace this URL with your backend endpoint for adding/updating units
      const response = await fetch('http://localhost:8080/units', {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: `Unit added successfully! ID: ${data.id}` });
        // Reset form
        setFormData({
          name: '',
          shortName: '',
          baseUnit: 'meter',
          picture: null,
        });
        // Reset file input
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';
      } else {
        setMessage({ type: 'error', text: `Failed to add unit: ${data.error || 'Unknown error'}` });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: `Error submitting form: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="unit-form-container">
      <h1>Add New Unit</h1>

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
          placeholder="Enter Unit Name"
          className="input-field"
        />

        <label>Short Name *</label>
        <input
          type="text"
          name="shortName"
          value={formData.shortName}
          onChange={handleChange}
          required
          placeholder="Enter Short Name"
          className="input-field"
        />

        <label>Base Unit *</label>
        <select
          name="baseUnit"
          value={formData.baseUnit}
          onChange={handleChange}
          required
          className="input-field"
        >
          <option value="meter">Meter</option>
          <option value="kilogram">Kilogram</option>
          <option value="second">Second</option>
          <option value="ampere">Ampere</option>
          <option value="kelvin">Kelvin</option>
          <option value="mole">Mole</option>
          <option value="candela">Candela</option>
        </select>

        <label>Unit Picture (Optional)</label>
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

export default UnitForm;