import React, { useState, useEffect } from 'react';
import { 
  MapPin, Calendar as CalendarIcon, Clock, Award, Users, Search, 
  Settings, ChevronRight, ChevronLeft, AlertCircle, CheckCircle2, 
  Map, Phone, FileText, Lock, MessageSquare, Gift, Check, Plus, LogOut, KeyRound, Trash2, UserPlus, Trophy, Building2, Send
} from 'lucide-react';

// ==========================================
// FIREBASE BAĞLANTISI VE GÜVENLİK
// ==========================================
import { initializeApp } from "firebase/app";
import { getFirestore, collection, onSnapshot, setDoc, doc, addDoc, updateDoc, deleteDoc } from "firebase/firestore";
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

// ==========================================
// MESAJPANELİ SMS API ENTEGRASYONU
// ==========================================
const MESAJ_PANELI_API_KEY = "af68961362160d37c19bae0463b082f58539d936";
const SMS_FOOTER = "\n\nodullusinav.net EFECEL IPTAL LH47W yaz 4609a gonder B302";

const sendSMS = async (msgDataArray) => {
  try {
    const payload = {
      user: {
        hash: MESAJ_PANELI_API_KEY
      },
      msgBaslik: "ODULLUSINAV",
      msgData: msgDataArray 
    };

    const response = await fetch("https://api.mesajpaneli.com/json_api/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("SMS Gönderim Hatası:", error);
    return false;
  }
};

// --- GELİŞMİŞ EXCEL ODAKLI BÖLGE VERİTABANI ---
const LOCATIONS = {
  "Kocaeli": {
    "Başiskele": ["Atakent", "Aydınyuvam", "Barbaros", "Camidüzü", "Damlar", "Doğantepe", "Döngel", "Fatih", "Havuzlubahçe", "Karadenizliler", "Kılıçarslan", "Körfez", "Ovacık", "Paşadağ", "Sahil", "Seymen", "Şehitekrem", "Vezirçiftliği", "Yayla", "Yeniköy", "Yeşilyurt", "Mahmutpaşa", "Aydınkent", "Yaylacık", "Altınkent", "Yeşilkent", "Kullar Yakacık", "Yuvacık Yakacık", "Mehmetağa", "Kullar Tepecik", "Sepetlıpınar"],
    "Çayırova": ["Akse", "Atatürk", "Cumhuriyet", "Emek", "İnönü", "Özgürlük", "Şekerpınar", "Yeni Mahalle", "Yeni", "Çayırova"],
    "Darıca": ["Abdi İpekçi", "Bağlarbaşı", "Bayramoğlu", "Cami", "Emek", "Fevziçakmak", "Kazımkarabekir", "Nenehatun", "Osmangazi", "Piri Reis", "Sırasöğütler", "Yalı", "Yeni", "Zincirlikuyu"],
    "Derince": ["Çavuşlu", "Çenedağ", "Çınarlı", "Deniz", "Dumlupınar", "Fatih Sultan", "Geredeli", "İbni Sina", "İshakçılar", "Karagöllü", "Kaşıkçı", "Mersincik", "Sırrıpaşa", "Tahtalı", "Toylar", "Yavuz Sultan", "Yenikent", "İbnisina"],
    "Dilovası": ["Cumhuriyet", "Çerkeşli", "Demirciler", "Diliskelesi", "Fatih", "Kayapınar", "Köseler", "Mimar Sinan", "Orhangazi", "Tavşancıl", "Tepecik", "Turgut Özal"],
    "Gebze": ["Adem Yavuz", "Ahatlı", "Arapçeşme", "Akarçeşme", "Balçık", "Barış", "Beylikbağı", "Cumaköy", "Cumhuriyet", "Denizli", "Duraklı", "Elbizli", "Eskihisar", "Gaziler", "Güzeller", "Hacıhalil", "Hatipler", "Hürriyet", "İnönü", "İstasyon", "Kadıllı", "Kargalı", "Kirazpınar", "Köşklü Çeşme", "Mevlana", "Mudarlı", "Mustafapaşa", "Mutlukent", "Ovacık", "Osman Yılmaz", "Pelitli", "Sultan Orhan", "Tatlıkuyu", "Tavşanlı", "Tepemanayır", "Ulus", "Yağcılar", "Yavuz Selim", "Yenikent", "Mimar Sinan", "Mollafenari", "Muallimköy"],
    "Gölcük": ["Atatürk", "Ayvazpınar", "Cavitpaşa", "Cumhuriyet", "Çiftlik", "Değirmendere", "Denizevler", "Donanma", "Düzağaç", "Ferhadiye", "Halıdere", "Hasaneyn", "Hisareyn", "İcadiye", "İhsaniye", "İkramiye", "Kavaklı", "Lütfiye", "Mamuriye", "Mesruriye", "Nüzhetiye", "Örcün", "Panayır", "Piyalepaşa", "Saraylı", "Selimiye", "Siyretiye", "Sofular", "Şevketiye", "Şirinköy", "Topçular", "Ulaşlı", "Yalı", "Yazlık", "Yeni", "Yüzbaşılar", "Şehitler", "Merkez", "Karaköprü", "Yazlık Yeni", "İpek Yolu", "Değirmendere Merkez", "Değirmendere Yalı", "Dumlupınar", "İhsaniye Merkez", "Yunus Emre", "Hisareyn Merkez", "Yazlık Merkez", "Yukarı", "Halıdere Yalı", "Körfez", "Ulaşlı Yavuz Sultan Selim", "Deniz Evler", "Hamidiye", "Ulaşlı Yalı"],
    "İzmit": ["28 Haziran", "Akçakoca", "Alikahya", "Ambarcı", "Arızlı", "Arpızlı", "Ayazma", "Bağlıca", "Balören", "Barbek", "Bayraktar", "Bekirdere", "Böğürgen", "Bulduk", "Cedit", "Cumhuriyet", "Çavuşoğlu", "Çayırköy", "Çepni", "Çubuklubala", "Çubukluosmaniye", "Dağköy", "Doğan", "Durhasan", "Eğercili", "Emirhan", "Erenler", "Eseler", "Fatih", "Fethiye", "Fethiyeköy", "Gedikli", "Gökçeören", "Gülbahçe", "Gültepe", "Güvercinlik", "Hacıhasan", "Hacıhızır", "Hakaniye", "Hasancıklar", "Hatipköy", "Kadıköy", "Karaabdülbaki", "Karabaş", "Karadenizliler", "Kısalar", "Kocatepe", "Kozluk", "Körfez", "Kurtdere", "Kuruçeşme", "M.Alipaşa", "Malta", "Mecidiye", "Nebihoca", "Orhan", "Ortaburun", "Ömerağa", "Sanayi", "Sapakpınar", "Sarışeyh", "Serdar", "Süverler", "Şahinler", "Şirintepe", "Tavşantepe", "Tepecik", "Tepeköy", "Topçular", "Turgut", "Tüysüzler", "Veliahmet", "Yahyakaptan", "Yassıbağ", "Yenidoğan", "Yenişehir", "Yeşilova", "Zabıtan", "Zeytinburnu", "Alikahya Fatih", "Yeni", "Alikahya Atatürk", "Gündoğdu", "Kuruçeşme Fatih", "Alikahya Cumhuriyet", "Alikahya Merkez", "Fevzi Çakmak", "Kabaoğlu", "Akpınar", "Çukurbağ", "Terzibayırı", "Akarca", "Akmeşe Cumhuriyet", "Sepetçi", "Akmeşe Atatürk", "Kemalpaşa"],
    "Kandıra": ["Akdurak", "Çarşı", "Orhan", "Aydınlık", "Akbal", "Akçabeyli", "Akçaova", "Kefken", "Kerpe", "Cebeci", "Bağırganlı", "Babalı", "Kocakaymas", "Karaağaç", "Ballar", "Çamkonak", "Kurtyeri", "Çalköy", "Akçakese"],
    "Karamürsel": ["4 Temmuz", "Kayacık", "Tepeköy", "Ereğli", "Akçat", "Avcıköy", "Çamçukur", "Dereköy", "Fulacık", "İhsaniye", "Karapınar", "Yalakdere", "Kızderbent"],
    "Kartepe": ["Ataşehir", "Fatih Sultan Mehmet", "Köseköy", "Uzunçiftlik", "Arslanbey", "Acısu", "Balaban", "Çepni", "Derbent", "Ertuğrulgazi", "İstasyon", "Maşukiye", "Suadiye", "Şirinsulhiye", "Ataevler", "Dumlupınar", "Emekevler", "Rahmiye", "İbrikdere", "Sarımeşe", "Eşme", "Uzuntarla", "Şevkatiye", "Nusretiye", "Karatepe", "Uzunbey", "Havluburun", "Ketenciler", "Sultaniye"],
    "Körfez": ["Mimar Sinan", "Yarımca", "Tütünçiftlik", "Hacı Osman", "Atalar", "Ağadere", "Barbaros", "Çamlıtepe", "Esentepe", "Fatih", "Güney", "İlimtepe", "Kuzey", "Şirinyalı", "Yavuz Selim", "Yeniyalı", "Yavuz Sultan Selim", "Cumhuriyet", "17 Ağustos", "Kirazlıyalı", "Yukarı Hereke", "Kışladüzü", "Hacı Akif", "Agah Ateş"]
  },
  "Sakarya": {
    "Adapazarı": ["Akköy", "Alancık", "Aşırlar", "Bağlar", "Bileciler", "Büyükhataplı", "Camili", "Cumhuriyet", "Çaltıcak", "Çamyolu", "Çerçiler", "Çökekler", "Çukurahmediye", "Dağdibi", "Demirbey", "Doğancılar", "Elmalı", "Evrenköy", "Göktepe", "Güllük", "Güneşler", "Hacılar", "Hızırtepe", "Işıklar", "İlyaslar", "İstiklal", "Karaköy", "Karaman", "Karasoku", "Kasımlar", "Kavaklıorman", "Korucuk", "Kurtbeyler", "Kurtuluş", "Küçükhataplı", "Mahmudiye", "Maltepe", "Mithatpaşa", "Nasuhlar", "Ozanlar", "Örentepe", "Pabuççular", "Poyrazlar", "Rüstemler", "Sakarya", "Salmanlı", "Semerciler", "Solaklar", "Süleymanbey", "Şeker", "Şirinevler", "Taşkısığı", "Tekeler", "Tepekum", "Tığcılar", "Turnadere", "Tuzla", "Yağcılar", "Yahalar", "Yenicami", "Yenigün", "Yeniköy", "15 Temmuz Camili", "Güneşler Merkez", "Karaosman", "Orta", "Güneşler Yeni", "Yenidoğan", "Akıncılar", "Papuççular", "Köprübaşı", "Taşlık", "Budaklar", "Karakamış", "Alandüzü", "Kayrancık", "Bayraktar", "Abalı", "Karapınar", "Karadere"],
    "Ferizli": ["İnönü", "Devlet", "Kemalpaşa", "Gölkent", "Sinanoğlu", "Ağacık", "Bakırlı", "İstiklal", "Değirmencik", "Damlık", "Ceylandere", "Abdürrezzak"],
    "Karasu": ["Aziziye", "İncilli", "Kabakoz", "Kuzuluk", "Yalı", "Yeni", "Adatepe", "Darıçayırı", "Kurudere", "Limandere", "Karasu", "Kuyumcullu", "Tepetarla", "Resuller", "Yuvalıdere", "Manavpınarı", "Karapınar", "Yassıgeçit", "Kızılcık", "İhsaniye", "Taşlıgeçit", "Çatalövez", "Gölköprü", "Konacık"],
    "Kaynarca": ["Orta", "Konak", "Büyükyanık", "Hatipler", "Topçu", "Turnalı", "Merkez", "Yeşilova", "Karaçalı", "Kertil", "Birlik", "Şeyhtımarı", "Karamanlar", "Ziahmet", "Arifağa"],
    "Kocaali": ["Ağalar", "Yalı", "Merkez", "Yeni", "Yayla", "Şerbetpınar", "Alandere", "Kirazlı", "Karşı", "Gümüşoluk", "Kestanepınarı", "Caferiye", "Aktaş", "Yanıksayvant", "Yalpankaya", "Hızar"],
    "Söğütlü": ["Küçük Söğütlü", "Orta", "Akarca", "Cami Cedit", "Gündoğan", "Yeniköy", "Akçakamış", "Fındıklı"],
    "Serdivan": ["Arabacıalanı", "Aralık", "Aşağıdereköy", "Bahçelievler", "Beşköprü", "Çubuklu", "Dağyoncalı", "Esentepe", "İstiklal", "Kazımpaşa", "Kemalpaşa", "Kızılcıklı", "Köprübaşı", "Kuruçeşme", "Meşeli", "Reşadiye", "Selahiye", "Uzunköy", "Vatan", "Yazlık", "Otuziki Evler", "Hamitabat", "Yukarıdereköy", "Beşevler"],
    "Erenler": ["Alancuma", "Büyükesence", "Çaybaşıyeniköy", "Değirmendere", "Dilmen", "Ekinli", "Erenler", "Hacıoğlu", "Hasanbey", "Horozlar", "Kamışlı", "Kayalarmemduhiye", "Kayalarreşitbey", "Kozluk", "Küpçüler", "Nakışlar", "Pirahmetler", "Sarıcalar", "Şeyhköy", "Tabakhane", "Yazılı", "Yeni", "Yeşiltepe", "Çaykışla", "Bekirpaşa", "Hürriyet", "Tepe", "Emirler", "Küçükesence", "Tuapsalar"],
    "Akyazı": ["Altındere", "Batakköy", "Cumhuriyet", "Çatalköprü", "Dokurcun", "Fatih", "Gazi", "Hasanbey", "İnönü", "Konuralp", "Kuzuluk", "Ömercikler", "Vakıf", "Yeni", "Yunus Emre", "Kuzuluk Ortamahalle", "Hastahane", "Gazi Süleyman Paşa", "Kuzuluk Topçusırtı", "Alaağaç", "Altındere Osmanağa", "Küçücek Cumhuriyet", "Pazarköy", "Taşburun", "Küçücek İstiklal", "Karaçalılık", "Yuvalak", "Topağaç", "Seyfeler", "Altındere Cumhuriyet", "Yağcılar", "Erdoğdu", "Kabakulak", "Osmanbey", "Altındere Gündoğan", "Kuzuluk Şose", "Şerefiye", "Taşağıl", "Çıldırlar", "Haydarlar", "Yahyalı", "Taşyatak", "Merkezyeniköy", "Eskibedil", "Salihiye", "Dokurcun Çaylar Yeni", "Kumköprü", "Bedil Kazancı", "Dedeler", "Boztepe", "Sukenarı", "Dokurcun Çengeller", "Düzyazı", "Uzunçınar", "Kızılcıkorman"],
    "Hendek": ["Akova", "Başpınar", "Bayraktepe", "Büyükdere", "Çamlıca", "Dereboğazı", "Kemaliye", "Mahmutbey", "Nuriye", "Puna", "Turanlar", "Yeni", "Yeşilyurt", "Sarıdede", "Rasimpaşa", "Köprübaşı", "Çağlayan", "Kargalı Hanbaba", "Akpınar", "Uzuncaorman", "Çamlıca Haraklı", "Kazımiye", "Kocaahmetler", "Dereköy", "Dikmen", "Kahraman", "Hamitli", "Sivritepe", "Yukarıçalıca", "Uzunçarşı", "Çiftlik", "Hacıkişla", "Aksu", "Puna Ortaköy", "Tuzak", "Yeşilvadi", "Kurtköy", "Kargalıyeniköy", "Yarıca", "Kocatöngel", "Soğuksu"],
    "Sapanca": ["Akçay", "Camicedit", "Çayiçi", "Dibektaş", "Fevziye", "Gazipaşa", "Göl", "Hacımercan", "İlmiye", "Kurtköy", "Mahmudiye", "Muradiye", "Nailiye", "Rüstempaşa", "Şükriye", "Uzunkum", "Ünlüce", "Yanık", "Yeni", "Güldibi", "Kurtköy Yavuzselim", "Kırkpınar Soğuksu", "Kırkpınar Hasanpaşa", "Kırkpınar Tepebaşı", "Kurtköy Fatih"],
    "Arifiye": ["Adliye", "Arifbey", "Bozacı", "Cumhuriyet", "Çaybaşıfautpaşa", "Çınardibi", "Fatih", "Hanlı", "Karaaptiler", "Kemaliye", "Kirazca", "Kumbaşı", "Neviye", "Yukarıdereköy", "Yukarıkirazca", "Hanlı Merkez", "Hanlıköy", "Hanlı Sakarya", "Aşağı Kirazca", "Hacıköy", "Ahmediye", "Çaybaşı Fuadiye"],
    "Geyve": ["Tepecikler", "Orhaniye", "Camikebir", "İnciksuyu", "Yörükler", "Gazi Süleyman Paşa", "Alifuatpaşa", "Karaçam", "Çeltikler", "Eşme", "Hırka", "Umurbey", "Safibey", "Nuruosmaniye", "Bağlarbaşı", "Akdoğan", "Bayat", "Kızılkaya", "Doğantepe"],
    "Pamukova": ["Elperek", "Cumhuriyet", "Yenice", "Gökgöz", "Mekece", "Bayırakçaşehir", "Turgutlu", "Şeyhvarmaz", "Bacıköy"],
    "Taraklı": ["Hacımurat", "Yenidoğan", "Ulucamii", "Hacıyakup"],
    "Karapürçek": ["Çeşmebaşı", "Yazılıgürgen", "Cumhuriyet", "İnönü", "Ahmetler", "Mecidiye", "Yüksel", "Hocaköy", "Mesudiye"]
  },
  "Yalova": {
    "Merkez": ["Adnan Menderes", "Bağlarbaşı", "Bahçelievler", "Bayraktepe", "Dere", "Fevzi Çakmak", "Gaziosmanpaşa", "İsmet Paşa", "Kadıköy", "Kazım Karabekir", "Mustafa Kemal Paşa", "Paşakent", "Rüstem Paşa", "Süleyman Bey", "Merkez", "Özden", "Seyrantepe"],
    "Çiftlikköy": ["Çiftlik", "Mehmet Akif Ersoy", "Sahil", "Sultaniye", "500 Evler", "Siteler", "Taşköprü", "Taşköprü Merkez", "Taşköprü Yeni"],
    "Çınarcık": ["Çamlık", "Harmanlar", "Hasanbaba", "Karpuzdere", "Taşliman", "Koruköy", "Esenköy", "Teşvikiye", "Atakent", "Liman", "Karşıyaka", "Cumhuriyet", "Hürriyet", "Aliye Hanım", "İstiklal"],
    "Altınova": ["Cumhuriyet", "Hürriyet", "Hersek", "Kaytazdere", "Subaşı", "Tavşanlı", "Merkez", "Denizgören", "Altınkent", "Fatih", "Şehitlik"],
    "Armutlu": ["50. Yıl", "Bayır", "Karşıyaka"],
    "Termal": ["Gökçedere", "Üvezpınar"]
  }
};

const INITIAL_ZONES = [
  { id: 1, name: "Adapazarı", active: true, districts: ["Adapazarı", "Ferizli", "Karasu", "Kaynarca", "Kocaali", "Söğütlü"], partialDistricts: {}, prizes: { grand: "", degree: "", participation: "" }, centers: [], mappings: [] },
  { id: 2, name: "Akarçeşme", active: true, districts: ["Derince", "İzmit", "Kandıra"], partialDistricts: { "Körfez": ["Yavuz Sultan Selim", "Mimar Sinan", "Güney", "Hacı Osman", "Fatih", "Yeniyalı", "Çamlıtepe", "Esentepe", "Cumhuriyet", "Atalar", "İlimtepe", "Kuzey", "Barbaros", "17 Ağustos", "Kirazlıyalı"] }, prizes: { grand: "", degree: "", participation: "" }, centers: [], mappings: [] },
  { id: 3, name: "Erenler", active: true, districts: ["Akyazı", "Erenler", "Hendek", "Karapürçek"], partialDistricts: {}, prizes: { grand: "", degree: "", participation: "" }, centers: [], mappings: [] },
  { id: 4, name: "Gebze", active: true, districts: ["Çayırova", "Darıca", "Dilovası", "Gebze"], partialDistricts: { "Körfez": ["Yukarı Hereke", "Kışladüzü", "Hacı Akif", "Agah Ateş"] }, prizes: { grand: "", degree: "", participation: "" }, centers: [], mappings: [] },
  { id: 5, name: "Kartepe", active: true, districts: ["Başiskele", "Gölcük", "Kartepe"], partialDistricts: {}, prizes: { grand: "", degree: "", participation: "" }, centers: [], mappings: [] },
  { id: 6, name: "Serdivan", active: true, districts: ["Arifiye", "Geyve", "Pamukova", "Sapanca", "Serdivan", "Taraklı"], partialDistricts: {}, prizes: { grand: "", degree: "", participation: "" }, centers: [], mappings: [] },
  { id: 7, name: "Yalova", active: true, districts: ["Altınova", "Armutlu", "Çınarcık", "Çiftlikköy", "Karamürsel", "Merkez", "Termal"], partialDistricts: {}, prizes: { grand: "", degree: "", participation: "" }, centers: [], mappings: [] }
];

const findZoneByName = (zonesList, zoneName) => zonesList.find(z => z.name === zoneName);

const determineZoneName = (province, district, neighborhood) => {
  for (const z of INITIAL_ZONES) {
    if (z.districts.includes(district)) return z.name;
    if (z.partialDistricts && z.partialDistricts[district] && z.partialDistricts[district].includes(neighborhood)) return z.name;
  }
  return null;
};

const getNeighborhoodDetails = (zone, neighborhood) => {
  const defaultDetails = { phone: "0850 123 45 67", centerName: "Sınav Merkezi Bekleniyor", address: "", mapLink: "" };
  if (!zone || !zone.mappings || !zone.centers) return defaultDetails;
  
  const map = zone.mappings.find(m => m.neighborhood === neighborhood);
  if (!map) return defaultDetails;

  const center = zone.centers.find(c => c.id === map.centerId);
  if (!center) return { ...defaultDetails, phone: map.phone || defaultDetails.phone };

  return {
    phone: map.phone || defaultDetails.phone,
    centerName: center.name,
    address: center.address,
    mapLink: center.mapLink
  };
};

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

// ==========================================
// DİJİTAL PİRAMİT TAKVİM BİLEŞENİ
// ==========================================
const DigitalCalendar = ({ zoneExams, currentUser, isCompact = false }) => {
  // Tarihleri state içinde tam sayı olarak tutuyoruz ki referans hataları oluşmasın
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDateStr, setSelectedDateStr] = useState(null);
  
  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
    setSelectedDateStr(null);
  };

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
    setSelectedDateStr(null);
  };

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  // 0: Pazar, Pazartesinden başlatmak için formül
  const startingEmptyCells = firstDay === 0 ? 6 : firstDay - 1; 

  const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
  const days = [];
  for (let i = 0; i < startingEmptyCells; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const examMap = {};
  zoneExams.forEach(exam => {
      const sessions = exam.sessions || [];
      sessions.forEach(session => {
         if(!examMap[session.date]) examMap[session.date] = [];
         examMap[session.date].push({ exam, session });
      });
  });

  const formatDateTr = (dateStr, timeStr, examTitle) => {
    if(!dateStr) return "";
    const [y, m, d] = dateStr.split('-');
    return `${parseInt(d)} ${monthNames[parseInt(m)-1]} ${timeStr || ''} - ${examTitle}`;
  };

  const containerClass = isCompact 
    ? "max-w-md mx-auto shadow-lg border border-slate-100 rounded-[2rem] bg-white overflow-hidden" 
    : "bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden relative";
  const headerPadding = isCompact ? "p-4" : "p-6 md:p-8";
  const bodyPadding = isCompact ? "p-4" : "p-6 md:p-8";
  const daySize = isCompact ? "w-8 h-8 md:w-10 md:h-10" : "w-14 h-14 md:w-16 md:h-16";
  const textSize = isCompact ? "text-sm md:text-base" : "text-lg md:text-2xl";

  return (
    <div className={containerClass}>
      <div className={`bg-indigo-900 text-white ${headerPadding} flex justify-between items-center rounded-b-[1.5rem] shadow-md z-10 relative`}>
        <button onClick={prevMonth} className="hover:bg-indigo-800 p-2 rounded-full transition bg-indigo-950 shadow-inner"><ChevronLeft className={`${isCompact ? 'w-4 h-4' : 'w-6 h-6'} text-indigo-200`}/></button>
        <h3 className={`font-black uppercase tracking-widest ${isCompact ? 'text-sm md:text-base' : 'text-2xl'}`}>{monthNames[currentMonth]} {currentYear}</h3>
        <button onClick={nextMonth} className="hover:bg-indigo-800 p-2 rounded-full transition bg-indigo-950 shadow-inner"><ChevronRight className={`${isCompact ? 'w-4 h-4' : 'w-6 h-6'} text-indigo-200`}/></button>
      </div>
      
      <div className={bodyPadding}>
        <div className={`grid grid-cols-7 gap-1 md:gap-2 mb-2 text-center font-black text-slate-400 uppercase text-[8px] sm:text-[10px] md:text-xs`}>
          <div className="truncate">Pazartesi</div>
          <div className="truncate">Salı</div>
          <div className="truncate">Çarşamba</div>
          <div className="truncate">Perşembe</div>
          <div className="truncate">Cuma</div>
          <div className="truncate">Cumartesi</div>
          <div className="truncate">Pazar</div>
        </div>
        <div className="grid grid-cols-7 gap-1 place-items-center">
          {days.map((d, i) => {
            if(!d) return <div key={i} className={daySize}></div>;
            const dateStr = `${currentYear}-${String(currentMonth+1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const dayExams = examMap[dateStr] || [];
            const hasExam = dayExams.length > 0;

            const isMyExamDay = dayExams.some(e => {
                 const isMyExam = (currentUser?.examId === e.exam.firebaseId) || (currentUser?.exam?.firebaseId === e.exam.firebaseId);
                 const isMyDate = (currentUser?.selectedDate === e.session.date) || (currentUser?.exam?.date === e.session.date);
                 return isMyExam && isMyDate;
            });

            return (
              <div key={i}
                   onClick={() => hasExam && setSelectedDateStr(dateStr)}
                   className={`relative flex flex-col items-center justify-center rounded-2xl transition-all cursor-pointer ${daySize}
                      ${hasExam ? 'bg-slate-50 hover:bg-indigo-50 border-2 border-indigo-100 shadow-sm' : 'text-slate-400 border-2 border-transparent'}
                      ${selectedDateStr === dateStr ? 'ring-4 ring-indigo-400 bg-indigo-100 scale-110 z-10 shadow-lg' : ''}
                      ${isMyExamDay ? 'bg-green-50 border-green-400 shadow-md ring-2 ring-green-200' : ''}
                   `}>
                  <span className={`font-black ${textSize} ${hasExam ? 'text-indigo-900' : ''}`}>{d}</span>
                  {hasExam && (
                      <div className={`flex gap-1 absolute ${isCompact ? 'bottom-1' : 'bottom-2'}`}>
                          <div className={`${isCompact ? 'w-1 h-1' : 'w-2 h-2'} rounded-full ${isMyExamDay ? 'bg-green-500' : 'bg-indigo-400'}`}></div>
                      </div>
                  )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Sınavların Liste Gösterimi */}
      <div className={`bg-slate-50 ${isCompact ? 'p-4' : 'p-6 md:p-10'} border-t-2 border-slate-100`}>
          {!selectedDateStr && (
             <h4 className={`font-black text-slate-800 mb-4 flex items-center uppercase tracking-wider ${isCompact ? 'text-xs' : 'text-xl'}`}>
                <Clock className={`${isCompact ? 'w-4 h-4' : 'w-5 h-5'} mr-2 text-indigo-500`}/> {monthNames[currentMonth]} Ayı Oturumları
             </h4>
          )}
          {selectedDateStr && (
             <div className="flex justify-between items-center mb-4">
               <h4 className={`font-black text-indigo-900 flex items-center uppercase tracking-wider ${isCompact ? 'text-xs' : 'text-xl'}`}>
                  <CalendarIcon className={`${isCompact ? 'w-4 h-4' : 'w-5 h-5'} mr-2 text-indigo-500`}/> {selectedDateStr.split('-').reverse().join('.')}
               </h4>
               <button onClick={() => setSelectedDateStr(null)} className="text-[10px] md:text-xs font-bold text-slate-400 hover:text-slate-700 underline">Tümünü Göster</button>
             </div>
          )}

          <div className="space-y-2 md:space-y-4">
              {Object.keys(examMap).sort().map(dateStr => {
                  const [y, m] = dateStr.split('-');
                  if(parseInt(m) !== currentMonth + 1 || parseInt(y) !== currentYear) return null;
                  if (selectedDateStr && dateStr !== selectedDateStr) return null;

                  return examMap[dateStr].map((item, idx) => {
                      const { exam, session } = item;
                      return session.slots.map(slot => {
                          const isMySlot = ((currentUser?.examId === exam.firebaseId) || (currentUser?.exam?.firebaseId === exam.firebaseId))
                                         && ((currentUser?.selectedDate === session.date) || (currentUser?.exam?.date === session.date))
                                         && ((currentUser?.selectedTime === slot) || (currentUser?.slot === slot));
                          return (
                              <div key={`${dateStr}-${slot}-${idx}`} className={`flex flex-col items-start p-3 md:p-5 rounded-2xl border-l-[6px] shadow-sm transition-all ${isMySlot ? 'bg-white border-l-green-500 border-y border-r border-slate-200' : 'bg-white border-l-indigo-500 border-y border-r border-slate-200'}`}>
                                  <div className={`font-black text-slate-800 ${isCompact ? 'text-sm' : 'text-lg'}`}>
                                      {formatDateTr(session.date, slot, exam.title)}
                                  </div>
                                  {isMySlot && (
                                      <span className="bg-green-100 text-green-700 text-[9px] md:text-xs font-black px-2 py-1 rounded-lg uppercase tracking-wider flex items-center w-max mt-2">
                                          <CheckCircle2 className="w-3 h-3 mr-1"/> Senin Oturumun
                                      </span>
                                  )}
                              </div>
                          );
                      });
                  });
              })}
              {!Object.keys(examMap).some(dateStr => {
                  const [y, m] = dateStr.split('-');
                  return parseInt(m) === currentMonth + 1 && parseInt(y) === currentYear;
              }) && (
                  <div className={`text-center text-slate-500 font-bold py-4 italic ${isCompact ? 'text-xs' : 'text-base'}`}>Bu aya ait planlanmış sınav bulunmuyor.</div>
              )}
          </div>
      </div>
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
        const zonesData = snapshot.docs.map(d => {
          const dbZone = d.data();
          const baseZone = INITIAL_ZONES.find(z => z.id === parseInt(d.id)) || {};
          return { 
            ...dbZone, 
            id: parseInt(d.id),
            name: baseZone.name,
            districts: baseZone.districts || [],
            partialDistricts: baseZone.partialDistricts || {},
            prizes: dbZone.prizes || baseZone.prizes,
            centers: dbZone.centers || [],
            mappings: dbZone.mappings || []
          };
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

  const userLocDetails = currentUser ? getNeighborhoodDetails(currentUser.zone, currentUser.neighborhood) : null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <div className="bg-indigo-950 text-indigo-100 text-xs py-2 px-4 flex justify-between items-center sm:px-8 border-b border-indigo-900">
        <div className="flex items-center space-x-4">
          <span className="flex items-center font-bold">
            <Phone className="w-3.5 h-3.5 mr-1 text-indigo-300"/> 
            {userLocDetails ? userLocDetails.phone : "0850 123 45 67"}
          </span>
          <span className="hidden sm:flex items-center font-bold">
            <MapPin className="w-3.5 h-3.5 mr-1 text-indigo-300"/> 
            {currentUser ? `${currentUser.province}, ${currentUser.district}, ${currentUser.neighborhood}` : "Sakarya, Kocaeli, Yalova"}
          </span>
        </div>
      </div>

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
            students={registeredStudents}
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
      (z.districts && z.districts.some(d => normalizeStr(d) === searchStr)) ||
      (z.partialDistricts && Object.keys(z.partialDistricts).some(d => normalizeStr(d) === searchStr))
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

              {/* ANA SAYFADAKİ KÜÇÜK TAKVİM */}
              <div id="takvim" className="pt-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
                   <div className="flex items-center">
                     <CalendarIcon className="w-10 h-10 mr-4 text-indigo-600"/>
                     <h2 className="text-3xl md:text-4xl font-black text-slate-900">Sınav Takvimi</h2>
                   </div>
                </div>
                <DigitalCalendar zoneExams={zoneExams} currentUser={currentUser} isCompact={true} />
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
function RegistrationProcess({ navigateTo, currentUser, setCurrentUser, zones, exams, students }) {
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
  
  const [showAlternativeExams, setShowAlternativeExams] = useState(false);
  
  const [selectedDegreePrize, setSelectedDegreePrize] = useState('');
  const [selectedParticipationPrize, setSelectedParticipationPrize] = useState('');

  // Doğrulama Modal States
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [enteredCode, setEnteredCode] = useState('');

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

  const handleStep1Submit = () => {
    // Çift profil kontrolü
    if(!currentUser) {
      const isDuplicate = students.some(s => 
        s.fullName.trim().toLowerCase() === formData.fullName.trim().toLowerCase() && 
        s.phone === formData.phone
      );
      
      if(isDuplicate) {
        alert("Bu isim ve telefon numarası ile sistemde zaten bir profil bulunuyor. Lütfen Giriş Yapın.");
        return;
      }
    }

    // Doğrulama adımını başlat
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setVerificationCode(code);
    setShowVerification(true);
    // Gerçek SMS sistemi şu an kapalı olduğundan ekrana alert olarak veriyoruz.
    alert(`[TEST MODU]\nDoğrulama Kodunuz: ${code}\n\n(Gerçek uygulamada bu kod telefonunuza SMS olarak gelecektir)`);
  };

  const verifyCodeAndProceed = () => {
    if (enteredCode === verificationCode || enteredCode === "1234") { // 1234 her zaman kabul etsin (test kolaylığı)
      setShowVerification(false);
      setStep(2);
    } else {
      alert("Girdiğiniz doğrulama kodu hatalı. Lütfen tekrar deneyin.");
    }
  };

  useEffect(() => {
    if (formData.district && formData.neighborhood) {
      const zoneName = determineZoneName(formData.province, formData.district, formData.neighborhood);
      const zone = findZoneByName(zones, zoneName);
      
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

  const handleComplete = async (withoutExam = false) => {
    setIsSubmitting(true);
    
    const finalDegreePrize = withoutExam ? '' : (selectedDegreePrize || (degreePrizesList.length === 1 ? degreePrizesList[0] : ''));
    const finalPartPrize = withoutExam ? '' : (selectedParticipationPrize || (partPrizesList.length === 1 ? partPrizesList[0] : ''));

    try {
      let finalUserObj;
      if (currentUser) {
        const updatedData = withoutExam ? {
          examId: null,
          examTitle: null,
          selectedDate: null,
          selectedTime: null,
          zone: matchedZone || null,
          isWaitingPool: true
        } : {
          examId: selectedExam.firebaseId || selectedExam.id,
          examTitle: selectedExam.title,
          selectedDate: selectedSlot.date,
          selectedTime: selectedSlot.time,
          zone: matchedZone || null,
          selectedDegreePrize: finalDegreePrize,
          selectedParticipationPrize: finalPartPrize,
          isWaitingPool: false
        };
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'students', currentUser.firebaseId), updatedData);
        finalUserObj = { ...currentUser, ...updatedData };
        setCurrentUser(finalUserObj);
      } else {
        const newStudent = withoutExam ? {
          ...formData,
          examId: null,
          examTitle: null,
          selectedDate: null,
          selectedTime: null,
          zone: matchedZone || null,
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
          zone: matchedZone || null,
          selectedDegreePrize: finalDegreePrize,
          selectedParticipationPrize: finalPartPrize,
          isWaitingPool: false,
          pastExams: [], 
          registrationDate: new Date().toLocaleDateString('tr-TR'),
          createdAt: new Date().getTime()
        };
        const docRef = await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'students'), newStudent);
        finalUserObj = { firebaseId: docRef.id, ...newStudent };
        setCurrentUser(finalUserObj);
      }

      // --- SMS GÖNDERİM KISMI ---
      if (withoutExam) {
         await sendSMS([{tel: [finalUserObj.phone], msg: `odullusinav.net basvurunuz alinmistir. Bolgenizde sinav acildiginda size haber verecegiz.${SMS_FOOTER}`}]);
      } else {
         const centerInfo = getNeighborhoodDetails(matchedZone, finalUserObj.neighborhood);
         const [y, m, d] = finalUserObj.selectedDate.split('-');
         const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
         const trDate = `${parseInt(d)} ${monthNames[parseInt(m)-1]}`;

         const regMsg = `odullusinav.net basvurunuz alinmistir. Size en yakin sinav mahallimiz ${finalUserObj.district} ilcesi ${finalUserObj.neighborhood} mahallesindedir. Sinav saatinden 30 dakika once asagidaki konumda olmanizi rica ederiz.\n\nOturum: ${trDate} - ${finalUserObj.selectedTime}\nKonum: ${centerInfo.address || centerInfo.centerName}\nLink: ${centerInfo.mapLink}\nIletisim: ${centerInfo.phone}${SMS_FOOTER}`;
         
         await sendSMS([{tel: [finalUserObj.phone], msg: regMsg}]);
      }

      setStep(3); 
    } catch (error) {
      console.error("Kayıt Hatası: ", error);
      alert("İşlem sırasında bir hata oluştu. Lütfen bağlantınızı kontrol edin.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableDistricts = formData.province ? 
     Object.keys(LOCATIONS[formData.province] || {}) : [];

  const availableNeighborhoods = (formData.province && formData.district && LOCATIONS[formData.province][formData.district]) 
     ? LOCATIONS[formData.province][formData.district] : [];

  const sortedAlternativeExams = [...exams].map((exam, idx) => {
    return { ...exam, mockDistance: 10 + (idx * 3) + (exam.zoneId * 2) };
  }).sort((a,b) => a.mockDistance - b.mockDistance);

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 relative">
      {/* Doğrulama Kodu Modalı */}
      {showVerification && (
         <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[3rem] shadow-2xl p-10 w-full max-w-md relative animate-in zoom-in-95">
               <button onClick={() => setShowVerification(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-800"><Plus className="w-8 h-8 transform rotate-45"/></button>
               <Phone className="w-16 h-16 text-indigo-500 mx-auto mb-6" />
               <h3 className="text-3xl font-black text-center text-slate-900 mb-2">Telefon Doğrulama</h3>
               <p className="text-center text-slate-500 font-bold mb-8">Lütfen 0{formData.phone} numaralı telefonunuza gönderilen 4 haneli kodu giriniz.</p>
               
               <input 
                 type="text" 
                 maxLength="4" 
                 value={enteredCode} 
                 onChange={e => setEnteredCode(e.target.value.replace(/\D/g, ''))} 
                 className="w-full text-center tracking-[1em] border-4 border-slate-100 rounded-2xl px-6 py-4 text-3xl font-black focus:border-indigo-500 outline-none mb-6" 
                 placeholder="••••" 
               />
               
               <button onClick={verifyCodeAndProceed} disabled={enteredCode.length !== 4} className="w-full bg-indigo-600 text-white font-black text-xl py-5 rounded-2xl hover:bg-indigo-700 disabled:opacity-50 transition shadow-xl shadow-indigo-500/30">
                 Doğrula ve Devam Et
               </button>
            </div>
         </div>
      )}

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
              onClick={handleStep1Submit}
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
                  {availableDistricts.map(dist => (
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
                  {availableNeighborhoods.map(hood => (
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
                      <h3 className="font-black text-2xl text-amber-900 mt-1">Bu Mahalle Henüz Bir Mıntıkaya Bağlı Değil</h3>
                    </div>
                  </div>
                )}

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
                              {examSessions.map((session, sIdx) => {
                                const [y, m, d] = session.date.split('-');
                                const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
                                const trDate = `${parseInt(d)} ${monthNames[parseInt(m)-1]}`;

                                return (
                                  <div key={sIdx} className="pt-4 border-t-2 border-indigo-200/50">
                                    <span className="text-lg font-black text-slate-700 mb-4 flex items-center"><CalendarIcon className="w-6 h-6 mr-3 text-indigo-500"/> {trDate} Tarihli Oturumlar:</span>
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
                                )
                              })}
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
                    {sortedAlternativeExams.length > 0 ? (
                      <div className="grid gap-6">
                        {sortedAlternativeExams.map((exam) => {
                          const examSessions = exam.sessions || (exam.date && exam.slots ? [{ date: exam.date, slots: exam.slots }] : []);
                          return (
                            <div key={exam.firebaseId || exam.id} className={`border-4 rounded-3xl p-6 md:p-8 transition-all ${selectedExam?.firebaseId === exam.firebaseId ? 'border-indigo-600 bg-indigo-50 ring-4 ring-indigo-500/20 shadow-xl' : 'border-slate-100 bg-white hover:border-indigo-300 hover:shadow-md cursor-pointer'}`}
                                onClick={() => { setSelectedExam(exam); setSelectedSlot(null); }}>
                              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                                <div>
                                  <div className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-1">{zones.find(z => z.id === exam.zoneId)?.name || 'Bölge'}</div>
                                  <h4 className="font-black text-3xl text-slate-800 mb-2 md:mb-0">{exam.title}</h4>
                                </div>
                                <span className="flex items-center text-sm font-black text-slate-500 bg-slate-100 px-4 py-2 rounded-xl border border-slate-200"><MapPin className="w-4 h-4 mr-2"/> Tahmini {exam.mockDistance} km uzakta</span>
                              </div>
                              
                              <div className="space-y-6">
                                {examSessions.map((session, sIdx) => {
                                  const [y, m, d] = session.date.split('-');
                                  const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
                                  const trDate = `${parseInt(d)} ${monthNames[parseInt(m)-1]}`;

                                  return (
                                    <div key={sIdx} className="pt-4 border-t-2 border-indigo-200/50">
                                      <span className="text-lg font-black text-slate-700 mb-4 flex items-center"><CalendarIcon className="w-6 h-6 mr-3 text-indigo-500"/> {trDate} Tarihli Oturumlar:</span>
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
                                  )
                                })}
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
                        onClick={() => handleComplete(false)} 
                        disabled={!selectedSlot && !isSubmitting}
                        className="w-full bg-green-500 text-white font-black py-6 rounded-2xl hover:bg-green-600 disabled:opacity-50 transition flex justify-center items-center text-xl shadow-2xl shadow-green-500/40"
                      >
                        {selectedSlot ? "Seçtiğim Sınavla Kaydı Tamamla" : "Sınav Seçmediniz"}
                      </button>
                      <button 
                        onClick={() => handleComplete(true)} 
                        disabled={isSubmitting}
                        className="w-full bg-indigo-600 text-white font-black py-6 rounded-2xl hover:bg-indigo-700 disabled:opacity-50 transition flex justify-center items-center text-xl shadow-2xl shadow-indigo-500/40"
                      >
                        Sınav Seçmeden Profil Oluştur
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
  const zoneExams = exams.filter(e => e.zoneId === currentUser?.zone?.id);

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
                  <div className="font-black text-2xl flex items-center"><CalendarIcon className="w-6 h-6 mr-2 opacity-80"/> {currentUser?.selectedDate || currentUser?.exam?.date}</div>
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
                      {neighborhoodDetails.centerName}
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

          {/* DİJİTAL PİRAMİT TAKVİM (Yeni) */}
          <div className="mt-12">
             <DigitalCalendar zoneExams={zoneExams} currentUser={currentUser} />
          </div>

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
                        <CalendarIcon className="w-5 h-5 mr-2 text-indigo-400"/> {past.date} - {past.time} Oturumu
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
  
  const [newCenter, setNewCenter] = useState({ name: '', address: '', mapLink: '' });
  const [mappingData, setMappingData] = useState({ district: '', neighborhood: '', centerId: '', phone: '' });

  const [resultModal, setResultModal] = useState({ isOpen: false, student: null, score: '', rank: '' });

  // Yeni Toplu SMS State'i
  const [smsModal, setSmsModal] = useState({ isOpen: false, type: 'custom', customMsg: '', loading: false });

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

  const adminCenters = adminZoneData.centers || [];
  const adminMappings = adminZoneData.mappings || [];

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

  const handleDeleteExam = async (examId) => {
      if(!window.confirm("Bu sınav oturumunu tamamen iptal etmek ve silmek istediğinize emin misiniz?")) return;
      try {
          await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'exams', examId));
          alert("Sınav oturumu başarıyla silindi.");
      } catch(e) {
          console.error(e);
          alert("Sınav silinirken bir hata oluştu.");
      }
  };

  const handleAddCenter = async () => {
    if(!newCenter.name || !newCenter.address) return alert("Kurum adı ve açık adres zorunludur.");
    try {
      const centerObj = {
        id: "c_" + new Date().getTime(),
        name: newCenter.name,
        address: newCenter.address,
        mapLink: newCenter.mapLink || ""
      };
      const updatedCenters = [...adminCenters, centerObj];
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'zones', adminZoneId.toString()), { centers: updatedCenters });
      alert("Sınav Merkezi eklendi!");
      setNewCenter({ name: '', address: '', mapLink: '' });
    } catch (e) {
      console.error(e);
      alert("Hata oluştu.");
    }
  };

  const handleDeleteCenter = async (centerId) => {
    if(!window.confirm("Bu kurumu silmek istediğinize emin misiniz? (Bağlı mahalleler etkilenebilir)")) return;
    try {
      const updatedCenters = adminCenters.filter(c => c.id !== centerId);
      const updatedMappings = adminMappings.filter(m => m.centerId !== centerId); 
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'zones', adminZoneId.toString()), { 
        centers: updatedCenters,
        mappings: updatedMappings
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddMapping = async () => {
    if(!mappingData.neighborhood || !mappingData.centerId) return alert("Lütfen mahalle ve atanacak kurumu seçin.");
    try {
      const newMappings = [...adminMappings];
      const existingIndex = newMappings.findIndex(m => m.neighborhood === mappingData.neighborhood);
      
      const newMapObj = {
        neighborhood: mappingData.neighborhood,
        centerId: mappingData.centerId,
        phone: mappingData.phone || "0850 123 45 67"
      };

      if (existingIndex >= 0) {
        newMappings[existingIndex] = newMapObj;
      } else {
        newMappings.push(newMapObj);
      }
      
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'zones', adminZoneId.toString()), { mappings: newMappings });
      alert(`${mappingData.neighborhood} mahallesi başarıyla kuruma atandı!`);
      setMappingData({ ...mappingData, neighborhood: '', phone: '' }); 
    } catch (e) {
      console.error(e);
      alert("Bir hata oluştu");
    }
  };

  const handleDeleteMapping = async (neighborhood) => {
    try {
      const updatedMappings = adminMappings.filter(m => m.neighborhood !== neighborhood);
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'zones', adminZoneId.toString()), { mappings: updatedMappings });
    } catch (e) {
      console.error(e);
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
  
  const handleDeleteStudent = async (studentId, studentName) => {
    if(window.confirm(`${studentName} isimli öğrencinin kaydını sistemden KALICI olarak silmek istediğinize emin misiniz?`)) {
      try {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'students', studentId));
        alert("Öğrenci kaydı başarıyla silindi.");
      } catch (e) {
        console.error(e);
        alert("Öğrenci silinirken bir hata oluştu.");
      }
    }
  };

  // Yeni Toplu SMS Motoru
  const handleBulkSMS = async () => {
    setSmsModal({ ...smsModal, loading: true });
    
    // Geçerli telefon numarasına sahip öğrencileri filtrele
    const validStudents = filteredStudents.filter(s => s.phone && s.phone.length >= 10);
    if (validStudents.length === 0) {
      alert("Gönderilecek geçerli bir numara bulunamadı.");
      setSmsModal({ ...smsModal, loading: false, isOpen: false });
      return;
    }

    const msgDataArray = validStudents.map(student => {
      const stdCenter = getNeighborhoodDetails(adminZoneData, student.neighborhood);
      let text = "";

      if (smsModal.type === 'custom') {
        text = smsModal.customMsg;
      } else if (smsModal.type === 'announcement') {
        text = `Yaklasan sinavimiz icin kayitlar devam ediyor! odullusinav.net uzerinden profilinize girerek detaylari ogrenebilirsiniz.\nSinav Merkeziniz: ${stdCenter.centerName}\nAdres: ${stdCenter.address}\nLink: ${stdCenter.mapLink}\nIletisim: ${stdCenter.phone}`;
      } else if (smsModal.type === 'reminder') {
        text = `Hatirlatma! ${student.fullName || 'Ogrencimiz'}, sinaviniza cok az kaldi. Sinavdan 30dk once merkezimizde hazir bulunun. Arkadaslarinizi da davet etmeyi unutmayin!\nOturum: ${student.selectedDate || 'Belirtilmedi'} - ${student.selectedTime || ''}\nSinav Yeri: ${stdCenter.centerName}\nAdres: ${stdCenter.address}\nLink: ${stdCenter.mapLink}\nIletisim: ${stdCenter.phone}`;
      } else if (smsModal.type === 'results') {
        text = `Tebrikler! ${student.fullName || 'Ogrencimiz'}, sinav sonuclariniz aciklanmistir. Puan ve derecenizi odullusinav.net uzerinden ogrenebilir, birebir analiz icin sinav merkezimizden randevu alabilirsiniz.\nSinav Merkezi: ${stdCenter.centerName}\nIletisim: ${stdCenter.phone}\nAdres: ${stdCenter.address}`;
      }

      // Zorunlu Footer Eklemesi
      text += SMS_FOOTER;

      return {
        tel: [student.phone],
        msg: text
      };
    });

    const result = await sendSMS(msgDataArray);
    if(result !== false) {
      alert(`${msgDataArray.length} öğrenciye mesajlar başarıyla iletildi!`);
    } else {
      alert("Mesajlar gönderilirken bir hata oluştu. API bağlantınızı veya kredi durumunuzu kontrol edin.");
    }
    
    setSmsModal({ isOpen: false, type: 'custom', customMsg: '', loading: false });
  };

  const getAdminDistricts = () => {
    const dists = [...(adminZoneData.districts || [])];
    if(adminZoneData.partialDistricts) {
      Object.keys(adminZoneData.partialDistricts).forEach(d => {
        if(!dists.includes(d)) dists.push(d);
      });
    }
    return dists.sort();
  };

  const getAdminNeighborhoods = (district) => {
    let allHoods = [];
    if(!district) return [];
    if(adminZoneData.partialDistricts && adminZoneData.partialDistricts[district]) {
      allHoods = adminZoneData.partialDistricts[district].sort();
    } else {
      for(let prov in LOCATIONS) {
         if(LOCATIONS[prov][district]) {
             allHoods = LOCATIONS[prov][district].sort();
             break;
         }
      }
    }
    const mappedHoods = adminMappings.map(m => m.neighborhood);
    return allHoods.filter(h => !mappedHoods.includes(h));
  };

  const adminDistricts = getAdminDistricts();
  const adminNeighborhoods = getAdminNeighborhoods(mappingData.district);

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-16 relative">
      <div className="mb-10 border-b-2 border-slate-100 pb-6 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <div className="inline-flex items-center px-4 py-1.5 rounded-lg bg-indigo-100 text-indigo-800 text-sm font-black mb-3 uppercase tracking-wider">
            {adminZoneData.name} Yönetimi
          </div>
          <h1 className="text-4xl font-black text-slate-900">Mıntıka Paneli</h1>
          <p className="text-slate-500 mt-2 font-bold text-lg">Bölgenize ait ayarlar, sınav planlaması, kurum eşleştirmeleri ve kayıtlı öğrenciler.</p>
        </div>
        <button onClick={onLogout} className="flex items-center text-red-600 bg-red-50 hover:bg-red-100 px-5 py-2.5 rounded-xl font-bold transition">
          <LogOut className="w-5 h-5 mr-2"/> Güvenli Çıkış
        </button>
      </div>

      <div className="flex flex-wrap gap-4 mb-10 border-b-2 border-slate-100 pb-6">
        <button onClick={() => setActiveTab('ayarlar')} className={`px-6 py-3 rounded-2xl font-black transition-all text-base ${activeTab === 'ayarlar' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
          <Settings className="w-5 h-5 inline mr-2"/> Sınav & Ödül Ayarları
        </button>
        <button onClick={() => setActiveTab('merkezler')} className={`px-6 py-3 rounded-2xl font-black transition-all text-base ${activeTab === 'merkezler' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
          <Building2 className="w-5 h-5 inline mr-2"/> Sınav Yerleri & Atamalar
        </button>
        <button onClick={() => setActiveTab('ogrenci')} className={`px-6 py-3 rounded-2xl font-black transition-all text-base ${activeTab === 'ogrenci' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
          <Users className="w-5 h-5 inline mr-2"/> Öğrenci Listesi ({filteredStudents.length})
        </button>
      </div>

      {/* 1. SEKMEYE AİT İÇERİKLER: Sınav ve Ödül Ayarları */}
      {activeTab === 'ayarlar' && (
        <div className="bg-white rounded-[3rem] shadow-xl border-4 border-slate-100 p-8 md:p-12">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 border-b-2 border-slate-100 pb-8 gap-4">
            <div>
              <h3 className="font-black text-3xl text-slate-900 mb-2">{adminZoneData.name}</h3>
              <p className="text-base font-bold text-slate-500">Sorumlu Olduğunuz İlçeler/Bölgeler: {adminDistricts.join(', ')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Ödül Yönetimi */}
            <div>
              <div className="text-sm font-black text-indigo-600 uppercase mb-4 tracking-wider flex items-center"><Gift className="w-6 h-6 mr-2"/> Bölge Ödüllerini Yönet</div>
              <div className="space-y-4 bg-slate-50 p-6 rounded-3xl border-2 border-slate-100">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">Büyük Ödül (Sadece Tek Seçenek)</label>
                  <input type="text" value={localPrizes.grand} onChange={e=>setLocalPrizes({...localPrizes, grand: e.target.value})} className="w-full text-base font-bold p-4 rounded-xl border border-slate-200 outline-none focus:border-indigo-500" placeholder="Örn: PlayStation 5"/>
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

            {/* Sınav Oturumu Planla */}
            <div>
              <div className="text-sm font-black text-indigo-600 uppercase mb-4 tracking-wider flex items-center"><CalendarIcon className="w-6 h-6 mr-2"/> Yeni Sınav Oturumu Planla</div>
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

              <div className="mt-8">
                  <div className="text-sm font-black text-indigo-600 uppercase mb-4 tracking-wider">Planlanmış Aktif Sınavlar</div>
                  <div className="space-y-4">
                    {filteredExams.length > 0 ? filteredExams.map(exam => {
                      const sessions = exam.sessions || [];
                      return (
                        <div key={exam.firebaseId} className="bg-indigo-50 border-2 border-indigo-100 p-5 rounded-2xl relative">
                          <button onClick={() => handleDeleteExam(exam.firebaseId)} className="absolute top-4 right-4 p-2 text-red-500 hover:bg-red-100 rounded-xl transition" title="Sınavı Sil"><Trash2 className="w-5 h-5"/></button>
                          <h4 className="font-black text-lg text-indigo-900 mb-3 pr-10">{exam.title}</h4>
                          <div className="space-y-2">
                            {sessions.map((session, idx) => (
                              <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-2">
                                <span className="bg-white px-3 py-1.5 rounded-xl border border-indigo-200 text-sm font-bold text-slate-700 w-max"><CalendarIcon className="inline w-4 h-4 mr-1 text-indigo-500"/> {session.date}</span>
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

      {/* 2. YENİ SEKMEYE AİT İÇERİKLER: Sınav Merkezleri ve Atamalar */}
      {activeTab === 'merkezler' && (
         <div className="bg-white rounded-[3rem] shadow-xl border-4 border-slate-100 p-8 md:p-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 border-b-2 border-slate-100 pb-8 gap-4">
              <div>
                <h3 className="font-black text-3xl text-slate-900 mb-2">Sınav Yerleri ve Atamalar</h3>
                <p className="text-base font-bold text-slate-500">Mıntıkaya yeni kurumlar ekleyin ve mahalleleri bu kurumlara (farklı numaralarla) bağlayın.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              
              {/* Kurum Ekleme Formu */}
              <div className="lg:col-span-1">
                <div className="text-sm font-black text-indigo-600 uppercase mb-4 tracking-wider flex items-center"><Building2 className="w-6 h-6 mr-2"/> Yeni Kurum / Sınav Yeri Ekle</div>
                <div className="space-y-4 bg-slate-50 p-6 rounded-3xl border-2 border-slate-100">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">Kurum Adı</label>
                    <input type="text" value={newCenter.name} onChange={e=>setNewCenter({...newCenter, name: e.target.value})} className="w-full text-sm font-bold p-4 rounded-xl border border-slate-200 outline-none focus:border-indigo-500" placeholder="Örn: Şekerpınar Sınav Merkezi"/>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">Açık Adres</label>
                    <textarea rows="3" value={newCenter.address} onChange={e=>setNewCenter({...newCenter, address: e.target.value})} className="w-full text-sm font-bold p-4 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 resize-none" placeholder="Örn: Mutlu Sk. No:5 Çayırova"/>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">Google Harita Linki</label>
                    <input type="url" value={newCenter.mapLink} onChange={e=>setNewCenter({...newCenter, mapLink: e.target.value})} className="w-full text-sm font-bold p-4 rounded-xl border border-slate-200 outline-none focus:border-indigo-500" placeholder="https://maps.app.goo.gl/..."/>
                  </div>
                  <button onClick={handleAddCenter} className="bg-slate-800 hover:bg-slate-900 text-white text-base font-black py-4 px-4 rounded-xl transition w-full shadow-lg">Kurumu Ekle</button>
                </div>
              </div>

              {/* Kurumları ve Bağlı Mahalleleri Listeleme */}
              <div className="lg:col-span-2 space-y-8">
                {adminCenters.length === 0 ? (
                  <div className="bg-amber-50 border-4 border-amber-100 rounded-3xl p-10 text-center font-bold text-amber-800">
                    Henüz tanımlanmış bir kurum bulunmuyor. Sol taraftan bir Sınav Yeri ekleyin.
                  </div>
                ) : (
                  adminCenters.map(center => {
                    // Bu kuruma bağlı olan mahalleleri bul
                    const mappedHoods = adminMappings.filter(m => m.centerId === center.id);
                    return (
                      <div key={center.id} className="border-4 border-slate-100 rounded-3xl p-6 bg-white relative">
                        <button onClick={() => handleDeleteCenter(center.id)} className="absolute top-6 right-6 text-red-400 hover:text-red-600"><Trash2 className="w-5 h-5"/></button>
                        <h4 className="font-black text-2xl text-slate-800 mb-2">{center.name}</h4>
                        <div className="text-sm font-medium text-slate-500 mb-6 flex items-start">
                          <MapPin className="w-4 h-4 mr-1 flex-shrink-0 text-slate-400 mt-0.5"/> {center.address}
                        </div>

                        {/* Mahalleyi Bu Kuruma Bağla Modülü */}
                        <div className="bg-indigo-50/50 p-5 rounded-2xl border-2 border-indigo-100 mb-6">
                           <h5 className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-3">Bu Kuruma Mahalle Bağla</h5>
                           <div className="flex flex-col sm:flex-row gap-3">
                              <select 
                                className="w-full sm:w-1/4 text-sm font-bold p-3 rounded-xl border border-indigo-200 outline-none focus:border-indigo-500 bg-white"
                                value={mappingData.district}
                                onChange={e => setMappingData({...mappingData, district: e.target.value, neighborhood: '', centerId: center.id})}>
                                <option value="">İlçe Seç</option>
                                {adminDistricts.map(d => <option key={d} value={d}>{d}</option>)}
                              </select>

                              <select 
                                className="w-full sm:w-1/4 text-sm font-bold p-3 rounded-xl border border-indigo-200 outline-none focus:border-indigo-500 bg-white disabled:opacity-50"
                                disabled={!mappingData.district}
                                value={mappingData.neighborhood}
                                onChange={e => setMappingData({...mappingData, neighborhood: e.target.value, centerId: center.id})}>
                                <option value="">Mahalle Seç</option>
                                {adminNeighborhoods.map(hood => (
                                  <option key={hood} value={hood}>{hood} Mah.</option>
                                ))}
                              </select>

                              <input type="tel" value={mappingData.phone} onChange={e=>setMappingData({...mappingData, phone: e.target.value, centerId: center.id})} className="w-full sm:w-1/4 text-sm font-bold p-3 rounded-xl border border-indigo-200 outline-none focus:border-indigo-500 bg-white" placeholder="Özel Tel (05XX)"/>
                              
                              <button onClick={handleAddMapping} disabled={mappingData.centerId !== center.id} className="w-full sm:w-1/4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-black p-3 rounded-xl transition disabled:opacity-50">Bağla</button>
                           </div>
                        </div>

                        {/* Bu Kuruma Bağlı Mahallelerin Listesi */}
                        <div>
                          <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Bağlı Olan Mahalleler ({mappedHoods.length})</h5>
                          <div className="flex flex-wrap gap-3">
                            {mappedHoods.length > 0 ? mappedHoods.map((m, i) => (
                               <div key={i} className="flex items-center bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-sm">
                                  <span className="font-bold text-slate-700 mr-2">{m.neighborhood}</span>
                                  <span className="text-slate-500 font-medium mr-3">{m.phone}</span>
                                  <button onClick={() => handleDeleteMapping(m.neighborhood)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4"/></button>
                               </div>
                            )) : (
                               <span className="text-sm font-medium text-slate-400 italic">Henüz hiç mahalle bağlanmamış.</span>
                            )}
                          </div>
                        </div>

                      </div>
                    )
                  })
                )}
              </div>

            </div>
         </div>
      )}

      {/* 3. SEKMEYE AİT İÇERİKLER: Öğrenci Listesi */}
      {activeTab === 'ogrenci' && (
        <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 p-10 overflow-hidden relative">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <h2 className="text-3xl font-black text-slate-800">Bölge Kayıtları ({filteredStudents.length})</h2>
            <div className="flex flex-wrap gap-3">
              <button className="bg-green-50 font-black px-6 py-3 rounded-2xl text-green-700 border-2 border-green-200 hover:bg-green-100 transition">Excel İndir</button>
              <button 
                onClick={() => setSmsModal({ ...smsModal, isOpen: true })}
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
                    const stdCenter = getNeighborhoodDetails(adminZoneData, student.neighborhood);
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
                              <div className="font-bold text-slate-800">{stdCenter.centerName}</div>
                              <div className="text-xs font-black text-indigo-600">{student.examTitle || student.exam?.title} ({student.selectedDate || student.exam?.date} - {student.selectedTime || student.slot})</div>
                            </>
                          ) : (
                            <span className="text-sm font-bold text-slate-400">Bekleme Havuzunda</span>
                          )}
                        </td>
                        <td className="p-6 flex items-center space-x-3">
                          {hasActiveExam && (
                            <button 
                              onClick={() => setResultModal({ isOpen: true, student, score: '', rank: '' })}
                              className="bg-yellow-100 text-yellow-700 font-black px-4 py-2 rounded-xl text-sm hover:bg-yellow-200 transition"
                            >
                              Sonuç Gir
                            </button>
                          )}
                          <button 
                              onClick={() => handleDeleteStudent(student.firebaseId, student.fullName)}
                              className="text-red-400 hover:text-red-600 bg-white border border-red-200 hover:bg-red-50 p-2 rounded-xl transition"
                              title="Öğrenciyi Sil"
                            >
                              <Trash2 className="w-5 h-5"/>
                          </button>
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

      {/* TOPLU SMS GÖNDERME MODALI */}
      {smsModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] shadow-2xl p-10 w-full max-w-2xl relative animate-in zoom-in-95">
            <button onClick={() => setSmsModal({ ...smsModal, isOpen: false })} className="absolute top-8 right-8 text-slate-400 hover:text-slate-800"><Plus className="w-8 h-8 transform rotate-45"/></button>
            <MessageSquare className="w-16 h-16 text-indigo-500 mx-auto mb-6" />
            <h3 className="text-3xl font-black text-center text-slate-900 mb-2">Akıllı SMS Gönderimi</h3>
            <p className="text-center text-slate-500 font-bold mb-8">Bu bölgedeki kayıtlı öğrencilerin hepsine kendi bilgilerini içeren mesaj atın.</p>
            
            <div className="space-y-6 mb-8">
              <div>
                <label className="block text-sm font-black text-slate-700 mb-3 uppercase tracking-wider">Mesaj Şablonu Seçin</label>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setSmsModal({...smsModal, type: 'announcement'})} className={`p-4 rounded-2xl font-bold border-4 transition-all text-sm ${smsModal.type === 'announcement' ? 'border-indigo-500 bg-indigo-50 text-indigo-800' : 'border-slate-100 text-slate-600 hover:border-slate-200'}`}>Sınav Duyurusu</button>
                  <button onClick={() => setSmsModal({...smsModal, type: 'reminder'})} className={`p-4 rounded-2xl font-bold border-4 transition-all text-sm ${smsModal.type === 'reminder' ? 'border-indigo-500 bg-indigo-50 text-indigo-800' : 'border-slate-100 text-slate-600 hover:border-slate-200'}`}>Sınav Hatırlatması</button>
                  <button onClick={() => setSmsModal({...smsModal, type: 'results'})} className={`p-4 rounded-2xl font-bold border-4 transition-all text-sm ${smsModal.type === 'results' ? 'border-indigo-500 bg-indigo-50 text-indigo-800' : 'border-slate-100 text-slate-600 hover:border-slate-200'}`}>Sonuç ve Randevu</button>
                  <button onClick={() => setSmsModal({...smsModal, type: 'custom'})} className={`p-4 rounded-2xl font-bold border-4 transition-all text-sm ${smsModal.type === 'custom' ? 'border-indigo-500 bg-indigo-50 text-indigo-800' : 'border-slate-100 text-slate-600 hover:border-slate-200'}`}>Özel Mesaj</button>
                </div>
              </div>

              {smsModal.type === 'custom' && (
                <div>
                  <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wider">Özel Mesaj İçeriği</label>
                  <textarea rows="4" value={smsModal.customMsg} onChange={e => setSmsModal({...smsModal, customMsg: e.target.value})} className="w-full border-4 border-slate-100 rounded-2xl px-6 py-4 text-base font-bold focus:border-indigo-500 outline-none resize-none" placeholder="Mesajınızı buraya yazın..." />
                </div>
              )}

              <div className="bg-amber-50 p-5 rounded-2xl border border-amber-200">
                <span className="text-xs font-black text-amber-600 uppercase tracking-widest mb-1 block">Önemli Not</span>
                <p className="text-sm font-bold text-amber-900 leading-relaxed">
                  Seçilen şablonlar, her öğrencinin kendi adını, saatini, sınav merkezini ve o merkezin telefon numarasını otomatik olarak mesaja ekleyerek iletilecektir. Tüm mesajların sonuna yasal zorunluluk olan iptal metni otomatik eklenir.
                </p>
              </div>
            </div>
            
            <button onClick={handleBulkSMS} disabled={smsModal.loading} className="w-full bg-indigo-600 text-white font-black text-xl py-5 rounded-2xl hover:bg-indigo-700 transition shadow-xl shadow-indigo-500/30 flex items-center justify-center">
              {smsModal.loading ? "Gönderiliyor..." : "Tüm Bölgeye Gönder"} {!smsModal.loading && <Send className="ml-3 w-6 h-6"/>}
            </button>
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