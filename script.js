/* ================================================================
   ER System — Shared Scripts
   Used by: Index.html, dashboard.html, alert-panel.html
   ================================================================ */

/* ── Detect current page ── */
const currentPage = document.body.dataset.page;

/* ── Audit Logger (shared) ── */
function logAudit(user, status, pin) {
  var logs = JSON.parse(localStorage.getItem('loginAudit') || '[]');
  logs.unshift({
    time: new Date().toLocaleString('th-TH', { hour12: false }),
    user: user || 'unknown',
    status: status,
    pin: pin,
    ip: '192.168.1.' + Math.floor(Math.random() * 254 + 1),
    device: navigator.userAgent.indexOf('Chrome') > -1 ? 'Chrome' :
            navigator.userAgent.indexOf('Safari') > -1 ? 'Safari' :
            navigator.userAgent.indexOf('Firefox') > -1 ? 'Firefox' : 'Unknown',
    os: navigator.platform || 'Unknown'
  });
  if (logs.length > 50) logs = logs.slice(0, 50);
  localStorage.setItem('loginAudit', JSON.stringify(logs));
}

/* ── Global: Reset Demo Button ── */
var resetBtn = document.getElementById('resetDemoBtn');
if (resetBtn) {
  resetBtn.addEventListener('click', function() {
    if (!confirm('Reset ข้อมูลทั้งหมดกลับเป็น Demo ตั้งต้น?\n\nข้อมูลที่เปลี่ยนแปลงจะหายทั้งหมด')) return;
    localStorage.removeItem('er_system_data');
    localStorage.removeItem('loginAudit');
    window.location.href = 'dashboard.html';
  });
}

/* ── Global: Sidebar modal links (redirect to dashboard if not on dashboard) ── */
if (currentPage !== 'dashboard' && currentPage !== 'login') {
  var sidebarModalLinks = {
    'createPAFromSidebar': 'dashboard.html?modal=createPA',
    'openPreArrival': 'dashboard.html?modal=preArrival',
    'openEmsFromSidebar': 'dashboard.html?modal=ems',
    'openAuditModal': 'dashboard.html?modal=audit'
  };
  Object.keys(sidebarModalLinks).forEach(function(id) {
    var el = document.getElementById(id);
    if (el) {
      el.addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = sidebarModalLinks[id];
      });
    }
  });
  /* Settings link — placeholder */
  document.querySelectorAll('.sb-item[href="#"]').forEach(function(el) {
    if (!el.id) {
      el.addEventListener('click', function(e) { e.preventDefault(); });
    }
  });
}

/* ── Login Page ──────────────────────────── */
if (currentPage === 'login') {

    /* ── Elements ── */
    const form        = document.getElementById('loginForm');
    const btnLogin    = document.getElementById('btnLogin');
    const usernameEl  = document.getElementById('username');
    const passwordEl  = document.getElementById('password');
    const togglePw    = document.getElementById('togglePw');
    const eyeIcon     = document.getElementById('eyeIcon');
    const alertError  = document.getElementById('alertError');

    const pinModal      = document.getElementById('pinModal');
    const modalClose    = document.getElementById('modalClose');
    const modalForm     = document.getElementById('modalForm');
    const modalSuccess  = document.getElementById('modalSuccess');
    const modalUsername  = document.getElementById('modalUsername');
    const pinHiddenInput = document.getElementById('pinHiddenInput');
    const pinBoxes      = document.querySelectorAll('.pin-box');
    const pinWrap       = document.getElementById('pinWrap');
    const pinError      = document.getElementById('pinError');
    const pinHint       = document.getElementById('pinHint');
    const btnVerify     = document.getElementById('btnVerify');

    const eyeOpen = `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`;
    const eyeOff  = `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>`;

    let currentUsername = '';

    /* ── Toggle password ── */
    togglePw.addEventListener('click', () => {
      const isPassword = passwordEl.type === 'password';
      passwordEl.type = isPassword ? 'text' : 'password';
      eyeIcon.innerHTML = isPassword ? eyeOff : eyeOpen;
    });

    /* ── Clear field errors ── */
    usernameEl.addEventListener('input', () => clearError('username'));
    passwordEl.addEventListener('input', () => clearError('password'));

    function clearError(field) {
      document.getElementById(field).classList.remove('error');
      document.getElementById(field + 'Error').classList.remove('show');
      alertError.classList.remove('show');
    }

    function showFieldError(field, msg) {
      document.getElementById(field).classList.add('error');
      const el = document.getElementById(field + 'Error');
      el.textContent = msg;
      el.classList.add('show');
    }

    /* ── Login Form Submit ── */
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      alertError.classList.remove('show');

      const username = usernameEl.value.trim();
      const password = passwordEl.value;
      let valid = true;

      if (!username) { showFieldError('username', 'กรุณากรอกชื่อผู้ใช้'); valid = false; }
      if (!password) { showFieldError('password', 'กรุณากรอกรหัสผ่าน'); valid = false; }
      if (!valid) return;

      btnLogin.classList.add('loading');
      btnLogin.disabled = true;

      await new Promise(r => setTimeout(r, 1200));

      btnLogin.classList.remove('loading');
      btnLogin.disabled = false;

      if (username === 'admin' && password === 'admin1234') {
        currentUsername = username;
        openPinModal();
      } else {
        logAudit(username, 'fail', '—');
        alertError.classList.add('show');
        document.getElementById('alertErrorMsg').textContent =
          'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง';
        usernameEl.classList.add('error');
        passwordEl.classList.add('error');
        passwordEl.value = '';
        passwordEl.focus();
      }
    });

    /* ── PIN Modal ── */
    function openPinModal() {
      modalUsername.textContent = currentUsername;
      modalForm.classList.remove('hide');
      modalSuccess.classList.remove('show');
      pinError.textContent = '';
      pinHint.style.display = '';
      pinHiddenInput.value = '';
      renderPinBoxes();
      btnVerify.disabled = true;
      btnVerify.classList.remove('loading');
      pinModal.classList.add('show');
      setTimeout(() => pinHiddenInput.focus(), 200);
    }

    function closePinModal() {
      pinModal.classList.remove('show');
    }

    modalClose.addEventListener('click', closePinModal);
    pinModal.addEventListener('click', (e) => { if (e.target === pinModal) closePinModal(); });

    /* Click on boxes -> focus hidden input */
    pinWrap.addEventListener('click', () => pinHiddenInput.focus());

    /* ── PIN Logic via hidden input ── */
    function renderPinBoxes() {
      const val = pinHiddenInput.value;
      pinBoxes.forEach((box, i) => {
        box.textContent = val[i] || '';
        box.classList.remove('active', 'filled', 'error', 'success');
        if (val[i]) box.classList.add('filled');
      });
      /* Show active cursor on next empty box */
      const activeIdx = Math.min(val.length, 5);
      if (val.length < 6) pinBoxes[activeIdx].classList.add('active');
      btnVerify.disabled = val.length < 6;
    }

    pinHiddenInput.addEventListener('input', () => {
      pinHiddenInput.value = pinHiddenInput.value.replace(/\D/g, '').slice(0, 6);
      pinError.textContent = '';
      pinHint.style.display = '';
      pinBoxes.forEach(b => b.classList.remove('error'));
      renderPinBoxes();
    });

    pinHiddenInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && pinHiddenInput.value.length === 6) verifyPin();
      if (e.key === 'Escape') closePinModal();
    });

    pinHiddenInput.addEventListener('focus', () => renderPinBoxes());
    pinHiddenInput.addEventListener('blur', () => {
      pinBoxes.forEach(b => b.classList.remove('active'));
    });

    /* ── Verify PIN ── */
    btnVerify.addEventListener('click', verifyPin);

    async function verifyPin() {
      const pin = pinHiddenInput.value;
      if (pin.length < 6) return;

      pinError.textContent = '';
      btnVerify.classList.add('loading');
      btnVerify.disabled = true;

      await new Promise(r => setTimeout(r, 1000));
      btnVerify.classList.remove('loading');

      if (pin === '123456') {
        logAudit(currentUsername, 'success', 'ผ่าน');
        pinBoxes.forEach(b => { b.classList.remove('filled', 'active'); b.classList.add('success'); });
        setTimeout(() => {
          modalForm.classList.add('hide');
          modalSuccess.classList.add('show');
        }, 400);
        setTimeout(() => { window.location.href = 'dashboard.html'; }, 2500);
      } else {
        logAudit(currentUsername, 'pin-fail', 'PIN ผิด');
        pinBoxes.forEach(b => { b.classList.remove('filled', 'active'); b.classList.add('error'); });
        pinHiddenInput.value = '';
        btnVerify.disabled = true;
        pinError.textContent = 'PIN ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง';
        pinHint.style.display = 'none';
        setTimeout(() => {
          pinBoxes.forEach(b => b.classList.remove('error'));
          renderPinBoxes();
          pinHiddenInput.focus();
        }, 500);
      }
    }

    /* ── Forgot Password ── */
    const forgotLink     = document.getElementById('forgotLink');
    const forgotModal    = document.getElementById('forgotModal');
    const forgotClose    = document.getElementById('forgotClose');
    const forgotForm     = document.getElementById('forgotForm');
    const forgotSuccess  = document.getElementById('forgotSuccess');
    const forgotUsernameEl = document.getElementById('forgotUsername');
    const forgotErrorEl  = document.getElementById('forgotError');
    const btnForgot      = document.getElementById('btnForgot');
    const forgotBack     = document.getElementById('forgotBack');
    const btnBackLogin   = document.getElementById('btnBackLogin');
    const forgotSentEmail = document.getElementById('forgotSentEmail');

    forgotLink.addEventListener('click', (e) => {
      e.preventDefault();
      openForgotModal();
    });

    function openForgotModal() {
      forgotForm.classList.remove('hide');
      forgotSuccess.classList.remove('show');
      forgotUsernameEl.value = usernameEl.value || '';
      forgotUsernameEl.classList.remove('error');
      forgotErrorEl.classList.remove('show');
      btnForgot.classList.remove('loading');
      btnForgot.disabled = false;
      forgotModal.classList.add('show');
      setTimeout(() => forgotUsernameEl.focus(), 200);
    }

    function closeForgotModal() {
      forgotModal.classList.remove('show');
    }

    forgotClose.addEventListener('click', closeForgotModal);
    forgotBack.addEventListener('click', closeForgotModal);
    btnBackLogin.addEventListener('click', closeForgotModal);
    forgotModal.addEventListener('click', (e) => { if (e.target === forgotModal) closeForgotModal(); });

    forgotUsernameEl.addEventListener('input', () => {
      forgotUsernameEl.classList.remove('error');
      forgotErrorEl.classList.remove('show');
    });

    forgotUsernameEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') btnForgot.click();
      if (e.key === 'Escape') closeForgotModal();
    });

    btnForgot.addEventListener('click', async () => {
      const val = forgotUsernameEl.value.trim();
      if (!val) {
        forgotUsernameEl.classList.add('error');
        forgotErrorEl.classList.add('show');
        forgotUsernameEl.focus();
        return;
      }

      btnForgot.classList.add('loading');
      btnForgot.disabled = true;

      await new Promise(r => setTimeout(r, 1500));

      btnForgot.classList.remove('loading');
      forgotSentEmail.textContent = val;
      forgotForm.classList.add('hide');
      forgotSuccess.classList.add('show');
    });

}

