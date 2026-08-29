import React, { useState, useEffect } from 'react';
import Header from '../components/Header.jsx';
import Navbar from '../components/Navbar.jsx';
import { 
  ShoppingCart, AlertTriangle, CheckCircle2, 
  ShieldAlert, Printer, PackageCheck, Trash2, 
  ChevronLeft, ChevronRight 
} from 'lucide-react';

export default function ReorderPlanner() {
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

  // State synced directly with localStorage inventory_db
  const [inventoryList, setInventoryList] = useState([]);
  const [selectedSku, setSelectedSku] = useState('');

  // Purchase Order History Database in localStorage
  const [purchaseOrders, setPurchaseOrders] = useState(() => {
    const saved = localStorage.getItem('purchase_orders_db');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [
      { id: 'PO-2026-0098', item: 'Solar Charge Controller 60A', qty: 150, supplier: 'SolarTech Energy Supplies', status: 'Pending Approval', date: 'Aug 29, 2026' },
      { id: 'PO-2026-0032', item: 'Monocrystalline Solar Panel 450W', qty: 150, supplier: 'SolarTech Energy Supplies', status: 'Pending Approval', date: 'Aug 29, 2026' },
      { id: 'PO-2026-0058', item: 'Inverter Generator 3kVA (Silent Series)', qty: 148, supplier: 'PowerPro Heavy Industries Inc.', status: 'Pending Approval', date: 'Aug 29, 2026' },
      { id: 'PO-2026-0008', item: 'Solar Charge Controller 60A', qty: 60, supplier: 'Solaris Corp', status: 'Completed', date: 'Aug 15, 2026' },
      { id: 'PO-2026-0007', item: 'Monocrystalline Solar Panel 450W', qty: 50, supplier: 'EcoPower Inc.', status: 'Completed', date: 'Aug 02, 2026' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('purchase_orders_db', JSON.stringify(purchaseOrders));
  }, [purchaseOrders]);

  // Load Inventory Data
  useEffect(() => {
    const savedInv = localStorage.getItem('inventory_db');
    if (savedInv) {
      try {
        const parsed = JSON.parse(savedInv);
        const enhancedParsed = parsed.map(item => ({
          ...item,
          dailyUsage: item.dailyUsage || (item.sku === 'SKU-8821' ? 12 : item.sku === 'SKU-4102' ? 5 : 8),
          leadTime: item.leadTime || (item.sku === 'SKU-8821' ? 7 : item.sku === 'SKU-4102' ? 5 : 6),
          safetyStock: item.safetyStock || (item.sku === 'SKU-8821' ? 20 : item.sku === 'SKU-4102' ? 10 : 15),
          unitPrice: item.unitPrice || (item.sku === 'SKU-8821' ? 14500 : 8200),
          supplier: item.supplier || 'PowerTech Energy Solutions Corp.'
        }));
        setInventoryList(enhancedParsed);
        if (enhancedParsed.length > 0) setSelectedSku(enhancedParsed[0].sku);
      } catch (e) {
        console.error(e);
      }
    } else {
      const defaultInv = [
        { 
          sku: 'SKU-8821', 
          name: 'Inverter Generator 3kVA (Silent Series)', 
          category: 'Generators', 
          onHand: 42, 
          dailyUsage: 12, 
          leadTime: 7, 
          safetyStock: 20, 
          supplier: 'PowerTech Energy Solutions Corp.', 
          unitPrice: 14500
        },
        { 
          sku: 'SKU-4102', 
          name: 'Solar Charge Controller 60A', 
          category: 'Solar Systems', 
          onHand: 3, 
          dailyUsage: 5, 
          leadTime: 5, 
          safetyStock: 10, 
          supplier: 'Solaris Corp', 
          unitPrice: 8200
        },
        { 
          sku: 'SKU-3092', 
          name: 'Monocrystalline Solar Panel 450W', 
          category: 'Solar Systems', 
          onHand: 25, 
          dailyUsage: 8, 
          leadTime: 6, 
          safetyStock: 15, 
          supplier: 'EcoPower Inc.', 
          unitPrice: 12000
        }
      ];
      setInventoryList(defaultInv);
      setSelectedSku(defaultInv[0].sku);
      localStorage.setItem('inventory_db', JSON.stringify(defaultInv));
    }
  }, []);

  const currentItem = inventoryList.find(i => i.sku === selectedSku) || inventoryList[0] || {
    sku: 'SKU-8821',
    name: 'Inverter Generator 3kVA (Silent Series)',
    onHand: 42,
    dailyUsage: 12,
    leadTime: 7,
    safetyStock: 20,
    supplier: 'PowerTech Energy Solutions Corp.',
    unitPrice: 14500
  };

  // Real product-specific calculations
  const dailyUsage = Number(currentItem.dailyUsage) || 12;
  const leadTime = Number(currentItem.leadTime) || 7;
  const safetyStock = Number(currentItem.safetyStock) || 20;
  const computedROP = (dailyUsage * leadTime) + safetyStock; 
  const onHand = Number(currentItem.onHand) || 0;
  const isBelowROP = onHand <= computedROP;
  const suggestedOrderQty = Math.max(computedROP * 2 - onHand, 150);
  const unitPrice = Number(currentItem.unitPrice) || 14500;
  const totalEstimatedCost = suggestedOrderQty * unitPrice;

  // Pagination state (Showing 5 per page)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(purchaseOrders.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentTableData = purchaseOrders.slice(startIndex, startIndex + itemsPerPage);

  // Handlers for Trigger / Generate Purchase Orders
  const handleGeneratePurchaseOrder = () => {
    if (isWarehouseStaff) {
      alert('Access Denied: Warehouse Staff cannot generate or authorize purchase orders.');
      return;
    }

    const newPO = {
      id: `PO-2026-00${Math.floor(10 + Math.random() * 90)}`,
      item: currentItem.name,
      qty: suggestedOrderQty,
      supplier: currentItem.supplier || 'PowerTech Energy Solutions Corp.',
      status: 'Pending Approval',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    const updatedPOs = [newPO, ...purchaseOrders];
    setPurchaseOrders(updatedPOs);
    setCurrentPage(1); // Jump to first page to see newest order
    alert(`Purchase Order ${newPO.id} successfully generated for ${suggestedOrderQty} units of ${currentItem.name}!`);
  };

  const handleDeleteSinglePo = (id) => {
    if (isWarehouseStaff) {
      alert('Access Denied: Warehouse Staff cannot delete purchase order records.');
      return;
    }
    if (confirm(`Are you sure you want to delete purchase order ${id}?`)) {
      const filtered = purchaseOrders.filter(po => po.id !== id);
      setPurchaseOrders(filtered);
      if ((currentPage - 1) * itemsPerPage >= filtered.length && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    }
  };

  const handleDeleteAllPo = () => {
    if (isWarehouseStaff) {
      alert('Access Denied: Warehouse Staff cannot clear purchase order logs.');
      return;
    }
    if (confirm('Are you sure you want to clear all purchase order history?')) {
      setPurchaseOrders([]);
      setCurrentPage(1);
      localStorage.removeItem('purchase_orders_db');
    }
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="bg-slate-100 text-slate-900 font-sans antialiased min-h-screen flex flex-col overflow-x-hidden w-full">
      <Navbar isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />
      <Header title="Inventory Planning & Automation" onMenuOpen={() => setIsNavOpen(true)} />

      <main className="w-full max-w-full px-4 sm:px-6 lg:px-10 py-6 space-y-6 flex-1">
        
        {isWarehouseStaff && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center space-x-2 text-xs font-bold text-amber-900 shadow-xs">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
            <span>Warehouse Staff Account ({currentUser.name}): View-Only mode enabled. Purchase order creation is restricted to Managers and Administrators.</span>
          </div>
        )}

        {/* Top Header Selector & Action Buttons */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 space-y-1">
            <label className="block text-[10px] font-black uppercase text-slate-400">SELECT TARGET SKU FOR ROP & DEMAND PLANNING</label>
            <select
              value={selectedSku}
              onChange={(e) => setSelectedSku(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer text-xs"
            >
              {inventoryList.map((item) => (
                <option key={item.sku} value={item.sku}>
                  {item.sku} - {item.name} (On Hand: {item.onHand})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2.5 shrink-0 pt-2 md:pt-5">
            <button 
              onClick={handlePrintReport}
              className="bg-white hover:bg-slate-50 text-slate-700 font-extrabold text-xs py-2.5 px-4 rounded-xl border border-slate-200 shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Report</span>
            </button>

            {!isWarehouseStaff && (
              <button 
                onClick={handleGeneratePurchaseOrder}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-2.5 px-4 rounded-xl shadow-xs transition flex items-center space-x-1.5 cursor-pointer active:scale-95"
              >
                <PackageCheck className="w-4 h-4" />
                <span>Generate Purchase Order</span>
              </button>
            )}
          </div>
        </div>

        {/* Main 2-Column Grid Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: SALES TREND ANALYSIS */}
          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-3">
              SALES TREND ANALYSIS ({currentItem.sku})
            </h2>

            <div className="space-y-3">
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">30-DAY VELOCITY ANALYSIS</p>
                <p className="text-sm font-black text-slate-900 mt-1">Average Daily Consumption: <span className="text-emerald-700">{dailyUsage} Units / Day</span></p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">PEAK SALES DEMAND</p>
                  <p className="text-sm font-black text-slate-900 mt-1">{dailyUsage * 2 + 4} Units / Day</p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">SUPPLIER LEAD TIME</p>
                  <p className="text-sm font-black text-slate-900 mt-1">{leadTime} Business Days</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">HISTORICAL TREND PROJECTION</p>
                <p className="text-xs text-slate-700 font-medium leading-relaxed mt-1">
                  Demand projected to increase by <span className="font-bold text-slate-900">15%</span> due to seasonal outage spikes.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: REORDER RECOMMENDATION */}
          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-3">
              REORDER RECOMMENDATION
            </h2>

            <div className="space-y-3">
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">RECOMMENDED REPLENISHMENT ORDER</p>
                <p className="text-sm font-black text-slate-900 mt-1">Suggested Order Quantity: <span className="text-emerald-700">{suggestedOrderQty} Units</span> <span className="text-[11px] font-normal text-slate-500">(Max Stock Target)</span></p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">PRIMARY SUPPLIER DETAILS</p>
                <p className="text-sm font-black text-slate-900 mt-1">{currentItem.supplier || 'PowerTech Energy Solutions Corp.'}</p>
                <p className="text-xs font-bold text-slate-600 mt-0.5">
                  Unit Price: ₱{unitPrice.toLocaleString()}.00 | Total Estimated Cost: <span className="text-slate-900 font-mono">₱{totalEstimatedCost.toLocaleString()}.00</span>
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">ESTIMATED FULFILLMENT WINDOW</p>
                <p className="text-xs font-bold text-slate-800 mt-1">Order Date: Aug 22, 2026 — Estimated Delivery: Aug 29, 2026</p>
              </div>
            </div>
          </div>

        </div>

        {/* Lower Grid: Real ROP Calculation & Current Stock Status */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ROP Calculation Formula Card */}
          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-3">
              REORDER POINT (ROP) CALCULATION FOR {currentItem.sku}
            </h2>

            <div className="space-y-3 text-xs font-bold text-slate-700">
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase">ROP FORMULA: (DAILY USAGE × LEAD TIME) + SAFETY STOCK</p>
                <div className="flex items-center justify-between pt-1">
                  <span className="font-mono font-black text-slate-900">({dailyUsage} units/day × {leadTime} days) + {safetyStock} units Safety Stock</span>
                  <span className="font-mono font-black text-emerald-700 text-base">{computedROP} Units</span>
                </div>
              </div>
            </div>
          </div>

          {/* Current Stock Status Banner */}
          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-3">
              CURRENT STOCK STATUS
            </h2>

            {isBelowROP ? (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between shadow-2xs">
                <div>
                  <p className="text-[10px] font-black text-rose-600 uppercase">ON-HAND STOCK VS ROP THRESHOLD</p>
                  <p className="text-xs font-black text-rose-900 mt-0.5">Action Required: Current Stock ({onHand}) is BELOW ROP ({computedROP})</p>
                </div>
                {!isWarehouseStaff && (
                  <button
                    onClick={handleGeneratePurchaseOrder}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition cursor-pointer shrink-0 active:scale-95"
                  >
                    Trigger Reorder
                  </button>
                )}
              </div>
            ) : (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between shadow-2xs">
                <div>
                  <p className="text-[10px] font-black text-emerald-600 uppercase">ON-HAND STOCK VS ROP THRESHOLD</p>
                  <p className="text-xs font-black text-emerald-900 mt-0.5">Stock Optimal: Current Stock ({onHand}) is above ROP ({computedROP})</p>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Purchase Order History Table (Limited to 5 per page) */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden space-y-4">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">PURCHASE ORDER HISTORY (SHOWING 5 PER PAGE)</h2>
              <p className="text-[11px] font-semibold text-slate-500 mt-0.5">Synced in LocalStorage</p>
            </div>

            {purchaseOrders.length > 0 && !isWarehouseStaff && (
              <button
                onClick={handleDeleteAllPo}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-extrabold transition flex items-center space-x-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete All History</span>
              </button>
            )}
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[750px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase text-[10px] font-black tracking-wider">
                  <th className="py-3.5 px-4">PO Reference</th>
                  <th className="py-3.5 px-4">Item Description</th>
                  <th className="py-3.5 px-4 text-center">Order Qty</th>
                  <th className="py-3.5 px-4">Supplier</th>
                  <th className="py-3.5 px-4">Date Triggered</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  {!isWarehouseStaff && <th className="py-3.5 px-4 text-center">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold">
                {currentTableData.length > 0 ? (
                  currentTableData.map((po) => (
                    <tr key={po.id} className="hover:bg-sky-50/40 transition">
                      <td className="py-3.5 px-4 font-mono font-black text-slate-900">{po.id}</td>
                      <td className="py-3.5 px-4 font-black text-slate-900">{po.item}</td>
                      <td className="py-3.5 px-4 text-center font-mono font-black">{po.qty} Units</td>
                      <td className="py-3.5 px-4 text-slate-600">{po.supplier}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">{po.date}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                          po.status === 'Completed' 
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                            : 'bg-amber-50 text-amber-800 border-amber-300'
                        }`}>
                          {po.status}
                        </span>
                      </td>
                      {!isWarehouseStaff && (
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => handleDeleteSinglePo(po.id)}
                            className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-300 transition cursor-pointer"
                            title="Delete Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={isWarehouseStaff ? "6" : "7"} className="py-8 text-center text-xs font-bold text-slate-400">
                      No purchase orders recorded in history.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <p className="text-xs text-slate-600 font-bold">
              Showing <span className="text-slate-900">{purchaseOrders.length > 0 ? startIndex + 1 : 0}–{Math.min(startIndex + itemsPerPage, purchaseOrders.length)}</span> of <span className="text-slate-900">{purchaseOrders.length}</span> order records
            </p>
            <div className="flex items-center space-x-1">
              <button 
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-700 bg-white disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="px-3 py-1 text-xs font-black rounded-lg bg-sky-600 text-white">{currentPage}</button>
              <button 
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-700 bg-white disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}