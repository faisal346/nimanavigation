import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
const firebaseConfig = {
 apiKey: "AIzaSyC5jD6f7duj0LKT_5qwLJ-RHqbDsqy4Tuo",
 authDomain: "pantry-checker-project.firebaseapp.com",
 projectId: "pantry-checker-project",
 storageBucket: "pantry-checker-project.appspot.com",
 messagingSenderId: "993734222492",
 appId: "1:993734222492:web:9f3499eccc7b0b0e430359"
 };
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
export { firestore };