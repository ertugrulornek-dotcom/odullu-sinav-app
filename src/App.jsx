import React, { useState, useEffect } from 'react';
import { 
  MapPin, Calendar, Clock, Award, Users, Search, 
  Settings, ChevronRight, AlertCircle, CheckCircle2, 
  Map, Phone, FileText, Lock, MessageSquare, Gift, Star, Check, Plus, LogOut, KeyRound, Trash2, UserPlus, Trophy
} from 'lucide-react';

// ==========================================
// FIREBASE BAĞLANTISI VE GÜVENLİK
// ==========================================
import { initializeApp } from "firebase/app";
import { getFirestore, collection, onSnapshot, setDoc, doc, addDoc, updateDoc } from "firebase/firestore";
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCVXOTNeICNfGvLULngqkF-8fRV-W9JdPg",
  authDomain: "odulludeneme-ae8da.firebaseapp.com",
  projectId: "odulludeneme-ae8da",
  storageBucket: "odulludeneme-ae8da.firebasestorage.app",
  messagingSenderId: "749281964969",
  appId: "1:749281964969:web:cc66285c567487fbd3cab8",
  measurementId: "G-3E6EP90TN2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'odullu-sinav';

// --- GENİŞLETİLMİŞ LOKASYON VERİ TABANI ---
const LOCATIONS = {
  "Kocaeli": {
    "Başiskele": ["Atakent", "Aydınyuvam", "Barbaros", "Camidüzü", "Damlar", "Doğantepe", "Döngel", "Fatih", "Havuzlubahçe", "Karadenizliler", "Kılıçarslan", "Körfez", "Ovacık", "Paşadağ", "Sahil", "Seymen", "Şehitekrem", "Vezirçiftliği", "Yayla", "Yeniköy", "Yeşilyurt"],
    "Çayırova": ["Akse", "Atatürk", "Cumhuriyet", "Emek", "İnönü", "Özgürlük", "Şekerpınar", "Yeni Mahalle"],
    "Darıca": ["Abdi İpekçi", "Bağlarbaşı", "Bayramoğlu", "Cami", "Emek", "Fevziçakmak", "Kazımkarabekir", "Nenehatun", "Osmangazi", "Piri Reis", "Sırasöğütler", "Yalı", "Yeni"],
    "Derince": ["Çavuşlu", "Çenedağ", "Çınarlı", "Deniz", "Dumlupınar", "Fatih Sultan", "Geredeli", "İbni Sina", "İshakçılar", "Karagöllü", "Kaşıkçı", "Mersincik", "Sırrıpaşa", "Tahtalı", "Toylar", "Yavuz Sultan", "Yenikent"],
    "Dilovası": ["Cumhuriyet", "Çerkeşli", "Demirciler", "Diliskelesi", "Fatih", "Kayapınar", "Köseler", "Mimar Sinan", "Orhangazi", "Tavşancıl", "Tepecik", "Turgut Özal"],
    "Gebze": ["Adem Yavuz", "Ahatlı", "Arapçeşme", "Akarçeşme", "Balçık", "Barış", "Beylikbağı", "Cumaköy", "Cumhuriyet", "Denizli", "Duraklı", "Elbizli", "Eskihisar", "Gaziler", "Güzeller", "Hacıhalil", "Hatipler", "Hürriyet", "İnönü", "İstasyon", "Kadıllı", "Kargalı", "Kirazpınar", "Köşklü Çeşme", "Mevlana", "Mudarlı", "Mustafapaşa", "Mutlukent", "Ovacık", "Osman Yılmaz", "Pelitli", "Sultan Orhan", "Tatlıkuyu", "Tavşanlı", "Tepemanayır", "Ulus", "Yağcılar", "Yavuz Selim"],
    "Gölcük": ["Atatürk", "Ayvazpınar", "Cavitpaşa", "Cumhuriyet", "Çiftlik", "Değirmendere", "Denizevler", "Donanma", "Düzağaç", "Ferhadiye", "Halıdere", "Hasaneyn", "Hisareyn", "İcadiye", "İhsaniye", "İkramiye", "Kavaklı", "Lütfiye", "Mamuriye", "Mesruriye", "Nüzhetiye", "Örcün", "Panayır", "Piyalepaşa", "Saraylı", "Selimiye", "Siyretiye", "Sofular", "Şevketiye", "Şirinköy", "Topçular", "Ulaşlı", "Yalı", "Yazlık", "Yeni", "Yüzbaşılar"],
    "İzmit": ["28 Haziran", "Akçakoca", "Alikahya", "Ambarcı", "Arızlı", "Arpızlı", "Ayazma", "Bağlıca", "Balören", "Barbek", "Bayraktar", "Bekirdere", "Böğürgen", "Bulduk", "Cedit", "Cumhuriyet", "Çavuşoğlu", "Çayırköy", "Çepni", "Çubuklubala", "Çubukluosmaniye", "Dağköy", "Doğan", "Durhasan", "Eğercili", "Emirhan", "Erenler", "Eseler", "Fatih", "Fethiye", "Fethiyeköy", "Gedikli", "Gökçeören", "Gülbahçe", "Gültepe", "Güvercinlik", "Hacıhasan", "Hacıhızır", "Hakaniye", "Hasancıklar", "Hatipköy", "Kadıköy", "Karaabdülbaki", "Karabaş", "Karadenizliler", "Kısalar", "Kocatepe", "Kozluk", "Körfez", "Kurtdere", "Kuruçeşme", "M.Alipaşa", "Malta", "Mecidiye", "Nebihoca", "Orhan", "Ortaburun", "Ömerağa", "Sanayi", "Sapakpınar", "Sarışeyh", "Serdar", "Süverler", "Şahinler", "Şirintepe", "Tavşantepe", "Tepecik", "Tepeköy", "Topçular", "Turgut", "Tüysüzler", "Veliahmet", "Yahyakaptan", "Yassıbağ", "Yenidoğan", "Yenişehir", "Yeşilova", "Zabıtan", "Zeytinburnu"],
    "Kandıra": ["Akdurak", "Çarşı", "Orhan", "Aydınlık", "Akbal", "Akçabeyli", "Akçaova", "Kefken", "Kerpe", "Cebeci", "Bağırganlı", "Babalı"],
    "Karamürsel": ["4 Temmuz", "Kayacık", "Tepeköy", "Ereğli", "Akçat", "Avcıköy", "Çamçukur", "Dereköy", "Fulacık", "İhsaniye"],
    "Kartepe": ["Ataşehir", "Fatih Sultan Mehmet", "Köseköy", "Uzunçiftlik", "Arslanbey", "Acısu", "Balaban", "Çepni", "Derbent", "Ertuğrulgazi", "İstasyon", "Maşukiye", "Suadiye", "Şirinsulhiye"],
    "Körfez": ["Mimar Sinan", "Yarımca", "Tütünçiftlik", "Hacı Osman", "Atalar", "Ağadere", "Barbaros", "Çamlıtepe", "Esentepe", "Fatih", "Güney", "İlimtepe", "Kuzey", "Şirinyalı", "Yavuz Selim", "Yeniyalı"]
  },
  "Sakarya": {
    "Adapazarı": ["Akköy", "Alancık", "Aşırlar", "Bağlar", "Bileciler", "Büyükhataplı", "Camili", "Cumhuriyet", "Çaltıcak", "Çamyolu", "Çerçiler", "Çökekler", "Çukurahmediye", "Dağdibi", "Demirbey", "Doğancılar", "Elmalı", "Evrenköy", "Göktepe", "Güllük", "Güneşler", "Hacılar", "Hızırtepe", "Işıklar", "İlyaslar", "İstiklal", "Karaköy", "Karaman", "Karasoku", "Kasımlar", "Kavaklıorman", "Korucuk", "Kurtbeyler", "Kurtuluş", "Küçükhataplı", "Mahmudiye", "Maltepe", "Mithatpaşa", "Nasuhlar", "Ozanlar", "Örentepe", "Pabuççular", "Poyrazlar", "Rüstemler", "Sakarya", "Salmanlı", "Semerciler", "Solaklar", "Süleymanbey", "Şeker", "Şirinevler", "Taşkısığı", "Tekeler", "Tepekum", "Tığcılar", "Turnadere", "Tuzla", "Yağcılar", "Yahalar", "Yenicami", "Yenigün", "Yeniköy"],
    "Serdivan": ["Arabacıalanı", "Aralık", "Aşağıdereköy", "Bahçelievler", "Beşköprü", "Çubuklu", "Dağyoncalı", "Esentepe", "İstiklal", "Kazımpaşa", "Kemalpaşa", "Kızılcıklı", "Köprübaşı", "Kuruçeşme", "Meşeli", "Reşadiye", "Selahiye", "Uzunköy", "Vatan", "Yazlık"],
    "Erenler": ["Alancuma", "Büyükesence", "Çaybaşıyeniköy", "Değirmendere", "Dilmen", "Ekinli", "Erenler", "Hacıoğlu", "Hasanbey", "Horozlar", "Kamışlı", "Kayalarmemduhiye", "Kayalarreşitbey", "Kozluk", "Küpçüler", "Nakışlar", "Pirahmetler", "Sarıcalar", "Şeyhköy", "Tabakhane", "Yazılı", "Yeni"],
    "Akyazı": ["Altındere", "Batakköy", "Cumhuriyet", "Çatalköprü", "Dokurcun", "Fatih", "Gazi", "Hasanbey", "İnönü", "Konuralp", "Kuzuluk", "Ömercikler", "Vakıf", "Yeni", "Yunus Emre"],
    "Hendek": ["Akova", "Başpınar", "Bayraktepe", "Büyükdere", "Çamlıca", "Dereboğazı", "Kemaliye", "Mahmutbey", "Nuriye", "Puna", "Turanlar", "Yeni", "Yeşilyurt"],
    "Sapanca": ["Akçay", "Camicedit", "Çayiçi", "Dibektaş", "Fevziye", "Gazipaşa", "Göl", "Hacımercan", "İlmiye", "Kurtköy", "Mahmudiye", "Muradiye", "Nailiye", "Rüstempaşa", "Şükriye", "Uzunkum", "Ünlüce", "Yanık", "Yeni"],
    "Arifiye": ["Adliye", "Arifbey", "Bozacı", "Cumhuriyet", "Çaybaşıfautpaşa", "Çınardibi", "Fatih", "Hanlı", "Karaaptiler", "Kemaliye", "Kirazca", "Kumbaşı", "Neviye", "Yukarıdereköy"],
    "Karasu": ["Aziziye", "İncilli", "Kabakoz", "Kuzuluk", "Yalı", "Yeni", "Adatepe", "Darıçayırı", "Kurudere", "Limandere"],
    "Ferizli": ["İnönü", "Devlet", "Kemalpaşa", "Gölkent", "Sinanoğlu", "Ağacık", "Bakırlı"],
    "Geyve": ["Tepecikler", "Orhaniye", "Camikebir", "İnciksuyu", "Yörükler", "Gazi Süleyman Paşa", "Alifuatpaşa"]
  },
  "Yalova": {
    "Merkez": ["Adnan Menderes", "Bağlarbaşı", "Bahçelievler", "Bayraktepe", "Dere", "Fevzi Çakmak", "Gaziosmanpaşa", "İsmet Paşa", "Kadıköy", "Kazım Karabekir", "Mustafa Kemal Paşa", "Paşakent", "Rüstem Paşa", "Süleyman Bey"],
    "Çiftlikköy": ["Çiftlik", "Mehmet Akif Ersoy", "Sahil", "Sultaniye", "500 Evler", "Siteler", "Taşköprü"],
    "Çınarcık": ["Çamlık", "Harmanlar", "Hasanbaba", "Karpuzdere", "Taşliman", "Koruköy", "Esenköy", "Teşvikiye"],
    "Altınova": ["Cumhuriyet", "Hürriyet", "Hersek", "Kaytazdere", "Subaşı", "Tavşanlı"],
    "Armutlu": ["50. Yıl", "Bayır", "Karşıyaka"],
    "Termal": ["Gökçedere", "Üvezpınar"]
  }
};

