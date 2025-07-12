import { useState } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, setDoc, doc, getDocs, query, where } from 'firebase/firestore';

const AddFriend = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Listen for auth state
  useState(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('');
    setLoading(true);

    if (!currentUser) {
      setStatus('You must be logged in.');
      setLoading(false);
      return;
    }

    try {
      // Query Firestore users collection for the email
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        setStatus('No user found with that email.');
        setLoading(false);
        return;
      }
      const friendDoc = querySnapshot.docs[0];
      const friendUid = friendDoc.data().uid;
      if (friendUid === currentUser.uid) {
        setStatus('You cannot add yourself as a friend.');
        setLoading(false);
        return;
      }
      // Add to current user's friends subcollection
      const friendRef = doc(db, 'users', currentUser.uid, 'friends', friendUid);
      await setDoc(friendRef, {
        uid: friendUid,
        email: email,
        addedAt: new Date()
      });
      setStatus('Friend added successfully!');
    } catch (err) {
      setStatus('Error: ' + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-4 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Add a Friend</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          className="w-full px-3 py-2 border rounded"
          placeholder="Friend's email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Adding...' : 'Add Friend'}
        </button>
      </form>
      {status && <div className="mt-4 text-center text-sm text-gray-700">{status}</div>}
    </div>
  );
};

export default AddFriend; 