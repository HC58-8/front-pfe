import React, { useState } from 'react';
import './AjoutFournisseur.css';

const AjoutFournisseur = () => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    phone: '',
    email: '',
    address: '',
    productName: '',
    singleProductPrice: 0,
    numberOfProducts: 0,
  });

  const [loading, setLoading] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [ocrResult, setOcrResult] = useState(null);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? parseFloat(value) : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('http://localhost:8081/suppliers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: `Supplier added successfully! ID: ${data.id}` });
        // Reset form
        setFormData({
          name: '',
          code: '',
          phone: '',
          email: '',
          address: '',
          productName: '',
          singleProductPrice: 0,
          numberOfProducts: 0,
        });
        setOcrResult(null);
      } else {
        setMessage({ type: 'error', text: `Failed to add supplier: ${data.error || 'Unknown error'}` });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: `Error submitting form: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleOCRScan = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setOcrLoading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('apikey', 'K89058083588957');
    formData.append('language', 'eng');
    formData.append('isOverlayRequired', 'false');
    formData.append('detectOrientation', 'true');
    formData.append('scale', 'true');
    formData.append('OCREngine', '2');

    try {
      const response = await fetch('https://api.ocr.space/parse/image', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.IsErroredOnProcessing === false && result.ParsedResults?.length > 0) {
        const extractedText = result.ParsedResults[0].ParsedText;
        console.log('Extracted text:', extractedText);
        
        // Process the extracted text to find relevant information
        const extractedData = processExtractedText(extractedText);
        setOcrResult(extractedText);
        
        // Update form data with extracted information
        setFormData(prevData => ({
          ...prevData,
          ...extractedData
        }));
        
        setMessage({ 
          type: 'success', 
          text: 'Data extracted from invoice successfully! Please verify all fields before submitting.' 
        });
      } else {
        setMessage({ 
          type: 'error', 
          text: `OCR processing failed: ${result.ErrorMessage || 'Could not extract text from image'}` 
        });
      }
    } catch (error) {
      console.error('OCR Error:', error);
      setMessage({ type: 'error', text: `Error processing image: ${error.message}` });
    } finally {
      setOcrLoading(false);
    }
  };

  // Function to extract structured data from OCR text
 // Function to extract structured data from OCR text
const processExtractedText = (text) => {
    const extractedData = {};
    
    // Normalize the text for easier processing
    const normalizedText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const lines = normalizedText.split('\n').map(line => line.trim()).filter(line => line);
    
    // Extract supplier name (looking for more variations and patterns)
    // Try multiple approaches to find the name
    let nameMatch = text.match(/(?:Company|Supplier|Vendor|Business|From)(?:\s+Name)?[:\s]+([A-Za-z0-9\s&.,]+)(?:\n|$)/i);
    if (!nameMatch || !nameMatch[1]) {
      // Look for a name that might be at the top of the invoice (first few lines)
      for (let i = 0; i < Math.min(5, lines.length); i++) {
        if (lines[i].length > 3 && 
            !lines[i].match(/invoice|receipt|bill|statement|quotation|estimate|order/i) &&
            !lines[i].match(/date|number|id|ref/i)) {
          extractedData.name = lines[i].trim();
          break;
        }
      }
    } else {
      extractedData.name = nameMatch[1].trim();
    }
    
    // Extract email with broader pattern matching
    const emailMatches = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
    if (emailMatches && emailMatches.length > 0) {
      extractedData.email = emailMatches[0].trim();
    }
    
    // Extract phone number (various formats) with broader pattern matching
    const phoneRegex = /(?:Phone|Tel|Telephone|Contact|Mobile|Cell|Ph)[:\s]+([0-9+\s()\-\.]{8,20})/i;
    const phoneMatch = text.match(phoneRegex);
    if (phoneMatch && phoneMatch[1]) {
      extractedData.phone = phoneMatch[1].trim();
    } else {
      // Try to find any sequence that looks like a phone number
      const genericPhoneMatch = text.match(/(?:\+?[0-9]{1,3}[-.\s]?)?(?:\(?[0-9]{3}\)?[-.\s]?)?[0-9]{3}[-.\s]?[0-9]{4}/);
      if (genericPhoneMatch) {
        extractedData.phone = genericPhoneMatch[0].trim();
      }
    }
    
    // Extract address (more comprehensive approach)
    const addressRegex = /(?:Address|Location|Place|Street|Ave|Road|Rd)[:\s]+([A-Za-z0-9\s.,#\-]+)(?:\n|$)/i;
    const addressMatch = text.match(addressRegex);
    if (addressMatch && addressMatch[1]) {
      extractedData.address = addressMatch[1].trim();
    } else {
      // Look for patterns that might indicate an address
      const potentialAddressLines = [];
      let addressFound = false;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.match(/\d+\s+[A-Za-z]+\s+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr)/i) ||
            line.match(/[A-Za-z]+,\s*[A-Za-z]+\s*\d{5}/i) ||
            line.match(/[A-Za-z]+\s+[A-Za-z]+,\s*[A-Za-z]{2}\s*\d{5}/i)) {
          addressFound = true;
          potentialAddressLines.push(line);
          // Check if the next line might be part of the address
          if (i + 1 < lines.length && 
              (lines[i+1].match(/[A-Za-z]+,\s*[A-Za-z]+/) || 
               lines[i+1].match(/[A-Za-z]+\s+\d{5}/))) {
            potentialAddressLines.push(lines[i+1]);
            i++;
          }
          break;
        }
      }
      
      if (addressFound) {
        extractedData.address = potentialAddressLines.join(', ').trim();
      }
    }
    
    // Extract supplier code/ID
    const codeRegex = /(?:Supplier\s+ID|Vendor\s+Code|Supplier\s+Code|ID|Reference|Ref|Account)[:\s#]+([A-Za-z0-9\-]+)/i;
    const codeMatch = text.match(codeRegex);
    if (codeMatch && codeMatch[1]) {
      extractedData.code = codeMatch[1].trim();
    } else {
      // Look for something that might be a code near the top
      for (let i = 0; i < Math.min(10, lines.length); i++) {
        const codeLine = lines[i].match(/^(?:ID|No|#|Code)[:\s#]+([A-Za-z0-9\-]+)/i) || 
                        lines[i].match(/([A-Z]{2,}[0-9]{3,})/); // Common code format
        if (codeLine && codeLine[1]) {
          extractedData.code = codeLine[1].trim();
          break;
        }
      }
    }
    
    // Extract product info using multiple approaches
    let productMatch = text.match(/(?:Product|Item|Description|Service|Goods)[:\s]+([A-Za-z0-9\s.,#\-]+)(?:\n|$)/i);
    if (productMatch && productMatch[1]) {
      extractedData.productName = productMatch[1].trim();
    } else {
      // Look for product information in a tabular format
      const productTableRegex = /(?:Item|Description|Product)\s+(?:Qty|Quantity|Count)\s+(?:Price|Rate|Cost|Amount|Unit\s+Price)/i;
      const tableMatch = text.match(productTableRegex);
      if (tableMatch) {
        const tableStartIndex = text.indexOf(tableMatch[0]) + tableMatch[0].length;
        const tableSection = text.substring(tableStartIndex, tableStartIndex + 300); // Look at next 300 chars
        const tableLines = tableSection.split('\n');
        
        // First non-empty line after the header might contain product info
        for (let i = 0; i < tableLines.length; i++) {
          if (tableLines[i].trim().length > 3 && 
              !tableLines[i].match(/total|subtotal|tax|shipping/i)) {
            // Remove any numbers that might be quantity or price
            const product = tableLines[i].replace(/\d+\.?\d*\s*(?:x|\*)?/g, '').trim();
            if (product) {
              extractedData.productName = product;
              break;
            }
          }
        }
      }
    }
    
    // Extract price with broader pattern matching
    const priceMatches = text.match(/(?:Price|Cost|Amount|Rate|Unit[ -]Price|Each|Unit)[:\s]*[$€£]?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?)/ig);
    if (priceMatches && priceMatches.length > 0) {
      const priceText = priceMatches[0];
      const priceDigits = priceText.match(/(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?)/);
      if (priceDigits && priceDigits[1]) {
        extractedData.singleProductPrice = parseFloat(priceDigits[1].replace(/,/g, ''));
      }
    } else {
      // Look for price patterns in the text
      const genericPriceMatch = text.match(/[$€£]\s*(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?)/);
      if (genericPriceMatch && genericPriceMatch[1]) {
        extractedData.singleProductPrice = parseFloat(genericPriceMatch[1].replace(/,/g, ''));
      }
    }
    
    // Extract quantity with more patterns
    const qtyRegex = /(?:Quantity|Qty|Count|Number|Units|Pieces|Pcs)[:\s]*(\d+)/i;
    const quantityMatch = text.match(qtyRegex);
    if (quantityMatch && quantityMatch[1]) {
      extractedData.numberOfProducts = parseInt(quantityMatch[1]);
    } else {
      // Look for a number followed by units or product
      const qtyProductMatch = text.match(/(\d+)\s*(?:x|\*|pcs|units|pieces)\s/i);
      if (qtyProductMatch && qtyProductMatch[1]) {
        extractedData.numberOfProducts = parseInt(qtyProductMatch[1]);
      }
    }
    
    console.log("Extracted data:", extractedData);
    return extractedData;
  };
  return (
    <div className="ajout-fournisseur-container">
      <h1>Add New Supplier</h1>

      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}
      
      <div className="ocr-section">
        <h2>Upload Invoice for Automatic Data Extraction</h2>
        <p className="ocr-instruction">Upload an invoice image to automatically extract supplier and product information. You can verify and edit all data before submission.</p>
        
        <label htmlFor="ocr" className="ocr-label">
          {ocrLoading ? 'Processing...' : 'Upload invoice image'}
        </label>
        <input 
          type="file" 
          id="ocr" 
          name="ocr" 
          onChange={handleOCRScan} 
          accept="image/*,.pdf"
          disabled={ocrLoading}
          className="ocr-input"
        />
        {ocrLoading && <div className="ocr-loading">Processing image, please wait...</div>}
        
        {ocrResult && (
          <div className="ocr-result-preview">
            <h3>OCR Result</h3>
            <p className="ocr-hint">The system has attempted to extract information from your invoice and fill the form below. Please review and correct any fields as needed before submitting.</p>
            <div className="ocr-extracted-fields">
              <div className="ocr-field">
                <span className="ocr-field-label">Name:</span> 
                <span className="ocr-field-value">{formData.name || 'Not detected'}</span>
              </div>
              <div className="ocr-field">
                <span className="ocr-field-label">Code:</span> 
                <span className="ocr-field-value">{formData.code || 'Not detected'}</span>
              </div>
              <div className="ocr-field">
                <span className="ocr-field-label">Product:</span> 
                <span className="ocr-field-value">{formData.productName || 'Not detected'}</span>
              </div>
              <div className="ocr-field">
                <span className="ocr-field-label">Price:</span> 
                <span className="ocr-field-value">{formData.singleProductPrice > 0 ? formData.singleProductPrice : 'Not detected'}</span>
              </div>
              <div className="ocr-field">
                <span className="ocr-field-label">Quantity:</span> 
                <span className="ocr-field-value">{formData.numberOfProducts > 0 ? formData.numberOfProducts : 'Not detected'}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="form-container">
        <div className="form-group">
          <label htmlFor="name">Name *</label>
          <input 
            type="text" 
            id="name"
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
            required 
            placeholder="Enter Supplier Name" 
            className={`input-field ${ocrResult && formData.name ? 'ocr-filled' : ''}`} 
          />
        </div>

        <div className="form-group">
          <label htmlFor="code">Code *</label>
          <input 
            type="text" 
            id="code"
            name="code" 
            value={formData.code} 
            onChange={handleChange} 
            required 
            placeholder="Enter Supplier Code" 
            className={`input-field ${ocrResult && formData.code ? 'ocr-filled' : ''}`}
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone">Phone *</label>
          <input 
            type="text" 
            id="phone"
            name="phone" 
            value={formData.phone} 
            onChange={handleChange} 
            required 
            placeholder="Enter Supplier Phone" 
            className={`input-field ${ocrResult && formData.phone ? 'ocr-filled' : ''}`}
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input 
            type="email" 
            id="email"
            name="email" 
            value={formData.email} 
            onChange={handleChange} 
            required 
            placeholder="Enter Supplier Email" 
            className={`input-field ${ocrResult && formData.email ? 'ocr-filled' : ''}`}
          />
        </div>

        <div className="form-group">
          <label htmlFor="address">Address</label>
          <input 
            type="text" 
            id="address"
            name="address" 
            value={formData.address} 
            onChange={handleChange} 
            placeholder="Enter Supplier Address" 
            className={`input-field ${ocrResult && formData.address ? 'ocr-filled' : ''}`}
          />
        </div>

        <div className="form-group">
          <label htmlFor="productName">Product Name *</label>
          <input 
            type="text" 
            id="productName"
            name="productName" 
            value={formData.productName} 
            onChange={handleChange} 
            required 
            placeholder="Enter Product Name" 
            className={`input-field ${ocrResult && formData.productName ? 'ocr-filled' : ''}`}
          />
        </div>

        <div className="form-group">
          <label htmlFor="singleProductPrice">Single Product Price *</label>
          <input 
            type="number" 
            id="singleProductPrice"
            name="singleProductPrice" 
            value={formData.singleProductPrice} 
            onChange={handleChange} 
            required 
            placeholder="Enter Single Product Price" 
            className={`input-field ${ocrResult && formData.singleProductPrice > 0 ? 'ocr-filled' : ''}`}
          />
        </div>

        <div className="form-group">
          <label htmlFor="numberOfProducts">Number of Products (Stock) *</label>
          <input 
            type="number" 
            id="numberOfProducts"
            name="numberOfProducts" 
            value={formData.numberOfProducts} 
            onChange={handleChange} 
            required 
            placeholder="Enter Number of Products" 
            className={`input-field ${ocrResult && formData.numberOfProducts > 0 ? 'ocr-filled' : ''}`}
          />
        </div>

        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  );
};

export default AjoutFournisseur;