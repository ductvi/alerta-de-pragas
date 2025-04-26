import { initializeApp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBZ_Wyii2n79cPkpalEp6_Lx_OX6B4l09w",
  authDomain: "plague-alert.firebaseapp.com",
  projectId: "plague-alert",
  storageBucket: "plague-alert.appspot.com",
  messagingSenderId: "847679471985",
  appId: "1:847679471985:web:c4903bea1637ed248cf6d0"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };  // Apenas isso deve ser exportado