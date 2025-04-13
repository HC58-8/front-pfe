import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getDatabase, ref, push, set } from 'firebase/database';
import { collection, getDocs, getFirestore } from "firebase/firestore";
import { app as firebaseApp } from '../../firebaseConfig';
import './ReturnProductPage.css';

const firestore = getFirestore();
const db = getDatabase();

const ReturnProductPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { product } = location.state || {};
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!product) {
    return <div>No product information available. Please go back to your rental history.</div>;
  }

  const handleReturnSubmit = async (e) => {
    e.preventDefault();

    if (!reason.trim()) {
      setError('Please provide a reason for returning the product');
      return;
    }

    setLoading(true);

    try {
      const productIdToUse = product.id || product._id || product.productId;
      if (!productIdToUse) {
        throw new Error('Product ID not found in the product object');
      }

      const returnResponse = await fetch(`http://localhost:8081/products/return/${productIdToUse}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          userId: product.userId,
          reason: reason,
          rentedProductId: productIdToUse,
        }),
      });

      if (!returnResponse.ok) {
        const errorData = await returnResponse.json();
        throw new Error(errorData.error || 'Failed to return product');
      }

      // Send notification to the user who returned the product
      const notification = {
        title: "Return Confirmation",
        message: `Your return of ${product.productDetails.name} is being processed.`,
        link: "/rentinghistory",
        read: false,
        timestamp: Date.now(),
      };
      
      const userNotificationRef = ref(db, `notifications/user/${product.userId}`);
      const newUserNotificationRef = push(userNotificationRef);
      await set(newUserNotificationRef, notification);

      // 🔥 Fetch admins from Firestore instead of Realtime DB
      const usersSnapshot = await getDocs(collection(firestore, "users"));
      const administrators = [];
      
      usersSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.role === "Administrateur") {
          administrators.push({ uid: doc.id, ...data });
        }
      });

      // Get the actual username - handling different possible formats
      let username = "A user";
      if (product.userName) {
        username = product.userName;
      } else if (product.user && product.user.name) {
        username = product.user.name;
      } else if (product.user && product.user.displayName) {
        username = product.user.displayName;
      } else if (product.userDisplayName) {
        username = product.userDisplayName;
      }

      for (const admin of administrators) {
        const adminNotificationRef = ref(db, `notifications/user/${admin.uid}`);
        const newAdminNotificationRef = push(adminNotificationRef);
        await set(newAdminNotificationRef, {
          title: "Product Return Request",
          message: `${username} returned ${product.productDetails.name}. Reason: ${reason}`,
          link: `/user/${product.userId}/rentinghistory`,
          read: false,
          timestamp: Date.now(),
          userId: product.userId,
        });
      }

      alert('Product returned successfully!');
      navigate('/rentinghistory');
    } catch (error) {
      console.error('Error returning product:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatFirestoreTimestamp = (timestamp) => {
    if (timestamp && timestamp._seconds) {
      const date = new Date(timestamp._seconds * 1000);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    return 'Unknown date';
  };

  return (
    <div className="return-product-container">
      <h1>Return Product</h1>

      <div className="product-details">
        <h2>{product.productDetails?.name || 'Product'}</h2>
        <div className="details-grid">
          <div className="detail-item">
            <span className="label">Category:</span>
            <span className="value">{product.productDetails?.category || 'N/A'}</span>
          </div>
          <div className="detail-item">
            <span className="label">Brand:</span>
            <span className="value">{product.productDetails?.brand || 'N/A'}</span>
          </div>
          <div className="detail-item">
            <span className="label">Rented On:</span>
            <span className="value">{formatFirestoreTimestamp(product.rentedAt)}</span>
          </div>
          {product.productDetails?.description && (
            <div className="detail-item full-width">
              <span className="label">Description:</span>
              <span className="value">{product.productDetails.description}</span>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleReturnSubmit} className="return-form">
        <div className="form-group">
          <label htmlFor="reason">Return Reason:</label>
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Please explain why you're returning this product"
            required
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="form-actions">
          <button
            type="button"
            className="cancel-button"
            onClick={() => navigate('/rentinghistory')}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Return Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReturnProductPage;