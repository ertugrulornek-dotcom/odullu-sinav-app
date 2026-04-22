import React, { useState, useMemo } from 'react';
import { Download, MessageSquare, Plus, Trash2, Send, Trophy, Filter, ArrowRightLeft, Edit3, Save } from 'lucide-react';
import { db, appId } from '../../services/firebase';
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { sendSMS, SMS_FOOTER } from '../../services/smsService';
import { getNeighborhoodDetails, parsePrizeArray } from '../../utils/helpers';

export default function StudentsTab({ students, exams = [], isSuperAdmin, adminZoneData, zones, setHasMadeChanges }) {
  const [resultModal, setResultModal] = useState({ isOpen: false, student: null, score: '', rank: '' });
  const [smsModal, setSmsModal] = useState({ isOpen: false, type: 'custom', customMsg: '', loading: false, targetStudent: null });
  const [transferModal, setTransferModal] = useState({ isOpen: false, student: null, targetZoneId: '' });
  
  const [editModal, setEditModal] = useState({ isOpen: false, student: null, prize: '', examId: '', sessionStr: '', fullName: '', phone: '', schoolName: '', grade: '' });

  const [filterGrade, setFilterGrade] = useState('');
  const [filterSchool, setFilterSchool] = useState('');
  const [filterZone, setFilterZone] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [localOverrides, setLocalOverrides] = useState({});

  const uniqueSchools = useMemo(() => 
    [...new Set(students.map(s => s.schoolName).filter(Boolean))].sort((a,b) => a.localeCompare(b, 'tr-TR')),
    [students] 
  );

  const displayStudents = useMemo(() => {
      return students.filter(s => {
          // 🚀 DÜZELTME 4: Sınıf eşleşmesi sırasında sayı/metin uyuşmazlığı garanti altına alındı
          if (filterGrade && String(s.grade) !== String(filterGrade)) return false;
          if (filterSchool && s.schoolName !== filterSchool) return false;
          if (isSuperAdmin && filterZone) {
             if (s.zone?.id?.toString() !== filterZone.toString() && s.zone?.name !== filterZone) return false;
          }
          
          const hasSession = !!(s.examId || s.examTitle || s.exam);
          if (filterStatus === 'Waiting' && hasSession) return false; 
          if (filterStatus === 'Assigned' && !hasSession) return false; 

          return true;
      });
  }, [students, filterGrade, filterSchool, filterZone, filterStatus, isSuperAdmin]);

  const { groupedStudents, sortedGrades } = useMemo(() => {
      const grouped = {};
      displayStudents.forEach(s => {
          const g = s.grade || 'Belirtilmemiş';
          if(!grouped[g]) grouped[g] = [];
          grouped[g].push(s);
      });
      
      const sorted = Object.keys(grouped).sort((a, b) => {
          if(a === 'Belirtilmemiş') return 1;
          if(b === 'Belirtilmemiş') return -1;
          return parseInt(b) - parseInt(a);
      });

      return { groupedStudents: grouped, sortedGrades: sorted };
  }, [displayStudents]);

  const handleUpdateStudentStatus = async (studentId, field, value) => {
    setLocalOverrides(prev => ({
      ...prev,
      [studentId]: { ...(prev[studentId] || {}), [field]: value }
    }));

    try {
      setHasMadeChanges(true);
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'students', studentId), { [field]: value });
      
      setLocalOverrides(prev => {
        const next = { ...prev };
        if (next[studentId]) {
          delete next[studentId][field];
          if (Object.keys(next[studentId]).length === 0) delete next[studentId];
        }
        return next;
      });
    } catch(err) { 
      console.error(err); 
      setLocalOverrides(prev => {
        const next = { ...prev };
        if (next[studentId]) {
          delete next[studentId][field];
          if (Object.keys(next[studentId]).length === 0) delete next[studentId];
        }
        return next;
      });
      alert("Durum güncellenemedi."); 
    }
  };

  const handleSaveResult = async () => {
    const student = resultModal.student;
    
    // 🚀 DÜZELTME 2: Çift kayıt riskine karşı en güncel state kullanılıyor (mergedStudent mantığı)
    const mergedForResult = localOverrides[student.firebaseId] 
        ? { ...student, ...localOverrides[student.firebaseId] } 
        : student;

    const pastExam = { 
        id: mergedForResult.examId || mergedForResult.exam?.firebaseId, 
        title: mergedForResult.examTitle || mergedForResult.exam?.title, 
        date: mergedForResult.selectedDate || mergedForResult.exam?.date, 
        time: mergedForResult.selectedTime || mergedForResult.slot, 
        score: resultModal.score, 
        rank: resultModal.rank,
        participationPrize: mergedForResult.selectedParticipationPrize || '' 
    };
    
    const pastExams = [...(mergedForResult.pastExams || []), pastExam];

    try {
      setHasMadeChanges(true);
      
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'students', student.firebaseId), {
          pastExams: pastExams
      });
      
      setLocalOverrides(prev => ({
          ...prev,
          [student.firebaseId]: { ...(prev[student.firebaseId] || {}), pastExams }
      }));

      setResultModal({ isOpen: false, student: null, score: '', rank: '' });
      alert("Sonuç başarıyla kaydedildi. Öğrencinin aktif sınav oturumu KORUNDU.");
    } catch (err) { console.error(err); }
  };

  const handleDeleteStudent = async (studentId, studentName) => {
    if(window.confirm(`${studentName} silinsin mi?`)) {
      try {
        setHasMadeChanges(true);
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'students', studentId));
        
        // 🚀 DÜZELTME 5: Öğrenci silindiğinde hafızadaki override kalıntıları temizleniyor
        setLocalOverrides(prev => {
            const next = { ...prev };
            delete next[studentId];
            return next;
        });
      } catch (e) { console.error(e); }
    }
  };

  const handleTransferStudent = async () => {
    if (!transferModal.targetZoneId) return alert("Lütfen hedef mıntıkayı seçin.");
    const targetZone = zones.find(z => z.id.toString() === transferModal.targetZoneId.toString());
    if (!targetZone) return;

    try {
      setHasMadeChanges(true);
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'students', transferModal.student.firebaseId), {
        zone: { id: targetZone.id, name: targetZone.name },
        examId: null,
        examTitle: null,
        selectedDate: null,
        selectedTime: null,
        exam: null,
        slot: null,
        notifiedCenter: null,
        isWaitingPool: true 
      });
      
      // 🚀 DÜZELTME 5: Transfer edilen öğrencinin override kalıntıları temizleniyor
      setLocalOverrides(prev => {
          const next = { ...prev };
          delete next[transferModal.student.firebaseId];
          return next;
      });

      alert(`${transferModal.student.fullName} adlı öğrenci ${targetZone.name} mıntıkasına aktarıldı ve bekleme havuzuna alındı.`);
      setTransferModal({ isOpen: false, student: null, targetZoneId: '' });
    } catch(e) { 
      console.error(e); 
      alert("Aktarım sırasında bir hata oluştu."); 
    }
  };

  const handleSaveEdit = async () => {
    try {
        const { student, prize, examId, sessionStr, fullName, phone, schoolName, grade } = editModal;
        
        if (examId && !sessionStr) {
            return alert("Lütfen sınav için bir oturum seçiniz.");
        }

        const updates = {};
        
        if (fullName !== student.fullName) updates.fullName = fullName;
        if (phone !== student.phone) updates.phone = phone;
        if (schoolName !== student.schoolName) updates.schoolName = schoolName;
        if (String(grade) !== String(student.grade)) updates.grade = grade;

        if (prize !== student.selectedParticipationPrize) {
            updates.selectedParticipationPrize = prize;
        }

        if (examId && sessionStr) {
            const selectedExam = exams.find(e => e.firebaseId === examId || e.id === examId);
            const [sDate, sTime] = sessionStr.split('_');

            updates.examId = examId;
            updates.examTitle = selectedExam?.title || "Deneme Sınavı";
            updates.selectedDate = sDate;
            updates.selectedTime = sTime;
            updates.isWaitingPool = false;
            updates.exam = selectedExam || null;
            updates.slot = sTime;
        }

        if (Object.keys(updates).length === 0) {
            return setEditModal({ isOpen: false, student: null, prize: '', examId: '', sessionStr: '', fullName: '', phone: '', schoolName: '', grade: '' });
        }

        setHasMadeChanges(true);
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'students', student.firebaseId), updates);

        const uiUpdates = { ...updates };
        delete uiUpdates.exam;

        setLocalOverrides(prev => ({
            ...prev,
            [student.firebaseId]: { ...(prev[student.firebaseId] || {}), ...uiUpdates }
        }));

        setEditModal({ isOpen: false, student: null, prize: '', examId: '', sessionStr: '', fullName: '', phone: '', schoolName: '', grade: '' });
        alert("Öğrenci bilgileri başarıyla güncellendi!");
    } catch (e) {
        console.error(e);
        alert("Güncelleme sırasında bir hata oluştu.");
    }
  };

  const handleBulkSMS = async () => {
    setSmsModal({ ...smsModal, loading: true });
    const targetStudents = smsModal.targetStudent ? [smsModal.targetStudent] : displayStudents;
    const validStudents = targetStudents.filter(s => s.phone && s.phone.length >= 10);
    
    if (validStudents.length === 0) {
      alert("Gönderilecek numara yok veya filtrelediğiniz listede geçerli telefon numarası bulunmuyor.");
      setSmsModal({ ...smsModal, loading: false, isOpen: false, targetStudent: null });
      return;
    }

    if (!window.confirm(`Dikkat: Bu mesaj ekranda filtrelenmiş ${validStudents.length} kişiye gönderilecek. Onaylıyor musunuz?`)) {
        setSmsModal({ ...smsModal, loading: false });
        return;
    }

    const msgDataArray = validStudents.map(student => {
      const zone = isSuperAdmin ? (zones.find(z => z.id === student.zone?.id) || student.zone) : adminZoneData;
      const stdCenter = getNeighborhoodDetails(zone, student.district, student.neighborhood, student.gender, student.grade);
      let text = "";

      if (smsModal.type === 'custom') text = smsModal.customMsg;
      else if (smsModal.type === 'announcement') text = `BUYUK FIRSAT YENIDEN KAPINDA!\n\nDaha once katildigin odullu denemeyi hatirliyor musun? Simdi cok daha heyecanlisi geliyor!\n\nYeni odullu denememizde katilan HERKES kendi sectigi odulu kazanma sansi yakaliyor.\nUstelik dereceye girenleri buyuk surprizler bekliyor!\n\nBu firsati kacirma, yerini hemen ayirt!\nKayit olmak icin: odullusinav.net\n\nBir adim one gecme zamani!`;
      else if (smsModal.type === 'reminder') text = `SINAV HEYECANI BASLIYOR!\n\nYaklasan sinavimiz icin kayitlar tum hiziyla devam ediyor!\nSen de yerini almayi unutma.\n\nArkadaslarini da sinava davet et, birlikte kazanmanin keyfini cikar!\n\nDetaylari ogrenmek ve sinav oturumunu duzenlemek icin hemen odullusinav.net uzerinden profiline giris yap!\n\nHarekete gecme zamani!`;
      else if (smsModal.type === 'pool_reminder') text = `ONEMLI HATIRLATMA!\n\nSayin Velimiz, ${student.fullName} isimli ogrencimizin kayit islemi henuz TAMAMLANMAMISTIR.\n\nOgrencimiz "Bekleme Havuzunda" yer almaktadir. Sinava girebilmesi icin odullusinav.net adresinden profiline giris yapip SINAV OTURUMU secmeniz gerekmektedir.\n\nOturum secilmeyen kayitlar gecersiz sayilacaktir.`;
      else if (smsModal.type === 'results') text = `Tebrikler! ${student.fullName || 'Ogrencimiz'}, sinav sonuclariniz aciklanmistir.\nPuan ve derecenizi odullusinav.net uzerinden ogrenebilirsiniz.\n\nBirebir analiz icin sinav merkezimizden randevu alabilirsiniz.\nMerkez: ${stdCenter.centerName}\nIletisim: ${stdCenter.phone}\nAdres: ${stdCenter.address}`;

      text += SMS_FOOTER;
      return { tel: [student.phone], msg: text };
    });

    const result = await sendSMS(msgDataArray);
    if(result !== false) alert(`${msgDataArray.length} öğrenciye SMS iletildi!`);
    else alert("SMS gönderimi başarısız.");
    
    setSmsModal({ isOpen: false, type: 'custom', customMsg: '', loading: false, targetStudent: null });
  };

  const handleExportExcel = () => {
     let csvContent = "Ogrenci Isim Soyisim;Veli Isim Soyisim;Telefon;Sinif;Cinsiyet;Okul Bilgisi;Ilce;Mahalle;Atanan Sinav Merkezi;Kayitli Sinav ve Seans;Aciklanan Puan;Derece;Katilim Odulu;Katilim Durumu;Gorusme Durumu;Gorusme Sonucu\n";
     displayStudents.forEach(originalStudent => {
        const s = localOverrides[originalStudent.firebaseId] 
           ? { ...originalStudent, ...localOverrides[originalStudent.firebaseId] } 
           : originalStudent;

        const stdZone = isSuperAdmin ? (zones.find(z => z.id === s.zone?.id) || s.zone) : adminZoneData;
        const center = getNeighborhoodDetails(stdZone, s.district, s.neighborhood, s.gender, s.grade)?.centerName || 'Bekleniyor';
        const hasPast = s.pastExams && s.pastExams.length > 0;
        const lastPast = hasPast ? s.pastExams[s.pastExams.length-1] : null;
        const activeExam = (s.examTitle || s.exam?.title) ? `${s.examTitle || s.exam?.title} (${s.selectedDate || s.exam?.date} ${s.selectedTime || s.slot})` : 'Yok / Beklemede';
        const score = lastPast ? lastPast.score : '-';
        const rank = lastPast ? lastPast.rank : '-';
        
        const prize = s.selectedParticipationPrize || 'Secilmedi';

        const clean = str => String(str || '').replace(/;/g, ' ').replace(/\n/g, ' ');
        
        csvContent += `${clean(s.fullName)};${clean(s.parentName)};${clean(s.phone)};${clean(s.grade)};${clean(s.gender)};${clean(s.schoolName)};${clean(s.district)};${clean(s.neighborhood)};${clean(center)};${clean(activeExam)};${clean(score)};${clean(rank)};${clean(prize)};${clean(s.attendance)};${clean(s.interview)};${clean(s.interviewResult)}\n`;
     });
     const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
     const url = URL.createObjectURL(blob);
     const link = document.createElement("a");
     link.setAttribute("href", url);
     link.setAttribute("download", `Ogrenci_Listesi_${new Date().toLocaleDateString('tr-TR')}.csv`);
     document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 p-10 overflow-hidden relative animate-in fade-in zoom-in-95 duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <h2 className="text-3xl font-black text-slate-800">
           {isSuperAdmin ? "Tüm Türkiye Kayıtları" : "Bölge Kayıtları"} 
           <span className="text-indigo-600 ml-2">({displayStudents.length})</span>
        </h2>
        <div className="flex flex-wrap gap-3">
          <button onClick={handleExportExcel} className="bg-green-50 font-black px-6 py-3 rounded-2xl text-green-700 border-2 border-green-200 hover:bg-green-100 transition flex items-center">
            <Download className="w-5 h-5 mr-2" /> Excel İndir
          </button>
          <button 
            onClick={() => setSmsModal({ isOpen: true, type: 'custom', customMsg: '', loading: false, targetStudent: null })}
            className="bg-indigo-600 font-black px-6 py-3 rounded-2xl text-white hover:bg-indigo-700 flex items-center shadow-xl shadow-indigo-200 transition">
            <MessageSquare className="w-5 h-5 mr-3"/> Filtrelenenlere ({displayStudents.length}) SMS
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-6 bg-slate-50 p-5 rounded-3xl border border-slate-200 shadow-inner">
         <div className="flex items-center text-slate-500 font-black mr-2"><Filter className="w-5 h-5 mr-2"/> Filtreler:</div>
         
         <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} className="p-3 rounded-xl border-2 border-amber-200 font-bold text-sm outline-none focus:border-amber-500 bg-amber-50 text-amber-800 flex-1 min-w-[200px]">
            <option value="">Tüm Öğrenciler (Durum)</option>
            <option value="Waiting">Sadece Havuzdakiler (Oturum Seçmeyenler)</option>
            <option value="Assigned">Sınav Oturumu Seçenler</option>
         </select>

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
                     <tr className="bg-indigo-50/70 border-y-4 border-white">
                        <td colSpan="5" className="p-4 px-6 font-black text-indigo-900 text-lg">
                           {grade === 'Belirtilmemiş' ? 'Sınıfı Belirtilmeyenler' : `${grade}. Sınıflar`} 
                           <span className="text-sm font-bold text-indigo-500 ml-2">({groupedStudents[grade].length} Öğrenci)</span>
                        </td>
                     </tr>
                     
                     {groupedStudents[grade].map(originalStudent => {
                        const mergedStudent = localOverrides[originalStudent.firebaseId] 
                             ? { ...originalStudent, ...localOverrides[originalStudent.firebaseId] } 
                             : originalStudent;

                        const hasActiveExam = !!(mergedStudent.examId || mergedStudent.examTitle || mergedStudent.exam);
                        const realZoneData = isSuperAdmin ? (zones.find(z => z.id === mergedStudent.zone?.id) || mergedStudent.zone) : adminZoneData;
                        const stdCenter = getNeighborhoodDetails(realZoneData, mergedStudent.district, mergedStudent.neighborhood, mergedStudent.gender, mergedStudent.grade);
                        
                        return (
                          <tr key={mergedStudent.firebaseId} className="hover:bg-slate-50 transition-colors border-b border-slate-100">
                            <td className="p-6 font-black text-slate-900 text-lg">
                              {mergedStudent.fullName}
                              <div className="text-xs font-bold text-slate-400">{mergedStudent.gender} - {mergedStudent.phone}</div>
                            </td>
                            <td className="p-6 font-bold text-slate-600">
                               {mergedStudent.district} / {mergedStudent.neighborhood}
                               <div className="text-xs font-bold text-indigo-500 mt-1 truncate max-w-[200px]" title={mergedStudent.schoolName}>{mergedStudent.schoolName || 'Okul Belirtilmemiş'}</div>
                            </td>
                            <td className="p-6">
                              {hasActiveExam ? (
                                <>
                                  <div className="font-bold text-slate-800">{stdCenter.centerName}</div>
                                  <div className="text-xs font-black text-indigo-600">{mergedStudent.examTitle || mergedStudent.exam?.title} ({mergedStudent.selectedDate || mergedStudent.exam?.date} - {mergedStudent.selectedTime || mergedStudent.slot})</div>
                                </>
                              ) : (
                                <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 rounded-lg text-xs font-black shadow-sm">Bekleme Havuzunda</span>
                              )}
                            </td>
                            
                            <td className="p-4 flex flex-col gap-1">
                              <select value={mergedStudent.attendance || ''} onChange={e => handleUpdateStudentStatus(mergedStudent.firebaseId, 'attendance', e.target.value)} className="text-xs border border-slate-200 rounded p-1 outline-none text-slate-700 font-bold">
                                 <option value="">Katılım Durumu</option>
                                 <option value="Katıldı">Katıldı</option>
                                 <option value="Katılmadı">Katılmadı</option>
                              </select>
                              <select value={mergedStudent.interview || ''} onChange={e => handleUpdateStudentStatus(mergedStudent.firebaseId, 'interview', e.target.value)} className="text-xs border border-slate-200 rounded p-1 outline-none text-slate-700 font-bold">
                                 <option value="">Görüşme</option>
                                 <option value="Görüşüldü">Görüşüldü</option>
                                 <option value="Görüşülmedi">Görüşülmedi</option>
                              </select>
                              <select value={mergedStudent.interviewResult || ''} onChange={e => handleUpdateStudentStatus(mergedStudent.firebaseId, 'interviewResult', e.target.value)} className="text-xs border border-slate-200 rounded p-1 outline-none text-slate-700 font-bold">
                                 <option value="">Netice</option>
                                 <option value="Sıbyan">Sıbyan</option>
                                 <option value="Nehari">Nehari</option>
                                 <option value="Yatılı">Yatılı</option>
                                 <option value="Olumsuz">Olumsuz</option>
                              </select>
                            </td>

                            <td className="p-6 text-right space-x-2 whitespace-nowrap">
                              {hasActiveExam && (
                                <button onClick={() => setResultModal({ isOpen: true, student: mergedStudent, score: '', rank: '' })} className="bg-yellow-100 text-yellow-700 font-black px-4 py-2 rounded-xl text-sm hover:bg-yellow-200 transition">
                                  Sonuç Gir
                                </button>
                              )}

                              <button onClick={() => {
                                  const sDate = mergedStudent.selectedDate || mergedStudent.exam?.date;
                                  const sTime = mergedStudent.selectedTime || mergedStudent.slot;
                                  setEditModal({ 
                                      isOpen: true, 
                                      student: mergedStudent, 
                                      prize: mergedStudent.selectedParticipationPrize || '', 
                                      examId: mergedStudent.examId || mergedStudent.exam?.firebaseId || '', 
                                      sessionStr: (sDate && sTime) ? `${sDate}_${sTime}` : '',
                                      fullName: mergedStudent.fullName || '',
                                      phone: mergedStudent.phone || '',
                                      schoolName: mergedStudent.schoolName || '',
                                      grade: mergedStudent.grade || ''
                                  });
                              }} className="text-emerald-500 hover:text-emerald-700 bg-white border border-emerald-200 hover:bg-emerald-50 p-2 rounded-xl transition" title="Öğrenciyi Düzenle (Kişisel Bilgi / Oturum / Ödül Seç)">
                                <Edit3 className="w-5 h-5"/>
                              </button>
                              
                              <button onClick={() => setTransferModal({ isOpen: true, student: mergedStudent, targetZoneId: '' })} className="text-blue-500 hover:text-blue-700 bg-white border border-blue-200 hover:bg-blue-50 p-2 rounded-xl transition" title="Öğrenciyi Başka Mıntıkaya Gönder">
                                <ArrowRightLeft className="w-5 h-5"/>
                              </button>

                              <button onClick={() => setSmsModal({ isOpen: true, type: 'custom', customMsg: '', loading: false, targetStudent: mergedStudent })} className="text-indigo-400 hover:text-indigo-600 bg-white border border-indigo-200 hover:bg-indigo-50 p-2 rounded-xl transition" title="Özel SMS Gönder"><Send className="w-5 h-5"/></button>
                              <button onClick={() => handleDeleteStudent(mergedStudent.firebaseId, mergedStudent.fullName)} className="text-red-400 hover:text-red-600 bg-white border border-red-200 hover:bg-red-50 p-2 rounded-xl transition" title="Öğrenciyi Sil"><Trash2 className="w-5 h-5"/></button>
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

      <EditStudentModal 
        editModal={editModal} 
        setEditModal={setEditModal} 
        handleSaveEdit={handleSaveEdit} 
        zones={zones} 
        exams={exams} 
        isSuperAdmin={isSuperAdmin} 
        adminZoneData={adminZoneData} 
      />

      {transferModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] shadow-2xl p-10 w-full max-w-md relative animate-in zoom-in-95">
            <button onClick={() => setTransferModal({ isOpen: false, student: null, targetZoneId: '' })} className="absolute top-6 right-6 text-slate-400 hover:text-slate-800"><Plus className="w-8 h-8 transform rotate-45"/></button>
            <ArrowRightLeft className="w-16 h-16 text-blue-500 mx-auto mb-6" />
            <h3 className="text-3xl font-black text-center text-slate-900 mb-2">Öğrenciyi Aktar</h3>
            <p className="text-center text-slate-500 font-bold mb-8">
              <span className="text-indigo-600">{transferModal.student?.fullName}</span> isimli öğrenciyi hangi mıntıkaya göndermek istiyorsunuz?
            </p>
            <div className="space-y-4 mb-8">
              <select value={transferModal.targetZoneId} onChange={e => setTransferModal({...transferModal, targetZoneId: e.target.value})} className="w-full border-4 border-slate-100 rounded-2xl px-6 py-4 text-lg font-bold focus:border-blue-500 outline-none">
                <option value="">Hedef Mıntıkayı Seçin</option>
                {zones.filter(z => z.id !== transferModal.student?.zone?.id).map(z => (
                   <option key={z.id} value={z.id}>{z.name}</option>
                ))}
              </select>
            </div>
            <button onClick={handleTransferStudent} className="w-full bg-blue-600 text-white font-black text-xl py-5 rounded-2xl hover:bg-blue-700 transition shadow-xl shadow-blue-500/30">
              Öğrenciyi Aktar
            </button>
          </div>
        </div>
      )}

      {smsModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] shadow-2xl p-10 w-full max-w-2xl relative animate-in zoom-in-95">
            <button onClick={() => setSmsModal({ ...smsModal, isOpen: false })} className="absolute top-8 right-8 text-slate-400 hover:text-slate-800"><Plus className="w-8 h-8 transform rotate-45"/></button>
            <MessageSquare className="w-16 h-16 text-indigo-500 mx-auto mb-6" />
            <h3 className="text-3xl font-black text-center text-slate-900 mb-2">
               {smsModal.targetStudent ? `${smsModal.targetStudent.fullName.split(' ')[0]} İçin Özel Mesaj` : "Filtrelenmiş Toplu SMS"}
            </h3>
            
            <div className="space-y-6 mb-8 mt-6">
              <div>
                <label className="block text-sm font-black text-slate-700 mb-3 uppercase tracking-wider">Mesaj Şablonu Seçin</label>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <button onClick={() => setSmsModal({...smsModal, type: 'announcement'})} className={`p-4 rounded-2xl font-bold border-4 transition-all text-xs lg:text-sm ${smsModal.type === 'announcement' ? 'border-indigo-500 bg-indigo-50 text-indigo-800' : 'border-slate-100 text-slate-600 hover:border-slate-200'}`}>Sınav Duyurusu</button>
                  <button onClick={() => setSmsModal({...smsModal, type: 'reminder'})} className={`p-4 rounded-2xl font-bold border-4 transition-all text-xs lg:text-sm ${smsModal.type === 'reminder' ? 'border-indigo-500 bg-indigo-50 text-indigo-800' : 'border-slate-100 text-slate-600 hover:border-slate-200'}`}>Sınav Hatırlatması</button>
                  <button onClick={() => setSmsModal({...smsModal, type: 'pool_reminder'})} className={`p-4 rounded-2xl font-bold border-4 transition-all text-xs lg:text-sm ${smsModal.type === 'pool_reminder' ? 'border-amber-500 bg-amber-50 text-amber-800' : 'border-slate-100 text-slate-600 hover:border-slate-200'}`}>Oturum (Havuz) Uyarısı</button>
                  <button onClick={() => setSmsModal({...smsModal, type: 'results'})} className={`p-4 rounded-2xl font-bold border-4 transition-all text-xs lg:text-sm ${smsModal.type === 'results' ? 'border-indigo-500 bg-indigo-50 text-indigo-800' : 'border-slate-100 text-slate-600 hover:border-slate-200'}`}>Sonuç / Randevu</button>
                  <button onClick={() => setSmsModal({...smsModal, type: 'custom'})} className={`p-4 rounded-2xl font-bold border-4 transition-all text-xs lg:text-sm col-span-2 lg:col-span-4 ${smsModal.type === 'custom' ? 'border-indigo-500 bg-indigo-50 text-indigo-800' : 'border-slate-100 text-slate-600 hover:border-slate-200'}`}>Kendin Yaz (Özel Mesaj)</button>
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

function EditStudentModal({ editModal, setEditModal, handleSaveEdit, zones, exams, isSuperAdmin, adminZoneData }) {
  if (!editModal.isOpen) return null;

  const studentZone = isSuperAdmin ? (zones.find(z => z.id === editModal.student?.zone?.id) || editModal.student?.zone) : adminZoneData;
  const availablePrizes = parsePrizeArray(studentZone?.prizes?.participation) || [];
  const availableExams = exams.filter(e => e.zoneId?.toString() === studentZone?.id?.toString() && e.active !== false);
  
  const selectedExamObj = availableExams.find(e => e.firebaseId === editModal.examId || e.id === editModal.examId);
  let sessionOptions = [];
  if (selectedExamObj) {
      const sessions = selectedExamObj.sessions || (selectedExamObj.date && selectedExamObj.slots ? [{ date: selectedExamObj.date, slots: selectedExamObj.slots }] : []);
      sessions.forEach(s => {
          (s.slots || []).forEach(time => {
              sessionOptions.push(`${s.date}_${time}`);
          });
      });
  }

  const closeModal = () => setEditModal({ isOpen: false, student: null, prize: '', examId: '', sessionStr: '', fullName: '', phone: '', schoolName: '', grade: '' });

  return (
     <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
       <div className="bg-white rounded-[3rem] shadow-2xl p-10 w-full max-w-lg relative animate-in zoom-in-95 my-8">
         <button onClick={closeModal} className="absolute top-6 right-6 text-slate-400 hover:text-slate-800"><Plus className="w-8 h-8 transform rotate-45"/></button>
         <Edit3 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
         <h3 className="text-2xl font-black text-center text-slate-900 mb-6">Öğrenciyi Düzenle</h3>
         
         <div className="space-y-5 mb-8">
           
           <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
               <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-500 mb-1 uppercase tracking-wider">Öğrenci Adı</label>
                  <input type="text" value={editModal.fullName || ''} onChange={e => setEditModal({...editModal, fullName: e.target.value})} className="w-full border-2 border-slate-200 rounded-xl px-3 py-2 text-sm font-bold outline-none focus:border-emerald-500"/>
               </div>
               <div>
                  <label className="block text-[10px] font-black text-slate-500 mb-1 uppercase tracking-wider">Telefon</label>
                  <input type="tel" value={editModal.phone || ''} onChange={e => setEditModal({...editModal, phone: e.target.value.replace(/\D/g, '')})} className="w-full border-2 border-slate-200 rounded-xl px-3 py-2 text-sm font-bold outline-none focus:border-emerald-500" maxLength="10"/>
               </div>
               <div>
                  <label className="block text-[10px] font-black text-slate-500 mb-1 uppercase tracking-wider">Sınıfı</label>
                  <select value={editModal.grade || ''} onChange={e => setEditModal({...editModal, grade: e.target.value})} className="w-full border-2 border-slate-200 rounded-xl px-3 py-2 text-sm font-bold outline-none focus:border-emerald-500">
                      {[3,4,5,6,7,8].map(g => <option key={g} value={g}>{g}. Sınıf</option>)}
                  </select>
               </div>
               <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-500 mb-1 uppercase tracking-wider">Okul</label>
                  <input type="text" value={editModal.schoolName || ''} onChange={e => setEditModal({...editModal, schoolName: e.target.value})} className="w-full border-2 border-slate-200 rounded-xl px-3 py-2 text-sm font-bold outline-none focus:border-emerald-500"/>
               </div>
           </div>

           <div>
              <label className="block text-xs font-black text-slate-700 mb-2 uppercase tracking-wider">Katılım Ödülü</label>
              <select value={editModal.prize} onChange={e => setEditModal({...editModal, prize: e.target.value})} className="w-full border-4 border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-emerald-500">
                 <option value="">Seçilmedi</option>
                 {availablePrizes.map(p => <option key={p.title} value={p.title}>{p.title}</option>)}
                 {editModal.student?.selectedParticipationPrize && !availablePrizes.find(p => p.title === editModal.student.selectedParticipationPrize) && (
                     <option value={editModal.student.selectedParticipationPrize}>{editModal.student.selectedParticipationPrize} (Eski/Kaldırılmış)</option>
                 )}
              </select>
           </div>
           
           <div className="border-t-2 border-slate-100 pt-5">
              <label className="block text-xs font-black text-slate-700 mb-2 uppercase tracking-wider">Sınava Ata (Havuzdan Çıkar)</label>
              <select value={editModal.examId} onChange={e => setEditModal({...editModal, examId: e.target.value, sessionStr: ''})} className="w-full border-4 border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-emerald-500 mb-3">
                 <option value="">Sınav Seçiniz</option>
                 {availableExams.map(ex => <option key={ex.firebaseId || ex.id} value={ex.firebaseId || ex.id}>{ex.title}</option>)}
              </select>

              <select disabled={!editModal.examId} value={editModal.sessionStr} onChange={e => setEditModal({...editModal, sessionStr: e.target.value})} className="w-full border-4 border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-emerald-500 disabled:opacity-50">
                 <option value="">Oturum Seçiniz</option>
                 {sessionOptions.map(opt => {
                    const [d, t] = opt.split('_');
                    return <option key={opt} value={opt}>{d} - {t} Oturumu</option>
                 })}
              </select>
           </div>
         </div>

         <button onClick={handleSaveEdit} className="w-full bg-emerald-600 text-white font-black text-lg py-4 rounded-2xl hover:bg-emerald-700 transition shadow-xl shadow-emerald-500/30 flex justify-center items-center">
           <Save className="w-5 h-5 mr-2"/> Kaydet
         </button>
       </div>
     </div>
  );
}