import React, { useState, useEffect, useContext } from 'react';
import { CalendarClock, X, Phone, MapPin } from 'lucide-react';
import { ThemeContext } from './ThemeSelector';

export default function CountdownTimer({ examDate, mode }) {
  const { currentTheme } = useContext(ThemeContext);
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const [isExpanded, setIsExpanded] = useState(false); 

  function calculateTimeLeft() {
    if (!examDate) return null;
    const difference = +new Date(examDate) - +new Date();
    if (difference <= 0) return null;

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
    };
  }

  useEffect(() => {
    setTimeLeft(calculateTimeLeft());
    if (!examDate) return;
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000 * 60);
    return () => clearInterval(timer);
  }, [examDate]);

  if (!isExpanded) {
     return (
       <div onClick={() => setIsExpanded(true)} className="fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] border border-slate-100 z-50 cursor-pointer hover:scale-110 active:scale-95 transition-all bg-white group flex items-center justify-center animate-in slide-in-from-right-12 duration-500">
         <div className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ backgroundColor: currentTheme.main }}></div>
         <CalendarClock className="w-8 h-8 relative z-10 transition-transform group-hover:rotate-12" style={{ color: currentTheme.main }} />
       </div>
     );
  }

  return (
    <div className="fixed bottom-6 right-6 flex items-center gap-4 p-4 pr-10 bg-white/95 backdrop-blur-md rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)] border border-slate-200 z-50 animate-in slide-in-from-right-8 zoom-in-95 duration-300 max-w-sm sm:max-w-md">
      <button onClick={() => setIsExpanded(false)} className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors shadow-sm"><X className="w-4 h-4" /></button>
      
      <div className="bg-slate-50 p-3 rounded-2xl shadow-inner border border-slate-100 hidden sm:block">
         <CalendarClock className="w-10 h-10" style={{ color: currentTheme.main }} />
      </div>
      
      {mode === 'none' || !timeLeft ? (
         <div className="py-2 pl-2">
             <p className="text-sm font-black text-slate-800 mb-2 leading-tight">Şu anda planlanmış aktif sınavımız yoktur.</p>
             <p className="text-[11px] font-bold text-slate-500 mb-2">Gelecekteki sınavlarımız için bilgi alabilirsiniz:</p>
             <a href="tel:05539735440" className="inline-flex items-center text-sm font-black px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100 hover:bg-indigo-100 transition-colors">
                 <Phone className="w-4 h-4 mr-2" style={{ color: currentTheme.main }}/> 0553 973 54 40
             </a>
         </div>
      ) : (
         <>
            <div className="flex gap-2">
              {[{ value: timeLeft?.days||0, label: 'Gün' }, { value: timeLeft?.hours||0, label: 'Saat' }, { value: timeLeft?.minutes||0, label: 'Dakika' }].map(({ value, label }) => (
                <div key={label} className="text-center bg-slate-50 border border-slate-100 rounded-xl px-2 py-1.5 min-w-[3.5rem] shadow-sm">
                  <div className="text-2xl font-black text-slate-800 leading-none" style={{ color: currentTheme.main }}>{String(value).padStart(2, '0')}</div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{label}</div>
                </div>
              ))}
            </div>
            <div className="border-l border-slate-200 pl-4 py-1 flex flex-col justify-center">
                <p className="text-sm font-black text-slate-700 leading-tight">
                    {mode === 'personal' ? 'Oturumunuza Kalan Süre' : 
                     mode === 'other_zones' ? 'Diğer Bölgelerdeki Sınava Kalan Süre' : 
                     'Sıradaki Sınava Kalan Süre'}
                </p>
                {mode === 'zone' && <p className="text-xs font-bold text-slate-500 mt-1">Siz de yerinizi ayırtın!</p>}
                
                {/* DİĞER BÖLGELERDE SINAV VARSA KAYIT SAYFASINA YÖNLENDİR */}
                {mode === 'other_zones' && (
                    <a href="#register" onClick={() => { setIsExpanded(false); window.scrollTo(0,0); }} className="mt-2 inline-flex items-center text-[10px] font-black text-white px-2.5 py-1.5 rounded-lg transition-transform hover:scale-105 shadow-sm w-max" style={{ backgroundColor: currentTheme.main }}>
                        <MapPin className="w-3 h-3 mr-1"/> Sınavları İncele
                    </a>
                )}
            </div>
         </>
      )}
    </div>
  );
}