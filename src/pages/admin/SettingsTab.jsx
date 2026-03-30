import React, { useState, useEffect } from 'react';
import { Gift, Trophy, Award, Plus, Trash2, CalendarIcon, CheckCircle2 } from 'lucide-react';
import { db, appId } from '../../services/firebase';
import { updateDoc, doc, addDoc, collection, deleteDoc } from "firebase/firestore";
import { INITIAL_ZONES } from '../../data/constants';
import { parsePrizeArray } from '../../utils/helpers';

export default function SettingsTab({ adminZoneData, isSuperAdmin, adminZoneId, setHasMadeChanges, filteredExams, zones }) {
  const [localPrizes, setLocalPrizes] = useState({ grand: { title: '', desc: '', img: '' }, degree: [{ title: '', desc: '', img: '' }], participation: [{ title: '', desc: '', img: '' }] });
  const [examData, setExamData] = useState({ title: '' });
  const [examSessions, setExamSessions] = useState([{ date: '', times: '' }]);

  useEffect(() => {
    if(adminZoneData && !isSuperAdmin) {
      setLocalPrizes({
        grand: parsePrizeArray(adminZoneData.prizes?.grand)[0] || { title: '', desc: '', img: '' },
        degree: parsePrizeArray(adminZoneData.prizes?.degree).length ? parsePrizeArray(adminZoneData.prizes?.degree) : [{ title: '', desc: '', img: '' }],
        participation: parsePrizeArray(adminZoneData.prizes?.participation).length ? parsePrizeArray(adminZoneData.prizes?.participation) : [{ title: '', desc: '', img: '' }]
      });
    }
  }, [adminZoneData, isSuperAdmin]);

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
      .map(s => ({ date: s.date, slots: s.times.split(',').map(t => t.trim()).filter(t => t) }));
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

  return (
    <div className="bg-white rounded-[3rem] shadow-xl border-4 border-slate-100 p-8 md:p-12 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 border-b-2 border-slate-100 pb-8 gap-4">
        <div>
          <h3 className="font-black text-3xl text-slate-900 mb-2">{adminZoneData.name}</h3>
          <p className="text-base font-bold text-slate-500">{isSuperAdmin ? "Sorumlu Olduğunuz: TÜM TÜRKİYE" : `Sorumlu Olduğunuz Mıntıka Ayarları`}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div>
          <div className="text-sm font-black text-indigo-600 uppercase mb-4 tracking-wider flex items-center"><Gift className="w-6 h-6 mr-2"/> {isSuperAdmin ? 'Tüm Türkiye' : 'Bölge'} Ödüllerini Yönet</div>
          <div className="space-y-6 bg-slate-50 p-6 rounded-3xl border-2 border-slate-100">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-sm font-black text-slate-800 mb-3 flex items-center"><Trophy className="w-5 h-5 text-yellow-500 mr-2"/> Büyük Ödül</div>
              <input type="text" value={localPrizes.grand.title} onChange={e=>setLocalPrizes({...localPrizes, grand: {...localPrizes.grand, title: e.target.value}})} className="w-full text-sm font-bold p-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 mb-2" placeholder="Ödül Başlığı (Örn: PlayStation 5)"/>
              <textarea rows="2" value={localPrizes.grand.desc} onChange={e=>setLocalPrizes({...localPrizes, grand: {...localPrizes.grand, desc: e.target.value}})} className="w-full text-sm font-medium p-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 mb-2 resize-none" placeholder="Açıklama (İsteğe bağlı)"/>
              <input type="text" value={localPrizes.grand.img} onChange={e=>setLocalPrizes({...localPrizes, grand: {...localPrizes.grand, img: e.target.value}})} className="w-full text-sm font-bold p-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500" placeholder="Resim Linki veya Dosya Adı (Örn: ps5.png)"/>
            </div>
            
            {/* Derece ve Katılım ödülleri UI mantığı (App.jsx'teki aynı bloklar buraya kopyalanmıştır, yer tasarrufu için kısaltıldı) */}
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
  );
}