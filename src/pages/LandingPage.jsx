import React from 'react';
import { Award, ChevronRight, FileText, CheckCircle2, Gift, Clock, AlertCircle, PlayCircle } from 'lucide-react';
import ModernPrizeCard from '../components/ModernPrizeCard';
import TimelineCalendar from '../components/TimelineCalendar';
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
      <section id="hero" className="relative bg-gradient-to-b from-indigo-900 via-indigo-800 to-indigo-950 text-white overflow-hidden pt-24 pb-32">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center text-center animate-in zoom-in-95 duration-500">
          
          {/* Logo yüzeyle uyumlu ve arka planı beyaz */}
          <div className="bg-white rounded-full p-3 mb-8 drop-shadow-[0_0_25px_rgba(255,255,255,0.2)]">
             <img src="/Sembol.png" alt="Ödüllü Sınav Logo" className="w-40 h-40 md:w-48 md:h-48 object-contain" />
          </div>
          
          <div className="inline-flex items-center px-6 py-2.5 rounded-full bg-yellow-500/20 border border-yellow-400/50 text-yellow-300 text-sm font-black mb-10 backdrop-blur-sm uppercase tracking-wider hover:bg-yellow-500/30 transition-colors">
            <Award className="w-5 h-5 mr-2" /> 3, 4, 5, 6, 7 ve 8. Sınıflar İçin Kayıtlar Başladı!
          </div>
          <h1 className="text-5xl md:text-8xl font-black mb-10 leading-tight tracking-tight drop-shadow-2xl">
            Gerçek Sınav Ortamında <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500">LGS Provası!</span>
          </h1>
          <p className="text-xl md:text-3xl text-indigo-100 mb-16 font-medium leading-relaxed max-w-4xl drop-shadow-md">
            Sınav stresini gerçekçi bir deneyimle yenin. Adresinize en yakın merkezde sınava girin, başarı sıranızı görün ve dev eğitim bursları kazanın.
          </p>
          {!currentUser ? (
            <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto">
              <button onClick={() => navigateTo('register')} className="w-full sm:w-auto bg-gradient-to-r from-yellow-400 to-yellow-500 text-indigo-950 px-10 py-5 rounded-3xl font-black text-xl hover:from-yellow-300 hover:to-yellow-400 hover:scale-105 transition-all shadow-[0_0_40px_rgba(234,179,8,0.4)] flex items-center justify-center z-20">Kayıt Ol ve Sınava Katıl <ChevronRight className="ml-2 w-6 h-6"/></button>
              <button onClick={() => navigateTo('login')} className="w-full sm:w-auto bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white px-10 py-5 rounded-3xl font-black text-xl hover:bg-white hover:text-indigo-900 transition-all z-20 shadow-xl">Giriş Yap</button>
            </div>
          ) : (
            <button onClick={() => scrollToSection('takvim')} className="bg-green-500 text-white px-12 py-6 rounded-3xl font-black text-xl hover:bg-green-400 hover:scale-105 transition-all flex items-center justify-center z-20">Yaklaşan Sınavlarını Görüntüle <ChevronRight className="ml-3 w-8 h-8"/></button>
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-slate-50" style={{ clipPath: 'polygon(0 100%, 100% 100%, 100% 0, 0 100%)' }}></div>
      </section>

      <section className="bg-slate-50 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-32">
          
          <div id="sinav-provasi" className="flex flex-col md:flex-row items-center gap-16 pt-10">
            <div className="w-full md:w-1/2 relative group">
              <div className="absolute inset-0 bg-emerald-200 rounded-[3rem] transform rotate-3 scale-105 opacity-50 group-hover:rotate-0 transition-transform duration-500"></div>
              <img src="/5.png" alt="Gerçek Sınav" className="relative w-full h-auto rounded-[3rem] shadow-2xl object-contain bg-white p-8 z-10 transition-transform duration-500 group-hover:scale-[1.02]" />
            </div>
            <div className="w-full md:w-1/2">
              <div className="w-16 h-16 bg-emerald-100 rounded-3xl flex items-center justify-center mb-6 text-emerald-600 shadow-inner">
                <Clock className="w-8 h-8" />
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-tight">Gerçek Bir <span className="text-emerald-600">Sınav Simülasyonu</span></h2>
              <p className="text-xl text-slate-600 leading-relaxed mb-8">
                Öğrencilerimiz sınav stresini ve heyecanını gerçek LGS öncesinde tecrübe ediyor. Salon başkanı, gözetmenler, optik okuyucu ve sıkı sınav kuralları ile tam bir prova.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center text-lg font-bold text-slate-700 bg-white p-4 rounded-2xl shadow-sm border border-slate-100"><CheckCircle2 className="w-6 h-6 text-emerald-500 mr-3"/> Gerçek Okul Binalarında Sınav</li>
                <li className="flex items-center text-lg font-bold text-slate-700 bg-white p-4 rounded-2xl shadow-sm border border-slate-100"><CheckCircle2 className="w-6 h-6 text-emerald-500 mr-3"/> Optik Form ve Sınav Süresi Yönetimi</li>
              </ul>
            </div>
          </div>

          <div id="analiz" className="flex flex-col md:flex-row items-center gap-16 pt-10">
            <div className="w-full md:w-1/2 relative group">
              <div className="absolute inset-0 bg-blue-200 rounded-[3rem] transform -rotate-3 scale-105 opacity-50 group-hover:rotate-0 transition-transform duration-500"></div>
              <img src="/2.png" alt="Sınav Analiz" className="relative w-full h-auto rounded-[3rem] shadow-2xl object-cover z-10 transition-transform duration-500 group-hover:scale-[1.02]" />
            </div>
            <div className="w-full md:w-1/2">
              <div className="w-16 h-16 bg-blue-100 rounded-3xl flex items-center justify-center mb-6 text-blue-600 shadow-inner"><FileText className="w-8 h-8" /></div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-tight">Sınav Sonrası <span className="text-blue-600">Birebir Analiz</span></h2>
              <p className="text-xl text-slate-600 leading-relaxed mb-8">
                Sadece puanınızı değil, hangi konularda eksiğiniz olduğunu detaylı karne ile sunuyoruz. Uzman öğretmen kadromuz eşliğinde zayıf noktalarınızı keşfedip, gerçek LGS öncesi tam donanımlı hale gelin.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center text-lg font-bold text-slate-700 bg-white p-4 rounded-2xl shadow-sm border border-slate-100"><CheckCircle2 className="w-6 h-6 text-blue-500 mr-3"/> Konu Bazlı Performans Karnesi</li>
                <li className="flex items-center text-lg font-bold text-slate-700 bg-white p-4 rounded-2xl shadow-sm border border-slate-100"><CheckCircle2 className="w-6 h-6 text-blue-500 mr-3"/> Türkiye ve İl Geneli Yüzdelik Dilim</li>
              </ul>
            </div>
          </div>

          <div id="burs" className="flex flex-col md:flex-row-reverse items-center gap-10 md:gap-16 pt-10">
            <div className="w-full md:w-1/2 relative h-[280px] sm:h-[400px] md:h-[500px] mt-8 md:mt-0 group">
              <div className="absolute top-4 md:top-10 right-4 md:right-10 w-full h-full bg-yellow-400/20 rounded-full blur-3xl -z-10 transition-all duration-700 group-hover:scale-110 group-hover:bg-yellow-400/30"></div>
              <img src="/3.png" alt="Başarı" className="absolute top-0 left-0 w-[55%] md:w-3/5 rounded-2xl md:rounded-[2rem] shadow-2xl transform -rotate-6 border-4 md:border-8 border-white hover:rotate-0 hover:z-30 transition-all duration-500 z-20" />
              <img src="/4.png" alt="Hediyeler" className="absolute bottom-0 right-0 w-[60%] md:w-2/3 rounded-2xl md:rounded-[2rem] shadow-2xl transform rotate-6 border-4 md:border-8 border-white hover:rotate-0 hover:z-30 transition-all duration-500 z-10" />
            </div>
            <div className="w-full md:w-1/2">
              <div className="w-16 h-16 bg-yellow-100 rounded-3xl flex items-center justify-center mb-6 text-yellow-600 shadow-inner"><Gift className="w-8 h-8" /></div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-tight">Yüzde Yüze Varan <span className="text-yellow-500">Eğitim Bursları</span></h2>
              <p className="text-xl text-slate-600 leading-relaxed mb-8">
                Başarınızı ödüllendiriyoruz! Sınavda dereceye giren öğrencilerimiz seçkin özel okullarda ve kurs merkezlerinde %100'e varan dev eğitim bursları kazanıyor.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center text-lg font-bold text-slate-700 bg-white p-4 rounded-2xl shadow-sm border border-slate-100"><CheckCircle2 className="w-6 h-6 text-yellow-500 mr-3"/> İlk 3'e Girenlere %100 Burs</li>
                <li className="flex items-center text-lg font-bold text-slate-700 bg-white p-4 rounded-2xl shadow-sm border border-slate-100"><CheckCircle2 className="w-6 h-6 text-yellow-500 mr-3"/> Teknolojik Sürpriz Hediyeler</li>
              </ul>
            </div>
          </div>

          <div id="tanitim" className="flex flex-col md:flex-row items-center gap-16 pt-10">
            <div className="w-full md:w-1/2">
              <div className="w-16 h-16 bg-indigo-100 rounded-3xl flex items-center justify-center mb-6 text-indigo-600 shadow-inner">
                <PlayCircle className="w-8 h-8" />
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-tight">Deneme <span className="text-indigo-600">Tanıtımı</span></h2>
              <p className="text-xl text-slate-600 leading-relaxed mb-8">
                Tanıtım videomuzda deneme sınavımız ile ilgili bilgiler yer almaktadır.
              </p>
              <div className="bg-amber-50 p-6 rounded-2xl border border-amber-200 shadow-sm flex items-start text-left">
                 <AlertCircle className="w-8 h-8 text-amber-500 mr-4 flex-shrink-0" />
                 <p className="text-md text-amber-900 font-bold leading-relaxed">
                    Not: 8. sınıflarımız için doğrudan <span className="text-amber-600 font-black">LGS formatında hazırlanmış özel bir deneme</span> yapılacaktır.
                 </p>
              </div>
            </div>
            <div className="w-full md:w-1/2 relative group">
              <div className="absolute inset-0 bg-indigo-200 rounded-[3rem] transform rotate-3 scale-105 opacity-50 group-hover:rotate-0 transition-transform duration-500"></div>
              
              {/* Video Dikdörtgen ve Sığdırılmış (aspect-video eklendi) */}
              <div className="relative bg-slate-900 rounded-[3rem] p-2 shadow-2xl z-10 transition-transform duration-500 group-hover:scale-[1.02]">
                 <video controls playsInline className="w-full aspect-video rounded-[2.5rem] object-cover bg-black" poster="/Sembol.png">
                    <source src="/Ödüllü Deneme Sınavı Tanıtım Videosu.mp4" type="video/mp4" />
                    Tarayıcınız video oynatmayı desteklemiyor.
                 </video>
              </div>
            </div>
          </div>

          <div id="oduller" className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 p-6 md:p-16 relative overflow-hidden pt-10">
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row items-center justify-center mb-6 gap-4">
                <div className="bg-yellow-100 p-4 rounded-full shadow-inner"><Gift className="w-10 h-10 text-yellow-600"/></div>
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 text-center">Ödül Havuzu</h2>
              </div>
              <p className="text-lg md:text-xl text-slate-600 mb-12 text-center max-w-3xl mx-auto leading-relaxed">Sınava katılarak aşağıdaki muhteşem ödülleri kazanma şansı yakalayacaksın!</p>
              
              <div className="flex flex-col gap-10 max-w-4xl mx-auto">
                <ModernPrizeCard type="grand" prizeData={displayPrizes?.grand} selectedPrize={null} />
                <ModernPrizeCard type="degree" prizeData={displayPrizes?.degree} selectedPrize={currentUser?.selectedDegreePrize} />
                <ModernPrizeCard type="participation" prizeData={displayPrizes?.participation} selectedPrize={currentUser?.selectedParticipationPrize} />
              </div>
            </div>
          </div>

          <div id="takvim" className="pt-10">
            <TimelineCalendar zoneExams={displayExams} currentUser={currentUser} defaultContact={publicZone.mappings?.[0]} />
          </div>

        </div>
      </section>
    </div>
  );
}