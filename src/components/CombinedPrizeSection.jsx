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
  const userSelectedPrize = currentUser?.selectedParticipationPrize;

  return (
    <div className="relative max-w-5xl mx-auto w-full">
      
      <div className="flex items-center justify-between mb-12 px-6">
        <button onClick={handlePrev} className="w-14 h-14 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform active:scale-95 shadow-md border border-slate-200">
           <ChevronLeft className="w-8 h-8 text-slate-700" />
        </button>
        
        <div className="flex flex-col items-center">
           <div className="flex items-center justify-center gap-3 mb-2">
              <Gift className="w-10 h-10" style={{ color: currentTheme.main }} />
              <h2 className="text-4xl md:text-5xl font-black drop-shadow-sm text-center" style={{ color: currentTheme.contrast }}>{activeCategory.title}</h2>
           </div>
           <div className="flex justify-center gap-2 mt-2">
              {[0,1,2].map(idx => (
                 <div key={idx} className={`h-2 rounded-full transition-all duration-300 ${idx === currentCategory ? 'w-8' : 'w-2 bg-slate-300'}`} style={{ backgroundColor: idx === currentCategory ? currentTheme.main : '' }}></div>
              ))}
           </div>
        </div>

        <button onClick={handleNext} className="w-14 h-14 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform active:scale-95 shadow-md border border-slate-200">
           <ChevronRight className="w-8 h-8 text-slate-700" />
        </button>
      </div>

      <div className="min-h-[400px] w-full flex items-center justify-center animate-in fade-in duration-300" key={currentCategory}>
        {(!items || items.length === 0 || !items[0].title) ? (
            <div className="text-center text-slate-500 font-black text-xl py-10 w-full">Bu kategori için henüz ödül eklenmemiş.</div>
        ) : (
            <>
               {currentCategory === 2 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full">
                     {items.map((prize, idx) => {
                        const isSelected = currentUser && userSelectedPrize === prize.title;
                        return (
                           // DÜZELTME: Bütün bg-white, border, shadow özellikleri silindi. Tamamen transparan ve gömülü.
                           <div key={idx} className={`relative flex flex-col items-center justify-center p-4 transition-all duration-300 hover:-translate-y-2 group ${isSelected ? 'scale-110' : ''}`}>
                              
                              {isSelected && <div className="absolute top-0 right-0 rounded-full w-8 h-8 flex items-center justify-center text-white shadow-md animate-in zoom-in z-10" style={{ backgroundColor: currentTheme.main }}><CheckCircle2 className="w-5 h-5"/></div>}
                              
                              <div className="w-28 h-28 md:w-32 md:h-32 mb-4 overflow-hidden flex items-center justify-center flex-shrink-0 drop-shadow-xl transition-transform group-hover:scale-105">
                                 {prize.img ? <img src={prize.img} className="w-full h-full object-contain" /> : <Gift className="w-16 h-16 opacity-40"/>}
                              </div>
                              <h3 className="font-black text-slate-800 text-lg md:text-xl leading-tight text-center drop-shadow-sm">{prize.title}</h3>
                           </div>
                        )
                     })}
                  </div>
               ) : (
                  <div className="flex flex-col md:flex-row items-center gap-10 w-full justify-center">
                     {items.map((prize, idx) => (
                        <div key={idx} className="flex-1 max-w-sm text-center group">
                           {/* DÜZELTME: Kutu border, arka plan hepsi silindi. Sadece gölge efektli resim gömülü. */}
                           <div className="w-full aspect-square md:aspect-[4/3] overflow-hidden drop-shadow-2xl group-hover:scale-105 transition-transform duration-300 mb-6 bg-transparent">
                             {prize.img ? <img src={prize.img} className="w-full h-full object-contain" /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><Gift className="w-24 h-24" /></div>}
                           </div>
                           <h3 className="text-3xl font-black text-slate-900 mb-2 drop-shadow-sm">{prize.title}</h3>
                           <p className="text-slate-700 font-bold text-lg">{prize.description}</p>
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