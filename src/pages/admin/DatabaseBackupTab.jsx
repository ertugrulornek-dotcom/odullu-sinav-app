import React, { useState } from 'react';
import { Download, Database, AlertTriangle } from 'lucide-react';
import { collection, getDocs } from "firebase/firestore";
import { db, appId } from '../../services/firebase';

export default function DatabaseBackupTab({ zones, exams }) {
  const [isBackingUp, setIsBackingUp] = useState(false);

  const handleBackup = async () => {
    setIsBackingUp(true);
    try {
      // TÜM veritabanındaki öğrencileri indir
      const studentsSnap = await getDocs(collection(db, 'artifacts', appId, 'public', 'data', 'students'));
      const allStudents = studentsSnap.docs.map(doc => ({ firebaseId: doc.id, ...doc.data() }));

      const backupData = {
        timestamp: new Date().toISOString(),
        totalStudents: allStudents.length,
        totalZones: zones?.length || 0,
        totalExams: exams?.length || 0,
        data: {
          zones: zones || [],
          students: allStudents,
          exams: exams || []
        }
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Sistem_Yedegi_${new Date().toLocaleDateString('tr-TR').replace(/\./g, '_')}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Yedekleme hatası:", error);
      alert("Yedekleme dosyası oluşturulurken bir hata oluştu.");
    } finally {
      setIsBackingUp(false);
    }
  };

  return (
    <div className="bg-white rounded-[3rem] shadow-xl border-4 border-slate-100 p-8 md:p-12 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 border-b-2 border-slate-100 pb-8 gap-4">
        <div>
          <h3 className="font-black text-3xl text-slate-900 mb-2">Veritabanı Yedekleme</h3>
          <p className="text-base font-bold text-slate-500">Tüm sistem verilerinizi güvenli bir şekilde bilgisayarınıza indirin.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
        <div className="bg-slate-50 border-2 border-slate-100 p-6 rounded-3xl text-center">
           <span className="block text-slate-400 font-black uppercase text-xs tracking-wider mb-2">Aktif Mıntıka</span>
           <span className="text-3xl font-black text-slate-800">{zones?.length || 0}</span>
        </div>
        <div className="bg-slate-50 border-2 border-slate-100 p-6 rounded-3xl text-center">
           <span className="block text-slate-400 font-black uppercase text-xs tracking-wider mb-2">Sınav / Etkinlik</span>
           <span className="text-3xl font-black text-slate-800">{exams?.length || 0}</span>
        </div>
      </div>

      <div className="bg-amber-50 border-2 border-amber-200 p-6 rounded-3xl mb-8 flex items-start">
         <AlertTriangle className="w-6 h-6 text-amber-600 mr-4 flex-shrink-0 mt-1" />
         <div>
            <h4 className="text-amber-900 font-black mb-1">Güvenlik Uyarısı</h4>
            <p className="text-amber-800 text-sm font-bold">
               İndireceğiniz dosya, sistemdeki tüm öğrencilerin kişisel verilerini ve telefon numaralarını içerir. Bu dosyayı güvenli bir diskte saklayınız ve üçüncü şahıslarla paylaşmayınız.
            </p>
         </div>
      </div>

      <button 
        onClick={handleBackup} 
        disabled={isBackingUp}
        className="w-full bg-indigo-600 text-white font-black text-xl py-6 rounded-2xl hover:bg-indigo-700 transition shadow-xl disabled:opacity-50 flex items-center justify-center">
        {isBackingUp ? "Tüm Veriler Çekiliyor..." : <><Database className="w-6 h-6 mr-3" /> Tüm Veritabanını İndir (.JSON)</>}
      </button>
    </div>
  );
}