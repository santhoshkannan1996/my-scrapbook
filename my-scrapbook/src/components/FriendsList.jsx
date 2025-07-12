import { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import SendMessage from './SendMessage';

const FriendsList = () => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const fetchFriends = async (user) => {
    if (!user) {
      setFriends([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const friendsRef = collection(db, 'users', user.uid, 'friends');
      const snapshot = await getDocs(friendsRef);
      const friendsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFriends(friendsList);
    } catch (err) {
      setError('Error fetching friends: ' + err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFriends(currentUser);
    // eslint-disable-next-line
  }, [currentUser]);

  const openModal = (friend) => {
    setSelectedFriend(friend);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedFriend(null);
  };

  const toggleFavorite = async (friend) => {
    if (!currentUser) return;
    try {
      const friendRef = doc(db, 'users', currentUser.uid, 'friends', friend.id);
      await updateDoc(friendRef, { favorite: !friend.favorite });
      setFriends(friends.map(f => f.id === friend.id ? { ...f, favorite: !friend.favorite } : f));
    } catch (err) {
      alert('Failed to update favorite: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-pink-200 via-purple-200 to-yellow-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
        <span className="ml-4 text-gray-600">Loading friends...</span>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-600 text-center mt-4">{error}</div>;
  }

  if (!currentUser) {
    return <div className="text-center mt-4">Please log in to view your friends.</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-pink-200 via-purple-200 to-yellow-100 pt-20 pb-8 px-2">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 tracking-tight">My Friends</h2>
        {friends.length === 0 ? (
          <div className="text-gray-500 text-center">No friends found.</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {friends.map(friend => (
              <li key={friend.id} className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                  <button
                    className={`text-2xl focus:outline-none ${friend.favorite ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-400'}`}
                    title={friend.favorite ? 'Remove from favorites' : 'Add to favorites'}
                    onClick={() => toggleFavorite(friend)}
                  >
                    {friend.favorite ? '★' : '☆'}
                  </button>
                  <div>
                    <div className="text-gray-900 font-semibold text-lg">{friend.displayName || friend.email}</div>
                    {friend.email && (
                      <div className="text-gray-500 text-sm">{friend.email}</div>
                    )}
                  </div>
                </div>
                <button
                  className="ml-2 bg-gradient-to-tr from-pink-500 to-yellow-400 text-white px-4 py-2 rounded-lg font-semibold shadow hover:from-pink-600 hover:to-yellow-500 transition text-sm"
                  onClick={() => openModal(friend)}
                >
                  Send Message
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {/* Modal Dialog */}
      {showModal && selectedFriend && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
              onClick={closeModal}
              aria-label="Close"
            >
              &times;
            </button>
            <SendMessage
              friendUid={selectedFriend.uid}
              friendNameOrEmail={selectedFriend.displayName || selectedFriend.email}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FriendsList; 