// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-analytics.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDvxOii6dwThVHUZeu8fnDUtFcJg-WlKkY",
  authDomain: "employee-management-2d6f0.firebaseapp.com",
  projectId: "employee-management-2d6f0",
  storageBucket: "employee-management-2d6f0.firebasestorage.app",
  messagingSenderId: "770890214866",
  appId: "1:770890214866:web:b00a8fdbe5a7818fb52c0b",
  measurementId: "G-RE3BJY23F7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Handle admin login form submission
document.getElementById('admin-login-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const adminId = document.getElementById('admin-id').value;
    const adminPassword = document.getElementById('admin-password').value;

    // Check if the entered credentials match the predefined admin credentials
    const predefinedAdminId = 'admin';
    const predefinedAdminPassword = 'admin';

    if (adminId === predefinedAdminId && adminPassword === predefinedAdminPassword) {
        document.getElementById('login-message').textContent = 'Login successful! Welcome, Admin.';
        document.getElementById('login-message').style.color = '#d1d2f9';

        
    } else {
        document.getElementById('login-message').textContent = 'Invalid credentials. Please try again.';
        document.getElementById('login-message').style.color = 'red';
    }
});