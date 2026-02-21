import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // Send HttpOnly cookies
  headers: { 'Content-Type': 'application/json' },
});

// Response interceptor for handling auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only hard-redirect on 401 if NOT during the initial /auth/me check.
    // During startup getMe() will simply reject, and the Redux slice sets
    // initialized=true so React Router redirects cleanly via ProtectedRoute.
    const isAuthCheck = error.config?.url?.includes('/auth/me');
    if (error.response?.status === 401 && !isAuthCheck) {
      // Dispatch a custom event so React Router can handle navigation
      // without a full page reload that breaks the SPA.
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export default api;