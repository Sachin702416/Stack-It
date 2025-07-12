
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBQS-NqzO2PD4lv4JnBA0AnEVxoudDG2MQ",
  authDomain: "stack-it-d51c7.firebaseapp.com",
  projectId: "stack-it-d51c7",
  storageBucket: "stack-it-d51c7.firebasestorage.app",
  messagingSenderId: "934760775717",
  appId: "1:934760775717:web:b7425fc2bae6863bcbffcc"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
