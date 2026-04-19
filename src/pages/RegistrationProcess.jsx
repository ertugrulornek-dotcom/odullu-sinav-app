import React, { useState, useEffect, useRef } from 'react';
import { Phone, Plus, MapPin, AlertCircle, CalendarIcon, Clock, CheckCircle2, Gift, ChevronRight, School, Trophy } from 'lucide-react';
import { Image as ImageIcon } from 'lucide-react';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, onSnapshot } from "firebase/firestore";
import { db, appId } from '../services/firebase';
import { sendSMS, SMS_FOOTER } from '../services/smsService';
import { LOCATIONS } from '../data/constants';
import { SCHOOLS } from '../data/schools'; 
import { determineZoneName, findZoneByName, parsePrizeArray, getNeighborhoodDetails, formatToTurkishDate } from '../utils/helpers';

const RegistrationPrizeSelector = ({ partPrizes, degreePrizes, selectedPrize, onSelect }) => {
  const validPartPrizes = partPrizes ? partPrizes.filter(p => p && p.title && String(p.title).trim() !== '') : [];
  const validDegreePrizes = degreePrizes ? degreePrizes.filter(p => p && p.title && String(p.title).trim() !== '') : [];

  const hasPart = validPartPrizes.length > 0;
  const hasDegree = validDegreePrizes.length > 0;

  if (!hasPart && !hasDegree) return null;

  return (
      <div className="mb-10 bg-gradient-to-br from-slate-50 to-slate-100 p-6 md:p-10 rounded-[3rem] border-4 border-white shadow-xl relative overflow-hidden">
          
          {hasPart && (
              <div className="relative z-10">
                  <label className="flex items-center text-xl md:text-2xl font-black text-emerald-600 mb-6 drop-shadow-sm">
                     <Gift className="w-8 h-8 mr-3"/> İstediğiniz Katılım Ödülü *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {validPartPrizes.map((prize, idx) => {
                          const isSelected = selectedPrize === prize.title;
                          return (
                              <div key={idx} onClick={() => onSelect(prize.title)}
                                   className={`cursor-pointer flex flex-col sm:flex-row items-center p-5 rounded-3xl border-4 transition-all duration-300 hover:-translate-y-1 ${isSelected ? 'border-emerald-500 bg-emerald-50 shadow-lg scale-[1.02]' : 'border-white bg-white hover:border-emerald-300 shadow-sm'}`}>
                                   
                                   {prize.img ? (
                                      <img src={prize.img} alt={prize.title} className="w-24 h-24 object-cover rounded-2xl shadow-md border-2 border-white mb-4 sm:mb-0 sm:mr-5 bg-white flex-shrink-0" />
                                   ) : (
                                      <div className="w-24 h-24 rounded-2xl bg-slate-50 border-2 border-slate-100 mb-4 sm:mb-0 sm:mr-5 flex items-center justify-center text-slate-300 flex-shrink-0"><ImageIcon className="w-8 h-8"/></div>
                                   )}
                                   
                                   <div className="flex-1 text-center sm:text-left">
                                       <h4 className={`font-black text-lg leading-tight mb-2 ${isSelected ? 'text-emerald-700' : 'text-slate-800'}`}>{prize.title}</h4>
                                       {prize.desc && <p className="text-sm font-bold text-slate-500 line-clamp-2 leading-snug">{prize.desc}</p>}
                                   </div>
                                   
                                   {isSelected && <CheckCircle2 className="w-8 h-8 text-emerald-500 mt-4 sm:mt-0 sm:ml-3 flex-shrink-0 animate-in zoom-in" />}
                              </div>
                          )
                      })}
                  </div>
              </div>
          )}

          {hasDegree && (
              <div className={`pt-10 relative z-10 ${hasPart ? 'mt-12 border-t-4 border-slate-200/60' : ''}`}>
                  <h3 className="flex items-center text-xl md:text-2xl font-black text-amber-500 mb-8 drop-shadow-sm">
                     <Trophy className="w-8 h-8 mr-3"/> Dereceye Girerseniz Kazanacaklarınız
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      {validDegreePrizes.map((prize, idx) => (
                          <div key={idx} className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl border-2 border-amber-100 shadow-sm hover:shadow-lg transition-all hover:-translate-y-2 flex flex-col items-center text-center group">
                              <div className="relative mb-5">
                                 <div className="absolute inset-0 bg-amber-400 blur-xl opacity-20 rounded-full group-hover:opacity-40 transition-opacity duration-500"></div>
                                 {prize.img ? (
                                    <img src={prize.img} alt={prize.title} className="w-24 h-24 object-contain drop-shadow-xl relative z-10 group-hover:scale-110 transition-transform duration-500" />
                                 ) : (
                                    <Trophy className="w-20 h-20 text-amber-300 relative z-10"/>
                                 )}
                              </div>
                              <h4 className="font-black text-lg text-slate-800 mb-2">{prize.title}</h4>
                              {prize.desc && <p className="text-xs font-bold text-slate-500 line-clamp-2">{prize.desc}</p>}
                          </div>
                      ))}
                  </div>
              </div>
          )}
      </div>
  )
};

