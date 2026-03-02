// ==================== STATE ====================
let records = JSON.parse(localStorage.getItem('census_records') || '[]');
let currentFilter = 'all';
let currentWardFilter = 'all'; 
let editingId = null;

// ฝัง URL ลงในโค้ดตรงนี้
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzdiRVVO1pICoE1ELZESJdFtHq-X2v3IR4IXHAvdWaDZdgGH3wZUxP9cyvSkDi5ixc9Rg/exec";
const GOOGLE_SHEET_NAME = "Census";

// ==================== USERS DATABASE ====================
const APP_USERS = {
  "admin": { pass: "1234", role: "admin", name: "ผู้ดูแลระบบกลาง", ward: "all" },
  "13": { pass: "1234", role: "ward", name: "หอผู้ป่วย สก.3", ward: "หอผู้ป่วย สก.3" },
  "14": { pass: "1234", role: "ward", name: "หอผู้ป่วย สก.4", ward: "หอผู้ป่วย สก.4" },
  "15": { pass: "1234", role: "ward", name: "หอผู้ป่วย สก.5", ward: "หอผู้ป่วย สก.5" },
  "16": { pass: "1234", role: "ward", name: "หอผู้ป่วย สก.6", ward: "หอผู้ป่วย สก.6" },
  "90": { pass: "1234", role: "ward", name: "หอผู้ป่วยสงฆ์อาพาธ", ward: "หอผู้ป่วยสงฆ์อาพาธ" },
  "91": { pass: "1234", role: "ward", name: "หอผู้ป่วยสงฆ์พิเศษ 2+3", ward: "หอผู้ป่วยสงฆ์พิเศษ 2+3" },
  "11": { pass: "1234", role: "ward", name: "หอผู้ป่วยสามัญติดเชื้อ ธารน้ำใจ 1", ward: "หอผู้ป่วยสามัญติดเชื้อ ธารน้ำใจ 1" },
  "18": { pass: "1234", role: "ward", name: "หอผู้ป่วยสามัญติดเชื้อ ธารน้ำใจ 2", ward: "หอผู้ป่วยสามัญติดเชื้อ ธารน้ำใจ 2" },
  "40": { pass: "1234", role: "ward", name: "หอผู้ป่วยพิเศษอายุรกรรมชลาทรล่าง", ward: "หอผู้ป่วยพิเศษอายุรกรรมชลาทรล่าง" },
  "17": { pass: "1234", role: "ward", name: "หอผู้ป่วยพิเศษอายุรกรรมชลาทรบน", ward: "หอผู้ป่วยพิเศษอายุรกรรมชลาทรบน" },
  "29": { pass: "1234", role: "ward", name: "หอผู้ป่วย Low Immune ธนจ.4", ward: "หอผู้ป่วย Low Immune ธนจ.4" },
  "22": { pass: "1234", role: "ward", name: "หอผู้ป่วยชลาทิศ 1", ward: "หอผู้ป่วยชลาทิศ 1" },
  "24": { pass: "1234", role: "ward", name: "หอผู้ป่วยชลาทิศ 2", ward: "หอผู้ป่วยชลาทิศ 2" },
  "39": { pass: "1234", role: "ward", name: "หอผู้ป่วยชลาทิศ 3", ward: "หอผู้ป่วยชลาทิศ 3" },
  "25": { pass: "1234", role: "ward", name: "หอผู้ป่วยชลาทิศ 4", ward: "หอผู้ป่วยชลาทิศ 4" },
  "27": { pass: "1234", role: "ward", name: "หอผู้ป่วยพิเศษศัลยกรรม ฉ.7", ward: "หอผู้ป่วยพิเศษศัลยกรรม ฉ.7" },
  "28": { pass: "1234", role: "ward", name: "หอผู้ป่วยพิเศษศัลยกรรม ฉ.8", ward: "หอผู้ป่วยพิเศษศัลยกรรม ฉ.8" },
  "94": { pass: "1234", role: "ward", name: "หอผู้ป่วยพิเศษศัลยกรรม Ex.9", ward: "หอผู้ป่วยพิเศษศัลยกรรม Ex.9" },
  "23": { pass: "1234", role: "ward", name: "หอผู้ป่วยแผลไหม้", ward: "หอผู้ป่วยแผลไหม้" },
  "34": { pass: "1234", role: "ward", name: "หอผู้ป่วยเคมีบำบัด", ward: "หอผู้ป่วยเคมีบำบัด" },
  "30": { pass: "1234", role: "ward", name: "หอผู้ป่วยหลังคลอด", ward: "หอผู้ป่วยหลังคลอด" },
  "41": { pass: "1234", role: "ward", name: "หอผู้ป่วยนรีเวช ชลารักษ์4", ward: "หอผู้ป่วยนรีเวช ชลารักษ์4" },
  "42": { pass: "1234", role: "ward", name: "หอผู้ป่วยพิเศษนรีเวช ชลารักษ์4", ward: "หอผู้ป่วยพิเศษนรีเวช ชลารักษ์4" },
  "81": { pass: "1234", role: "ward", name: "หอผู้ป่วยกระดูกชาย", ward: "หอผู้ป่วยกระดูกชาย" },
  "82": { pass: "1234", role: "ward", name: "หอผู้ป่วยศัลยกรรมอุบัติเหตุและกระดูกหญิง", ward: "หอผู้ป่วยศัลยกรรมอุบัติเหตุและกระดูกหญิง" },
  "44": { pass: "1234", role: "ward", name: "หอผู้ป่วยพิเศษศัลยกรรม Ex.8", ward: "หอผู้ป่วยพิเศษศัลยกรรม Ex.8" },
  "61": { pass: "1234", role: "ward", name: "หอผู้ป่วยสามัญ EENT และศัลยกรรมเด็ก ชว.3", ward: "หอผู้ป่วยสามัญ EENT และศัลยกรรมเด็ก ชว.3" },
  "10": { pass: "1234", role: "ward", name: "หอผู้ป่วยพิเศษ EENT", ward: "หอผู้ป่วยพิเศษ EENT" }
};

