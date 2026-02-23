import React, { useEffect, Component } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getMe } from './store/slices/authSlice';
import { LoginPage, RegisterPage } from './pages/AuthPage';
import ChatPage from './pages/ChatPage';

/* ───────────────── Loader ───────────────── */

const AppLoader = () => (
  <div className="min-h-screen bg-chat-bg flex items-center justify-center px-4">
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-primary-500/20 flex items-center justify-center">
        <svg
          className="w-7 h-7 sm:w-8 sm:h-8 text-primary-500 animate-pulse"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" />
        </svg>
      </div>

      <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-xs text-chat-secondary">Loading...</p>
    </div>
  </div>
);

/* ───────────────── Error Boundary ───────────────── */

class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-chat-bg flex items-center justify-center px-4">
          <div className="text-center max-w-sm w-full">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <h2 className="text-lg font-semibold text-chat-text mb-2">
              Something went wrong
            </h2>

            <p className="text-sm text-chat-secondary mb-6 break-words">
              {this.state.error?.message}
            </p>

            <button
              onClick={() => window.location.reload()}
              className="btn-primary w-full sm:w-auto px-6 py-2"
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/* ───────────────── Unauthorized Listener ───────────────── */

const AuthUnauthorizedListener = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => navigate('/login', { replace: true });
    window.addEventListener('auth:unauthorized', handler);
    return () => window.removeEventListener('auth:unauthorized', handler);
  }, [navigate]);

  return null;
};

/* ───────────────── Route Guards ───────────────── */

const ProtectedRoute = ({ children }) => {
  const { user, initialized } = useSelector((s) => s.auth);

  if (!initialized) return <AppLoader />;
  if (!user) return <Navigate to="/login" replace />;

  return children;
};

const PublicRoute = ({ children }) => {
  const { user, initialized } = useSelector((s) => s.auth);

  if (!initialized) return <AppLoader />;
  if (user) return <Navigate to="/" replace />;

  return children;
};

/* ───────────────── App Root ───────────────── */

const App = () => {
  const dispatch = useDispatch();

  // useEffect(() => {
  //   dispatch(getMe());
  // }, [dispatch]);

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        await dispatch(getMe()).unwrap();
      } catch (err) {
        // slice already handles initialized = true
      }
    };

    initAuth();

    const timeout = setTimeout(() => {
      if (isMounted) {
        dispatch({ type: 'auth/getMe/rejected' });
      }
    }, 8000);

    return () => {
      isMounted = false;
      clearTimeout(timeout);
    };
  }, [dispatch]);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthUnauthorizedListener />

        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />

          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