// --- BAŞLANGIÇ VERİ YAPISI (Firebase Boşsa Doldurulacak - Kapsayıcı İlçeler) ---
const INITIAL_ZONES = [
  { id: 1, name: "Gebze", active: true, districts: ["Gebze", "Çayırova", "Darıca", "Dilovası"], prizes: { grand: "", degree: "", participation: "" }, mappings: [] },
  { id: 2, name: "Akarçeşme", active: true, districts: ["Gebze"], prizes: { grand: "", degree: "", participation: "" }, mappings: [] },
  { id: 3, name: "Yalova", active: true, districts: ["Merkez", "Çiftlikköy", "Çınarcık", "Altınova", "Armutlu", "Termal"], prizes: { grand: "", degree: "", participation: "" }, mappings: [] },
  { id: 4, name: "Kartepe", active: true, districts: ["Kartepe", "İzmit", "Başiskele", "Körfez", "Derince"], prizes: { grand: "", degree: "", participation: "" }, mappings: [] },
  { id: 5, name: "Adapazarı", active: true, districts: ["Adapazarı", "Karasu", "Ferizli", "Geyve"], prizes: { grand: "", degree: "", participation: "" }, mappings: [] },
  { id: 6, name: "Serdivan", active: true, districts: ["Serdivan", "Sapanca"], prizes: { grand: "", degree: "", participation: "" }, mappings: [] },
  { id: 7, name: "Erenler", active: true, districts: ["Erenler", "Akyazı", "Hendek", "Arifiye", "Kandıra", "Karamürsel", "Gölcük"], prizes: { grand: "", degree: "", participation: "" }, mappings: [] }
];

// Helper Functions
const getNeighborhoodDetails = (zone, neighborhood) => {
  const defaultDetails = { phone: "0850 123 45 67", center: "Sınav Merkezi Belirlenmedi", address: "", mapLink: "" };
  if (!zone || !zone.mappings) return defaultDetails;
  const map = zone.mappings.find(m => m.neighborhoods.includes(neighborhood));
  return map ? map : defaultDetails;
};

