import { useEffect, useRef, useState } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const storage = getStorage();

const ProfileSettings = () => {
  const [user, setUser] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [nickname, setNickname] = useState('');
  const [profilePic, setProfilePic] = useState(null);
  const [profilePicUrl, setProfilePicUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Fetch profile data
        const docRef = doc(db, 'users', firebaseUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setDisplayName(data.displayName || '');
          setNickname(data.nickname || '');
          setProfilePicUrl(data.photoURL || '');
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleImageChange = (e) => {
    setError('');
    const file = e.target.files[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      setError('Only JPG, JPEG, or PNG files are allowed.');
      return;
    }
    setProfilePic(file);
    setProfilePicUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!displayName.trim() || !nickname.trim()) {
      setError('Display name and nickname cannot be empty.');
      return;
    }
    setLoading(true);
    let photoURL = profilePicUrl;
    try {
      if (profilePic) {
        // Upload to Firebase Storage
        const storageRef = ref(storage, `profile-pictures/${user.uid}`);
        await uploadBytes(storageRef, profilePic);
        photoURL = await getDownloadURL(storageRef);
      }
      // Save to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName,
        nickname,
        photoURL,
      }, { merge: true });
      setToast('Profile updated successfully');
      setTimeout(() => setToast(''), 2500);
    } catch (err) {
      setError('Failed to update profile: ' + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-pink-200 via-purple-200 to-yellow-100 pt-20 pb-8 px-2">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center animate-fade-in">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 tracking-tight">Edit Profile</h2>
        <form className="w-full flex flex-col items-center space-y-6" onSubmit={handleSubmit}>
          <div className="relative mb-2">
            <input
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageChange}
            />
            <div
              className="w-28 h-28 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 flex items-center justify-center cursor-pointer shadow-md border-4 border-white overflow-hidden"
              onClick={() => fileInputRef.current.click()}
              title="Change profile picture"
            >
              {profilePicUrl ? (
                <img src={profilePicUrl} alt="Profile" className="object-cover w-full h-full" />
              ) : (
                <span className="text-white text-4xl font-bold">U</span>
              )}
            </div>
            <div className="text-xs text-gray-400 text-center mt-2">Tap to change</div>
          </div>
          <div className="w-full">
            <label className="block text-gray-700 font-semibold mb-1">Display Name</label>
            <input
              type="text"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 text-gray-900 bg-gray-50 placeholder-gray-400"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="Display Name"
              required
            />
          </div>
          <div className="w-full">
            <label className="block text-gray-700 font-semibold mb-1">Nickname</label>
            <input
              type="text"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 text-gray-900 bg-gray-50 placeholder-gray-400"
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              placeholder="Nickname"
              required
            />
          </div>
          {error && <div className="text-red-500 text-center text-sm font-medium">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-gradient-to-tr from-pink-500 to-yellow-400 text-white font-bold text-lg shadow-md hover:from-pink-600 hover:to-yellow-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
        {toast && (
          <div className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-2 rounded-full shadow-lg text-center text-sm font-semibold animate-fade-in">
            {toast}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileSettings; 