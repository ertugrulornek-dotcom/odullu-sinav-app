import React, { useState, useEffect } from 'react';
import { ShieldAlert, Trash2, ListPlus } from 'lucide-react';
import { db, appId } from '../../services/firebase';
import { collection, addDoc, deleteDoc, doc, onSnapshot } from "firebase/firestore";

export default function BlacklistTab({ setHasMadeChanges }) {
  const [blacklistPhones, setBlacklistPhones] = useState([]);
  const [newBlacklistPhone, setNewBlacklistPhone] = useState('');
  const [bulkPhones, setBulkPhones] = useState(''); 
  const [isBulkMode, setIsBulkMode] = useState(false); 

  useEffect(() => {
      const unsub = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'blacklist'), snap => {
         setBlacklistPhones(snap.docs.map(d => ({ id: d.id, phone: d.data().phone })));
      });
      return () => unsub();
  }, []);

  // 🚀 DÜZELTME: Kırpma hatasını çözen Akıllı Telefon Çevirici
  const formatPhoneNumber = (phoneRaw) => {
      let phone = String(phoneRaw || "").replace(/\D/g, '');
      if (phone.startsWith('90')) phone = phone.substring(2);
      if (phone.startsWith('0')) phone = phone.substring(1);
      if (phone.length > 0 && !phone.startsWith('5')) phone = '5' + phone;
      if (phone.length > 10) phone = phone.substring(0, 10);
      return phone;
  };

  const handleAddBlacklist = async () => {
    const p = formatPhoneNumber(newBlacklistPhone);
    
    if(p.length !== 10) return alert("Lütfen 10 haneli geçerli bir telefon numarası giriniz.");
    
    if (blacklistPhones.some(bl => bl.phone === p)) return alert("Bu numara zaten kara listede mevcut.");

    try {
      setHasMadeChanges(true);
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'blacklist'), { phone: p });
      setNewBlacklistPhone('');
      alert("Numara kara listeye eklendi.");
    } catch(e) { console.error(e); }
  };

  const handleBulkAdd = async () => {
     if(!bulkPhones.trim()) return alert("Lütfen eklenecek numaraları yapıştırın.");
     
     const lines = bulkPhones.split('\n');
     let successCount = 0;
     let errors = 0;

     setHasMadeChanges(true);

     for (let line of lines) {
        if(!line.trim()) continue;
        
        const p = formatPhoneNumber(line);
        
        if (p.length === 10) {
           if (!blacklistPhones.some(bl => bl.phone === p)) {
               try {
                 await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'blacklist'), { phone: p });
                 successCount++;
               } catch(e) { errors++; }
           }
        }
     }

     alert(`${successCount} numara başarıyla eklendi.${errors > 0 ? ` ${errors} hata oluştu.` : ''}`);
     setBulkPhones('');
     setIsBulkMode(false);
  };

  const handleRemoveBlacklist = async (id) => {
    try {
      setHasMadeChanges(true);
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'blacklist', id));
    } catch(e) { console.error(e); }
  };

  return (
    <div className="bg-white rounded-[3rem] shadow-xl border-4 border-red-100 p-8 md:p-12 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
         <div>
            <h3 className="font-black text-3xl text-red-900 mb-2 flex items-center"><ShieldAlert className="mr-3 w-8 h-8"/> Kara Liste (Yasaklı Numaralar)</h3>
            <p className="text-base font-bold text-slate-500">Bu listeye eklenen personel numaraları sisteme kayıt oluşturamazlar.</p>
         </div>
         <button onClick={() => setIsBulkMode(!isBulkMode)} className="flex items-center text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-5 py-2.5 rounded-xl font-bold transition">
            <ListPlus className="w-5 h-5 mr-2"/> {isBulkMode ? 'Tekli Ekleme Ekranına Dön' : 'Toplu Excel/Metin Yapıştır'}
         </button>
      </div>
      
      {!isBulkMode ? (
         <div className="bg-red-50 p-6 rounded-2xl border border-red-100 flex flex-col md:flex-row gap-4 mb-8">
           <input type="text" value={newBlacklistPhone} onChange={e=>setNewBlacklistPhone(e.target.value.replace(/\D/g, ''))} className="flex-1 p-4 rounded-xl border border-red-200 outline-none focus:border-red-500 font-bold text-lg" placeholder="5XX XXX XX XX" />
           <button onClick={handleAddBlacklist} className="bg-red-600 text-white px-8 py-4 rounded-xl font-black shadow-lg hover:bg-red-700 transition whitespace-nowrap">Numarayı Yasakla</button>
         </div>
      ) : (
         <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 mb-8 animate-in fade-in">
           <p className="text-xs font-bold text-indigo-800 mb-3 uppercase tracking-widest">Numaraları Alt Alta Yapıştırın (Excel'den vb.)</p>
           <textarea rows="6" value={bulkPhones} onChange={e=>setBulkPhones(e.target.value)} className="w-full p-4 rounded-xl border border-indigo-200 outline-none focus:border-indigo-500 font-mono text-sm resize-none mb-4" placeholder="05321234567&#10;5559876543&#10;..."/>
           <button onClick={handleBulkAdd} className="w-full bg-indigo-600 text-white px-8 py-4 rounded-xl font-black shadow-lg hover:bg-indigo-700 transition">Tüm Numaraları Kara Listeye Ekle</button>
         </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-6 border-t-2 border-slate-100">
        {blacklistPhones.map(bl => (
           <div key={bl.id} className="bg-white border-2 border-red-100 p-4 rounded-xl flex justify-between items-center shadow-sm">
              <span className="font-black tracking-widest text-slate-800">0{bl.phone}</span>
              <button onClick={() => handleRemoveBlacklist(bl.id)} className="text-red-400 hover:text-red-600 bg-red-50 p-2 rounded-lg transition" title="Yasağı Kaldır"><Trash2 className="w-5 h-5"/></button>
           </div>
        ))}
        {blacklistPhones.length === 0 && <div className="col-span-full text-center text-slate-400 font-bold py-10">Listede hiç numara bulunmuyor.</div>}
      </div>
    </div>
  )
}