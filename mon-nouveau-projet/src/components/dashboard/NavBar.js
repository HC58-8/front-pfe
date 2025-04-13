import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaGlobe, FaBell, FaUser, FaCog, FaSignOutAlt } from 'react-icons/fa';
import logo from './../../images/logo.png';
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import { getDatabase, ref, onValue, update } from 'firebase/database'; // Import Firebase database functions

function NavBar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();
  const notificationsRef = useRef(null);

  // Fetch user data from localStorage
  const user = JSON.parse(localStorage.getItem('user')); // Assuming user data is stored in localStorage
  const isAdmin = user?.role === 'Administrateur'; // Check if the user is an admin

  // Fetch notifications from Firebase
  useEffect(() => {
    if (!user?.uid) return; // Only fetch if we have a user ID
    
    const db = getDatabase();
    // Define the reference path - administrators get all notifications, regular users get only their own
    const notificationsPath = isAdmin ? 'notifications' : `notifications/user/${user.uid}`;
    const notificationsRef = ref(db, notificationsPath);

    // Set up a real-time listener for notifications
    const unsubscribe = onValue(notificationsRef, (snapshot) => {
      const notificationsData = snapshot.val();
      if (!notificationsData) {
        setNotifications([]);
        return;
      }

      // Convert the object to an array and sort by timestamp (newest first)
      const notificationsArray = Object.keys(notificationsData).map(key => ({
        id: key,
        ...notificationsData[key]
      })).sort((a, b) => b.timestamp - a.timestamp);

      console.log('Fetched notifications:', notificationsArray); // Debugging
      setNotifications(notificationsArray);
    });

    // Clean up the listener when component unmounts
    return () => unsubscribe();
  }, [user?.uid, isAdmin]);

  // Close the dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle notification click
  const handleNotificationClick = (notification) => {
    console.log('Notification clicked:', notification);

    // Mark notification as read in Firebase
    if (!notification.read) {
      const db = getDatabase();
      const notificationRef = ref(db, `notifications/${notification.id}`);
      update(notificationRef, { read: true });
    }

    // Handle navigation based on notification type
    if (typeof notification.link === 'string' && notification.link) {
      if (notification.link.startsWith('http')) {
        // External link
        window.open(notification.link, '_blank');
      } else {
        // Internal route
        navigate(notification.link);
      }
    } else if (notification.userId) {
      // Fallback if link is not available but userId is
      navigate(`/user/${notification.userId}/rental-history`);
    }

    setShowNotifications(false);
  };

  // Handle search form submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    console.log('Search Query:', searchQuery);
    // Add your search logic here
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleLogout = async () => {
    try {
      const auth = getAuth();
      
      // 1. Sign out from Firebase
      await signOut(auth);
      
      // 2. Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // 3. Clear Firebase session
      window.location.replace('/login'); // Full page redirect
      
      // 4. Prevent browser back navigation
      window.history.pushState(null, '', '/login');
      
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Toggle profile menu visibility
  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  // Handle profile click
  const handleProfile = () => {
    navigate('/profile');
  };

  // Handle settings click
  const handlesettings = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      // No need to pass data here as it will be fetched in the Settings component
      navigate('/settings');
    }
  };

  // Count unread notifications
  const unreadCount = notifications.filter(notification => !notification.read).length;

  return (
    <div className="fixed top-0 left-0 w-full bg-white p-0 m-0 shadow-md z-50 h-[60px]">
      <div className="flex items-center justify-between p-0">
        <img src={logo} alt="Logo" className="m-2 w-16 h-[51px]" />
        <div className="menu-toggle"> </div>
        <form onSubmit={handleSearchSubmit} className="flex items-center w-1/3">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Rechercher des produits"
            className="w-full px-4 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-custom-red text-white px-4 py-2 rounded-r-lg hover:bg-custom-gray focus:outline-none focus:ring-2 focus:ring-custom-red"
          >
            <FaSearch />
          </button>
        </form>

        <div className="flex space-x-4 items-center">
          <button className="text-custom-red">
            <FaGlobe size={20} />
          </button>

          {/* Show notifications for all users, but admins might see more */}
          <div className="relative" ref={notificationsRef}>
            <button
              className="relative text-custom-red"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <FaBell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-12 w-72 bg-white rounded-md shadow-lg py-1 z-50 max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer border-b ${!notification.read ? 'bg-blue-50' : ''}`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="font-medium">{notification.title || 'Notification'}</div>
                      <div className="text-sm">{notification.message}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(notification.timestamp).toLocaleString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="block w-full text-left px-4 py-2 text-gray-700">
                    Pas de nouvelles notifications
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="relative">
            <div
              className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center cursor-pointer"
              onClick={toggleProfileMenu}
              onMouseEnter={() => setShowProfileMenu(true)}
            >
              <span className="text-white text-lg">{user?.email?.[0]?.toUpperCase() || 'U'}</span>
            </div>

            {showProfileMenu && (
              <div
                className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50"
                onMouseLeave={() => setShowProfileMenu(false)}
              >
                <button
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={handleProfile}
                >
                  <FaUser className="inline mr-2" /> Profil
                </button>
                <button
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={handlesettings}
                >
                  <FaCog className="inline mr-2" /> Paramètres
                </button>
                <button
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600"
                  onClick={handleLogout}
                >
                  <FaSignOutAlt className="inline mr-2" /> Déconnexion
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default NavBar;