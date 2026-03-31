/* ================================================================
   ER System — Shared Data Store
   ใช้ localStorage เก็บข้อมูลกลาง ทุกหน้าอ่าน/เขียนที่เดียวกัน
   ================================================================ */

var ERStore = (function() {

  var STORAGE_KEY = 'er_system_data';

  /* ── Default Data (ใช้ครั้งแรกหรือ reset) ── */
  var DATA_VERSION = 8;
  var defaultData = {
    _v: DATA_VERSION,

    /* ผู้ป่วย */
    patients: {
      '640001': { hn:'640001', name:'สมชาย ใจดี', gender:'ชาย', age:'55', level:'1', levelName:'Resuscitation', cc:'Cardiac arrest, หมดสติ', bed:'B1', zone:'Resuscitation', doctor:'นพ.สมศักดิ์', status:'กำลังรักษา', wait:'', triage_time:'14:32', bp:'85/60', hr:'92', rr:'ETT', temp:'37.2', spo2:'93', gcs:'3T', pmh:'HT, DLP', allergy:'nka', allergyList:[], source:'EMS', ems:true, firstDocSeen:'14:33', doorToDoctor:1 },
      '640045': { hn:'640045', name:'กิตติ ศรีสุข', gender:'ชาย', age:'40', level:'1', levelName:'Resuscitation', cc:'Severe Trauma, GCS 8', bed:'B4', zone:'Resuscitation', doctor:'นพ.สมศักดิ์', status:'กำลังรักษา', wait:'', triage_time:'14:10', bp:'80/50', hr:'130', rr:'28', temp:'36.5', spo2:'88', gcs:'8', pmh:'ไม่มี', allergy:'nka', allergyList:[], source:'EMS', ems:true },
      '640012': { hn:'640012', name:'วิภา แสงทอง', gender:'หญิง', age:'48', level:'2', levelName:'Emergency', cc:'เจ็บหน้าอก ร้าวไปแขนซ้าย', bed:'—', zone:'Acute Care', doctor:'—', status:'รอแพทย์', wait:'52', triage_time:'09:42', bp:'130/85', hr:'110', rr:'22', temp:'37.0', spo2:'96', gcs:'15', pmh:'DM, HT', allergy:'allergy', allergyList:['Aspirin'], source:'Walk-in' },
      '640050': { hn:'640050', name:'ปรีชา มั่นคง', gender:'ชาย', age:'58', level:'2', levelName:'Emergency', cc:'DKA, pH 7.1', bed:'B11', zone:'Trauma Bay', doctor:'—', status:'รอแพทย์', wait:'30', triage_time:'14:02', bp:'110/70', hr:'110', rr:'28', temp:'37.8', spo2:'96', gcs:'14', pmh:'DM type 1', allergy:'nka', allergyList:[], source:'Walk-in' },
      '640025': { hn:'640025', name:'ประภาส รุ่งเรือง', gender:'ชาย', age:'35', level:'3', levelName:'Urgent', cc:'ปวดท้องรุนแรง Rt. lower', bed:'—', zone:'Acute Care', doctor:'—', status:'รอแพทย์', wait:'38', triage_time:'10:18', bp:'140/90', hr:'95', rr:'20', temp:'38.1', spo2:'98', gcs:'15', pmh:'ไม่มี', allergy:'nka', allergyList:[], source:'Walk-in' },
      '640031': { hn:'640031', name:'นภา เจริญสุข', gender:'หญิง', age:'62', level:'3', levelName:'Urgent', cc:'ไข้สูง 40.2C, ไอมีเสมหะ', bed:'—', zone:'Fast Track', doctor:'—', status:'รอแพทย์', wait:'25', triage_time:'11:05', bp:'125/75', hr:'100', rr:'24', temp:'40.2', spo2:'94', gcs:'15', pmh:'Asthma', allergy:'allergy', allergyList:['Penicillin'], source:'Walk-in' },
      '640077': { hn:'640077', name:'กานดา เพชรดี', gender:'หญิง', age:'32', level:'3', levelName:'Urgent', cc:'ปวดท้องน้อย สงสัย Ectopic', bed:'B12', zone:'Trauma Bay', doctor:'พญ.นิชา', status:'กำลังรักษา', wait:'', triage_time:'13:00', bp:'100/65', hr:'95', rr:'18', temp:'36.8', spo2:'99', gcs:'15', pmh:'ไม่มี', allergy:'nka', allergyList:[], source:'Walk-in' },
      '640002': { hn:'640002', name:'มาลี สายชล', gender:'หญิง', age:'70', level:'4', levelName:'Semi-urgent', cc:'อ่อนเพลีย เวียนศีรษะ', bed:'B2', zone:'Acute Care', doctor:'พญ.นิชา', status:'รอ Admit', wait:'', triage_time:'07:20', bp:'145/88', hr:'78', rr:'18', temp:'37.0', spo2:'97', gcs:'15', pmh:'DM, HT, CKD', allergy:'nka', allergyList:[], source:'Walk-in' },
      '640055': { hn:'640055', name:'สวัสดิ์ พงษ์ไพร', gender:'ชาย', age:'50', level:'4', levelName:'Semi-urgent', cc:'ปวดหัวตึงท้ายทอย', bed:'—', zone:'Fast Track', doctor:'—', status:'รอแพทย์', wait:'10', triage_time:'14:15', bp:'160/95', hr:'80', rr:'18', temp:'36.9', spo2:'98', gcs:'15', pmh:'HT', allergy:'nka', allergyList:[], source:'Walk-in' },
      '640038': { hn:'640038', name:'ธนพล วงศ์สุวรรณ', gender:'ชาย', age:'25', level:'5', levelName:'Non-urgent', cc:'ปวดหัวเล็กน้อย 1 วัน', bed:'—', zone:'—', doctor:'—', status:'รอแพทย์', wait:'15', triage_time:'12:30', bp:'120/78', hr:'72', rr:'16', temp:'36.8', spo2:'99', gcs:'15', pmh:'ไม่มี', allergy:'nka', allergyList:[], source:'Walk-in' },
      /* Observe */
      '640086': { hn:'640086', name:'ศิริพร วงษ์เดือน', gender:'หญิง', age:'45', level:'3', levelName:'Urgent', cc:'เจ็บหน้าอก ยังไม่ชัดเจน', bed:'B3', zone:'Acute Care', doctor:'นพ.สมศักดิ์', status:'Observe', wait:'', triage_time:'12:40', bp:'135/82', hr:'88', rr:'18', temp:'36.9', spo2:'97', gcs:'15', pmh:'HT', allergy:'nka', allergyList:[], source:'Walk-in' },
      '640087': { hn:'640087', name:'วันชัย แสงจันทร์', gender:'ชาย', age:'55', level:'3', levelName:'Urgent', cc:'หายใจลำบาก อาการดีขึ้น', bed:'—', zone:'Acute Care', doctor:'พญ.นิชา', status:'Observe', wait:'', triage_time:'11:20', bp:'128/78', hr:'82', rr:'20', temp:'37.0', spo2:'96', gcs:'15', pmh:'COPD', allergy:'allergy', allergyList:['Sulfa'], source:'Walk-in' },
      '640088': { hn:'640088', name:'ประนอม ใจสะอาด', gender:'หญิง', age:'62', level:'3', levelName:'Urgent', cc:'เวียนศีรษะ สงสัย TIA', bed:'—', zone:'—', doctor:'นพ.วิทยา', status:'Observe', wait:'', triage_time:'13:10', bp:'155/92', hr:'76', rr:'16', temp:'36.8', spo2:'98', gcs:'15', pmh:'HT, DM, AF', allergy:'allergy', allergyList:['Aspirin','NSAID'], source:'Walk-in' },
      /* กำลังรักษา (เพิ่ม) */
      '640089': { hn:'640089', name:'ชัยวัฒน์ ดีมาก', gender:'ชาย', age:'30', level:'4', levelName:'Semi-urgent', cc:'แพ้อาหาร ผื่นลมพิษ', bed:'—', zone:'Fast Track', doctor:'พญ.นิชา', status:'กำลังรักษา', wait:'', triage_time:'13:30', bp:'118/72', hr:'90', rr:'18', temp:'37.1', spo2:'99', gcs:'15', pmh:'ไม่มี', allergy:'allergy', allergyList:['อาหารทะเล'], source:'Walk-in' },
      '640090': { hn:'640090', name:'รุ่งทิวา สายน้ำ', gender:'หญิง', age:'25', level:'4', levelName:'Semi-urgent', cc:'ปวดท้อง r/o appendicitis', bed:'—', zone:'Acute Care', doctor:'นพ.วิทยา', status:'กำลังรักษา', wait:'', triage_time:'13:50', bp:'122/75', hr:'85', rr:'18', temp:'37.8', spo2:'99', gcs:'15', pmh:'ไม่มี', allergy:'nka', allergyList:[], source:'Walk-in' },
      /* รอ Admit (เพิ่ม) */
      '640091': { hn:'640091', name:'สุทิน พรมแดง', gender:'ชาย', age:'70', level:'3', levelName:'Urgent', cc:'ใจสั่น AF with RVR', bed:'B10', zone:'Acute Care', doctor:'นพ.สมศักดิ์', status:'รอ Admit', wait:'', triage_time:'14:00', bp:'138/85', hr:'145', rr:'22', temp:'37.0', spo2:'95', gcs:'15', pmh:'HT, AF', allergy:'nka', allergyList:[], source:'Walk-in' }
    },

    /* คิวรอคัดกรอง */
    triageQueue: [
      { hn:'640101', name:'ผู้ป่วยใหม่ 1', gender:'ชาย', age:'55', cc:'เจ็บหน้าอก 2 ชม.', source:'Walk-in', time:'14:32', wait:5 },
      { hn:'640102', name:'อรุณ ศรีสวัสดิ์', gender:'ชาย', age:'42', cc:'ปวดท้องรุนแรง', source:'Walk-in', time:'14:20', wait:12 },
      { hn:'640103', name:'สุนีย์ แก้วใส', gender:'หญิง', age:'28', cc:'ไข้สูง 3 วัน', source:'Walk-in', time:'14:24', wait:8 },
      { hn:'640104', name:'ไม่ทราบชื่อ', gender:'ชาย', age:'~60', cc:'หมดสติ พบล้มข้างถนน', source:'EMS', time:'14:30', wait:2 }
    ],

    /* Pre-Arrival */
    preArrivals: [
      { caseId:'PA-0301', risk:'Resuscitation', cc:'Cardiac Arrest — ชาย ~55 ปี, CPR อยู่', eta:480, etaTotal:600, source:'EMS 1669', vehicle:'ALS-05', status:'incoming' },
      { caseId:'PA-0302', risk:'Emergency', cc:'Severe PPH — พิมพ์ใจ ดวงดี หญิง 32 ปี', eta:1320, etaTotal:1800, source:'Refer รพ.ชุมชน', vehicle:'Refer R-12', status:'incoming' },
      { caseId:'PA-0303', risk:'Urgent', cc:'Stroke — วิชัย สุขสม ชาย 68 ปี', eta:2100, etaTotal:2700, source:'EMS 1669', vehicle:'BLS-08', status:'incoming' }
    ],

    /* เตียง */
    beds: {
      'B1': { status:'occ', patient:'640001' },
      'B2': { status:'occ', patient:'640002' },
      'B3': { status:'occ', patient:'640086' },
      'B4': { status:'occ', patient:'640045' },
      'B5': { status:'rsv', patient:null, reserved:'PA-0302' },
      'B6': { status:'free', patient:null },
      'B7': { status:'free', patient:null },
      'B8': { status:'clean', patient:null },
      'B9': { status:'free', patient:null },
      'B10': { status:'occ', patient:'640091' },
      'B11': { status:'occ', patient:'640050' },
      'B12': { status:'occ', patient:'640077' }
    },

    /* โซน — bed mapping */
    zones: [
      { name:'Resuscitation Zone', color:'var(--t-resus)', beds:['B1','B4'] },
      { name:'Acute Care Zone', color:'var(--t-emer)', beds:['B2','B3','B5','B6','B7','B8'] },
      { name:'Fast Track Zone', color:'var(--t-semi)', beds:['B9','B10'] },
      { name:'Trauma Bay', color:'var(--purple)', beds:['B11','B12'] }
    ],

    /* ทีมเวร */
    staff: [
      { name:'นพ.สมศักดิ์ รักษาดี', role:'แพทย์เวชศาสตร์ฉุกเฉิน', status:'busy', patients:3 },
      { name:'พญ.นิชา เจริญผล', role:'แพทย์เวชศาสตร์ฉุกเฉิน', status:'busy', patients:2 },
      { name:'นพ.วิทยา พงษ์สวัสดิ์', role:'Resident', status:'free', patients:0 }
    ],

    /* สรุปตัวเลข */
    summary: {
      total: 24,
      waitingTriage: 4,
      waitingDoctor: 6,
      observe: 9,
      waitingBed: 4,
      waitingRefer: 5,
      triage: { resus:2, emer:3, urg:6, semi:5, non:4 },
      beds: { total:12, free:3, occ:7, rsv:1, clean:1 }
    },

    /* Login Audit */
    loginAudit: [],

    /* Orders (per patient) */
    orders: {
      '640001': [
        { id:'ORD-001', type:'consult', desc:'Cardio consult → Cath Lab', priority:'stat', status:'pending', time:'14:50', by:'นพ.สมศักดิ์' },
        { id:'ORD-002', type:'med', desc:'Heparin 5000 unit IV bolus', priority:'stat', status:'done', time:'14:40', by:'นพ.สมศักดิ์' },
        { id:'ORD-003', type:'xray', desc:'12-lead ECG', priority:'stat', status:'done', time:'14:38', by:'นพ.สมศักดิ์' },
        { id:'ORD-004', type:'lab', desc:'CBC, BMP, Troponin, Lactate, ABG', priority:'stat', status:'done', time:'14:36', by:'นพ.สมศักดิ์' },
        { id:'ORD-005', type:'procedure', desc:'Target Temperature Management', priority:'now', status:'active', time:'14:35', by:'นพ.สมศักดิ์' },
        { id:'ORD-006', type:'med', desc:'Adrenaline drip 0.1 mcg/kg/min', priority:'stat', status:'active', time:'14:34', by:'นพ.สมศักดิ์' },
        { id:'ORD-007', type:'procedure', desc:'Defibrillation #3 — 200J', priority:'stat', status:'done', time:'14:33', by:'นพ.สมศักดิ์' }
      ],
      '640045': [
        { id:'ORD-010', type:'xray', desc:'CT Whole body', priority:'stat', status:'active', time:'14:15', by:'นพ.สมศักดิ์' },
        { id:'ORD-011', type:'lab', desc:'CBC, BMP, Type & Screen, Crossmatch 4 units', priority:'stat', status:'done', time:'14:12', by:'นพ.สมศักดิ์' },
        { id:'ORD-012', type:'med', desc:'NSS 1000ml fast drip x2', priority:'stat', status:'active', time:'14:12', by:'นพ.สมศักดิ์' },
        { id:'ORD-013', type:'consult', desc:'Ortho consult — Open fracture Rt. tibia', priority:'stat', status:'pending', time:'14:14', by:'นพ.สมศักดิ์' }
      ],
      '640077': [
        { id:'ORD-020', type:'lab', desc:'CBC, BMP, Beta-hCG, Urinalysis', priority:'now', status:'done', time:'13:10', by:'พญ.นิชา' },
        { id:'ORD-021', type:'xray', desc:'USG Pelvis', priority:'now', status:'done', time:'13:15', by:'พญ.นิชา' },
        { id:'ORD-022', type:'consult', desc:'OB-GYN consult — สงสัย Ectopic pregnancy', priority:'urgent', status:'pending', time:'13:30', by:'พญ.นิชา' },
        { id:'ORD-023', type:'med', desc:'NSS 1000ml IV drip', priority:'routine', status:'active', time:'13:05', by:'พญ.นิชา' }
      ],
      '640086': [
        { id:'ORD-030', type:'lab', desc:'Troponin (serial), CBC, BMP', priority:'now', status:'done', time:'12:45', by:'นพ.สมศักดิ์' },
        { id:'ORD-031', type:'xray', desc:'12-lead ECG', priority:'stat', status:'done', time:'12:42', by:'นพ.สมศักดิ์' },
        { id:'ORD-032', type:'xray', desc:'CXR PA upright', priority:'routine', status:'done', time:'12:50', by:'นพ.สมศักดิ์' },
        { id:'ORD-033', type:'observe', desc:'Observe 6 ชม. + Serial Troponin q3h', priority:'routine', status:'active', time:'13:00', by:'นพ.สมศักดิ์' }
      ],
      '640091': [
        { id:'ORD-040', type:'lab', desc:'CBC, BMP, TSH, Troponin', priority:'now', status:'done', time:'14:05', by:'นพ.สมศักดิ์' },
        { id:'ORD-041', type:'xray', desc:'12-lead ECG', priority:'stat', status:'done', time:'14:02', by:'นพ.สมศักดิ์' },
        { id:'ORD-042', type:'med', desc:'Diltiazem 10mg IV push', priority:'stat', status:'done', time:'14:08', by:'นพ.สมศักดิ์' },
        { id:'ORD-043', type:'med', desc:'Diltiazem drip 5mg/hr', priority:'now', status:'active', time:'14:10', by:'นพ.สมศักดิ์' },
        { id:'ORD-044', type:'admit', desc:'Admit CCU — AF with RVR', priority:'urgent', status:'pending', time:'14:25', by:'นพ.สมศักดิ์' }
      ],
      '640090': [
        { id:'ORD-050', type:'lab', desc:'CBC, BMP, Urinalysis, Amylase', priority:'now', status:'done', time:'14:00', by:'นพ.วิทยา' },
        { id:'ORD-051', type:'xray', desc:'USG Abdomen', priority:'now', status:'active', time:'14:05', by:'นพ.วิทยา' },
        { id:'ORD-052', type:'med', desc:'Morphine 2mg IV', priority:'stat', status:'done', time:'13:55', by:'นพ.วิทยา' },
        { id:'ORD-053', type:'med', desc:'NSS 1000ml IV drip', priority:'routine', status:'active', time:'13:52', by:'นพ.วิทยา' }
      ]
    },

    /* Lab Results (per patient) */
    labResults: {},

    /* Transport Requests */
    transports: [
      { id:'TR-001', hn:'640001', patient:'สมชาย ใจดี', from:'ER Resuscitation · B1', destType:'imaging', dest:'Cath Lab', priority:'emergency', equipment:['เตียง','Monitor','O2','Ventilator'], isolation:'standard', note:'Post-ROSC, Adrenaline drip running, ต้อง monitor ตลอด', status:'pending', requestBy:'พย.สมหญิง', requestTime:'14:55', porter:null, acceptTime:null, startTime:null, completeTime:null },
      { id:'TR-002', hn:'640002', patient:'มาลี สายชล', from:'ER Acute Care · B2', destType:'ward', dest:'Ward 5A (อายุรกรรม)', priority:'normal', equipment:['Wheelchair'], isolation:'standard', note:'ผู้ป่วย ambulatory ได้', status:'in_transit', requestBy:'พย.วรรณา', requestTime:'14:30', porter:'สมชาย (Porter)', acceptTime:'14:35', startTime:'14:40', completeTime:null },
      { id:'TR-003', hn:'640091', patient:'สุทิน พรมแดง', from:'ER Acute Care · B10', destType:'icu', dest:'CCU', priority:'urgent', equipment:['เตียง','Monitor','IV pump'], isolation:'standard', note:'Diltiazem drip running, monitor HR closely', status:'accepted', requestBy:'พย.สมหญิง', requestTime:'14:50', porter:'วิชัย (Porter)', acceptTime:'14:52', startTime:null, completeTime:null },
      { id:'TR-004', hn:'640077', patient:'กานดา เพชรดี', from:'ER Trauma Bay · B12', destType:'imaging', dest:'USG Room 2', priority:'urgent', equipment:['เตียง'], isolation:'standard', note:'สงสัย Ectopic pregnancy, OB-GYN consult pending', status:'completed', requestBy:'พย.วรรณา', requestTime:'13:20', porter:'สมชาย (Porter)', acceptTime:'13:22', startTime:'13:25', completeTime:'13:35' }
    ],

    /* Consult Requests */
    consults: [
      { id:'CON-001', hn:'640001', patient:'สมชาย ใจดี', specialty:'Cardiology', urgency:'emergent', reason:'STEMI anterior, post-ROSC — ต้องการ emergent PCI', clinicalInfo:'Troponin I 15.8, ST elevation V1-V4, pH 7.08, Adrenaline drip running', erDx:'Cardiac arrest (VF) → ROSC, Acute Anterior STEMI', needType:'transfer', requestBy:'นพ.สมศักดิ์', requestTime:'14:50', contactExt:'1234', status:'accepted', receivedTime:'14:51', receivedBy:'เลขา Cardio', acceptedTime:'14:52', specialist:'นพ.กิตติ (Interventionist)', eta:10, seenTime:null, noteTime:null, consultNote:null },
      { id:'CON-002', hn:'640045', patient:'กิตติ ศรีสุข', specialty:'Orthopedics', urgency:'emergent', reason:'Open fracture Rt. tibia — Gustilo IIIA, ต้อง OR debridement', clinicalInfo:'Severe trauma, GCS 8, Hb 7.2, BP 80/50 (resuscitating)', erDx:'Severe Trauma, Open fracture', needType:'operate', requestBy:'นพ.สมศักดิ์', requestTime:'14:14', contactExt:'5678', status:'sent', receivedTime:null, receivedBy:null, acceptedTime:null, specialist:null, eta:null, seenTime:null, noteTime:null, consultNote:null },
      { id:'CON-003', hn:'640077', patient:'กานดา เพชรดี', specialty:'OB-GYN', urgency:'urgent', reason:'สงสัย Ectopic pregnancy — Beta-hCG 3200, USG: Rt. adnexal mass + free fluid', clinicalInfo:'หญิง 32 ปี, ปวดท้องน้อย, BP 100/65, Hb 10.2', erDx:'R/O Ectopic pregnancy', needType:'evaluate', requestBy:'พญ.นิชา', requestTime:'13:30', contactExt:'3456', status:'seeing', receivedTime:'13:32', receivedBy:'เลขา OB', acceptedTime:'13:35', specialist:'พญ.สุภาพร (OB on-call)', eta:null, seenTime:'13:50', noteTime:null, consultNote:null },
      { id:'CON-004', hn:'640091', patient:'สุทิน พรมแดง', specialty:'Cardiology', urgency:'urgent', reason:'AF with RVR, HR 145 — ไม่ตอบสนองต่อ Diltiazem, TSH ต่ำมาก สงสัย Thyrotoxicosis', clinicalInfo:'ชาย 70 ปี, HR 145, BP 138/85, TSH 0.01', erDx:'AF with RVR, R/O Thyrotoxicosis', needType:'co-manage', requestBy:'นพ.สมศักดิ์', requestTime:'14:25', contactExt:'1234', status:'received', receivedTime:'14:28', receivedBy:'เลขา Cardio', acceptedTime:null, specialist:null, eta:null, seenTime:null, noteTime:null, consultNote:null },
      { id:'CON-005', hn:'640086', patient:'ศิริพร วงษ์เดือน', specialty:'Cardiology', urgency:'urgent', reason:'เจ็บหน้าอก ยังไม่ชัดเจน — ต้องการ Cardio evaluate', clinicalInfo:'Troponin 0.04 (ปกติ), ECG: NSR no ST change, CXR: Normal', erDx:'Chest pain, R/O ACS', needType:'evaluate', requestBy:'นพ.สมศักดิ์', requestTime:'12:50', contactExt:'1234', status:'noted', receivedTime:'12:52', receivedBy:'เลขา Cardio', acceptedTime:'12:55', specialist:'นพ.กิตติ (Cardiologist)', eta:null, seenTime:'13:05', noteTime:'13:20',
        consultNote:{ assessment:'Evaluated — Low risk ACS. Troponin negative x2, ECG normal, HEART score 3 (low risk). No acute coronary syndrome at this time.', recommendations:[{type:'observe',text:'Observe 6 ชม. + Repeat Troponin ทุก 3 ชม.',done:false},{type:'medication',text:'Aspirin 81mg OD + Statin (ถ้าไม่แพ้)',done:false},{type:'followup',text:'นัด OPD Cardiology 1 สัปดาห์ + Exercise Stress Test',done:false},{type:'other',text:'ถ้า Troponin เพิ่มขึ้น หรือ อาการแย่ลง → consult ใหม่ทันที',done:false}], plan:'Low risk ACS — observe ต่อ ถ้า serial Troponin ปกติ + อาการดี → discharge ได้ พร้อม OPD follow up' } },
      { id:'CON-006', hn:'640077', patient:'กานดา เพชรดี', specialty:'OB-GYN', urgency:'urgent', reason:'USG: Rt. adnexal mass + free fluid, Beta-hCG 3200', clinicalInfo:'หญิง 32 ปี, BP 100/65, Hb 10.2', erDx:'R/O Ectopic pregnancy', needType:'evaluate', requestBy:'พญ.นิชา', requestTime:'13:25', contactExt:'2345', status:'noted', receivedTime:'13:28', receivedBy:'เลขา OB', acceptedTime:'13:32', specialist:'พญ.สุภาพร (OB on-call)', eta:null, seenTime:'13:50', noteTime:'14:10',
        consultNote:{ assessment:'Confirmed Ectopic Pregnancy — Rt. tubal pregnancy with hemoperitoneum. Hemodynamically stable at this time but need urgent intervention.', recommendations:[{type:'procedure',text:'Emergency Laparoscopic Salpingectomy — จอง OR ด่วน',done:false},{type:'admit',text:'Admit OB-GYN ward (post-op) หรือ OR holding area',done:false},{type:'medication',text:'NSS 1000ml IV fast + Crossmatch PRC 2 units (เผื่อ)',done:false},{type:'other',text:'NPO สำหรับ OR, Consent ผ่าตัด, แจ้งญาติ',done:false}], plan:'Emergency laparoscopic salpingectomy — ส่ง OR ภายใน 1-2 ชม. ถ้า hemodynamic unstable → convert to laparotomy' } }
    ]
  };

  /* ── Core Functions ── */

  function load() {
    var stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try { return JSON.parse(stored); }
      catch(e) { return JSON.parse(JSON.stringify(defaultData)); }
    }
    return JSON.parse(JSON.stringify(defaultData));
  }

  function save(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function reset() {
    localStorage.removeItem(STORAGE_KEY);
    return JSON.parse(JSON.stringify(defaultData));
  }

  function get() {
    return load();
  }

  function update(fn) {
    var data = load();
    fn(data);
    save(data);
    return data;
  }

  /* ── Patient Functions ── */

  function getPatient(hn) {
    var data = load();
    return data.patients[hn] || null;
  }

  function updatePatient(hn, changes) {
    return update(function(data) {
      if (data.patients[hn]) {
        Object.keys(changes).forEach(function(k) {
          data.patients[hn][k] = changes[k];
        });
      }
    });
  }

  function getAllPatients() {
    var data = load();
    return Object.values(data.patients);
  }

  function getPatientsByStatus(status) {
    return getAllPatients().filter(function(p) { return p.status === status; });
  }

  /* ── Order Functions ── */

  function addOrder(hn, order) {
    return update(function(data) {
      if (!data.orders[hn]) data.orders[hn] = [];
      order.time = new Date().toLocaleTimeString('th-TH', {hour12:false, hour:'2-digit', minute:'2-digit'});
      order.by = 'Admin';
      order.id = 'ORD-' + Date.now();
      data.orders[hn].unshift(order);
    });
  }

  function getOrders(hn) {
    var data = load();
    return (data.orders[hn] || []);
  }

  /* ── Consult Functions ── */

  function addConsult(c) {
    return update(function(data) {
      c.id = 'CON-' + Date.now();
      c.status = 'sent';
      c.requestTime = new Date().toLocaleTimeString('th-TH', {hour12:false, hour:'2-digit', minute:'2-digit'});
      c.requestBy = 'Admin';
      c.receivedTime = null; c.receivedBy = null;
      c.acceptedTime = null; c.specialist = null; c.eta = null;
      c.seenTime = null; c.noteTime = null; c.consultNote = null;
      data.consults.unshift(c);
    });
  }

  function getConsults(hn) {
    var data = load();
    if (hn) return data.consults.filter(function(c) { return c.hn === hn; });
    return data.consults;
  }

  function updateConsult(id, changes) {
    return update(function(data) {
      data.consults.forEach(function(c) {
        if (c.id === id) {
          Object.keys(changes).forEach(function(k) { c[k] = changes[k]; });
        }
      });
    });
  }

  /* ── Transport Functions ── */

  function addTransport(tr) {
    return update(function(data) {
      tr.id = 'TR-' + Date.now();
      tr.status = 'pending';
      tr.requestTime = new Date().toLocaleTimeString('th-TH', {hour12:false, hour:'2-digit', minute:'2-digit'});
      tr.requestBy = 'Admin';
      tr.porter = null;
      tr.acceptTime = null;
      tr.startTime = null;
      tr.completeTime = null;
      data.transports.unshift(tr);
    });
  }

  function getTransports(hn) {
    var data = load();
    if (hn) return data.transports.filter(function(t) { return t.hn === hn; });
    return data.transports;
  }

  function updateTransport(id, changes) {
    return update(function(data) {
      data.transports.forEach(function(t) {
        if (t.id === id) {
          Object.keys(changes).forEach(function(k) { t[k] = changes[k]; });
        }
      });
    });
  }

  /* ── Pre-Arrival Functions ── */

  function addPreArrival(pa) {
    return update(function(data) {
      pa.caseId = 'PA-' + String(Math.floor(Math.random()*9000)+1000);
      pa.status = 'incoming';
      data.preArrivals.unshift(pa);
      data.summary.total++;
    });
  }

  function getPreArrivals() {
    var data = load();
    return data.preArrivals;
  }

  /* ── Bed Functions ── */

  function updateBed(bedId, changes) {
    return update(function(data) {
      if (data.beds[bedId]) {
        Object.keys(changes).forEach(function(k) {
          data.beds[bedId][k] = changes[k];
        });
      }
    });
  }

  function getBeds() {
    var data = load();
    return data.beds;
  }

  /* ── Triage Queue Functions ── */

  function addToTriageQueue(patient) {
    return update(function(data) {
      data.triageQueue.push(patient);
      data.summary.waitingTriage = data.triageQueue.length;
    });
  }

  function removeFromTriageQueue(hn) {
    return update(function(data) {
      data.triageQueue = data.triageQueue.filter(function(p) { return p.hn !== hn; });
      data.summary.waitingTriage = data.triageQueue.length;
    });
  }

  function getTriageQueue() {
    var data = load();
    return data.triageQueue;
  }

  /* ── Summary ── */

  function getSummary() {
    var data = load();
    return data.summary;
  }

  /* ── Public API ── */

  return {
    get: get,
    update: update,
    reset: reset,
    save: save,
    load: load,

    getPatient: getPatient,
    updatePatient: updatePatient,
    getAllPatients: getAllPatients,
    getPatientsByStatus: getPatientsByStatus,

    addOrder: addOrder,
    getOrders: getOrders,

    addConsult: addConsult,
    getConsults: getConsults,
    updateConsult: updateConsult,

    addTransport: addTransport,
    getTransports: getTransports,
    updateTransport: updateTransport,

    addPreArrival: addPreArrival,
    getPreArrivals: getPreArrivals,

    updateBed: updateBed,
    getBeds: getBeds,

    addToTriageQueue: addToTriageQueue,
    removeFromTriageQueue: removeFromTriageQueue,
    getTriageQueue: getTriageQueue,

    getSummary: getSummary
  };

})();

/* Auto-init: ถ้าไม่มีข้อมูล หรือ version เปลี่ยน ให้ reset เพื่อโหลด demo ใหม่ */
(function(){
  var stored = localStorage.getItem('er_system_data');
  if (stored) {
    try {
      var parsed = JSON.parse(stored);
      if (!parsed._v || parsed._v < 8) { localStorage.removeItem('er_system_data'); ERStore.save(ERStore.get()); }
    } catch(e) { localStorage.removeItem('er_system_data'); ERStore.save(ERStore.get()); }
  } else {
    ERStore.save(ERStore.get());
  }
})();
