import { useEffect, useState } from 'react';
import { getDocuments, auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

const Inbox = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setMessages([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    const fetchMessages = async () => {
      const result = await getDocuments('messages', {
        where: [{ field: 'toUserId', operator: '==', value: user.uid }],
        orderBy: { field: 'timestamp', direction: 'desc' }
      });
      if (result.success) {
        setMessages(result.data);
      } else {
        setError(result.error);
      }
      setLoading(false);
    };
    fetchMessages();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <span className="ml-4 text-gray-600">Loading messages...</span>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-600 text-center mt-8">{error}</div>;
  }

  if (!user) {
    return <div className="text-center mt-8">Please log in to view your messages.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto mt-8 p-4 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Inbox</h2>
      {messages.length === 0 ? (
        <div className="text-gray-500">No messages found.</div>
      ) : (
        <ul className="space-y-4">
          {messages.map((msg) => (
            <li key={msg.id} className="border-b pb-2">
              <div className="text-gray-800 font-medium">From: {msg.fromUserId}</div>
              <div className="text-gray-700">{msg.message}</div>
              <div className="text-xs text-gray-400">
                {msg.timestamp && (new Date(msg.timestamp.seconds ? msg.timestamp.seconds * 1000 : msg.timestamp)).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Inbox; 