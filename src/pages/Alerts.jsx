import React, { useState, useMemo, useEffect } from 'react';
import Header from '../components/Header.jsx';
import Navbar from '../components/Navbar.jsx';
import { Search, Eye, ShieldAlert, X, Lock } from 'lucide-react';

export default function Alerts() {
  const [isNavOpen, setIsNavOpen] = useState(false);

  // Role Check & Active User Session
  const [currentUser, setCurrentUser] = useState({ name: 'Justin Ralph', role: 'Administrator' });
  useEffect(() => {
    const session = localStorage.getItem('current_user');
    if (session) {
      try {
        const parsed = JSON.parse(session);
        if (parsed.role) setCurrentUser(parsed);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const isWarehouseStaff = currentUser.role === 'Warehouse Staff';

  // Dynamic Alerts derived directly from inventory_db
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const syncAlertsWithInventory = () => {
      const savedInv = localStorage.getItem('inventory_db');
      if (!savedInv) {
        setAlerts([]);
        return;
      }

      try {
        const inventory = JSON.parse(savedInv);
        const savedAlerts = localStorage.getItem('alerts_db');
        const existingAlerts = savedAlerts ? JSON.parse(savedAlerts) : [];

        // Generate alerts ONLY for items present in inventory_db
        const liveAlerts = inventory
          .filter(item => Number(item.onHand) <= 5 || item.status === 'Low Stock' || item.status === 'Out of Stock')
          .map((item, index) => {
            const stock = Number(item.onHand) || 0;
            const existing = existingAlerts.find(a => a.sku === item.sku);

            const isOut = stock === 0 || item.status === 'Out of Stock';

            return {
              id: existing ? existing.id : `ALT-100${index + 1}`,
              type: isOut ? 'Out of Stock' : 'Low Stock',
              item: item.name,
              sku: item.sku,
              details: isOut ? `Inventory depleted to 0 units (${item.sku})` : `Low Stock (${stock} left) • ${item.sku}`,
              priority: isOut ? 'Critical' : 'Warning',
              status: existing ? existing.status : 'Active',
              timestamp: existing ? existing.timestamp : new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })
            };
          });

        setAlerts(liveAlerts);
        localStorage.setItem('alerts_db', JSON.stringify(liveAlerts));
      } catch (e) {
        console.error(e);
      }
    };

    syncAlertsWithInventory();
    window.addEventListener('storage', syncAlertsWithInventory);
    return () => window.removeEventListener('storage', syncAlertsWithInventory);
  }, []);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');

  // View Modal State
  const [activeAlert, setActiveAlert] = useState(null);

  const filteredAlerts = useMemo(() => {
    return alerts.filter(alt => {
      const matchesSearch = 
        alt.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alt.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alt.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alt.details.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = selectedType === '' || alt.type.toLowerCase().includes(selectedType.toLowerCase());
      const matchesPriority = selectedPriority === '' || alt.priority.toLowerCase() === selectedPriority.toLowerCase();

      return matchesSearch && matchesType && matchesPriority;
    });
  }, [alerts, searchTerm, selectedType, selectedPriority]);

  const handleUpdateStatus = (alertId, newStatus) => {
    if (isWarehouseStaff) {
      alert('Access Denied: Warehouse Staff cannot alter alert resolution statuses.');
      return;
    }

    const updated = alerts.map(a => a.id === alertId ? { ...a, status: newStatus } : a);
    setAlerts(updated);
    localStorage.setItem('alerts_db', JSON.stringify(updated));

    if (activeAlert) {
      setActiveAlert(prev => ({ ...prev, status: newStatus }));
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'Critical':
      case 'High': return 'bg-rose-50 text-rose-800 border-rose-300';
      case 'Warning':
      case 'Medium': return 'bg-amber-50 text-amber-800 border-amber-300';
      default: return 'bg-sky-50 text-sky-800 border-sky-300';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Resolved': return 'bg-sky-50 text-sky-800 border-sky-300';
      case 'Acknowledged': return 'bg-amber-50 text-amber-800 border-amber-300';
      default: return 'bg-rose-50 text-rose-800 border-rose-300';
    }
  };

  return (
    <div className="bg-slate-100 text-slate-900 font-sans antialiased min-h-screen flex flex-col overflow-x-hidden w-full">
      <Navbar isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />
      <Header title="Alerts" onMenuOpen={() => setIsNavOpen(true)} />

      <main className="w-full max-w-full px-4 sm:px-6 lg:px-10 py-6 space-y-6 flex-1">
        
        {isWarehouseStaff && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center space-x-2 text-xs font-bold text-amber-900 shadow-xs">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
            <span>Warehouse Staff Account ({currentUser.name}): View-Only mode enabled. Alert resolution and status edits are restricted to Managers and Admins.</span>
          </div>
        )}

        {/* Title Header */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">System Alerts Log</h1>
          <p className="text-xs font-semibold text-slate-600 mt-0.5">Track low stock warnings and system events synchronized with active inventory items.</p>
        </div>

        {/* Filters Bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-6 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search alerts by ID, SKU, product, or details..." 
                className="w-full pl-10 pr-8 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="sm:col-span-3">
              <select 
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
              >
                <option value="">Alert Type: All</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </div>

            <div className="sm:col-span-3">
              <select 
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
              >
                <option value="">Priority: All</option>
                <option value="Critical">Critical</option>
                <option value="Warning">Warning</option>
              </select>
            </div>
          </div>
        </div>

        {/* Alerts Table */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase text-[10px] font-black tracking-wider">
                  <th className="py-3.5 px-4">Alert ID</th>
                  <th className="py-3.5 px-4">Alert Type</th>
                  <th className="py-3.5 px-4">Item / Product</th>
                  <th className="py-3.5 px-4">Details</th>
                  <th className="py-3.5 px-4 text-center">Priority</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold">
                {filteredAlerts.length > 0 ? (
                  filteredAlerts.map((alt) => (
                    <tr key={alt.id} className="hover:bg-sky-50/40 transition">
                      <td className="py-3.5 px-4 font-mono font-black text-slate-900">{alt.id}</td>
                      <td className="py-3.5 px-4 font-black text-amber-700">{alt.type}</td>
                      <td className="py-3.5 px-4 font-black text-slate-900">{alt.item}</td>
                      <td className="py-3.5 px-4 text-slate-600">{alt.details}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-block border font-black px-2.5 py-0.5 rounded-full text-[10px] ${getPriorityBadge(alt.priority)}`}>
                          {alt.priority}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-block border font-black px-2.5 py-0.5 rounded-full text-[10px] ${getStatusBadge(alt.status)}`}>
                          {alt.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">{alt.timestamp}</td>
                      <td className="py-3.5 px-4 text-center">
                        <button 
                          onClick={() => setActiveAlert(alt)}
                          className="inline-flex items-center space-x-1 bg-slate-100 hover:bg-sky-100 text-slate-800 hover:text-sky-800 font-extrabold px-3 py-1.5 rounded-xl border border-slate-200 transition text-[11px] cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="py-8 text-center text-xs font-bold text-slate-400">
                      All inventory levels are above safety thresholds! No active warnings.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      {/* VIEW / MANAGE MODAL */}
      {activeAlert && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-5 h-5 text-sky-600" />
                <h3 className="text-base font-black text-slate-900">Alert Details ({activeAlert.id})</h3>
              </div>
              <button onClick={() => setActiveAlert(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-bold text-slate-700">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <p className="text-[10px] uppercase font-black text-slate-400">Target Product</p>
                <p className="text-sm font-black text-slate-900">{activeAlert.item} ({activeAlert.sku})</p>
                <p className="text-slate-600 font-medium pt-1">{activeAlert.details}</p>
              </div>

              <div>
                <label className="block mb-1 uppercase text-[10px] font-black text-slate-500">Resolution Status</label>
                {isWarehouseStaff ? (
                  <div className="p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 flex items-center justify-between">
                    <span className="font-black text-slate-700">{activeAlert.status}</span>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md flex items-center space-x-1">
                      <Lock className="w-3 h-3 text-amber-700" />
                      <span>Read-Only for Warehouse Staff</span>
                    </span>
                  </div>
                ) : (
                  <select 
                    value={activeAlert.status}
                    onChange={(e) => handleUpdateStatus(activeAlert.id, e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                  >
                    <option value="Active">Active (Unresolved)</option>
                    <option value="Acknowledged">Acknowledged</option>
                    <option value="Resolved">Resolved (Clears from Active Feed)</option>
                  </select>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button 
                  type="button" 
                  onClick={() => setActiveAlert(null)} 
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-extrabold rounded-xl transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}