// Ortak Ödül Gösterim Bileşeni (Virgüllü Seçenekler İçin)
const PrizeDisplay = ({ title, prizeString, selectedPrize }) => {
  if (!prizeString) return <div className="font-black text-white text-xl">Yakında Açıklanacak</div>;
  const prizes = prizeString.split(',').map(s => s.trim()).filter(s => s);
  if (prizes.length === 1) return <div className="font-black text-white text-2xl">{prizes[0]}</div>;

  return (
    <div className="mt-3 space-y-2">
      {prizes.map((p, i) => {
        const isSelected = selectedPrize === p;
        return (
          <div key={i} className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-colors ${isSelected ? 'bg-green-500/20 border-green-400 shadow-sm' : 'bg-white/10 border-white/20'}`}>
            <span className={`text-sm ${isSelected ? 'text-green-300 font-black' : 'text-white font-bold'}`}>
              {i+1}. {p}
            </span>
            {isSelected && <CheckCircle2 className="w-5 h-5 text-green-400" />}
          </div>
        );
      })}
    </div>
  );
};


export default function App() {
  const [currentView, setCurrentView] = useState('landing'); 
  const [currentUser, setCurrentUser] = useState(null);
  
  const [authUser, setAuthUser] = useState(null);
  const [zones, setZones] = useState([]);
  const [exams, setExams] = useState([]);
  const [registeredStudents, setRegisteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [adminAuth, setAdminAuth] = useState({ isAuthenticated: false, zoneId: null });

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
        const zonesData = snapshot.docs.map(d => ({ id: parseInt(d.id), ...d.data() }));
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
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const copyInviteLink = () => {
    try {
      alert("Davet linki kopyalandı! (odullusinav.net) Arkadaşlarına gönderebilirsin.");
    } catch(e) {
      console.log(e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center flex-col">
        <Award className="w-20 h-20 text-indigo-600 animate-pulse mb-6" />
        <h2 className="text-2xl font-black text-slate-800">Sistem Hazırlanıyor...</h2>
        <p className="text-slate-500 font-bold mt-2">Güvenli veritabanına bağlanılıyor</p>
      </div>
    );
  }

  const userLocationDetails = currentUser ? getNeighborhoodDetails(currentUser.zone, currentUser.neighborhood) : null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* ÜST BİLGİ BARI */}
      <div className="bg-indigo-950 text-indigo-100 text-xs py-2 px-4 flex justify-between items-center sm:px-8 border-b border-indigo-900">
        <div className="flex items-center space-x-4">
          <span className="flex items-center font-bold">
            <Phone className="w-3.5 h-3.5 mr-1 text-indigo-300"/> 
            {userLocationDetails ? userLocationDetails.phone : "0850 123 45 67"}
          </span>
          <span className="hidden sm:flex items-center font-bold">
            <MapPin className="w-3.5 h-3.5 mr-1 text-indigo-300"/> 
            {currentUser ? `${currentUser.province}, ${currentUser.district}, ${currentUser.neighborhood}` : "Sakarya, Kocaeli, Yalova"}
          </span>
        </div>
      </div>

      {/* ANA NAVBAR */}
      <nav className="bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center cursor-pointer" onClick={() => navigateTo('landing')}>
              <Award className="h-10 w-10 text-indigo-600 mr-2" />
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">ÖDÜLLÜ SINAV</h1>
                <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">LGS Prova Merkezi</p>
              </div>
            </div>
            
            <div className="hidden md:flex space-x-8 items-center">
              <button onClick={() => scrollToSection('hero')} className="text-slate-600 hover:text-indigo-600 font-bold transition text-sm">Ana Sayfa</button>
              <button onClick={() => scrollToSection('analiz')} className="text-slate-600 hover:text-indigo-600 font-bold transition text-sm">Birebir Analiz</button>
              <button onClick={() => scrollToSection('burs')} className="text-slate-600 hover:text-indigo-600 font-bold transition text-sm">Eğitim Bursu</button>
              
              {currentUser && (
                <>
                  <button onClick={() => scrollToSection('oduller')} className="text-yellow-600 hover:text-yellow-700 font-black transition text-sm bg-yellow-50 px-3 py-1.5 rounded-lg border border-yellow-200">Bölgemin Ödülleri</button>
                  <button onClick={() => scrollToSection('takvim')} className="text-indigo-600 hover:text-indigo-700 font-black transition text-sm bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-200">Sınav Takvimim</button>
                </>
              )}
            </div>

            <div className="flex space-x-3 items-center">
              {currentUser ? (
                <>
                  <button onClick={copyInviteLink} className="hidden lg:flex items-center text-indigo-600 hover:text-indigo-800 font-bold px-3 py-2 transition text-sm">
                    <UserPlus className="w-4 h-4 mr-1.5"/> Arkadaşını Davet Et
                  </button>
                  <button 
                    onClick={() => navigateTo('profile')} 
                    className="bg-indigo-50 text-indigo-700 px-6 py-2.5 rounded-xl font-black border-2 border-indigo-100 hover:bg-indigo-100 flex items-center transition"
                  >
                    <Users className="w-5 h-5 mr-2" /> Panelim
                  </button>
                  <button onClick={() => { setCurrentUser(null); navigateTo('landing'); }} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition" title="Çıkış Yap">
                    <LogOut className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <>
                  <button onClick={copyInviteLink} className="hidden lg:flex items-center text-indigo-600 hover:text-indigo-800 font-bold px-3 py-2 transition text-sm">
                    <UserPlus className="w-4 h-4 mr-1.5"/> Arkadaşını Davet Et
                  </button>
                  <button 
                    onClick={() => navigateTo('login')} 
                    className="text-slate-700 hover:text-indigo-600 font-bold px-4 py-2 transition"
                  >
                    Giriş Yap
                  </button>
                  <button 
                    onClick={() => navigateTo('register')} 
                    className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-black shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 transition-all"
                  >
                    Kayıt Ol
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="pb-0">
        {currentView === 'landing' && <LandingPage navigateTo={navigateTo} currentUser={currentUser} scrollToSection={scrollToSection} exams={exams} />}
        {currentView === 'register' && 
          <RegistrationProcess 
            navigateTo={navigateTo} 
            currentUser={currentUser}
            setCurrentUser={setCurrentUser} 
            zones={zones}
            exams={exams}
          />}
        {currentView === 'login' && <LoginPage students={registeredStudents} setCurrentUser={setCurrentUser} navigateTo={navigateTo} />}
        {currentView === 'profile' && <StudentProfile currentUser={currentUser} exams={exams} navigateTo={navigateTo} />}
        
        {currentView === 'admin' && !adminAuth.isAuthenticated && (
           <AdminLogin setAdminAuth={setAdminAuth} zones={zones} />
        )}
        {currentView === 'admin' && adminAuth.isAuthenticated && (
           <AdminPanel 
             students={registeredStudents} 
             adminZoneId={adminAuth.zoneId} 
             onLogout={() => setAdminAuth({ isAuthenticated: false, zoneId: null })}
             zones={zones}
             exams={exams}
           />
        )}
      </main>

      <footer className="bg-slate-950 text-slate-400 py-16 text-sm text-center border-t-4 border-indigo-600">
        <div className="max-w-4xl mx-auto px-6">
          <Award className="h-10 w-10 text-indigo-500 mx-auto mb-6" />
          <p className="mb-2 text-lg font-bold text-slate-200">Sakarya, Kocaeli ve Yalova'nın En Prestijli LGS Provası</p>
          <p className="mb-8">Gerçek Sınav Deneyimi ve Büyük Ödüller Bir Arada</p>
          <p>© 2026 Ödüllü Sınav Merkezi. Tüm hakları saklıdır.</p>
        </div>
      </footer>
    </div>
  );
}

// ==========================================
// 0. ADMIN LOGIN EKRANI
// ==========================================
function AdminLogin({ setAdminAuth, zones }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    if (password !== '18881959') {
      setError('Hatalı şifre girdiniz.');
      return;
    }

    const normalizeStr = (str) => {
      return str.replace(/İ/g, 'i').replace(/I/g, 'ı').toLowerCase().trim();
    };

    const searchStr = normalizeStr(username);
    const activeZones = zones && zones.length > 0 ? zones : INITIAL_ZONES;

    const matchedZone = activeZones.find(z => 
      normalizeStr(z.name) === searchStr || 
      z.districts.some(d => normalizeStr(d) === searchStr)
    );

    if (matchedZone) {
      setAdminAuth({ isAuthenticated: true, zoneId: matchedZone.id });
    } else {
      setError(`Tanımsız Bölge. "${username}" bulunamadı. Lütfen sorumlu olduğunuz ilçe veya bölge adını doğru girin.`);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-20">
      <div className="bg-white p-10 md:p-14 rounded-[3rem] shadow-2xl shadow-indigo-100/50 border border-slate-100 w-full max-w-md">
        <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
          <KeyRound className="w-10 h-10 text-indigo-600" />
        </div>
        <h2 className="text-3xl font-black text-center text-slate-900 mb-2">Yönetici Girişi</h2>
        <p className="text-center text-slate-500 font-bold mb-8">Sorumlu olduğunuz mıntıkayı yönetmek için giriş yapın.</p>
        
        {error && (
          <div className="bg-red-50 text-red-600 font-bold p-4 rounded-2xl mb-6 text-sm text-center border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wider">İlçe / Mıntıka Adı</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Örn: Gebze, Serdivan..." 
              className="w-full border-4 border-slate-100 rounded-2xl px-6 py-4 text-lg font-bold focus:border-indigo-500 outline-none transition"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wider">Şifre</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
              className="w-full border-4 border-slate-100 rounded-2xl px-6 py-4 text-lg font-bold focus:border-indigo-500 outline-none transition"
              required
            />
          </div>
          <button type="submit" className="w-full bg-indigo-600 text-white font-black text-xl py-5 rounded-2xl hover:bg-indigo-700 transition shadow-xl shadow-indigo-500/30 mt-4">
            Sisteme Giriş Yap
          </button>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// 1. LANDING PAGE (KARŞILAMA SAYFASI)
// ==========================================
function LandingPage({ navigateTo, currentUser, scrollToSection, exams }) {
  const zoneExams = currentUser ? exams.filter(e => e.zoneId === currentUser?.zone?.id) : [];

  return (
    <div>
      <section id="hero" className="relative bg-gradient-to-b from-indigo-900 via-indigo-800 to-indigo-950 text-white overflow-hidden pt-24 pb-32">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center px-6 py-2.5 rounded-full bg-yellow-500/20 border border-yellow-400/50 text-yellow-300 text-sm font-black mb-10 backdrop-blur-sm uppercase tracking-wider">
            <Award className="w-5 h-5 mr-2" /> 5, 6, 7 ve 8. Sınıflar İçin Kayıtlar Başladı!
          </div>
          <h1 className="text-5xl md:text-8xl font-black mb-10 leading-tight tracking-tight">
            Gerçek Sınav Ortamında <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500 drop-shadow-lg">
              LGS Provası!
            </span>
          </h1>
          <p className="text-xl md:text-3xl text-indigo-100 mb-16 font-medium leading-relaxed">
            Sınav stresini gerçekçi bir deneyimle yenin. Bölgenize en yakın merkezde sınava girin, başarı sıranızı görün ve dev eğitim bursları kazanın.
          </p>

          {!currentUser ? (
            <div className="flex flex-col sm:flex-row gap-6">
              <button 
                onClick={() => navigateTo('register')} 
                className="bg-yellow-500 text-indigo-950 px-10 py-5 rounded-3xl font-black text-xl hover:bg-yellow-400 hover:scale-105 transition-all shadow-[0_0_40px_rgba(234,179,8,0.4)] flex items-center justify-center z-20"
              >
                Kayıt Ol ve Sınava Katıl <ChevronRight className="ml-2 w-6 h-6"/>
              </button>
              <button 
                onClick={() => navigateTo('login')} 
                className="bg-white text-indigo-900 px-10 py-5 rounded-3xl font-black text-xl hover:bg-indigo-50 transition-all z-20"
              >
                Giriş Yap
              </button>
            </div>
          ) : (
            <button 
              onClick={() => scrollToSection('takvim')} 
              className="bg-green-500 text-white px-12 py-6 rounded-3xl font-black text-xl hover:bg-green-400 transition-all shadow-[0_0_60px_rgba(34,197,94,0.4)] flex items-center justify-center z-20"
            >
              Yaklaşan Sınavlarını Görüntüle <ChevronRight className="ml-3 w-8 h-8"/>
            </button>
          )}
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-slate-50" style={{ clipPath: 'polygon(0 100%, 100% 100%, 100% 0, 0 100%)' }}></div>
      </section>

      <section className="bg-slate-50 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-32">
          <div id="analiz" className="flex flex-col md:flex-row items-center gap-16 pt-10">
            <div className="w-full md:w-1/2 relative">
              <div className="absolute inset-0 bg-blue-200 rounded-[3rem] transform -rotate-3 scale-105 opacity-50"></div>
              <img src="2.png" alt="Sınav Analiz" className="relative w-full h-auto rounded-[3rem] shadow-2xl object-cover z-10" />
            </div>
            <div className="w-full md:w-1/2">
              <div className="w-16 h-16 bg-blue-100 rounded-3xl flex items-center justify-center mb-6 text-blue-600">
                <FileText className="w-8 h-8" />
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-tight">Sınav Sonrası <span className="text-blue-600">Birebir Analiz</span></h2>
              <p className="text-xl text-slate-600 leading-relaxed mb-8">
                Sadece puanınızı değil, hangi konularda eksiğiniz olduğunu detaylı karne ile sunuyoruz. Uzman öğretmen kadromuz eşliğinde zayıf noktalarınızı keşfedip, gerçek LGS öncesi tam donanımlı hale gelin.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center text-lg font-bold text-slate-700"><CheckCircle2 className="w-6 h-6 text-blue-500 mr-3"/> Konu Bazlı Performans Karnesi</li>
                <li className="flex items-center text-lg font-bold text-slate-700"><CheckCircle2 className="w-6 h-6 text-blue-500 mr-3"/> Türkiye ve İl Geneli Yüzdelik Dilim</li>
              </ul>
            </div>
          </div>

          <div id="burs" className="flex flex-col md:flex-row-reverse items-center gap-16 pt-10">
            <div className="w-full md:w-1/2 relative h-[500px]">
              <div className="absolute top-10 right-10 w-full h-full bg-yellow-400/20 rounded-full blur-3xl -z-10"></div>
              <img src="3.png" alt="Başarı" className="absolute top-0 left-0 w-3/5 rounded-[2rem] shadow-2xl transform -rotate-6 border-8 border-white hover:rotate-0 transition-transform duration-500 z-20" />
              <img src="4.png" alt="Hediyeler" className="absolute bottom-0 right-0 w-2/3 rounded-[2rem] shadow-2xl transform rotate-6 border-8 border-white hover:rotate-0 transition-transform duration-500 z-10" />
            </div>
            <div className="w-full md:w-1/2">
              <div className="w-16 h-16 bg-yellow-100 rounded-3xl flex items-center justify-center mb-6 text-yellow-600">
                <Gift className="w-8 h-8" />
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-tight">Yüzde Yüze Varan <span className="text-yellow-500">Eğitim Bursları</span></h2>
              <p className="text-xl text-slate-600 leading-relaxed mb-8">
                Başarınızı ödüllendiriyoruz! Sınavda dereceye giren öğrencilerimiz seçkin özel okullarda ve kurs merkezlerinde %100'e varan dev eğitim bursları kazanıyor.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center text-lg font-bold text-slate-700"><CheckCircle2 className="w-6 h-6 text-yellow-500 mr-3"/> İlk 3'e Girenlere %100 Burs</li>
                <li className="flex items-center text-lg font-bold text-slate-700"><CheckCircle2 className="w-6 h-6 text-yellow-500 mr-3"/> Teknolojik Sürpriz Hediyeler</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="w-full md:w-1/2 relative">
              <div className="absolute inset-0 bg-emerald-200 rounded-[3rem] transform rotate-3 scale-105 opacity-50"></div>
              <img src="5.png" alt="Gerçek Sınav" className="relative w-full h-auto rounded-[3rem] shadow-2xl object-contain bg-white p-8 z-10" />
            </div>
            <div className="w-full md:w-1/2">
              <div className="w-16 h-16 bg-emerald-100 rounded-3xl flex items-center justify-center mb-6 text-emerald-600">
                <Clock className="w-8 h-8" />
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-tight">Gerçek Bir <span className="text-emerald-600">Sınav Simülasyonu</span></h2>
              <p className="text-xl text-slate-600 leading-relaxed mb-8">
                Öğrencilerimiz sınav stresini ve heyecanını gerçek LGS öncesinde tecrübe ediyor. Salon başkanı, gözetmenler, optik okuyucu ve sıkı sınav kuralları ile tam bir simülasyon.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center text-lg font-bold text-slate-700"><CheckCircle2 className="w-6 h-6 text-emerald-500 mr-3"/> Gerçek Okul Binalarında Sınav</li>
                <li className="flex items-center text-lg font-bold text-slate-700"><CheckCircle2 className="w-6 h-6 text-emerald-500 mr-3"/> Optik Form ve Sınav Süresi Yönetimi</li>
              </ul>
            </div>
          </div>

          {currentUser && (
            <>
              <div className="w-full h-px bg-slate-200 my-16"></div>

              <div id="oduller" className="bg-gradient-to-br from-yellow-500 to-amber-600 rounded-[3rem] shadow-2xl p-8 md:p-16 text-white relative overflow-hidden pt-10">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <div className="relative z-10">
                  <div className="flex items-center mb-8">
                    <Gift className="w-12 h-12 mr-4 text-yellow-100"/>
                    <h2 className="text-4xl md:text-5xl font-black">Bölgene Özel Ödüller</h2>
                  </div>
                  <p className="text-xl text-yellow-50 mb-10 max-w-3xl leading-relaxed">
                    Sistem tarafından <b>{currentUser?.zone?.name}</b> bölgesine atandın. Bu bölgedeki öğrencilerle yarışacak ve aşağıdaki muhteşem ödülleri kazanma şansı yakalayacaksın!
                  </p>
                  
                  <div className="grid md:grid-cols-3 gap-8">
                    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 hover:bg-white/20 transition cursor-default">
                      <div className="text-sm uppercase tracking-widest text-yellow-200 font-black mb-3">Büyük Ödül</div>
                      <div className="font-black text-white text-3xl">{currentUser?.zone?.prizes?.grand || "Yakında Açıklanacak"}</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 hover:bg-white/20 transition cursor-default">
                      <div className="text-sm uppercase tracking-widest text-yellow-200 font-black mb-3">Derece Ödülleri</div>
                      <PrizeDisplay prizeString={currentUser?.zone?.prizes?.degree} selectedPrize={currentUser?.selectedDegreePrize} />
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 hover:bg-white/20 transition cursor-default">
                      <div className="text-sm uppercase tracking-widest text-yellow-200 font-black mb-3">Katılım Ödülleri</div>
                      <PrizeDisplay prizeString={currentUser?.zone?.prizes?.participation} selectedPrize={currentUser?.selectedParticipationPrize} />
                    </div>
                  </div>
                </div>
              </div>

              <div id="takvim" className="bg-white rounded-[3rem] shadow-xl border border-slate-100 p-8 md:p-16 relative overflow-hidden pt-10">
                <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-50 rounded-full blur-3xl -ml-20 -mt-20"></div>
                <div className="relative z-10">
                  <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
                    <div>
                      <div className="flex items-center mb-4">
                        <Calendar className="w-12 h-12 mr-4 text-indigo-600"/>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900">Mıntıka Sınav Takvimin</h2>
                      </div>
                      <p className="text-xl text-slate-600 max-w-2xl">
                        Senin bölgen olan <b>{currentUser?.zone?.name}</b> sınırları içerisindeki planlanmış aktif oturumlar.
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {zoneExams.length > 0 ? zoneExams.map(exam => {
                      const examSessions = exam.sessions || (exam.date && exam.slots ? [{ date: exam.date, slots: exam.slots }] : []);
                      return (
                        <div key={exam.firebaseId} className="border-4 border-indigo-100 bg-indigo-50/50 rounded-[2rem] p-8 hover:border-indigo-400 hover:bg-indigo-50 transition-colors relative">
                          <h3 className="font-black text-2xl text-slate-800 mb-6 leading-tight">{exam.title}</h3>
                          
                          {examSessions.map((session, sIdx) => {
                            const isMyDate = (currentUser?.selectedDate === session.date) || (currentUser?.exam?.date === session.date);
                            const isMyExam = (currentUser?.examId === exam.firebaseId) || (currentUser?.exam?.firebaseId === exam.firebaseId);

                            return (
                              <div key={sIdx} className="mb-4">
                                <div className="flex items-center text-slate-700 font-black text-sm mb-3 bg-white py-2 px-4 rounded-xl border border-indigo-100 w-max">
                                  <Calendar className="w-5 h-5 mr-3 text-indigo-500"/> {session.date}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {session.slots && session.slots.map(s => {
                                    const isMySlot = isMyExam && isMyDate && ((currentUser?.selectedTime === s) || (currentUser?.slot === s));
                                    return (
                                      <span key={s} className={`font-black text-sm px-4 py-2 rounded-xl border-2 ${isMySlot ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-indigo-700 border-indigo-100'}`}>
                                        {s} {isMySlot && "(Senin)"}
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    }) : (
                      <div className="col-span-full text-center p-10 bg-slate-50 border-2 border-slate-200 rounded-3xl">
                        <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4"/>
                        <p className="font-bold text-slate-600 text-lg">Şu an bulunduğunuz bölgeye ait planlanmış bir sınav oturumu bulunmamaktadır.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

        </div>
      </section>
    </div>
  );
}

// ==========================================
// 2. KAYIT AKIŞI VE YENİ SINAV SEÇİMİ
// ==========================================
function RegistrationProcess({ navigateTo, currentUser, setCurrentUser, zones, exams }) {
  const [step, setStep] = useState(1); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const appId = typeof __app_id !== 'undefined' ? __app_id : 'odullu-sinav';
  
  const [formData, setFormData] = useState({
    fullName: '', phone: '', grade: '8', parentName: '',
    province: '', district: '', neighborhood: ''
  });

  const [matchedZone, setMatchedZone] = useState(null);
  const [availableExams, setAvailableExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null); 
  
  // Alternatif (Diğer Bölgelerdeki) Sınavlar Görünümü
  const [showAlternativeExams, setShowAlternativeExams] = useState(false);
  
  // Ödül Seçim State'leri
  const [selectedDegreePrize, setSelectedDegreePrize] = useState('');
  const [selectedParticipationPrize, setSelectedParticipationPrize] = useState('');

  useEffect(() => {
    if (currentUser && step === 1) {
      setFormData({
        fullName: currentUser.fullName || '',
        phone: currentUser.phone || '',
        grade: currentUser.grade || '8',
        parentName: currentUser.parentName || '',
        province: currentUser.province || '',
        district: currentUser.district || '',
        neighborhood: currentUser.neighborhood || ''
      });
      setStep(2);
    }
  }, [currentUser, step]);

  const handlePhoneInput = (e) => {
    let val = e.target.value.replace(/\D/g, ''); 
    if (val.length > 0 && val[0] !== '5') { val = '5' + val; }
    val = val.substring(0, 10);
    setFormData({ ...formData, phone: val });
  };

  const findZone = (district, neighborhood) => {
    if (neighborhood && (neighborhood.includes("Akarçeşme") || neighborhood.includes("Arapçeşme"))) {
      const spZone = zones.find(z => z.name === "Akarçeşme");
      if(spZone) return spZone;
    }
    return zones.find(z => z.districts.includes(district));
  };

  useEffect(() => {
    if (formData.district) {
      const zone = findZone(formData.district, formData.neighborhood);
      setMatchedZone(zone);
      setSelectedDegreePrize('');
      setSelectedParticipationPrize('');

      if (zone && zone.active) {
        const zoneExams = exams.filter(e => e.zoneId === zone.id);
        setAvailableExams(zoneExams);
      } else {
        setAvailableExams([]);
      }
      setSelectedExam(null);
      setSelectedSlot(null);
      setShowAlternativeExams(false);
    }
  }, [formData.district, formData.neighborhood, zones, exams]);

  const degreePrizesList = matchedZone?.prizes?.degree?.split(',').map(s=>s.trim()).filter(s=>s) || [];
  const partPrizesList = matchedZone?.prizes?.participation?.split(',').map(s=>s.trim()).filter(s=>s) || [];
  
  const needsDegreeSelection = degreePrizesList.length > 1;
  const needsPartSelection = partPrizesList.length > 1;

  const isFormValid = selectedSlot 
    && (!needsDegreeSelection || selectedDegreePrize !== '') 
    && (!needsPartSelection || selectedParticipationPrize !== '');

  // Sınav Seçmeden veya Sınavla Beraber Kayıt
  const handleComplete = async (withoutExam = false) => {
    setIsSubmitting(true);
    
    const finalDegreePrize = withoutExam ? '' : (selectedDegreePrize || (degreePrizesList.length === 1 ? degreePrizesList[0] : ''));
    const finalPartPrize = withoutExam ? '' : (selectedParticipationPrize || (partPrizesList.length === 1 ? partPrizesList[0] : ''));

    try {
      if (currentUser) {
        const updatedData = withoutExam ? {
          examId: null,
          examTitle: null,
          selectedDate: null,
          selectedTime: null,
          zone: matchedZone,
          isWaitingPool: true
        } : {
          examId: selectedExam.firebaseId || selectedExam.id,
          examTitle: selectedExam.title,
          selectedDate: selectedSlot.date,
          selectedTime: selectedSlot.time,
          zone: matchedZone, // Başka bölge seçtiyse o bölgeyi atamıyoruz, kendi bölgesini tutuyoruz ama seçtiği sınavı alıyoruz. (Daha detaylı yapılabilir)
          selectedDegreePrize: finalDegreePrize,
          selectedParticipationPrize: finalPartPrize,
          isWaitingPool: false
        };
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'students', currentUser.firebaseId), updatedData);
        setCurrentUser({ ...currentUser, ...updatedData });
      } else {
        const newStudent = withoutExam ? {
          ...formData,
          examId: null,
          examTitle: null,
          selectedDate: null,
          selectedTime: null,
          zone: matchedZone,
          isWaitingPool: true,
          pastExams: [], 
          registrationDate: new Date().toLocaleDateString('tr-TR'),
          createdAt: new Date().getTime()
        } : {
          ...formData,
          examId: selectedExam.firebaseId || selectedExam.id,
          examTitle: selectedExam.title,
          selectedDate: selectedSlot.date,
          selectedTime: selectedSlot.time,
          zone: matchedZone,
          selectedDegreePrize: finalDegreePrize,
          selectedParticipationPrize: finalPartPrize,
          isWaitingPool: false,
          pastExams: [], 
          registrationDate: new Date().toLocaleDateString('tr-TR'),
          createdAt: new Date().getTime()
        };
        const docRef = await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'students'), newStudent);
        setCurrentUser({ firebaseId: docRef.id, ...newStudent });
      }
      setStep(3); 
    } catch (error) {
      console.error("Kayıt Hatası: ", error);
      alert("İşlem sırasında bir hata oluştu. Lütfen bağlantınızı kontrol edin.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="flex items-center justify-center mb-12">
        <div className={`flex items-center ${step >= 1 ? 'text-indigo-600' : 'text-slate-400'}`}>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-xl ${step >= 1 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-200'}`}>1</div>
          <span className="ml-3 font-black text-lg hidden sm:block">Kişisel Bilgiler</span>
        </div>
        <div className={`w-20 h-1.5 mx-4 rounded-full ${step >= 2 ? 'bg-indigo-600 shadow-lg shadow-indigo-200' : 'bg-slate-200'}`}></div>
        <div className={`flex items-center ${step >= 2 ? 'text-indigo-600' : 'text-slate-400'}`}>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-xl ${step >= 2 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-200'}`}>2</div>
          <span className="ml-3 font-black text-lg hidden sm:block">Konum & Sınav</span>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 p-8 md:p-16">
        
        {step === 1 && (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
            <h2 className="text-4xl font-black text-slate-800 border-b-2 border-slate-100 pb-6">Öğrenci ve Veli Bilgileri</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-black text-slate-700 mb-3 uppercase tracking-wider">Öğrenci Ad Soyad</label>
                <input type="text" className="w-full border-2 border-slate-200 rounded-2xl px-5 py-4 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none transition text-xl font-bold text-slate-800" 
                  value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} placeholder="Örn: Ali Yılmaz"/>
              </div>
              <div>
                <label className="block text-sm font-black text-slate-700 mb-3 uppercase tracking-wider">Sınıfı</label>
                <select className="w-full border-2 border-slate-200 rounded-2xl px-5 py-4 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none transition text-xl font-bold text-slate-800"
                  value={formData.grade} onChange={e => setFormData({...formData, grade: e.target.value})}>
                  <option value="5">5. Sınıf Öğrencisi</option>
                  <option value="6">6. Sınıf Öğrencisi</option>
                  <option value="7">7. Sınıf Öğrencisi</option>
                  <option value="8">8. Sınıf Öğrencisi (LGS)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-black text-slate-700 mb-3 uppercase tracking-wider">Veli Ad Soyad</label>
                <input type="text" className="w-full border-2 border-slate-200 rounded-2xl px-5 py-4 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none transition text-xl font-bold text-slate-800" 
                  value={formData.parentName} onChange={e => setFormData({...formData, parentName: e.target.value})} placeholder="Örn: Ayşe Yılmaz"/>
              </div>
              <div>
                <label className="block text-sm font-black text-slate-700 mb-3 uppercase tracking-wider">İletişim Numarası (Doğrulama)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-5 text-slate-400 font-black text-xl">0</span>
                  <input type="tel" className="w-full border-2 border-slate-200 rounded-2xl pl-10 pr-5 py-4 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none transition text-xl font-black tracking-widest text-slate-800" 
                    value={formData.phone} onChange={handlePhoneInput} placeholder="5XX XXX XX XX"/>
                </div>
                {formData.phone.length > 0 && formData.phone.length < 10 && (
                  <p className="text-red-500 text-sm font-bold mt-2">Lütfen telefon numarasını 10 haneli giriniz.</p>
                )}
              </div>
            </div>
            <button 
              onClick={() => setStep(2)}
              disabled={!formData.fullName || formData.phone.length !== 10 || !formData.parentName}
              className="w-full bg-indigo-600 text-white font-black text-2xl py-6 rounded-2xl mt-8 hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition shadow-2xl shadow-indigo-500/30 flex justify-center items-center"
            >
              Devam Et: Konum Seçimi <ChevronRight className="ml-3 w-8 h-8"/>
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
            <h2 className="text-4xl font-black text-slate-800 border-b-2 border-slate-100 pb-6 flex items-center">
              <MapPin className="mr-4 w-10 h-10 text-indigo-600" /> Konum ve Sınav Seçimi
            </h2>
            
            <div className="bg-indigo-50/80 p-6 rounded-2xl border border-indigo-100 flex items-start">
              <AlertCircle className="text-indigo-600 w-8 h-8 mr-4 flex-shrink-0" />
              <p className="text-lg text-indigo-900 leading-relaxed font-medium">
                Sistemin size en yakın aktif sınavları sunabilmesi için konumunuzu doğru belirleyin. Seçiminize göre arka planda <b>Mıntıka Eşleşmesi</b> yapılacaktır.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-black text-slate-700 mb-3 uppercase tracking-wider">Yaşadığınız İl</label>
                <select className="w-full border-2 border-slate-200 rounded-2xl px-5 py-4 text-xl font-bold focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none transition"
                  value={formData.province} 
                  disabled={!!currentUser}
                  onChange={e => setFormData({...formData, province: e.target.value, district: '', neighborhood: ''})}>
                  <option value="">İl Seçiniz</option>
                  {Object.keys(LOCATIONS).map(prov => (
                    <option key={prov} value={prov}>{prov}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-black text-slate-700 mb-3 uppercase tracking-wider">Yaşadığınız İlçe</label>
                <select className="w-full border-2 border-slate-200 rounded-2xl px-5 py-4 text-xl font-bold focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none transition disabled:bg-slate-100 disabled:text-slate-400"
                  disabled={!formData.province || !!currentUser}
                  value={formData.district} 
                  onChange={e => setFormData({...formData, district: e.target.value, neighborhood: ''})}>
                  <option value="">Önce İl Seçiniz</option>
                  {formData.province && Object.keys(LOCATIONS[formData.province]).map(dist => (
                    <option key={dist} value={dist}>{dist}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-black text-slate-700 mb-3 uppercase tracking-wider">Mahalle</label>
                <select className="w-full border-2 border-slate-200 rounded-2xl px-5 py-4 text-xl font-bold focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none transition disabled:bg-slate-100 disabled:text-slate-400"
                  disabled={!formData.district || !!currentUser}
                  value={formData.neighborhood} 
                  onChange={e => setFormData({...formData, neighborhood: e.target.value})}>
                  <option value="">Önce İlçe Seçiniz</option>
                  {formData.district && LOCATIONS[formData.province][formData.district].map(hood => (
                    <option key={hood} value={hood}>{hood} Mah.</option>
                  ))}
                </select>
              </div>
            </div>

            {formData.district && formData.neighborhood && (
              <div className="mt-10 pt-10 border-t-2 border-slate-100">
                {matchedZone ? (
                  <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-inner">
                    <div>
                      <span className="text-sm font-black text-slate-500 uppercase tracking-widest">Sistemin Atadığı Bölge</span>
                      <h3 className="font-black text-3xl text-slate-900 mt-1">{matchedZone.name}</h3>
                    </div>
                    <span className={`mt-4 sm:mt-0 px-6 py-3 rounded-xl text-lg font-black shadow-sm ${matchedZone.active && availableExams.length > 0 ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                      {matchedZone.active && availableExams.length > 0 ? 'Sınav Kayıtlarına Açık' : 'Aktif Sınav Yok'}
                    </span>
                  </div>
                ) : (
                  <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-amber-50 p-6 rounded-2xl border border-amber-200 shadow-inner">
                    <div>
                      <span className="text-sm font-black text-amber-600 uppercase tracking-widest">Bölge Bilgisi</span>
                      <h3 className="font-black text-2xl text-amber-900 mt-1">Bu İlçe Henüz Bir Mıntıkaya Bağlı Değil</h3>
                    </div>
                  </div>
                )}

                {/* SINAVLARIN LİSTELENDİĞİ ALAN (KENDİ BÖLGESİ VEYA DİĞER BÖLGELER) */}
                {(!showAlternativeExams && matchedZone && matchedZone.active && availableExams.length > 0) ? (
                  <div className="space-y-6">
                    <p className="font-black text-slate-700 text-2xl mb-6">Lütfen uygun oturumunuzu seçin:</p>
                    <div className="grid gap-6">
                      {availableExams.map(exam => {
                        const examSessions = exam.sessions || (exam.date && exam.slots ? [{ date: exam.date, slots: exam.slots }] : []);
                        
                        return (
                          <div key={exam.firebaseId || exam.id} className={`border-4 rounded-3xl p-6 md:p-8 transition-all ${selectedExam?.firebaseId === exam.firebaseId ? 'border-indigo-600 bg-indigo-50 ring-4 ring-indigo-500/20 shadow-xl' : 'border-slate-100 bg-white hover:border-indigo-300 hover:shadow-md cursor-pointer'}`}
                              onClick={() => { setSelectedExam(exam); setSelectedSlot(null); }}>
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                              <h4 className="font-black text-3xl text-slate-800 mb-2 md:mb-0">{exam.title}</h4>
                            </div>
                            
                            <div className="space-y-6">
                              {examSessions.map((session, sIdx) => (
                                <div key={sIdx} className="pt-4 border-t-2 border-indigo-200/50">
                                  <span className="text-lg font-black text-slate-700 mb-4 flex items-center"><Calendar className="w-6 h-6 mr-3 text-indigo-500"/> {session.date} Tarihli Oturumlar:</span>
                                  <div className="flex flex-wrap gap-4 mt-4">
                                    {session.slots && session.slots.map(slot => {
                                      const isSelected = selectedExam?.firebaseId === exam.firebaseId && selectedSlot?.date === session.date && selectedSlot?.time === slot;
                                      return (
                                        <button key={slot} 
                                          onClick={(e) => { 
                                            e.stopPropagation(); 
                                            setSelectedExam(exam); 
                                            setSelectedSlot({ date: session.date, time: slot }); 
                                          }}
                                          className={`px-8 py-4 rounded-2xl text-xl font-black border-4 transition-all ${isSelected ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl scale-105' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-indigo-400'}`}>
                                          <Clock className="w-5 h-5 inline mr-2 opacity-70" /> {slot}
                                        </button>
                                      )
                                    })}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {selectedSlot && (needsDegreeSelection || needsPartSelection) && (
                       <div className="mt-10 pt-10 border-t-4 border-slate-100 animate-in fade-in slide-in-from-bottom-4">
                         <h4 className="text-2xl font-black text-slate-800 mb-6 flex items-center"><Gift className="w-8 h-8 mr-3 text-indigo-600"/> Hedef ve Ödül Tercihlerinizi Belirleyin</h4>
                         
                         {needsDegreeSelection && (
                           <div className="mb-8 bg-indigo-50/50 p-6 rounded-3xl border-2 border-indigo-100">
                             <label className="block text-sm font-black text-indigo-600 uppercase tracking-widest mb-4">Hedeflediğiniz Derece Ödülü</label>
                             <div className="flex flex-wrap gap-3">
                               {degreePrizesList.map(prize => (
                                 <button key={prize} onClick={() => setSelectedDegreePrize(prize)}
                                    className={`px-6 py-4 rounded-2xl border-4 font-black transition-all ${selectedDegreePrize === prize ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'}`}>
                                    {prize}
                                 </button>
                               ))}
                             </div>
                           </div>
                         )}

                         {needsPartSelection && (
                           <div className="mb-8 bg-indigo-50/50 p-6 rounded-3xl border-2 border-indigo-100">
                             <label className="block text-sm font-black text-indigo-600 uppercase tracking-widest mb-4">İstediğiniz Katılım Ödülü</label>
                             <div className="flex flex-wrap gap-3">
                               {partPrizesList.map(prize => (
                                 <button key={prize} onClick={() => setSelectedParticipationPrize(prize)}
                                    className={`px-6 py-4 rounded-2xl border-4 font-black transition-all ${selectedParticipationPrize === prize ? 'bg-green-600 border-green-600 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-600 hover:border-green-300'}`}>
                                    {prize}
                                 </button>
                               ))}
                             </div>
                           </div>
                         )}
                       </div>
                    )}
                    
                    <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 mt-12 pt-8 border-t-2 border-slate-100">
                      {!currentUser && <button onClick={() => setStep(1)} disabled={isSubmitting} className="w-full sm:w-1/3 bg-slate-100 text-slate-700 font-black py-6 rounded-2xl hover:bg-slate-200 transition text-xl disabled:opacity-50">Geri Dön</button>}
                      <button 
                        onClick={() => handleComplete(false)}
                        disabled={!isFormValid || isSubmitting}
                        className="w-full bg-green-500 text-white font-black py-6 rounded-2xl hover:bg-green-600 disabled:opacity-50 disabled:hover:bg-green-500 transition flex justify-center items-center text-xl shadow-2xl shadow-green-500/40"
                      >
                        {isSubmitting ? "Sisteme Kaydediliyor..." : "Kaydı Tamamla"} {!isSubmitting && <CheckCircle2 className="ml-3 w-8 h-8"/>}
                      </button>
                    </div>
                  </div>

                ) : showAlternativeExams ? (
                  
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-8">
                    <p className="font-black text-slate-700 text-2xl mb-6">Size En Yakın Alternatif Sınav Merkezleri:</p>
                    {exams.length > 0 ? (
                      <div className="grid gap-6">
                        {exams.map((exam, idx) => {
                          const examSessions = exam.sessions || (exam.date && exam.slots ? [{ date: exam.date, slots: exam.slots }] : []);
                          // Basit mock mesafe (10km ile 45km arası rastgele gibi ama indexe bağlı)
                          const mockDistance = 10 + (idx * 5) + (exam.zoneId * 2);

                          return (
                            <div key={exam.firebaseId || exam.id} className={`border-4 rounded-3xl p-6 md:p-8 transition-all ${selectedExam?.firebaseId === exam.firebaseId ? 'border-indigo-600 bg-indigo-50 ring-4 ring-indigo-500/20 shadow-xl' : 'border-slate-100 bg-white hover:border-indigo-300 hover:shadow-md cursor-pointer'}`}
                                onClick={() => { setSelectedExam(exam); setSelectedSlot(null); }}>
                              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                                <div>
                                  <div className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-1">{zones.find(z => z.id === exam.zoneId)?.name || 'Bölge'}</div>
                                  <h4 className="font-black text-3xl text-slate-800 mb-2 md:mb-0">{exam.title}</h4>
                                </div>
                                <span className="flex items-center text-sm font-black text-slate-500 bg-slate-100 px-4 py-2 rounded-xl border border-slate-200"><MapPin className="w-4 h-4 mr-2"/> Tahmini {mockDistance} km uzakta</span>
                              </div>
                              
                              <div className="space-y-6">
                                {examSessions.map((session, sIdx) => (
                                  <div key={sIdx} className="pt-4 border-t-2 border-indigo-200/50">
                                    <span className="text-lg font-black text-slate-700 mb-4 flex items-center"><Calendar className="w-6 h-6 mr-3 text-indigo-500"/> {session.date} Tarihli Oturumlar:</span>
                                    <div className="flex flex-wrap gap-4 mt-4">
                                      {session.slots && session.slots.map(slot => {
                                        const isSelected = selectedExam?.firebaseId === exam.firebaseId && selectedSlot?.date === session.date && selectedSlot?.time === slot;
                                        return (
                                          <button key={slot} 
                                            onClick={(e) => { 
                                              e.stopPropagation(); 
                                              setSelectedExam(exam); 
                                              setSelectedSlot({ date: session.date, time: slot }); 
                                            }}
                                            className={`px-8 py-4 rounded-2xl text-xl font-black border-4 transition-all ${isSelected ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl scale-105' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-indigo-400'}`}>
                                            <Clock className="w-5 h-5 inline mr-2 opacity-70" /> {slot}
                                          </button>
                                        )
                                      })}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="bg-slate-50 border-4 border-slate-200 rounded-3xl p-8 text-center text-slate-500 font-bold text-lg">
                        Şu an hiçbir bölgede planlanmış aktif sınav bulunmamaktadır.
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 mt-12 pt-8 border-t-2 border-slate-100">
                      <button onClick={() => setShowAlternativeExams(false)} disabled={isSubmitting} className="w-full sm:w-1/3 bg-slate-100 text-slate-700 font-black py-6 rounded-2xl hover:bg-slate-200 transition text-xl disabled:opacity-50">Vazgeç</button>
                      <button 
                        onClick={() => handleComplete(false)} // Sınavlı kayıt (Eğer seçtiyse)
                        disabled={!selectedSlot && !isSubmitting}
                        className="w-full bg-green-500 text-white font-black py-6 rounded-2xl hover:bg-green-600 disabled:opacity-50 transition flex justify-center items-center text-xl shadow-2xl shadow-green-500/40"
                      >
                        {selectedSlot ? "Seçtiğim Sınavla Kaydı Tamamla" : "Sınav Seçmediniz"}
                      </button>
                      <button 
                        onClick={() => handleComplete(true)} // Sınavsız kayıt
                        disabled={isSubmitting}
                        className="w-full bg-indigo-600 text-white font-black py-6 rounded-2xl hover:bg-indigo-700 disabled:opacity-50 transition flex justify-center items-center text-xl shadow-2xl shadow-indigo-500/40"
                      >
                        Sınav Seçmeden Sadece Profil Oluştur
                      </button>
                    </div>
                  </div>

                ) : (
                  
                  <div className="bg-amber-50 border-4 border-amber-200 rounded-3xl p-10 text-center shadow-lg">
                    <AlertCircle className="w-20 h-20 text-amber-500 mx-auto mb-6" />
                    <h4 className="font-black text-amber-900 text-3xl mb-4">Bölgenizde Açık Sınav Yok</h4>
                    <p className="text-amber-800 text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
                      Şu an <b>{matchedZone ? matchedZone.name : "seçtiğiniz konuma ait"}</b> bölgede planlanmış aktif bir sınav bulunmamaktadır. Aşağıdan en yakın aktif sınav yerlerimizi inceleyebilir veya bekleme havuzuna kayıt olabilirsiniz.
                    </p>
                    <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 justify-center">
                      <button onClick={() => handleComplete(true)} disabled={isSubmitting} className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white font-black py-5 px-8 rounded-2xl text-xl transition shadow-xl shadow-amber-500/40 disabled:opacity-50">
                        {isSubmitting ? "Kaydediliyor..." : "Daha Sonra Haber Ver (Sınavsız Kayıt)"}
                      </button>
                      <button onClick={() => setShowAlternativeExams(true)} className="w-full sm:w-auto bg-white border-4 border-amber-300 text-amber-700 hover:bg-amber-100 font-black py-5 px-8 rounded-2xl text-xl transition shadow-lg">
                        En Yakın Aktif Sınav Yerimiz
                      </button>
                    </div>
                  </div>
                  
                )}
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="text-center py-20 animate-in zoom-in-95 duration-500">
            <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-10 shadow-[0_0_0_15px_rgba(34,197,94,0.1)]">
              <CheckCircle2 className="w-20 h-20 text-green-600" />
            </div>
            <h2 className="text-5xl font-black text-slate-900 mb-6">Harika, Kaydınız Onaylandı!</h2>
            <p className="text-slate-600 text-2xl mb-12 max-w-2xl mx-auto leading-relaxed">
              Sistemdeki profiliniz başarıyla oluşturuldu. Eğer bir sınava kayıt olduysanız bilgileriniz iletişim numaranıza SMS olarak gönderilecektir.
            </p>
            <button 
              onClick={() => navigateTo('profile')}
              className="bg-indigo-600 text-white font-black text-2xl py-6 px-12 rounded-3xl hover:bg-indigo-700 transition shadow-2xl shadow-indigo-500/40"
            >
              Öğrenci Paneline Git
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 3. ÖĞRENCİ PANELİ
// ==========================================
function StudentProfile({ currentUser, exams, navigateTo }) {
  if (!currentUser) return <div className="text-center py-32 text-2xl font-black text-slate-500">Lütfen önce giriş yapın veya kayıt oluşturun.</div>;

  const hasActiveExam = !!(currentUser.examId || currentUser.examTitle || currentUser.exam);
  const pastExams = currentUser.pastExams || [];
  const neighborhoodDetails = getNeighborhoodDetails(currentUser.zone, currentUser.neighborhood);

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="flex flex-col lg:flex-row gap-10">
        
        {/* SOL: Profil Kartı */}
        <div className="w-full lg:w-1/3 space-y-8">
          <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden relative">
            <div className="bg-gradient-to-br from-indigo-700 to-indigo-950 h-40 relative">
              <div className="absolute -bottom-16 left-10 w-32 h-32 bg-white rounded-full border-8 border-white flex items-center justify-center text-5xl font-black text-indigo-600 shadow-2xl">
                {currentUser?.fullName?.charAt(0) || "Ö"}
              </div>
            </div>
            <div className="pt-24 pb-10 px-10">
              <h2 className="text-3xl font-black text-slate-900 mb-2">{currentUser?.fullName}</h2>
              <p className="text-indigo-600 font-black text-lg mb-8">{currentUser?.grade}. Sınıf Öğrencisi</p>
              
              <div className="space-y-5 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <div className="flex justify-between items-center text-base border-b border-slate-200 pb-4">
                  <span className="text-slate-500 font-bold uppercase tracking-wider text-xs">Kayıt No</span>
                  <span className="font-mono font-black text-indigo-800">{currentUser?.id?.toUpperCase()}</span>
                </div>
                <div className="flex justify-between items-center text-base border-b border-slate-200 pb-4">
                  <span className="text-slate-500 font-bold uppercase tracking-wider text-xs">Telefon</span>
                  <span className="font-black text-slate-800">0{currentUser?.phone}</span>
                </div>
                <div className="flex justify-between items-center text-base">
                  <span className="text-slate-500 font-bold uppercase tracking-wider text-xs">Konum</span>
                  <span className="font-black text-slate-800 text-right max-w-[150px] truncate">{currentUser?.district}</span>
                </div>
              </div>

              {hasActiveExam && (
                <div className="mt-8 bg-amber-50 border-2 border-amber-200 rounded-2xl p-5 flex items-start">
                  <Lock className="text-amber-500 w-6 h-6 mr-3 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-900 font-bold leading-relaxed">
                    Aktif bir sınav başvurunuz olduğu için telefon ve adres bilgileriniz kilitlenmiştir.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SAĞ: Aktif Sınav Bilgileri & Geçmiş Sonuçlar */}
        <div className="w-full lg:w-2/3 space-y-10">
          
          {hasActiveExam ? (
            <div className="bg-gradient-to-r from-indigo-600 to-blue-700 rounded-[3rem] p-10 md:p-12 text-white relative overflow-hidden shadow-2xl shadow-indigo-500/30">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full -mr-20 -mt-20 z-0 pointer-events-none"></div>
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 relative z-10">
                <div>
                  <div className="bg-white/20 backdrop-blur-md inline-block px-4 py-2 rounded-xl text-sm font-black uppercase tracking-widest mb-4 border border-white/30">
                    ONAYLANAN OTURUMUNUZ
                  </div>
                  <h4 className="text-4xl font-black leading-tight">{currentUser?.examTitle || currentUser?.exam?.title}</h4>
                </div>
                <div className="mt-4 md:mt-0 bg-green-500 text-white px-6 py-3 rounded-2xl text-lg font-black shadow-lg shadow-green-500/40 flex items-center border border-green-400">
                  <Check className="w-6 h-6 mr-2"/> ONAYLI
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-10 relative z-10 bg-indigo-900/40 p-8 rounded-3xl border border-indigo-400/30 backdrop-blur-sm">
                <div>
                  <div className="text-indigo-200 text-sm font-bold mb-2 uppercase tracking-wider">Tarih</div>
                  <div className="font-black text-2xl flex items-center"><Calendar className="w-6 h-6 mr-2 opacity-80"/> {currentUser?.selectedDate || currentUser?.exam?.date}</div>
                </div>
                <div>
                  <div className="text-indigo-200 text-sm font-bold mb-2 uppercase tracking-wider">Seans</div>
                  <div className="font-black text-2xl flex items-center"><Clock className="w-6 h-6 mr-2 opacity-80"/> {currentUser?.selectedTime || currentUser?.slot}</div>
                </div>
                <div className="col-span-2 md:col-span-3 mt-4">
                  <div className="text-indigo-200 text-sm font-bold mb-2 uppercase tracking-wider">Sınav Merkezi Adresi ve İletişim</div>
                  <div className="font-bold text-lg flex items-start mb-4">
                    <MapPin className="w-6 h-6 mr-3 opacity-80 flex-shrink-0 mt-1 text-indigo-300"/> 
                    <div>
                      {neighborhoodDetails.center}
                      <div className="text-sm font-medium text-indigo-100 mt-2 leading-relaxed">{neighborhoodDetails.address || "Açık adres bilgisi girilmemiş."}</div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 mt-6">
                      {neighborhoodDetails.mapLink && (
                          <a href={neighborhoodDetails.mapLink} target="_blank" rel="noreferrer" className="flex items-center justify-center text-sm font-black bg-indigo-500/50 px-5 py-3 rounded-xl hover:bg-indigo-400 transition border border-indigo-400/50">
                              <Map className="w-5 h-5 mr-2"/> Haritada Konumu Aç
                          </a>
                      )}
                      <a href={`tel:${neighborhoodDetails.phone}`} className="flex items-center justify-center text-sm font-black bg-indigo-500/50 px-5 py-3 rounded-xl hover:bg-indigo-400 transition border border-indigo-400/50">
                          <Phone className="w-5 h-5 mr-2"/> {neighborhoodDetails.phone}
                      </a>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-center relative z-10 gap-6 mt-10">
                <span className="text-base font-bold text-indigo-100 bg-indigo-950/40 px-6 py-4 rounded-2xl border border-indigo-800/50">Lütfen sınavdan 30 dakika önce merkezde olunuz.</span>
                <button className="w-full sm:w-auto bg-white text-indigo-700 px-8 py-4 rounded-2xl text-lg font-black shadow-2xl hover:bg-indigo-50 hover:scale-105 transition flex items-center justify-center">
                  <FileText className="w-6 h-6 mr-3"/> Giriş Belgesi İndir
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white border-4 border-indigo-100 rounded-[3rem] p-12 text-center shadow-xl shadow-indigo-100/50">
              <Award className="w-24 h-24 text-indigo-300 mx-auto mb-6" />
              <h3 className="text-3xl font-black text-slate-800 mb-4">Şu an aktif bir sınavınız yok.</h3>
              <p className="text-lg text-slate-600 mb-8 font-medium">Önceki sınavlarınızın sonuçlarını aşağıdan inceleyebilir, bölgenizde açılan yeni sınavlara hemen başvurabilirsiniz.</p>
              <button 
                onClick={() => navigateTo('register')} 
                className="bg-indigo-600 text-white font-black text-xl py-5 px-10 rounded-2xl hover:bg-indigo-700 transition shadow-xl shadow-indigo-500/30"
              >
                Yeni Bir Sınava Başvur
              </button>
            </div>
          )}

          {/* GEÇMİŞ SINAVLAR VE SONUÇLAR */}
          {pastExams.length > 0 && (
            <div className="mt-12">
              <div className="flex items-center mb-8">
                <Trophy className="w-10 h-10 text-yellow-500 mr-4" />
                <h3 className="text-3xl font-black text-slate-900">Geçmiş Sınav Sonuçların</h3>
              </div>
              <div className="space-y-6">
                {pastExams.map((past, idx) => (
                  <div key={idx} className="bg-white rounded-3xl shadow-lg border border-slate-100 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                      <h4 className="text-2xl font-black text-slate-800 mb-2">{past.title}</h4>
                      <p className="text-slate-500 font-bold flex items-center">
                        <Calendar className="w-5 h-5 mr-2 text-indigo-400"/> {past.date} - {past.time} Oturumu
                      </p>
                    </div>
                    <div className="flex gap-4">
                      <div className="bg-indigo-50 border-2 border-indigo-100 px-6 py-4 rounded-2xl text-center">
                        <div className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-1">Puanın</div>
                        <div className="text-3xl font-black text-indigo-700">{past.score}</div>
                      </div>
                      <div className="bg-yellow-50 border-2 border-yellow-200 px-6 py-4 rounded-2xl text-center">
                        <div className="text-xs font-black text-yellow-500 uppercase tracking-widest mb-1">Derecen</div>
                        <div className="text-3xl font-black text-yellow-600">{past.rank}.</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// ==========================================
// 4. ADMIN PANELİ
// ==========================================
function AdminPanel({ students, adminZoneId, onLogout, zones, exams }) {
  const [activeTab, setActiveTab] = useState('ayarlar'); 
  const appId = typeof __app_id !== 'undefined' ? __app_id : 'odullu-sinav';
  
  const adminZoneData = zones.find(z => z.id === adminZoneId);
  const filteredStudents = students.filter(s => s.zone?.id === adminZoneId);
  const filteredExams = exams.filter(e => e.zoneId === adminZoneId);

  const [localPrizes, setLocalPrizes] = useState({grand: '', degree: '', participation: ''});
  const [examData, setExamData] = useState({ title: '' });
  const [examSessions, setExamSessions] = useState([{ date: '', times: '' }]);
  const [mappingData, setMappingData] = useState({ district: '', neighborhood: '', center: '', address: '', mapLink: '', phone: '' });

  const [resultModal, setResultModal] = useState({ isOpen: false, student: null, score: '', rank: '' });

  useEffect(() => {
    if(adminZoneData) {
      setLocalPrizes({
        grand: adminZoneData.prizes?.grand || '',
        degree: adminZoneData.prizes?.degree || '',
        participation: adminZoneData.prizes?.participation || ''
      });
    }
  }, [adminZoneData]);

  if (!adminZoneData) return <div>Erişim Hatası.</div>;

  const handleUpdatePrizes = async () => {
    if (localPrizes.grand.includes(',')) {
      alert("Büyük Ödül tek bir tane olmalıdır! Lütfen araya virgül koymayın.");
      return;
    }
    try {
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'zones', adminZoneId.toString()), { prizes: localPrizes });
      alert("Ödüller başarıyla güncellendi!");
    } catch (e) {
      console.error(e);
      alert("Hata oluştu!");
    }
  };

  const handleAddSessionRow = () => setExamSessions([...examSessions, { date: '', times: '' }]);
  const handleSessionChange = (index, field, value) => {
    const newSessions = [...examSessions];
    newSessions[index][field] = value;
    setExamSessions(newSessions);
  };
  const handleRemoveSessionRow = (index) => {
    const newSessions = examSessions.filter((_, i) => i !== index);
    setExamSessions(newSessions.length > 0 ? newSessions : [{ date: '', times: '' }]);
  };

  const handleAddExam = async () => {
    if(!examData.title) return alert("Sınav Adı boş bırakılamaz.");
    const formattedSessions = examSessions
      .filter(s => s.date && s.times)
      .map(s => ({
        date: s.date,
        slots: s.times.split(',').map(t => t.trim()).filter(t => t) 
      }));

    if(formattedSessions.length === 0) return alert("Lütfen en az bir geçerli tarih ve saat girin.");

    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'exams'), {
        zoneId: adminZoneId,
        title: examData.title,
        sessions: formattedSessions,
        createdAt: new Date().getTime()
      });
      alert("Sınav oturumları başarıyla eklendi!");
      setExamData({ title: '' });
      setExamSessions([{ date: '', times: '' }]);
    } catch (e) {
      console.error(e);
      alert("Bir hata oluştu");
    }
  };

  const handleAddMapping = async () => {
    if(!mappingData.neighborhood || !mappingData.center) return alert("Mahalle ve Kurum adı zorunludur.");
    try {
      const newMappings = [...(adminZoneData.mappings || [])];
      const existingIndex = newMappings.findIndex(m => m.neighborhoods.includes(mappingData.neighborhood));
      
      const newMapObj = {
        neighborhoods: [mappingData.neighborhood],
        center: mappingData.center,
        address: mappingData.address || "",
        mapLink: mappingData.mapLink || "",
        phone: mappingData.phone || "0850 123 45 67"
      };

      if (existingIndex >= 0) {
        newMappings[existingIndex] = newMapObj;
      } else {
        newMappings.push(newMapObj);
      }
      
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'zones', adminZoneId.toString()), { mappings: newMappings });
      alert(`${mappingData.neighborhood} mahallesi başarıyla eşleştirildi!`);
      setMappingData({ district: '', neighborhood: '', center: '', address: '', mapLink: '', phone: '' });
    } catch (e) {
      console.error(e);
      alert("Bir hata oluştu");
    }
  };

  const handleSaveResult = async () => {
    const student = resultModal.student;
    const pastExam = {
        id: student.examId || student.exam?.firebaseId,
        title: student.examTitle || student.exam?.title,
        date: student.selectedDate || student.exam?.date,
        time: student.selectedTime || student.slot,
        score: resultModal.score,
        rank: resultModal.rank
    };
    
    const pastExams = [...(student.pastExams || []), pastExam];

    try {
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'students', student.firebaseId), {
          pastExams: pastExams,
          examId: null,
          examTitle: null,
          selectedDate: null,
          selectedTime: null,
          exam: null, 
          slot: null,
          selectedDegreePrize: null,
          selectedParticipationPrize: null
      });
      setResultModal({ isOpen: false, student: null, score: '', rank: '' });
      alert("Sonuç başarıyla kaydedildi! Sınav öğrencinin geçmiş sonuçlarına taşındı.");
    } catch (err) {
      console.error("Sonuç girerken hata:", err);
      alert("Sonuç kaydedilemedi.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 relative">
      <div className="mb-10 border-b-2 border-slate-100 pb-6 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <div className="inline-flex items-center px-4 py-1.5 rounded-lg bg-indigo-100 text-indigo-800 text-sm font-black mb-3 uppercase tracking-wider">
            {adminZoneData.name} Yönetimi
          </div>
          <h1 className="text-4xl font-black text-slate-900">Mıntıka Paneli</h1>
          <p className="text-slate-500 mt-2 font-bold text-lg">Bölgenize ait ayarlar, sınav planlaması ve kayıtlı öğrenciler.</p>
        </div>
        <button onClick={onLogout} className="flex items-center text-red-600 bg-red-50 hover:bg-red-100 px-5 py-2.5 rounded-xl font-bold transition">
          <LogOut className="w-5 h-5 mr-2"/> Güvenli Çıkış
        </button>
      </div>

      <div className="flex space-x-4 mb-10">
        <button onClick={() => setActiveTab('ayarlar')} className={`px-8 py-4 rounded-2xl font-black transition-all text-lg ${activeTab === 'ayarlar' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' : 'bg-white text-slate-600 border-2 border-slate-200 hover:bg-slate-50'}`}>
          <Settings className="w-6 h-6 inline mr-3"/> Sınav & Ödül Ayarları
        </button>
        <button onClick={() => setActiveTab('ogrenci')} className={`px-8 py-4 rounded-2xl font-black transition-all text-lg ${activeTab === 'ogrenci' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' : 'bg-white text-slate-600 border-2 border-slate-200 hover:bg-slate-50'}`}>
          <Users className="w-6 h-6 inline mr-3"/> Öğrenci Listesi ({filteredStudents.length})
        </button>
      </div>

      {activeTab === 'ayarlar' && (
        <div className="bg-white rounded-[3rem] shadow-xl border-4 border-slate-100 p-8 md:p-12">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 border-b-2 border-slate-100 pb-8 gap-4">
            <div>
              <h3 className="font-black text-3xl text-slate-900 mb-2">{adminZoneData.name}</h3>
              <p className="text-base font-bold text-slate-500">Sorumlu Olduğunuz İlçeler: {adminZoneData.districts.join(', ')}</p>
            </div>
            <span className={`px-6 py-3 rounded-xl text-lg font-black ${adminZoneData.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {adminZoneData.active ? 'Sistem Kayıtlara Açık' : 'Sistem Kapalı'}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* SOL KOLON */}
            <div className="space-y-10">
              
              <div>
                <div className="text-sm font-black text-indigo-600 uppercase mb-4 tracking-wider flex items-center"><Gift className="w-6 h-6 mr-2"/> Bölge Ödüllerini Yönet</div>
                <div className="space-y-4 bg-slate-50 p-6 rounded-3xl border-2 border-slate-100">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">Büyük Ödül (Sadece Tek Seçenek)</label>
                    <input type="text" value={localPrizes.grand} onChange={e=>setLocalPrizes({...localPrizes, grand: e.target.value})} className="w-full text-base font-bold p-4 rounded-xl border border-slate-200 outline-none focus:border-indigo-500" placeholder="Belirlenmedi"/>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">Derece Ödülleri (Virgül ile Ayırın)</label>
                    <input type="text" value={localPrizes.degree} onChange={e=>setLocalPrizes({...localPrizes, degree: e.target.value})} className="w-full text-base font-bold p-4 rounded-xl border border-slate-200 outline-none focus:border-indigo-500" placeholder="Örn: Tablet, Bisiklet"/>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">Katılım Ödülleri (Virgül ile Ayırın)</label>
                    <input type="text" value={localPrizes.participation} onChange={e=>setLocalPrizes({...localPrizes, participation: e.target.value})} className="w-full text-base font-bold p-4 rounded-xl border border-slate-200 outline-none focus:border-indigo-500" placeholder="Örn: Kol Saati, Bileklik, Oyuncak"/>
                  </div>
                  <button onClick={handleUpdatePrizes} className="bg-slate-800 hover:bg-slate-900 text-white text-base font-black py-4 px-4 rounded-xl transition w-full shadow-lg">Ödülleri Güncelle</button>
                </div>
              </div>

              <div>
                <div className="text-sm font-black text-indigo-600 uppercase mb-4 tracking-wider flex items-center"><Calendar className="w-6 h-6 mr-2"/> Yeni Sınav Oturumu Planla</div>
                <div className="space-y-4 bg-slate-50 p-6 rounded-3xl border-2 border-slate-100">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">Sınav Adı (Etkinlik Adı)</label>
                    <input type="text" value={examData.title} onChange={e=>setExamData({title:e.target.value})} className="w-full text-base font-bold p-4 rounded-xl border border-slate-200 outline-none focus:border-indigo-500" placeholder="Örn: 1. Dönem LGS Provası"/>
                  </div>
                  
                  <div className="pt-2 border-t-2 border-slate-200">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-3 block">Tarih ve Saatler (Çoklu Eklenebilir)</label>
                    {examSessions.map((session, idx) => (
                      <div key={idx} className="flex gap-3 mb-3 items-center">
                        <input type="date" value={session.date} onChange={e=>handleSessionChange(idx, 'date', e.target.value)} className="w-2/5 text-sm font-bold p-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"/>
                        <input type="text" value={session.times} onChange={e=>handleSessionChange(idx, 'times', e.target.value)} className="w-3/5 text-sm font-bold p-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500" placeholder="Saatler (Örn: 10:00, 12:00)"/>
                        {idx > 0 && (
                           <button onClick={() => handleRemoveSessionRow(idx)} className="p-3 text-red-500 hover:bg-red-50 rounded-xl"><Trash2 className="w-5 h-5"/></button>
                        )}
                      </div>
                    ))}
                    <button onClick={handleAddSessionRow} className="text-sm font-black text-indigo-600 mt-2 hover:underline flex items-center"><Plus className="w-4 h-4 mr-1"/> Başka Bir Tarih Ekle</button>
                  </div>
                  
                  <button onClick={handleAddExam} className="bg-indigo-600 hover:bg-indigo-700 text-white text-base font-black py-4 px-4 rounded-xl transition w-full shadow-md shadow-indigo-200 flex items-center justify-center mt-6">
                    <CheckCircle2 className="w-5 h-5 mr-2"/> Oturumları Toplu Ekle
                  </button>
                </div>
              </div>
            </div>

            {/* SAĞ KOLON */}
            <div className="space-y-10">
              <div>
                <div className="text-sm font-black text-indigo-600 uppercase mb-4 tracking-wider flex items-center"><MapPin className="w-6 h-6 mr-2"/> Sınav Yeri & İletişim Atama</div>
                <div className="space-y-4 bg-indigo-50/50 p-6 rounded-3xl border-2 border-indigo-100">
                  
                  <select 
                    className="w-full text-base font-bold p-4 rounded-xl border border-indigo-200 outline-none focus:border-indigo-500 bg-white"
                    value={mappingData.district}
                    onChange={e => setMappingData({...mappingData, district: e.target.value, neighborhood: ''})}>
                    <option value="">Önce İlçe Seçin</option>
                    {adminZoneData.districts.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>

                  <select 
                    className="w-full text-base font-bold p-4 rounded-xl border border-indigo-200 outline-none focus:border-indigo-500 bg-white disabled:opacity-50"
                    disabled={!mappingData.district}
                    value={mappingData.neighborhood}
                    onChange={e => setMappingData({...mappingData, neighborhood: e.target.value})}>
                    <option value="">Atanacak Mahalleyi Seçin</option>
                    {mappingData.district && Object.keys(LOCATIONS).flatMap(p => LOCATIONS[p][mappingData.district] ? LOCATIONS[p][mappingData.district] : []).map(hood => (
                       <option key={hood} value={hood}>{hood} Mah.</option>
                    ))}
                  </select>

                  <input type="text" value={mappingData.center} onChange={e=>setMappingData({...mappingData, center: e.target.value})} className="w-full text-base font-bold p-4 rounded-xl border border-indigo-200 outline-none focus:border-indigo-500 bg-white" placeholder="Sınav Merkezi Kurum Adı"/>
                  <textarea rows="2" value={mappingData.address} onChange={e=>setMappingData({...mappingData, address: e.target.value})} className="w-full text-base font-bold p-4 rounded-xl border border-indigo-200 outline-none focus:border-indigo-500 bg-white resize-none" placeholder="Sınav Merkezi Açık Adresi"/>
                  <input type="text" value={mappingData.mapLink} onChange={e=>setMappingData({...mappingData, mapLink: e.target.value})} className="w-full text-base font-bold p-4 rounded-xl border border-indigo-200 outline-none focus:border-indigo-500 bg-white" placeholder="Google Maps Harita Linki (İsteğe Bağlı)"/>
                  <input type="tel" value={mappingData.phone} onChange={e=>setMappingData({...mappingData, phone: e.target.value})} className="w-full text-base font-bold p-4 rounded-xl border border-indigo-200 outline-none focus:border-indigo-500 bg-white" placeholder="Sorumlu İletişim Numarası"/>
                  
                  <button onClick={handleAddMapping} className="bg-emerald-500 hover:bg-emerald-600 text-white text-base font-black py-4 px-4 rounded-xl transition w-full shadow-md shadow-emerald-200">Mahalle Eşleştirmesini Kaydet</button>
                </div>
              </div>

              <div>
                 <div className="text-sm font-black text-indigo-600 uppercase mb-4 tracking-wider">Planlanmış Aktif Sınavlar</div>
                 <div className="space-y-4">
                    {filteredExams.length > 0 ? filteredExams.map(exam => {
                      const examSessions = exam.sessions || (exam.date && exam.slots ? [{ date: exam.date, slots: exam.slots }] : []);
                      return (
                        <div key={exam.firebaseId} className="bg-indigo-50 border-2 border-indigo-100 p-5 rounded-2xl">
                          <h4 className="font-black text-lg text-indigo-900 mb-3">{exam.title}</h4>
                          <div className="space-y-2">
                            {examSessions.map((session, idx) => (
                              <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-2">
                                <span className="bg-white px-3 py-1.5 rounded-xl border border-indigo-200 text-sm font-bold text-slate-700 w-max"><Calendar className="inline w-4 h-4 mr-1 text-indigo-500"/> {session.date}</span>
                                <div className="flex gap-2">
                                  {session.slots && session.slots.map(s => <span key={s} className="bg-indigo-600 text-white px-2 py-1 text-xs font-black rounded-lg">{s}</span>)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }) : (
                      <div className="font-bold bg-slate-50 p-5 rounded-2xl border-2 border-slate-100 text-center text-slate-400">Bu mıntıkaya atanmış aktif sınav yok.</div>
                    )}
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'ogrenci' && (
        <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 p-10 overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <h2 className="text-3xl font-black text-slate-800">Bölge Kayıtları ({filteredStudents.length})</h2>
            <div className="flex flex-wrap gap-3">
              <button className="bg-green-50 font-black px-6 py-3 rounded-2xl text-green-700 border-2 border-green-200 hover:bg-green-100 transition">Excel İndir</button>
              <button 
                onClick={() => alert("Mesajpaneli.com API'si henüz bağlı değil. Gerçek SMS entegrasyonu backend aşamasında yapılacak.")}
                className="bg-indigo-600 font-black px-6 py-3 rounded-2xl text-white hover:bg-indigo-700 flex items-center shadow-xl shadow-indigo-200 transition">
                <MessageSquare className="w-5 h-5 mr-3"/> Bölgeye Toplu SMS
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-3xl border-2 border-slate-100">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-sm uppercase tracking-widest border-b-2 border-slate-100">
                  <th className="p-6 font-black">Öğrenci Adı</th>
                  <th className="p-6 font-black">Konum (İlçe/Mah)</th>
                  <th className="p-6 font-black">Aktif Sınav & Merkez</th>
                  <th className="p-6 font-black">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-slate-50">
                {filteredStudents.length === 0 ? (
                  <tr><td colSpan="4" className="p-16 text-center text-slate-400 font-bold text-lg">Mıntıkamıza ait henüz kayıtlı öğrenci bulunmuyor.</td></tr>
                ) : (
                  filteredStudents.map(student => {
                    const hasActiveExam = !!(student.examId || student.examTitle || student.exam);
                    return (
                      <tr key={student.firebaseId} className="hover:bg-slate-50 transition-colors">
                        <td className="p-6 font-black text-slate-900 text-lg">
                          {student.fullName}
                          <div className="text-xs font-bold text-slate-400">{student.grade}. Sınıf - {student.phone}</div>
                        </td>
                        <td className="p-6 font-bold text-slate-600">{student.district} / {student.neighborhood}</td>
                        <td className="p-6">
                          {hasActiveExam ? (
                            <>
                              <div className="font-bold text-slate-800">{getNeighborhoodCenter(student.zone, student.neighborhood)}</div>
                              <div className="text-xs font-black text-indigo-600">{student.examTitle || student.exam?.title} ({student.selectedDate || student.exam?.date} - {student.selectedTime || student.slot})</div>
                            </>
                          ) : (
                            <span className="text-sm font-bold text-slate-400">Aktif kaydı yok</span>
                          )}
                        </td>
                        <td className="p-6">
                          {hasActiveExam && (
                            <button 
                              onClick={() => setResultModal({ isOpen: true, student, score: '', rank: '' })}
                              className="bg-yellow-100 text-yellow-700 font-black px-4 py-2 rounded-xl text-sm hover:bg-yellow-200 transition"
                            >
                              Sonuç Gir
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SONUÇ GİRME MODALI */}
      {resultModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] shadow-2xl p-10 w-full max-w-md relative animate-in zoom-in-95">
            <button onClick={() => setResultModal({ isOpen: false, student: null, score: '', rank: '' })} className="absolute top-6 right-6 text-slate-400 hover:text-slate-800"><Plus className="w-8 h-8 transform rotate-45"/></button>
            <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
            <h3 className="text-2xl font-black text-center text-slate-900 mb-2">Sınav Sonucu Ekle</h3>
            <p className="text-center text-slate-500 font-bold mb-8">{resultModal.student?.fullName} öğrencisi için sonuç giriliyor.</p>
            
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wider">Sınav Puanı</label>
                <input type="number" value={resultModal.score} onChange={e => setResultModal({...resultModal, score: e.target.value})} className="w-full border-4 border-slate-100 rounded-2xl px-6 py-4 text-xl font-bold focus:border-indigo-500 outline-none" placeholder="Örn: 450.5" />
              </div>
              <div>
                <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wider">Sıralama (Derece)</label>
                <input type="number" value={resultModal.rank} onChange={e => setResultModal({...resultModal, rank: e.target.value})} className="w-full border-4 border-slate-100 rounded-2xl px-6 py-4 text-xl font-bold focus:border-indigo-500 outline-none" placeholder="Örn: 1" />
              </div>
            </div>
            
            <button onClick={handleSaveResult} className="w-full bg-indigo-600 text-white font-black text-xl py-5 rounded-2xl hover:bg-indigo-700 transition shadow-xl shadow-indigo-500/30">Sonucu Kaydet</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 5. GİRİŞ YAP (Öğrenci Login)
// ==========================================
function LoginPage({ students, setCurrentUser, navigateTo }) {
  const [phoneQuery, setPhoneQuery] = useState('');

  const handleSearch = () => {
    let q = phoneQuery.replace(/\D/g, ''); 
    if (q.length > 0 && q[0] !== '5') { q = '5' + q; }
    
    if (q.length !== 10) {
      alert("Lütfen 10 haneli telefon numaranızı eksiksiz girin.");
      return;
    }

    const foundStudent = students.find(s => s.phone === q);
    
    if(foundStudent) {
      setCurrentUser(foundStudent);
      navigateTo('profile');
    } else {
      alert("Bu telefon numarasıyla eşleşen bir kayıt bulunamadı. Lütfen önce kayıt olun.");
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-32 text-center">
      <div className="bg-white p-12 rounded-[3rem] shadow-2xl shadow-indigo-100/50 border border-slate-100">
        <div className="w-24 h-24 bg-indigo-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
          <Users className="w-12 h-12 text-indigo-600" />
        </div>
        <h2 className="text-4xl font-black text-slate-900 mb-4">Öğrenci Girişi</h2>
        <p className="text-slate-500 text-lg mb-10 font-bold leading-relaxed">Kayıt esnasında kullandığınız telefon numarasını girerek panelinize erişebilirsiniz.</p>
        
        <div className="relative mb-8">
          <span className="absolute inset-y-0 left-0 flex items-center pl-8 text-slate-400 font-black text-2xl">0</span>
          <input 
            type="tel" 
            value={phoneQuery}
            onChange={e => setPhoneQuery(e.target.value)}
            placeholder="5XX XXX XX XX" 
            className="w-full text-center border-4 border-slate-100 rounded-[2rem] pl-12 pr-6 py-6 text-2xl font-black tracking-widest focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none transition"
          />
        </div>
        <button onClick={handleSearch} className="w-full bg-indigo-600 text-white font-black text-xl py-6 rounded-[2rem] hover:bg-indigo-700 transition shadow-2xl shadow-indigo-500/40 mb-6">
          Giriş Yap
        </button>
        <button onClick={() => navigateTo('register')} className="text-slate-500 hover:text-indigo-600 font-bold transition">
          Hesabın yok mu? Hemen Kayıt Ol
        </button>
      </div>
    </div>
  );
}