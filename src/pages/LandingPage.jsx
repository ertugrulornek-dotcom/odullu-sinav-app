import React, { useContext } from 'react';
import { AlertCircle } from 'lucide-react';
import TimelineCalendar from '../components/TimelineCalendar';
import CombinedPrizeSection from '../components/CombinedPrizeSection';
import { ThemeContext } from '../components/ThemeSelector';
import { INITIAL_ZONES } from '../data/constants';

export default function LandingPage({ navigateTo, currentUser, scrollToSection, exams, zones }) {
  const { currentTheme } = useContext(ThemeContext);
  const publicZone = zones.find(z => z.active) || INITIAL_ZONES[0];
  const displayPrizes = currentUser ? currentUser.zone?.prizes : publicZone.prizes;

  const uniqueExams = [];
  const seenExams = new Set();
  exams.forEach(e => {
      const key = e.title?.trim().toLowerCase();
      if(key && !seenExams.has(key)) { seenExams.add(key); uniqueExams.push(e); }
  });
  const displayExams = currentUser ? exams.filter(e => e.zoneId === currentUser.zone?.id) : uniqueExams;

  return (
    <div className="relative">
      <section id="hero" className="pt-20 pb-20 relative z-10">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col-reverse lg:flex-row items-center justify-between gap-8 lg:gap-12">
           
           <div className="w-full lg:w-3/5 flex flex-col items-start text-left mt-10 lg:mt-0 relative z-20">
              
              {/* DÜZELTME: Görseldeki gibi temaya göre renklenen, kapsül şeklinde beyaz yazılı üst bant */}
              <div className="inline-block px-6 md:px-8 py-2 md:py-3 rounded-full text-white font-black text-sm sm:text-lg md:text-xl tracking-[0.2em] mb-8 shadow-lg uppercase"
                   style={{ backgroundColor: 'var(--color-main)' }}>
                 KOCAELİ • SAKARYA • YALOVA
              </div>
              
              <div className="flex flex-col text-left font-black uppercase transition-colors drop-shadow-lg mb-8 space-y-2 w-full" 
                   style={{ color: 'var(--color-contrast)', fontFamily: "'Fredoka One', 'Baloo 2', 'Comic Sans MS', 'Nunito', sans-serif", textShadow: '2px 4px 0px rgba(0,0,0,0.1)' }}>
                  
                  {/* İki satır, ferah ve büyük */}
                  <div className="text-3xl sm:text-5xl md:text-6xl lg:text-[4rem] xl:text-[4.8rem] leading-tight whitespace-nowrap">
                     LGS MARATONUNDA 
                  </div>
                  <div className="text-3xl sm:text-5xl md:text-6xl lg:text-[4rem] xl:text-[4.8rem] leading-tight whitespace-nowrap">
                     PARLA, ÖDÜLÜNÜ AL!
                  </div>
              </div>
              
              <p className="text-lg md:text-2xl mb-12 font-bold leading-relaxed max-w-2xl drop-shadow-sm" style={{ color: 'color-mix(in srgb, var(--color-main) 60%, var(--color-contrast) 40%)' }}>
                 Ortaokul Öğrencilerine Özel Ödüllü<br/>Sınav ve LGS Provaları Burada.
              </p>

              {!currentUser ? (
                 <button onClick={() => navigateTo('register')} className="text-white px-12 py-5 rounded-full font-black text-xl hover:scale-105 active:scale-95 transition-all w-full sm:w-auto shadow-2xl" style={{ backgroundColor: 'var(--color-main)' }}> 
                    HEMEN SINAVA KATIL
                 </button>
              ) : (
                 <button onClick={() => scrollToSection('takvim')} className="text-white px-12 py-5 rounded-full font-black text-xl hover:scale-105 active:scale-95 transition-all w-full sm:w-auto shadow-2xl" style={{ backgroundColor: 'var(--color-main)' }}>
                    YAKLAŞAN SINAVLARINI GÖRÜNTÜLE
                 </button>
              )}
           </div>
           
           <div className="w-full sm:w-96 lg:w-2/5 flex-shrink-0 relative group flex justify-center lg:justify-end">
              <div className="absolute inset-0 bg-white blur-[100px] rounded-full opacity-100 z-0 pointer-events-none"></div>
              <img src={currentTheme?.logo || '/OSLOGO1.png'} alt="Ödüllü Sınav Logo" className="w-full max-w-[400px] xl:max-w-[550px] h-auto drop-shadow-2xl group-hover:scale-105 transition-transform duration-500 relative z-10" />
           </div>
        </div>
      </section>

      <section className="pb-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-32">
          
          <div id="tanitim" className="flex flex-col items-center gap-10 pt-10">
            <div className="w-full max-w-4xl text-center">
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-tight">Deneme <span style={{ color: 'var(--color-main)' }}>Tanıtımı</span></h2>
              <div className="w-full rounded-[2rem] shadow-2xl relative overflow-hidden bg-black border-4 border-slate-100">
                 <video controls playsInline className="w-full aspect-video object-cover bg-black">
                    <source src="/Ödüllü Deneme Sınavı Tanıtım Videosu.mp4" type="video/mp4" />
                    Tarayıcınız video oynatmayı desteklemiyor.
                 </video>
              </div>
              <div className="mt-8 bg-amber-50 p-6 rounded-2xl border border-amber-200 shadow-sm flex items-start text-left max-w-3xl mx-auto">
                 <AlertCircle className="w-8 h-8 text-amber-500 mr-4 flex-shrink-0" />
                 <p className="text-lg text-amber-900 font-bold leading-relaxed">
                    Not: 8. sınıflarımız için doğrudan <span className="text-amber-600 font-black">LGS formatında hazırlanmış özel bir deneme</span> yapılacaktır.
                 </p>
              </div>
            </div>
          </div>

          <div id="oduller" className="pt-10"><CombinedPrizeSection displayPrizes={displayPrizes} currentUser={currentUser} /></div>
          <div id="takvim" className="pt-10"><TimelineCalendar zoneExams={displayExams} currentUser={currentUser} defaultContact={publicZone.mappings?.[0]} /></div>
        </div>
      </section>
    </div>
  );
}