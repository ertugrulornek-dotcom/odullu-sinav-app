import React, { useState } from 'react';
import { Plus, MapPin, Building2, Save } from 'lucide-react';
import { db, appId } from '../../services/firebase';
import { updateDoc, doc } from "firebase/firestore";
import { LOCATIONS } from '../../data/constants';

export default function ExceptionsTab({ zones, setHasMadeChanges }) {
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('');
  const [selectedTargetZoneId, setSelectedTargetZoneId] = useState('');
  const [selectedCenterId, setSelectedCenterId] = useState('');
  
  // 🚀 YENİ EKLENDİ: Cinsiyet seçimi
  const [selectedGender, setSelectedGender] = useState('Tümü');
  
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');

  const formatPhoneNumber = (phoneRaw) => {
      let p = String(phoneRaw || "").replace(/\D/g, '');
      if (p.startsWith('90')) p = p.substring(2);
      if (p.startsWith('0')) p = p.substring(1);
      if (p.length > 0 && !p.startsWith('5')) p = '5' + p;
      if (p.length > 10) p = p.substring(0, 10);
      return p;
  };

  const allMappings = zones.flatMap(z => (z.mappings || []).map(m => ({...m, zoneId: z.id, zoneName: z.name})));
  const provinces = Object.keys(LOCATIONS).sort();
  const districts = selectedProvince ? Object.keys(LOCATIONS[selectedProvince]).sort() : [];
  
  const getMappedNeighborhoods = () => {
     if (!selectedDistrict) return [];
     const mappedHoods = allMappings.filter(m => m.district === selectedDistrict).map(m => m.neighborhood);
     return [...new Set(mappedHoods)].sort();
  };
  const neighborhoods = getMappedNeighborhoods();

  const existingMappings = allMappings.filter(m => m.district === selectedDistrict && m.neighborhood === selectedNeighborhood);
  const targetZone = zones.find(z => z.id.toString() === selectedTargetZoneId);

  const contactPresets = allMappings.filter(m => m.centerId === selectedCenterId && m.contactName).map(m => ({ name: m.contactName, phone: m.phone }));
  const uniquePresets = Array.from(new Set(contactPresets.map(p => p.name))).map(name => contactPresets.find(p => p.name === name));

  const handleAddException = async () => {
     if(!selectedDistrict || !selectedNeighborhood || !selectedTargetZoneId || !selectedCenterId || !selectedGender) return alert("Lütfen tüm alanları seçiniz.");
     
     const center = targetZone.centers?.find(c => c.id === selectedCenterId);
     if(existingMappings.some(m => m.centerId === selectedCenterId && m.gender === selectedGender)) return alert("Bu kurum bu cinsiyet için zaten atanmış.");

     const cleanedPhone = formatPhoneNumber(phone) || '5539735440';

     const newMapping = {
       district: selectedDistrict,
       neighborhood: selectedNeighborhood,
       gender: selectedGender, // 🚀 SEÇİLEN CİNSİYET
       centerId: center.id,
       contactName: contactName, 
       phone: cleanedPhone
     };

     const updatedMappings = [...(targetZone.mappings || []), newMapping];

     try {
        setHasMadeChanges(true);
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'zones', targetZone.id.toString()), {
          mappings: updatedMappings
        });
        alert(`${selectedDistrict} / ${selectedNeighborhood} mahallesine ${center.name} başarıyla eklendi!`);
        setSelectedTargetZoneId('');
        setSelectedCenterId('');
        setContactName('');
        setPhone('');
        setSelectedGender('Tümü');
     } catch(e) { console.error(e); alert("Kayıt sırasında hata oluştu."); }
  };

  return (
    <div className="bg-white rounded-[3rem] shadow-xl border-4 border-slate-100 p-8 md:p-12 animate-in fade-in zoom-in-95 duration-300">
      <div className="mb-10 border-b-2 border-slate-100 pb-8">
        <h3 className="font-black text-3xl text-slate-900 mb-2 flex items-center"><MapPin className="mr-3 w-8 h-8 text-indigo-600"/> Paylaşımlı Mahalleler (İstisna Atama)</h3>
        <p className="text-base font-bold text-slate-500">Halihazırda ataması yapılmış bir mahalleye (Örn: Maltepe) birden fazla kurum atayarak öğrencilere seçim hakkı sunabilirsiniz.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-6">
           <div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100">
              <label className="block text-sm font-black text-slate-700 mb-3 uppercase tracking-wider">1. Adım: İşlem Yapılacak Mahalleyi Seçin</label>
              <div className="flex flex-col gap-3">
                <select value={selectedProvince} onChange={e => {setSelectedProvince(e.target.value); setSelectedDistrict(''); setSelectedNeighborhood('');}} className="w-full p-4 rounded-2xl border-2 border-slate-200 font-bold text-lg outline-none focus:border-indigo-500 bg-white">
                   <option value="">1. İl Seçin</option>
                   {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <select value={selectedDistrict} onChange={e => {setSelectedDistrict(e.target.value); setSelectedNeighborhood('');}} disabled={!selectedProvince} className="w-full p-4 rounded-2xl border-2 border-slate-200 font-bold text-lg outline-none focus:border-indigo-500 bg-white disabled:opacity-50">
                   <option value="">2. İlçe Seçin</option>
                   {districts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select value={selectedNeighborhood} onChange={e => setSelectedNeighborhood(e.target.value)} disabled={!selectedDistrict} className="w-full p-4 rounded-2xl border-2 border-slate-200 font-bold text-lg outline-none focus:border-indigo-500 bg-white disabled:opacity-50">
                   <option value="">3. Mahalle Seçin (Sadece Ataması Olanlar)</option>
                   {neighborhoods.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
           </div>

           {selectedNeighborhood && (
             <div className="bg-emerald-50 p-6 rounded-3xl border-2 border-emerald-100 animate-in fade-in">
                <label className="block text-sm font-black text-emerald-800 mb-4 uppercase tracking-wider">Mevcut Atanmış Kurumlar</label>
                {existingMappings.length > 0 ? (
                  <div className="space-y-3">
                    {existingMappings.map((m, i) => {
                      const cName = zones.find(z => z.id === m.zoneId)?.centers?.find(c => c.id === m.centerId)?.name;
                      return (
                        <div key={i} className="bg-white p-4 rounded-2xl border-2 border-emerald-200 flex justify-between items-center shadow-sm">
                           <div>
                             <div className="font-black text-slate-800">{cName}</div>
                             <div className="text-xs font-bold text-emerald-600 mt-1 uppercase tracking-wider">{m.zoneName} Mıntıkası ({m.gender || 'Tümü'})</div>
                           </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-slate-500 font-bold text-sm">Bu mahalleye henüz hiçbir kurum atanmamış.</p>
                )}
             </div>
           )}
        </div>

        {selectedNeighborhood && (
          <div className="space-y-6 animate-in slide-in-from-right-8">
             <div className="bg-indigo-50 p-6 rounded-3xl border-2 border-indigo-100">
                <label className="block text-sm font-black text-indigo-800 mb-3 uppercase tracking-wider flex items-center"><Plus className="w-5 h-5 mr-1"/> 2. Adım: Yeni Bir Kurum (Seçenek) Ekle</label>
                <div className="space-y-4">
                  <select value={selectedTargetZoneId} onChange={e => {setSelectedTargetZoneId(e.target.value); setSelectedCenterId('');}} className="w-full p-4 rounded-2xl border-2 border-indigo-200 font-bold text-lg outline-none focus:border-indigo-500 bg-white">
                     <option value="">Hangi Mıntıkanın Kurumunu Ekleyeceksiniz?</option>
                     {zones.filter(z=>z.active).map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
                  </select>
                  <select value={selectedCenterId} onChange={e => {setSelectedCenterId(e.target.value); setContactName(''); setPhone('');}} disabled={!selectedTargetZoneId} className="w-full p-4 rounded-2xl border-2 border-indigo-200 font-bold text-lg outline-none focus:border-indigo-500 bg-white disabled:opacity-50">
                     <option value="">Kurum Seçin</option>
                     {targetZone?.centers?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  
                  {/* 🚀 YENİ EKLENDİ: Cinsiyet Seçimi */}
                  <select value={selectedGender} onChange={e => setSelectedGender(e.target.value)} disabled={!selectedCenterId} className="w-full p-4 rounded-2xl border-2 border-indigo-200 font-bold text-lg outline-none focus:border-indigo-500 bg-white disabled:opacity-50">
                     <option value="Tümü">Cinsiyet: Tümü (Karma)</option>
                     <option value="Erkek">Sadece Erkek (3-7. Sınıf)</option>
                     <option value="Kız">Sadece Kız</option>
                     <option value="8. Sınıf Erkek">8. Sınıf Erkek</option>
                  </select>

                  <div className="pt-2">
                    {uniquePresets.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span className="text-xs font-bold text-indigo-700/60 w-full">Bu Kurumun Önceki Hocaları:</span>
                        {uniquePresets.map(preset => (
                          <button 
                            key={preset.name} type="button"
                            onClick={() => {setContactName(preset.name); setPhone(preset.phone);}}
                            className="text-[10px] bg-white border border-indigo-300 text-indigo-700 px-2 py-1.5 rounded-lg hover:bg-indigo-100 font-bold transition shadow-sm"
                          >
                            + {preset.name}
                          </button>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <input type="text" value={contactName} onChange={e=>setContactName(e.target.value)} className="w-1/2 text-sm font-bold p-3 rounded-xl border border-indigo-200 outline-none focus:border-indigo-500 bg-white" placeholder="Sorumlu İsim"/>
                      <input type="tel" value={phone} onChange={e=>{
                          let val = e.target.value.replace(/\D/g, '');
                          if (val.startsWith('90')) val = val.substring(2);
                          if (val.startsWith('0')) val = val.substring(1);
                          setPhone(val);
                      }} className="w-1/2 text-sm font-bold p-3 rounded-xl border border-indigo-200 outline-none focus:border-indigo-500 bg-white" placeholder="Sorumlu Tel"/>
                    </div>
                  </div>

                  <button onClick={handleAddException} disabled={!selectedCenterId} className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl hover:bg-indigo-700 transition shadow-lg disabled:opacity-50 flex items-center justify-center mt-2">
                     <Save className="w-5 h-5 mr-2"/> Kurumu Mahalleye Seçenek Olarak Ekle
                  </button>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  )
}