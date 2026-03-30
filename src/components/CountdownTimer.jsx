import React, { useState, useEffect, useContext } from 'react';
import { CalendarClock } from 'lucide-react';
import { ThemeContext } from './ThemeSelector';

export default function CountdownTimer({ examDate }) {
  const { currentTheme } = useContext(ThemeContext);
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    if (!examDate) return null;
    const difference = +new Date(examDate) - +new Date();
    if (difference <= 0) return null;

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
    };
  }

  useEffect(() => {
    if (!examDate) return;
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000 * 60); // Her dakika güncelle
    return () => clearInterval(timer);
  }, [examDate]);

  if (!timeLeft) return null;

  const timeUnits = [
    { value: timeLeft.days, label: 'Gün' },
    { value: timeLeft.hours, label: 'Saat' },
    { value: timeLeft.minutes, label: 'Dakika' },
  ];

  return (
    <div className="fixed bottom-6 right-6 flex items-center gap-3 p-4 bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-slate-100 z-50 animate-in slide-in-from-right-12 duration-500 group">
      <CalendarClock className="w-10 h-10 text-slate-400 group-hover:scale-110 transition-transform" style={{ color: currentTheme.main }} />
      <div className="flex gap-2.5">
        {timeUnits.map(({ value, label }) => (
          <div key={label} className="text-center p-2 rounded-xl border border-slate-100 bg-white shadow-sm transition-transform group-hover:-translate-y-0.5" style={{ minWidth: '3.5rem' }}>
            <div className="text-2xl font-black text-slate-900 leading-none">{String(value).padStart(2, '0')}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">{label}</div>
          </div>
        ))}
      </div>
      <div className="flex-1 min-w-[5rem]">
          <p className="text-sm font-bold text-slate-700 leading-tight">En Yakın Sınava Kalan Süre</p>
          <p className="text-xs font-medium text-slate-500">Planlarınızı yapmayı unutmayın!</p>
      </div>
    </div>
  );
}