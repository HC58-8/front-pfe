import React, { useEffect, useState } from 'react';
import './RentPage.css';

const RentPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchBrands();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:8081/products');
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
      const response = await fetch('http://localhost:8081/categories');
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
      const response = await fetch('http://localhost:8081/brands');
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
  const handleRent = async (productId) => {
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
  const userId = user?.uid;
  const userName = user?.name || 'Unknown User'; // Assuming the user object has a `name` property

  if (!userId) {
    alert('User not authenticated');
    return;
  }

  try {
    // Fetch product details to get the product name
    const productResponse = await fetch(`http://localhost:8081/products/${productId}`);
    if (!productResponse.ok) {
      throw new Error('Failed to fetch product details');
    }
    const productData = await productResponse.json();
    const productName = productData.name || 'Unknown Product';

    // Rent the product
    const rentResponse = await fetch(`http://localhost:8081/products/rent/${productId}?userId=${userId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!rentResponse.ok) {
      const errorData = await rentResponse.json();
      throw new Error(errorData.error || 'Failed to rent product');
    }

    // Refresh the product list after renting
    fetchProducts();
    alert('Product rented successfully!');

    // Create notification for admin
    const notificationResponse = await fetch('http://localhost:8081/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        userId: userId,
        message: `User ${userName} rented product ${productName}.`, // Updated message format
        link: `/user/${userId}/rentinghistory`, // Link to the user's renting history
      }),
    });

    if (!notificationResponse.ok) {
      throw new Error('Failed to create notification');
    }
  } catch (error) {
    alert(`Error renting product: ${error.message}`);
  }
};

  return (
    <div className="rent-page-container">
      <h1>Rent Products</h1>
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
      <div className="product-list">
        {filteredProducts.map((product) => (
          <div key={product.id} className="product-card">
            <h3>{product.name}</h3>
            <p>Category: {product.category}</p>
            <p>Brand: {product.brand}</p>
            <p>Stock: {product.stock}</p>
            <button
              onClick={() => handleRent(product.id)}
              disabled={product.stock <= 0}
            >
              Rent
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RentPage;