import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as pdfjsLib from 'pdfjs-dist';
import './ProductList.css';

const ProduitList = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showOptions, setShowOptions] = useState({});
  const [message, setMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchBrands();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:8080/products');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      setProducts(data);
      setFilteredProducts(data); // Initialize filtered products with all products
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
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

  const toggleOptions = (productId) => {
    setShowOptions((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  const handleDelete = async (productId) => {
    try {
      const response = await fetch(`http://localhost:8080/products/${productId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      setProducts((prevProducts) => prevProducts.filter((product) => product.id !== productId));
      setFilteredProducts((prevProducts) => prevProducts.filter((product) => product.id !== productId));
      alert('Product deleted successfully!');
    } catch (error) {
      alert(`Error deleting product: ${error.message}`);
    }
  };

  const handleModify = (productId) => {
    navigate(`/updateprod/${productId}`);
  };

  const handleAddProduct = () => {
    navigate('/');
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
      let products = [];

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

        products = json.map((row) => ({
          name: row['Name'],
          barcodeSymbology: row['Barcode Symbology'],
          codeProduct: row['Code Product'],
          category: row['Category'],
          brand: row['Brand'],
          orderTax: row['Order Tax'],
          taxType: row['Tax Type'],
          description: row['Description'],
          type: row['Type'],
          productCost: row['Product Cost'],
          productPrice: row['Product Price'],
          productUnit: row['Product Unit'],
          saleUnit: row['Sale Unit'],
          purchaseUnit: row['Purchase Unit'],
          stockAlert: row['Stock Alert'],
          forSale: row['For Sale'] === 'Yes',
        }));
      } else if (file.name.endsWith('.pdf')) {
        const text = await parsePDF(file);
        const lines = text.split('\n');
        products = lines.map((line) => {
          const [
            name,
            barcodeSymbology,
            codeProduct,
            category,
            brand,
            orderTax,
            taxType,
            description,
            type,
            productCost,
            productPrice,
            productUnit,
            saleUnit,
            purchaseUnit,
            stockAlert,
            forSale,
          ] = line.split(',');

          return {
            name,
            barcodeSymbology,
            codeProduct,
            category,
            brand,
            orderTax: parseFloat(orderTax),
            taxType,
            description,
            type,
            productCost: parseFloat(productCost),
            productPrice: parseFloat(productPrice),
            productUnit,
            saleUnit,
            purchaseUnit,
            stockAlert: parseInt(stockAlert),
            forSale: forSale.trim() === 'Yes',
          };
        });
      } else {
        setMessage({ type: 'error', text: 'Unsupported file format.' });
        return;
      }

      const response = await fetch('http://localhost:8080/products/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(products),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to import products');
      }

      setMessage({ type: 'success', text: 'Products imported successfully!' });
      const updatedResponse = await fetch('http://localhost:8080/products');
      const updatedData = await updatedResponse.json();
      setProducts(updatedData);
      setFilteredProducts(updatedData);
    } catch (error) {
      setMessage({ type: 'error', text: `Error importing products: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = products.filter((product) => {
      const name = product.name || ''; // Fallback to empty string if null/undefined
      const category = product.category || ''; // Fallback to empty string if null/undefined
      const brand = product.brand || ''; // Fallback to empty string if null/undefined

      return (
        name.toLowerCase().includes(query) ||
        category.toLowerCase().includes(query) ||
        brand.toLowerCase().includes(query)
      );
    });

    setFilteredProducts(filtered);
  };

  const handleFilter = () => {
    setShowFilterPopup(!showFilterPopup);
  };

  const applyFilters = () => {
    let filtered = products;

    if (selectedCategories.length > 0) {
      filtered = filtered.filter((product) =>
        selectedCategories.includes(product.category)
      );
    }

    if (selectedBrands.length > 0) {
      filtered = filtered.filter((product) =>
        selectedBrands.includes(product.brand)
      );
    }

    setFilteredProducts(filtered);
    setShowFilterPopup(false);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleBrandChange = (brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand)
        ? prev.filter((b) => b !== brand)
        : [...prev, brand]
    );
  };

  const resetFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setFilteredProducts(products);
    setShowFilterPopup(false);
  };

  const exportToExcel = () => {
    const exportData = filteredProducts.map((product) => ({
      Name: product.name,
      'Barcode Symbology': product.barcodeSymbology,
      'Code Product': product.codeProduct,
      Category: product.category,
      Brand: product.brand,
      'Order Tax': product.orderTax,
      'Tax Type': product.taxType,
      Description: product.description,
      Type: product.type,
      'Product Cost': product.productCost,
      'Product Price': product.productPrice,
      'Product Unit': product.productUnit,
      'Sale Unit': product.saleUnit,
      'Purchase Unit': product.purchaseUnit,
      'Stock Alert': product.stockAlert,
      'For Sale': product.forSale ? 'Yes' : 'No',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
    XLSX.writeFile(workbook, 'product_list.xlsx');
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Product List', 14, 22);

    const tableColumn = [
      'Name',
      'Barcode Symbology',
      'Code Product',
      'Category',
      'Brand',
      'Order Tax',
      'Tax Type',
      'Description',
      'Type',
      'Product Cost',
      'Product Price',
      'Product Unit',
      'Sale Unit',
      'Purchase Unit',
      'Stock Alert',
      'For Sale',
    ];

    const tableRows = filteredProducts.map((product) => [
      product.name,
      product.barcodeSymbology,
      product.codeProduct,
      product.category,
      product.brand,
      product.orderTax,
      product.taxType,
      product.description,
      product.type,
      product.productCost,
      product.productPrice,
      product.productUnit,
      product.saleUnit,
      product.purchaseUnit,
      product.stockAlert,
      product.forSale ? 'Yes' : 'No',
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

    doc.save('product_list.pdf');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="product-list-container">
      <h1>Product List</h1>
      <div className="action-buttons">
        <button className="add-product-button" onClick={handleAddProduct}>
          Add Product
        </button>
        <button className="export-button excel" onClick={exportToExcel}>
          Export XL
        </button>
        <button className="export-button pdf" onClick={exportToPDF}>
          Export PDF
        </button>
      </div>
      <div className="search-filter-section">
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={handleSearch}
          className="search-bar"
        />
        <button className="filter-button" onClick={handleFilter}>
          Filter
        </button>
      </div>
      {showFilterPopup && (
        <div className="filter-popup">
          <h3>Filter Products</h3>
          <div className="filter-options">
            <div>
              <h4>Categories</h4>
              {categories.map((category) => (
                <label key={category.id}>
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category.categoryName)}
                    onChange={() => handleCategoryChange(category.categoryName)}
                  />
                  {category.categoryName}
                </label>
              ))}
            </div>
            <div>
              <h4>Brands</h4>
              {brands.map((brand) => (
                <label key={brand.id}>
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(brand.name)}
                    onChange={() => handleBrandChange(brand.name)}
                  />
                  {brand.name}
                </label>
              ))}
            </div>
          </div>
          <div className="filter-buttons">
            <button onClick={applyFilters}>Apply Filters</button>
            <button onClick={resetFilters}>Reset Filters</button>
          </div>
        </div>
      )}
      <div className="import-section">
        <input type="file" accept=".xlsx,.pdf" onChange={handleFileChange} />
        <button onClick={handleImport} disabled={loading}>
          {loading ? 'Importing...' : 'Import Products'}
        </button>
      </div>
      {message && <div className={`message ${message.type}`}>{message.text}</div>}
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Barcode Symbology</th>
            <th>Code Product</th>
            <th>Category</th>
            <th>Brand</th>
            <th>Order Tax</th>
            <th>Tax Type</th>
            <th>Description</th>
            <th>Type</th>
            <th>Product Cost</th>
            <th>Product Price</th>
            <th>Product Unit</th>
            <th>Sale Unit</th>
            <th>Purchase Unit</th>
            <th>Stock Alert</th>
            <th>Stock</th>
            <th>For Sale</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map((product) => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>{product.barcodeSymbology}</td>
              <td>{product.codeProduct}</td>
              <td>{product.category}</td>
              <td>{product.brand}</td>
              <td>{product.orderTax}</td>
              <td>{product.taxType}</td>
              <td>{product.description}</td>
              <td>{product.type}</td>
              <td>{product.productCost}</td>
              <td>{product.productPrice}</td>
              <td>{product.productUnit}</td>
              <td>{product.saleUnit}</td>
              <td>{product.purchaseUnit}</td>
              <td>{product.stockAlert}</td>
              <td>{product.stock}</td> 
              <td>{product.forSale ? 'Yes' : 'No'}</td>
              <td>
                <span className="ellipsis" onClick={() => toggleOptions(product.id)}>
                  ...
                </span>
                {showOptions[product.id] && (
                  <div className="options">
                    <button onClick={() => handleDelete(product.id)}>Delete</button>
                    <button onClick={() => handleModify(product.id)}>Modify</button>
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

export default ProduitList ;