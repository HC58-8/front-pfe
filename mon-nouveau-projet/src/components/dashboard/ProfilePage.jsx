import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import './ProfilePage.css';
import { auth,firestore } from '../../firebaseConfig';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { uid } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCurrentUser, setIsCurrentUser] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Determine the target UID
      const currentUser = auth.currentUser;
      const targetUid = uid || (currentUser ? currentUser.uid : null);

      // Redirect to login if no valid user
      if (!targetUid) {
        navigate('/login');
        return;
      }

      // Check if the profile being viewed is the current user's profile
      setIsCurrentUser(!uid || uid === currentUser?.uid);

      // Fetch user document
      const userDoc = await getDoc(doc(firestore, 'users', targetUid));

      if (!userDoc.exists()) {
        throw new Error('User profile not found');
      }

      // Set profile data
      const profileData = { 
        ...userDoc.data(), 
        uid: userDoc.id 
      };
      setProfile(profileData);

    } catch (err) {
      console.error('Profile fetch error:', err);
      setError(err.message);

      // Handle different error scenarios
      if (err.message.includes('permission') || err.message.includes('auth')) {
        navigate('/login');
      } else if (err.message.includes('not found')) {
        navigate('/not-found');
      }
    } finally {
      setLoading(false);
    }
  }, [uid, navigate]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Loading State
  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="profile-container">
        <div className="error-message">
          <h2>Profile Error</h2>
          <p>{error}</p>
          <div className="error-actions">
            <Link to="/" className="btn btn-home">Return Home</Link>
            {error.includes('auth') && (
              <Link to="/login" className="btn btn-login">Login</Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  // No Profile Data State
  if (!profile) {
    return (
      <div className="profile-container">
        <div className="error-message">
          <h2>No Profile Found</h2>
          <p>Unable to retrieve profile information.</p>
          <Link to="/" className="btn btn-home">Return Home</Link>
        </div>
      </div>
    );
  }

  // Profile Render
  return (
    <div className="profile-container">
      <div className="user-info">
        <h1>
          {isCurrentUser 
            ? 'My Profile' 
            : `Profile of ${profile.firstName} ${profile.lastName}`}
        </h1>

        <div className="profile-details">
          <div className="profile-avatar">
            {profile.photoURL ? (
              <img 
                src={profile.photoURL} 
                alt={`${profile.firstName}'s profile`} 
                className="avatar-image" 
              />
            ) : (
              <div className="avatar-placeholder">
                {profile.firstName[0]}{profile.lastName[0]}
              </div>
            )}
          </div>

          <div className="profile-text-details">
            <p>
              <strong>Name:</strong> {profile.firstName} {profile.lastName}
            </p>
            <p>
              <strong>Email:</strong> {profile.email || 'Not available'}
            </p>
            <p>
              <strong>Phone:</strong> {profile.phone || 'Not provided'}
            </p>
            <p>
              <strong>Role:</strong> {profile.role || 'User'}
            </p>
            {profile.bio && (
              <p>
                <strong>Bio:</strong> {profile.bio}
              </p>
            )}
          </div>
        </div>
      </div>

      {isCurrentUser && (
        <div className="profile-actions">
          <h2>My Actions</h2>
          <div className="action-links">
            <Link to="/rentinghistory" className="btn btn-action">
              View Rental History
            </Link>
            <Link to="/settings" className="btn btn-action">
              Edit Profile
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;