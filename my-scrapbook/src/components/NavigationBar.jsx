import { Link, useNavigate } from 'react-router-dom';
import { signOutUser, db, auth } from '../firebase';
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';

const NavigationBar = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [profilePicUrl, setProfilePicUrl] = useState('');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const docRef = doc(db, 'users', firebaseUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfilePicUrl(docSnap.data().photoURL || '');
        } else {
          setProfilePicUrl('');
        }
      } else {
        setProfilePicUrl('');
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOutUser();
    navigate('/login');
  };

  return (
    <nav className="bg-indigo-600 text-white shadow fixed top-0 left-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <span className="font-bold text-xl tracking-tight">My Scrapbook</span>
            <div className="hidden md:flex space-x-4">
              <Link to="/home" className="hover:bg-indigo-700 px-3 py-2 rounded">Home</Link>
              <Link to="/write" className="hover:bg-indigo-700 px-3 py-2 rounded">Write</Link>
              <Link to="/friends" className="hover:bg-indigo-700 px-3 py-2 rounded">Friends</Link>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/profile')}
              className="focus:outline-none flex items-center justify-center w-10 h-10 rounded-full bg-white hover:bg-indigo-100 transition border-2 border-indigo-300 shadow"
              title="Profile Settings"
            >
              {profilePicUrl ? (
                <img src={profilePicUrl} alt="Profile" className="object-cover w-9 h-9 rounded-full" />
              ) : (
                <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </button>
            <button
              onClick={handleLogout}
              className="bg-white text-indigo-600 font-semibold px-4 py-2 rounded hover:bg-indigo-100 transition hidden md:block"
            >
              Logout
            </button>
            {/* Mobile menu button */}
            <div className="md:hidden flex items-center ml-2">
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
      </div>
      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden px-2 pt-2 pb-3 space-y-1 bg-indigo-600">
          <Link to="/home" className="block hover:bg-indigo-700 px-3 py-2 rounded" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/write" className="block hover:bg-indigo-700 px-3 py-2 rounded" onClick={() => setMenuOpen(false)}>Write</Link>
          <Link to="/friends" className="block hover:bg-indigo-700 px-3 py-2 rounded" onClick={() => setMenuOpen(false)}>Friends</Link>
          <button onClick={() => { setMenuOpen(false); handleLogout(); }} className="block w-full text-left bg-white text-indigo-600 font-semibold hover:bg-indigo-100 px-3 py-2 rounded">Logout</button>
        </div>
      )}
    </nav>
  );
};

export default NavigationBar; 