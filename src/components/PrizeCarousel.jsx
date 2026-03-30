import React, { useState, useContext } from 'react';
import { ChevronLeft, ChevronRight, Gift, Target } from 'lucide-react';
import { ThemeContext } from './ThemeSelector';
import { parsePrizeArray } from '../utils/helpers';

export default function PrizeCarousel({ prizesString, title, icon: Icon = Gift, type = 'participation' }) {
  const { currentTheme } = useContext(ThemeContext);
  const prizesList = parsePrizeArray(prizesString);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!prizesList || prizesList.length === 0) return null;

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % prizesList.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + prizesList.length) % prizesList.length);
  };

  const hasMultiplePrizes = prizesList.length > 1;

  return (
    <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-8 md:p-12 mb-12 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex items-center gap-4 mb-10 pb-6 border-b-2 border-slate-100">
        <Icon className="w-12 h-12 text-slate-400 opacity-60" style={{ color: currentTheme.main }} />
        <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">{title}</h2>
      </div>

      <div className="relative group px-4">
        {/* Ödül İçeriği (Slayt) */}
        <div className="overflow-hidden">
          <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
            {prizesList.map((prize, index) => (
              <div key={index} className="w-full flex-shrink-0 grid grid-cols-1 md:grid-cols-5 gap-10 items-center">
                
                {/* Resim Alanı */}
                <div className="md:col-span-2 aspect-square md:aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl shadow-slate-200 border-8 border-white group-hover:scale-105 transition-transform duration-300">
                  {prize.img ? (
                    <img src={prize.img} alt={prize.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300"><Gift className="w-20 h-20" /></div>
                  )}
                </div>

                {/* Metin Alanı */}
                <div className="md:col-span-3 space-y-6">
                  {type === 'rank' && prize.rank && (
                      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-black transition-colors" style={{ backgroundColor: currentTheme.contrast, color: currentTheme.main }}>
                         <Target className="w-4 h-4" /> {prize.rank}. Derece Ödülü
                      </div>
                  )}
                  <h3 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight group-hover:translate-x-1 transition-transform">{prize.title}</h3>
                  <p className="text-xl text-slate-600 font-medium leading-relaxed">{prize.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Kontrol Okları */}
        {hasMultiplePrizes && (
          <>
            <button onClick={handlePrev} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-xl border border-slate-100 text-slate-400 hover:text-slate-800 hover:scale-110 active:scale-95 transition-all opacity-0 group-hover:opacity-100">
              <ChevronLeft className="w-8 h-8" />
            </button>
            <button onClick={handleNext} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-xl border border-slate-100 text-slate-400 hover:text-slate-800 hover:scale-110 active:scale-95 transition-all opacity-0 group-hover:opacity-100">
              <ChevronRight className="w-8 h-8" />
            </button>
            
            {/* Noktalı Gösterge */}
            <div className="flex justify-center gap-2.5 mt-10">
                {prizesList.map((_, idx) => (
                    <button key={idx} onClick={() => setCurrentIndex(idx)} 
                        className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${idx === currentIndex ? 'scale-125 border-white shadow-md' : 'border-slate-300 hover:border-slate-500 bg-white'}`}
                        style={{ backgroundColor: idx === currentIndex ? currentTheme.main : 'white' }}
                    />
                ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}