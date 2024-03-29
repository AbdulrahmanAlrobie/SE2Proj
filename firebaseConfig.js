import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getDatabase,
  set,
  push,
  ref,
  child,
  get,
  onChildAdded,
  onValue,
  remove,
  off
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import {
  getAuth,
  setPersistence,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  browserLocalPersistence,
  browserSessionPersistence,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";
const firebaseConfig = {
  apiKey: "AIzaSyD6ZB30EJWoiK3dHefpjHSIG1-2fsl4eYA",
  authDomain: "edunest-2d87c.dbapp.com",
  databaseURL:
    "https://edunest-2d87c-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "edunest-2d87c",
  storageBucket: "edunest-2d87c.appspot.com",
  messagingSenderId: "661448680628",
  appId: "1:661448680628:web:26be9e0c2411ec25afe3e1",
  measurementId: "G-MPQR8L0QLZ",
};

// Initialize db
const app = initializeApp(firebaseConfig);
const db = getDatabase();
const auth = getAuth(app);
const analytics = getAnalytics(app);
const storage = getStorage();

export { db, auth, analytics, };
export { getStorage, storage, storageRef, uploadBytes, getDownloadURL, };
export { set, push, ref, child, get, onChildAdded, remove, onValue, off};
export {
  getAuth,
  setPersistence,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  browserLocalPersistence,
  browserSessionPersistence,
};