import React, { useState, useEffect } from 'react';
import { Settings, Building2, Users, Download, MessageSquare, Plus, Trophy, Trash2, Edit3, Save, X, KeyRound, LogOut, CalendarIcon, Send, Gift, Award, FileText, MapPin, CheckCircle2, ShieldAlert, Map, ChevronDown, ChevronRight } from 'lucide-react';
import { db, appId } from '../services/firebase';
import { updateDoc, doc, addDoc, collection, deleteDoc, onSnapshot } from "firebase/firestore";
import { sendSMS, SMS_FOOTER } from '../services/smsService';
import { DEFAULT_PRIZE_OBJ, INITIAL_ZONES, LOCATIONS } from '../data/constants';
import { parsePrizeArray, normalizeForSearch, getNeighborhoodDetails } from '../utils/helpers';

export function AdminLogin({ setAdminAuth, zones }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    if (password !== '18881959') {
      setError('Hatalı şifre girdiniz.');
      return;
    }

    const searchStr = normalizeForSearch(username);
    if (searchStr === 'genel merkez') {
      setAdminAuth({ isAuthenticated: true, zoneId: 'ALL', isSuperAdmin: true });
      return;
    }

    const activeZones = zones && zones.length > 0 ? zones : INITIAL_ZONES;
    const matchedZone = activeZones.find(z => 
      normalizeForSearch(z.name) === searchStr || 
      (z.districts && z.districts.some(d => normalizeForSearch(d) === searchStr)) ||
      (z.partialDistricts && Object.keys(z.partialDistricts).some(d => normalizeForSearch(d) === searchStr))
    );

    if (matchedZone) {
      setAdminAuth({ isAuthenticated: true, zoneId: matchedZone.id, isSuperAdmin: false });
    } else {
      setError(`Tanımsız Bölge. Lütfen "Genel Merkez" veya sorumlu olduğunuz ilçe/bölge adını girin.`);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-20">
      <div className="bg-white p-10 md:p-14 rounded-[3rem] shadow-2xl shadow-indigo-100/50 border border-slate-100 w-full max-w-md">
        <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
          <KeyRound className="w-10 h-10 text-indigo-600" />
        </div>
        <h2 className="text-3xl font-black text-center text-slate-900 mb-2">Yönetici Girişi</h2>
        <p className="text-center text-slate-500 font-bold mb-8">Sorumlu olduğunuz mıntıkayı yönetmek için giriş yapın.</p>
        
        {error && <div className="bg-red-50 text-red-600 font-bold p-4 rounded-2xl mb-6 text-sm text-center border border-red-100">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wider">İlçe / Mıntıka Adı</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Örn: Gebze, Serdivan..." className="w-full border-4 border-slate-100 rounded-2xl px-6 py-4 text-lg font-bold focus:border-indigo-500 outline-none transition" required />
          </div>
          <div>
            <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wider">Şifre</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full border-4 border-slate-100 rounded-2xl px-6 py-4 text-lg font-bold focus:border-indigo-500 outline-none transition" required />
          </div>
          <button type="submit" className="w-full bg-indigo-600 text-white font-black text-xl py-5 rounded-2xl hover:bg-indigo-700 transition shadow-xl shadow-indigo-500/30 mt-4">Sisteme Giriş Yap</button>
        </form>
      </div>
    </div>
  );
}

export default function AdminPanel({ students, adminZoneId, isSuperAdmin, onLogout, zones, exams }) {
  const [activeTab, setActiveTab] = useState('ayarlar'); 
  const [isSyncing, setIsSyncing] = useState(false); 
  const [hasMadeChanges, setHasMadeChanges] = useState(false);
  
  const adminZoneData = isSuperAdmin 
     ? { id: 'ALL', name: "Genel Merkez (Tüm Mıntıkalar)", active: true, districts: [], prizes: {grand: DEFAULT_PRIZE_OBJ, degree: [], participation: []}, centers: [], mappings: [] } 
     : zones.find(z => z.id === adminZoneId);
     
  const filteredStudents = isSuperAdmin ? students : students.filter(s => s.zone?.id === adminZoneId);
  const filteredExams = isSuperAdmin ? exams : exams.filter(e => e.zoneId === adminZoneId);

  const [localPrizes, setLocalPrizes] = useState({ grand: { title: '', desc: '', img: '' }, degree: [{ title: '', desc: '', img: '' }], participation: [{ title: '', desc: '', img: '' }] });
  const [examData, setExamData] = useState({ title: '' });
  const [examSessions, setExamSessions] = useState([{ date: '', times: '' }]);
  const [newCenter, setNewCenter] = useState({ name: '', address: '', mapLink: '' });
  const [mappingData, setMappingData] = useState({ district: '', neighborhood: '', centerId: '', gender: 'Tümü', contactName: '', phone: '' });
  const [resultModal, setResultModal] = useState({ isOpen: false, student: null, score: '', rank: '' });
  const [smsModal, setSmsModal] = useState({ isOpen: false, type: 'custom', customMsg: '', loading: false, targetStudent: null });
  const [bulkExcelData, setBulkExcelData] = useState("");
  const [editingCenter, setEditingCenter] = useState(null);

  const [blacklistPhones, setBlacklistPhones] = useState([]);
  const [newBlacklistPhone, setNewBlacklistPhone] = useState('');

  // Mahalle İstatistikleri Sekmesi Durumları
  const [expandedZoneId, setExpandedZoneId] = useState(null);
  const [missingFilterZone, setMissingFilterZone] = useState('All');
  const [missingFilterStatus, setMissingFilterStatus] = useState('All');
  
  // İstisna Atama Modalı Durumları
  const [exceptionModal, setExceptionModal] = useState({ isOpen: false, center: null, sourceZone: null });
  const [exceptionData, setExceptionData] = useState({ gender: 'Tümü', district: '', neighborhood: '', contactName: '', phone: '' });

  useEffect(() => {
    if(adminZoneData && !isSuperAdmin) {
      setLocalPrizes({
        grand: parsePrizeArray(adminZoneData.prizes?.grand)[0] || { title: '', desc: '', img: '' },
        degree: parsePrizeArray(adminZoneData.prizes?.degree).length ? parsePrizeArray(adminZoneData.prizes?.degree) : [{ title: '', desc: '', img: '' }],
        participation: parsePrizeArray(adminZoneData.prizes?.participation).length ? parsePrizeArray(adminZoneData.prizes?.participation) : [{ title: '', desc: '', img: '' }]
      });
    }
  }, [adminZoneData, isSuperAdmin]);

  useEffect(() => {
    if (isSuperAdmin) {
      const unsub = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'blacklist'), snap => {
         setBlacklistPhones(snap.docs.map(d => ({ id: d.id, phone: d.data().phone })));
      });
      return () => unsub();
    }
  }, [isSuperAdmin]);

  if (!adminZoneData) return <div>Erişim Hatası.</div>;

  const adminCenters = adminZoneData.centers || [];
  const adminMappings = adminZoneData.mappings || [];

  const handleLogoutWithSync = async () => {
    if (!hasMadeChanges) {
       onLogout();
       return;
    }

    setIsSyncing(true);
    try {
      let dbUpdates = [];
      let smsQueue = [];

      for (let student of students) {
        const zone = zones.find(z => z.id === student.zone?.id) || student.zone;
        if (!zone) continue;

        let updates = {};
        let needsSms = false;
        let smsText = "";

        const centerInfo = getNeighborhoodDetails(zone, student.district, student.neighborhood, student.gender);
        const hasValidCenter = centerInfo.centerName !== "Sınav Merkezi Bekleniyor";
        
        if (student.isWaitingPool === true && hasValidCenter) {
           updates.isWaitingPool = false;
           needsSms = true;
           smsText = `Müjde! Sınav merkeziniz tanımlandı. Lütfen odullusinav.net üzerinden profilinize giriş yaparak oturumunuzu seçiniz.${SMS_FOOTER}`;
        }

        if (student.examId) {
           const exam = exams.find(e => e.firebaseId === student.examId || e.id === student.examId);
           let validSlot = false;
           if (exam && exam.sessions) {
              const session = exam.sessions.find(s => s.date === student.selectedDate);
              if (session && session.slots.includes(student.selectedTime)) {
                 validSlot = true;
              }
           }

           if (!validSlot && student.selectedDate && student.selectedTime) {
              updates.selectedDate = null;
              updates.selectedTime = null;
              updates.examId = null;
              updates.examTitle = null;
              if (!needsSms) {
                 needsSms = true;
                 smsText = `Önemli: Adresinizdeki sınav oturumunda değişiklikten dolayı işlem yapmanız lazım. Lütfen odullusinav.net profilinize girerek yeni oturumunuzu seçiniz.${SMS_FOOTER}`;
              }
           }
        }

        if (student.selectedParticipationPrize) {
           const partPrizesList = parsePrizeArray(zone.prizes?.participation);
           const prizeExists = partPrizesList.some(p => p.title === student.selectedParticipationPrize);
           if (!prizeExists) {
              updates.selectedParticipationPrize = '';
              if (!needsSms) {
                 needsSms = true;
                 smsText = `Önemli: Adresinizdeki sınav ödüllerinde değişiklikten dolayı işlem yapmanız lazım. Lütfen odullusinav.net profilinize girerek ödülünüzü güncelleyiniz.${SMS_FOOTER}`;
              }
           }
        }

        if (Object.keys(updates).length > 0) {
           dbUpdates.push({
              ref: doc(db, 'artifacts', appId, 'public', 'data', 'students', student.firebaseId),
              data: updates
           });
        }
        if (needsSms && student.phone) {
           smsQueue.push({ tel: [student.phone], msg: smsText });
        }
      }

      if (dbUpdates.length > 0) {
         const updatePromises = dbUpdates.map(u => updateDoc(u.ref, u.data));
         await Promise.all(updatePromises);
      }

      if (smsQueue.length > 0) {
         await sendSMS(smsQueue);
      }

    } catch(err) {
      console.error("Çıkış senkronizasyon hatası:", err);
    } finally {
      setIsSyncing(false);
      onLogout(); 
    }
  };

  const getZoneTotalHoods = (zone) => {
    let count = 0;
    if (zone.districts) {
      zone.districts.forEach(d => {
        for(let prov in LOCATIONS) {
          if(LOCATIONS[prov][d]) { count += LOCATIONS[prov][d].length; break; }
        }
      });
    }
    if (zone.partialDistricts) {
      Object.keys(zone.partialDistricts).forEach(d => {
        count += zone.partialDistricts[d].length;
      });
    }
    return count;
  };

  const getMissingMappings = () => {
     let missing = [];
     zones.forEach(z => {
        const mappings = z.mappings || [];
        const checkDistrictHood = (dist, hood) => {
           const hoodMappings = mappings.filter(m => m.district === dist && m.neighborhood === hood);
           const hasTumu = hoodMappings.some(m => m.gender === 'Tümü' || !m.gender);
           const hasErkek = hoodMappings.some(m => m.gender === 'Erkek');
           const hasKiz = hoodMappings.some(m => m.gender === 'Kız');

           if (hasTumu) return; 
           if (hasErkek && hasKiz) return; 
           
           if (hoodMappings.length === 0) {
              missing.push({ zone: z.name, district: dist, neighborhood: hood, status: 'Hiç Tanımlanmamış' });
           } else if (hasErkek && !hasKiz) {
              missing.push({ zone: z.name, district: dist, neighborhood: hood, status: 'Sadece Erkek (Kız Eksik)' });
           } else if (!hasErkek && hasKiz) {
              missing.push({ zone: z.name, district: dist, neighborhood: hood, status: 'Sadece Kız (Erkek Eksik)' });
           }
        };

        if (z.districts) {
           z.districts.forEach(d => {
              let hoods = [];
              for(let prov in LOCATIONS) { if(LOCATIONS[prov][d]) hoods = LOCATIONS[prov][d]; }
              hoods.forEach(h => checkDistrictHood(d, h));
           });
        }
        if (z.partialDistricts) {
           Object.keys(z.partialDistricts).forEach(d => {
              z.partialDistricts[d].forEach(h => checkDistrictHood(d, h));
           });
        }
     });
     return missing;
  };

  // İstisna Modalı İçin Tüm Mıntıkalardaki Eksikleri Getirir
  const getGlobalMissingDistricts = (gender) => {
     const missing = getMissingMappings();
     let filtered = missing;
     if (gender === 'Tümü') filtered = missing.filter(m => m.status === 'Hiç Tanımlanmamış');
     if (gender === 'Erkek') filtered = missing.filter(m => m.status === 'Hiç Tanımlanmamış' || m.status === 'Sadece Kız (Erkek Eksik)');
     if (gender === 'Kız') filtered = missing.filter(m => m.status === 'Hiç Tanımlanmamış' || m.status === 'Sadece Erkek (Kız Eksik)');
     return [...new Set(filtered.map(m => m.district))].sort();
  };

  const getGlobalMissingNeighborhoods = (district, gender) => {
     if(!district) return [];
     const missing = getMissingMappings();
     let filtered = missing.filter(m => m.district === district);
     if (gender === 'Tümü') filtered = filtered.filter(m => m.status === 'Hiç Tanımlanmamış');
     if (gender === 'Erkek') filtered = filtered.filter(m => m.status === 'Hiç Tanımlanmamış' || m.status === 'Sadece Kız (Erkek Eksik)');
     if (gender === 'Kız') filtered = filtered.filter(m => m.status === 'Hiç Tanımlanmamış' || m.status === 'Sadece Erkek (Kız Eksik)');
     return filtered.map(m => m.neighborhood).sort();
  };

  const openExceptionModal = (center, sourceZone) => {
     setExceptionModal({ isOpen: true, center, sourceZone });
     setExceptionData({ gender: 'Tümü', district: '', neighborhood: '', contactName: '', phone: '' });
  };

  const handleAddException = async () => {
      const { gender, district, neighborhood, contactName, phone } = exceptionData;
      if(!district || !neighborhood || !gender) return alert("Eksik alan seçtiniz.");
      
      const targetZoneName = getMissingMappings().find(m => m.district === district && m.neighborhood === neighborhood)?.zone;
      const targetZone = zones.find(z => z.name === targetZoneName);
      
      if(!targetZone) return alert("Hedef mıntıka bulunamadı.");

      let newMappings = [...(targetZone.mappings || [])];
      let newCenters = [...(targetZone.centers || [])];

      if (!newCenters.some(c => c.id === exceptionModal.center.id)) {
          newCenters.push(exceptionModal.center);
      }

      const newMapObj = { district, neighborhood, gender, centerId: exceptionModal.center.id, contactName, phone: phone || "0531 333 32 32" };
      newMappings.push(newMapObj);

      try {
          setHasMadeChanges(true);
          await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'zones', targetZone.id.toString()), { mappings: newMappings, centers: newCenters });
          alert("İstisna ataması başarıyla tamamlandı!");
          setExceptionModal({ isOpen: false, center: null, sourceZone: null });
      } catch(e) { console.error(e) }
  };

  const handleUpdateStudentStatus = async (studentId, field, value) => {
    try {
      setHasMadeChanges(true);
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'students', studentId), {
         [field]: value
      });
    } catch(err) { console.error(err); alert("Durum güncellenemedi."); }
  };

  const handleAddBlacklist = async () => {
    let p = newBlacklistPhone.replace(/\D/g, '');
    if(p.length > 0 && p[0] !== '5') p = '5' + p;
    if(p.length !== 10) return alert("Lütfen 10 haneli geçerli bir telefon numarası giriniz.");
    try {
      setHasMadeChanges(true);
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'blacklist'), { phone: p });
      setNewBlacklistPhone('');
      alert("Numara kara listeye eklendi.");
    } catch(e) { console.error(e); }
  };

  const handleRemoveBlacklist = async (id) => {
    try {
      setHasMadeChanges(true);
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'blacklist', id));
    } catch(e) { console.error(e); }
  };

  const handleUpdatePrizes = async () => {
    try {
      setHasMadeChanges(true);
      const targetZoneIds = isSuperAdmin ? INITIAL_ZONES.map(z => z.id) : [adminZoneId];
      for (const zId of targetZoneIds) {
         await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'zones', zId.toString()), { prizes: localPrizes });
      }
      alert(`Ödüller başarıyla güncellendi!`);
    } catch (e) { console.error(e); }
  };

  const handleAddSessionRow = () => setExamSessions([...examSessions, { date: '', times: '' }]);
  const handleSessionChange = (index, field, value) => {
    const newSessions = [...examSessions];
    newSessions[index][field] = value;
    setExamSessions(newSessions);
  };
  const handleRemoveSessionRow = (index) => {
    const newSessions = examSessions.filter((_, i) => i !== index);
    setExamSessions(newSessions.length > 0 ? newSessions : [{ date: '', times: '' }]);
  };

  const handleAddExam = async () => {
    if(!examData.title) return alert("Sınav Adı boş bırakılamaz.");
    const formattedSessions = examSessions
      .filter(s => s.date && s.times)
      .map(s => ({
        date: s.date,
        slots: s.times.split(',').map(t => t.trim()).filter(t => t) 
      }));

    if(formattedSessions.length === 0) return alert("Lütfen en az bir geçerli tarih ve saat girin.");

    try {
      setHasMadeChanges(true);
      const targetZoneIds = isSuperAdmin ? INITIAL_ZONES.map(z => z.id) : [adminZoneId];
      for (const zId of targetZoneIds) {
         await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'exams'), {
           zoneId: zId, title: examData.title, sessions: formattedSessions, createdAt: new Date().getTime()
         });
      }
      alert(`Sınav oturumları başarıyla eklendi!`);
      setExamData({ title: '' }); setExamSessions([{ date: '', times: '' }]);
    } catch (e) { console.error(e); }
  };

  const handleDeleteExam = async (examId) => {
      if(!window.confirm("Bu sınav oturumunu tamamen iptal etmek istediğinize emin misiniz?")) return;
      try {
          setHasMadeChanges(true);
          await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'exams', examId));
      } catch(e) { console.error(e); }
  };

  const handleAddCenter = async () => {
    if(!newCenter.name || !newCenter.address) return alert("Kurum adı ve açık adres zorunludur.");
    try {
      setHasMadeChanges(true);
      const centerObj = { id: "c_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9), name: newCenter.name, address: newCenter.address, mapLink: newCenter.mapLink || "" };
      const updatedCenters = [...adminCenters, centerObj];
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'zones', adminZoneId.toString()), { centers: updatedCenters });
      setNewCenter({ name: '', address: '', mapLink: '' });
    } catch (e) { console.error(e); }
  };

  const handleUpdateCenter = async (e) => {
    e.preventDefault();
    if(!editingCenter.name || !editingCenter.address) return alert("Adres ve isim zorunludur.");
    try {
      setHasMadeChanges(true);
      const updatedCenters = adminCenters.map(c => c.id === editingCenter.id ? editingCenter : c);
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'zones', adminZoneId.toString()), { centers: updatedCenters });
      setEditingCenter(null);
    } catch(err) { console.error(err); }
  };

  const handleDeleteCenter = async (centerId) => {
    if(!window.confirm("Bu kurumu silmek istediğinize emin misiniz?")) return;
    try {
      setHasMadeChanges(true);
      const updatedCenters = adminCenters.filter(c => c.id !== centerId);
      const updatedMappings = adminMappings.filter(m => m.centerId !== centerId); 
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'zones', adminZoneId.toString()), { centers: updatedCenters, mappings: updatedMappings });
    } catch (e) { console.error(e); }
  };

  const handleAddMapping = async () => {
    if(!mappingData.gender || !mappingData.district || !mappingData.neighborhood || !mappingData.centerId) return alert("Lütfen Cinsiyet, İlçe, Mahalle ve atanacak kurumu seçin.");
    try {
      setHasMadeChanges(true);
      const newMappings = [...adminMappings];
      const existingIndex = newMappings.findIndex(m => m.district === mappingData.district && m.neighborhood === mappingData.neighborhood && m.gender === mappingData.gender);
      
      const newMapObj = { district: mappingData.district, neighborhood: mappingData.neighborhood, gender: mappingData.gender, centerId: mappingData.centerId, contactName: mappingData.contactName || "", phone: mappingData.phone || "0531 333 32 32" };

      if (existingIndex >= 0) newMappings[existingIndex] = newMapObj;
      else newMappings.push(newMapObj);
      
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'zones', adminZoneId.toString()), { mappings: newMappings });
      alert(`${mappingData.district} / ${mappingData.neighborhood} (${mappingData.gender}) atandı!`);
      setMappingData({ ...mappingData, neighborhood: '', contactName: '', phone: '' }); 
    } catch (e) { console.error(e); }
  };

  const handleBulkUploadExcel = async () => {
    if(!bulkExcelData.trim()) return alert("Lütfen veriyi yapıştırın.");
    
    const rows = bulkExcelData.split('\n');
    let updatedCenters = [...adminCenters];
    let updatedMappings = [...adminMappings];
    let successCount = 0;
    let errors = [];

    for (let i = 0; i < rows.length; i++) {
       let row = rows[i];
       if(!row.trim()) continue;
       
       const cols = row.split('\t');
       if(cols.length < 3) {
           errors.push(`Satır ${i+1}: Sütunlar eksik.`);
           continue;
       }
       
       let rawDistrict = cols[0]?.trim();
       let rawNeighborhood = cols[1]?.trim();

       if (rawDistrict.includes('/') && !rawNeighborhood) {
           const parts = rawDistrict.split('/');
           rawDistrict = parts[0].trim();
           rawNeighborhood = parts[1].trim();
       }

       let rawGender = "Tümü";
       let colOffset = 2; 
       
       const potentialGender = cols[2]?.trim().toLowerCase();
       if (['erkek', 'kız', 'kiz', 'tümü', 'tumu', 'karma'].includes(potentialGender)) {
           if (potentialGender === 'erkek') rawGender = 'Erkek';
           else if (potentialGender === 'kız' || potentialGender === 'kiz') rawGender = 'Kız';
           else rawGender = 'Tümü';
           colOffset = 3; 
       }

       let centerName = cols[colOffset]?.trim();
       let contactName = cols[colOffset+1] ? cols[colOffset+1].trim() : "";
       let phone = cols[colOffset+2] ? cols[colOffset+2].trim() : "";
       let address = cols[colOffset+3] ? cols[colOffset+3].trim() : "";
       let mapLink = cols[colOffset+4] ? cols[colOffset+4].trim() : "";

       if (!rawDistrict || !rawNeighborhood || !centerName) { 
           errors.push(`Satır ${i+1}: İlçe, Mahalle veya Kurum Adı boş olamaz.`); 
           continue; 
       }

       phone = phone.replace(/\D/g, '');
       if (phone.length > 0 && phone[0] !== '5') { phone = '5' + phone; }
       if (phone.length > 10) phone = phone.substring(0, 10);
       if (!phone) phone = "0531 333 32 32";

       const normDistrict = normalizeForSearch(rawDistrict);
       const normNeighborhood = normalizeForSearch(rawNeighborhood);

       const matchedDistrict = adminDistricts.find(d => normalizeForSearch(d) === normDistrict);
       let matchedNeighborhood = null;

       if (matchedDistrict) {
           let allHoodsForDistrict = [];
           if(adminZoneData.partialDistricts && adminZoneData.partialDistricts[matchedDistrict]) {
               allHoodsForDistrict = adminZoneData.partialDistricts[matchedDistrict];
           } else {
               for(let prov in LOCATIONS) {
                   if(LOCATIONS[prov][matchedDistrict]) { allHoodsForDistrict = LOCATIONS[prov][matchedDistrict]; break; }
               }
           }
           matchedNeighborhood = allHoodsForDistrict.find(h => normalizeForSearch(h) === normNeighborhood);
       }

       if (!matchedDistrict || !matchedNeighborhood) { 
           errors.push(`Satır ${i+1}: Veritabanında "${rawDistrict}" ilçesinde "${rawNeighborhood}" bulunamadı.`); 
           continue; 
       }
       
       let center = updatedCenters.find(c => normalizeForSearch(c.name) === normalizeForSearch(centerName));
       if(!center) {
          center = { 
             id: "c_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9), 
             name: centerName, 
             address: address || `${matchedDistrict} / ${matchedNeighborhood}`, 
             mapLink: mapLink 
          };
          updatedCenters.push(center);
       }
       
       const existingMapIndex = updatedMappings.findIndex(m => m.district === matchedDistrict && m.neighborhood === matchedNeighborhood && m.gender === rawGender);
       const newMapObj = { district: matchedDistrict, neighborhood: matchedNeighborhood, gender: rawGender, centerId: center.id, contactName, phone };
       
       if(existingMapIndex >= 0) updatedMappings[existingIndex] = newMapObj;
       else updatedMappings.push(newMapObj);
       
       successCount++;
    }

    if (errors.length > 0) alert("Eksik/Hatalı satırlar atlandı:\n" + errors.join('\n'));
    if (successCount > 0) {
      try {
        setHasMadeChanges(true);
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'zones', adminZoneId.toString()), { centers: updatedCenters, mappings: updatedMappings });
        alert(`${successCount} adet mahalle ataması başarıyla kaydedildi.`);
        setBulkExcelData("");
      } catch(err) { 
        console.error(err); 
        alert("Veritabanına kaydedilirken hata oluştu.");
      }
    } else {
        alert("Hiç geçerli veri bulunamadı. Kopyaladığınız Excel formatını kontrol edin.");
    }
  };

  const handleDeleteMapping = async (district, neighborhood, gender) => {
    try {
      setHasMadeChanges(true);
      const updatedMappings = adminMappings.filter(m => !(m.district === district && m.neighborhood === neighborhood && m.gender === gender));
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'zones', adminZoneId.toString()), { mappings: updatedMappings });
    } catch (e) { console.error(e); }
  };

  const handleSaveResult = async () => {
    const student = resultModal.student;
    const pastExam = { id: student.examId || student.exam?.firebaseId, title: student.examTitle || student.exam?.title, date: student.selectedDate || student.exam?.date, time: student.selectedTime || student.slot, score: resultModal.score, rank: resultModal.rank };
    const pastExams = [...(student.pastExams || []), pastExam];

    try {
      setHasMadeChanges(true);
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'students', student.firebaseId), {
          pastExams: pastExams, examId: null, examTitle: null, selectedDate: null, selectedTime: null, exam: null, slot: null, selectedDegreePrize: null, selectedParticipationPrize: null
      });
      setResultModal({ isOpen: false, student: null, score: '', rank: '' });
      alert("Sonuç kaydedildi.");
    } catch (err) { console.error(err); }
  };

  const handleDeleteStudent = async (studentId, studentName) => {
    if(window.confirm(`${studentName} silinsin mi?`)) {
      try {
        setHasMadeChanges(true);
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'students', studentId));
      } catch (e) { console.error(e); }
    }
  };

  const handleBulkSMS = async () => {
    setSmsModal({ ...smsModal, loading: true });
    
    const targetStudents = smsModal.targetStudent ? [smsModal.targetStudent] : filteredStudents;
    const validStudents = targetStudents.filter(s => s.phone && s.phone.length >= 10);
    
    if (validStudents.length === 0) {
      alert("Gönderilecek numara yok.");
      setSmsModal({ ...smsModal, loading: false, isOpen: false, targetStudent: null });
      return;
    }

    const msgDataArray = validStudents.map(student => {
      const zone = isSuperAdmin ? (zones.find(z => z.id === student.zone?.id) || student.zone) : adminZoneData;
      const stdCenter = getNeighborhoodDetails(zone, student.district, student.neighborhood, student.gender);
      let text = "";

      if (smsModal.type === 'custom') text = smsModal.customMsg;
      else if (smsModal.type === 'announcement') text = `🎯 Büyük fırsat yeniden kapında!\n\nDaha önce katıldığın ödüllü denemeyi hatırlıyor musun? Şimdi çok daha heyecanlısı geliyor! 🚀\n\nYeni ödüllü denememizde yine katılan HERKES kendi seçtiği ödülü kazanma şansı yakalıyor 🎁\nÜstelik dereceye girenleri çok daha büyük sürprizler bekliyor! 🏆🔥\n\nBu fırsatı kaçırma, yerini hemen ayırt!\n👉 Kayıt olmak ve detayları öğrenmek için: odullusinav.net\n\nHadi, bir adım öne geçme zamanı! 💥`;
      else if (smsModal.type === 'reminder') text = `🚀 Sınav heyecanı başlıyor!\n\nYaklaşan sınavımız için kayıtlar tüm hızıyla devam ediyor! 🎉\nSen de yerini almayı unutma — başarıya giden yol burada başlıyor!\n\nÜstelik bu heyecanı tek başına yaşamak zorunda değilsin…\nArkadaşlarını da sınava davet et, birlikte kazanmanın keyfini çıkar! 💪🔥\n\nDetayları öğrenmek ve sınav oturumunla ilgili düzenlemeleri yapmak için hemen\n👉 odullusinav.net üzerinden profiline giriş yap!\n\nHadi, şimdi harekete geçme zamanı! ⏳✨`;
      else if (smsModal.type === 'results') text = `Tebrikler! ${student.fullName || 'Öğrencimiz'}, sınav sonuçlarınız açıklanmıştır.\nPuan ve derecenizi odullusinav.net üzerinden öğrenebilirsiniz.\nBirebir analiz ve ödülleriniz için sınav merkezimizden randevu alabilirsiniz.\nSınav Merkezi: ${stdCenter.centerName}\nİletişim: ${stdCenter.phone}\nAdres: ${stdCenter.address}\nKonum: ${stdCenter.mapLink}`;

      text += SMS_FOOTER;
      return { tel: [student.phone], msg: text };
    });

    const result = await sendSMS(msgDataArray);
    if(result !== false) alert(`${msgDataArray.length} öğrenciye SMS iletildi!`);
    else alert("SMS gönderimi başarısız.");
    
    setSmsModal({ isOpen: false, type: 'custom', customMsg: '', loading: false, targetStudent: null });
  };

  const handleExportExcel = () => {
     let csvContent = "Ogrenci Isim Soyisim;Veli Isim Soyisim;Telefon;Sinif;Cinsiyet;Okul Bilgisi;Ilce;Mahalle;Atanan Sinav Merkezi;Kayitli Sinav ve Seans;Aciklanan Puan;Derece;Katilim Durumu;Gorusme Durumu;Gorusme Sonucu\n";
     
     filteredStudents.forEach(s => {
        const stdZone = isSuperAdmin ? (zones.find(z => z.id === s.zone?.id) || s.zone) : adminZoneData;
        const center = getNeighborhoodDetails(stdZone, s.district, s.neighborhood, s.gender)?.centerName || 'Bekleniyor';
        
        const hasPast = s.pastExams && s.pastExams.length > 0;
        const lastPast = hasPast ? s.pastExams[s.pastExams.length-1] : null;
        const activeExam = (s.examTitle || s.exam?.title) ? `${s.examTitle || s.exam?.title} (${s.selectedDate || s.exam?.date} ${s.selectedTime || s.slot})` : 'Yok / Beklemede';
        const score = lastPast ? lastPast.score : '-';
        const rank = lastPast ? lastPast.rank : '-';
        const clean = str => String(str || '').replace(/;/g, ' ').replace(/\n/g, ' ');

        const row = `${clean(s.fullName)};${clean(s.parentName)};${clean(s.phone)};${clean(s.grade)};${clean(s.gender)};${clean(s.schoolName)};${clean(s.district)};${clean(s.neighborhood)};${clean(center)};${clean(activeExam)};${clean(score)};${clean(rank)};${clean(s.attendance)};${clean(s.interview)};${clean(s.interviewResult)}`;
        csvContent += row + "\n";
     });

     const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
     const url = URL.createObjectURL(blob);
     const link = document.createElement("a");
     link.setAttribute("href", url);
     link.setAttribute("download", "Ogrenci_Listesi.csv");
     document.body.appendChild(link);
     link.click();
     document.body.removeChild(link);
  };

  const getAdminDistricts = () => {
    const dists = [...(adminZoneData.districts || [])];
    if(adminZoneData.partialDistricts) {
      Object.keys(adminZoneData.partialDistricts).forEach(d => {
        if(!dists.includes(d)) dists.push(d);
      });
    }
    return dists.sort();
  };

  const getAdminNeighborhoods = (district) => {
    let allHoods = [];
    if(!district) return [];
    if(adminZoneData.partialDistricts && adminZoneData.partialDistricts[district]) {
      allHoods = adminZoneData.partialDistricts[district].sort();
    } else {
      for(let prov in LOCATIONS) {
         if(LOCATIONS[prov][district]) { allHoods = LOCATIONS[prov][district].sort(); break; }
      }
    }
    const mappedHoods = adminMappings.filter(m => m.district === district && m.gender === mappingData.gender).map(m => m.neighborhood);
    return allHoods.filter(h => !mappedHoods.includes(h));
  };

  // Mıntıka filtreleme datası
  let missingListRaw = getMissingMappings();
  if (missingFilterZone !== 'All') missingListRaw = missingListRaw.filter(m => m.zone === missingFilterZone);
  if (missingFilterStatus !== 'All') missingListRaw = missingListRaw.filter(m => m.status === missingFilterStatus);
  
  const groupedMissing = {};
  missingListRaw.forEach(m => {
      if(!groupedMissing[m.zone]) groupedMissing[m.zone] = [];
      groupedMissing[m.zone].push(m);
  });

  const adminDistricts = getAdminDistricts();
  const adminNeighborhoods = getAdminNeighborhoods(mappingData.district);

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-16 relative">
      <div className="mb-10 border-b-2 border-slate-100 pb-6 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 animate-in fade-in duration-500">
        <div>
          <div className="inline-flex items-center px-4 py-1.5 rounded-lg bg-indigo-100 text-indigo-800 text-sm font-black mb-3 uppercase tracking-wider">
            {adminZoneData.name} Yönetimi
          </div>
          <h1 className="text-4xl font-black text-slate-900">Mıntıka Paneli</h1>
          <p className="text-slate-500 mt-2 font-bold text-lg">Bölgenize ait ayarlar, sınav planlaması, kurum eşleştirmeleri ve kayıtlı öğrenciler.</p>
        </div>
        <button onClick={handleLogoutWithSync} disabled={isSyncing} className="flex items-center text-red-600 bg-red-50 hover:bg-red-100 px-5 py-2.5 rounded-xl font-bold transition">
          {isSyncing ? "Senkronize Ediliyor..." : <><LogOut className="w-5 h-5 mr-2"/> Güvenli Çıkış</>}
        </button>
      </div>

      <div className="flex flex-wrap gap-4 mb-10 border-b-2 border-slate-100 pb-6">
        <button onClick={() => setActiveTab('ayarlar')} className={`px-6 py-3 rounded-2xl font-black transition-all text-base ${activeTab === 'ayarlar' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
          <Settings className="w-5 h-5 inline mr-2"/> Sınav & Ödül Ayarları
        </button>
        {!isSuperAdmin && (
          <button onClick={() => setActiveTab('merkezler')} className={`px-6 py-3 rounded-2xl font-black transition-all text-base ${activeTab === 'merkezler' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
            <Building2 className="w-5 h-5 inline mr-2"/> Sınav Yerleri & Atamalar
          </button>
        )}
        <button onClick={() => setActiveTab('ogrenci')} className={`px-6 py-3 rounded-2xl font-black transition-all text-base ${activeTab === 'ogrenci' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
          <Users className="w-5 h-5 inline mr-2"/> Öğrenci Listesi ({filteredStudents.length})
        </button>
        {isSuperAdmin && (
           <button onClick={() => setActiveTab('mahalleler')} className={`px-6 py-3 rounded-2xl font-black transition-all text-base ${activeTab === 'mahalleler' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-600 border border-slate-100 hover:bg-slate-50'}`}>
             <Map className="w-5 h-5 inline mr-2"/> Mahalle İstatistikleri
           </button>
        )}
        {isSuperAdmin && (
           <button onClick={() => setActiveTab('karaliste')} className={`px-6 py-3 rounded-2xl font-black transition-all text-base ${activeTab === 'karaliste' ? 'bg-red-600 text-white shadow-lg' : 'bg-white text-red-600 border border-red-100 hover:bg-red-50'}`}>
             <ShieldAlert className="w-5 h-5 inline mr-2"/> Kara Liste Yönetimi
           </button>
        )}
      </div>

      {activeTab === 'mahalleler' && isSuperAdmin && (
         <div className="bg-white rounded-[3rem] shadow-xl border-4 border-slate-100 p-8 md:p-12 animate-in fade-in zoom-in-95 duration-300">
           <h3 className="font-black text-3xl text-slate-900 mb-6 flex items-center"><Map className="mr-3 w-8 h-8 text-indigo-600"/> Mıntıka ve Mahalle İstatistikleri</h3>
           
           <div className="overflow-x-auto rounded-3xl border-2 border-slate-100 mb-10">
             <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="bg-slate-50 text-slate-500 text-sm uppercase tracking-widest border-b-2 border-slate-100">
                   <th className="p-4 font-black">Mıntıka Adı</th>
                   <th className="p-4 font-black text-center">Sorumlu Mah.</th>
                   <th className="p-4 font-black text-center text-indigo-600">Atanan Mah.</th>
                   <th className="p-4 font-black text-center text-blue-600">Erkek S.Yeri</th>
                   <th className="p-4 font-black text-center text-pink-600">Kız S.Yeri</th>
                   <th className="p-4 font-black text-center text-emerald-600">Karma (Tümü)</th>
                 </tr>
               </thead>
               <tbody className="divide-y-2 divide-slate-50">
                 {zones.map(z => {
                   const totalHoods = getZoneTotalHoods(z);
                   const mappings = z.mappings || [];
                   const atananHoods = new Set(mappings.map(m => `${m.district}-${m.neighborhood}`)).size;

                   const erkekCenters = new Set(mappings.filter(m => m.gender === 'Erkek').map(m => m.centerId)).size;
                   const kizCenters = new Set(mappings.filter(m => m.gender === 'Kız').map(m => m.centerId)).size;
                   const tumuCenters = new Set(mappings.filter(m => m.gender === 'Tümü' || !m.gender).map(m => m.centerId)).size;

                   const isExpanded = expandedZoneId === z.id;

                   return (
                     <React.Fragment key={z.id}>
                       <tr className="hover:bg-slate-50 cursor-pointer transition-colors" onClick={() => setExpandedZoneId(isExpanded ? null : z.id)}>
                         <td className="p-4 font-black text-slate-800 flex items-center">
                            {isExpanded ? <ChevronDown className="w-5 h-5 mr-2 text-slate-400"/> : <ChevronRight className="w-5 h-5 mr-2 text-slate-400"/>} {z.name}
                         </td>
                         <td className="p-4 font-bold text-slate-600 text-center">{totalHoods}</td>
                         <td className="p-4 font-black text-indigo-600 text-center">{atananHoods}</td>
                         <td className="p-4 font-black text-blue-600 text-center">{erkekCenters}</td>
                         <td className="p-4 font-black text-pink-600 text-center">{kizCenters}</td>
                         <td className="p-4 font-black text-emerald-600 text-center">{tumuCenters}</td>
                       </tr>
                       {isExpanded && (
                         <tr>
                           <td colSpan="6" className="bg-slate-50/50 p-6 border-b-4 border-slate-100">
                             <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                                <h4 className="font-black text-xl mb-4 text-slate-800">{z.name} - Kurum İstatislikleri</h4>
                                {z.centers?.length > 0 ? (
                                   <table className="w-full text-sm text-left">
                                      <thead>
                                         <tr className="text-slate-500 uppercase tracking-wider border-b-2 border-slate-100">
                                            <th className="py-3 font-black">Kurum Adı</th>
                                            <th className="py-3 font-black text-center text-blue-600">Erkek Ataması</th>
                                            <th className="py-3 font-black text-center text-pink-600">Kız Ataması</th>
                                            <th className="py-3 font-black text-center text-emerald-600">Karma Ataması</th>
                                            <th className="py-3 font-black text-right">İşlem</th>
                                         </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-100">
                                         {z.centers.map(c => {
                                            const cMap = mappings.filter(m => m.centerId === c.id);
                                            const cErkek = cMap.filter(m => m.gender === 'Erkek').length;
                                            const cKiz = cMap.filter(m => m.gender === 'Kız').length;
                                            const cTumu = cMap.filter(m => m.gender === 'Tümü' || !m.gender).length;
                                            return (
                                               <tr key={c.id} className="hover:bg-slate-50">
                                                  <td className="py-3 font-bold text-slate-700">{c.name}</td>
                                                  <td className="py-3 text-center font-black text-blue-600">{cErkek}</td>
                                                  <td className="py-3 text-center font-black text-pink-600">{cKiz}</td>
                                                  <td className="py-3 text-center font-black text-emerald-600">{cTumu}</td>
                                                  <td className="py-3 text-right">
                                                     <button onClick={(e) => { e.stopPropagation(); openExceptionModal(c, z); }} className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-xl font-bold text-xs hover:bg-indigo-200 transition">
                                                        İstisna Atama
                                                     </button>
                                                  </td>
                                               </tr>
                                            )
                                         })}
                                      </tbody>
                                   </table>
                                ) : (
                                   <p className="text-slate-500 font-bold text-sm bg-slate-50 p-4 rounded-xl border border-slate-100">Bu mıntıkada henüz kurum bulunmuyor.</p>
                                )}
                             </div>
                           </td>
                         </tr>
                       )}
                     </React.Fragment>
                   )
                 })}
               </tbody>
             </table>
           </div>

           <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 mb-6 pt-10 border-t-2 border-slate-100">
              <h3 className="text-2xl font-black text-slate-800">Sınav Yeri Tanımlanmamış / Eksik Mahalleler</h3>
              <div className="flex flex-wrap gap-4">
                 <select value={missingFilterZone} onChange={e=>setMissingFilterZone(e.target.value)} className="p-3 border-2 border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-indigo-500">
                    <option value="All">Tüm Mıntıkalar</option>
                    {zones.map(z => <option key={z.id} value={z.name}>{z.name}</option>)}
                 </select>
                 <select value={missingFilterStatus} onChange={e=>setMissingFilterStatus(e.target.value)} className="p-3 border-2 border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-indigo-500">
                    <option value="All">Tüm Durumlar</option>
                    <option value="Hiç Tanımlanmamış">Hiç Tanımlanmamış</option>
                    <option value="Sadece Erkek (Kız Eksik)">Sadece Erkek (Kız Eksik)</option>
                    <option value="Sadece Kız (Erkek Eksik)">Sadece Kız (Erkek Eksik)</option>
                 </select>
              </div>
           </div>

           {Object.keys(groupedMissing).length > 0 ? (
              Object.keys(groupedMissing).map(zoneName => (
                 <div key={zoneName} className="mb-10">
                    <h4 className="font-black text-xl text-indigo-900 mb-4 bg-indigo-50 p-4 rounded-2xl border border-indigo-100">{zoneName} Eksiklikleri</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {groupedMissing[zoneName].map((m, idx) => (
                        <div key={idx} className="bg-red-50 border border-red-100 p-4 rounded-2xl flex flex-col shadow-sm">
                          <span className="font-bold text-slate-800">{m.district} / {m.neighborhood}</span>
                          <span className="mt-2 text-sm font-black text-red-600 bg-red-100 px-3 py-1 rounded-lg w-max">{m.status}</span>
                        </div>
                      ))}
                    </div>
                 </div>
              ))
           ) : (
              <div className="text-center py-10 font-bold text-emerald-500 bg-emerald-50 rounded-2xl border border-emerald-100">
                Bu filtreye uygun eksik mahalle bulunamadı!
              </div>
           )}
         </div>
      )}

      {activeTab === 'karaliste' && isSuperAdmin && (
         <div className="bg-white rounded-[3rem] shadow-xl border-4 border-red-100 p-8 md:p-12 animate-in fade-in zoom-in-95 duration-300">
           <h3 className="font-black text-3xl text-red-900 mb-2 flex items-center"><ShieldAlert className="mr-3 w-8 h-8"/> Kara Liste (Yasaklı Numaralar)</h3>
           <p className="text-base font-bold text-slate-500 mb-8">Bu listeye eklenen personel numaraları sisteme kayıt oluşturamazlar.</p>
           
           <div className="bg-red-50 p-6 rounded-2xl border border-red-100 flex gap-4 mb-8">
             <input type="text" value={newBlacklistPhone} onChange={e=>setNewBlacklistPhone(e.target.value.replace(/\D/g, ''))} className="flex-1 p-4 rounded-xl border border-red-200 outline-none focus:border-red-500 font-bold" placeholder="5XX XXX XX XX" />
             <button onClick={handleAddBlacklist} className="bg-red-600 text-white px-8 py-4 rounded-xl font-black shadow-lg hover:bg-red-700 transition">Numarayı Yasakla</button>
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
             {blacklistPhones.map(bl => (
                <div key={bl.id} className="bg-white border-2 border-red-100 p-4 rounded-xl flex justify-between items-center shadow-sm">
                   <span className="font-black tracking-widest text-slate-800">0{bl.phone}</span>
                   <button onClick={() => handleRemoveBlacklist(bl.id)} className="text-red-400 hover:text-red-600 bg-red-50 p-2 rounded-lg transition"><Trash2 className="w-5 h-5"/></button>
                </div>
             ))}
             {blacklistPhones.length === 0 && <div className="col-span-full text-center text-slate-400 font-bold py-10">Listede numara bulunmuyor.</div>}
           </div>
         </div>
      )}

      {/* 1. SEKMEYE AİT İÇERİKLER: Sınav ve Ödül Ayarları */}
      {activeTab === 'ayarlar' && (
        <div className="bg-white rounded-[3rem] shadow-xl border-4 border-slate-100 p-8 md:p-12 animate-in fade-in zoom-in-95 duration-300">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 border-b-2 border-slate-100 pb-8 gap-4">
            <div>
              <h3 className="font-black text-3xl text-slate-900 mb-2">{adminZoneData.name}</h3>
              <p className="text-base font-bold text-slate-500">{isSuperAdmin ? "Sorumlu Olduğunuz: TÜM TÜRKİYE" : `Sorumlu Olduğunuz İlçeler/Bölgeler: ${adminDistricts.join(', ')}`}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* ÖDÜL YÖNETİMİ */}
            <div>
              <div className="text-sm font-black text-indigo-600 uppercase mb-4 tracking-wider flex items-center"><Gift className="w-6 h-6 mr-2"/> {isSuperAdmin ? 'Tüm Türkiye' : 'Bölge'} Ödüllerini Yönet</div>
              <div className="space-y-6 bg-slate-50 p-6 rounded-3xl border-2 border-slate-100">
                
                {/* Büyük Ödül */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="text-sm font-black text-slate-800 mb-3 flex items-center"><Trophy className="w-5 h-5 text-yellow-500 mr-2"/> Büyük Ödül</div>
                  <input type="text" value={localPrizes.grand.title} onChange={e=>setLocalPrizes({...localPrizes, grand: {...localPrizes.grand, title: e.target.value}})} className="w-full text-sm font-bold p-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 mb-2" placeholder="Ödül Başlığı (Örn: PlayStation 5)"/>
                  <textarea rows="2" value={localPrizes.grand.desc} onChange={e=>setLocalPrizes({...localPrizes, grand: {...localPrizes.grand, desc: e.target.value}})} className="w-full text-sm font-medium p-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 mb-2 resize-none" placeholder="Açıklama (İsteğe bağlı)"/>
                  <input type="text" value={localPrizes.grand.img} onChange={e=>setLocalPrizes({...localPrizes, grand: {...localPrizes.grand, img: e.target.value}})} className="w-full text-sm font-bold p-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500" placeholder="Resim Linki veya Dosya Adı (Örn: ps5.png)"/>
                </div>

                {/* Derece Ödülleri */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="text-sm font-black text-slate-800 mb-3 flex justify-between items-center">
                     <span className="flex items-center"><Award className="w-5 h-5 text-indigo-500 mr-2"/> Derece Ödülleri</span>
                     <button onClick={() => setLocalPrizes({...localPrizes, degree: [...localPrizes.degree, {title:'', desc:'', img:''}]})} className="text-indigo-600 bg-indigo-50 p-1.5 rounded-lg hover:bg-indigo-100"><Plus className="w-4 h-4"/></button>
                  </div>
                  {localPrizes.degree.map((pz, idx) => (
                    <div key={idx} className="mb-4 pb-4 border-b border-slate-100 last:border-0 last:mb-0 last:pb-0">
                      <div className="flex gap-2 mb-2">
                          <input type="text" value={pz.title} onChange={e => { const newArr=[...localPrizes.degree]; newArr[idx].title=e.target.value; setLocalPrizes({...localPrizes, degree: newArr}); }} className="flex-1 text-sm font-bold p-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500" placeholder={`${idx+1}. Ödül Başlığı`}/>
                          {idx > 0 && <button onClick={() => { const newArr=localPrizes.degree.filter((_,i)=>i!==idx); setLocalPrizes({...localPrizes, degree:newArr}); }} className="p-3 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl"><Trash2 className="w-4 h-4"/></button>}
                      </div>
                      <input type="text" value={pz.img} onChange={e => { const newArr=[...localPrizes.degree]; newArr[idx].img=e.target.value; setLocalPrizes({...localPrizes, degree: newArr}); }} className="w-full text-sm font-bold p-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 mb-2" placeholder="Resim Linki veya Dosya Adı (Örn: bisiklet.png)"/>
                      <textarea rows="2" value={pz.desc} onChange={e => { const newArr=[...localPrizes.degree]; newArr[idx].desc=e.target.value; setLocalPrizes({...localPrizes, degree: newArr}); }} className="w-full text-sm font-medium p-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 resize-none" placeholder="Açıklama"/>
                    </div>
                  ))}
                </div>

                {/* Katılım Ödülleri */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="text-sm font-black text-slate-800 mb-3 flex justify-between items-center">
                     <span className="flex items-center"><Gift className="w-5 h-5 text-emerald-500 mr-2"/> Katılım Ödülleri</span>
                     <button onClick={() => setLocalPrizes({...localPrizes, participation: [...localPrizes.participation, {title:'', desc:'', img:''}]})} className="text-emerald-600 bg-emerald-50 p-1.5 rounded-lg hover:bg-emerald-100"><Plus className="w-4 h-4"/></button>
                  </div>
                  {localPrizes.participation.map((pz, idx) => (
                    <div key={idx} className="mb-4 pb-4 border-b border-slate-100 last:border-0 last:mb-0 last:pb-0">
                      <div className="flex gap-2 mb-2">
                          <input type="text" value={pz.title} onChange={e => { const newArr=[...localPrizes.participation]; newArr[idx].title=e.target.value; setLocalPrizes({...localPrizes, participation: newArr}); }} className="flex-1 text-sm font-bold p-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500" placeholder={`${idx+1}. Ödül Başlığı`}/>
                          {idx > 0 && <button onClick={() => { const newArr=localPrizes.participation.filter((_,i)=>i!==idx); setLocalPrizes({...localPrizes, participation:newArr}); }} className="p-3 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl"><Trash2 className="w-4 h-4"/></button>}
                      </div>
                      <input type="text" value={pz.img} onChange={e => { const newArr=[...localPrizes.participation]; newArr[idx].img=e.target.value; setLocalPrizes({...localPrizes, participation: newArr}); }} className="w-full text-sm font-bold p-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 mb-2" placeholder="Resim Linki veya Dosya Adı"/>
                      <textarea rows="2" value={pz.desc} onChange={e => { const newArr=[...localPrizes.participation]; newArr[idx].desc=e.target.value; setLocalPrizes({...localPrizes, participation: newArr}); }} className="w-full text-sm font-medium p-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 resize-none" placeholder="Açıklama"/>
                    </div>
                  ))}
                </div>

                <button onClick={handleUpdatePrizes} className="bg-slate-800 hover:bg-slate-900 text-white text-base font-black py-4 px-4 rounded-xl transition w-full shadow-lg">Ödülleri {isSuperAdmin ? 'Tüm Türkiye İçin ' : ''}Güncelle</button>
              </div>
            </div>

            <div>
              <div className="text-sm font-black text-indigo-600 uppercase mb-4 tracking-wider flex items-center"><CalendarIcon className="w-6 h-6 mr-2"/> Yeni Sınav Oturumu Planla</div>
              <div className="space-y-4 bg-slate-50 p-6 rounded-3xl border-2 border-slate-100">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">Sınav Adı (Etkinlik Adı)</label>
                  <input type="text" value={examData.title} onChange={e=>setExamData({title:e.target.value})} className="w-full text-base font-bold p-4 rounded-xl border border-slate-200 outline-none focus:border-indigo-500" placeholder="Örn: 1. Dönem LGS Provası"/>
                </div>
                
                <div className="pt-2 border-t-2 border-slate-200">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-3 block">Tarih ve Saatler (Çoklu Eklenebilir)</label>
                  {examSessions.map((session, idx) => (
                    <div key={idx} className="flex gap-3 mb-3 items-center">
                      <input type="date" value={session.date} onChange={e=>handleSessionChange(idx, 'date', e.target.value)} className="w-2/5 text-sm font-bold p-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"/>
                      <input type="text" value={session.times} onChange={e=>handleSessionChange(idx, 'times', e.target.value)} className="w-3/5 text-sm font-bold p-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500" placeholder="Saatler (Örn: 10:00, 12:00)"/>
                      {idx > 0 && (
                          <button onClick={() => handleRemoveSessionRow(idx)} className="p-3 text-red-500 hover:bg-red-50 rounded-xl"><Trash2 className="w-5 h-5"/></button>
                      )}
                    </div>
                  ))}
                  <button onClick={handleAddSessionRow} className="text-sm font-black text-indigo-600 mt-2 hover:underline flex items-center"><Plus className="w-4 h-4 mr-1"/> Başka Bir Tarih Ekle</button>
                </div>
                
                <button onClick={handleAddExam} className="bg-indigo-600 hover:bg-indigo-700 text-white text-base font-black py-4 px-4 rounded-xl transition w-full shadow-md shadow-indigo-200 flex items-center justify-center mt-6">
                  <CheckCircle2 className="w-5 h-5 mr-2"/> Oturumları Toplu Ekle
                </button>
              </div>

              <div className="mt-8">
                  <div className="text-sm font-black text-indigo-600 uppercase mb-4 tracking-wider">Planlanmış Aktif Sınavlar</div>
                  <div className="space-y-4">
                    {filteredExams.length > 0 ? filteredExams.map(exam => {
                      const sessions = exam.sessions || [];
                      return (
                        <div key={exam.firebaseId} className="bg-indigo-50 border-2 border-indigo-100 p-5 rounded-2xl relative">
                          <button onClick={() => handleDeleteExam(exam.firebaseId)} className="absolute top-4 right-4 p-2 text-red-500 hover:bg-red-100 rounded-xl transition" title="Sınavı Sil"><Trash2 className="w-5 h-5"/></button>
                          <h4 className="font-black text-lg text-indigo-900 mb-3 pr-10">{exam.title} {isSuperAdmin ? `(${zones.find(z=>z.id === exam.zoneId)?.name})` : ''}</h4>
                          <div className="space-y-2">
                            {sessions.map((session, idx) => {
                               const [y, m, d] = session.date.split('-');
                               const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
                               const trDate = `${parseInt(d)} ${monthNames[parseInt(m)-1]}`;
                               return (
                                 <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-2">
                                   <span className="bg-white px-3 py-1.5 rounded-xl border border-indigo-200 text-sm font-bold text-slate-700 w-max"><CalendarIcon className="inline w-4 h-4 mr-1 text-indigo-500"/> {trDate}</span>
                                   <div className="flex gap-2">
                                     {session.slots && session.slots.map(s => <span key={s} className="bg-indigo-600 text-white px-2 py-1 text-xs font-black rounded-lg">{s}</span>)}
                                   </div>
                                 </div>
                               )
                            })}
                          </div>
                        </div>
                      );
                    }) : (
                      <div className="font-bold bg-slate-50 p-5 rounded-2xl border-2 border-slate-100 text-center text-slate-400">Bu mıntıkaya atanmış aktif sınav yok.</div>
                    )}
                  </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* 2. YENİ SEKMEYE AİT İÇERİKLER: Sınav Merkezleri ve Atamalar */}
      {activeTab === 'merkezler' && !isSuperAdmin && (
         <div className="bg-white rounded-[3rem] shadow-xl border-4 border-slate-100 p-8 md:p-12 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 border-b-2 border-slate-100 pb-8 gap-4">
              <div>
                <h3 className="font-black text-3xl text-slate-900 mb-2">Sınav Yerleri ve Atamalar</h3>
                <p className="text-base font-bold text-slate-500">Mıntıkaya yeni kurumlar ekleyin ve mahalleleri bu kurumlara bağlarken ÖNCE CİNSİYET (Erkek/Kız/Tümü) seçin.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              
              <div className="lg:col-span-1 space-y-8">
                 
                 <div>
                    <div className="text-sm font-black text-indigo-600 uppercase mb-4 tracking-wider flex items-center"><Building2 className="w-6 h-6 mr-2"/> Yeni Kurum / Sınav Yeri Ekle</div>
                    <div className="space-y-4 bg-slate-50 p-6 rounded-3xl border-2 border-slate-100">
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">Kurum Adı</label>
                        <input type="text" value={newCenter.name} onChange={e=>setNewCenter({...newCenter, name: e.target.value})} className="w-full text-sm font-bold p-4 rounded-xl border border-slate-200 outline-none focus:border-indigo-500" placeholder="Örn: Şekerpınar Sınav Merkezi"/>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">Açık Adres</label>
                        <textarea rows="3" value={newCenter.address} onChange={e=>setNewCenter({...newCenter, address: e.target.value})} className="w-full text-sm font-bold p-4 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 resize-none" placeholder="Örn: Mutlu Sk. No:5 Çayırova"/>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">Google Harita Linki</label>
                        <input type="url" value={newCenter.mapLink} onChange={e=>setNewCenter({...newCenter, mapLink: e.target.value})} className="w-full text-sm font-bold p-4 rounded-xl border border-slate-200 outline-none focus:border-indigo-500" placeholder="https://maps.app.goo.gl/..."/>
                      </div>
                      <button onClick={handleAddCenter} className="bg-slate-800 hover:bg-slate-900 text-white text-base font-black py-4 px-4 rounded-xl transition w-full shadow-lg">Kurumu Ekle</button>
                    </div>
                 </div>

                 <div>
                    <div className="text-sm font-black text-emerald-600 uppercase mb-4 tracking-wider flex items-center"><FileText className="w-6 h-6 mr-2"/> Toplu Ekle (Excel'den Yapıştır)</div>
                    <div className="space-y-4 bg-emerald-50/50 p-6 rounded-3xl border-2 border-emerald-100">
                       <p className="text-xs font-bold text-emerald-800 mb-2">Excel tablonuzdaki şu sütunları seçip kopyalayın ve aşağıdaki alana yapıştırın:<br/><br/><b>İlçe | Mahalle | Cinsiyet (İsteğe Bağlı) | Kurum Adı | Sorumlu Hoca | Telefon | Açık Adres | Harita Linki</b></p>
                       <textarea 
                         rows="5" 
                         value={bulkExcelData}
                         onChange={e => setBulkExcelData(e.target.value)}
                         className="w-full text-xs font-mono p-4 rounded-xl border border-emerald-200 outline-none focus:border-emerald-500 resize-none whitespace-pre" 
                         placeholder="Gebze&#9;Akarçeşme&#9;Erkek&#9;Şekerpınar Eğitim...&#9;Ahmet Hoca&#9;0532..."/>
                       <button onClick={handleBulkUploadExcel} className="bg-emerald-600 hover:bg-emerald-700 text-white text-base font-black py-4 px-4 rounded-xl transition w-full shadow-lg">Excel Verilerini İçe Aktar</button>
                    </div>
                 </div>

              </div>

              <div className="lg:col-span-2 space-y-8">
                {adminCenters.length === 0 ? (
                  <div className="bg-amber-50 border-4 border-amber-100 rounded-3xl p-10 text-center font-bold text-amber-800">
                    Henüz tanımlanmış bir kurum bulunmuyor. Sol taraftan bir Sınav Yeri ekleyin veya Excel'den toplu içe aktarın.
                  </div>
                ) : (
                  adminCenters.map(center => {
                    const mappedHoods = adminMappings.filter(m => m.centerId === center.id);
                    
                    if (editingCenter?.id === center.id) {
                       return (
                          <div key={center.id} className="border-4 border-indigo-400 rounded-3xl p-6 bg-indigo-50 relative">
                             <h4 className="font-black text-xl text-indigo-900 mb-4">Kurumu Düzenle</h4>
                             <form onSubmit={handleUpdateCenter} className="space-y-3">
                                <div><label className="text-xs font-bold text-slate-500 uppercase ml-1 block">Kurum Adı</label><input type="text" value={editingCenter.name} onChange={e=>setEditingCenter({...editingCenter, name: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200" required/></div>
                                <div><label className="text-xs font-bold text-slate-500 uppercase ml-1 block">Adres</label><input type="text" value={editingCenter.address} onChange={e=>setEditingCenter({...editingCenter, address: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200" required/></div>
                                <div><label className="text-xs font-bold text-slate-500 uppercase ml-1 block">Harita Linki</label><input type="text" value={editingCenter.mapLink} onChange={e=>setEditingCenter({...editingCenter, mapLink: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200"/></div>
                                <div className="flex gap-3 mt-4">
                                   <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold flex items-center"><Save className="w-4 h-4 mr-2"/> Kaydet</button>
                                   <button type="button" onClick={() => setEditingCenter(null)} className="bg-slate-200 text-slate-700 px-6 py-2 rounded-xl font-bold flex items-center"><X className="w-4 h-4 mr-2"/> İptal</button>
                                </div>
                             </form>
                          </div>
                       )
                    }

                    return (
                      <div key={center.id} className="border-4 border-slate-100 rounded-3xl p-6 bg-white relative group animate-in fade-in zoom-in-95 duration-300">
                        <div className="absolute top-6 right-6 flex gap-2">
                           <button onClick={() => setEditingCenter(center)} className="p-2 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="Düzenle"><Edit3 className="w-5 h-5"/></button>
                           <button onClick={() => handleDeleteCenter(center.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Sil"><Trash2 className="w-5 h-5"/></button>
                        </div>
                        <h4 className="font-black text-2xl text-slate-800 mb-2 pr-20">{center.name}</h4>
                        <div className="text-sm font-medium text-slate-500 mb-6 flex items-start">
                          <MapPin className="w-4 h-4 mr-1 flex-shrink-0 text-slate-400 mt-0.5"/> {center.address}
                        </div>

                        <div className="bg-indigo-50/50 p-5 rounded-2xl border-2 border-indigo-100 mb-6">
                           <h5 className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-3">Cinsiyete Göre Mahalle Bağla</h5>
                           <div className="flex flex-col sm:flex-row gap-3">
                              
                              <select 
                                className="w-full sm:w-1/6 text-sm font-bold p-3 rounded-xl border border-indigo-200 outline-none focus:border-indigo-500 bg-white"
                                value={mappingData.gender}
                                onChange={e => setMappingData({...mappingData, gender: e.target.value, district: '', neighborhood: '', centerId: center.id})}>
                                <option value="">Cinsiyet Seç</option>
                                <option value="Tümü">Tümü (Karma)</option>
                                <option value="Erkek">Erkek</option>
                                <option value="Kız">Kız</option>
                              </select>

                              <select 
                                className="w-full sm:w-1/4 text-sm font-bold p-3 rounded-xl border border-indigo-200 outline-none focus:border-indigo-500 bg-white disabled:opacity-50"
                                disabled={!mappingData.gender}
                                value={mappingData.district}
                                onChange={e => setMappingData({...mappingData, district: e.target.value, neighborhood: '', centerId: center.id})}>
                                <option value="">İlçe Seç</option>
                                {adminDistricts.map(d => <option key={d} value={d}>{d}</option>)}
                              </select>

                              <select 
                                className="w-full sm:w-1/4 text-sm font-bold p-3 rounded-xl border border-indigo-200 outline-none focus:border-indigo-500 bg-white disabled:opacity-50"
                                disabled={!mappingData.district || !mappingData.gender}
                                value={mappingData.neighborhood}
                                onChange={e => setMappingData({...mappingData, neighborhood: e.target.value, centerId: center.id})}>
                                <option value="">Atanmamış Mahalle Seç</option>
                                {getAdminUnmappedNeighborhoods(mappingData.district, mappingData.gender).map(hood => (
                                  <option key={hood} value={hood}>{hood} Mah.</option>
                                ))}
                              </select>
                              
                              <input type="text" value={mappingData.contactName} onChange={e=>setMappingData({...mappingData, contactName: e.target.value, centerId: center.id})} className="w-full sm:w-1/4 text-sm font-bold p-3 rounded-xl border border-indigo-200 outline-none focus:border-indigo-500 bg-white" placeholder="Sorumlu İsim"/>

                              <input type="tel" value={mappingData.phone} onChange={e=>setMappingData({...mappingData, phone: e.target.value, centerId: center.id})} className="w-full sm:w-1/4 text-sm font-bold p-3 rounded-xl border border-indigo-200 outline-none focus:border-indigo-500 bg-white" placeholder="Sorumlu Tel"/>
                              
                              <button onClick={handleAddMapping} disabled={!mappingData.centerId || !mappingData.gender || !mappingData.district || !mappingData.neighborhood} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-black p-3 px-6 rounded-xl transition disabled:opacity-50">Ekle</button>
                           </div>
                        </div>

                        <div>
                          <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Bağlı Olan Mahalleler ({mappedHoods.length})</h5>
                          <div className="flex flex-wrap gap-3">
                            {mappedHoods.length > 0 ? mappedHoods.map((m, i) => (
                               <div key={i} className="flex flex-col bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-sm relative group pr-10 hover:shadow-md transition">
                                  <span className="font-black text-slate-800 mb-1">{m.district} / {m.neighborhood} <span className="text-xs ml-1 text-indigo-500 bg-indigo-100 px-2 py-0.5 rounded-md">{m.gender || 'Tümü'}</span></span>
                                  <span className="text-slate-500 font-medium text-xs"><Users className="w-3 h-3 inline mr-1"/>{m.contactName || 'İsimsiz'} - {m.phone}</span>
                                  <button onClick={() => handleDeleteMapping(m.district, m.neighborhood, m.gender)} className="absolute top-1/2 right-3 transform -translate-y-1/2 text-slate-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100"><Trash2 className="w-5 h-5"/></button>
                               </div>
                            )) : (
                               <span className="text-sm font-medium text-slate-400 italic">Henüz hiç mahalle bağlanmamış.</span>
                            )}
                          </div>
                        </div>

                      </div>
                    )
                  })
                )}
              </div>

            </div>
         </div>
      )}

      {/* 3. SEKMEYE AİT İÇERİKLER: Öğrenci Listesi */}
      {activeTab === 'ogrenci' && (
        <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 p-10 overflow-hidden relative animate-in fade-in zoom-in-95 duration-300">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <h2 className="text-3xl font-black text-slate-800">{isSuperAdmin ? "Tüm Türkiye Kayıtları" : "Bölge Kayıtları"} ({filteredStudents.length})</h2>
            <div className="flex flex-wrap gap-3">
              <button onClick={handleExportExcel} className="bg-green-50 font-black px-6 py-3 rounded-2xl text-green-700 border-2 border-green-200 hover:bg-green-100 transition flex items-center">
                <Download className="w-5 h-5 mr-2" /> Excel İndir
              </button>
              <button 
                onClick={() => setSmsModal({ isOpen: true, type: 'custom', customMsg: '', loading: false, targetStudent: null })}
                className="bg-indigo-600 font-black px-6 py-3 rounded-2xl text-white hover:bg-indigo-700 flex items-center shadow-xl shadow-indigo-200 transition">
                <MessageSquare className="w-5 h-5 mr-3"/> Bölgeye Toplu SMS
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-3xl border-2 border-slate-100">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-sm uppercase tracking-widest border-b-2 border-slate-100">
                  <th className="p-6 font-black">Öğrenci Adı</th>
                  <th className="p-6 font-black">Konum (İlçe/Mah)</th>
                  <th className="p-6 font-black">Aktif Sınav & Merkez</th>
                  <th className="p-6 font-black">Durum & Notlar</th>
                  <th className="p-6 font-black text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-slate-50">
                {filteredStudents.length === 0 ? (
                  <tr><td colSpan="5" className="p-16 text-center text-slate-400 font-bold text-lg">Bu alana ait henüz kayıtlı öğrenci bulunmuyor.</td></tr>
                ) : (
                  filteredStudents.map(student => {
                    const hasActiveExam = !!(student.examId || student.examTitle || student.exam);
                    const realZoneData = isSuperAdmin ? (zones.find(z => z.id === student.zone?.id) || student.zone) : adminZoneData;
                    const stdCenter = getNeighborhoodDetails(realZoneData, student.district, student.neighborhood, student.gender);
                    
                    return (
                      <tr key={student.firebaseId} className="hover:bg-slate-50 transition-colors border-b border-slate-100">
                        <td className="p-6 font-black text-slate-900 text-lg">
                          {student.fullName}
                          <div className="text-xs font-bold text-slate-400">{student.grade}. Sınıf - {student.gender} - {student.phone}</div>
                        </td>
                        <td className="p-6 font-bold text-slate-600">{student.district} / {student.neighborhood}</td>
                        <td className="p-6">
                          {hasActiveExam ? (
                            <>
                              <div className="font-bold text-slate-800">{stdCenter.centerName}</div>
                              <div className="text-xs font-black text-indigo-600">{student.examTitle || student.exam?.title} ({student.selectedDate || student.exam?.date} - {student.selectedTime || student.slot})</div>
                            </>
                          ) : (
                            <span className="text-sm font-bold text-slate-400">Bekleme Havuzunda</span>
                          )}
                        </td>
                        
                        {/* Öğrenci Durum Güncellemeleri */}
                        <td className="p-4 flex flex-col gap-1">
                          <select value={student.attendance || ''} onChange={e => handleUpdateStudentStatus(student.firebaseId, 'attendance', e.target.value)} className="text-xs border border-slate-200 rounded p-1 outline-none text-slate-700 font-bold">
                             <option value="">Katılım Durumu</option>
                             <option value="Katıldı">Katıldı</option>
                             <option value="Katılmadı">Katılmadı</option>
                          </select>
                          <select value={student.interview || ''} onChange={e => handleUpdateStudentStatus(student.firebaseId, 'interview', e.target.value)} className="text-xs border border-slate-200 rounded p-1 outline-none text-slate-700 font-bold">
                             <option value="">Görüşme</option>
                             <option value="Görüşüldü">Görüşüldü</option>
                             <option value="Görüşülmedi">Görüşülmedi</option>
                          </select>
                          <select value={student.interviewResult || ''} onChange={e => handleUpdateStudentStatus(student.firebaseId, 'interviewResult', e.target.value)} className="text-xs border border-slate-200 rounded p-1 outline-none text-slate-700 font-bold">
                             <option value="">Netice</option>
                             <option value="Sıbyan">Sıbyan</option>
                             <option value="Nehari">Nehari</option>
                             <option value="Yatılı">Yatılı</option>
                             <option value="Olumsuz">Olumsuz</option>
                          </select>
                        </td>

                        <td className="p-6 text-right space-x-2 whitespace-nowrap">
                          {hasActiveExam && (
                            <button 
                              onClick={() => setResultModal({ isOpen: true, student, score: '', rank: '' })}
                              className="bg-yellow-100 text-yellow-700 font-black px-4 py-2 rounded-xl text-sm hover:bg-yellow-200 transition"
                            >
                              Sonuç Gir
                            </button>
                          )}
                          <button 
                              onClick={() => setSmsModal({ isOpen: true, type: 'custom', customMsg: '', loading: false, targetStudent: student })}
                              className="text-indigo-400 hover:text-indigo-600 bg-white border border-indigo-200 hover:bg-indigo-50 p-2 rounded-xl transition"
                              title="Bu Öğrenciye Özel SMS Gönder"
                            >
                              <Send className="w-5 h-5"/>
                          </button>
                          <button 
                              onClick={() => handleDeleteStudent(student.firebaseId, student.fullName)}
                              className="text-red-400 hover:text-red-600 bg-white border border-red-200 hover:bg-red-50 p-2 rounded-xl transition"
                              title="Öğrenciyi Sil"
                            >
                              <Trash2 className="w-5 h-5"/>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* İSTİSNA ATAMA MODALI */}
      {exceptionModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] shadow-2xl p-10 w-full max-w-2xl relative animate-in zoom-in-95">
            <button onClick={() => setExceptionModal({ isOpen: false, center: null, sourceZone: null })} className="absolute top-8 right-8 text-slate-400 hover:text-slate-800"><Plus className="w-8 h-8 transform rotate-45"/></button>
            <Map className="w-16 h-16 text-indigo-500 mx-auto mb-6" />
            <h3 className="text-3xl font-black text-center text-slate-900 mb-2">İstisna Mahalle Ataması</h3>
            <p className="text-center text-slate-500 font-bold mb-8">
              <strong className="text-indigo-600">{exceptionModal.center?.name}</strong> kurumuna, farklı mıntıkalardan eksik kalan mahalleleri atayabilirsiniz.
            </p>
            
            <div className="space-y-4 mb-8">
               <select 
                 className="w-full text-sm font-bold p-4 rounded-xl border border-indigo-200 outline-none focus:border-indigo-500 bg-white"
                 value={exceptionData.gender}
                 onChange={e => setExceptionData({...exceptionData, gender: e.target.value, district: '', neighborhood: ''})}>
                 <option value="Tümü">Tümü (Karma)</option>
                 <option value="Erkek">Erkek</option>
                 <option value="Kız">Kız</option>
               </select>

               <select 
                 className="w-full text-sm font-bold p-4 rounded-xl border border-indigo-200 outline-none focus:border-indigo-500 bg-white disabled:opacity-50"
                 value={exceptionData.district}
                 onChange={e => setExceptionData({...exceptionData, district: e.target.value, neighborhood: ''})}>
                 <option value="">Atanmamış İlçe Seçin (Türkiye Geneli)</option>
                 {getGlobalMissingDistricts(exceptionData.gender).map(d => <option key={d} value={d}>{d}</option>)}
               </select>

               <select 
                 className="w-full text-sm font-bold p-4 rounded-xl border border-indigo-200 outline-none focus:border-indigo-500 bg-white disabled:opacity-50"
                 disabled={!exceptionData.district}
                 value={exceptionData.neighborhood}
                 onChange={e => setExceptionData({...exceptionData, neighborhood: e.target.value})}>
                 <option value="">Eksik Mahalle Seçin</option>
                 {getGlobalMissingNeighborhoods(exceptionData.district, exceptionData.gender).map(h => <option key={h} value={h}>{h} Mah.</option>)}
               </select>

               <input type="text" value={exceptionData.contactName} onChange={e=>setExceptionData({...exceptionData, contactName: e.target.value})} className="w-full text-sm font-bold p-4 rounded-xl border border-indigo-200 outline-none focus:border-indigo-500 bg-white" placeholder="Sorumlu İsim"/>
               <input type="tel" value={exceptionData.phone} onChange={e=>setExceptionData({...exceptionData, phone: e.target.value})} className="w-full text-sm font-bold p-4 rounded-xl border border-indigo-200 outline-none focus:border-indigo-500 bg-white" placeholder="Sorumlu Tel"/>
            </div>
            
            <button onClick={handleAddException} disabled={!exceptionData.district || !exceptionData.neighborhood || !exceptionData.gender} className="w-full bg-indigo-600 text-white font-black text-xl py-5 rounded-2xl hover:bg-indigo-700 transition shadow-xl shadow-indigo-500/30 flex items-center justify-center disabled:opacity-50">
              İstisna Atamasını Tamamla
            </button>
          </div>
        </div>
      )}

      {/* AKILLI SMS GÖNDERME MODALI */}
      {smsModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] shadow-2xl p-10 w-full max-w-2xl relative animate-in zoom-in-95">
            <button onClick={() => setSmsModal({ ...smsModal, isOpen: false })} className="absolute top-8 right-8 text-slate-400 hover:text-slate-800"><Plus className="w-8 h-8 transform rotate-45"/></button>
            <MessageSquare className="w-16 h-16 text-indigo-500 mx-auto mb-6" />
            <h3 className="text-3xl font-black text-center text-slate-900 mb-2">Akıllı SMS Gönderimi</h3>
            <p className="text-center text-slate-500 font-bold mb-8">
              {smsModal.targetStudent ? `${smsModal.targetStudent.fullName} isimli öğrenciye özel mesaj gönderiyorsunuz.` : "Bu bölgedeki kayıtlı öğrencilerin hepsine kendi bilgilerini içeren mesaj atın."}
            </p>
            
            <div className="space-y-6 mb-8">
              <div>
                <label className="block text-sm font-black text-slate-700 mb-3 uppercase tracking-wider">Mesaj Şablonu Seçin</label>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setSmsModal({...smsModal, type: 'announcement'})} className={`p-4 rounded-2xl font-bold border-4 transition-all text-sm ${smsModal.type === 'announcement' ? 'border-indigo-500 bg-indigo-50 text-indigo-800' : 'border-slate-100 text-slate-600 hover:border-slate-200'}`}>Sınav Duyurusu</button>
                  <button onClick={() => setSmsModal({...smsModal, type: 'reminder'})} className={`p-4 rounded-2xl font-bold border-4 transition-all text-sm ${smsModal.type === 'reminder' ? 'border-indigo-500 bg-indigo-50 text-indigo-800' : 'border-slate-100 text-slate-600 hover:border-slate-200'}`}>Sınav Hatırlatması</button>
                  <button onClick={() => setSmsModal({...smsModal, type: 'results'})} className={`p-4 rounded-2xl font-bold border-4 transition-all text-sm ${smsModal.type === 'results' ? 'border-indigo-500 bg-indigo-50 text-indigo-800' : 'border-slate-100 text-slate-600 hover:border-slate-200'}`}>Sonuç ve Randevu</button>
                  <button onClick={() => setSmsModal({...smsModal, type: 'custom'})} className={`p-4 rounded-2xl font-bold border-4 transition-all text-sm ${smsModal.type === 'custom' ? 'border-indigo-500 bg-indigo-50 text-indigo-800' : 'border-slate-100 text-slate-600 hover:border-slate-200'}`}>Özel Mesaj</button>
                </div>
              </div>

              {smsModal.type === 'custom' && (
                <div>
                  <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wider">Özel Mesaj İçeriği</label>
                  <textarea rows="4" value={smsModal.customMsg} onChange={e => setSmsModal({...smsModal, customMsg: e.target.value})} className="w-full border-4 border-slate-100 rounded-2xl px-6 py-4 text-base font-bold focus:border-indigo-500 outline-none resize-none" placeholder="Mesajınızı buraya yazın..." />
                </div>
              )}

              <div className="bg-amber-50 p-5 rounded-2xl border border-amber-200">
                <span className="text-xs font-black text-amber-600 uppercase tracking-widest mb-1 block">Önemli Not</span>
                <p className="text-sm font-bold text-amber-900 leading-relaxed">
                  Tüm mesajların sonuna yasal zorunluluk olan iptal metni otomatik eklenecektir. Adres, telefon gibi bilgiler şablona göre otomatik doldurulacaktır.
                </p>
              </div>
            </div>
            
            <button onClick={handleBulkSMS} disabled={smsModal.loading} className="w-full bg-indigo-600 text-white font-black text-xl py-5 rounded-2xl hover:bg-indigo-700 transition shadow-xl shadow-indigo-500/30 flex items-center justify-center">
              {smsModal.loading ? "Gönderiliyor..." : (smsModal.targetStudent ? "Sadece Bu Öğrenciye Gönder" : "Tüm Bölgeye Gönder")} {!smsModal.loading && <Send className="ml-3 w-6 h-6"/>}
            </button>
          </div>
        </div>
      )}

      {/* SONUÇ GİRME MODALI */}
      {resultModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] shadow-2xl p-10 w-full max-w-md relative animate-in zoom-in-95">
            <button onClick={() => setResultModal({ isOpen: false, student: null, score: '', rank: '' })} className="absolute top-6 right-6 text-slate-400 hover:text-slate-800"><Plus className="w-8 h-8 transform rotate-45"/></button>
            <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
            <h3 className="text-2xl font-black text-center text-slate-900 mb-2">Sınav Sonucu Ekle</h3>
            <p className="text-center text-slate-500 font-bold mb-8">{resultModal.student?.fullName} öğrencisi için sonuç giriliyor.</p>
            
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wider">Sınav Puanı</label>
                <input type="number" value={resultModal.score} onChange={e => setResultModal({...resultModal, score: e.target.value})} className="w-full border-4 border-slate-100 rounded-2xl px-6 py-4 text-xl font-bold focus:border-indigo-500 outline-none" placeholder="Örn: 450.5" />
              </div>
              <div>
                <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wider">Sıralama (Derece)</label>
                <input type="number" value={resultModal.rank} onChange={e => setResultModal({...resultModal, rank: e.target.value})} className="w-full border-4 border-slate-100 rounded-2xl px-6 py-4 text-xl font-bold focus:border-indigo-500 outline-none" placeholder="Örn: 1" />
              </div>
            </div>
            
            <button onClick={handleSaveResult} className="w-full bg-indigo-600 text-white font-black text-xl py-5 rounded-2xl hover:bg-indigo-700 transition shadow-xl shadow-indigo-500/30">Sonucu Kaydet</button>
          </div>
        </div>
      )}
    </div>
  );
}