import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOutUser, db, auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';

const Home = () => {
  const navigate = useNavigate();
  const [favoriteFriends, setFavoriteFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) {
        setFavoriteFriends([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      const favRef = collection(db, 'users', user.uid, 'friends');
      const q = query(favRef, where('favorite', '==', true));
      const snapshot = await getDocs(q);
      setFavoriteFriends(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    };
    fetchFavorites();
  }, [user]);

  const handleLogout = async () => {
    const result = await signOutUser();
    if (result.success) {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-pink-200 via-purple-200 to-yellow-100 pt-20 pb-8 px-2">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-10 flex flex-col items-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">Welcome to My Scrapbook</h1>
          <p className="text-lg text-gray-600 mb-2">You have successfully logged in! This is your home page.</p>
        </div>
        <div className="">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 tracking-tight">Favorite Friends</h2>
          {loading ? (
            <div className="flex justify-center items-center min-h-[100px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
              <span className="ml-4 text-gray-600">Loading favorites...</span>
            </div>
          ) : favoriteFriends.length === 0 ? (
            <div className="text-gray-500 text-center">No favorite friends yet. Mark friends as favorites to see them here!</div>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {favoriteFriends.map(friend => (
                <li key={friend.id} className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center transition hover:shadow-xl">
                  <div className="text-yellow-400 text-3xl mb-2">★</div>
                  <div className="text-lg font-semibold text-gray-900">{friend.displayName || friend.email}</div>
                  {friend.email && <div className="text-gray-500 text-sm">{friend.email}</div>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home; 