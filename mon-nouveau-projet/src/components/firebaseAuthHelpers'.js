// In the QR code onValue function, replace the current code with:
if (mobileAuthData && mobileAuthData.status === 'success' && mobileAuthData.uid) {
    setQrStatus('authenticated');
    console.log("Mobile authentication data received:", mobileAuthData);
    
    // Use the persistAuthState helper to maintain authentication
    import('./firebaseAuthHelpers').then(module => {
      const { persistAuthState } = module;
      persistAuthState(mobileAuthData.uid, mobileAuthData.email)
        .then(() => {
          navigate('/dashboard');
        })
        .catch(err => {
          console.error("Error persisting auth state:", err);
          setErrors({
            general: "Authentication failed. Please try again."
          });
          setQrStatus('pending');
        });
    }).catch(err => {
      console.error("Error importing auth helpers:", err);
    });
  }