import React, { useState } from 'react';
import { Settings, Building2, Users, Map, ShieldAlert, LogOut, KeyRound } from 'lucide-react';
import { db, appId } from "../../services/firebase"; 
import { doc, updateDoc } from "firebase/firestore";
import { sendSMS, SMS_FOOTER } from '../../services/smsService';
import { DEFAULT_PRIZE_OBJ, INITIAL_ZONES } from '../../data/constants';
import { getNeighborhoodDetails, normalizeForSearch, parsePrizeArray } from '../../utils/helpers';

// Bölünmüş Alt Sekmeler
import SettingsTab from './SettingsTab';
import CentersTab from './CentersTab';
import StudentsTab from './StudentsTab';
import StatsTab from './StatsTab';
import BlacklistTab from './BlacklistTab';
// DÜZELTME: 8. Sınıf Erkek İstisnası İçin Yeni Sekme Eklendi
import SpecialBoysCentersTab from './SpecialBoysCentersTab';

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

  if (!adminZoneData) return <div>Erişim Hatası. Mıntıka bulunamadı.</div>;

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
        {/* DÜZELTME: 8. Sınıf Erkek Özel Merkezler Sekmesi */}
        {isSuperAdmin && (
           <button onClick={() => setActiveTab('erkekler')} className={`px-6 py-3 rounded-2xl font-black transition-all text-base ${activeTab === 'erkekler' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-blue-600 border border-blue-100 hover:bg-blue-50'}`}>
             <Building2 className="w-5 h-5 inline mr-2"/> 8. Sınıf Erkek (Özel)
           </button>
        )}
      </div>

      <div className="mt-8 animate-in fade-in duration-300">
        {activeTab === 'ayarlar' && <SettingsTab adminZoneData={adminZoneData} isSuperAdmin={isSuperAdmin} adminZoneId={adminZoneId} setHasMadeChanges={setHasMadeChanges} filteredExams={filteredExams} zones={zones} />}
        {activeTab === 'merkezler' && !isSuperAdmin && <CentersTab adminZoneData={adminZoneData} adminZoneId={adminZoneId} setHasMadeChanges={setHasMadeChanges} />}
        {activeTab === 'ogrenci' && <StudentsTab students={filteredStudents} isSuperAdmin={isSuperAdmin} adminZoneData={adminZoneData} zones={zones} setHasMadeChanges={setHasMadeChanges} />}
        {activeTab === 'mahalleler' && isSuperAdmin && <StatsTab zones={zones} setHasMadeChanges={setHasMadeChanges} />}
        {activeTab === 'karaliste' && isSuperAdmin && <BlacklistTab setHasMadeChanges={setHasMadeChanges} />}
        {/* DÜZELTME: Yeni Bileşen Çağrıldı */}
        {activeTab === 'erkekler' && isSuperAdmin && <SpecialBoysCentersTab zones={zones} setHasMadeChanges={setHasMadeChanges} />}
      </div>
    </div>
  );
}