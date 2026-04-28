import React, { useState, useEffect, useCallback } from 'react';
import { Building2, Users, LogOut, Settings, MapPin, Save, Trash2, CalendarIcon, Send, AlertTriangle, Plus, CheckCircle2, Gift, Edit } from 'lucide-react';
import { collection, query, where, getDocs, doc, updateDoc, addDoc, deleteDoc, getDoc } from "firebase/firestore"; 
import { db, appId } from "../../services/firebase"; 
import { getNeighborhoodDetails, formatToTurkishDate } from '../../utils/helpers';
import { sendSMS, SMS_FOOTER } from '../../services/smsService';
import { LOCATIONS } from '../../data/constants';
import StudentsTab from './StudentsTab';

const genderKeys = ["Erkek", "Kız", "8. Sınıf Erkek"];

export default function CenterAdminPanel({ adminAuth, onLogout, zones, exams }) {
  const [activeTab, setActiveTab] = useState('ogrenci');
  const [hasMadeChanges, setHasMadeChanges] = useState(false);
  const [fetchedStudents, setFetchedStudents] = useState([]);
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [appointmentData, setAppointmentData] = useState({ date: '', time: '' });

  const adminZoneData = zones.find(z => z.id === adminAuth.zoneId);
  const centerData = adminZoneData?.centers?.find(c => c.id === adminAuth.centerId);
  const centerMappings = adminZoneData?.mappings?.filter(m => m.centerId === centerData?.id) || [];

  const [editCenterInfo, setEditCenterInfo] = useState({
     name: centerData?.name || '', address: centerData?.address || '', mapLink: centerData?.mapLink || '', password: centerData?.password || '',
     contacts: centerData?.contacts ? JSON.parse(JSON.stringify(centerData.contacts)) : { "Erkek": {active:false, name:'', phone:''}, "Kız": {active:false, name:'', phone:''}, "8. Sınıf Erkek": {active:false, name:'', phone:''} }
  });

  const [borrowData, setBorrowData] = useState({ district: '', neighborhood: '', gender: '' });

  const centerExams = exams.filter(e => e.centerId === centerData?.id && e.active !== false);
  const [examData, setExamData] = useState({ title: '' });
  const [examSessions, setExamSessions] = useState([{ date: '', times: '' }]);
  const [editingExamId, setEditingExamId] = useState(null);

  const [useCustomPrizes, setUseCustomPrizes] = useState(centerData?.useCustomPrizes || false);
  const [localPrizes, setLocalPrizes] = useState(centerData?.customPrizes || { participation: [{title:'', desc:'', img:''}], degree: [{title:'', desc:'', img:''}] });

  // 🚀 DÜZELTME 2: useCallback ile sabitledik
  const handleFetchStudents = useCallback(async () => {
      setIsFetchingData(true);
      try {
          const collRef = collection(db, 'artifacts', appId, 'public', 'data', 'students');
          const q = query(collRef, where("zone.id", "==", parseInt(adminAuth.zoneId)));
          const snap = await getDocs(q);
          const allZoneStudents = snap.docs.map(document => ({ firebaseId: document.id, ...document.data() }));
          const myStudents = allZoneStudents.filter(s => {
              const centerInfo = getNeighborhoodDetails(adminZoneData, s.district, s.neighborhood, s.gender, s.grade);
              return centerInfo.centerName === centerData?.name;
          });
          setFetchedStudents(myStudents);
      } catch(e) { console.error(e); }
      setIsFetchingData(false);
  }, [adminAuth.zoneId, adminZoneData, centerData?.name]);

  useEffect(() => { handleFetchStudents(); }, [handleFetchStudents]);

  // 🚀 DÜZELTME 3: Yazma öncesi güncel zone verisini çekiyoruz ki başka yöneticinin değişikliği ezilmesin (Concurrent Write Fix)
  const handleSaveCenterInfo = async () => {
     try {
         const zoneDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'zones', adminZoneData.id.toString());
         const zoneDoc = await getDoc(zoneDocRef);
         const freshCenters = zoneDoc.data()?.centers || [];
         
         const updatedCenters = freshCenters.map(c => c.id === centerData.id ? { ...c, ...editCenterInfo } : c);
         await updateDoc(zoneDocRef, { centers: updatedCenters });
         
         alert("Kurum bilgileriniz başarıyla güncellendi.");
         window.location.reload();
     } catch(e) { alert("Güncelleme hatası: Lütfen internetinizi kontrol edin."); }
  };

  const handleToggleAppointmentMode = async () => {
     try {
         const zoneDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'zones', adminZoneData.id.toString());
         const zoneDoc = await getDoc(zoneDocRef);
         const freshCenters = zoneDoc.data()?.centers || [];
         
         const newMode = !centerData.isAppointmentModeActive;
         const updatedCenters = freshCenters.map(c => c.id === centerData.id ? { ...c, isAppointmentModeActive: newMode } : c);
         await updateDoc(zoneDocRef, { centers: updatedCenters });
         
         alert(`Randevulu sistem ${newMode ? 'AKTİF' : 'PASİF'} yapıldı.`);
         window.location.reload();
     } catch(e) { alert("Hata oluştu."); }
  };

  const handleSendAppointment = async (student) => {
     if(!appointmentData.date || !appointmentData.time) return alert("Tarih ve Saat seçiniz.");
     
     try {
         const activeCustomExam = centerExams.length > 0 ? centerExams[0] : null;

         const updates = { 
             appointmentDate: appointmentData.date, 
             appointmentTime: appointmentData.time,
             selectedDate: appointmentData.date,
             selectedTime: appointmentData.time,
             isWaitingPool: false,
             examId: activeCustomExam ? (activeCustomExam.firebaseId || activeCustomExam.id) : null,
             examTitle: activeCustomExam ? activeCustomExam.title : "Kurum Sınavı"
         };
         await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'students', student.firebaseId), updates);
         
         const smsText = `Sayın ${student.fullName}, \n${centerData.name} kurumumuzdan Birebir Analiz ve Görüşme randevunuz oluşturulmuştur.\nTarih: ${appointmentData.date} - Saat: ${appointmentData.time}\nKonum: ${centerData.mapLink || 'Belirtilmedi'}\nLütfen vaktinde kurumumuzda olunuz.${SMS_FOOTER}`;
         await sendSMS([{ tel: [student.phone], msg: smsText }]);
         
         alert("Randevu öğrenciye başarıyla atandı ve SMS gönderildi!");
         handleFetchStudents(); 
         setAppointmentData({ date: '', time: '' });
     } catch(e) { alert("Randevu verilirken hata oluştu."); }
  };

  const handleAddOrUpdateCenterExam = async () => {
      if(!examData.title) return alert("Sınav Adı boş bırakılamaz.");
      
      let formattedSessions = [];
      if (!centerData.isAppointmentModeActive) {
          formattedSessions = examSessions.filter(s => s.date && s.times).map(s => {
              const slotsArray = s.times.split(',').map(t => t.trim()).filter(t => t);
              return { date: s.date, slots: slotsArray, closedSlots: [] };
          });
          if(formattedSessions.length === 0) return alert("Lütfen en az bir geçerli tarih ve saat girin.");
      }

      try {
        setHasMadeChanges(true);
        if (editingExamId) {
           await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'exams', editingExamId), {
              title: examData.title, sessions: formattedSessions, updatedAt: new Date().getTime()
           });
           alert("Sınav başarıyla güncellendi!");
           setEditingExamId(null);
        } else {
           await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'exams'), { 
               zoneId: adminZoneData.id, centerId: centerData.id, title: examData.title, sessions: formattedSessions, createdAt: new Date().getTime(), active: true, status: 'active' 
           });
           alert(`Kuruma özel sınav başarıyla oluşturuldu!`);
        }
        setExamData({ title: '' }); setExamSessions([{ date: '', times: '' }]);
      } catch (e) { console.error(e); }
  };

  const handleDeleteCenterExam = async (examId) => {
      if(!window.confirm("Bu sınavı silmek istediğinize emin misiniz?")) return;
      try {
          await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'exams', examId));
          alert("Sınav silindi.");
      } catch(e) {}
  };

  const handleSavePrizes = async () => {
      try {
         const zoneDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'zones', adminZoneData.id.toString());
         const zoneDoc = await getDoc(zoneDocRef);
         const freshCenters = zoneDoc.data()?.centers || [];

         const updatedCenters = freshCenters.map(c => c.id === centerData.id ? { ...c, useCustomPrizes, customPrizes: localPrizes } : c);
         await updateDoc(zoneDocRef, { centers: updatedCenters });
         
         alert("Kurum ödül ayarları başarıyla kaydedildi.");
      } catch(e) { alert("Güncelleme hatası"); }
  };

  const getZoneDistricts = () => {
      const dists = [...(adminZoneData?.districts || [])];
      if (adminZoneData?.partialDistricts) {
          Object.keys(adminZoneData.partialDistricts).forEach(d => {
              if (!dists.includes(d)) dists.push(d);
          });
      }
      return dists.sort();
  };

  const getAvailableNeighborhoodsToBorrow = () => {
      if(!borrowData.district || !borrowData.gender) return [];
      const dist = borrowData.district;
      const gender = borrowData.gender;
      let allHoods = [];
      if (adminZoneData?.partialDistricts?.[dist]) { allHoods = adminZoneData.partialDistricts[dist]; } 
      else { for (let prov in LOCATIONS) { if (LOCATIONS[prov][dist]) { allHoods = LOCATIONS[prov][dist]; break; } } }
      return allHoods.filter(h => {
         const isMapped = adminZoneData.mappings?.some(m => m.district === dist && m.neighborhood === h && (m.gender === gender || m.gender === 'Tümü'));
         return !isMapped;
      }).sort();
  };

  const handleBorrowNeighborhood = async () => {
      if(!borrowData.district || !borrowData.neighborhood || !borrowData.gender) return alert("Lütfen tüm alanları seçiniz.");
      try {
         const zoneDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'zones', adminZoneData.id.toString());
         const zoneDoc = await getDoc(zoneDocRef);
         const freshMappings = zoneDoc.data()?.mappings || [];

         const newMapping = { district: borrowData.district, neighborhood: borrowData.neighborhood, gender: borrowData.gender, centerId: centerData.id, isBorrowed: true };
         const updatedMappings = [...freshMappings, newMapping];
         
         await updateDoc(zoneDocRef, { mappings: updatedMappings });
         alert("Mahalle başarıyla ödünç alındı.");
         setBorrowData({...borrowData, neighborhood: ''});
         window.location.reload(); 
      } catch(e) { alert("Hata oluştu."); }
  };

  const handleDeleteBorrowed = async (district, neighborhood, gender) => {
      if(!window.confirm("Ödünç aldığınız bu mahalleyi bırakmak istiyor musunuz?")) return;
      try {
         const zoneDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'zones', adminZoneData.id.toString());
         const zoneDoc = await getDoc(zoneDocRef);
         const freshMappings = zoneDoc.data()?.mappings || [];

         const updatedMappings = freshMappings.filter(m => !(m.district === district && m.neighborhood === neighborhood && m.gender === gender && m.isBorrowed));
         await updateDoc(zoneDocRef, { mappings: updatedMappings });
         window.location.reload();
      } catch(e) { alert("Hata oluştu."); }
  };

  if(!centerData) return <div>Kurum bulunamadı.</div>;

  const pendingAppointments = fetchedStudents.filter(s => s.registeredViaAppointment === true && !s.appointmentDate);

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-16 relative">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-10 border-b-2 border-slate-100 pb-6 gap-4 animate-in fade-in duration-500">
        <div>
          <div className="inline-flex items-center px-4 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 text-sm font-black mb-3 uppercase tracking-wider">{adminZoneData.name} Mıntıkasına Bağlı</div>
          <h1 className="text-4xl font-black text-slate-900">{centerData.name}</h1>
          <p className="text-slate-500 mt-2 font-bold text-lg">Kurumunuza ait ayarlar, mahalle atamaları ve öğrenci listesi.</p>
        </div>
        <button onClick={onLogout} className="flex items-center justify-center text-white bg-slate-800 hover:bg-slate-900 px-6 py-3.5 rounded-xl font-bold transition shadow-lg">
           <LogOut className="w-5 h-5 mr-2"/> Güvenli Çıkış
        </button>
      </div>

      <div className="flex flex-wrap gap-4 mb-10 border-b-2 border-slate-100 pb-6">
        <button onClick={() => setActiveTab('ogrenci')} className={`px-6 py-3 rounded-2xl font-black transition-all text-base ${activeTab === 'ogrenci' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}>
          <Users className="w-5 h-5 inline mr-2"/> Kurumun Öğrencileri ({fetchedStudents.length})
        </button>
        <button onClick={() => setActiveTab('randevu')} className={`px-6 py-3 rounded-2xl font-black transition-all text-base ${activeTab === 'randevu' ? 'bg-amber-500 text-white shadow-lg' : 'bg-white text-amber-600 hover:bg-amber-50 border border-amber-200'}`}>
          <CalendarIcon className="w-5 h-5 inline mr-2"/> Randevu Paneli
        </button>
        <button onClick={() => setActiveTab('ayarlar')} className={`px-6 py-3 rounded-2xl font-black transition-all text-base ${activeTab === 'ayarlar' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}>
          <Settings className="w-5 h-5 inline mr-2"/> Sınav & Ödül Ayarları
        </button>
        <button onClick={() => setActiveTab('merkezler')} className={`px-6 py-3 rounded-2xl font-black transition-all text-base ${activeTab === 'merkezler' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}>
          <MapPin className="w-5 h-5 inline mr-2"/> Kurum Bilgileri & Mahalleler
        </button>
      </div>

      <div className="mt-8 animate-in fade-in duration-300">
        
        {activeTab === 'ogrenci' && (
           <div>
              {isFetchingData ? <div className="text-center font-bold text-slate-400 py-10">Öğrenciler yükleniyor...</div> : <StudentsTab students={fetchedStudents} exams={exams} isSuperAdmin={false} adminZoneData={adminZoneData} zones={zones} setHasMadeChanges={() => {}} />}
           </div>
        )}

        {activeTab === 'ayarlar' && (
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="bg-white rounded-[3rem] shadow-xl border-4 border-amber-100 p-8 md:p-12">
                 <div className="flex flex-col mb-8 border-b-2 border-slate-100 pb-6">
                    <h3 className="font-black text-2xl text-slate-800 flex items-center mb-2"><CalendarIcon className="w-6 h-6 inline mr-3 text-amber-500"/> Randevulu Sistem Ayarı</h3>
                    <p className="text-slate-500 font-bold text-sm">Bu mod aktifken öğrenciler oturum seçemez. Kayıt olduklarında size SMS gelir ve randevuyu aşağıdan siz belirlersiniz.</p>
                 </div>

                 <div className="bg-amber-50 p-8 rounded-3xl border-2 border-amber-200 text-center mb-8">
                    {centerData.isAppointmentModeActive ? (
                        <><CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" /><h4 className="font-black text-xl text-emerald-800 mb-2">Randevulu Sistem Aktif</h4></>
                    ) : (
                        <><AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" /><h4 className="font-black text-xl text-amber-800 mb-2">Randevulu Sistem Kapalı</h4></>
                    )}
                    <button onClick={handleToggleAppointmentMode} className={`w-full mt-4 py-4 rounded-2xl font-black text-lg flex items-center justify-center transition shadow-lg ${centerData.isAppointmentModeActive ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-emerald-500 text-white hover:bg-emerald-600'}`}>
                        {centerData.isAppointmentModeActive ? 'Sistemi Kapat (Normal Sınava Dön)' : 'Randevulu Sistemi Aktif Et'}
                    </button>
                 </div>

                 <h3 className="font-black text-xl text-slate-800 mb-4 border-b-2 border-slate-100 pb-2">Kuruma Özel Sınav Oluştur</h3>
                 <div className={`space-y-4 p-6 rounded-3xl border-2 transition-all duration-300 ${editingExamId ? 'bg-amber-50 border-amber-300 shadow-xl' : 'bg-slate-50 border-slate-100'}`}>
                     <div>
                       <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">Sınav Adı (Etkinlik Adı)</label>
                       <input type="text" value={examData.title} onChange={e=>setExamData({title:e.target.value})} className={`w-full text-base font-bold p-4 rounded-xl border outline-none focus:border-indigo-500 ${editingExamId ? 'border-amber-200 bg-white' : 'border-slate-200'}`} placeholder="Örn: Şekerpınar Özel Sınavı"/>
                     </div>
                     
                     {centerData.isAppointmentModeActive ? (
                         <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl text-sm font-bold border border-emerald-200">Randevulu sistem aktif olduğu için oturum saati girmenize gerek yoktur.</div>
                     ) : (
                         <div className="pt-2 border-t-2 border-slate-200/50">
                           <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-3 block">Tarih ve Saatler (Çoklu Eklenebilir)</label>
                           {examSessions.map((session, idx) => (
                             <div key={idx} className="flex gap-3 mb-3 items-center">
                               <input type="date" value={session.date} onChange={e=>{const newS=[...examSessions]; newS[idx].date=e.target.value; setExamSessions(newS);}} className="w-2/5 text-sm font-bold p-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"/>
                               <input type="text" value={session.times} onChange={e=>{const newS=[...examSessions]; newS[idx].times=e.target.value; setExamSessions(newS);}} className="w-3/5 text-sm font-bold p-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500" placeholder="Örn: 10:00, 12:00"/>
                               {idx > 0 && <button onClick={() => setExamSessions(examSessions.filter((_, i) => i !== idx))} className="p-3 text-red-500 hover:bg-red-50 rounded-xl"><Trash2 className="w-5 h-5"/></button>}
                             </div>
                           ))}
                           <button onClick={() => setExamSessions([...examSessions, {date:'', times:''}])} className="text-sm font-black text-indigo-600 mt-2 hover:underline flex items-center"><Plus className="w-4 h-4 mr-1"/> Başka Bir Tarih Ekle</button>
                         </div>
                     )}
                     
                     <div className="flex gap-3 mt-4">
                         {editingExamId && <button onClick={() => {setEditingExamId(null); setExamData({title:''}); setExamSessions([{date:'', times:''}]);}} className="bg-slate-200 text-slate-700 font-black py-4 px-4 rounded-xl w-1/3">İptal</button>}
                         <button onClick={handleAddOrUpdateCenterExam} className="bg-indigo-600 text-white font-black py-4 px-4 rounded-xl flex-1 shadow-lg">Sınavı Kaydet</button>
                     </div>
                 </div>

                 <div className="mt-8 space-y-4">
                    {centerExams.map(exam => (
                        <div key={exam.firebaseId} className="border-2 p-5 rounded-2xl bg-indigo-50 border-indigo-100 relative">
                            <div className="absolute top-4 right-4 flex gap-2">
                                <button onClick={() => {setEditingExamId(exam.firebaseId); setExamData({title:exam.title}); setExamSessions(exam.sessions?.map(s=>({date:s.date, times:s.slots.join(', ')})) || [{date:'', times:''}]);}} className="p-2 text-indigo-500 bg-white shadow-sm border rounded-xl"><Edit className="w-4 h-4"/></button>
                                <button onClick={() => handleDeleteCenterExam(exam.firebaseId)} className="p-2 text-red-500 bg-white shadow-sm border rounded-xl"><Trash2 className="w-4 h-4"/></button>
                            </div>
                            <h4 className="font-black text-lg text-indigo-900 mb-2">{exam.title}</h4>
                            {exam.sessions?.map((s, i) => (
                                <div key={i} className="text-sm font-bold text-slate-600"><CalendarIcon className="inline w-4 h-4 mr-1"/> {formatToTurkishDate(s.date)} - {s.slots?.join(', ')}</div>
                            ))}
                        </div>
                    ))}
                 </div>
              </div>

              <div className="bg-white rounded-[3rem] shadow-xl border-4 border-indigo-100 p-8 md:p-12">
                 <h3 className="font-black text-2xl text-slate-800 flex items-center mb-6"><Gift className="w-6 h-6 inline mr-3 text-indigo-500"/> Kuruma Özel Ödüller</h3>
                 <div className="bg-indigo-50 p-6 rounded-3xl border-2 border-indigo-100 mb-6">
                     <label className="flex items-center justify-between cursor-pointer">
                         <span className="font-black text-slate-800">Mıntıkanın Ödülleri Yerine Kendi Ödüllerimi Kullan</span>
                         <input type="checkbox" checked={useCustomPrizes} onChange={e=>setUseCustomPrizes(e.target.checked)} className="w-6 h-6 accent-indigo-600"/>
                     </label>
                 </div>

                 {useCustomPrizes ? (
                     <div className="space-y-6">
                        <div className="border border-slate-200 rounded-2xl p-4">
                           <div className="text-sm font-black text-slate-800 mb-2">Katılım Ödülü Ekle</div>
                           {localPrizes.participation.map((pz, idx) => (
                               <div key={idx} className="flex gap-2 mb-2">
                                  <input type="text" value={pz.title} onChange={e=>{const arr=[...localPrizes.participation]; arr[idx].title=e.target.value; setLocalPrizes({...localPrizes, participation:arr})}} className="flex-1 text-sm font-bold p-2 border rounded-lg" placeholder="Ödül Başlığı"/>
                                  <button onClick={() => setLocalPrizes({...localPrizes, participation: localPrizes.participation.filter((_,i)=>i!==idx)})} className="p-2 text-red-500 bg-red-50 rounded-lg"><Trash2 className="w-4 h-4"/></button>
                               </div>
                           ))}
                           <button onClick={() => setLocalPrizes({...localPrizes, participation: [...localPrizes.participation, {title:'', desc:'', img:''}]})} className="text-xs font-bold text-indigo-600">+ Yeni Ekle</button>
                        </div>

                        <div className="border border-slate-200 rounded-2xl p-4">
                           <div className="text-sm font-black text-slate-800 mb-2">Derece Ödülü Ekle</div>
                           {localPrizes.degree.map((pz, idx) => (
                               <div key={idx} className="flex gap-2 mb-2">
                                  <input type="text" value={pz.title} onChange={e=>{const arr=[...localPrizes.degree]; arr[idx].title=e.target.value; setLocalPrizes({...localPrizes, degree:arr})}} className="flex-1 text-sm font-bold p-2 border rounded-lg" placeholder="Ödül Başlığı"/>
                                  <button onClick={() => setLocalPrizes({...localPrizes, degree: localPrizes.degree.filter((_,i)=>i!==idx)})} className="p-2 text-red-500 bg-red-50 rounded-lg"><Trash2 className="w-4 h-4"/></button>
                               </div>
                           ))}
                           <button onClick={() => setLocalPrizes({...localPrizes, degree: [...localPrizes.degree, {title:'', desc:'', img:''}]})} className="text-xs font-bold text-indigo-600">+ Yeni Ekle</button>
                        </div>
                     </div>
                 ) : (
                     <div className="text-center p-6 border-2 border-dashed border-slate-200 rounded-2xl font-bold text-slate-400">Şu an mıntıkanın belirlediği ortak ödülleri kullanıyorsunuz. Kendi ödüllerinizi belirlemek için yukarıdaki şalteri açın.</div>
                 )}
                 <button onClick={handleSavePrizes} className="bg-indigo-600 text-white font-black py-4 px-4 rounded-xl transition w-full shadow-lg mt-6">Ödül Ayarlarını Kaydet</button>
              </div>

           </div>
        )}

        {activeTab === 'randevu' && (
           <div className="bg-white rounded-[3rem] shadow-xl border-4 border-amber-100 p-8 md:p-12">
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 border-b-2 border-slate-100 pb-6 gap-4">
                  <div>
                    <h3 className="font-black text-2xl text-slate-800 flex items-center"><CalendarIcon className="w-6 h-6 inline mr-3 text-amber-500"/> Randevu Paneli</h3>
                    <p className="text-slate-500 font-bold mt-2">Kayıt olup randevu bekleyen öğrenciler. Randevu saati atadığınız an, sistem bu kişiyi "Kurum Sınavınıza" kaydeder.</p>
                  </div>
               </div>

               {centerData.isAppointmentModeActive ? (
                  <div>
                     <h4 className="font-black text-xl text-amber-900 mb-6">Bekleyen Öğrenciler ({pendingAppointments.length})</h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {pendingAppointments.map(student => (
                           <div key={student.firebaseId} className="bg-amber-50 p-6 rounded-2xl border-2 border-amber-200 shadow-sm relative">
                              <h5 className="font-black text-lg text-slate-800">{student.fullName}</h5>
                              <p className="text-xs font-bold text-slate-500 mb-4">{student.phone} - {student.gender}</p>
                              
                              <div className="space-y-3">
                                 <input type="date" value={appointmentData.date} onChange={e=>setAppointmentData({...appointmentData, date: e.target.value})} className="w-full p-3 rounded-xl border border-amber-300 font-bold text-sm bg-white"/>
                                 <input type="time" value={appointmentData.time} onChange={e=>setAppointmentData({...appointmentData, time: e.target.value})} className="w-full p-3 rounded-xl border border-amber-300 font-bold text-sm bg-white"/>
                                 <button onClick={() => handleSendAppointment(student)} className="bg-amber-600 text-white font-black w-full py-3 rounded-xl hover:bg-amber-700 flex items-center justify-center">
                                    <Send className="w-4 h-4 mr-2"/> Randevu Ver & SMS At
                                 </button>
                              </div>
                           </div>
                        ))}
                        {pendingAppointments.length === 0 && <div className="col-span-full text-center text-slate-400 font-bold p-8 border-2 border-dashed border-amber-200 rounded-3xl">Randevu bekleyen öğrenci kalmadı veya sistem yeni açıldı.</div>}
                     </div>
                  </div>
               ) : (
                  <div className="text-center bg-slate-50 p-12 rounded-3xl border-2 border-dashed border-slate-200">
                     <AlertTriangle className="w-16 h-16 mx-auto text-amber-300 mb-4"/>
                     <h4 className="text-xl font-black text-slate-600">Randevu Modu Kapalı</h4>
                     <p className="text-slate-500 font-bold">Öğrencilere randevu verebilmek için "Sınav & Randevu Ayarları" sekmesinden sistemi aktif ediniz.</p>
                  </div>
               )}
           </div>
        )}

        {activeTab === 'merkezler' && (
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="bg-white rounded-[3rem] shadow-xl border-4 border-slate-100 p-8 md:p-12">
                 <h3 className="font-black text-2xl text-slate-800 mb-6 border-b-2 border-slate-100 pb-4"><Building2 className="w-6 h-6 inline mr-2 text-indigo-500"/> Kurum Bilgilerini Düzenle</h3>
                 <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2"><label className="text-[10px] font-black text-slate-500 uppercase ml-1 block">Kurum Adı</label><input type="text" value={editCenterInfo.name} onChange={e=>setEditCenterInfo({...editCenterInfo, name: e.target.value})} className="w-full p-4 rounded-xl border border-slate-200 font-bold" required/></div>
                        <div className="md:col-span-2"><label className="text-[10px] font-black text-slate-500 uppercase ml-1 block">Açık Adres</label><textarea rows="2" value={editCenterInfo.address} onChange={e=>setEditCenterInfo({...editCenterInfo, address: e.target.value})} className="w-full p-4 rounded-xl border border-slate-200 font-bold resize-none" required/></div>
                        <div className="md:col-span-2"><label className="text-[10px] font-black text-slate-500 uppercase ml-1 block">Google Harita Linki</label><input type="url" value={editCenterInfo.mapLink || ''} onChange={e=>setEditCenterInfo({...editCenterInfo, mapLink: e.target.value})} className="w-full p-4 rounded-xl border border-slate-200 font-bold" /></div>
                        
                        <div className="md:col-span-2 space-y-2 mt-2">
                            <p className="text-[11px] font-black text-indigo-600 uppercase ml-1 block">Sorumlu Olduğu Gruplar & Hocalar</p>
                            {genderKeys.map(g => (
                               <div key={g} className={`p-4 rounded-2xl border-2 transition-all ${editCenterInfo.contacts?.[g]?.active ? 'bg-indigo-50/50 border-indigo-200 shadow-sm' : 'bg-transparent border-slate-200 opacity-70'}`}>
                                  <label className="flex items-center font-black text-sm text-slate-700 cursor-pointer mb-2">
                                     <input 
                                        type="checkbox" 
                                        checked={editCenterInfo.contacts?.[g]?.active || false} 
                                        onChange={e => setEditCenterInfo({
                                           ...editCenterInfo, 
                                           contacts: { ...editCenterInfo.contacts, [g]: { ...(editCenterInfo.contacts?.[g] || {}), active: e.target.checked } }
                                        })}
                                        className="w-5 h-5 mr-3 text-indigo-600 rounded"
                                     />
                                     {g} Sorumluluğu
                                  </label>
                                  {editCenterInfo.contacts?.[g]?.active && (
                                     <div className="flex flex-col sm:flex-row gap-3 mt-3 pl-8">
                                        <input type="text" value={editCenterInfo.contacts?.[g]?.name || ''} onChange={e => setEditCenterInfo({...editCenterInfo, contacts: {...editCenterInfo.contacts, [g]: {...editCenterInfo.contacts[g], name: e.target.value}}})} className="w-full sm:w-1/2 text-sm font-bold p-3 rounded-xl border border-slate-300 outline-none focus:border-indigo-500 bg-white" placeholder="Hoca Adı" />
                                        <input type="tel" value={editCenterInfo.contacts?.[g]?.phone || ''} onChange={e => {
                                            let val = e.target.value.replace(/\D/g, '');
                                            if (val.startsWith('90')) val = val.substring(2);
                                            if (val.startsWith('0')) val = val.substring(1);
                                            setEditCenterInfo({...editCenterInfo, contacts: {...editCenterInfo.contacts, [g]: {...editCenterInfo.contacts[g], phone: val}}})
                                        }} className="w-full sm:w-1/2 text-sm font-bold p-3 rounded-xl border border-slate-300 outline-none focus:border-indigo-500 bg-white" placeholder="Telefon (5XX)" maxLength="10" />
                                     </div>
                                  )}
                               </div>
                            ))}
                        </div>
                        
                        <div className="md:col-span-2 mt-2"><label className="text-[10px] font-black text-amber-600 uppercase ml-1 block">Kurum Panel Şifresi</label><input type="text" value={editCenterInfo.password || ''} onChange={e=>setEditCenterInfo({...editCenterInfo, password: e.target.value})} className="w-full p-4 rounded-xl border-2 border-amber-300 bg-amber-50 font-bold outline-none focus:border-amber-500"/></div>
                    </div>
                    <button onClick={handleSaveCenterInfo} className="bg-indigo-600 text-white font-black py-5 rounded-2xl w-full flex items-center justify-center mt-4 hover:bg-indigo-700 transition shadow-lg"><Save className="w-6 h-6 mr-2"/> Tüm Bilgileri Güncelle</button>
                 </div>
              </div>

              <div className="space-y-6">
                 <div className="bg-white rounded-[3rem] shadow-xl border-4 border-emerald-100 p-8">
                    <h3 className="font-black text-xl text-slate-800 mb-4">Sorumlu Olduğunuz Mahalleler</h3>
                    <div className="flex flex-wrap gap-2">
                       {centerMappings.map((m, i) => (
                           <div key={i} className={`px-4 py-2 rounded-xl text-sm font-bold border-2 flex items-center justify-between ${m.isBorrowed ? 'bg-red-50 border-red-200 text-red-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'}`}>
                               <span>{m.district} / {m.neighborhood} <span className="text-[10px] bg-white px-2 rounded-md ml-1 opacity-70 text-slate-600">{m.gender}</span></span>
                               {m.isBorrowed && (
                                   <button onClick={() => handleDeleteBorrowed(m.district, m.neighborhood, m.gender)} className="ml-3 text-red-400 hover:text-red-700" title="Ödünç İade Et"><Trash2 className="w-4 h-4"/></button>
                               )}
                           </div>
                       ))}
                    </div>
                 </div>

                 <div className="bg-rose-50 rounded-[3rem] shadow-sm border-4 border-rose-100 p-8">
                    <h3 className="font-black text-xl text-rose-900 mb-4 flex items-center"><Plus className="w-6 h-6 mr-2"/> Mahalle Ödünç Al</h3>
                    <p className="text-xs font-bold text-rose-700 mb-4">Mıntıkanızda henüz başka bir kuruma atanmamış olan mahalleleri geçici olarak kendi üzerinize (kırmızı renkle) alabilirsiniz.</p>
                    <div className="space-y-3">
                       <select value={borrowData.gender} onChange={e=>setBorrowData({...borrowData, gender: e.target.value, neighborhood: ''})} className="w-full p-3 rounded-xl border border-rose-200 bg-white font-bold text-sm outline-none focus:border-rose-500">
                          <option value="">Cinsiyet Seçin</option>
                          <option value="Erkek">Erkek</option>
                          <option value="Kız">Kız</option>
                          <option value="8. Sınıf Erkek">8. Sınıf Erkek</option>
                       </select>
                       <select value={borrowData.district} onChange={e=>setBorrowData({...borrowData, district: e.target.value, neighborhood: ''})} className="w-full p-3 rounded-xl border border-rose-200 bg-white font-bold text-sm outline-none focus:border-rose-500">
                          <option value="">İlçe Seçin</option>
                          {getZoneDistricts().map(d => <option key={d} value={d}>{d}</option>)}
                       </select>
                       <select value={borrowData.neighborhood} onChange={e=>setBorrowData({...borrowData, neighborhood: e.target.value})} disabled={!borrowData.district || !borrowData.gender} className="w-full p-3 rounded-xl border border-rose-200 bg-white font-bold text-sm disabled:opacity-50 outline-none focus:border-rose-500">
                          <option value="">Boşta Olan Mahalle Seçin</option>
                          {getAvailableNeighborhoodsToBorrow().map(h => <option key={h} value={h}>{h}</option>)}
                       </select>
                       <button onClick={handleBorrowNeighborhood} disabled={!borrowData.neighborhood} className="bg-rose-600 text-white font-black w-full py-4 rounded-xl hover:bg-rose-700 disabled:opacity-50 transition shadow-md">Ödünç Al ve Ata</button>
                    </div>
                 </div>
              </div>
           </div>
        )}
      </div>
    </div>
  );
}