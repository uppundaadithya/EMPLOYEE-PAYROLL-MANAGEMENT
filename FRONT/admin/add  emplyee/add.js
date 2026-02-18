import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import { getDatabase, ref, set, onValue, remove } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyDvxOii6dwThVHUZeu8fnDUtFcJg-WlKkY",
    authDomain: "employee-management-2d6f0.firebaseapp.com",
    databaseURL: "https://employee-management-2d6f0-default-rtdb.firebaseio.com/",
    projectId: "employee-management-2d6f0",
    storageBucket: "employee-management-2d6f0.firebasestorage.app",
    messagingSenderId: "770890214866",
    appId: "1:770890214866:web:b00a8fdbe5a7818fb52c0b"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const employeeForm = document.getElementById('employee-form');
const listElement = document.getElementById('list');

// 1. ADD / UPDATE DATA
employeeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('employee-id').value;
    const name = document.getElementById('employee-name').value;
    const role = document.getElementById('employee-role').value;

    set(ref(database, 'employees/' + id), { id, name, role })
        .then(() => employeeForm.reset())
        .catch(err => alert("Check Firebase Rules: " + err.message));
});

// 2. READ DATA (Live Sync)
onValue(ref(database, 'employees'), (snapshot) => {
    listElement.innerHTML = '';
    snapshot.forEach((child) => {
        const emp = child.val();
        const li = document.createElement('li');
        li.innerHTML = `
            <span><strong>${emp.id}</strong> - ${emp.name} (${emp.role})</span>
            <div>
                <button class="edit-btn" data-id="${emp.id}">Edit</button>
                <button class="remove-btn" data-id="${emp.id}">Delete</button>
            </div>
        `;
        listElement.appendChild(li);
    });
});

// 3. HANDLE CLICKS (Event Delegation)
listElement.addEventListener('click', (e) => {
    const id = e.target.getAttribute('data-id');
    if (!id) return;

    if (e.target.classList.contains('remove-btn')) {
        remove(ref(database, 'employees/' + id));
    } 
    
    if (e.target.classList.contains('edit-btn')) {
        // Find the data from the list to populate the form
        const rowText = e.target.closest('li').querySelector('span').innerText;
        // Simple way to refill form:
        const [idPart, rest] = rowText.split(' - ');
        const [namePart, rolePart] = rest.split(' (');
        
        document.getElementById('employee-id').value = idPart;
        document.getElementById('employee-name').value = namePart;
        document.getElementById('employee-role').value = rolePart.replace(')', '');
        
        // Data stays in DB until they "Add" again to overwrite or delete manually
    }
});