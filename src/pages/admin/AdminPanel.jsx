import React, { useState, useEffect } from 'react';
import { Settings, Building2, Users, Map, ShieldAlert, LogOut, KeyRound, AlertTriangle, Download, Search } from 'lucide-react';
import { collection, query, where, getDocs, getCountFromServer } from "firebase/firestore"; 
import { db, appId } from "../../services/firebase"; 
import { doc, updateDoc } from "firebase/firestore";
import { sendSMS, SMS_FOOTER } from '../../services/smsService';
import { DEFAULT_PRIZE_OBJ, INITIAL_ZONES } from '../../data/constants';
import { getNeighborhoodDetails, normalizeForSearch, parsePrizeArray } from '../../utils/helpers';

import SettingsTab from './SettingsTab';
import CentersTab from './CentersTab';
import StudentsTab from './StudentsTab';
import StatsTab from './StatsTab';
import BlacklistTab from './BlacklistTab';

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

export default function AdminPanel({ adminZoneId, isSuperAdmin, onLogout, zones, exams }) {
  const [activeTab, setActiveTab] = useState('ayarlar'); 
  const [isSyncing, setIsSyncing] = useState(false); 
  const [hasMadeChanges, setHasMadeChanges] = useState(false);
  
  const [fetchedStudents, setFetchedStudents] = useState([]);
  const [totalStudentsCount, setTotalStudentsCount] = useState(0);
  const [myZoneCount, setMyZoneCount] = useState(0);
  
  const [filterZone, setFilterZone] = useState('');
  const [filterCenter, setFilterCenter] = useState('');
  const [chk8Erkek, setCheck8Erkek] = useState(true);
  const [chkOtherErkek, setCheckOtherErkek] = useState(true);
  const [chkKiz, setCheckKiz] = useState(true);

  const [showQuotaWarning, setShowQuotaWarning] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [pendingQuery, setPendingQuery] = useState([]);
  const [isFetchingData, setIsFetchingData] = useState(false);

  const adminZoneData = isSuperAdmin 
     ? { id: 'ALL', name: "Genel Merkez (Tüm Mıntıkalar)", active: true, districts: [], prizes: {grand: DEFAULT_PRIZE_OBJ, degree: [], participation: []}, centers: [], mappings: [] } 
     : zones.find(z => z.id === adminZoneId);
     
  const filteredExams = isSuperAdmin ? exams : exams.filter(e => e.zoneId === adminZoneId);

  useEffect(() => {
    if (!isSuperAdmin && adminZoneId) {
        setFilterZone(adminZoneId.toString());
    }
  }, [isSuperAdmin, adminZoneId]);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const collRef = collection(db, 'artifacts', appId, 'public', 'data', 'students');
        const totalSnap = await getCountFromServer(collRef);
        setTotalStudentsCount(totalSnap.data().count);

        if (!isSuperAdmin && adminZoneId) {
            const zoneQ = query(collRef, where("zone.id", "==", adminZoneId));
            const zoneSnap = await getCountFromServer(zoneQ);
            setMyZoneCount(zoneSnap.data().count);
        }
      } catch(e) { console.error("Sayaç hatası:", e); }
    };
    fetchCounts();
  }, [adminZoneId, isSuperAdmin]);

  if (!adminZoneData) return <div>Erişim Hatası. Mıntıka bulunamadı.</div>;

  const selectedZoneObj = zones.find(z => z.id.toString() === filterZone);
  let availableCenters = [];
  if (selectedZoneObj) {
      const cNames = new Set();
      if (selectedZoneObj.centers) selectedZoneObj.centers.forEach(c => cNames.add(c.name));
      availableCenters = [...cNames].sort();
  }

  const handleCalculateQuery = async () => {
      if (!chk8Erkek && !chkOtherErkek && !chkKiz) return alert("Lütfen en az bir öğrenci grubu seçiniz.");
      setIsFetchingData(true);
      try {
          let queriesToRun = [];
          const baseConstraints = [];
          if (filterZone) baseConstraints.push(where("zone.id", "==", parseInt(filterZone)));

          const collRef = collection(db, 'artifacts', appId, 'public', 'data', 'students');

          if (chk8Erkek && chkOtherErkek && chkKiz) {
              queriesToRun.push(query(collRef, ...baseConstraints));
          } else {
              if (chk8Erkek) queriesToRun.push(query(collRef, ...baseConstraints, where("gender", "==", "Erkek"), where("grade", "==", "8")));
              if (chkOtherErkek) queriesToRun.push(query(collRef, ...baseConstraints, where("gender", "==", "Erkek"), where("grade", "in", ["3","4","5","6","7"])));
              if (chkKiz) queriesToRun.push(query(collRef, ...baseConstraints, where("gender", "==", "Kız")));
          }

          let tCount = 0;
          for (let q of queriesToRun) {
              const s = await getCountFromServer(q);
              tCount += s.data().count;
          }
          
          setPendingCount(tCount);
          setPendingQuery(queriesToRun);
          setShowQuotaWarning(true);
      } catch(e) { alert("Hesaplama hatası."); }
      setIsFetchingData(false);
  };

  const executeStudentFetch = async () => {
      setShowQuotaWarning(false);
      setIsFetchingData(true);
      try {
          let allStudents = [];
          for (let q of pendingQuery) {
              const snap = await getDocs(q);
              allStudents = [...allStudents, ...snap.docs.map(doc => ({ firebaseId: doc.id, ...doc.data() }))];
          }

          const uniqueMap = new Map();
          allStudents.forEach(s => uniqueMap.set(s.firebaseId, s));
          let finalStudents = Array.from(uniqueMap.values());

          if (filterCenter) {
              finalStudents = finalStudents.filter(s => {
                  const z = zones.find(zn => zn.id === s.zone?.id);
                  if (!z) return false;
                  const centerInfo = getNeighborhoodDetails(z, s.district, s.neighborhood, s.gender, s.grade);
                  return centerInfo.centerName === filterCenter;
              });
          }

          setFetchedStudents(finalStudents);
          if (finalStudents.length === 0) alert("Seçtiğiniz kuruma/filtreye uyan öğrenci bulunamadı.");
      } catch(e) { alert("Veriler indirilemedi."); }
      setIsFetchingData(false);
  };

  const handleLogoutWithSync = async () => {
    if (!hasMadeChanges) {
       onLogout();
       return;
    }
    setIsSyncing(true);
    try {
      let dbUpdates = [];
      let smsQueue = [];

      for (let student of fetchedStudents) {
        const zone = zones.find(z => z.id === student.zone?.id) || student.zone;
        if (!zone) continue;

        let updates = {};
        let needsSms = false;
        let smsText = "";

        const centerInfo = getNeighborhoodDetails(zone, student.district, student.neighborhood, student.gender, student.grade);
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
           dbUpdates.push({ ref: doc(db, 'artifacts', appId, 'public', 'data', 'students', student.firebaseId), data: updates });
        }
        if (needsSms && student.phone) {
           smsQueue.push({ tel: [student.phone], msg: smsText });
        }
      }

      if (dbUpdates.length > 0) {
         const updatePromises = dbUpdates.map(u => updateDoc(u.ref, u.data));
         await Promise.all(updatePromises);
      }
      if (smsQueue.length > 0) await sendSMS(smsQueue);

    } catch(err) {
      console.error("Çıkış senkronizasyon hatası:", err);
    } finally {
      setIsSyncing(false);
      onLogout(); 
    }
  };

  const displayCount = isSuperAdmin ? totalStudentsCount : myZoneCount;

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-16 relative">
      
      {showQuotaWarning && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl text-center border-4 border-amber-400">
            <AlertTriangle className="w-20 h-20 text-amber-500 mx-auto mb-6 animate-pulse" />
            <h3 className="text-2xl font-black text-slate-800 mb-4">Veri İndirme Onayı</h3>
            <p className="text-slate-600 font-medium mb-6 text-lg">
              Seçtiğiniz gruplardaki öğrencileri görüntülemek için veritabanına bağlanılacaktır.
            </p>
            
            <div className="bg-amber-50 text-amber-800 p-5 rounded-xl font-bold border border-amber-200 mb-8 text-sm">
              <span className="block text-lg mb-2">Günlük 50.000 işlem kotanızdan</span>
              <span className="text-3xl text-amber-600 block mb-2">{pendingCount} okuma eksilecektir.</span>
              {filterCenter && (
                 <span className="block text-xs opacity-80 mt-2 text-indigo-700">
                    (Not: Seçtiğiniz <b>"{filterCenter}"</b> kurumunun öğrencilerini ayıklamak için bölgedeki {pendingCount} kişinin tamamı taranıp sizin için süzülecektir.)
                 </span>
              )}
            </div>
            
            <div className="flex gap-4">
              <button onClick={() => setShowQuotaWarning(false)} className="flex-1 bg-slate-200 text-slate-700 font-black py-4 rounded-xl hover:bg-slate-300 transition">Vazgeç</button>
              <button onClick={executeStudentFetch} className="flex-1 bg-amber-500 text-white font-black py-4 rounded-xl hover:bg-amber-600 transition flex justify-center items-center">
                 Onaylıyorum <Download className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-10 border-b-2 border-slate-100 pb-6 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 animate-in fade-in duration-500">
        <div>
          <div className="inline-flex items-center px-4 py-1.5 rounded-lg bg-indigo-100 text-indigo-800 text-sm font-black mb-3 uppercase tracking-wider">
            {adminZoneData.name} Yönetimi
          </div>
          <h1 className="text-4xl font-black text-slate-900">Mıntıka Paneli</h1>
          <p className="text-slate-500 mt-2 font-bold text-lg">Bölgenize ait ayarlar, sınav planlaması, kurum eşleştirmeleri ve kayıtlı öğrenciler.</p>
        </div>
        <button onClick={handleLogoutWithSync} disabled={isSyncing} className="flex items-center text-red-600 bg-red-50 hover:bg-red-100 px-5 py-2.5 rounded-xl font-bold transition border border-red-200 shadow-sm">
          {isSyncing ? "Senkronize Ediliyor..." : <><LogOut className="w-5 h-5 mr-2"/> Güvenli Çıkış</>}
        </button>
      </div>

      <div className="flex flex-wrap gap-4 mb-10 border-b-2 border-slate-100 pb-6">
        <button onClick={() => setActiveTab('ayarlar')} className={`px-6 py-3 rounded-2xl font-black transition-all text-base ${activeTab === 'ayarlar' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}>
          <Settings className="w-5 h-5 inline mr-2"/> Sınav & Ödül Ayarları
        </button>
        {!isSuperAdmin && (
          <button onClick={() => setActiveTab('merkezler')} className={`px-6 py-3 rounded-2xl font-black transition-all text-base ${activeTab === 'merkezler' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}>
            <Building2 className="w-5 h-5 inline mr-2"/> Sınav Yerleri & Atamalar
          </button>
        )}
        <button onClick={() => setActiveTab('ogrenci')} className={`px-6 py-3 rounded-2xl font-black transition-all text-base ${activeTab === 'ogrenci' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}>
          <Users className="w-5 h-5 inline mr-2"/> Öğrenci Listesi ({displayCount})
        </button>
        {isSuperAdmin && (
           <button onClick={() => setActiveTab('mahalleler')} className={`px-6 py-3 rounded-2xl font-black transition-all text-base ${activeTab === 'mahalleler' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
             <Map className="w-5 h-5 inline mr-2"/> Mahalle İstatistikleri
           </button>
        )}
        {isSuperAdmin && (
           <button onClick={() => setActiveTab('karaliste')} className={`px-6 py-3 rounded-2xl font-black transition-all text-base ${activeTab === 'karaliste' ? 'bg-red-600 text-white shadow-lg' : 'bg-white text-red-600 border border-red-200 hover:bg-red-50'}`}>
             <ShieldAlert className="w-5 h-5 inline mr-2"/> Kara Liste Yönetimi
           </button>
        )}
      </div>

      <div className="mt-8 animate-in fade-in duration-300">
        {activeTab === 'ayarlar' && <SettingsTab adminZoneData={adminZoneData} isSuperAdmin={isSuperAdmin} adminZoneId={adminZoneId} setHasMadeChanges={setHasMadeChanges} filteredExams={filteredExams} zones={zones} />}
        
        {/* DÜZELTME: Sınav Yerleri ve Atamalar Sekmesi Çağrıldı */}
        {activeTab === 'merkezler' && !isSuperAdmin && <CentersTab adminZoneData={adminZoneData} adminZoneId={adminZoneId} setHasMadeChanges={setHasMadeChanges} />}
        
        {activeTab === 'ogrenci' && (
           <>
             <div className="bg-white border-4 border-slate-100 rounded-[3rem] p-8 md:p-12 shadow-xl mb-8">
                <h3 className="text-2xl font-black text-slate-800 mb-6 border-b-2 border-slate-100 pb-4 flex items-center"><Search className="w-6 h-6 mr-3 text-indigo-500"/> Öğrenci Verilerini İndir & Filtrele</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                      <label className="block text-sm font-bold text-slate-500 mb-2 uppercase tracking-wider">Mıntıka / Bölge</label>
                      <select value={filterZone} onChange={(e) => {setFilterZone(e.target.value); setFilterCenter('');}} disabled={!isSuperAdmin} className="w-full border-2 border-slate-200 rounded-xl px-4 py-4 font-bold text-lg focus:border-indigo-500 outline-none bg-slate-50 disabled:opacity-70">
                         <option value="">Tüm Mıntıkalar (Genel Merkez)</option>
                         {zones.filter(z=>z.active).map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-bold text-slate-500 mb-2 uppercase tracking-wider">Kurum (Sınav Merkezi) Seçimi</label>
                      <select value={filterCenter} onChange={(e) => setFilterCenter(e.target.value)} disabled={!filterZone} className="w-full border-2 border-slate-200 rounded-xl px-4 py-4 font-bold text-lg focus:border-indigo-500 outline-none bg-slate-50 disabled:opacity-70">
                         <option value="">Tüm Kurumları Getir</option>
                         {availableCenters.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                </div>

                <div className="mb-10">
                    <label className="block text-sm font-bold text-slate-500 mb-3 uppercase tracking-wider">İndirilecek Öğrenci Grupları</label>
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                        <label className="flex items-center gap-3 cursor-pointer p-4 rounded-2xl border-2 border-slate-100 hover:bg-indigo-50 hover:border-indigo-200 transition select-none flex-1">
                            <input type="checkbox" checked={chk8Erkek} onChange={e=>setCheck8Erkek(e.target.checked)} className="w-6 h-6 accent-indigo-600 rounded cursor-pointer" />
                            <span className="font-bold text-slate-700 text-lg">8. Sınıf Erkekler</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer p-4 rounded-2xl border-2 border-slate-100 hover:bg-indigo-50 hover:border-indigo-200 transition select-none flex-1">
                            <input type="checkbox" checked={chkOtherErkek} onChange={e=>setCheckOtherErkek(e.target.checked)} className="w-6 h-6 accent-indigo-600 rounded cursor-pointer" />
                            <span className="font-bold text-slate-700 text-lg">3-7. Sınıf Erkekler</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer p-4 rounded-2xl border-2 border-slate-100 hover:bg-pink-50 hover:border-pink-200 transition select-none flex-1">
                            <input type="checkbox" checked={chkKiz} onChange={e=>setCheckKiz(e.target.checked)} className="w-6 h-6 accent-pink-600 rounded cursor-pointer" />
                            <span className="font-bold text-slate-700 text-lg">Tüm Kızlar (3-8. Sınıf)</span>
                        </label>
                    </div>
                </div>

                <button onClick={handleCalculateQuery} disabled={isFetchingData} className="w-full bg-indigo-600 text-white font-black text-xl py-5 rounded-2xl hover:bg-indigo-700 transition shadow-xl disabled:opacity-50 flex items-center justify-center">
                   {isFetchingData ? "Maliyet Hesaplanıyor..." : <><Download className="w-6 h-6 mr-3"/> Kriterlere Uyan Verileri İndir</>}
                </button>
             </div>

             {fetchedStudents.length > 0 ? (
                <StudentsTab students={fetchedStudents} isSuperAdmin={isSuperAdmin} adminZoneData={adminZoneData} zones={zones} setHasMadeChanges={setHasMadeChanges} />
             ) : (
                <div className="text-center font-bold text-slate-400 py-10 bg-white rounded-3xl border-4 border-slate-50">Lütfen yukarıdan kriterleri seçip "Verileri İndir" butonuna tıklayın.</div>
             )}
           </>
        )}

        {/* DÜZELTME: İstatistikler Sekmesi Çağrıldı */}
        {activeTab === 'mahalleler' && isSuperAdmin && <StatsTab zones={zones} setHasMadeChanges={setHasMadeChanges} />}
        {activeTab === 'karaliste' && isSuperAdmin && <BlacklistTab setHasMadeChanges={setHasMadeChanges} />}
      </div>
    </div>
  );
}