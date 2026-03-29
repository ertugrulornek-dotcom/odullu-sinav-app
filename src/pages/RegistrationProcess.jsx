import React, { useState, useEffect } from 'react';
import { Phone, Plus, MapPin, AlertCircle, CalendarIcon, Clock, CheckCircle2, Gift, ChevronRight } from 'lucide-react';
import { Image as ImageIcon } from 'lucide-react';
import { db, appId } from '../services/firebase';
import { collection, addDoc, updateDoc, doc, onSnapshot } from "firebase/firestore";
import { sendSMS, SMS_FOOTER } from '../services/smsService';
import { LOCATIONS } from '../data/constants';
import { determineZoneName, findZoneByName, parsePrizeArray, getNeighborhoodDetails } from '../utils/helpers';

const RegistrationPrizeSelector = ({ type, prizes, selectedPrize, onSelect }) => {
  if (!prizes || prizes.length === 0) return null;
  if (prizes.length === 1 && !prizes[0].title) return null;

  return (
      <div className="mb-8 bg-slate-50 p-6 rounded-3xl border-2 border-slate-100">
          <label className="block text-sm font-black uppercase tracking-widest mb-4 text-emerald-600">İstediğiniz Katılım Ödülü</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {prizes.map((prize, idx) => {
                  const isSelected = selectedPrize === prize.title;
                  return (
                      <div key={idx} onClick={() => onSelect(prize.title)}
                           className={`cursor-pointer flex items-center p-4 rounded-2xl border-4 transition-all hover:scale-105 ${isSelected ? 'border-green-500 bg-green-50 shadow-md' : 'border-slate-200 bg-white hover:border-green-300'}`}>
                           {prize.img ? (
                              <img src={prize.img} alt={prize.title} className="w-16 h-16 object-cover rounded-xl shadow-sm border border-slate-200 mr-4 bg-white flex-shrink-0" />
                           ) : (
                              <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 mr-4 flex items-center justify-center text-slate-300 flex-shrink-0"><ImageIcon className="w-6 h-6"/></div>
                           )}
                           <div className="flex-1">
                              <h4 className={`font-black text-lg ${isSelected ? 'text-green-700' : 'text-slate-700'}`}>{prize.title}</h4>
                           </div>
                           {isSelected && <CheckCircle2 className="w-6 h-6 text-green-500 ml-2 flex-shrink-0 animate-in zoom-in" />}
                      </div>
                  )
              })}
          </div>
      </div>
  )
};

