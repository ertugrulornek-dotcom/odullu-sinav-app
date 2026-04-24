import React, { useState } from 'react';
import { AlertTriangle, X, User, Sparkles } from 'lucide-react';

export default function AnnouncementBanner({ navigateTo }) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <>
      {/* 🚀 Hafif Titreme Animasyonu İçin Özel CSS */}
      <style>
        {`
          @keyframes subtle-shake {
            0%, 100% { transform: translateX(0) rotate(0); }
            25% { transform: translateX(-2px) rotate(-1deg); }
            75% { transform: translateX(2px) rotate(1deg); }
          }
          .animate-shake {
            animation: subtle-shake 0.4s ease-in-out infinite;
          }
          @keyframes pulse-glow {
            0%, 100% { opacity: 0.6; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.05); }
          }
          .animate-glow {
            animation: pulse-glow 2s ease-in-out infinite;
          }
        `}
      </style>

      {/* Arka Plan Karartması */}
   <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4"> 
        
        {/* Ana Banner Kutusu */}
        <div className="relative bg-gradient-to-br from-blue-600 via-blue-600 to-blue-800 p-8 md:p-12 rounded-[3rem] shadow-[0_0_60px_-10px_rgba(225,29,72,0.6)] max-w-2xl w-full border-4 border-white-400/50 animate-in zoom-in-95 duration-500">
          
          {/* Arkada Yanıp Sönen Efekt (Süslü Kısım) */}
          <div className="absolute inset-0 bg-blue-500 rounded-[3rem] blur-2xl animate-glow -z-10 pointer-events-none"></div>

          {/* Kapatma Butonu */}
          <button 
            onClick={() => setIsVisible(false)} 
            className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all hover:rotate-90"
          >
            <X className="w-6 h-6" />
          </button>

          {/* İkon - Titreme (Shake) Animasyonlu */}
          <div className="flex justify-center mb-6">
            <div className="relative animate-shake">
               <div className="absolute inset-0 bg-white/40 rounded-full blur-xl animate-pulse"></div>
               <Sparkles className="w-20 h-20 text-yellow-300 relative z-10" />
            </div>
          </div>

          {/* İçerik */}
          <h2 className="text-3xl md:text-5xl font-black text-white text-center mb-6 leading-tight tracking-tight drop-shadow-lg">
            Kayıtlarımız Kapanmıştır!
          </h2>
          <p className="text-rose-100 text-lg text-center font-medium mb-10 leading-relaxed">
            Sınavlarımıza göstermiş olduğunuz yoğun ilgi için teşekkür ederiz. Tüm kontenjanlarımız <strong>maksimum kapasiteye</strong> ulaştığı için yeni kayıt alımı durdurulmuştur. <br/><br/>
            Sistemde kaydı bulunan mevcut öğrencilerimiz, aşağıdaki butonu kullanarak öğrenci profillerine giriş yapabilir ve işlemlerine devam edebilirler.
          </p>

          {/* Öğrenci Paneli Yönlendirmesi (Kayıt ekranı yok!) */}
          <div className="flex justify-center">
            <button 
              onClick={() => {
                  setIsVisible(false);
                  navigateTo('profile'); // Öğrenci giriş sayfasına/paneline atar
              }} 
              className="bg-white text-rose-700 font-black text-xl py-5 px-10 rounded-2xl hover:scale-105 hover:bg-rose-50 transition-all shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)] flex items-center justify-center animate-shake"
            >
              <User className="w-6 h-6 mr-3" /> Öğrenci Paneline Git
            </button>
          </div>

        </div>
      </div>
    </>
  );
}