import React, { useState, useEffect } from 'react';

// Temalar: Ana Renk, Zıt Renk (Logo için), Açık Arka Plan
const themes = {
  purple: { main: '#7c3aed', contrast: '#f59e0b', lightBg: '#f5f3ff' }, // Mor & Sarı
  green: { main: '#10b981', contrast: '#be123c', lightBg: '#ecfdf5' }, // Yeşil & Koyu Kırmızı
  red: { main: '#ef4444', contrast: '#0f766e', lightBg: '#fef2f2' }, // Kırmızı & Koyu Turkuaz
  yellow: { main: '#facc15', contrast: '#1e3a8a', lightBg: '#fffbeb' }, // Sarı & Lacivert
  blue: { main: '#3b82f6', contrast: '#ea580c', lightBg: '#eff6ff' }, // Mavi & Turuncu
  pink: { main: '#ec4899', contrast: '#047857', lightBg: '#fdf2f8' }, // Pembe & Zümrüt Yeşili
};

export const ThemeContext = React.createContext();

export const ThemeProvider = ({ children }) => {
  const [currentThemeName, setCurrentThemeName] = useState('purple'); 

  const changeTheme = (themeName) => {
    setCurrentThemeName(themeName);
    const theme = themes[themeName];
    document.documentElement.style.setProperty('--color-main', theme.main);
    document.documentElement.style.setProperty('--color-contrast', theme.contrast);
    document.documentElement.style.setProperty('--color-light-bg', theme.lightBg);
  };

  useEffect(() => {
    changeTheme('yellow'); // İlk açılışta Sarı temayı uygula
  }, []);

  return (
    <ThemeContext.Provider value={{ currentTheme: themes[currentThemeName], changeTheme, currentThemeName }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Renk Seçici Butonları (Artık daha küçük ve App.jsx içinde kullanılacak)
export const ThemeSelector = () => {
  const { changeTheme, currentThemeName } = React.useContext(ThemeContext);

  return (
    <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-full backdrop-blur-sm">
      <span className="text-[10px] font-bold text-white/80 mr-1 uppercase tracking-wider hidden md:block">Tema:</span>
      {Object.keys(themes).map(name => (
        <button
          key={name}
          onClick={() => changeTheme(name)}
          className={`w-4 h-4 rounded-full border-2 transition-all ${currentThemeName === name ? 'scale-125 border-white shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'border-transparent hover:scale-110'}`}
          style={{ backgroundColor: themes[name].main }}
          title={`${name} Tema`}
        />
      ))}
    </div>
  );
};