/* ── Dashboard Page ──────────────────────── */
if (currentPage === 'dashboard') {

  /* Clock */
  function tick() {
    document.getElementById('clock').textContent =
      new Date().toLocaleTimeString('th-TH', { hour12: false });
  }
  tick(); setInterval(tick, 1000);

  /* Auto-open modal from URL param (when redirected from other pages) */
  (function() {
    var p = new URLSearchParams(window.location.search).get('modal');
    if (!p) return;
    setTimeout(function() {
      var map = {
        createPA: 'createPAModal',
        preArrival: 'preArrivalModal',
        ems: 'emsTimelineModal',
        audit: 'auditModal'
      };
      var modalId = map[p];
      if (modalId) {
        var m = document.getElementById(modalId);
        if (m) m.classList.add('show');
      }
    }, 300);
  })();

  /* ── Render Dashboard from ERStore ── */
  (function renderDashboard() {
    var data = ERStore.get();
    var s = data.summary;

    /* Overview Cards */
    var ovNums = document.querySelectorAll('.ov-num');
    var ovSubs = document.querySelectorAll('.ov-sub');
    if (ovNums.length >= 5) {
      ovNums[0].textContent = s.total;
      ovNums[1].textContent = s.waitingDoctor;
      ovNums[2].textContent = s.observe;
      ovNums[3].textContent = s.waitingBed;
      ovNums[4].textContent = s.waitingRefer;
      /* Compute bed counts dynamically from actual bed data */
      var _realBeds = data.beds;
      var _bc = { free:0, occ:0, rsv:0, clean:0 };
      Object.values(_realBeds).forEach(function(b) { _bc[b.status] = (_bc[b.status]||0) + 1; });
      var _bt = Object.keys(_realBeds).length;
      if (ovSubs[3]) ovSubs[3].textContent = 'เตียงว่าง ' + _bc.free + '/' + _bt;
    }

    /* Triage bars */
    var triVals = document.querySelectorAll('.tri-val');
    var triBars = document.querySelectorAll('.tri-bar');
    var maxTri = Math.max(s.triage.resus, s.triage.emer, s.triage.urg, s.triage.semi, s.triage.non, 1);
    if (triVals.length >= 5 && triBars.length >= 5) {
      var triArr = [s.triage.resus, s.triage.emer, s.triage.urg, s.triage.semi, s.triage.non];
      for (var i = 0; i < 5; i++) {
        triVals[i].textContent = triArr[i];
        triBars[i].style.width = Math.round((triArr[i] / maxTri) * 100) + '%';
      }
    }

    /* Bed grid */
    var beds = data.beds;
    document.querySelectorAll('.bed').forEach(function(bedEl) {
      var bedId = bedEl.querySelector('.bed-id');
      if (!bedId) return;
      var id = bedId.textContent.trim();
      var info = beds[id];
      if (!info) return;

      bedEl.className = 'bed ' + info.status;
      var statusText = { occ:'ไม่ว่าง', free:'ว่าง', rsv:'จอง', clean:'ทำความสะอาด' };

      if (info.status === 'occ' && info.patient && data.patients[info.patient]) {
        var p = data.patients[info.patient];
        if (p.level === '1') bedEl.innerHTML = '<div class="bed-id">' + id + '</div>วิกฤต';
        else bedEl.innerHTML = '<div class="bed-id">' + id + '</div>ไม่ว่าง';
      } else {
        bedEl.innerHTML = '<div class="bed-id">' + id + '</div>' + (statusText[info.status] || info.status);
      }
    });

    /* Bed legend */
    var bedCounts = { free:0, occ:0, rsv:0, clean:0 };
    Object.values(beds).forEach(function(b) { bedCounts[b.status] = (bedCounts[b.status] || 0) + 1; });
    var legendItems = document.querySelectorAll('.bed-legend-i');
    if (legendItems.length >= 4) {
      legendItems[0].innerHTML = '<div class="dot" style="background:var(--green)"></div>ว่าง (' + bedCounts.free + ')';
      legendItems[1].innerHTML = '<div class="dot" style="background:var(--red-500)"></div>ไม่ว่าง (' + bedCounts.occ + ')';
      legendItems[2].innerHTML = '<div class="dot" style="background:var(--warn)"></div>จอง (' + bedCounts.rsv + ')';
      legendItems[3].innerHTML = '<div class="dot" style="background:var(--blue)"></div>ทำความสะอาด (' + bedCounts.clean + ')';
    }

    /* Staff */
    var staffItems = document.querySelectorAll('.staff-item');
    data.staff.forEach(function(st, idx) {
      if (!staffItems[idx]) return;
      var nameEl = staffItems[idx].querySelector('.sname');
      var roleEl = staffItems[idx].querySelector('.srole');
      var statusEl = staffItems[idx].querySelector('.staff-status');
      var ptsEl = staffItems[idx].querySelector('.staff-pts');
      if (nameEl) nameEl.textContent = st.name;
      if (roleEl) roleEl.textContent = st.role;
      if (statusEl) {
        statusEl.textContent = st.status === 'busy' ? 'กำลังรักษา' : 'ว่าง';
        statusEl.className = 'staff-status ' + (st.status === 'busy' ? 'busy' : 'on');
      }
      if (ptsEl) ptsEl.textContent = st.patients > 0 ? st.patients + ' ราย' : '—';
    });

    /* Pre-Arrival count */
    var paCount = document.querySelector('.pa-dash-count');
    if (paCount) paCount.textContent = data.preArrivals.length;

  })();

  /* Mobile sidebar */
  const sb = document.getElementById('sidebar');
  const ov = document.getElementById('sbOverlay');
  document.getElementById('menuBtn').onclick = () => { sb.classList.toggle('open'); ov.classList.toggle('show'); };
  ov.onclick = () => { sb.classList.remove('open'); ov.classList.remove('show'); };

  /* ── Pre-Arrival ETA Countdown (every second) ── */
  var statusMessages = {
    PA0301: [
      'กำลังเดินทาง · CPR ongoing · Lucas device on',
      'กำลังเดินทาง · CPR ongoing · VF persist',
      'กำลังเดินทาง · Adrenaline #3 given · CPR ongoing',
      'ใกล้ถึง · CPR ongoing · เตรียมรับ Resus room',
      'เข้าซอย รพ. · CPR ongoing · 1 นาทีถึง'
    ],
    PA0302: [
      'กำลังเดินทาง · IV running · Vital stable',
      'กำลังเดินทาง · BP 78/48 · ให้ NSS ขวดที่ 2',
      'กำลังเดินทาง · HR 138 · SpO2 93%',
      'ผ่านแยกหลัก · อีก 10 นาที',
      'ใกล้ถึง · ผู้ป่วย conscious · BP 82/52'
    ],
    PA0303: [
      'กำลังเดินทาง · GCS 13 คงที่ · แจ้ง CT ล่วงหน้าแล้ว',
      'กำลังเดินทาง · BP 180/105 · อาการคงที่',
      'กำลังเดินทาง · แขนซ้ายอ่อนแรง Grade 2',
      'ผ่านทางด่วน · GCS 13 คงที่',
      'ใกล้ถึง · onset 1 ชม. 40 นาที · ยังอยู่ใน window'
    ]
  };

  setInterval(function() {
    document.querySelectorAll('.pa-countdown').forEach(function(el) {
      var secs = parseInt(el.dataset.seconds) || 0;
      if (secs <= 0) return;

      secs--;
      el.dataset.seconds = secs;

      /* Format MM:SS */
      var m = Math.floor(secs / 60);
      var s = secs % 60;
      el.textContent = m + ':' + (s < 10 ? '0' : '') + s;

      /* Update progress bar */
      var card = el.closest('.pa-mini');
      if (!card) return;
      var total = parseInt(card.dataset.etaTotal) || 1;
      var elapsed = total - secs;
      var pct = Math.min(Math.round((elapsed / total) * 100), 100);
      var bar = card.querySelector('.pa-progress-bar');
      if (bar) bar.style.width = pct + '%';

      /* Update ETA box color */
      var etaBox = el.closest('.pa-mini-eta-box');
      if (secs <= 60) {
        etaBox.classList.add('arriving');
        etaBox.classList.remove('near');
        el.textContent = secs + ' วินาที';
      } else if (secs <= 180) {
        etaBox.classList.add('near');
      }

      /* Simulate status updates */
      var caseKey = (card.dataset.caseId || '').replace('-','');
      var msgs = statusMessages[caseKey];
      if (msgs) {
        var idx = Math.min(Math.floor((pct / 100) * msgs.length), msgs.length - 1);
        var statusText = card.querySelector('.pa-status-text');
        if (statusText) statusText.textContent = msgs[idx];
      }

      /* Arrived! */
      if (secs === 0) {
        el.textContent = 'ถึงแล้ว!';
        etaBox.classList.add('arriving');
        if (bar) bar.style.width = '100%';
        var statusText2 = card.querySelector('.pa-status-text');
        if (statusText2) statusText2.textContent = 'ผู้ป่วยถึง ER แล้ว — รับเข้าเตียง';
        var dot = card.querySelector('.pa-status-dot');
        if (dot) { dot.classList.remove('blink'); dot.style.background = 'var(--red-600)'; }

        /* Change prep button */
        var prepBtn = card.querySelector('.pa-prep-btn');
        if (prepBtn && !prepBtn.classList.contains('prepped')) {
          prepBtn.classList.add('prepped');
          prepBtn.textContent = 'ผู้ป่วยถึงแล้ว →';
          prepBtn.dataset.ready = 'true';
        }
      }
    });
  }, 1000);

  /* Queue item click → patient quick view */

  /* ── Patient Quick View ── */
  var pqModal = document.getElementById('patientQuickModal');
  var closePQ = document.getElementById('closePQ');
  var pqTitle = document.getElementById('pqTitle');
  var pqBody = document.getElementById('pqBody');

  if (closePQ) closePQ.addEventListener('click', function() { pqModal.classList.remove('show'); });
  if (pqModal) pqModal.addEventListener('click', function(e) { if (e.target === pqModal) pqModal.classList.remove('show'); });

  /* Mock patient data */
  var patientDB = {
    '640001': { name:'สมชาย ใจดี', gender:'ชาย', age:'55', hn:'640001', bed:'B1', zone:'Resuscitation', level:'1', levelName:'Resuscitation', doctor:'นพ.สมศักดิ์', status:'กำลังรักษา', wait:'', cc:'Cardiac arrest, หมดสติ', pmh:'HT, DLP', allergy:'ไม่มี', bp:'80/50', hr:'130', rr:'24', temp:'37.2', spo2:'89', gcs:'3', triage_time:'14:32', color:'var(--t-resus)',
      ems: { source:'EMS 1669', vehicle:'ALS-05', crew:'จ.ส.อ.สมพร / จ.ส.อ.วีระ', dispatchTime:'14:02', sceneTime:'14:10', departTime:'14:22', caseId:'PA-0301',
        vitals: [
          { time:'14:10', bp:'—', hr:'VF', rr:'0', spo2:'—', gcs:'3', note:'ไม่หายใจ ไม่มีชีพจร' },
          { time:'14:18', bp:'—', hr:'PEA', rr:'ETT', spo2:'—', gcs:'3', note:'Intubated, CPR ongoing' }
        ],
        treatments: [
          { time:'14:11', action:'เริ่ม CPR', detail:'Bystander CPR ~1 นาที → EMS ต่อ' },
          { time:'14:12', action:'Monitor ECG', detail:'Attach pads → VF detected' },
          { time:'14:13', action:'Defibrillation #1', detail:'200J biphasic → ยัง VF' },
          { time:'14:14', action:'IV Access', detail:'20G Rt. antecubital · NSS TKO' },
          { time:'14:15', action:'Adrenaline 1mg IV #1', detail:'ตาม ACLS protocol' },
          { time:'14:15', action:'Defibrillation #2', detail:'200J biphasic → ยัง VF' },
          { time:'14:18', action:'Intubation', detail:'ETT 7.5 mm · EtCO2 18' },
          { time:'14:19', action:'Adrenaline 1mg IV #2', detail:'ซ้ำทุก 3-5 นาที' },
          { time:'14:22', action:'เริ่มลำเลียง', detail:'Lucas device · CPR ongoing' }
        ],
        handoverNote:'Cardiac arrest witness, VF, CPR 21 min, Defib x2, Adrenaline x2, ETT in place, EtCO2 18, ยังเป็น VF ตลอด'
      } },
    '640012': { name:'วิภา แสงทอง', gender:'หญิง', age:'48', hn:'640012', bed:'B4', zone:'Acute Care', level:'2', levelName:'Emergency', doctor:'—', status:'รอแพทย์', wait:'52 นาที', cc:'เจ็บหน้าอกด้านซ้าย ร้าวไปแขนซ้าย 2 ชม.', pmh:'DM, HT', allergy:'Aspirin', bp:'130/85', hr:'110', rr:'22', temp:'37.0', spo2:'96', gcs:'15', triage_time:'09:42', color:'var(--t-emer)' },
    '640025': { name:'ประภาส รุ่งเรือง', gender:'ชาย', age:'35', hn:'640025', bed:'B7', zone:'Acute Care', level:'3', levelName:'Urgent', doctor:'—', status:'รอแพทย์', wait:'38 นาที', cc:'ปวดท้องรุนแรง ท้องน้อยด้านขวา', pmh:'ไม่มี', allergy:'ไม่มี', bp:'140/90', hr:'95', rr:'20', temp:'38.1', spo2:'98', gcs:'15', triage_time:'10:18', color:'var(--t-urg)' },
    '640031': { name:'นภา เจริญสุข', gender:'หญิง', age:'62', hn:'640031', bed:'B9', zone:'Acute Care', level:'3', levelName:'Urgent', doctor:'—', status:'รอแพทย์', wait:'25 นาที', cc:'ไข้สูง 40.2C มา 3 วัน ไอมีเสมหะ', pmh:'Asthma', allergy:'Penicillin', bp:'125/75', hr:'100', rr:'24', temp:'40.2', spo2:'94', gcs:'15', triage_time:'11:05', color:'var(--t-urg)' },
    '640038': { name:'ธนพล วงศ์สุวรรณ', gender:'ชาย', age:'25', hn:'640038', bed:'—', zone:'รอเตียง', level:'5', levelName:'Non-urgent', doctor:'—', status:'รอแพทย์', wait:'15 นาที', cc:'ปวดหัวเล็กน้อย 1 วัน', pmh:'ไม่มี', allergy:'ไม่มี', bp:'120/78', hr:'72', rr:'16', temp:'36.8', spo2:'99', gcs:'15', triage_time:'12:30', color:'var(--t-non)' },
    '640045': { name:'กิตติ ศรีสุข', gender:'ชาย', age:'40', hn:'640045', bed:'B4', zone:'Resuscitation', level:'1', levelName:'Resuscitation', doctor:'นพ.สมศักดิ์', status:'กำลังรักษา', wait:'', cc:'Severe Trauma, Multiple injuries, GCS 8', pmh:'ไม่มี', allergy:'ไม่มี', bp:'80/50', hr:'130', rr:'28', temp:'36.5', spo2:'88', gcs:'8', triage_time:'14:10', color:'var(--t-resus)',
      ems: { source:'EMS 1669', vehicle:'ALS-03', crew:'จ.ส.อ.นรินทร์ / นส.กัญญา', dispatchTime:'13:45', sceneTime:'13:55', departTime:'14:05', caseId:'PA-0298',
        vitals: [
          { time:'13:55', bp:'90/60', hr:'120', rr:'28', spo2:'90', gcs:'9 (E2V3M4)', note:'Multiple injuries, Rt leg open fracture' },
          { time:'14:05', bp:'80/50', hr:'130', rr:'30', spo2:'88', gcs:'8 (E2V2M4)', note:'Deteriorating, IV fluid running' }
        ],
        treatments: [
          { time:'13:56', action:'C-spine immobilization', detail:'Cervical collar + long spine board' },
          { time:'13:57', action:'O2 NRM 15 LPM', detail:'SpO2 90% → 93% หลังให้ O2' },
          { time:'13:58', action:'IV Access x2', detail:'18G ทั้ง 2 ข้าง · NSS 1000ml fast drip' },
          { time:'14:00', action:'Splint Rt. leg', detail:'Open fracture Rt. tibia · ห้ามเลือด direct pressure' },
          { time:'14:02', action:'Pelvic binder', detail:'สงสัย pelvic fracture' },
          { time:'14:05', action:'เริ่มลำเลียง', detail:'Load & Go · แจ้ง ER ล่วงหน้า' }
        ],
        handoverNote:'MVC, motorcycle vs truck, GCS 8 dropping, open fracture Rt tibia, suspect pelvic fx, BP dropping despite 1L NSS, C-spine protected'
      } },
    '640002': { name:'มาลี สายชล', gender:'หญิง', age:'70', hn:'640002', bed:'B2', zone:'Acute Care', level:'4', levelName:'Semi-urgent', doctor:'พญ.นิชา', status:'รอ Admit', wait:'', cc:'อ่อนเพลีย เวียนศีรษะ', pmh:'DM, HT, CKD', allergy:'ไม่มี', bp:'145/88', hr:'78', rr:'18', temp:'37.0', spo2:'97', gcs:'15', triage_time:'07:20', color:'var(--t-semi)' },
    '640055': { name:'สวัสดิ์ พงษ์ไพร', gender:'ชาย', age:'50', hn:'640055', bed:'B10', zone:'Fast Track', level:'4', levelName:'Semi-urgent', doctor:'—', status:'รอแพทย์', wait:'10 นาที', cc:'ปวดหัวตึงท้ายทอย', pmh:'HT', allergy:'ไม่มี', bp:'160/95', hr:'80', rr:'18', temp:'36.9', spo2:'98', gcs:'15', triage_time:'14:15', color:'var(--t-semi)' },
    '640060': { name:'จริยา ดีงาม', gender:'หญิง', age:'30', hn:'640060', bed:'—', zone:'Fast Track', level:'4', levelName:'Semi-urgent', doctor:'—', status:'รอแพทย์', wait:'6 นาที', cc:'ท้องเสีย 5 ครั้ง ตั้งแต่เมื่อคืน', pmh:'ไม่มี', allergy:'ไม่มี', bp:'110/70', hr:'88', rr:'18', temp:'37.5', spo2:'99', gcs:'15', triage_time:'14:26', color:'var(--t-semi)' },
    '640102': { name:'อรุณ ศรีสวัสดิ์', gender:'ชาย', age:'42', hn:'640102', bed:'—', zone:'—', level:'—', levelName:'รอคัดกรอง', doctor:'—', status:'รอคัดกรอง', wait:'12 นาที', cc:'ปวดท้องรุนแรง', pmh:'—', allergy:'—', bp:'—', hr:'—', rr:'—', temp:'—', spo2:'—', gcs:'—', triage_time:'—', color:'var(--slate-400)' },
    '640103': { name:'สุนีย์ แก้วใส', gender:'หญิง', age:'28', hn:'640103', bed:'—', zone:'—', level:'—', levelName:'รอคัดกรอง', doctor:'—', status:'รอคัดกรอง', wait:'8 นาที', cc:'ไข้สูง 3 วัน', pmh:'—', allergy:'—', bp:'—', hr:'—', rr:'—', temp:'—', spo2:'—', gcs:'—', triage_time:'—', color:'var(--slate-400)' },
    '640104': { name:'ไม่ทราบชื่อ', gender:'ชาย', age:'~60', hn:'640104', bed:'—', zone:'—', level:'—', levelName:'รอคัดกรอง', doctor:'—', status:'รอคัดกรอง', wait:'2 นาที', cc:'หมดสติ พบล้มข้างถนน', pmh:'—', allergy:'—', bp:'—', hr:'—', rr:'—', temp:'—', spo2:'—', gcs:'—', triage_time:'—', color:'var(--slate-400)' }
  };

  function openPatientQuickView(hn) {
    var p = patientDB[hn];
    if (!p) return;
    currentPQhn = hn;

    var levelClass = 'level' + p.level;
    var initials = p.name.substring(0, 2);

    /* SLA badge */
    var slaBadge = '';
    if (p.wait && parseInt(p.wait) >= 30) slaBadge = '<span class="pq-tag sla-over">เกิน SLA</span>';
    else if (p.wait && parseInt(p.wait) >= 20) slaBadge = '<span class="pq-tag sla-near">ใกล้ SLA</span>';

    /* Vital highlight */
    function vClass(label, val) {
      if (val === '—') return '';
      var n = parseFloat(val);
      if (label === 'hr' && (n >= 120 || n <= 50)) return 'crit';
      if (label === 'spo2' && n < 92) return 'crit';
      if (label === 'spo2' && n < 95) return 'warn';
      if (label === 'temp' && n >= 39) return 'crit';
      if (label === 'temp' && n >= 38) return 'warn';
      if (label === 'gcs' && n <= 8) return 'crit';
      if (label === 'gcs' && n <= 12) return 'warn';
      return '';
    }

    pqTitle.textContent = p.name + ' · HN ' + p.hn;
    pqBody.innerHTML =
      '<div class="pq-header">' +
        '<div class="pq-avatar" style="background:' + p.color + ';">' + initials + '</div>' +
        '<div>' +
          '<div class="pq-name">' + p.name + '</div>' +
          '<div class="pq-sub">' + p.gender + ' ' + p.age + ' ปี · HN ' + p.hn + '</div>' +
          '<div class="pq-status-row">' +
            (p.level !== '—' ? '<span class="pq-tag ' + levelClass + '">' + p.levelName + '</span>' : '<span class="pq-tag" style="background:var(--slate-100);color:var(--slate-500);">' + p.levelName + '</span>') +
            (p.bed !== '—' ? '<span class="pq-tag bed-tag">เตียง ' + p.bed + '</span>' : '') +
            (p.wait ? '<span class="pq-tag wait-tag">รอ ' + p.wait + '</span>' : '') +
            slaBadge +
          '</div>' +
        '</div>' +
      '</div>' +

      (p.bp !== '—' ?
      '<div class="pq-info-section">' +
        '<div class="pq-info-title">สัญญาณชีพ</div>' +
        '<div class="pq-vitals">' +
          '<div class="pq-vital"><div class="pq-vital-label">BP</div><div class="pq-vital-value">' + p.bp + '</div></div>' +
          '<div class="pq-vital"><div class="pq-vital-label">HR</div><div class="pq-vital-value ' + vClass('hr',p.hr) + '">' + p.hr + '</div></div>' +
          '<div class="pq-vital"><div class="pq-vital-label">SpO2</div><div class="pq-vital-value ' + vClass('spo2',p.spo2) + '">' + p.spo2 + '%</div></div>' +
          '<div class="pq-vital"><div class="pq-vital-label">Temp</div><div class="pq-vital-value ' + vClass('temp',p.temp) + '">' + p.temp + '</div></div>' +
          '<div class="pq-vital"><div class="pq-vital-label">RR</div><div class="pq-vital-value">' + p.rr + '</div></div>' +
          '<div class="pq-vital"><div class="pq-vital-label">GCS</div><div class="pq-vital-value ' + vClass('gcs',p.gcs) + '">' + p.gcs + '</div></div>' +
          '<div class="pq-vital"><div class="pq-vital-label">แพ้ยา</div><div class="pq-vital-value' + (p.allergy !== 'ไม่มี' && p.allergy !== '—' ? ' crit' : '') + '">' + p.allergy + '</div></div>' +
          '<div class="pq-vital"><div class="pq-vital-label">Triage</div><div class="pq-vital-value">' + p.triage_time + '</div></div>' +
        '</div>' +
      '</div>'
      : '') +

      /* Door-to-Doctor section */
      (p.firstDocSeen ?
      '<div class="pq-info-section">' +
        '<div class="pq-info-title">Door-to-Doctor</div>' +
        '<div style="display:flex;gap:8px;margin-bottom:12px;">' +
          '<div style="flex:1;background:var(--slate-50);border-radius:8px;padding:8px;text-align:center;"><div style="font-size:9px;font-weight:700;color:var(--slate-400);text-transform:uppercase;">มาถึง ER</div><div style="font-size:14px;font-weight:700;color:var(--slate-800);">' + p.triage_time + '</div></div>' +
          '<div style="flex:1;background:var(--slate-50);border-radius:8px;padding:8px;text-align:center;"><div style="font-size:9px;font-weight:700;color:var(--slate-400);text-transform:uppercase;">First Doctor Seen</div><div style="font-size:14px;font-weight:700;color:var(--green);">' + p.firstDocSeen + '</div></div>' +
          '<div style="flex:1;background:' + (p.doorToDoctor <= 30 ? 'var(--green-bg)' : 'var(--red-100)') + ';border-radius:8px;padding:8px;text-align:center;"><div style="font-size:9px;font-weight:700;color:var(--slate-400);text-transform:uppercase;">D2D Time</div><div style="font-size:14px;font-weight:700;color:' + (p.doorToDoctor <= 30 ? 'var(--green)' : 'var(--red-600)') + ';">' + p.doorToDoctor + ' นาที</div></div>' +
        '</div>' +
      '</div>'
      : '') +

      /* Re-Triage History */
      (p.retriageHistory && p.retriageHistory.length > 0 ?
      '<div class="pq-info-section">' +
        '<div class="pq-info-title">ประวัติ Re-Triage (' + p.retriageHistory.length + ' ครั้ง)</div>' +
        p.retriageHistory.map(function(rt) {
          var dirColor = parseInt(rt.to) < parseInt(rt.from) ? 'var(--red-600)' : 'var(--green)';
          return '<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--slate-50);font-size:12px;">' +
            '<span style="font-weight:700;color:var(--slate-400);width:40px;">' + rt.time + '</span>' +
            '<span style="width:20px;height:20px;border-radius:50%;background:' + levelColors[rt.from] + ';color:white;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;">' + rt.from + '</span>' +
            '<span style="color:' + dirColor + ';font-weight:700;">→</span>' +
            '<span style="width:20px;height:20px;border-radius:50%;background:' + levelColors[rt.to] + ';color:white;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;">' + rt.to + '</span>' +
            '<span style="flex:1;color:var(--slate-600);">' + (rt.note || rt.reason) + '</span>' +
            '<span style="color:var(--slate-400);">โดย ' + rt.by + '</span>' +
          '</div>';
        }).join('') +
      '</div>'
      : '') +

      '<div class="pq-info-section">' +
        '<div class="pq-info-title">ข้อมูลการรักษา</div>' +
        '<div class="pq-info-row"><span class="pq-info-label">อาการ (CC)</span><span class="pq-info-value">' + p.cc + '</span></div>' +
        '<div class="pq-info-row"><span class="pq-info-label">โรคประจำตัว</span><span class="pq-info-value">' + p.pmh + '</span></div>' +
        '<div class="pq-info-row"><span class="pq-info-label">โซน</span><span class="pq-info-value">' + p.zone + '</span></div>' +
        '<div class="pq-info-row"><span class="pq-info-label">แพทย์</span><span class="pq-info-value">' + p.doctor + '</span></div>' +
        '<div class="pq-info-row"><span class="pq-info-label">สถานะ</span><span class="pq-info-value">' + p.status + '</span></div>' +
      '</div>' +

      '<div class="pq-actions">' +
        '<button class="ap-btn primary" data-pq="profile">ดูประวัติเต็ม</button>' +
        (p.level !== '—' ? '<button class="ap-btn outline" data-pq="retriage" style="color:var(--warn);border-color:var(--warn-bg);">Re-Triage</button>' : '') +
        (p.status === 'รอแพทย์' ? '<button class="ap-btn primary" style="background:var(--green);box-shadow:0 2px 8px rgba(22,163,74,0.25);" data-pq="accept">รับเคสเอง</button>' : '') +
        (p.status === 'รอแพทย์' ? '<button class="ap-btn outline" data-pq="assign">มอบหมายแพทย์</button>' : '') +
        (p.bp !== '—' ? '<button class="ap-btn outline" data-pq="lab">ดูผล Lab</button>' : '') +
        (p.status === 'รอคัดกรอง' ? '<button class="ap-btn primary" data-pq="triage">เริ่ม Triage</button>' : '') +
        (p.ems ? '<button class="ap-btn outline" data-pq="handover" style="color:var(--red-600);border-color:var(--red-200);">ดู EMS Handover</button>' : '') +
        (p.status === 'กำลังรักษา' || p.status === 'รอแพทย์' ? '<button class="ap-btn outline" data-pq="timeline">ดู Timeline</button>' : '') +
        (p.status === 'รอ Admit' ? '<button class="ap-btn outline" data-pq="disposition">จัดการ Disposition</button>' : '') +
      '</div>';

    pqModal.classList.add('show');
  }

  /* Patient Quick View — button actions */
  var currentPQhn = '';

  if (pqModal) {
    pqModal.addEventListener('click', function(e) {
      var btn = e.target.closest('[data-pq]');
      if (!btn) return;
      var action = btn.dataset.pq;
      var p = patientDB[currentPQhn];
      if (!p) return;

      switch (action) {
        case 'accept':
          pqModal.classList.remove('show');
          var now = new Date();
          var timeStr = now.toLocaleTimeString('th-TH', { hour12:false, hour:'2-digit', minute:'2-digit', second:'2-digit' });

          /* Calc Door-to-Doctor */
          var arrivalMin = 0;
          if (p.triage_time && p.triage_time !== '—') {
            var parts = p.triage_time.split(':');
            var arrivalDate = new Date();
            arrivalDate.setHours(parseInt(parts[0]), parseInt(parts[1]), 0);
            arrivalMin = Math.round((now - arrivalDate) / 60000);
            if (arrivalMin < 0) arrivalMin = 0;
          }

          /* SLA check */
          var slaLimit = { '1':0, '2':15, '3':30, '4':60, '5':120 };
          var slaMax = slaLimit[p.level] || 999;
          var slaStatus = arrivalMin <= slaMax ? 'pass' : 'fail';
          var slaColor = slaStatus === 'pass' ? 'var(--green)' : 'var(--red-600)';
          var slaBg = slaStatus === 'pass' ? 'var(--green-bg)' : 'var(--red-100)';
          var slaText = slaStatus === 'pass' ? 'ผ่าน SLA' : 'เกิน SLA';

          openConfirm(
            'รับเคสเอง — บันทึก First Doctor Seen',
            '<div style="text-align:center;margin-bottom:14px;">' +
              '<div style="font-size:13px;color:var(--slate-500);margin-bottom:4px;">เวลาแพทย์เริ่มประเมิน (First Doctor Seen)</div>' +
              '<div style="font-size:32px;font-weight:700;color:var(--slate-900);font-variant-numeric:tabular-nums;">' + timeStr + '</div>' +
            '</div>' +
            '<div style="display:flex;gap:8px;justify-content:center;margin-bottom:14px;">' +
              '<div style="background:var(--slate-50);border-radius:10px;padding:10px 16px;text-align:center;flex:1;">' +
                '<div style="font-size:9px;font-weight:700;color:var(--slate-400);text-transform:uppercase;">Door-to-Doctor</div>' +
                '<div style="font-size:22px;font-weight:700;color:' + slaColor + ';">' + arrivalMin + ' นาที</div>' +
              '</div>' +
              '<div style="background:' + slaBg + ';border-radius:10px;padding:10px 16px;text-align:center;flex:1;">' +
                '<div style="font-size:9px;font-weight:700;color:var(--slate-400);text-transform:uppercase;">SLA (Level ' + p.level + ' ≤' + slaMax + ' นาที)</div>' +
                '<div style="font-size:22px;font-weight:700;color:' + slaColor + ';">' + slaText + '</div>' +
              '</div>' +
            '</div>' +
            '<div style="background:var(--slate-50);border-radius:10px;padding:10px 14px;font-size:12.5px;color:var(--slate-600);line-height:1.6;">' +
              'ผู้ป่วย: <strong>' + p.name + '</strong> (HN ' + p.hn + ')<br>' +
              'เตียง: ' + p.bed + ' · อาการ: ' + p.cc +
            '</div>',
            'ยืนยันรับเคส + บันทึกเวลา',
            function() {
              /* Update patient data */
              p.doctor = 'Admin (คุณ)';
              p.status = 'กำลังรักษา';
              p.firstDocSeen = timeStr;
              p.doorToDoctor = arrivalMin;
              p.wait = '';
              showToast('รับเคส ' + p.name + ' เรียบร้อย — First Doctor Seen: ' + timeStr + ' (D2D: ' + arrivalMin + ' นาที)', 'success');
            }
          );
          break;

        case 'profile':
          pqModal.classList.remove('show');
          window.location.href = 'patient-profile.html?hn=' + p.hn;
          break;

        case 'assign':
          pqModal.classList.remove('show');
          /* Open assign doctor modal with patient info */
          var assignPatientEl = document.getElementById('assignPatient');
          if (assignPatientEl) assignPatientEl.textContent = 'ผู้ป่วย: ' + p.name + ' (HN ' + p.hn + ')';
          var assignModal = document.getElementById('assignModal');
          if (assignModal) assignModal.classList.add('show');
          break;

        case 'lab':
          pqModal.classList.remove('show');
          window.location.href = 'patient-profile.html?hn=' + p.hn + '&tab=lab';
          break;

        case 'triage':
          window.location.href = 'triage.html';
          break;

        case 'retriage':
          pqModal.classList.remove('show');
          openRetriage(currentPQhn);
          break;

        case 'handover':
          pqModal.classList.remove('show');
          openHandoverReview(currentPQhn);
          break;

        case 'timeline':
          pqModal.classList.remove('show');
          window.location.href = 'patient-profile.html?hn=' + p.hn + '&tab=timeline';
          break;

        case 'disposition':
          pqModal.classList.remove('show');
          openConfirm(
            'จัดการ Disposition',
            '<strong>' + p.name + '</strong> (HN ' + p.hn + ')<br>เลือกการจัดการ:',
            'ดำเนินการ',
            function() { showToast('กำลังจัดการ Disposition — ' + p.name, 'info'); }
          );
          break;
      }
    });
  }

  /* Click queue items → open patient quick view (delegation on .content) */
  document.querySelector('.content').addEventListener('click', function(e) {
    var item = e.target.closest('.tri-q-item');
    if (!item) return;
    /* Skip if it's a link to triage (รอคัดกรอง items are <a> to triage.html) */
    if (item.tagName === 'A' && item.href && item.href.indexOf('triage.html') > -1) return;
    /* Skip if clicking "ดูทั้งหมด" link */
    if (e.target.closest('.tri-q-more')) return;
    var hnEl = item.querySelector('.tri-q-hn');
    if (!hnEl) return;
    var hn = hnEl.textContent.replace('HN ', '').trim();
    if (hn && patientDB[hn]) {
      e.preventDefault();
      openPatientQuickView(hn);
    }
  });

  /* ── Re-Triage ── */
  var retriageModal = document.getElementById('retriageModal');
  var closeRetriage = document.getElementById('closeRetriage');
  var rtCancel = document.getElementById('rtCancel');

  if (closeRetriage) closeRetriage.addEventListener('click', function() { retriageModal.classList.remove('show'); });
  if (rtCancel) rtCancel.addEventListener('click', function() { retriageModal.classList.remove('show'); });
  if (retriageModal) retriageModal.addEventListener('click', function(e) { if (e.target === retriageModal) retriageModal.classList.remove('show'); });

  var levelNames = { '1':'Resuscitation', '2':'Emergency', '3':'Urgent', '4':'Semi-urgent', '5':'Non-urgent' };
  var levelColors = { '1':'var(--t-resus)', '2':'var(--t-emer)', '3':'var(--t-urg)', '4':'var(--t-semi)', '5':'var(--t-non)' };

  function openRetriage(hn) {
    var p = patientDB[hn];
    if (!p) return;

    document.getElementById('rtTitle').textContent = 'Re-Triage — ' + p.name;
    document.getElementById('rtSub').textContent = 'HN ' + p.hn + ' · ปัจจุบัน Level ' + p.level + ' (' + p.levelName + ')';

    /* Patient bar with current vs new comparison */
    document.getElementById('rtPatientBar').innerHTML =
      '<div style="display:flex;align-items:center;gap:12px;padding:12px 14px;background:var(--slate-50);border-radius:10px;margin-bottom:12px;">' +
        '<div style="width:40px;height:40px;border-radius:50%;background:' + p.color + ';display:flex;align-items:center;justify-content:center;color:white;font-size:14px;font-weight:700;">' + p.level + '</div>' +
        '<div style="flex:1;">' +
          '<div style="font-size:14px;font-weight:700;color:var(--slate-900);">' + p.name + ' · HN ' + p.hn + '</div>' +
          '<div style="font-size:12px;color:var(--slate-500);">ปัจจุบัน: Level ' + p.level + ' — ' + p.levelName + ' · เตียง ' + p.bed + '</div>' +
          '<div style="font-size:11px;color:var(--slate-400);">Vital ล่าสุด: BP ' + p.bp + ' · HR ' + p.hr + ' · SpO2 ' + p.spo2 + '% · GCS ' + p.gcs + '</div>' +
        '</div>' +
      '</div>';

    /* Pre-fill current vitals */
    var bpParts = p.bp.split('/');
    document.getElementById('rtBpSys').value = bpParts[0] || '';
    document.getElementById('rtBpDia').value = bpParts[1] || '';
    document.getElementById('rtHR').value = p.hr || '';
    document.getElementById('rtSpO2').value = p.spo2 || '';
    document.getElementById('rtGCS').value = p.gcs || '';
    document.getElementById('rtReason').value = '';
    document.getElementById('rtNote').value = '';

    /* Uncheck all level radios */
    document.querySelectorAll('input[name="rtLevel"]').forEach(function(r) { r.checked = false; });

    retriageModal.classList.add('show');
  }

  /* Submit Re-Triage */
  var rtSubmit = document.getElementById('rtSubmit');
  if (rtSubmit) {
    rtSubmit.addEventListener('click', function() {
      var p = patientDB[currentPQhn];
      if (!p) return;

      var reason = document.getElementById('rtReason').value;
      var newLevel = document.querySelector('input[name="rtLevel"]:checked');

      if (!reason) { showToast('กรุณาเลือกเหตุผล Re-Triage', 'warn'); return; }
      if (!newLevel) { showToast('กรุณาเลือกระดับ Triage ใหม่', 'warn'); return; }

      var oldLevel = p.level;
      var newLv = newLevel.value;
      var direction = parseInt(newLv) < parseInt(oldLevel) ? 'upgrade' : parseInt(newLv) > parseInt(oldLevel) ? 'downgrade' : 'same';
      var dirText = direction === 'upgrade' ? 'อาการแย่ลง ↑' : direction === 'downgrade' ? 'อาการดีขึ้น ↓' : 'ไม่เปลี่ยน';
      var dirColor = direction === 'upgrade' ? 'var(--red-600)' : direction === 'downgrade' ? 'var(--green)' : 'var(--slate-500)';

      /* Update vitals */
      var newBp = (document.getElementById('rtBpSys').value || '—') + '/' + (document.getElementById('rtBpDia').value || '—');
      p.bp = newBp;
      p.hr = document.getElementById('rtHR').value || p.hr;
      p.spo2 = document.getElementById('rtSpO2').value || p.spo2;
      p.gcs = document.getElementById('rtGCS').value || p.gcs;

      /* Store re-triage history */
      if (!p.retriageHistory) p.retriageHistory = [];
      p.retriageHistory.push({
        time: new Date().toLocaleTimeString('th-TH', { hour12:false, hour:'2-digit', minute:'2-digit' }),
        from: oldLevel,
        to: newLv,
        reason: reason,
        note: document.getElementById('rtNote').value,
        bp: newBp, hr: p.hr, spo2: p.spo2, gcs: p.gcs,
        by: 'Admin'
      });

      /* Update patient */
      p.level = newLv;
      p.levelName = levelNames[newLv];
      p.color = levelColors[newLv];

      retriageModal.classList.remove('show');

      /* Show result */
      openConfirm(
        'Re-Triage สำเร็จ',
        '<div style="text-align:center;margin-bottom:12px;">' +
          '<div style="display:flex;align-items:center;justify-content:center;gap:12px;margin-bottom:8px;">' +
            '<div style="text-align:center;"><div style="font-size:10px;color:var(--slate-400);margin-bottom:4px;">เดิม</div><div style="width:36px;height:36px;border-radius:50%;background:' + levelColors[oldLevel] + ';color:white;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;margin:0 auto;">' + oldLevel + '</div></div>' +
            '<div style="font-size:18px;color:' + dirColor + ';">→</div>' +
            '<div style="text-align:center;"><div style="font-size:10px;color:var(--slate-400);margin-bottom:4px;">ใหม่</div><div style="width:36px;height:36px;border-radius:50%;background:' + levelColors[newLv] + ';color:white;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;margin:0 auto;">' + newLv + '</div></div>' +
          '</div>' +
          '<div style="font-size:13px;font-weight:600;color:' + dirColor + ';">' + dirText + '</div>' +
        '</div>' +
        '<div style="font-size:12.5px;color:var(--slate-600);line-height:1.6;">' +
          '<strong>' + p.name + '</strong> (HN ' + p.hn + ')<br>' +
          'Level ' + oldLevel + ' → Level ' + newLv + ' (' + levelNames[newLv] + ')<br>' +
          'Vital ใหม่: BP ' + newBp + ' · HR ' + p.hr + ' · SpO2 ' + p.spo2 + '% · GCS ' + p.gcs +
        '</div>',
        'ตกลง',
        function() {
          showToast('Re-Triage ' + p.name + ' → Level ' + newLv + ' (' + levelNames[newLv] + ')', 'success');
        }
      );
    });
  }

  /* ── EMS Handover Review ── */
  var handoverModal = document.getElementById('handoverModal');
  var closeHandover = document.getElementById('closeHandover');
  if (closeHandover) closeHandover.addEventListener('click', function() { handoverModal.classList.remove('show'); });
  if (handoverModal) handoverModal.addEventListener('click', function(e) { if (e.target === handoverModal) handoverModal.classList.remove('show'); });

  function openHandoverReview(hn) {
    var p = patientDB[hn];
    if (!p || !p.ems) return;
    var e = p.ems;

    document.getElementById('handoverTitle').textContent = 'EMS Handover — ' + p.name;
    document.getElementById('handoverSub').textContent = 'HN ' + p.hn + ' · ' + e.source + ' · ' + e.vehicle + ' · Case ' + e.caseId;

    var html = '';

    /* Crew info */
    html += '<div class="ho-crew-bar">' +
      '<div class="ho-crew-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>' +
      '<div class="ho-crew-info">' +
        '<strong>' + e.source + ' · รถ ' + e.vehicle + '</strong>' +
        '<p>ทีม: ' + e.crew + ' · Case ID: ' + e.caseId + '</p>' +
      '</div>' +
    '</div>';

    /* Key times */
    html += '<div class="ho-times">' +
      '<div class="ho-time-box"><div class="ho-time-label">รับแจ้ง</div><div class="ho-time-value">' + e.dispatchTime + '</div></div>' +
      '<div class="ho-time-box"><div class="ho-time-label">ถึงจุดเกิดเหตุ</div><div class="ho-time-value">' + e.sceneTime + '</div></div>' +
      '<div class="ho-time-box"><div class="ho-time-label">ออกจากที่เกิดเหตุ</div><div class="ho-time-value">' + e.departTime + '</div></div>' +
      '<div class="ho-time-box"><div class="ho-time-label">ถึง ER</div><div class="ho-time-value">' + p.triage_time + '</div></div>' +
    '</div>';

    /* Vitals on scene */
    html += '<div class="ho-section"><div class="ho-section-title">สัญญาณชีพบนรถ</div>';
    html += '<table class="ho-vitals-table"><thead><tr><th>เวลา</th><th>BP</th><th>HR</th><th>RR</th><th>SpO2</th><th>GCS</th></tr></thead><tbody>';
    e.vitals.forEach(function(v) {
      html += '<tr>' +
        '<td style="font-weight:700;">' + v.time + '</td>' +
        '<td' + (v.bp === '—' ? ' class="crit"' : '') + '>' + v.bp + '</td>' +
        '<td' + (v.hr === 'VF' || v.hr === 'PEA' ? ' class="crit"' : '') + '>' + v.hr + '</td>' +
        '<td>' + v.rr + '</td>' +
        '<td' + (v.spo2 === '—' ? ' class="crit"' : '') + '>' + v.spo2 + '</td>' +
        '<td' + (parseInt(v.gcs) <= 8 ? ' class="crit"' : '') + '>' + v.gcs + '</td>' +
      '</tr>';
      if (v.note) html += '<tr><td colspan="6" class="note-cell">' + v.note + '</td></tr>';
    });
    html += '</tbody></table></div>';

    /* Treatment timeline */
    html += '<div class="ho-section"><div class="ho-section-title">การรักษาก่อนถึง ER</div>';
    html += '<div class="ho-treat-list">';
    e.treatments.forEach(function(t) {
      html += '<div class="ho-treat-item">' +
        '<div class="ho-treat-time">' + t.time + '</div>' +
        '<div class="ho-treat-action">' + t.action + '</div>' +
        '<div class="ho-treat-detail">' + t.detail + '</div>' +
      '</div>';
    });
    html += '</div></div>';

    /* Handover note */
    html += '<div class="ho-note">' +
      '<div class="ho-note-title"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px;"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>Handover Note จาก EMS</div>' +
      '<div class="ho-note-text">' + e.handoverNote + '</div>' +
    '</div>';

    /* Acknowledge bar */
    html += '<div class="ho-ack-bar" id="hoAckBar">' +
      '<div class="ho-ack-text">แพทย์/พยาบาลยังไม่ได้รับทราบข้อมูล EMS</div>' +
      '<button class="ap-btn primary" id="hoAckBtn">รับทราบ Handover</button>' +
    '</div>';

    document.getElementById('handoverBody').innerHTML = html;
    handoverModal.classList.add('show');

    /* Ack button */
    setTimeout(function() {
      var ackBtn = document.getElementById('hoAckBtn');
      var ackBar = document.getElementById('hoAckBar');
      if (ackBtn) {
        ackBtn.addEventListener('click', function() {
          ackBar.classList.add('acked');
          ackBar.innerHTML = '<div class="ho-ack-text"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px;vertical-align:middle;margin-right:4px;"><polyline points="20 6 9 17 4 12"/></svg>รับทราบ Handover แล้ว — Admin · ' + new Date().toLocaleTimeString('th-TH',{hour12:false,hour:'2-digit',minute:'2-digit'}) + '</div>';
          showToast('รับทราบ EMS Handover ของ ' + p.name + ' เรียบร้อย', 'success');
        });
      }
    }, 100);
  }

  /* Queue "ดูทั้งหมด" → open modal with full list */
  var queueModal = document.getElementById('queueFullModal');
  var closeQueueModal = document.getElementById('closeQueueModal');
  var queueModalTitle = document.getElementById('queueModalTitle');
  var queueModalBody = document.getElementById('queueModalBody');

  if (closeQueueModal) closeQueueModal.addEventListener('click', function() { queueModal.classList.remove('show'); });
  if (queueModal) queueModal.addEventListener('click', function(e) { if (e.target === queueModal) queueModal.classList.remove('show'); });

  document.querySelectorAll('.tri-q-more').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var body = btn.closest('.tri-queue-body');
      var items = body.querySelectorAll('.tri-q-item');
      var title = btn.textContent.trim();

      /* Determine tab name */
      if (body.id === 'triQueueWaiting') queueModalTitle.textContent = 'คิวรอคัดกรอง — ทั้งหมด';
      else if (body.id === 'triQueueDoctor') queueModalTitle.textContent = 'คิวรอแพทย์ — ทั้งหมด';
      else if (body.id === 'triQueueDone') queueModalTitle.textContent = 'คัดกรองแล้ว — ทั้งหมด';
      else queueModalTitle.textContent = title;

      /* Clone all items into modal */
      queueModalBody.innerHTML = '';
      items.forEach(function(item) {
        var clone = item.cloneNode(true);
        clone.style.display = 'flex';
        queueModalBody.appendChild(clone);
      });

      /* Make cloned items clickable */
      queueModalBody.querySelectorAll('.tri-q-item').forEach(function(item) {
        item.addEventListener('click', function() {
          var hnEl = item.querySelector('.tri-q-hn');
          if (!hnEl) return;
          var hn = hnEl.textContent.replace('HN ', '').trim();
          if (hn && patientDB[hn]) {
            queueModal.classList.remove('show');
            openPatientQuickView(hn);
          }
        });
      });

      queueModal.classList.add('show');
    });
  });

  /* Alert Modal — open from notification bell + alert banner */
  const alertModal = document.getElementById('alertModal');
  const closeAlertBtn = document.getElementById('closeAlertModal');
  const bellBtn = document.getElementById('openAlertModal');
  const bannerBtn = document.getElementById('alertBannerBtn');

  function openAlerts() { if (alertModal) alertModal.classList.add('show'); }
  function closeAlerts() { if (alertModal) alertModal.classList.remove('show'); }

  if (bellBtn) bellBtn.addEventListener('click', openAlerts);
  if (bannerBtn) bannerBtn.addEventListener('click', openAlerts);
  if (closeAlertBtn) closeAlertBtn.addEventListener('click', closeAlerts);
  if (alertModal) {
    alertModal.addEventListener('click', (e) => { if (e.target === alertModal) closeAlerts(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeAlerts(); });
  }

  /* Tab filter inside modal */
  if (alertModal) {
    const modalTabs = alertModal.querySelectorAll('.ap-tab');
    const modalCards = alertModal.querySelectorAll('.ap-card');

    modalTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        modalTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const filter = tab.dataset.filter;
        modalCards.forEach(card => {
          card.classList.toggle('hidden', filter !== 'all' && card.dataset.type !== filter);
        });
      });
    });
  }

  /* ── Sub-panel helpers ── */

  function openDetail(name, hn, bed, title, detail, type) {
    var colors = { critical: 'var(--red-600)', sla: 'var(--orange)', lab: 'var(--purple)', consult: 'var(--warn)', transport: 'var(--blue)' };
    var labels = { critical: 'วิกฤต', sla: 'เกิน SLA', lab: 'Critical Lab', consult: 'Consult ค้าง', transport: 'Transport ค้าง' };
    document.getElementById('detailTitle').textContent = 'รายละเอียด — ' + name;
    document.getElementById('detailBody').innerHTML =
      '<div class="detail-section">' +
        '<div class="detail-section-title">ข้อมูลผู้ป่วย</div>' +
        '<div class="detail-row"><span class="detail-label">ชื่อ-สกุล</span><span class="detail-value">' + name + '</span></div>' +
        '<div class="detail-row"><span class="detail-label">HN</span><span class="detail-value">' + hn + '</span></div>' +
        '<div class="detail-row"><span class="detail-label">เตียง</span><span class="detail-value">' + bed + '</span></div>' +
        '<div class="detail-row"><span class="detail-label">ประเภท Alert</span><span class="detail-value" style="color:' + (colors[type]||'') + '">' + (labels[type]||type) + '</span></div>' +
      '</div>' +
      '<div class="detail-section">' +
        '<div class="detail-section-title">สถานการณ์</div>' +
        '<div class="detail-row"><span class="detail-label">หัวข้อ</span><span class="detail-value">' + title + '</span></div>' +
        '<div class="detail-row"><span class="detail-label">รายละเอียด</span><span class="detail-value">' + detail + '</span></div>' +
      '</div>' +
      '<div class="detail-section">' +
        '<div class="detail-section-title">สัญญาณชีพล่าสุด</div>' +
        '<div class="detail-row"><span class="detail-label">BP</span><span class="detail-value critical">80/50 mmHg</span></div>' +
        '<div class="detail-row"><span class="detail-label">HR</span><span class="detail-value critical">130 bpm</span></div>' +
        '<div class="detail-row"><span class="detail-label">SpO2</span><span class="detail-value warn">89%</span></div>' +
        '<div class="detail-row"><span class="detail-label">Temp</span><span class="detail-value">37.2 °C</span></div>' +
        '<div class="detail-row"><span class="detail-label">RR</span><span class="detail-value">24 /min</span></div>' +
      '</div>' +
      '<div class="detail-actions">' +
        '<button class="ap-btn primary" onclick="document.getElementById(\'detailPanel\').classList.remove(\'show\');showToast(\'กำลังเปิดหน้าผู้ป่วย ' + name + '\',\'info\')">เปิดหน้าผู้ป่วยเต็ม</button>' +
        '<button class="ap-btn outline" onclick="document.getElementById(\'detailPanel\').classList.remove(\'show\')">ปิด</button>' +
      '</div>';
    document.getElementById('detailPanel').classList.add('show');
  }

  function openLab(name, hn, type) {
    var isK = (type === 'lab');
    document.getElementById('labBody').innerHTML =
      '<p style="font-size:13px;color:var(--slate-600);margin-bottom:14px;">' + name + ' · ' + hn + '</p>' +
      '<table class="lab-table">' +
        '<thead><tr><th>รายการ</th><th>ผล</th><th>ค่าปกติ</th><th>หน่วย</th></tr></thead>' +
        '<tbody>' +
          '<tr class="lab-crit"><td>Troponin I <span class="lab-flag">CRIT</span></td><td>15.8</td><td>&lt;0.04</td><td>ng/mL</td></tr>' +
          '<tr><td>CK-MB</td><td>85</td><td>0-24</td><td>U/L</td></tr>' +
          '<tr class="lab-crit"><td>K+ <span class="lab-flag">CRIT</span></td><td>7.2</td><td>3.5-5.0</td><td>mEq/L</td></tr>' +
          '<tr><td>Na+</td><td>138</td><td>136-145</td><td>mEq/L</td></tr>' +
          '<tr><td>Creatinine</td><td>4.8</td><td>0.7-1.3</td><td>mg/dL</td></tr>' +
          '<tr><td>BUN</td><td>62</td><td>7-20</td><td>mg/dL</td></tr>' +
          '<tr><td>Glucose</td><td>142</td><td>70-100</td><td>mg/dL</td></tr>' +
          '<tr><td>WBC</td><td>14,200</td><td>4,500-11,000</td><td>/uL</td></tr>' +
          '<tr><td>Hb</td><td>9.8</td><td>12-16</td><td>g/dL</td></tr>' +
        '</tbody>' +
      '</table>' +
      '<p style="font-size:11px;color:var(--slate-400);">ผลตรวจเมื่อ 14:25 · Lab ชั้น 2</p>' +
      '<div class="detail-actions">' +
        '<button class="ap-btn primary" onclick="document.getElementById(\'labPanel\').classList.remove(\'show\');showToast(\'กำลังเปิดผล Lab ทั้งหมดของ ' + name + '\',\'info\')">ดูผล Lab ทั้งหมด</button>' +
        '<button class="ap-btn outline" onclick="document.getElementById(\'labPanel\').classList.remove(\'show\')">ปิด</button>' +
      '</div>';
    document.getElementById('labPanel').classList.add('show');
  }

  function openCall(title, contacts) {
    document.getElementById('callTitle').textContent = title;
    var html = '';
    contacts.forEach(function(c) {
      html += '<div class="contact-card" onclick="showToast(\'กำลังโทร ' + c.phone + '\',\'info\')">' +
        '<div class="contact-avatar">' + c.init + '</div>' +
        '<div class="contact-info">' +
          '<div class="contact-name">' + c.name + '</div>' +
          '<div class="contact-role">' + c.role + '</div>' +
          '<div class="contact-phone">' + c.phone + '</div>' +
        '</div>' +
        '<div class="contact-call-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg></div>' +
      '</div>';
    });
    document.getElementById('callBody').innerHTML = html;
    document.getElementById('callPanel').classList.add('show');
  }

  var confirmCallback = null;
  function openConfirm(title, msg, btnText, onConfirm) {
    document.getElementById('confirmTitle').textContent = title;
    confirmCallback = onConfirm;
    document.getElementById('confirmBody').innerHTML =
      '<div class="confirm-msg">' + msg + '</div>' +
      '<div class="confirm-actions">' +
        '<button class="confirm-btn cancel" onclick="document.getElementById(\'confirmPanel\').classList.remove(\'show\')">ยกเลิก</button>' +
        '<button class="confirm-btn danger" id="confirmOk">' + btnText + '</button>' +
      '</div>';
    document.getElementById('confirmPanel').classList.add('show');
    document.getElementById('confirmOk').onclick = function() {
      document.getElementById('confirmPanel').classList.remove('show');
      if (confirmCallback) confirmCallback();
    };
  }

  /* ── Toast helper ── */
  function showToast(msg, type) {
    type = type || 'success';
    const icons = {
      success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
      info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
      warn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'
    };
    const container = document.getElementById('toastContainer');
    const t = document.createElement('div');
    t.className = 'toast ' + type;
    t.innerHTML = icons[type] + '<span>' + msg + '</span>';
    container.appendChild(t);
    setTimeout(() => t.remove(), 3200);
  }

  /* ── Assign Doctor Modal ── */
  const assignModal = document.getElementById('assignModal');
  const assignClose = document.getElementById('assignClose');
  const assignPatientEl = document.getElementById('assignPatient');
  let assignTargetCard = null;

  function openAssign(card) {
    assignTargetCard = card;
    const name = card.querySelector('.ap-card-name').textContent;
    const hn = card.querySelector('.ap-card-hn').textContent;
    assignPatientEl.textContent = 'ผู้ป่วย: ' + name + ' (' + hn + ')';
    assignModal.classList.add('show');
  }

  function closeAssign() { assignModal.classList.remove('show'); }

  if (assignClose) assignClose.addEventListener('click', closeAssign);
  if (assignModal) assignModal.addEventListener('click', function(e) { if (e.target === assignModal) closeAssign(); });

  /* Pick a doctor */
  document.querySelectorAll('.assign-doc').forEach(function(doc) {
    doc.addEventListener('click', function() {
      var docName = doc.dataset.doc;
      var now = new Date();
      var timeStr = now.toLocaleTimeString('th-TH', { hour12:false, hour:'2-digit', minute:'2-digit', second:'2-digit' });
      closeAssign();

      /* Record First Doctor Seen for current patient */
      if (currentPQhn && patientDB[currentPQhn]) {
        var p = patientDB[currentPQhn];
        if (!p.firstDocSeen) {
          var arrivalMin = 0;
          if (p.triage_time && p.triage_time !== '—') {
            var parts = p.triage_time.split(':');
            var arrivalDate = new Date();
            arrivalDate.setHours(parseInt(parts[0]), parseInt(parts[1]), 0);
            arrivalMin = Math.round((now - arrivalDate) / 60000);
            if (arrivalMin < 0) arrivalMin = 0;
          }
          p.firstDocSeen = timeStr;
          p.doorToDoctor = arrivalMin;
          p.doctor = docName;
          p.status = 'กำลังรักษา';
          p.wait = '';
          showToast('มอบหมาย ' + docName + ' — First Doctor Seen: ' + timeStr + ' (D2D: ' + arrivalMin + ' นาที)', 'success');
        } else {
          p.doctor = docName;
          showToast('มอบหมาย ' + docName + ' เรียบร้อย', 'success');
        }
      } else {
        showToast('มอบหมาย ' + docName + ' เรียบร้อย', 'success');
      }

      if (assignTargetCard) {
        assignTargetCard.classList.add('acked');
        setTimeout(function() { assignTargetCard.classList.add('ack-removing'); }, 600);
      }
    });
  });

  /* ── Alert button actions (delegation) ── */
  if (alertModal) {
    alertModal.addEventListener('click', function(e) {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;

      const action = btn.dataset.action;
      const card = btn.closest('.ap-card');
      const name = card ? card.querySelector('.ap-card-name').textContent : '';

      var title = card ? card.querySelector('.ap-card-title').textContent : '';
      var hn = card ? card.querySelector('.ap-card-hn').textContent : '';
      var bed = card ? (card.querySelector('.ap-card-bed') || {}).textContent || '' : '';
      var detail = card ? card.querySelector('.ap-card-detail').textContent : '';

      switch (action) {

        /* ── รับทราบ ── */
        case 'ack':
          openConfirm(
            'รับทราบ Alert',
            'คุณรับทราบ alert ของ <strong>' + name + '</strong> (' + hn + ')<br>ระบบจะบันทึกเวลาที่รับทราบ',
            'รับทราบ',
            function() {
              card.classList.add('acked');
              setTimeout(function() { card.classList.add('ack-removing'); }, 600);
              showToast('รับทราบ alert ของ ' + name + ' แล้ว', 'success');
            }
          );
          break;

        /* ── ดูรายละเอียด ── */
        case 'detail':
          openDetail(name, hn, bed, title, detail, card.dataset.type);
          break;

        /* ── มอบหมายแพทย์ ── */
        case 'assign':
          openAssign(card);
          break;

        /* ── ส่งต่อหัวหน้า ── */
        case 'escalate':
          openConfirm(
            'ส่งต่อหัวหน้าเวร',
            'ส่งเรื่อง <strong>' + name + '</strong> (' + hn + ') ไปยังหัวหน้าเวร<br>หัวหน้าจะได้รับแจ้งเตือนทันที',
            'ยืนยันส่งต่อ',
            function() {
              showToast('ส่งเรื่องถึงหัวหน้าเวรแล้ว — ' + name, 'warn');
              btn.disabled = true;
              btn.textContent = 'ส่งแล้ว';
              btn.style.opacity = '0.5';
            }
          );
          break;

        /* ── โทรติดตาม (Consult) ── */
        case 'call':
          openCall('โทรติดตาม Consult', [
            { init: 'ออ', name: 'Ortho on-call', role: 'นพ.อานนท์ ศัลยแพทย์', phone: '1234 ต่อ 5501' },
            { init: 'คด', name: 'Cardio on-call', role: 'พญ.กนก อายุรแพทย์', phone: '1234 ต่อ 5502' },
            { init: 'มด', name: 'Med on-call', role: 'นพ.ภาคิน อายุรแพทย์', phone: '1234 ต่อ 5503' }
          ]);
          break;

        /* ── รับทราบ + Consult ── */
        case 'ack-consult':
          openConfirm(
            'รับทราบ + ส่ง Consult',
            'รับทราบผล Lab วิกฤตของ <strong>' + name + '</strong><br>และส่ง Consult อัตโนมัติไปยังแพทย์เฉพาะทาง',
            'รับทราบ + ส่ง Consult',
            function() {
              card.classList.add('acked');
              setTimeout(function() { card.classList.add('ack-removing'); }, 600);
              showToast('รับทราบ + ส่ง Consult เรียบร้อย — ' + name, 'success');
            }
          );
          break;

        /* ── ดูผล Lab ── */
        case 'lab':
          openLab(name, hn, card.dataset.type);
          break;

        /* ── รับทราบ + สั่งยา ── */
        case 'ack-med':
          openConfirm(
            'รับทราบ + สั่งยา',
            'รับทราบผล Lab วิกฤตของ <strong>' + name + '</strong><br>และเปิดหน้าสั่งยาฉุกเฉิน',
            'รับทราบ + สั่งยา',
            function() {
              card.classList.add('acked');
              setTimeout(function() { card.classList.add('ack-removing'); }, 600);
              showToast('รับทราบ + สั่งยาเรียบร้อย — ' + name, 'success');
            }
          );
          break;

        /* ── โทร Ward ── */
        case 'call-ward':
          openCall('โทร Ward', [
            { init: '5A', name: 'Ward 5A', role: 'หอผู้ป่วยอายุรกรรม', phone: '1234 ต่อ 5100' },
            { init: '5B', name: 'Ward 5B', role: 'หอผู้ป่วยศัลยกรรม', phone: '1234 ต่อ 5200' },
            { init: 'IC', name: 'ICU', role: 'หอผู้ป่วยวิกฤต', phone: '1234 ต่อ 5300' }
          ]);
          break;

        /* ── เปลี่ยน Ward ── */
        case 'change-ward':
          openConfirm(
            'เปลี่ยน Ward ปลายทาง',
            'เปลี่ยน Ward สำหรับ <strong>' + name + '</strong> (' + hn + ')<br>กรุณาติดต่อ Ward ใหม่เพื่อยืนยันเตียงก่อน',
            'เปิดหน้าเปลี่ยน Ward',
            function() {
              showToast('กำลังเปิดหน้าเปลี่ยน Ward — ' + name, 'info');
            }
          );
          break;

        /* ── ติดตามรถ Refer ── */
        case 'track-refer':
          openCall('ติดตามรถ Refer', [
            { init: 'ศร', name: 'ศูนย์สั่งการ EMS', role: 'สายด่วน Refer', phone: '1669 ต่อ 3' },
            { init: 'รพ', name: 'รพ.ศูนย์ ER', role: 'ห้องฉุกเฉินปลายทาง', phone: '0-2XXX-XXXX ต่อ 1100' },
            { init: 'คน', name: 'คนขับรถ Refer', role: 'รถ Refer หมายเลข R-05', phone: '08X-XXX-XXXX' }
          ]);
          break;

        /* ── เตรียมผู้ป่วย ── */
        case 'prep-patient':
          openConfirm(
            'เตรียมผู้ป่วยส่งต่อ',
            'ยืนยันเตรียม <strong>' + name + '</strong> (' + hn + ') พร้อมส่งต่อ<br>Checklist: เอกสาร, ยา, อุปกรณ์, สัญญาณชีพล่าสุด',
            'ยืนยันเตรียมพร้อม',
            function() {
              showToast('เตรียมผู้ป่วยพร้อมส่งต่อ — ' + name, 'success');
              btn.disabled = true;
              btn.textContent = 'เตรียมแล้ว';
              btn.style.opacity = '0.5';
            }
          );
          break;
      }
    });
  }

  /* ── Login Audit Modal ── */
  const auditModal = document.getElementById('auditModal');
  const openAuditBtn = document.getElementById('openAuditModal');
  const closeAuditBtn = document.getElementById('closeAuditModal');

  if (openAuditBtn && auditModal) {
    openAuditBtn.addEventListener('click', function(e) {
      e.preventDefault();
      auditModal.classList.add('show');
    });
    closeAuditBtn.addEventListener('click', function() { auditModal.classList.remove('show'); });
    auditModal.addEventListener('click', function(e) { if (e.target === auditModal) auditModal.classList.remove('show'); });

    /* Audit tab filter */
    const auditTabs = auditModal.querySelectorAll('[data-audit]');
    const auditRows = auditModal.querySelectorAll('tbody tr');

    auditTabs.forEach(function(tab) {
      tab.addEventListener('click', function() {
        auditTabs.forEach(function(t) { t.classList.remove('active'); });
        tab.classList.add('active');
        var filter = tab.dataset.audit;
        auditRows.forEach(function(row) {
          if (filter === 'all' || row.dataset.status === filter) {
            row.classList.remove('audit-hidden');
          } else {
            row.classList.add('audit-hidden');
          }
        });
      });
    });
  }

  /* ── Link Patient Button (ผูกผู้ป่วย) ── */
  document.querySelector('.pa-dash-list').addEventListener('click', function(e) {
    var linkBtn = e.target.closest('.pa-link-btn');
    if (!linkBtn) return;
    e.stopPropagation();

    var card = linkBtn.closest('.pa-mini');
    var caseId = card ? card.dataset.caseId : '';

    /* Open arrival choice modal but skip to search directly */
    var arrivalModal = document.getElementById('arrivalChoiceModal');
    if (arrivalModal) {
      document.getElementById('acCaseInfo').textContent = 'ผูก ' + caseId + ' กับผู้ป่วยใน ER';
      document.getElementById('acSearchSection').style.display = '';
      /* Store which link btn to update */
      arrivalModal.dataset.linkBtn = caseId;
      arrivalModal.classList.add('show');
      setTimeout(function() { document.getElementById('acSearchInput').focus(); }, 200);
    }
  });

  /* ── Arrival Choice Modal ── */
  var acNewBtn = document.getElementById('acNewPatient');
  var acExistBtn = document.getElementById('acExistingPatient');
  var acSearchSection = document.getElementById('acSearchSection');

  if (acNewBtn) {
    acNewBtn.addEventListener('click', function() {
      document.getElementById('arrivalChoiceModal').classList.remove('show');
      window.location.href = 'registration.html?from=prearrival';
    });
  }

  if (acExistBtn) {
    acExistBtn.addEventListener('click', function() {
      acSearchSection.style.display = '';
      document.getElementById('acSearchInput').focus();
    });
  }

  /* Select existing patient → link + go to profile */
  var acResults = document.getElementById('acResults');
  if (acResults) {
    acResults.addEventListener('click', function(e) {
      var item = e.target.closest('.lv-result-item');
      if (!item) return;
      var hn = item.dataset.hn;
      var name = item.querySelector('.lv-result-name').textContent;
      var modal = document.getElementById('arrivalChoiceModal');
      var linkedCaseId = modal.dataset.linkBtn || '';
      modal.classList.remove('show');

      /* Update link button on the card */
      if (linkedCaseId) {
        var linkBtns = document.querySelectorAll('.pa-link-btn[data-link-case="' + linkedCaseId + '"]');
        linkBtns.forEach(function(b) {
          b.classList.add('linked');
          b.textContent = 'HN ' + hn;
        });
        modal.dataset.linkBtn = '';
      }

      showToast('ผูก ' + linkedCaseId + ' กับ ' + name + ' (HN ' + hn + ') เรียบร้อย', 'success');
      setTimeout(function() {
        window.location.href = 'patient-profile.html?hn=' + hn + '&tab=timeline';
      }, 1000);
    });
  }

  /* ── Quick Prep Modal ── */
  var qpModal = document.getElementById('quickPrepModal');
  var closeQP = document.getElementById('closeQP');
  var qpCancel = document.getElementById('qpCancel');
  var qpSubmit = document.getElementById('qpSubmit');
  var qpCurrentCase = null;

  if (closeQP) closeQP.addEventListener('click', function() { qpModal.classList.remove('show'); });
  if (qpCancel) qpCancel.addEventListener('click', function() { qpModal.classList.remove('show'); });
  if (qpModal) qpModal.addEventListener('click', function(e) { if (e.target === qpModal) qpModal.classList.remove('show'); });

  /* Open from prep button OR "ผู้ป่วยมาถึง" */
  document.querySelector('.pa-dash-list').addEventListener('click', function(e) {
    var prepBtn = e.target.closest('.pa-prep-btn');
    if (!prepBtn) return;
    e.stopPropagation();

    /* If already prepped → show arrival options */
    if (prepBtn.dataset.ready === 'true') {
      var arrivalCard = prepBtn.closest('.pa-mini');
      var cId = arrivalCard ? arrivalCard.dataset.caseId : '';
      var cCC = arrivalCard ? arrivalCard.dataset.caseCc : '';

      /* Open arrival choice modal */
      var arrivalModal = document.getElementById('arrivalChoiceModal');
      if (arrivalModal) {
        document.getElementById('acCaseInfo').textContent = cId + ' — ' + cCC;
        arrivalModal.classList.add('show');
      }
      return;
    }

    var card = prepBtn.closest('.pa-mini');
    qpCurrentCase = card;
    var caseId = card.dataset.caseId || 'PA-XXXX';
    var risk = card.dataset.caseRisk || '';
    var cc = card.dataset.caseCc || '';
    var eta = card.dataset.caseEta || '';

    document.getElementById('qpTitle').textContent = 'เตรียมรับ — ' + caseId;
    document.getElementById('qpCaseInfo').innerHTML =
      '<div style="display:flex;align-items:center;gap:12px;padding:12px 14px;background:var(--slate-50);border-radius:10px;">' +
        '<div style="background:var(--red-600);color:white;width:42px;height:42px;border-radius:12px;display:flex;flex-direction:column;align-items:center;justify-content:center;font-weight:700;flex-shrink:0;"><div style="font-size:16px;line-height:1;">' + eta + '</div><div style="font-size:8px;">นาที</div></div>' +
        '<div style="flex:1;">' +
          '<div style="font-size:14px;font-weight:700;color:var(--slate-900);">' + cc + '</div>' +
          '<div style="font-size:12px;color:var(--slate-500);">' + caseId + ' · ' + risk + ' · ETA ' + eta + ' นาที</div>' +
        '</div>' +
      '</div>';

    /* Reset checkboxes */
    qpModal.querySelectorAll('input[type="checkbox"]').forEach(function(cb) { cb.checked = false; });
    document.getElementById('qpDoctor').value = '';
    document.getElementById('qpBed').value = '';
    document.getElementById('qpNote').value = '';

    qpModal.classList.add('show');
  });

  /* Submit prep */
  if (qpSubmit) {
    qpSubmit.addEventListener('click', function() {
      var checked = qpModal.querySelectorAll('input[type="checkbox"]:checked').length;
      var total = qpModal.querySelectorAll('input[type="checkbox"]').length;
      var doctor = document.getElementById('qpDoctor').value;
      var bed = document.getElementById('qpBed').value;

      if (checked === 0) { showToast('กรุณา check อย่างน้อย 1 รายการ', 'warn'); return; }

      /* Update button → "พร้อม ✓" */
      if (qpCurrentCase) {
        var btn = qpCurrentCase.querySelector('.pa-prep-btn');
        if (btn) {
          btn.classList.add('prepped');
          btn.textContent = 'พร้อม ✓ (' + checked + '/' + total + ')';
          btn.dataset.ready = 'true';
        }

        /* Store prep data for registration */
        var caseData = {
          caseId: qpCurrentCase.dataset.caseId,
          risk: qpCurrentCase.dataset.caseRisk,
          cc: qpCurrentCase.dataset.caseCc,
          eta: qpCurrentCase.dataset.caseEta,
          doctor: doctor,
          bed: bed,
          checklist: checked + '/' + total
        };
        sessionStorage.setItem('preArrivalData', JSON.stringify(caseData));
      }

      qpModal.classList.remove('show');
      var caseId = qpCurrentCase ? qpCurrentCase.dataset.caseId : '';
      showToast('เตรียมรับ ' + caseId + ' เรียบร้อย — ' + checked + '/' + total + ' รายการ · กด "ผู้ป่วยมาถึง →" เมื่อผู้ป่วยถึง ER', 'success');
    });
  }

  /* ── Create Pre-Arrival ── */
  var createPAModal = document.getElementById('createPAModal');
  var closeCreatePA = document.getElementById('closeCreatePA');
  var createPABtn = document.getElementById('createPreArrivalBtn');
  var cpCancel = document.getElementById('cpCancel');
  var cpSubmit = document.getElementById('cpSubmit');

  function openCreatePA() { if (createPAModal) createPAModal.classList.add('show'); }
  function closeCreatePAModal() { if (createPAModal) createPAModal.classList.remove('show'); }

  if (createPABtn) createPABtn.addEventListener('click', openCreatePA);
  var createPASidebar = document.getElementById('createPAFromSidebar');
  if (createPASidebar) createPASidebar.addEventListener('click', function(e) { e.preventDefault(); openCreatePA(); });
  if (closeCreatePA) closeCreatePA.addEventListener('click', closeCreatePAModal);
  if (cpCancel) cpCancel.addEventListener('click', closeCreatePAModal);
  if (createPAModal) createPAModal.addEventListener('click', function(e) { if (e.target === createPAModal) closeCreatePAModal(); });

  /* Source card toggle */
  if (createPAModal) {
    createPAModal.querySelectorAll('.reg-source-card').forEach(function(card) {
      card.addEventListener('click', function() {
        createPAModal.querySelectorAll('.reg-source-card').forEach(function(c) { c.classList.remove('active'); });
        card.classList.add('active');
      });
    });
  }

  /* Submit */
  if (cpSubmit) {
    cpSubmit.addEventListener('click', function() {
      var cc = document.getElementById('cpCC').value.trim();
      var risk = document.getElementById('cpRisk').value;
      var eta = document.getElementById('cpETA').value.trim();

      if (!cc) { showToast('กรุณากรอกอาการสำคัญ', 'warn'); return; }
      if (!risk) { showToast('กรุณาเลือกระดับ Risk', 'warn'); return; }
      if (!eta) { showToast('กรุณากรอก ETA', 'warn'); return; }

      var name = document.getElementById('cpName').value.trim() || 'ไม่ทราบชื่อ';
      var gender = document.getElementById('cpGender').value;
      var age = document.getElementById('cpAge').value.trim() || '—';
      var source = createPAModal.querySelector('input[name="paSource"]:checked').value;
      var vehicle = document.getElementById('cpVehicle').value.trim();
      var bp = document.getElementById('cpBP').value.trim();
      var hr = document.getElementById('cpHR').value.trim();
      var spo2 = document.getElementById('cpSpO2').value.trim();
      var gcs = document.getElementById('cpGCS').value.trim();
      var treatment = document.getElementById('cpTreatment').value.trim();

      var riskLabels = { resus:'Resuscitation', emergency:'Emergency', urgent:'Urgent', semi:'Semi-urgent' };
      var riskColors = { resus:'critical', emergency:'emergency', urgent:'urgent', semi:'urgent' };
      var caseNum = 'PA-' + String(Math.floor(Math.random()*9000)+1000);

      /* Add to dashboard Pre-Arrival list */
      var paList = document.querySelector('.pa-dash-list');
      if (paList) {
        var newCard = document.createElement('div');
        newCard.className = 'pa-mini ' + riskColors[risk];
        newCard.innerHTML =
          '<div class="pa-mini-left">' +
            '<div class="pa-mini-eta-box ' + riskColors[risk] + '">' +
              '<div class="pa-mini-eta-num">' + eta + '</div>' +
              '<div class="pa-mini-eta-unit">นาที</div>' +
            '</div>' +
          '</div>' +
          '<div class="pa-mini-body">' +
            '<div class="pa-mini-top">' +
              '<span class="pa-mini-case">' + caseNum + '</span>' +
              '<span class="pa-mini-risk ' + riskColors[risk] + '">' + riskLabels[risk] + '</span>' +
              '<span class="pa-mini-source ' + (source.indexOf('EMS') > -1 ? 'ems' : source === 'Refer' ? 'refer' : 'ems') + '">' + source + '</span>' +
              (vehicle ? '<span class="pa-mini-vehicle">รถ ' + vehicle + '</span>' : '') +
            '</div>' +
            '<div class="pa-mini-title">' + cc + ' — ' + (name !== 'ไม่ทราบชื่อ' ? name + ' ' : '') + gender + ' ' + age + ' ปี</div>' +
            '<div class="pa-mini-treats">' +
              (bp ? '<span class="pa-treat-tag done">BP ' + bp + '</span>' : '') +
              (hr ? '<span class="pa-treat-tag done">HR ' + hr + '</span>' : '') +
              (spo2 ? '<span class="pa-treat-tag done">SpO2 ' + spo2 + '</span>' : '') +
              (treatment ? treatment.split(',').map(function(t) { return '<span class="pa-treat-tag done">' + t.trim() + '</span>'; }).join('') : '') +
            '</div>' +
          '</div>' +
          '<button class="pa-prep-btn" data-prep-case="' + caseNum + '">เตรียมรับ</button>';
        newCard.dataset.caseId = caseNum;
        newCard.dataset.caseRisk = riskLabels[risk];
        newCard.dataset.caseCc = cc + ' — ' + (name !== 'ไม่ทราบชื่อ' ? name + ' ' : '') + gender + ' ' + age + ' ปี';
        newCard.dataset.caseEta = eta;
        paList.insertBefore(newCard, paList.firstChild);

        /* Update count */
        var countEl = document.querySelector('.pa-dash-count');
        if (countEl) countEl.textContent = parseInt(countEl.textContent) + 1;
      }

      /* Save to ERStore */
      ERStore.addPreArrival({
        caseId: caseNum,
        risk: riskLabels[risk],
        cc: cc + ' — ' + (name !== 'ไม่ทราบชื่อ' ? name + ' ' : '') + gender + ' ' + age + ' ปี',
        eta: parseInt(eta) * 60,
        etaTotal: parseInt(eta) * 60 + 120,
        source: source,
        vehicle: vehicle,
        name: name, gender: gender, age: age, bp: bp, hr: hr, spo2: spo2, gcs: gcs, treatment: treatment
      });

      closeCreatePAModal();
      showToast('สร้างเคส Pre-Arrival ' + caseNum + ' เรียบร้อย — ' + riskLabels[risk] + ' · ETA ' + eta + ' นาที', 'success');
    });
  }

  /* ── Pre-Arrival Modal ── */
  const paModal = document.getElementById('preArrivalModal');
  const openPA = document.getElementById('openPreArrival');
  const closePA = document.getElementById('closePreArrival');

  var openPADash = document.getElementById('openPreArrivalFromDash');

  function openPAModal() { if (paModal) paModal.classList.add('show'); }

  if (openPA) openPA.addEventListener('click', function(e) { e.preventDefault(); openPAModal(); });
  if (openPADash) openPADash.addEventListener('click', openPAModal);

  /* Click mini cards — open EMS Timeline */
  var emsModal = document.getElementById('emsTimelineModal');
  var closeEms = document.getElementById('closeEmsTimeline');

  function openEmsTimeline() { if (emsModal) emsModal.classList.add('show'); }
  function closeEmsTimeline() { if (emsModal) emsModal.classList.remove('show'); }

  if (closeEms) closeEms.addEventListener('click', closeEmsTimeline);
  if (emsModal) emsModal.addEventListener('click', function(e) { if (e.target === emsModal) closeEmsTimeline(); });

  document.querySelectorAll('.pa-mini').forEach(function(mini) {
    mini.addEventListener('click', openEmsTimeline);
  });

  /* Sidebar + Dashboard header links */
  var openEmsSidebar = document.getElementById('openEmsFromSidebar');
  var openEmsDash = document.getElementById('openEmsFromDash');
  if (openEmsSidebar) openEmsSidebar.addEventListener('click', function(e) { e.preventDefault(); openEmsTimeline(); });
  if (openEmsDash) openEmsDash.addEventListener('click', openEmsTimeline);

  /* Link Visit — 3-step flow */
  var linkVisitBtn = document.getElementById('linkVisitBtn');
  var linkModal = document.getElementById('linkVisitModal');
  var closeLinkVisit = document.getElementById('closeLinkVisit');
  var linkStep1 = document.getElementById('linkStep1');
  var linkStepNew = document.getElementById('linkStepNew');
  var linkStep2 = document.getElementById('linkStep2');
  var linkStep3 = document.getElementById('linkStep3');
  var lvConfirmPatient = document.getElementById('lvConfirmPatient');
  var lvSuccessDetail = document.getElementById('lvSuccessDetail');
  var selectedHN = '';
  var selectedName = '';

  function hideAllSteps() {
    linkStep1.style.display = 'none';
    if (linkStepNew) linkStepNew.style.display = 'none';
    linkStep2.style.display = 'none';
    linkStep3.style.display = 'none';
  }

  function openLinkModal() {
    hideAllSteps();
    linkStep1.style.display = '';
    if (linkModal) linkModal.classList.add('show');
  }

  function closeLinkModal() { if (linkModal) linkModal.classList.remove('show'); }

  if (linkVisitBtn) linkVisitBtn.addEventListener('click', openLinkModal);
  if (closeLinkVisit) closeLinkVisit.addEventListener('click', closeLinkModal);
  if (linkModal) linkModal.addEventListener('click', function(e) { if (e.target === linkModal) closeLinkModal(); });

  /* Step 1: Select patient */
  document.querySelectorAll('.lv-result-item').forEach(function(item) {
    item.addEventListener('click', function() {
      selectedHN = item.dataset.hn;
      selectedName = item.dataset.name;
      lvConfirmPatient.textContent = selectedName + ' · HN ' + selectedHN;
      linkStep1.style.display = 'none';
      linkStep2.style.display = '';
    });
  });

  var lvCreateNew = document.getElementById('lvCreateNew');
  if (lvCreateNew) {
    lvCreateNew.addEventListener('click', function() {
      hideAllSteps();
      linkStepNew.style.display = '';
    });
  }

  /* Back from new visit form */
  var lvBackFromNew = document.getElementById('lvBackFromNew');
  var lvCancelNew = document.getElementById('lvCancelNew');
  if (lvBackFromNew) lvBackFromNew.addEventListener('click', function() { hideAllSteps(); linkStep1.style.display = ''; });
  if (lvCancelNew) lvCancelNew.addEventListener('click', function() { hideAllSteps(); linkStep1.style.display = ''; });

  /* Submit new visit → go to Step 3 directly (create + link in one go) */
  var lvSubmitNew = document.getElementById('lvSubmitNew');
  if (lvSubmitNew) {
    lvSubmitNew.addEventListener('click', function() {
      var nvName = document.getElementById('nvName').value.trim();
      var nvAge = document.getElementById('nvAge').value.trim();
      var nvBed = document.getElementById('nvBed').value;
      var nvDoctor = document.getElementById('nvDoctor').value;
      var gender = document.querySelector('input[name="nvGender"]:checked').value;
      var genderText = gender === 'male' ? 'ชาย' : gender === 'female' ? 'หญิง' : 'ไม่ทราบเพศ';

      selectedHN = '640100';
      selectedName = nvName || (genderText + ' ' + nvAge + ' (ไม่ทราบชื่อ)');

      hideAllSteps();
      linkStep3.style.display = '';
      lvSuccessDetail.innerHTML = '<strong>' + selectedName + '</strong> · HN ' + selectedHN + ' · เตียง ' + (nvBed || '—') + ' · ' + (nvDoctor || '—');

      /* Update EMS Timeline visit link bar */
      var bar = document.querySelector('.tl-visit-link');
      if (bar) {
        bar.classList.add('linked');
        bar.querySelector('.tl-visit-badge').className = 'tl-visit-badge linked';
        bar.querySelector('.tl-visit-badge').innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px;"><polyline points="20 6 9 17 4 12"/></svg> ผูก Visit แล้ว — HN ' + selectedHN + ' · ' + selectedName;
        linkVisitBtn.textContent = 'ผูกแล้ว';
        linkVisitBtn.disabled = true;
        linkVisitBtn.style.opacity = '0.5';
      }

      showToast('สร้าง Visit HN ' + selectedHN + ' + ผูก EMS Timeline เรียบร้อย', 'success');
    });
  }

  /* Step 2: Back / Confirm */
  var lvBack = document.getElementById('lvBack');
  if (lvBack) lvBack.addEventListener('click', function() {
    linkStep2.style.display = 'none';
    linkStep1.style.display = '';
  });

  var lvConfirmLink = document.getElementById('lvConfirmLink');
  if (lvConfirmLink) {
    lvConfirmLink.addEventListener('click', function() {
      linkStep2.style.display = 'none';
      linkStep3.style.display = '';
      lvSuccessDetail.textContent = selectedName + ' · HN ' + selectedHN;

      /* Update EMS Timeline visit link bar */
      var bar = document.querySelector('.tl-visit-link');
      if (bar) {
        bar.classList.add('linked');
        bar.querySelector('.tl-visit-badge').className = 'tl-visit-badge linked';
        bar.querySelector('.tl-visit-badge').innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px;"><polyline points="20 6 9 17 4 12"/></svg> ผูก Visit แล้ว — HN ' + selectedHN + ' · ' + selectedName;
        linkVisitBtn.textContent = 'ผูกแล้ว';
        linkVisitBtn.disabled = true;
        linkVisitBtn.style.opacity = '0.5';
      }

      showToast('ผูก EMS Timeline กับ Visit ER (HN ' + selectedHN + ') เรียบร้อย', 'success');
    });
  }

  /* Step 3: View combined timeline */
  var combinedModal = document.getElementById('combinedTimelineModal');
  var closeCombinedTL = document.getElementById('closeCombinedTL');
  var lvViewCombined = document.getElementById('lvViewCombined');

  if (closeCombinedTL) closeCombinedTL.addEventListener('click', function() { combinedModal.classList.remove('show'); });
  if (combinedModal) combinedModal.addEventListener('click', function(e) { if (e.target === combinedModal) combinedModal.classList.remove('show'); });

  if (lvViewCombined) {
    lvViewCombined.addEventListener('click', function() {
      closeLinkModal();
      closeEmsTimeline();
      if (combinedModal) combinedModal.classList.add('show');
    });
  }

  if (paModal) {
    closePA.addEventListener('click', function() { paModal.classList.remove('show'); });
    paModal.addEventListener('click', function(e) { if (e.target === paModal) paModal.classList.remove('show'); });

    /* Timeline buttons inside Pre-Arrival modal */
    paModal.querySelectorAll('.pa-timeline-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        paModal.classList.remove('show');
        openEmsTimeline();
      });
    });

    /* Prep tag toggle */
    paModal.querySelectorAll('.pa-prep-tag').forEach(function(tag) {
      tag.addEventListener('click', function() {
        tag.classList.toggle('checked');
        if (tag.classList.contains('checked')) {
          showToast(tag.textContent.trim() + ' — พร้อมแล้ว', 'success');
        }
      });
    });

    /* Accept case */
    paModal.querySelectorAll('.pa-accept-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var card = btn.closest('.pa-card');
        var preps = card.querySelectorAll('.pa-prep-tag:not(.checked)');
        if (preps.length > 0) {
          openConfirm(
            'รับเคส',
            'ยังมีรายการเตรียมที่ยังไม่ได้ทำ <strong>' + preps.length + ' รายการ</strong><br>ต้องการรับเคสเลยหรือไม่?',
            'รับเคสเลย',
            function() {
              card.classList.add('accepted');
              btn.textContent = 'รับแล้ว';
              showToast('รับเคสเรียบร้อย — กำลังเตรียมทีม', 'success');
            }
          );
        } else {
          card.classList.add('accepted');
          btn.textContent = 'รับแล้ว';
          showToast('รับเคสเรียบร้อย — ทีมพร้อม อุปกรณ์พร้อม', 'success');
        }
      });
    });

    /* ETA countdown */
    setInterval(function() {
      paModal.querySelectorAll('.pa-eta-time').forEach(function(el) {
        var mins = parseInt(el.dataset.eta);
        if (mins > 0) {
          mins--;
          el.dataset.eta = mins;
          el.textContent = mins + ' นาที';
          if (mins <= 3) el.style.color = 'var(--red-600)';
          if (mins === 0) el.textContent = 'ถึงแล้ว!';
        }
      });
    }, 60000);
  }

  /* ── Dashboard: Transport Overview ── */
  (function renderDashTransport() {
    var list = document.getElementById('dashTransportList');
    var countEl = document.getElementById('dashTrCount');
    if (!list) return;
    var transports = ERStore.getTransports();
    var active = transports.filter(function(t) { return t.status !== 'completed' && t.status !== 'cancelled'; });

    if (countEl) countEl.textContent = active.length + ' active';

    if (active.length === 0) {
      list.innerHTML = '<div style="text-align:center;padding:20px;color:var(--slate-400);font-size:12px;">ไม่มีการเคลื่อนย้ายในขณะนี้</div>';
      return;
    }

    var statusLabels = {pending:'รอ Porter',accepted:'Porter รับงาน',in_transit:'กำลังเคลื่อนย้าย'};
    var html = '';
    active.forEach(function(tr) {
      html += '<div class="tr-dash-item">' +
        '<div class="tr-dash-dot ' + tr.priority + '"></div>' +
        '<div class="tr-dash-info">' +
          '<div class="tr-dash-name">' + tr.patient + ' → ' + tr.dest + '</div>' +
          '<div class="tr-dash-dest">' + (statusLabels[tr.status]||tr.status) + (tr.porter ? ' · ' + tr.porter : '') + ' · ' + tr.requestTime + '</div>' +
        '</div>' +
        '<div class="tr-dash-right">' +
          '<span class="tr-status ' + tr.status + '">' + (statusLabels[tr.status]||tr.status) + '</span>' +
        '</div>' +
      '</div>';
    });
    list.innerHTML = html;
  })();

}

