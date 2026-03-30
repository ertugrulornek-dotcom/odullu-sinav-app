import React, { useState } from 'react';
import { Download, MessageSquare, Plus, Trash2, Send, Trophy, Filter } from 'lucide-react';
import { db, appId } from '../../services/firebase';
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { sendSMS, SMS_FOOTER } from '../../services/smsService';
import { getNeighborhoodDetails } from '../../utils/helpers';

export default function StudentsTab({ students, isSuperAdmin, adminZoneData, zones, setHasMadeChanges }) {
  const [resultModal, setResultModal] = useState({ isOpen: false, student: null, score: '', rank: '' });
  const [smsModal, setSmsModal] = useState({ isOpen: false, type: 'custom', customMsg: '', loading: false, targetStudent: null });

  // FİLTRELEME STATE'LERİ
  const [filterGrade, setFilterGrade] = useState('');
  const [filterSchool, setFilterSchool] = useState('');
  const [filterZone, setFilterZone] = useState('');

  // SADECE GÜNCEL LİSTEDEKİ KURUMLARI SEÇENEK OLARAK ÇIKAR
  const uniqueSchools = [...new Set(students.map(s => s.schoolName).filter(Boolean))].sort((a,b) => a.localeCompare(b, 'tr-TR'));

  // FİLTRELERİ UYGULAMA
  const displayStudents = students.filter(s => {
      if (filterGrade && s.grade !== filterGrade) return false;
      if (filterSchool && s.schoolName !== filterSchool) return false;
      if (isSuperAdmin && filterZone) {
         if (s.zone?.id !== parseInt(filterZone) && s.zone?.name !== filterZone) return false;
      }
      return true;
  });

  // SINIFLARA GÖRE GRUPLAMA İŞLEMİ
  const groupedStudents = {};
  displayStudents.forEach(s => {
      const g = s.grade || 'Belirtilmemiş';
      if(!groupedStudents[g]) groupedStudents[g] = [];
      groupedStudents[g].push(s);
  });
  
  // Sınıfları sırala (Büyükten küçüğe veya tersi. Ben 8'den 3'e sıraladım)
  const sortedGrades = Object.keys(groupedStudents).sort((a, b) => {
      if(a === 'Belirtilmemiş') return 1;
      if(b === 'Belirtilmemiş') return -1;
      return parseInt(b) - parseInt(a);
  });

  const handleUpdateStudentStatus = async (studentId, field, value) => {
    try {
      setHasMadeChanges(true);
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'students', studentId), { [field]: value });
    } catch(err) { console.error(err); alert("Durum güncellenemedi."); }
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

  // TAM VE EKSİKSİZ SMS FONKSİYONU
  const handleBulkSMS = async () => {
    setSmsModal({ ...smsModal, loading: true });
    
    const targetStudents = smsModal.targetStudent ? [smsModal.targetStudent] : students;
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

      if (smsModal.type === 'custom') {
          text = smsModal.customMsg;
      } else if (smsModal.type === 'announcement') {
          text = `🎯 Büyük fırsat yeniden kapında!\n\nDaha önce katıldığın ödüllü denemeyi hatırlıyor musun? Şimdi çok daha heyecanlısı geliyor! 🚀\n\nYeni ödüllü denememizde yine katılan HERKES kendi seçtiği ödülü kazanma şansı yakalıyor 🎁\nÜstelik dereceye girenleri çok daha büyük sürprizler bekliyor! 🏆🔥\n\nBu fırsatı kaçırma, yerini hemen ayırt!\n👉 Kayıt olmak ve detayları öğrenmek için: odullusinav.net\n\nHadi, bir adım öne geçme zamanı! 💥`;
      } else if (smsModal.type === 'reminder') {
          text = `🚀 Sınav heyecanı başlıyor!\n\nYaklaşan sınavımız için kayıtlar tüm hızıyla devam ediyor! 🎉\nSen de yerini almayı unutma — başarıya giden yol burada başlıyor!\n\nÜstelik bu heyecanı tek başına yaşamak zorunda değilsin…\nArkadaşlarını da sınava davet et, birlikte kazanmanın keyfini çıkar! 💪🔥\n\nDetayları öğrenmek ve sınav oturumunla ilgili düzenlemeleri yapmak için hemen\n👉 odullusinav.net üzerinden profiline giriş yap!\n\nHadi, şimdi harekete geçme zamanı! ⏳✨`;
      } else if (smsModal.type === 'results') {
          text = `Tebrikler! ${student.fullName || 'Öğrencimiz'}, sınav sonuçlarınız açıklanmıştır.\nPuan ve derecenizi odullusinav.net üzerinden öğrenebilirsiniz.\nBirebir analiz ve ödülleriniz için sınav merkezimizden randevu alabilirsiniz.\nSınav Merkezi: ${stdCenter.centerName}\nİletişim: ${stdCenter.phone}\nAdres: ${stdCenter.address}\nKonum: ${stdCenter.mapLink}`;
      }

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
     students.forEach(s => {
        const stdZone = isSuperAdmin ? (zones.find(z => z.id === s.zone?.id) || s.zone) : adminZoneData;
        const center = getNeighborhoodDetails(stdZone, s.district, s.neighborhood, s.gender)?.centerName || 'Bekleniyor';
        const hasPast = s.pastExams && s.pastExams.length > 0;
        const lastPast = hasPast ? s.pastExams[s.pastExams.length-1] : null;
        const activeExam = (s.examTitle || s.exam?.title) ? `${s.examTitle || s.exam?.title} (${s.selectedDate || s.exam?.date} ${s.selectedTime || s.slot})` : 'Yok / Beklemede';
        const score = lastPast ? lastPast.score : '-';
        const rank = lastPast ? lastPast.rank : '-';
        const clean = str => String(str || '').replace(/;/g, ' ').replace(/\n/g, ' ');
        csvContent += `${clean(s.fullName)};${clean(s.parentName)};${clean(s.phone)};${clean(s.grade)};${clean(s.gender)};${clean(s.schoolName)};${clean(s.district)};${clean(s.neighborhood)};${clean(center)};${clean(activeExam)};${clean(score)};${clean(rank)};${clean(s.attendance)};${clean(s.interview)};${clean(s.interviewResult)}\n`;
     });
     const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
     const url = URL.createObjectURL(blob);
     const link = document.createElement("a");
     link.setAttribute("href", url);
     link.setAttribute("download", "Ogrenci_Listesi.csv");
     document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 p-10 overflow-hidden relative animate-in fade-in zoom-in-95 duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <h2 className="text-3xl font-black text-slate-800">{isSuperAdmin ? "Tüm Türkiye Kayıtları" : "Bölge Kayıtları"} ({displayStudents.length})</h2>
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

      {/* FİLTRELEME BÖLÜMÜ */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 bg-slate-50 p-5 rounded-3xl border border-slate-200 shadow-inner">
         <div className="flex items-center text-slate-500 font-black mr-2"><Filter className="w-5 h-5 mr-2"/> Filtreler:</div>
         
         {isSuperAdmin && (
             <select value={filterZone} onChange={e=>setFilterZone(e.target.value)} className="p-3 rounded-xl border-2 border-slate-200 font-bold text-sm outline-none focus:border-indigo-500 bg-white">
                <option value="">Tüm Mıntıkalar</option>
                {zones.filter(z=>z.active).map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
             </select>
         )}

         <select value={filterGrade} onChange={e=>setFilterGrade(e.target.value)} className="p-3 rounded-xl border-2 border-slate-200 font-bold text-sm outline-none focus:border-indigo-500 bg-white">
            <option value="">Tüm Sınıflar</option>
            {[8,7,6,5,4,3].map(g => <option key={g} value={g}>{g}. Sınıflar</option>)}
         </select>

         <select value={filterSchool} onChange={e=>setFilterSchool(e.target.value)} className="p-3 rounded-xl border-2 border-slate-200 font-bold text-sm outline-none focus:border-indigo-500 bg-white max-w-sm flex-1 truncate">
            <option value="">Tüm Kurumlar / Okullar</option>
            {uniqueSchools.map(sch => <option key={sch} value={sch}>{sch}</option>)}
         </select>
      </div>

      <div className="overflow-x-auto rounded-3xl border-2 border-slate-100">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-sm uppercase tracking-widest border-b-2 border-slate-100">
              <th className="p-6 font-black">Öğrenci Adı</th>
              <th className="p-6 font-black">Konum / Okul</th>
              <th className="p-6 font-black">Aktif Sınav & Merkez</th>
              <th className="p-6 font-black">Durum & Notlar</th>
              <th className="p-6 font-black text-right">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-slate-50">
            {sortedGrades.length === 0 ? (
              <tr><td colSpan="5" className="p-16 text-center text-slate-400 font-bold text-lg">Bu filtrelere uygun öğrenci bulunmuyor.</td></tr>
            ) : (
               sortedGrades.map(grade => (
                  <React.Fragment key={`grade-${grade}`}>
                     {/* SINIF AYRAÇ / BAŞLIK SATIRI */}
                     <tr className="bg-indigo-50/70 border-y-4 border-white">
                        <td colSpan="5" className="p-4 px-6 font-black text-indigo-900 text-lg">
                           {grade === 'Belirtilmemiş' ? 'Sınıfı Belirtilmeyenler' : `${grade}. Sınıflar`} 
                           <span className="text-sm font-bold text-indigo-500 ml-2">({groupedStudents[grade].length} Öğrenci)</span>
                        </td>
                     </tr>
                     
                     {/* O SINIFA AİT ÖĞRENCİLER */}
                     {groupedStudents[grade].map(student => {
                        const hasActiveExam = !!(student.examId || student.examTitle || student.exam);
                        const realZoneData = isSuperAdmin ? (zones.find(z => z.id === student.zone?.id) || student.zone) : adminZoneData;
                        const stdCenter = getNeighborhoodDetails(realZoneData, student.district, student.neighborhood, student.gender);
                        
                        return (
                          <tr key={student.firebaseId} className="hover:bg-slate-50 transition-colors border-b border-slate-100">
                            <td className="p-6 font-black text-slate-900 text-lg">
                              {student.fullName}
                              <div className="text-xs font-bold text-slate-400">{student.gender} - {student.phone}</div>
                            </td>
                            <td className="p-6 font-bold text-slate-600">
                               {student.district} / {student.neighborhood}
                               <div className="text-xs font-bold text-indigo-500 mt-1 truncate max-w-[200px]" title={student.schoolName}>{student.schoolName || 'Okul Belirtilmemiş'}</div>
                            </td>
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
                                <button onClick={() => setResultModal({ isOpen: true, student, score: '', rank: '' })} className="bg-yellow-100 text-yellow-700 font-black px-4 py-2 rounded-xl text-sm hover:bg-yellow-200 transition">
                                  Sonuç Gir
                                </button>
                              )}
                              <button onClick={() => setSmsModal({ isOpen: true, type: 'custom', customMsg: '', loading: false, targetStudent: student })} className="text-indigo-400 hover:text-indigo-600 bg-white border border-indigo-200 hover:bg-indigo-50 p-2 rounded-xl transition" title="Özel SMS Gönder"><Send className="w-5 h-5"/></button>
                              <button onClick={() => handleDeleteStudent(student.firebaseId, student.fullName)} className="text-red-400 hover:text-red-600 bg-white border border-red-200 hover:bg-red-50 p-2 rounded-xl transition" title="Öğrenciyi Sil"><Trash2 className="w-5 h-5"/></button>
                            </td>
                          </tr>
                        );
                     })}
                  </React.Fragment>
               ))
            )}
          </tbody>
        </table>
      </div>

      {smsModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] shadow-2xl p-10 w-full max-w-2xl relative animate-in zoom-in-95">
            <button onClick={() => setSmsModal({ ...smsModal, isOpen: false })} className="absolute top-8 right-8 text-slate-400 hover:text-slate-800"><Plus className="w-8 h-8 transform rotate-45"/></button>
            <MessageSquare className="w-16 h-16 text-indigo-500 mx-auto mb-6" />
            <h3 className="text-3xl font-black text-center text-slate-900 mb-2">Akıllı SMS Gönderimi</h3>
            <div className="space-y-6 mb-8 mt-6">
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
                  <textarea rows="4" value={smsModal.customMsg} onChange={e => setSmsModal({...smsModal, customMsg: e.target.value})} className="w-full border-4 border-slate-100 rounded-2xl px-6 py-4 text-base font-bold focus:border-indigo-500 outline-none resize-none" placeholder="Mesajınızı buraya yazın..." />
                </div>
              )}
            </div>
            <button onClick={handleBulkSMS} disabled={smsModal.loading} className="w-full bg-indigo-600 text-white font-black text-xl py-5 rounded-2xl hover:bg-indigo-700 transition shadow-xl shadow-indigo-500/30 flex items-center justify-center">
              {smsModal.loading ? "Gönderiliyor..." : "Mesajı Gönder"} {!smsModal.loading && <Send className="ml-3 w-6 h-6"/>}
            </button>
          </div>
        </div>
      )}

      {resultModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] shadow-2xl p-10 w-full max-w-md relative animate-in zoom-in-95">
            <button onClick={() => setResultModal({ isOpen: false, student: null, score: '', rank: '' })} className="absolute top-6 right-6 text-slate-400 hover:text-slate-800"><Plus className="w-8 h-8 transform rotate-45"/></button>
            <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
            <h3 className="text-2xl font-black text-center text-slate-900 mb-2">Sınav Sonucu Ekle</h3>
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