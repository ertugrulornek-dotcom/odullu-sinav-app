import React from 'react';
import { Award, ChevronRight, FileText, CheckCircle2, Gift, Clock, AlertCircle } from 'lucide-react';
import TimelineCalendar from '../components/TimelineCalendar';
import CombinedPrizeSection from '../components/CombinedPrizeSection'; // YENİ BİLEŞEN EKLENDİ
import { INITIAL_ZONES } from '../data/constants';

export default function LandingPage({ navigateTo, currentUser, scrollToSection, exams, zones }) {
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
    <div>
      <section id="hero" className="relative text-slate-900 overflow-hidden pt-24 pb-32 transition-colors duration-300" style={{ backgroundColor: 'var(--color-light-bg)' }}>
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center text-center animate-in zoom-in-95 duration-500">
          
          <div className="bg-white rounded-full p-3 mb-8 shadow-2xl">
             <img src="/Sembol.png" alt="Ödüllü Sınav Logo" className="w-40 h-40 md:w-48 md:h-48 object-contain" />
          </div>
          
          <div className="inline-flex items-center px-6 py-2.5 rounded-full border text-sm font-black mb-10 backdrop-blur-sm uppercase tracking-wider bg-white shadow-sm transition-colors" style={{ color: 'var(--color-main)', borderColor: 'var(--color-main)' }}>
            <Award className="w-5 h-5 mr-2" /> 3, 4, 5, 6, 7 ve 8. Sınıflar İçin Kayıtlar Başladı!
          </div>
          
          <h1 className="text-5xl md:text-8xl font-black mb-10 leading-tight tracking-tight drop-shadow-md">
            Gerçek Sınav Ortamında <br/>
            <span className="px-5 py-2 rounded-3xl inline-block mt-4 transition-colors shadow-lg" style={{ backgroundColor: 'var(--color-main)', color: 'white' }}>LGS Provası!</span>
          </h1>
          
          <p className="text-xl md:text-3xl text-slate-700 mb-16 font-medium leading-relaxed max-w-4xl drop-shadow-sm">
            Sınav stresini gerçekçi bir deneyimle yenin. Adresinize en yakın merkezde sınava girin, başarı sıranızı görün ve dev eğitim bursları kazanın.
          </p>
          
          {!currentUser ? (
            <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto">
              <button onClick={() => navigateTo('register')} className="w-full sm:w-auto text-white px-10 py-5 rounded-3xl font-black text-xl hover:scale-105 transition-all shadow-xl flex items-center justify-center z-20" style={{ backgroundColor: 'var(--color-main)' }}>
                 Kayıt Ol ve Sınava Katıl <ChevronRight className="ml-2 w-6 h-6"/>
              </button>
              <button onClick={() => navigateTo('login')} className="w-full sm:w-auto bg-white border-2 text-slate-700 px-10 py-5 rounded-3xl font-black text-xl hover:bg-slate-50 transition-all z-20 shadow-md">Giriş Yap</button>
            </div>
          ) : (
            <button onClick={() => scrollToSection('takvim')} className="text-white px-12 py-6 rounded-3xl font-black text-xl hover:scale-105 transition-all flex items-center justify-center z-20 shadow-xl" style={{ backgroundColor: 'var(--color-main)' }}>
               Yaklaşan Sınavlarını Görüntüle <ChevronRight className="ml-3 w-8 h-8"/>
            </button>
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-slate-50" style={{ clipPath: 'polygon(0 100%, 100% 100%, 100% 0, 0 100%)' }}></div>
      </section>

      <section className="bg-slate-50 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-32">
          
          {/* ARAYA GİREN DİĞER BÖLÜMLER (Sınav Provası, Analiz, vb.) AYNEN KALACAK... */}

          {/* DİNAMİK BİRLEŞİK ÖDÜL SLAYTI BÖLÜMÜ */}
          <div id="oduller" className="pt-10">
              <CombinedPrizeSection displayPrizes={displayPrizes} />
          </div>

          <div id="takvim" className="pt-10">
            <TimelineCalendar zoneExams={displayExams} currentUser={currentUser} defaultContact={publicZone.mappings?.[0]} />
          </div>

        </div>
      </section>
    </div>
  );
}