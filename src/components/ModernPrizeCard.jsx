import React from 'react';
import { CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { DEFAULT_PRIZE_OBJ } from '../data/constants';
import { parsePrizeArray } from '../utils/helpers';

export default function ModernPrizeCard({ type, prizeData, selectedPrize }) {
    let typeName = "BÜYÜK ÖDÜL";
    let bgClass = "border-yellow-300";
    let badgeClass = "bg-yellow-400 text-yellow-950";
    let isArray = false;
    let dataList = [];

    if (type === "grand") {
        dataList = [prizeData || DEFAULT_PRIZE_OBJ];
    } else if (type === "degree") {
        typeName = "DERECE ÖDÜLLERİ";
        bgClass = "border-indigo-300";
        badgeClass = "bg-indigo-500 text-white";
        isArray = true;
        dataList = parsePrizeArray(prizeData);
    } else {
        typeName = "KATILIM ÖDÜLLERİ";
        bgClass = "border-emerald-300";
        badgeClass = "bg-emerald-500 text-white";
        isArray = true;
        dataList = parsePrizeArray(prizeData);
    }

    if (dataList.length === 0 || !dataList[0].title) return null;

    return (
        <div className="relative pt-6 animate-in slide-in-from-bottom-4 duration-500 hover:-translate-y-1 transition-transform">
            <div className={`absolute top-0 left-1/2 transform -translate-x-1/2 ${badgeClass} px-6 py-2 rounded-full font-black text-sm md:text-base tracking-widest shadow-lg z-10 whitespace-nowrap`}>
                {typeName}
            </div>
            <div className={`bg-white/80 backdrop-blur-sm rounded-[2rem] border-4 ${bgClass} p-8 pt-10 shadow-xl hover:shadow-2xl transition-shadow flex flex-col gap-4`}>
               {dataList.map((data, idx) => {
                   const isSelected = isArray && selectedPrize === data.title;
                   return (
                     <div key={idx} className={`flex flex-col md:flex-row gap-6 items-center border-b border-slate-100 pb-6 last:border-0 last:pb-0 transition-all duration-300 ${isSelected ? 'ring-4 ring-green-400 bg-green-50 p-4 rounded-2xl scale-[1.02] shadow-md' : 'hover:bg-slate-50 p-2 rounded-2xl'}`}>
                        {data.img ? (
                          <img src={data.img} alt={data.title} className="w-full md:w-32 h-32 object-cover rounded-2xl shadow-md border-2 border-slate-200 flex-shrink-0 bg-white" />
                        ) : (
                          <div className="w-full md:w-32 h-32 rounded-2xl shadow-inner border-2 border-slate-200 bg-slate-50 flex items-center justify-center flex-shrink-0 text-slate-300">
                             <ImageIcon className="w-10 h-10" />
                          </div>
                        )}
                        <div className="flex-1 w-full text-center md:text-left">
                           <div className="text-2xl font-black text-slate-800 mb-2 flex justify-center md:justify-start items-center">
                              {data.title} 
                              {isSelected && <CheckCircle2 className="w-6 h-6 ml-3 text-green-500 animate-in zoom-in" />}
                           </div>
                           {data.desc && <p className="font-medium text-slate-600 leading-relaxed">{data.desc}</p>}
                        </div>
                     </div>
                   )
               })}
            </div>
        </div>
    );
}
