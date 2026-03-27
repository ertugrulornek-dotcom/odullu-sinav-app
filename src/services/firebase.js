import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCVXOTNeICNfGvLULngqkF-8fRV-W9JdPg",
  authDomain: "odulludeneme-ae8da.firebaseapp.com",
  projectId: "odulludeneme-ae8da",
  storageBucket: "odulludeneme-ae8da.firebasestorage.app",
  messagingSenderId: "749281964969",
  appId: "1:749281964969:web:cc66285c567487fbd3cab8",
  measurementId: "G-3E6EP90TN2"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const appId = 'odullu-sinav';