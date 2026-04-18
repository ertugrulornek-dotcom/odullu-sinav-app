import React, { useState, useEffect } from 'react';
import { Building2, FileText, Edit3, Trash2, MapPin, Users, Save, X, Filter, Phone } from 'lucide-react';
import { db, appId } from '../../services/firebase';
import { updateDoc, doc } from "firebase/firestore";
import { LOCATIONS } from '../../data/constants';
import { normalizeForSearch } from '../../utils/helpers';

export default function CentersTab({ adminZoneData, adminZoneId, setHasMadeChanges }) {
  const [localCenters, setLocalCenters] = useState([]);
  const [localMappings, setLocalMappings] = useState([]);

  useEffect(() => {
     setLocalCenters(adminZoneData.centers || []);
     setLocalMappings(adminZoneData.mappings || []);
  }, [adminZoneData]);
  
  const [newCenter, setNewCenter] = useState({ name: '', address: '', mapLink: '' });
  const [mappingData, setMappingData] = useState({ district: '', neighborhood: '', centerId: '', gender: '', contactName: '', phone: '' });
  const [bulkExcelData, setBulkExcelData] = useState("");
  const [editingCenter, setEditingCenter] = useState(null);
  const [displayFilter, setDisplayFilter] = useState('All');

  const getAdminDistricts = () => {
    const dists = [...(adminZoneData.districts || [])];
    if(adminZoneData.partialDistricts) {
      Object.keys(adminZoneData.partialDistricts).forEach(d => {
        if(!dists.includes(d)) dists.push(d);
      });
    }
    return dists.sort();
  };

  const getAdminUnmappedNeighborhoods = (district, gender) => {
    if(!district || !gender) return [];
    let allHoods = [];
    if(adminZoneData.partialDistricts && adminZoneData.partialDistricts[district]) {
      allHoods = adminZoneData.partialDistricts[district];
    } else {
      for(let prov in LOCATIONS) {
         if(LOCATIONS[prov][district]) { allHoods = LOCATIONS[prov][district]; break; }
      }
    }
    
    return allHoods.filter(hood => {
       if (district === 'Körfez' && (hood === '17 Ağustos' || hood === 'Cumhuriyet')) {
          if (adminZoneData.name === 'Gebze' && (gender === 'Kız' || gender === '8. Sınıf Erkek' || gender === 'Tümü')) return false;
          if (adminZoneData.name === 'Akarçeşme' && (gender === 'Erkek' || gender === 'Tümü')) return false; 
       }
       if (district === 'Adapazarı' && hood === 'Maltepe') {
          if (adminZoneData.name === 'Adapazarı' && (gender === 'Erkek' || gender === 'Tümü')) return false; 
          if (adminZoneData.name === 'Serdivan' && (gender === 'Kız' || gender === '8. Sınıf Erkek' || gender === 'Tümü')) return false; 
       }

       const hoodMappings = localMappings.filter(m => m.district === district && m.neighborhood === hood);
       const hasTumu = hoodMappings.some(m => m.gender === 'Tümü' || !m.gender);
       const hasErkek = hoodMappings.some(m => m.gender === 'Erkek');
       const hasKiz = hoodMappings.some(m => m.gender === 'Kız');
       const has8Erkek = hoodMappings.some(m => m.gender === '8. Sınıf Erkek');

       if (hasTumu) return false; 
       if (gender === 'Tümü') return !(hasErkek || hasKiz || has8Erkek);
       if (gender === 'Erkek') return !hasErkek;
       if (gender === 'Kız') return !hasKiz;
       if (gender === '8. Sınıf Erkek') return !has8Erkek;
       return true;
    }).sort();
  };

  const adminDistricts = getAdminDistricts();

  const formatPhoneNumber = (phoneRaw) => {
      let phone = String(phoneRaw || "").replace(/\D/g, '');
      if (phone.startsWith('90')) phone = phone.substring(2);
      if (phone.startsWith('0')) phone = phone.substring(1);
      if (phone.length > 0 && !phone.startsWith('5')) phone = '5' + phone;
      if (phone.length > 10) phone = phone.substring(0, 10);
      return phone;
  };

  const contactPresets = localMappings
    .filter(m => m.centerId === mappingData.centerId && m.contactName)
    .map(m => ({ name: m.contactName, phone: m.phone }));
  
  const uniquePresets = Array.from(new Set(contactPresets.map(p => p.name))).map(name => {
    return contactPresets.find(p => p.name === name);
  });

  const handleAddCenter = async () => {
    if(!newCenter.name || !newCenter.address) return alert("Kurum adı ve açık adres zorunludur.");
    try {
      const centerObj = { id: "c_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9), name: newCenter.name, address: newCenter.address, mapLink: newCenter.mapLink || "" };
      const updatedCenters = [...localCenters, centerObj];
      setLocalCenters(updatedCenters); setHasMadeChanges(true);
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'zones', adminZoneId.toString()), { centers: updatedCenters });
      setNewCenter({ name: '', address: '', mapLink: '' });
    } catch (e) { console.error(e); alert("Hata oluştu"); }
  };

  const handleUpdateCenter = async (e) => {
    e.preventDefault();
    if(!editingCenter.name || !editingCenter.address) return alert("Adres ve isim zorunludur.");
    try {
      const updatedCenters = localCenters.map(c => c.id === editingCenter.id ? editingCenter : c);
      setLocalCenters(updatedCenters); setHasMadeChanges(true);
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'zones', adminZoneId.toString()), { centers: updatedCenters });
      setEditingCenter(null);
    } catch(err) { console.error(err); }
  };

  const handleDeleteCenter = async (centerId) => {
    if(!window.confirm("Bu kurumu silmek istediğinize emin misiniz?")) return;
    try {
      const updatedCenters = localCenters.filter(c => c.id !== centerId);
      const updatedMappings = localMappings.filter(m => m.centerId !== centerId); 
      setLocalCenters(updatedCenters); setLocalMappings(updatedMappings); setHasMadeChanges(true);
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'zones', adminZoneId.toString()), { centers: updatedCenters, mappings: updatedMappings });
    } catch (e) { console.error(e); }
  };

  const handleAddMapping = async () => {
    if(!mappingData.gender || !mappingData.district || !mappingData.neighborhood || !mappingData.centerId) return alert("Lütfen Cinsiyet, İlçe, Mahalle ve atanacak kurumu seçin.");
    try {
      const newMappings = [...localMappings];
      const existingIndex = newMappings.findIndex(m => m.district === mappingData.district && m.neighborhood === mappingData.neighborhood && m.gender === mappingData.gender);
      const cleanedPhone = formatPhoneNumber(mappingData.phone) || "5539735440";
      const newMapObj = { district: mappingData.district, neighborhood: mappingData.neighborhood, gender: mappingData.gender, centerId: mappingData.centerId, contactName: mappingData.contactName || "", phone: cleanedPhone };

      if (existingIndex >= 0) newMappings[existingIndex] = newMapObj;
      else newMappings.push(newMapObj);
      
      setLocalMappings(newMappings); setHasMadeChanges(true);
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'zones', adminZoneId.toString()), { mappings: newMappings });
      alert(`${mappingData.district} / ${mappingData.neighborhood} (${mappingData.gender}) atandı!`);
      setMappingData({ ...mappingData, neighborhood: '', contactName: '', phone: '' }); 
    } catch (e) { console.error(e); }
  };

  const handleBulkUploadExcel = async () => {
    if(!bulkExcelData.trim()) return alert("Lütfen veriyi yapıştırın.");
    const rows = bulkExcelData.split('\n');
    let updatedCenters = [...localCenters];
    let updatedMappings = [...localMappings];
    let successCount = 0;
    let errors = [];

    for (let i = 0; i < rows.length; i++) {
       let row = rows[i];
       if(!row.trim()) continue;
       const cols = row.split('\t');
       if(cols.length < 3) { errors.push(`Satır ${i+1}: Sütunlar eksik.`); continue; }
       
       let rawDistrict = cols[0]?.trim();
       let rawNeighborhood = cols[1]?.trim();
       if (rawDistrict.includes('/') && !rawNeighborhood) {
           const parts = rawDistrict.split('/');
           rawDistrict = parts[0].trim();
           rawNeighborhood = parts[1].trim();
       }

       let rawGender = "Tümü";
       let colOffset = 2; 
       if (cols.length > 3) {
           const potentialGender = String(cols[2] || '').trim().toLowerCase();
           if (potentialGender === 'erkek' || potentialGender === 'sadece erkek') { rawGender = 'Erkek'; colOffset = 3; } 
           else if (potentialGender === 'kız' || potentialGender === 'kiz' || potentialGender === 'sadece kız') { rawGender = 'Kız'; colOffset = 3; } 
           else if (['tümü', 'tumu', 'karma'].includes(potentialGender)) { rawGender = 'Tümü'; colOffset = 3; } 
           else if (potentialGender.includes('8') && (potentialGender.includes('sınıf') || potentialGender.includes('sinif') || potentialGender.includes('erkek'))) { rawGender = '8. Sınıf Erkek'; colOffset = 3; } 
           else if (potentialGender === '8' || potentialGender === '8.') { rawGender = '8. Sınıf Erkek'; colOffset = 3; }
       }

       let centerName = cols[colOffset]?.trim();
       let contactName = cols[colOffset+1] ? cols[colOffset+1].trim() : "";
       let phone = cols[colOffset+2] ? cols[colOffset+2].trim() : "";
       let address = cols[colOffset+3] ? cols[colOffset+3].trim() : "";
       let mapLink = cols[colOffset+4] ? cols[colOffset+4].trim() : "";

       if (!rawDistrict || !rawNeighborhood || !centerName) { errors.push(`Satır ${i+1}: İlçe, Mahalle veya Kurum Adı boş olamaz.`); continue; }

       const cleanedPhone = formatPhoneNumber(phone) || "5539735440";
       const normDistrict = normalizeForSearch(rawDistrict);
       const normNeighborhood = normalizeForSearch(rawNeighborhood);
       const matchedDistrict = adminDistricts.find(d => normalizeForSearch(d) === normDistrict);
       
       let matchedNeighborhood = null;
       if (matchedDistrict) {
           let allHoodsForDistrict = [];
           if(adminZoneData.partialDistricts && adminZoneData.partialDistricts[matchedDistrict]) allHoodsForDistrict = adminZoneData.partialDistricts[matchedDistrict];
           else for(let prov in LOCATIONS) { if(LOCATIONS[prov][matchedDistrict]) { allHoodsForDistrict = LOCATIONS[prov][matchedDistrict]; break; } }
           matchedNeighborhood = allHoodsForDistrict.find(h => normalizeForSearch(h) === normNeighborhood);
       }

       if (!matchedDistrict || !matchedNeighborhood) { errors.push(`Satır ${i+1}: Veritabanında "${rawDistrict}" ilçesinde "${rawNeighborhood}" bulunamadı.`); continue; }
       
       let center = updatedCenters.find(c => normalizeForSearch(c.name) === normalizeForSearch(centerName));
       if(!center) {
          center = { id: "c_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9), name: centerName, address: address || `${matchedDistrict} / ${matchedNeighborhood}`, mapLink: mapLink };
          updatedCenters.push(center);
       }
       
       const existingMapIndex = updatedMappings.findIndex(m => m.district === matchedDistrict && m.neighborhood === matchedNeighborhood && m.gender === rawGender);
       const newMapObj = { district: matchedDistrict, neighborhood: matchedNeighborhood, gender: rawGender, centerId: center.id, contactName, phone: cleanedPhone };
       
       if(existingMapIndex >= 0) updatedMappings[existingIndex] = newMapObj;
       else updatedMappings.push(newMapObj);
       
       successCount++;
    }

    if (errors.length > 0) alert("Eksik/Hatalı satırlar atlandı:\n" + errors.join('\n'));
    if (successCount > 0) {
      try {
        setLocalCenters(updatedCenters); setLocalMappings(updatedMappings); setHasMadeChanges(true);
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'zones', adminZoneId.toString()), { centers: updatedCenters, mappings: updatedMappings });
        alert(`${successCount} adet mahalle ataması başarıyla kaydedildi.`);
        setBulkExcelData("");
      } catch(err) { console.error(err); alert("Hata oluştu."); }
    } else { alert("Hiç geçerli veri bulunamadı."); }
  };

  const handleDeleteMapping = async (district, neighborhood, gender) => {
    try {
      const updatedMappings = localMappings.filter(m => !(m.district === district && m.neighborhood === neighborhood && m.gender === gender));
      setLocalMappings(updatedMappings); setHasMadeChanges(true);
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'zones', adminZoneId.toString()), { mappings: updatedMappings });
    } catch (e) { console.error(e); }
  };

  const filteredCenters = localCenters.filter(center => {
      if (displayFilter === 'All') return true;
      return localMappings.some(m => m.centerId === center.id && (m.gender === displayFilter || (!m.gender && displayFilter === 'Tümü')));
  });

  // 🚀 ZEKİ FİLTRELEME: Cinsiyet seçimine göre Kurumları Alfabetik Sırala
  const availableCentersForDropdown = localCenters.filter(c => {
      if (!mappingData.gender) return true; 
      const cMappings = localMappings.filter(m => m.centerId === c.id);
      if (cMappings.length === 0) return true; 
      return cMappings.some(m => m.gender === mappingData.gender); 
  }).sort((a, b) => a.name.localeCompare(b.name, 'tr-TR'));

  return (
    <div className="bg-white rounded-[3rem] shadow-xl border-4 border-slate-100 p-8 md:p-12 animate-in fade-in zoom-in-95 duration-300">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 border-b-2 border-slate-100 pb-8 gap-4">
          <div>
            <h3 className="font-black text-3xl text-slate-900 mb-2">Sınav Yerleri ve Atamalar</h3>
            <p className="text-base font-bold text-slate-500">Mıntıkaya yeni kurumlar ekleyin ve mahalleleri atayın.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-1 space-y-8">
             <div>
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
                    <input type="url" value={newCenter.mapLink} onChange={e=>setNewCenter({...newCenter, mapLink: e.target.value})} className="w-full text-sm font-bold p-4 rounded-xl border border-slate-200 outline-none focus:border-indigo-500" placeholder="http://maps.google.com/0..."/>
                  </div>
                  <button onClick={handleAddCenter} className="bg-slate-800 hover:bg-slate-900 text-white text-base font-black py-4 px-4 rounded-xl transition w-full shadow-lg">Kurumu Ekle</button>
                </div>
             </div>

             <div>
                <div className="text-sm font-black text-emerald-600 uppercase mb-4 tracking-wider flex items-center"><MapPin className="w-6 h-6 mr-2"/> Kuruma Mahalle Ata</div>
                <div className="space-y-3 bg-emerald-50 p-6 rounded-3xl border-2 border-emerald-100">
                  {/* 🚀 DEĞİŞİKLİK: Önce Cinsiyet, Sonra Kurum */}
                  <select value={mappingData.gender} onChange={e=>setMappingData({...mappingData, gender: e.target.value, neighborhood: ''})} className="w-full text-sm font-bold p-3 rounded-xl border border-emerald-200 outline-none focus:border-emerald-500 bg-white">
                    <option value="">Cinsiyet Seçin</option>
                    <option value="Tümü">Tümü (Karma)</option>
                    <option value="Erkek">Sadece Erkek (3-7. Sınıf)</option>
                    <option value="Kız">Sadece Kız (Tüm Sınıflar)</option>
                    <option value="8. Sınıf Erkek">8. Sınıf Erkek (Özel)</option>
                  </select>
                  <select value={mappingData.centerId} onChange={e=>setMappingData({...mappingData, centerId: e.target.value})} className="w-full text-sm font-bold p-3 rounded-xl border border-emerald-200 outline-none focus:border-emerald-500 bg-white">
                    <option value="">Kurum Seçin</option>
                    {availableCentersForDropdown.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  
                  <div className="flex gap-2">
                    <select value={mappingData.district} onChange={e=>setMappingData({...mappingData, district: e.target.value, neighborhood: ''})} className="flex-1 text-sm font-bold p-3 rounded-xl border border-emerald-200 outline-none focus:border-emerald-500 bg-white">
                      <option value="">İlçe Seçin</option>
                      {adminDistricts.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <select value={mappingData.neighborhood} onChange={e=>setMappingData({...mappingData, neighborhood: e.target.value})} disabled={!mappingData.district || !mappingData.gender} className="flex-1 text-sm font-bold p-3 rounded-xl border border-emerald-200 outline-none focus:border-emerald-500 bg-white">
                      <option value="">Mahalle Seçin</option>
                      {getAdminUnmappedNeighborhoods(mappingData.district, mappingData.gender).map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    {uniquePresets.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-1">
                        <span className="text-xs font-bold text-emerald-700/60 w-full">Önceki Hocalar:</span>
                        {uniquePresets.map(preset => (
                          <button 
                            key={preset.name} type="button"
                            onClick={() => setMappingData({...mappingData, contactName: preset.name, phone: preset.phone})}
                            className="text-[10px] bg-white border border-emerald-300 text-emerald-700 px-2 py-1.5 rounded-lg hover:bg-emerald-100 font-bold transition shadow-sm"
                          >
                            + {preset.name}
                          </button>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <input type="text" value={mappingData.contactName} onChange={e=>setMappingData({...mappingData, contactName: e.target.value})} className="w-1/2 text-sm font-bold p-3 rounded-xl border border-emerald-200 outline-none focus:border-emerald-500 bg-white" placeholder="Sorumlu İsim"/>
                      <input type="tel" value={mappingData.phone} onChange={e=>{
                          let val = e.target.value.replace(/\D/g, '');
                          if (val.startsWith('90')) val = val.substring(2);
                          if (val.startsWith('0')) val = val.substring(1);
                          setMappingData({...mappingData, phone: val});
                      }} className="w-1/2 text-sm font-bold p-3 rounded-xl border border-emerald-200 outline-none focus:border-emerald-500 bg-white" placeholder="Sorumlu Tel"/>
                    </div>
                  </div>
                  <button onClick={handleAddMapping} disabled={!mappingData.centerId || !mappingData.neighborhood || !mappingData.gender} className="w-full bg-emerald-600 text-white font-black py-3 rounded-xl hover:bg-emerald-700 transition shadow-md disabled:opacity-50">Mahalleyi Kuruma Ata</button>
                </div>
             </div>

             <div>
                <div className="text-sm font-black text-indigo-600 uppercase mb-4 tracking-wider flex items-center"><FileText className="w-6 h-6 mr-2"/> Toplu Ekle (Excel'den Yapıştır)</div>
                <div className="space-y-4 bg-slate-50 p-6 rounded-3xl border-2 border-slate-100">
                   <p className="text-xs font-bold text-slate-500 mb-2">Sütunlar:<br/><b>İlçe | Mahalle | Cinsiyet (Kız/Erkek/8. Sınıf Erkek/Tümü) | Kurum | Sorumlu | Tel | Adres | Harita</b></p>
                   <textarea 
                     rows="5" 
                     value={bulkExcelData}
                     onChange={e => setBulkExcelData(e.target.value)}
                     className="w-full text-xs font-mono p-4 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 resize-none whitespace-pre" 
                     placeholder="Gebze	Akarçeşme	8. Sınıf Erkek	Şekerpınar Eğitim..."/>
                   <button onClick={handleBulkUploadExcel} className="bg-slate-800 hover:bg-slate-900 text-white text-base font-black py-4 px-4 rounded-xl transition w-full shadow-lg">Excel Verilerini İçe Aktar</button>
                </div>
             </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-2xl border-2 border-slate-100 shadow-sm gap-4">
               <h4 className="font-black text-slate-800 text-lg flex items-center"><MapPin className="w-5 h-5 mr-2 text-indigo-500"/> Kayıtlı Merkezler</h4>
               <div className="flex items-center">
                  <Filter className="w-5 h-5 mr-2 text-slate-400" />
                  <select value={displayFilter} onChange={e => setDisplayFilter(e.target.value)} className="p-2 border-2 border-indigo-100 rounded-xl text-sm font-bold outline-none focus:border-indigo-500 bg-indigo-50 text-indigo-800">
                     <option value="All">Tüm Atamaları Göster</option>
                     <option value="Tümü">Sadece Karma (Tümü) Olanlar</option>
                     <option value="Erkek">Sadece Erkek Ataması Olanlar</option>
                     <option value="Kız">Sadece Kız Ataması Olanlar</option>
                     <option value="8. Sınıf Erkek">Sadece 8. Sınıf Erkek Olanlar</option>
                  </select>
               </div>
            </div>

            {filteredCenters.length === 0 ? (
              <div className="bg-amber-50 border-4 border-amber-100 rounded-3xl p-10 text-center font-bold text-amber-800">
                Seçili filtreye uygun atanmış bir kurum bulunmuyor.
              </div>
            ) : (
              filteredCenters.map(center => {
                let mappedHoods = localMappings.filter(m => m.centerId === center.id);
                if (displayFilter !== 'All') {
                   mappedHoods = mappedHoods.filter(m => m.gender === displayFilter || (!m.gender && displayFilter === 'Tümü'));
                }
                
                if (editingCenter?.id === center.id) {
                   return (
                      <div key={center.id} className="border-4 border-indigo-400 rounded-3xl p-6 bg-indigo-50 relative">
                         <h4 className="font-black text-xl text-indigo-900 mb-4">Kurumu Düzenle</h4>
                         <form onSubmit={handleUpdateCenter} className="space-y-3">
                            <div><label className="text-xs font-bold text-slate-500 uppercase ml-1 block">Kurum Adı</label><input type="text" value={editingCenter.name} onChange={e=>setEditingCenter({...editingCenter, name: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200" required/></div>
                            <div><label className="text-xs font-bold text-slate-500 uppercase ml-1 block">Adres</label><input type="text" value={editingCenter.address} onChange={e=>setEditingCenter({...editingCenter, address: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200" required/></div>
                            <div><label className="text-xs font-bold text-slate-500 uppercase ml-1 block">Harita Linki</label><input type="text" value={editingCenter.mapLink} onChange={e=>setEditingCenter({...editingCenter, mapLink: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200"/></div>
                            <div className="flex gap-3 mt-4">
                               <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold flex items-center"><Save className="w-4 h-4 mr-2"/> Kaydet</button>
                               <button type="button" onClick={() => setEditingCenter(null)} className="bg-slate-200 text-slate-700 px-6 py-2 rounded-xl font-bold flex items-center"><X className="w-4 h-4 mr-2"/> İptal</button>
                            </div>
                         </form>
                      </div>
                   )
                }

                return (
                  <div key={center.id} className="border-4 border-slate-100 rounded-3xl p-6 bg-white relative group animate-in fade-in zoom-in-95 duration-300">
                    <div className="absolute top-6 right-6 flex gap-2">
                       <button onClick={() => setEditingCenter(center)} className="p-2 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="Düzenle"><Edit3 className="w-5 h-5"/></button>
                       <button onClick={() => handleDeleteCenter(center.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Sil"><Trash2 className="w-5 h-5"/></button>
                    </div>
                    <h4 className="font-black text-2xl text-slate-800 mb-2 pr-20">{center.name}</h4>
                    <div className="text-sm font-medium text-slate-500 mb-6 flex items-start">
                      <MapPin className="w-4 h-4 mr-1 flex-shrink-0 text-slate-400 mt-0.5"/> {center.address}
                    </div>

                    <div>
                      <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Bağlı Olan Mahalleler ({mappedHoods.length})</h5>
                      <div className="flex flex-wrap gap-3">
                        {mappedHoods.length > 0 ? mappedHoods.map((m, i) => {
                           let p = String(m.phone || "").replace(/\D/g, '');
                           if (p.startsWith('90')) p = p.substring(2);
                           if (p.startsWith('0')) p = p.substring(1);
                           if (p.length === 0) p = "5539735440";

                           return (
                             <div key={i} className="flex flex-col bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-sm relative group/item hover:shadow-md transition">
                                <span className="font-black text-slate-800 mb-1">{m.district} / {m.neighborhood} <span className="text-xs ml-1 text-indigo-500 bg-indigo-100 px-2 py-0.5 rounded-md">{m.gender || 'Tümü'}</span></span>
                                
                                <span className="text-slate-500 font-medium text-xs flex items-center mt-1">
                                   <Users className="w-3 h-3 inline mr-1"/>{m.contactName || 'İsimsiz'} - 
                                   <a href={`tel:+90${p}`} className="ml-1 text-indigo-500 hover:text-indigo-700 underline underline-offset-2 flex items-center">
                                       <Phone className="w-3 h-3 mr-0.5"/> 0{p}
                                   </a>
                                </span>

                                <button onClick={() => handleDeleteMapping(m.district, m.neighborhood, m.gender)} className="absolute top-1/2 right-3 transform -translate-y-1/2 text-slate-300 hover:text-red-500 transition opacity-0 group-hover/item:opacity-100"><Trash2 className="w-5 h-5"/></button>
                             </div>
                           )
                        }) : (
                           <span className="text-sm font-medium text-slate-400 italic">Seçili filtreye uygun mahalle ataması yok.</span>
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
  )
}