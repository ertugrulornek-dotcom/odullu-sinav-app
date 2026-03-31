import React, { useState } from 'react';
import { Building2, FileText, Edit3, Trash2, MapPin, Users, Save, X } from 'lucide-react';
import { db, appId } from '../../services/firebase';
import { updateDoc, doc } from "firebase/firestore";
import { LOCATIONS } from '../../data/constants';

export default function SpecialBoysCentersTab({ zones, setHasMadeChanges }) {
  const [selectedZoneId, setSelectedZoneId] = useState("");
  
  const selectedZoneData = zones.find(z => z.id.toString() === selectedZoneId) || null;
  const specialData = selectedZoneData?.specialBoysCentersData || { centers: [], mappings: [] };
  const adminCenters = specialData.centers || [];
  const adminMappings = specialData.mappings || [];
  
  const [newCenter, setNewCenter] = useState({ name: '', address: '', mapLink: '' });
  const [mappingData, setMappingData] = useState({ district: '', neighborhood: '', centerId: '', gender: 'Erkek', contactName: '', phone: '' });
  const [bulkExcelData, setBulkExcelData] = useState("");
  const [editingCenter, setEditingCenter] = useState(null);

  const getAdminDistricts = () => {
    if (!selectedZoneData) return [];
    const dists = [...(selectedZoneData.districts || [])];
    if(selectedZoneData.partialDistricts) {
      Object.keys(selectedZoneData.partialDistricts).forEach(d => {
        if(!dists.includes(d)) dists.push(d);
      });
    }
    return dists.sort();
  };

  const getAdminUnmappedNeighborhoods = (district) => {
    if(!district || !selectedZoneData) return [];
    let allHoods = [];
    if(selectedZoneData.partialDistricts && selectedZoneData.partialDistricts[district]) {
      allHoods = selectedZoneData.partialDistricts[district];
    } else if (LOCATIONS[selectedZoneData.province] && LOCATIONS[selectedZoneData.province][district]) {
      allHoods = LOCATIONS[selectedZoneData.province][district];
    } else {
      for(let prov in LOCATIONS) {
        if(LOCATIONS[prov][district]) { allHoods = LOCATIONS[prov][district]; break; }
      }
    }
    const mappedHoods = adminMappings.filter(m => m.district === district).map(m => m.neighborhood);
    return allHoods.filter(h => !mappedHoods.includes(h)).sort();
  };

  const handleAddCenter = async () => {
    if(!newCenter.name) return alert("Sınav Merkezi (Kurum) adı zorunludur.");
    const cId = "C-" + Math.random().toString(36).substr(2, 9);
    const updatedCenters = [...adminCenters, { id: cId, ...newCenter }];
    
    try {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'zones', selectedZoneId), {
            specialBoysCentersData: { centers: updatedCenters, mappings: adminMappings }
        });
        setHasMadeChanges(true);
        setNewCenter({ name: '', address: '', mapLink: '' });
    } catch(e) { alert("Kurum eklenirken hata oluştu."); }
  };

  const handleDeleteCenter = async (id) => {
    if(!window.confirm("Bu kurumu ve ona bağlı TÜM mahalle eşleşmelerini silmek istiyor musunuz?")) return;
    const updatedCenters = adminCenters.filter(c => c.id !== id);
    const updatedMappings = adminMappings.filter(m => m.centerId !== id);
    
    try {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'zones', selectedZoneId), {
            specialBoysCentersData: { centers: updatedCenters, mappings: updatedMappings }
        });
        setHasMadeChanges(true);
    } catch(e) { alert("Kurum silinirken hata oluştu."); }
  };

  const handleAddMapping = async () => {
    if(!mappingData.district || !mappingData.neighborhood || !mappingData.centerId) return alert("İlçe, Mahalle ve Kurum seçimi zorunludur.");
    const updatedMappings = [...adminMappings, { ...mappingData, gender: 'Erkek' }];
    
    try {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'zones', selectedZoneId), {
            specialBoysCentersData: { centers: adminCenters, mappings: updatedMappings }
        });
        setHasMadeChanges(true);
        setMappingData({...mappingData, neighborhood: ''});
    } catch(e) { alert("Eşleştirme sırasında hata oluştu."); }
  };

  const handleDeleteMapping = async (district, neighborhood) => {
    const updatedMappings = adminMappings.filter(m => !(m.district === district && m.neighborhood === neighborhood));
    try {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'zones', selectedZoneId), {
            specialBoysCentersData: { centers: adminCenters, mappings: updatedMappings }
        });
        setHasMadeChanges(true);
    } catch(e) { alert("Eşleştirme silinirken hata oluştu."); }
  };

  const handleBulkUpload = async () => {
    if(!bulkExcelData.trim()) return alert("Lütfen veri girin.");
    const lines = bulkExcelData.trim().split('\n');
    let updatedCenters = [...adminCenters];
    let updatedMappings = [...adminMappings];
    
    lines.forEach(line => {
        const parts = line.split('\t').map(p => p.trim());
        if(parts.length >= 6) {
            const [district, neighborhood, genderRaw, centerName, contactName, phone, address, mapLink] = parts;
            let cId = updatedCenters.find(c => c.name === centerName)?.id;
            if(!cId) {
                cId = "C-" + Math.random().toString(36).substr(2, 9);
                updatedCenters.push({ id: cId, name: centerName, address: address || '', mapLink: mapLink || '' });
            }
            const existingMapIndex = updatedMappings.findIndex(m => m.district === district && m.neighborhood === neighborhood);
            const newMap = { district, neighborhood, centerId: cId, gender: 'Erkek', contactName: contactName || '', phone: phone || '' };
            if(existingMapIndex >= 0) updatedMappings[existingMapIndex] = newMap;
            else updatedMappings.push(newMap);
        }
    });
    
    try {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'zones', selectedZoneId), {
            specialBoysCentersData: { centers: updatedCenters, mappings: updatedMappings }
        });
        setHasMadeChanges(true);
        alert("Toplu veriler başarıyla eklendi!");
        setBulkExcelData("");
    } catch(e) { alert("Hata: " + e.message); }
  };

  return (
    <div className="bg-white rounded-[3rem] shadow-xl border-4 border-blue-50 p-8 md:p-12 animate-in fade-in zoom-in-95 duration-300">
      <div className="mb-10 border-b-2 border-slate-100 pb-8">
        <h3 className="font-black text-3xl text-slate-900 mb-2">8. Sınıf Erkek (Özel) Sınav Merkezleri</h3>
        <p className="text-base font-bold text-slate-500">Sadece 8. Sınıf Erkek öğrencilerin atanacağı özel kurumlar ve mahalle eşleşmeleri.</p>
      </div>

      <div className="mb-10 bg-slate-50 p-6 rounded-3xl border-2 border-slate-100">
          <label className="block text-sm font-black text-slate-700 mb-3 uppercase tracking-wider flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-indigo-500"/> İşlem Yapılacak Mıntıkayı Seçin
          </label>
          <select value={selectedZoneId} onChange={e => setSelectedZoneId(e.target.value)} className="w-full md:w-1/2 p-4 rounded-2xl border-2 border-slate-200 font-bold text-lg outline-none focus:border-indigo-500 bg-white">
              <option value="">Mıntıka Seçiniz...</option>
              {zones.filter(z=>z.active).map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
          </select>
      </div>

      {selectedZoneId && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* SOL KOLON - FORMLAR */}
            <div className="space-y-8">
              {/* Kurum Ekleme */}
              <div className="bg-blue-50 p-6 rounded-3xl border-2 border-blue-100">
                <h4 className="font-black text-blue-900 text-lg mb-4 flex items-center"><Building2 className="w-5 h-5 mr-2"/> Yeni Kurum / Sınav Yeri Ekle</h4>
                <div className="space-y-3">
                  <input type="text" value={newCenter.name} onChange={e=>setNewCenter({...newCenter, name: e.target.value})} className="w-full text-sm font-bold p-3 rounded-xl border border-blue-200 outline-none focus:border-blue-500 bg-white" placeholder="Kurum Adı (Örn: Barış Ortaokulu)"/>
                  <textarea rows="2" value={newCenter.address} onChange={e=>setNewCenter({...newCenter, address: e.target.value})} className="w-full text-sm font-medium p-3 rounded-xl border border-blue-200 outline-none focus:border-blue-500 resize-none bg-white" placeholder="Açık Adres"/>
                  <input type="text" value={newCenter.mapLink} onChange={e=>setNewCenter({...newCenter, mapLink: e.target.value})} className="w-full text-sm font-bold p-3 rounded-xl border border-blue-200 outline-none focus:border-blue-500 bg-white" placeholder="Harita Linki"/>
                  <button onClick={handleAddCenter} className="w-full bg-blue-600 text-white font-black py-3 rounded-xl hover:bg-blue-700 transition shadow-md">Kurumu Sisteme Ekle</button>
                </div>
              </div>

              {/* Atama Yapma */}
              <div className="bg-emerald-50 p-6 rounded-3xl border-2 border-emerald-100">
                <h4 className="font-black text-emerald-900 text-lg mb-4 flex items-center"><MapPin className="w-5 h-5 mr-2"/> Kuruma Mahalle Ata</h4>
                <div className="space-y-3">
                  <select value={mappingData.centerId} onChange={e=>setMappingData({...mappingData, centerId: e.target.value})} className="w-full text-sm font-bold p-3 rounded-xl border border-emerald-200 outline-none focus:border-emerald-500 bg-white">
                    <option value="">Önce Kurum Seçin</option>
                    {adminCenters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <div className="flex gap-2">
                    <select value={mappingData.district} onChange={e=>setMappingData({...mappingData, district: e.target.value, neighborhood: ''})} className="flex-1 text-sm font-bold p-3 rounded-xl border border-emerald-200 outline-none focus:border-emerald-500 bg-white">
                      <option value="">İlçe Seçin</option>
                      {getAdminDistricts().map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <select value={mappingData.neighborhood} onChange={e=>setMappingData({...mappingData, neighborhood: e.target.value})} disabled={!mappingData.district} className="flex-1 text-sm font-bold p-3 rounded-xl border border-emerald-200 outline-none focus:border-emerald-500 bg-white">
                      <option value="">Mahalle Seçin</option>
                      {getAdminUnmappedNeighborhoods(mappingData.district).map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <input type="text" value={mappingData.contactName} onChange={e=>setMappingData({...mappingData, contactName: e.target.value})} className="w-1/2 text-sm font-bold p-3 rounded-xl border border-emerald-200 outline-none focus:border-emerald-500 bg-white" placeholder="Sorumlu İsim"/>
                    <input type="tel" value={mappingData.phone} onChange={e=>setMappingData({...mappingData, phone: e.target.value})} className="w-1/2 text-sm font-bold p-3 rounded-xl border border-emerald-200 outline-none focus:border-emerald-500 bg-white" placeholder="Sorumlu Tel"/>
                  </div>
                  <button onClick={handleAddMapping} disabled={!mappingData.centerId || !mappingData.neighborhood} className="w-full bg-emerald-600 text-white font-black py-3 rounded-xl hover:bg-emerald-700 transition shadow-md disabled:opacity-50">Mahalleyi Kuruma Ata</button>
                </div>
              </div>

              {/* Toplu Excel */}
              <div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100">
                 <h4 className="font-black text-slate-800 text-lg mb-4 flex items-center"><FileText className="w-5 h-5 mr-2 text-indigo-500"/> Toplu Ekle (Excel'den)</h4>
                 <p className="text-xs font-bold text-slate-500 mb-2">Format: İlçe | Mahalle | Cinsiyet | Kurum Adı | Sorumlu | Tel | Adres | Harita</p>
                 <textarea rows="4" value={bulkExcelData} onChange={e=>setBulkExcelData(e.target.value)} className="w-full text-sm font-medium p-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 resize-none mb-3" placeholder="Excel verisini buraya yapıştırın..."/>
                 <button onClick={handleBulkUpload} className="w-full bg-slate-800 text-white font-black py-3 rounded-xl hover:bg-slate-900 transition shadow-md">Toplu Yükle</button>
              </div>
            </div>

            {/* SAĞ KOLON - LİSTELER */}
            <div>
              <div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100 h-full">
                <h4 className="font-black text-slate-800 text-xl mb-6 flex items-center"><MapPin className="w-6 h-6 mr-2 text-indigo-500"/> Kayıtlı Merkezler ve Atamalar</h4>
                <div className="space-y-4">
                  {adminCenters.length > 0 ? adminCenters.map(center => {
                    const mappedHoods = adminMappings.filter(m => m.centerId === center.id);
                    return (
                      <div key={center.id} className="bg-white p-5 rounded-2xl border-2 border-slate-200 relative group shadow-sm">
                        <button onClick={() => handleDeleteCenter(center.id)} className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition opacity-0 group-hover:opacity-100"><Trash2 className="w-5 h-5"/></button>
                        <h4 className="font-black text-lg text-slate-800 mb-1 pr-12">{center.name}</h4>
                        <p className="text-xs font-medium text-slate-500 mb-4">{center.address || 'Adres belirtilmemiş'}</p>
                        
                        <h5 className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-3">Bağlı Olan Mahalleler ({mappedHoods.length})</h5>
                        <div className="flex flex-wrap gap-3">
                          {mappedHoods.length > 0 ? mappedHoods.map((m, i) => (
                             <div key={i} className="flex flex-col bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-sm relative group/item hover:shadow-md transition">
                                <span className="font-black text-slate-800 mb-1">{m.district} / {m.neighborhood}</span>
                                <span className="text-slate-500 font-medium text-xs"><Users className="w-3 h-3 inline mr-1"/>{m.contactName || 'İsimsiz'} - {m.phone}</span>
                                <button onClick={() => handleDeleteMapping(m.district, m.neighborhood)} className="absolute top-1/2 right-3 transform -translate-y-1/2 text-slate-300 hover:text-red-500 transition opacity-0 group-hover/item:opacity-100"><Trash2 className="w-5 h-5"/></button>
                             </div>
                          )) : (
                             <span className="text-sm font-medium text-slate-400 italic">Henüz hiç mahalle bağlanmamış.</span>
                          )}
                        </div>
                      </div>
                    )
                  }) : (
                    <div className="text-center font-bold text-slate-400 p-8">Henüz sınav merkezi eklenmemiş.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
      )}
    </div>
  );
}