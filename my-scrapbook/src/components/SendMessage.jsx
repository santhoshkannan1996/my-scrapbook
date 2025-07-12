import { useState } from 'react';
import { auth, createDocument } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

const SendMessage = ({ friendUid, friendNameOrEmail }) => {
  const [message, setMessage] = useState('');
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
    if (!message.trim()) {
      setStatus('Message cannot be empty.');
      setLoading(false);
      return;
    }
    try {
      const result = await createDocument('messages', {
        toUserId: friendUid,
        fromUserId: currentUser.uid,
        message: message.trim(),
        timestamp: new Date()
      });
      if (result.success) {
        setStatus('Message sent!');
        setMessage('');
      } else {
        setStatus('Error: ' + result.error);
      }
    } catch (err) {
      setStatus('Error: ' + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-4 p-4 bg-white rounded shadow">
      <h3 className="text-lg font-bold mb-2">Send a message to {friendNameOrEmail || friendUid}</h3>
      <form onSubmit={handleSubmit} className="space-y-2">
        <textarea
          className="w-full px-3 py-2 border rounded"
          placeholder="Type your message..."
          value={message}
          onChange={e => setMessage(e.target.value)}
          rows={3}
          required
        />
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Sending...' : 'Send Message'}
        </button>
      </form>
      {status && <div className="mt-2 text-center text-sm text-gray-700">{status}</div>}
    </div>
  );
};

export default SendMessage; 