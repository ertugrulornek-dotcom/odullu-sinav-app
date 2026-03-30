import React, { useState } from 'react';
import { Plus, Settings, Lock, CalendarIcon, Clock, MapPin, Map, Phone, FileText, Award, Trophy, ChevronRight } from 'lucide-react';
import { db, appId } from '../services/firebase';
import { doc, updateDoc } from "firebase/firestore";
import { getNeighborhoodDetails, findZoneByName, parsePrizeArray } from '../utils/helpers';
import TimelineCalendar from '../components/TimelineCalendar';

export default function StudentProfile({ currentUser, exams, navigateTo, setCurrentUser, zones }) {
  const [showSettings, setShowSettings] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [newEmail, setNewEmail] = useState(currentUser?.email || '');
  const [newPrize, setNewPrize] = useState(currentUser?.selectedParticipationPrize || '');

  if (!currentUser) return <div className="text-center py-32 text-2xl font-black text-slate-500">Lütfen önce giriş yapın veya kayıt oluşturun.</div>;

  // DÜZELTME: Öğrencinin sınavının veritabanında HALA var olup olmadığını teyit ediyoruz. 
  // Admin sildiyse burası direkt "Şu an aktif sınavınız yok" der.
  let actualExam = null;
  if (currentUser?.examId || currentUser?.exam?.firebaseId) {
      const targetId = currentUser.examId || currentUser.exam?.firebaseId;
      actualExam = exams.find(e => (e.firebaseId === targetId || e.id === targetId) && e.active !== false);
  }
  const hasActiveExam = !!actualExam && !!currentUser?.selectedDate && !!currentUser?.selectedTime;

  const pastExams = currentUser.pastExams || [];
  const matchedZone = findZoneByName(zones, currentUser?.zone?.name || '') || currentUser?.zone;
  const neighborhoodDetails = getNeighborhoodDetails(matchedZone, currentUser.district, currentUser.neighborhood, currentUser.gender);
  const zoneExams = exams.filter(e => e.zoneId === matchedZone?.id);
  const partPrizesList = parsePrizeArray(matchedZone?.prizes?.participation);

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

      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'students', currentUser.firebaseId), updates);
      setCurrentUser({ ...currentUser, ...updates });
      alert("Profil ayarlarınız başarıyla güncellendi!");
      setShowSettings(false); setNewPassword('');
    } catch(e) { console.error(e); alert("Bir hata oluştu."); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 relative">
      {showSettings && (
         <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[3rem] shadow-2xl p-10 w-full max-w-md relative animate-in zoom-in-95">
               <button onClick={() => setShowSettings(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-800"><Plus className="w-8 h-8 transform rotate-45"/></button>
               <Settings className="w-16 h-16 text-indigo-500 mx-auto mb-6" />
               <h3 className="text-3xl font-black text-center text-slate-900 mb-6">Profil Ayarları</h3>
               <div className="space-y-4 mb-8">
                 <div>
                   <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wider">E-Posta Adresi</label>
                   <input type="email" value={newEmail} onChange={e=>setNewEmail(e.target.value)} className="w-full text-lg border-4 border-slate-100 rounded-2xl px-5 py-4 font-bold focus:border-indigo-500 outline-none" placeholder="Örn: isim@domain.com" />
                 </div>
                 {partPrizesList.length > 0 && (
                   <div>
                     <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wider">Katılım Ödülü Tercihi</label>
                     <select value={newPrize} onChange={e=>setNewPrize(e.target.value)} className="w-full text-lg border-4 border-slate-100 rounded-2xl px-5 py-4 font-bold focus:border-indigo-500 outline-none">
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
              <button onClick={() => setShowSettings(true)} className="absolute top-6 right-6 text-white hover:text-indigo-200 transition bg-white/10 p-2 rounded-xl backdrop-blur-sm" title="Ayarlar / Şifre Değiştir"><Settings className="w-6 h-6"/></button>
              <div className="absolute -bottom-16 left-10 w-32 h-32 bg-white rounded-full border-8 border-white flex items-center justify-center text-5xl font-black text-indigo-600 shadow-2xl">{currentUser?.fullName?.charAt(0) || "Ö"}</div>
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
            <div className="bg-gradient-to-r from-indigo-600 to-blue-700 rounded-[3rem] p-10 md:p-12 text-white relative overflow-hidden shadow-2xl shadow-indigo-500/30">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full -mr-20 -mt-20 z-0 pointer-events-none"></div>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 relative z-10">
                <div>
                  <div className="bg-white/20 backdrop-blur-md inline-block px-4 py-2 rounded-xl text-sm font-black uppercase tracking-widest mb-4 border border-white/30">ONAYLANAN OTURUMUNUZ</div>
                  <h4 className="text-4xl font-black leading-tight drop-shadow-md">{currentUser?.examTitle || currentUser?.exam?.title}</h4>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-10 relative z-10 bg-indigo-900/40 p-8 rounded-3xl border border-indigo-400/30 backdrop-blur-sm">
                <div><div className="text-indigo-200 text-sm font-bold mb-2 uppercase tracking-wider">Tarih</div><div className="font-black text-2xl flex items-center"><CalendarIcon className="w-6 h-6 mr-2 opacity-80"/> {currentUser?.selectedDate || currentUser?.exam?.date}</div></div>
                <div><div className="text-indigo-200 text-sm font-bold mb-2 uppercase tracking-wider">Seans</div><div className="font-black text-2xl flex items-center"><Clock className="w-6 h-6 mr-2 opacity-80"/> {(currentUser?.selectedTime || currentUser?.slot)?.replace(':', '.')}</div></div>
                <div className="col-span-2 md:col-span-3 mt-4">
                  <div className="text-indigo-200 text-sm font-bold mb-2 uppercase tracking-wider">Sınav Merkezi Adresi ve İletişim</div>
                  <div className="font-bold text-lg flex items-start mb-4"><MapPin className="w-6 h-6 mr-3 opacity-80 flex-shrink-0 mt-1 text-indigo-300"/><div>{neighborhoodDetails.centerName}<div className="text-sm font-medium text-indigo-100 mt-2 leading-relaxed">{neighborhoodDetails.address || "Açık adres bilgisi girilmemiş."}</div></div></div>
                  <div className="flex flex-col sm:flex-row gap-4 mt-6">
                      {neighborhoodDetails.mapLink && ( <a href={neighborhoodDetails.mapLink} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center text-sm font-black bg-indigo-500/50 px-5 py-3 rounded-xl hover:bg-indigo-400 transition border border-indigo-400/50"><Map className="w-5 h-5 mr-2"/> Haritada Konumu Aç</a> )}
                      <a href={`tel:${neighborhoodDetails.phone}`} className="inline-flex items-center justify-center text-sm font-black bg-indigo-500/50 px-5 py-3 rounded-xl hover:bg-indigo-400 transition border border-indigo-400/50"><Phone className="w-5 h-5 mr-2"/> {neighborhoodDetails.contactName ? `${neighborhoodDetails.contactName}: ` : ''}{neighborhoodDetails.phone}</a>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-between items-center relative z-10 gap-6 mt-10 border-t border-indigo-500/30 pt-8">
                <span className="text-base font-bold text-indigo-100 bg-indigo-950/40 px-6 py-4 rounded-2xl border border-indigo-800/50">Lütfen sınavdan 30 dakika önce merkezde olunuz.</span>
                {!isExamTimePassed && ( <button onClick={() => navigateTo('register')} className="w-full sm:w-auto bg-white/20 text-white px-8 py-4 rounded-2xl text-lg font-black shadow-lg hover:bg-white/30 transition flex items-center justify-center border border-white/40"><Clock className="w-6 h-6 mr-3"/> Oturumu Değiştir</button> )}
              </div>
            </div>
          ) : (
            <div className="bg-white border-4 border-indigo-100 rounded-[3rem] p-12 text-center shadow-xl shadow-indigo-100/50 animate-in zoom-in-95">
              <Award className="w-24 h-24 text-indigo-300 mx-auto mb-6" />
              <h3 className="text-3xl font-black text-slate-800 mb-4">Şu an aktif bir sınavınız yok.</h3>
              <p className="text-lg text-slate-600 mb-8 font-medium">Bölgenizde açılan yeni sınavlara hemen başvurabilir veya kayıtlı sınavlarınızı buradan yönetebilirsiniz.</p>
              <button onClick={() => navigateTo('register')} className="bg-indigo-600 text-white font-black text-xl py-5 px-10 rounded-2xl hover:bg-indigo-700 hover:scale-105 transition shadow-xl shadow-indigo-500/30">Yeni Bir Sınava Başvur</button>
            </div>
          )}

          <div className="mt-12"><TimelineCalendar zoneExams={zoneExams} currentUser={currentUser} defaultContact={matchedZone?.mappings?.[0]} /></div>

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
                      <p className="text-slate-500 font-bold flex items-center"><CalendarIcon className="w-5 h-5 mr-2 text-indigo-400"/> {past.date} - {past.time.replace(':', '.')} Oturumu</p>
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