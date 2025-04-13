import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './RentalHistoryPage.css';

const RentalHistoryPage = () => {
  const [rentedProducts, setRentedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const navigate = useNavigate();
  const { userId: urlUserId } = useParams(); // Get userId from URL if available
  
  // Get logged-in user info
  const loggedInUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
  const isAdmin = loggedInUser?.role === 'Administrateur';
  
  // Determine which userId to use (from URL or logged-in user)
  const userId = urlUserId || (loggedInUser ? loggedInUser.uid : null);
  
  const fetchUserInfo = async () => {
    try {
      const response = await fetch(`http://localhost:8081/users/${urlUserId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user information');
      }
      
      const data = await response.json();
      setUserInfo(data);
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };
  
  const fetchRentalHistory = async () => {
    try {
      const response = await fetch(`http://localhost:8081/products/rented-products?userId=${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch rental history');
      }
      
      const data = await response.json();
      setRentedProducts(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (userId) {
      fetchRentalHistory();
      // If admin is viewing another user's history, fetch that user's info
      if (urlUserId && isAdmin) {
        fetchUserInfo();
      }
    } else {
      setError('User not authenticated');
      setLoading(false);
    }
  }, [userId, urlUserId, isAdmin]); // Add dependencies
  
  const handleReturnProduct = (product) => {
    navigate('/return-product', { state: { product } });
  };
  
  const formatFirestoreTimestamp = (timestamp) => {
    console.log('Timestamp object:', timestamp); // Debug the timestamp structure
    
    // Check if timestamp is a Firestore server timestamp object
    if (timestamp && timestamp._seconds && timestamp._nanoseconds) {
      // Convert seconds and nanoseconds to JavaScript Date
      const date = new Date(timestamp._seconds * 1000);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    // Check for seconds field directly (different timestamp format)
    if (timestamp && timestamp.seconds) {
      const date = new Date(timestamp.seconds * 1000);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    // Try parsing as a direct timestamp value if it's a number
    if (timestamp && typeof timestamp === 'number') {
      const date = new Date(timestamp);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    // Fallback for unknown or invalid timestamps
    return 'Unknown date';
  };

  if (loading) {
    return <div>Loading rental history...</div>;
  }
  
  if (error) {
    return <div>Error: {error}</div>;
  }
  
  return (
    <div className="rental-history-container">
      {urlUserId && isAdmin && userInfo ? (
        <h1>Rental History: {userInfo.name || userInfo.email || 'User'}</h1>
      ) : (
        <h1>Your Rental History</h1>
      )}
      
      {rentedProducts.length === 0 ? (
        <p>No products rented yet.</p>
      ) : (
        <div className="rented-products-list">
          {rentedProducts.map((rental, index) => (
            <div key={index} className="rented-product-card">
              <h3>{rental.productDetails?.name || 'Product Name Not Available'}</h3>
              <p>Category: {rental.productDetails?.category || 'N/A'}</p>
              <p>Brand: {rental.productDetails?.brand || 'N/A'}</p>
              <p>Rented On: {formatFirestoreTimestamp(rental.rentedAt)}</p>
              <p>Status: {rental.returnedAt ? 'Returned' : 'Owned'}</p>
              {!rental.returnedAt && (
                <button 
                  className="return-button"
                  onClick={() => handleReturnProduct(rental)}
                >
                  Return Product
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RentalHistoryPage;