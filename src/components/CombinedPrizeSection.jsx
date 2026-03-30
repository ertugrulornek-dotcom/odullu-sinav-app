import React, { useState, useContext } from 'react';
import { ChevronLeft, ChevronRight, Gift, CheckCircle2 } from 'lucide-react';
import { ThemeContext } from './ThemeSelector';
import { parsePrizeArray } from '../utils/helpers';

export default function CombinedPrizeSection({ displayPrizes, currentUser }) {
  const { currentTheme } = useContext(ThemeContext);
  const [currentCategory, setCurrentCategory] = useState(0);

  const categories = [
    { title: "Büyük Ödüller", data: displayPrizes?.grand },
    { title: "Derece Ödülleri", data: displayPrizes?.degree },
    { title: "Katılım Ödülleri", data: displayPrizes?.participation }
  ];

  const handleNext = () => setCurrentCategory((prev) => (prev + 1) % 3);
  const handlePrev = () => setCurrentCategory((prev) => (prev - 1 + 3) % 3);

  const activeCategory = categories[currentCategory];
  const items = parsePrizeArray(activeCategory.data);

  // SADECE GİRİŞ YAPMIŞ KULLANICININ KAYITLI ÖDÜLÜNÜ ALIR
  const userSelectedPrize = currentUser?.selectedParticipationPrize;

  return (
    <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 p-8 md:p-12 relative max-w-5xl mx-auto overflow-hidden">
      
      <div className="flex items-center justify-between mb-10 pb-6 border-b-2 border-slate-100">
        <button onClick={handlePrev} className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center hover:bg-slate-100 border border-slate-200 transition-transform active:scale-95 shadow-sm">
           <ChevronLeft className="w-6 h-6 text-slate-600" />
        </button>
        
        <div className="text-center">
           <div className="flex justify-center items-center gap-2 mb-2">
              <Gift className="w-8 h-8" style={{ color: currentTheme.main }} />
              <h2 className="text-3xl md:text-4xl font-black" style={{ color: currentTheme.contrast }}>{activeCategory.title}</h2>
           </div>
           <div className="flex justify-center gap-1.5 mt-2">
              {[0,1,2].map(idx => (
                 <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentCategory ? 'w-8' : 'w-2 bg-slate-200'}`} style={{ backgroundColor: idx === currentCategory ? currentTheme.main : '' }}></div>
              ))}
           </div>
        </div>

        <button onClick={handleNext} className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center hover:bg-slate-100 border border-slate-200 transition-transform active:scale-95 shadow-sm">
           <ChevronRight className="w-6 h-6 text-slate-600" />
        </button>
      </div>

      <div className="min-h-[300px] flex items-center justify-center animate-in fade-in zoom-in-95 duration-300" key={currentCategory}>
        {(!items || items.length === 0 || !items[0].title) ? (
            <div className="text-center text-slate-400 font-bold py-10">Bu kategori için henüz ödül eklenmemiş.</div>
        ) : (
            <>
               {currentCategory === 2 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                     {items.map((prize, idx) => {
                        // KULLANICININ KAYITLI ÖDÜLÜ EŞLEŞİYOR MU KONTROLÜ
                        const isSelected = currentUser && userSelectedPrize === prize.title;
                        
                        return (
                           <div key={idx} 
                                className={`rounded-2xl p-4 text-center border-4 transition-all duration-300 relative flex flex-col items-center justify-center h-48 ${isSelected ? 'scale-105 shadow-xl' : ''}`}
                                style={{ 
                                   backgroundColor: isSelected ? 'white' : currentTheme.lightBg, 
                                   borderColor: isSelected ? currentTheme.main : 'transparent' 
                                }}>
                              
                              {isSelected && <div className="absolute top-3 right-3 rounded-full w-7 h-7 flex items-center justify-center text-white shadow-md animate-in zoom-in" style={{ backgroundColor: currentTheme.main }}><CheckCircle2 className="w-5 h-5"/></div>}
                              
                              <div className="w-20 h-20 bg-white rounded-xl shadow-sm border border-slate-100 mb-4 p-2 overflow-hidden flex items-center justify-center flex-shrink-0">
                                 {prize.img ? <img src={prize.img} className="w-full h-full object-contain" /> : <Gift className="w-10 h-10 opacity-30"/>}
                              </div>
                              <h3 className="font-black text-slate-800 text-sm md:text-base leading-tight">{prize.title}</h3>
                           </div>
                        )
                     })}
                  </div>
               ) : (
                  <div className="flex flex-col md:flex-row items-center gap-10 w-full justify-center">
                     {items.map((prize, idx) => (
                        <div key={idx} className="flex-1 max-w-sm text-center group">
                           <div className="w-full aspect-square md:aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-8 border-white group-hover:scale-105 transition-transform duration-300 mb-6" style={{ backgroundColor: currentTheme.lightBg }}>
                             {prize.img ? <img src={prize.img} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><Gift className="w-20 h-20" /></div>}
                           </div>
                           <h3 className="text-3xl font-black text-slate-900 mb-2">{prize.title}</h3>
                           <p className="text-slate-600 font-medium">{prize.description}</p>
                        </div>
                     ))}
                  </div>
               )}
            </>
        )}
      </div>
    </div>
  );
}