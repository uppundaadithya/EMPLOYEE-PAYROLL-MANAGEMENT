// Shared employee frontend logic (mock data + auth helpers)



import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-database.js";

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

// Fetch all employees from Firebase (returns a Promise)
async function getAllEmployees() {
  try {
    const dbRef = ref(database, 'employees');
    const snapshot = await get(dbRef);
    return snapshot.exists() ? snapshot.val() : {};
  } catch (e) {
    return {};
  }
}

// Persisted employees storage key
const EMP_STORAGE_KEY = 'employees';

function loadPersistedEmployees() {
  try {
    const raw = localStorage.getItem(EMP_STORAGE_KEY) || '{}';
    return JSON.parse(raw);
  } catch (e) {
    return {};
  }
}

function savePersistedEmployees(obj) {
  localStorage.setItem(EMP_STORAGE_KEY, JSON.stringify(obj));
}

async function getAllEmployees() {
  // Only use Firebase data
  const firebaseEmployees = await fetchAllEmployeesFromFirebase();
  const persisted = loadPersistedEmployees();
  // persisted entries override Firebase if same id (for local fallback)
  return Object.assign({}, firebaseEmployees, persisted);
}
}

// Login using Firebase and show employee details
async function login(id, password) {
  if (!id) return false;
  try {
    const dbRef = ref(database, 'employees/' + id);
    const snapshot = await get(dbRef);
    if (!snapshot.exists()) return false;
    const emp = snapshot.val();
    if (emp.password && emp.password !== password) return false;
    sessionStorage.setItem('employeeId', id);
    // Show employee details (e.g., alert or render on page)
    alert(`Welcome, ${emp.name}!\nID: ${emp.id}\nEmail: ${emp.email}\nPosition: ${emp.position || ''}\nDepartment: ${emp.department || ''}`);
    return true;
  } catch (e) {
    return false;
  }
}
}

function logout() {
  sessionStorage.removeItem('employeeId');
  window.location = 'index.html';
}

async function getCurrentEmployee() {
  const id = sessionStorage.getItem('employeeId');
  if (!id) return null;
  try {
    const dbRef = ref(database, 'employees/' + id);
    const snapshot = await get(dbRef);
    return snapshot.exists() ? snapshot.val() : null;
  } catch (e) {
    return null;
  }
}

function requireAuth() {
  if (!sessionStorage.getItem('employeeId')) {
    window.location = 'index.html';
  }
}

function renderProfile(containerId) {
  const emp = getCurrentEmployee();
  if (!emp) return;
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = `
    <h2>${emp.name}</h2>
    <p><strong>Employee ID:</strong> ${emp.id}</p>
    <p><strong>Email:</strong> ${emp.email}</p>
    <p><strong>Position:</strong> ${emp.position}</p>
    <p><strong>Department:</strong> ${emp.department}</p>
  `;
}

  if (!payload || !payload.id) return { ok: false, reason: 'Missing id' };
  const id = payload.id;
  // Check if employee already exists
  const db = getDatabase();
  const dbRef = ref(db, 'employees/' + id);
  const snapshot = await get(dbRef);
  if (snapshot.exists()) return { ok: false, reason: 'Employee ID already exists' };
  // Write employee data to Firebase
  try {
    await set(dbRef, payload);
    sessionStorage.setItem('employeeId', id);
    return { ok: true, employee: payload };
  } catch (e) {
    return { ok: false, reason: e.message };
  }
}

// Remote API helpers (backend at same host:3000 or proxied)
function loginRemote(id, password) {
  return fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, password }) })
    .then(r => r.json())
    .then(j => j.ok === true)
    .catch(() => false);
}