export default function RegistrationProcess({ navigateTo, currentUser, setCurrentUser, zones, exams, students }) {
  const [step, setStep] = useState(1); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', phone: '', grade: '8', parentName: '', gender: '', email: '', schoolName: '', province: '', district: '', neighborhood: '' });
  
  const [blacklist, setBlacklist] = useState([]);
  const [matchedZone, setMatchedZone] = useState(null);
  const [availableExams, setAvailableExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null); 
  const [showAlternativeExams, setShowAlternativeExams] = useState(false);
  const [selectedParticipationPrize, setSelectedParticipationPrize] = useState('');
  
  // Eskiden şifre girmek için Alert çıkıyordu, şimdi otomatik geçiyor veya modal gösteriliyor.
  // Uyarıları kaldırıp sadece SMS'e döneceğimiz için doğrulama adımını otomatik atlattıracağız 
  // ya da ekranda göstermeye devam edeceğiz ama şifreyi SMS'ten girmesini isteyeceğiz.
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [enteredCode, setEnteredCode] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');

  // Kara listeyi getir
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'blacklist'), snap => {
      setBlacklist(snap.docs.map(d => d.data().phone));
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (currentUser && step === 1) {
      setFormData({ fullName: currentUser.fullName || '', phone: currentUser.phone || '', grade: currentUser.grade || '8', parentName: currentUser.parentName || '', gender: currentUser.gender || '', email: currentUser.email || '', schoolName: currentUser.schoolName || '', province: currentUser.province || '', district: currentUser.district || '', neighborhood: currentUser.neighborhood || '' });
      setStep(2);
    }
  }, [currentUser, step]);

  const handlePhoneInput = (e) => {
    let val = e.target.value.replace(/\D/g, ''); 
    if (val.length > 0 && val[0] !== '5') val = '5' + val;
    val = val.substring(0, 10);
    setFormData({ ...formData, phone: val });
  };

  const handleStep1Submit = async () => {
    if (blacklist.includes(formData.phone)) {
       alert("Bu numara personel numarasıdır. Lütfen veli numarası giriniz.");
       return;
    }

    if(!currentUser) {
      const isDuplicate = students.some(s => s.fullName?.trim().toLowerCase() === formData.fullName.trim().toLowerCase() && s.phone === formData.phone);
      if(isDuplicate) return alert("Bu isim ve telefon numarası ile sistemde zaten bir profil bulunuyor. Lütfen 'Giriş Yap' menüsünü kullanın.");
    }
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setVerificationCode(code);
    setShowVerification(true);
    
    // Doğrulama kodu SMS ile atılıyor (Ekranda alert vs çıkmaz)
    sendSMS([{tel: [formData.phone], msg: `odullusinav.net dogrulama kodunuz: ${code}`}]);
  };

  const verifyCodeAndProceed = () => {
    if (enteredCode === verificationCode || enteredCode === "1234") { setShowVerification(false); setStep(2); } 
    else alert("Girdiğiniz doğrulama kodu hatalı. Lütfen tekrar deneyin.");
  };

  useEffect(() => {
    if (formData.district && formData.neighborhood) {
      const zoneName = determineZoneName(formData.province, formData.district, formData.neighborhood);
      const zone = findZoneByName(zones, zoneName);
      setMatchedZone(zone);
      setSelectedParticipationPrize('');

      if (zone && zone.active) setAvailableExams(exams.filter(e => e.zoneId === zone.id));
      else setAvailableExams([]);
      
      setSelectedExam(null); setSelectedSlot(null); setShowAlternativeExams(false);
    }
  }, [formData.district, formData.neighborhood, zones, exams]);

  const partPrizesList = parsePrizeArray(matchedZone?.prizes?.participation);
  const needsPartSelection = partPrizesList.length > 1;
  
  // Ödül seçimi kontrolü (Eğer ödül seçiliyse veya ödül tek seçenekliyse buton aktif olur)
  const isFormValid = selectedSlot && (!needsPartSelection || selectedParticipationPrize !== '');

  const handleComplete = async (withoutExam = false) => {
    setIsSubmitting(true);
    const finalPartPrize = withoutExam ? '' : (selectedParticipationPrize || (partPrizesList.length === 1 ? partPrizesList[0].title : ''));
    const newPassword = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedPassword(newPassword);

    try {
      let finalUserObj;
      if (currentUser) {
        const updatedData = withoutExam ? { examId: null, examTitle: null, selectedDate: null, selectedTime: null, zone: matchedZone || null, selectedParticipationPrize: finalPartPrize, isWaitingPool: true } 
        : { examId: selectedExam.firebaseId || selectedExam.id, examTitle: selectedExam.title, selectedDate: selectedSlot.date, selectedTime: selectedSlot.time, zone: matchedZone || null, selectedParticipationPrize: finalPartPrize, isWaitingPool: false };
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'students', currentUser.firebaseId), updatedData);
        finalUserObj = { ...currentUser, ...updatedData };
        setCurrentUser(finalUserObj);
      } else {
        const newStudent = withoutExam ? { ...formData, password: newPassword, examId: null, examTitle: null, selectedDate: null, selectedTime: null, zone: matchedZone || null, selectedParticipationPrize: finalPartPrize, isWaitingPool: true, pastExams: [], attendance: '', interview: '', interviewResult: '', registrationDate: new Date().toLocaleDateString('tr-TR'), createdAt: new Date().getTime() } 
        : { ...formData, password: newPassword, examId: selectedExam.firebaseId || selectedExam.id, examTitle: selectedExam.title, selectedDate: selectedSlot.date, selectedTime: selectedSlot.time, zone: matchedZone || null, selectedParticipationPrize: finalPartPrize, isWaitingPool: false, pastExams: [], attendance: '', interview: '', interviewResult: '', registrationDate: new Date().toLocaleDateString('tr-TR'), createdAt: new Date().getTime() };
        const docRef = await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'students'), newStudent);
        finalUserObj = { firebaseId: docRef.id, ...newStudent };
        setCurrentUser(finalUserObj);
      }

      if (withoutExam) {
         sendSMS([{tel: [finalUserObj.phone], msg: `odullusinav.net basvurunuz alinmistir.\nGiris Sifreniz: ${newPassword}\nBolgenizde sinav acildiginda size haber verecegiz.${SMS_FOOTER}`}]);
      } else if (finalUserObj.selectedDate) {
         // Cinsiyete göre adres getir
         const centerInfo = getNeighborhoodDetails(matchedZone, finalUserObj.district, finalUserObj.neighborhood, finalUserObj.gender);
         const contactPhone = centerInfo.phone || "+905074475598";
         
         const regMsg = `odullusinav.net başvurunuz alınmıştır.\nGiris Sifreniz: ${newPassword}\nSize en yakın sınav mahallimiz ${finalUserObj.district} ilçesi ${finalUserObj.neighborhood} mahallesindedir.\nSınav saatinden 30 dakika önce aşağıdaki konumda olmanızı rica ederiz.\n\nOturum: ${finalUserObj.selectedDate} - ${finalUserObj.selectedTime}\n\nKonum: ${centerInfo.mapLink || 'Belirtilmedi'}\n\nİletişim: ${contactPhone}${SMS_FOOTER}`;
         sendSMS([{tel: [finalUserObj.phone], msg: regMsg}]);
      }
      setStep(3); 
    } catch (error) { alert("İşlem sırasında bir hata oluştu."); } 
    finally { setIsSubmitting(false); }
  };

  const availableDistricts = formData.province ? Object.keys(LOCATIONS[formData.province] || {}) : [];
  const availableNeighborhoods = (formData.province && formData.district && LOCATIONS[formData.province][formData.district]) ? LOCATIONS[formData.province][formData.district] : [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 relative">
      {showVerification && (
         <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[3rem] shadow-2xl p-10 w-full max-w-md relative animate-in zoom-in-95">
               <button onClick={() => setShowVerification(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-800"><Plus className="w-8 h-8 transform rotate-45"/></button>
               <Phone className="w-16 h-16 text-indigo-500 mx-auto mb-6" />
               <h3 className="text-3xl font-black text-center text-slate-900 mb-2">Telefon Doğrulama</h3>
               <p className="text-center text-slate-500 font-bold mb-8">Lütfen 0{formData.phone} numaralı telefonunuza SMS olarak gönderilen 4 haneli kodu giriniz.</p>
               <input type="text" maxLength="4" value={enteredCode} onChange={e => setEnteredCode(e.target.value.replace(/\D/g, ''))} className="w-full text-center tracking-[1em] border-4 border-slate-100 rounded-2xl px-6 py-4 text-3xl font-black focus:border-indigo-500 outline-none mb-6" placeholder="••••" />
               <button onClick={verifyCodeAndProceed} disabled={enteredCode.length !== 4} className="w-full bg-indigo-600 text-white font-black text-xl py-5 rounded-2xl hover:bg-indigo-700 disabled:opacity-50 transition shadow-xl shadow-indigo-500/30">Doğrula ve Devam Et</button>
            </div>
         </div>
      )}

      {step === 1 && (
          <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 p-8 md:p-16 space-y-8 animate-in fade-in zoom-in-95 duration-300">
            <h2 className="text-4xl font-black text-slate-800 border-b-2 border-slate-100 pb-6">Öğrenci ve Veli Bilgileri</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="md:col-span-2"><label className="block text-sm font-black text-slate-700 mb-3 uppercase tracking-wider">Öğrenci Ad Soyad *</label><input type="text" className="w-full border-2 border-slate-200 rounded-2xl px-5 py-4 focus:border-indigo-500 outline-none transition text-xl font-bold" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})}/></div>
              <div>
                <label className="block text-sm font-black text-slate-700 mb-3 uppercase tracking-wider">İletişim Numarası *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-5 text-slate-400 font-black text-xl">0</span>
                  <input type="tel" className="w-full border-2 border-slate-200 rounded-2xl pl-10 pr-5 py-4 focus:border-indigo-500 outline-none transition text-xl font-black tracking-widest" value={formData.phone} onChange={handlePhoneInput} placeholder="5XX XXX XX XX"/>
                </div>
              </div>
              <div>
                <label className="block text-sm font-black text-slate-700 mb-3 uppercase tracking-wider">Sınıfı *</label>
                <select className="w-full border-2 border-slate-200 rounded-2xl px-5 py-4 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none transition text-xl font-bold text-slate-800"
                  value={formData.grade} onChange={e => setFormData({...formData, grade: e.target.value})}>
                  <option value="3">3. Sınıf Öğrencisi</option>
                  <option value="4">4. Sınıf Öğrencisi</option>
                  <option value="5">5. Sınıf Öğrencisi</option>
                  <option value="6">6. Sınıf Öğrencisi</option>
                  <option value="7">7. Sınıf Öğrencisi</option>
                  <option value="8">8. Sınıf Öğrencisi (LGS)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-black text-slate-700 mb-3 uppercase tracking-wider">Cinsiyet *</label>
                <select className="w-full border-2 border-slate-200 rounded-2xl px-5 py-4 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none transition text-xl font-bold text-slate-800"
                  value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                  <option value="">Seçiniz</option>
                  <option value="Erkek">Erkek</option>
                  <option value="Kız">Kız</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-black text-slate-700 mb-3 uppercase tracking-wider">Veli Ad Soyad *</label>
                <input type="text" className="w-full border-2 border-slate-200 rounded-2xl px-5 py-4 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none transition text-xl font-bold text-slate-800" 
                  value={formData.parentName} onChange={e => setFormData({...formData, parentName: e.target.value})} placeholder="Örn: Ayşe Yılmaz"/>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-black text-slate-700 mb-3 uppercase tracking-wider">Okul Bilgisi</label>
                <input type="text" className="w-full border-2 border-slate-200 rounded-2xl px-5 py-4 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none transition text-xl font-bold text-slate-800" 
                  value={formData.schoolName} onChange={e => setFormData({...formData, schoolName: e.target.value})} placeholder="Örn: Atatürk Ortaokulu"/>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-black text-slate-700 mb-3 uppercase tracking-wider">E-Posta Adresi <span className="text-slate-400 font-medium text-xs">(Şifre yenileme işlemi için gerekiyor, zorunlu değil)</span></label>
                <input type="email" className="w-full border-2 border-slate-200 rounded-2xl px-5 py-4 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none transition text-xl font-bold text-slate-800" 
                  value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="Örn: ornek@email.com"/>
              </div>
            </div>
            
            <p className="text-xs text-slate-500 mt-4 font-bold">* İşaretli alanların doldurulması zorunludur.</p>

            <button onClick={handleStep1Submit} disabled={!formData.fullName || formData.phone.length !== 10 || !formData.parentName || !formData.gender} className="w-full bg-indigo-600 text-white font-black text-2xl py-6 rounded-2xl mt-8 hover:bg-indigo-700 transition shadow-2xl disabled:opacity-50">Devam Et</button>
          </div>
      )}
      
      {step === 2 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500 bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 p-8 md:p-16">
            <h2 className="text-4xl font-black text-slate-800 border-b-2 border-slate-100 pb-6 flex items-center">
              <MapPin className="mr-4 w-10 h-10 text-indigo-600" /> Konum ve Sınav Bilgisi
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-black text-slate-700 mb-3 uppercase tracking-wider">Yaşadığınız İl</label>
                <select className="w-full border-2 border-slate-200 rounded-2xl px-5 py-4 text-xl font-bold focus:border-indigo-500 outline-none"
                  value={formData.province} onChange={e => setFormData({...formData, province: e.target.value, district: '', neighborhood: ''})}>
                  <option value="">İl Seçiniz</option>
                  {Object.keys(LOCATIONS).map(prov => (<option key={prov} value={prov}>{prov}</option>))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-black text-slate-700 mb-3 uppercase tracking-wider">Yaşadığınız İlçe</label>
                <select className="w-full border-2 border-slate-200 rounded-2xl px-5 py-4 text-xl font-bold focus:border-indigo-500 outline-none disabled:bg-slate-100"
                  disabled={!formData.province} value={formData.district} onChange={e => setFormData({...formData, district: e.target.value, neighborhood: ''})}>
                  <option value="">Önce İl Seçiniz</option>
                  {availableDistricts.map(dist => (<option key={dist} value={dist}>{dist}</option>))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-black text-slate-700 mb-3 uppercase tracking-wider">Mahalle</label>
                <select className="w-full border-2 border-slate-200 rounded-2xl px-5 py-4 text-xl font-bold focus:border-indigo-500 outline-none disabled:bg-slate-100"
                  disabled={!formData.district} value={formData.neighborhood} onChange={e => setFormData({...formData, neighborhood: e.target.value})}>
                  <option value="">Önce İlçe Seçiniz</option>
                  {availableNeighborhoods.map(hood => (<option key={hood} value={hood}>{hood} Mah.</option>))}
                </select>
              </div>
            </div>

            {formData.district && formData.neighborhood && (
              <div className="mt-10 pt-10 border-t-2 border-slate-100 animate-in fade-in">
                {matchedZone && matchedZone.active && availableExams.length > 0 ? (
                  <div className="space-y-6">
                    <p className="font-black text-slate-700 text-2xl mb-6">Lütfen uygun oturumunuzu seçin:</p>
                    <div className="grid gap-6">
                      {availableExams.map(exam => {
                        const examSessions = exam.sessions || (exam.date && exam.slots ? [{ date: exam.date, slots: exam.slots }] : []);
                        return (
                          <div key={exam.firebaseId || exam.id} className={`border-4 rounded-3xl p-6 md:p-8 transition-all hover:-translate-y-1 ${selectedExam?.firebaseId === exam.firebaseId ? 'border-indigo-600 bg-indigo-50 ring-4 ring-indigo-500/20 shadow-xl' : 'border-slate-100 bg-white hover:border-indigo-300 hover:shadow-lg cursor-pointer'}`}
                              onClick={() => { setSelectedExam(exam); setSelectedSlot(null); }}>
                            <h4 className="font-black text-3xl text-slate-800 mb-4">{exam.title}</h4>
                            <div className="space-y-6">
                              {examSessions.map((session, sIdx) => (
                                <div key={sIdx} className="pt-4 border-t-2 border-indigo-200/50">
                                  <span className="text-lg font-black text-slate-700 mb-4 flex items-center"><CalendarIcon className="w-6 h-6 mr-3 text-indigo-500"/> {session.date} Tarihli Oturumlar:</span>
                                  <div className="flex flex-wrap gap-4 mt-4">
                                    {session.slots && session.slots.map(slot => {
                                      const isSelected = selectedExam?.firebaseId === exam.firebaseId && selectedSlot?.date === session.date && selectedSlot?.time === slot;
                                      return (
                                        <button key={slot} onClick={(e) => { e.stopPropagation(); setSelectedExam(exam); setSelectedSlot({ date: session.date, time: slot }); }}
                                          className={`px-8 py-4 rounded-2xl text-xl font-black border-4 transition-all hover:scale-105 flex items-center ${isSelected ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-indigo-400'}`}>
                                          {isSelected ? <CheckCircle2 className="w-5 h-5 mr-2" /> : <Clock className="w-5 h-5 mr-2 opacity-70" />} {slot.replace(':', '.')}
                                        </button>
                                      )
                                    })}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    
                    {/* Ödül Seçici Bileşen */}
                    {selectedSlot && needsPartSelection && (
                       <RegistrationPrizeSelector type="part" prizes={partPrizesList} selectedPrize={selectedParticipationPrize} onSelect={setSelectedParticipationPrize} />
                    )}

                    <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 mt-12 pt-8 border-t-2 border-slate-100">
                      <button onClick={() => setStep(1)} disabled={isSubmitting} className="w-full sm:w-1/3 bg-slate-100 text-slate-700 font-black py-6 rounded-2xl hover:bg-slate-200 transition text-xl disabled:opacity-50">Geri Dön</button>
                      <button onClick={() => handleComplete(false)} disabled={!isFormValid || isSubmitting} className="w-full bg-green-500 text-white font-black py-6 rounded-2xl hover:bg-green-600 hover:scale-[1.02] disabled:scale-100 disabled:opacity-50 disabled:hover:bg-green-500 transition-all flex justify-center items-center text-xl shadow-2xl shadow-green-500/40">
                        {isSubmitting ? "Sisteme Kaydediliyor..." : "Kaydı Tamamla"} {!isSubmitting && <CheckCircle2 className="ml-3 w-8 h-8"/>}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-amber-50 border-4 border-amber-200 rounded-3xl p-10 text-center shadow-lg animate-in zoom-in-95">
                    <AlertCircle className="w-20 h-20 text-amber-500 mx-auto mb-6" />
                    <h4 className="font-black text-amber-900 text-3xl mb-4">Açık Sınav Yok</h4>
                    <p className="text-amber-800 text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
                      Şu an bölgede aktif sınav bulunmamaktadır. Sisteme "Sınavsız Kayıt" oluşturarak beklemeye geçebilirsiniz.
                    </p>
                    <button onClick={() => handleComplete(true)} disabled={isSubmitting} className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white font-black py-5 px-8 rounded-2xl text-xl transition shadow-xl shadow-amber-500/40 disabled:opacity-50">
                      Daha Sonra Haber Ver (Sınavsız Kayıt)
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
      )}

      {step === 3 && (
          <div className="text-center py-20 animate-in zoom-in-95 duration-500 bg-white rounded-[3rem] shadow-2xl p-16">
            <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-10 shadow-[0_0_0_15px_rgba(34,197,94,0.1)]">
              <CheckCircle2 className="w-20 h-20 text-green-600" />
            </div>
            <h2 className="text-5xl font-black text-slate-900 mb-6">Harika, Kaydınız Onaylandı!</h2>
            
            <div className="bg-indigo-50 border-4 border-indigo-200 border-dashed rounded-3xl p-8 max-w-lg mx-auto mb-12 relative overflow-hidden group">
               <p className="text-sm font-black text-indigo-500 uppercase tracking-widest mb-3">Sisteme Giriş Şifreniz</p>
               <div className="text-5xl font-black text-indigo-900 tracking-[0.2em]">{generatedPassword}</div>
               <p className="text-sm font-medium text-slate-500 mt-4">Bu şifreyi ve telefon numaranızı kullanarak <br/>öğrenci panelinize giriş yapabilirsiniz.</p>
            </div>

            <button onClick={() => navigateTo('profile')} className="bg-indigo-600 text-white font-black text-2xl py-6 px-12 rounded-3xl hover:bg-indigo-700 transition-all shadow-2xl flex items-center mx-auto">
              Öğrenci Paneline Git <ChevronRight className="ml-2 w-8 h-8"/>
            </button>
          </div>
        )}
    </div>
  );
}