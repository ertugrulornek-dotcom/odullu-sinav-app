import React, { useState } from 'react';
import { Building2, Edit3, Trash2, MapPin, Save, X, Plus } from 'lucide-react';
import { db, appId } from '../../services/firebase';
import { updateDoc, doc } from 'firebase/firestore';

export default function SpecialBoysCentersTab({ zones, setHasMadeChanges }) {
    const [selectedZoneId, setSelectedZoneId] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [editingKey, setEditingKey] = useState(null);
    
    const [formData, setFormData] = useState({
        district: '',
        neighborhood: '',
        centerName: '',
        contactName: '',
        contactPhone: '',
        address: '',
        mapLink: ''
    });

    const activeZone = zones.find(z => z.id.toString() === selectedZoneId);
    const specialCenters = activeZone?.specialBoysCenters || {};
    
    const handleSave = async () => {
        if (!selectedZoneId) return alert("Lütfen önce mıntıka seçin.");
        if (!formData.district || !formData.neighborhood || !formData.centerName) {
            return alert("İlçe, Mahalle ve Kurum Adı zorunludur.");
        }

        const key = `${formData.district}-${formData.neighborhood}`;
        const newSpecialCenters = { ...specialCenters };
        
        // Eğer düzenleme yapılıyorsa ve anahtar değiştiyse eski anahtarı sil
        if (isEditing && editingKey && editingKey !== key) {
            delete newSpecialCenters[editingKey];
        }

        newSpecialCenters[key] = { ...formData };

        try {
            await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'zones', selectedZoneId), {
                specialBoysCenters: newSpecialCenters
            });
            setHasMadeChanges(true);
            alert("Özel Erkek Merkezi başarıyla kaydedildi!");
            
            setFormData({ district: '', neighborhood: '', centerName: '', contactName: '', contactPhone: '', address: '', mapLink: '' });
            setIsEditing(false);
            setEditingKey(null);
        } catch (error) {
            alert("Hata oluştu: " + error.message);
        }
    };

    const handleEdit = (key, data) => {
        setFormData({ ...data });
        setEditingKey(key);
        setIsEditing(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (key) => {
        if (!window.confirm("Bu merkezi silmek istediğinize emin misiniz?")) return;
        
        const newSpecialCenters = { ...specialCenters };
        delete newSpecialCenters[key];

        try {
            await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'zones', selectedZoneId), {
                specialBoysCenters: newSpecialCenters
            });
            setHasMadeChanges(true);
        } catch (error) {
            alert("Silinirken hata oluştu.");
        }
    };

    const cancelEdit = () => {
        setFormData({ district: '', neighborhood: '', centerName: '', contactName: '', contactPhone: '', address: '', mapLink: '' });
        setIsEditing(false);
        setEditingKey(null);
    };

    return (
        <div className="bg-white rounded-[3rem] shadow-xl border-4 border-blue-50 p-8 md:p-12 animate-in fade-in zoom-in-95">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b-2 border-slate-100 pb-6 gap-4">
                <div>
                    <h3 className="font-black text-3xl text-slate-900 mb-2">8. Sınıf Erkek (Özel) Sınav Merkezleri</h3>
                    <p className="text-base font-bold text-slate-500">
                        8. Sınıf Erkek öğrenciler için tahsis edilmiş özel kurum atamalarını tek tek ekleyin veya düzenleyin.
                    </p>
                </div>
            </div>

            <div className="mb-10 bg-slate-50 p-6 rounded-3xl border-2 border-slate-100">
                <label className="block text-sm font-black text-slate-700 mb-3 uppercase tracking-wider flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-indigo-500"/> İşlem Yapılacak Mıntıkayı Seçin
                </label>
                <select value={selectedZoneId} onChange={e => { setSelectedZoneId(e.target.value); cancelEdit(); }} className="w-full md:w-1/2 p-4 rounded-2xl border-2 border-slate-200 font-bold text-lg outline-none focus:border-indigo-500 bg-white">
                    <option value="">Mıntıka Seçiniz...</option>
                    {zones.filter(z=>z.active).map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
                </select>
            </div>

            {selectedZoneId && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    
                    {/* SOL TARAF: FORM (EKLE / DÜZENLE) */}
                    <div className="lg:col-span-1 bg-blue-50 p-6 rounded-3xl border-2 border-blue-100 h-fit">
                        <h4 className="font-black text-blue-900 text-lg mb-6 flex items-center">
                            {isEditing ? <Edit3 className="w-5 h-5 mr-2"/> : <Plus className="w-5 h-5 mr-2"/>}
                            {isEditing ? 'Merkezi Düzenle' : 'Yeni Merkez Ekle'}
                        </h4>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-blue-800 mb-1 uppercase">İlçe *</label>
                                <input type="text" value={formData.district} onChange={e=>setFormData({...formData, district: e.target.value})} className="w-full p-3 rounded-xl border outline-none font-bold" placeholder="Örn: Gebze" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-blue-800 mb-1 uppercase">Mahalle *</label>
                                <input type="text" value={formData.neighborhood} onChange={e=>setFormData({...formData, neighborhood: e.target.value})} className="w-full p-3 rounded-xl border outline-none font-bold" placeholder="Örn: Barış" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-blue-800 mb-1 uppercase">Kurum Adı *</label>
                                <input type="text" value={formData.centerName} onChange={e=>setFormData({...formData, centerName: e.target.value})} className="w-full p-3 rounded-xl border outline-none font-bold" placeholder="Örn: Atatürk Ortaokulu" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-blue-800 mb-1 uppercase">Sorumlu İsim</label>
                                    <input type="text" value={formData.contactName} onChange={e=>setFormData({...formData, contactName: e.target.value})} className="w-full p-3 rounded-xl border outline-none font-bold text-sm" placeholder="Ahmet Hoca" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-blue-800 mb-1 uppercase">Telefon</label>
                                    <input type="text" value={formData.contactPhone} onChange={e=>setFormData({...formData, contactPhone: e.target.value})} className="w-full p-3 rounded-xl border outline-none font-bold text-sm" placeholder="0555..." />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-blue-800 mb-1 uppercase">Açık Adres</label>
                                <textarea rows="2" value={formData.address} onChange={e=>setFormData({...formData, address: e.target.value})} className="w-full p-3 rounded-xl border outline-none font-medium resize-none text-sm" placeholder="Mahalle, Sokak vs." />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-blue-800 mb-1 uppercase">Harita Linki</label>
                                <input type="text" value={formData.mapLink} onChange={e=>setFormData({...formData, mapLink: e.target.value})} className="w-full p-3 rounded-xl border outline-none font-medium text-sm" placeholder="https://maps.google..." />
                            </div>
                        </div>

                        <div className="mt-6 flex flex-col gap-3">
                            <button onClick={handleSave} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl shadow-lg flex justify-center items-center transition">
                                <Save className="w-5 h-5 mr-2"/> {isEditing ? 'Güncelle' : 'Kaydet'}
                            </button>
                            {isEditing && (
                                <button onClick={cancelEdit} className="w-full bg-white text-slate-600 font-black py-3 rounded-xl border border-slate-200 hover:bg-slate-100 transition">
                                    İptal Et
                                </button>
                            )}
                        </div>
                    </div>

                    {/* SAĞ TARAF: LİSTE */}
                    <div className="lg:col-span-2">
                        <h4 className="font-black text-slate-800 text-lg mb-6">Mevcut Kayıtlı Merkezler ({Object.keys(specialCenters).length})</h4>
                        
                        {Object.keys(specialCenters).length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {Object.entries(specialCenters).map(([key, data]) => (
                                    <div key={key} className="bg-white border-2 border-slate-100 rounded-2xl p-5 hover:border-blue-300 transition shadow-sm relative group">
                                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                                            <button onClick={() => handleEdit(key, data)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white"><Edit3 className="w-4 h-4"/></button>
                                            <button onClick={() => handleDelete(key)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white"><Trash2 className="w-4 h-4"/></button>
                                        </div>
                                        <div className="inline-block bg-blue-100 text-blue-800 text-xs font-black px-2 py-1 rounded-md mb-2">{data.district} / {data.neighborhood}</div>
                                        <h5 className="font-black text-slate-800 text-lg leading-tight mb-2 pr-16">{data.centerName}</h5>
                                        <p className="text-sm font-bold text-slate-500 mb-1"><Building2 className="w-4 h-4 inline mr-1 opacity-70"/> {data.contactName || 'İsimsiz'} - {data.contactPhone}</p>
                                        <p className="text-xs text-slate-400 line-clamp-1" title={data.address}>{data.address || 'Adres Yok'}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center font-bold text-slate-400 p-10 border-4 border-dashed border-slate-100 rounded-3xl">
                                Bu mıntıkaya atanmış 8. Sınıf Erkek merkezi bulunmuyor.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}