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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col-reverse md:flex-row items-center justify-between gap-12 lg:gap-16">
           <div className="flex-1 flex flex-col items-start text-left mt-10 md:mt-0 w-full overflow-hidden">
              
              {/* DÜZELTME: Birbirine girme (leading-none) kaldırıldı. Leading-tight ile kocaman, ferah 3 satır yapıldı. */}
              <div className="flex flex-col text-left font-black uppercase transition-colors drop-shadow-lg mb-8 space-y-3" 
                   style={{ color: 'var(--color-contrast)', fontFamily: "'Fredoka One', 'Baloo 2', 'Comic Sans MS', 'Nunito', sans-serif", textShadow: '2px 4px 0px rgba(0,0,0,0.1)' }}>
                  
                  <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight whitespace-nowrap">
                     KOCAELİ, SAKARYA, YALOVA
                  </div>
                  <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight whitespace-nowrap">
                     LGS MARATONUNDA PARLA,
                  </div>
                  <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight whitespace-nowrap">
                     ÖDÜLÜNÜ AL!
                  </div>
              </div>
              
              <p className="text-lg md:text-2xl mb-12 font-bold leading-relaxed max-w-2xl drop-shadow-sm" style={{ color: 'color-mix(in srgb, var(--color-main) 60%, var(--color-contrast) 40%)' }}>
                 Ortaokul Öğrencilerine Özel Ödüllü<br/>Sınav ve LGS Provaları Burada.
              </p>

              {!currentUser ? (
                 <button onClick={() => navigateTo('register')} className="text-white px-12 py-5 rounded-full font-black text-xl hover:scale-105 active:scale-95 transition-all w-full sm:w-auto" style={{ backgroundColor: 'var(--color-main)', boxShadow: '0 10px 30px -10px var(--color-main)' }}> 
                    HEMEN SINAVA KATIL
                 </button>
              ) : (
                 <button onClick={() => scrollToSection('takvim')} className="text-white px-12 py-5 rounded-full font-black text-xl hover:scale-105 active:scale-95 transition-all w-full sm:w-auto" style={{ backgroundColor: 'var(--color-main)', boxShadow: '0 10px 30px -10px var(--color-main)' }}>
                    YAKLAŞAN SINAVLARINI GÖRÜNTÜLE
                 </button>
              )}
           </div>
           
           <div className="w-80 sm:w-96 md:w-[450px] lg:w-[550px] flex-shrink-0 relative group flex justify-end">
              <div className="absolute inset-0 bg-white blur-[100px] rounded-full opacity-100 z-0 pointer-events-none"></div>
              <img src={currentTheme?.logo || '/OSLOGO1.png'} alt="Ödüllü Sınav Logo" className="w-full h-auto drop-shadow-2xl group-hover:scale-105 transition-transform duration-500 relative z-10" />
           </div>
        </div>
      </section>
    </div>
  );
}