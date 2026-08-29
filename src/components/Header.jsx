import React, { useState, useEffect } from 'react';
import { Menu, Bell } from 'lucide-react';

export default function Header({ title = 'Dashboard', onMenuOpen }) {
  const [currentUser, setCurrentUser] = useState({
    name: 'Justin Ralph',
    email: 'justineralph107@gmail.com',
    role: 'Administrator'
  });

  useEffect(() => {
    const session = localStorage.getItem('current_user');
    if (session) {
      try {
        const parsed = JSON.parse(session);
        if (parsed.name) setCurrentUser(parsed);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Compute Initials dynamically (e.g. "Justin Ralph" -> "JR", "Alie Smith" -> "AS")
  const getInitials = (name) => {
    if (!name) return 'WA';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 w-full px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between shadow-2xs">
      <div className="flex items-center space-x-3">
        <button 
          onClick={onMenuOpen}
          className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2 text-xs font-extrabold text-slate-500">
          <span className="hidden sm:inline">WalangBrownout</span>
          <span className="hidden sm:inline text-slate-300">/</span>
          <span className="text-slate-900 font-black">{title}</span>
        </div>
      </div>

      {/* Dynamic Active User Badge */}
      <div className="flex items-center space-x-3">
        <button className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition cursor-pointer relative">
          <Bell className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 p-1.5 pr-3.5 rounded-2xl shadow-2xs">
          <div className="w-8 h-8 rounded-xl bg-sky-600 text-white font-black text-xs flex items-center justify-center shrink-0 uppercase tracking-wider">
            {getInitials(currentUser.name)}
          </div>

          <div className="text-left hidden sm:block">
            <p className="text-xs font-black text-slate-900 leading-tight">{currentUser.name}</p>
            <p className="text-[10px] font-extrabold text-sky-700 leading-tight">{currentUser.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}