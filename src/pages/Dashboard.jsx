import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Navbar from '../components/Navbar.jsx';
import { 
  Package, AlertTriangle, ShieldAlert, Clock, 
  TrendingUp, ArrowRight 
} from 'lucide-react';

export default function Dashboard() {
  const [isNavOpen, setIsNavOpen] = useState(false);

  // Dynamic Inventory State
  const defaultInventory = [
    { sku: 'SKU-8821', name: 'Inverter Generator 3kVA', onHand: 18, status: 'In Stock' },
    { sku: 'SKU-4102', name: 'Solar Charge Controller 60A', onHand: 3, status: 'Low Stock' },
    { sku: 'SKU-9011', name: 'LiFePO4 100Ah Battery Pack', onHand: 0, status: 'Out of Stock' },
    { sku: 'SKU-1044', name: 'Automatic Transfer Switch 100A', onHand: 25, status: 'In Stock' },
    { sku: 'SKU-3092', name: 'Monocrystalline Solar Panel 450W', onHand: 42, status: 'In Stock' },
    { sku: 'SKU-5201', name: 'Deep Cycle Gel Battery 200Ah', onHand: 5, status: 'Low Stock' },
  ];

  const [inventory, setInventory] = useState(() => {
    const saved = localStorage.getItem('inventory_db');
    return saved ? JSON.parse(saved) : defaultInventory;
  });

  // Dynamic Alerts State
  const defaultAlerts = [
    { id: 'ALT-1004', type: 'Out of Stock', item: 'LiFePO4 100Ah Battery Pack', sku: 'SKU-9011', details: 'Out of Stock • SKU-9011', priority: 'Critical', status: 'Active' },
    { id: 'ALT-1005', type: 'Low Stock', item: 'Solar Charge Controller 60A', sku: 'SKU-4102', details: 'Low Stock (2 left) • SKU-4102', priority: 'Warning', status: 'Active' },
    { id: 'ALT-1006', type: 'Low Stock', item: 'Deep Cycle Gel Battery 200Ah', sku: 'SKU-5201', details: 'Low Stock (4 left) • SKU-5201', priority: 'Warning', status: 'Active' },
    { id: 'ALT-1007', type: 'Reorder Pending', item: 'Automatic Transfer Switch 100A', sku: 'SKU-1044', details: 'Reorder Pending • SKU-1044', priority: 'Pending', status: 'Active' },
  ];

  const [alerts, setAlerts] = useState(() => {
    const saved = localStorage.getItem('alerts_db');
    return saved ? JSON.parse(saved) : defaultAlerts;
  });

  // Synchronize with LocalStorage across user actions
  useEffect(() => {
    const syncDatabase = () => {
      const savedInv = localStorage.getItem('inventory_db');
      if (savedInv) setInventory(JSON.parse(savedInv));

      const savedAlerts = localStorage.getItem('alerts_db');
      if (savedAlerts) setAlerts(JSON.parse(savedAlerts));
    };

    window.addEventListener('storage', syncDatabase);
    window.addEventListener('focus', syncDatabase);

    return () => {
      window.removeEventListener('storage', syncDatabase);
      window.removeEventListener('focus', syncDatabase);
    };
  }, []);

  // Filter Active Alerts (Excludes Resolved)
  const activeAlertsList = useMemo(() => {
    return alerts.filter(a => a.status !== 'Resolved');
  }, [alerts]);

  // Dynamic KPI Metric Calculations Linked Strictly to Active System Alerts & Inventory
  const kpiStats = useMemo(() => {
    // 1. Total Products Count
    const totalProducts = inventory.length;

    // 2. Low Stock Count (Calculated ONLY from unresolved low stock alerts or active inventory drops)
    const lowStockCount = alerts.filter(a => 
      a.status !== 'Resolved' && (
        a.type === 'Low Stock' || 
        a.priority === 'Warning' || 
        a.details.toLowerCase().includes('low stock')
      )
    ).length;

    // 3. Out of Stock Count (Calculated ONLY from unresolved out-of-stock alerts)
    const outOfStockCount = alerts.filter(a => 
      a.status !== 'Resolved' && (
        a.type === 'Out of Stock' || 
        a.priority === 'Critical' || 
        a.details.toLowerCase().includes('out of stock')
      )
    ).length;

    // 4. Expiring Items Count (Strictly active unresolved expiring alerts)
    const expiringCount = alerts.filter(a => 
      a.status !== 'Resolved' && (
        a.type === 'Expiring Soon' || 
        a.details.toLowerCase().includes('expire')
      )
    ).length;

    return { totalProducts, lowStockCount, outOfStockCount, expiringCount };
  }, [inventory, alerts]);

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'Critical': return 'bg-rose-50 text-rose-800 border-rose-300';
      case 'Warning': return 'bg-amber-50 text-amber-800 border-amber-300';
      case 'Pending': return 'bg-sky-50 text-sky-800 border-sky-300';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const points = [
    { month: 'Jan', val: '35k', cx: 30, cy: 170 },
    { month: 'Feb', val: '45k', cx: 90, cy: 150 },
    { month: 'Mar', val: '75k', cx: 150, cy: 90 },
    { month: 'Apr', val: '90k', cx: 210, cy: 60 },
    { month: 'May', val: '98k', cx: 270, cy: 40 },
    { month: 'Jun', val: '65k', cx: 330, cy: 110 },
    { month: 'Jul', val: '55k', cx: 390, cy: 130 },
    { month: 'Aug', val: '100k', cx: 480, cy: 30 },
  ];

  return (
    <div className="bg-slate-100 text-slate-900 font-sans antialiased min-h-screen flex flex-col overflow-x-hidden w-full">
      <Navbar isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />
      <Header title="Dashboard" onMenuOpen={() => setIsNavOpen(true)} />

      <main className="w-full max-w-full px-4 sm:px-6 lg:px-10 py-6 space-y-6 flex-1">
        
        {/* Header */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">System Overview</h1>
          <p className="text-xs font-semibold text-slate-600 mt-0.5">Real-time inventory stock monitoring & demand analytics</p>
        </div>

        {/* Dynamic 4 KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* TOTAL PRODUCTS */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-start justify-between">
            <div>
              <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider">TOTAL PRODUCTS</p>
              <h2 className="text-2xl font-black text-slate-900 mt-2">{kpiStats.totalProducts}</h2>
              <p className="text-[11px] font-bold text-sky-700 mt-0.5">Active SKUs Cataloged</p>
            </div>
            <div className="p-2.5 bg-sky-50 rounded-xl text-sky-700 border border-sky-200">
              <Package className="w-5 h-5" />
            </div>
          </div>

          {/* LOW STOCK ALERT */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-start justify-between">
            <div>
              <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider">LOW STOCK ALERT</p>
              <h2 className="text-2xl font-black text-amber-700 mt-2">{kpiStats.lowStockCount}</h2>
              <p className="text-[11px] font-bold text-amber-800 mt-0.5">Below minimum safety level</p>
            </div>
            <div className="p-2.5 bg-amber-50 rounded-xl text-amber-700 border border-amber-200">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>

          {/* OUT OF STOCK */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-start justify-between">
            <div>
              <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider">OUT OF STOCK</p>
              <h2 className="text-2xl font-black text-rose-700 mt-2">{kpiStats.outOfStockCount}</h2>
              <p className="text-[11px] font-bold text-rose-800 mt-0.5">Urgent replenishment required</p>
            </div>
            <div className="p-2.5 bg-rose-50 rounded-xl text-rose-700 border border-rose-200">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>

          {/* EXPIRING ITEMS */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-start justify-between">
            <div>
              <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider">EXPIRING ITEMS</p>
              <h2 className="text-2xl font-black text-sky-800 mt-2">{kpiStats.expiringCount}</h2>
              <p className="text-[11px] font-bold text-sky-800 mt-0.5">Warranty limits near expiry</p>
            </div>
            <div className="p-2.5 bg-sky-50 rounded-xl text-sky-700 border border-sky-200">
              <Clock className="w-5 h-5" />
            </div>
          </div>

        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Revenue Chart */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">SALES REVENUE TREND</h2>
                <p className="text-[11px] font-bold text-slate-400">WalangBrownout Case Study Seasonal Demand & Recovery (2026)</p>
              </div>
              <span className="bg-sky-50 text-sky-800 text-xs font-black px-2.5 py-1 rounded-xl border border-sky-200 flex items-center space-x-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+18.5% YoY Recovery</span>
              </span>
            </div>

            <div className="w-full h-64 pt-2">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 500 200">
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0284c7" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                <line x1="0" y1="20" x2="500" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="0" y1="60" x2="500" y2="60" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="0" y1="100" x2="500" y2="100" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="0" y1="140" x2="500" y2="140" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="0" y1="180" x2="500" y2="180" stroke="#f1f5f9" strokeWidth="1" />

                <text x="5" y="23" className="text-[9px] font-bold fill-slate-400">100</text>
                <text x="5" y="63" className="text-[9px] font-bold fill-slate-400">80</text>
                <text x="5" y="103" className="text-[9px] font-bold fill-slate-400">60</text>
                <text x="5" y="143" className="text-[9px] font-bold fill-slate-400">40</text>
                <text x="5" y="183" className="text-[9px] font-bold fill-slate-400">20</text>

                <path 
                  d="M 30,170 C 60,160 70,155 90,150 C 120,140 130,105 150,90 C 180,68 190,62 210,60 C 240,58 250,42 270,40 C 300,38 310,95 330,110 C 360,132 370,128 390,130 C 430,132 450,50 480,30 L 480,180 L 30,180 Z" 
                  fill="url(#chartGradient)" 
                />

                <path 
                  d="M 30,170 C 60,160 70,155 90,150 C 120,140 130,105 150,90 C 180,68 190,62 210,60 C 240,58 250,42 270,40 C 300,38 310,95 330,110 C 360,132 370,128 390,130 C 430,132 450,50 480,30" 
                  fill="none" 
                  stroke="#0284c7" 
                  strokeWidth="3.5" 
                  strokeLinecap="round" 
                />

                {points.map((pt) => (
                  <g key={pt.month}>
                    <circle 
                      cx={pt.cx} 
                      cy={pt.cy} 
                      r="4.5" 
                      fill="#0284c7" 
                      stroke="#ffffff" 
                      strokeWidth="2" 
                    />
                    <text x={pt.cx - 8} y={198} className="text-[10px] font-bold fill-slate-600">{pt.month}</text>
                  </g>
                ))}
              </svg>
            </div>
          </div>

          {/* System Alerts Feed */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <ShieldAlert className="w-5 h-5 text-sky-700" />
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">SYSTEM ALERTS</h2>
                </div>

                <Link 
                  to="/alerts" 
                  className="bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-extrabold px-3 py-1 rounded-xl border border-sky-200 transition flex items-center space-x-1 cursor-pointer"
                >
                  <span>{activeAlertsList.length} Active</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="space-y-2.5">
                {activeAlertsList.length > 0 ? (
                  activeAlertsList.slice(0, 5).map((alert) => (
                    <div 
                      key={alert.id} 
                      className="p-3.5 rounded-2xl border bg-sky-50/40 border-sky-200 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-xs font-black text-slate-900">{alert.item}</p>
                        <p className="text-[11px] font-semibold text-slate-500 mt-0.5">{alert.details || alert.type}</p>
                      </div>

                      <span className={`inline-block border font-black px-2.5 py-0.5 rounded-full text-[10px] ${getPriorityBadge(alert.priority)}`}>
                        {alert.priority}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-xs font-bold text-slate-400">
                    All system alerts resolved! No active warnings.
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-center">
              <Link to="/alerts" className="text-xs font-black text-sky-700 hover:text-sky-900 hover:underline">
                Manage System Alerts →
              </Link>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}