import React, { useContext } from 'react';
import { LayoutDashboard, LogIn, UserPlus, Phone, BookOpen, Gift } from 'lucide-react';
import { ThemeContext } from './ThemeSelector';

export default function Header({ currentPage, navigateTo, currentUser }) {
  const { currentTheme } = useContext(ThemeContext);

  // Menü öğelerini tanımla
  const menuItems = [
    { id: 'timeline', label: 'Başvuru Takvimi', icon: BookOpen },
    { id: 'prizes', label: 'Ödüllerimiz', icon: Gift },
    ...(currentUser 
      ? [{ id: 'profile', label: 'Öğrenci Paneli', icon: LayoutDashboard }]
      : [
          { id: 'registration', label: 'Kayıt Ol', icon: UserPlus },
          { id: 'login', label: 'Giriş Yap', icon: LogIn }
        ]
    )
  ];

  return (
    <>
      <header className="bg-white sticky top-0 z-40 shadow-md border-b border-slate-100 transition-colors duration-300">
        <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigateTo('home')}>
             {/* Dinamik Logo */}
             <span className="text-3xl font-black transition-colors" style={{ color: currentTheme.main }}>ÖDÜLLÜ</span>
             <span className="text-3xl font-black transition-colors bg-white px-2 rounded-lg shadow-sm border border-slate-100" style={{ color: currentTheme.contrast }}>SINAV</span>
          </div>
          
          <div className="flex items-center gap-1">
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => navigateTo(item.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-full text-base font-bold transition-all duration-200 relative group
                  ${currentPage === item.id 
                    ? `text-[${currentTheme.main}]` 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
              >
                <item.icon className="w-5 h-5 opacity-70" />
                {item.label}
                {/* Aktif menü altına dinamik çizgi */}
                {currentPage === item.id && (
                    <span className="absolute bottom-0 left-5 right-5 h-0.5 rounded-full transition-colors" style={{ backgroundColor: currentTheme.main }}></span>
                )}
                {/* Hover efekti */}
                <span className="absolute bottom-0 left-5 right-5 h-0.5 rounded-full bg-slate-200 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center"></span>
              </button>
            ))}
          </div>
        </nav>
      </header>
      
      {/* "LGS Provası" Bölümü */}
      <section className="transition-colors duration-300 relative overflow-hidden" style={{ backgroundColor: currentTheme.lightBg }}>
          {/* Arka plan deseni (Hafifletilmiş) */}
          <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/az-subtle.png')]"></div>
          
          <div className="max-w-5xl mx-auto px-6 py-12 text-center relative z-10">
              <h1 className="text-4xl md:text-5xl font-black leading-tight mb-4">
                  {/* Dinamik Metin Renklendirme */}
                  Gerçek Sınav Ortamında <span className="transition-colors" style={{ color: currentTheme.main }}>LGS Provası!</span>
              </h1>
              <p className="text-xl text-slate-600 font-medium max-w-2xl mx-auto mb-8">
                  Sınav heyecanını önceden yenin, eksiklerinizi görün ve ödüller kazanma şansı yakalayın.
              </p>
              
              {/* Varsa buraya LGS Provası ile ilgili bir logo veya görsel eklenebilir.
                  Örn: <div className="w-16 h-16 rounded-full mx-auto shadow-lg" style={{ backgroundColor: currentTheme.main }}><BookOpen className="w-8 h-8 text-white m-4"/></div> */}
          </div>
      </section>
    </>
  );
}