// ==================== AUTH / LOGIN ====================
function checkAuth() {
  const isLoggedIn = sessionStorage.getItem('isLoggedIn');
  if (isLoggedIn === 'true') {
    document.getElementById('loginOverlay').style.display = 'none';
    document.getElementById('mainContent').style.display = 'block';
    
    document.getElementById('displayUserName').textContent = '👤 ' + sessionStorage.getItem('userName');
    
    const role = sessionStorage.getItem('userRole');
    if (role === 'admin') {
      document.getElementById('btnAddRecord').style.display = 'none'; 
      document.getElementById('adminWardFilter').style.display = 'inline-block'; 
    } else {
      document.getElementById('btnAddRecord').style.display = 'flex'; 
      document.getElementById('adminWardFilter').style.display = 'none'; 
    }

    initApp();
  } else {
    document.getElementById('loginOverlay').style.display = 'flex';
    document.getElementById('mainContent').style.display = 'none';
  }
}

function handleLogin() {
  const userKey = document.getElementById('username').value.trim().toLowerCase();
  const pass = document.getElementById('password').value;
  const errorMsg = document.getElementById('loginError');
  
  if (APP_USERS[userKey] && APP_USERS[userKey].pass === pass) {
    const userData = APP_USERS[userKey];
    sessionStorage.setItem('isLoggedIn', 'true');
    sessionStorage.setItem('userRole', userData.role);
    sessionStorage.setItem('userWard', userData.ward);
    sessionStorage.setItem('userName', userData.name);
    
    errorMsg.style.display = 'none';
    checkAuth();
    showToast(`เข้าสู่ระบบ: ${userData.name} ✓`, 'success');
  } else {
    errorMsg.style.display = 'block';
  }
}

function handleLogout() {
  sessionStorage.clear();
  location.reload();
}

// ==================== INIT ====================
function initApp() {
  updateHeaderDate();
  setInterval(updateHeaderDate, 1000);
  
  if(document.getElementById('gsDot')) {
    document.getElementById('gsDot').className = 'gs-dot connected';
  }
  
  renderTable();
  updateStats();
  document.getElementById('fDate').valueAsDate = new Date();

  loadFromGoogleSheets();
}

function updateHeaderDate() {
  const now = new Date();
  document.getElementById('headerDate').textContent = now.toLocaleDateString('th-TH', {
    weekday:'short', year:'numeric', month:'short', day:'numeric'
  }) + ' ' + now.toLocaleTimeString('th-TH', { hour:'2-digit', minute:'2-digit' });
}

// ==================== GOOGLE SHEETS ====================
async function syncToGoogleSheets() {
  showToast('กำลัง Sync...', 'success');
  const rows = records.map(r => [
    r.date, shiftLabel(r.shift), r.ward,
    r.before, r.admit, r.discharge, r.transIn, r.transOut, r.death, r.remain, r.bed,
    r.hn, r.rn, r.tn, r.pn, r.na, r.note 
  ]);
  try {
    const res = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST', mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'sync', sheetName: GOOGLE_SHEET_NAME, rows })
    });
    showToast('Sync ไป Google Sheets สำเร็จ ✓', 'success');
  } catch (e) {
    showToast('Sync สำเร็จ (no-cors mode) ✓', 'success');
  }
}

