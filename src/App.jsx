import React, { useState, useEffect } from 'react';
import { Award, Users, LogOut, Phone, MapPin, UserPlus } from 'lucide-react';
import { db, auth, appId } from './services/firebase';
import { collection, onSnapshot, setDoc, doc } from "firebase/firestore";
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

export default function App() {
  const [currentView, setCurrentView] = useState('landing'); 
  const [currentUser, setCurrentUser] = useState(null);
  const [authUser, setAuthUser] = useState(null);
  const [zones, setZones] = useState([]);
  const [exams, setExams] = useState([]);
  const [registeredStudents, setRegisteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminAuth, setAdminAuth] = useState({ isAuthenticated: false, zoneId: null, isSuperAdmin: false });

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

  useEffect(() => {
    if (!authUser) return;
    const zonesRef = collection(db, 'artifacts', appId, 'public', 'data', 'zones');
    const examsRef = collection(db, 'artifacts', appId, 'public', 'data', 'exams');
    const studentsRef = collection(db, 'artifacts', appId, 'public', 'data', 'students');

    const unsubZones = onSnapshot(zonesRef, (snapshot) => {
      if (snapshot.empty) INITIAL_ZONES.forEach(async (z) => await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'zones', z.id.toString()), z));
      else {
        const zonesData = snapshot.docs.map(d => {
          const dbZone = d.data();
          const baseZone = INITIAL_ZONES.find(z => z.id === parseInt(d.id)) || {};
          return { ...dbZone, id: parseInt(d.id), name: baseZone.name, districts: baseZone.districts || [], partialDistricts: baseZone.partialDistricts || {}, prizes: dbZone.prizes || baseZone.prizes, centers: dbZone.centers || [], mappings: dbZone.mappings || [] };
        });
        setZones(zonesData.sort((a, b) => a.id - b.id)); 
      }
    });
    
    const unsubExams = onSnapshot(examsRef, (snapshot) => setExams(snapshot.docs.map(d => ({ firebaseId: d.id, ...d.data() }))));
    
    const unsubStudents = onSnapshot(studentsRef, (snapshot) => {
      const studs = snapshot.docs.map(d => ({ firebaseId: d.id, ...d.data() }));
      setRegisteredStudents(studs);
      setCurrentUser(prevUser => {
         if (prevUser) {
            const updatedUser = studs.find(s => s.firebaseId === prevUser.firebaseId);
            return updatedUser ? { ...updatedUser } : prevUser;
         }
         return prevUser;
      });
    });

    setTimeout(() => setLoading(false), 1000);
    return () => { unsubZones(); unsubExams(); unsubStudents(); };
  }, [authUser]);

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
    const text = encodeURIComponent("Merhaba arkadaşım ben odullusinav.net'e katılıyorum gel beraber katılıp ödülleri kazanalım.\n\nSite linki: https://odullusinav.net\n\nHaydi sen de kayıt ol! https://odullusinav.net/#register");
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  // YENİ GÜÇLENDİRİLMİŞ SAYAÇ HESAPLAMA MANTIĞI
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
                const h = parseInt(timeParts[0] || '9', 10);
                const m = parseInt(timeParts[1] || '0', 10);
                
                const stime = new Date(year, month - 1, day, h, m).getTime();
                
                if (stime > new Date().getTime()) {
                   if (currentUser && userZoneId) {
                       if (exam.zoneId == userZoneId) myZoneUpcoming.push(stime);
                       else otherZoneUpcoming.push(stime);
                   } else {
                       myZoneUpcoming.push(stime); 
                   }
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
    } else if (currentUser && userZoneId && otherZoneUpcoming.length > 0) {
       countdownMode = 'other_zones';
    } else {
       countdownMode = 'none';
    }
  }

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><img src="/Sembol.png" className="w-24 h-24 animate-pulse" /></div>;

  const liveZone = currentUser ? (findZoneByName(zones, currentUser.zone?.name) || currentUser.zone) : null;
  const userLocDetails = currentUser ? getNeighborhoodDetails(liveZone, currentUser.district, currentUser.neighborhood, currentUser.gender) : null;

  let headerPhone = userLocDetails?.phone || "0553 973 54 40";
  if (headerPhone?.includes("0531 333 32 32")) headerPhone = "0553 973 54 40";

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-800 transition-colors duration-300">
        <div className="text-white text-xs py-2 px-4 flex justify-between items-center sm:px-8 border-b border-black/10 transition-colors" style={{ backgroundColor: 'var(--color-main)' }}>
          <div className="flex items-center space-x-4">
            <span className="flex items-center font-bold"><Phone className="w-3.5 h-3.5 mr-1 opacity-80"/> {headerPhone}</span>
            <span className="hidden sm:flex items-center font-bold"><MapPin className="w-3.5 h-3.5 mr-1 opacity-80"/> {currentUser ? `${currentUser.province}, ${currentUser.district}, ${currentUser.neighborhood}` : "Sakarya, Kocaeli, Yalova"}</span>
          </div>
          <ThemeSelector />
        </div>

        <nav className="bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-40 transition-colors">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row justify-between items-center py-3 lg:h-24 gap-4 lg:gap-0 w-full">
              <div className="flex items-center cursor-pointer hover:scale-105 transition-transform flex-shrink-0 mr-auto lg:mr-0" onClick={() => navigateTo('landing')}>
                <img src="/Sembol.png" alt="Logo" className="h-16 w-16 md:h-20 md:w-20 mr-4 object-contain" />
                <div>
                   <div className="flex items-center gap-1.5">
                      <span className="text-2xl md:text-3xl font-black tracking-tight leading-none" style={{ color: 'var(--color-main)' }}>ÖDÜLLÜ</span>
                      <span className="text-2xl md:text-3xl font-black tracking-tight leading-none" style={{ color: 'var(--color-contrast)' }}>SINAV</span>
                   </div>
                   <p className="text-[11px] md:text-[13px] font-medium uppercase tracking-widest mt-1" style={{ color: 'color-mix(in srgb, var(--color-main) 40%, var(--color-contrast) 60%)' }}>LGS Prova Merkezi</p>
                </div>
              </div>
              
              <div className="hidden lg:flex space-x-6 items-center flex-1 justify-center">
                 <style>{`.nav-btn { position: relative; padding-bottom: 4px; } .nav-btn::after { content: ''; position: absolute; bottom: 0; left: 0; width: 0%; height: 2px; background-color: var(--color-main); transition: width 0.3s ease; } .nav-btn:hover::after { width: 100%; } .nav-btn:hover { color: var(--color-main); }`}</style>
                <button onClick={() => scrollToSection('hero')} className="nav-btn text-slate-600 font-bold transition text-sm">Ana Sayfa</button>
                <button onClick={() => scrollToSection('sinav-provasi')} className="nav-btn text-slate-600 font-bold transition text-sm">Sınav Provası</button>
                <button onClick={() => scrollToSection('analiz')} className="nav-btn text-slate-600 font-bold transition text-sm">Birebir Analiz</button>
                <button onClick={() => scrollToSection('burs')} className="nav-btn text-slate-600 font-bold transition text-sm">Eğitim Bursları</button>
                <button onClick={() => scrollToSection('oduller')} className="nav-btn text-slate-600 font-bold transition text-sm">Ödül</button>
                <button onClick={() => scrollToSection('takvim')} className="nav-btn text-slate-600 font-bold transition text-sm">Sınav Takvimi</button>
              </div>

              <div className="flex flex-wrap lg:flex-nowrap justify-start sm:justify-end gap-2 md:gap-3 items-center flex-shrink-0 w-full lg:w-auto mt-3 lg:mt-0">
                {currentUser ? (
                  <>
                    <button onClick={copyInviteLink} className="flex items-center bg-slate-50 border shadow-sm font-bold px-3 py-2 rounded-xl text-xs md:text-sm" style={{ color: 'var(--color-main)' }}><UserPlus className="w-4 h-4 mr-1.5"/> Davet Et</button>
                    <button onClick={() => navigateTo('profile')} className="text-white px-4 py-2 rounded-xl font-black shadow-lg flex items-center text-xs md:text-sm" style={{ backgroundColor: 'var(--color-main)' }}><Users className="w-4 h-4 mr-2" /> Panelim</button>
                    <button onClick={() => { setCurrentUser(null); navigateTo('landing'); }} className="text-red-500 p-2 rounded-xl border border-red-100"><LogOut className="w-4 h-4" /></button>
                  </>
                ) : (
                  <>
                    <button onClick={copyInviteLink} className="flex items-center bg-slate-50 border shadow-sm font-bold px-3 py-2 rounded-xl text-xs md:text-sm" style={{ color: 'var(--color-main)' }}><UserPlus className="w-4 h-4 mr-1.5"/> Davet Et</button>
                    <button onClick={() => navigateTo('login')} className="bg-white border text-slate-700 font-bold px-4 py-2 rounded-xl text-xs md:text-sm">Giriş Yap</button>
                    <button onClick={() => navigateTo('register')} className="text-white px-4 py-2 rounded-xl font-black shadow-lg text-xs md:text-sm" style={{ backgroundColor: 'var(--color-main)' }}>Kayıt Ol</button>
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>

        <main className="pb-0 animate-in fade-in duration-500">
          {currentView === 'landing' && <LandingPage navigateTo={navigateTo} currentUser={currentUser} scrollToSection={scrollToSection} exams={exams} zones={zones} />}
          {currentView === 'register' && <RegistrationProcess navigateTo={navigateTo} currentUser={currentUser} setCurrentUser={setCurrentUser} zones={zones} exams={exams} students={registeredStudents} />}
          {currentView === 'login' && <LoginPage students={registeredStudents} setCurrentUser={setCurrentUser} navigateTo={navigateTo} />}
          {currentView === 'profile' && <StudentProfile currentUser={currentUser} exams={exams} navigateTo={navigateTo} setCurrentUser={setCurrentUser} zones={zones} />}
          {currentView === 'admin' && !adminAuth.isAuthenticated && <AdminLogin setAdminAuth={setAdminAuth} zones={zones} />}
          {currentView === 'admin' && adminAuth.isAuthenticated && <AdminPanel students={registeredStudents} adminZoneId={adminAuth.zoneId} isSuperAdmin={adminAuth.isSuperAdmin} onLogout={() => setAdminAuth({ isAuthenticated: false, zoneId: null, isSuperAdmin: false })} zones={zones} exams={exams} />}
        </main>

        {currentView === 'landing' && <CountdownTimer examDate={targetCountdownDate} mode={countdownMode} />}
        
        <footer className="bg-slate-950 text-slate-400 py-16 text-sm text-center border-t-4 transition-colors" style={{ borderTopColor: 'var(--color-main)' }}>
          <div className="max-w-4xl mx-auto px-6">
            <img src="/Sembol.png" alt="Logo" className="h-16 w-16 mx-auto mb-6 object-contain opacity-90" />
            <p className="mb-2 text-lg font-bold text-slate-200">Sakarya, Kocaeli ve Yalova'nın En Prestijli LGS Provası</p>
            <p className="mb-8">Gerçek Sınav Deneyimi ve Büyük Ödüller Bir Arada</p>
            <p>© 2026 Ödüllü Sınav Merkezi. Tüm hakları saklıdır.</p>
          </div>
        </footer>
      </div>
    </ThemeProvider>
  );
}