import React, { useState, useEffect } from 'react';
import { Building2, FileText, Edit3, Trash2, MapPin, Users, Save, X, Filter, Phone, Key, ShieldCheck, RefreshCw } from 'lucide-react';
import { db, appId } from '../../services/firebase';
import { updateDoc, doc } from "firebase/firestore";
import { LOCATIONS } from '../../data/constants';
import { normalizeForSearch } from '../../utils/helpers';

const DEFAULT_CONTACTS = {
    "Erkek": { active: false, name: '', phone: '' },
    "Kız": { active: false, name: '', phone: '' },
    "8. Sınıf Erkek": { active: false, name: '', phone: '' }
};

export default function CentersTab({ adminZoneData, adminZoneId, setHasMadeChanges }) {
  const [localCenters, setLocalCenters] = useState([]);
  const [localMappings, setLocalMappings] = useState([]);

  useEffect(() => {
     setLocalCenters(adminZoneData.centers || []);
     setLocalMappings(adminZoneData.mappings || []);
  }, [adminZoneData]);
  
  const [newCenter, setNewCenter] = useState({ 
      name: '', address: '', mapLink: '', password: '', isActive: true, 
      contacts: JSON.parse(JSON.stringify(DEFAULT_CONTACTS)) 
  });
  
  const [mappingData, setMappingData] = useState({ district: '', neighborhood: '', centerId: '', gender: '' });
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
          if (adminZoneData.name === 'Gebze' && (gender === '8. Sınıf Erkek' || gender === 'Tümü')) return false;
          if (adminZoneData.name === 'Akarçeşme' && (gender === 'Erkek' || gender === 'Kız' || gender === 'Tümü')) return false; 
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

  // 🚀 SİHİRLİ GÖÇ BUTONU (Tek Seferlik Eski Veri Kurtarma)
  const handleMigrateOldData = async () => {
      if(!window.confirm("Eski atamalardaki hoca isimleri ve yetkileri yeni sisteme geçirilecek. Onaylıyor musunuz?")) return;

      const updatedCenters = localCenters.map(c => {
          const newContacts = JSON.parse(JSON.stringify(DEFAULT_CONTACTS));
          
          if (c.boysContactName || c.boysPhone) {
              newContacts["Erkek"] = { active: true, name: c.boysContactName || "", phone: c.boysPhone || "" };
          }
          if (c.girlsContactName || c.girlsPhone) {
              newContacts["Kız"] = { active: true, name: c.girlsContactName || "", phone: c.girlsPhone || "" };
          }

          const cMappings = localMappings.filter(m => m.centerId === c.id);
          cMappings.forEach(m => {
              const mName = m.contactName || "";
              const mPhone = m.phone || "";
              
              if (m.gender === 'Erkek') {
                  newContacts["Erkek"].active = true;
                  if(mName) newContacts["Erkek"].name = mName;
                  if(mPhone) newContacts["Erkek"].phone = mPhone;
              } else if (m.gender === 'Kız') {
                  newContacts["Kız"].active = true;
                  if(mName) newContacts["Kız"].name = mName;
                  if(mPhone) newContacts["Kız"].phone = mPhone;
              } else if (m.gender === '8. Sınıf Erkek') {
                  newContacts["8. Sınıf Erkek"].active = true;
                  if(mName) newContacts["8. Sınıf Erkek"].name = mName;
                  if(mPhone) newContacts["8. Sınıf Erkek"].phone = mPhone;
              } else if (m.gender === 'Tümü' || !m.gender) {
                  newContacts["Erkek"].active = true;
                  newContacts["Kız"].active = true;
                  if(mName) { newContacts["Erkek"].name = mName; newContacts["Kız"].name = mName; }
                  if(mPhone) { newContacts["Erkek"].phone = mPhone; newContacts["Kız"].phone = mPhone; }
              }
          });

          return { ...c, contacts: newContacts };
      });

      try {
          setLocalCenters(updatedCenters);
          setHasMadeChanges(true);
          await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'zones', adminZoneId.toString()), { centers: updatedCenters });
          alert("Tebrikler! Eski veriler başarıyla yeni Departman sistemine geçirildi.");
      } catch(e) { console.error(e); alert("Aktarım başarısız oldu."); }
  };

  const handleAddCenter = async () => {
    if(!newCenter.name || !newCenter.address) return alert("Kurum adı ve açık adres zorunludur.");
    
    const hasAnyActiveGender = Object.values(newCenter.contacts).some(c => c.active);
    if (!hasAnyActiveGender) return alert("Lütfen kurumun sorumlu olduğu en az bir cinsiyet grubunu seçiniz.");

    try {
      const centerObj = { 
          id: "c_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9), 
          ...newCenter
      };
      
      Object.keys(centerObj.contacts).forEach(g => {
          centerObj.contacts[g].phone = formatPhoneNumber(centerObj.contacts[g].phone);
      });

      const updatedCenters = [...localCenters, centerObj];
      setLocalCenters(updatedCenters); setHasMadeChanges(true);
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'zones', adminZoneId.toString()), { centers: updatedCenters });
      setNewCenter({ name: '', address: '', mapLink: '', password: '', isActive: true, contacts: JSON.parse(JSON.stringify(DEFAULT_CONTACTS)) });
    } catch (e) { console.error(e); alert("Hata oluştu"); }
  };

  const handleUpdateCenter = async (e) => {
    e.preventDefault();
    if(!editingCenter.name || !editingCenter.address) return alert("Adres ve isim zorunludur.");
    
    const hasAnyActiveGender = Object.values(editingCenter.contacts).some(c => c.active);
    if (!hasAnyActiveGender) return alert("Kurumun en az bir cinsiyetten sorumlu olması gerekir.");

    try {
      const formattedCenter = { ...editingCenter };
      Object.keys(formattedCenter.contacts).forEach(g => {
          formattedCenter.contacts[g].phone = formatPhoneNumber(formattedCenter.contacts[g].phone);
      });

      const updatedCenters = localCenters.map(c => c.id === editingCenter.id ? formattedCenter : c);
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
      
      const newMapObj = { district: mappingData.district, neighborhood: mappingData.neighborhood, gender: mappingData.gender, centerId: mappingData.centerId };

      if (existingIndex >= 0) newMappings[existingIndex] = newMapObj;
      else newMappings.push(newMapObj);
      
      setLocalMappings(newMappings); setHasMadeChanges(true);
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'zones', adminZoneId.toString()), { mappings: newMappings });
      alert(`${mappingData.district} / ${mappingData.neighborhood} (${mappingData.gender}) atandı!`);
      setMappingData({ ...mappingData, neighborhood: '' }); 
    } catch (e) { console.error(e); }
  };

  const handleBulkUploadExcel = async () => {
    if(!bulkExcelData.trim()) return alert("Lütfen veriyi yapıştırın.");
    const rows = bulkExcelData.split('\n');
    let updatedCenters = JSON.parse(JSON.stringify(localCenters)); 
    let updatedMappings = [...localMappings];
    let successCount = 0;
    let errors = [];
    let warnings = [];

    for (let i = 0; i < rows.length; i++) {
       let row = rows[i];
       if(!row.trim()) continue;
       const cols = row.split('\t');
       if(cols.length < 4) { errors.push(`Satır ${i+1}: Sütunlar eksik (İlçe, Mahalle, Cinsiyet, Kurum olmalı).`); continue; }
       
       let rawDistrict = cols[0]?.trim();
       let rawNeighborhood = cols[1]?.trim();
       
       let rawGender = "Tümü";
       const potentialGender = String(cols[2] || '').trim().toLowerCase();
       if (potentialGender === 'erkek' || potentialGender === 'sadece erkek') { rawGender = 'Erkek'; } 
       else if (potentialGender === 'kız' || potentialGender === 'kiz' || potentialGender === 'sadece kız') { rawGender = 'Kız'; } 
       else if (['tümü', 'tumu', 'karma'].includes(potentialGender)) { rawGender = 'Tümü'; } 
       else if (potentialGender.includes('8') && (potentialGender.includes('sınıf') || potentialGender.includes('sinif') || potentialGender.includes('erkek'))) { rawGender = '8. Sınıf Erkek'; } 
       else if (potentialGender === '8' || potentialGender === '8.') { rawGender = '8. Sınıf Erkek'; }

       let centerName = cols[3]?.trim();
       let contactName = cols[4] ? cols[4].trim() : "";
       let phone = cols[5] ? cols[5].trim() : "";
       let address = cols[6] ? cols[6].trim() : "";
       let mapLink = cols[7] ? cols[7].trim() : "";

       if (!rawDistrict || !rawNeighborhood || !centerName) { errors.push(`Satır ${i+1}: İlçe, Mahalle veya Kurum Adı boş olamaz.`); continue; }

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
       
       if (matchedDistrict === 'Körfez' && (matchedNeighborhood === '17 Ağustos' || matchedNeighborhood === 'Cumhuriyet')) {
          if (adminZoneData.name === 'Gebze' && (rawGender === '8. Sınıf Erkek' || rawGender === 'Tümü')) { errors.push(`Satır ${i+1}: Gebze mıntıkası bu mahalleye 8. Sınıf veya Tümü atayamaz.`); continue; }
          if (adminZoneData.name === 'Akarçeşme' && (rawGender === 'Erkek' || rawGender === 'Kız' || rawGender === 'Tümü')) { errors.push(`Satır ${i+1}: Akarçeşme mıntıkası bu mahalleye Kız, 3-7 Erkek veya Tümü atayamaz.`); continue; }
       }

       let center = updatedCenters.find(c => normalizeForSearch(c.name) === normalizeForSearch(centerName));
       if(!center) {
          center = { 
              id: "c_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9), 
              name: centerName, 
              address: address || `${matchedDistrict} / ${matchedNeighborhood} (Otomatik Oluşturuldu)`,
              mapLink: mapLink,
              password: '',
              isActive: true,
              contacts: JSON.parse(JSON.stringify(DEFAULT_CONTACTS))
          };
          updatedCenters.push(center);
       }

       if (!center.contacts) center.contacts = JSON.parse(JSON.stringify(DEFAULT_CONTACTS));

       if (rawGender === 'Tümü') {
           if (!center.contacts['Erkek'].active || !center.contacts['Kız'].active) {
               warnings.push(`Satır ${i+1}: "${centerName}" kurumu Erkek ve Kız gruplarının ikisine birden bakmıyor. ONAYLANIRSA 'Tümü' ataması için iki yetki de eklenecektir.`);
           }
       } else {
           if (!center.contacts[rawGender].active) {
               warnings.push(`Satır ${i+1}: "${centerName}" kurumu "${rawGender}" cinsiyetinden sorumlu değildi. ONAYLANIRSA yetki eklenecektir.`);
           }
       }

       if (rawGender === 'Tümü') {
           center.contacts['Erkek'].active = true;
           center.contacts['Kız'].active = true;
           if (contactName) { center.contacts['Erkek'].name = contactName; center.contacts['Kız'].name = contactName; }
           if (phone) { center.contacts['Erkek'].phone = formatPhoneNumber(phone); center.contacts['Kız'].phone = formatPhoneNumber(phone); }
       } else {
           center.contacts[rawGender].active = true;
           if (contactName) center.contacts[rawGender].name = contactName;
           if (phone) center.contacts[rawGender].phone = formatPhoneNumber(phone);
       }
       
       const existingMapIndex = updatedMappings.findIndex(m => m.district === matchedDistrict && m.neighborhood === matchedNeighborhood && m.gender === rawGender);
       const newMapObj = { district: matchedDistrict, neighborhood: matchedNeighborhood, gender: rawGender, centerId: center.id };
       
       if(existingMapIndex >= 0) updatedMappings[existingMapIndex] = newMapObj; 
       else updatedMappings.push(newMapObj);
       
       successCount++;
    }

    if (warnings.length > 0) {
        const confirmMsg = "DİKKAT: Aşağıdaki atamalar kurumların sorumlu OLMADIĞI cinsiyetlere yapılmak isteniyor:\n\n" + warnings.slice(0, 10).join('\n') + (warnings.length > 10 ? `\n...ve ${warnings.length - 10} uyarı daha.` : "") + "\n\nEğer ONAYLARSANIZ, bu cinsiyetler otomatik olarak ilgili kurumların sorumluluklarına eklenecek ve atama yapılacaktır. Onaylıyor musunuz?";
        if (!window.confirm(confirmMsg)) return; 
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

  const availableCentersForDropdown = localCenters.filter(c => {
      if (!mappingData.gender) return true; 
      if (!c.contacts) return false;
      if (mappingData.gender === 'Tümü') return c.contacts['Erkek']?.active && c.contacts['Kız']?.active;
      return c.contacts[mappingData.gender] && c.contacts[mappingData.gender].active;
  }).sort((a, b) => a.name.localeCompare(b.name, 'tr-TR'));

  const genderKeys = ["Erkek", "Kız", "8. Sınıf Erkek"];

  return (
    <div className="bg-white rounded-[3rem] shadow-xl border-4 border-slate-100 p-8 md:p-12 animate-in fade-in zoom-in-95 duration-300">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 border-b-2 border-slate-100 pb-8 gap-4">
          <div>
            <h3 className="font-black text-3xl text-slate-900 mb-2">Sınav Yerleri ve Atamalar</h3>
            <p className="text-base font-bold text-slate-500">Mıntıkaya yeni kurumlar ekleyin ve mahalleleri atayın.</p>
          </div>
          <button onClick={handleMigrateOldData} className="bg-amber-100 hover:bg-amber-200 text-amber-700 font-black px-4 py-2 rounded-xl flex items-center transition shadow-sm border border-amber-300">
             <RefreshCw className="w-4 h-4 mr-2" /> Eski Verileri Dönüştür
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-1 space-y-8">
             <div>
                <div className="text-sm font-black text-indigo-600 uppercase mb-4 tracking-wider flex items-center"><Building2 className="w-6 h-6 mr-2"/> Yeni Kurum / Sınav Yeri Ekle</div>
                <div className="space-y-4 bg-slate-50 p-6 rounded-3xl border-2 border-slate-100">
                  
                  <div className="space-y-3 pb-4 border-b border-slate-200">
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase ml-1 block">Kurum Adı</label>
                        <input type="text" value={newCenter.name} onChange={e=>setNewCenter({...newCenter, name: e.target.value})} className="w-full text-sm font-bold p-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500" placeholder="Örn: Şekerpınar Eğitim Merkezi"/>
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase ml-1 block">Açık Adres</label>
                        <textarea rows="2" value={newCenter.address} onChange={e=>setNewCenter({...newCenter, address: e.target.value})} className="w-full text-sm font-bold p-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 resize-none" placeholder="Mahalle, Sokak vb."/>
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase ml-1 block">Google Harita Linki</label>
                        <input type="url" value={newCenter.mapLink} onChange={e=>setNewCenter({...newCenter, mapLink: e.target.value})} className="w-full text-sm font-bold p-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500" placeholder="http://maps.google.com/1..."/>
                      </div>
                  </div>

                  <div className="space-y-3 pb-4 border-b border-slate-200">
                      <p className="text-[11px] font-black text-indigo-600 uppercase ml-1 block mb-2">Sorumlu Olduğu Gruplar & Hocalar</p>
                      {genderKeys.map(g => (
                         <div key={g} className={`p-3 rounded-xl border transition-all ${newCenter.contacts[g].active ? 'bg-white border-indigo-200 shadow-sm' : 'bg-transparent border-slate-200 opacity-70'}`}>
                            <label className="flex items-center font-black text-sm text-slate-700 cursor-pointer">
                               <input 
                                  type="checkbox" 
                                  checked={newCenter.contacts[g].active} 
                                  onChange={e => setNewCenter({
                                     ...newCenter, 
                                     contacts: { ...newCenter.contacts, [g]: { ...newCenter.contacts[g], active: e.target.checked } }
                                  })}
                                  className="w-4 h-4 mr-2 text-indigo-600 rounded"
                               />
                               {g} Sorumluluğu
                            </label>
                            {newCenter.contacts[g].active && (
                               <div className="flex gap-2 mt-3">
                                  <input type="text" value={newCenter.contacts[g].name} onChange={e => setNewCenter({...newCenter, contacts: {...newCenter.contacts, [g]: {...newCenter.contacts[g], name: e.target.value}}})} className="w-1/2 text-xs font-bold p-2 rounded-lg border border-slate-200 outline-none focus:border-indigo-500" placeholder="Hoca Adı" />
                                  <input type="tel" value={newCenter.contacts[g].phone} onChange={e => setNewCenter({...newCenter, contacts: {...newCenter.contacts, [g]: {...newCenter.contacts[g], phone: e.target.value}}})} className="w-1/2 text-xs font-bold p-2 rounded-lg border border-slate-200 outline-none focus:border-indigo-500" placeholder="Telefon (5XX)" />
                               </div>
                            )}
                         </div>
                      ))}
                  </div>

                  <div className="space-y-3">
                      <div className="flex gap-2 items-end">
                          <div className="flex-1">
                              <label className="text-[10px] font-black text-amber-600 flex items-center ml-1 uppercase"><Key className="w-3 h-3 mr-1"/> Kurum Paneli Şifresi</label>
                              <input type="text" value={newCenter.password} onChange={e=>setNewCenter({...newCenter, password: e.target.value})} className="w-full text-sm font-bold p-3 rounded-xl border-2 border-amber-200 bg-amber-50 outline-none focus:border-amber-500" placeholder="Kurumun giriş şifresi"/>
                          </div>
                          <div className="w-1/3">
                              <label className="text-[10px] font-black text-slate-500 uppercase ml-1 block">Panel Durumu</label>
                              <select value={newCenter.isActive} onChange={e=>setNewCenter({...newCenter, isActive: e.target.value === 'true'})} className="w-full text-sm font-bold p-3 rounded-xl border border-slate-200 outline-none">
                                  <option value="true">Aktif</option>
                                  <option value="false">Pasif</option>
                              </select>
                          </div>
                      </div>
                  </div>

                  <button onClick={handleAddCenter} className="bg-slate-800 hover:bg-slate-900 text-white text-base font-black py-4 px-4 rounded-xl transition w-full shadow-lg mt-2">Kurumu Sistemi Ekle</button>
                </div>
             </div>

             <div>
                <div className="text-sm font-black text-emerald-600 uppercase mb-4 tracking-wider flex items-center"><MapPin className="w-6 h-6 mr-2"/> Tekli Mahalle Ataması</div>
                <div className="space-y-3 bg-emerald-50 p-6 rounded-3xl border-2 border-emerald-100">
                  <select value={mappingData.gender} onChange={e=>setMappingData({...mappingData, gender: e.target.value, neighborhood: '', centerId: ''})} className="w-full text-sm font-bold p-3 rounded-xl border border-emerald-200 outline-none focus:border-emerald-500 bg-white">
                    <option value="">Önce Cinsiyet Seçin</option>
                    <option value="Tümü">Tümü (Karma)</option>
                    <option value="Erkek">Sadece Erkek</option>
                    <option value="Kız">Sadece Kız</option>
                    <option value="8. Sınıf Erkek">8. Sınıf Erkek</option>
                  </select>

                  <select value={mappingData.centerId} onChange={e=>setMappingData({...mappingData, centerId: e.target.value})} disabled={!mappingData.gender} className="w-full text-sm font-bold p-3 rounded-xl border border-emerald-200 outline-none focus:border-emerald-500 bg-white disabled:opacity-50">
                    <option value="">Bu Cinsiyete Bakan Kurum Seçin</option>
                    {availableCentersForDropdown.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  
                  <div className="flex gap-2">
                    <select value={mappingData.district} onChange={e=>setMappingData({...mappingData, district: e.target.value, neighborhood: ''})} className="flex-1 text-sm font-bold p-3 rounded-xl border border-emerald-200 outline-none focus:border-emerald-500 bg-white">
                      <option value="">İlçe Seçin</option>
                      {adminDistricts.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <select value={mappingData.neighborhood} onChange={e=>setMappingData({...mappingData, neighborhood: e.target.value})} disabled={!mappingData.district || !mappingData.gender} className="flex-1 text-sm font-bold p-3 rounded-xl border border-emerald-200 outline-none focus:border-emerald-500 bg-white disabled:opacity-50">
                      <option value="">Mahalle Seçin</option>
                      {getAdminUnmappedNeighborhoods(mappingData.district, mappingData.gender).map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                  
                  <button onClick={handleAddMapping} disabled={!mappingData.centerId || !mappingData.neighborhood || !mappingData.gender} className="w-full bg-emerald-600 text-white font-black py-3 rounded-xl hover:bg-emerald-700 transition shadow-md disabled:opacity-50 mt-2">Mahalleyi Kuruma Ata</button>
                </div>
             </div>

             <div>
                <div className="text-sm font-black text-indigo-600 uppercase mb-4 tracking-wider flex items-center"><FileText className="w-6 h-6 mr-2"/> Toplu Ekle (Excel'den)</div>
                <div className="space-y-4 bg-slate-50 p-6 rounded-3xl border-2 border-slate-100">
                   <p className="text-[11px] font-bold text-slate-500 mb-2 leading-relaxed">Sütunlar Sırasıyla (Hoca bilgileri isteğe bağlıdır):<br/><b>İlçe | Mahalle | Cinsiyet | Kurum Adı | Hoca Adı | Hoca Tel</b></p>
                   <textarea 
                     rows="5" 
                     value={bulkExcelData}
                     onChange={e => setBulkExcelData(e.target.value)}
                     className="w-full text-xs font-mono p-4 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 resize-none whitespace-pre" 
                     placeholder="Gebze	Akarçeşme	8. Sınıf Erkek	Şekerpınar Eğitim..."/>
                   <button onClick={handleBulkUploadExcel} className="bg-slate-800 hover:bg-slate-900 text-white text-base font-black py-4 px-4 rounded-xl transition w-full shadow-lg">Verileri İçe Aktar</button>
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
                Bu mıntıkaya henüz hiç kurum eklenmemiş.
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
                         <form onSubmit={handleUpdateCenter} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="col-span-2"><label className="text-[10px] font-black text-slate-500 uppercase ml-1 block">Kurum Adı</label><input type="text" value={editingCenter.name} onChange={e=>setEditingCenter({...editingCenter, name: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200" required/></div>
                                <div className="col-span-2"><label className="text-[10px] font-black text-slate-500 uppercase ml-1 block">Adres</label><input type="text" value={editingCenter.address} onChange={e=>setEditingCenter({...editingCenter, address: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200" required/></div>
                                <div className="col-span-2 mb-2"><label className="text-[10px] font-black text-slate-500 uppercase ml-1 block">Harita Linki</label><input type="url" value={editingCenter.mapLink || ''} onChange={e=>setEditingCenter({...editingCenter, mapLink: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200" /></div>
                                
                                <div className="col-span-2 space-y-2">
                                    <p className="text-[11px] font-black text-indigo-600 uppercase ml-1 block">Sorumlu Olduğu Gruplar & Hocalar</p>
                                    {genderKeys.map(g => (
                                       <div key={g} className={`p-3 rounded-xl border transition-all ${editingCenter.contacts && editingCenter.contacts[g]?.active ? 'bg-white border-indigo-200 shadow-sm' : 'bg-transparent border-slate-200 opacity-70'}`}>
                                          <label className="flex items-center font-black text-sm text-slate-700 cursor-pointer">
                                             <input 
                                                type="checkbox" 
                                                checked={editingCenter.contacts && editingCenter.contacts[g]?.active} 
                                                onChange={e => setEditingCenter({
                                                   ...editingCenter, 
                                                   contacts: { ...editingCenter.contacts, [g]: { ...editingCenter.contacts[g], active: e.target.checked } }
                                                })}
                                                className="w-4 h-4 mr-2 text-indigo-600 rounded"
                                             />
                                             {g} Sorumluluğu
                                          </label>
                                          {editingCenter.contacts && editingCenter.contacts[g]?.active && (
                                             <div className="flex gap-2 mt-3">
                                                <input type="text" value={editingCenter.contacts[g].name} onChange={e => setEditingCenter({...editingCenter, contacts: {...editingCenter.contacts, [g]: {...editingCenter.contacts[g], name: e.target.value}}})} className="w-1/2 text-xs font-bold p-2 rounded-lg border border-slate-200 outline-none focus:border-indigo-500" placeholder="Hoca Adı" />
                                                <input type="tel" value={editingCenter.contacts[g].phone} onChange={e => setEditingCenter({...editingCenter, contacts: {...editingCenter.contacts, [g]: {...editingCenter.contacts[g], phone: e.target.value}}})} className="w-1/2 text-xs font-bold p-2 rounded-lg border border-slate-200 outline-none focus:border-indigo-500" placeholder="Telefon (5XX)" />
                                             </div>
                                          )}
                                       </div>
                                    ))}
                                </div>
                                
                                <div><label className="text-[10px] font-black text-amber-600 uppercase ml-1 block">Panel Şifresi</label><input type="text" value={editingCenter.password || ''} onChange={e=>setEditingCenter({...editingCenter, password: e.target.value})} className="w-full p-3 rounded-xl border border-amber-300 bg-amber-50"/></div>
                                <div><label className="text-[10px] font-black text-slate-500 uppercase ml-1 block">Panel Durumu</label>
                                   <select value={editingCenter.isActive} onChange={e=>setEditingCenter({...editingCenter, isActive: e.target.value === 'true'})} className="w-full p-3 rounded-xl border border-slate-200">
                                      <option value="true">Aktif (Giriş Yapabilir)</option>
                                      <option value="false">Pasif (Giriş Yapamaz)</option>
                                   </select>
                                </div>
                            </div>
                            <div className="flex gap-3 mt-4">
                               <button type="submit" className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-xl font-black flex items-center justify-center"><Save className="w-5 h-5 mr-2"/> Kaydet</button>
                               <button type="button" onClick={() => setEditingCenter(null)} className="bg-slate-200 text-slate-700 px-6 py-3 rounded-xl font-bold flex items-center"><X className="w-5 h-5 mr-2"/> İptal</button>
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
                    
                    <div className="flex items-center mb-2 pr-20">
                       <h4 className="font-black text-2xl text-slate-800">{center.name}</h4>
                       {center.isActive ? 
                          <span className="ml-3 text-[10px] font-black text-green-600 bg-green-100 px-2 py-1 rounded-md border border-green-200 flex items-center"><ShieldCheck className="w-3 h-3 mr-1"/> Panel Aktif</span> 
                          : 
                          <span className="ml-3 text-[10px] font-black text-red-600 bg-red-100 px-2 py-1 rounded-md border border-red-200">Panel Pasif</span>
                       }
                    </div>

                    <div className="text-sm font-medium text-slate-500 mb-4 flex items-start">
                      <MapPin className="w-4 h-4 mr-1 flex-shrink-0 text-slate-400 mt-0.5"/> {center.address}
                    </div>

                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex flex-wrap gap-2 mb-6">
                        {genderKeys.map(g => {
                           if (!center.contacts || !center.contacts[g] || !center.contacts[g].active) return null;
                           const cInfo = center.contacts[g];
                           const badgeColor = g === 'Kız' ? 'pink' : g === 'Erkek' ? 'blue' : 'indigo';
                           return (
                               <div key={g} className={`text-xs font-bold text-${badgeColor}-700 bg-${badgeColor}-100 px-3 py-1.5 rounded-lg border border-${badgeColor}-200 flex items-center`}>
                                   <Users className="w-4 h-4 mr-1 opacity-70"/> 
                                   <span className="mr-1">{g}:</span> {cInfo.name || 'İsimsiz'} (0{cInfo.phone || '5539735440'})
                               </div>
                           )
                        })}
                        {center.password && <div className="text-xs font-bold text-amber-700 bg-amber-100 px-3 py-1.5 rounded-lg border border-amber-200 flex items-center"><Key className="w-4 h-4 mr-1 opacity-70"/> Şifre: {center.password}</div>}
                    </div>

                    <div>
                      <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Bağlı Olan Mahalleler ({mappedHoods.length})</h5>
                      <div className="flex flex-wrap gap-3">
                        {mappedHoods.length > 0 ? mappedHoods.map((m, i) => {
                           
                           let contact = { name: "İsim Yok", phone: "5539735440" };
                           if (m.gender === 'Tümü' || !m.gender) {
                               contact = center.contacts && center.contacts['Erkek']?.active ? center.contacts['Erkek'] : contact;
                           } else {
                               contact = center.contacts && center.contacts[m.gender] ? center.contacts[m.gender] : contact;
                           }
                           
                           let displayPhone = contact.phone || "5539735440";
                           let displayName = contact.name || "İsim Yok";

                           return (
                             <div key={i} className="flex flex-col bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-sm relative group/item hover:shadow-md transition">
                                <span className="font-black text-slate-800 mb-1">{m.district} / {m.neighborhood} <span className={`text-xs ml-1 px-2 py-0.5 rounded-md ${m.gender==='Kız' ? 'bg-pink-100 text-pink-600' : m.gender==='Erkek' ? 'bg-blue-100 text-blue-600' : 'bg-indigo-100 text-indigo-600'}`}>{m.gender || 'Tümü'}</span></span>
                                
                                <span className="text-slate-500 font-medium text-xs flex items-center mt-1">
                                   <Users className="w-3 h-3 inline mr-1"/>{displayName} - 
                                   <a href={`tel:+90${displayPhone}`} className="ml-1 text-indigo-500 hover:text-indigo-700 underline underline-offset-2 flex items-center">
                                       <Phone className="w-3 h-3 mr-0.5"/> 0{displayPhone}
                                   </a>
                                </span>

                                <button onClick={() => handleDeleteMapping(m.district, m.neighborhood, m.gender)} className="absolute top-1/2 right-3 transform -translate-y-1/2 text-slate-300 hover:text-red-500 transition opacity-0 group-hover/item:opacity-100"><Trash2 className="w-5 h-5"/></button>
                             </div>
                           )
                        }) : (
                           <span className="text-sm font-medium text-slate-400 italic">Bu kuruma atanmış mahalle yok.</span>
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