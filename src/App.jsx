import React, { useState, useEffect } from 'react';
import { Award, Users, LogOut, Phone, MapPin, UserPlus } from 'lucide-react';
import { db, auth, appId } from './services/firebase';
import { collection, onSnapshot, setDoc, doc } from "firebase/firestore";
import { signInAnonymously, signInWithCustomToken, onAuthStateChanged } from "firebase/auth";
import { INITIAL_ZONES } from './data/constants';
import { getNeighborhoodDetails } from './utils/helpers';

// Sayfalar
import LandingPage from './pages/LandingPage';
import RegistrationProcess from './pages/RegistrationProcess';
import LoginPage from './pages/LoginPage';
import StudentProfile from './pages/StudentProfile';
import AdminPanel, { AdminLogin } from './pages/admin/AdminPanel';

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
      if (window.location.pathname === '/admin' || window.location.hash === '#admin') {
        setCurrentView('admin');
      }
    };
    checkRoute();
    window.addEventListener('hashchange', checkRoute);
    return () => window.removeEventListener('hashchange', checkRoute);
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Kimlik doğrulama hatası:", err);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!authUser) return;

    const zonesRef = collection(db, 'artifacts', appId, 'public', 'data', 'zones');
    const examsRef = collection(db, 'artifacts', appId, 'public', 'data', 'exams');
    const studentsRef = collection(db, 'artifacts', appId, 'public', 'data', 'students');

    const unsubZones = onSnapshot(zonesRef, (snapshot) => {
      if (snapshot.empty) {
        INITIAL_ZONES.forEach(async (z) => {
          await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'zones', z.id.toString()), z);
        });
      } else {
        const zonesData = snapshot.docs.map(d => {
          const dbZone = d.data();
          const baseZone = INITIAL_ZONES.find(z => z.id === parseInt(d.id)) || {};
          return { ...dbZone, id: parseInt(d.id), name: baseZone.name, districts: baseZone.districts || [], partialDistricts: baseZone.partialDistricts || {}, prizes: dbZone.prizes || baseZone.prizes, centers: dbZone.centers || [], mappings: dbZone.mappings || [] };
        });
        setZones(zonesData.sort((a, b) => a.id - b.id)); 
      }
    }, (err) => console.error("Bölge verisi alınamadı:", err));

    const unsubExams = onSnapshot(examsRef, (snapshot) => {
      setExams(snapshot.docs.map(d => ({ firebaseId: d.id, ...d.data() })));
    }, (err) => console.error("Sınav verisi alınamadı:", err));

    const unsubStudents = onSnapshot(studentsRef, (snapshot) => {
      const studs = snapshot.docs.map(d => ({ firebaseId: d.id, ...d.data() }));
      setRegisteredStudents(studs);
      
      if (currentUser) {
        const updatedUser = studs.find(s => s.firebaseId === currentUser.firebaseId);
        if (updatedUser) setCurrentUser(updatedUser);
      }
    }, (err) => console.error("Öğrenci verisi alınamadı:", err));

    setTimeout(() => setLoading(false), 1000);

    return () => {
      unsubZones();
      unsubExams();
      unsubStudents();
    };
  }, [authUser]);

  const navigateTo = (view) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentView(view);
  };

  const scrollToSection = (id) => {
    if (currentView !== 'landing') {
      setCurrentView('landing');
      setTimeout(() => { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const copyInviteLink = () => {
    const text = encodeURIComponent("Merhaba arkadaşım ben odullusinav.net'e katılıyorum gel beraber katılıp ödülleri kazanalım. Site linki: https://odullusinav.net");
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  if (loading) {
    // GOOGLE SEO HATASININ ÇÖZÜMÜ: Buradaki yazılar tamamen kaldırıldı, sadece logonuz dönüyor.
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center flex-col">
        <img src="/Sembol.jpg" alt="Ödüllü Sınav Yükleniyor" className="w-24 h-24 md:w-32 md:h-32 object-contain animate-pulse rounded-full shadow-lg border-4 border-indigo-200" />
      </div>
    );
  }

  const userLocDetails = currentUser ? getNeighborhoodDetails(currentUser.zone, currentUser.district, currentUser.neighborhood) : null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <div className="bg-indigo-950 text-indigo-100 text-xs py-2 px-4 flex justify-between items-center sm:px-8 border-b border-indigo-900">
        <div className="flex items-center space-x-4">
          <span className="flex items-center font-bold">
            <Phone className="w-3.5 h-3.5 mr-1 text-indigo-300"/> 
            {/* Telefon numaranız güncellendi */}
            {userLocDetails ? userLocDetails.phone : "0553 973 54 40"}
          </span>
          <span className="hidden sm:flex items-center font-bold">
            <MapPin className="w-3.5 h-3.5 mr-1 text-indigo-300"/> 
            {currentUser ? `${currentUser.province}, ${currentUser.district}, ${currentUser.neighborhood}` : "Sakarya, Kocaeli, Yalova"}
          </span>
        </div>
      </div>

      <nav className="bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row justify-between items-center py-3 lg:h-20 gap-4 lg:gap-0 w-full">
             
             {/* Sol - Logo */}
             <div className="flex items-center cursor-pointer hover:scale-105 transition-transform w-full lg:w-auto justify-start" onClick={() => navigateTo('landing')}>
                <img src="/Sembol.jpg" alt="Logo" className="h-10 w-10 md:h-12 md:w-12 mr-3 object-contain rounded-full shadow-md" />
                <div>
                   <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-none">ÖDÜLLÜ SINAV</h1>
                   <p className="text-[9px] md:text-[10px] font-bold text-indigo-600 uppercase tracking-widest">LGS Prova Merkezi</p>
                </div>
             </div>
             
             {/* Orta - Linkler */}
             <div className="hidden lg:flex space-x-6 items-center flex-1 justify-center">
                <button onClick={() => scrollToSection('hero')} className="text-slate-600 hover:text-indigo-600 font-bold transition text-sm">Ana Sayfa</button>
                <button onClick={() => scrollToSection('sinav-provasi')} className="text-slate-600 hover:text-indigo-600 font-bold transition text-sm">Sınav Provası</button>
                <button onClick={() => scrollToSection('tanitim')} className="text-slate-600 hover:text-indigo-600 font-bold transition text-sm">Tanıtım</button>
                <button onClick={() => scrollToSection('analiz')} className="text-slate-600 hover:text-indigo-600 font-bold transition text-sm">Birebir Analiz</button>
                <button onClick={() => scrollToSection('burs')} className="text-slate-600 hover:text-indigo-600 font-bold transition text-sm">Eğitim Bursları</button>
                <button onClick={() => scrollToSection('oduller')} className="text-slate-600 hover:text-indigo-600 font-bold transition text-sm">Ödül Havuzu</button>
                <button onClick={() => scrollToSection('takvim')} className="text-slate-600 hover:text-indigo-600 font-bold transition text-sm">Sınav Takvimi</button>
             </div>

             {/* Sağ - Butonlar */}
             <div className="flex flex-wrap lg:flex-nowrap justify-start sm:justify-end gap-2 md:gap-3 items-center w-full lg:w-auto mt-3 lg:mt-0">
               {currentUser ? (
                 <>
                    <button onClick={copyInviteLink} className="flex items-center text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 shadow-sm font-bold px-3 py-2 rounded-xl transition-all text-xs md:text-sm whitespace-nowrap">
                      <UserPlus className="w-4 h-4 mr-1.5"/> Davet Et
                    </button>
                    <button onClick={() => navigateTo('profile')} className="bg-indigo-600 text-white px-4 py-2 md:px-6 md:py-2.5 rounded-xl font-black shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all flex items-center text-xs md:text-sm whitespace-nowrap">
                      <Users className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" /> Panelim
                    </button>
                    <button onClick={() => { setCurrentUser(null); navigateTo('landing'); }} className="text-red-500 hover:bg-red-50 hover:shadow-md p-2 rounded-xl border border-red-100 shadow-sm transition-all" title="Çıkış Yap">
                      <LogOut className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                 </>
               ) : (
                 <>
                    <button onClick={copyInviteLink} className="flex items-center text-indigo-700 bg-indigo-50 hover:bg-indigo-100 hover:shadow-md border border-indigo-200 shadow-sm font-bold px-3 py-2 rounded-xl transition-all text-xs md:text-sm whitespace-nowrap">
                      <UserPlus className="w-4 h-4 mr-1.5"/> Davet Et
                    </button>
                    <button onClick={() => navigateTo('login')} className="bg-white border border-slate-200 shadow-sm text-slate-700 hover:text-indigo-600 hover:border-indigo-300 hover:shadow-md font-bold px-4 py-2 rounded-xl transition-all text-xs md:text-sm whitespace-nowrap">
                      Giriş Yap
                    </button>
                    <button onClick={() => navigateTo('register')} className="bg-indigo-600 text-white px-4 py-2 md:px-6 md:py-2.5 rounded-xl font-black shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all text-xs md:text-sm whitespace-nowrap">
                      Kayıt Ol
                    </button>
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

      <footer className="bg-slate-950 text-slate-400 py-16 text-sm text-center border-t-4 border-indigo-600">
        <div className="max-w-4xl mx-auto px-6">
          <img src="/Sembol.jpg" alt="Logo" className="h-12 w-12 mx-auto mb-6 object-contain rounded-full opacity-75" />
          <p className="mb-2 text-lg font-bold text-slate-200">Sakarya, Kocaeli ve Yalova'nın En Prestijli LGS Provası</p>
          <p className="mb-8">Gerçek Sınav Deneyimi ve Büyük Ödüller Bir Arada</p>
          <p>© 2026 Ödüllü Sınav Merkezi. Tüm hakları saklıdır.</p>
        </div>
      </footer>
    </div>
  );
}