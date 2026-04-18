import React, { useState } from 'react';
import { Plus, Settings, Lock, CalendarIcon, Clock, MapPin, Map, Phone, Trophy, ChevronRight, Award, Gift, AlertCircle } from 'lucide-react';
import { db, appId } from '../services/firebase';
import { doc, updateDoc } from "firebase/firestore";
import { getNeighborhoodDetails, findZoneByName, parsePrizeArray, formatToTurkishDate } from '../utils/helpers';
import TimelineCalendar from '../components/TimelineCalendar';

export default function StudentProfile({ currentUser, exams, navigateTo, setCurrentUser, zones }) {
  const [showSettings, setShowSettings] = useState(false);
  const [hasViewedSettings, setHasViewedSettings] = useState(false); 
  const [newPassword, setNewPassword] = useState('');
  const [newEmail, setNewEmail] = useState(currentUser?.email || '');
  const [newPrize, setNewPrize] = useState(currentUser?.selectedParticipationPrize || '');
  
  const [newCenterId, setNewCenterId] = useState(currentUser?.selectedCenterId || '');

  if (!currentUser) return <div className="text-center py-32 text-2xl font-black text-slate-500">Lütfen önce giriş yapın veya kayıt oluşturun.</div>;

  let actualExam = null;
  if (currentUser?.examId || currentUser?.exam?.firebaseId) {
      const targetId = currentUser.examId || currentUser.exam?.firebaseId;
      actualExam = exams.find(e => (e.firebaseId === targetId || e.id === targetId) && e.active !== false);
  }
  const hasActiveExam = !!actualExam && !!currentUser?.selectedDate && !!currentUser?.selectedTime;
  const pastExams = currentUser.pastExams || [];

  let actualZone = findZoneByName(zones, currentUser?.zone?.name || '') || currentUser?.zone;
  let actualCenterObj = null;
  let actualCenterMapping = null;

  if (currentUser?.selectedCenterId) {
      actualZone = zones.find(z => z.mappings?.some(m => m.centerId === currentUser.selectedCenterId)) || actualZone;
      actualCenterMapping = actualZone?.mappings?.find(m => m.centerId === currentUser.selectedCenterId);
      actualCenterObj = actualZone?.centers?.find(c => c.id === currentUser.selectedCenterId);
  }

  const fallbackDetails = getNeighborhoodDetails(actualZone, currentUser.district, currentUser.neighborhood, currentUser.gender, currentUser.grade);
  const neighborhoodDetails = actualCenterObj ? {
      phone: actualCenterMapping?.phone || fallbackDetails.phone,
      contactName: actualCenterMapping?.contactName || fallbackDetails.contactName,
      mapLink: actualCenterObj?.mapLink || fallbackDetails.mapLink,
      centerName: actualCenterObj?.name || fallbackDetails.centerName,
      address: actualCenterObj?.address || fallbackDetails.address
  } : fallbackDetails;

  const zoneExams = exams.filter(e => e.zoneId === actualZone?.id);
  const partPrizesList = parsePrizeArray(actualZone?.prizes?.participation);

  const availableMappings = zones.flatMap(z => (z.mappings || []).map(m => ({...m, zoneId: z.id, zoneName: z.name})))
      .filter(m => m.district === currentUser?.district && m.neighborhood === currentUser?.neighborhood && 
        (m.gender === currentUser?.gender || m.gender === 'Tümü' || (m.gender === '8. Sınıf Erkek' && currentUser?.grade === '8' && currentUser?.gender === 'Erkek')));

  // 🚀 DÜZELTME 4: Tehlikeli useEffect ve alert() tamamen kaldırıldı!

  let isExamTimePassed = false;
  if (currentUser?.selectedDate && currentUser?.selectedTime) {
    const examDateParts = currentUser.selectedDate.split('-');
    const examTimeParts = currentUser.selectedTime.split(':');
    if (examDateParts.length === 3 && examTimeParts.length === 2) {
      const examDateTime = new Date(parseInt(examDateParts[0]), parseInt(examDateParts[1]) - 1, parseInt(examDateParts[2]), parseInt(examTimeParts[0]), parseInt(examTimeParts[1]));
      if (examDateTime < new Date()) isExamTimePassed = true;
    }
  }

  const handleSaveSettings = async () => {
    if(newPassword && newPassword.length > 0 && newPassword.length < 4) return alert("Şifre en az 4 haneli olmalıdır.");
    if (newEmail && newEmail !== currentUser.email) {
       const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
       if (!emailRegex.test(newEmail)) return alert("Lütfen geçerli bir e-posta adresi girin.");
    }
    try {
      const updates = {};
      if (newPassword) updates.password = newPassword;
      if (newEmail !== currentUser.email) updates.email = newEmail;
      if (newPrize !== currentUser.selectedParticipationPrize) updates.selectedParticipationPrize = newPrize;

      if (newCenterId && newCenterId !== (currentUser.selectedCenterId || '')) {
          const newZ = zones.find(z => z.mappings?.some(m => m.centerId === newCenterId));
          updates.selectedCenterId = newCenterId;
          updates.zone = newZ;
          updates.examId = null;
          updates.examTitle = null;
          updates.selectedDate = null;
          updates.selectedTime = null;
          updates.isWaitingPool = true;
          
          const newCenterObj = newZ?.centers?.find(c => c.id === newCenterId);
          if(newCenterObj) updates.notifiedCenter = newCenterObj.name;
      }

      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'students', currentUser.firebaseId), updates);
      setCurrentUser({ ...currentUser, ...updates });
      
      if (updates.selectedCenterId && updates.selectedCenterId !== currentUser.selectedCenterId) {
         alert("Sınav merkeziniz güncellendi! Mevcut sınav oturumunuz iptal edildiği için lütfen yeni merkezinize uygun bir oturum seçin.");
      } else {
         alert("Profil ayarlarınız başarıyla güncellendi!");
      }
      
      setShowSettings(false); setNewPassword('');
    } catch(e) { console.error(e); alert("Bir hata oluştu."); }
  };

  let rawContactPhone = neighborhoodDetails?.phone || "0553 973 54 40";
  let cleanContactPhone = String(rawContactPhone).replace(/\D/g, '');
  if (cleanContactPhone.startsWith('90')) cleanContactPhone = cleanContactPhone.substring(2);
  if (cleanContactPhone.startsWith('0')) cleanContactPhone = cleanContactPhone.substring(1);
  if (cleanContactPhone.length === 0) cleanContactPhone = "5539735440";

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 relative">
      
      {/* 🚀 YENİ EKLENDİ: Zorlayıcı alert yerine Şık ve Güvenli Banner */}
      {partPrizesList.length > 0 && !currentUser.selectedParticipationPrize && (
         <div className="mb-8 bg-red-50 border-2 border-red-200 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm animate-in fade-in slide-in-from-top-4">
             <div className="flex items-center text-red-800">
                 <Gift className="w-10 h-10 mr-4 flex-shrink-0" />
                 <div>
                     <h4 className="font-black text-lg md:text-xl">Katılım Ödülünüzü Seçmediniz!</h4>
                     <p className="font-medium text-sm md:text-base mt-1">Lütfen ayarlara girerek size en uygun katılım ödülünü hemen belirleyin.</p>
                 </div>
             </div>
             <button 
                 onClick={() => { setShowSettings(true); setHasViewedSettings(true); }}
                 className="whitespace-nowrap bg-red-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-red-700 transition shadow-lg w-full sm:w-auto"
             >
                 Şimdi Ödül Seç
             </button>
         </div>
      )}

      {showSettings && (
         <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[3rem] shadow-2xl p-10 w-full max-w-md relative animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
               <button onClick={() => setShowSettings(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-800"><Plus className="w-8 h-8 transform rotate-45"/></button>
               <Settings className="w-16 h-16 text-indigo-500 mx-auto mb-6" />
               <h3 className="text-3xl font-black text-center text-slate-900 mb-6">Profil Ayarları</h3>
               <div className="space-y-4 mb-8">
                 
                 {availableMappings.length > 1 && (
                   <div className="bg-amber-50 p-4 rounded-2xl border-2 border-amber-200">
                     <label className="block text-sm font-black text-amber-800 mb-2 uppercase tracking-wider">Sınav Merkezi Tercihiniz</label>
                     <select value={newCenterId} onChange={e=>setNewCenterId(e.target.value)} className="w-full text-base border-4 border-white bg-white rounded-xl px-4 py-3 font-bold focus:border-amber-500 outline-none">
                        <option value="">Merkez Seçiniz</option>
                        {availableMappings.map(m => {
                           const c = zones.find(z => z.id === m.zoneId)?.centers?.find(x => x.id === m.centerId);
                           return <option key={m.centerId} value={m.centerId}>{c?.name} ({m.zoneName})</option>
                        })}
                     </select>
                     {newCenterId !== (currentUser.selectedCenterId || '') && (
                        <p className="text-xs font-bold text-red-500 mt-2">Uyarı: Merkezi değiştirirseniz mevcut sınav kaydınız iptal edilir ve yeniden oturum seçmeniz gerekir!</p>
                     )}
                   </div>
                 )}

                 <div>
                   <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wider">E-Posta Adresi</label>
                   <input type="email" value={newEmail} onChange={e=>setNewEmail(e.target.value)} className="w-full text-lg border-4 border-slate-100 rounded-2xl px-5 py-4 font-bold focus:border-indigo-500 outline-none" placeholder="Örn: isim@domain.com" />
                 </div>
                 {partPrizesList.length > 0 && (
                   <div>
                     <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wider flex items-center">
                        Katılım Ödülü Tercihi {!currentUser.selectedParticipationPrize && <AlertCircle className="w-4 h-4 ml-2 text-red-500 animate-pulse"/>}
                     </label>
                     <select value={newPrize} onChange={e=>setNewPrize(e.target.value)} className={`w-full text-lg border-4 rounded-2xl px-5 py-4 font-bold outline-none transition-colors ${!currentUser.selectedParticipationPrize ? 'border-red-200 bg-red-50 focus:border-red-500 text-red-900' : 'border-slate-100 focus:border-indigo-500'}`}>
                        <option value="">Seçilmedi</option>
                        {partPrizesList.map(p => <option key={p.title} value={p.title}>{p.title}</option>)}
                     </select>
                   </div>
                 )}
                 <div>
                   <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wider">Yeni Şifre Belirle (Boş Bırakılabilir)</label>
                   <input type="text" value={newPassword} onChange={e => setNewPassword(e.target.value.replace(/\D/g, ''))} className="w-full text-center tracking-widest border-4 border-slate-100 rounded-2xl px-6 py-4 text-2xl font-black focus:border-indigo-500 outline-none" placeholder="••••" />
                 </div>
               </div>
               <button onClick={handleSaveSettings} className="w-full bg-indigo-600 text-white font-black text-xl py-5 rounded-2xl hover:bg-indigo-700 transition shadow-xl shadow-indigo-500/30">Ayarları Kaydet</button>
            </div>
         </div>
      )}

      <div className="flex flex-col lg:flex-row gap-10">
        <div className="w-full lg:w-1/3 space-y-8 animate-in slide-in-from-left-8 duration-500">
          <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden relative">
            <div className="bg-gradient-to-br from-indigo-700 to-indigo-950 h-40 relative">
              <button 
                  onClick={() => { setShowSettings(true); setHasViewedSettings(true); }} 
                  className="absolute top-6 right-6 text-white hover:text-indigo-200 transition bg-white/10 p-2 rounded-xl backdrop-blur-sm z-20" 
                  title="Ayarlar / Şifre Değiştir"
              >
                 <Settings className="w-6 h-6"/>
                 {(!currentUser?.email || !currentUser?.selectedParticipationPrize || (!currentUser?.selectedCenterId && availableMappings.length > 1)) && !hasViewedSettings && (
                     <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse border-2 border-indigo-900 shadow-sm"></span>
                 )}
              </button>
              
              <div className="absolute -bottom-16 left-10 w-32 h-32 bg-white rounded-full border-8 border-white flex items-center justify-center text-5xl font-black text-indigo-600 shadow-2xl overflow-hidden z-10">
                {currentUser?.gender === 'Kız' ? (
                   <img src="/kiz.png" alt="Öğrenci Profil" className="w-full h-full object-cover" />
                ) : currentUser?.gender === 'Erkek' ? (
                   <img src="/erkek.png" alt="Öğrenci Profil" className="w-full h-full object-cover" />
                ) : (
                   currentUser?.fullName?.charAt(0) || "Ö"
                )}
              </div>
            </div>
            <div className="pt-24 pb-10 px-10">
              <h2 className="text-3xl font-black text-slate-900 mb-2">{currentUser?.fullName}</h2>
              <p className="text-indigo-600 font-black text-lg mb-8">{currentUser?.grade}. Sınıf - {currentUser?.gender}</p>
              <div className="space-y-5 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <div className="flex justify-between items-center text-base border-b border-slate-200 pb-4"><span className="text-slate-500 font-bold uppercase tracking-wider text-xs">E-Posta</span><span className="font-medium text-slate-800 truncate w-32 text-right">{currentUser?.email || "Eklenmemiş"}</span></div>
                <div className="flex justify-between items-center text-base border-b border-slate-200 pb-4"><span className="text-slate-500 font-bold uppercase tracking-wider text-xs">Kayıt No</span><span className="font-mono font-black text-indigo-800">{currentUser?.id?.toUpperCase() || currentUser?.firebaseId.substring(0,6).toUpperCase()}</span></div>
                <div className="flex justify-between items-center text-base border-b border-slate-200 pb-4"><span className="text-slate-500 font-bold uppercase tracking-wider text-xs">Telefon</span><span className="font-black text-slate-800">0{currentUser?.phone}</span></div>
                <div className="flex justify-between items-center text-base"><span className="text-slate-500 font-bold uppercase tracking-wider text-xs">Konum</span><span className="font-black text-slate-800 text-right max-w-[150px] truncate">{currentUser?.district}</span></div>
              </div>
              {hasActiveExam && (
                <div className="mt-8 bg-amber-50 border-2 border-amber-200 rounded-2xl p-5 flex items-start">
                  <Lock className="text-amber-500 w-6 h-6 mr-3 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-900 font-bold leading-relaxed">Aktif bir sınav başvurunuz olduğu için telefon ve adres bilgileriniz kilitlenmiştir.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="w-full lg:w-2/3 space-y-10 animate-in slide-in-from-right-8 duration-500">
          {hasActiveExam ? (
            <div className={`rounded-[3rem] p-10 md:p-12 text-white relative overflow-hidden shadow-2xl ${currentUser?.gender === 'Kız' ? 'bg-gradient-to-r from-pink-600 to-rose-900 shadow-pink-500/30' : 'bg-gradient-to-r from-blue-600 to-indigo-900 shadow-blue-500/30'}`}>
              
              <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full -mr-20 -mt-20 z-0 pointer-events-none"></div>
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 relative z-10">
                <div>
                  <div className="bg-green-500 text-white shadow-lg inline-block px-5 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest mb-4 border border-white/20">ONAYLANAN OTURUMUNUZ</div>
                  <h4 className="text-4xl font-black leading-tight drop-shadow-md">{currentUser?.examTitle || currentUser?.exam?.title}</h4>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-10 relative z-10 bg-black/20 p-8 rounded-3xl backdrop-blur-sm">
                <div><div className="text-white/70 text-sm font-bold mb-2 uppercase tracking-wider">Tarih</div><div className="font-black text-2xl flex items-center"><CalendarIcon className="w-6 h-6 mr-2 opacity-80"/> {formatToTurkishDate(currentUser?.selectedDate || currentUser?.exam?.date)}</div></div>
                <div><div className="text-white/70 text-sm font-bold mb-2 uppercase tracking-wider">Seans</div><div className="font-black text-2xl flex items-center"><Clock className="w-6 h-6 mr-2 opacity-80"/> {(currentUser?.selectedTime || currentUser?.slot)?.replace(':', '.')}</div></div>
                
                <div className="col-span-2 md:col-span-3 mt-4">
                  <div className="text-white/70 text-sm font-bold mb-2 uppercase tracking-wider">Sınav Merkezi Adresi ve İletişim</div>
                  <div className="font-bold text-lg flex items-start mb-4"><MapPin className="w-6 h-6 mr-3 opacity-80 flex-shrink-0 mt-1"/><div>{neighborhoodDetails.centerName}<div className="text-sm font-medium text-white/80 mt-2 leading-relaxed">{neighborhoodDetails.address || "Açık adres bilgisi girilmemiş."}</div></div></div>
                  <div className="flex flex-col sm:flex-row gap-4 mt-6">
                      {neighborhoodDetails.mapLink && ( <a href={neighborhoodDetails.mapLink} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center text-sm font-black bg-white/10 px-5 py-3 rounded-xl hover:bg-white/20 transition"><Map className="w-5 h-5 mr-2"/> Haritada Konumu Aç</a> )}
                      
                      <a href={`tel:+90${cleanContactPhone}`} className="inline-flex items-center justify-center text-sm font-black bg-white/10 px-5 py-3 rounded-xl hover:bg-white/20 transition">
                         <Phone className="w-5 h-5 mr-2"/> {neighborhoodDetails.contactName ? `${neighborhoodDetails.contactName}: ` : ''}0{cleanContactPhone}
                      </a>

                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-between items-center relative z-10 gap-6 mt-10 border-t border-white/10 pt-8">
                <span className="text-base font-bold bg-black/20 px-6 py-4 rounded-2xl">Lütfen sınavdan 30 dakika önce merkezde olunuz.</span>
                {!isExamTimePassed && ( <button onClick={() => navigateTo('register')} className="w-full sm:w-auto bg-white text-slate-900 px-8 py-4 rounded-2xl text-lg font-black shadow-xl hover:scale-105 transition flex items-center justify-center"><Clock className="w-6 h-6 mr-3"/> Oturumu Değiştir</button> )}
              </div>
            </div>
          ) : (
            <div className="bg-white border-4 border-indigo-100 rounded-[3rem] p-12 text-center shadow-xl animate-in zoom-in-95">
              <Award className="w-24 h-24 text-indigo-300 mx-auto mb-6" />
              <h3 className="text-3xl font-black text-slate-800 mb-4">Şu an aktif bir sınavınız yok.</h3>
              <p className="text-lg text-slate-600 mb-8 font-medium">Bölgenizde açılan yeni sınavlara hemen başvurabilir veya kayıtlı sınavlarınızı buradan yönetebilirsiniz.</p>
              <button onClick={() => navigateTo('register')} className="text-white font-black text-xl py-5 px-10 rounded-2xl hover:scale-105 transition shadow-xl" style={{ backgroundColor: 'var(--color-main)' }}>Yeni Bir Sınava Başvur</button>
            </div>
          )}

          <div className="mt-12"><TimelineCalendar zoneExams={zoneExams} currentUser={currentUser} defaultContact={actualZone?.mappings?.[0]} /></div>

          {pastExams.length > 0 && (
            <div className="mt-12">
              <div className="flex items-center mb-8">
                <Trophy className="w-10 h-10 text-yellow-500 mr-4" />
                <h3 className="text-3xl font-black text-slate-900">Geçmiş Sınav Sonuçların</h3>
              </div>
              <div className="space-y-6">
                {pastExams.map((past, idx) => (
                  <div key={idx} className="bg-white rounded-3xl shadow-lg border border-slate-100 p-8 flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-xl hover:-translate-y-1 transition-all">
                    <div>
                      <h4 className="text-2xl font-black text-slate-800 mb-2">{past.title}</h4>
                      <p className="text-slate-500 font-bold flex items-center"><CalendarIcon className="w-5 h-5 mr-2 text-indigo-400"/> {formatToTurkishDate(past.date)} - {past.time.replace(':', '.')} Oturumu</p>
                    </div>
                    <div className="flex gap-4">
                      <div className="bg-indigo-50 border-2 border-indigo-100 px-6 py-4 rounded-2xl text-center"><div className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-1">Puanın</div><div className="text-3xl font-black text-indigo-700">{past.score}</div></div>
                      <div className="bg-yellow-50 border-2 border-yellow-200 px-6 py-4 rounded-2xl text-center"><div className="text-xs font-black text-yellow-500 uppercase tracking-widest mb-1">Derecen</div><div className="text-3xl font-black text-yellow-600">{past.rank}.</div></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}