/* ── Alert Panel Page ──────────────────── */
if (currentPage === 'alerts') {

  /* Clock */
  function tick() {
    const el = document.getElementById('clock');
    if (el) el.textContent = new Date().toLocaleTimeString('th-TH', { hour12: false });
  }
  tick(); setInterval(tick, 1000);

  /* Mobile sidebar */
  const sb = document.getElementById('sidebar');
  const ov = document.getElementById('sbOverlay');
  const menuBtn = document.getElementById('menuBtn');
  if (menuBtn) {
    menuBtn.onclick = () => { sb.classList.toggle('open'); ov.classList.toggle('show'); };
    ov.onclick = () => { sb.classList.remove('open'); ov.classList.remove('show'); };
  }

  /* Tab filter */
  const tabs = document.querySelectorAll('.ap-tab');
  const cards = document.querySelectorAll('.ap-card');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.dataset.filter;

      cards.forEach(card => {
        if (filter === 'all' || card.dataset.type === filter) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
}

/* ── Registration Page ──────────────────── */
if (currentPage === 'registration') {
  /* Clock */
  var clockEl = document.getElementById('clock');
  if (clockEl) { function t(){clockEl.textContent=new Date().toLocaleTimeString('th-TH',{hour12:false,hour:'2-digit',minute:'2-digit'});}t();setInterval(t,1000); }

  /* Mobile sidebar */
  var sb = document.getElementById('sidebar');
  var ov = document.getElementById('sbOverlay');
  var mb = document.getElementById('menuBtn');
  if (mb) { mb.onclick=function(){sb.classList.toggle('open');ov.classList.toggle('show');}; ov.onclick=function(){sb.classList.remove('open');ov.classList.remove('show');}; }

  /* Auto-fill from Pre-Arrival (if came from "ผู้ป่วยมาถึง") */
  var urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('from') === 'prearrival') {
    var paData = JSON.parse(sessionStorage.getItem('preArrivalData') || '{}');
    if (paData.caseId) {
      /* Select EMS source */
      var emsRadio = document.querySelector('input[name="source"][value="ems"]');
      if (emsRadio) {
        emsRadio.checked = true;
        document.querySelectorAll('.reg-source-card').forEach(function(c) { c.classList.remove('active'); });
        emsRadio.closest('.reg-source-card').classList.add('active');
      }

      /* Fill CC */
      var ccField = document.getElementById('regCC');
      if (ccField && paData.cc) ccField.value = paData.cc;

      /* Show EMS link as filled */
      var linkBox = document.getElementById('regEmsLink');
      if (linkBox) {
        linkBox.style.display = '';
        linkBox.innerHTML = '<div class="reg-ems-filled">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px;color:var(--green);"><polyline points="20 6 9 17 4 12"/></svg>' +
          '<div class="reg-ems-filled-info">' +
            '<strong>จาก Pre-Arrival ' + paData.caseId + ' — เตรียมรับแล้ว (' + (paData.checklist || '') + ')</strong>' +
            '<p>' + (paData.risk || '') + ' · ' + (paData.cc || '') + (paData.doctor ? ' · แพทย์: ' + paData.doctor : '') + (paData.bed ? ' · เตียง: ' + paData.bed : '') + '</p>' +
          '</div>' +
        '</div>';
      }

      showToast('ดึงข้อมูลจาก Pre-Arrival ' + paData.caseId + ' เรียบร้อย', 'success');
    }
  }

  /* Source card toggle */
  var sourcCards = document.querySelectorAll('.reg-source-card');
  var emsLink = document.getElementById('regEmsLink');
  var massSection = document.getElementById('regMassSection');

  /* Auto-fill from active incident */
  var savedIncident = sessionStorage.getItem('activeIncident');
  if (savedIncident) {
    try {
      var inc = JSON.parse(savedIncident);
      /* Auto-select Mass Casualty */
      var massRadio = document.querySelector('input[name="source"][value="mass"]');
      if (massRadio) {
        massRadio.checked = true;
        sourcCards.forEach(function(c) { c.classList.remove('active'); });
        massRadio.closest('.reg-source-card').classList.add('active');
        if (massSection) massSection.style.display = '';
      }
      /* Fill fields */
      if (document.getElementById('regIncidentId')) document.getElementById('regIncidentId').value = inc.id || '';
      if (document.getElementById('regIncidentType')) document.getElementById('regIncidentType').value = inc.type || '';
      if (document.getElementById('regIncidentLocation')) document.getElementById('regIncidentLocation').value = inc.location || '';
      if (document.getElementById('regIncidentTotal')) document.getElementById('regIncidentTotal').value = inc.total || '';
      if (document.getElementById('regIncidentTotalDisplay')) document.getElementById('regIncidentTotalDisplay').textContent = inc.total || '—';
      if (document.getElementById('regIncidentCount')) document.getElementById('regIncidentCount').textContent = (inc.count || 0) + 1;

      showToast('ดึงข้อมูล Incident ' + inc.id + ' อัตโนมัติ — ผู้ป่วยคนที่ ' + ((inc.count || 0) + 1), 'info');
    } catch(e) {}
  }

  sourcCards.forEach(function(card) {
    card.addEventListener('click', function() {
      sourcCards.forEach(function(c) { c.classList.remove('active'); });
      card.classList.add('active');
      var val = card.querySelector('input').value;
      if (emsLink) emsLink.style.display = (val === 'ems' || val === 'refer') ? '' : 'none';
      if (massSection) massSection.style.display = (val === 'mass') ? '' : 'none';
    });
  });

  /* Pick Incident Modal */
  var pickIncModal = document.getElementById('pickIncidentModal');
  var closePickInc = document.getElementById('closePickIncident');
  var pickIncBtn = document.getElementById('regPickIncident');
  var newIncBtn = document.getElementById('regNewIncident');
  var incInfoEl = document.getElementById('regIncidentInfo');
  var newIncForm = document.getElementById('regNewIncidentForm');
  var changeIncBtn = document.getElementById('regChangeIncident');

  if (pickIncBtn && pickIncModal) {
    pickIncBtn.addEventListener('click', function() { pickIncModal.classList.add('show'); });
  }
  if (closePickInc) closePickInc.addEventListener('click', function() { pickIncModal.classList.remove('show'); });
  if (pickIncModal) pickIncModal.addEventListener('click', function(e) { if (e.target === pickIncModal) pickIncModal.classList.remove('show'); });

  /* Select incident from list */
  if (pickIncModal) {
    pickIncModal.querySelectorAll('.pick-pa-card').forEach(function(card) {
      card.addEventListener('click', function() {
        var id = card.dataset.incId;
        var type = card.dataset.incType;
        var location = card.dataset.incLocation;
        var total = card.dataset.incTotal;

        /* Fill form */
        if (document.getElementById('regIncidentId')) document.getElementById('regIncidentId').value = id;
        if (document.getElementById('regIncidentType')) document.getElementById('regIncidentType').value = type;
        if (document.getElementById('regIncidentLocation')) document.getElementById('regIncidentLocation').value = location;
        if (document.getElementById('regIncidentTotal')) document.getElementById('regIncidentTotal').value = total;
        if (document.getElementById('regIncidentTotalDisplay')) document.getElementById('regIncidentTotalDisplay').textContent = total;

        /* Show info, hide form + buttons */
        if (incInfoEl) {
          incInfoEl.style.display = '';
          document.getElementById('regIncidentSelected').textContent = 'Incident ' + id;
          document.getElementById('regIncidentSelectedDetail').textContent = card.querySelector('div:last-child div:last-child').textContent;
        }
        if (newIncForm) newIncForm.style.display = 'none';
        pickIncBtn.style.display = 'none';
        newIncBtn.style.display = 'none';

        /* Save to session */
        sessionStorage.setItem('activeIncident', JSON.stringify({ id:id, type:type, location:location, total:total, count:0 }));

        pickIncModal.classList.remove('show');
        showToast('ดึง Incident ' + id + ' เรียบร้อย', 'success');
      });
    });
  }

  /* New Incident button */
  if (newIncBtn) {
    newIncBtn.addEventListener('click', function() {
      if (newIncForm) newIncForm.style.display = '';
      if (incInfoEl) incInfoEl.style.display = 'none';
      pickIncBtn.style.display = 'none';
      newIncBtn.style.display = 'none';
    });
  }

  /* Change Incident */
  if (changeIncBtn) {
    changeIncBtn.addEventListener('click', function() {
      if (incInfoEl) incInfoEl.style.display = 'none';
      if (newIncForm) newIncForm.style.display = 'none';
      pickIncBtn.style.display = '';
      newIncBtn.style.display = '';
    });
  }

  /* Clear incident */
  var clearIncBtn = document.getElementById('regClearIncident');
  if (clearIncBtn) {
    clearIncBtn.addEventListener('click', function() {
      sessionStorage.removeItem('activeIncident');
      sessionStorage.removeItem('incidentCount');
      if (document.getElementById('regIncidentId')) document.getElementById('regIncidentId').value = '';
      if (document.getElementById('regIncidentType')) document.getElementById('regIncidentType').value = '';
      if (document.getElementById('regIncidentLocation')) document.getElementById('regIncidentLocation').value = '';
      if (document.getElementById('regIncidentTotal')) document.getElementById('regIncidentTotal').value = '';
      if (document.getElementById('regIncidentCount')) document.getElementById('regIncidentCount').textContent = '1';
      if (document.getElementById('regIncidentTotalDisplay')) document.getElementById('regIncidentTotalDisplay').textContent = '—';
      showToast('ยกเลิก Incident แล้ว — กลับสู่โหมดปกติ', 'success');
    });
  }

  /* Mass Casualty: update total display */
  var mcTotalInput = document.getElementById('regIncidentTotal');
  if (mcTotalInput) {
    mcTotalInput.addEventListener('input', function() {
      var disp = document.getElementById('regIncidentTotalDisplay');
      if (disp) disp.textContent = mcTotalInput.value || '—';
    });
  }

  /* Duplicate Visit Check */
  var regCheckDup = document.getElementById('regCheckDup');
  var regDupWarn = document.getElementById('regDupWarn');
  var regDupAlert = document.getElementById('regDupAlert');
  var regCID = document.getElementById('regCID');

  /* Mock existing patients in ER */
  var existingPatients = {
    '1100100200301': { name: 'สมชาย ใจดี', hn: '640001', bed: 'B1', status: 'กำลังรักษา', triage: 'Resuscitation', doctor: 'นพ.สมศักดิ์', time: '14:32' },
    '1309900456781': { name: 'วิภา แสงทอง', hn: '640012', bed: 'B4', status: 'รอแพทย์', triage: 'Emergency', doctor: '—', time: '09:42' }
  };

  if (regCheckDup) {
    regCheckDup.addEventListener('click', function() {
      var cid = (regCID.value || '').replace(/[- ]/g, '');

      if (!cid) {
        showToast('กรุณากรอกเลขบัตรประชาชนก่อน', 'warn');
        return;
      }

      regDupWarn.style.display = '';

      if (existingPatients[cid]) {
        var p = existingPatients[cid];
        regDupAlert.className = 'reg-dup-alert found';
        regDupAlert.innerHTML =
          '<div class="reg-dup-icon warn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div>' +
          '<div class="reg-dup-body">' +
            '<div class="reg-dup-title warn">พบ Visit ER ค้างอยู่ — ไม่สามารถเปิดซ้ำได้</div>' +
            '<div class="reg-dup-desc">ผู้ป่วยรายนี้มี Visit ที่ยังเปิดอยู่ใน ER กรุณาไปที่ Visit เดิม หรือปิด Visit ก่อนเปิดใหม่</div>' +
            '<div class="reg-dup-patient">' +
              '<div class="reg-dup-patient-avatar">' + p.name.charAt(0) + '</div>' +
              '<div class="reg-dup-patient-info">' +
                '<div class="reg-dup-patient-name">' + p.name + ' · HN ' + p.hn + '</div>' +
                '<div class="reg-dup-patient-detail">เตียง ' + p.bed + ' · ' + p.triage + ' · ' + p.status + ' · แพทย์: ' + p.doctor + ' · มาถึง ' + p.time + '</div>' +
              '</div>' +
            '</div>' +
            '<div class="reg-dup-actions">' +
              '<button class="ap-btn primary" onclick="showToast(\'กำลังเปิด Visit HN ' + p.hn + '\',\'info\')">ไปที่ Visit เดิม</button>' +
              '<button class="ap-btn outline" onclick="showToast(\'กำลังปิด Visit เดิมและเปิดใหม่\',\'warn\')">ปิด Visit เดิม + เปิดใหม่</button>' +
            '</div>' +
          '</div>';
      } else {
        regDupAlert.className = 'reg-dup-alert clear';
        regDupAlert.innerHTML =
          '<div class="reg-dup-icon ok"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>' +
          '<div class="reg-dup-body">' +
            '<div class="reg-dup-title ok">ไม่พบ Visit ค้าง — เปิด Visit ใหม่ได้</div>' +
            '<div class="reg-dup-desc">ไม่พบผู้ป่วยที่มีเลขบัตรประชาชนนี้ใน ER ปัจจุบัน สามารถลงทะเบียนเปิด Visit ใหม่ได้เลย</div>' +
          '</div>';
      }
    });
  }

  /* Pick Pre-Arrival */
  var pickPAModal = document.getElementById('pickPAModal');
  var closePickPA = document.getElementById('closePickPA');
  var regPickBtn = document.getElementById('regPickPreArrival');

  if (regPickBtn && pickPAModal) {
    regPickBtn.addEventListener('click', function() { pickPAModal.classList.add('show'); });
    closePickPA.addEventListener('click', function() { pickPAModal.classList.remove('show'); });
    pickPAModal.addEventListener('click', function(e) { if (e.target === pickPAModal) pickPAModal.classList.remove('show'); });

    pickPAModal.querySelectorAll('.pick-pa-card').forEach(function(card) {
      card.addEventListener('click', function() {
        var gender = card.dataset.gender;
        var age = card.dataset.age;
        var name = card.dataset.name;
        var cc = card.dataset.cc;
        var source = card.dataset.source;
        var pmh = card.dataset.pmh;
        var allergy = card.dataset.allergy;

        /* Fill form */
        var prefixEl = document.getElementById('regPrefix');
        if (gender === 'ชาย') prefixEl.value = 'นาย';
        else if (gender === 'หญิง') prefixEl.value = 'นางสาว';
        else prefixEl.value = 'ไม่ทราบ';

        var genderEl = document.getElementById('regGender');
        if (gender === 'ชาย') genderEl.value = 'male';
        else if (gender === 'หญิง') genderEl.value = 'female';
        else genderEl.value = 'unknown';

        if (name) {
          var parts = name.split(' ');
          document.getElementById('regFname').value = parts[0] || '';
          document.getElementById('regLname').value = parts.slice(1).join(' ') || '';
        } else {
          document.getElementById('regFname').value = '';
          document.getElementById('regLname').value = '';
        }

        document.getElementById('regAge').value = age.replace('~','');
        document.getElementById('regCC').value = cc;
        document.getElementById('regPMH').value = pmh || '';
        document.getElementById('regAllergy').value = allergy || '';
        document.getElementById('regOnset').value = card.dataset.onset || '';

        /* Select source radio */
        var sourceVal = source.indexOf('EMS') > -1 ? 'ems' : 'refer';
        var radio = document.querySelector('input[name="source"][value="' + sourceVal + '"]');
        if (radio) {
          radio.checked = true;
          sourcCards.forEach(function(c) { c.classList.remove('active'); });
          radio.closest('.reg-source-card').classList.add('active');
        }

        /* Change EMS link box to filled */
        var linkBox = document.getElementById('regEmsLink');
        if (linkBox) {
          linkBox.innerHTML = '<div class="reg-ems-filled">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px;color:var(--green);"><polyline points="20 6 9 17 4 12"/></svg>' +
            '<div class="reg-ems-filled-info">' +
              '<strong>ดึงข้อมูลจาก ' + source + ' แล้ว</strong>' +
              '<p>' + cc + '</p>' +
            '</div>' +
            '<button class="ap-btn outline" onclick="document.getElementById(\'pickPAModal\').classList.add(\'show\')">เปลี่ยนเคส</button>' +
          '</div>';
          linkBox.style.display = '';
        }

        pickPAModal.classList.remove('show');
        showToast('ดึงข้อมูลจาก ' + source + ' เรียบร้อย — กรอกอัตโนมัติแล้ว', 'success');
      });
    });
  }

  /* Toggle mandatory based on prefix */
  var prefixSelect = document.getElementById('regPrefix');
  var mandatoryFields = ['regFname', 'regLname', 'regAge', 'regGender', 'regPhone', 'regScheme', 'regCC'];

  function updateMandatory() {
    var isUnknown = prefixSelect.value === 'ไม่ทราบ';

    mandatoryFields.forEach(function(id) {
      var field = document.getElementById(id);
      if (!field) return;
      var label = field.closest('.nv-field').querySelector('.nv-label');
      var star = label ? label.querySelector('span[style]') : null;

      if (isUnknown) {
        /* Hide asterisks + remove error */
        if (star) star.style.display = 'none';
        field.classList.remove('nv-error');
      } else {
        if (star) star.style.display = '';
      }
    });
  }

  if (prefixSelect) {
    prefixSelect.addEventListener('change', updateMandatory);
  }

  /* Submit → validate then go to triage */
  var regSubmit = document.getElementById('regSubmit');
  if (regSubmit) {
    regSubmit.addEventListener('click', function() {
      var prefix = prefixSelect ? prefixSelect.value : '';
      var isUnknown = prefix === 'ไม่ทราบ';

      if (!prefix) {
        showToast('กรุณาเลือกคำนำหน้า', 'warn');
        prefixSelect.focus();
        return;
      }

      /* If unknown prefix → skip mandatory check, go straight to triage */
      if (isUnknown) {
        showToast('ลงทะเบียนแบบไม่ทราบข้อมูล — ไป Triage', 'success');
        setTimeout(function() { window.location.href = 'triage.html'; }, 800);
        return;
      }

      /* Normal → check mandatory fields */
      var missing = [];
      var labels = {
        regFname: 'ชื่อ',
        regLname: 'นามสกุล',
        regAge: 'อายุ',
        regGender: 'เพศ',
        regPhone: 'เบอร์โทรศัพท์',
        regScheme: 'สิทธิ์การรักษา',
        regCC: 'อาการนำ'
      };

      mandatoryFields.forEach(function(id) {
        var field = document.getElementById(id);
        if (!field) return;
        var val = field.value.trim();
        if (!val) {
          missing.push(labels[id] || id);
          field.classList.add('nv-error');
        } else {
          field.classList.remove('nv-error');
        }
      });

      if (missing.length > 0) {
        showToast('กรุณากรอก: ' + missing.join(', '), 'warn');
        return;
      }

      /* Save to ERStore + add to triage queue */
      var newHN = '64' + String(Math.floor(Math.random()*9000)+1000);
      var fname = document.getElementById('regFname').value || '';
      var lname = document.getElementById('regLname').value || '';
      var fullName = (fname + ' ' + lname).trim() || 'ผู้ป่วยใหม่';
      var age = document.getElementById('regAge').value || '—';
      var gender = document.getElementById('regGender');
      var genderText = gender ? (gender.value === 'male' ? 'ชาย' : gender.value === 'female' ? 'หญิง' : 'ไม่ทราบ') : '—';
      var ccVal = document.getElementById('regCC').value || '—';
      var srcRadio = document.querySelector('input[name="source"]:checked');
      var srcText = srcRadio ? (srcRadio.value === 'ems' ? 'EMS' : srcRadio.value === 'refer' ? 'Refer' : 'Walk-in') : 'Walk-in';

      /* Mass Casualty incident data */
      var incidentId = null;
      if (srcText === 'Mass Casualty') {
        incidentId = (document.getElementById('regIncidentId') || {}).value || null;
        if (incidentId) {
          /* Save incident for next registration */
          sessionStorage.setItem('activeIncident', JSON.stringify({
            id: incidentId,
            type: (document.getElementById('regIncidentType') || {}).value || '',
            location: (document.getElementById('regIncidentLocation') || {}).value || '',
            total: (document.getElementById('regIncidentTotal') || {}).value || '',
            count: parseInt(sessionStorage.getItem('incidentCount') || '0') + 1
          }));
          sessionStorage.setItem('incidentCount', parseInt(sessionStorage.getItem('incidentCount') || '0') + 1);
        }
      }

      ERStore.addToTriageQueue({
        hn: newHN,
        name: fullName,
        gender: genderText,
        age: age,
        cc: ccVal,
        source: srcText,
        time: new Date().toLocaleTimeString('th-TH', {hour12:false, hour:'2-digit', minute:'2-digit'}),
        wait: 0,
        incident: incidentId
      });

      sessionStorage.setItem('lastRegisteredHN', newHN);
      sessionStorage.setItem('lastRegisteredName', fullName);

      window.location.href = 'triage.html';
    });
  }

  /* Toast helper */
  function showToast(msg, type) {
    type = type || 'success';
    var container = document.getElementById('toastContainer');
    var t = document.createElement('div');
    t.className = 'toast ' + type;
    t.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>' + msg + '</span>';
    container.appendChild(t);
    setTimeout(function() { t.remove(); }, 3200);
  }
}

/* ── Triage Page ────────────────────────── */
if (currentPage === 'triage') {
  /* Clock */
  var clockEl = document.getElementById('clock');
  if (clockEl) { function t(){clockEl.textContent=new Date().toLocaleTimeString('th-TH',{hour12:false,hour:'2-digit',minute:'2-digit'});}t();setInterval(t,1000); }

  /* Mobile sidebar */
  var sb = document.getElementById('sidebar');
  var ov = document.getElementById('sbOverlay');
  var mb = document.getElementById('menuBtn');
  if (mb) { mb.onclick=function(){sb.classList.toggle('open');ov.classList.toggle('show');}; ov.onclick=function(){sb.classList.remove('open');ov.classList.remove('show');}; }

  /* Render triage queue from ERStore */
  (function renderTriageQueue() {
    var queue = ERStore.getTriageQueue();
    var container = document.querySelector('#triSelectPatient .card-bd');
    if (!container || !queue.length) return;

    container.innerHTML = '';
    queue.forEach(function(p, idx) {
      var item = document.createElement('div');
      item.className = 'tri-q-item tri-select-item';
      item.dataset.hn = p.hn;
      item.dataset.name = p.name;
      item.dataset.gender = p.gender;
      item.dataset.age = p.age;
      item.dataset.cc = p.cc;
      item.dataset.source = p.source;
      item.dataset.time = p.time;
      item.dataset.wait = p.wait;
      var initials = p.name.substring(0, 2);
      var waitClass = p.wait >= 10 ? 'warn' : p.wait >= 5 ? '' : 'over';
      item.innerHTML =
        '<div class="tri-q-order">' + (idx + 1) + '</div>' +
        '<div class="tri-q-avatar" style="background:var(--slate-100);color:var(--slate-600);">' + initials + '</div>' +
        '<div class="tri-q-info"><div class="tri-q-name">' + p.name + ' <span class="tri-q-hn">HN ' + p.hn + '</span></div><div class="tri-q-detail">' + p.gender + ' ' + p.age + ' ปี · ' + p.source + ' · ' + p.cc + '</div></div>' +
        '<div class="tri-q-wait ' + waitClass + '">รอ ' + p.wait + ' นาที</div>';
      container.appendChild(item);
    });

    /* Update count */
    var countEl = document.querySelector('#triSelectPatient .card-hd span');
    if (countEl) countEl.textContent = queue.length + ' ราย';
  })();

  /* Select patient from queue */
  var triSelectSection = document.getElementById('triSelectPatient');
  var triPatientBar = document.getElementById('triPatientBar');
  var triFormSection = document.getElementById('triFormSection');
  var triChangeBtn = document.getElementById('triChangePatient');

  document.querySelectorAll('.tri-select-item').forEach(function(item) {
    item.addEventListener('click', function() {
      var name = item.dataset.name;
      var hn = item.dataset.hn;
      var gender = item.dataset.gender;
      var age = item.dataset.age;
      var cc = item.dataset.cc;
      var source = item.dataset.source;
      var time = item.dataset.time;

      /* Fill patient bar */
      document.getElementById('triAvatar').textContent = name.substring(0, 2);
      document.getElementById('triPatientName').innerHTML = name + ' <span class="tri-patient-hn">HN ' + hn + '</span>';
      document.getElementById('triPatientDetail').textContent = gender + ' ' + age + ' ปี · ' + source + ' · ' + cc;
      document.getElementById('triArrivalTime').textContent = time;

      /* Pre-fill CC in form */
      var ccField = document.getElementById('triCC');
      if (ccField && cc) ccField.value = cc;

      /* Show form, hide queue */
      triSelectSection.style.display = 'none';
      triPatientBar.style.display = '';
      triFormSection.style.display = '';
    });
  });

  /* Change patient → go back to queue */
  if (triChangeBtn) {
    triChangeBtn.addEventListener('click', function() {
      triSelectSection.style.display = '';
      triPatientBar.style.display = 'none';
      triFormSection.style.display = 'none';
    });
  }

  /* Auto-select patient from ?hn= param */
  var triUrlParams = new URLSearchParams(window.location.search);
  var triHnParam = triUrlParams.get('hn');
  if (triHnParam) {
    var targetItem = document.querySelector('.tri-select-item[data-hn="' + triHnParam + '"]');
    if (targetItem) {
      targetItem.click();
    }
  }

  /* Toast helper */
  function showToast(msg, type) {
    type = type || 'success';
    var container = document.getElementById('toastContainer');
    var t = document.createElement('div');
    t.className = 'toast ' + type;
    t.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>' + msg + '</span>';
    container.appendChild(t);
    setTimeout(function() { t.remove(); }, 3200);
  }

  /* Submit → validate → confirm → success */
  var triSubmit = document.getElementById('triSubmit');
  var triConfirmModal = document.getElementById('triConfirmModal');
  var triSuccessModal = document.getElementById('triSuccessModal');
  var closeTriConfirm = document.getElementById('closeTriConfirm');

  if (closeTriConfirm) closeTriConfirm.addEventListener('click', function() { triConfirmModal.classList.remove('show'); });
  if (triConfirmModal) triConfirmModal.addEventListener('click', function(e) { if (e.target === triConfirmModal) triConfirmModal.classList.remove('show'); });

  var levelNames = { '1':'Resuscitation', '2':'Emergency', '3':'Urgent', '4':'Semi-urgent', '5':'Non-urgent' };
  var levelColors = { '1':'var(--t-resus)', '2':'var(--t-emer)', '3':'var(--t-urg)', '4':'var(--t-semi)', '5':'var(--t-non)' };

  if (triSubmit) {
    triSubmit.addEventListener('click', function() {
      /* Validate mandatory */
      var level = document.querySelector('input[name="triLevel"]:checked');
      var mandatoryIds = ['triBpSys','triBpDia','triHR','triRR','triTemp','triSpO2','triGCS','triCC','triZone','triBed','triDoctor'];
      var missing = [];
      var labels = { triBpSys:'BP(SYS)', triBpDia:'BP(DIA)', triHR:'HR', triRR:'RR', triTemp:'Temp', triSpO2:'SpO2', triGCS:'GCS', triCC:'Chief Complaint', triZone:'โซน', triBed:'เตียง', triDoctor:'แพทย์' };

      mandatoryIds.forEach(function(id) {
        var el = document.getElementById(id);
        if (el && !el.value.trim()) {
          missing.push(labels[id] || id);
          el.classList.add('nv-error');
        } else if (el) {
          el.classList.remove('nv-error');
        }
      });

      if (!level) missing.push('ระดับ Triage');
      if (missing.length > 0) {
        showToast('กรุณากรอก: ' + missing.join(', '), 'warn');
        return;
      }

      /* Gather values */
      var bp = (document.getElementById('triBpSys').value || '') + '/' + (document.getElementById('triBpDia').value || '');
      var hr = document.getElementById('triHR').value;
      var rr = document.getElementById('triRR').value;
      var temp = document.getElementById('triTemp').value;
      var spo2 = document.getElementById('triSpO2').value;
      var gcs = document.getElementById('triGCS').value;
      var cc = document.getElementById('triCC').value;
      var zone = document.getElementById('triZone');
      var bed = document.getElementById('triBed');
      var doctor = document.getElementById('triDoctor');
      var lv = level.value;

      var zoneText = zone.options[zone.selectedIndex].text;
      var bedText = bed.options[bed.selectedIndex].text;
      var doctorText = doctor.options[doctor.selectedIndex].text;

      /* Show confirm modal */
      document.getElementById('triConfirmBody').innerHTML =
        '<p style="font-size:13px;color:var(--slate-500);margin-bottom:16px;">กรุณาตรวจสอบข้อมูลก่อนบันทึก</p>' +

        '<div style="display:flex;align-items:center;gap:12px;padding:14px 16px;background:var(--slate-50);border-radius:12px;margin-bottom:14px;">' +
          '<div style="width:42px;height:42px;border-radius:50%;background:' + levelColors[lv] + ';display:flex;align-items:center;justify-content:center;color:white;font-size:18px;font-weight:700;flex-shrink:0;">' + lv + '</div>' +
          '<div>' +
            '<div style="font-size:15px;font-weight:700;color:var(--slate-900);">สมชาย ใจดี · HN 640001</div>' +
            '<div style="font-size:12px;color:' + levelColors[lv] + ';font-weight:600;">Triage Level ' + lv + ' — ' + levelNames[lv] + '</div>' +
          '</div>' +
        '</div>' +

        '<div class="detail-section">' +
          '<div class="detail-section-title">สัญญาณชีพ</div>' +
          '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:12px;">' +
            '<div style="background:var(--slate-50);border-radius:8px;padding:8px;text-align:center;"><div style="font-size:9px;font-weight:700;color:var(--slate-400);text-transform:uppercase;">BP</div><div style="font-size:14px;font-weight:700;">' + bp + '</div></div>' +
            '<div style="background:var(--slate-50);border-radius:8px;padding:8px;text-align:center;"><div style="font-size:9px;font-weight:700;color:var(--slate-400);text-transform:uppercase;">HR</div><div style="font-size:14px;font-weight:700;">' + hr + '</div></div>' +
            '<div style="background:var(--slate-50);border-radius:8px;padding:8px;text-align:center;"><div style="font-size:9px;font-weight:700;color:var(--slate-400);text-transform:uppercase;">SpO2</div><div style="font-size:14px;font-weight:700;">' + spo2 + '%</div></div>' +
            '<div style="background:var(--slate-50);border-radius:8px;padding:8px;text-align:center;"><div style="font-size:9px;font-weight:700;color:var(--slate-400);text-transform:uppercase;">Temp</div><div style="font-size:14px;font-weight:700;">' + temp + '</div></div>' +
            '<div style="background:var(--slate-50);border-radius:8px;padding:8px;text-align:center;"><div style="font-size:9px;font-weight:700;color:var(--slate-400);text-transform:uppercase;">RR</div><div style="font-size:14px;font-weight:700;">' + rr + '</div></div>' +
            '<div style="background:var(--slate-50);border-radius:8px;padding:8px;text-align:center;"><div style="font-size:9px;font-weight:700;color:var(--slate-400);text-transform:uppercase;">GCS</div><div style="font-size:14px;font-weight:700;">' + gcs + '</div></div>' +
          '</div>' +
        '</div>' +

        '<div class="detail-section">' +
          '<div class="detail-section-title">การจัดเข้าโซน</div>' +
          '<div class="detail-row"><span class="detail-label">อาการ (CC)</span><span class="detail-value">' + cc.substring(0,50) + (cc.length > 50 ? '...' : '') + '</span></div>' +
          '<div class="detail-row"><span class="detail-label">โซนรักษา</span><span class="detail-value">' + zoneText + '</span></div>' +
          '<div class="detail-row"><span class="detail-label">เตียง</span><span class="detail-value">' + bedText + '</span></div>' +
          '<div class="detail-row"><span class="detail-label">แพทย์</span><span class="detail-value">' + doctorText + '</span></div>' +
        '</div>' +

        '<div class="confirm-actions" style="margin-top:16px;">' +
          '<button class="confirm-btn cancel" id="triConfirmCancel">แก้ไข</button>' +
          '<button class="confirm-btn danger" id="triConfirmOk">ยืนยันบันทึก</button>' +
        '</div>';

      triConfirmModal.classList.add('show');

      /* Cancel */
      document.getElementById('triConfirmCancel').onclick = function() {
        triConfirmModal.classList.remove('show');
      };

      /* Confirm → show success */
      document.getElementById('triConfirmOk').onclick = function() {
        triConfirmModal.classList.remove('show');

        /* Save to ERStore: add patient + remove from triage queue */
        var triNameEl = document.getElementById('triPatientName');
        var triHNEl = document.querySelector('#triPatientBar .tri-patient-hn');
        var savedHN = triHNEl ? triHNEl.textContent.replace('HN ','').trim() : '';
        var savedName = triNameEl ? triNameEl.textContent.replace(triHNEl ? triHNEl.textContent : '', '').trim() : '';

        if (savedHN) {
          ERStore.removeFromTriageQueue(savedHN);

          ERStore.update(function(data) {
            data.patients[savedHN] = {
              hn: savedHN, name: savedName, gender: '', age: '',
              level: lv, levelName: levelNames[lv],
              cc: cc, bed: bedText.split(' ')[0] || '—', zone: zoneText,
              doctor: doctorText !== '— เลือกแพทย์ —' ? doctorText : '—',
              status: 'รอแพทย์', wait: '0',
              triage_time: new Date().toLocaleTimeString('th-TH',{hour12:false,hour:'2-digit',minute:'2-digit'}),
              bp: bp, hr: hr, rr: rr, temp: temp, spo2: spo2, gcs: gcs,
              pmh: '', allergy: 'unknown', allergyList: [], source: 'Walk-in'
            };
            data.summary.waitingDoctor++;
          });
        }

        document.getElementById('triSuccessBody').innerHTML =
          '<div style="width:64px;height:64px;background:var(--green-bg);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:32px;height:32px;color:var(--green);"><polyline points="20 6 9 17 4 12"/></svg>' +
          '</div>' +
          '<div style="font-size:20px;font-weight:700;color:var(--slate-900);margin-bottom:6px;">บันทึก Triage สำเร็จ</div>' +
          '<div style="font-size:14px;color:var(--slate-500);margin-bottom:16px;">สมชาย ใจดี · HN 640001</div>' +

          '<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-bottom:20px;">' +
            '<span class="pq-tag" style="background:' + (levelColors[lv] === 'var(--t-resus)' ? '#fef2f2' : levelColors[lv] === 'var(--t-emer)' ? '#fff7ed' : levelColors[lv] === 'var(--t-urg)' ? 'var(--warn-light)' : levelColors[lv] === 'var(--t-semi)' ? 'var(--green-light)' : 'var(--blue-light)') + ';color:' + levelColors[lv] + ';font-size:13px;padding:5px 14px;">Level ' + lv + ' — ' + levelNames[lv] + '</span>' +
            '<span class="pq-tag bed-tag" style="font-size:13px;padding:5px 14px;">' + bedText + '</span>' +
          '</div>' +

          '<div style="background:var(--slate-50);border-radius:12px;padding:14px 16px;text-align:left;margin-bottom:20px;">' +
            '<div style="font-size:11px;font-weight:700;color:var(--slate-400);text-transform:uppercase;margin-bottom:6px;">สรุป</div>' +
            '<div style="font-size:12.5px;color:var(--slate-600);line-height:1.7;">' +
              'โซน: ' + zoneText + '<br>' +
              'เตียง: ' + bedText + '<br>' +
              'แพทย์: ' + doctorText + '<br>' +
              'Vital: BP ' + bp + ' · HR ' + hr + ' · SpO2 ' + spo2 + '%' +
            '</div>' +
          '</div>' +

          '<div style="display:flex;gap:8px;justify-content:center;">' +
            '<button class="ap-btn primary" onclick="window.location.href=\'dashboard.html\'" style="padding:10px 24px;">กลับ Dashboard</button>' +
            '<button class="ap-btn outline" onclick="window.location.href=\'triage.html\'" style="padding:10px 24px;">Triage คนถัดไป</button>' +
          '</div>';

        triSuccessModal.classList.add('show');
      };
    });
  }
}

/* ── Patient List Page ──────────────────── */
if (currentPage === 'patientlist') {
  /* Clock */
  var clockEl = document.getElementById('clock');
  if (clockEl) { function t(){clockEl.textContent=new Date().toLocaleTimeString('th-TH',{hour12:false,hour:'2-digit',minute:'2-digit'});}t();setInterval(t,1000); }

  /* Mobile sidebar */
  var sb = document.getElementById('sidebar');
  var ov = document.getElementById('sbOverlay');
  var mb = document.getElementById('menuBtn');
  if (mb) { mb.onclick=function(){sb.classList.toggle('open');ov.classList.toggle('show');}; ov.onclick=function(){sb.classList.remove('open');ov.classList.remove('show');}; }

  /* Patient data */
  /* Patient data — synced with Dashboard + Bed Management
     Total: 24 คน (คัดกรองแล้ว 20 + รอคัดกรอง 4)
     เตียง B1-B12: B1(สมชาย), B2(มาลี), B3(ว่าง), B4(กิตติ), B5(จอง), B6(ว่าง), B7(ประภาส), B8(สะอาด), B9(นภา), B10(ว่าง), B11(ปรีชา), B12(กานดา)
  */
  /* Merge ERStore patients with static list */
  var storePatients = ERStore.getAllPatients();
  var storeQueue = ERStore.getTriageQueue();

  /* Convert store patients to list format */
  var dynamicPatients = storePatients.map(function(p) {
    return { hn:p.hn, name:p.name, age:p.age||'—', gender:p.gender||'—', level:p.level||'—', levelName:p.levelName||'—', cc:p.cc||'—', bed:p.bed||'—', doctor:p.doctor||'—', status:p.status||'—', wait:p.wait||'', time:p.triage_time||'—' };
  });

  /* Convert triage queue */
  var queuePatients = storeQueue.map(function(p) {
    return { hn:p.hn, name:p.name, age:p.age||'—', gender:p.gender||'—', level:'—', levelName:'รอคัดกรอง', cc:p.cc||'—', bed:'—', doctor:'—', status:'รอคัดกรอง', wait:String(p.wait)||'', time:p.time||'—' };
  });

  /* Merge: store patients + queue + keep static as fallback for extras */
  var mergedHNs = {};
  dynamicPatients.concat(queuePatients).forEach(function(p) { mergedHNs[p.hn] = true; });

  var patients = dynamicPatients.concat(queuePatients);

  /* Add static patients that aren't in store yet */
  var staticPatients = [
    /* Level 1: Resuscitation (2) */
    { hn:'640001', name:'สมชาย ใจดี', age:'55', gender:'ชาย', level:'1', levelName:'Resuscitation', cc:'Cardiac arrest, หมดสติ', bed:'B1', doctor:'นพ.สมศักดิ์', status:'กำลังรักษา', wait:'', time:'14:32' },
    { hn:'640045', name:'กิตติ ศรีสุข', age:'40', gender:'ชาย', level:'1', levelName:'Resuscitation', cc:'Severe Trauma, GCS 8', bed:'B4', doctor:'นพ.สมศักดิ์', status:'กำลังรักษา', wait:'', time:'14:10' },
    /* Level 2: Emergency (3) — ตรงกับ Dashboard */
    { hn:'640012', name:'วิภา แสงทอง', age:'48', gender:'หญิง', level:'2', levelName:'Emergency', cc:'เจ็บหน้าอก ร้าวไปแขนซ้าย', bed:'—', doctor:'—', status:'รอแพทย์', wait:'52', time:'09:42' },
    { hn:'640050', name:'ปรีชา มั่นคง', age:'58', gender:'ชาย', level:'2', levelName:'Emergency', cc:'DKA, pH 7.1', bed:'B11', doctor:'—', status:'รอแพทย์', wait:'30', time:'14:02' },
    { hn:'640070', name:'สุรศักดิ์ มั่นคง', age:'62', gender:'ชาย', level:'2', levelName:'Emergency', cc:'Stroke, แขนขาอ่อนแรงขวา', bed:'B6', doctor:'พญ.นิชา', status:'กำลังรักษา', wait:'', time:'10:05' },
    /* Level 3: Urgent (6) — ตรงกับ Dashboard */
    { hn:'640025', name:'ประภาส รุ่งเรือง', age:'35', gender:'ชาย', level:'3', levelName:'Urgent', cc:'ปวดท้องรุนแรง Rt. lower', bed:'B7', doctor:'—', status:'รอแพทย์', wait:'38', time:'10:18' },
    { hn:'640031', name:'นภา เจริญสุข', age:'62', gender:'หญิง', level:'3', levelName:'Urgent', cc:'ไข้สูง 40.2C, ไอมีเสมหะ', bed:'B9', doctor:'—', status:'รอแพทย์', wait:'25', time:'11:05' },
    { hn:'640077', name:'กานดา เพชรดี', age:'32', gender:'หญิง', level:'3', levelName:'Urgent', cc:'ปวดท้องน้อย สงสัย Ectopic', bed:'B12', doctor:'พญ.นิชา', status:'กำลังรักษา', wait:'', time:'13:00' },
    { hn:'640074', name:'ธีรพงษ์ สุวรรณ', age:'28', gender:'ชาย', level:'3', levelName:'Urgent', cc:'แผลฉีกขาดลึก แขนซ้าย', bed:'—', doctor:'—', status:'รอแพทย์', wait:'18', time:'13:45' },
    { hn:'640076', name:'มนตรี ศิริ', age:'55', gender:'ชาย', level:'3', levelName:'Urgent', cc:'หายใจลำบาก, wheeze', bed:'—', doctor:'—', status:'รอแพทย์', wait:'15', time:'14:00' },
    { hn:'640078', name:'วิทยา สุขสม', age:'50', gender:'ชาย', level:'3', levelName:'Urgent', cc:'เจ็บหน้าอก atypical', bed:'—', doctor:'—', status:'รอแพทย์', wait:'10', time:'14:15' },
    /* Level 4: Semi-urgent (4) — ตรงกับ Dashboard (มาลีย้ายไป รอ Admit) */
    { hn:'640055', name:'สวัสดิ์ พงษ์ไพร', age:'50', gender:'ชาย', level:'4', levelName:'Semi-urgent', cc:'ปวดหัวตึงท้ายทอย', bed:'—', doctor:'—', status:'รอแพทย์', wait:'10', time:'14:15' },
    { hn:'640060', name:'จริยา ดีงาม', age:'30', gender:'หญิง', level:'4', levelName:'Semi-urgent', cc:'ท้องเสีย 5 ครั้ง', bed:'—', doctor:'—', status:'รอแพทย์', wait:'6', time:'14:26' },
    { hn:'640081', name:'นวลจันทร์ รุ่งเรือง', age:'35', gender:'หญิง', level:'4', levelName:'Semi-urgent', cc:'ผื่นลมพิษ', bed:'—', doctor:'นพ.วิทยา', status:'กำลังรักษา', wait:'', time:'13:50' },
    { hn:'640082', name:'ชาญชัย มีสุข', age:'60', gender:'ชาย', level:'4', levelName:'Semi-urgent', cc:'ตาแดง ปวดตา', bed:'—', doctor:'—', status:'รอแพทย์', wait:'3', time:'14:30' },
    /* Level 5: Non-urgent (4) — ตรงกับ Dashboard */
    { hn:'640038', name:'ธนพล วงศ์สุวรรณ', age:'25', gender:'ชาย', level:'5', levelName:'Non-urgent', cc:'ปวดหัวเล็กน้อย 1 วัน', bed:'—', doctor:'—', status:'รอแพทย์', wait:'15', time:'12:30' },
    { hn:'640083', name:'ปราณี สุขสม', age:'22', gender:'หญิง', level:'5', levelName:'Non-urgent', cc:'แผลถลอกเข่า', bed:'—', doctor:'—', status:'รอแพทย์', wait:'8', time:'14:20' },
    { hn:'640084', name:'สมบัติ ทองดี', age:'45', gender:'ชาย', level:'5', levelName:'Non-urgent', cc:'ขอใบรับรองแพทย์', bed:'—', doctor:'—', status:'รอแพทย์', wait:'2', time:'14:31' },
    { hn:'640085', name:'อนันต์ สมบูรณ์', age:'38', gender:'ชาย', level:'5', levelName:'Non-urgent', cc:'ขอเอกสารส่งต่อ', bed:'—', doctor:'—', status:'รอแพทย์', wait:'1', time:'14:33' },
    /* Observe (9) — สังเกตอาการ */
    { hn:'640086', name:'ศิริพร วงษ์เดือน', age:'45', gender:'หญิง', level:'3', levelName:'Urgent', cc:'เจ็บหน้าอก ยังไม่ชัดเจน', bed:'B3', doctor:'นพ.สมศักดิ์', status:'Observe', wait:'', time:'12:40' },
    { hn:'640087', name:'วันชัย แสงจันทร์', age:'55', gender:'ชาย', level:'3', levelName:'Urgent', cc:'หายใจลำบาก อาการดีขึ้น', bed:'B6', doctor:'พญ.นิชา', status:'Observe', wait:'', time:'11:20' },
    { hn:'640088', name:'ประนอม ใจสะอาด', age:'62', gender:'หญิง', level:'3', levelName:'Urgent', cc:'เวียนศีรษะ สงสัย TIA', bed:'—', doctor:'นพ.วิทยา', status:'Observe', wait:'', time:'13:10' },
    { hn:'640089', name:'ชัยวัฒน์ ดีมาก', age:'30', gender:'ชาย', level:'4', levelName:'Semi-urgent', cc:'แพ้อาหาร อาการคงที่', bed:'—', doctor:'พญ.นิชา', status:'Observe', wait:'', time:'13:30' },
    { hn:'640090', name:'รุ่งทิวา สายน้ำ', age:'25', gender:'หญิง', level:'4', levelName:'Semi-urgent', cc:'ปวดท้อง สังเกตอาการ r/o appendicitis', bed:'—', doctor:'นพ.วิทยา', status:'Observe', wait:'', time:'13:50' },
    { hn:'640091', name:'สุทิน พรมแดง', age:'70', gender:'ชาย', level:'3', levelName:'Urgent', cc:'ใจสั่น รอผล ECG', bed:'—', doctor:'นพ.สมศักดิ์', status:'Observe', wait:'', time:'14:00' },
    { hn:'640092', name:'จุฑามาศ แก้วเพชร', age:'40', gender:'หญิง', level:'4', levelName:'Semi-urgent', cc:'Asthma exacerbation หลังให้ยาดีขึ้น', bed:'—', doctor:'พญ.นิชา', status:'Observe', wait:'', time:'14:05' },
    { hn:'640093', name:'บุญเลิศ สุขเกษม', age:'58', gender:'ชาย', level:'3', levelName:'Urgent', cc:'Hypoglycemia DTX 45 หลังให้ glucose ดีขึ้น', bed:'—', doctor:'นพ.วิทยา', status:'Observe', wait:'', time:'14:10' },
    { hn:'640094', name:'นิตยา ทองสุข', age:'35', gender:'หญิง', level:'4', levelName:'Semi-urgent', cc:'Head injury mild สังเกตอาการ 6 ชม.', bed:'—', doctor:'นพ.สมศักดิ์', status:'Observe', wait:'', time:'14:15' },
    /* Waiting Refer/Admit (5) — รอส่งต่อ */
    { hn:'640002', name:'มาลี สายชล', age:'70', gender:'หญิง', level:'4', levelName:'Semi-urgent', cc:'อ่อนเพลีย เวียนศีรษะ', bed:'B2', doctor:'พญ.นิชา', status:'รอ Admit', wait:'', time:'07:20' },
    { hn:'640095', name:'สำราญ จิตดี', age:'65', gender:'ชาย', level:'2', levelName:'Emergency', cc:'STEMI สงสัย Cath Lab', bed:'B5', doctor:'นพ.สมศักดิ์', status:'รอ Admit', wait:'', time:'13:20' },
    { hn:'640096', name:'วราภรณ์ ศรีดาว', age:'72', gender:'หญิง', level:'3', levelName:'Urgent', cc:'Pneumonia ต้อง Admit อายุรกรรม', bed:'—', doctor:'พญ.นิชา', status:'รอ Admit', wait:'', time:'11:00' },
    { hn:'640097', name:'ธวัชชัย บุญมี', age:'48', gender:'ชาย', level:'3', levelName:'Urgent', cc:'Open fracture ต้อง OR', bed:'—', doctor:'นพ.วิทยา', status:'รอ Admit', wait:'', time:'12:30' },
    { hn:'640098', name:'ลัดดา อรุณรุ่ง', age:'55', gender:'หญิง', level:'3', levelName:'Urgent', cc:'DKA ต้อง ICU', bed:'B11', doctor:'นพ.สมศักดิ์', status:'รอ Admit', wait:'', time:'14:02' },
    /* รอคัดกรอง (4) — ตรงกับ Dashboard */
    { hn:'640101', name:'ผู้ป่วยใหม่ 1', age:'55', gender:'ชาย', level:'—', levelName:'รอคัดกรอง', cc:'เจ็บหน้าอก 2 ชม.', bed:'—', doctor:'—', status:'รอคัดกรอง', wait:'5', time:'14:32' },
    { hn:'640102', name:'อรุณ ศรีสวัสดิ์', age:'42', gender:'ชาย', level:'—', levelName:'รอคัดกรอง', cc:'ปวดท้องรุนแรง', bed:'—', doctor:'—', status:'รอคัดกรอง', wait:'12', time:'14:20' },
    { hn:'640103', name:'สุนีย์ แก้วใส', age:'28', gender:'หญิง', level:'—', levelName:'รอคัดกรอง', cc:'ไข้สูง 3 วัน', bed:'—', doctor:'—', status:'รอคัดกรอง', wait:'8', time:'14:24' },
    { hn:'640104', name:'ไม่ทราบชื่อ', age:'~60', gender:'ชาย', level:'—', levelName:'รอคัดกรอง', cc:'หมดสติ พบล้มข้างถนน (EMS)', bed:'—', doctor:'—', status:'รอคัดกรอง', wait:'2', time:'14:30' }
  ];

  /* Merge: add static patients not already in dynamic list */
  staticPatients.forEach(function(sp) {
    if (!mergedHNs[sp.hn]) {
      patients.push(sp);
      mergedHNs[sp.hn] = true;
    }
  });

  var statusClass = { 'กำลังรักษา':'treating', 'รอแพทย์':'waiting', 'รอ Admit':'admit', 'รอคัดกรอง':'waiting', 'Observe':'treating', 'รอเตียง':'waiting', 'Discharge':'discharged', 'Admit':'discharged', 'Admit ICU':'discharged', 'Refer':'discharged', 'เสียชีวิต':'discharged' };

  function renderTable(list) {
    var html = '';
    list.forEach(function(p) {
      var waitClass = parseInt(p.wait) >= 30 ? 'over' : parseInt(p.wait) >= 15 ? 'warn' : 'ok';
      html += '<tr data-hn="' + p.hn + '" data-level="' + p.level + '" data-status="' + p.status + '">' +
        '<td>' + (p.level === '—' ? '<span class="pl-level" style="background:var(--orange);font-size:10px;">รอ</span>' : '<span class="pl-level l' + p.level + '">' + p.level + '</span>') + '</td>' +
        '<td><div class="pl-name">' + p.name + '</div><div class="pl-hn">HN ' + p.hn + ' · ' + p.gender + ' ' + p.age + ' ปี</div></td>' +
        '<td><div class="pl-cc">' + p.cc + '</div></td>' +
        '<td>' + (p.bed || '—') + '</td>' +
        '<td>' + p.doctor + '</td>' +
        '<td><span class="pl-status ' + (statusClass[p.status] || '') + '">' + p.status + '</span></td>' +
        '<td>' + (p.wait ? '<span class="pl-wait ' + waitClass + '">' + p.wait + ' นาที</span>' : '<span style="color:var(--slate-300);">—</span>') + '</td>' +
        '<td style="width:160px;"><div style="display:flex;gap:4px;justify-content:flex-end;">' +
          (p.status === 'รอแพทย์' ? '<button class="pl-accept-btn" data-hn="' + p.hn + '">รับเคส</button>' : '') +
          (p.status === 'รอคัดกรอง' ? '<a href="triage.html?hn=' + p.hn + '" class="pl-triage-btn">ไปคัดกรอง</a>' : '') +
          '<button class="pl-action-btn">ดูรายละเอียด</button>' +
        '</div></td>' +
      '</tr>';
    });
    document.getElementById('plBody').innerHTML = html;
  }

  /* Sort: รอคัดกรอง first (level 0), then level ASC, then wait DESC */
  patients.sort(function(a, b) {
    var la = a.level === '—' ? 0 : parseInt(a.level);
    var lb = b.level === '—' ? 0 : parseInt(b.level);
    if (la !== lb) return la - lb;
    var wa = parseInt(a.wait) || 0;
    var wb = parseInt(b.wait) || 0;
    return wb - wa;
  });

  renderTable(patients);

  /* Auto-select filter from URL params */
  var urlParams = new URLSearchParams(window.location.search);
  var tab = urlParams.get('tab');
  var statusParam = urlParams.get('status');

  if (tab === 'waiting') {
    document.querySelectorAll('[data-status]').forEach(function(b) { b.classList.remove('active'); });
    var waitBtn = document.querySelector('[data-status="รอคัดกรอง"]');
    if (waitBtn) waitBtn.classList.add('active');
    applyFilters();
  } else if (tab === 'doctor') {
    document.querySelectorAll('[data-status]').forEach(function(b) { b.classList.remove('active'); });
    var docBtn = document.querySelector('[data-status="รอแพทย์"]');
    if (docBtn) docBtn.classList.add('active');
    applyFilters();
  } else if (statusParam) {
    document.querySelectorAll('[data-status]').forEach(function(b) { b.classList.remove('active'); });
    var sBtn = document.querySelector('[data-status="' + decodeURIComponent(statusParam) + '"]');
    if (sBtn) sBtn.classList.add('active');
    applyFilters();
  }

  /* Level filter */
  document.querySelectorAll('[data-filter]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('[data-filter]').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      applyFilters();
    });
  });

  /* Status filter */
  document.querySelectorAll('[data-status]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('[data-status]').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      applyFilters();
    });
  });

  /* Search */
  document.getElementById('plSearch').addEventListener('input', function() { applyFilters(); });

  function applyFilters() {
    var levelFilter = document.querySelector('[data-filter].active').dataset.filter;
    var statusFilter = document.querySelector('[data-status].active').dataset.status;
    var search = document.getElementById('plSearch').value.toLowerCase();

    document.querySelectorAll('#plBody tr').forEach(function(tr) {
      var matchLevel = levelFilter === 'all' || tr.dataset.level === levelFilter;
      var matchStatus = statusFilter === 'all' || tr.dataset.status === statusFilter;
      var text = tr.textContent.toLowerCase();
      var matchSearch = !search || text.indexOf(search) > -1;
      tr.classList.toggle('pl-hidden', !(matchLevel && matchStatus && matchSearch));
    });
  }

  /* Toast helper */
  function showToast(msg, type) {
    type = type || 'success';
    var container = document.getElementById('toastContainer');
    var t = document.createElement('div');
    t.className = 'toast ' + type;
    t.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>' + msg + '</span>';
    container.appendChild(t);
    setTimeout(function() { t.remove(); }, 3200);
  }

  /* Click row → go to patient profile OR accept case */
  document.getElementById('plBody').addEventListener('click', function(e) {
    /* รับเคส button */
    var acceptBtn = e.target.closest('.pl-accept-btn');
    if (acceptBtn) {
      e.stopPropagation();
      var hn = acceptBtn.dataset.hn;
      var tr = acceptBtn.closest('tr');
      var name = tr.querySelector('.pl-name') ? tr.querySelector('.pl-name').textContent : '';
      var now = new Date().toLocaleTimeString('th-TH', {hour12:false, hour:'2-digit', minute:'2-digit', second:'2-digit'});

      if (confirm('รับเคส ' + name + ' (HN ' + hn + ') เป็นผู้ป่วยของคุณ?\n\nFirst Doctor Seen: ' + now)) {
        /* Update row */
        var statusCell = tr.querySelector('.pl-status');
        if (statusCell) {
          statusCell.className = 'pl-status treating';
          statusCell.textContent = 'กำลังรักษา';
        }
        var waitCell = tr.querySelector('.pl-wait');
        if (waitCell) waitCell.innerHTML = '<span style="color:var(--green);">' + now + '</span>';
        acceptBtn.remove();

        /* Save to ERStore */
        ERStore.updatePatient(hn, { status:'กำลังรักษา', doctor:'Admin', firstDocSeen:now, wait:'' });
        ERStore.update(function(d) { d.summary.waitingDoctor = Math.max(0, d.summary.waitingDoctor - 1); });

        showToast('รับเคส ' + name + ' เรียบร้อย — First Doctor Seen: ' + now, 'success');
      }
      return;
    }

    /* ดูรายละเอียด → go to profile */
    var tr = e.target.closest('tr');
    if (!tr) return;
    var hn = tr.dataset.hn;
    if (hn) window.location.href = 'patient-profile.html?hn=' + hn;
  });
}