function createEmployeeRemote(payload) {
  return fetch('/api/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    .then(r => r.json())
    .catch(() => ({ ok: false }));
}

function getProfileRemote(id) {
  return fetch(`/api/profile?id=${encodeURIComponent(id)}`).then(r => r.json()).catch(() => ({ ok: false }));
}

// PDF generation using jsPDF if available; fallback to HTML download
function generatePayslipPdf(emp) {
  if (!emp) return;
  try {
    const { jsPDF } = window.jspdf || {};
    if (jsPDF) {
      const doc = new jsPDF();
      doc.setFontSize(14);
      doc.text(`Payslip - ${emp.id}`, 14, 20);
      doc.setFontSize(11);
      doc.text(`Name: ${emp.name}`, 14, 32);
      doc.text(`ID: ${emp.id}`, 14, 40);
      const s = emp.salary || { basic: 0, hra: 0, allowances: 0, deductions: 0 };
      const gross = s.basic + s.hra + s.allowances;
      const net = gross - s.deductions;
      let y = 54;
      doc.text('Salary Breakdown:', 14, y);
      y += 8;
      doc.text(`Basic: ${s.basic}`, 14, y);
      y += 8;
      doc.text(`HRA: ${s.hra}`, 14, y);
      y += 8;
      doc.text(`Allowances: ${s.allowances}`, 14, y);
      y += 8;
      doc.text(`Deductions: ${s.deductions}`, 14, y);
      y += 8;
      doc.text(`Gross: ${gross}`, 14, y);
      y += 8;
      doc.text(`Net: ${net}`, 14, y);
      doc.save(`${emp.id}_payslip.pdf`);
      return true;
    }
  } catch (e) {
    // fallthrough
  }
  return false;
}

function downloadPayslipPdfOrHtml() {
  const emp = getCurrentEmployee();
  if (!emp) return;
  const ok = generatePayslipPdf(emp);
  if (!ok) {
    // fallback to html download
    downloadPayslip();
  }
}

function renderSalary(containerId) {
  const emp = getCurrentEmployee();
  if (!emp) return;
  const s = emp.salary;
  const gross = s.basic + s.hra + s.allowances;
  const net = gross - s.deductions;
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = `
    <h2>Salary Details</h2>
    <p><strong>Basic:</strong> ${s.basic}</p>
    <p><strong>HRA:</strong> ${s.hra}</p>
    <p><strong>Allowances:</strong> ${s.allowances}</p>
    <p><strong>Deductions:</strong> ${s.deductions}</p>
    <p><strong>Gross:</strong> ${gross}</p>
    <p><strong>Net:</strong> ${net}</p>
  `;
}

function renderHistory(tableId) {
  const emp = getCurrentEmployee();
  if (!emp) return;
  const tbody = document.getElementById(tableId);
  if (!tbody) return;
  tbody.innerHTML = emp.history
    .map(h => `<tr><td>${h.month}</td><td>${h.gross}</td><td>${h.net}</td></tr>`)
    .join('');
}

function generatePayslipHtml(emp) {
  const s = emp.salary;
  const gross = s.basic + s.hra + s.allowances;
  const net = gross - s.deductions;
  const now = new Date().toLocaleString();
  return `<!doctype html>
  <html><head><meta charset="utf-8"><title>Payslip - ${emp.id}</title>
  <style>body{font-family:Arial;padding:20px}h1{margin-bottom:0}table{width:100%;border-collapse:collapse}td,th{border:1px solid #ddd;padding:8px;text-align:left}</style>
  </head><body>
  <h1>Payslip</h1>
  <p><strong>Name:</strong> ${emp.name} &nbsp; <strong>ID:</strong> ${emp.id}</p>
  <p><strong>Generated:</strong> ${now}</p>
  <h3>Salary Breakdown</h3>
  <table>
    <tr><th>Component</th><th>Amount</th></tr>
    <tr><td>Basic</td><td>${s.basic}</td></tr>
    <tr><td>HRA</td><td>${s.hra}</td></tr>
    <tr><td>Allowances</td><td>${s.allowances}</td></tr>
    <tr><td>Deductions</td><td>${s.deductions}</td></tr>
    <tr><th>Gross</th><th>${gross}</th></tr>
    <tr><th>Net</th><th>${net}</th></tr>
  </table>
  <p>--- End of Payslip ---</p>
  </body></html>`;
}

function downloadPayslip() {
  const emp = getCurrentEmployee();
  if (!emp) return;
  const html = generatePayslipHtml(emp);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${emp.id}_payslip.html`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function openPayslipPrint() {
  const emp = getCurrentEmployee();
  if (!emp) return;
  const w = window.open('', '_blank');
  const html = generatePayslipHtml(emp);
  w.document.write(html);
  w.document.close();
  w.focus();
  // give DOM a moment then call print
  setTimeout(() => w.print(), 200);
}

// Floating label helper: toggle `.filled` on .field when input has value or focus
function initFloatingFields() {
  function updateFieldState(input) {
    const field = input.closest('.field');
    if (!field) return;
    if (input.value && input.value.trim() !== '') field.classList.add('filled');
    else field.classList.remove('filled');
  }

  document.querySelectorAll('.field input, .field textarea').forEach(input => {
    // initial state
    updateFieldState(input);
    // on input
    input.addEventListener('input', () => updateFieldState(input));
    // on focus ensure label floats
    input.addEventListener('focus', () => {
      const field = input.closest('.field'); if (field) field.classList.add('filled');
    });
    // on blur update based on content
    input.addEventListener('blur', () => updateFieldState(input));
  });
}

if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', initFloatingFields);
}
