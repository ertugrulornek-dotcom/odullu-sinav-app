import React, { useContext } from 'react';
import { Gift, CheckCircle2 } from 'lucide-react';
import { ThemeContext } from './ThemeSelector';
import { parsePrizeArray } from '../utils/helpers';

export default function CombinedPrizeSection({ displayPrizes, currentUser }) {
  const { currentTheme } = useContext(ThemeContext);

  // DÜZELTME: Katılım Ödülleri, Derece Ödüllerinin Üstüne Alındı
  const categories = [
    { title: "Büyük Ödüller", data: displayPrizes?.grand, type: "grand" },
    { title: "Katılım Ödülleri", data: displayPrizes?.participation, type: "participation" },
    { title: "Derece Ödülleri", data: displayPrizes?.degree, type: "degree" }
  ];

  const userSelectedPrize = currentUser?.selectedParticipationPrize;

  return (
    <div className="relative max-w-6xl mx-auto w-full space-y-24">
      {categories.map((cat, index) => {
        const items = parsePrizeArray(cat.data);
        if (!items || items.length === 0 || !items[0].title) return null;

        return (
           <div key={index} className="w-full animate-in fade-in duration-500">
              
              <div className="flex flex-col items-center mb-12">
                 <h2 className="text-4xl md:text-6xl font-black text-center uppercase tracking-wider drop-shadow-lg" 
                     style={{ color: currentTheme.contrast, fontFamily: "'Fredoka One', 'Baloo 2', 'Comic Sans MS', 'Nunito', sans-serif", textShadow: '2px 4px 0px rgba(0,0,0,0.1)' }}>
                    {cat.title}
                 </h2>
                 <div className="h-2 w-32 rounded-full mt-5" style={{ backgroundColor: currentTheme.main }}></div>
              </div>

              {cat.type === 'participation' ? (
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-8 w-full">
                    {items.map((prize, idx) => {
                       const isSelected = currentUser && userSelectedPrize === prize.title;
                       return (
                          <div key={idx} className={`relative flex flex-col items-center justify-center p-4 transition-all duration-300 hover:-translate-y-2 group ${isSelected ? 'scale-110' : ''}`}>
                             {isSelected && <div className="absolute top-0 right-0 rounded-full w-8 h-8 flex items-center justify-center text-white shadow-md animate-in zoom-in z-10" style={{ backgroundColor: currentTheme.main }}><CheckCircle2 className="w-5 h-5"/></div>}
                             
                             <div className="w-32 h-32 md:w-40 md:h-40 mb-4 overflow-hidden flex items-center justify-center flex-shrink-0 drop-shadow-xl transition-transform group-hover:scale-105 bg-transparent">
                                {prize.img ? <img src={prize.img} className="w-full h-full object-contain" /> : <Gift className="w-16 h-16 opacity-40"/>}
                             </div>
                             <h3 className="font-black text-slate-800 text-lg md:text-xl leading-tight text-center drop-shadow-sm">{prize.title}</h3>
                          </div>
                       )
                    })}
                 </div>
              ) : (
                 <div className="flex flex-col md:flex-row items-center gap-10 w-full justify-center flex-wrap">
                    {items.map((prize, idx) => (
                       <div key={idx} className="flex-1 min-w-[250px] max-w-sm text-center group">
                          <div className="w-full aspect-square md:aspect-[4/3] overflow-hidden drop-shadow-2xl group-hover:scale-105 transition-transform duration-300 mb-6 bg-transparent">
                            {prize.img ? <img src={prize.img} className="w-full h-full object-contain" /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><Gift className="w-24 h-24" /></div>}
                          </div>
                          <h3 className="text-3xl font-black text-slate-900 mb-2 drop-shadow-sm">{prize.title}</h3>
                          <p className="text-slate-700 font-bold text-lg">{prize.description}</p>
                       </div>
                    ))}
                 </div>
              )}
           </div>
        );
      })}
    </div>
  );
}