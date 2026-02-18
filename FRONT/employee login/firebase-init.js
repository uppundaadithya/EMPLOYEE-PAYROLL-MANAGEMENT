// Replace the below config with your Firebase project config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  databaseURL: "YOUR_DATABASE_URL",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Register employee in Firebase
async function registerEmployeeFirebase(employee) {
  try {
    await db.ref('employees/' + employee.id).set(employee);
    return { ok: true };
  } catch (error) {
    return { ok: false, reason: error.message };
  }
}