async function loadFromGoogleSheets() {
  try {
    if(document.getElementById('gsLabel')) {
      document.getElementById('gsLabel').textContent = 'กำลังโหลดข้อมูลล่าสุด...';
    }
    const res = await fetch(GOOGLE_SCRIPT_URL);
    const data = await res.json();
    if (data && Array.isArray(data)) {
      records = data; 
      localStorage.setItem('census_records', JSON.stringify(records));
      renderTable();
      updateStats();
    }
    if(document.getElementById('gsLabel')) {
      document.getElementById('gsLabel').textContent = 'เชื่อมต่อ Google Sheets แล้ว';
    }
  } catch (e) {
    console.error('Load Error:', e);
    if(document.getElementById('gsLabel')) {
      document.getElementById('gsLabel').textContent = 'ออฟไลน์ (แสดงข้อมูลในเครื่อง)';
    }
  }
}

function shiftLabel(s) {
  return s == '1' ? 'เวรเช้า (08-16)' : s == '2' ? 'เวรบ่าย (16-24)' : 'เวรดึก (00-08)';
}

// ==================== CRUD ====================
function openModal(id = null) {
  editingId = id;
  const userRole = sessionStorage.getItem('userRole');
  const userWard = sessionStorage.getItem('userWard');
  const wardSelect = document.getElementById('fWard');

  document.getElementById('editId').value = id || '';
  document.getElementById('modalTitle').textContent = id ? '✏️ แก้ไขบันทึก' : '➕ เพิ่มบันทึกใหม่';

  if (id) {
    const r = records.find(x => x.id == id);
    if (!r) return;
    document.getElementById('fDate').value = r.date;
    document.getElementById('fShift').value = r.shift;
    wardSelect.value = r.ward;
    document.getElementById('fBefore').value = r.before;
    document.getElementById('fAdmit').value = r.admit;
    document.getElementById('fDischarge').value = r.discharge;
    document.getElementById('fTransIn').value = r.transIn;
    document.getElementById('fTransOut').value = r.transOut;
    document.getElementById('fDeath').value = r.death;
    document.getElementById('fRemain').value = r.remain;
    document.getElementById('fBed').value = r.bed;
    document.getElementById('fHN').value = r.hn;
    document.getElementById('fRN').value = r.rn;
    document.getElementById('fTN').value = r.tn;
    document.getElementById('fPN').value = r.pn || 0; 
    document.getElementById('fNA').value = r.na;
    document.getElementById('fNote').value = r.note || 0; // แก้ให้ดึงค่าภาระงานเป็นตัวเลข
  } else {
    document.getElementById('fDate').valueAsDate = new Date();
    // เคลียร์ค่าทั้งหมดให้เป็น 0 (รวม fNote ด้วย)
    ['fBefore','fAdmit','fDischarge','fTransIn','fTransOut','fDeath','fRemain','fBed','fHN','fRN','fTN','fPN','fNA','fNote'].forEach(id => {
      document.getElementById(id).value = 0;
    });
    document.getElementById('fShift').value = '1';
    
    wardSelect.value = userRole === 'admin' ? '' : userWard;
  }

  if (userRole !== 'admin') {
    wardSelect.value = userWard;
    wardSelect.disabled = true;  
    wardSelect.style.opacity = '0.7';
  } else {
    wardSelect.disabled = false;
    wardSelect.style.opacity = '1';
  }

  calcRemain();
  document.getElementById('modalOverlay').classList.add('open');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  editingId = null;
}

function handleOverlayClick(e) {
  if (e.target === document.getElementById('modalOverlay')) closeModal();
}

function calcRemain() {
  const b = +document.getElementById('fBefore').value || 0;
  const a = +document.getElementById('fAdmit').value || 0;
  const d = +document.getElementById('fDischarge').value || 0;
  const ti = +document.getElementById('fTransIn').value || 0;
  const to = +document.getElementById('fTransOut').value || 0;
  const de = +document.getElementById('fDeath').value || 0;
  document.getElementById('fRemain').value = b + a + ti - d - to - de;
}

function saveRecord() {
  const date = document.getElementById('fDate').value;
  const wardSelect = document.getElementById('fWard');
  const ward = wardSelect.value;
  
  if (!date || !ward) { showToast('กรุณากรอกวันที่และเลือกหน่วยงาน', 'error'); return; }

  const rec = {
    id: editingId || Date.now(),
    date, shift: document.getElementById('fShift').value,
    ward, before: +document.getElementById('fBefore').value,
    admit: +document.getElementById('fAdmit').value,
    discharge: +document.getElementById('fDischarge').value,
    transIn: +document.getElementById('fTransIn').value,
    transOut: +document.getElementById('fTransOut').value,
    death: +document.getElementById('fDeath').value,
    remain: +document.getElementById('fRemain').value,
    bed: +document.getElementById('fBed').value,
    hn: +document.getElementById('fHN').value,
    rn: +document.getElementById('fRN').value,
    tn: +document.getElementById('fTN').value,
    pn: +document.getElementById('fPN').value, 
    na: +document.getElementById('fNA').value,
    note: +document.getElementById('fNote').value // เซฟภาระงานเป็นตัวเลข (+)
  };

  if (editingId) {
    const idx = records.findIndex(x => x.id == editingId);
    records[idx] = rec;
    showToast('แก้ไขบันทึกแล้ว ✓', 'success');
  } else {
    records.push(rec);
    showToast('เพิ่มบันทึกแล้ว ✓', 'success');
  }

  localStorage.setItem('census_records', JSON.stringify(records));
  closeModal();
  renderTable();
  updateStats();
  syncToGoogleSheets();
}

