import React, { useContext } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import TimelineCalendar from '../components/TimelineCalendar';
import CombinedPrizeSection from '../components/CombinedPrizeSection';
import { ThemeContext } from '../components/ThemeSelector';
import { INITIAL_ZONES } from '../data/constants';

export default function LandingPage({ navigateTo, currentUser, detectedZone, scrollToSection, exams, zones }) {
  const { currentTheme } = useContext(ThemeContext);
  
  const defaultZone = zones.find(z => z.districts?.includes('Gebze')) || zones[0] || INITIAL_ZONES[0];
  const activeZone = currentUser 
     ? zones.find(z => z.id === currentUser.zone?.id) 
     : (detectedZone || defaultZone);
     
  const displayPrizes = activeZone?.prizes;

  const uniqueExams = [];
  const seenExams = new Set();
  exams.forEach(e => {
      const key = e.title?.trim().toLowerCase();
      if(key && !seenExams.has(key)) { seenExams.add(key); uniqueExams.push(e); }
  });
  const displayExams = currentUser ? exams.filter(e => e.zoneId === currentUser.zone?.id) : uniqueExams;

  // DÜZELTME: Giriş yapılmadığında (profilde değilken) her zaman varsayılan numara gönderilir
  const fallbackContact = { contactName: "Bilgi & İletişim", phone: "0553 973 54 40" };
  const contactToPass = currentUser ? (activeZone?.mappings?.[0] || fallbackContact) : fallbackContact;

  return (
    <div className="relative">
      <section id="hero" className="pt-10 md:pt-20 pb-20 relative z-10 overflow-hidden">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
           
           <div className="flex justify-center lg:hidden w-full mb-8 relative z-20">
              <div className="inline-block px-4 sm:px-6 py-2.5 rounded-full text-white font-black text-[11px] sm:text-sm tracking-[0.15em] shadow-lg uppercase whitespace-nowrap"
                   style={{ backgroundColor: 'var(--color-main)' }}>
                 KOCAELİ • SAKARYA • YALOVA
              </div>
           </div>

           <div className="flex flex-col-reverse lg:flex-row items-center justify-between gap-8 lg:gap-12">
               
               <div className="w-full lg:w-3/5 flex flex-col items-start text-left mt-6 lg:mt-0 relative z-20">
                  
                  <div className="hidden lg:inline-block px-6 md:px-8 py-2 md:py-3 rounded-full text-white font-black text-sm sm:text-lg md:text-xl tracking-[0.2em] mb-8 shadow-lg uppercase"
                       style={{ backgroundColor: 'var(--color-main)' }}>
                     KOCAELİ • SAKARYA • YALOVA
                  </div>
                  
                  <div className="flex flex-col text-left font-black uppercase transition-colors drop-shadow-lg mb-8 space-y-2 w-full" 
                       style={{ color: 'var(--color-contrast)', fontFamily: "'Fredoka One', 'Baloo 2', 'Comic Sans MS', 'Nunito', sans-serif", textShadow: '2px 4px 0px rgba(0,0,0,0.1)' }}>
                      
                      <div className="text-3xl sm:text-5xl md:text-6xl lg:text-[4rem] xl:text-[4.8rem] leading-tight whitespace-nowrap">
                         BUGÜNÜN ÇALIŞMASI,
                      </div>
                      <div className="text-3xl sm:text-5xl md:text-6xl lg:text-[4rem] xl:text-[4.8rem] leading-tight whitespace-nowrap">
                         YARININ BAŞARISI!
                      </div>
                  </div>
                  
                  <p className="text-lg md:text-2xl mb-12 font-bold leading-relaxed max-w-2xl drop-shadow-sm" style={{ color: 'color-mix(in srgb, var(--color-main) 60%, var(--color-contrast) 40%)' }}>
                     3, 4, 5, 6, 7 ve 8. Sınıf Öğrencilerine Özel Ödüllü<br/>Sınav ve LGS Provaları Burada.
                  </p>

                  {!currentUser ? (
                     <button onClick={() => navigateTo('register')} className="text-white px-12 py-5 rounded-full font-black text-xl hover:scale-105 active:scale-95 transition-all w-full sm:w-auto shadow-2xl animate-pulse" style={{ backgroundColor: 'var(--color-main)' }}> 
                        HEMEN SINAVA KATIL
                     </button>
                  ) : (
                     <button onClick={() => scrollToSection('takvim')} className="text-white px-12 py-5 rounded-full font-black text-xl hover:scale-105 active:scale-95 transition-all w-full sm:w-auto shadow-2xl animate-pulse" style={{ backgroundColor: 'var(--color-main)' }}>
                        YAKLAŞAN SINAVLARINI GÖRÜNTÜLE
                     </button>
                  )}
               </div>
               
               <div className="w-full sm:w-96 lg:w-2/5 flex-shrink-0 relative group flex justify-center lg:justify-end">
                  <div className="absolute inset-0 bg-white blur-[100px] rounded-full opacity-100 z-0 pointer-events-none"></div>
                  <img src={currentTheme?.logo || '/OSLOGO1.png'} alt="Ödüllü Sınav Logo" className="w-[85%] max-w-[350px] lg:max-w-[400px] xl:max-w-[550px] h-auto drop-shadow-2xl group-hover:scale-105 transition-transform duration-500 relative z-10" />
               </div>
           </div>
        </div>
      </section>

      <section className="pb-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-32">
          
          <div id="oduller" className="pt-10 scroll-mt-24"><CombinedPrizeSection displayPrizes={displayPrizes} currentUser={currentUser} /></div>

          <div id="tanitim" className="flex flex-col items-center gap-10 pt-10 scroll-mt-24">
            <div className="w-full max-w-4xl text-center">
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-tight">Deneme <span style={{ color: 'var(--color-main)' }}>Tanıtımı</span></h2>
              <div className="w-full rounded-[2rem] shadow-2xl relative overflow-hidden bg-black border-4 border-slate-100">
                 <video controls playsInline className="w-full aspect-video object-cover bg-black">
                    <source src="/Ödüllü Deneme Sınavı Tanıtım Videosu.mp4" type="video/mp4" />
                    Tarayıcınız video oynatmayı desteklemiyor.
                 </video>
              </div>
              <div className="mt-8 flex flex-col md:flex-row items-center justify-center text-center md:text-left max-w-3xl mx-auto px-4 gap-3">
                 <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0" />
                 <p className="text-lg md:text-xl text-slate-700 font-bold leading-relaxed">
                    <span className="text-amber-500 font-black">Not:</span> 8. sınıflarımız için doğrudan <span className="text-amber-500 font-black">LGS formatında hazırlanmış özel bir deneme</span> yapılacaktır.
                 </p>
              </div>
            </div>
            
            <div className="w-full pt-16 mt-10 border-t-2 border-slate-100/50 flex flex-col gap-24">
               
               <div id="analiz" className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-16 w-full group pt-8 scroll-mt-32">
                  <div className="w-64 h-64 md:w-80 md:h-80 flex-shrink-0 drop-shadow-2xl transition-transform duration-500 group-hover:scale-105 bg-transparent overflow-hidden">
                     <img src="/2.png" alt="Birebir Analiz" className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1 max-w-2xl text-center md:text-left">
                     <h3 className="text-3xl md:text-5xl font-black drop-shadow-sm leading-tight mb-6" style={{ color: 'var(--color-main)' }}>Birebir Analiz</h3>
                     <p className="text-slate-600 font-bold text-lg md:text-xl mb-8 leading-relaxed">
                        Sadece puanınızı değil, hangi konularda eksiğiniz olduğunu detaylı karne ile sunuyoruz. Uzman öğretmen kadromuz eşliğinde zayıf noktalarınızı keşfedip, gerçek LGS öncesi tam donanımlı hale gelin.
                     </p>
                     
                     <ul className="flex flex-col gap-4 text-left ml-4 md:ml-0 mb-8">
                        <li className="flex items-start gap-3">
                           <CheckCircle2 className="w-7 h-7 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-contrast)' }} />
                           {/* DÜZELTME: Doğrudan 2. Renk Atandı */}
                           <span className="font-black text-xl md:text-2xl drop-shadow-md" style={{ color: 'var(--color-contrast)' }}>Konu Bazlı Performans Karnesi</span>
                        </li>
                        <li className="flex items-start gap-3">
                           <CheckCircle2 className="w-7 h-7 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-contrast)' }} />
                           <span className="font-black text-xl md:text-2xl drop-shadow-md" style={{ color: 'var(--color-contrast)' }}>Türkiye ve İl Geneli Yüzdelik Dilim</span>
                        </li>
                     </ul>

                     <button onClick={() => navigateTo('register')} className="px-10 py-4 rounded-full font-black text-white text-xl shadow-lg hover:scale-110 hover:-translate-y-1 transition-all duration-300 animate-pulse" style={{ backgroundColor: 'var(--color-main)', boxShadow: '0 10px 25px -5px var(--color-main)' }}>
                        Hemen Başvur
                     </button>
                  </div>
               </div>

               <div id="etut" className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-16 w-full group pt-8 scroll-mt-32">
                  <div className="w-64 h-64 md:w-80 md:h-80 flex-shrink-0 drop-shadow-2xl transition-transform duration-500 group-hover:scale-105 bg-transparent overflow-hidden">
                     <img src="/3.png" alt="Etüt Desteği" className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1 max-w-2xl text-center md:text-left">
                     <h3 className="text-3xl md:text-5xl font-black drop-shadow-sm leading-tight mb-8" style={{ color: 'var(--color-main)' }}>Etüt Desteği</h3>
                     
                     <ul className="flex flex-col gap-5 text-left ml-4 md:ml-0 mb-8">
                        <li className="flex items-start gap-3">
                           <CheckCircle2 className="w-7 h-7 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-contrast)' }} />
                           {/* DÜZELTME: Doğrudan 2. Renk Atandı */}
                           <span className="font-black text-lg md:text-xl uppercase tracking-wide drop-shadow-md" style={{ color: 'var(--color-contrast)' }}>DERECEYE GİRENLERE EĞİTİM BURSU!</span>
                        </li>
                        <li className="flex items-start gap-3">
                           <CheckCircle2 className="w-7 h-7 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-contrast)' }} />
                           <span className="font-black text-lg md:text-xl uppercase tracking-wide drop-shadow-md" style={{ color: 'var(--color-contrast)' }}>DETAYLI ANALİZ SONUCU EKSİK OLDUĞUN KONULARDA EĞİTİM DESTEĞİ!</span>
                        </li>
                     </ul>

                     <button onClick={() => navigateTo('register')} className="px-10 py-4 rounded-full font-black text-white text-xl shadow-lg hover:scale-110 hover:-translate-y-1 transition-all duration-300 animate-pulse" style={{ backgroundColor: 'var(--color-main)', boxShadow: '0 10px 25px -5px var(--color-main)' }}>
                        Hemen Başvur
                     </button>
                  </div>
               </div>

            </div>
          </div>

          <div id="takvim" className="pt-10 scroll-mt-24"><TimelineCalendar zoneExams={displayExams} currentUser={currentUser} defaultContact={contactToPass} /></div>
        </div>
      </section>
    </div>
  );
}