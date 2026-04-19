import React, { useState } from 'react';
import { Map, MapPin, ChevronDown, ChevronRight, Plus, FileText, Download, Trash2, Users, Phone } from 'lucide-react';
import { db, appId } from '../../services/firebase';
import { updateDoc, doc } from "firebase/firestore";
import { LOCATIONS } from '../../data/constants';

export default function StatsTab({ zones, setHasMadeChanges }) {
  const [expandedZoneId, setExpandedZoneId] = useState(null);
  const [missingFilterZone, setMissingFilterZone] = useState('All');
  const [missingFilterStatus, setMissingFilterStatus] = useState('All');
  const [exceptionModal, setExceptionModal] = useState({ isOpen: false, center: null, sourceZone: null });
  const [exceptionData, setExceptionData] = useState({ gender: 'Tümü', district: '', neighborhood: '', contactName: '', phone: '' });

  const getZoneTotalHoods = (zone) => {
    let count = 0;
    if (zone.districts) {
      zone.districts.forEach(d => {
        for(let prov in LOCATIONS) {
          if(LOCATIONS[prov][d]) { count += LOCATIONS[prov][d].length; break; }
        }
      });
    }
    if (zone.partialDistricts) {
      Object.keys(zone.partialDistricts).forEach(d => {
        count += zone.partialDistricts[d].length;
      });
    }
    return count;
  };

  const getMissingMappings = () => {
     let missing = [];
     zones.forEach(z => {
        const mappings = z.mappings || [];
        const checkDistrictHood = (dist, hood) => {
           let requiredGenders = ['Erkek', 'Kız', '8. Sınıf Erkek'];
           
           if (dist === 'Körfez' && (hood === '17 Ağustos' || hood === 'Cumhuriyet')) {
               if (z.name === 'Gebze') requiredGenders = ['Erkek']; 
               else if (z.name === 'Akarçeşme') requiredGenders = ['Kız', '8. Sınıf Erkek']; 
           }

           const hoodMappings = mappings.filter(m => m.district === dist && m.neighborhood === hood);
           const hasTumu = hoodMappings.some(m => m.gender === 'Tümü' || !m.gender);

           if (hasTumu) return; 

           let missingGenders = [];
           requiredGenders.forEach(reqGen => {
               if (!hoodMappings.some(m => m.gender === reqGen)) {
                   missingGenders.push(reqGen);
               }
           });
           
           if (missingGenders.length > 0) {
               if (missingGenders.length === requiredGenders.length) {
                   missing.push({ zone: z.name, district: dist, neighborhood: hood, status: 'Hiç Tanımlanmamış', missingGenders });
               } else {
                   missing.push({ zone: z.name, district: dist, neighborhood: hood, status: `Eksik: ${missingGenders.join(', ')}`, missingGenders });
               }
           }
        };

        if (z.districts) {
           z.districts.forEach(d => {
              let hoods = [];
              for(let prov in LOCATIONS) { if(LOCATIONS[prov][d]) hoods = LOCATIONS[prov][d]; }
              hoods.forEach(h => checkDistrictHood(d, h));
           });
        }
        if (z.partialDistricts) {
           Object.keys(z.partialDistricts).forEach(d => {
              z.partialDistricts[d].forEach(h => checkDistrictHood(d, h));
           });
        }
     });
     return missing;
  };

  const getGlobalMissingDistricts = (gender) => {
     const missing = getMissingMappings();
     let filtered = missing;
     if (gender === 'Tümü') filtered = missing.filter(m => m.status === 'Hiç Tanımlanmamış');
     else filtered = missing.filter(m => m.missingGenders && m.missingGenders.includes(gender));
     return [...new Set(filtered.map(m => m.district))].sort();
  };

  const getGlobalMissingNeighborhoods = (district, gender) => {
     if(!district) return [];
     const missing = getMissingMappings();
     let filtered = missing.filter(m => m.district === district);
     
     if (gender === 'Tümü') filtered = filtered.filter(m => m.status === 'Hiç Tanımlanmamış');
     else filtered = filtered.filter(m => m.missingGenders && m.missingGenders.includes(gender));
     
     return filtered.map(m => m.neighborhood).sort();
  };

  const openExceptionModal = (center, sourceZone) => {
     setExceptionModal({ isOpen: true, center, sourceZone });
     setExceptionData({ gender: 'Tümü', district: '', neighborhood: '', contactName: '', phone: '' });
  };

  const handleAddException = async () => {
      const { gender, district, neighborhood, contactName, phone } = exceptionData;
      if(!district || !neighborhood || !gender) return alert("Eksik alan seçtiniz.");
      
      const targetZoneName = getMissingMappings().find(m => m.district === district && m.neighborhood === neighborhood)?.zone;
      const targetZone = zones.find(z => z.name === targetZoneName);
      
      if(!targetZone) return alert("Hedef mıntıka bulunamadı.");

      let newMappings = [...(targetZone.mappings || [])];
      let newCenters = [...(targetZone.centers || [])];

      if (!newCenters.some(c => c.id === exceptionModal.center.id)) {
          newCenters.push(exceptionModal.center);
      }

      // 🚀 YENİ: isException bayrağı eklendi
      const newMapObj = { district, neighborhood, gender, centerId: exceptionModal.center.id, contactName, phone: phone || "0553 973 54 40", isException: true };
      newMappings.push(newMapObj);

      try {
          setHasMadeChanges(true);
          await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'zones', targetZone.id.toString()), { mappings: newMappings, centers: newCenters });
          alert("İstisna ataması başarıyla tamamlandı!");
          setExceptionModal({ isOpen: false, center: null, sourceZone: null });
      } catch(e) { console.error(e) }
  };

  // 🚀 YENİ FONKSİYON: İstisna Silme İşlemi
  const handleDeleteException = async (zoneId, district, neighborhood, gender) => {
      if(!window.confirm(`${district} / ${neighborhood} istisna atamasını silmek istediğinize emin misiniz?`)) return;
      
      try {
          const targetZone = zones.find(z => z.id === zoneId);
          const updatedMappings = targetZone.mappings.filter(m => !(m.district === district && m.neighborhood === neighborhood && m.gender === gender));
          
          setHasMadeChanges(true);
          await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'zones', zoneId.toString()), { mappings: updatedMappings });
      } catch(e) { 
          console.error(e); 
          alert("Silinirken bir hata oluştu.");
      }
  };

  let missingListRaw = getMissingMappings();
  if (missingFilterZone !== 'All') missingListRaw = missingListRaw.filter(m => m.zone === missingFilterZone);
  
  if (missingFilterStatus === 'Hiç Tanımlanmamış') {
      missingListRaw = missingListRaw.filter(m => m.status === 'Hiç Tanımlanmamış');
  } else if (missingFilterStatus !== 'All') {
      missingListRaw = missingListRaw.filter(m => m.missingGenders && m.missingGenders.includes(missingFilterStatus));
  }
  
  const groupedMissing = {};
  missingListRaw.forEach(m => {
      if(!groupedMissing[m.zone]) groupedMissing[m.zone] = [];
      groupedMissing[m.zone].push(m);
  });

  // Excel ve İstisna Listesi İçin Veri Hazırlığı
  let allAssignments = [];
  let exceptionAssignments = []; // 🚀 İstisnaları tutacağımız yeni dizi

  zones.forEach(z => {
      const zMappings = z.mappings || [];
      const zCenters = z.centers || [];
      zMappings.forEach(m => {
          const center = zCenters.find(c => c.id === m.centerId) || {};
          let province = "Bilinmiyor";
          for(let prov in LOCATIONS) {
              if (LOCATIONS[prov][m.district]) { province = prov; break; }
          }
          
          const assignmentObj = {
              zoneId: z.id,
              zoneName: z.name,
              province: province,
              district: m.district,
              neighborhood: m.neighborhood,
              gender: m.gender || "Tümü",
              centerName: center.name || "Kurum Bulunamadı",
              contactName: m.contactName || "-",
              phone: m.phone || "-",
              address: center.address || "-",
              mapLink: center.mapLink || ""
          };

          allAssignments.push(assignmentObj);

          // Eğer manuel isException işaretlenmişse VEYA mahalle o mıntıkanın normal sınırlarında değilse İstisna sayılır
          const isNormalDistrict = z.districts?.includes(m.district) || z.partialDistricts?.[m.district] !== undefined;
          if (m.isException || !isNormalDistrict) {
              exceptionAssignments.push(assignmentObj);
          }
      });
  });

  allAssignments.sort((a, b) => {
      if (a.zoneName !== b.zoneName) return a.zoneName.localeCompare(b.zoneName, 'tr-TR');
      if (a.district !== b.district) return a.district.localeCompare(b.district, 'tr-TR');
      return a.neighborhood.localeCompare(b.neighborhood, 'tr-TR');
  });

  const handleDownloadExcel = () => {
    if (allAssignments.length === 0) return alert("İndirilecek atama bulunmuyor.");

    const tableHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8" />
        <style>
          table { border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; }
          th { background-color: #4f46e5; color: white; font-weight: bold; border: 1px solid #d1d5db; padding: 10px; text-align: left; }
          td { border: 1px solid #d1d5db; padding: 8px; }
          .center { text-align: center; }
        </style>
      </head>
      <body>
        <table>
          <thead>
            <tr>
              <th>Sıra</th>
              <th>Mıntıka</th>
              <th>İl</th>
              <th>İlçe</th>
              <th>Mahalle</th>
              <th class="center">Cinsiyet</th>
              <th>Zimmetli Yurt</th>
              <th>Zimmetli Hocaefendi</th>
              <th>Hocaefendi Tel</th>
              <th>Açık Adres</th>
              <th>Konum Link</th>
            </tr>
          </thead>
          <tbody>
            ${allAssignments.map((a, idx) => `
              <tr>
                <td>${idx + 1}</td>
                <td>${a.zoneName}</td>
                <td>${a.province}</td>
                <td>${a.district}</td>
                <td>${a.neighborhood}</td>
                <td class="center">${a.gender}</td>
                <td>${a.centerName}</td>
                <td>${a.contactName}</td>
                <td>${a.phone !== '-' ? `0${a.phone}` : '-'}</td>
                <td>${a.address}</td>
                <td>${a.mapLink}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Tum_Atamalar_Listesi_${new Date().toLocaleDateString('tr-TR')}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-10">
      <div className="bg-white rounded-[3rem] shadow-xl border-4 border-slate-100 p-8 md:p-12 animate-in fade-in zoom-in-95 duration-300">
        <h3 className="font-black text-3xl text-slate-900 mb-6 flex items-center"><Map className="mr-3 w-8 h-8 text-indigo-600"/> Mıntıka ve Mahalle İstatistikleri</h3>
        
        <div className="overflow-x-auto rounded-3xl border-2 border-slate-100 mb-10">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm uppercase tracking-widest border-b-2 border-slate-100">
                <th className="p-4 font-black">Mıntıka Adı</th>
                <th className="p-4 font-black text-center">Sorumlu Mah.</th>
                <th className="p-4 font-black text-center text-indigo-600">Atanan Mah.</th>
                <th className="p-4 font-black text-center text-blue-600">Erkek S.Yeri</th>
                <th className="p-4 font-black text-center text-orange-600">8. Sınıf Erkek S.Yeri</th>
                <th className="p-4 font-black text-center text-pink-600">Kız S.Yeri</th>
                <th className="p-4 font-black text-center text-emerald-600">Karma (Tümü)</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-50">
              {zones.map(z => {
                const totalHoods = getZoneTotalHoods(z);
                const mappings = z.mappings || [];
                const atananHoods = new Set(mappings.map(m => `${m.district}-${m.neighborhood}`)).size;

                const erkekCenters = new Set(mappings.filter(m => m.gender === 'Erkek').map(m => m.centerId)).size;
                const erkek8Centers = new Set(mappings.filter(m => m.gender === '8. Sınıf Erkek').map(m => m.centerId)).size;
                const kizCenters = new Set(mappings.filter(m => m.gender === 'Kız').map(m => m.centerId)).size;
                const tumuCenters = new Set(mappings.filter(m => m.gender === 'Tümü' || !m.gender).map(m => m.centerId)).size;

                const isExpanded = expandedZoneId === z.id;

                return (
                  <React.Fragment key={z.id}>
                    <tr className="hover:bg-slate-50 cursor-pointer transition-colors" onClick={() => setExpandedZoneId(isExpanded ? null : z.id)}>
                      <td className="p-4 font-black text-slate-800 flex items-center">
                         {isExpanded ? <ChevronDown className="w-5 h-5 mr-2 text-slate-400"/> : <ChevronRight className="w-5 h-5 mr-2 text-slate-400"/>} {z.name}
                      </td>
                      <td className="p-4 font-bold text-slate-600 text-center">{totalHoods}</td>
                      <td className="p-4 font-black text-indigo-600 text-center">{atananHoods}</td>
                      <td className="p-4 font-black text-blue-600 text-center">{erkekCenters}</td>
                      <td className="p-4 font-black text-orange-600 text-center">{erkek8Centers}</td>
                      <td className="p-4 font-black text-pink-600 text-center">{kizCenters}</td>
                      <td className="p-4 font-black text-emerald-600 text-center">{tumuCenters}</td>
                    </tr>
                    {isExpanded && (
                      <tr>
                        <td colSpan="7" className="bg-slate-50/50 p-6 border-b-4 border-slate-100">
                          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                             <h4 className="font-black text-xl mb-4 text-slate-800">{z.name} - Kurum İstatislikleri</h4>
                             {z.centers?.length > 0 ? (
                                <table className="w-full text-sm text-left">
                                   <thead>
                                      <tr className="text-slate-500 uppercase tracking-wider border-b-2 border-slate-100">
                                         <th className="py-3 font-black">Kurum Adı</th>
                                         <th className="py-3 font-black text-center text-blue-600">Erkek Ataması</th>
                                         <th className="py-3 font-black text-center text-orange-600">8. Sınıf Erkek</th>
                                         <th className="py-3 font-black text-center text-pink-600">Kız Ataması</th>
                                         <th className="py-3 font-black text-center text-emerald-600">Karma Ataması</th>
                                         <th className="py-3 font-black text-right">İşlem</th>
                                      </tr>
                                   </thead>
                                   <tbody className="divide-y divide-slate-100">
                                      {z.centers.map(c => {
                                         const cMap = mappings.filter(m => m.centerId === c.id);
                                         const cErkek = cMap.filter(m => m.gender === 'Erkek').length;
                                         const cErkek8 = cMap.filter(m => m.gender === '8. Sınıf Erkek').length;
                                         const cKiz = cMap.filter(m => m.gender === 'Kız').length;
                                         const cTumu = cMap.filter(m => m.gender === 'Tümü' || !m.gender).length;
                                         return (
                                            <tr key={c.id} className="hover:bg-slate-50">
                                               <td className="py-3 font-bold text-slate-700">{c.name}</td>
                                               <td className="py-3 text-center font-black text-blue-600">{cErkek}</td>
                                               <td className="py-3 text-center font-black text-orange-600">{cErkek8}</td>
                                               <td className="py-3 text-center font-black text-pink-600">{cKiz}</td>
                                               <td className="py-3 text-center font-black text-emerald-600">{cTumu}</td>
                                               <td className="py-3 text-right">
                                                  <button onClick={(e) => { e.stopPropagation(); openExceptionModal(c, z); }} className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-xl font-bold text-xs hover:bg-indigo-200 transition">
                                                     İstisna Atama
                                                  </button>
                                               </td>
                                            </tr>
                                         )
                                      })}
                                   </tbody>
                                </table>
                             ) : (
                                <p className="text-slate-500 font-bold text-sm bg-slate-50 p-4 rounded-xl border border-slate-100">Bu mıntıkada henüz kurum bulunmuyor.</p>
                             )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 mb-6 pt-10 border-t-2 border-slate-100">
           <h3 className="text-2xl font-black text-slate-800">Sınav Yeri Tanımlanmamış / Eksik Mahalleler</h3>
           <div className="flex flex-wrap gap-4">
              <select value={missingFilterZone} onChange={e=>setMissingFilterZone(e.target.value)} className="p-3 border-2 border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-indigo-500">
                 <option value="All">Tüm Mıntıkalar</option>
                 {zones.map(z => <option key={z.id} value={z.name}>{z.name}</option>)}
              </select>
              <select value={missingFilterStatus} onChange={e=>setMissingFilterStatus(e.target.value)} className="p-3 border-2 border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-indigo-500">
                 <option value="All">Tüm Durumlar (Tüm Eksikler)</option>
                 <option value="Hiç Tanımlanmamış">Hiç Atama Yapılmamış Olanlar</option>
                 <option value="Erkek">Erkek Ataması Eksik Olanlar</option>
                 <option value="Kız">Kız Ataması Eksik Olanlar</option>
                 <option value="8. Sınıf Erkek">8. Sınıf Erkek Ataması Eksik Olanlar</option>
              </select>
           </div>
        </div>

        {Object.keys(groupedMissing).length > 0 ? (
           Object.keys(groupedMissing).map(zoneName => (
              <div key={zoneName} className="mb-10">
                 <h4 className="font-black text-xl text-indigo-900 mb-4 bg-indigo-50 p-4 rounded-2xl border border-indigo-100">{zoneName} Eksiklikleri</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                   {groupedMissing[zoneName].map((m, idx) => (
                     <div key={idx} className="bg-red-50 border border-red-100 p-4 rounded-2xl flex flex-col shadow-sm">
                       <span className="font-bold text-slate-800">{m.district} / {m.neighborhood}</span>
                       <span className="mt-2 text-sm font-black text-red-600 bg-red-100 px-3 py-1 rounded-lg w-max">{m.status}</span>
                     </div>
                   ))}
                 </div>
              </div>
           ))
        ) : (
           <div className="text-center py-10 font-bold text-emerald-500 bg-emerald-50 rounded-2xl border border-emerald-100">
              Bu filtreye uygun eksik mahalle bulunamadı!
           </div>
        )}

        {exceptionModal.isOpen && (
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[3rem] shadow-2xl p-10 w-full max-w-2xl relative animate-in zoom-in-95">
              <button onClick={() => setExceptionModal({ isOpen: false, center: null, sourceZone: null })} className="absolute top-8 right-8 text-slate-400 hover:text-slate-800"><Plus className="w-8 h-8 transform rotate-45"/></button>
              <Map className="w-16 h-16 text-indigo-500 mx-auto mb-6" />
              <h3 className="text-3xl font-black text-center text-slate-900 mb-2">İstisna Mahalle Ataması</h3>
              <p className="text-center text-slate-500 font-bold mb-8">
                <strong className="text-indigo-600">{exceptionModal.center?.name}</strong> kurumuna, farklı mıntıkalardan eksik kalan mahalleleri atayabilirsiniz.
              </p>
              
              <div className="space-y-4 mb-8">
                 <select 
                   className="w-full text-sm font-bold p-4 rounded-xl border border-indigo-200 outline-none focus:border-indigo-500 bg-white"
                   value={exceptionData.gender}
                   onChange={e => setExceptionData({...exceptionData, gender: e.target.value, district: '', neighborhood: ''})}>
                   <option value="Tümü">Tümü (Karma)</option>
                   <option value="Erkek">Erkek</option>
                   <option value="Kız">Kız</option>
                   <option value="8. Sınıf Erkek">8. Sınıf Erkek</option>
                 </select>

                 <select 
                   className="w-full text-sm font-bold p-4 rounded-xl border border-indigo-200 outline-none focus:border-indigo-500 bg-white disabled:opacity-50"
                   value={exceptionData.district}
                   onChange={e => setExceptionData({...exceptionData, district: e.target.value, neighborhood: ''})}>
                   <option value="">Atanmamış İlçe Seçin (Türkiye Geneli)</option>
                   {getGlobalMissingDistricts(exceptionData.gender).map(d => <option key={d} value={d}>{d}</option>)}
                 </select>

                 <select 
                   className="w-full text-sm font-bold p-4 rounded-xl border border-indigo-200 outline-none focus:border-indigo-500 bg-white disabled:opacity-50"
                   disabled={!exceptionData.district}
                   value={exceptionData.neighborhood}
                   onChange={e => setExceptionData({...exceptionData, neighborhood: e.target.value})}>
                   <option value="">Eksik Mahalle Seçin</option>
                   {getGlobalMissingNeighborhoods(exceptionData.district, exceptionData.gender).map(h => <option key={h} value={h}>{h} Mah.</option>)}
                 </select>

                 <input type="text" value={exceptionData.contactName} onChange={e=>setExceptionData({...exceptionData, contactName: e.target.value})} className="w-full text-sm font-bold p-4 rounded-xl border border-indigo-200 outline-none focus:border-indigo-500 bg-white" placeholder="Sorumlu İsim"/>
                 <input type="tel" value={exceptionData.phone} onChange={e=>setExceptionData({...exceptionData, phone: e.target.value})} className="w-full text-sm font-bold p-4 rounded-xl border border-indigo-200 outline-none focus:border-indigo-500 bg-white" placeholder="Sorumlu Tel"/>
              </div>
              
              <button onClick={handleAddException} disabled={!exceptionData.district || !exceptionData.neighborhood || !exceptionData.gender} className="w-full bg-indigo-600 text-white font-black text-xl py-5 rounded-2xl hover:bg-indigo-700 transition shadow-xl shadow-indigo-500/30 flex items-center justify-center disabled:opacity-50">
                İstisna Atamasını Tamamla
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 🚀 YENİ BÖLÜM: Kayıtlı İstisna (Paylaşımlı) Mahalleler Listesi */}
      <div className="bg-white rounded-[3rem] shadow-xl border-4 border-slate-100 p-8 md:p-12 animate-in fade-in zoom-in-95 duration-300">
          <h3 className="font-black text-3xl text-slate-900 mb-2 flex items-center"><MapPin className="mr-3 w-8 h-8 text-amber-500"/> Paylaşımlı (İstisna) Atanan Mahalleler</h3>
          <p className="text-slate-500 font-bold mb-8">Kendi mıntıkası dışında, başka bir mıntıkanın kurumuna atanan mahallelerin listesi.</p>
          
          {exceptionAssignments.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                 {exceptionAssignments.map((exc, idx) => {
                     let p = String(exc.phone || "").replace(/\D/g, '');
                     return (
                       <div key={idx} className="bg-amber-50 border-2 border-amber-200 p-5 rounded-3xl relative group hover:shadow-lg transition-all">
                          <button 
                             onClick={() => handleDeleteException(exc.zoneId, exc.district, exc.neighborhood, exc.gender)}
                             className="absolute top-4 right-4 bg-white p-2 rounded-xl text-red-400 hover:text-white hover:bg-red-500 shadow-sm transition-colors"
                             title="İstisna Atamasını Sil"
                          >
                             <Trash2 className="w-5 h-5" />
                          </button>
                          
                          <div className="pr-12">
                             <div className="flex items-center gap-2 mb-2">
                                <span className="bg-amber-200 text-amber-800 text-xs font-black px-2 py-1 rounded-lg uppercase">{exc.zoneName} Mıntıkasına Bağlandı</span>
                             </div>
                             <h4 className="font-black text-xl text-slate-800">{exc.district} / {exc.neighborhood}</h4>
                             <p className="text-sm font-bold text-indigo-600 mb-3 flex items-center"><MapPin className="w-4 h-4 mr-1"/> {exc.centerName} <span className="ml-2 bg-indigo-100 px-2 py-0.5 rounded-md text-xs">{exc.gender}</span></p>
                             
                             <div className="bg-white p-3 rounded-2xl border border-amber-100 text-sm">
                                <p className="font-bold text-slate-700 flex items-center mb-1"><Users className="w-4 h-4 mr-2 text-slate-400"/> {exc.contactName || "İsim Yok"}</p>
                                <p className="font-bold text-slate-700 flex items-center"><Phone className="w-4 h-4 mr-2 text-slate-400"/> 0{p}</p>
                             </div>
                          </div>
                       </div>
                     )
                 })}
              </div>
          ) : (
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-10 text-center">
                  <p className="text-slate-500 font-bold">Şu an aktif bir istisna ataması bulunmuyor.</p>
              </div>
          )}
      </div>

      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-[3rem] shadow-xl p-8 md:p-12 text-white flex flex-col md:flex-row justify-between items-center animate-in fade-in zoom-in-95 duration-300">
        <div className="mb-6 md:mb-0 text-center md:text-left">
           <h3 className="font-black text-3xl mb-2 flex items-center justify-center md:justify-start">
             <FileText className="mr-3 w-8 h-8 opacity-80"/> Tüm Atamalar Detaylı Liste
           </h3>
           <p className="text-emerald-100 font-bold text-lg">Sıra, Mıntıka, İlçe, Mahalle, Zimmetli Yurt ve Sorumlu bilgilerini Excel olarak indirebilirsiniz.</p>
        </div>
        <button 
           onClick={handleDownloadExcel} 
           className="bg-white text-emerald-600 font-black text-xl py-5 px-10 rounded-2xl hover:scale-105 hover:shadow-2xl transition flex items-center"
        >
           <Download className="w-6 h-6 mr-3"/> Excel Olarak İndir
        </button>
      </div>

    </div>
  )
}