/* ── Bed Management Page ────────────────── */
if (currentPage === 'bedmgmt') {
  /* Clock */
  var clockEl = document.getElementById('clock');
  if (clockEl) { function t(){clockEl.textContent=new Date().toLocaleTimeString('th-TH',{hour12:false,hour:'2-digit',minute:'2-digit'});}t();setInterval(t,1000); }

  /* Mobile sidebar */
  var sb = document.getElementById('sidebar');
  var ov = document.getElementById('sbOverlay');
  var mb = document.getElementById('menuBtn');
  if (mb) { mb.onclick=function(){sb.classList.toggle('open');ov.classList.toggle('show');}; ov.onclick=function(){sb.classList.remove('open');ov.classList.remove('show');}; }

  /* Toast */
  function showToast(msg, type) {
    type = type || 'success';
    var container = document.getElementById('toastContainer');
    var t = document.createElement('div');
    t.className = 'toast ' + type;
    t.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>' + msg + '</span>';
    container.appendChild(t);
    setTimeout(function() { t.remove(); }, 3200);
  }

  /* ── Render entire bed page from ERStore ── */
  function renderBedPage() {
    var data = ERStore.get();
    var beds = data.beds;
    var zones = data.zones || [];
    var preArrivals = data.preArrivals || [];

    /* Summary */
    var counts = { free:0, occ:0, rsv:0, clean:0 };
    Object.values(beds).forEach(function(b) { counts[b.status] = (counts[b.status] || 0) + 1; });
    var total = Object.keys(beds).length;
    var statNums = document.querySelectorAll('.pl-stat-num');
    if (statNums.length >= 5) {
      statNums[0].textContent = total;
      statNums[1].textContent = counts.free;
      statNums[2].textContent = counts.occ;
      statNums[3].textContent = counts.rsv;
      statNums[4].textContent = counts.clean;
    }

    /* Render zones */
    var container = document.getElementById('bmZonesContainer');
    if (!container) return;

    var statusLabels = { free:'ว่าง', occ:'ไม่ว่าง', rsv:'จอง', clean:'ทำความสะอาด' };
    var html = '';

    zones.forEach(function(zone) {
      html += '<div class="bm-zone"><div class="bm-zone-hd"><h3 class="bm-zone-title" style="color:' + zone.color + ';"><span class="bm-zone-dot" style="background:' + zone.color + ';"></span>' + zone.name + '</h3><span class="bm-zone-count">' + zone.beds.length + ' เตียง</span></div><div class="bm-bed-grid">';

      zone.beds.forEach(function(bedId) {
        var bed = beds[bedId];
        if (!bed) return;
        var st = bed.status;
        var p = bed.patient ? ERStore.getPatient(bed.patient) : null;

        html += '<div class="bm-bed ' + st + '" data-bed="' + bedId + '">';
        html += '<div class="bm-bed-hd"><span class="bm-bed-id">' + bedId + '</span><span class="bm-bed-status ' + st + '">' + (statusLabels[st]||st) + '</span></div>';

        if (st === 'occ' && p) {
          html += '<div class="bm-bed-patient">' + p.name + '</div>';
          html += '<div class="bm-bed-info">HN ' + p.hn + ' · ' + (p.cc || '').substring(0,25) + '</div>';
          html += '<div class="bm-bed-info">' + (p.doctor||'—') + ' · ' + (p.status||'') + '</div>';
          html += '<div class="bm-bed-actions">';
          html += '<button class="bm-btn" data-action="view" data-hn="' + p.hn + '">ดูผู้ป่วย</button>';
          html += '<button class="bm-btn" data-action="transfer">ย้ายเตียง</button>';
          html += '</div>';
        } else if (st === 'rsv') {
          var pa = preArrivals.find(function(a) { return bed.reserved && a.caseId === bed.reserved; });
          html += '<div class="bm-bed-patient" style="color:var(--warn);">จองสำหรับ ' + (bed.reserved||'Pre-Arrival') + '</div>';
          html += '<div class="bm-bed-info">' + (pa ? pa.cc.substring(0,30) : '') + '</div>';
          html += '<div class="bm-bed-actions"><button class="bm-btn" data-action="cancel-rsv">ยกเลิกจอง</button></div>';
        } else if (st === 'clean') {
          html += '<div class="bm-bed-empty" style="color:var(--blue);">กำลังทำความสะอาด...</div>';
          html += '<div class="bm-bed-actions"><button class="bm-btn primary" data-action="ready">เสร็จ — พร้อมใช้งาน</button></div>';
        } else { /* free */
          html += '<div class="bm-bed-empty">พร้อมรับผู้ป่วย</div>';
          html += '<div class="bm-bed-actions"><button class="bm-btn primary" data-action="assign">รับผู้ป่วยเข้าเตียง</button></div>';
        }

        html += '</div>';
      });

      html += '</div></div>';
    });

    container.innerHTML = html;
  }

  renderBedPage();

  /* Patient data for bed view — read from ERStore dynamically */
  var bedPatients = {}; /* legacy — openBedPatientView now reads ERStore */

  var bpModal = document.getElementById('bedPatientModal');
  var closeBp = document.getElementById('closeBpModal');
  if (closeBp) closeBp.addEventListener('click', function() { bpModal.classList.remove('show'); });
  if (bpModal) bpModal.addEventListener('click', function(e) { if (e.target === bpModal) bpModal.classList.remove('show'); });

  var levelColors = { '1':'var(--t-resus)', '2':'var(--t-emer)', '3':'var(--t-urg)', '4':'var(--t-semi)', '5':'var(--t-non)' };

  function openBedPatientView(bedId) {
    var bed = ERStore.getBeds()[bedId];
    var p = (bed && bed.patient) ? ERStore.getPatient(bed.patient) : null;
    if (!p) { showToast('ไม่พบข้อมูลผู้ป่วยเตียง ' + bedId, 'warn'); return; }
    /* Map ERStore fields to legacy format */
    if (!p.allergy || p.allergy === 'nka') p.allergy = 'ไม่มี';
    if (p.allergy === 'allergy' && p.allergyList) p.allergy = p.allergyList.join(', ');
    if (!p.time) p.time = p.triage_time || '—';

    var color = levelColors[p.level] || 'var(--slate-400)';
    var initials = p.name.substring(0, 2);

    /* Vital highlight */
    function vc(type, val) {
      var n = parseFloat(val);
      if (type === 'hr' && (n >= 120 || n <= 50)) return ' style="color:var(--red-600);font-weight:700;"';
      if (type === 'spo2' && n < 92) return ' style="color:var(--red-600);font-weight:700;"';
      if (type === 'spo2' && n < 95) return ' style="color:var(--warn);font-weight:700;"';
      if (type === 'temp' && n >= 39) return ' style="color:var(--red-600);font-weight:700;"';
      if (type === 'gcs' && n <= 8) return ' style="color:var(--red-600);font-weight:700;"';
      return '';
    }

    document.getElementById('bpTitle').textContent = p.name + ' · เตียง ' + bedId;
    document.getElementById('bpBody').innerHTML =
      /* Header */
      '<div class="pq-header">' +
        '<div class="pq-avatar" style="background:' + color + ';">' + initials + '</div>' +
        '<div>' +
          '<div class="pq-name">' + p.name + '</div>' +
          '<div class="pq-sub">' + p.gender + ' ' + p.age + ' ปี · HN ' + p.hn + '</div>' +
          '<div class="pq-status-row">' +
            '<span class="pq-tag level' + p.level + '">' + p.levelName + '</span>' +
            '<span class="pq-tag bed-tag">เตียง ' + bedId + '</span>' +
            '<span class="pq-tag" style="background:var(--slate-100);color:var(--slate-600);">' + p.status + '</span>' +
            (p.ems ? '<span class="pq-tag" style="background:var(--red-100);color:var(--red-600);">EMS</span>' : '') +
          '</div>' +
        '</div>' +
      '</div>' +

      /* Vitals */
      '<div class="pq-info-section">' +
        '<div class="pq-info-title">สัญญาณชีพ</div>' +
        '<div class="pq-vitals">' +
          '<div class="pq-vital"><div class="pq-vital-label">BP</div><div class="pq-vital-value">' + p.bp + '</div></div>' +
          '<div class="pq-vital"><div class="pq-vital-label">HR</div><div class="pq-vital-value"' + vc('hr',p.hr) + '>' + p.hr + '</div></div>' +
          '<div class="pq-vital"><div class="pq-vital-label">SpO2</div><div class="pq-vital-value"' + vc('spo2',p.spo2) + '>' + p.spo2 + '%</div></div>' +
          '<div class="pq-vital"><div class="pq-vital-label">Temp</div><div class="pq-vital-value"' + vc('temp',p.temp) + '>' + p.temp + '</div></div>' +
          '<div class="pq-vital"><div class="pq-vital-label">GCS</div><div class="pq-vital-value"' + vc('gcs',p.gcs) + '>' + p.gcs + '</div></div>' +
          '<div class="pq-vital"><div class="pq-vital-label">แพ้ยา</div><div class="pq-vital-value"' + (p.allergy !== 'ไม่มี' ? ' style="color:var(--red-600);font-weight:700;"' : '') + '>' + p.allergy + '</div></div>' +
          '<div class="pq-vital"><div class="pq-vital-label">มาถึง</div><div class="pq-vital-value">' + p.time + '</div></div>' +
          '<div class="pq-vital"><div class="pq-vital-label">Triage</div><div class="pq-vital-value" style="color:' + color + ';">Level ' + p.level + '</div></div>' +
        '</div>' +
      '</div>' +

      /* Info */
      '<div class="pq-info-section">' +
        '<div class="pq-info-title">ข้อมูลการรักษา</div>' +
        '<div class="pq-info-row"><span class="pq-info-label">อาการ (CC)</span><span class="pq-info-value">' + p.cc + '</span></div>' +
        '<div class="pq-info-row"><span class="pq-info-label">โรคประจำตัว</span><span class="pq-info-value">' + p.pmh + '</span></div>' +
        '<div class="pq-info-row"><span class="pq-info-label">แพทย์</span><span class="pq-info-value">' + p.doctor + '</span></div>' +
        '<div class="pq-info-row"><span class="pq-info-label">สถานะ</span><span class="pq-info-value">' + p.status + '</span></div>' +
      '</div>' +

      /* Actions */
      '<div class="pq-actions">' +
        '<button class="ap-btn primary" onclick="document.getElementById(\'bedPatientModal\').classList.remove(\'show\');showToast(\'กำลังเปิดประวัติเต็ม ' + p.name + '\',\'info\')">ดูประวัติเต็ม</button>' +
        (p.ems ? '<button class="ap-btn outline" style="color:var(--red-600);border-color:var(--red-200);" onclick="document.getElementById(\'bedPatientModal\').classList.remove(\'show\');showToast(\'กำลังเปิด EMS Handover ' + p.name + '\',\'info\')">ดู EMS Handover</button>' : '') +
        '<button class="ap-btn outline" onclick="document.getElementById(\'bedPatientModal\').classList.remove(\'show\');showToast(\'กำลังเปิดผล Lab ' + p.name + '\',\'info\')">ดูผล Lab</button>' +
      '</div>';

    bpModal.classList.add('show');
  }

  /* Bed actions — event delegation */
  var nowTime = function() { return new Date().toLocaleTimeString('th-TH',{hour12:false,hour:'2-digit',minute:'2-digit'}); };

  /* Bed actions — event delegation (updates ERStore then re-renders) */
  var nowTime = function() { return new Date().toLocaleTimeString('th-TH',{hour12:false,hour:'2-digit',minute:'2-digit'}); };

  document.querySelector('.content').addEventListener('click', function(e) {
    var btn = e.target.closest('.bm-btn');
    if (!btn) return;

    var action = btn.dataset.action;
    var bedEl = btn.closest('.bm-bed');
    var bedId = bedEl ? bedEl.dataset.bed : '';
    var patient = bedEl ? (bedEl.querySelector('.bm-bed-patient') || {}).textContent || '' : '';

    switch(action) {

      case 'view':
        openBedPatientView(bedId);
        break;

      case 'transfer':
        var allBeds = ERStore.getBeds();
        var freeBeds = [];
        Object.keys(allBeds).forEach(function(k) { if (allBeds[k].status === 'free') freeBeds.push(k); });
        if (freeBeds.length === 0) { showToast('ไม่มีเตียงว่าง', 'warn'); break; }
        var choice = prompt('ย้าย ' + patient + ' จาก ' + bedId + '\nเตียงว่าง: ' + freeBeds.join(', ') + '\n\nกรอกหมายเลขเตียง:');
        if (choice && freeBeds.indexOf(choice) > -1) {
          var oldBed = allBeds[bedId];
          var ptHn = oldBed ? oldBed.patient : null;
          ERStore.updateBed(choice, { status:'occ', patient:ptHn });
          ERStore.updateBed(bedId, { status:'clean', patient:null });
          if (ptHn) ERStore.updatePatient(ptHn, { bed:choice });
          renderBedPage();
          showToast('ย้าย ' + patient + ' → ' + choice + ' เรียบร้อย', 'success');
        } else if (choice) { showToast('เตียง ' + choice + ' ไม่ว่าง', 'warn'); }
        break;

      case 'discharge':
        if (confirm('จำหน่ายผู้ป่วย ' + patient + ' ออกจากเตียง ' + bedId + '?')) {
          ERStore.updateBed(bedId, { status:'clean', patient:null });
          renderBedPage();
          showToast('จำหน่าย ' + patient + ' จากเตียง ' + bedId, 'success');
        }
        break;

      case 'ready':
        ERStore.updateBed(bedId, { status:'free', patient:null });
        renderBedPage();
        showToast('เตียง ' + bedId + ' พร้อมใช้งานแล้ว', 'success');
        break;

      case 'assign':
        var wpList = ERStore.getPatientsByStatus('รอแพทย์');
        if (wpList.length === 0) { showToast('ไม่มีผู้ป่วยรอเตียง', 'warn'); break; }
        var listHtml = 'เลือกผู้ป่วยเข้าเตียง ' + bedId + ':\n\n';
        wpList.forEach(function(p, i) { listHtml += (i+1) + '. ' + p.name + ' (' + p.cc + ')\n'; });
        listHtml += '\nกรอกหมายเลข (1-' + wpList.length + '):';
        var pick = prompt(listHtml);
        var idx = parseInt(pick) - 1;
        if (idx >= 0 && idx < wpList.length) {
          var pt = wpList[idx];
          ERStore.updateBed(bedId, { status:'occ', patient:pt.hn });
          ERStore.updatePatient(pt.hn, { bed:bedId });
          renderBedPage();
          showToast('รับ ' + pt.name + ' เข้าเตียง ' + bedId, 'success');
        }
        break;

      case 'cancel-rsv':
        if (confirm('ยกเลิกจองเตียง ' + bedId + '?')) {
          ERStore.updateBed(bedId, { status:'free', patient:null, reserved:null });
          renderBedPage();
          showToast('ยกเลิกจองเตียง ' + bedId + ' แล้ว', 'success');
        }
        break;
    }
  });
}

