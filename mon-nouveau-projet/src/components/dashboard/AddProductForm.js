import React, { useState } from 'react';
import './AjoutProd.css';
import { getDatabase, ref, set } from 'firebase/database';
import { db } from '../../firebaseConfig';
const AjoutProd = () => {
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
    stock: 0,
    forSale: false,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

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
      if (key === 'productImage' && formData[key]) {
        formDataToSend.append(key, formData[key]);
      } else if (
        key === 'orderTax' ||
        key === 'productCost' ||
        key === 'productPrice' ||
        key === 'stockAlert' ||
        key === 'stock'
      ) {
        formDataToSend.append(key, parseFloat(formData[key]));
      } else {
        formDataToSend.append(key, formData[key]);
      }
    });

    try {
      const response = await fetch('http://localhost:8081/products', {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: `Product added successfully! ID: ${data.id}` });
        setFormData({
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
          stock: 0,
          forSale: false,
        });
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';
      } else {
        setMessage({ type: 'error', text: `Failed to add product: ${data.error || 'Unknown error'}` });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: `Error submitting form: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleScanBarcode = () => {
    const scanRequestRef = ref(db, 'scanRequests/'); // Adjust path as needed
    set(scanRequestRef, { request: true }); // Send request to mobile app
  };

  const handleBarcodeReceived = (barcode) => {
    setFormData({ ...formData, codeProduct: barcode });
  };

  return (
    <div className="ajout-prod-container">
      <h1>Add New Product</h1>

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
        <div style={{display: 'flex', alignItems:'center'}}>
          <input type="text" name="codeProduct" value={formData.codeProduct} onChange={handleChange} required placeholder="Scan your barcode" className="input-field" />
          <button type="button" onClick={handleScanBarcode}>Scan Barcode</button>
        </div>

        <label>Category *</label>
        <select name="category" value={formData.category} onChange={handleChange} required className="input-field">
          <option value="">Choose Category</option>
          <option value="cat1">cat1</option>
        </select>

        <label>Brand</label>
        <select name="brand" value={formData.brand} onChange={handleChange} className="input-field">
          <option value="">Choose Brand</option>
          <option value="mercedes">Mercedes</option>
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
          <option value="unit1">Unit1</option>
        </select>

        <label>Sale Unit *</label>
        <select name="saleUnit" value={formData.saleUnit} onChange={handleChange} required className="input-field">
          <option value="">Choose Sale Unit</option>
          <option value="sale2">Sale2</option>
        </select>

        <label>Purchase Unit *</label>
        <select name="purchaseUnit" value={formData.purchaseUnit} onChange={handleChange} required className="input-field">
          <option value="">Choose Purchase Unit</option>
          <option value="purchase1">Purchase1</option>
        </select>

        <label>Stock Alert</label>
        <input type="number" name="stockAlert" value={formData.stockAlert} onChange={handleChange} className="input-field" />

        <label>Stock *</label>
        <input type="number" name="stock" value={formData.stock} onChange={handleChange} required placeholder="Enter Stock Quantity" className="input-field" />

        <label className="checkbox-container">
          <input type="checkbox" name="forSale" checked={formData.forSale} onChange={handleChange} /> For Sale
        </label>

        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  );
};

export default AjoutProd;