import React, { useState } from 'react';
import { Save, AlertCircle, Upload, MapPin } from 'lucide-react';
import { db, appId } from '../../services/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export default function SpecialBoysCentersTab({ zones, setHasMadeChanges }) {
    const [selectedZone, setSelectedZone] = useState("");
    const [bulkText, setBulkText] = useState("");
    const [loading, setLoading] = useState(false);

    const handleBulkSave = async () => {
        if (!selectedZone) return alert("Lütfen önce bir mıntıka seçin.");
        if (!bulkText.trim()) return alert("Lütfen veri girin.");
        
        setLoading(true);
        try {
            const lines = bulkText.trim().split('\n');
            const zone = zones.find(z => z.id.toString() === selectedZone);
            
            if (!zone) return alert("Mıntıka bulunamadı.");

            let newSpecialCenters = { ...zone.specialBoysCenters };

            lines.forEach(line => {
                // Sütun Sırası: İlçe | Mahalle | Kurum Adı | Sorumlu Hoca | Telefon | Açık Adres | Harita Linki
                const parts = line.split('\t').map(p => p.trim());
                if (parts.length >= 5) {
                    const [district, neighborhood, centerName, contactName, contactPhone, address, mapLink] = parts;
                    const centerKey = `${district}-${neighborhood}`;
                    
                    newSpecialCenters[centerKey] = {
                        centerName: centerName || "Özel LGS Erkek Merkezi",
                        contactName: contactName || "",
                        contactPhone: contactPhone || "0553 973 54 40",
                        address: address || "",
                        mapLink: mapLink || ""
                    };
                }
            });

            setHasMadeChanges(true);
            await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'zones', zone.id.toString()), {
                specialBoysCenters: newSpecialCenters
            });

            alert(`${zone.name} için 8. Sınıf Erkek özel merkezleri başarıyla güncellendi!`);
            setBulkText("");
        } catch (err) { console.error(err); alert("Bir hata oluştu."); }
        setLoading(false);
    };

    return (
        <div className="bg-white rounded-[3rem] shadow-xl border-4 border-slate-100 p-8 md:p-12 animate-in fade-in">
            <div className="flex items-center gap-4 mb-8 border-b-2 border-slate-100 pb-6">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 flex items-center justify-center rounded-2xl"><Upload /></div>
                <div>
                    <h2 className="text-3xl font-black text-slate-800">8. Sınıf Erkek Özel Merkezleri</h2>
                    <p className="text-slate-500 font-bold">Toplu Ekleme (Excel'den Kopyala / Yapıştır)</p>
                </div>
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 p-5 rounded-2xl mb-8 flex items-start">
                <AlertCircle className="w-6 h-6 text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-bold text-blue-900 leading-relaxed">
                    Önce mıntıkayı seçin, ardından Excel'den kopyalarken sütun sırasının şu şekilde olmasına dikkat edin: <br/><br/>
                    <span className="text-blue-700 bg-blue-200/50 px-2 py-1 rounded font-black">İlçe</span> | 
                    <span className="text-blue-700 bg-blue-200/50 px-2 py-1 rounded ml-1 font-black">Mahalle</span> | 
                    <span className="text-blue-700 bg-blue-200/50 px-2 py-1 rounded ml-1 font-black">Kurum Adı</span> | 
                    <span className="text-blue-700 bg-blue-200/50 px-2 py-1 rounded ml-1 font-black">Sorumlu Hoca</span> | 
                    <span className="text-blue-700 bg-blue-200/50 px-2 py-1 rounded ml-1 font-black">Telefon</span> | 
                    <span className="text-blue-700 bg-blue-200/50 px-2 py-1 rounded ml-1 font-black">Açık Adres</span> | 
                    <span className="text-blue-700 bg-blue-200/50 px-2 py-1 rounded ml-1 font-black">Harita Linki</span>
                </p>
            </div>

            <div className="mb-6">
               <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wider flex items-center"><MapPin className="w-4 h-4 mr-2"/> Hangi Mıntıka İçin Yüklüyorsunuz?</label>
               <select value={selectedZone} onChange={e => setSelectedZone(e.target.value)} className="w-full md:w-1/2 p-4 rounded-2xl border-4 border-slate-100 font-bold text-base outline-none focus:border-indigo-500 bg-white">
                  <option value="">Mıntıka Seçiniz...</option>
                  {zones.filter(z=>z.active).map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
               </select>
            </div>

            <textarea
                rows={10}
                className="w-full border-4 border-slate-100 rounded-2xl p-6 text-sm font-medium focus:border-indigo-500 outline-none mb-6 resize-none"
                placeholder="Excel tablosundan kopyaladığınız veriyi direkt buraya yapıştırın..."
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
            />

            <button onClick={handleBulkSave} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 px-8 rounded-xl shadow-lg flex items-center justify-center transition disabled:opacity-50">
                <Save className="w-5 h-5 mr-2" />
                {loading ? "Kaydediliyor..." : "Özel Merkezleri Sisteme Yükle"}
            </button>
        </div>
    );
}