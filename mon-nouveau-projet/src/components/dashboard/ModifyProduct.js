import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './AjoutProd.css';

const ModifyProduct = () => {
  const { id } = useParams(); // Get the product ID from the URL
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    productImage: null,
    barcodeSymbology: 'Code 128',
    codeProduct: '',
    category: '',
    brand: '',
    orderTax: 0,
    taxType: 'Exclusive',
    description: '',
    type: 'Standard Product',
    productCost: '',
    productPrice: '',
    productUnit: '',
    saleUnit: '',
    purchaseUnit: '',
    stockAlert: 0,
    forSale: false,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [units, setUnits] = useState([]);

  // Fetch product details, categories, brands, and units on component mount
  useEffect(() => {
    fetchProductDetails();
    fetchCategories();
    fetchBrands();
    fetchUnits();
  }, []);

  const fetchProductDetails = async () => {
    try {
      const response = await fetch(`http://localhost:8080/products/${id}`);
      if (response.ok) {
        const data = await response.json();
        setFormData(data); // Pre-fill the form with product data
      } else {
        console.error('Failed to fetch product details');
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:8080/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      } else {
        console.error('Failed to fetch categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await fetch('http://localhost:8080/brands');
      if (response.ok) {
        const data = await response.json();
        setBrands(data);
      } else {
        console.error('Failed to fetch brands');
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
    }
  };

  const fetchUnits = async () => {
    try {
      const response = await fetch('http://localhost:8080/units');
      if (response.ok) {
        const data = await response.json();
        setUnits(data);
      } else {
        console.error('Failed to fetch units');
      }
    } catch (error) {
      console.error('Error fetching units:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, productImage: file });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const formDataToSend = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === "productImage" && formData[key]) {
        formDataToSend.append(key, formData[key]);
      } else {
        formDataToSend.append(key, formData[key]);
      }
    });

    try {
      const response = await fetch(`http://localhost:8080/products/${id}`, {
        method: 'PUT',
        body: formDataToSend,
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Product updated successfully!' });
        navigate('/products'); // Redirect to the product list
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: `Failed to update product: ${data.error || 'Unknown error'}` });
      }
    } catch (error) {
      setMessage({ type: 'error', text: `Error updating product: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ajout-prod-container">
      <h1>Modify Product</h1>
      
      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="form-container">
        <label>Name *</label>
        <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Enter Name Product" className="input-field" />

        <label>Product Image</label>
        <input type="file" name="productImage" onChange={handleFileChange} className="input-field" />

        <label>Barcode Symbology *</label>
        <select name="barcodeSymbology" value={formData.barcodeSymbology} onChange={handleChange} className="input-field">
          <option value="Code 128">Code 128</option>
        </select>

        <label>Code Product *</label>
        <input type="text" name="codeProduct" value={formData.codeProduct} onChange={handleChange} required placeholder="Scan your barcode" className="input-field" />

        <label>Category *</label>
        <select name="category" value={formData.category} onChange={handleChange} required className="input-field">
          <option value="">Choose Category</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>{category.categoryName}</option>
          ))}
        </select>

        <label>Brand</label>
        <select name="brand" value={formData.brand} onChange={handleChange} className="input-field">
          <option value="">Choose Brand</option>
          {brands.map(brand => (
            <option key={brand.id} value={brand.id}>{brand.name}</option>
          ))}
        </select>

        <label>Order Tax</label>
        <input type="number" name="orderTax" value={formData.orderTax} onChange={handleChange} className="input-field" />%

        <label>Tax Type *</label>
        <select name="taxType" value={formData.taxType} onChange={handleChange} className="input-field">
          <option value="Exclusive">Exclusive</option>
        </select>

        <label>Description</label>
        <textarea name="description" value={formData.description} onChange={handleChange} placeholder="A few words ..." className="input-field"></textarea>

        <label>Type *</label>
        <select name="type" value={formData.type} onChange={handleChange} className="input-field">
          <option value="Standard Product">Standard Product</option>
        </select>

        <label>Product Cost *</label>
        <input type="number" name="productCost" value={formData.productCost} onChange={handleChange} required placeholder="Enter Product Cost" className="input-field" />

        <label>Product Price *</label>
        <input type="number" name="productPrice" value={formData.productPrice} onChange={handleChange} required placeholder="Enter Product Price" className="input-field" />

        <label>Product Unit *</label>
        <select name="productUnit" value={formData.productUnit} onChange={handleChange} required className="input-field">
          <option value="">Choose Product Unit</option>
          {units.map(unit => (
            <option key={unit.id} value={unit.id}>{unit.name}</option>
          ))}
        </select>

        <label>Sale Unit *</label>
        <select name="saleUnit" value={formData.saleUnit} onChange={handleChange} required className="input-field">
          <option value="">Choose Sale Unit</option>
          {units.map(unit => (
            <option key={unit.id} value={unit.id}>{unit.name}</option>
          ))}
        </select>

        <label>Purchase Unit *</label>
        <select name="purchaseUnit" value={formData.purchaseUnit} onChange={handleChange} required className="input-field">
          <option value="">Choose Purchase Unit</option>
          {units.map(unit => (
            <option key={unit.id} value={unit.id}>{unit.name}</option>
          ))}
        </select>

        <label>Stock Alert</label>
        <input type="number" name="stockAlert" value={formData.stockAlert} onChange={handleChange} className="input-field" />

        <label className="checkbox-container">
          <input type="checkbox" name="forSale" checked={formData.forSale} onChange={handleChange} /> For Sale
        </label>

        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? 'Updating...' : 'Update'}
        </button>
      </form>
    </div>
  );
};

export default ModifyProduct;