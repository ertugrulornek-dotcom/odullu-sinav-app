import React from 'react';
import { Download, Database, AlertTriangle } from 'lucide-react';

export default function DatabaseBackupTab({ zones, students, exams }) {
  const handleBackup = () => {
    try {
      const backupData = {
        timestamp: new Date().toISOString(),
        totalStudents: students?.length || 0,
        totalZones: zones?.length || 0,
        totalExams: exams?.length || 0,
        data: {
          zones: zones || [],
          students: students || [],
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
    }
  };

  return (
    <div className="bg-white rounded-[3rem] shadow-xl border-4 border-slate-100 p-8 md:p-12 animate-in fade-in zoom-in-95 duration-300">
      <h3 className="font-black text-3xl text-slate-900 mb-6 flex items-center">
         <Database className="mr-3 w-8 h-8 text-indigo-600"/> Sistem Yedekleme Modülü
      </h3>
      
      <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-3xl mb-8">
        <h4 className="text-indigo-900 font-black text-lg mb-2">Bu modül ne işe yarar?</h4>
        <p className="text-indigo-700 font-medium text-sm">
          Veritabanınızdaki tüm mıntıkaları, atanmış mahalleleri, sınav ayarlarını ve sisteme kayıtlı olan tüm öğrencileri tek bir "JSON" dosyası olarak bilgisayarınıza indirir. Olası bir veri kaybı veya yanlış işlem durumunda elinizde sistemin tam bir kopyası bulunmuş olur.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-slate-50 border-2 border-slate-100 p-6 rounded-3xl text-center">
           <span className="block text-slate-400 font-black uppercase text-xs tracking-wider mb-2">Öğrenci Kaydı</span>
           <span className="text-3xl font-black text-slate-800">{students?.length || 0}</span>
        </div>
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
        className="w-full md:w-auto bg-indigo-600 text-white font-black text-xl py-5 px-10 rounded-2xl hover:bg-indigo-700 transition shadow-xl shadow-indigo-500/30 flex items-center justify-center"
      >
        <Download className="w-6 h-6 mr-3" /> Tüm Veritabanını İndir (.JSON)
      </button>
    </div>
  );
}