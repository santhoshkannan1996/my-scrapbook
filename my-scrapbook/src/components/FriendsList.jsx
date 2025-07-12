import { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
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

  useEffect(() => {
    if (!currentUser) {
      setFriends([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    const fetchFriends = async () => {
      try {
        const friendsRef = collection(db, 'users', currentUser.uid, 'friends');
        const snapshot = await getDocs(friendsRef);
        const friendsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setFriends(friendsList);
      } catch (err) {
        setError('Error fetching friends: ' + err.message);
      }
      setLoading(false);
    };
    fetchFriends();
  }, [currentUser]);

  const openModal = (friend) => {
    setSelectedFriend(friend);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedFriend(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[100px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
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
    <div className="max-w-md mx-auto mt-8 p-4 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">My Friends</h2>
      {friends.length === 0 ? (
        <div className="text-gray-500">No friends found.</div>
      ) : (
        <ul className="space-y-2">
          {friends.map(friend => (
            <li key={friend.id} className="border-b pb-2 flex items-center justify-between">
              <div>
                <div className="text-gray-800 font-medium">
                  {friend.displayName || friend.email}
                </div>
                {friend.email && (
                  <div className="text-gray-600 text-sm">{friend.email}</div>
                )}
              </div>
              <button
                className="ml-2 bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 text-sm"
                onClick={() => openModal(friend)}
              >
                Send Message
              </button>
            </li>
          ))}
        </ul>
      )}

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