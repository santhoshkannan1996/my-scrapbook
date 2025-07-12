import { Link, useNavigate } from 'react-router-dom';
import { signOutUser } from '../firebase';
import { useState } from 'react';

const NavigationBar = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOutUser();
    navigate('/login');
  };

  return (
    <nav className="bg-indigo-600 text-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <span className="font-bold text-xl tracking-tight">My Scrapbook</span>
          </div>
          <div className="hidden md:flex space-x-4">
            <Link to="/home" className="hover:bg-indigo-700 px-3 py-2 rounded">Home</Link>
            <Link to="/write" className="hover:bg-indigo-700 px-3 py-2 rounded">Write</Link>
            <Link to="/friends" className="hover:bg-indigo-700 px-3 py-2 rounded">Friends</Link>
            <button onClick={handleLogout} className="hover:bg-indigo-700 px-3 py-2 rounded">Logout</button>
          </div>
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="focus:outline-none"
              aria-label="Toggle menu"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden px-2 pt-2 pb-3 space-y-1 bg-indigo-600">
          <Link to="/home" className="block hover:bg-indigo-700 px-3 py-2 rounded" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/write" className="block hover:bg-indigo-700 px-3 py-2 rounded" onClick={() => setMenuOpen(false)}>Write</Link>
          <Link to="/friends" className="block hover:bg-indigo-700 px-3 py-2 rounded" onClick={() => setMenuOpen(false)}>Friends</Link>
          <button onClick={() => { setMenuOpen(false); handleLogout(); }} className="block w-full text-left hover:bg-indigo-700 px-3 py-2 rounded">Logout</button>
        </div>
      )}
    </nav>
  );
};

export default NavigationBar; 