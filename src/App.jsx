import React, { useState, useEffect } from 'react';
import { Award, Users, LogOut, Phone, MapPin, UserPlus } from 'lucide-react';
import { db, auth, appId } from './services/firebase';
import { collection, getDocs, setDoc, doc, onSnapshot } from "firebase/firestore"; 
import { signInAnonymously, signInWithCustomToken, onAuthStateChanged } from "firebase/auth";
import { INITIAL_ZONES } from './data/constants';
import { getNeighborhoodDetails, findZoneByName } from './utils/helpers';

import LandingPage from './pages/LandingPage';
import RegistrationProcess from './pages/RegistrationProcess';
import LoginPage from './pages/LoginPage';
import StudentProfile from './pages/StudentProfile';
import AdminPanel, { AdminLogin } from './pages/admin/AdminPanel';

import { ThemeProvider, ThemeSelector } from './components/ThemeSelector';
import CountdownTimer from './components/CountdownTimer';

const mirrorFrameStyle = {
  border: '1px solid rgba(255, 255, 255, 0.4)',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1), inset 0 2px 4px 0 rgba(255, 255, 255, 0.3)',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  borderRadius: '2rem',
  background: 'rgba(255, 255, 255, 0.15)',
};

export default function App() {
  // SİTE ŞU AN BAKIM MODUNDA (Açmak için false yapın)
  const IS_UNDER_MAINTENANCE = true;

  const [currentView, setCurrentView] = useState('landing'); 
  const [currentUser, setCurrentUser] = useState(null);
  const [authUser, setAuthUser] = useState(null);
  const [zones, setZones] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminAuth, setAdminAuth] = useState({ isAuthenticated: false, zoneId: null, isSuperAdmin: false });
  
  const [detectedZone, setDetectedZone] = useState(null);

  useEffect(() => {
    const checkRoute = () => { 
        if (window.location.pathname === '/admin' || window.location.hash === '#admin') setCurrentView('admin'); 
        else if (window.location.hash === '#register') setCurrentView('register');
    };
    checkRoute();
    window.addEventListener('hashchange', checkRoute);
    return () => window.removeEventListener('hashchange', checkRoute);
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) await signInWithCustomToken(auth, __initial_auth_token); 
        else await signInAnonymously(auth);
      } catch (err) { console.error(err); }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => setAuthUser(user));
    return () => unsubscribe();
  }, []);

  // 🚀 DÜZELTME: Veritabanını Yanlışlıkla Sıfırlayan "İlk Kurulum" Kodu Tamamen Kaldırıldı 🚀
  useEffect(() => {
    if (!authUser) return;

    if (adminAuth.isAuthenticated) {
      // 1. YÖNETİCİ MODU (Canlı Dinleme)
      setLoading(true);
      const unsubZones = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'zones'), (zonesSnap) => {
        if (!zonesSnap.empty) {
          const zonesData = zonesSnap.docs.map(d => {
            const dbZone = d.data();
            const baseZone = INITIAL_ZONES.find(z => z.id === parseInt(d.id)) || {};
            return { ...dbZone, id: parseInt(d.id), name: baseZone.name, districts: baseZone.districts || [], partialDistricts: baseZone.partialDistricts || {}, prizes: dbZone.prizes || baseZone.prizes, centers: dbZone.centers || [], mappings: dbZone.mappings || [], specialBoysCentersData: dbZone.specialBoysCentersData || { centers: [], mappings: [] } };
          });
          setZones(zonesData.sort((a, b) => a.id - b.id)); 
        }
        setLoading(false);
      });

      const unsubExams = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'exams'), (examsSnap) => {
        setExams(examsSnap.docs.map(d => ({ firebaseId: d.id, ...d.data() })));
      });

      return () => { unsubZones(); unsubExams(); };
    } else {
      // 2. NORMAL ZİYARETÇİ MODU 
      const fetchInitialData = async () => {
        setLoading(true);
        try {
          const zonesSnap = await getDocs(collection(db, 'artifacts', appId, 'public', 'data', 'zones'));
          const examsSnap = await getDocs(collection(db, 'artifacts', appId, 'public', 'data', 'exams'));

          if (!zonesSnap.empty) {
            const zonesData = zonesSnap.docs.map(d => {
              const dbZone = d.data();
              const baseZone = INITIAL_ZONES.find(z => z.id === parseInt(d.id)) || {};
              return { ...dbZone, id: parseInt(d.id), name: baseZone.name, districts: baseZone.districts || [], partialDistricts: baseZone.partialDistricts || {}, prizes: dbZone.prizes || baseZone.prizes, centers: dbZone.centers || [], mappings: dbZone.mappings || [], specialBoysCentersData: dbZone.specialBoysCentersData || { centers: [], mappings: [] } };
            });
            setZones(zonesData.sort((a, b) => a.id - b.id)); 
          }
          setExams(examsSnap.docs.map(d => ({ firebaseId: d.id, ...d.data() })));
        } catch(e) { console.error(e); }
        setLoading(false);
      };
      fetchInitialData();
    }
  }, [authUser, adminAuth.isAuthenticated]);

  useEffect(() => {
    if (!currentUser && zones.length > 0 && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`);
          const data = await res.json();
          const district = data.address?.town || data.address?.county || data.address?.city_district;
          if (district) {
            const matchedZone = zones.find(z => z.districts?.includes(district) || (z.partialDistricts && z.partialDistricts[district]));
            if (matchedZone) setDetectedZone(matchedZone);
          }
        } catch(e) {}
      }, () => { });
    }
  }, [currentUser, zones]);

  const navigateTo = (view) => { 
      window.scrollTo({ top: 0, behavior: 'smooth' }); 
      setCurrentView(view);
      if (window.location.hash) window.history.pushState("", document.title, window.location.pathname);
  };
  
  const scrollToSection = (id) => {
    if (currentView !== 'landing') {
      setCurrentView('landing');
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } else document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const copyInviteLink = () => {
    const link = `https://www.odullusinav.net/#register`;
    const part1 = "%2AT%C3%BCrkiye%20Geneli%20%C3%96d%C3%BCll%C3%BC%20Deneme%20S%C4%B1nav%C4%B1%2A%20%F0%9F%8F%86%F0%9F%8E%96%EF%B8%8F%F0%9F%93%9D%0A%0A23-25%20Nisan%20%20tarihlerinde%203%2C%204%2C%205%2C%206%2C%207%20ve%208.s%C4%B1n%C4%B1flara%20%C3%B6zel%20d%C3%BCzenlenen%20%2A%C3%96d%C3%BCll%C3%BC%20Deneme%20S%C4%B1nav%C4%B1na%2A%20kat%C4%B1lmak%20i%C3%A7in%20ge%C3%A7%20kalmay%C4%B1n!%0A%0AKat%C4%B1lan%20herkese%20%C3%A7e%C5%9Fitli%20%C3%B6d%C3%BCllerden%20istedi%C4%9Fi%20hediye!%0A%0A%2Afutbol%20topu%E2%9A%BD%EF%B8%8F%2C%20Suluk%20%F0%9F%8D%B6%2C%20Kulakl%C4%B1k%20%F0%9F%8E%A7%2A%20ve%20daha%20niceleri%E2%80%A6%0A%0A%20Derece%20%C3%96d%C3%BClleri%3A%0A%0A%2AAk%C4%B1ll%C4%B1%20saat%20%E2%8C%9A%2Cbisiklet%20%20%F0%9F%9A%B4%20%2C%20Tak%C4%B1ma%20%C3%96zel%20Forma%20%F0%9F%91%95%2A%20ve%20daha%20niceleri%E2%80%A6%0A%0A%2A%E2%80%9C%C3%96d%C3%BCller%2C%20kurumdan%20kuruma%20de%C4%9Fi%C5%9Fiklik%20arz%20edebilir.%E2%80%9D%2A%0A%0ABa%C5%9Fvuru%20i%C3%A7in%3A%0A";
    const part2 = "%0A%0A%C3%96d%C3%BCll%C3%BC%20Deneme%20Sitesi%20Linki%20%0Ahttps%3A%2F%2Fodullusinav.net%2F";
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const waDomain = isMobile ? 'api.whatsapp.com' : 'web.whatsapp.com';
    const finalUrl = `https://${waDomain}/send?text=${part1}${encodeURIComponent(link)}${part2}`;
    window.open(finalUrl, '_blank');
  };

  let targetCountdownDate = null;
  let countdownMode = 'none';

  if (currentUser && (currentUser.selectedDate || currentUser.exam?.date)) {
    try {
      const uDate = currentUser.selectedDate || currentUser.exam.date;
      const uTime = currentUser.selectedTime || currentUser.slot || "09:00";
      const cleanDate = uDate.replace(/\//g, '-').replace(/\./g, '-');
      const dParts = cleanDate.split('-'); 
      let year, month, day;
      if (dParts[0].length === 4) { year = dParts[0]; month = dParts[1]; day = dParts[2]; } 
      else { day = dParts[0]; month = dParts[1]; year = dParts[2]; }
      const timeParts = uTime.split(':');
      const examTime = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(timeParts[0]||9), parseInt(timeParts[1]||0)).getTime();
      
      if (examTime > new Date().getTime()) { 
          targetCountdownDate = examTime; 
          countdownMode = 'personal'; 
      }
    } catch(e) {}
  } 

  if (countdownMode === 'none' && exams.length > 0) {
    let userZoneId = currentUser?.zone?.id;
    
    if (currentUser && !userZoneId && currentUser?.zone?.name) {
       const matchedZ = findZoneByName(zones, currentUser.zone.name);
       if (matchedZ) userZoneId = matchedZ.id;
    }
    
    const defaultZoneObj = zones.find(z => z.districts?.includes('Gebze')) || zones[0] || INITIAL_ZONES[0];
    if (!userZoneId && detectedZone) userZoneId = detectedZone.id;
    if (!userZoneId && defaultZoneObj) userZoneId = defaultZoneObj.id;

    let myZoneUpcoming = [];
    let otherZoneUpcoming = [];
    
    exams.forEach(exam => {
       if (exam.active !== false) {
          const examSessions = exam.sessions || (exam.date && exam.slots ? [{ date: exam.date, slots: exam.slots }] : []);
          examSessions.forEach(session => {
             if (!session.date) return;
             try {
                const cleanDate = session.date.replace(/\//g, '-').replace(/\./g, '-');
                const dParts = cleanDate.split('-');
                let year, month, day;
                if (dParts[0].length === 4) { year = parseInt(dParts[0]); month = parseInt(dParts[1]); day = parseInt(dParts[2]); }
                else { day = parseInt(dParts[0]); month = parseInt(dParts[1]); year = parseInt(dParts[2]); }
                const timeStr = (session.slots && session.slots.length > 0) ? session.slots[0] : '09:00';
                const timeParts = timeStr.split(':');
                const stime = new Date(year, month - 1, day, parseInt(timeParts[0] || '9'), parseInt(timeParts[1] || '0')).getTime();
                
                if (stime > new Date().getTime()) {
                   if (exam.zoneId == userZoneId) myZoneUpcoming.push(stime);
                   else otherZoneUpcoming.push(stime);
                }
             } catch(e) {}
          });
       }
    });
    
    myZoneUpcoming.sort((a,b) => a - b);
    otherZoneUpcoming.sort((a,b) => a - b);
    
    if (myZoneUpcoming.length > 0) { 
        targetCountdownDate = myZoneUpcoming[0]; 
        countdownMode = 'zone'; 
    } 
    else if (otherZoneUpcoming.length > 0) { 
        targetCountdownDate = otherZoneUpcoming[0]; 
        countdownMode = 'other_zones'; 
    } 
    else { 
        countdownMode = 'none'; 
    }
  }

  if (IS_UNDER_MAINTENANCE) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative z-50">
         <div className="absolute inset-0 bg-slate-900/5 backdrop-blur-sm z-[-1]"></div>
         <div className="bg-white p-12 rounded-[3rem] shadow-2xl max-w-xl w-full border-4 border-indigo-100 text-center animate-in zoom-in-95 duration-500">
            <img src="/Sembol.png" alt="Logo" className="w-32 h-32 md:w-40 md:h-40 mx-auto mb-8 animate-pulse drop-shadow-2xl object-contain" />
            <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-6 uppercase tracking-wide">Bakım Çalışması</h1>
            <p className="text-lg md:text-xl font-bold text-slate-500 leading-relaxed">
               Sitemizde kısa süreli bir güncelleme çalışması yapılmaktadır.<br/>Lütfen daha sonra tekrar deneyiniz. Anlayışınız için teşekkür ederiz.
            </p>
         </div>
      </div>
    );
  }

  if (loading) return (
     <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center relative" aria-hidden="true" data-nosnippet>
        <img src="/Sembol.png" className="w-32 h-32 md:w-40 md:h-40 animate-bounce mb-8 object-contain drop-shadow-2xl" alt="" />
        <div className="text-2xl md:text-3xl font-black text-slate-400 animate-pulse tracking-[0.2em] uppercase">Ödüllü Sınav Yükleniyor...</div>
     </div>
  );

  const liveZone = currentUser ? (findZoneByName(zones, currentUser.zone?.name) || currentUser.zone) : null;
  const userLocDetails = currentUser ? getNeighborhoodDetails(liveZone, currentUser.district, currentUser.neighborhood, currentUser.gender, currentUser.grade) : null;
  let headerPhone = userLocDetails?.phone || "0553 973 54 40";

  return (
    <ThemeProvider>
      <div className="fixed inset-0 z-[-1] bg-slate-50 pointer-events-none overflow-hidden transition-colors duration-500">
         <div className="absolute -top-40 -left-40 w-[500px] md:w-[700px] h-[500px] md:h-[700px] rounded-full opacity-100 blur-[80px] md:blur-[120px] transition-colors duration-1000 mix-blend-multiply" style={{ backgroundColor: 'var(--color-light-bg)' }}></div>
         <div className="absolute top-1/4 -right-40 w-[400px] md:w-[600px] h-[400px] md:h-[600px] rounded-full opacity-100 blur-[80px] md:blur-[120px] transition-colors duration-1000 mix-blend-multiply" style={{ backgroundColor: 'var(--color-light-bg)' }}></div>
         <div className="absolute -bottom-40 left-1/4 w-[500px] md:w-[800px] h-[500px] md:h-[800px] rounded-full opacity-100 blur-[80px] md:blur-[120px] transition-colors duration-1000 mix-blend-multiply" style={{ backgroundColor: 'var(--color-light-bg)' }}></div>
      </div>

      <div className="min-h-screen font-sans text-slate-800 transition-colors duration-300 bg-transparent relative z-10">
        
        <div className="text-white text-xs py-2 px-4 flex justify-between items-center sm:px-8 border-b border-black/10 transition-colors z-50 relative" style={{ backgroundColor: 'var(--color-main)' }}>
          <div className="flex items-center space-x-4">
            <span className="flex items-center font-bold"><Phone className="w-3.5 h-3.5 mr-1 opacity-80"/> {headerPhone}</span>
            <span className="hidden sm:flex items-center font-bold"><MapPin className="w-3.5 h-3.5 mr-1 opacity-80"/> {currentUser ? `${currentUser.province}, ${currentUser.district}, ${currentUser.neighborhood}` : "Sakarya, Kocaeli, Yalova"}</span>
          </div>
          <ThemeSelector />
        </div>

        <div className="w-full mx-auto px-4 sm:px-8 mt-4 z-40 sticky top-4">
          <nav className="w-full transition-all duration-300" style={mirrorFrameStyle}>
            <div className="flex flex-col lg:flex-row justify-between items-center py-3 lg:h-24 gap-4 lg:gap-0 w-full px-4 md:px-8">
              
              <div className="flex items-center flex-1 justify-start gap-4 lg:gap-8 w-full lg:w-auto">
                 <div className="flex items-center cursor-pointer hover:scale-105 transition-transform flex-shrink-0" onClick={() => navigateTo('landing')}>
                   <div className="w-12 h-12 md:w-16 md:h-16 mr-3 bg-contain bg-center bg-no-repeat drop-shadow-md transition-all duration-300" style={{ backgroundImage: 'var(--logo-url)' }}></div>
                   <div>
                      <div className="flex items-center gap-1.5">
                         <span className="text-xl md:text-3xl font-black tracking-tight leading-none" style={{ color: 'var(--color-main)' }}>ÖDÜLLÜ</span>
                         <span className="text-xl md:text-3xl font-black tracking-tight leading-none" style={{ color: 'var(--color-contrast)' }}>SINAV</span>
                      </div>
                      <p className="text-[9px] md:text-[13px] font-bold uppercase tracking-[0.15em] mt-1" style={{ color: 'color-mix(in srgb, var(--color-main) 40%, var(--color-contrast) 60%)' }}>
                         İlkokul • Ortaokul • LGS
                      </p>
                   </div>
                 </div>
                 
                 <div className="hidden xl:flex space-x-5 items-center">
                    <style>{`.nav-btn { position: relative; padding-bottom: 4px; color: var(--color-main); font-weight: 900; font-size: 1rem; text-shadow: 0 1px 2px rgba(255,255,255,0.8); } .nav-btn::after { content: ''; position: absolute; bottom: 0; left: 0; width: 0%; height: 2px; background-color: var(--color-main); transition: width 0.3s ease; } .nav-btn:hover::after { width: 100%; }`}</style>
                   <button onClick={() => scrollToSection('oduller')} className="nav-btn tracking-wide transition">Ödüller</button>
                   <button onClick={() => scrollToSection('tanitim')} className="nav-btn tracking-wide transition">Deneme Tanıtımı</button>
                   <button onClick={() => scrollToSection('analiz')} className="nav-btn tracking-wide transition">Birebir Analiz</button>
                   <button onClick={() => scrollToSection('etut')} className="nav-btn tracking-wide transition">Etüt Desteği</button>
                   <button onClick={() => scrollToSection('takvim')} className="nav-btn tracking-wide transition">Sınav Takvimi</button>
                 </div>
              </div>

              <div className="flex flex-row justify-center sm:justify-end gap-2 sm:gap-3 w-full lg:w-auto mt-2 lg:mt-0">
                {currentUser ? (
                  <>
                    <button onClick={copyInviteLink} className="flex items-center justify-center border border-transparent shadow-sm font-black px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl text-[11px] sm:text-base hover:bg-white/10" style={{ color: 'var(--color-contrast)' }}>
                       <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-1.5"/> 
                       <span className="hidden sm:inline">Davet Et</span>
                    </button>
                    <button onClick={() => navigateTo('profile')} className="text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl font-black shadow-lg flex items-center justify-center text-[11px] sm:text-base hover:scale-105 transition-transform whitespace-nowrap" style={{ backgroundColor: 'var(--color-main)' }}>
                       <Users className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-1" /> Panel
                    </button>
                    <button onClick={() => { setCurrentUser(null); navigateTo('landing'); }} className="flex-none text-red-500 p-2 sm:p-2.5 rounded-xl border border-red-100 hover:bg-red-50">
                       <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={copyInviteLink} className="flex items-center justify-center border border-transparent shadow-sm font-black px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl text-[11px] sm:text-base hover:bg-white/10" style={{ color: 'var(--color-contrast)' }}>
                       <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-1.5"/> 
                       <span className="hidden sm:inline">Davet Et</span>
                    </button>
                    <button onClick={() => navigateTo('login')} className="bg-white border text-slate-700 font-black px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-[11px] sm:text-base shadow-sm hover:bg-slate-50 flex items-center justify-center whitespace-nowrap">
                       Giriş Yap
                    </button>
                    <button onClick={() => navigateTo('register')} className="text-white px-4 py-2 sm:px-6 sm:py-2.5 rounded-xl font-black shadow-lg text-[11px] sm:text-base hover:scale-105 transition-transform flex items-center justify-center whitespace-nowrap" style={{ backgroundColor: 'var(--color-main)' }}>
                       Kayıt Ol
                    </button>
                  </>
                )}
              </div>

            </div>
          </nav>
        </div>

        <main className="pb-0 animate-in fade-in duration-500 mt-10">
          {currentView === 'landing' && <LandingPage navigateTo={navigateTo} currentUser={currentUser} detectedZone={detectedZone} scrollToSection={scrollToSection} exams={exams} zones={zones} />}
          {currentView === 'register' && <RegistrationProcess navigateTo={navigateTo} currentUser={currentUser} setCurrentUser={setCurrentUser} zones={zones} exams={exams} refreshData={() => {}} />}
          {currentView === 'login' && <LoginPage setCurrentUser={setCurrentUser} navigateTo={navigateTo} />}
          {currentView === 'profile' && <StudentProfile currentUser={currentUser} exams={exams} navigateTo={navigateTo} setCurrentUser={setCurrentUser} zones={zones} />}
          {currentView === 'admin' && !adminAuth.isAuthenticated && <AdminLogin setAdminAuth={setAdminAuth} zones={zones} />}
          {currentView === 'admin' && adminAuth.isAuthenticated && <AdminPanel adminZoneId={adminAuth.zoneId} isSuperAdmin={adminAuth.isSuperAdmin} onLogout={() => setAdminAuth({ isAuthenticated: false, zoneId: null, isSuperAdmin: false })} zones={zones} exams={exams} />}
        </main>

        {currentView === 'landing' && <CountdownTimer examDate={targetCountdownDate} mode={countdownMode} />}
        
        <footer className="bg-slate-950 text-slate-400 py-16 text-sm text-center border-t-4 transition-colors" style={{ borderTopColor: 'var(--color-main)' }}>
          <div className="max-w-4xl mx-auto px-6">
            <div className="w-20 h-20 mx-auto mb-6 bg-contain bg-center bg-no-repeat drop-shadow-xl transition-all duration-300 filter grayscale brightness-200 opacity-60" style={{ backgroundImage: 'var(--logo-url)' }}></div>
            <p className="mb-2 text-lg font-bold text-slate-200">İlkokul, Ortaokul ve LGS Prova Sınavı Merkezi</p>
            <p className="mb-8">Gerçek Sınav Deneyimi ve Büyük Ödüller Bir Arada</p>
            <p>© 2026 Ödüllü Sınav Merkezi. Tüm hakları saklıdır.</p>
          </div>
        </footer>
      </div>
    </ThemeProvider>
  );
}