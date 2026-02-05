// Error testing utilities for development
export const errorTest = {
  // Test network error
  testNetworkError: () => {
    // Simulate network error by making request to invalid URL
    return fetch('http://invalid-url-that-does-not-exist.com')
      .catch(error => {
        console.log('Network error test:', error);
        throw error;
      });
  },

  // Test 500 server error
  testServerError: () => {
    // This would need to be implemented on the backend
    return fetch('http://localhost:8001/api/test/500')
      .catch(error => {
        console.log('Server error test:', error);
        throw error;
      });
  },

  // Test 401 unauthorized error
  testUnauthorizedError: () => {
    return fetch('http://localhost:8001/api/auth/profile/', {
      headers: {
        'Authorization': 'Bearer invalid-token'
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    })
    .catch(error => {
      console.log('Unauthorized error test:', error);
      throw error;
    });
  },

  // Test validation error
  testValidationError: () => {
    return fetch('http://localhost:8001/api/auth/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: '', // Empty username should cause validation error
        password: ''  // Empty password should cause validation error
      })
    })
    .then(response => response.json())
    .then(data => {
      console.log('Validation error test:', data);
      if (data.username || data.password) {
        const error = new Error('Validation failed');
        error.response = { data };
        throw error;
      }
      return data;
    })
    .catch(error => {
      console.log('Validation error test caught:', error);
      throw error;
    });
  }
};

// Only expose in development
if (process.env.NODE_ENV === 'development') {
  window.errorTest = errorTest;
}