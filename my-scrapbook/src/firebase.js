import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';

// Your Firebase configuration
// Replace these placeholder values with your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCB0qzkED7QV3-PJT3Jp3Y5sqBVFfAnEOM",
  authDomain: "my-scrapbook-4f701.firebaseapp.com",
  projectId: "my-scrapbook-4f701",
  storageBucket: "my-scrapbook-4f701.firebasestorage.app",
  messagingSenderId: "541759460237",
  appId: "1:541759460237:web:58c6e5c7fd2785191423c4",
  measurementId: "G-C53BZJH605"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Authentication functions
export const signUpWithEmail = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const signInWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Auth state observer
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Firestore Database Functions

// Create a new document in a collection
export const createDocument = async (collectionName, data) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get a single document by ID
export const getDocument = async (collectionName, docId) => {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
    } else {
      return { success: false, error: 'Document not found' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get all documents from a collection
export const getDocuments = async (collectionName, options = {}) => {
  try {
    let q = collection(db, collectionName);
    
    // Apply filters
    if (options.where) {
      options.where.forEach(filter => {
        q = query(q, where(filter.field, filter.operator, filter.value));
      });
    }
    
    // Apply ordering
    if (options.orderBy) {
      q = query(q, orderBy(options.orderBy.field, options.orderBy.direction || 'asc'));
    }
    
    // Apply limit
    if (options.limit) {
      q = query(q, limit(options.limit));
    }
    
    const querySnapshot = await getDocs(q);
    const documents = [];
    
    querySnapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() });
    });
    
    return { success: true, data: documents };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Update a document
export const updateDocument = async (collectionName, docId, data) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Delete a document
export const deleteDocument = async (collectionName, docId) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Real-time listener for a collection
export const subscribeToCollection = (collectionName, callback, options = {}) => {
  let q = collection(db, collectionName);
  
  // Apply filters
  if (options.where) {
    options.where.forEach(filter => {
      q = query(q, where(filter.field, filter.operator, filter.value));
    });
  }
  
  // Apply ordering
  if (options.orderBy) {
    q = query(q, orderBy(options.orderBy.field, options.orderBy.direction || 'asc'));
  }
  
  // Apply limit
  if (options.limit) {
    q = query(q, limit(options.limit));
  }
  
  return onSnapshot(q, (querySnapshot) => {
    const documents = [];
    querySnapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() });
    });
    callback(documents);
  });
};

// Real-time listener for a single document
export const subscribeToDocument = (collectionName, docId, callback) => {
  const docRef = doc(db, collectionName, docId);
  
  return onSnapshot(docRef, (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() });
    } else {
      callback(null);
    }
  });
};

// Helper function to convert Firestore timestamp to JavaScript Date
export const convertTimestamp = (timestamp) => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  return timestamp;
};

// Helper function to create a user profile document
export const createUserProfile = async (userId, userData) => {
  try {
    const result = await createDocument('users', {
      uid: userId,
      email: userData.email,
      displayName: userData.displayName || '',
      photoURL: userData.photoURL || '',
      ...userData
    });
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Helper function to get user profile
export const getUserProfile = async (userId) => {
  try {
    const result = await getDocuments('users', {
      where: [{ field: 'uid', operator: '==', value: userId }]
    });
    
    if (result.success && result.data.length > 0) {
      return { success: true, data: result.data[0] };
    } else {
      return { success: false, error: 'User profile not found' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export default app; 