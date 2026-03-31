import React, { useState, useEffect } from 'react';

const themes = {
  watergreen: { main: '#0d9488', contrast: '#1e3a8a', lightBg: '#dbeafe', logo: '/OSLOGO1.png' }, 
  purple: { main: '#7c3aed', contrast: '#f59e0b', lightBg: '#fef3c7', logo: '/OSLOGO2.png' }, 
  red: { main: '#990000', contrast: '#0f766e', lightBg: '#ccfbf1', logo: '/OSLOGO3.png' }, 
  yellow: { main: '#facc15', contrast: '#1e3a8a', lightBg: '#dbeafe', logo: '/OSLOGO4.png' }, 
  blue: { main: '#3b82f6', contrast: '#ea580c', lightBg: '#ffedd5', logo: '/OSLOGO5.png' }, 
  pink: { main: '#ec4899', contrast: '#047857', lightBg: '#d1fae5', logo: '/OSLOGO6.png' }, 
};

export const ThemeContext = React.createContext();

export const ThemeProvider = ({ children }) => {
  const [currentThemeName, setCurrentThemeName] = useState('watergreen');

  const changeTheme = (themeName) => {
    if(!themes[themeName]) themeName = 'watergreen';
    setCurrentThemeName(themeName);
    const theme = themes[themeName];
    document.documentElement.style.setProperty('--color-main', theme.main);
    document.documentElement.style.setProperty('--color-contrast', theme.contrast);
    document.documentElement.style.setProperty('--color-light-bg', theme.lightBg);
    document.documentElement.style.setProperty('--logo-url', `url('${theme.logo}')`);
    
    // Temayı hafızaya alıyoruz (Davet linkinde kullanmak için)
    localStorage.setItem('os_theme', themeName);
  };

  useEffect(() => { 
    // Linkte özel bir tema parametresi var mı kontrol et (Örn: ?theme=red)
    const params = new URLSearchParams(window.location.search);
    const urlTheme = params.get('theme');
    const savedTheme = localStorage.getItem('os_theme');
    
    if (urlTheme && themes[urlTheme]) changeTheme(urlTheme);
    else if (savedTheme && themes[savedTheme]) changeTheme(savedTheme);
    else changeTheme('watergreen'); 
  }, []);

  return (
    <ThemeContext.Provider value={{ currentTheme: themes[currentThemeName], changeTheme, currentThemeName }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const ThemeSelector = () => {
  const { changeTheme, currentThemeName } = React.useContext(ThemeContext);

  return (
    <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-full backdrop-blur-sm">
      <span className="text-[10px] font-bold text-white/80 mr-1 uppercase tracking-wider hidden md:block">Tema:</span>
      {Object.keys(themes).map(name => (
        <button key={name} onClick={() => changeTheme(name)} className={`w-4 h-4 rounded-full border-2 transition-all ${currentThemeName === name ? 'scale-125 border-white shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'border-transparent hover:scale-110'}`} style={{ backgroundColor: themes[name].main }} />
      ))}
    </div>
  );
};