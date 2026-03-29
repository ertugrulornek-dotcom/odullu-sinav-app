import React from 'react';
import { Calendar as CalendarIcon, Clock, Phone, CheckCircle2 } from 'lucide-react';
import { getNeighborhoodDetails } from '../utils/helpers';

export default function TimelineCalendar({ zoneExams, currentUser, defaultContact }) {
  const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
  
  let groupedSessions = {};

  zoneExams.forEach(exam => {
    if(exam.sessions) {
      exam.sessions.forEach(session => {
         const [y, m, d] = session.date.split('-');
         if(!y || !m || !d) return; 
         
         const dateKey = `${d}-${m}-${y}`;
         const groupKey = `${exam.firebaseId}_${dateKey}`;

         if (!groupedSessions[groupKey]) {
            groupedSessions[groupKey] = {
               exam,
               dateStr: session.date,
               formattedDate: `${parseInt(d)} ${monthNames[parseInt(m)-1]}`,
               slots: [],
               timestamp: new Date(y, parseInt(m)-1, d).getTime()
            };
         }

         session.slots.forEach(slot => {
            if(!groupedSessions[groupKey].slots.includes(slot)) {
               groupedSessions[groupKey].slots.push(slot);
            }
         });
         groupedSessions[groupKey].slots.sort();
      });
    }
  });

  const sortedGroups = Object.values(groupedSessions).sort((a,b) => a.timestamp - b.timestamp);
  
  // Eğer kullanıcı giriş yaptıysa onun merkez numarasını, yapmadıysa varsayılan ana numarayı kullanır
  const contactInfo = currentUser 
       ? getNeighborhoodDetails(currentUser.zone, currentUser.district, currentUser.neighborhood, currentUser.gender) 
       : (defaultContact || { phone: "0531 333 32 32", contactName: "" });

  return (
    <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden flex flex-col md:flex-row max-w-5xl mx-auto animate-in fade-in zoom-in-95 duration-500">
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white p-8 md:w-1/3 flex flex-col justify-center items-center text-center relative overflow-hidden">
         <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
         <CalendarIcon className="w-16 h-16 text-indigo-300 mb-4 opacity-80 relative z-10 animate-bounce" style={{animationDuration: '3s'}} />
         <h2 className="text-3xl md:text-4xl font-black leading-tight relative z-10 drop-shadow-md">Sınav<br/>Takvimi</h2>
         <div className="mt-6 w-12 h-1 bg-indigo-400 rounded-full relative z-10"></div>
      </div>
      
      <div className="p-8 md:w-2/3 flex flex-col justify-between bg-slate-50/80 backdrop-blur-md">
        <div className="space-y-4 mb-8">
          {sortedGroups.length > 0 ? sortedGroups.map((group, idx) => {
             const isMyExam = currentUser && ((currentUser?.examId === group.exam.firebaseId) || (currentUser?.exam?.firebaseId === group.exam.firebaseId));
             const isMyDate = currentUser && ((currentUser?.selectedDate === group.dateStr) || (currentUser?.exam?.date === group.dateStr));
             
             return (
               <div key={idx} className="bg-white border-2 border-indigo-100 p-5 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                  <div className="text-xl font-black text-indigo-900 mb-3 flex items-center">
                     <Clock className="w-5 h-5 mr-2 text-indigo-500"/>
                     {group.formattedDate} - {group.exam.title}
                  </div>
                  <div className="flex flex-wrap gap-2">
                     {group.slots.map(s => {
                        const isMySlot = isMyExam && isMyDate && ((currentUser?.selectedTime === s) || (currentUser?.slot === s));
                        return (
                           <span key={s} className={`px-4 py-2 rounded-xl text-sm font-black border-2 ${isMySlot ? 'bg-green-500 text-white border-green-500 shadow-sm' : 'bg-indigo-50 text-indigo-700 border-indigo-100'}`}>
                             {s.replace(':', '.')} {isMySlot && <CheckCircle2 className="w-4 h-4 inline ml-1"/>}
                           </span>
                        )
                     })}
                  </div>
               </div>
             )
          }) : (
             <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <CalendarIcon className="w-16 h-16 mb-4 opacity-50"/>
                <p className="text-lg font-bold">Planlanmış bir sınav bulunmamaktadır.</p>
             </div>
          )}
        </div>

        <div className="bg-indigo-50 p-6 rounded-2xl border-l-4 border-indigo-500 shadow-inner">
           <p className="text-base font-black text-slate-700 mb-3">Sınav ile ilgili ayrıntılı bilgi için:</p>
           <div className="flex items-center gap-3 mb-3">
              <Phone className="w-6 h-6 text-indigo-600 animate-pulse" />
              <a href={`tel:${contactInfo.phone}`} className="text-xl md:text-2xl font-black text-indigo-700 hover:text-indigo-500 transition">
                 {contactInfo.contactName ? `${contactInfo.contactName}: ` : ''}{contactInfo.phone}
              </a>
           </div>
           <p className="text-sm font-medium text-slate-600">Sınav yoksa gelecek sınavlar hakkında bilgi almak için de arayabilirsiniz.</p>
        </div>
      </div>
    </div>
  );
}