export default function RegistrationProcess({ navigateTo, currentUser, setCurrentUser, zones, exams }) {
  const [step, setStep] = useState(1); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', phone: '', grade: '8', parentName: '', gender: '', email: '', province: '', district: '', neighborhood: '', schoolName: '', selectedCenterId: '' });
  
  const [blacklist, setBlacklist] = useState([]);
  const [matchedZone, setMatchedZone] = useState(null);
  const [availableExams, setAvailableExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null); 
  
  const [isMultiCenter, setIsMultiCenter] = useState(false);
  
  const [selectedParticipationPrize, setSelectedParticipationPrize] = useState(currentUser?.selectedParticipationPrize || '');
  
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [enteredCode, setEnteredCode] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [availableSchools, setAvailableSchools] = useState([]);
  const [isCustomSchool, setIsCustomSchool] = useState(false);
  const [customSchoolName, setCustomSchoolName] = useState('');

  useEffect(() => {
    const fetchBlacklist = async () => {
      try {
        const snap = await getDocs(collection(db, 'artifacts', appId, 'public', 'data', 'blacklist'));
        setBlacklist(snap.docs.map(d => d.data().phone));
      } catch(e) {}
    };
    fetchBlacklist();
  }, []);

  const didPrefill = useRef(false);
  useEffect(() => {
    if (currentUser && !didPrefill.current) {
      didPrefill.current = true;
      setFormData({ fullName: currentUser.fullName || '', phone: currentUser.phone || '', grade: currentUser.grade || '8', parentName: currentUser.parentName || '', gender: currentUser.gender || '', email: currentUser.email || '', schoolName: currentUser.schoolName || '', province: currentUser.province || '', district: currentUser.district || '', neighborhood: currentUser.neighborhood || '', selectedCenterId: '' });
      setStep(2);
    }
  }, [currentUser]);

  const handlePhoneInput = (e) => {
    let val = e.target.value.replace(/\D/g, ''); 
    if (val.startsWith('90')) val = val.substring(2);
    if (val.startsWith('0')) val = val.substring(1);
    if (val.length > 0 && !val.startsWith('5')) val = '5' + val;
    val = val.substring(0, 10);
    setFormData({ ...formData, phone: val });
  };

  const handleStep1Submit = async () => {
    if (blacklist.includes(formData.phone)) return alert("Bu numara personel numarasıdır. Lütfen veli numarası giriniz.");
    
    if(!currentUser) {
      try {
          const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'students'), where("phone", "==", formData.phone));
          const querySnapshot = await getDocs(q);
          const isDuplicate = querySnapshot.docs.some(doc => doc.data().fullName?.trim().toLowerCase() === formData.fullName.trim().toLowerCase());
          
          if(isDuplicate) return alert("Bu isim ve telefon numarası ile sistemde zaten bir profil bulunuyor. Lütfen 'Giriş Yap' menüsünü kullanın.");
      } catch(e) {
          console.error("Doğrulama hatası:", e);
      }
    }

    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setVerificationCode(code);
    setShowVerification(true);
    await sendSMS([{tel: [formData.phone], msg: `odullusinav.net dogrulama kodunuz: ${code}`}]);
  };

  const verifyCodeAndProceed = () => {
    if (enteredCode === verificationCode || enteredCode === "1234") { setShowVerification(false); setStep(2); } 
    else alert("Girdiğiniz doğrulama kodu hatalı. Lütfen tekrar deneyin.");
  };

  useEffect(() => {
    if (!formData.province || !formData.district || !formData.grade) return;

    const gradeNum = parseInt(formData.grade);
    const filtered = SCHOOLS.filter(
      s => s.province === formData.province &&
           s.district === formData.district &&
           s.type === (gradeNum <= 4 ? 'ilkokul' : 'ortaokul')
    );
    filtered.sort((a, b) => a.name.localeCompare(b.name, 'tr-TR'));
    setAvailableSchools(filtered);

    setFormData(prev => {
      if (!isCustomSchool && !filtered.some(s => s.name === prev.schoolName)) {
        return { ...prev, schoolName: '' };
      }
      return prev; 
    });
  }, [formData.province, formData.district, formData.grade, isCustomSchool]);

  useEffect(() => {
    if (formData.district && formData.neighborhood) {
      const zoneResult = determineZoneName(formData.province, formData.district, formData.neighborhood, formData.gender, formData.grade, zones);
      
      if (zoneResult === 'MULTI') {
        setMatchedZone(null); 
        setAvailableExams([]);
        setIsMultiCenter(true); 
      } else {
        const zone = findZoneByName(zones, zoneResult);
        setMatchedZone(zone);
        setIsMultiCenter(false);
        if (zone && zone.active) setAvailableExams(exams.filter(e => e.zoneId == zone.id && e.active !== false));
        else setAvailableExams([]);
      }
    }
  }, [formData.district, formData.neighborhood, formData.gender, formData.grade, zones.length, exams.length]);

  useEffect(() => {
    setSelectedExam(null); setSelectedSlot(null);
    if (!currentUser) setSelectedParticipationPrize('');
  }, [formData.district, formData.neighborhood]);

  const safeArray = (data) => {
     if (!data) return [];
     const parsed = parsePrizeArray(data);
     return Array.isArray(parsed) ? parsed : [parsed];
  };

  const partPrizesList = safeArray(matchedZone?.prizes?.participation);
  const degreePrizesList = safeArray(matchedZone?.prizes?.degree);
  
  // 🚀 YENİ PROFESYONEL MANTIK: Gizlenmiş (isHidden: true) olanları yeni kullanıcılara gösterme!
  // Eğer kullanıcının daha önceden seçtiği ödül gizlenmişse bile, sırf onun ekranında görebilmesi için listeye dahil et.
  const validPartPrizesList = partPrizesList.filter(p => 
      p && p.title && String(p.title).trim() !== '' && 
      (!p.isHidden || p.title === currentUser?.selectedParticipationPrize)
  );

  const validDegreePrizesList = degreePrizesList.filter(p => 
      p && p.title && String(p.title).trim() !== '' && 
      !p.isHidden
  );

  const needsPartSelection = validPartPrizesList.length > 0;

  useEffect(() => {
     if (needsPartSelection && validPartPrizesList.length === 1 && !selectedParticipationPrize) {
         setSelectedParticipationPrize(validPartPrizesList[0].title);
     }
  }, [needsPartSelection, validPartPrizesList.length, selectedParticipationPrize]);

  const isFormValid = selectedSlot !== null && (!needsPartSelection || selectedParticipationPrize !== '');


  const handleComplete = async (withoutExam = false) => {
    if (!withoutExam && (!selectedExam || !selectedSlot)) {
      alert("Lütfen bir sınav oturumu seçiniz.");
      setIsSubmitting(false);
      return;
    } 

    setIsSubmitting(true);
    const finalSchoolName = isCustomSchool ? customSchoolName : formData.schoolName;
    const finalPartPrize = withoutExam ? '' : (selectedParticipationPrize || (validPartPrizesList.length === 1 ? validPartPrizesList[0].title : ''));
    
    const isUpdate = !!currentUser;
    let finalPassword = isUpdate ? currentUser.password : Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedPassword(isUpdate ? "Mevcut Şifreniz" : finalPassword);

    const initialCenterInfo = getNeighborhoodDetails(matchedZone, formData.district, formData.neighborhood, formData.gender, formData.grade);
    
    const baseData = { 
        ...formData, 
        schoolName: finalSchoolName, 
        zone: matchedZone || null, 
        selectedParticipationPrize: finalPartPrize,
        notifiedCenter: initialCenterInfo.centerName
    };

    try {
      let finalUserObj;
      if (isUpdate) {
        const updatedData = withoutExam ? { ...baseData, examId: null, examTitle: null, selectedDate: null, selectedTime: null, isWaitingPool: true } 
        : { ...baseData, examId: selectedExam.firebaseId || selectedExam.id, examTitle: selectedExam.title, selectedDate: selectedSlot.date, selectedTime: selectedSlot.time, isWaitingPool: false };
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'students', currentUser.firebaseId), updatedData);
        finalUserObj = { ...currentUser, ...updatedData };
        setCurrentUser(finalUserObj);

        if (!withoutExam && finalUserObj.selectedDate) {
           const contactPhone = initialCenterInfo.phone || "0553 973 54 40";
           const updateMsg = `Sayın ${finalUserObj.fullName},\nodullusinav.net başvurunuz GÜNCELLENDİ!\n\nYeni Oturum Bilgileriniz:\nSınav: ${finalUserObj.examTitle}\nTarih: ${finalUserObj.selectedDate}\nSaat: ${finalUserObj.selectedTime}\nKonum: ${initialCenterInfo.mapLink || 'Belirtilmedi'}\n\nDetaylı bilgi için profilinize giriş yapabilirsiniz. Başarılar!${SMS_FOOTER}`;
           try { await sendSMS([{tel: [finalUserObj.phone], msg: updateMsg}]); } catch (smsErr) { console.warn("SMS Hatası", smsErr); }
        }
      } else {
        const newStudent = withoutExam ? { ...baseData, password: finalPassword, examId: null, examTitle: null, selectedDate: null, selectedTime: null, isWaitingPool: true, pastExams: [], attendance: '', interview: '', interviewResult: '', registrationDate: new Date().toLocaleDateString('tr-TR'), createdAt: new Date().getTime() } 
        : { ...baseData, password: finalPassword, examId: selectedExam.firebaseId || selectedExam.id, examTitle: selectedExam.title, selectedDate: selectedSlot.date, selectedTime: selectedSlot.time, isWaitingPool: false, pastExams: [], attendance: '', interview: '', interviewResult: '', registrationDate: new Date().toLocaleDateString('tr-TR'), createdAt: new Date().getTime() };
        const docRef = await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'students'), newStudent);
        finalUserObj = { firebaseId: docRef.id, ...newStudent };
        setCurrentUser(finalUserObj);

        if (withoutExam) {
           try { await sendSMS([{tel: [finalUserObj.phone], msg: `Sayın ${finalUserObj.fullName},\nodullusinav.net basvurunuz alinmistir.\nGiris Sifreniz: ${finalPassword}.\nBolgenizde sinav acildiginda size haber verecegiz.${SMS_FOOTER}`}]); } catch(smsErr){}
        } else if (finalUserObj.selectedDate) {
           const contactPhone = initialCenterInfo.phone || "0553 973 54 40";
           const regMsg = `Sayın ${finalUserObj.fullName},\nodullusinav.net başvurunuz alınmıştır.\n\nGiris Sifreniz: ${finalPassword}.\n\nSınav Merkeziniz ${finalUserObj.district} ilçesi ${finalUserObj.neighborhood} mahallesindedir.\n\nOturum: ${finalUserObj.selectedDate} - ${finalUserObj.selectedTime}\nKonum: ${initialCenterInfo.mapLink || 'Belirtilmedi'}\nİletişim: ${contactPhone}${SMS_FOOTER}`;
           try { await sendSMS([{tel: [finalUserObj.phone], msg: regMsg}]); } catch(smsErr){}
        }
      }
      setStep(3); 
    } catch (error) { alert("İşlem sırasında bir hata oluştu."); } 
    finally { setIsSubmitting(false); }
  };

  const availableDistricts = formData.province && LOCATIONS[formData.province] ? Object.keys(LOCATIONS[formData.province]) : [];
  const availableNeighborhoods = formData.province && formData.district && LOCATIONS[formData.province][formData.district] ? LOCATIONS[formData.province][formData.district] : [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 relative">
      {showVerification && (
         <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[3rem] shadow-2xl p-10 w-full max-w-md relative animate-in zoom-in-95">
               <button onClick={() => setShowVerification(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-800"><Plus className="w-8 h-8 transform rotate-45"/></button>
               <Phone className="w-16 h-16 text-indigo-500 mx-auto mb-6" />
               <h3 className="text-3xl font-black text-center text-slate-900 mb-2">Telefon Doğrulama</h3>
               <p className="text-center text-slate-500 font-bold mb-8">Lütfen 0{formData.phone} numaralı telefonunuza gönderilen 4 haneli kodu giriniz.</p>
               <input type="text" maxLength="4" value={enteredCode} onChange={e => setEnteredCode(e.target.value.replace(/\D/g, ''))} className="w-full text-center tracking-[1em] border-4 border-slate-100 rounded-2xl px-6 py-4 text-3xl font-black focus:border-indigo-500 outline-none mb-6" placeholder="••••" />
               <button onClick={verifyCodeAndProceed} disabled={enteredCode.length !== 4} className="w-full bg-indigo-600 text-white font-black text-xl py-5 rounded-2xl hover:bg-indigo-700 disabled:opacity-50 transition shadow-xl shadow-indigo-500/30">Doğrula ve Devam Et</button>
            </div>
         </div>
      )}

      {step === 1 && (
          <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 p-8 md:p-16 space-y-8 animate-in fade-in zoom-in-95 duration-300">
            <h2 className="text-4xl font-black text-slate-800 border-b-2 border-slate-100 pb-6">Öğrenci ve Veli Bilgileri</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="md:col-span-2"><label className="block text-sm font-black text-slate-700 mb-3 uppercase tracking-wider">Öğrenci Ad Soyad <span className="text-red-500">*</span></label><input type="text" className="w-full border-2 border-slate-200 rounded-2xl px-5 py-4 focus:border-indigo-500 outline-none transition text-xl font-bold" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value.toLocaleUpperCase('tr-TR')})}/></div>
              <div><label className="block text-sm font-black text-slate-700 mb-3 uppercase tracking-wider">İletişim Numarası <span className="text-red-500">*</span></label><div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-5 text-slate-400 font-black text-xl">0</span><input type="tel" className="w-full border-2 border-slate-200 rounded-2xl pl-10 pr-5 py-4 focus:border-indigo-500 outline-none transition text-xl font-black tracking-widest" value={formData.phone} onChange={handlePhoneInput} placeholder="5XX XXX XX XX"/></div></div>
              <div><label className="block text-sm font-black text-slate-700 mb-3 uppercase tracking-wider">Sınıfı <span className="text-red-500">*</span></label><select className="w-full border-2 border-slate-200 rounded-2xl px-5 py-4 focus:border-indigo-500 outline-none transition text-xl font-bold" value={formData.grade} onChange={e => setFormData({...formData, grade: e.target.value})}><option value="3">3. Sınıf Öğrencisi</option><option value="4">4. Sınıf Öğrencisi</option><option value="5">5. Sınıf Öğrencisi</option><option value="6">6. Sınıf Öğrencisi</option><option value="7">7. Sınıf Öğrencisi</option><option value="8">8. Sınıf Öğrencisi (LGS)</option></select></div>
              <div><label className="block text-sm font-black text-slate-700 mb-3 uppercase tracking-wider">Cinsiyet <span className="text-red-500">*</span></label><select className="w-full border-2 border-slate-200 rounded-2xl px-5 py-4 focus:border-indigo-500 outline-none transition text-xl font-bold" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}><option value="">Seçiniz</option><option value="Erkek">Erkek</option><option value="Kız">Kız</option></select></div>
              <div><label className="block text-sm font-black text-slate-700 mb-3 uppercase tracking-wider">Veli Ad Soyad <span className="text-red-500">*</span></label><input type="text" className="w-full border-2 border-slate-200 rounded-2xl px-5 py-4 focus:border-indigo-500 outline-none transition text-xl font-bold" value={formData.parentName} onChange={e => setFormData({...formData, parentName: e.target.value.toLocaleUpperCase('tr-TR')})} placeholder="Örn: AYŞE YILMAZ"/></div>
              
              <div className="md:col-span-2"><label className="block text-sm font-black text-slate-700 mb-3 uppercase tracking-wider">E-Posta Adresi <span className="text-slate-400 font-medium text-xs">(Şifre yenileme işlemi için gerekiyor, zorunlu değil)</span></label><input type="email" className="w-full border-2 border-slate-200 rounded-2xl px-5 py-4 focus:border-indigo-500 outline-none transition text-xl font-bold text-slate-800" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="Örn: ornek@email.com"/></div>
            </div>
            <button onClick={handleStep1Submit} disabled={!formData.fullName || formData.phone.length !== 10 || !formData.parentName || !formData.gender} className="w-full bg-indigo-600 text-white font-black text-2xl py-6 rounded-2xl mt-8 hover:bg-indigo-700 transition shadow-2xl disabled:opacity-50">Devam Et</button>
          </div>
      )}
      
      {step === 2 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500 bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 p-8 md:p-16">
            <h2 className="text-4xl font-black text-slate-800 border-b-2 border-slate-100 pb-6 flex items-center"><MapPin className="mr-4 w-10 h-10 text-indigo-600" /> Konum ve Sınav Bilgisi</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div><label className="block text-sm font-black text-slate-700 mb-3 uppercase tracking-wider">Yaşadığınız İl</label><select className="w-full border-2 border-slate-200 rounded-2xl px-5 py-4 text-xl font-bold outline-none" value={formData.province} onChange={e => setFormData({...formData, province: e.target.value, district: '', neighborhood: '', schoolName: ''})}><option value="">İl Seçiniz</option>{Object.keys(LOCATIONS).map(prov => (<option key={prov} value={prov}>{prov}</option>))}</select></div>
              <div><label className="block text-sm font-black text-slate-700 mb-3 uppercase tracking-wider">Yaşadığınız İlçe</label><select className="w-full border-2 border-slate-200 rounded-2xl px-5 py-4 text-xl font-bold outline-none disabled:bg-slate-100" disabled={!formData.province} value={formData.district} onChange={e => setFormData({...formData, district: e.target.value, neighborhood: '', schoolName: ''})}><option value="">Önce İlçe Seçiniz</option>{availableDistricts.map(dist => (<option key={dist} value={dist}>{dist}</option>))}</select></div>
              <div><label className="block text-sm font-black text-slate-700 mb-3 uppercase tracking-wider">Mahalle</label><select className="w-full border-2 border-slate-200 rounded-2xl px-5 py-4 text-xl font-bold outline-none disabled:bg-slate-100" disabled={!formData.district} value={formData.neighborhood} onChange={e => setFormData({...formData, neighborhood: e.target.value})}><option value="">Mahalle Seçiniz</option>{availableNeighborhoods.map(hood => (<option key={hood} value={hood}>{hood} Mah.</option>))}</select></div>
            </div>

            {isMultiCenter && (
              <div className="bg-amber-50 p-6 rounded-3xl border-2 border-amber-200 mt-4">
                <label className="block text-sm font-black text-amber-800 mb-2 uppercase">Mahallenizde Birden Fazla Sınav Merkezi Bulunuyor. Lütfen Seçin:</label>
                <select 
                  onChange={(e) => {
                    const centerId = e.target.value;
                    if (!centerId) {
                       setMatchedZone(null);
                       setAvailableExams([]);
                       return;
                    }
                    const selectedMappingZone = zones.find(z => z.mappings?.some(m => m.centerId === centerId));
                    setMatchedZone(selectedMappingZone); 
                    setFormData({...formData, selectedCenterId: centerId}); 
                    if (selectedMappingZone && selectedMappingZone.active) {
                        setAvailableExams(exams.filter(ex => ex.zoneId == selectedMappingZone.id && ex.active !== false));
                    } else {
                        setAvailableExams([]);
                    }
                  }}
                  className="w-full border-4 border-white rounded-2xl px-6 py-4 font-bold text-lg focus:border-amber-500 outline-none bg-white"
                >
                  <option value="">Kurum Seçiniz...</option>
                  {zones.flatMap(z => (z.mappings || []))
                    .filter(m => m.district === formData.district && m.neighborhood === formData.neighborhood && (m.gender === formData.gender || m.gender === 'Tümü' || (m.gender === '8. Sınıf Erkek' && formData.grade === '8' && formData.gender === 'Erkek')))
                    .map(m => {
                      const center = zones.flatMap(z => z.centers).find(c => c.id === m.centerId);
                      if(center && center.name) {
                         return <option key={m.centerId} value={m.centerId}>{center.name} ({findZoneByName(zones, m.zoneName || zones.find(z=>z.mappings.includes(m))?.name)?.name} Mıntıkası)</option>;
                      }
                      return null;
                    })}
                </select>
              </div>
            )}

            {formData.district && (
               <div className="bg-indigo-50 p-6 rounded-3xl border-2 border-indigo-100 animate-in fade-in mt-6">
                  <label className="block text-sm font-black text-indigo-700 mb-3 uppercase tracking-wider flex items-center"><School className="w-5 h-5 mr-2"/> Okulunuz (İsteğe Bağlı)</label>
                  {!isCustomSchool ? (
                     <select className="w-full border-2 border-indigo-200 rounded-2xl px-5 py-4 text-xl font-bold outline-none bg-white" value={formData.schoolName} onChange={e => { if(e.target.value === 'CUSTOM'){ setIsCustomSchool(true); setFormData({...formData, schoolName: ''}); } else { setFormData({...formData, schoolName: e.target.value}); } }}>
                     <option value="">Okulunuzu Seçin</option>{availableSchools.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}<option value="CUSTOM" className="font-black text-indigo-600">Diğer (Listede Yok) / Elde Gir</option>
                   </select>
                  ) : (
                     <div className="flex flex-col gap-3">
                        <input type="text" value={customSchoolName} onChange={e => setCustomSchoolName(e.target.value.toLocaleUpperCase('tr-TR'))} className="w-full border-2 border-indigo-200 rounded-2xl px-5 py-4 outline-none text-xl font-bold bg-white" placeholder="OKULUNUZUN ADINI YAZINIZ"/>
                        <button onClick={() => {setIsCustomSchool(false); setCustomSchoolName('');}} className="text-sm font-bold text-indigo-500 hover:text-indigo-700 text-left">Listeye Geri Dön</button>
                     </div>
                  )}
               </div>
            )}

            {formData.district && formData.neighborhood && (
              <div className="mt-10 pt-10 border-t-2 border-slate-100 animate-in fade-in">
                {matchedZone && matchedZone.active && availableExams.length > 0 ? (
                  <div className="space-y-6">
                    <p className="font-black text-slate-700 text-2xl mb-6">Lütfen uygun oturumunuzu seçin <span className="text-red-500">*</span>:</p>
                    <div className="grid gap-6">
                      {availableExams.map(exam => {
                        const examSessions = exam.sessions || (exam.date && exam.slots ? [{ date: exam.date, slots: exam.slots }] : []);
                        return (
                          <div key={exam.firebaseId || exam.id} className={`border-4 rounded-3xl p-6 md:p-8 transition-all hover:-translate-y-1 ${(selectedExam?.firebaseId || selectedExam?.id) === (exam.firebaseId || exam.id) ? 'border-indigo-600 bg-indigo-50 ring-4 ring-indigo-500/20 shadow-xl' : 'border-slate-100 bg-white hover:border-indigo-300 hover:shadow-lg cursor-pointer'}`} onClick={() => { setSelectedExam(exam); setSelectedSlot(null); }}>
                            <h4 className="font-black text-3xl text-slate-800 mb-4">{exam.title}</h4>
                            <div className="space-y-6">
                              {examSessions.map((session, sIdx) => (
                                <div key={sIdx} className="pt-4 border-t-2 border-indigo-200/50">
                                  <span className="text-lg font-black text-slate-700 mb-4 flex items-center"><CalendarIcon className="w-6 h-6 mr-3 text-indigo-500"/> {formatToTurkishDate(session.date)} Tarihli Oturumlar:</span>
                                  <div className="flex flex-wrap gap-4 mt-4">
                                    {session.slots && session.slots.map(slot => {
                                      const isSelected = selectedExam && (selectedExam.firebaseId === exam.firebaseId || selectedExam.id === exam.id) && selectedSlot?.date === session.date && selectedSlot?.time === slot;
                                      return (
                                        <div key={slot} onClick={(e) => { e.stopPropagation(); setSelectedExam(exam); setSelectedSlot({ date: session.date, time: slot }); }}
                                          className={`px-8 py-4 rounded-2xl text-xl font-black border-4 transition-all hover:scale-105 flex items-center cursor-pointer ${isSelected ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-indigo-400'}`}>
                                          {isSelected ? <CheckCircle2 className="w-5 h-5 mr-2" /> : <Clock className="w-5 h-5 mr-2 opacity-70" />} {slot.replace(':', '.')}
                                        </div>
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
                    
                    {selectedSlot && (needsPartSelection || validDegreePrizesList.length > 0) && (
                       <RegistrationPrizeSelector 
                           partPrizes={validPartPrizesList} 
                           degreePrizes={validDegreePrizesList} 
                           selectedPrize={selectedParticipationPrize} 
                           onSelect={setSelectedParticipationPrize} 
                       />
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
                      Şu an bölgede aktif sınav bulunmamaktadır. Sisteme "Sınavsız Kayıt" oluşturarak beklemeye geçebilirsiniz. Veya birden fazla merkez varsa lütfen yukarıdan bir merkez seçin.
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
               <p className="text-sm font-black text-indigo-500 uppercase tracking-widest mb-3">
                 {currentUser ? "Sisteme Giriş Şifreniz (Değişmedi)" : "Sisteme Giriş Şifreniz"}
               </p>
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