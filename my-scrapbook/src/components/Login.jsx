import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmail } from '../firebase';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signInWithEmail(email, password);
    
    if (result.success) {
      navigate('/home');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-tr from-pink-200 via-purple-200 to-yellow-100">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-lg p-8 flex flex-col items-center">
        {/* Logo placeholder */}
        <div className="mb-8 w-24 h-24 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-md">
          {/* You can replace this with an <img src=... /> for your logo */}
          <span>I</span>
        </div>
        <form className="w-full space-y-4" onSubmit={handleSubmit}>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 text-gray-900 bg-gray-50 placeholder-gray-400"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 text-gray-900 bg-gray-50 placeholder-gray-400"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && (
            <div className="text-red-500 text-sm text-center font-medium">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-gradient-to-tr from-pink-500 to-yellow-400 text-white font-bold text-lg shadow-md hover:from-pink-600 hover:to-yellow-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <div className="mt-6 text-center w-full">
          <p className="text-gray-500">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="font-semibold text-pink-500 hover:text-pink-600"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login; 