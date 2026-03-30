import React, { useContext } from 'react';
import { Calendar as CalendarIcon, Clock, Phone, CheckCircle2, Info } from 'lucide-react';
import { getNeighborhoodDetails } from '../utils/helpers';
import { ThemeContext } from './ThemeSelector';

export default function TimelineCalendar({ zoneExams, currentUser, defaultContact }) {
  const { currentTheme } = useContext(ThemeContext);
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
  
  const contactInfo = currentUser 
       ? getNeighborhoodDetails(currentUser.zone, currentUser.district, currentUser.neighborhood, currentUser.gender, currentUser.grade) 
       : (defaultContact || { phone: "0553 973 54 40", contactName: "" });

  let takvimPhone = contactInfo?.phone || "0553 973 54 40";
  if (takvimPhone?.includes("0531 333 32 32")) { takvimPhone = "0553 973 54 40"; }

  // DÜZELTME: Giriş Yapılmamışsa (Ana Sayfadaysa) İsim GÖZÜKMEYECEK
  const contactName = currentUser ? (contactInfo.contactName || "ERCÜMENT ÖZTÜRK") : "";

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in zoom-in-95 duration-500">
      
      <div className="flex items-center gap-4 mb-10 pb-4 border-b-2 border-slate-200/50">
         <CalendarIcon className="w-12 h-12" style={{ color: currentTheme.main }} />
         <h2 className="text-4xl md:text-5xl font-black drop-shadow-sm" style={{ color: currentTheme.contrast }}>Sınav Takvimi</h2>
      </div>
      
      <div className="space-y-5 mb-10">
        {sortedGroups.length > 0 ? sortedGroups.map((group, idx) => {
           const isMyExam = currentUser && ((currentUser?.examId === group.exam.firebaseId) || (currentUser?.exam?.firebaseId === group.exam.firebaseId));
           const isMyDate = currentUser && ((currentUser?.selectedDate === group.dateStr) || (currentUser?.exam?.date === group.dateStr));
           
           return (
             <div key={idx} className="bg-white/80 backdrop-blur-md border-2 border-slate-200 p-6 rounded-3xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <div className="text-2xl font-black mb-4 flex items-center text-slate-800">
                   <Clock className="w-6 h-6 mr-3" style={{ color: currentTheme.main }}/>
                   {group.formattedDate} - {group.exam.title}
                </div>
                <div className="flex flex-wrap gap-3">
                   {group.slots.map(s => {
                      const isMySlot = isMyExam && isMyDate && ((currentUser?.selectedTime === s) || (currentUser?.slot === s));
                      return (
                         <span key={s} className={`px-5 py-2.5 rounded-xl text-lg font-black border-2 transition-all ${isMySlot ? 'text-white border-transparent shadow-lg scale-105' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
                               style={{ 
                                   backgroundColor: isMySlot ? currentTheme.main : '',
                                   borderColor: isMySlot ? currentTheme.main : 'var(--color-light-bg)'
                               }}>
                           {s.replace(':', '.')} {isMySlot && <CheckCircle2 className="w-5 h-5 inline ml-1"/>}
                         </span>
                      )
                   })}
                </div>
             </div>
           )
        }) : (
           <div className="flex flex-col items-center justify-center py-16 text-slate-400 bg-white/50 rounded-3xl border-2 border-slate-100">
              <CalendarIcon className="w-16 h-16 mb-4 opacity-30"/>
              <p className="text-xl font-bold">Planlanmış bir sınav bulunmamaktadır.</p>
           </div>
        )}
      </div>

      <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl border-2 shadow-sm" style={{ borderColor: currentTheme.lightBg }}>
         <div className="flex items-start gap-4">
            <Info className="w-8 h-8 mt-1 flex-shrink-0" style={{ color: currentTheme.main }} />
            <div>
               <p className="text-lg font-bold text-slate-700 mb-2">Sınav ile ilgili ayrıntılı bilgi için:</p>
               <a href={`tel:${takvimPhone}`} className="text-2xl md:text-3xl font-black hover:opacity-80 transition block mb-3" style={{ color: currentTheme.contrast }}>
                  {contactName ? `${contactName}: ` : ''}<span style={{ color: currentTheme.main }}>{takvimPhone}</span>
               </a>
               <p className="text-base font-bold text-slate-500">Sınav yoksa gelecek sınavlar hakkında bilgi almak için de arayabilirsiniz.</p>
            </div>
         </div>
      </div>

    </div>
  );
}