function deleteRecord(id) {
  if (!confirm('ต้องการลบรายการนี้?')) return;
  records = records.filter(r => r.id != id);
  localStorage.setItem('census_records', JSON.stringify(records));
  renderTable();
  updateStats();
  showToast('ลบรายการแล้ว', 'success');
  syncToGoogleSheets();
}

function filterShift(val, btn) {
  currentFilter = val;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderTable();
}

function filterWard(val) {
  currentWardFilter = val;
  renderTable();
  updateStats(); 
}

// ==================== RENDER ====================
function renderTable() {
  const tbody = document.getElementById('tableBody');
  const userRole = sessionStorage.getItem('userRole');
  const userWard = sessionStorage.getItem('userWard');

  let filtered = currentFilter === 'all' ? records : records.filter(r => r.shift === currentFilter);
  
  if (userRole !== 'admin') {
    filtered = filtered.filter(r => r.ward === userWard); 
  } else {
    if (currentWardFilter !== 'all') {
      filtered = filtered.filter(r => r.ward === currentWardFilter); 
    }
  }

  filtered = [...filtered].sort((a,b) => b.date.localeCompare(a.date) || a.shift - b.shift);

  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="18"><div class="empty-state"><div class="empty-icon">📝</div><p>ไม่มีข้อมูลตามเงื่อนไขที่เลือก</p></div></td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(r => `
    <tr>
      <td>${formatDate(r.date)}</td>
      <td><span class="shift-badge shift-${r.shift}">${shiftLabel(r.shift)}</span></td>
      <td>${r.ward}</td>
      <td class="num-cell">${r.before}</td>
      <td class="num-cell">${r.admit}</td>
      <td class="num-cell">${r.discharge}</td>
      <td class="num-cell">${r.transIn}</td>
      <td class="num-cell">${r.transOut}</td>
      <td class="num-cell">${r.death}</td>
      <td class="total-cell">${r.remain}</td>
      <td class="num-cell">${r.bed}</td>
      <td class="num-cell">${r.hn}</td>
      <td class="num-cell">${r.rn}</td>
      <td class="num-cell">${r.tn}</td>
      <td class="num-cell">${r.pn || 0}</td>
      <td class="num-cell">${r.na}</td>
      <td class="num-cell" style="font-weight: 600; color: var(--teal);">${r.note || 0}</td> <td>
        <div class="action-group">
          <button class="btn-icon edit" onclick="openModal(${r.id})" title="แก้ไข">✏️</button>
          <button class="btn-icon del" onclick="deleteRecord(${r.id})" title="ลบ">🗑</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function formatDate(d) {
  if (!d) return '—';
  const parts = d.split('-');
  return `${parts[2]}/${parts[1]}/${+parts[0]+543}`;
}

function updateStats() {
  const today = new Date().toISOString().split('T')[0];
  const userRole = sessionStorage.getItem('userRole');
  const userWard = sessionStorage.getItem('userWard');
  
  let targetRecords = records;
  
  if (userRole !== 'admin') {
    targetRecords = records.filter(r => r.ward === userWard);
  } else {
    if (currentWardFilter !== 'all') {
      targetRecords = records.filter(r => r.ward === currentWardFilter);
    }
  }

  const todayRecs = targetRecords.filter(r => r.date === today);
  document.getElementById('statTotal').textContent = todayRecs.reduce((s,r) => s + r.remain, 0);
  document.getElementById('statAdmit').textContent = todayRecs.reduce((s,r) => s + r.admit, 0);
  document.getElementById('statDischarge').textContent = todayRecs.reduce((s,r) => s + r.discharge, 0);
  document.getElementById('statRecords').textContent = targetRecords.length;
}

function showToast(msg, type = 'success') {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = (type === 'success' ? '✓ ' : '⚠ ') + msg;
  document.getElementById('toastWrap').appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  ['fBefore','fAdmit','fDischarge','fTransIn','fTransOut','fDeath'].forEach(id => {
    document.getElementById(id).addEventListener('input', calcRemain);
  });
  
  checkAuth();
});
