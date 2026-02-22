import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';  
import { useNavigate, Link } from 'react-router-dom';
import { login, register, clearError } from '../store/slices/authSlice';
import toast from 'react-hot-toast';

const AuthForm = ({ mode }) => {
  const isLogin = mode === 'login';
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useSelector((s) => s.auth);

  const [form, setForm] = useState({ name: '', email: '', password: '' });

  useEffect(() => {
    if (user) navigate('/');
    if (error) { toast.error(error); dispatch(clearError()); }
  }, [user, error]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin) {
      dispatch(login({ email: form.email, password: form.password }));
    } else {
      dispatch(register(form));
    }
  };

  return (
  <div className="min-h-screen bg-chat-bg flex items-center justify-center px-4 sm:px-6 lg:px-8 py-6">
    
    <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg">
      
      {/* Logo Section */}
      <div className="text-center mb-6 sm:mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl mb-3 sm:mb-4">
          <img 
            src="/logo.png" 
            alt="logo"
            className="w-full h-full object-contain"
          />
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-chat-text">
          HAI Chat
        </h1>

        <p className="text-chat-secondary mt-1 text-xs sm:text-sm">
          {isLogin ? 'Welcome back!' : 'Create your account'}
        </p>
      </div>

      {/* Card */}
      <div className="bg-chat-header rounded-2xl p-5 sm:p-8 border border-chat-border/30 shadow-2xl">
        
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          
          {!isLogin && (
            <div>
              <label className="block text-chat-secondary text-sm mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                placeholder="javed"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-field w-full"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-chat-secondary text-sm mb-1.5">
              Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input-field w-full"
              required
            />
          </div>

          <div>
            <label className="block text-chat-secondary text-sm mb-1.5">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="input-field w-full"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-2.5 sm:py-3 mt-2 text-sm sm:text-base"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                {isLogin ? 'Signing in...' : 'Creating account...'}
              </span>
            ) : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <p className="text-center text-chat-secondary text-xs sm:text-sm mt-5 sm:mt-6">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <Link
            to={isLogin ? '/register' : '/login'}
            className="text-primary-500 hover:text-primary-600 font-medium"
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </Link>
        </p>
      </div>
    </div>
  </div>
);
};

export const LoginPage = () => <AuthForm mode="login" />;
export const RegisterPage = () => <AuthForm mode="register" />;
