import React, { useState, useEffect } from 'react';
import { Gift, Trophy, Award, Plus, Trash2, CalendarIcon, CheckCircle2, Edit, AlertCircle, Eye, EyeOff, ShieldAlert, X } from 'lucide-react';
import { db, appId } from '../../services/firebase';
import { updateDoc, doc, addDoc, collection, deleteDoc, getDocs, query, where, arrayUnion, arrayRemove } from "firebase/firestore";
import { INITIAL_ZONES } from '../../data/constants';
import { parsePrizeArray } from '../../utils/helpers';
import { sendSMS, SMS_FOOTER } from '../../services/smsService'; 

export default function SettingsTab({ adminZoneData, isSuperAdmin, adminZoneId, setHasMadeChanges, filteredExams, zones }) {
  const [localPrizes, setLocalPrizes] = useState({ grand: { title: '', desc: '', img: '' }, degree: [{ title: '', desc: '', img: '' }], participation: [{ title: '', desc: '', img: '' }] });
  const [examData, setExamData] = useState({ title: '' });
  const [examSessions, setExamSessions] = useState([{ date: '', times: '' }]);
  const [editingExamId, setEditingExamId] = useState(null);

  const [prizeMappingModal, setPrizeMappingModal] = useState({
      isOpen: false, unmatchedOldPrizes: [], newPrizes: [], affectedStudents: [], targetZoneIds: [], currentMapping: {} 
  });

  const [restrictGrade, setRestrictGrade] = useState('8');
  const [restrictGender, setRestrictGender] = useState('Kız');
  
  const [togglingSlot, setTogglingSlot] = useState(null);

  useEffect(() => {
    if (isSuperAdmin && zones && zones.length > 0) {
      const sample = zones[0]?.prizes;
      if (sample) {
        setLocalPrizes({
          grand: parsePrizeArray(sample.grand)[0] || { title: '', desc: '', img: '' },
          degree: parsePrizeArray(sample.degree).length ? parsePrizeArray(sample.degree) : [{ title: '', desc: '', img: '' }],
          participation: parsePrizeArray(sample.participation).length ? parsePrizeArray(sample.participation) : [{ title: '', desc: '', img: '' }]
        });
      }
    } else if (adminZoneData && !isSuperAdmin) {
      setLocalPrizes({
        grand: parsePrizeArray(adminZoneData.prizes?.grand)[0] || { title: '', desc: '', img: '' },
        degree: parsePrizeArray(adminZoneData.prizes?.degree).length ? parsePrizeArray(adminZoneData.prizes?.degree) : [{ title: '', desc: '', img: '' }],
        participation: parsePrizeArray(adminZoneData.prizes?.participation).length ? parsePrizeArray(adminZoneData.prizes?.participation) : [{ title: '', desc: '', img: '' }]
      });
    }
  }, [adminZoneData, isSuperAdmin, zones]);

  const handleUpdatePrizes = async () => {
    try {
      const targetZoneIds = isSuperAdmin ? INITIAL_ZONES.map(z => z.id) : [adminZoneId];
      const newPartPrizes = localPrizes.participation.filter(p => p.title).map(p => p.title);
      const newPartPrizesLower = newPartPrizes.map(p => p.toLowerCase().trim());

      let allAffectedStudents = [];
      for (const zId of targetZoneIds) {
          const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'students'), where("zone.id", "==", parseInt(zId)));
          const studentsSnap = await getDocs(q);
          studentsSnap.docs.forEach(d => {
              const s = { firebaseId: d.id, ...d.data() };
              if (s.selectedParticipationPrize) allAffectedStudents.push(s);
          });
      }

      const uniqueOldPrizes = [...new Set(allAffectedStudents.map(s => s.selectedParticipationPrize))];
      const unmatched = [];
      uniqueOldPrizes.forEach(oldPrize => {
          const oldLower = oldPrize.toLowerCase().trim();
          if (!newPartPrizesLower.includes(oldLower)) unmatched.push(oldPrize);
      });

      if (unmatched.length > 0) {
          const initialMapping = {};
          unmatched.forEach(p => initialMapping[p] = '');
          setPrizeMappingModal({ isOpen: true, unmatchedOldPrizes: unmatched, newPrizes: newPartPrizes, affectedStudents: allAffectedStudents, targetZoneIds: targetZoneIds, currentMapping: initialMapping });
      } else {
          await executeFinalPrizeUpdate(targetZoneIds, allAffectedStudents, newPartPrizes, {});
      }
    } catch (e) { console.error(e); }
  };

  const executeFinalPrizeUpdate = async (targetZoneIds, affectedStudents, newPrizes, manualMapping) => {
    try {
        setHasMadeChanges(true);
        let totalSmsCount = 0; let smsQueue = []; let updatePromises = [];

        for (const zId of targetZoneIds) {
            updatePromises.push(updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'zones', zId.toString()), { prizes: localPrizes }));
        }

        const newPrizesLowerMap = {};
        newPrizes.forEach(p => newPrizesLowerMap[p.toLowerCase().trim()] = p);

        for (const s of affectedStudents) {
            const oldPrize = s.selectedParticipationPrize;
            const oldLower = oldPrize.toLowerCase().trim();
            let finalPrizeForStudent = oldPrize; 

            if (newPrizesLowerMap[oldLower]) finalPrizeForStudent = newPrizesLowerMap[oldLower];
            else if (manualMapping[oldPrize]) finalPrizeForStudent = manualMapping[oldPrize];

            if (finalPrizeForStudent === 'DELETE') {
                updatePromises.push(updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'students', s.firebaseId), { selectedParticipationPrize: '' }));
                if (s.phone) smsQueue.push({ tel: [s.phone], msg: `Önemli: Bölgenizdeki katılım ödülleri güncellenmiştir. Lütfen odullusinav.net profilinize giriş yaparak yeni ödülünüzü seçiniz.${SMS_FOOTER}` });
            } else if (finalPrizeForStudent !== oldPrize) {
                updatePromises.push(updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'students', s.firebaseId), { selectedParticipationPrize: finalPrizeForStudent }));
            }
        }

        await Promise.all(updatePromises);
        if (smsQueue.length > 0) { await sendSMS(smsQueue); totalSmsCount += smsQueue.length; }

        setPrizeMappingModal({ isOpen: false, unmatchedOldPrizes: [], newPrizes: [], affectedStudents: [], targetZoneIds: [], currentMapping: {} });

        if (totalSmsCount > 0) alert(`Ödüller güncellendi! İptal edilen ${totalSmsCount} öğrenciye SMS ile haber verildi.`);
        else alert(`Ödüller başarıyla güncellendi! Hiçbir öğrenciye SMS gitmedi, profilleri sessizce güncellendi.`);
    } catch (e) { console.error("Güncelleme hatası", e); alert("Ödüller güncellenirken bir hata oluştu."); }
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

  const handleEditExam = (exam) => {
     setExamData({ title: exam.title });
     const editableSessions = (exam.sessions || []).map(s => ({ date: s.date, times: s.slots ? s.slots.join(', ') : '' }));
     setExamSessions(editableSessions.length > 0 ? editableSessions : [{ date: '', times: '' }]);
     setEditingExamId(exam.firebaseId);
     window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddOrUpdateExam = async () => {
    if(!examData.title) return alert("Sınav Adı boş bırakılamaz.");
    
    let existingClosedSlotsMap = {};
    if (editingExamId) {
       const existingExam = filteredExams.find(e => e.firebaseId === editingExamId);
       if (existingExam && existingExam.sessions) {
          existingExam.sessions.forEach(s => { existingClosedSlotsMap[s.date] = s.closedSlots || []; });
       }
    }

    const formattedSessions = examSessions
      .filter(s => s.date && s.times)
      .map(s => {
          const slotsArray = s.times.split(',').map(t => t.trim()).filter(t => t);
          const previouslyClosed = existingClosedSlotsMap[s.date] || [];
          const currentlyClosed = slotsArray.filter(slot => previouslyClosed.includes(slot));
          return { date: s.date, slots: slotsArray, closedSlots: currentlyClosed };
      });
    
    if(formattedSessions.length === 0) return alert("Lütfen en az bir geçerli tarih ve saat girin.");

    try {
      setHasMadeChanges(true);
      
      if (editingExamId) {
         await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'exams', editingExamId), {
            title: examData.title, sessions: formattedSessions, updatedAt: new Date().getTime(), active: true, status: 'active'
         });
         
         const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'students'), where("examId", "==", editingExamId));
         const studentsSnap = await getDocs(q);
         
         let smsQueue = []; let updatePromises = [];
         
         studentsSnap.docs.forEach(d => {
             const s = { firebaseId: d.id, ...d.data() };
             let stillValid = false;
             for (let sess of formattedSessions) {
                 if (sess.date === s.selectedDate && sess.slots.includes(s.selectedTime)) { stillValid = true; break; }
             }
             if (!stillValid && s.selectedDate && s.selectedTime) {
                 updatePromises.push(updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'students', s.firebaseId), { examId: null, examTitle: null, selectedDate: null, selectedTime: null, isWaitingPool: true }));
                 if (s.phone) smsQueue.push({ tel: [s.phone], msg: `Önemli: Sınav oturumunuzda saat/tarih değişikliği olmuştur. Lütfen odullusinav.net adresinden profilinize girerek yeni oturumunuzu seçiniz.${SMS_FOOTER}` });
             }
         });
         
         await Promise.all(updatePromises);
         if (smsQueue.length > 0) { await sendSMS(smsQueue); alert(`Oturumu kaldırılan ${smsQueue.length} öğrenciye SMS gönderildi.`); }
         else { alert("Sınav oturumu başarıyla güncellendi!"); }
         setEditingExamId(null);
      } 
      else {
         const targetZoneIds = isSuperAdmin ? INITIAL_ZONES.map(z => z.id) : [adminZoneId];
         for (const zId of targetZoneIds) {
            await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'exams'), { zoneId: zId, title: examData.title, sessions: formattedSessions, createdAt: new Date().getTime(), active: true, status: 'active' });
         }
         alert(`Sınav oturumları başarıyla eklendi!`);
      }
      setExamData({ title: '' }); setExamSessions([{ date: '', times: '' }]);
    } catch (e) { console.error(e); }
  };

  const handleDeleteExam = async (examId) => {
      if(!window.confirm("Bu sınav oturumunu tamamen İPTAL EDİP SİLMEK istediğinize emin misiniz? (Öğrencilere SMS gider)")) return;
      try {
          setHasMadeChanges(true);
          await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'exams', examId));
          
          const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'students'), where("examId", "==", examId));
          const studentsSnap = await getDocs(q);
          
          let smsQueue = []; let updatePromises = [];
          
          studentsSnap.docs.forEach(d => {
              const s = { firebaseId: d.id, ...d.data() };
              updatePromises.push(updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'students', s.firebaseId), { examId: null, examTitle: null, selectedDate: null, selectedTime: null, isWaitingPool: true }));
              if (s.phone) smsQueue.push({ tel: [s.phone], msg: `Önemli: Kayıtlı olduğunuz sınav oturumu iptal edilmiştir. Lütfen odullusinav.net adresinden profilinize girerek yeni bir oturum seçiniz.${SMS_FOOTER}` });
          });
          
          await Promise.all(updatePromises);
          if (smsQueue.length > 0) { await sendSMS(smsQueue); alert(`${smsQueue.length} etkilenen öğrenciye SMS ile haber verildi ve profilleri güncellendi.`); }
      } catch(e) { console.error(e); }
  };

  const handleEndExam = async (exam) => {
      if(!window.confirm(`"${exam.title}" sınavını bitirmek istediğinize emin misiniz?\n\nBu işlem sınava giren tüm öğrencilerin profilinde bu sınavı 'Geçmiş Sınavlar' sekmesine taşıyacak ve öğrencileri yeni sınavlar için boşa (bekleme havuzuna) çıkaracaktır.`)) return;

      try {
          setHasMadeChanges(true);
          await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'exams', exam.firebaseId), { active: false, status: 'completed' });

          const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'students'), where("examId", "==", exam.firebaseId));
          const studentsSnap = await getDocs(q);

          let updatePromises = [];
          studentsSnap.docs.forEach(d => {
              const s = { firebaseId: d.id, ...d.data() };
              const pastExamsList = s.pastExams || [];
              
              if (!pastExamsList.some(p => p.id === exam.firebaseId)) {
                  pastExamsList.push({
                      id: exam.firebaseId,
                      title: exam.title,
                      date: s.selectedDate || "",
                      time: s.selectedTime || "",
                      score: "Açıklanmadı", 
                      rank: "-"
                  });
              }

              updatePromises.push(updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'students', s.firebaseId), {
                  pastExams: pastExamsList,
                  examId: null,
                  examTitle: null,
                  selectedDate: null,
                  selectedTime: null,
                  isWaitingPool: true
              }));
          });

          await Promise.all(updatePromises);
          alert(`Sınav başarıyla bitirildi!\n${studentsSnap.docs.length} öğrencinin profiline 'Geçmiş Sınav' olarak eklendi ve yeni sınavlar için havuzda beklemeye alındılar.`);
      } catch(e) { 
          console.error(e); 
          alert("Sınav bitirilirken bir hata oluştu.");
      }
  };

  const togglePrizeVisibility = (category, index) => {
      const newArr = [...localPrizes[category]];
      newArr[index].isHidden = !newArr[index].isHidden;
      setLocalPrizes({ ...localPrizes, [category]: newArr });
  };

  const toggleSlotCapacityStatus = async (examId, sIdx, slotTime, isCurrentlyClosed) => {
      const key = `${examId}-${sIdx}-${slotTime}`;
      if (togglingSlot === key) return; 
      setTogglingSlot(key);

      try {
          setHasMadeChanges(true);
          const examToUpdate = filteredExams.find(e => e.firebaseId === examId);
          if (!examToUpdate) return;

          let updatedSessions = [...examToUpdate.sessions];
          let closedSlotsArr = updatedSessions[sIdx].closedSlots || [];

          if (isCurrentlyClosed) closedSlotsArr = closedSlotsArr.filter(t => t !== slotTime);
          else if (!closedSlotsArr.includes(slotTime)) closedSlotsArr.push(slotTime);

          updatedSessions[sIdx].closedSlots = closedSlotsArr;
          await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'exams', examId), { sessions: updatedSessions });

      } catch (e) { console.error(e); alert("Oturum durumu güncellenirken hata oluştu."); } 
      finally { setTogglingSlot(null); }
  };

  const handleAddRestriction = async () => {
    const groupStr = `${restrictGrade}-${restrictGender}`;
    try {
        setHasMadeChanges(true);
        const targetZoneIds = isSuperAdmin ? INITIAL_ZONES.map(z => z.id) : [adminZoneId];
        
        for (const zId of targetZoneIds) {
            await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'zones', zId.toString()), {
                restrictedGroups: arrayUnion(groupStr)
            });
        }
        alert(`${restrictGrade}. Sınıf ${restrictGender} kayıtları durduruldu!`);
    } catch (e) { console.error(e); alert("Kısıtlama eklenirken hata oluştu."); }
  };

  const handleRemoveRestriction = async (groupStr) => {
    try {
        setHasMadeChanges(true);
        const targetZoneIds = isSuperAdmin ? INITIAL_ZONES.map(z => z.id) : [adminZoneId];
        
        for (const zId of targetZoneIds) {
            await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'zones', zId.toString()), {
                restrictedGroups: arrayRemove(groupStr)
            });
        }
    } catch (e) { console.error(e); alert("Kısıtlama kaldırılırken hata oluştu."); }
  };

  return (
    <div className="bg-white rounded-[3rem] shadow-xl border-4 border-slate-100 p-8 md:p-12 animate-in fade-in zoom-in-95 duration-300 relative">
      
      {prizeMappingModal.isOpen && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[99] flex items-center justify-center p-4">
              <div className="bg-white rounded-[2rem] shadow-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto border-4 border-indigo-100 animate-in zoom-in-95">
                  <h3 className="text-2xl font-black text-slate-800 mb-4 flex items-center"><AlertCircle className="w-8 h-8 text-amber-500 mr-3"/> Ödül Eşleştirme Gerekli</h3>
                  <p className="text-slate-600 font-bold mb-6 text-sm leading-relaxed">
                      Ödül listesini değiştirdin. Sistem, daha önceden eski ödülleri seçmiş öğrenciler olduğunu tespit etti. <br/>
                      Lütfen aşağıdaki eski ödüllerin, <span className="text-indigo-600">yeni listede hangi ödüle denk geldiğini seç.</span>
                  </p>

                  <div className="space-y-4 mb-8">
                      {prizeMappingModal.unmatchedOldPrizes.map((oldPrize, idx) => {
                          const affectedCount = prizeMappingModal.affectedStudents.filter(s => s.selectedParticipationPrize === oldPrize).length;
                          return (
                              <div key={idx} className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                  <div>
                                      <div className="font-black text-slate-800">Eski Ödül: <span className="text-amber-600">"{oldPrize}"</span></div>
                                      <div className="text-xs font-black text-slate-500 mt-1">{affectedCount} Öğrenci Bu Ödülü Seçmişti</div>
                                  </div>
                                  <select 
                                      className="p-3 rounded-xl border-2 border-indigo-200 outline-none focus:border-indigo-500 font-bold text-sm bg-white"
                                      value={prizeMappingModal.currentMapping[oldPrize] || ''}
                                      onChange={(e) => setPrizeMappingModal({
                                          ...prizeMappingModal, 
                                          currentMapping: { ...prizeMappingModal.currentMapping, [oldPrize]: e.target.value }
                                      })}
                                  >
                                      <option value="">-- Yeni Durumu Seçin --</option>
                                      <option value="DELETE" className="text-red-600 font-black">❌ İPTAL ET (SMS Gönder & Sıfırla)</option>
                                      <optgroup label="Sessizce Şununla Değiştir (SMS Gitmez):">
                                          {prizeMappingModal.newPrizes.map(np => (
                                              <option key={np} value={np}>✅ {np}</option>
                                          ))}
                                      </optgroup>
                                  </select>
                              </div>
                          )
                      })}
                  </div>

                  <div className="flex gap-4">
                      <button onClick={() => setPrizeMappingModal({...prizeMappingModal, isOpen: false})} className="flex-1 py-4 bg-slate-200 hover:bg-slate-300 text-slate-800 font-black rounded-xl transition">İşlemi İptal Et</button>
                      <button 
                          onClick={() => {
                              const unmapped = Object.values(prizeMappingModal.currentMapping).some(v => v === '');
                              if (unmapped) return alert("Lütfen listedeki TÜM eski ödüller için bir eylem (Eşleştirme veya İptal) seçiniz.");
                              executeFinalPrizeUpdate(prizeMappingModal.targetZoneIds, prizeMappingModal.affectedStudents, prizeMappingModal.newPrizes, prizeMappingModal.currentMapping);
                          }} 
                          className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl transition shadow-lg"
                      >
                          Ödülleri Onayla ve Güncelle
                      </button>
                  </div>
              </div>
          </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 border-b-2 border-slate-100 pb-8 gap-4">
        <div>
          <h3 className="font-black text-3xl text-slate-900 mb-2">{adminZoneData.name}</h3>
          <p className="text-base font-bold text-slate-500">{isSuperAdmin ? "Sorumlu Olduğunuz: TÜM TÜRKİYE" : `Sorumlu Olduğunuz Mıntıka Ayarları`}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div>
          <div className="text-sm font-black text-red-600 uppercase mb-4 tracking-wider flex items-center"><ShieldAlert className="w-6 h-6 mr-2"/> Kapasite & Özel Kısıtlamalar</div>
          
          <div className="bg-red-50 p-6 rounded-3xl border-2 border-red-100 mb-10 relative overflow-hidden">
              <h4 className="font-black text-lg text-red-900 mb-2">Sınıf ve Cinsiyet Bazlı Kayıt Kısıtlamaları</h4>
              <p className="text-sm font-bold text-red-700 mb-4">Kapasitesi dolan grupların sisteme yeni kayıt olmasını buradan durdurabilirsiniz.</p>

              <div className="flex flex-col sm:flex-row gap-3 mb-6 relative z-10">
                  <select value={restrictGrade} onChange={e=>setRestrictGrade(e.target.value)} className="flex-1 p-3 rounded-xl border-2 border-red-200 font-bold outline-none focus:border-red-500 bg-white text-red-900">
                      {[3,4,5,6,7,8].map(g => <option key={g} value={g}>{g}. Sınıf</option>)}
                  </select>
                  <select value={restrictGender} onChange={e=>setRestrictGender(e.target.value)} className="flex-1 p-3 rounded-xl border-2 border-red-200 font-bold outline-none focus:border-red-500 bg-white text-red-900">
                      <option value="Kız">Kız</option>
                      <option value="Erkek">Erkek</option>
                  </select>
                  <button onClick={handleAddRestriction} className="bg-red-600 text-white font-black px-6 py-3 rounded-xl hover:bg-red-700 transition shadow-md whitespace-nowrap">
                      Kayıtları Kapat
                  </button>
              </div>

              <div className="relative z-10">
                  <h5 className="text-xs font-black text-red-800 uppercase tracking-wider mb-3">Şu An Kayda Kapalı Olan Gruplar:</h5>
                  {(adminZoneData?.restrictedGroups || []).length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                          {(adminZoneData?.restrictedGroups || []).map(group => (
                              <span key={group} className="bg-red-600 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center shadow-sm">
                                  <ShieldAlert className="w-4 h-4 mr-2"/>
                                  {group.split('-')[0]}. Sınıf {group.split('-')[1]} (KAPALI)
                                  <button onClick={() => handleRemoveRestriction(group)} className="ml-3 bg-white/20 hover:bg-white/40 rounded-full p-1 transition" title="Kilidi Kaldır (Kayda Aç)">
                                      <X className="w-4 h-4"/>
                                  </button>
                              </span>
                          ))}
                      </div>
                  ) : (
                      <div className="text-sm font-bold text-red-700/70 italic">Şu an kısıtlanmış bir grup yok. Tüm sınıfların kayıtları açık.</div>
                  )}
              </div>
          </div>

          <div className="text-sm font-black text-indigo-600 uppercase mb-4 tracking-wider flex items-center"><Gift className="w-6 h-6 mr-2"/> {isSuperAdmin ? 'Tüm Türkiye' : 'Bölge'} Ödüllerini Yönet</div>
          <div className="space-y-6 bg-slate-50 p-6 rounded-3xl border-2 border-slate-100">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm relative">
              <div className="text-sm font-black text-slate-800 mb-3 flex items-center"><Trophy className="w-5 h-5 text-yellow-500 mr-2"/> Büyük Ödül</div>
              <input type="text" value={localPrizes.grand.title} onChange={e=>setLocalPrizes({...localPrizes, grand: {...localPrizes.grand, title: e.target.value}})} className="w-full text-sm font-bold p-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 mb-2" placeholder="Ödül Başlığı (Örn: PlayStation 5)"/>
              <textarea rows="2" value={localPrizes.grand.desc} onChange={e=>setLocalPrizes({...localPrizes, grand: {...localPrizes.grand, desc: e.target.value}})} className="w-full text-sm font-medium p-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 mb-2 resize-none" placeholder="Açıklama (İsteğe bağlı)"/>
              <input type="text" value={localPrizes.grand.img} onChange={e=>setLocalPrizes({...localPrizes, grand: {...localPrizes.grand, img: e.target.value}})} className="w-full text-sm font-bold p-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500" placeholder="Resim Linki veya Dosya Adı"/>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-sm font-black text-slate-800 mb-3 flex justify-between items-center">
                 <span className="flex items-center"><Award className="w-5 h-5 text-indigo-500 mr-2"/> Derece Ödülleri</span>
                 <button onClick={() => setLocalPrizes({...localPrizes, degree: [...localPrizes.degree, {title:'', desc:'', img:'', isHidden: false}]})} className="text-indigo-600 bg-indigo-50 p-1.5 rounded-lg hover:bg-indigo-100"><Plus className="w-4 h-4"/></button>
              </div>
              {localPrizes.degree.map((pz, idx) => (
                <div key={idx} className={`mb-4 pb-4 border-b border-slate-100 last:border-0 last:mb-0 last:pb-0 transition-opacity ${pz.isHidden ? 'opacity-50' : 'opacity-100'}`}>
                  <div className="flex gap-2 mb-2 items-center">
                      <span className="text-xs font-black text-slate-400 w-4">{idx+1}.</span>
                      <input type="text" value={pz.title} onChange={e => { const newArr=[...localPrizes.degree]; newArr[idx].title=e.target.value; setLocalPrizes({...localPrizes, degree: newArr}); }} className={`flex-1 text-sm font-bold p-3 rounded-xl border outline-none focus:border-indigo-500 ${pz.isHidden ? 'border-red-200 bg-red-50 text-red-700 line-through decoration-red-300' : 'border-slate-200 bg-white text-slate-800'}`} placeholder={`${idx+1}. Ödül Başlığı`}/>
                      <button onClick={() => togglePrizeVisibility('degree', idx)} className={`p-3 rounded-xl transition ${pz.isHidden ? 'text-red-500 bg-red-100 hover:bg-red-200' : 'text-blue-500 bg-blue-50 hover:bg-blue-100'}`} title={pz.isHidden ? "Ödül Gizli (Göstermek İçin Tıkla)" : "Ödülü Gizle"}>{pz.isHidden ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}</button>
                      <button onClick={() => { const newArr=localPrizes.degree.filter((_,i)=>i!==idx); setLocalPrizes({...localPrizes, degree:newArr}); }} className="p-3 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl" title="Ödülü Tamamen Sil"><Trash2 className="w-4 h-4"/></button>
                  </div>
                  <input type="text" value={pz.img} onChange={e => { const newArr=[...localPrizes.degree]; newArr[idx].img=e.target.value; setLocalPrizes({...localPrizes, degree: newArr}); }} className="w-full text-sm font-bold p-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 mb-2" placeholder="Resim Linki veya Dosya Adı"/>
                  <textarea rows="2" value={pz.desc} onChange={e => { const newArr=[...localPrizes.degree]; newArr[idx].desc=e.target.value; setLocalPrizes({...localPrizes, degree: newArr}); }} className="w-full text-sm font-medium p-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 resize-none" placeholder="Açıklama"/>
                </div>
              ))}
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-sm font-black text-slate-800 mb-3 flex justify-between items-center">
                 <span className="flex items-center"><Gift className="w-5 h-5 text-emerald-500 mr-2"/> Katılım Ödülleri</span>
                 <button onClick={() => setLocalPrizes({...localPrizes, participation: [...localPrizes.participation, {title:'', desc:'', img:'', isHidden: false}]})} className="text-emerald-600 bg-emerald-50 p-1.5 rounded-lg hover:bg-emerald-100"><Plus className="w-4 h-4"/></button>
              </div>
              {localPrizes.participation.map((pz, idx) => (
                <div key={idx} className={`mb-4 pb-4 border-b border-slate-100 last:border-0 last:mb-0 last:pb-0 transition-opacity ${pz.isHidden ? 'opacity-50' : 'opacity-100'}`}>
                  <div className="flex gap-2 mb-2 items-center">
                      <span className="text-xs font-black text-slate-400 w-4">{idx+1}.</span>
                      <input type="text" value={pz.title} onChange={e => { const newArr=[...localPrizes.participation]; newArr[idx].title=e.target.value; setLocalPrizes({...localPrizes, participation: newArr}); }} className={`flex-1 text-sm font-bold p-3 rounded-xl border outline-none focus:border-indigo-500 ${pz.isHidden ? 'border-red-200 bg-red-50 text-red-700 line-through decoration-red-300' : 'border-slate-200 bg-white text-slate-800'}`} placeholder={`${idx+1}. Ödül Başlığı`}/>
                      <button onClick={() => togglePrizeVisibility('participation', idx)} className={`p-3 rounded-xl transition ${pz.isHidden ? 'text-red-500 bg-red-100 hover:bg-red-200' : 'text-blue-500 bg-blue-50 hover:bg-blue-100'}`} title={pz.isHidden ? "Ödül Gizli (Göstermek İçin Tıkla)" : "Ödülü Gizle"}>{pz.isHidden ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}</button>
                      {idx > 0 && <button onClick={() => { const newArr=localPrizes.participation.filter((_,i)=>i!==idx); setLocalPrizes({...localPrizes, participation:newArr}); }} className="p-3 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl" title="Ödülü Tamamen Sil"><Trash2 className="w-4 h-4"/></button>}
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
          <div className="text-sm font-black text-indigo-600 uppercase mb-4 tracking-wider flex items-center">
             <CalendarIcon className="w-6 h-6 mr-2"/> {editingExamId ? 'Sınav Oturumunu Düzenle' : 'Yeni Sınav Oturumu Planla'}
          </div>
          
          <div className={`space-y-4 p-6 rounded-3xl border-2 transition-all duration-300 ${editingExamId ? 'bg-amber-50 border-amber-300 shadow-xl' : 'bg-slate-50 border-slate-100'}`}>
             <div>
               <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">Sınav Adı (Etkinlik Adı)</label>
               <input type="text" value={examData.title} onChange={e=>setExamData({title:e.target.value})} className={`w-full text-base font-bold p-4 rounded-xl border outline-none focus:border-indigo-500 ${editingExamId ? 'border-amber-200 bg-white' : 'border-slate-200'}`} placeholder="Örn: 1. Dönem LGS Provası"/>
             </div>
             
             <div className="pt-2 border-t-2 border-slate-200/50">
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
             
             <div className="flex gap-3 mt-6">
                 {editingExamId && (
                    <button onClick={() => {setEditingExamId(null); setExamData({title:''}); setExamSessions([{date:'', times:''}]);}} className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-black py-4 px-4 rounded-xl transition w-1/3">İptal</button>
                 )}
                 <button onClick={handleAddOrUpdateExam} className={`text-white text-base font-black py-4 px-4 rounded-xl transition shadow-md flex items-center justify-center flex-1 ${editingExamId ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-200' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'}`}>
                   {editingExamId ? <><Edit className="w-5 h-5 mr-2"/> Değişiklikleri Kaydet</> : <><CheckCircle2 className="w-5 h-5 mr-2"/> Oturumları Toplu Ekle</>}
                 </button>
             </div>
          </div>

          <div className="mt-8">
              <div className="text-sm font-black text-indigo-600 uppercase mb-4 tracking-wider">Planlanmış Sınavlar</div>
              <div className="space-y-4">
                {filteredExams.length > 0 ? filteredExams.map(exam => {
                  const sessions = exam.sessions || [];
                  const isEnded = exam.status === 'completed' || exam.active === false;
                  
                  return (
                    <div key={exam.firebaseId} className={`border-2 p-5 rounded-2xl relative group transition-all ${isEnded ? 'bg-slate-50 border-slate-200 opacity-80' : 'bg-indigo-50 border-indigo-100'}`}>
                      <div className="absolute top-4 right-4 flex gap-2">
                          {!isEnded && (
                             <button onClick={() => handleEndExam(exam)} className="p-2 text-emerald-600 bg-white shadow-sm border border-emerald-200 hover:bg-emerald-600 hover:text-white rounded-xl transition" title="Sınavı Bitir / Arşive Kaldır"><CheckCircle2 className="w-4 h-4"/></button>
                          )}
                          <button onClick={() => handleEditExam(exam)} className="p-2 text-indigo-500 bg-white shadow-sm border border-indigo-100 hover:bg-indigo-500 hover:text-white rounded-xl transition" title="Sınavı Düzenle"><Edit className="w-4 h-4"/></button>
                          <button onClick={() => handleDeleteExam(exam.firebaseId)} className="p-2 text-red-500 bg-white shadow-sm border border-red-100 hover:bg-red-500 hover:text-white rounded-xl transition" title="Sınavı Tamamen Sil"><Trash2 className="w-4 h-4"/></button>
                      </div>
                      
                      <h4 className="font-black text-lg text-indigo-900 mb-4 pr-32 flex items-center">
                         {exam.title} {isSuperAdmin ? `(${zones.find(z=>z.id === exam.zoneId)?.name})` : ''}
                         {isEnded && <span className="ml-3 text-[10px] bg-slate-200 text-slate-600 px-2 py-1 rounded-md">BİTTİ</span>}
                      </h4>
                      
                      <div className="space-y-3">
                        {sessions.map((session, idx) => {
                           const [y, m, d] = session.date.split('-');
                           const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
                           const finalDateDisplay = `${d}.${m}.${y} (${parseInt(d)} ${monthNames[parseInt(m)-1]})`;
                           const closedSlots = session.closedSlots || []; 

                           return (
                             <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-3 bg-white/50 p-2 rounded-xl">
                               <span className="bg-white px-3 py-1.5 rounded-lg border border-indigo-200 text-sm font-bold text-slate-800 w-max shadow-sm"><CalendarIcon className="inline w-4 h-4 mr-1.5 text-indigo-500"/>{finalDateDisplay}</span>
                               <div className="flex flex-wrap gap-2">
                                 {session.slots && session.slots.map(s => {
                                    const isClosed = closedSlots.includes(s);
                                    return (
                                        <button 
                                            key={s} 
                                            onClick={() => !isEnded && toggleSlotCapacityStatus(exam.firebaseId, idx, s, isClosed)}
                                            disabled={isEnded}
                                            className={`shadow-sm px-3 py-1 text-sm font-black rounded-lg transition ${isEnded ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : isClosed ? 'bg-red-500 text-white border border-red-600 hover:scale-105' : 'bg-emerald-500 text-white border border-emerald-600 hover:scale-105'}`}
                                            title={isEnded ? "Sınav bittiği için değiştirilemez." : isClosed ? "Şu an KAPALI. Açmak için tıkla." : "Şu an AÇIK. Kapatmak için tıkla."}
                                        >
                                            {s} {isClosed && "(Dolu)"}
                                        </button>
                                    )
                                 })}
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
  );
}