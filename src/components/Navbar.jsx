import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Package, FileText, Bell, 
  ShoppingCart, Users, Receipt, Layers, LogOut, X, ShieldAlert, Box
} from 'lucide-react';

export default function Navbar({ isOpen, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();

  // Dynamic User Session State
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

  // Dynamic Active Alerts Tracking
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const syncAlerts = () => {
      const savedAlerts = localStorage.getItem('alerts_db');
      if (savedAlerts) {
        try {
          setAlerts(JSON.parse(savedAlerts));
        } catch (e) {
          console.error(e);
        }
      } else {
        setAlerts([]);
      }
    };

    syncAlerts();
    window.addEventListener('storage', syncAlerts);
    window.addEventListener('focus', syncAlerts);

    return () => {
      window.removeEventListener('storage', syncAlerts);
      window.removeEventListener('focus', syncAlerts);
    };
  }, []);

  // Calculate ONLY active, unresolved alerts
  const activeAlertsCount = useMemo(() => {
    return alerts.filter(a => a.status !== 'Resolved').length;
  }, [alerts]);

  const getInitials = (name) => {
    if (!name) return 'WA';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleSignOut = () => {
    localStorage.removeItem('current_user');
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Inventory List', path: '/inventory', icon: Package },
    { name: 'Product Details', path: '/product-details', icon: Box },
    { name: 'Reports', path: '/reports', icon: FileText },
    { name: 'Alerts', path: '/alerts', icon: Bell, badge: activeAlertsCount },
    { name: 'Reorder Planner', path: '/reorder-planner', icon: ShoppingCart },
    { name: 'User Management', path: '/user-management', icon: Users },
    { name: 'Transaction Records', path: '/transaction-records', icon: Receipt },
    { name: 'FIFO Backtracking', path: '/fifo-backtracking', icon: Layers },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" 
      />

      {/* Sidebar Drawer */}
      <div className="relative w-80 max-w-[85vw] bg-slate-50 border-r border-slate-200 h-full flex flex-col justify-between p-5 shadow-2xl z-10">
        
        <div className="space-y-6 overflow-y-auto">
          {/* Header Logo */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-sky-600 text-white rounded-xl shadow-xs">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900 leading-tight">WalangBrownout</h2>
                <p className="text-[10px] font-extrabold text-sky-700 tracking-wider uppercase">INVENTORY MANAGEMENT</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider px-3 mb-2">NAVIGATION MENU</p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs transition ${
                    isActive 
                      ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-2xs font-black' 
                      : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </div>
                  {Number(item.badge) > 0 && (
                    <span className="bg-rose-600 text-white font-black text-[10px] px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Dynamic User Card & Sign Out */}
        <div className="space-y-3 pt-4 border-t border-slate-200 mt-auto">
          <div className="p-3 bg-white border border-slate-200 rounded-2xl flex items-center space-x-3 shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-sky-600 text-white font-black text-xs flex items-center justify-center shrink-0 uppercase tracking-wider">
              {getInitials(currentUser.name)}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-black text-slate-900 truncate">{currentUser.name}</p>
              <p className="text-[10px] font-bold text-slate-500 truncate">{currentUser.email || currentUser.role}</p>
            </div>
          </div>

          <button 
            onClick={handleSignOut}
            className="w-full py-2.5 px-4 bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-700 font-extrabold text-xs rounded-xl border border-slate-200 hover:border-rose-200 transition flex items-center justify-center space-x-2 cursor-pointer shadow-2xs"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

      </div>
    </div>
  );
}