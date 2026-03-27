import React, { useState } from 'react';
import { Users, ChevronRight, Lock, CheckCircle2 } from 'lucide-react';

export default function LoginPage({ students, setCurrentUser, navigateTo }) {
  const [step, setStep] = useState(1); 
  const [phoneQuery, setPhoneQuery] = useState('');
  const [passwordQuery, setPasswordQuery] = useState('');
  const [matchedStudents, setMatchedStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const handlePhoneSearch = () => {
    let q = phoneQuery.replace(/\D/g, ''); 
    if (q.length > 0 && q[0] !== '5') { q = '5' + q; }
    
    if (q.length !== 10) {
      alert("Lütfen 10 haneli telefon numaranızı eksiksiz girin.");
      return;
    }

    const matches = students.filter(s => s.phone === q);
    
    if (matches.length === 0) {
      alert("Sistemde bu telefon numarasına ait bir kayıt bulunamadı.");
    } else if (matches.length === 1) {
      setMatchedStudents(matches);
      setSelectedStudent(matches[0]);
      setStep(3);
    } else {
      setMatchedStudents(matches);
      setStep(2);
    }
  };

  const handleLoginSubmit = () => {
    if (selectedStudent && (selectedStudent.password === passwordQuery || (!selectedStudent.password && passwordQuery === ""))) {
      setCurrentUser(selectedStudent);
      navigateTo('profile');
    } else {
      alert("Girdiğiniz şifre hatalı. Lütfen tekrar deneyin.");
    }
  };

  const handleForgotPassword = () => {
    alert("Şifrenizi sıfırlamak için lütfen kayıtlı e-posta adresinizi kontrol edin veya eğitim merkezinizle iletişime geçin.");
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-32 text-center animate-in fade-in zoom-in-95 duration-500">
      <div className="bg-white p-12 rounded-[3rem] shadow-2xl shadow-indigo-100/50 border border-slate-100">
        
        {step === 1 && (
          <>
            <div className="w-24 h-24 bg-indigo-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
              <Users className="w-12 h-12 text-indigo-600" />
            </div>
            <h2 className="text-4xl font-black text-slate-900 mb-4">Öğrenci Girişi</h2>
            <p className="text-slate-500 text-lg mb-10 font-bold leading-relaxed">Sisteme kayıt olduğunuz telefon numaranızı giriniz.</p>
            
            <div className="relative mb-8">
              <span className="absolute inset-y-0 left-0 flex items-center pl-8 text-slate-400 font-black text-2xl">0</span>
              <input 
                type="tel" 
                value={phoneQuery}
                onChange={e => setPhoneQuery(e.target.value)}
                placeholder="5XX XXX XX XX" 
                className="w-full text-center border-4 border-slate-100 rounded-[2rem] pl-12 pr-6 py-6 text-2xl font-black tracking-widest focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none transition"
              />
            </div>

            <button onClick={handlePhoneSearch} disabled={phoneQuery.length < 10} className="w-full bg-indigo-600 text-white font-black text-xl py-6 rounded-[2rem] hover:bg-indigo-700 transition hover:scale-[1.02] shadow-2xl shadow-indigo-500/40 mb-4 disabled:opacity-50">
              İleri <ChevronRight className="w-6 h-6 inline ml-2" />
            </button>
          </>
        )}

        {step === 2 && (
          <div className="animate-in slide-in-from-right-8">
            <h2 className="text-3xl font-black text-slate-900 mb-4">Birden Fazla Kayıt Bulundu</h2>
            <p className="text-slate-500 text-lg mb-8 font-bold leading-relaxed">Lütfen giriş yapmak istediğiniz öğrenci profilini seçin:</p>
            
            <div className="space-y-4 mb-8">
              {matchedStudents.map(student => (
                <button 
                  key={student.firebaseId} 
                  onClick={() => { setSelectedStudent(student); setStep(3); }}
                  className="w-full bg-indigo-50 border-4 border-indigo-100 hover:border-indigo-400 p-5 rounded-2xl flex flex-col text-left transition"
                >
                  <span className="font-black text-indigo-900 text-xl">{student.fullName}</span>
                  <span className="text-indigo-500 font-bold mt-1">{student.grade}. Sınıf Öğrencisi</span>
                </button>
              ))}
            </div>

            <button onClick={() => setStep(1)} className="text-slate-400 hover:text-slate-700 font-bold transition underline">Geri Dön</button>
          </div>
        )}

        {step === 3 && (
          <div className="animate-in slide-in-from-right-8">
            <div className="w-24 h-24 bg-indigo-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
              <Lock className="w-12 h-12 text-indigo-600" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-2">Hoş Geldin, <br/><span className="text-indigo-600">{selectedStudent?.fullName}</span></h2>
            <p className="text-slate-500 text-lg mb-10 font-bold leading-relaxed">Hesabınıza erişmek için 6 haneli şifrenizi girin.</p>

            <div className="relative mb-8">
              <input 
                type="password" 
                value={passwordQuery}
                onChange={e => setPasswordQuery(e.target.value)}
                placeholder="•••••• (Şifreniz)" 
                className="w-full text-center border-4 border-slate-100 rounded-[2rem] px-6 py-6 text-2xl font-black tracking-widest focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none transition"
              />
            </div>

            <button onClick={handleLoginSubmit} className="w-full bg-green-500 text-white font-black text-xl py-6 rounded-[2rem] hover:bg-green-600 transition hover:scale-[1.02] shadow-2xl shadow-green-500/40 mb-4">
              Giriş Yap <CheckCircle2 className="w-6 h-6 inline ml-2" />
            </button>

            <div className="flex flex-col gap-3 mt-4">
               <button onClick={handleForgotPassword} className="text-indigo-500 hover:text-indigo-700 font-bold transition">Şifremi Unuttum</button>
               <button onClick={() => { setStep(1); setPasswordQuery(''); }} className="text-slate-500 hover:text-slate-700 font-bold transition">Farklı Bir Numara İle Giriş</button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="mt-8 pt-6 border-t-2 border-slate-100">
             <button onClick={() => navigateTo('register')} className="text-slate-500 hover:text-indigo-600 font-bold transition">
               Hesabın yok mu? Hemen Kayıt Ol
             </button>
          </div>
        )}
      </div>
    </div>
  );
}

