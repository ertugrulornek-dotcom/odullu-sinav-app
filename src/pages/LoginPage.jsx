import React, { useState } from 'react';
import { KeyRound, Phone, ChevronRight, AlertCircle, Send, HelpCircle } from 'lucide-react';
import { sendSMS, SMS_FOOTER } from '../services/smsService';

export default function LoginPage({ students, setCurrentUser, navigateTo }) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // Şifremi Unuttum Modeli State'leri
  const [showForgot, setShowForgot] = useState(false);
  const [forgotPhone, setForgotPhone] = useState('');
  const [hasOldSms, setHasOldSms] = useState(null); // null, true, false
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    
    const user = students.find(s => s.phone.slice(-10) === cleanPhone && s.password === password);
    if (user) {
      setCurrentUser(user);
      navigateTo('profile');
    } else {
      setError("Telefon numarası veya şifre hatalı.");
    }
  };

  const handleForgotSubmit = async () => {
      setForgotError('');
      setForgotSuccess('');
      
      const cleanPhone = forgotPhone.replace(/\D/g, '').slice(-10);
      const user = students.find(s => s.phone.slice(-10) === cleanPhone);

      if (!user) {
          setForgotError("Bu numaraya ait bir öğrenci kaydı bulunamadı.");
          return;
      }

      if (hasOldSms === null) {
          setForgotError("Lütfen aşağıdaki seçeneklerden birini işaretleyin.");
          return;
      }

      if (hasOldSms === true) {
          setForgotSuccess("Harika! Lütfen ilk kayıt olduğunuzda size gelen o SMS'teki şifre ile giriş yapmayı deneyin.");
          setTimeout(() => { setShowForgot(false); setHasOldSms(null); setForgotSuccess(''); setForgotPhone(''); }, 4000);
      } else {
          try {
             await sendSMS([{tel: [user.phone], msg: `odullusinav.net Hatırlatma:\nMevcut Giriş Şifreniz: ${user.password}\nLütfen bu şifre ile sisteme giriş yapınız.${SMS_FOOTER}`}]);
             setForgotSuccess("Şifreniz, kayıtlı telefon numaranıza SMS olarak tekrar gönderildi!");
             setTimeout(() => { setShowForgot(false); setHasOldSms(null); setForgotSuccess(''); setForgotPhone(''); }, 4000);
          } catch(e) {
             setForgotError("SMS gönderilemedi. Lütfen yöneticinizle iletişime geçin.");
          }
      }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-20 relative">
      
      {/* ŞİFREMİ UNUTTUM MODALI */}
      {showForgot && (
         <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[3rem] shadow-2xl p-10 w-full max-w-md relative animate-in zoom-in-95">
               <button onClick={() => {setShowForgot(false); setForgotError(''); setForgotSuccess(''); setHasOldSms(null);}} className="absolute top-6 right-6 text-slate-400 hover:text-slate-800 font-black text-xl">X</button>
               <HelpCircle className="w-16 h-16 text-indigo-500 mx-auto mb-6" />
               <h3 className="text-2xl font-black text-center text-slate-900 mb-6">Şifremi Unuttum</h3>
               
               {forgotSuccess ? (
                   <div className="bg-green-50 text-green-700 p-4 rounded-2xl font-bold text-center border border-green-200">{forgotSuccess}</div>
               ) : (
                   <div className="space-y-6">
                       {forgotError && <div className="bg-red-50 text-red-600 font-bold p-3 rounded-xl text-sm text-center border border-red-100">{forgotError}</div>}
                       <div>
                         <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wider">Kayıtlı Telefon Numaranız</label>
                         <input type="tel" value={forgotPhone} onChange={(e) => setForgotPhone(e.target.value.replace(/\D/g, '').substring(0, 10))} placeholder="5XX XXX XX XX" className="w-full border-4 border-slate-100 rounded-2xl px-6 py-4 text-lg font-black tracking-widest focus:border-indigo-500 outline-none transition" />
                       </div>
                       <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                          <p className="text-sm font-bold text-indigo-900 mb-3 text-center">Sisteme ilk kayıt olduğunuzda size SMS ile bir şifre göndermiştik. O mesaj hala duruyor mu?</p>
                          <div className="flex gap-2">
                             <button onClick={()=>setHasOldSms(true)} className={`flex-1 py-3 rounded-xl font-black transition-all ${hasOldSms === true ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>Evet, duruyor</button>
                             <button onClick={()=>setHasOldSms(false)} className={`flex-1 py-3 rounded-xl font-black transition-all ${hasOldSms === false ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>Hayır, silinmiş</button>
                          </div>
                       </div>
                       <button onClick={handleForgotSubmit} className="w-full bg-indigo-600 text-white font-black text-lg py-4 rounded-2xl hover:bg-indigo-700 transition shadow-xl flex justify-center items-center">
                           Devam Et <Send className="w-5 h-5 ml-2"/>
                       </button>
                   </div>
               )}
            </div>
         </div>
      )}

      {/* STANDART GİRİŞ EKRANI */}
      <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col md:flex-row">
        <div className="bg-indigo-600 p-12 md:w-2/5 flex flex-col justify-center items-center text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          <KeyRound className="w-20 h-20 mb-6 opacity-90 relative z-10" />
          <h2 className="text-4xl font-black mb-4 relative z-10">Öğrenci Paneli</h2>
          <p className="text-indigo-200 font-bold relative z-10">Sınav sonucunuzu öğrenmek, bilgilerinizi güncellemek veya oturumunuzu değiştirmek için giriş yapın.</p>
        </div>

        <div className="p-12 md:w-3/5 bg-slate-50">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-2xl flex items-center font-bold text-sm">
                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" /> {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wider">Telefon Numarası</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="05XX XXX XX XX" className="w-full border-4 border-slate-100 rounded-2xl pl-12 pr-6 py-4 text-xl font-bold focus:border-indigo-500 outline-none transition bg-white" required />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wider flex justify-between items-center">
                 Şifre 
                 <button type="button" onClick={() => setShowForgot(true)} className="text-xs font-bold text-indigo-600 hover:underline normal-case">Şifremi Unuttum</button>
              </label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full border-4 border-slate-100 rounded-2xl px-6 py-4 text-2xl tracking-widest font-black focus:border-indigo-500 outline-none transition bg-white text-center" required />
            </div>

            <button type="submit" className="w-full bg-indigo-600 text-white font-black text-2xl py-5 rounded-2xl mt-8 hover:bg-indigo-700 transition shadow-2xl flex items-center justify-center">
              Giriş Yap <ChevronRight className="ml-2 w-8 h-8" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}