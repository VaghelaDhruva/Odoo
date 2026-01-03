const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Log API base URL in development
if (import.meta.env.DEV) {
  console.log('API Base URL:', API_BASE_URL);
}

// Helper function to get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('accessToken');
};

// Helper function to refresh token
const refreshAuthToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    const newAccessToken = data.data?.accessToken;
    
    if (newAccessToken) {
      localStorage.setItem('accessToken', newAccessToken);
      return newAccessToken;
    } else {
      throw new Error('Invalid refresh response');
    }
  } catch (error) {
    // Clear tokens if refresh fails
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    // Redirect to login
    window.location.href = '/login';
    throw error;
  }
};

// Helper function to make API requests
const apiRequest = async (endpoint, options = {}) => {
  let token = getAuthToken();
  
  const makeRequest = async (authToken) => {
    const config = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { Authorization: `Bearer ${authToken}` }),
        ...options.headers,
      },
      ...(options.body && { body: options.body }),
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    // Handle non-JSON responses
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      throw new Error(text || `HTTP ${response.status}: ${response.statusText}`);
    }

    if (!response.ok) {
      // Handle different error response formats
      const errorMessage = data.message || data.error || `Request failed with status ${response.status}`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  };

  try {
    return await makeRequest(token);
  } catch (error) {
    // If token is expired (401), try to refresh it
    if (error.status === 401 && token) {
      try {
        const newToken = await refreshAuthToken();
        return await makeRequest(newToken);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        throw error; // Throw original error
      }
    }
    
    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Unable to connect to server. Please check if the backend is running.');
    }
    // Re-throw other errors
    throw error;
  }
};

// Auth API methods
export const authAPI = {
  login: async (email, password) => {
    try {
      const response = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      return response.data;
    } catch (error) {
      console.error('Login API error:', error);
      throw error;
    }
  },

  signup: async (userData) => {
    const response = await apiRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return response.data;
  },

  logout: async () => {
    const response = await apiRequest('/auth/logout', {
      method: 'POST',
    });
    return response;
  },

  refreshToken: async (refreshToken) => {
    const response = await apiRequest('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
    return response.data;
  },
};

// User API methods
export const userAPI = {
  getMe: async () => {
    const response = await apiRequest('/users/me');
    return response.data;
  },

  updateMe: async (userData) => {
    const response = await apiRequest('/users/me', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
    return response.data;
  },

  getAll: async () => {
    const response = await apiRequest('/users');
    return response.data;
  },

  getById: async (id) => {
    const response = await apiRequest(`/users/${id}`);
    return response.data;
  },

  create: async (userData) => {
    const response = await apiRequest('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return response.data;
  },

  update: async (id, userData) => {
    const response = await apiRequest(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
    return response.data;
  },
};

// Attendance API methods
export const attendanceAPI = {
  checkIn: async () => {
    const response = await apiRequest('/attendance/checkin', {
      method: 'POST',
    });
    return response.data;
  },

  checkOut: async () => {
    const response = await apiRequest('/attendance/checkout', {
      method: 'POST',
    });
    return response.data;
  },

  getMyAttendance: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = `/attendance/me${queryParams ? `?${queryParams}` : ''}`;
    const response = await apiRequest(endpoint);
    return response.data;
  },

  getAllAttendance: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = `/attendance${queryParams ? `?${queryParams}` : ''}`;
    const response = await apiRequest(endpoint);
    return response.data;
  },
};

// Leave API methods
export const leaveAPI = {
  create: async (leaveData) => {
    const response = await apiRequest('/leave', {
      method: 'POST',
      body: JSON.stringify(leaveData),
    });
    return response.data;
  },

  getMyLeaves: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = `/leave/me${queryParams ? `?${queryParams}` : ''}`;
    const response = await apiRequest(endpoint);
    return response.data;
  },

  getAllLeaves: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = `/leave${queryParams ? `?${queryParams}` : ''}`;
    const response = await apiRequest(endpoint);
    return response.data;
  },

  updateStatus: async (leaveId, status, comments) => {
    const response = await apiRequest(`/leave/${leaveId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, comments }),
    });
    return response.data;
  },
};

// Payroll API methods
export const payrollAPI = {
  getMyPayroll: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = `/payroll/me${queryParams ? `?${queryParams}` : ''}`;
    const response = await apiRequest(endpoint);
    return response.data;
  },

  getAllPayroll: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = `/payroll${queryParams ? `?${queryParams}` : ''}`;
    const response = await apiRequest(endpoint);
    return response.data;
  },

  create: async (payrollData) => {
    const response = await apiRequest('/payroll', {
      method: 'POST',
      body: JSON.stringify(payrollData),
    });
    return response.data;
  },

  update: async (payrollId, payrollData) => {
    const response = await apiRequest(`/payroll/${payrollId}`, {
      method: 'PUT',
      body: JSON.stringify(payrollData),
    });
    return response.data;
  },
};

// Dashboard API methods
export const dashboardAPI = {
  getAdminStats: async () => {
    const response = await apiRequest('/dashboard/admin');
    return response.data;
  },
  getEmployeeStats: async () => {
    const response = await apiRequest('/dashboard/employee');
    return response.data;
  },
};

export default {
  authAPI,
  userAPI,
  attendanceAPI,
  leaveAPI,
  payrollAPI,
  dashboardAPI,
};