/* ── Patient Profile Page ───────────────── */
if (currentPage === 'profile') {
  /* Clock */
  var clockEl = document.getElementById('clock');
  if (clockEl) { function t(){clockEl.textContent=new Date().toLocaleTimeString('th-TH',{hour12:false,hour:'2-digit',minute:'2-digit'});}t();setInterval(t,1000); }

  /* Show/hide based on ?hn= */
  var urlParams = new URLSearchParams(window.location.search);
  var hnParam = urlParams.get('hn');
  var ppEmpty = document.getElementById('ppEmptyState');
  var ppMainLayout = document.getElementById('ppMainLayout');

  if (hnParam) {
    var patient = ERStore.getPatient(hnParam);

    if (ppEmpty) ppEmpty.style.display = 'none';
    if (ppMainLayout) ppMainLayout.style.display = '';

    if (patient) {
      document.getElementById('ppHeaderName').textContent = 'การรักษา — ' + patient.name;

      /* Render header */
      var avatar = document.getElementById('ppAvatar');
      var ppName = document.getElementById('ppName');
      var ppSub = document.getElementById('ppSub');
      if (avatar) avatar.textContent = patient.name.substring(0, 2);
      if (ppName) ppName.textContent = patient.name;
      if (ppSub) ppSub.textContent = patient.gender + ' ' + patient.age + ' ปี · HN ' + patient.hn;

      /* Tags */
      var ppTags = document.getElementById('ppTags');
      if (ppTags) {
        var levelColors = { '1':'level1', '2':'level2', '3':'level3', '4':'level4', '5':'level5' };
        ppTags.innerHTML =
          '<span class="pq-tag ' + (levelColors[patient.level] || '') + '">' + (patient.levelName || '—') + '</span>' +
          (patient.bed && patient.bed !== '—' ? '<span class="pq-tag bed-tag">เตียง ' + patient.bed + '</span>' : '') +
          '<span class="pq-tag" style="background:var(--blue-bg);color:var(--blue);">' + patient.status + '</span>' +
          (patient.ems ? '<span class="pq-tag" style="background:var(--red-100);color:var(--red-600);">EMS</span>' : '');
      }

      /* Arrival time */
      var ppArrival = document.getElementById('ppArrival');
      if (ppArrival) ppArrival.textContent = patient.triage_time || '—';

      /* Sidebar: Vitals */
      var vitalEls = document.querySelectorAll('.pp-v-val');
      if (vitalEls.length >= 6) {
        var vitals = [patient.bp||'—', patient.hr||'—', patient.spo2 ? patient.spo2+'%' : '—', patient.gcs||'—', patient.temp||'—', patient.rr||'—'];
        vitalEls.forEach(function(el, i) { if (vitals[i]) el.textContent = vitals[i]; });
      }

      /* Sidebar: Allergy */
      var allergyEl = document.querySelector('.pp-sidebar .allergy-status');
      if (allergyEl) {
        if (patient.allergy === 'allergy' && patient.allergyList && patient.allergyList.length > 0) {
          allergyEl.className = 'allergy-status has-allergy';
          allergyEl.textContent = 'แพ้: ' + patient.allergyList.join(', ');
        } else if (patient.allergy === 'unknown') {
          allergyEl.className = 'allergy-status unknown';
          allergyEl.textContent = 'Unknown — ยังไม่ทราบ';
        } else {
          allergyEl.className = 'allergy-status nka';
          allergyEl.textContent = 'NKA — ไม่แพ้ยา';
        }
      }

      /* Sidebar: Key info */
      var sideRows = document.querySelectorAll('.pp-side-row');
      if (sideRows.length >= 6) {
        sideRows[0].querySelector('span:last-child').textContent = 'Level ' + (patient.level || '—');
        sideRows[0].querySelector('span:last-child').style.color = patient.level === '1' ? 'var(--red-600)' : patient.level === '2' ? 'var(--orange)' : '';
        sideRows[1].querySelector('span:last-child').textContent = patient.doctor || '—';
        sideRows[2].querySelector('span:last-child').textContent = patient.doorToDoctor ? patient.doorToDoctor + ' นาที' : '—';
        sideRows[3].querySelector('span:first-child').textContent = 'First seen';
        sideRows[3].querySelector('span:last-child').textContent = patient.firstDocSeen || '—';
        sideRows[4].querySelector('span:last-child').textContent = patient.pmh || '—';
        sideRows[5].querySelector('span:last-child').textContent = '—';
      }

      /* ════════════════════════════════════════════
         Dynamic Tab Rendering from ERStore
         ════════════════════════════════════════════ */

      function vitalColor(type, val) {
        if (!val || val === '—') return '';
        var n = parseInt(val);
        if (type === 'bp') return (n < 90 || n > 160) ? 'color:var(--red-600);font-weight:700;' : '';
        if (type === 'spo2') return n < 90 ? 'color:var(--red-600);font-weight:700;' : n < 95 ? 'color:var(--warn);font-weight:600;' : '';
        if (type === 'gcs') return n <= 8 ? 'color:var(--red-600);font-weight:700;' : n <= 12 ? 'color:var(--warn);font-weight:600;' : '';
        if (type === 'temp') { var t = parseFloat(val); return t >= 39 ? 'color:var(--red-600);font-weight:700;' : t >= 38 ? 'color:var(--warn);font-weight:600;' : ''; }
        if (type === 'hr') return (n > 120 || n < 50) ? 'color:var(--red-600);font-weight:700;' : n > 100 ? 'color:var(--warn);font-weight:600;' : '';
        return '';
      }

      var _lc = {'1':'var(--t-resus)','2':'var(--orange)','3':'var(--warn)','4':'var(--green)','5':'var(--blue)'};

      /* ── 1. Overview Tab ── */
      var _po = document.getElementById('panelOverview');
      if (_po) {
        var _ah = patient.allergy === 'allergy' && patient.allergyList && patient.allergyList.length
          ? '<span class="allergy-status has-allergy">แพ้: ' + patient.allergyList.join(', ') + '</span>'
          : patient.allergy === 'unknown' ? '<span class="allergy-status unknown">Unknown — ยังไม่ทราบ</span>'
          : '<span class="allergy-status nka">NKA — No Known Allergy</span>';
        _po.innerHTML =
          '<div class="section-grid">' +
          '<div class="card"><div class="card-hd"><h3>ข้อมูลผู้ป่วย</h3></div><div class="card-bd">' +
          '<div class="detail-row"><span class="detail-label">ชื่อ-สกุล</span><span class="detail-value">' + patient.name + '</span></div>' +
          '<div class="detail-row"><span class="detail-label">HN</span><span class="detail-value">' + patient.hn + '</span></div>' +
          '<div class="detail-row"><span class="detail-label">เพศ / อายุ</span><span class="detail-value">' + patient.gender + ' ' + patient.age + ' ปี</span></div>' +
          '<div class="detail-row"><span class="detail-label">แพ้ยา</span><span class="detail-value">' + _ah + '</span></div>' +
          '<div class="detail-row"><span class="detail-label">โรคประจำตัว</span><span class="detail-value">' + (patient.pmh || 'ไม่มี') + '</span></div>' +
          '<div class="detail-row"><span class="detail-label">ช่องทาง</span><span class="detail-value">' + (patient.source || '—') + (patient.ems ? ' (EMS)' : '') + '</span></div>' +
          '</div></div>' +
          '<div class="card"><div class="card-hd"><h3>สถานะปัจจุบัน</h3></div><div class="card-bd">' +
          '<div class="detail-row"><span class="detail-label">อาการ (CC)</span><span class="detail-value" style="color:var(--red-600);font-weight:600;">' + (patient.cc || '—') + '</span></div>' +
          '<div class="detail-row"><span class="detail-label">Triage</span><span class="detail-value" style="color:' + (_lc[patient.level] || '') + ';font-weight:700;">Level ' + patient.level + ' — ' + (patient.levelName || '') + '</span></div>' +
          '<div class="detail-row"><span class="detail-label">โซน / เตียง</span><span class="detail-value">' + (patient.zone || '—') + (patient.bed && patient.bed !== '—' ? ' · ' + patient.bed : '') + '</span></div>' +
          '<div class="detail-row"><span class="detail-label">แพทย์</span><span class="detail-value">' + (patient.doctor || '—') + '</span></div>' +
          '<div class="detail-row"><span class="detail-label">สถานะ</span><span class="detail-value">' + (patient.status || '—') + '</span></div>' +
          '<div class="detail-row"><span class="detail-label">มาถึง ER</span><span class="detail-value">' + (patient.triage_time || '—') + '</span></div>' +
          (patient.firstDocSeen ? '<div class="detail-row"><span class="detail-label">First Doctor Seen</span><span class="detail-value">' + patient.firstDocSeen + '</span></div>' : '') +
          (patient.doorToDoctor ? '<div class="detail-row"><span class="detail-label">Door-to-Doctor</span><span class="detail-value" style="color:var(--green);font-weight:700;">' + patient.doorToDoctor + ' นาที</span></div>' : '') +
          '</div></div>' +
          '</div>' +
          '<div class="card" style="margin-top:14px;"><div class="card-hd"><h3>สัญญาณชีพล่าสุด</h3></div><div class="card-bd">' +
          '<div class="pq-vitals">' +
          '<div class="pq-vital"><div class="pq-vital-label">BP</div><div class="pq-vital-value" style="' + vitalColor('bp', patient.bp) + '">' + (patient.bp || '—') + '</div></div>' +
          '<div class="pq-vital"><div class="pq-vital-label">HR</div><div class="pq-vital-value" style="' + vitalColor('hr', patient.hr) + '">' + (patient.hr || '—') + '</div></div>' +
          '<div class="pq-vital"><div class="pq-vital-label">SpO2</div><div class="pq-vital-value" style="' + vitalColor('spo2', patient.spo2) + '">' + (patient.spo2 ? patient.spo2 + '%' : '—') + '</div></div>' +
          '<div class="pq-vital"><div class="pq-vital-label">Temp</div><div class="pq-vital-value" style="' + vitalColor('temp', patient.temp) + '">' + (patient.temp || '—') + '</div></div>' +
          '<div class="pq-vital"><div class="pq-vital-label">RR</div><div class="pq-vital-value">' + (patient.rr || '—') + '</div></div>' +
          '<div class="pq-vital"><div class="pq-vital-label">GCS</div><div class="pq-vital-value" style="' + vitalColor('gcs', patient.gcs) + '">' + (patient.gcs || '—') + '</div></div>' +
          '</div>' +
          '</div></div>';
      }

      /* ── 2. Orders Tab ── */
      var _oel = document.getElementById('oeOrderList');
      if (_oel) {
        var _ords = ERStore.getOrders(hnParam);
        var _tl = {lab:'Lab',xray:'X-ray',med:'ยา',procedure:'Procedure',consult:'Consult',observe:'Observe',admit:'Admit',refer:'Refer'};
        var _pl = {stat:'STAT',now:'NOW',urgent:'Urgent',routine:'Routine'};
        var _pc = {stat:'stat',now:'now',urgent:'urgent-pri',routine:'routine-pri'};
        var _ps = {stat:'15 นาที',now:'30 นาที',urgent:'1 ชม.',routine:'4 ชม.'};
        var _sl = {pending:'รอตอบรับ',active:'กำลังดำเนินการ',done:'เสร็จ',cancelled:'ยกเลิกแล้ว'};
        var _sc = {pending:'waiting-accept',active:'in-progress',done:'completed',cancelled:'cancelled'};
        if (!_ords || _ords.length === 0) {
          _oel.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--slate-400);padding:20px;font-size:13px;">ยังไม่มีคำสั่งการรักษา</td></tr>';
        } else {
          var _oh = '';
          _ords.forEach(function(o) {
            _oh += '<tr' + (o.status === 'cancelled' ? ' class="oe-cancelled"' : '') + '>' +
              '<td>' + (o.time || '—') + '</td>' +
              '<td><span class="oe-type-badge ' + o.type + '">' + (_tl[o.type] || o.type) + '</span></td>' +
              '<td>' + o.desc + '</td>' +
              '<td><span class="oe-priority ' + (_pc[o.priority] || 'routine-pri') + '">' + (_pl[o.priority] || o.priority) + '</span><div style="font-size:9px;color:var(--slate-400);">SLA: ' + (_ps[o.priority] || '—') + '</div></td>' +
              '<td><span class="oe-status ' + (_sc[o.status] || '') + '">' + (_sl[o.status] || o.status) + '</span></td>' +
              '<td>' + (o.by || 'Admin') + '</td>' +
              '<td>' + (o.status === 'pending' ? '<button class="oe-cancel-btn">ยกเลิก</button>' : '') + '</td>' +
              '</tr>';
          });
          _oel.innerHTML = _oh;
        }
        var _oc = _oel.closest('.card');
        if (_oc) { var _cs = _oc.querySelector('.card-hd span'); if (_cs) _cs.textContent = (_ords ? _ords.length : 0) + ' รายการ'; }
      }

      /* ── 3. Results Tab ── */
      var _pr = document.getElementById('panelResults');
      if (_pr) {
        var _ao = ERStore.getOrders(hnParam);
        var _ro = _ao.filter(function(o) { return (o.type === 'lab' || o.type === 'xray' || o.type === 'procedure') && (o.status === 'done' || o.status === 'active'); });

        /* Demo lab/result values per patient */
        var _dhl = {
          '640001': {
            alert: 'Critical Result — 3 รายการ', alertDesc: 'Troponin I 15.8 · K+ 7.2 · Lactate 12.5',
            vals: {
              'CBC, BMP, Troponin, Lactate, ABG': [{v:'Troponin I: 15.8 ng/mL ↑↑↑',c:'crit'},{v:'K+: 7.2 mEq/L ↑↑',c:'crit'},{v:'Lactate: 12.5 mmol/L ↑↑↑',c:'crit'},{v:'Cr: 4.8 mg/dL ↑',c:'warn'},{v:'Hb: 9.8 g/dL ↓',c:'warn'},{v:'Na+: 138 mEq/L ✓',c:'ok'}],
              '12-lead ECG': [{v:'ST Elevation V1-V4 → STEMI',c:'crit'}],
              'Target Temperature Management': [{v:'Target 33-36°C · Arctic Sun · Temp 35.8°C',c:'ok'}],
              'Defibrillation #3 — 200J': [{v:'→ ROSC · Sinus rhythm HR 92',c:'ok'}]
            }
          },
          '640045': {
            alert: 'Critical Result — 2 รายการ', alertDesc: 'Hb 7.2 · Lactate 8.5',
            vals: {
              'CBC, BMP, Type & Screen, Crossmatch 4 units': [{v:'Hb: 7.2 g/dL ↓↓',c:'crit'},{v:'Lactate: 8.5 mmol/L ↑↑',c:'crit'},{v:'Type: O Rh+ · Crossmatch ready',c:'ok'}]
            }
          },
          '640077': {
            vals: {
              'CBC, BMP, Beta-hCG, Urinalysis': [{v:'Beta-hCG: 3,200 mIU/mL ↑ (Positive)',c:'crit'},{v:'Hb: 10.2 g/dL ↓',c:'warn'},{v:'WBC: 9,800 /μL ✓',c:'ok'}],
              'USG Pelvis': [{v:'Rt. adnexal mass 3.2cm + free fluid → สงสัย Ectopic',c:'crit'}]
            }
          },
          '640086': {
            vals: {
              'Troponin (serial), CBC, BMP': [{v:'Troponin I: 0.04 ng/mL (ปกติ)',c:'ok'},{v:'CBC: WBC 8,200 · Hb 13.5',c:'ok'},{v:'BMP: Cr 1.0 · K+ 4.2',c:'ok'}],
              '12-lead ECG': [{v:'Normal sinus rhythm · No ST changes',c:'ok'}],
              'CXR PA upright': [{v:'Normal cardiac size · Clear lung fields',c:'ok'}]
            }
          },
          '640091': {
            alert: 'Critical Result — 1 รายการ', alertDesc: 'HR 145 bpm — AF with RVR',
            vals: {
              'CBC, BMP, TSH, Troponin': [{v:'TSH: 0.01 mIU/L ↓↓',c:'crit'},{v:'Troponin I: 0.08 ng/mL (borderline)',c:'warn'},{v:'K+: 3.2 mEq/L ↓',c:'warn'}],
              '12-lead ECG': [{v:'Atrial Fibrillation, RVR HR 145',c:'crit'}],
              'Diltiazem 10mg IV push': [{v:'HR ลดจาก 145 → 95 bpm',c:'ok'}]
            }
          },
          '640090': {
            vals: {
              'CBC, BMP, Urinalysis, Amylase': [{v:'WBC: 14,500 /μL ↑',c:'warn'},{v:'Amylase: 45 U/L (ปกติ)',c:'ok'},{v:'Cr: 0.8 mg/dL ✓',c:'ok'}],
              'Morphine 2mg IV': [{v:'Pain score 8 → 3 (ดีขึ้น)',c:'ok'}]
            }
          }
        };

        var _hl = _dhl[hnParam] || {};
        var _rh = '';

        if (_hl.alert) {
          _rh += '<div class="allergy-banner has-allergy" style="margin-bottom:12px;"><div class="allergy-banner-icon allergy"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:22px;height:22px;"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div><div class="allergy-banner-body"><div class="allergy-banner-title" style="color:var(--red-600);">' + _hl.alert + '</div><div class="allergy-banner-desc">' + _hl.alertDesc + '</div></div></div>';
        }

        var _lbc = 0, _imc = 0, _prc = 0;
        _ro.forEach(function(o) { if (o.type === 'lab') _lbc++; else if (o.type === 'xray') _imc++; else _prc++; });
        _rh += '<div class="ap-summary" style="margin-bottom:12px;">' +
          '<button class="ap-tab active" data-result="all">ทั้งหมด <span class="ap-tab-count">' + (_lbc + _imc + _prc) + '</span></button>' +
          '<button class="ap-tab" data-result="lab"><span class="ap-tab-dot" style="background:var(--purple);"></span>Lab <span class="ap-tab-count">' + _lbc + '</span></button>' +
          '<button class="ap-tab" data-result="imaging"><span class="ap-tab-dot" style="background:var(--blue);"></span>Imaging <span class="ap-tab-count">' + _imc + '</span></button>' +
          '<button class="ap-tab" data-result="procedure"><span class="ap-tab-dot" style="background:var(--orange);"></span>Procedure <span class="ap-tab-count">' + _prc + '</span></button></div>';

        _rh += '<div class="results-list">';
        if (_ro.length === 0) {
          _rh += '<div style="text-align:center;padding:40px 20px;color:var(--slate-400);font-size:13px;">ยังไม่มีผลตรวจ</div>';
        } else {
          var _rtm = {lab:'lab',xray:'imaging',procedure:'procedure'};
          var _rbd = {lab:'Lab',xray:'Imaging',procedure:'Procedure'};
          _ro.forEach(function(o) {
            var _rt = _rtm[o.type] || o.type;
            var _vs = _hl.vals && _hl.vals[o.desc];
            _rh += '<div class="result-card" data-rtype="' + _rt + '">' +
              '<div class="result-card-hd"><div class="result-card-left">' +
              '<span class="oe-type-badge ' + o.type + '">' + (_rbd[o.type] || o.type) + '</span>' +
              '<span class="oe-priority ' + (o.priority || 'routine') + '">' + ({stat:'STAT',now:'NOW',urgent:'Urgent',routine:'Routine'}[o.priority] || o.priority) + '</span>' +
              '<strong>' + o.desc + '</strong></div>' +
              '<div class="result-card-right">' +
              '<span class="oe-status ' + ({done:'completed',active:'in-progress'}[o.status] || '') + '" style="font-size:10px;">' + ({done:'มีผลแล้ว',active:'กำลังดำเนินการ'}[o.status] || o.status) + '</span>' +
              '<span style="font-size:11px;color:var(--slate-400);">' + o.time + '</span></div></div>';
            if (_vs) {
              _rh += '<div class="result-card-bd"><div class="result-highlights">';
              _vs.forEach(function(h) { _rh += '<span class="result-hl ' + h.c + '">' + h.v + '</span>'; });
              _rh += '</div></div>';
            } else if (o.status === 'active') {
              _rh += '<div class="result-card-bd"><div style="color:var(--blue);font-size:12px;">กำลังดำเนินการ...</div></div>';
            } else {
              _rh += '<div class="result-card-bd"><div style="color:var(--green);font-size:12px;">ผลปกติ — ดูรายละเอียดในระบบ HIS</div></div>';
            }
            _rh += '</div>';
          });
        }
        _rh += '</div>';

        /* ── Consult Notes in Results Tab ── */
        var _cnAll = ERStore.getConsults(hnParam);
        var _cnNoted = _cnAll.filter(function(c) { return c.status === 'noted' && c.consultNote && typeof c.consultNote === 'object'; });
        var _cnActive = _cnAll.filter(function(c) { return c.status !== 'noted' && c.status !== 'declined'; });

        if (_cnNoted.length > 0 || _cnActive.length > 0) {
          _rh += '<div style="margin-top:16px;padding-top:14px;border-top:2px solid var(--slate-200);">';
          _rh += '<div style="font-size:13px;font-weight:800;color:var(--slate-700);margin-bottom:10px;">Consult Notes / Recommendations</div>';

          /* Completed notes */
          var _cnTypeLabels = {admit:'Admit',medication:'สั่งยา',procedure:'Procedure',observe:'Observe',followup:'Follow up',refer:'Refer',other:'อื่นๆ'};
          _cnNoted.forEach(function(c) {
            var n = c.consultNote;
            _rh += '<div class="cn-note-card">';
            _rh += '<div class="cn-note-hd"><div class="cn-spec-badge">' + c.specialty.substring(0,2) + '</div><div class="cn-spec-info"><div class="cn-spec-name">' + c.specialty + ' — ' + (c.specialist||'') + '</div><div class="cn-spec-meta">' + c.patient + ' · Note ' + c.noteTime + '</div></div></div>';
            _rh += '<div class="cn-section"><div class="cn-section-title">Assessment</div><div class="cn-assessment">' + n.assessment + '</div></div>';
            if (n.recommendations && n.recommendations.length) {
              _rh += '<div class="cn-section"><div class="cn-section-title">Recommendations</div><div class="cn-rec-list">';
              n.recommendations.forEach(function(r) {
                _rh += '<div class="cn-rec-item' + (r.done ? ' done' : '') + '"><span class="cn-rec-type ' + r.type + '">' + (_cnTypeLabels[r.type]||r.type) + '</span><span class="cn-rec-text">' + r.text + '</span></div>';
              });
              _rh += '</div></div>';
            }
            if (n.plan) _rh += '<div class="cn-section"><div class="cn-section-title">Plan</div><div class="cn-plan">' + n.plan + '</div></div>';
            _rh += '</div>';
          });

          /* Pending consults */
          var _cnStLabels = {sent:'ส่งแล้ว · รอรับ',received:'รับทราบแล้ว',accepted:'กำลังมา',seeing:'กำลังดูผู้ป่วย'};
          _cnActive.forEach(function(c) {
            _rh += '<div class="con-card" style="border-color:var(--warn);">';
            _rh += '<div class="con-card-hd"><span class="con-spec-icon" style="background:var(--warn-bg);color:var(--warn);width:28px;height:28px;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;font-weight:800;font-size:10px;">' + c.specialty.substring(0,2) + '</span><span style="font-weight:700;font-size:12px;">' + c.specialty + ' Consult</span><span class="con-card-urgency"><span class="tr-status ' + c.status + '" style="font-size:9px;">' + (_cnStLabels[c.status]||c.status) + '</span></span></div>';
            _rh += '<div style="font-size:11px;color:var(--slate-600);">' + c.reason + '</div>';
            _rh += '</div>';
          });

          _rh += '</div>';
        }

        _pr.innerHTML = _rh;
      }

      /* ── 4. Timeline Tab ── */
      var _pt = document.getElementById('panelTimeline');
      if (_pt) {
        var _te = [];
        if (patient.triage_time) _te.push({time:patient.triage_time, ph:'er', type:'scene', ev:'มาถึง ER · ' + (patient.source || ''), det:patient.cc || ''});
        if (patient.firstDocSeen) _te.push({time:patient.firstDocSeen, ph:'er', type:'prepare', ev:'First Doctor Seen — ' + (patient.doctor || ''), det:'D2D: ' + (patient.doorToDoctor ? patient.doorToDoctor + ' นาที' : '—')});
        var _to = ERStore.getOrders(hnParam);
        if (_to && _to.length) {
          var _tmMap = {lab:'med',xray:'med',med:'med',procedure:'critical',consult:'notify',observe:'prepare',admit:'transport',refer:'transport'};
          var _tnMap = {lab:'Lab',xray:'Imaging',med:'ยา',procedure:'Procedure',consult:'Consult',observe:'Observe',admit:'Admit',refer:'Refer'};
          _to.slice().sort(function(a,b){return(a.time||'').localeCompare(b.time||'');}).forEach(function(o){
            _te.push({time:o.time, ph:'er', type:_tmMap[o.type]||'med', ev:(_tnMap[o.type]||o.type)+' — '+o.desc, det:(o.by||'')+ ' · '+({pending:'รอ',active:'กำลังดำเนินการ',done:'เสร็จ'}[o.status]||o.status)});
          });
        }
        _te.sort(function(a,b){return(a.time||'').localeCompare(b.time||'');});
        var _th = '<div class="card"><div class="card-hd"><h3>Timeline</h3><span style="font-size:11px;color:var(--slate-400);">' + _te.length + ' เหตุการณ์</span></div><div class="card-bd"><div class="tl-track" style="padding-left:18px;">';
        if (_te.length === 0) {
          _th += '<div style="text-align:center;padding:20px;color:var(--slate-400);font-size:13px;">ยังไม่มี Timeline</div>';
        } else {
          _te.forEach(function(e) {
            _th += '<div class="tl-item ' + e.type + '"><div class="tl-dot ' + e.type + '"></div><div class="tl-content"><div class="tl-time">' + e.time + ' <span class="tl-phase ' + e.ph + '">' + e.ph.toUpperCase() + '</span></div><div class="tl-event">' + e.ev + '</div>' + (e.det ? '<div class="tl-detail">' + e.det + '</div>' : '') + '</div></div>';
          });
        }
        _th += '</div></div></div>';
        _pt.innerHTML = _th;
      }

      /* ── 5. Disposition Status Cards ── */
      var _pd = document.getElementById('panelDisposition');
      if (_pd) {
        var _dc = _pd.querySelectorAll('.card');
        if (_dc.length > 0) {
          var _ds = _dc[0].querySelector('.card-bd > div');
          if (_ds) {
            _ds.innerHTML =
              '<div style="flex:1;min-width:150px;background:var(--slate-50);border-radius:10px;padding:12px;text-align:center;"><div style="font-size:10px;font-weight:700;color:var(--slate-400);text-transform:uppercase;">Triage</div><div style="font-size:22px;font-weight:700;color:' + (_lc[patient.level] || 'var(--slate-800)') + ';">Level ' + patient.level + '</div></div>' +
              '<div style="flex:1;min-width:150px;background:var(--green-light);border-radius:10px;padding:12px;text-align:center;"><div style="font-size:10px;font-weight:700;color:var(--slate-400);text-transform:uppercase;">Door-to-Doctor</div><div style="font-size:22px;font-weight:700;color:var(--green);">' + (patient.doorToDoctor ? patient.doorToDoctor + ' นาที' : '—') + '</div></div>' +
              '<div style="flex:1;min-width:150px;background:var(--blue-light);border-radius:10px;padding:12px;text-align:center;"><div style="font-size:10px;font-weight:700;color:var(--slate-400);text-transform:uppercase;">มาถึง ER</div><div style="font-size:22px;font-weight:700;color:var(--blue);">' + (patient.triage_time || '—') + '</div></div>' +
              '<div style="flex:1;min-width:150px;background:var(--red-50);border-radius:10px;padding:12px;text-align:center;"><div style="font-size:10px;font-weight:700;color:var(--slate-400);text-transform:uppercase;">สถานะ</div><div style="font-size:22px;font-weight:700;color:var(--slate-800);">' + (patient.status || '—') + '</div></div>';
          }
        }
      }

      /* ── 6. Status Change Buttons ── */
      var ppStatusBtns = document.getElementById('ppStatusBtns');
      if (ppStatusBtns) {
        var st = patient.status;
        var statusClassMap = {'กำลังรักษา':'treating','Observe':'observe','รอ Admit':'admit','Discharge':'discharged','Admit':'discharged','Admit ICU':'discharged','Refer':'discharged','เสียชีวิต':'discharged'};
        var currentClass = statusClassMap[st] || 'treating';

        var html = '<div class="pp-status-current ' + currentClass + '"><div class="pp-status-dot" style="background:currentColor;"></div> สถานะ: ' + st + '</div>';

        /* Allowed transitions */
        if (st === 'กำลังรักษา') {
          html += '<button class="pp-status-btn" data-newstatus="Observe"><div class="pp-status-dot" style="background:var(--warn);"></div><strong>Observe</strong><span class="pp-status-desc">สังเกตอาการ</span></button>';
          html += '<button class="pp-status-btn" data-newstatus="รอ Admit"><div class="pp-status-dot" style="background:var(--orange);"></div><strong>รอ Admit</strong><span class="pp-status-desc">รอเตียง Ward/ICU</span></button>';
        } else if (st === 'Observe') {
          html += '<button class="pp-status-btn" data-newstatus="กำลังรักษา"><div class="pp-status-dot" style="background:var(--blue);"></div><strong>กำลังรักษา</strong><span class="pp-status-desc">กลับมารักษาต่อ</span></button>';
          html += '<button class="pp-status-btn" data-newstatus="รอ Admit"><div class="pp-status-dot" style="background:var(--orange);"></div><strong>รอ Admit</strong><span class="pp-status-desc">รอเตียง Ward/ICU</span></button>';
        } else if (st === 'รอ Admit') {
          html += '<button class="pp-status-btn" data-newstatus="กำลังรักษา"><div class="pp-status-dot" style="background:var(--blue);"></div><strong>กำลังรักษา</strong><span class="pp-status-desc">กลับมารักษาต่อ</span></button>';
        } else if (st === 'รอแพทย์') {
          html += '<button class="pp-status-btn" data-newstatus="กำลังรักษา"><div class="pp-status-dot" style="background:var(--blue);"></div><strong>รับเคส (กำลังรักษา)</strong><span class="pp-status-desc">First Doctor Seen</span></button>';
        }

        /* Terminal statuses — no more transitions */
        if (st === 'Discharge' || st === 'Admit' || st === 'Admit ICU' || st === 'Refer' || st === 'เสียชีวิต') {
          html += '<div style="font-size:10px;color:var(--slate-400);text-align:center;padding:4px;">จำหน่ายแล้ว — ไม่สามารถเปลี่ยนสถานะได้</div>';
        }

        ppStatusBtns.innerHTML = html;

        /* Handle status change clicks */
        ppStatusBtns.addEventListener('click', function(e) {
          var btn = e.target.closest('.pp-status-btn');
          if (!btn) return;
          var newStatus = btn.dataset.newstatus;
          if (!newStatus) return;
          var now = new Date().toLocaleTimeString('th-TH', {hour12:false, hour:'2-digit', minute:'2-digit'});

          var changes = { status: newStatus };

          /* Special: รับเคส (รอแพทย์ → กำลังรักษา) records First Doctor Seen */
          if (st === 'รอแพทย์' && newStatus === 'กำลังรักษา') {
            changes.firstDocSeen = now;
            changes.doctor = 'Admin';
            changes.wait = '';
          }

          if (!confirm('เปลี่ยนสถานะเป็น "' + newStatus + '"?')) return;

          ERStore.updatePatient(hnParam, changes);

          /* Reload page to reflect changes */
          window.location.reload();
        });
      }

    } else {
      document.getElementById('ppHeaderName').textContent = 'การรักษา — HN ' + hnParam;
    }
  } else {
    if (ppEmpty) ppEmpty.style.display = '';
    if (ppMainLayout) ppMainLayout.style.display = 'none';
  }

  /* Render patient picker from ERStore */
  (function renderPatientPicker() {
    var list = document.getElementById('ppPatientList');
    if (!list) return;
    var patients = ERStore.getAllPatients();
    if (patients.length === 0) return;

    var statusClass = { 'กำลังรักษา':'treating', 'รอแพทย์':'waiting', 'รอ Admit':'admit', 'Observe':'treating' };
    var levelBg = { '1':'var(--red-100)', '2':'var(--orange-bg)', '3':'var(--warn-bg)', '4':'var(--green-bg)', '5':'var(--blue-bg)' };
    var levelColor = { '1':'var(--red-600)', '2':'var(--orange)', '3':'var(--warn)', '4':'var(--green)', '5':'var(--blue)' };

    list.innerHTML = '';
    /* แสดงเฉพาะสถานะที่กำลังอยู่ใน ER (ไม่แสดงรอคัดกรอง) */
    var activeStatuses = ['กำลังรักษา', 'รอ Admit', 'Observe'];
    var activePatients = patients.filter(function(p) { return activeStatuses.indexOf(p.status) > -1; });

    if (activePatients.length === 0) {
      list.innerHTML = '<div style="text-align:center;padding:20px;color:var(--slate-400);font-size:13px;">ไม่มีผู้ป่วยในระบบ</div>';
    }

    activePatients.forEach(function(p) {
      var initials = p.name.substring(0, 2);
      var sc = statusClass[p.status] || '';
      var bg = levelBg[p.level] || 'var(--slate-100)';
      var clr = levelColor[p.level] || 'var(--slate-600)';

      var item = document.createElement('a');
      item.href = 'patient-profile.html?hn=' + p.hn;
      item.className = 'pp-pick-item';
      item.innerHTML =
        '<div class="pp-pick-avatar" style="background:' + bg + ';color:' + clr + ';">' + initials + '</div>' +
        '<div class="pp-pick-info"><div class="pp-pick-name">' + p.name + '</div><div class="pp-pick-detail">HN ' + p.hn + ' · ' + (p.gender||'') + ' ' + (p.age||'') + ' ปี · ' + (p.levelName||'') + (p.bed && p.bed !== '—' ? ' · ' + p.bed : '') + '</div></div>' +
        '<span class="pp-pick-status ' + sc + '">' + p.status + '</span>';
      list.appendChild(item);
    });
  })();

  /* Patient search filter */
  var ppSearchInput = document.getElementById('ppSearchInput');
  if (ppSearchInput) {
    ppSearchInput.addEventListener('input', function() {
      var q = ppSearchInput.value.toLowerCase();
      document.querySelectorAll('.pp-pick-item').forEach(function(item) {
        var text = item.textContent.toLowerCase();
        item.classList.toggle('hidden', q.length > 0 && text.indexOf(q) === -1);
      });
    });
  }

  /* Quick links/buttons in sidebar → switch tab */
  document.querySelectorAll('.pp-quick-link, .qa-btn[data-tab], .qa-link[data-tab]').forEach(function(link) {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      var tab = link.dataset.tab;
      if (tab) {
        var tabBtn = document.querySelector('.pp-tab[data-tab="' + tab + '"]');
        if (tabBtn) tabBtn.click();
      }
    });
  });

  /* Mobile sidebar */
  var sb = document.getElementById('sidebar');
  var ov = document.getElementById('sbOverlay');
  var mb = document.getElementById('menuBtn');
  if (mb) { mb.onclick=function(){sb.classList.toggle('open');ov.classList.toggle('show');}; ov.onclick=function(){sb.classList.remove('open');ov.classList.remove('show');}; }

  /* Tab switching */
  var tabs = document.querySelectorAll('.pp-tab');
  var panels = {
    overview: document.getElementById('panelOverview'),
    allergy: document.getElementById('panelAllergy'),
    vitals: document.getElementById('panelVitals'),
    orders: document.getElementById('panelOrders'),
    results: document.getElementById('panelResults'),
    disposition: document.getElementById('panelDisposition'),
    timeline: document.getElementById('panelTimeline'),
    ems: document.getElementById('panelEms')
  };

  tabs.forEach(function(tab) {
    tab.addEventListener('click', function() {
      tabs.forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      var which = tab.dataset.tab;
      Object.keys(panels).forEach(function(key) {
        if (panels[key]) panels[key].style.display = key === which ? '' : 'none';
      });
    });
  });

  /* Auto-select tab from URL param */
  var urlParams = new URLSearchParams(window.location.search);
  var tabParam = urlParams.get('tab');
  if (tabParam && panels[tabParam]) {
    tabs.forEach(function(t) { t.classList.remove('active'); });
    var targetTab = document.querySelector('.pp-tab[data-tab="' + tabParam + '"]');
    if (targetTab) targetTab.classList.add('active');
    Object.keys(panels).forEach(function(key) {
      if (panels[key]) panels[key].style.display = key === tabParam ? '' : 'none';
    });
  }
}

  /* ── Results filter (Lab/Imaging/Procedure) ── */
  var resultTabs = document.querySelectorAll('[data-result]');
  var resultCards = document.querySelectorAll('.result-card');
  resultTabs.forEach(function(tab) {
    tab.addEventListener('click', function() {
      resultTabs.forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      var filter = tab.dataset.result;
      resultCards.forEach(function(card) {
        card.classList.toggle('hidden', filter !== 'all' && card.dataset.rtype !== filter);
      });
    });
  });

  /* ── Disposition ── */
  var dispForms = {
    admit: document.getElementById('dispAdmitForm'),
    icu: document.getElementById('dispAdmitForm'),
    discharge: document.getElementById('dispDischargeForm'),
    refer: document.getElementById('dispReferForm'),
    dead: null
  };

  var checklistData = {
    admit: [
      { icon:'team', title:'Vital signs คงที่', desc:'BP, HR, SpO2 อยู่ในเกณฑ์ ≥30 นาที' },
      { icon:'equip', title:'ผล Lab / Imaging ครบ', desc:'ไม่มีผลค้างรอ' },
      { icon:'bed', title:'เตียง Ward พร้อม', desc:'ติดต่อ Ward ยืนยันเตียงแล้ว' },
      { icon:'lab', title:'แพทย์รับ Admit ทราบ', desc:'Handover ข้อมูลครบ' },
      { icon:'blood', title:'ยา / สารน้ำพร้อม', desc:'เตรียมยาระหว่างย้าย' },
      { icon:'consult', title:'แจ้งญาติ', desc:'ญาติทราบและเข้าใจแผนการรักษาต่อ' }
    ],
    icu: [
      { icon:'team', title:'Vital signs คงที่พอย้ายได้', desc:'Hemodynamic stable เพียงพอ' },
      { icon:'equip', title:'ผล Lab / Imaging ครบ', desc:'ไม่มีผลค้างรอ' },
      { icon:'bed', title:'เตียง ICU พร้อม', desc:'ICU ยืนยันรับแล้ว' },
      { icon:'lab', title:'แพทย์ ICU ทราบ', desc:'Handover เคส + แผนการรักษาครบ' },
      { icon:'blood', title:'อุปกรณ์ระหว่างย้ายพร้อม', desc:'Monitor, Ventilator, Infusion pump' },
      { icon:'consult', title:'แจ้งญาติ', desc:'ญาติทราบว่าย้าย ICU + สภาพผู้ป่วย' }
    ],
    discharge: [
      { icon:'team', title:'Vital signs ปกติ', desc:'Vital อยู่ในเกณฑ์ปกติ ≥1 ชม.' },
      { icon:'equip', title:'ผล Lab / Imaging ปกติ', desc:'ไม่มีค่าผิดปกติที่ต้องรอ' },
      { icon:'lab', title:'ให้คำแนะนำแล้ว', desc:'อธิบายอาการเตือน + คำแนะนำก่อนกลับบ้าน' },
      { icon:'blood', title:'จ่ายยากลับบ้าน', desc:'ใบสั่งยาพร้อม + อธิบายวิธีกิน' },
      { icon:'consult', title:'นัดติดตาม', desc:'ลงนัด OPD + ให้ใบนัดผู้ป่วย' },
      { icon:'team', title:'แจ้งญาติ / ผู้ดูแล', desc:'มีคนมารับกลับบ้าน' }
    ],
    refer: [
      { icon:'team', title:'Vital signs คงที่พอส่งต่อ', desc:'Stable enough for transport' },
      { icon:'equip', title:'ติดต่อ รพ.ปลายทางแล้ว', desc:'ยืนยันรับเคส + เตียงพร้อม' },
      { icon:'bed', title:'เอกสาร Refer ครบ', desc:'ใบ Refer + สรุปการรักษา + ผล Lab/Imaging' },
      { icon:'blood', title:'อุปกรณ์ระหว่างย้ายพร้อม', desc:'Monitor, O2, ยา, สารน้ำ' },
      { icon:'lab', title:'รถ Refer พร้อม', desc:'รถ + ทีมส่งต่อพร้อมออก' },
      { icon:'consult', title:'แจ้งญาติ', desc:'ญาติทราบว่าส่งต่อ รพ.ไหน + เหตุผล' }
    ],
    dead: [
      { icon:'team', title:'แพทย์ยืนยันการเสียชีวิต', desc:'ตรวจร่างกาย + ลงเวลาเสียชีวิต' },
      { icon:'equip', title:'แจ้งญาติ', desc:'แจ้งข่าวการเสียชีวิต + แสดงความเสียใจ' },
      { icon:'lab', title:'ลงบันทึกเวชระเบียน', desc:'สรุปสาเหตุ + การรักษา + เวลาเสียชีวิต' },
      { icon:'consult', title:'แจ้งฝ่ายที่เกี่ยวข้อง', desc:'ฝ่ายทะเบียน + นิติเวช (ถ้าจำเป็น)' }
    ]
  };

  var titleMap = { admit:'Checklist ก่อน Admit', icu:'Checklist ก่อนย้าย ICU', discharge:'Checklist ก่อน Discharge', refer:'Checklist ก่อน Refer', dead:'Checklist กรณีเสียชีวิต' };

  function renderChecklist(type) {
    var items = checklistData[type];
    var container = document.getElementById('dispChecklist');
    var title = document.getElementById('dispChecklistTitle');
    if (!items || !container) return;
    title.textContent = titleMap[type] || 'Checklist';
    var svg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;"><polyline points="20 6 9 17 4 12"/></svg>';
    container.innerHTML = items.map(function(item) {
      return '<label class="qp-check-item"><input type="checkbox" /><div class="qp-check-icon ' + item.icon + '">' + svg + '</div><div><strong>' + item.title + '</strong><span>' + item.desc + '</span></div></label>';
    }).join('');
  }

  document.querySelectorAll('input[name="dispType"]').forEach(function(r) {
    r.addEventListener('change', function() {
      Object.values(dispForms).forEach(function(f) { if (f) f.style.display = 'none'; });
      var form = dispForms[r.value];
      if (form) form.style.display = '';
      renderChecklist(r.value);
    });
  });

  var dispSubmit = document.getElementById('dispSubmit');
  if (dispSubmit) {
    dispSubmit.addEventListener('click', function() {
      var type = document.querySelector('input[name="dispType"]:checked');
      if (!type) {
        var tc = document.getElementById('toastContainer');
        var tw = document.createElement('div');
        tw.className = 'toast warn';
        tw.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg><span>กรุณาเลือกประเภทการจำหน่าย</span>';
        tc.appendChild(tw);
        setTimeout(function() { tw.remove(); }, 3200);
        return;
      }

      var dx = document.getElementById('dispDiagnosis').value.trim();
      if (!dx) {
        var tc2 = document.getElementById('toastContainer');
        var tw2 = document.createElement('div');
        tw2.className = 'toast warn';
        tw2.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg><span>กรุณากรอก Diagnosis สรุป</span>';
        tc2.appendChild(tw2);
        setTimeout(function() { tw2.remove(); }, 3200);
        return;
      }

      /* Check checklist */
      var checks = document.querySelectorAll('#dispChecklist input[type="checkbox"]');
      var checked = 0;
      checks.forEach(function(c) { if (c.checked) checked++; });

      var labels = { admit:'Admit', icu:'ICU', discharge:'Discharge', refer:'Refer', dead:'เสียชีวิต' };
      var typeVal = type.value;

      if (checked < checks.length) {
        if (!confirm('ยังทำ Checklist ไม่ครบ (' + checked + '/' + checks.length + ')\nต้องการจำหน่ายเลยหรือไม่?')) return;
      }

      var now = new Date().toLocaleTimeString('th-TH', {hour12:false, hour:'2-digit', minute:'2-digit'});

      /* ── Actually update patient status in ERStore ── */
      var statusMap = { admit:'Admit', icu:'Admit ICU', discharge:'Discharge', refer:'Refer', dead:'เสียชีวิต' };
      if (hnParam) {
        var pt = ERStore.getPatient(hnParam);
        if (pt) {
          /* Update patient status */
          ERStore.updatePatient(hnParam, {
            status: statusMap[typeVal] || 'Discharge',
            disposition: typeVal,
            dispositionTime: now,
            diagnosis: dx
          });

          /* Free bed */
          if (pt.bed && pt.bed !== '—') {
            ERStore.updateBed(pt.bed, { status:'clean', patient:null });
          }

          /* Add disposition order to timeline */
          ERStore.addOrder(hnParam, {
            type: typeVal === 'refer' ? 'refer' : typeVal === 'admit' || typeVal === 'icu' ? 'admit' : 'procedure',
            desc: 'Disposition: ' + labels[typeVal] + ' — ' + dx,
            priority: 'routine',
            status: 'done'
          });

          /* Update header + tags to reflect new status */
          var ppTags = document.getElementById('ppTags');
          if (ppTags) {
            ppTags.innerHTML =
              '<span class="pq-tag" style="background:var(--slate-100);color:var(--slate-600);">' + statusMap[typeVal] + '</span>' +
              '<span class="pq-tag" style="background:var(--green-bg);color:var(--green);">จำหน่ายแล้ว ' + now + '</span>';
          }
        }
      }

      var tc3 = document.getElementById('toastContainer');
      var ts = document.createElement('div');
      ts.className = 'toast success';
      ts.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>จำหน่าย ' + labels[typeVal] + ' เรียบร้อย — ' + dx + ' · ' + now + '</span>';
      tc3.appendChild(ts);
      setTimeout(function() { ts.remove(); }, 3200);
    });
  }

  /* ── Allergy Management ── */
  var allergyChangeBtn = document.getElementById('allergyChangeBtn');
  var allergyForm = document.getElementById('allergyForm');
  var allergyCancelBtn = document.getElementById('allergyCancelBtn');
  var allergySaveBtn = document.getElementById('allergySaveBtn');
  var allergyDetailForm = document.getElementById('allergyDetailForm');
  var allergyRecords = document.getElementById('allergyRecords');
  var allergyAddBtn = document.getElementById('allergyAddBtn');
  var allergyBanner = document.getElementById('allergyBanner');
  var allergyList = [];

  if (allergyChangeBtn) {
    allergyChangeBtn.addEventListener('click', function() {
      allergyForm.style.display = allergyForm.style.display === 'none' ? '' : 'none';
    });
  }

  if (allergyCancelBtn) {
    allergyCancelBtn.addEventListener('click', function() { allergyForm.style.display = 'none'; });
  }

  /* Toggle allergy detail form */
  document.querySelectorAll('input[name="allergyStatus"]').forEach(function(r) {
    r.addEventListener('change', function() {
      if (allergyDetailForm) allergyDetailForm.style.display = r.value === 'allergy' ? '' : 'none';
    });
  });

  /* Add allergy record */
  if (allergyAddBtn) {
    allergyAddBtn.addEventListener('click', function() {
      var drug = document.getElementById('allergyDrugName').value.trim();
      if (!drug) { alert('กรุณากรอกชื่อยา/สาร'); return; }
      var type = document.getElementById('allergyType');
      var severity = document.getElementById('allergySeverity');
      var reaction = document.getElementById('allergyReaction').value.trim();
      var source = document.getElementById('allergySource');
      var typeText = type.options[type.selectedIndex].text;
      var sevText = severity.options[severity.selectedIndex].text;
      var sevVal = severity.value;
      var sourceText = source.options[source.selectedIndex].text;
      var now = new Date().toLocaleTimeString('th-TH', {hour12:false, hour:'2-digit', minute:'2-digit'});

      allergyList.push({ drug:drug, type:typeText, severity:sevVal, sevText:sevText, reaction:reaction, source:sourceText });

      /* Clear form */
      document.getElementById('allergyDrugName').value = '';
      document.getElementById('allergyReaction').value = '';

      /* Re-render records */
      renderAllergyRecords();

      var tc = document.getElementById('toastContainer');
      var t = document.createElement('div');
      t.className = 'toast success';
      t.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>เพิ่ม ' + drug + ' (' + sevText + ') เรียบร้อย</span>';
      tc.appendChild(t);
      setTimeout(function() { t.remove(); }, 3200);
    });
  }

  function renderAllergyRecords() {
    if (!allergyRecords) return;
    if (allergyList.length === 0) {
      allergyRecords.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--slate-400);padding:20px;font-size:13px;">NKA — ยืนยันไม่มีประวัติแพ้ยา</td></tr>';
      return;
    }
    var now = new Date().toLocaleDateString('th-TH');
    var html = '';
    allergyList.forEach(function(a) {
      html += '<tr>' +
        '<td style="font-weight:600;color:var(--red-600);">' + a.drug + '</td>' +
        '<td>' + a.type + '</td>' +
        '<td><span class="allergy-sev ' + a.severity + '">' + a.sevText + '</span></td>' +
        '<td>' + (a.reaction || '—') + '</td>' +
        '<td>' + a.source + '</td>' +
        '<td>Admin</td>' +
        '<td>' + now + '</td>' +
      '</tr>';
    });
    allergyRecords.innerHTML = html;
  }

  /* Save allergy status */
  if (allergySaveBtn) {
    allergySaveBtn.addEventListener('click', function() {
      var status = document.querySelector('input[name="allergyStatus"]:checked').value;
      var now = new Date().toLocaleTimeString('th-TH', {hour12:false, hour:'2-digit', minute:'2-digit'});

      if (status === 'nka') {
        allergyBanner.className = 'allergy-banner nka';
        allergyBanner.querySelector('.allergy-banner-icon').className = 'allergy-banner-icon nka';
        allergyBanner.querySelector('.allergy-banner-icon').innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:22px;height:22px;"><polyline points="20 6 9 17 4 12"/></svg>';
        document.getElementById('allergyBannerTitle').textContent = 'NKA — No Known Allergy';
        document.getElementById('allergyBannerDesc').textContent = 'ยืนยันแล้วว่าไม่มีประวัติแพ้ยา · บันทึกโดย Admin · ' + now;
        allergyList = [];
        renderAllergyRecords();
      } else if (status === 'unknown') {
        allergyBanner.className = 'allergy-banner unknown';
        allergyBanner.querySelector('.allergy-banner-icon').className = 'allergy-banner-icon unknown';
        allergyBanner.querySelector('.allergy-banner-icon').innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:22px;height:22px;"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';
        document.getElementById('allergyBannerTitle').textContent = 'Unknown — ไม่ทราบประวัติแพ้ยา';
        document.getElementById('allergyBannerDesc').textContent = 'ยังไม่ได้ซักประวัติ/ผู้ป่วยไม่ทราบ · ระบบจะเตือนทุกยาที่สั่ง · บันทึกโดย Admin · ' + now;
      } else if (status === 'allergy') {
        if (allergyList.length === 0) { alert('กรุณาเพิ่มรายการยาที่แพ้อย่างน้อย 1 รายการ'); return; }
        var drugNames = allergyList.map(function(a) { return a.drug; }).join(', ');
        allergyBanner.className = 'allergy-banner has-allergy';
        allergyBanner.querySelector('.allergy-banner-icon').className = 'allergy-banner-icon allergy';
        allergyBanner.querySelector('.allergy-banner-icon').innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:22px;height:22px;"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';
        document.getElementById('allergyBannerTitle').textContent = 'แพ้ยา — ' + drugNames;
        document.getElementById('allergyBannerDesc').textContent = allergyList.length + ' รายการ · บันทึกโดย Admin · ' + now;
      }

      allergyForm.style.display = 'none';

      var tc = document.getElementById('toastContainer');
      var t = document.createElement('div');
      t.className = 'toast success';
      t.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>บันทึกสถานะแพ้ยาเรียบร้อย</span>';
      tc.appendChild(t);
      setTimeout(function() { t.remove(); }, 3200);
    });
  }

  /* ── Order Entry ── */

  /* Cancel order — delegation on order table */
  var oeTable = document.getElementById('oeOrderList');
  if (oeTable) {
    oeTable.addEventListener('click', function(e) {
      var cancelBtn = e.target.closest('.oe-cancel-btn');
      if (!cancelBtn) return;

      var tr = cancelBtn.closest('tr');
      var statusEl = tr.querySelector('.oe-status');
      var statusText = statusEl ? statusEl.textContent.trim() : '';

      /* Only allow cancel for pending statuses */
      if (statusText !== 'รอตอบรับ' && statusText !== 'รอดำเนินการ') {
        var tc = document.getElementById('toastContainer');
        var tw = document.createElement('div');
        tw.className = 'toast warn';
        tw.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg><span>ไม่สามารถยกเลิกได้ — สถานะ "' + statusText + '" ดำเนินการแล้ว</span>';
        tc.appendChild(tw);
        setTimeout(function() { tw.remove(); }, 3200);
        return;
      }

      /* Confirm cancel */
      var orderDesc = tr.cells[2] ? tr.cells[2].textContent.trim().substring(0, 40) : '';
      if (!confirm('ยกเลิกคำสั่ง "' + orderDesc + '"?\n\nเหตุผล: ___________')) return;

      /* Update status */
      statusEl.className = 'oe-status cancelled';
      statusEl.textContent = 'ยกเลิกแล้ว';
      tr.classList.add('oe-cancelled');
      cancelBtn.remove();

      var tc2 = document.getElementById('toastContainer');
      var ts = document.createElement('div');
      ts.className = 'toast success';
      ts.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>ยกเลิกคำสั่ง "' + orderDesc + '" เรียบร้อย</span>';
      tc2.appendChild(ts);
      setTimeout(function() { ts.remove(); }, 3200);
    });
  }

  var oeNewBtn = document.getElementById('oeNewOrderBtn');
  var oeQuickGrid = document.getElementById('oeQuickGrid');
  var oeFormCard = document.getElementById('oeFormCard');
  var oeFormTitle = document.getElementById('oeFormTitle');
  var oeFormBody = document.getElementById('oeFormBody');
  var oeFormClose = document.getElementById('oeFormClose');
  var oeOrderList = document.getElementById('oeOrderList');

  /* Toggle quick grid */
  if (oeNewBtn) {
    oeNewBtn.addEventListener('click', function() {
      var showing = oeQuickGrid.style.display !== 'none';
      oeQuickGrid.style.display = showing ? 'none' : '';
      oeFormCard.style.display = 'none';
      oeNewBtn.textContent = showing ? '+ สั่งใหม่' : 'ยกเลิก';
    });
  }

  if (oeFormClose) {
    oeFormClose.addEventListener('click', function() {
      oeFormCard.style.display = 'none';
    });
  }

  /* Order form templates */
  var orderForms = {
    lab: {
      title: 'สั่ง Lab',
      body: '<div class="oe-form-section"><div class="nv-label">เลือกรายการ Lab</div>' +
        '<div class="oe-checkbox-list">' +
          '<label class="oe-checkbox"><input type="checkbox" value="CBC">CBC</label>' +
          '<label class="oe-checkbox"><input type="checkbox" value="BMP">BMP</label>' +
          '<label class="oe-checkbox"><input type="checkbox" value="Troponin">Troponin</label>' +
          '<label class="oe-checkbox"><input type="checkbox" value="ABG">ABG</label>' +
          '<label class="oe-checkbox"><input type="checkbox" value="Lactate">Lactate</label>' +
          '<label class="oe-checkbox"><input type="checkbox" value="PT/INR">PT/INR</label>' +
          '<label class="oe-checkbox"><input type="checkbox" value="LFT">LFT</label>' +
          '<label class="oe-checkbox"><input type="checkbox" value="Urinalysis">Urinalysis</label>' +
          '<label class="oe-checkbox"><input type="checkbox" value="Blood Culture">Blood Culture</label>' +
        '</div></div>' +
        '<div class="oe-form-section"><div class="nv-label">ความเร่งด่วน</div>' +
          '<select class="nv-input" name="oePriority"><option value="stat">STAT — ทันที (SLA: 15 นาที)</option><option value="now">NOW — เร่งด่วน (SLA: 30 นาที)</option><option value="urgent">Urgent — ด่วน (SLA: 1 ชม.)</option><option value="routine" selected>Routine — ปกติ (SLA: 4 ชม.)</option></select>' +
        '</div>' +
        '<div class="oe-form-section"><div class="nv-label">หมายเหตุ</div><input type="text" class="nv-input" id="oeLabNote" placeholder="หมายเหตุเพิ่มเติม..."></div>' +
        '<button class="ap-btn primary" id="oeLabSubmit" style="width:100%;">ยืนยันสั่ง Lab</button>'
    },
    xray: {
      title: 'สั่ง X-ray / Imaging',
      body: '<div class="oe-form-section"><div class="nv-label">เลือกรายการ</div>' +
        '<div class="oe-checkbox-list">' +
          '<label class="oe-checkbox"><input type="checkbox" value="CXR">CXR (Chest X-ray)</label>' +
          '<label class="oe-checkbox"><input type="checkbox" value="CT Brain">CT Brain</label>' +
          '<label class="oe-checkbox"><input type="checkbox" value="CT Chest">CT Chest</label>' +
          '<label class="oe-checkbox"><input type="checkbox" value="CT Abdomen">CT Abdomen</label>' +
          '<label class="oe-checkbox"><input type="checkbox" value="USG Abdomen">USG Abdomen</label>' +
          '<label class="oe-checkbox"><input type="checkbox" value="X-ray Extremity">X-ray แขน/ขา</label>' +
        '</div></div>' +
        '<div class="oe-form-section"><div class="nv-label">ความเร่งด่วน</div>' +
          '<select class="nv-input" name="oePriority"><option value="stat">STAT — ทันที (SLA: 15 นาที)</option><option value="now">NOW — เร่งด่วน (SLA: 30 นาที)</option><option value="urgent">Urgent — ด่วน (SLA: 1 ชม.)</option><option value="routine" selected>Routine — ปกติ (SLA: 4 ชม.)</option></select>' +
        '</div>' +
        '<div class="oe-form-section"><div class="nv-label">Clinical indication</div><input type="text" class="nv-input" placeholder="เหตุผลที่สั่ง เช่น R/O pneumonia..."></div>' +
        '<button class="ap-btn primary" id="oeXraySubmit" style="width:100%;">ยืนยันสั่ง Imaging</button>'
    },
    med: {
      title: 'สั่งยา (Medication)',
      body: '<div class="oe-form-section"><div class="nv-label">ชื่อยา</div><input type="text" class="nv-input" id="oeMedName" placeholder="พิมพ์ชื่อยา เช่น Adrenaline, Morphine..." autocomplete="off"></div>' +
        '<div id="oeAllergyWarn" style="display:none;"></div>' +
        '<div class="nv-row" style="display:flex;gap:8px;">' +
          '<div class="nv-field"><div class="nv-label">ขนาด</div><input type="text" class="nv-input" id="oeMedDose" placeholder="เช่น 1 mg"></div>' +
          '<div class="nv-field"><div class="nv-label">วิธีให้</div><select class="nv-input" id="oeMedRoute"><option value="IV">IV</option><option value="IM">IM</option><option value="SC">SC</option><option value="PO">PO</option><option value="IH">Inhale</option><option value="PR">PR</option></select></div>' +
          '<div class="nv-field"><div class="nv-label">ความถี่</div><select class="nv-input" id="oeMedFreq"><option value="stat">Stat (ครั้งเดียว)</option><option value="prn">PRN</option><option value="q4h">ทุก 4 ชม.</option><option value="q6h">ทุก 6 ชม.</option><option value="od">วันละครั้ง</option><option value="drip">Continuous drip</option></select></div>' +
        '</div>' +
        '<div class="oe-form-section" style="margin-top:10px;"><div class="nv-label">หมายเหตุ</div><input type="text" class="nv-input" placeholder="คำแนะนำเพิ่มเติม..."></div>' +
        '<button class="ap-btn primary" id="oeMedSubmit" style="width:100%;margin-top:10px;">ยืนยันสั่งยา</button>'
    },
    procedure: {
      title: 'สั่ง Procedure',
      body: '<div class="oe-form-section"><div class="nv-label">เลือก Procedure</div>' +
        '<div class="oe-checkbox-list">' +
          '<label class="oe-checkbox"><input type="checkbox" value="Intubation">Intubation</label>' +
          '<label class="oe-checkbox"><input type="checkbox" value="Central line">Central line</label>' +
          '<label class="oe-checkbox"><input type="checkbox" value="Chest tube">Chest tube</label>' +
          '<label class="oe-checkbox"><input type="checkbox" value="Suture">Suture แผล</label>' +
          '<label class="oe-checkbox"><input type="checkbox" value="Splint">Splint/Cast</label>' +
          '<label class="oe-checkbox"><input type="checkbox" value="Lumbar puncture">Lumbar puncture</label>' +
        '</div></div>' +
        '<div class="oe-form-section"><div class="nv-label">หมายเหตุ</div><input type="text" class="nv-input" placeholder="รายละเอียดเพิ่มเติม..."></div>' +
        '<button class="ap-btn primary" id="oeProcSubmit" style="width:100%;">ยืนยันสั่ง Procedure</button>'
    },
    consult: {
      title: 'Consult แพทย์เฉพาะทาง',
      body: '<div class="oe-form-section"><div class="nv-label">แผนกที่ต้องการ Consult</div>' +
        '<select class="nv-input" id="oeConsultDept"><option value="">— เลือกแผนก —</option><option value="Cardiology">Cardiology</option><option value="Orthopedics">Orthopedics</option><option value="Surgery">Surgery</option><option value="Medicine">Medicine</option><option value="Neurology">Neurology</option><option value="OB-GYN">OB-GYN</option><option value="Pediatrics">Pediatrics</option><option value="Psychiatry">Psychiatry</option></select>' +
        '</div>' +
        '<div class="oe-form-section"><div class="nv-label">เหตุผลที่ Consult</div><textarea class="nv-textarea" rows="2" placeholder="อาการ / สิ่งที่ต้องการจากแพทย์เฉพาะทาง..." id="oeConsultReason"></textarea></div>' +
        '<div class="oe-form-section"><div class="nv-label">ความเร่งด่วน</div><select class="nv-input" name="oePriority"><option value="stat">STAT — ทันที (SLA: 15 นาที)</option><option value="now">NOW — เร่งด่วน (SLA: 30 นาที)</option><option value="urgent">Urgent — ด่วน (SLA: 1 ชม.)</option><option value="routine" selected>Routine — ปกติ (SLA: 4 ชม.)</option></select></div>' +
        '<button class="ap-btn primary" id="oeConsultSubmit" style="width:100%;">ส่ง Consult</button>'
    },
    observe: {
      title: 'สั่ง Observe',
      body: '<div class="oe-form-section"><div class="nv-label">ระยะเวลา Observe</div>' +
        '<select class="nv-input" id="oeObsTime"><option value="2h">2 ชั่วโมง</option><option value="4h">4 ชั่วโมง</option><option value="6h">6 ชั่วโมง</option><option value="12h">12 ชั่วโมง</option><option value="24h">24 ชั่วโมง</option></select>' +
        '</div>' +
        '<div class="oe-form-section"><div class="nv-label">สิ่งที่ต้อง Monitor</div>' +
        '<div class="oe-checkbox-list">' +
          '<label class="oe-checkbox"><input type="checkbox" value="Vital q1h" checked>Vital signs ทุก 1 ชม.</label>' +
          '<label class="oe-checkbox"><input type="checkbox" value="Neuro check">Neuro check</label>' +
          '<label class="oe-checkbox"><input type="checkbox" value="I/O">I/O (intake/output)</label>' +
          '<label class="oe-checkbox"><input type="checkbox" value="Pain score">Pain score</label>' +
          '<label class="oe-checkbox"><input type="checkbox" value="ECG monitor">ECG monitoring</label>' +
          '<label class="oe-checkbox"><input type="checkbox" value="SpO2 monitor">SpO2 continuous</label>' +
        '</div></div>' +
        '<div class="oe-form-section"><div class="nv-label">หมายเหตุ</div><input type="text" class="nv-input" placeholder="คำแนะนำเพิ่มเติม..."></div>' +
        '<button class="ap-btn primary" id="oeObsSubmit" style="width:100%;">สั่ง Observe</button>'
    },
    admit: {
      title: 'สั่ง Admit',
      body: '<div class="oe-form-section"><div class="nv-label">Ward ปลายทาง</div>' +
        '<select class="nv-input" id="oeAdmitWard"><option value="">— เลือก Ward —</option><option value="5A">Ward 5A (อายุรกรรม)</option><option value="5B">Ward 5B (ศัลยกรรม)</option><option value="ICU">ICU</option><option value="CCU">CCU</option><option value="NICU">NICU</option></select>' +
        '</div>' +
        '<div class="oe-form-section"><div class="nv-label">Diagnosis</div><input type="text" class="nv-input" id="oeAdmitDx" placeholder="เช่น STEMI, Cardiac arrest post-ROSC"></div>' +
        '<div class="oe-form-section"><div class="nv-label">เหตุผลที่ Admit</div><textarea class="nv-textarea" rows="2" placeholder="สรุปอาการและเหตุผล..." id="oeAdmitReason"></textarea></div>' +
        '<button class="ap-btn primary" id="oeAdmitSubmit" style="width:100%;">ยืนยัน Admit</button>'
    },
    refer: {
      title: 'Refer / ส่งต่อ',
      body: '<div class="oe-form-section"><div class="nv-label">ส่งต่อไปยัง</div>' +
        '<select class="nv-input" id="oeReferDest"><option value="">— เลือกปลายทาง —</option><option value="รพ.ศูนย์">โรงพยาบาลศูนย์</option><option value="รพ.มหาวิทยาลัย">โรงพยาบาลมหาวิทยาลัย</option><option value="รพ.เฉพาะทาง">โรงพยาบาลเฉพาะทาง</option></select>' +
        '</div>' +
        '<div class="oe-form-section"><div class="nv-label">เหตุผลที่ Refer</div><textarea class="nv-textarea" rows="2" placeholder="เช่น ต้องการ Cath Lab, ต้องการ Neurosurgeon..." id="oeReferReason"></textarea></div>' +
        '<div class="oe-form-section"><div class="nv-label">ความเร่งด่วน</div><select class="nv-input" name="oePriority"><option value="stat">STAT — ทันที (SLA: 15 นาที)</option><option value="now">NOW — เร่งด่วน (SLA: 30 นาที)</option><option value="urgent">Urgent — ด่วน (SLA: 1 ชม.)</option><option value="routine" selected>Routine — ปกติ (SLA: 4 ชม.)</option></select></div>' +
        '<button class="ap-btn primary" id="oeReferSubmit" style="width:100%;">ส่ง Refer</button>'
    }
  };

  /* Quick button → show form */
  document.querySelectorAll('.oe-quick-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var type = btn.dataset.type;
      var form = orderForms[type];
      if (!form) return;
      oeFormTitle.textContent = form.title;
      oeFormBody.innerHTML = form.body;
      oeFormCard.style.display = '';
      oeQuickGrid.style.display = 'none';
      oeNewBtn.textContent = '+ สั่งใหม่';

      /* Allergy check for med orders */
      if (type === 'med') {
        var medInput = document.getElementById('oeMedName');
        var allergyWarn = document.getElementById('oeAllergyWarn');
        /* Patient allergy data from ERStore */
        var _currentPt = hnParam ? ERStore.getPatient(hnParam) : null;
        var patientAllergies = (_currentPt && _currentPt.allergy === 'allergy' && _currentPt.allergyList) ? _currentPt.allergyList.map(function(a){return a.toLowerCase();}) : [];
        /* Cross-reactivity groups */
        var crossReact = {
          'aspirin': ['nsaid', 'ibuprofen', 'diclofenac', 'naproxen', 'ketorolac', 'piroxicam'],
          'penicillin': ['amoxicillin', 'ampicillin', 'augmentin', 'piperacillin'],
          'sulfa': ['sulfasalazine', 'co-trimoxazole', 'bactrim']
        };
        /* Flatten cross-react */
        var allAllergens = patientAllergies.slice();
        patientAllergies.forEach(function(a) {
          if (crossReact[a]) crossReact[a].forEach(function(cr) { if (allAllergens.indexOf(cr) === -1) allAllergens.push(cr); });
        });

        /* Contraindications (demo: Cardiac arrest patient) */
        var contraindications = {
          'metformin': 'ห้ามใช้ใน Cardiac arrest / Lactic acidosis (ผู้ป่วย Lactate 12.5)',
          'beta-blocker': 'ห้ามใช้ใน Cardiogenic shock / BP ต่ำ (BP 85/60)',
          'atenolol': 'ห้ามใช้ใน Cardiogenic shock / Bradycardia',
          'propranolol': 'ห้ามใช้ใน Acute heart failure',
          'nsaid': 'ห้ามใช้ใน ACS / GI bleeding risk / CKD (Cr 4.8)'
        };

        /* Existing orders from ERStore */
        var _ptOrders = hnParam ? ERStore.getOrders(hnParam) : [];
        var existingOrders = _ptOrders.filter(function(o){return o.type==='med'&&(o.status==='active'||o.status==='done');}).map(function(o){return o.desc.toLowerCase().split(' ')[0];});

        /* Drug interactions */
        var interactions = {
          'warfarin': [{ drug:'heparin', severity:'major', desc:'เพิ่มความเสี่ยงเลือดออกรุนแรง (ผู้ป่วยได้ Heparin อยู่)' }],
          'heparin': [{ drug:'heparin', severity:'duplicate', desc:'Heparin สั่งซ้ำ — ผู้ป่วยได้ Heparin 5000u IV อยู่แล้ว (14:40)' }],
          'enoxaparin': [{ drug:'heparin', severity:'major', desc:'ห้ามให้ร่วมกับ Heparin — เสี่ยงเลือดออก' }],
          'adrenaline': [{ drug:'adrenaline', severity:'duplicate', desc:'Adrenaline สั่งซ้ำ — ผู้ป่วยได้ Adrenaline drip อยู่แล้ว (14:34)' }],
          'dopamine': [{ drug:'adrenaline', severity:'moderate', desc:'อาจเกิด excessive catecholamine effect ร่วมกับ Adrenaline drip' }],
          'alteplase': [{ drug:'heparin', severity:'major', desc:'เพิ่มความเสี่ยงเลือดออกรุนแรงร่วมกับ Heparin' }]
        };

        if (medInput && allergyWarn) {
          medInput.addEventListener('input', function() {
            var val = medInput.value.trim().toLowerCase();
            if (val.length < 2) { allergyWarn.style.display = 'none'; allergyWarn.innerHTML = ''; return; }

            var warnings = [];

            /* 1. Allergy check */
            var allergyMatched = allAllergens.filter(function(a) { return val.indexOf(a) > -1 || a.indexOf(val) > -1; });
            if (allergyMatched.length > 0) {
              warnings.push('<div class="oe-safety-item danger"><div class="oe-safety-badge danger">แพ้ยา</div><div class="oe-safety-body"><strong>ผู้ป่วยแพ้: ' + patientAllergies.join(', ') + '</strong><br>ยา "' + medInput.value + '" เกี่ยวข้องกับ: ' + allergyMatched.join(', ') + '</div></div>');
            }

            /* 2. Contraindication check */
            Object.keys(contraindications).forEach(function(drug) {
              if (val.indexOf(drug) > -1 || drug.indexOf(val) > -1) {
                warnings.push('<div class="oe-safety-item danger"><div class="oe-safety-badge contra">ข้อห้ามใช้</div><div class="oe-safety-body"><strong>' + drug + '</strong> — ' + contraindications[drug] + '</div></div>');
              }
            });

            /* 3. Duplicate order check */
            existingOrders.forEach(function(existing) {
              if (val.indexOf(existing) > -1 || existing.indexOf(val) > -1) {
                var inter = interactions[val];
                var isDup = inter && inter.some(function(i) { return i.severity === 'duplicate'; });
                if (isDup) {
                  var dupInfo = inter.find(function(i) { return i.severity === 'duplicate'; });
                  warnings.push('<div class="oe-safety-item warn"><div class="oe-safety-badge duplicate">คำสั่งซ้ำ</div><div class="oe-safety-body">' + dupInfo.desc + '</div></div>');
                }
              }
            });

            /* 4. Drug interaction check (only if patient has the interacting drug) */
            if (interactions[val]) {
              interactions[val].forEach(function(inter) {
                if (inter.severity !== 'duplicate') {
                  var hasInteracting = existingOrders.some(function(ex){return inter.drug.indexOf(ex)>-1||ex.indexOf(inter.drug)>-1;});
                  if (hasInteracting) {
                    var sevClass = inter.severity === 'major' ? 'danger' : 'warn';
                    var sevLabel = inter.severity === 'major' ? 'Major' : 'Moderate';
                    warnings.push('<div class="oe-safety-item ' + sevClass + '"><div class="oe-safety-badge interaction-' + inter.severity + '">Drug Interaction (' + sevLabel + ')</div><div class="oe-safety-body">' + inter.desc + '</div></div>');
                  }
                }
              });
            }

            /* Render warnings */
            if (warnings.length > 0) {
              allergyWarn.style.display = '';
              allergyWarn.innerHTML = '<div class="oe-safety-panel">' +
                '<div class="oe-safety-header"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> ตรวจสอบความปลอดภัย — พบ ' + warnings.length + ' รายการ</div>' +
                warnings.join('') +
                '<label class="oe-allergy-override"><input type="checkbox" id="oeAllergyOverride"> ฉันรับทราบความเสี่ยงทั้งหมดและยืนยันสั่งยานี้ (Override)</label>' +
              '</div>';
            } else {
              allergyWarn.style.display = 'none';
              allergyWarn.innerHTML = '';
            }
          });
        }
      }

      /* Bind submit for this form */
      var submitBtn = oeFormCard.querySelector('[id$="Submit"]');
      if (submitBtn) {
        submitBtn.addEventListener('click', function() {
          /* Allergy block check */
          var allergyWarnEl = document.getElementById('oeAllergyWarn');
          if (allergyWarnEl && allergyWarnEl.style.display !== 'none' && allergyWarnEl.innerHTML) {
            var overrideChk = document.getElementById('oeAllergyOverride');
            if (!overrideChk || !overrideChk.checked) {
              var toastC = document.getElementById('toastContainer');
              var tw = document.createElement('div');
              tw.className = 'toast warn';
              tw.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg><span>กรุณายืนยัน Override แพ้ยาก่อนสั่ง</span>';
              toastC.appendChild(tw);
              setTimeout(function() { tw.remove(); }, 3200);
              return;
            }
          }
          var items = [];
          oeFormCard.querySelectorAll('input[type="checkbox"]:checked').forEach(function(cb) { items.push(cb.value); });
          var desc = items.length > 0 ? items.join(', ') : (oeFormCard.querySelector('input[type="text"]') || {}).value || form.title;
          var dept = (oeFormCard.querySelector('select:not([name="oePriority"])') || {}).value || '';

          /* Get priority */
          var prioritySel = oeFormCard.querySelector('select[name="oePriority"]');
          var priority = prioritySel ? prioritySel.value : 'routine';
          var priorityLabels = { stat:'STAT', now:'NOW', urgent:'Urgent', routine:'Routine' };
          var priorityClasses = { stat:'stat', now:'now', urgent:'urgent-pri', routine:'routine-pri' };
          var prioritySLA = { stat:'15 นาที', now:'30 นาที', urgent:'1 ชม.', routine:'4 ชม.' };

          /* Save order to ERStore */
          if (hnParam) {
            ERStore.addOrder(hnParam, { type:type, desc:desc, priority:priority, status:'pending' });
          }

          /* Add to order list */
          var now = new Date().toLocaleTimeString('th-TH', {hour12:false, hour:'2-digit', minute:'2-digit'});
          var newRow = document.createElement('tr');
          newRow.innerHTML = '<td>' + now + '</td>' +
            '<td><span class="oe-type-badge ' + type + '">' + form.title.replace('สั่ง ','').replace('Consult แพทย์เฉพาะทาง','Consult') + '</span></td>' +
            '<td>' + desc + (dept ? '<div class="pl-hn">' + dept + '</div>' : '') + '</td>' +
            '<td><span class="oe-priority ' + priorityClasses[priority] + '">' + priorityLabels[priority] + '</span><div style="font-size:9px;color:var(--slate-400);">SLA: ' + prioritySLA[priority] + '</div></td>' +
            '<td><span class="oe-status pending">รอดำเนินการ</span></td>' +
            '<td>Admin</td>' +
            '<td><button class="oe-cancel-btn">ยกเลิก</button></td>';
          oeOrderList.insertBefore(newRow, oeOrderList.firstChild);

          oeFormCard.style.display = 'none';

          var toastContainer = document.getElementById('toastContainer');
          var t = document.createElement('div');
          t.className = 'toast success';
          t.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>[' + priorityLabels[priority] + '] สั่ง ' + form.title + ' — ' + desc + ' (SLA: ' + prioritySLA[priority] + ')</span>';
          toastContainer.appendChild(t);
          setTimeout(function() { t.remove(); }, 3200);
        });
      }
    });
  });

  /* ══════════════════════════════════════════════════
     Transport Request System
     ══════════════════════════════════════════════════ */

  var trModal = document.getElementById('transportModal');
  var trOpenBtn = document.getElementById('trOpenModal');
  var trCloseBtn = document.getElementById('trCloseBtn');
  var trCancelBtn = document.getElementById('trCancelBtn');
  var trSubmitBtn = document.getElementById('trSubmitBtn');
  var trPatientInfo = document.getElementById('trPatientInfo');
  var trDestGrid = document.getElementById('trDestGrid');
  var trDestField = document.getElementById('trDestField');
  var trDestSelect = document.getElementById('trDestSelect');
  var trActiveBanner = document.getElementById('trActiveBanner');
  var trSelectedDest = null;

  /* Destination options */
  var trDestOptions = {
    ward: ['Ward 5A (อายุรกรรม)','Ward 5B (ศัลยกรรม)','Ward 6A (สูติ-นรีเวช)','Ward 6B (กุมารเวชกรรม)','Ward 7A (ออร์โธปิดิกส์)'],
    imaging: ['X-ray Room 1','X-ray Room 2','CT Room 1','CT Room 2','MRI Room','USG Room 1','USG Room 2','Cath Lab','Angiography Suite'],
    lab: ['ห้อง Lab ชั้น 1','ห้อง Lab ฉุกเฉิน','Blood Bank'],
    or: ['OR 1','OR 2','OR 3','OR 4 (ฉุกเฉิน)','Minor OR'],
    icu: ['ICU','CCU','NICU','MICU','SICU'],
    refer: ['จุดจอดรถ Refer หน้า ER','ลานจอด Helicopter','จุดรับ-ส่ง ER Gate 2'],
    other: ['ห้องตรวจพิเศษ','หอผู้ป่วยพิเศษ','ห้องพักฟื้น','อื่นๆ (ระบุในหมายเหตุ)']
  };

  /* Open modal */
  if (trOpenBtn && trModal) {
    trOpenBtn.addEventListener('click', function(e) {
      e.preventDefault();
      if (!hnParam) return;
      var pt = ERStore.getPatient(hnParam);
      if (!pt) return;

      /* Fill patient info */
      var lvBg = {'1':'var(--red-100)','2':'var(--orange-bg)','3':'var(--warn-bg)','4':'var(--green-bg)','5':'var(--blue-bg)'};
      var lvClr = {'1':'var(--red-600)','2':'var(--orange)','3':'var(--warn)','4':'var(--green)','5':'var(--blue)'};
      trPatientInfo.innerHTML =
        '<div class="tr-pb-avatar" style="background:' + (lvBg[pt.level]||'var(--slate-100)') + ';color:' + (lvClr[pt.level]||'var(--slate-600)') + ';">' + pt.name.substring(0,2) + '</div>' +
        '<div class="tr-pb-info"><div class="tr-pb-name">' + pt.name + '</div><div class="tr-pb-detail">HN ' + pt.hn + ' · ' + pt.gender + ' ' + pt.age + ' ปี · ' + (pt.levelName||'') + (pt.bed && pt.bed !== '—' ? ' · เตียง ' + pt.bed : '') + '</div></div>' +
        '<span class="tr-pri ' + (pt.level <= '2' ? 'emergency' : 'urgent') + '">' + (pt.levelName||'') + '</span>';

      /* Reset form */
      trSelectedDest = null;
      trDestField.style.display = 'none';
      trDestGrid.querySelectorAll('.tr-dest-btn').forEach(function(b) { b.classList.remove('active'); });
      document.getElementById('trNote').value = '';
      trModal.style.display = 'flex';
    });
  }

  /* Close modal */
  function closeTrModal() { if (trModal) trModal.style.display = 'none'; }
  if (trCloseBtn) trCloseBtn.addEventListener('click', closeTrModal);
  if (trCancelBtn) trCancelBtn.addEventListener('click', closeTrModal);
  if (trModal) trModal.addEventListener('click', function(e) { if (e.target === trModal) closeTrModal(); });

  /* Destination type selection */
  if (trDestGrid) {
    trDestGrid.addEventListener('click', function(e) {
      var btn = e.target.closest('.tr-dest-btn');
      if (!btn) return;
      trDestGrid.querySelectorAll('.tr-dest-btn').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      trSelectedDest = btn.dataset.dest;

      /* Populate destination dropdown */
      var opts = trDestOptions[trSelectedDest] || [];
      trDestSelect.innerHTML = '<option value="">— เลือก —</option>';
      opts.forEach(function(o) {
        var opt = document.createElement('option');
        opt.value = o; opt.textContent = o;
        trDestSelect.appendChild(opt);
      });
      trDestField.style.display = '';
    });
  }

  /* Submit transport request */
  if (trSubmitBtn) {
    trSubmitBtn.addEventListener('click', function() {
      if (!trSelectedDest) {
        alert('กรุณาเลือกจุดหมายปลายทาง');
        return;
      }
      var dest = trDestSelect.value;
      if (!dest) {
        alert('กรุณาระบุปลายทาง');
        return;
      }

      var pt = hnParam ? ERStore.getPatient(hnParam) : null;
      if (!pt) return;

      var priority = (document.querySelector('input[name="trPriority"]:checked') || {}).value || 'urgent';
      var equipment = [];
      trModal.querySelectorAll('.tr-equip-grid input:checked').forEach(function(cb) { equipment.push(cb.value); });
      var isolation = document.getElementById('trIsolation').value;
      var note = document.getElementById('trNote').value.trim();
      var porterCount = document.getElementById('trPorterCount').value;

      var fromZone = (pt.zone || 'ER') + (pt.bed && pt.bed !== '—' ? ' · ' + pt.bed : '');

      ERStore.addTransport({
        hn: pt.hn,
        patient: pt.name,
        from: fromZone,
        destType: trSelectedDest,
        dest: dest,
        priority: priority,
        equipment: equipment,
        isolation: isolation,
        note: note + (porterCount > 1 ? ' [ขอ Porter ' + porterCount + ' คน]' : '')
      });

      closeTrModal();
      renderTransportBanner();

      var tc = document.getElementById('toastContainer');
      var t = document.createElement('div');
      t.className = 'toast success';
      var priLabels = {emergency:'ฉุกเฉิน',urgent:'ด่วน',normal:'ปกติ'};
      t.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>ส่งคำขอ Porter — ' + dest + ' (' + (priLabels[priority]||priority) + ')</span>';
      tc.appendChild(t);
      setTimeout(function() { t.remove(); }, 3200);
    });
  }

  /* Render active transport banner */
  function renderTransportBanner() {
    if (!trActiveBanner || !hnParam) return;
    var transports = ERStore.getTransports(hnParam);
    var active = transports.filter(function(t) { return t.status === 'pending' || t.status === 'accepted' || t.status === 'in_transit'; });

    if (active.length === 0) {
      trActiveBanner.style.display = 'none';
      return;
    }

    var tr = active[0]; /* Show most recent active */
    var statusLabels = {pending:'รอ Porter',accepted:'Porter รับงาน',in_transit:'กำลังเคลื่อนย้าย'};
    var priLabels = {emergency:'ฉุกเฉิน',urgent:'ด่วน',normal:'ปกติ'};
    var arrowSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:20px;height:20px;"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/></svg>';

    trActiveBanner.className = 'tr-active-banner status-' + tr.status;
    trActiveBanner.style.display = 'flex';

    var actions = '';
    if (tr.status === 'pending') {
      actions = '<button class="ap-btn outline tr-demo-accept" data-trid="' + tr.id + '" style="font-size:11px;padding:6px 12px;">Demo: Porter รับ</button>' +
                '<button class="ap-btn outline tr-demo-cancel" data-trid="' + tr.id + '" style="font-size:11px;padding:6px 10px;color:var(--red-500);">ยกเลิก</button>';
    } else if (tr.status === 'accepted') {
      actions = '<button class="ap-btn outline tr-demo-start" data-trid="' + tr.id + '" style="font-size:11px;padding:6px 12px;">Demo: เริ่มย้าย</button>';
    } else if (tr.status === 'in_transit') {
      actions = '<button class="ap-btn primary tr-demo-complete" data-trid="' + tr.id + '" style="font-size:11px;padding:6px 12px;">ยืนยันถึงจุดหมาย</button>';
    }

    trActiveBanner.innerHTML =
      '<div class="tr-banner-icon ' + tr.status + '">' + arrowSvg + '</div>' +
      '<div class="tr-banner-body">' +
        '<div class="tr-banner-title">' + (statusLabels[tr.status]||'') + ' → ' + tr.dest + '</div>' +
        '<div class="tr-banner-detail">' +
          '<span class="tr-pri ' + tr.priority + '">' + (priLabels[tr.priority]||'') + '</span> · ' +
          (tr.porter ? 'Porter: ' + tr.porter + ' · ' : '') +
          'ขอเมื่อ ' + tr.requestTime +
          (tr.equipment && tr.equipment.length ? ' · อุปกรณ์: ' + tr.equipment.join(', ') : '') +
        '</div>' +
      '</div>' +
      '<div class="tr-banner-actions">' + actions + '</div>';
  }

  /* Banner action delegation */
  if (trActiveBanner) {
    trActiveBanner.addEventListener('click', function(e) {
      var btn = e.target.closest('button');
      if (!btn) return;
      var trId = btn.dataset.trid;
      if (!trId) return;
      var now = new Date().toLocaleTimeString('th-TH', {hour12:false, hour:'2-digit', minute:'2-digit'});
      var porterNames = ['สมชาย (Porter)','วิชัย (Porter)','ประเสริฐ (Porter)'];
      var randomPorter = porterNames[Math.floor(Math.random() * porterNames.length)];

      if (btn.classList.contains('tr-demo-accept')) {
        ERStore.updateTransport(trId, {status:'accepted', porter:randomPorter, acceptTime:now});
      } else if (btn.classList.contains('tr-demo-start')) {
        ERStore.updateTransport(trId, {status:'in_transit', startTime:now});
      } else if (btn.classList.contains('tr-demo-complete')) {
        ERStore.updateTransport(trId, {status:'completed', completeTime:now});
        var tc = document.getElementById('toastContainer');
        var t = document.createElement('div');
        t.className = 'toast success';
        t.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>ผู้ป่วยถึงจุดหมายเรียบร้อย</span>';
        tc.appendChild(t);
        setTimeout(function() { t.remove(); }, 3200);
      } else if (btn.classList.contains('tr-demo-cancel')) {
        if (!confirm('ยกเลิกการเรียก Porter?')) return;
        ERStore.updateTransport(trId, {status:'cancelled'});
      }
      renderTransportBanner();
    });
  }

  /* Initial render */
  renderTransportBanner();

  /* ══════════════════════════════════════════════════
     Consult Request System
     ══════════════════════════════════════════════════ */

  var conModal = document.getElementById('consultModal');
  var conOpenBtn = document.getElementById('conOpenModal');
  var conCloseBtn = document.getElementById('conCloseBtn');
  var conCancelBtn = document.getElementById('conCancelBtn');
  var conSubmitBtn = document.getElementById('conSubmitBtn');
  var conSpecGrid = document.getElementById('conSpecGrid');
  var conActiveBanner = document.getElementById('conActiveBanner');
  var conSelectedSpec = null;

  /* Open modal */
  if (conOpenBtn && conModal) {
    conOpenBtn.addEventListener('click', function(e) {
      e.preventDefault();
      if (!hnParam) return;
      var pt = ERStore.getPatient(hnParam);
      if (!pt) return;

      var lvBg = {'1':'var(--red-100)','2':'var(--orange-bg)','3':'var(--warn-bg)','4':'var(--green-bg)','5':'var(--blue-bg)'};
      var lvClr = {'1':'var(--red-600)','2':'var(--orange)','3':'var(--warn)','4':'var(--green)','5':'var(--blue)'};
      document.getElementById('conPatientInfo').innerHTML =
        '<div class="tr-pb-avatar" style="background:' + (lvBg[pt.level]||'var(--slate-100)') + ';color:' + (lvClr[pt.level]||'') + ';">' + pt.name.substring(0,2) + '</div>' +
        '<div class="tr-pb-info"><div class="tr-pb-name">' + pt.name + '</div><div class="tr-pb-detail">HN ' + pt.hn + ' · ' + pt.gender + ' ' + pt.age + ' ปี · ' + (pt.cc||'') + '</div></div>';

      /* Auto-fill clinical info from patient data */
      var clinInfo = 'BP ' + (pt.bp||'—') + ' · HR ' + (pt.hr||'—') + ' · SpO2 ' + (pt.spo2||'—') + '% · GCS ' + (pt.gcs||'—');
      document.getElementById('conClinicalInfo').value = clinInfo;
      document.getElementById('conErDx').value = pt.cc || '';

      /* Reset */
      conSelectedSpec = null;
      conSpecGrid.querySelectorAll('.con-spec-btn').forEach(function(b) { b.classList.remove('active'); });
      document.getElementById('conReason').value = '';
      conModal.style.display = 'flex';
    });
  }

  /* Close modal */
  function closeConModal() { if (conModal) conModal.style.display = 'none'; }
  if (conCloseBtn) conCloseBtn.addEventListener('click', closeConModal);
  if (conCancelBtn) conCancelBtn.addEventListener('click', closeConModal);
  if (conModal) conModal.addEventListener('click', function(e) { if (e.target === conModal) closeConModal(); });

  /* Specialty selection */
  if (conSpecGrid) {
    conSpecGrid.addEventListener('click', function(e) {
      var btn = e.target.closest('.con-spec-btn');
      if (!btn) return;
      conSpecGrid.querySelectorAll('.con-spec-btn').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      conSelectedSpec = btn.dataset.spec;
    });
  }

  /* Submit consult */
  if (conSubmitBtn) {
    conSubmitBtn.addEventListener('click', function() {
      if (!conSelectedSpec) { alert('กรุณาเลือก Specialty'); return; }
      var reason = document.getElementById('conReason').value.trim();
      if (!reason) { alert('กรุณาระบุเหตุผลที่ Consult'); return; }

      var pt = hnParam ? ERStore.getPatient(hnParam) : null;
      if (!pt) return;

      var urgency = (document.querySelector('input[name="conUrgency"]:checked') || {}).value || 'urgent';
      var clinicalInfo = document.getElementById('conClinicalInfo').value.trim();
      var erDx = document.getElementById('conErDx').value.trim();
      var needType = document.getElementById('conNeedType').value;
      var contactExt = document.getElementById('conContactExt').value.trim();

      ERStore.addConsult({
        hn: pt.hn,
        patient: pt.name,
        specialty: conSelectedSpec,
        urgency: urgency,
        reason: reason,
        clinicalInfo: clinicalInfo,
        erDx: erDx,
        needType: needType,
        contactExt: contactExt
      });

      /* Also add as order for timeline tracking */
      ERStore.addOrder(pt.hn, {
        type: 'consult',
        desc: conSelectedSpec + ' consult — ' + reason.substring(0, 50),
        priority: urgency === 'emergent' ? 'stat' : urgency === 'urgent' ? 'now' : 'routine',
        status: 'pending'
      });

      closeConModal();
      renderConsultBanner();

      var urgLabels = {emergent:'ฉุกเฉิน',urgent:'ด่วน',routine:'ปกติ'};
      var tc = document.getElementById('toastContainer');
      var t = document.createElement('div');
      t.className = 'toast success';
      t.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>ส่ง Consult ' + conSelectedSpec + ' (' + (urgLabels[urgency]||urgency) + ') เรียบร้อย</span>';
      tc.appendChild(t);
      setTimeout(function() { t.remove(); }, 3200);
    });
  }

  /* Render active consult banners */
  function renderConsultBanner() {
    if (!conActiveBanner || !hnParam) return;
    var consults = ERStore.getConsults(hnParam);
    var active = consults.filter(function(c) { return c.status !== 'noted' && c.status !== 'declined'; });

    if (active.length === 0) {
      conActiveBanner.style.display = 'none';
      return;
    }

    conActiveBanner.style.display = '';
    var urgLabels = {emergent:'Emergent',urgent:'Urgent',routine:'Routine'};
    var urgClass = {emergent:'emergency',urgent:'urgent',routine:'normal'};
    var statusLabels = {sent:'ส่งแล้ว · รอรับ',received:'รับทราบแล้ว',accepted:'ตอบรับ · กำลังมา',seeing:'กำลังดูผู้ป่วย',noted:'เขียน Note แล้ว',declined:'ปฏิเสธ'};
    var steps = ['sent','received','accepted','seeing','noted'];
    var stepLabels = {sent:'ส่ง',received:'รับทราบ',accepted:'ตอบรับ',seeing:'มาดู',noted:'Note'};
    var needLabels = {evaluate:'ประเมิน',co_manage:'ร่วมดูแล',operate:'ผ่าตัด',transfer:'รับย้าย',opinion:'ขอความเห็น'};

    var html = '';
    active.forEach(function(c) {
      var stepIdx = steps.indexOf(c.status);

      html += '<div class="con-card">' +
        '<div class="con-card-hd">' +
          '<span class="con-spec-icon" style="background:var(--warn-bg);color:var(--warn);width:32px;height:32px;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;font-weight:800;font-size:11px;">' + c.specialty.substring(0,2) + '</span>' +
          '<span class="con-card-spec">' + c.specialty + ' Consult</span>' +
          '<span class="con-card-urgency"><span class="tr-pri ' + (urgClass[c.urgency]||'') + '">' + (urgLabels[c.urgency]||c.urgency) + '</span></span>' +
        '</div>' +
        '<div class="con-detail">' +
          '<strong>เหตุผล:</strong> ' + c.reason + '<br>' +
          (c.specialist ? '<strong>Specialist:</strong> ' + c.specialist + (c.eta ? ' · ETA ~' + c.eta + ' นาที' : '') + '<br>' : '') +
          '<strong>สถานะ:</strong> ' + (statusLabels[c.status]||c.status) + ' · ส่งเมื่อ ' + c.requestTime +
        '</div>' +
        '<div class="con-lifecycle">';

      steps.forEach(function(s, i) {
        var cls = i < stepIdx ? 'done' : i === stepIdx ? 'current' : '';
        html += '<div class="con-step ' + cls + '">' + (stepLabels[s]||s) + '</div>';
      });

      html += '</div>';

      /* Action buttons — demo step + shortcut to write note */
      var actions = '';
      if (c.status === 'sent') {
        actions = '<button class="ap-btn outline con-demo-btn" data-conid="' + c.id + '" data-action="received" style="font-size:11px;padding:6px 10px;">Demo: รับทราบ</button>';
      } else if (c.status === 'received') {
        actions = '<button class="ap-btn outline con-demo-btn" data-conid="' + c.id + '" data-action="accepted" style="font-size:11px;padding:6px 10px;">Demo: ตอบรับ</button>';
      } else if (c.status === 'accepted') {
        actions = '<button class="ap-btn outline con-demo-btn" data-conid="' + c.id + '" data-action="seeing" style="font-size:11px;padding:6px 10px;">Demo: มาถึง</button>';
      }
      /* Always show "เขียน Note" shortcut for non-seeing statuses too */
      if (c.status === 'seeing') {
        actions += '<button class="ap-btn primary con-note-btn" data-conid="' + c.id + '" style="background:var(--green);font-size:11px;padding:6px 12px;">เขียน Consult Note</button>';
      } else {
        actions += '<button class="ap-btn outline con-note-btn" data-conid="' + c.id + '" style="font-size:11px;padding:6px 10px;color:var(--green);border-color:var(--green);">ข้ามไปเขียน Note</button>';
      }
      if (actions) html += '<div class="con-card-actions">' + actions + '</div>';
      html += '</div>';
    });

    conActiveBanner.innerHTML = html;
  }

  /* Consult banner action delegation */
  if (conActiveBanner) {
    conActiveBanner.addEventListener('click', function(e) {
      var btn = e.target.closest('.con-demo-btn');
      if (!btn) return;
      var conId = btn.dataset.conid;
      var action = btn.dataset.action;
      if (!conId || !action) return;
      var now = new Date().toLocaleTimeString('th-TH', {hour12:false, hour:'2-digit', minute:'2-digit'});

      var specNames = ['นพ.กิตติ','พญ.สุภาพร','นพ.ธนา','พญ.วิลาวัณย์','นพ.ภูมิ'];
      var randomSpec = specNames[Math.floor(Math.random() * specNames.length)];

      var changes = {};
      if (action === 'received') {
        changes = {status:'received', receivedTime:now, receivedBy:'เลขาแผนก'};
      } else if (action === 'accepted') {
        changes = {status:'accepted', acceptedTime:now, specialist:randomSpec + ' (on-call)', eta:Math.floor(Math.random()*15)+5};
      } else if (action === 'seeing') {
        changes = {status:'seeing', seenTime:now};
      }

      ERStore.updateConsult(conId, changes);
      renderConsultBanner();
      renderConsultNotes();
    });

    /* "เขียน Consult Note" / "ข้ามไปเขียน Note" button → auto-advance + open modal */
    conActiveBanner.addEventListener('click', function(e) {
      var noteBtn = e.target.closest('.con-note-btn');
      if (!noteBtn) return;
      var conId = noteBtn.dataset.conid;
      var now = new Date().toLocaleTimeString('th-TH', {hour12:false, hour:'2-digit', minute:'2-digit'});

      /* Auto-advance to "seeing" if not already */
      var consults = ERStore.getConsults();
      var con = null;
      consults.forEach(function(c) { if (c.id === conId) con = c; });
      if (con && con.status !== 'seeing') {
        var specNames = ['นพ.กิตติ','พญ.สุภาพร','นพ.ธนา','พญ.วิลาวัณย์'];
        var spec = specNames[Math.floor(Math.random() * specNames.length)] + ' (on-call)';
        ERStore.updateConsult(conId, {
          status:'seeing', seenTime:now,
          receivedTime: con.receivedTime || now, receivedBy: con.receivedBy || 'เลขาแผนก',
          acceptedTime: con.acceptedTime || now, specialist: con.specialist || spec
        });
        renderConsultBanner();
      }

      openConsultNoteModal(conId);
    });
  }

  /* ── Consult Note Modal ── */
  var cnModal = document.getElementById('consultNoteModal');
  var cnCloseBtn = document.getElementById('cnCloseBtn');
  var cnCancelBtn = document.getElementById('cnCancelBtn');
  var cnSubmitBtn = document.getElementById('cnSubmitBtn');
  var cnAddRecBtn = document.getElementById('cnAddRec');
  var cnAddRecRow = document.getElementById('cnAddRecRow');
  var cnRecConfirm = document.getElementById('cnRecConfirm');
  var cnRecsContainer = document.getElementById('cnRecommendations');
  var cnCurrentConId = null;
  var cnTempRecs = [];

  function closeCnModal() { if (cnModal) cnModal.style.display = 'none'; }
  if (cnCloseBtn) cnCloseBtn.addEventListener('click', closeCnModal);
  if (cnCancelBtn) cnCancelBtn.addEventListener('click', closeCnModal);
  if (cnModal) cnModal.addEventListener('click', function(e) { if (e.target === cnModal) closeCnModal(); });

  function openConsultNoteModal(conId) {
    if (!cnModal) return;
    cnCurrentConId = conId;
    cnTempRecs = [];

    /* Find consult data */
    var consults = ERStore.getConsults();
    var con = null;
    consults.forEach(function(c) { if (c.id === conId) con = c; });
    if (!con) return;

    /* Fill consult info */
    document.getElementById('cnConsultInfo').innerHTML =
      '<div class="tr-pb-avatar" style="background:var(--warn-bg);color:var(--warn);">' + con.specialty.substring(0,2) + '</div>' +
      '<div class="tr-pb-info"><div class="tr-pb-name">' + con.specialty + ' Consult → ' + con.patient + '</div><div class="tr-pb-detail">' + con.reason + '</div></div>';

    /* Pre-fill from clinical context */
    document.getElementById('cnAssessment').value = '';
    document.getElementById('cnPlan').value = '';
    cnRecsContainer.innerHTML = '';
    cnAddRecRow.style.display = 'none';
    cnModal.style.display = 'flex';
  }

  /* Add recommendation row */
  if (cnAddRecBtn) {
    cnAddRecBtn.addEventListener('click', function() {
      cnAddRecRow.style.display = '';
      document.getElementById('cnRecText').value = '';
      document.getElementById('cnRecText').focus();
    });
  }

  if (cnRecConfirm) {
    cnRecConfirm.addEventListener('click', function() {
      var type = document.getElementById('cnRecType').value;
      var text = document.getElementById('cnRecText').value.trim();
      if (!text) return;

      cnTempRecs.push({type:type, text:text, done:false});
      renderCnTempRecs();
      cnAddRecRow.style.display = 'none';
    });
  }

  function renderCnTempRecs() {
    if (!cnRecsContainer) return;
    var typeLabels = {admit:'Admit',medication:'สั่งยา',procedure:'Procedure',observe:'Observe',followup:'Follow up',refer:'Refer',other:'อื่นๆ'};
    var html = '';
    cnTempRecs.forEach(function(r, i) {
      html += '<div class="cn-modal-rec"><span class="cn-rec-type ' + r.type + '">' + (typeLabels[r.type]||r.type) + '</span><span class="cn-rec-text">' + r.text + '</span><button class="cn-modal-rec-remove" data-idx="' + i + '">&times;</button></div>';
    });
    cnRecsContainer.innerHTML = html;
  }

  /* Remove recommendation */
  if (cnRecsContainer) {
    cnRecsContainer.addEventListener('click', function(e) {
      var rmBtn = e.target.closest('.cn-modal-rec-remove');
      if (!rmBtn) return;
      cnTempRecs.splice(parseInt(rmBtn.dataset.idx), 1);
      renderCnTempRecs();
    });
  }

  /* Submit consult note */
  if (cnSubmitBtn) {
    cnSubmitBtn.addEventListener('click', function() {
      var assessment = document.getElementById('cnAssessment').value.trim();
      if (!assessment) { alert('กรุณากรอก Assessment'); return; }
      if (cnTempRecs.length === 0) { alert('กรุณาเพิ่ม Recommendation อย่างน้อย 1 ข้อ'); return; }

      var plan = document.getElementById('cnPlan').value.trim();
      var now = new Date().toLocaleTimeString('th-TH', {hour12:false, hour:'2-digit', minute:'2-digit'});

      ERStore.updateConsult(cnCurrentConId, {
        status: 'noted',
        noteTime: now,
        consultNote: {
          assessment: assessment,
          recommendations: cnTempRecs,
          plan: plan
        }
      });

      closeCnModal();
      renderConsultBanner();
      renderConsultNotes();

      var tc = document.getElementById('toastContainer');
      var t = document.createElement('div');
      t.className = 'toast success';
      t.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>บันทึก Consult Note เรียบร้อย — Recommendations ' + cnTempRecs.length + ' ข้อ</span>';
      tc.appendChild(t);
      setTimeout(function() { t.remove(); }, 3200);
    });
  }

  /* ── Render Completed Consult Notes (with recommendation actions) ── */
  function renderConsultNotes() {
    if (!conActiveBanner || !hnParam) return;
    var consults = ERStore.getConsults(hnParam);
    var noted = consults.filter(function(c) { return c.status === 'noted' && c.consultNote && typeof c.consultNote === 'object'; });

    /* Find or create the notes container */
    var notesContainer = document.getElementById('cnNotesDisplay');
    if (!notesContainer) {
      notesContainer = document.createElement('div');
      notesContainer.id = 'cnNotesDisplay';
      conActiveBanner.parentNode.insertBefore(notesContainer, conActiveBanner.nextSibling);
    }

    if (noted.length === 0) {
      notesContainer.innerHTML = '';
      return;
    }

    var typeLabels = {admit:'Admit',medication:'สั่งยา',procedure:'Procedure',observe:'Observe',followup:'Follow up',refer:'Refer',other:'อื่นๆ'};
    var typeActions = {admit:'disposition',medication:'orders',procedure:'orders',observe:'orders',followup:'disposition',refer:'disposition'};
    var typeActionLabels = {admit:'ไป Disposition',medication:'ไปสั่งยา',procedure:'ไปสั่ง',observe:'ไปสั่ง Observe',followup:'ไป Disposition',refer:'ไป Disposition'};
    var checkSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';

    var html = '';
    noted.forEach(function(c) {
      var note = c.consultNote;
      html += '<div class="cn-note-card">' +
        '<div class="cn-note-hd">' +
          '<div class="cn-spec-badge">' + c.specialty.substring(0,2) + '</div>' +
          '<div class="cn-spec-info"><div class="cn-spec-name">' + c.specialty + ' — ' + (c.specialist||'Specialist') + '</div><div class="cn-spec-meta">Consult Note · ' + c.patient + '</div></div>' +
          '<div class="cn-time">เขียนเมื่อ ' + c.noteTime + '</div>' +
        '</div>';

      /* Assessment */
      html += '<div class="cn-section"><div class="cn-section-title">Assessment</div><div class="cn-assessment">' + note.assessment + '</div></div>';

      /* Recommendations */
      if (note.recommendations && note.recommendations.length) {
        html += '<div class="cn-section"><div class="cn-section-title">Recommendations (' + note.recommendations.length + ')</div><div class="cn-rec-list">';
        note.recommendations.forEach(function(r, idx) {
          var actionTab = typeActions[r.type];
          var isDone = r.done;
          html += '<div class="cn-rec-item' + (isDone ? ' done' : '') + '">' +
            '<div class="cn-rec-done-check' + (isDone ? ' checked' : '') + '" data-conid="' + c.id + '" data-recidx="' + idx + '">' + checkSvg + '</div>' +
            '<span class="cn-rec-type ' + r.type + '">' + (typeLabels[r.type]||r.type) + '</span>' +
            '<span class="cn-rec-text">' + r.text + '</span>' +
            (actionTab && !isDone ? '<button class="cn-rec-action" data-tab="' + actionTab + '">' + (typeActionLabels[r.type]||'ดำเนินการ') + '</button>' : '') +
          '</div>';
        });
        html += '</div></div>';
      }

      /* Plan */
      if (note.plan) {
        html += '<div class="cn-section"><div class="cn-section-title">Plan</div><div class="cn-plan">' + note.plan + '</div></div>';
      }

      html += '</div>';
    });

    notesContainer.innerHTML = html;

    /* Recommendation action buttons → switch tab */
    notesContainer.querySelectorAll('.cn-rec-action').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var tab = btn.dataset.tab;
        if (tab) {
          var tabBtn = document.querySelector('.pp-tab[data-tab="' + tab + '"]');
          if (tabBtn) tabBtn.click();
        }
      });
    });

    /* Toggle recommendation done */
    notesContainer.querySelectorAll('.cn-rec-done-check').forEach(function(chk) {
      chk.addEventListener('click', function() {
        var conId = chk.dataset.conid;
        var recIdx = parseInt(chk.dataset.recidx);
        var consults = ERStore.getConsults();
        consults.forEach(function(c) {
          if (c.id === conId && c.consultNote && c.consultNote.recommendations[recIdx] !== undefined) {
            c.consultNote.recommendations[recIdx].done = !c.consultNote.recommendations[recIdx].done;
            ERStore.updateConsult(conId, {consultNote: c.consultNote});
          }
        });
        renderConsultNotes();
      });
    });
  }

  /* Initial render */
  renderConsultBanner();
  renderConsultNotes();
